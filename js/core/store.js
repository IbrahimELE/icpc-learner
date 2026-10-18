/* Persistent app state (localStorage) + XP, streaks, spaced repetition, activity log. */
const Store = (() => {
  const KEY = 'seerc-trainer-v1';
  const listeners = new Set();

  const defaults = () => ({
    v: 1,
    createdAt: Date.now(),
    xp: 0,
    topics: {},        // id -> { status: 'in-progress'|'learned', learnedAt, notes }
    problems: {},      // id -> { status: 'attempted'|'solved'|'skipped', at, attempts }
    srs: {},           // cardId -> { due, ivl, ease, reps, lapses }
    quiz: {},          // topicId -> { asked, correct }
    drills: { asked: 0, correct: 0 },
    activity: {},      // dateKey -> { xp, events }
    contests: [],
    activeContest: null,
    upsolve: [],
    planner: null,
    playground: { code: '', stdin: '', expected: '' },
    settings: { theme: 'dark', opsPerSec: 1e8, name: '', contestDate: '2026-12-13', hoursPerWeek: 10, level: 'beginner', compiler: 'auto' },
  });

  let state = defaults();

  const load = () => {
    if (!U.storageOK) return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(defaults(), parsed);
        state.settings = Object.assign(defaults().settings, parsed.settings || {});
        state.playground = Object.assign(defaults().playground, parsed.playground || {});
      }
    } catch (e) {
      console.warn('Could not load saved state', e);
    }
  };

  let saveTimer = null;
  const saveNow = () => {
    if (!U.storageOK) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('save failed', e); }
  };
  const save = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 150);
  };
  const emit = (what) => { save(); listeners.forEach((fn) => { try { fn(what); } catch (e) { console.error(e); } }); };
  const on = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

  /* ---------- activity / streak ---------- */
  const logActivity = (xp = 0) => {
    const k = U.todayKey();
    const a = state.activity[k] || (state.activity[k] = { xp: 0, events: 0 });
    a.xp += xp;
    a.events += 1;
  };
  const streak = () => {
    const keys = Object.keys(state.activity).filter((k) => state.activity[k].events > 0).sort();
    if (!keys.length) return { current: 0, best: 0, activeToday: false };
    const set = new Set(keys);
    const today = U.todayKey();
    const activeToday = set.has(today);
    let current = 0;
    let cur = activeToday ? today : U.addDays(today, -1);
    while (set.has(cur)) { current++; cur = U.addDays(cur, -1); }
    let best = 0, run = 0, prev = null;
    for (const k of keys) {
      run = prev && U.daysBetween(prev, k) === 1 ? run + 1 : 1;
      best = Math.max(best, run);
      prev = k;
    }
    return { current, best, activeToday };
  };

  /* ---------- XP & levels ---------- */
  const LEVELS = [
    { name: 'Newbie', xp: 0, color: '#9aa3b2' },
    { name: 'Pupil', xp: 300, color: '#3fb950' },
    { name: 'Specialist', xp: 800, color: '#39c5bb' },
    { name: 'Expert', xp: 1600, color: '#6ea8fe' },
    { name: 'Candidate Master', xp: 2800, color: '#bc8cff' },
    { name: 'Master', xp: 4500, color: '#f0883e' },
    { name: 'International Master', xp: 7000, color: '#f0883e' },
    { name: 'Grandmaster', xp: 10000, color: '#f85149' },
    { name: 'International Grandmaster', xp: 14000, color: '#f85149' },
    { name: 'Legendary Grandmaster', xp: 20000, color: '#ff4d4d' },
  ];
  const level = () => {
    let i = 0;
    while (i + 1 < LEVELS.length && state.xp >= LEVELS[i + 1].xp) i++;
    const cur = LEVELS[i], next = LEVELS[i + 1] || null;
    const progress = next ? (state.xp - cur.xp) / (next.xp - cur.xp) : 1;
    return { index: i, name: cur.name, color: cur.color, next, progress, xp: state.xp };
  };
  const addXP = (n, reason) => {
    if (!n) return;
    const before = level().index;
    state.xp = Math.max(0, state.xp + n);
    logActivity(Math.max(0, n));
    const after = level().index;
    emit({ type: 'xp', n, reason });
    if (n > 0 && typeof UI !== 'undefined') {
      UI.toast(`+${n} XP${reason ? ' · ' + reason : ''}`, 'xp');
      if (after > before) setTimeout(() => UI.toast(`Level up! You are now ${LEVELS[after].name}`, 'success', 4000), 400);
    }
  };

  /* ---------- topics ---------- */
  const topic = (id) => state.topics[id] || { status: null, notes: '' };
  const setTopicStatus = (id, status) => {
    const t = state.topics[id] || (state.topics[id] = { status: null, notes: '' });
    const was = t.status;
    t.status = status;
    if (status === 'learned' && was !== 'learned') { t.learnedAt = Date.now(); addXP(25, 'lesson completed'); }
    else if (status !== 'learned' && was === 'learned') { state.xp = Math.max(0, state.xp - 25); }
    emit({ type: 'topic', id });
  };
  const setTopicNotes = (id, notes) => {
    const t = state.topics[id] || (state.topics[id] = { status: null, notes: '' });
    t.notes = notes;
    save();
  };

  /* ---------- problems ---------- */
  const PROBLEM_XP = { 1: 15, 2: 30, 3: 50, 4: 80, 5: 120 };
  const problem = (id) => state.problems[id] || { status: null, attempts: 0 };
  const setProblemStatus = (id, status, diff = 2) => {
    const p = state.problems[id] || (state.problems[id] = { status: null, attempts: 0 });
    const was = p.status;
    p.status = status;
    p.at = Date.now();
    if (status === 'solved' && was !== 'solved') addXP(PROBLEM_XP[diff] || 30, 'problem solved');
    else if (was === 'solved' && status !== 'solved') { state.xp = Math.max(0, state.xp - (PROBLEM_XP[diff] || 30)); }
    else if (status === 'attempted' && !was) addXP(5, 'attempt logged');
    else logActivity(0);
    emit({ type: 'problem', id });
  };
  const solvedCount = () => Object.values(state.problems).filter((p) => p.status === 'solved').length;

  /* ---------- spaced repetition (SM-2 flavoured) ---------- */
  const card = (id) => state.srs[id] || null;
  const dueCards = (allIds) => {
    const today = U.todayKey();
    return allIds.filter((id) => { const c = state.srs[id]; return !c || c.due <= today; });
  };
  // rating: 0 again, 1 hard, 2 good, 3 easy
  const rateCard = (id, rating) => {
    const c = state.srs[id] || (state.srs[id] = { due: U.todayKey(), ivl: 0, ease: 2.5, reps: 0, lapses: 0 });
    c.reps += 1;
    if (rating === 0) { c.lapses += 1; c.ivl = 0; c.ease = Math.max(1.3, c.ease - 0.2); }
    else if (rating === 1) { c.ivl = Math.max(1, Math.round(c.ivl * 1.2)) || 1; c.ease = Math.max(1.3, c.ease - 0.15); }
    else if (rating === 2) { c.ivl = c.ivl === 0 ? 1 : c.ivl === 1 ? 3 : Math.round(c.ivl * c.ease); }
    else { c.ivl = c.ivl === 0 ? 3 : Math.round(c.ivl * c.ease * 1.3); c.ease += 0.15; }
    c.due = U.addDays(U.todayKey(), c.ivl);
    state.xp += rating === 0 ? 1 : 3;
    logActivity(rating === 0 ? 1 : 3);
    emit({ type: 'srs', id });
  };

  /* ---------- quizzes / drills ---------- */
  const recordQuiz = (topicId, correct) => {
    const q = state.quiz[topicId] || (state.quiz[topicId] = { asked: 0, correct: 0 });
    q.asked += 1;
    if (correct) q.correct += 1;
    state.xp += correct ? 5 : 1;
    logActivity(correct ? 5 : 1);
    emit({ type: 'quiz', topicId });
  };
  const recordDrill = (correct) => {
    state.drills.asked += 1;
    if (correct) state.drills.correct += 1;
    state.xp += correct ? 6 : 1;
    logActivity(correct ? 6 : 1);
    emit({ type: 'drill' });
  };
  const quizAccuracy = (topicId) => {
    const q = state.quiz[topicId];
    return q && q.asked ? q.correct / q.asked : null;
  };

  /* ---------- contests ---------- */
  const startContest = (c) => { state.activeContest = c; emit({ type: 'contest' }); };
  const updateContest = (c) => { state.activeContest = c; save(); };
  const abortContest = () => { state.activeContest = null; emit({ type: 'contest' }); };
  const finishContest = (c) => {
    state.activeContest = null;
    state.contests.unshift(c);
    c.problems.filter((p) => p.status !== 'solved' && p.url).forEach((p) => {
      if (!state.upsolve.some((u) => u.url === p.url)) state.upsolve.push({ title: `${p.letter}. ${p.title}`, url: p.url, from: c.name, at: Date.now() });
    });
    addXP(60 + 40 * c.problems.filter((p) => p.status === 'solved').length, 'contest finished');
    emit({ type: 'contest' });
  };
  const removeUpsolve = (url) => { state.upsolve = state.upsolve.filter((u) => u.url !== url); emit({ type: 'upsolve' }); };

  /* ---------- settings / misc ---------- */
  const setSetting = (k, v) => { state.settings[k] = v; emit({ type: 'settings', k }); };
  const setPlanner = (p) => { state.planner = p; emit({ type: 'planner' }); };
  const setPlayground = (patch) => { Object.assign(state.playground, patch); save(); };

  const exportJSON = () => JSON.stringify(state, null, 2);
  const importJSON = (text) => {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || parsed.v !== 1) throw new Error('Not a SEERC Trainer backup file');
    state = Object.assign(defaults(), parsed);
    saveNow();
    emit({ type: 'import' });
  };
  const reset = () => { state = defaults(); saveNow(); emit({ type: 'reset' }); };

  return {
    get state() { return state; },
    load, save, saveNow, on, emit,
    LEVELS, level, addXP, streak, logActivity,
    topic, setTopicStatus, setTopicNotes,
    problem, setProblemStatus, solvedCount, PROBLEM_XP,
    card, dueCards, rateCard,
    recordQuiz, recordDrill, quizAccuracy,
    startContest, updateContest, abortContest, finishContest, removeUpsolve,
    setSetting, setPlanner, setPlayground,
    exportJSON, importJSON, reset,
  };
})();
