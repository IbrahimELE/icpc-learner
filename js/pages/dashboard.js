/* Dashboard: countdown, today's plan, stats, heatmap, weak spots, upsolve queue. */
Pages.dashboard = (root) => {
  const s = Store.state;
  const esc = U.esc;
  const today = U.todayKey();
  const contestDate = s.settings.contestDate || '2026-12-13';
  const daysLeft = U.daysBetween(today, contestDate);
  const weeksLeft = Math.floor(daysLeft / 7);
  const hour = new Date().getHours();
  const greet = hour < 5 ? 'Late night grind' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const name = s.settings.name ? `, ${esc(s.settings.name)}` : '';

  const rec = Topics.recommended();
  const inProgress = TOPICS.filter((t) => Store.topic(t.id).status === 'in-progress');
  const learnTopic = inProgress[0] || rec;
  const recProblems = Problems.recommended(2);
  const due = Flashcards.dueCount();
  const newCards = Flashcards.newCount();
  const lastContest = s.contests[0];
  const daysSinceContest = lastContest ? Math.floor((Date.now() - (lastContest.finishedAt || lastContest.startedAt)) / 86400000) : null;
  const suggestContest = Topics.progress(1).ratio >= 0.5 && (daysSinceContest === null || daysSinceContest >= 7) && !s.activeContest;

  const plan = [];
  if (s.activeContest) plan.push({ ico: 'timer', cls: 'warn', title: 'You have a contest running!', sub: 'The timer is still ticking. Go back and finish it.', href: '#/contest' });
  if (learnTopic) plan.push({ ico: 'book', cls: '', title: `${inProgress[0] ? 'Continue' : 'Learn'}: ${esc(learnTopic.title)}`, sub: `${TIERS[learnTopic.tier].name} · ~${learnTopic.hours}h · ${UI.stars(learnTopic.stars)}`, href: `#/topic/${learnTopic.id}` });
  recProblems.forEach((p) => plan.push({ ico: 'list', cls: 'ok', title: `Solve: ${esc(p.title)}`, sub: `${p.src} · ${UI.diff(p.diff)} · ${p.topics.map((t) => esc(Topics.get(t) ? Topics.get(t).title : t)).join(', ')}`, href: `#/problems?q=${encodeURIComponent(p.title)}` }));
  plan.push({ ico: 'brain', cls: 'purple', title: due ? `Review ${due} flashcard${due === 1 ? '' : 's'}` : newCards ? 'Learn 10 new flashcards' : 'Flashcards are all reviewed', sub: due ? 'Spaced repetition keeps formulas and complexities in your head.' : 'New cards unlock as you learn topics.', href: '#/practice/flashcards' });
  plan.push({ ico: 'target', cls: 'warn', title: 'Technique drill: 5 statements', sub: 'Read a problem, name the technique. The most important contest skill.', href: '#/practice/drills' });
  if (suggestContest) plan.push({ ico: 'timer', cls: 'warn', title: 'Weekly mock contest', sub: 'Pick a past SEERC or a mashup. 5 hours, ICPC rules.', href: '#/contest' });

  const tp = Topics.progress();
  const solved = Store.solvedCount();
  const quizStats = Object.values(s.quiz).reduce((a, q) => ({ asked: a.asked + q.asked, correct: a.correct + q.correct }), { asked: 0, correct: 0 });
  const acc = quizStats.asked ? Math.round((100 * quizStats.correct) / quizStats.asked) : null;

  // weak spots: topics with low quiz accuracy
  const weak = TOPICS.map((t) => ({ t, q: s.quiz[t.id] })).filter((x) => x.q && x.q.asked >= 3 && x.q.correct / x.q.asked < 0.7)
    .sort((a, b) => a.q.correct / a.q.asked - b.q.correct / b.q.asked).slice(0, 5);

  const tierCards = TIERS.map((tier) => { const p = Topics.progress(tier.id); return `<div class="row between small" style="margin:4px 0"><span>${esc(tier.name)}</span><span class="muted">${p.done}/${p.total}</span></div>${UI.progress(p.ratio, 'thin')}`; }).join('');

  root.innerHTML = `
    <div class="hero">
      <div class="card pad-lg greeting">
        <h1>${greet}${name} 👋</h1>
        <p class="muted">SEERC ${contestDate.slice(0, 4)} is in <b>${daysLeft}</b> days (${weeksLeft} weeks). ${daysLeft > 84 ? 'Plenty of time to build the fundamentals.' : daysLeft > 42 ? 'Time to move from learning to solving.' : daysLeft > 14 ? 'Mock contests every week from now on.' : daysLeft >= 0 ? 'Final stretch: review, rest, and stay sharp.' : 'The date has passed — update it in Settings for your next target.'}</p>
        <div class="countdown">
          <div class="unit"><b>${Math.max(0, daysLeft)}</b><span>days</span></div>
          <div class="unit"><b>${tp.done}<span class="muted" style="font-size:.9rem">/${tp.total}</span></b><span>topics</span></div>
          <div class="unit"><b>${solved}</b><span>solved</span></div>
          <div class="unit"><b>${s.contests.length}</b><span>contests</span></div>
        </div>
        <div class="mt row">
          <a class="btn primary" href="#/roadmap">${UI.icon('map', 16)} Open roadmap</a>
          <a class="btn" href="#/planner">${UI.icon('calendar', 16)} Study plan</a>
          <a class="btn" href="#/seerc">${UI.icon('trophy', 16)} What is SEERC?</a>
        </div>
      </div>
      <div class="card">
        <div class="card-title">${UI.icon('bolt')} Today's plan</div>
        <div class="todo-list">
          ${plan.map((p) => `<a class="todo-item" href="${p.href}" style="text-decoration:none;color:inherit"><div class="ico ${p.cls}">${UI.icon(p.ico)}</div><div class="body"><b>${p.title}</b><span>${p.sub}</span></div>${UI.icon('chevron', 16)}</a>`).join('')}
        </div>
      </div>
    </div>

    <div class="grid c3 mt">
      <div class="card">
        <div class="card-title">${UI.icon('fire')} Activity</div>
        <div class="row between mb"><div class="stat"><div class="num">${Store.streak().current}</div><div class="lbl">day streak</div></div><div class="stat"><div class="num">${Store.streak().best}</div><div class="lbl">best</div></div><div class="stat"><div class="num">${acc === null ? '–' : acc + '%'}</div><div class="lbl">quiz accuracy</div></div></div>
        ${UI.heatmap(s.activity, 14)}
        <div class="muted tiny mt">Each square is a day; greener = more XP earned.</div>
      </div>
      <div class="card">
        <div class="card-title">${UI.icon('map')} Roadmap progress</div>
        ${tierCards}
        <div class="mt small"><a href="#/roadmap">See all topics →</a></div>
      </div>
      <div class="card">
        <div class="card-title">${UI.icon('target')} Weak spots</div>
        ${weak.length ? `<ul class="weak-list" style="list-style:none;padding:0;margin:0">${weak.map((w) => `<li><a href="#/topic/${w.t.id}">${esc(w.t.title)}</a><span class="muted">${Math.round((100 * w.q.correct) / w.q.asked)}% on ${w.q.asked} q</span></li>`).join('')}</ul><div class="small muted mt">Re-read the lesson, then retake the quiz.</div>`
          : `<div class="muted small">No weak spots detected yet. Take topic quizzes and technique drills; anything under 70% shows up here.</div>`}
        <div class="mt small">Drills: ${s.drills.asked ? `${Math.round((100 * s.drills.correct) / s.drills.asked)}% of ${s.drills.asked}` : 'not started'} · <a href="#/practice/drills">practice</a></div>
      </div>
    </div>

    <div class="grid c2 mt">
      <div class="card">
        <div class="card-title">${UI.icon('flag')} Upsolve queue <span class="muted small">(unsolved from your mock contests)</span></div>
        ${s.upsolve.length ? `<div class="col" style="gap:6px">${s.upsolve.slice(0, 8).map((u) => `<div class="row between" style="padding:6px 0;border-bottom:1px dashed var(--border)"><div><a href="${esc(u.url)}" target="_blank" rel="noopener">${esc(u.title)}</a><div class="muted tiny">${esc(u.from)}</div></div><button class="btn tiny ghost" data-upsolve-done="${esc(u.url)}">Solved ✓</button></div>`).join('')}</div>`
          : `<div class="muted small">Empty. After each mock contest, unsolved problems land here. Upsolving (solving them afterwards with the editorial) is where most improvement comes from.</div>`}
      </div>
      <div class="card">
        <div class="card-title">${UI.icon('timer')} Recent contests</div>
        ${s.contests.length ? `<table class="compact"><thead><tr><th>Contest</th><th>Solved</th><th>Penalty</th><th>When</th></tr></thead><tbody>${s.contests.slice(0, 5).map((c) => `<tr><td>${esc(c.name)}</td><td><b>${c.problems.filter((p) => p.status === 'solved').length}</b>/${c.problems.length}</td><td class="mono">${c.penalty || 0}</td><td class="muted small">${new Date(c.finishedAt || c.startedAt).toLocaleDateString()}</td></tr>`).join('')}</tbody></table>`
          : `<div class="muted small">No contests yet. A mock contest every week is the single best predictor of SEERC performance. <a href="#/contest">Start one</a> once you have finished most of Tier 1.</div>`}
      </div>
    </div>

    <div class="card mt">
      <div class="card-title">${UI.icon('bolt')} Quick links</div>
      <div class="quick-links">
        <a href="#/viz">${UI.icon('eye')} Algorithm visualizers</a>
        <a href="#/playground">${UI.icon('code')} Run C++ code</a>
        <a href="#/cheatsheet">${UI.icon('book')} Templates & Team Reference Doc</a>
        <a href="#/tools">${UI.icon('tool')} Complexity calculator</a>
        <a href="#/practice/quiz">${UI.icon('brain')} Random quiz</a>
        <a href="#/problems?random=1">${UI.icon('dice')} Random problem</a>
        <a href="#/seerc?tab=archive">${UI.icon('archive')} Past SEERC problem sets</a>
        <a href="#/topic/contest-strategy">${UI.icon('trophy')} Team strategy guide</a>
      </div>
    </div>`;

  U.on(root, 'click', '[data-upsolve-done]', (e, btn) => {
    Store.removeUpsolve(btn.dataset.upsolveDone);
    Store.addXP(40, 'upsolved a contest problem');
    Pages.dashboard(root);
  });
};
