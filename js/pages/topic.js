/* Topic page: lesson (markdown), problems, quiz, flashcards, notes. */
Pages.topic = (root, params, query) => {
  const esc = U.esc;
  const t = Topics.get(params.id);
  if (!t) { root.innerHTML = UI.empty('Topic not found') + '<p class="center"><a href="#/roadmap">Back to roadmap</a></p>'; return; }
  const lesson = LESSONS[t.id] || { md: '_Lesson content coming soon._' };
  const st = Store.topic(t.id).status;
  if (!st) Store.setTopicStatus(t.id, 'in-progress');

  const probs = Problems.forTopic(t.id);
  const quiz = QUIZ[t.id] || [];
  const cards = FLASHCARDS.filter((c) => c.topic === t.id);
  const vizList = (t.viz || []).map((id) => Viz.get(id)).filter(Boolean);
  const prev = Topics.prev(t.id), next = Topics.next(t.id);
  const relatedTemplates = TEMPLATES.filter((x) => x.topic === t.id);

  // table of contents from headings
  const lessonHtml = MD.render(lesson.md);
  const tmp = document.createElement('div');
  tmp.innerHTML = lessonHtml;
  const heads = Array.from(tmp.querySelectorAll('h2, h3'));
  heads.forEach((h, i) => (h.id = 'sec-' + i));
  const toc = heads.map((h, i) => `<a href="#/topic/${t.id}?sec=${i}" class="${h.tagName === 'H3' ? 'h3' : ''}" data-sec="sec-${i}">${esc(h.textContent)}</a>`).join('');

  root.innerHTML = `
    <div class="topic-head">
      <div style="flex:1;min-width:0">
        <div class="row small muted" style="margin-bottom:6px">${UI.tierBadge(t.tier)}<span class="badge" style="border-color:${CATS[t.cat].color};color:${CATS[t.cat].color}">${esc(CATS[t.cat].name)}</span>${UI.stars(t.stars)}<span>~${t.hours}h</span></div>
        <h1>${esc(t.title)}</h1>
        <p class="muted">${esc(t.summary)}</p>
        <div class="meta">${t.prereqs.length ? `Prerequisites: ${t.prereqs.map((p) => `<a href="#/topic/${p}">${esc(Topics.get(p).title)}</a>${Topics.learned(p) ? ' ✓' : ''}`).join(' · ')}` : 'No prerequisites.'}</div>
      </div>
      <div class="col" style="align-items:flex-end">
        <button class="btn ${Topics.learned(t.id) ? 'ok' : 'primary'}" id="mark-learned">${Topics.learned(t.id) ? '✓ Learned' : 'Mark as learned (+25 XP)'}</button>
        ${vizList.map((v) => `<a class="btn small" href="#/viz/${v.id}">${UI.icon('eye', 14)} ${esc(v.title)}</a>`).join('')}
      </div>
    </div>

    <div class="tabs" id="topic-tabs">
      <button data-tab="learn">Learn</button>
      <button data-tab="problems">Problems <span class="count">${probs.length}</span></button>
      <button data-tab="quiz">Quiz <span class="count">${quiz.length}</span></button>
      <button data-tab="cards">Flashcards <span class="count">${cards.length}</span></button>
      ${relatedTemplates.length ? `<button data-tab="code">Templates <span class="count">${relatedTemplates.length}</span></button>` : ''}
      <button data-tab="notes">My notes</button>
    </div>

    <div data-panel="learn">
      <div class="lesson-layout">
        <div class="card md" id="lesson-body">${tmp.innerHTML}</div>
        <aside class="toc card flat" style="padding:0">${toc ? `<div class="muted tiny" style="padding:0 0 6px 10px;text-transform:uppercase;letter-spacing:.08em;font-weight:600">On this page</div>${toc}` : ''}</aside>
      </div>
      <div class="topic-nav">
        ${prev ? `<a class="btn" href="#/topic/${prev.id}">${UI.icon('arrowLeft', 16)} ${esc(prev.title)}</a>` : '<span></span>'}
        ${next ? `<a class="btn" href="#/topic/${next.id}">${esc(next.title)} ${UI.icon('arrowRight', 16)}</a>` : '<span></span>'}
      </div>
    </div>

    <div data-panel="problems" class="hidden">
      <div class="card">
        <p class="muted small">Ordered by difficulty. Click the box to cycle status (to do → attempted → solved). Use hints only after 20+ minutes of real thinking — that is where learning happens.</p>
        <div class="problem-list" id="topic-problems">${probs.length ? probs.map((p) => Problems.rowHtml(p)).join('') : UI.empty('No problems linked to this topic yet')}</div>
      </div>
    </div>

    <div data-panel="quiz" class="hidden"><div id="topic-quiz"></div></div>
    <div data-panel="cards" class="hidden"><div id="topic-cards"></div></div>
    ${relatedTemplates.length ? `<div data-panel="code" class="hidden"><div class="card md">${relatedTemplates.map((x) => `<h3>${esc(x.title)}</h3><p class="muted small">${esc(x.desc)}</p>${MD.codeBlock(x.code, x.lang || 'cpp', x.title)}`).join('')}</div></div>` : ''}

    <div data-panel="notes" class="hidden">
      <div class="card">
        <p class="muted small">Your own notes for this topic (saved automatically in this browser). Write the idea in your own words — it sticks better.</p>
        <textarea class="input notes-area" id="topic-notes" placeholder="e.g. Segment tree: think 'array of nodes, node i covers [l,r], children 2i and 2i+1'. Pitfall: size must be 4n...">${esc(Store.topic(t.id).notes || '')}</textarea>
      </div>
    </div>`;

  const tabs = UI.tabs(root.querySelector('#topic-tabs').parentElement, {
    initial: query.tab || 'learn',
    onChange: (name) => {
      if (name === 'quiz') Practice.mountQuiz(root.querySelector('#topic-quiz'), { topic: t.id });
      if (name === 'cards') Practice.mountFlashcards(root.querySelector('#topic-cards'), { topic: t.id });
    },
  });

  root.querySelector('#mark-learned').addEventListener('click', () => {
    if (Topics.learned(t.id)) { Store.setTopicStatus(t.id, 'in-progress'); }
    else { Store.setTopicStatus(t.id, 'learned'); }
    Pages.topic(root, params, query);
  });
  root.querySelector('#topic-notes').addEventListener('input', U.debounce((e) => Store.setTopicNotes(t.id, e.target.value), 400));

  // TOC smooth scroll
  U.on(root, 'click', '.toc a', (e, a) => {
    e.preventDefault();
    const el = root.querySelector('#' + a.dataset.sec);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  if (query.sec !== undefined) setTimeout(() => { const el = root.querySelector('#sec-' + query.sec); if (el) el.scrollIntoView(); }, 50);

  Problems.bindList(root.querySelector('#topic-problems'));
};
