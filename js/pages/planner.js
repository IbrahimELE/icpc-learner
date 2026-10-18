/* Study planner: turns the roadmap into a week-by-week schedule ending on contest day. */
const Planner = (() => {
  const generate = ({ contestDate, hoursPerWeek, level, includeTier3 }) => {
    const today = U.todayKey();
    const days = U.daysBetween(today, contestDate);
    const weeks = Math.max(1, Math.ceil(days / 7));
    // candidate topics
    let cands = TOPICS.filter((t) => !Topics.learned(t.id));
    const review = new Set();
    if (level === 'some') cands = cands.filter((t) => t.tier !== 0 || ['problem-solving', 'implementation'].includes(t.id));
    if (level === 'experienced') cands = cands.filter((t) => t.tier >= 2 || ['problem-solving', 'implementation', 'contest-strategy', 'dp-1', 'shortest-paths'].includes(t.id));
    if (level !== 'beginner') cands.forEach((t) => { if (t.tier <= 1) review.add(t.id); });
    if (!includeTier3) cands = cands.filter((t) => t.tier !== 3);
    const strategy = cands.find((t) => t.id === 'contest-strategy');
    cands = cands.filter((t) => t.id !== 'contest-strategy');
    const hoursOf = (t) => (review.has(t.id) ? Math.max(1, Math.round(t.hours / 3)) : t.hours);

    // weekly reservations
    const finalWeeks = weeks >= 6 ? 1 : 0;              // last week = review only
    const studyWeeks = weeks - finalWeeks;
    const contestFrom = weeks >= 8 ? Math.ceil(studyWeeks * 0.4) : weeks >= 4 ? 2 : Math.max(1, studyWeeks); // first week with a mock contest
    // mock contests every other week once they start, weekly in the last three study weeks
    const contestWeek = (w) => w >= contestFrom && w <= studyWeeks && (w % 2 === 0 || w >= studyWeeks - 2);
    const reserved = (w) => (w > studyWeeks ? hoursPerWeek : (contestWeek(w) ? 5 : 0) + Math.min(2, Math.max(1, Math.round(hoursPerWeek * 0.2))));
    let capacity = 0;
    for (let w = 1; w <= studyWeeks; w++) capacity += Math.max(0, hoursPerWeek - reserved(w));
    if (strategy) capacity -= strategy.hours;

    // trim lowest-priority topics until they fit
    const stretch = [];
    let total = cands.reduce((s, t) => s + hoursOf(t), 0);
    const prio = (t) => t.stars * 10 - t.tier * 3; // higher = keep
    while (total > capacity && cands.length) {
      let worst = null;
      cands.forEach((t) => { if (t.tier >= 2 && (!worst || prio(t) < prio(worst))) worst = t; });
      if (!worst) break;
      cands = cands.filter((t) => t !== worst);
      stretch.push(worst);
      total -= hoursOf(worst);
    }
    stretch.sort((a, b) => b.stars - a.stars || a.tier - b.tier);

    // fill weeks
    const plan = [];
    let qi = 0;
    for (let w = 1; w <= weeks; w++) {
      const start = U.addDays(today, (w - 1) * 7);
      const items = [];
      if (w > studyWeeks) {
        items.push({ type: 'review', id: `rev-${w}`, title: 'Final review: flashcards daily, re-read your notes, re-solve 5 old problems from memory', hours: Math.round(hoursPerWeek * 0.5), done: false });
        items.push({ type: 'contest', id: `mini-${w}`, title: 'One short mini-mock (2h, 3 easy problems) early in the week — then rest', hours: 2, done: false });
        items.push({ type: 'note', id: `rest-${w}`, title: 'No new topics. Sleep, print the Team Reference Document, pack your things.', hours: 0, done: false });
        plan.push({ start, items });
        continue;
      }
      let cap = Math.max(0, hoursPerWeek - reserved(w));
      if (strategy && w === Math.max(1, studyWeeks - 2)) { items.push({ type: 'topic', id: strategy.id, title: strategy.title, hours: strategy.hours, done: false }); }
      while (qi < cands.length) {
        const t = cands[qi];
        const h = hoursOf(t);
        if (h <= cap || (items.filter((i) => i.type === 'topic').length === 0 && cap >= Math.ceil(h * 0.6))) {
          items.push({ type: 'topic', id: t.id, title: t.title + (review.has(t.id) ? ' (quick review)' : ''), hours: h, done: false });
          cap -= h; qi++;
        } else break;
      }
      const wkTopics = items.filter((i) => i.type === 'topic').map((i) => i.id);
      if (wkTopics.length) items.push({ type: 'problems', id: `pr-${w}`, title: `Solve at least ${Math.max(3, Math.round(hoursPerWeek / 3))} problems from this week's topics`, hours: Math.min(2, Math.max(1, Math.round(hoursPerWeek * 0.2))), done: false, topics: wkTopics });
      if (contestWeek(w)) items.push({ type: 'contest', id: `mock-${w}`, title: w >= studyWeeks - 2 ? 'Mock contest: past SEERC replay (5h) + upsolve debrief' : 'Mock contest: 6-problem mashup or SEERC replay (5h) + upsolve', hours: 5, done: false });
      plan.push({ start, items });
    }
    // leftover candidates (if weeks ran out)
    while (qi < cands.length) stretch.push(cands[qi++]);

    return { generatedAt: Date.now(), settings: { contestDate, hoursPerWeek, level, includeTier3 }, weeks: plan, stretch: stretch.map((t) => t.id), coverage: coverage(plan) };
  };

  const coverage = (plan) => {
    const ids = new Set();
    plan.forEach((w) => w.items.forEach((i) => { if (i.type === 'topic') ids.add(i.id); }));
    const important = TOPICS.filter((t) => t.stars >= 4);
    const covered = important.filter((t) => ids.has(t.id) || Topics.learned(t.id)).length;
    return { planned: ids.size, important: important.length, importantCovered: covered };
  };

  return { generate };
})();

