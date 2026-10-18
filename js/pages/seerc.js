/* About SEERC: format, eligibility, archive, scoring calculator, resources. */
Pages.seerc = (root, params, query) => {
  const esc = U.esc;
  const daysLeft = U.daysBetween(U.todayKey(), Store.state.settings.contestDate || SEERC.contestDate);
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  root.innerHTML = `
    <div class="card mb pad-lg">
      <div class="row between">
        <div>
          <h1 style="margin-bottom:4px">ICPC Southeastern Europe Regional Contest</h1>
          <div class="muted">The regional where teams from ${SEERC.countries.length} countries fight for World Finals and European Championship spots. ${daysLeft > 0 ? `<b>${daysLeft} days</b> until ${esc(SEERC.upcoming.edition)}.` : ''}</div>
        </div>
        <a class="btn primary" href="${SEERC.upcoming.site}" target="_blank" rel="noopener">Official site ${UI.icon('external', 14)}</a>
      </div>
    </div>
    <div class="tabs" id="seerc-tabs">
      <button data-tab="overview">Overview</button>
      <button data-tab="archive">Past contests</button>
      <button data-tab="scoring">Scoring calculator</button>
      <button data-tab="topics">What gets asked</button>
      <button data-tab="resources">Resources</button>
    </div>

    <div data-panel="overview">
      <div class="grid c2">
        <div class="card">
          <div class="card-title">${UI.icon('calendar')} ${esc(SEERC.upcoming.edition)}</div>
          <p><b>${esc(SEERC.upcoming.dates)}</b></p>
          <p>Sites:</p><ul>${SEERC.upcoming.sites.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          <p class="small muted">Registration runs through your university coach on icpc.global; the 2025 edition closed registration about three weeks before contest day. Ask your coach early.</p>
        </div>
        <div class="card">
          <div class="card-title">${UI.icon('flag')} Eligible countries</div>
          <div class="country-list">${SEERC.countries.map((c) => `<span class="badge">${esc(c)}</span>`).join('')}</div>
          <p class="small muted mt">Universities in these countries send teams to SEERC. Larger countries often run a national qualifier first; ask your coach how your university selects teams.</p>
        </div>
      </div>
      <div class="card mt">
        <div class="card-title">${UI.icon('info')} Format</div>
        <table><tbody>${SEERC.format.map(([k, v]) => `<tr><td style="width:140px"><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`).join('')}</tbody></table>
      </div>
      <div class="card mt md">
        <h3>What a realistic first SEERC looks like</h3>
        <p>Sets are built so that every team solves something and almost nobody solves everything. Roughly: 2–3 problems are approachable for any prepared team (careful implementation, greedy, simple math or graph traversal), 4–5 need a solid technique (DP, segment tree, shortest paths, number theory), and the rest are hard.</p>
        <ul>
          <li><b>Goal for a first-time team:</b> solve the 2–3 approachable problems fast, with zero or one rejected attempt, and take a serious shot at one medium problem.</li>
          <li><b>How you get there:</b> Tiers 0–1 of the roadmap completely, half of Tier 2, and at least 6 mock contests under real conditions.</li>
          <li><b>What loses teams the most:</b> reading only the first problems, wrong-answer spam without testing, and three people staring at one screen. See [[topic:contest-strategy]].</li>
        </ul>
      </div>
    </div>

    <div data-panel="archive" class="hidden">
      <div class="card">
        <p class="small muted">Every public edition. "Gym" = Codeforces Gym (virtual participation available; requires a free account). PDFs come from the ICPC archive mirror. Use "Replay" to start the simulator timer for that set.</p>
        <div class="timeline">${SEERC.years.map((y) => `<div class="card flat year-row" style="padding:12px 14px">
            <div class="yr">${y.year}</div>
            <div>
              <div><b>${esc(y.date || '')}</b>${y.sites && y.sites.length ? ` · ${esc(y.sites.join(' + '))}` : ''}${y.problems ? ` · ${y.problems} problems` : ''}</div>
              <div class="muted small">${esc(y.notes || '')}</div>
              ${y.names && y.names.length ? `<div class="tiny mt" style="margin-top:6px">${y.names.map((n, i) => `<span class="badge">${LETTERS[i]}. ${esc(n)}</span>`).join(' ')}</div>` : ''}
            </div>
            <div class="links">
              ${y.gym ? `<a class="btn small" href="${y.gym}" target="_blank" rel="noopener">Gym ${UI.icon('external', 12)}</a>` : ''}
              ${y.ucup ? `<a class="btn small" href="${y.ucup}" target="_blank" rel="noopener">Universal Cup ${UI.icon('external', 12)}</a>` : ''}
              ${y.pdf ? `<a class="btn small ghost" href="${y.pdf}" target="_blank" rel="noopener">Problems PDF</a>` : ''}
              ${y.sol ? `<a class="btn small ghost" href="${y.sol}" target="_blank" rel="noopener">Solutions PDF</a>` : ''}
              ${y.scoreboard ? `<a class="btn small ghost" href="${y.scoreboard}" target="_blank" rel="noopener">Scoreboard</a>` : ''}
              <a class="btn small primary" href="#/contest?tab=replay">Replay</a>
            </div>
          </div>`).join('')}</div>
        <div class="callout tip mt"><div class="callout-title">💡 How to use old sets</div><p>Early on, do not attempt a full 5-hour replay — pick the 3 easiest-looking problems of a set and give yourself 2 hours. Once Tier 1 is done, move to full replays. Always read the solutions PDF afterwards for the problems you did not solve.</p></div>
      </div>
    </div>

    <div data-panel="scoring" class="hidden">
      <div class="card">
        <div class="card-title">${UI.icon('trophy')} ICPC penalty calculator</div>
        <p class="small muted">Enter, for each problem you solved, the minute it was accepted and how many rejected submissions came before. Unsolved problems never add penalty — but a wrong submission on a problem you later solve costs 20 minutes.</p>
        <table class="compact" id="pen-table"><thead><tr><th>Problem</th><th>Solved?</th><th>Minute accepted</th><th>Rejected attempts</th><th>Penalty</th></tr></thead><tbody>
          ${Array.from({ length: 6 }, (_, i) => `<tr><td><b>${LETTERS[i]}</b></td><td><input type="checkbox" data-s="${i}" ${i < 3 ? 'checked' : ''}></td><td><input class="input" type="number" data-m="${i}" value="${[23, 61, 148, 200, 240, 280][i]}" min="0" max="300" style="width:90px"></td><td><input class="input" type="number" data-w="${i}" value="${[0, 1, 2, 0, 0, 0][i]}" min="0" max="20" style="width:80px"></td><td class="mono" data-p="${i}"></td></tr>`).join('')}
        </tbody></table>
        <div class="row mt" style="gap:24px"><div class="stat"><div class="num" id="pen-solved">0</div><div class="lbl">solved</div></div><div class="stat"><div class="num" id="pen-total">0</div><div class="lbl">penalty minutes</div></div></div>
        <div class="callout example mt"><div class="callout-title">🧪 Why testing beats speed</div><p>Two teams solve A, B, C. Team X submits blindly: accepted at minutes 20, 55, 130 with 1, 2, 3 rejections → penalty 20+55+130 + 20·6 = <b>325</b>. Team Y tests each solution first, losing 5 minutes per problem, no rejections: 25+60+135 = <b>220</b>. Team Y ranks higher.</p></div>
      </div>
    </div>

    <div data-panel="topics" class="hidden">
      <div class="card">
        <div class="card-title">${UI.icon('target')} Approximate topic mix of a SEERC set</div>
        <p class="small muted">Author's estimate from reading past sets (2018–2024). It is a study-priority guide, not a statistic — but the shape is stable: implementation and greedy problems exist every year, DP and graphs are the biggest technical buckets, geometry and strings are small but recurring.</p>
        ${SEERC.topicMix.map(([name, pct]) => `<div class="row" style="margin:6px 0"><div style="width:340px;max-width:50%" class="small">${esc(name)}</div><div style="flex:1">${UI.progress(pct / 25)}</div><div class="mono small" style="width:40px;text-align:right">${pct}%</div></div>`).join('')}
        <div class="callout seerc mt"><div class="callout-title">🏆 What this means for your plan</div><ul style="margin:0"><li>Every ★★★★★ topic in the roadmap covers a bucket that appears every single year.</li><li>Geometry and strings each usually contribute one problem — one good template each is enough at first.</li><li>The hardest 2–3 problems (flows, HLD, FFT, heavy math) are not where a first-time team gains rank. Skip Tier 3 until Tier 2 is solid.</li></ul></div>
      </div>
    </div>

    <div data-panel="resources" class="hidden">
      <div class="card">
        <table><tbody>${SEERC.resources.map(([n, url, d]) => `<tr><td style="white-space:nowrap"><a href="${url}" target="_blank" rel="noopener">${esc(n)} ${UI.icon('external', 12)}</a></td><td class="muted small">${esc(d)}</td></tr>`).join('')}</tbody></table>
      </div>
    </div>`;

  UI.tabs(root.querySelector('#seerc-tabs').parentElement, { initial: query.tab || 'overview' });

  const recompute = () => {
    let solved = 0, total = 0;
    for (let i = 0; i < 6; i++) {
      const on = root.querySelector(`[data-s="${i}"]`).checked;
      const m = +root.querySelector(`[data-m="${i}"]`).value || 0, w = +root.querySelector(`[data-w="${i}"]`).value || 0;
      const p = on ? m + 20 * w : 0;
      root.querySelector(`[data-p="${i}"]`).textContent = on ? `${m} + 20·${w} = ${p}` : '—';
      if (on) { solved++; total += p; }
    }
    root.querySelector('#pen-solved').textContent = solved;
    root.querySelector('#pen-total').textContent = total;
  };
  root.querySelectorAll('#pen-table input').forEach((i) => i.addEventListener('input', recompute));
  recompute();
};
