/* Roadmap: tiers → topic cards with status, prerequisites and SEERC importance. */
Pages.roadmap = (root, params, query) => {
  const esc = U.esc;
  const catFilter = query.cat || 'all';
  const rec = Topics.recommended();

  const card = (t) => {
    const st = Store.topic(t.id).status;
    const missing = (t.prereqs || []).filter((p) => !Topics.learned(p));
    const probs = Problems.forTopic(t.id);
    const solved = probs.filter((p) => Store.problem(p.id).status === 'solved').length;
    const acc = Store.quizAccuracy(t.id);
    return `<a class="card topic-card clickable ${st || ''}" href="#/topic/${t.id}" style="text-decoration:none;color:inherit;border-top:3px solid ${CATS[t.cat].color}">
      <div class="t-title">${esc(t.title)}${rec && rec.id === t.id ? '<span class="badge accent">next up</span>' : ''}</div>
      <div class="t-sum">${esc(t.summary)}</div>
      <div class="t-meta">${UI.stars(t.stars)}<span>~${t.hours}h</span><span>${probs.length ? `${solved}/${probs.length} solved` : ''}</span>${acc !== null ? `<span>quiz ${Math.round(acc * 100)}%</span>` : ''}</div>
      ${t.prereqs && t.prereqs.length ? `<div class="prereq">Needs: ${t.prereqs.map((p) => `<span class="${Topics.learned(p) ? '' : 'miss'}">${esc(Topics.get(p).title)}</span>`).join(', ')}${missing.length ? '' : ' ✓'}</div>` : '<div class="prereq">No prerequisites — start here.</div>'}
    </a>`;
  };

  const tiers = TIERS.map((tier) => {
    const list = Topics.inTier(tier.id).filter((t) => catFilter === 'all' || t.cat === catFilter);
    if (!list.length) return '';
    const p = Topics.progress(tier.id);
    return `<section class="tier">
      <div class="tier-head">${UI.tierBadge(tier.id)}<h2>${esc(tier.name)}</h2>${UI.progress(p.ratio, p.ratio === 1 ? 'ok' : '')}<span class="muted small">${p.done}/${p.total}</span></div>
      <p class="muted small" style="margin-top:-6px">${esc(tier.desc)}</p>
      <div class="topic-grid">${list.map(card).join('')}</div>
    </section>`;
  }).join('');

  const total = Topics.progress();
  const hoursLeft = TOPICS.filter((t) => !Topics.learned(t.id)).reduce((s, t) => s + t.hours, 0);

  root.innerHTML = `
    <div class="card mb">
      <div class="row between">
        <div>
          <h1 style="margin-bottom:2px">Roadmap</h1>
          <div class="muted small">${TOPICS.length} topics in recommended order · ${total.done} learned · about ${hoursLeft}h of study left. Stars show how much a topic matters at SEERC.</div>
        </div>
        <div class="row">
          <select class="input" id="cat-filter" style="width:auto">
            <option value="all">All categories</option>
            ${Object.entries(CATS).map(([k, c]) => `<option value="${k}" ${catFilter === k ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="legend mt">
        <span><span class="pill ok">Learned</span> = you clicked "Mark as learned"</span>
        <span><span class="pill warn">In progress</span> = opened but not finished</span>
        <span>Orange prerequisite = not learned yet (you can still open the topic)</span>
        <span>${UI.stars(5)} = appears in almost every SEERC</span>
      </div>
    </div>
    ${tiers}`;

  root.querySelector('#cat-filter').addEventListener('change', (e) => Router.go('#/roadmap' + Router.qs({ cat: e.target.value === 'all' ? '' : e.target.value })));
};
