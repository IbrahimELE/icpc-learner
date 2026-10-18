/* Practice: multiple-choice quizzes, spaced-repetition flashcards, technique drills, complexity drills. */
const Practice = (() => {
  const esc = U.esc;
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  /* ---------------- quizzes ---------------- */
  const pickQuestions = ({ topic, count = 10, weak = false }) => {
    let qs = [];
    if (topic) qs = (QUIZ[topic] || []).map((q) => ({ ...q, topic }));
    else {
      const opened = TOPICS.filter((t) => Store.topic(t.id).status).map((t) => t.id);
      let pool = opened.length ? opened : TOPICS.filter((t) => t.tier <= 1).map((t) => t.id);
      if (weak) {
        const w = TOPICS.filter((t) => { const q = Store.state.quiz[t.id]; return q && q.asked >= 2 && q.correct / q.asked < 0.75; }).map((t) => t.id);
        if (w.length) pool = w;
      }
      pool.forEach((id) => (QUIZ[id] || []).forEach((q) => qs.push({ ...q, topic: id })));
      qs = U.shuffle(qs).slice(0, count);
    }
    return qs;
  };

  const mountQuiz = (el, { topic, count = 10, weak = false, title } = {}) => {
    const qs = pickQuestions({ topic, count, weak });
    if (!qs.length) { el.innerHTML = `<div class="card">${UI.empty('No quiz questions available yet', topic ? 'This topic has no quiz.' : 'Open a few topics first — quizzes unlock per topic.')}</div>`; return; }
    let i = 0, correct = 0;
    const results = [];
    const render = () => {
      if (i >= qs.length) return finish();
      const q = qs[i];
      const order = U.shuffle(q.opts.map((_, k) => k));
      el.innerHTML = `<div class="card quiz-card">
        <div class="score-line"><span>Question <b>${i + 1}</b> / ${qs.length}</span><span>Correct: <b>${correct}</b></span>${!topic ? `<span class="badge">${esc(Topics.get(q.topic) ? Topics.get(q.topic).title : q.topic)}</span>` : ''}<span class="spacer"></span>${UI.progress(i / qs.length)}</div>
        <div class="quiz-q">${MD.inline(q.q)}</div>
        <div class="opts">${order.map((k, idx) => `<button class="opt" data-k="${k}"><span class="letter">${LETTERS[idx]}</span><span>${MD.inline(q.opts[k])}</span></button>`).join('')}</div>
        <div id="explain"></div>
      </div>`;
      el.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => {
        const k = +b.dataset.k;
        const ok = k === q.ans;
        el.querySelectorAll('.opt').forEach((x) => { x.disabled = true; if (+x.dataset.k === q.ans) x.classList.add('correct'); });
        if (!ok) b.classList.add('wrong');
        if (ok) correct++;
        results.push({ q, ok });
        Store.recordQuiz(q.topic, ok);
        el.querySelector('#explain').innerHTML = `<div class="explain"><b>${ok ? '✓ Correct.' : '✗ Not quite.'}</b> ${MD.inline(q.why || '')}<div class="mt"><button class="btn primary" id="next-q">${i + 1 < qs.length ? 'Next question →' : 'See results'}</button></div></div>`;
        el.querySelector('#next-q').addEventListener('click', () => { i++; render(); });
        el.querySelector('#next-q').focus();
      }));
    };
    const finish = () => {
      const pct = Math.round((100 * correct) / qs.length);
      el.innerHTML = `<div class="card quiz-card result-box">
        <div class="big-num" style="color:${pct >= 80 ? 'var(--ok)' : pct >= 50 ? 'var(--warn)' : 'var(--danger)'}">${pct}%</div>
        <div>${correct} of ${qs.length} correct</div>
        <p class="muted small mt">${pct >= 80 ? 'Solid. Move on and come back in a week via flashcards.' : pct >= 50 ? 'Decent, but re-read the parts you missed below.' : 'Re-read the lesson before trying again — the quiz is testing exactly what the lesson explains.'}</p>
        ${results.some((r) => !r.ok) ? `<div class="card flat" style="text-align:left"><b>Review the misses</b><ul>${results.filter((r) => !r.ok).map((r) => `<li>${MD.inline(r.q.q)}<br><span class="muted small">Answer: ${MD.inline(r.q.opts[r.q.ans])}</span></li>`).join('')}</ul></div>` : ''}
        <div class="row mt" style="justify-content:center"><button class="btn primary" id="again">Try again</button>${topic ? `<a class="btn" href="#/topic/${topic}">Back to lesson</a>` : '<a class="btn" href="#/practice">Practice menu</a>'}</div>
      </div>`;
      el.querySelector('#again').addEventListener('click', () => mountQuiz(el, { topic, count, weak, title }));
    };
    render();
  };

  /* ---------------- flashcards ---------------- */
  const mountFlashcards = (el, { topic, limit = 20 } = {}) => {
    let cards = topic ? FLASHCARDS.filter((c) => c.topic === topic) : Flashcards.unlocked();
    const dueIds = new Set(Store.dueCards(cards.map((c) => c.id)));
    // due first, then not-yet-due (only when reviewing a single topic)
    let queue = cards.filter((c) => dueIds.has(c.id));
    if (topic && !queue.length) queue = cards.slice();
    queue = U.shuffle(queue).slice(0, limit);
    if (!queue.length) {
      el.innerHTML = `<div class="card">${UI.empty(topic ? 'No flashcards for this topic' : 'Nothing due right now 🎉', topic ? '' : 'Cards unlock as you open topics. Come back tomorrow, or review a specific topic from its page.')}</div>`;
      return;
    }
    let idx = 0, flipped = false, again = 0, good = 0;
    const render = () => {
      if (idx >= queue.length) {
        el.innerHTML = `<div class="card quiz-card result-box"><div class="big-num">${queue.length}</div><div>cards reviewed · ${good} known · ${again} to repeat</div><p class="muted small mt">Cards you rated "Again" come back today or tomorrow; "Easy" pushes them weeks out.</p><div class="row mt" style="justify-content:center"><button class="btn primary" id="more">Review more</button><a class="btn" href="#/practice">Practice menu</a></div></div>`;
        el.querySelector('#more').addEventListener('click', () => mountFlashcards(el, { topic, limit }));
        return;
      }
      const c = queue[idx];
      const t = Topics.get(c.topic);
      el.innerHTML = `<div class="quiz-card">
        <div class="score-line"><span>Card <b>${idx + 1}</b> / ${queue.length}</span>${t ? `<a class="badge" href="#/topic/${t.id}">${esc(t.title)}</a>` : ''}<span class="spacer"></span>${UI.progress(idx / queue.length)}</div>
        <div class="card flash" id="flash">
          <div class="side">${flipped ? 'Answer' : 'Question — click to flip'}</div>
          <div class="content md">${MD.render(flipped ? c.back : c.front)}</div>
        </div>
        ${flipped ? `<div class="rate">
          <button class="btn danger" data-rate="0">Again<br><span class="tiny">forgot</span></button>
          <button class="btn warn" data-rate="1">Hard<br><span class="tiny">barely</span></button>
          <button class="btn ok" data-rate="2">Good<br><span class="tiny">knew it</span></button>
          <button class="btn primary" data-rate="3">Easy<br><span class="tiny">trivial</span></button>
        </div>` : '<div class="center muted small mt">Say the answer out loud before flipping. <span class="kbd">Space</span> flips, <span class="kbd">1</span>–<span class="kbd">4</span> rate.</div>'}
      </div>`;
      MD.activate(el);
      el.querySelector('#flash').addEventListener('click', () => { flipped = !flipped; render(); });
      el.querySelectorAll('[data-rate]').forEach((b) => b.addEventListener('click', () => rate(+b.dataset.rate)));
    };
    const rate = (r) => { const c = queue[idx]; Store.rateCard(c.id, r); if (r === 0) again++; else good++; idx++; flipped = false; render(); };
    const onKey = (e) => {
      if (!el.isConnected) { document.removeEventListener('keydown', onKey); return; }
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if (e.code === 'Space') { e.preventDefault(); flipped = !flipped; render(); }
      else if (flipped && ['1', '2', '3', '4'].includes(e.key)) rate(+e.key - 1);
    };
    document.addEventListener('keydown', onKey);
    render();
  };

  /* ---------------- technique drills ---------------- */
  const mountDrills = (el, { count = 8 } = {}) => {
    const qs = U.shuffle(DRILLS).slice(0, count);
    let i = 0, correct = 0;
    const render = () => {
      if (i >= qs.length) {
        const pct = Math.round((100 * correct) / qs.length);
        el.innerHTML = `<div class="card quiz-card result-box"><div class="big-num" style="color:${pct >= 75 ? 'var(--ok)' : 'var(--warn)'}">${pct}%</div><div>${correct} of ${qs.length} techniques identified</div><p class="muted small mt">In a real contest you get maybe 10 minutes per problem to decide the approach. This drill trains exactly that reflex.</p><div class="row mt" style="justify-content:center"><button class="btn primary" id="again">Another round</button><a class="btn" href="#/practice">Practice menu</a></div></div>`;
        el.querySelector('#again').addEventListener('click', () => mountDrills(el, { count }));
        return;
      }
      const q = qs[i];
      const order = U.shuffle(q.options.map((_, k) => k));
      el.innerHTML = `<div class="card quiz-card">
        <div class="score-line"><span>Statement <b>${i + 1}</b> / ${qs.length}</span><span>Correct: <b>${correct}</b></span><span class="spacer"></span>${UI.progress(i / qs.length)}</div>
        <div class="muted tiny" style="text-transform:uppercase;letter-spacing:.08em;font-weight:600">Which technique solves this?</div>
        <div class="quiz-q md">${MD.render(q.statement)}</div>
        <div class="opts">${order.map((k, idx) => `<button class="opt" data-k="${k}"><span class="letter">${LETTERS[idx]}</span><span>${esc(q.options[k])}</span></button>`).join('')}</div>
        <div id="explain"></div></div>`;
      el.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => {
        const k = +b.dataset.k, ok = k === q.ans;
        el.querySelectorAll('.opt').forEach((x) => { x.disabled = true; if (+x.dataset.k === q.ans) x.classList.add('correct'); });
        if (!ok) b.classList.add('wrong');
        if (ok) correct++;
        Store.recordDrill(ok);
        if (q.topic) Store.recordQuiz(q.topic, ok);
        el.querySelector('#explain').innerHTML = `<div class="explain"><b>${ok ? '✓ Yes.' : '✗ No.'}</b> ${MD.inline(q.why)}${q.topic && Topics.get(q.topic) ? ` <a href="#/topic/${q.topic}">Open ${esc(Topics.get(q.topic).title)} →</a>` : ''}<div class="mt"><button class="btn primary" id="next-q">${i + 1 < qs.length ? 'Next →' : 'Results'}</button></div></div>`;
        el.querySelector('#next-q').addEventListener('click', () => { i++; render(); });
      }));
    };
    render();
  };

  /* ---------------- complexity drills (procedural) ---------------- */
  const COMPLEXITIES = [
    { name: 'O(log n)', f: (n) => Math.log2(n) },
    { name: 'O(√n)', f: (n) => Math.sqrt(n) },
    { name: 'O(n)', f: (n) => n },
    { name: 'O(n log n)', f: (n) => n * Math.log2(n) },
    { name: 'O(n √n)', f: (n) => n * Math.sqrt(n) },
    { name: 'O(n²)', f: (n) => n * n },
    { name: 'O(n² log n)', f: (n) => n * n * Math.log2(n) },
    { name: 'O(n³)', f: (n) => n * n * n },
    { name: 'O(2ⁿ · n)', f: (n) => Math.pow(2, n) * n },
    { name: 'O(n!)', f: (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; } },
  ];
  const mountComplexityDrill = (el, { count = 8 } = {}) => {
    const NS = [10, 12, 15, 18, 20, 100, 200, 500, 1000, 2000, 5000, 10000, 100000, 200000, 500000, 1000000, 10000000, 1000000000, 1e12, 1e18];
    const TLS = [1, 1, 1, 2, 2, 3];
    let i = 0, correct = 0;
    const budgetPerSec = Store.state.settings.opsPerSec || 1e8;
    const render = () => {
      if (i >= count) {
        el.innerHTML = `<div class="card quiz-card result-box"><div class="big-num">${Math.round((100 * correct) / count)}%</div><div>${correct} of ${count}</div><p class="muted small mt">Rule of thumb used: about ${U.fmtNum(budgetPerSec)} simple operations per second (change it in Settings). Real constants vary 10× either way, so treat the boundary cases as "risky".</p><div class="row mt" style="justify-content:center"><button class="btn primary" id="again">Again</button><a class="btn" href="#/tools">Open complexity calculator</a></div></div>`;
        el.querySelector('#again').addEventListener('click', () => mountComplexityDrill(el, { count }));
        return;
      }
      const n = U.pick(NS), tl = U.pick(TLS);
      const budget = budgetPerSec * tl;
      const fits = COMPLEXITIES.map((c) => ({ ...c, ops: c.f(n) })).filter((c) => isFinite(c.ops));
      let best = -1;
      fits.forEach((c, k) => { if (c.ops <= budget) best = k; });
      if (best < 0) { render(); return; }
      const opts = new Set([best]);
      if (best + 1 < fits.length) opts.add(best + 1);
      if (best - 1 >= 0) opts.add(best - 1);
      if (best - 2 >= 0) opts.add(best - 2); else if (best + 2 < fits.length) opts.add(best + 2);
      const order = U.shuffle(Array.from(opts));
      el.innerHTML = `<div class="card quiz-card">
        <div class="score-line"><span>Question <b>${i + 1}</b> / ${count}</span><span>Correct: <b>${correct}</b></span><span class="spacer"></span>${UI.progress(i / count)}</div>
        <div class="quiz-q">Constraints: <code>n ≤ ${n.toLocaleString('en-US')}</code>, time limit <code>${tl} s</code>. What is the <em>slowest</em> complexity that still comfortably fits?</div>
        <div class="opts">${order.map((k, idx) => `<button class="opt" data-k="${k}"><span class="letter">${LETTERS[idx]}</span><span>${fits[k].name}</span></button>`).join('')}</div>
        <div id="explain"></div></div>`;
      el.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => {
        const k = +b.dataset.k, ok = k === best;
        el.querySelectorAll('.opt').forEach((x) => { x.disabled = true; if (+x.dataset.k === best) x.classList.add('correct'); });
        if (!ok) b.classList.add('wrong');
        if (ok) correct++;
        Store.recordDrill(ok);
        Store.recordQuiz('complexity', ok);
        el.querySelector('#explain').innerHTML = `<div class="explain"><b>${ok ? '✓ Correct.' : '✗ No.'}</b> ${fits[best].name} needs about ${U.sci(fits[best].ops)} operations — under the budget of ${U.sci(budget)}. ${best + 1 < fits.length ? `${fits[best + 1].name} would need ${U.sci(fits[best + 1].ops)}, too slow.` : ''}<div class="mt"><button class="btn primary" id="next-q">Next →</button></div></div>`;
        el.querySelector('#next-q').addEventListener('click', () => { i++; render(); });
      }));
    };
    render();
  };

  return { mountQuiz, mountFlashcards, mountDrills, mountComplexityDrill, pickQuestions };
})();

