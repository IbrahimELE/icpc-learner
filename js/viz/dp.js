/* Visualizers — dynamic programming: knapsack, LCS, LIS, bitmask TSP, convex hull trick, Grundy numbers. */
(() => {
  const D = Viz.draw, snap = Viz.snap;
  const randArr = (rng, n, lo, hi) => Array.from({ length: n }, () => lo + Math.floor(rng() * (hi - lo + 1)));

  /* ---------------- 0/1 knapsack ---------------- */
  Viz.register({
    id: 'knapsack', title: '0/1 Knapsack Table', topic: 'dp-1', cat: 'dp',
    desc: 'dp[i][w] = best value using the first i items with capacity w. Each cell looks up-left (take) or up (skip).',
    params: [{ key: 'n', label: 'Items', type: 'number', min: 3, max: 6, def: 4 }, { key: 'W', label: 'Capacity', type: 'number', min: 5, max: 14, def: 9 }],
    code: ['for (int i = 1; i <= n; i++)', '    for (int w = 0; w <= W; w++) {', '        dp[i][w] = dp[i-1][w];                       // skip item i', '        if (w >= wt[i]) dp[i][w] = max(dp[i][w], dp[i-1][w - wt[i]] + val[i]);   // take it', '    }'],
    build(p, rng) {
      const n = p.n, W = p.W; const wt = randArr(rng, n, 1, Math.max(2, Math.floor(W / 2))), val = randArr(rng, n, 1, 9);
      const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(null)); for (let w = 0; w <= W; w++) dp[0][w] = 0;
      const frames = []; const F = (line, extra, text) => frames.push({ line, dp: snap(dp), ...extra, text });
      F(0, { cur: null }, `Items (weight, value): ${wt.map((w, i) => `(${w},${val[i]})`).join(' ')}. Row 0 = no items → value 0.`);
      for (let i = 1; i <= n; i++) for (let w = 0; w <= W; w++) {
        const skip = dp[i - 1][w]; let take = null;
        if (w >= wt[i - 1]) take = dp[i - 1][w - wt[i - 1]] + val[i - 1];
        dp[i][w] = take !== null ? Math.max(skip, take) : skip;
        const from = take !== null && take >= skip ? [i - 1, w - wt[i - 1]] : [i - 1, w];
        if (w % 2 === 0 || w === W || take !== null && take > skip) F(take !== null ? 3 : 2, { cur: [i, w], from, took: take !== null && take >= skip }, `dp[${i}][${w}]: skip → ${skip}${take !== null ? `, take item ${i} (w=${wt[i - 1]}, v=${val[i - 1]}) → ${take}` : ' (item too heavy)'} ⇒ ${dp[i][w]}.`);
      }
      // reconstruct
      const chosen = []; let w = W; for (let i = n; i >= 1; i--) if (dp[i][w] !== dp[i - 1][w]) { chosen.push(i); w -= wt[i - 1]; }
      F(4, { cur: [n, W], chosen: chosen.reverse(), done: true }, `Best value **${dp[n][W]}** with items ${chosen.join(', ')} (walk back: a change between rows means the item was taken).`);
      return { frames, height: Math.max(260, (n + 2) * 34 + 40), draw: (ctx, f, W2, H, T) => {
        const cell = Math.min(34, (W2 - 80) / (W + 2));
        D.table(ctx, f.dp, 20, 20, cell, T, { rowHead: Array.from({ length: n + 1 }, (_, i) => (i ? `i${i}` : 'i0')), colHead: Array.from({ length: W + 1 }, (_, w) => w), style: (r, c) => (f.cur && f.cur[0] === r && f.cur[1] === c ? { fill: T.accent, color: '#fff' } : f.from && f.from[0] === r && f.from[1] === c ? { fill: f.took ? T.ok : T.warn, color: '#fff' } : f.dp[r][c] === null ? { fill: T.bg } : {}) });
        D.text(ctx, 'items: ' + wt.map((w, i) => `#${i + 1} w${w} v${val[i]}`).join('  ') + (f.chosen ? `   chosen: ${f.chosen.join(',')}` : ''), 20, H - 12, { color: T.muted, font: "11px 'JetBrains Mono', monospace", align: 'left' });
      } };
    },
  });

  /* ---------------- LCS ---------------- */
  Viz.register({
    id: 'lcs', title: 'Longest Common Subsequence', topic: 'dp-1', cat: 'dp',
    desc: 'dp[i][j] = LCS of the first i letters of s and j letters of t. Diagonal step on a match, else the best of up/left.',
    params: [{ key: 's', label: 'String s', type: 'text', def: 'ABCBDAB' }, { key: 't', label: 'String t', type: 'text', def: 'BDCABA' }],
    code: ['for (i = 1..n) for (j = 1..m)', '    if (s[i-1] == t[j-1]) dp[i][j] = dp[i-1][j-1] + 1;', '    else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);', '// reconstruct by walking back from dp[n][m]'],
    build(p) {
      const s = (p.s || 'ABCB').slice(0, 10).toUpperCase(), t = (p.t || 'BDCA').slice(0, 10).toUpperCase(); const n = s.length, m = t.length;
      const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(null)); for (let i = 0; i <= n; i++) dp[i][0] = 0; for (let j = 0; j <= m; j++) dp[0][j] = 0;
      const frames = []; const F = (line, extra, text) => frames.push({ line, dp: snap(dp), ...extra, text });
      F(0, {}, `s = ${s}, t = ${t}. Row/column 0 are empty prefixes → 0.`);
      for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
        if (s[i - 1] === t[j - 1]) { dp[i][j] = dp[i - 1][j - 1] + 1; F(1, { cur: [i, j], from: [i - 1, j - 1], match: true }, `${s[i - 1]} == ${t[j - 1]} → dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}.`); }
        else { dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); if ((i + j) % 3 === 0) F(2, { cur: [i, j], from: dp[i - 1][j] >= dp[i][j - 1] ? [i - 1, j] : [i, j - 1] }, `${s[i - 1]} ≠ ${t[j - 1]} → max(up ${dp[i - 1][j]}, left ${dp[i][j - 1]}) = ${dp[i][j]}.`); }
      }
      let i = n, j = m; const res = []; const path = [];
      while (i > 0 && j > 0) { path.push([i, j]); if (s[i - 1] === t[j - 1]) { res.push(s[i - 1]); i--; j--; } else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--; }
      F(3, { path, done: true, lcs: res.reverse().join('') }, `LCS length ${dp[n][m]}: "${res.join('')}" (one of possibly several).`);
      return { frames, height: Math.max(260, (n + 2) * 30 + 40), draw: (ctx, f, W, H, T) => {
        const cell = Math.min(30, (W - 80) / (m + 2));
        D.table(ctx, f.dp, 20, 20, cell, T, { rowHead: ['·', ...s.split('')], colHead: ['·', ...t.split('')], style: (r, c) => (f.cur && f.cur[0] === r && f.cur[1] === c ? { fill: f.match ? T.ok : T.accent, color: '#fff' } : f.from && f.from[0] === r && f.from[1] === c ? { fill: T.warn, color: '#fff' } : f.path && f.path.some(([a, b]) => a === r && b === c) ? { fill: T.ok, color: '#fff' } : f.dp[r][c] === null ? { fill: T.bg } : {}) });
        if (f.lcs) D.text(ctx, `LCS = ${f.lcs}`, 20, H - 12, { color: T.ok, font: T.mono, align: 'left' });
      } };
    },
  });

  /* ---------------- LIS tails ---------------- */
  Viz.register({
    id: 'lis', title: 'LIS in O(n log n)', topic: 'dp-1', cat: 'dp',
    desc: 'tails[k] = smallest possible last element of an increasing subsequence of length k+1. Each element replaces its lower_bound.',
    params: [{ key: 'n', label: 'Array size', type: 'number', min: 5, max: 16, def: 10 }],
    code: ['vector<int> tails;', 'for (int x : a) {', '    auto it = lower_bound(tails.begin(), tails.end(), x);', '    if (it == tails.end()) tails.push_back(x);   // extends the longest', '    else *it = x;                                 // better (smaller) tail', '}', 'answer = tails.size();'],
    build(p, rng) {
      const a = randArr(rng, p.n, 1, 30); const tails = []; const frames = [];
      frames.push({ line: 0, i: -1, tails: [], pos: -1, text: 'tails is always sorted; its length is the LIS length so far.' });
      a.forEach((x, i) => {
        let k = tails.findIndex((v) => v >= x); if (k < 0) k = tails.length;
        if (k === tails.length) { tails.push(x); frames.push({ line: 3, i, tails: snap(tails), pos: k, text: `x = ${x} is larger than every tail → append; LIS length now ${tails.length}.` }); }
        else { const old = tails[k]; tails[k] = x; frames.push({ line: 4, i, tails: snap(tails), pos: k, text: `x = ${x}: lower_bound finds tails[${k}] = ${old} → replace with ${x} (a smaller tail for length ${k + 1} is never worse).` }); }
      });
      frames.push({ line: 6, i: a.length - 1, tails: snap(tails), pos: -1, done: true, text: `LIS length = **${tails.length}**. Note: tails itself is not necessarily an increasing subsequence of a; store parents to reconstruct one.` });
      return { frames, draw: (ctx, f, W, H, T) => {
        const cw = Math.min(40, (W - 40) / a.length), x0 = (W - a.length * (cw + 4)) / 2;
        D.array(ctx, a, x0, 50, cw, cw, T, { style: (i) => (i === f.i ? { fill: T.accent, color: '#fff', stroke: 'transparent' } : i < f.i ? { fill: T.panel, color: T.muted } : {}) });
        D.text(ctx, 'tails:', x0, 140, { color: T.muted, font: T.font, align: 'left' });
        D.array(ctx, f.tails, x0, 152, cw, cw, T, { style: (i) => (i === f.pos ? { fill: T.ok, color: '#fff', stroke: 'transparent' } : {}), below: (i) => `len ${i + 1}` });
      } };
    },
  });

  /* ---------------- bitmask TSP ---------------- */
  Viz.register({
    id: 'tsp-bitmask', title: 'Bitmask DP: TSP', topic: 'dp-2', cat: 'dp',
    desc: 'dp[mask][v] = cheapest route visiting exactly the cities in mask, ending at v. Masks are processed in increasing order.',
    params: [{ key: 'n', label: 'Cities', type: 'number', min: 3, max: 5, def: 4 }],
    code: ['dp[1][0] = 0;', 'for (mask) for (u in mask) if (dp[mask][u] < INF)', '    for (v not in mask)', '        dp[mask | 1<<v][v] = min(dp[mask | 1<<v][v], dp[mask][u] + d[u][v]);', 'answer = min over u of dp[full][u] + d[u][0];'],
    build(p, rng) {
      const n = p.n; const pts = Array.from({ length: n }, () => ({ x: 40 + rng() * 520, y: 30 + rng() * 240 }));
      const d = pts.map((a) => pts.map((b) => Math.round(Math.hypot(a.x - b.x, a.y - b.y) / 10)));
      const INF = 1e9; const dp = Array.from({ length: 1 << n }, () => Array(n).fill(INF)); dp[1][0] = 0; const frames = [];
      frames.push({ line: 0, dp: snap(dp), mask: 1, u: 0, v: -1, text: `${n} cities; distances rounded. Start at city 0: dp[0001][0] = 0.` });
      for (let mask = 1; mask < 1 << n; mask++) for (let u = 0; u < n; u++) {
        if (dp[mask][u] >= INF || !(mask >> u & 1)) continue;
        for (let v = 0; v < n; v++) if (!(mask >> v & 1)) {
          const nm = mask | 1 << v, cand = dp[mask][u] + d[u][v];
          const improved = cand < dp[nm][v]; if (improved) dp[nm][v] = cand;
          frames.push({ line: 3, dp: snap(dp), mask, u, v, nm, improved, text: `From mask ${mask.toString(2).padStart(n, '0')} at ${u} (cost ${dp[mask][u]}) go to ${v} (+${d[u][v]}) → dp[${nm.toString(2).padStart(n, '0')}][${v}] ${improved ? '= ' + cand : 'stays ' + dp[nm][v]}.` });
        }
      }
      let best = INF, bu = -1; for (let u = 1; u < n; u++) if (dp[(1 << n) - 1][u] + d[u][0] < best) { best = dp[(1 << n) - 1][u] + d[u][0]; bu = u; }
      // reconstruct tour
      const tour = [0]; let mask = (1 << n) - 1, u = bu; const seq = [u];
      while (mask !== 1) { let pu = -1; for (let w = 0; w < n; w++) if (w !== u && (mask >> w & 1) && dp[mask ^ (1 << u)][w] + d[w][u] === dp[mask][u]) { pu = w; break; } mask ^= 1 << u; u = pu; seq.push(u); }
      const order = seq.reverse().concat([0]);
      frames.push({ line: 4, dp: snap(dp), mask: (1 << n) - 1, u: bu, v: 0, done: true, tour: order, text: `Cheapest tour: ${order.join(' → ')} with cost **${best}**. States 2ⁿ·n = ${(1 << n) * n}.` });
      return { frames, height: 320, draw: (ctx, f, W, H, T) => {
        const sx = W / 600; const P = pts.map((q) => ({ x: q.x * sx, y: q.y }));
        for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) D.edge(ctx, P[i].x, P[i].y, P[j].x, P[j].y, T, { color: T.border, label: d[i][j] });
        if (f.tour) for (let i = 0; i + 1 < f.tour.length; i++) D.edge(ctx, P[f.tour[i]].x, P[f.tour[i]].y, P[f.tour[i + 1]].x, P[f.tour[i + 1]].y, T, { color: T.ok, lw: 3.5 });
        else if (f.v >= 0) D.edge(ctx, P[f.u].x, P[f.u].y, P[f.v].x, P[f.v].y, T, { color: f.improved ? T.ok : T.warn, lw: 3, directed: true, r: 16 });
        P.forEach((q, i) => D.node(ctx, q.x, q.y, 16, i, T, { fill: f.mask >> i & 1 ? T.accent : T.panel, color: f.mask >> i & 1 ? '#fff' : T.text, stroke: i === f.u ? T.text : 'transparent', lw: 2.5 }));
        D.text(ctx, `mask = ${f.mask.toString(2).padStart(n, '0')}  (blue = visited)`, 12, H - 12, { color: T.muted, font: "11px 'JetBrains Mono', monospace", align: 'left' });
      } };
    },
  });

  /* ---------------- convex hull trick ---------------- */
  Viz.register({
    id: 'convex-hull-trick', title: 'Convex Hull Trick', topic: 'dp-optimizations', cat: 'dp',
    desc: 'Lines y = m·x + c added with decreasing slopes; the lower envelope answers minimum queries. Useless lines are popped.',
    params: [{ key: 'k', label: 'Lines', type: 'number', min: 3, max: 8, def: 5 }],
    code: ['void add(m, c) {   // slopes decreasing', '    while (size >= 2 && bad(L[size-2], L[size-1], new)) pop();', '    push(new);', '}', 'query(x): while (size >= 2 && L[0](x) >= L[1](x)) pop_front(); return L[0](x);'],
    build(p, rng) {
      const k = p.k; const slopes = Array.from({ length: k }, () => Math.round(rng() * 8 - 4)).sort((a, b) => b - a).map((m, i, arr) => m - i * 0 ); // ensure strictly decreasing
      for (let i = 1; i < slopes.length; i++) if (slopes[i] >= slopes[i - 1]) slopes[i] = slopes[i - 1] - 1;
      const lines = slopes.map((m) => ({ m, c: Math.round(rng() * 40 - 20) }));
      const hull = []; const frames = [];
      const bad = (a, b, c) => (c.c - a.c) * (a.m - b.m) <= (b.c - a.c) * (a.m - c.m);
      frames.push({ line: 0, hull: [], all: [], cur: null, text: `Add ${k} lines with decreasing slopes. The hull keeps only lines that are minimal somewhere.` });
      const all = [];
      lines.forEach((ln) => {
        all.push(ln); frames.push({ line: 0, hull: snap(hull), all: snap(all), cur: ln, text: `New line y = ${ln.m}x + ${ln.c}.` });
        while (hull.length >= 2 && bad(hull[hull.length - 2], hull[hull.length - 1], ln)) { const rem = hull.pop(); frames.push({ line: 1, hull: snap(hull), all: snap(all), cur: ln, removed: rem, text: `Line y = ${rem.m}x + ${rem.c} is never the minimum once the new line exists → pop.` }); }
        hull.push(ln); frames.push({ line: 2, hull: snap(hull), all: snap(all), cur: null, text: `Push. Hull has ${hull.length} lines.` });
      });
      const qs = [-6, 0, 6]; qs.forEach((x) => { let best = Infinity, bi = -1; hull.forEach((ln, i) => { const y = ln.m * x + ln.c; if (y < best) { best = y; bi = i; } }); frames.push({ line: 4, hull: snap(hull), all: snap(all), cur: null, qx: x, qi: bi, text: `Query x = ${x}: minimum ${best} from line y = ${hull[bi].m}x + ${hull[bi].c}. With monotone queries a deque pointer moves only forward.` }); });
      return { frames, height: 340, draw: (ctx, f, W, H, T) => {
        const X0 = -10, X1 = 10, Y0 = -60, Y1 = 60; const sx = (x) => ((x - X0) / (X1 - X0)) * (W - 40) + 20, sy = (y) => H - 30 - ((y - Y0) / (Y1 - Y0)) * (H - 60);
        ctx.strokeStyle = T.border; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sx(0), sy(Y0)); ctx.lineTo(sx(0), sy(Y1)); ctx.moveTo(sx(X0), sy(0)); ctx.lineTo(sx(X1), sy(0)); ctx.stroke();
        const drawLine = (ln, color, lw) => { ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(sx(X0), sy(ln.m * X0 + ln.c)); ctx.lineTo(sx(X1), sy(ln.m * X1 + ln.c)); ctx.stroke(); };
        f.all.forEach((ln) => drawLine(ln, T.border, 1));
        f.hull.forEach((ln, i) => drawLine(ln, i === f.qi ? T.ok : T.accent, i === f.qi ? 3 : 2));
        if (f.cur) drawLine(f.cur, T.warn, 2.5);
        if (f.removed) drawLine(f.removed, T.danger, 2);
        // envelope
        ctx.strokeStyle = T.purple; ctx.lineWidth = 4; ctx.beginPath(); let first = true;
        for (let x = X0; x <= X1; x += 0.25) { let y = Infinity; f.hull.forEach((ln) => (y = Math.min(y, ln.m * x + ln.c))); if (y === Infinity) break; if (first) { ctx.moveTo(sx(x), sy(y)); first = false; } else ctx.lineTo(sx(x), sy(y)); } ctx.stroke();
        if (f.qx !== undefined) { ctx.strokeStyle = T.ok; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(sx(f.qx), sy(Y0)); ctx.lineTo(sx(f.qx), sy(Y1)); ctx.stroke(); ctx.setLineDash([]); }
        D.legend(ctx, [[T.purple, 'lower envelope'], [T.accent, 'hull lines'], [T.warn, 'new line'], [T.danger, 'popped']], 16, 16, T);
      } };
    },
  });

  /* ---------------- Grundy numbers ---------------- */
  Viz.register({
    id: 'grundy', title: 'Sprague–Grundy Values', topic: 'game-theory', cat: 'math',
    desc: 'g(n) = mex of the Grundy values reachable in one move. Zero means the position is losing.',
    params: [{ key: 'moves', label: 'Allowed removals (comma-separated)', type: 'text', def: '1,3,4' }, { key: 'n', label: 'Compute up to n', type: 'number', min: 5, max: 24, def: 14 }],
    code: ['int grundy(int n) {', '    set<int> s;', '    for (int mv : moves) if (n >= mv) s.insert(grundy(n - mv));', '    int g = 0; while (s.count(g)) g++;   // mex', '    return g;', '}'],
    build(p) {
      const moves = String(p.moves).split(',').map((x) => parseInt(x.trim(), 10)).filter((x) => x > 0 && x < 50); const M = moves.length ? moves : [1, 3, 4];
      const n = p.n; const g = Array(n + 1).fill(null); const frames = [];
      frames.push({ line: 0, g: snap(g), cur: -1, reach: [], text: `Moves: remove one of {${M.join(', ')}} stones. g(0) = 0 (no moves = losing).` });
      for (let i = 0; i <= n; i++) {
        const reach = M.filter((m) => i >= m).map((m) => i - m); const vals = new Set(reach.map((j) => g[j]));
        let mex = 0; while (vals.has(mex)) mex++;
        g[i] = mex;
        frames.push({ line: 3, g: snap(g), cur: i, reach, text: i === 0 ? 'g(0) = mex{} = 0.' : `g(${i}) = mex{${reach.map((j) => `g(${j})=${g[j]}`).join(', ')}} = ${mex}${mex === 0 ? ' → losing position' : ''}.` });
      }
      const losing = g.map((v, i) => (v === 0 ? i : -1)).filter((x) => x >= 0);
      frames.push({ line: 4, g: snap(g), cur: -1, reach: [], done: true, text: `Losing positions: ${losing.join(', ')}. For several piles, XOR the Grundy values — losing iff the XOR is 0. Look for the period!` });
      return { frames, height: 220, draw: (ctx, f, W, H, T) => {
        const cw = Math.min(36, (W - 40) / (n + 1)), x0 = (W - (n + 1) * (cw + 4)) / 2;
        D.array(ctx, f.g.map((v) => (v === null ? '' : v)), x0, 70, cw, cw, T, { style: (i) => (i === f.cur ? { fill: T.accent, color: '#fff', stroke: 'transparent' } : f.reach.includes(i) ? { fill: T.warn, color: '#fff', stroke: 'transparent' } : f.g[i] === 0 ? { fill: T.danger + '66', stroke: T.danger } : f.g[i] === null ? { fill: T.bg } : {}), above: (i) => i });
        D.legend(ctx, [[T.accent, 'computing'], [T.warn, 'reachable positions'], [T.danger, 'g = 0 (losing)']], 16, H - 16, T);
      } };
    },
  });
})();
