/* Cheat sheet: searchable code templates + Team Reference Document builder (print to PDF). */
Pages.cheatsheet = (root, params, query) => {
  const esc = U.esc;
  const cats = [];
  TEMPLATES.forEach((t) => { if (!cats.includes(t.cat)) cats.push(t.cat); });
  const sel = new Set(Store.state.settings.trd || []);
  let q = query.q || '';

  const render = () => {
    const ql = q.trim().toLowerCase();
    const list = TEMPLATES.filter((t) => !ql || t.title.toLowerCase().includes(ql) || t.cat.toLowerCase().includes(ql) || (t.tags || []).some((x) => x.includes(ql)) || t.code.toLowerCase().includes(ql));
    const groups = U.groupBy(list, (t) => t.cat);
    root.innerHTML = `
      <div class="card mb">
        <div class="row between">
          <div><h1 style="margin-bottom:2px">Cheat sheet & Team Reference Document</h1><div class="muted small">${TEMPLATES.length} tested C++ templates. Tick the ones you want in your printed TRD (ICPC allows a printed reference document; keep it short enough to actually navigate).</div></div>
          <div class="row"><input class="input" id="cs-q" placeholder="Search templates…" value="${esc(q)}" style="width:220px"><button class="btn primary" id="print-trd" ${sel.size ? '' : 'disabled'}>${UI.icon('print', 16)} Print TRD (${sel.size})</button></div>
        </div>
      </div>
      <div class="cheat-layout">
        <nav class="cheat-nav card" style="padding:8px">${cats.map((c) => `<a href="#cat-${esc(c).replace(/\W+/g, '-')}" data-cat>${esc(c)} <span class="muted tiny">${(groups[c] || []).length}</span></a>`).join('')}
          <hr><a href="#" id="sel-all">Select all</a><a href="#" id="sel-none">Clear selection</a></nav>
        <div>
          ${cats.filter((c) => groups[c]).map((c) => `<h2 id="cat-${esc(c).replace(/\W+/g, '-')}" style="margin-top:6px">${esc(c)}</h2>${groups[c].map((t) => `<div class="cheat-item card" id="tpl-${t.id}">
              <div class="head"><label class="checkbox"><input type="checkbox" data-sel="${t.id}" ${sel.has(t.id) ? 'checked' : ''}></label><h3>${esc(t.title)}</h3>${t.topic && Topics.get(t.topic) ? `<a class="badge" href="#/topic/${t.topic}">${esc(Topics.get(t.topic).title)}</a>` : ''}<span class="spacer"></span><button class="btn tiny ghost" data-play="${t.id}">Open in playground</button></div>
              <div class="desc">${MD.inline(t.desc || '')}</div>
              ${MD.codeBlock(t.code, t.lang || 'cpp')}
            </div>`).join('')}`).join('') || UI.empty('No templates match')}
        </div>
      </div>`;
    MD.activate(root);
    root.querySelector('#cs-q').addEventListener('input', U.debounce((e) => { q = e.target.value; render(); setTimeout(() => { const i = root.querySelector('#cs-q'); i.focus(); i.setSelectionRange(q.length, q.length); }, 0); }, 250));
    U.on(root, 'change', '[data-sel]', (e, cb) => { if (cb.checked) sel.add(cb.dataset.sel); else sel.delete(cb.dataset.sel); Store.setSetting('trd', Array.from(sel)); const b = root.querySelector('#print-trd'); b.disabled = !sel.size; b.innerHTML = `${UI.icon('print', 16)} Print TRD (${sel.size})`; });
    U.on(root, 'click', '[data-play]', (e, b) => { const t = TEMPLATES.find((x) => x.id === b.dataset.play); sessionStorage.setItem('seerc-play-code', t.code); Router.go('#/playground?load=1'); });
    U.on(root, 'click', '[data-cat]', (e, a) => { e.preventDefault(); const el = root.querySelector(a.getAttribute('href')); if (el) el.scrollIntoView({ behavior: 'smooth' }); });
    root.querySelector('#sel-all').addEventListener('click', (e) => { e.preventDefault(); TEMPLATES.forEach((t) => sel.add(t.id)); Store.setSetting('trd', Array.from(sel)); render(); });
    root.querySelector('#sel-none').addEventListener('click', (e) => { e.preventDefault(); sel.clear(); Store.setSetting('trd', []); render(); });
    root.querySelector('#print-trd').addEventListener('click', printTRD);
    if (query.item) { const el = root.querySelector('#tpl-' + query.item); if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 60); }
  };

  const printTRD = () => {
    const chosen = TEMPLATES.filter((t) => sel.has(t.id));
    const w = window.open('', '_blank');
    if (!w) { UI.toast('Popup blocked — allow popups for this page', 'error'); return; }
    const style = `body{font-family:Inter,system-ui,sans-serif;font-size:10px;margin:10mm;color:#000}h1{font-size:15px;margin:0 0 4px}h2{font-size:11px;margin:10px 0 2px;border-bottom:1px solid #888;break-after:avoid}
      .cols{column-count:2;column-gap:12px}.item{break-inside:avoid;margin-bottom:6px}.desc{color:#333;font-size:9px;margin:0 0 2px}pre{font-family:'JetBrains Mono',Consolas,monospace;font-size:7.6px;line-height:1.25;margin:0;white-space:pre-wrap;border:1px solid #bbb;padding:3px 4px;border-radius:3px}
      .toc{font-size:9px;columns:3;margin-bottom:6px}.toc div{break-inside:avoid}@page{margin:8mm}.hl-c{color:#555;font-style:italic}.hl-s{color:#063}.hl-n{color:#840}.hl-k{color:#609;font-weight:600}.hl-t{color:#036}.hl-p{color:#067}.hl-f{color:#303}`;
    const name = Store.state.settings.name ? esc(Store.state.settings.name) : 'Team';
    w.document.write(`<!DOCTYPE html><html><head><title>Team Reference Document</title><style>${style}</style></head><body>
      <h1>Team Reference Document — ${name} — generated ${new Date().toLocaleDateString()}</h1>
      <div class="toc">${chosen.map((t, i) => `<div>${i + 1}. ${esc(t.title)} <span style="color:#666">(${esc(t.cat)})</span></div>`).join('')}</div>
      <div class="cols">${chosen.map((t, i) => `<div class="item"><h2>${i + 1}. ${esc(t.title)}</h2><p class="desc">${esc(t.desc || '')}</p><pre>${HL.cpp(t.code)}</pre></div>`).join('')}</div>
      <script>window.onload=function(){setTimeout(function(){window.print();},300);};</script></body></html>`);
    w.document.close();
  };

  render();
};