Pages.practice = (root, params, query) => {
  const esc = U.esc;
  const mode = params.mode || '';
  const due = Flashcards.dueCount();
  const totalQ = Object.values(QUIZ).reduce((s, a) => s + a.length, 0);

  if (!mode) {
    const opened = TOPICS.filter((t) => Store.topic(t.id).status && (QUIZ[t.id] || []).length);
    root.innerHTML = `
      <div class="card mb"><h1 style="margin-bottom:2px">Practice</h1><div class="muted small">${totalQ} quiz questions · ${FLASHCARDS.length} flashcards · ${DRILLS.length} technique drills. Ten minutes a day here beats a three-hour cram before the contest.</div></div>
      <div class="mode-grid">
        <a class="card mode-card clickable" href="#/practice/flashcards" style="text-decoration:none;color:inherit"><div class="big">${UI.icon('brain')} Flashcards ${due ? `<span class="badge warn">${due} due</span>` : ''}</div><div class="muted small">Spaced repetition for facts you must know cold: complexities, formulas, when-to-use rules. Cards unlock as you open topics.</div></a>
        <a class="card mode-card clickable" href="#/practice/drills" style="text-decoration:none;color:inherit"><div class="big">${UI.icon('target')} Technique drills</div><div class="muted small">Read a short problem statement, pick the technique. Trains the "what is this problem really about?" reflex.</div></a>
        <a class="card mode-card clickable" href="#/practice/quiz" style="text-decoration:none;color:inherit"><div class="big">${UI.icon('dice')} Mixed quiz</div><div class="muted small">10 random questions from the topics you have opened.</div></a>
        <a class="card mode-card clickable" href="#/practice/weak" style="text-decoration:none;color:inherit"><div class="big">${UI.icon('fire')} Weak-spot quiz</div><div class="muted small">Questions only from topics where your accuracy is below 75%.</div></a>
        <a class="card mode-card clickable" href="#/practice/complexity" style="text-decoration:none;color:inherit"><div class="big">${UI.icon('timer')} Complexity drill</div><div class="muted small">Given n and the time limit, name the slowest complexity that fits. Generated endlessly.</div></a>
      </div>
      <div class="card mt">
        <div class="card-title">${UI.icon('book')} Quiz by topic</div>
        ${opened.length ? `<div class="row">${opened.map((t) => { const a = Store.quizAccuracy(t.id); return `<a class="btn small ${a !== null && a < 0.7 ? 'warn' : ''}" href="#/practice/topic?id=${t.id}">${esc(t.title)}${a !== null ? ` · ${Math.round(a * 100)}%` : ''}</a>`; }).join('')}</div>` : '<div class="muted small">Open some topics in the roadmap to unlock their quizzes.</div>'}
        <div class="muted small mt">Or pick any topic: <select class="input" id="any-topic" style="width:auto;display:inline-block"><option value="">choose…</option>${TOPICS.filter((t) => (QUIZ[t.id] || []).length).map((t) => `<option value="${t.id}">${esc(t.title)}</option>`).join('')}</select></div>
      </div>`;
    root.querySelector('#any-topic').addEventListener('change', (e) => { if (e.target.value) Router.go(`#/practice/topic?id=${e.target.value}`); });
    return;
  }

  root.innerHTML = `<div class="row mb"><a class="btn small ghost" href="#/practice">${UI.icon('arrowLeft', 14)} Practice menu</a></div><div id="practice-body"></div>`;
  const body = root.querySelector('#practice-body');
  if (mode === 'flashcards') Practice.mountFlashcards(body, { topic: query.topic });
  else if (mode === 'drills') Practice.mountDrills(body, {});
  else if (mode === 'quiz') Practice.mountQuiz(body, { count: 10 });
  else if (mode === 'weak') Practice.mountQuiz(body, { count: 10, weak: true });
  else if (mode === 'complexity') Practice.mountComplexityDrill(body, {});
  else if (mode === 'topic') Practice.mountQuiz(body, { topic: query.id });
  else body.innerHTML = UI.empty('Unknown practice mode');
};
