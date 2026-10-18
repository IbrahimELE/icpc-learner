/* Contest simulator: ICPC rules (solved count, then penalty time), timer, balloons, upsolve queue. */
Pages.contest = (root, params, query) => {
  const esc = U.esc;
  const s = Store.state;
  let tick = null;
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const BALLOON_COLORS = ['#f85149', '#6ea8fe', '#3fb950', '#d29922', '#bc8cff', '#39c5bb', '#f0883e', '#ff7b72', '#79c0ff', '#56d364', '#e3b341', '#d2a8ff', '#ffa657'];

  const elapsedMs = (c) => (c.finishedAt || Date.now()) - c.startedAt - (c.pausedTotal || 0) - (c.paused ? Date.now() - c.pausedAt : 0);
  const penaltyOf = (c) => c.problems.filter((p) => p.status === 'solved').reduce((sum, p) => sum + p.solvedAt + (c.penaltyPerWrong || 20) * p.attempts, 0);

  /* ---------------- setup ---------------- */
  const renderSetup = () => {
    const learnedTopics = TOPICS.filter((t) => Topics.learned(t.id)).map((t) => t.id);
    const years = SEERC.years;
    root.innerHTML = `
      <div class="card mb"><h1 style="margin-bottom:2px">Contest simulator</h1><div class="muted small">ICPC rules: teams are ranked by problems solved, ties broken by penalty time (minutes to each accepted solution + ${20} per rejected attempt on solved problems). One computer, 5 hours, no internet except the judge. Practice exactly like that.</div></div>
      <div class="tabs" id="setup-tabs"><button data-tab="replay">Replay a past SEERC</button><button data-tab="mashup">Mashup from problem bank</button><button data-tab="custom">Custom set</button></div>

      <div data-panel="replay" class="card">
        <p class="small muted">Pick a year. The problems open on the external judge (Codeforces Gym / Universal Cup); you track attempts and solves here. Note: gym contests need a Codeforces account; use "virtual participation" there if you prefer, and keep this timer as your team scoreboard.</p>
        <div class="inline-fields">
          <label class="field"><span>Year</span><select class="input" id="rp-year">${years.map((y) => `<option value="${y.year}">SEERC ${y.year} · ${y.problems || '~12'} problems${y.gym ? '' : y.ucup ? ' (Universal Cup)' : ' (no public judge yet)'}</option>`).join('')}</select></label>
          <label class="field"><span>Duration (min)</span><input class="input" type="number" id="rp-dur" value="300" min="30" max="600" style="width:110px"></label>
          <label class="field"><span>Problems</span><input class="input" type="number" id="rp-n" value="${years[0].problems || 12}" min="1" max="26" style="width:90px"></label>
        </div>
        <div id="rp-info" class="mt small muted"></div>
        <div class="mt"><button class="btn primary" id="rp-start">${UI.icon('play', 16)} Start replay</button></div>
      </div>

      <div data-panel="mashup" class="card hidden">
        <p class="small muted">A random set from the problem bank (unsolved problems only). Choose difficulty spread and whether to restrict to topics you have learned.</p>
        <div class="inline-fields">
          <label class="field"><span>Problems</span><input class="input" type="number" id="mu-n" value="6" min="3" max="13" style="width:90px"></label>
          <label class="field"><span>Duration (min)</span><input class="input" type="number" id="mu-dur" value="180" min="30" max="600" style="width:110px"></label>
          <label class="field"><span>Min difficulty</span><select class="input" id="mu-min">${[1, 2, 3, 4, 5].map((d) => `<option value="${d}" ${d === 1 ? 'selected' : ''}>${d}</option>`).join('')}</select></label>
          <label class="field"><span>Max difficulty</span><select class="input" id="mu-max">${[1, 2, 3, 4, 5].map((d) => `<option value="${d}" ${d === 3 ? 'selected' : ''}>${d}</option>`).join('')}</select></label>
          <label class="checkbox small"><input type="checkbox" id="mu-learned" ${learnedTopics.length >= 3 ? 'checked' : ''}> Only topics I have learned (${learnedTopics.length})</label>
        </div>
        <div class="mt"><button class="btn primary" id="mu-start">${UI.icon('play', 16)} Generate & start</button></div>
      </div>

      <div data-panel="custom" class="card hidden">
        <p class="small muted">Paste problems, one per line, as <code>Title | URL</code> (URL optional). Good for running a friend's set or a Codeforces virtual contest with this scoreboard.</p>
        <textarea class="input" id="cu-list" rows="7" placeholder="A. Watermelon | https://codeforces.com/problemset/problem/4/A&#10;B. Way Too Long Words | https://codeforces.com/problemset/problem/71/A"></textarea>
        <div class="inline-fields mt"><label class="field"><span>Name</span><input class="input" id="cu-name" value="Custom contest" style="width:220px"></label><label class="field"><span>Duration (min)</span><input class="input" type="number" id="cu-dur" value="120" min="30" max="600" style="width:110px"></label></div>
        <div class="mt"><button class="btn primary" id="cu-start">${UI.icon('play', 16)} Start</button></div>
      </div>

      <div class="card mt">
        <div class="card-title">${UI.icon('trophy')} History</div>
        ${s.contests.length ? `<table class="compact"><thead><tr><th>Contest</th><th>Solved</th><th>Penalty</th><th>Duration</th><th>Date</th><th></th></tr></thead><tbody>${s.contests.map((c, i) => `<tr><td>${esc(c.name)}</td><td><b>${c.problems.filter((p) => p.status === 'solved').length}</b> / ${c.problems.length}</td><td class="mono">${c.penalty}</td><td>${U.fmtMin(c.durationMin)}</td><td class="muted small">${new Date(c.finishedAt || c.startedAt).toLocaleString()}</td><td><button class="btn tiny ghost" data-detail="${i}">details</button></td></tr>`).join('')}</tbody></table>` : '<div class="muted small">No contests yet.</div>'}
      </div>

      <div class="card mt md">
        <h3>How to get the most out of a mock contest</h3>
        <ul>
          <li><b>Read every problem</b> in the first 20–30 minutes and write a one-line summary of each. Solo, this is your "team reading".</li>
          <li><b>Solve easiest first.</b> Sort by your gut difficulty, not by letter. ICPC sets are shuffled.</li>
          <li><b>Log every wrong attempt honestly</b> — the 20-minute penalty is what teaches you to test before submitting.</li>
          <li><b>Do not pause.</b> Bathroom breaks happen at real contests too; the clock keeps running.</li>
          <li><b>Upsolve afterwards.</b> Every unsolved problem lands in your upsolve queue on the dashboard. Read the editorial, then code it from scratch.</li>
        </ul>
      </div>`;

    UI.tabs(root.querySelector('#setup-tabs').parentElement, { initial: query.tab || 'replay' });

    const yearSel = root.querySelector('#rp-year');
    const rpInfo = () => {
      const y = years.find((x) => String(x.year) === yearSel.value);
      root.querySelector('#rp-n').value = y.problems || 12;
      root.querySelector('#rp-info').innerHTML = `${esc(y.date || '')}${y.sites ? ' · ' + esc(y.sites.join(' + ')) : ''}. ${y.gym ? `<a href="${y.gym}" target="_blank" rel="noopener">Open Codeforces Gym ↗</a>` : ''} ${y.ucup ? `<a href="${y.ucup}" target="_blank" rel="noopener">Open on Universal Cup ↗</a>` : ''} ${y.pdf ? `<a href="${y.pdf}" target="_blank" rel="noopener">Problems PDF ↗</a>` : ''}${y.names && y.names.length ? `<div class="mt tiny">Problems: ${y.names.map((n, i) => `${LETTERS[i]}. ${esc(n)}`).join(' · ')}</div>` : ''}`;
    };
    yearSel.addEventListener('change', rpInfo); rpInfo();

    root.querySelector('#rp-start').addEventListener('click', () => {
      const y = years.find((x) => String(x.year) === yearSel.value);
      const n = U.clamp(+root.querySelector('#rp-n').value || 12, 1, 26);
      const url = y.gym || y.ucup || '';
      const problems = Array.from({ length: n }, (_, i) => ({ letter: LETTERS[i], title: (y.names && y.names[i]) || `Problem ${LETTERS[i]}`, url: y.gym ? `${y.gym}/problem/${LETTERS[i]}` : url, status: null, attempts: 0, solvedAt: null, note: '' }));
      start({ name: `SEERC ${y.year} replay`, mode: 'replay', durationMin: +root.querySelector('#rp-dur').value || 300, problems, link: url });
    });

    root.querySelector('#mu-start').addEventListener('click', () => {
      const n = U.clamp(+root.querySelector('#mu-n').value || 6, 3, 13);
      const lo = +root.querySelector('#mu-min').value, hi = Math.max(lo, +root.querySelector('#mu-max').value);
      const onlyLearned = root.querySelector('#mu-learned').checked;
      let pool = PROBLEMS.filter((p) => p.diff >= lo && p.diff <= hi && Store.problem(p.id).status !== 'solved');
      if (onlyLearned && learnedTopics.length) pool = pool.filter((p) => p.topics.every((t) => learnedTopics.includes(t)));
      if (pool.length < n) { UI.toast(`Only ${pool.length} matching problems — widen the filters`, 'error'); return; }
      // spread difficulties: sort chosen by difficulty
      const chosen = U.shuffle(pool).slice(0, n).sort((a, b) => a.diff - b.diff);
      const problems = chosen.map((p, i) => ({ letter: LETTERS[i], title: p.title, url: p.url, pid: p.id, diff: p.diff, status: null, attempts: 0, solvedAt: null, note: '' }));
      start({ name: `Mashup (${n} problems, diff ${lo}–${hi})`, mode: 'mashup', durationMin: +root.querySelector('#mu-dur').value || 180, problems });
    });

    root.querySelector('#cu-start').addEventListener('click', () => {
      const lines = root.querySelector('#cu-list').value.split('\n').map((l) => l.trim()).filter(Boolean);
      if (!lines.length) { UI.toast('Paste at least one problem', 'error'); return; }
      const problems = lines.slice(0, 26).map((l, i) => { const [title, url] = l.split('|').map((x) => (x || '').trim()); return { letter: LETTERS[i], title: title || `Problem ${LETTERS[i]}`, url: url || '', status: null, attempts: 0, solvedAt: null, note: '' }; });
      start({ name: root.querySelector('#cu-name').value || 'Custom contest', mode: 'custom', durationMin: +root.querySelector('#cu-dur').value || 120, problems });
    });

    U.on(root, 'click', '[data-detail]', (e, b) => showSummary(s.contests[+b.dataset.detail], false));
  };

  const start = (partial) => {
    const c = Object.assign({ id: U.uid(), startedAt: Date.now(), paused: false, pausedAt: null, pausedTotal: 0, finishedAt: null, penaltyPerWrong: 20 }, partial);
    Store.startContest(c);
    UI.toast('Contest started. Good luck!', 'success');
    renderRunning();
  };

  /* ---------------- running ---------------- */
  const renderRunning = () => {
    const c = s.activeContest;
    if (!c) return renderSetup();
    const total = c.durationMin * 60000;
    root.innerHTML = `
      <div class="card">
        <div class="contest-top">
          <div>
            <h2 style="margin:0">${esc(c.name)}</h2>
            <div class="muted small">${c.problems.length} problems · ${U.fmtMin(c.durationMin)} · penalty ${c.penaltyPerWrong} min/rejection${c.link ? ` · <a href="${esc(c.link)}" target="_blank" rel="noopener">open judge ↗</a>` : ''}</div>
            <div class="balloons mt" id="balloons"></div>
          </div>
          <div>
            <div class="contest-timer" id="timer">0:00:00</div>
            <div class="center muted small" id="timer-sub"></div>
            ${UI.progress(0, 'thin')}
          </div>
          <div class="col" style="align-items:flex-end">
            <div class="stat right"><div class="num" id="solved-num">0</div><div class="lbl">solved</div></div>
            <div class="stat right"><div class="num" id="pen-num" style="font-size:1.2rem">0</div><div class="lbl">penalty</div></div>
          </div>
        </div>
      </div>
      <div class="grid c2 mt" style="grid-template-columns: minmax(0,1.5fr) minmax(0,1fr)">
        <div class="card">
          <div class="card-title">${UI.icon('list')} Problems</div>
          <div class="contest-problems" id="cp-list"></div>
        </div>
        <div class="col">
          <div class="card">
            <div class="card-title">${UI.icon('trophy')} Scoreboard preview</div>
            <div id="board"></div>
            <div class="muted tiny mt">ICPC ranking: more solved wins; equal solved → lower penalty wins. Penalty for a solved problem = minute of acceptance + ${c.penaltyPerWrong} × rejected attempts on it. Unsolved problems cost nothing.</div>
          </div>
          <div class="card">
            <div class="card-title">${UI.icon('flag')} Controls</div>
            <div class="row">
              <button class="btn" id="pause-btn">${c.paused ? '▶ Resume' : '⏸ Pause'}</button>
              <button class="btn danger" id="end-btn">End contest</button>
              <button class="btn ghost" id="abort-btn">Abort (discard)</button>
            </div>
            <div class="muted tiny mt">Real ICPC contests never pause. Use it only for emergencies.</div>
          </div>
          <div class="card md small">
            <b>Solo-team checklist</b>
            <ul style="margin:6px 0 0"><li>Minute 0–25: read everything, note ideas.</li><li>Before each submit: re-read output format, test samples + one edge case.</li><li>Stuck 40+ min? Switch problems. Come back later.</li><li>Last 60 min (frozen scoreboard in real ICPC): only finish what is nearly done.</li></ul>
          </div>
        </div>
      </div>`;

    const listEl = root.querySelector('#cp-list');
    const renderProblems = () => {
      const solvedIdx = c.problems.filter((p) => p.status === 'solved').sort((a, b) => a.solvedAt - b.solvedAt);
      root.querySelector('#balloons').innerHTML = solvedIdx.map((p) => `<span class="balloon" style="background:${BALLOON_COLORS[LETTERS.indexOf(p.letter) % BALLOON_COLORS.length]}" title="${p.letter} solved at ${p.solvedAt} min"></span>`).join('') || '<span class="muted tiny">Balloons appear here for each accepted problem 🎈</span>';
      listEl.innerHTML = c.problems.map((p) => `<div class="cp-row ${p.status || ''}" data-letter="${p.letter}">
          <div class="letter">${p.letter}</div>
          <div><div style="font-weight:600">${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)} ${UI.icon('external', 12)}</a>` : esc(p.title)}${p.diff ? ' ' + UI.diffDots(p.diff) : ''}</div>
            <div class="row small" style="gap:8px">${p.status === 'solved' ? `<span class="solve-time">AC @ ${p.solvedAt} min</span>` : ''}${p.attempts ? `<span class="tries">${p.attempts} rejected</span>` : ''}<input class="input" data-note="${p.letter}" placeholder="idea / notes…" value="${esc(p.note || '')}" style="padding:3px 8px;font-size:.8rem;flex:1;min-width:120px"></div></div>
          <div class="cp-actions row" style="gap:6px">
            ${p.status === 'solved' ? `<button class="btn tiny ghost" data-undo="${p.letter}">undo</button>` : `<button class="btn small danger ghost" data-wrong="${p.letter}" title="Log a rejected submission (WA/TLE/RE)">✗ Rejected</button><button class="btn small ok" data-solve="${p.letter}">✓ Accepted</button>`}
          </div>
        </div>`).join('');
      const solved = c.problems.filter((p) => p.status === 'solved').length;
      root.querySelector('#solved-num').textContent = solved;
      root.querySelector('#pen-num').textContent = penaltyOf(c);
      renderBoard();
    };
    const renderBoard = () => {
      // fake reference rows to make the ranking concrete (targets, not real SEERC data)
      const you = { name: 'You', solved: c.problems.filter((p) => p.status === 'solved').length, pen: penaltyOf(c) };
      const refs = [
        { name: 'Top team target', solved: Math.min(c.problems.length, Math.max(you.solved + 3, Math.round(c.problems.length * 0.75))), pen: 900 },
        { name: 'Solid mid-table target', solved: Math.min(c.problems.length, Math.max(you.solved + 1, Math.round(c.problems.length * 0.45))), pen: 600 },
        { name: 'First-timer target', solved: Math.min(c.problems.length, Math.max(2, Math.round(c.problems.length * 0.25))), pen: 350 },
      ];
      const rows = [...refs, you].sort((a, b) => b.solved - a.solved || a.pen - b.pen);
      root.querySelector('#board').innerHTML = `<div class="scoreboard-row muted tiny"><span>#</span><span>Team</span><span>Solved</span><span>Penalty</span></div>${rows.map((r, i) => `<div class="scoreboard-row ${r === you ? 'you' : ''}"><span>${i + 1}</span><span>${esc(r.name)}</span><span>${r.solved}</span><span class="mono">${r.pen}</span></div>`).join('')}`;
    };
    const minuteNow = () => Math.floor(elapsedMs(c) / 60000);

    U.on(listEl, 'click', '[data-wrong]', (e, b) => { const p = c.problems.find((x) => x.letter === b.dataset.wrong); p.attempts++; Store.updateContest(c); renderProblems(); UI.toast(`${p.letter}: rejected (+${c.penaltyPerWrong} min if solved later)`, 'error', 1500); });
    U.on(listEl, 'click', '[data-solve]', (e, b) => { const p = c.problems.find((x) => x.letter === b.dataset.solve); p.status = 'solved'; p.solvedAt = minuteNow(); Store.updateContest(c); renderProblems(); UI.toast(`${p.letter} accepted! 🎈`, 'success'); });
    U.on(listEl, 'click', '[data-undo]', (e, b) => { const p = c.problems.find((x) => x.letter === b.dataset.undo); p.status = null; p.solvedAt = null; Store.updateContest(c); renderProblems(); });
    U.on(listEl, 'input', '[data-note]', (e, inp) => { const p = c.problems.find((x) => x.letter === inp.dataset.note); p.note = inp.value; Store.updateContest(c); });

    root.querySelector('#pause-btn').addEventListener('click', () => {
      if (c.paused) { c.pausedTotal += Date.now() - c.pausedAt; c.paused = false; c.pausedAt = null; }
      else { c.paused = true; c.pausedAt = Date.now(); }
      Store.updateContest(c);
      root.querySelector('#pause-btn').textContent = c.paused ? '▶ Resume' : '⏸ Pause';
    });
    root.querySelector('#end-btn').addEventListener('click', async () => { if (await UI.confirm('End the contest now? Unsolved problems go to your upsolve queue.', { okLabel: 'End contest' })) finish(c); });
    root.querySelector('#abort-btn').addEventListener('click', async () => { if (await UI.confirm('Abort and discard this contest? Nothing will be saved.', { okLabel: 'Discard', danger: true })) { stopTick(); Store.abortContest(); renderSetup(); } });

    const timerEl = root.querySelector('#timer'), sub = root.querySelector('#timer-sub'), bar = root.querySelector('.progress .bar');
    const update = () => {
      if (!root.isConnected || !s.activeContest) { stopTick(); return; }
      const el = elapsedMs(c);
      const left = total - el;
      timerEl.textContent = U.fmtClock(Math.max(0, left));
      timerEl.className = 'contest-timer' + (left < 10 * 60000 ? ' danger' : left < 30 * 60000 ? ' warn' : '');
      sub.textContent = c.paused ? 'PAUSED' : `elapsed ${U.fmtClock(el)}${left < 60 * 60000 && left > 0 ? ' · scoreboard would be frozen now' : ''}`;
      bar.style.width = U.clamp((100 * el) / total, 0, 100) + '%';
      if (left <= 0 && !c.paused) { finish(c, true); }
    };
    stopTick();
    tick = setInterval(update, 500);
    update();
    renderProblems();
  };

  const stopTick = () => { if (tick) { clearInterval(tick); tick = null; } };

  const finish = (c, timeUp = false) => {
    stopTick();
    c.finishedAt = Date.now();
    c.penalty = penaltyOf(c);
    c.solvedCount = c.problems.filter((p) => p.status === 'solved').length;
    // mark bank problems solved
    c.problems.forEach((p) => { if (p.pid && p.status === 'solved' && Store.problem(p.pid).status !== 'solved') Store.setProblemStatus(p.pid, 'solved', p.diff || 2); else if (p.pid && p.status !== 'solved' && p.attempts && !Store.problem(p.pid).status) Store.setProblemStatus(p.pid, 'attempted', p.diff || 2); });
    Store.finishContest(c);
    showSummary(c, true, timeUp);
    renderSetup();
  };

  const showSummary = (c, fresh, timeUp = false) => {
    const solved = c.problems.filter((p) => p.status === 'solved').sort((a, b) => a.solvedAt - b.solvedAt);
    const unsolved = c.problems.filter((p) => p.status !== 'solved');
    UI.modal({
      title: `${fresh ? (timeUp ? '⏰ Time is up — ' : '🏁 ') : ''}${c.name}`,
      wide: true,
      body: `<div class="row" style="gap:24px;justify-content:center;margin-bottom:12px">
          <div class="stat center"><div class="num">${solved.length}<span class="muted" style="font-size:1rem">/${c.problems.length}</span></div><div class="lbl">solved</div></div>
          <div class="stat center"><div class="num">${c.penalty}</div><div class="lbl">penalty</div></div>
          <div class="stat center"><div class="num">${U.fmtMin(c.durationMin)}</div><div class="lbl">duration</div></div>
        </div>
        ${solved.length ? `<h4>Accepted</h4><table class="compact"><thead><tr><th>#</th><th>Problem</th><th>Minute</th><th>Rejected</th></tr></thead><tbody>${solved.map((p) => `<tr><td>${p.letter}</td><td>${esc(p.title)}</td><td class="mono">${p.solvedAt}</td><td>${p.attempts || ''}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">No accepted problems this time. That happens — the upsolve is where the value is.</p>'}
        ${unsolved.length ? `<h4 class="mt">To upsolve</h4><ul>${unsolved.map((p) => `<li>${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${p.letter}. ${esc(p.title)}</a>` : `${p.letter}. ${esc(p.title)}`}${p.attempts ? ` <span class="muted small">(${p.attempts} rejected)</span>` : ''}${p.note ? ` <span class="muted small">— ${esc(p.note)}</span>` : ''}</li>`).join('')}</ul>` : ''}
        <div class="callout tip"><div class="callout-title">💡 Debrief (2 minutes, write it down)</div><ol style="margin:0"><li>Which problem should you have skipped earlier?</li><li>What caused each rejected attempt — logic, edge case, overflow, or output format?</li><li>Which unsolved problem was actually within reach?</li></ol></div>`,
      actions: [{ label: 'Close', cls: 'primary' }],
    });
  };

  if (s.activeContest) renderRunning(); else renderSetup();
};
