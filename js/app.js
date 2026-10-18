/* App bootstrap: shell, navigation, routing, global search. */
const App = (() => {
  const NAV = [
    { section: 'Learn' },
    { path: '/', label: 'Dashboard', icon: 'home' },
    { path: '/roadmap', label: 'Roadmap', icon: 'map' },
    { path: '/problems', label: 'Problem Bank', icon: 'list', count: () => Store.solvedCount() + '/' + PROBLEMS.length },
    { path: '/practice', label: 'Practice & Quizzes', icon: 'brain', count: () => { const d = Flashcards.dueCount(); return d ? d + ' due' : ''; } },
    { path: '/viz', label: 'Visualizers', icon: 'eye' },
    { section: 'Train' },
    { path: '/contest', label: 'Contest Simulator', icon: 'timer', count: () => (Store.state.activeContest ? 'LIVE' : '') },
    { path: '/playground', label: 'C++ Playground', icon: 'code' },
    { path: '/cheatsheet', label: 'Cheat Sheet & TRD', icon: 'book' },
    { path: '/tools', label: 'Tools', icon: 'tool' },
    { section: 'SEERC' },
    { path: '/seerc', label: 'About SEERC & Archive', icon: 'trophy' },
    { path: '/planner', label: 'Study Plan', icon: 'calendar' },
    { section: '' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ];

  const TITLES = {
    '/': 'Dashboard', '/roadmap': 'Roadmap', '/problems': 'Problem Bank', '/practice': 'Practice & Quizzes', '/viz': 'Visualizers',
    '/contest': 'Contest Simulator', '/playground': 'C++ Playground', '/cheatsheet': 'Cheat Sheet', '/tools': 'Tools', '/seerc': 'About SEERC',
    '/planner': 'Study Plan', '/settings': 'Settings',
  };

  const renderSidebar = () => {
    const path = Router.parse().path;
    const active = (p) => (p === '/' ? path === '/' : path.startsWith(p) || (p === '/roadmap' && path.startsWith('/topic')));
    const html = `
      <a class="brand" href="#/">
        <div class="logo">SE</div>
        <div><div class="name">SEERC Trainer</div><div class="sub">ICPC Southeastern Europe prep</div></div>
      </a>
      <nav class="nav">
        ${NAV.map((n) => {
          if (n.section !== undefined) return n.section ? `<div class="section">${n.section}</div>` : '<div style="height:8px"></div>';
          const c = n.count ? n.count() : '';
          return `<a href="#${n.path}" class="${active(n.path) ? 'active' : ''}">${UI.icon(n.icon)}<span>${n.label}</span>${c ? `<span class="count">${c}</span>` : ''}</a>`;
        }).join('')}
      </nav>
      <div class="sidebar-foot">
        <div>Progress saved locally in this browser.</div>
        <div class="mt" style="margin-top:6px">Press <span class="kbd">Ctrl</span>+<span class="kbd">K</span> to search.</div>
      </div>`;
    const sb = document.getElementById('sidebar');
    sb.innerHTML = html;
    sb.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => sb.classList.remove('open')));
  };

  const renderTopbar = () => {
    const lvl = Store.level();
    const st = Store.streak();
    const path = Router.parse().path;
    let title = TITLES[path] || '';
    if (path.startsWith('/topic/')) { const t = Topics.get(path.split('/')[2]); title = t ? t.title : 'Topic'; }
    if (path.startsWith('/viz/')) title = 'Visualizer';
    if (path.startsWith('/practice/')) title = 'Practice';
    const theme = Store.state.settings.theme;
    document.getElementById('topbar').innerHTML = `
      <button class="btn ghost icon-btn menu-btn" id="menu-btn" aria-label="Menu">${UI.icon('menu')}</button>
      <div class="topbar-title">${U.esc(title)}</div>
      <span class="spacer"></span>
      <div class="streak ${st.current ? '' : 'cold'}" title="Day streak (best ${st.best})">${UI.icon('fire', 16)} ${st.current}</div>
      <div class="xpbar" title="${lvl.xp} XP${lvl.next ? ` · ${lvl.next.xp - lvl.xp} to ${lvl.next.name}` : ''}">
        <span class="lvl" style="color:${lvl.color}">${U.esc(lvl.name)}</span>
        ${UI.progress(lvl.progress)}
        <span class="small muted mono">${lvl.xp} XP</span>
      </div>
      <button class="btn ghost icon-btn" id="search-btn" title="Search (Ctrl+K)">${UI.icon('search')}</button>
      <button class="btn ghost icon-btn" id="theme-btn" title="Toggle theme">${UI.icon(theme === 'dark' ? 'sun' : 'moon')}</button>`;
    document.getElementById('menu-btn').onclick = () => document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('theme-btn').onclick = () => { Store.setSetting('theme', theme === 'dark' ? 'light' : 'dark'); applyTheme(); renderTopbar(); };
    document.getElementById('search-btn').onclick = openSearch;
  };

  const applyTheme = () => { document.documentElement.setAttribute('data-theme', Store.state.settings.theme || 'dark'); };

  /* ---- global search ---- */
  let searchOpen = false;
  const openSearch = () => {
    if (searchOpen) return;
    searchOpen = true;
    const body = U.el(`<div><input class="input" id="gs-input" placeholder="Search topics, problems, templates, visualizers…" autocomplete="off"><div id="gs-results" class="mt col" style="gap:4px;max-height:60vh;overflow:auto"></div></div>`);
    const m = UI.modal({ title: 'Search', body, wide: true, onClose: () => { searchOpen = false; } });
    const input = body.querySelector('#gs-input');
    const results = body.querySelector('#gs-results');
    const run = () => {
      const q = input.value.trim().toLowerCase();
      if (!q) { results.innerHTML = '<div class="muted small">Type to search. Try "segment tree", "dijkstra", "CSES", "penalty".</div>'; return; }
      const items = [];
      Topics.search(q).slice(0, 6).forEach((t) => items.push({ href: `#/topic/${t.id}`, label: t.title, sub: 'Topic · ' + TIERS[t.tier].name, icon: 'book' }));
      PROBLEMS.filter((p) => p.title.toLowerCase().includes(q) || p.src.toLowerCase().includes(q) || p.topics.some((x) => x.includes(q))).slice(0, 8)
        .forEach((p) => items.push({ href: `#/problems?q=${encodeURIComponent(p.title)}`, label: p.title, sub: `Problem · ${p.src} · difficulty ${p.diff}/5`, icon: 'list' }));
      TEMPLATES.filter((t) => t.title.toLowerCase().includes(q) || (t.tags || []).some((x) => x.includes(q))).slice(0, 6)
        .forEach((t) => items.push({ href: `#/cheatsheet?item=${t.id}`, label: t.title, sub: 'Template · ' + t.cat, icon: 'code' }));
      Viz.list().filter((v) => v.title.toLowerCase().includes(q)).slice(0, 5).forEach((v) => items.push({ href: `#/viz/${v.id}`, label: v.title, sub: 'Visualizer', icon: 'eye' }));
      NAV.filter((n) => n.label && n.label.toLowerCase().includes(q)).forEach((n) => items.push({ href: '#' + n.path, label: n.label, sub: 'Page', icon: n.icon }));
      results.innerHTML = items.length ? items.map((it) => `<a class="todo-item" href="${it.href}" style="text-decoration:none;color:inherit"><div class="ico">${UI.icon(it.icon)}</div><div class="body"><b>${U.esc(it.label)}</b><span>${U.esc(it.sub)}</span></div></a>`).join('') : UI.empty('No matches');
      results.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => m.close()));
    };
    input.addEventListener('input', run);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const a = results.querySelector('a'); if (a) { a.click(); } } });
    run();
    setTimeout(() => input.focus(), 40);
  };

  /* ---- routing ---- */
  const view = () => document.getElementById('view');
  const route = (fn) => (params, query) => {
    const root = view();
    root.innerHTML = '';
    root.scrollTop = 0;
    window.scrollTo(0, 0);
    try {
      fn(root, params, query);
    } catch (e) {
      console.error(e);
      root.innerHTML = `<div class="card"><h2>Something went wrong rendering this page</h2><pre class="mono small">${U.esc(e.stack || e.message)}</pre></div>`;
    }
    MD.activate(root);
    renderSidebar();
    renderTopbar();
  };

  const init = () => {
    Store.load();
    applyTheme();
    Router.add('/', route(Pages.dashboard));
    Router.add('/roadmap', route(Pages.roadmap));
    Router.add('/topic/:id', route(Pages.topic));
    Router.add('/problems', route(Pages.problems));
    Router.add('/practice', route(Pages.practice));
    Router.add('/practice/:mode', route(Pages.practice));
    Router.add('/viz', route(Pages.visualizers));
    Router.add('/viz/:id', route(Pages.visualizers));
    Router.add('/contest', route(Pages.contest));
    Router.add('/seerc', route(Pages.seerc));
    Router.add('/cheatsheet', route(Pages.cheatsheet));
    Router.add('/tools', route(Pages.tools));
    Router.add('/playground', route(Pages.playground));
    Router.add('/planner', route(Pages.planner));
    Router.add('/settings', route(Pages.settings));
    Router.start(() => Router.go('#/'));

    Store.on((ev) => {
      if (['xp', 'topic', 'problem', 'srs', 'quiz', 'drill', 'contest', 'settings', 'import', 'reset'].includes(ev.type)) { renderTopbar(); renderSidebar(); }
    });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
    });
    // close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      const sb = document.getElementById('sidebar');
      if (sb.classList.contains('open') && !sb.contains(e.target) && !e.target.closest('#menu-btn')) sb.classList.remove('open');
    });
    Store.logActivity(0);
    Store.save();
  };

  return { init, openSearch, renderTopbar, renderSidebar };
})();

document.addEventListener('DOMContentLoaded', App.init);
