/* Visualizers page: gallery + single visualizer view. */
Pages.visualizers = (root, params) => {
  const esc = U.esc;
  const all = Viz.list();
  if (params.id) {
    const def = Viz.get(params.id);
    if (!def) { root.innerHTML = UI.empty('Visualizer not found') + '<p class="center"><a href="#/viz">All visualizers</a></p>'; return; }
    const topic = Topics.get(def.topic);
    const i = all.indexOf(def);
    root.innerHTML = `
      <div class="row between mb">
        <div>
          <div class="row small muted"><a href="#/viz">${UI.icon('arrowLeft', 14)} All visualizers</a>${topic ? ` · <a href="#/topic/${topic.id}">Lesson: ${esc(topic.title)}</a>` : ''}</div>
          <h1 style="margin:4px 0 2px">${esc(def.title)}</h1>
          <div class="muted small">${esc(def.desc || '')}</div>
        </div>
        <div class="row">
          ${i > 0 ? `<a class="btn small" href="#/viz/${all[i - 1].id}">← ${esc(all[i - 1].title)}</a>` : ''}
          ${i + 1 < all.length ? `<a class="btn small" href="#/viz/${all[i + 1].id}">${esc(all[i + 1].title)} →</a>` : ''}
        </div>
      </div>
      <div id="viz-mount"></div>
      <div class="muted small mt">Keyboard: <span class="kbd">←</span> <span class="kbd">→</span> step, <span class="kbd">Space</span> play/pause. Change the input on the right and press Apply, or roll a new random input.</div>`;
    Viz.mount(def, root.querySelector('#viz-mount'));
    return;
  }
  const groups = U.groupBy(all, (v) => v.cat || 'other');
  const order = ['core', 'graphs', 'ds', 'dp', 'strings', 'math', 'geometry', 'other'];
  root.innerHTML = `<div class="card mb"><h1 style="margin-bottom:2px">Algorithm visualizers</h1><div class="muted small">${all.length} step-by-step animations with the matching code highlighted. Watch once, then predict each next step before pressing →. That prediction is the learning.</div></div>
    ${order.filter((k) => groups[k]).map((k) => `<h2 style="margin-top:18px">${esc((CATS[k] || { name: k }).name)}</h2><div class="viz-grid">${groups[k].map((v) => `<a class="card clickable" href="#/viz/${v.id}" style="text-decoration:none;color:inherit"><div class="row between"><b>${esc(v.title)}</b>${UI.icon('play', 16)}</div><div class="muted small mt" style="margin-top:6px">${esc(v.desc || '')}</div>${Topics.get(v.topic) ? `<div class="tiny muted mt" style="margin-top:8px">Lesson: ${esc(Topics.get(v.topic).title)}</div>` : ''}</a>`).join('')}</div>`).join('')}`;
};
