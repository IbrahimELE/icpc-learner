/* Problem bank page + shared problem row rendering (used by topic pages too). */
const Problems = (() => {
  const esc = U.esc;
  const byId = () => Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
  const get = (id) => byId()[id];
  const forTopic = (topicId) => PROBLEMS.filter((p) => p.topics.includes(topicId)).sort((a, b) => a.diff - b.diff);

  // Recommend unsolved problems from topics the user has opened/learned, easiest first.
  const recommended = (n = 3) => {
    const active = new Set(TOPICS.filter((t) => Store.topic(t.id).status).map((t) => t.id));
    if (!active.size) { const first = TOPICS[0]; active.add(first.id); }
    const learnedList = TOPICS.filter((t) => Topics.learned(t.id)).map((t) => t.id);
    const cands = PROBLEMS.filter((p) => !Store.problem(p.id).status && p.topics.some((t) => active.has(t)));
    const score = (p) => {
      // prefer problems whose topics are all learned, then lower difficulty, then higher-star topics
      const allLearned = p.topics.every((t) => learnedList.includes(t)) ? 0 : 1;
      const stars = Math.max(...p.topics.map((t) => (Topics.get(t) || { stars: 1 }).stars));
      return allLearned * 10 + p.diff * 2 - stars * 0.3;
    };
    return cands.sort((a, b) => score(a) - score(b)).slice(0, n);
  };

  const rowHtml = (p, { showTopics = true } = {}) => {
    const st = Store.problem(p.id).status;
    return `<div class="problem-row ${st || ''}" data-pid="${p.id}">
      <button class="status-btn ${st || ''}" data-status title="Click to cycle: to do → attempted → solved">${st === 'solved' ? '✓' : st === 'attempted' ? '…' : st === 'skipped' ? '–' : ''}</button>
      <div>
        <div class="p-title"><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)} ${UI.icon('external', 12)}</a></div>
        <div class="p-sub"><span class="badge src">${esc(p.src)}</span>${UI.diffDots(p.diff)}${showTopics ? p.topics.map((t) => Topics.get(t) ? `<a href="#/topic/${t}" class="muted">${esc(Topics.get(t).title)}</a>` : '').join('') : ''}${p.note ? `<span class="muted">· ${esc(p.note)}</span>` : ''}</div>
      </div>
      <div class="p-actions row" style="gap:6px">
        ${p.hints && p.hints.length ? `<button class="btn tiny ghost" data-hints>${p.hints.length} hint${p.hints.length > 1 ? 's' : ''}</button>` : ''}
        <button class="btn tiny ghost" data-skip title="Mark skipped (hide from recommendations)">skip</button>
      </div>
      <div class="problem-details hidden" data-details></div>
    </div>`;
  };

  const cycle = { null: 'attempted', undefined: 'attempted', attempted: 'solved', solved: null, skipped: 'attempted' };

  const bindList = (listEl) => {
    if (!listEl || listEl.dataset.bound) return;
    listEl.dataset.bound = '1';
    U.on(listEl, 'click', '[data-status]', (e, btn) => {
      const row = btn.closest('.problem-row');
      const p = get(row.dataset.pid);
      const cur = Store.problem(p.id).status;
      const nxt = cycle[cur];
      Store.setProblemStatus(p.id, nxt, p.diff);
      const fresh = U.el(rowHtml(p));
      row.replaceWith(fresh);
    });
    U.on(listEl, 'click', '[data-skip]', (e, btn) => {
      const row = btn.closest('.problem-row');
      const p = get(row.dataset.pid);
      Store.setProblemStatus(p.id, Store.problem(p.id).status === 'skipped' ? null : 'skipped', p.diff);
      row.replaceWith(U.el(rowHtml(p)));
    });
    U.on(listEl, 'click', '[data-hints]', (e, btn) => {
      const row = btn.closest('.problem-row');
      const p = get(row.dataset.pid);
      const det = row.querySelector('[data-details]');
      if (!det.classList.contains('hidden')) { det.classList.add('hidden'); det.innerHTML = ''; return; }
      det.classList.remove('hidden');
      det.dataset.shown = '0';
      const renderHints = () => {
        const shown = +det.dataset.shown;
        det.innerHTML = `<div class="hints">${p.hints.slice(0, shown).map((h, i) => `<div class="hint"><b>Hint ${i + 1}</b>${MD.inline(h)}</div>`).join('')}
          ${shown < p.hints.length ? `<button class="btn small" data-reveal>Reveal hint ${shown + 1} of ${p.hints.length}</button>` : '<div class="muted tiny">That was the last hint. If you are still stuck, read an editorial, then re-implement from scratch without looking.</div>'}</div>`;
        det.querySelectorAll('[data-reveal]').forEach((b) => b.addEventListener('click', () => { det.dataset.shown = String(shown + 1); renderHints(); }));
      };
      renderHints();
    });
  };

  return { get, forTopic, recommended, rowHtml, bindList };
})();