Pages.planner = (root) => {
  const esc = U.esc;
  const st = Store.state.settings;
  const plan = Store.state.planner;
  const today = U.todayKey();

  const form = `<div class="card mb">
      <div class="row between">
        <div><h1 style="margin-bottom:2px">Study plan</h1><div class="muted small">Tell the planner your time budget; it schedules the roadmap week by week so the important topics land before contest day, with mock contests built in.</div></div>
      </div>
      <div class="inline-fields mt">
        <label class="field"><span>Contest date</span><input class="input" type="date" id="pl-date" value="${esc(st.contestDate || '2026-12-13')}"></label>
        <label class="field"><span>Hours per week</span><input class="input" type="number" id="pl-hours" value="${st.hoursPerWeek || 10}" min="2" max="60" style="width:100px"></label>
        <label class="field"><span>Where you start</span><select class="input" id="pl-level"><option value="beginner" ${st.level === 'beginner' ? 'selected' : ''}>Beginner (new to CP)</option><option value="some" ${st.level === 'some' ? 'selected' : ''}>Some experience (know C++ & basics)</option><option value="experienced" ${st.level === 'experienced' ? 'selected' : ''}>Experienced (solved 200+ problems)</option></select></label>
        <label class="checkbox small"><input type="checkbox" id="pl-t3" ${plan && plan.settings.includeTier3 ? 'checked' : ''}> Include Tier 3 (advanced)</label>
        <button class="btn primary" id="pl-gen">${plan ? 'Regenerate plan' : 'Generate plan'}</button>
      </div>
      ${plan ? '<div class="muted tiny mt">Regenerating keeps learned topics out of the plan and re-plans from today. Checked-off items on non-topic tasks are reset.</div>' : ''}
    </div>`;

  let body = '';
  if (plan) {
    const weekIdx = plan.weeks.findIndex((w, i) => { const end = U.addDays(w.start, 6); return today >= w.start && today <= end; });
    const totalH = plan.weeks.reduce((s, w) => s + w.items.reduce((x, i) => x + (i.hours || 0), 0), 0);
    const cov = plan.coverage || { planned: 0, important: 0, importantCovered: 0 };
    const stretch = (plan.stretch || []).map((id) => Topics.get(id)).filter(Boolean);
    body = `<div class="grid c4 mb">
        <div class="card stat"><div class="num">${plan.weeks.length}</div><div class="lbl">weeks planned</div></div>
        <div class="card stat"><div class="num">${totalH}h</div><div class="lbl">total effort</div></div>
        <div class="card stat"><div class="num">${cov.importantCovered}<span class="muted" style="font-size:1rem">/${cov.important}</span></div><div class="lbl">★★★★+ topics covered</div></div>
        <div class="card stat"><div class="num">${stretch.length}</div><div class="lbl">stretch topics</div></div>
      </div>
      ${cov.importantCovered < cov.important ? `<div class="callout warn mb"><div class="callout-title">⚠️ Not everything important fits</div><p>${cov.important - cov.importantCovered} high-priority topic(s) ended up in the stretch list. Options: more hours per week, skipping Tier 3, or accepting the gap and focusing on solving well what you do know — a first-time team gains more from mastering Tier 1 than from a shallow tour of everything.</p></div>` : ''}
      <div class="col">${plan.weeks.map((w, i) => {
        const end = U.addDays(w.start, 6);
        const cls = i === weekIdx ? 'current' : end < today ? 'past' : '';
        return `<div class="week ${cls}">
          <div class="week-head"><h3>Week ${i + 1}</h3><span class="muted small">${U.fmtDate(w.start)} – ${U.fmtDate(end)}</span>${i === weekIdx ? '<span class="badge accent">this week</span>' : ''}<span class="spacer"></span><span class="muted small">${w.items.reduce((s, x) => s + (x.hours || 0), 0)}h</span></div>
          <div class="week-items">${w.items.map((it, j) => {
            const t = it.type === 'topic' ? Topics.get(it.id) : null;
            const done = t ? Topics.learned(t.id) : !!it.done;
            const icon = { topic: 'book', problems: 'list', contest: 'timer', review: 'brain', note: 'info' }[it.type] || 'info';
            const href = t ? `#/topic/${t.id}` : it.type === 'contest' ? '#/contest' : it.type === 'problems' ? `#/problems?topic=${(it.topics || [])[0] || ''}` : it.type === 'review' ? '#/practice' : '';
            return `<label class="week-item ${done ? 'done' : ''}"><input type="checkbox" data-w="${i}" data-j="${j}" ${done ? 'checked' : ''} ${t ? 'disabled title="Completes when you mark the topic as learned"' : ''}>${UI.icon(icon, 15)}<span>${href ? `<a href="${href}">${esc(it.title)}</a>` : esc(it.title)}</span>${t ? UI.stars(t.stars) : ''}<span class="muted tiny">${it.hours ? it.hours + 'h' : ''}</span></label>`;
          }).join('')}</div>
        </div>`;
      }).join('')}</div>
      ${stretch.length ? `<div class="card mt"><div class="card-title">${UI.icon('flag')} Stretch topics (if time allows)</div><div class="row">${stretch.map((t) => `<a class="btn small" href="#/topic/${t.id}">${esc(t.title)} ${UI.stars(t.stars)}</a>`).join('')}</div></div>` : ''}`;
  } else {
    body = `<div class="card md"><h3>How the plan is built</h3><ul>
      <li>Topics are scheduled in roadmap order, skipping ones you already marked as learned.</li>
      <li>About 20% of each week is reserved for solving problems; from roughly 40% of the way in, 5 hours per week go to a mock contest.</li>
      <li>The last week before the contest has no new material — only review and rest.</li>
      <li>If your hours cannot cover everything, the lowest-priority topics (few stars, high tier) move to a stretch list so that the ★★★★★ topics always fit.</li></ul>
      <p class="muted small">SEERC 2026 is scheduled for December 11–13 in Thessaloniki and Kyiv. The default contest date is the last day.</p></div>`;
  }
  root.innerHTML = form + body;

  root.querySelector('#pl-gen').addEventListener('click', () => {
    const contestDate = root.querySelector('#pl-date').value || '2026-12-13';
    const hoursPerWeek = U.clamp(+root.querySelector('#pl-hours').value || 10, 2, 60);
    const level = root.querySelector('#pl-level').value;
    const includeTier3 = root.querySelector('#pl-t3').checked;
    if (U.daysBetween(today, contestDate) < 1) { UI.toast('Contest date must be in the future', 'error'); return; }
    Store.setSetting('contestDate', contestDate); Store.setSetting('hoursPerWeek', hoursPerWeek); Store.setSetting('level', level);
    Store.setPlanner(Planner.generate({ contestDate, hoursPerWeek, level, includeTier3 }));
    UI.toast('Plan generated', 'success');
    Pages.planner(root);
  });
  U.on(root, 'change', 'input[data-w]', (e, cb) => {
    const it = Store.state.planner.weeks[+cb.dataset.w].items[+cb.dataset.j];
    it.done = cb.checked;
    if (cb.checked) Store.addXP(it.type === 'contest' ? 20 : 10, 'plan item done'); else Store.save();
    cb.closest('.week-item').classList.toggle('done', cb.checked);
  });
};
