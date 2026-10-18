/* Shared UI widgets: toasts, modals, badges, icons, tabs, heatmap. */
const UI = (() => {
  const esc = U.esc;

  /* ---- icons (inline SVG, stroke-based) ---- */
  const ICONS = {
    home: '<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/>',
    map: '<path d="M9 4l6 2 6-2v14l-6 2-6-2-6 2V6z"/><path d="M9 4v14M15 6v14"/>',
    book: '<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
    brain: '<path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 1 5 3 3 0 0 0 4 3 3 3 0 0 0 3-2V5a3 3 0 0 0-3-2z"/><path d="M15 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-1 5 3 3 0 0 1-4 3 3 3 0 0 1-3-2V5a3 3 0 0 1 3-2z"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3a1 1 0 0 1 1 1 4 4 0 0 1-4 4M7 5H4a1 1 0 0 0-1 1 4 4 0 0 0 4 4"/>',
    code: '<path d="M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16"/>',
    tool: '<path d="M14.7 6.3a4 4 0 0 0 5 5l-9 9a2 2 0 1 1-3-3l9-9a4 4 0 0 0-2-2z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    star: '<path d="M12 2l3 7 7 .8-5.2 4.8L18.5 22 12 18.3 5.5 22l1.7-7.4L2 9.8 9 9z"/>',
    play: '<path d="M6 4l14 8-14 8z"/>',
    pause: '<path d="M7 4h4v16H7zM13 4h4v16h-4z"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    fire: '<path d="M12 22c4 0 7-3 7-7 0-3-2-5-3-7-1 2-2 3-3 3 0-3-1-6-3-9-1 4-5 6-5 12a7 7 0 0 0 7 8z"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    archive: '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4"/>',
    flag: '<path d="M5 22V4M5 4h11l-1 4 1 4H5"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
    moon: '<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',
    dice: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.2"/><circle cx="16" cy="8" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="8" cy="16" r="1.2"/><circle cx="16" cy="16" r="1.2"/>',
    lightbulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/>',
    arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    print: '<path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M6 14h12v7H6z"/>',
    balloon: '<path d="M12 2a6 6 0 0 0-6 7c0 4 4 7 6 8 2-1 6-4 6-8a6 6 0 0 0-6-7zM12 17v5M10 22h4"/>',
  };
  const icon = (name, size = 18) => `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.info}</svg>`;

  /* ---- toasts ---- */
  const toast = (msg, type = 'info', ms = 2600) => {
    const root = document.getElementById('toasts');
    if (!root) return;
    const t = U.el(`<div class="toast ${esc(type)}">${esc(msg)}</div>`);
    root.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, ms);
  };

  /* ---- modals ---- */
  const modal = ({ title, body, actions = [], wide = false, onClose }) => {
    const root = document.getElementById('modal-root');
    const m = U.el(`<div class="modal-backdrop"><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">
      <div class="modal-head"><h3>${esc(title || '')}</h3><button class="btn icon-btn ghost" data-close aria-label="Close">${icon('x')}</button></div>
      <div class="modal-body"></div>
      <div class="modal-foot"></div></div></div>`);
    const bodyEl = m.querySelector('.modal-body');
    if (typeof body === 'string') bodyEl.innerHTML = body; else if (body) bodyEl.appendChild(body);
    const foot = m.querySelector('.modal-foot');
    let closed = false;
    const close = () => {
      if (closed) return; closed = true;
      m.classList.remove('show'); setTimeout(() => m.remove(), 180);
      document.removeEventListener('keydown', onKey);
      if (onClose) onClose();
    };
    actions.forEach((a) => {
      const b = U.el(`<button class="btn ${esc(a.cls || '')}">${esc(a.label)}</button>`);
      b.addEventListener('click', () => { const r = a.onClick ? a.onClick(close, m) : undefined; if (r !== false && !a.keepOpen) close(); });
      foot.appendChild(b);
    });
    if (!actions.length) foot.remove();
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    m.addEventListener('click', (e) => { if (e.target === m) close(); });
    m.querySelector('[data-close]').addEventListener('click', close);
    root.appendChild(m);
    requestAnimationFrame(() => m.classList.add('show'));
    MD.activate(bodyEl);
    return { close, el: m, body: bodyEl };
  };

  const confirm = (msg, { okLabel = 'Yes', danger = false, title = 'Are you sure?' } = {}) => new Promise((resolve) => {
    let decided = false;
    modal({
      title,
      body: `<p>${esc(msg)}</p>`,
      actions: [
        { label: 'Cancel', cls: 'ghost', onClick: () => { decided = true; resolve(false); } },
        { label: okLabel, cls: danger ? 'danger' : 'primary', onClick: () => { decided = true; resolve(true); } },
      ],
      onClose: () => { if (!decided) resolve(false); },
    });
  });

  const prompt = (title, { label = '', value = '', placeholder = '', okLabel = 'OK', multiline = false } = {}) => new Promise((resolve) => {
    let decided = false;
    const field = multiline
      ? `<textarea class="input" rows="6" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`
      : `<input class="input" value="${esc(value)}" placeholder="${esc(placeholder)}">`;
    const m = modal({
      title,
      body: `<label class="field">${label ? `<span>${esc(label)}</span>` : ''}${field}</label>`,
      actions: [
        { label: 'Cancel', cls: 'ghost', onClick: () => { decided = true; resolve(null); } },
        { label: okLabel, cls: 'primary', onClick: () => { decided = true; resolve(m.body.querySelector('.input').value); } },
      ],
      onClose: () => { if (!decided) resolve(null); },
    });
    setTimeout(() => { const f = m.body.querySelector('.input'); f.focus(); if (!multiline) f.select(); }, 50);
  });

  /* ---- small presentational helpers ---- */
  const stars = (n, max = 5) => `<span class="stars" title="SEERC importance ${n}/${max}">${'★'.repeat(n)}<span class="dim">${'★'.repeat(max - n)}</span></span>`;
  const DIFF = { 1: ['Easy', 'd1'], 2: ['Medium', 'd2'], 3: ['Hard', 'd3'], 4: ['Very hard', 'd4'], 5: ['Expert', 'd5'] };
  const diff = (d) => { const [label, cls] = DIFF[d] || DIFF[2]; return `<span class="badge diff ${cls}" title="Difficulty ${d}/5">${label}</span>`; };
  const diffDots = (d) => `<span class="diffdots" title="Difficulty ${d}/5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= d ? 'on d' + d : ''}"></i>`).join('')}</span>`;
  const statusPill = (s) => {
    const map = { solved: ['Solved', 'ok'], attempted: ['Attempted', 'warn'], skipped: ['Skipped', 'muted'], learned: ['Learned', 'ok'], 'in-progress': ['In progress', 'warn'] };
    const [label, cls] = map[s] || ['To do', 'todo'];
    return `<span class="pill ${cls}">${label}</span>`;
  };
  const progress = (p, cls = '') => `<div class="progress ${cls}"><div class="bar" style="width:${U.clamp(Math.round(p * 100), 0, 100)}%"></div></div>`;
  const empty = (msg, sub = '') => `<div class="empty"><div class="empty-icon">${icon('lightbulb', 28)}</div><div>${esc(msg)}</div>${sub ? `<div class="muted small">${esc(sub)}</div>` : ''}</div>`;
  const tierBadge = (tier) => { const t = TIERS.find((x) => x.id === tier); return t ? `<span class="badge tier t${tier}">${esc(t.short)}</span>` : ''; };

  // Simple tab component: root contains [data-tab=x] buttons and [data-panel=x] panels
  const tabs = (root, { initial, onChange } = {}) => {
    const btns = U.$$('[data-tab]', root);
    const panels = U.$$('[data-panel]', root);
    const show = (name) => {
      btns.forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
      panels.forEach((p) => p.classList.toggle('hidden', p.dataset.panel !== name));
      if (onChange) onChange(name);
    };
    btns.forEach((b) => b.addEventListener('click', () => show(b.dataset.tab)));
    show(initial || (btns[0] && btns[0].dataset.tab));
    return { show };
  };

  // Heatmap of daily activity (last `weeks` weeks), GitHub-style columns.
  const heatmap = (activity, weeks = 16) => {
    const today = U.todayKey();
    const todayDow = U.parseKey(today).getDay(); // 0 Sun
    const end = U.addDays(today, 6 - todayDow);
    const total = weeks * 7;
    const start = U.addDays(end, -(total - 1));
    let cells = '';
    let k = start;
    for (let i = 0; i < total; i++) {
      const a = activity[k];
      const xp = a ? a.xp : 0;
      const lvl = k > today ? -1 : xp === 0 ? 0 : xp < 20 ? 1 : xp < 60 ? 2 : xp < 150 ? 3 : 4;
      cells += `<i class="hm ${lvl < 0 ? 'future' : 'l' + lvl}" title="${U.fmtDate(k, { month: 'short', day: 'numeric', year: 'numeric' })}: ${xp} XP"></i>`;
      k = U.addDays(k, 1);
    }
    return `<div class="heatmap">${cells}</div>`;
  };

  return { icon, toast, modal, confirm, prompt, stars, diff, diffDots, statusPill, progress, empty, tierBadge, tabs, heatmap };
})();
