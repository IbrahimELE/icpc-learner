/* Visualizers — geometry: convex hull (monotone chain), closest pair sweep. */
(() => {
  const D = Viz.draw, snap = Viz.snap;
  const randPts = (rng, n) => { const set = new Set(); const pts = []; while (pts.length < n) { const x = 2 + Math.floor(rng() * 56), y = 2 + Math.floor(rng() * 28); const k = x + ',' + y; if (set.has(k)) continue; set.add(k); pts.push({ x, y }); } return pts; };
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  /* ---------------- convex hull ---------------- */
  Viz.register({
    id: 'convex-hull', title: 'Convex Hull (Monotone Chain)', topic: 'geometry-1', cat: 'geometry',
    desc: 'Sort points by x; build the lower hull left to right and the upper hull right to left, popping while the turn is not counter-clockwise.',
    params: [{ key: 'n', label: 'Points', type: 'number', min: 5, max: 30, def: 14 }],
    code: ['sort(pts);', 'for (p in pts) {                      // lower hull', '    while (k >= 2 && cross(h[k-2], h[k-1], p) <= 0) k--;', '    h[k++] = p;', '}', 'for (p in reversed pts) {             // upper hull', '    while (k >= t && cross(h[k-2], h[k-1], p) <= 0) k--;', '    h[k++] = p;', '}'],
    build(p, rng) {
      const pts = randPts(rng, p.n).sort((a, b) => a.x - b.x || a.y - b.y); const frames = []; const h = [];
      const F = (line, extra, text) => frames.push({ line, h: snap(h), ...extra, text });
      F(0, { cur: null, phase: 'lower' }, `${pts.length} points sorted by (x, y).`);
      for (const q of pts) {
        while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], q) <= 0) { const rem = h.pop(); F(2, { cur: q, removed: rem, phase: 'lower' }, `Turn at (${rem.x},${rem.y}) toward (${q.x},${q.y}) is clockwise/collinear → pop it.`); }
        h.push(q); F(3, { cur: q, phase: 'lower' }, `Push (${q.x},${q.y}). Lower hull has ${h.length} points.`);
      }
      const t = h.length + 1;
      for (let i = pts.length - 2; i >= 0; i--) {
        const q = pts[i];
        while (h.length >= t && cross(h[h.length - 2], h[h.length - 1], q) <= 0) { const rem = h.pop(); F(6, { cur: q, removed: rem, phase: 'upper' }, `Upper hull: pop (${rem.x},${rem.y}).`); }
        h.push(q); F(7, { cur: q, phase: 'upper' }, `Push (${q.x},${q.y}).`);
      }
      h.pop();
      F(8, { cur: null, phase: 'done', done: true }, `Hull complete: ${h.length} vertices, counter-clockwise. Sorting dominates: O(n log n).`);
      return { frames, height: 340, draw: (ctx, f, W, H, T) => {
        const sx = (x) => 20 + (x / 60) * (W - 40), sy = (y) => H - 30 - (y / 32) * (H - 60);
        if (f.h.length >= 2) { ctx.strokeStyle = f.phase === 'upper' ? T.purple : T.accent; ctx.lineWidth = 2.5; ctx.beginPath(); f.h.forEach((q, i) => (i ? ctx.lineTo(sx(q.x), sy(q.y)) : ctx.moveTo(sx(q.x), sy(q.y)))); if (f.done) ctx.closePath(); ctx.stroke(); }
        if (f.done) { ctx.fillStyle = T.accent + '22'; ctx.beginPath(); f.h.forEach((q, i) => (i ? ctx.lineTo(sx(q.x), sy(q.y)) : ctx.moveTo(sx(q.x), sy(q.y)))); ctx.closePath(); ctx.fill(); }
        if (f.removed && f.cur) { ctx.strokeStyle = T.danger; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(sx(f.removed.x), sy(f.removed.y)); ctx.lineTo(sx(f.cur.x), sy(f.cur.y)); ctx.stroke(); ctx.setLineDash([]); }
        pts.forEach((q) => { const inH = f.h.some((z) => z.x === q.x && z.y === q.y); ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), f.cur && f.cur.x === q.x && f.cur.y === q.y ? 7 : 5, 0, 2 * Math.PI); ctx.fillStyle = f.cur && f.cur.x === q.x && f.cur.y === q.y ? T.warn : inH ? T.accent : f.removed && f.removed.x === q.x && f.removed.y === q.y ? T.danger : T.muted; ctx.fill(); });
        D.legend(ctx, [[T.accent, 'on current hull'], [T.warn, 'current point'], [T.danger, 'just popped'], [T.purple, 'upper chain']], 16, 16, T);
      } };
    },
  });

  /* ---------------- closest pair ---------------- */
  Viz.register({
    id: 'closest-pair', title: 'Closest Pair: Sweep Line', topic: 'geometry-2', cat: 'geometry',
    desc: 'Sweep by x; keep points within distance d (current best) in a set ordered by y; only the y-neighbourhood is compared.',
    params: [{ key: 'n', label: 'Points', type: 'number', min: 5, max: 25, def: 14 }],
    code: ['sort(pts by x); set<(y, x)> active; best = INF;', 'for (i = 0..n-1) {', '    while (pts[i].x - pts[left].x > d) active.erase(pts[left++]);   // too far left', '    for (q in active with |q.y - pts[i].y| <= d) best = min(best, dist(q, pts[i]));', '    active.insert(pts[i]);', '}'],
    build(p, rng) {
      const pts = randPts(rng, p.n).sort((a, b) => a.x - b.x || a.y - b.y); const frames = []; let best = Infinity, bestPair = null, left = 0; const active = [];
      const F = (line, extra, text) => frames.push({ line, active: snap(active), best, bestPair: snap(bestPair), ...extra, text });
      F(0, { i: -1 }, 'Points sorted by x. best = ∞.');
      for (let i = 0; i < pts.length; i++) {
        const d = best === Infinity ? Infinity : Math.sqrt(best);
        while (left < i && pts[i].x - pts[left].x > d) { const rem = pts[left]; const idx = active.findIndex((q) => q.x === rem.x && q.y === rem.y); if (idx >= 0) active.splice(idx, 1); left++; F(2, { i, removed: rem }, `(${rem.x},${rem.y}) is more than d = ${d.toFixed(2)} to the left → remove from the active set.`); }
        const cands = active.filter((q) => Math.abs(q.y - pts[i].y) <= d);
        let improved = false;
        for (const q of cands) { const dd = (q.x - pts[i].x) ** 2 + (q.y - pts[i].y) ** 2; if (dd < best) { best = dd; bestPair = [q, pts[i]]; improved = true; } }
        F(3, { i, cands: snap(cands), improved }, `Point (${pts[i].x},${pts[i].y}): ${cands.length} candidate(s) within the y-window${improved ? ` → new best distance ${Math.sqrt(best).toFixed(2)}` : ''}.`);
        active.push(pts[i]); active.sort((a, b) => a.y - b.y);
        F(4, { i }, `Insert into the active set (${active.length} points).`);
      }
      F(5, { i: pts.length - 1, done: true }, `Closest pair: (${bestPair[0].x},${bestPair[0].y})–(${bestPair[1].x},${bestPair[1].y}), distance ${Math.sqrt(best).toFixed(3)}. O(n log n) overall.`);
      return { frames, height: 340, draw: (ctx, f, W, H, T) => {
        const sx = (x) => 20 + (x / 60) * (W - 40), sy = (y) => H - 30 - (y / 32) * (H - 60);
        if (f.i >= 0) { const d = f.best === Infinity ? 0 : Math.sqrt(f.best); const x = sx(pts[f.i].x); ctx.strokeStyle = T.warn; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x, 10); ctx.lineTo(x, H - 10); ctx.stroke(); if (d) { ctx.fillStyle = T.warn + '18'; ctx.fillRect(sx(pts[f.i].x - d), 10, x - sx(pts[f.i].x - d), H - 20); ctx.fillStyle = T.accent + '22'; ctx.fillRect(sx(pts[f.i].x - d), sy(pts[f.i].y + d), x - sx(pts[f.i].x - d), sy(pts[f.i].y - d) - sy(pts[f.i].y + d)); } ctx.setLineDash([]); }
        if (f.bestPair) { ctx.strokeStyle = T.ok; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(sx(f.bestPair[0].x), sy(f.bestPair[0].y)); ctx.lineTo(sx(f.bestPair[1].x), sy(f.bestPair[1].y)); ctx.stroke(); }
        pts.forEach((q, idx) => { const act = f.active.some((z) => z.x === q.x && z.y === q.y); const cand = f.cands && f.cands.some((z) => z.x === q.x && z.y === q.y); ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), idx === f.i ? 7 : 5, 0, 2 * Math.PI); ctx.fillStyle = idx === f.i ? T.warn : cand ? T.accent : act ? T.purple : idx < f.i ? T.border : T.muted; ctx.fill(); });
        D.legend(ctx, [[T.warn, 'current point / sweep line'], [T.purple, 'active (within d in x)'], [T.accent, 'compared (within d in y)'], [T.ok, 'best pair']], 16, 16, T);
      } };
    },
  });
})();