Pages.problems = (root, params, query) => {
  const esc = U.esc;
  const f = {
    q: query.q || '',
    topic: query.topic || '',
    diff: query.diff || '',
    src: query.src || '',
    status: query.status || '',
    tier: query.tier || '',
    sort: query.sort || 'default',
  };
  const sources = Array.from(new Set(PROBLEMS.map((p) => p.src))).sort();

  const apply = () => {
    let list = PROBLEMS.slice();
    if (f.q) { const q = f.q.toLowerCase(); list = list.filter((p) => p.title.toLowerCase().includes(q) || p.topics.some((t) => (Topics.get(t) || { title: '' }).title.toLowerCase().includes(q)) || (p.tags || []).some((x) => x.includes(q))); }
    if (f.topic) list = list.filter((p) => p.topics.includes(f.topic));
    if (f.tier !== '') list = list.filter((p) => p.topics.some((t) => Topics.get(t) && String(Topics.get(t).tier) === f.tier));
    if (f.diff) list = list.filter((p) => String(p.diff) === f.diff);
    if (f.src) list = list.filter((p) => p.src === f.src);
    if (f.status) list = list.filter((p) => (f.status === 'todo' ? !Store.problem(p.id).status : Store.problem(p.id).status === f.status));
    const tierOf = (p) => Math.min(...p.topics.map((t) => (Topics.get(t) || { tier: 9 }).tier));
    const orderOf = (p) => Math.min(...p.topics.map((t) => Topics.index(t) < 0 ? 999 : Topics.index(t)));
    if (f.sort === 'diff') list.sort((a, b) => a.diff - b.diff || orderOf(a) - orderOf(b));
    else if (f.sort === 'diff-desc') list.sort((a, b) => b.diff - a.diff || orderOf(a) - orderOf(b));
    else if (f.sort === 'title') list.sort((a, b) => a.title.localeCompare(b.title));
    else list.sort((a, b) => tierOf(a) - tierOf(b) || orderOf(a) - orderOf(b) || a.diff - b.diff);
    return list;
  };

  const solvedBy = {};
  const totalBy = {};
  PROBLEMS.forEach((p) => { totalBy[p.diff] = (totalBy[p.diff] || 0) + 1; if (Store.problem(p.id).status === 'solved') solvedBy[p.diff] = (solvedBy[p.diff] || 0) + 1; });

  const topicOptions = TIERS.map((tier) => `<optgroup label="${esc(tier.name)}">${Topics.inTier(tier.id).map((t) => `<option value="${t.id}" ${f.topic === t.id ? 'selected' : ''}>${esc(t.title)}</option>`).join('')}</optgroup>`).join('');

  const recs = Problems.recommended(3);

  root.innerHTML = `
    <div class="stats-strip">
      <div class="chip">${UI.icon('check', 16)} <b>${Store.solvedCount()}</b> solved of ${PROBLEMS.length}</div>
      ${[1, 2, 3, 4, 5].map((d) => `<div class="chip">${UI.diff(d)} <b>${solvedBy[d] || 0}</b>/${totalBy[d] || 0}</div>`).join('')}
      <span class="spacer"></span>
      <button class="btn" id="random-btn">${UI.icon('dice', 16)} Random unsolved</button>
    </div>
    ${recs.length && !f.q && !f.topic ? `<div class="card mb"><div class="card-title">${UI.icon('target')} Recommended for you now</div><div class="problem-list" id="rec-list">${recs.map((p) => Problems.rowHtml(p)).join('')}</div></div>` : ''}
    <div class="card">
      <div class="filters">
        <input class="input search" id="f-q" placeholder="Search title, topic or tag…" value="${esc(f.q)}">
        <select class="input" id="f-topic"><option value="">All topics</option>${topicOptions}</select>
        <select class="input" id="f-tier"><option value="">All tiers</option>${TIERS.map((t) => `<option value="${t.id}" ${f.tier === String(t.id) ? 'selected' : ''}>${esc(t.short)} · ${esc(t.name)}</option>`).join('')}</select>
        <select class="input" id="f-diff"><option value="">Any difficulty</option>${[1, 2, 3, 4, 5].map((d) => `<option value="${d}" ${f.diff === String(d) ? 'selected' : ''}>${d} · ${['', 'Easy', 'Medium', 'Hard', 'Very hard', 'Expert'][d]}</option>`).join('')}</select>
        <select class="input" id="f-src"><option value="">Any source</option>${sources.map((s) => `<option ${f.src === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>
        <select class="input" id="f-status"><option value="">Any status</option><option value="todo" ${f.status === 'todo' ? 'selected' : ''}>To do</option><option value="attempted" ${f.status === 'attempted' ? 'selected' : ''}>Attempted</option><option value="solved" ${f.status === 'solved' ? 'selected' : ''}>Solved</option><option value="skipped" ${f.status === 'skipped' ? 'selected' : ''}>Skipped</option></select>
        <select class="input" id="f-sort"><option value="default" ${f.sort === 'default' ? 'selected' : ''}>Sort: roadmap order</option><option value="diff" ${f.sort === 'diff' ? 'selected' : ''}>Sort: easiest first</option><option value="diff-desc" ${f.sort === 'diff-desc' ? 'selected' : ''}>Sort: hardest first</option><option value="title" ${f.sort === 'title' ? 'selected' : ''}>Sort: title</option></select>
      </div>
      <div class="muted small mb" id="count-line"></div>
      <div class="problem-list" id="plist"></div>
    </div>`;

  const listEl = root.querySelector('#plist');
  const renderList = () => {
    const list = apply();
    root.querySelector('#count-line').textContent = `${list.length} problem${list.length === 1 ? '' : 's'}${f.q || f.topic || f.diff || f.src || f.status || f.tier ? ' match your filters' : ''}. Sources: CSES (stable, great for learning), Codeforces, AtCoder, Kattis. Open the problem, solve it on the judge, then mark it here.`;
    listEl.innerHTML = list.length ? list.slice(0, 400).map((p) => Problems.rowHtml(p)).join('') : UI.empty('Nothing matches', 'Try clearing a filter.');
  };
  renderList();
  Problems.bindList(listEl);
  Problems.bindList(root.querySelector('#rec-list'));

  const sync = () => {
    f.q = root.querySelector('#f-q').value;
    f.topic = root.querySelector('#f-topic').value;
    f.tier = root.querySelector('#f-tier').value;
    f.diff = root.querySelector('#f-diff').value;
    f.src = root.querySelector('#f-src').value;
    f.status = root.querySelector('#f-status').value;
    f.sort = root.querySelector('#f-sort').value;
    history.replaceState(null, '', '#/problems' + Router.qs(f));
    renderList();
  };
  root.querySelector('#f-q').addEventListener('input', U.debounce(sync, 200));
  ['#f-topic', '#f-tier', '#f-diff', '#f-src', '#f-status', '#f-sort'].forEach((id) => root.querySelector(id).addEventListener('change', sync));

  const randomPick = () => {
    const pool = apply().filter((p) => !Store.problem(p.id).status || Store.problem(p.id).status === 'attempted');
    if (!pool.length) { UI.toast('No unsolved problems match the filters', 'error'); return; }
    const p = U.pick(pool);
    const m = UI.modal({ title: '🎲 Your random problem', body: `<div class="problem-list">${Problems.rowHtml(p)}</div><p class="muted small mt">Set a 30–45 minute timer. If you have no idea after 20 minutes, open the first hint.</p>`,
      actions: [{ label: 'Another one', cls: 'ghost', onClick: () => { m.close(); randomPick(); return false; } }, { label: 'Open problem', cls: 'primary', onClick: () => { window.open(p.url, '_blank', 'noopener'); } }] });
    Problems.bindList(m.body.querySelector('.problem-list'));
  };
  root.querySelector('#random-btn').addEventListener('click', randomPick);
  if (query.random) setTimeout(randomPick, 100);
};
