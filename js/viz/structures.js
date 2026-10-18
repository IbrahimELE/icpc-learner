/* Visualizers — data structures: segment tree, Fenwick tree, sparse table, lazy segment tree. */
(() => {
  const D = Viz.draw, snap = Viz.snap;
  const randArr = (rng, n, lo, hi) => Array.from({ length: n }, () => lo + Math.floor(rng() * (hi - lo + 1)));

  // draw a complete binary tree of size 2*size (iterative layout), nodes 1..2size-1, leaves size..2size-1
  const drawSegTree = (ctx, t, size, W, top, T, { hl = () => null, label = (v) => (v === null || v === undefined ? '' : v) } = {}) => {
    const levels = Math.log2(size) + 1;
    const levelH = Math.min(60, 250 / levels);
    for (let lvl = 0; lvl < levels; lvl++) {
      const count = 1 << lvl, start = 1 << lvl;
      const w = W / count;
      for (let k = 0; k < count; k++) {
        const node = start + k, x = w * k + w / 2, y = top + lvl * levelH;
        if (lvl > 0) { const parentIdx = node >> 1, pw = W / (1 << (lvl - 1)), px = pw * (parentIdx - (1 << (lvl - 1))) + pw / 2; ctx.strokeStyle = T.border; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, y - levelH + 12); ctx.lineTo(x, y - 12); ctx.stroke(); }
        const h = hl(node) || {};
        const bw = Math.min(w - 4, 54);
        D.roundRect(ctx, x - bw / 2, y - 12, bw, 24, 6, h.fill || T.panel, h.stroke || T.border, h.lw || 1);
        D.text(ctx, label(t[node], node), x, y, { color: h.color || T.text, font: `${bw < 30 ? 9 : 11}px 'JetBrains Mono', monospace` });
      }
    }
  };

  /* ---------------- segment tree ---------------- */
  Viz.register({
    id: 'segment-tree', title: 'Segment Tree (sum)', topic: 'segment-tree', cat: 'ds',
    desc: 'Build, then a range query decomposes into O(log n) nodes, and a point update fixes one root-to-leaf path.',
    params: [{ key: 'n', label: 'Array size (power of two)', type: 'select', def: '8', options: [{ value: '4', label: '4' }, { value: '8', label: '8' }, { value: '16', label: '16' }] }],
    code: ['// build: t[n+i] = a[i]; t[i] = t[2i] + t[2i+1] for i = n-1..1', 'long long query(int l, int r) {          // [l, r)', '    long long res = 0;', '    for (l += n, r += n; l < r; l >>= 1, r >>= 1) {', '        if (l & 1) res += t[l++];', '        if (r & 1) res += t[--r];', '    }', '    return res;', '}', 'void update(int i, long long v) { for (t[i += n] = v; i > 1; i >>= 1) t[i >> 1] = t[i] + t[i ^ 1]; }'],
    build(p, rng) {
      const n = +p.n; const a = randArr(rng, n, 1, 9); const t = Array(2 * n).fill(null); const frames = [];
      const F = (line, extra, text) => frames.push({ line, t: snap(t), ...extra, text });
      for (let i = 0; i < n; i++) t[n + i] = a[i];
      F(0, { hl: Array.from({ length: n }, (_, i) => n + i) }, `Leaves t[${n}..${2 * n - 1}] hold the array.`);
      for (let i = n - 1; i >= 1; i--) { t[i] = t[2 * i] + t[2 * i + 1]; if (i === n - 1 || i === 1 || (i & (i - 1)) === 0) F(0, { hl: [i, 2 * i, 2 * i + 1] }, `t[${i}] = t[${2 * i}] + t[${2 * i + 1}] = ${t[i]}.`); }
      F(0, { hl: [] }, 'Tree built in O(n).');
      // query
      let l = Math.floor(rng() * (n / 2)), r = l + 2 + Math.floor(rng() * (n - l - 2)); const ql = l, qr = r; let res = 0; const used = [];
      F(1, { hl: [], q: [ql, qr] }, `Query sum of [${ql}, ${qr}) — elements ${a.slice(ql, qr).join(' + ')}.`);
      for (l += n, r += n; l < r; l >>= 1, r >>= 1) {
        if (l & 1) { res += t[l]; used.push(l); F(4, { hl: snap(used), q: [ql, qr], res }, `l = ${l} is a right child → take t[${l}] = ${t[l]}, move l to ${l + 1}. res = ${res}.`); l++; }
        if (r & 1) { r--; res += t[r]; used.push(r); F(5, { hl: snap(used), q: [ql, qr], res }, `r = ${r + 1} is a right boundary → take t[${r}] = ${t[r]}. res = ${res}.`); }
      }
      F(7, { hl: snap(used), q: [ql, qr], res }, `Answer ${res} from ${used.length} nodes (≤ 2·log₂ n).`);
      // update
      const idx = Math.floor(rng() * n), nv = 1 + Math.floor(rng() * 9); const path = [];
      F(9, { hl: [n + idx], upd: idx }, `Update a[${idx}] = ${nv}: set the leaf, then recompute ancestors.`);
      t[n + idx] = nv; path.push(n + idx);
      for (let i = (n + idx) >> 1; i >= 1; i >>= 1) { t[i] = t[2 * i] + t[2 * i + 1]; path.push(i); F(9, { hl: snap(path), upd: idx }, `t[${i}] = ${t[i]}.`); }
      F(9, { hl: snap(path), upd: idx, done: true }, `Update touched ${path.length} nodes = log₂ n + 1.`);
      return { frames, height: 360, draw: (ctx, f, W, H, T) => {
        drawSegTree(ctx, f.t, n, W, 30, T, { hl: (v) => (f.hl && f.hl.includes(v) ? { fill: f.res !== undefined && !f.done ? T.ok : T.accent, color: '#fff', stroke: 'transparent' } : null) });
        if (f.q) { const w = W / n; ctx.fillStyle = T.warn + '44'; ctx.fillRect(w * f.q[0], H - 40, w * (f.q[1] - f.q[0]), 30); D.text(ctx, `query [${f.q[0]}, ${f.q[1]})${f.res !== undefined ? ' = ' + f.res : ''}`, 12, H - 8, { color: T.warn, font: T.mono, align: 'left' }); }
        if (f.upd !== undefined) { const w = W / n; ctx.fillStyle = T.accent + '44'; ctx.fillRect(w * f.upd, H - 40, w, 30); }
      } };
    },
  });

  /* ---------------- Fenwick tree ---------------- */
  Viz.register({
    id: 'fenwick', title: 'Fenwick Tree (BIT)', topic: 'fenwick', cat: 'ds',
    desc: 'Cell i covers the lowbit(i) elements ending at i. Updates climb by adding lowbit; prefix queries descend by subtracting it.',
    params: [{ key: 'n', label: 'Size', type: 'number', min: 6, max: 16, def: 12 }],
    code: ['void add(int i, long long v) { for (; i <= n; i += i & -i) t[i] += v; }', 'long long prefix(int i) { long long s = 0; for (; i > 0; i -= i & -i) s += t[i]; return s; }'],
    build(p, rng) {
      const n = p.n; const a = randArr(rng, n, 1, 9); const t = Array(n + 1).fill(0); const frames = [];
      const F = (line, extra, text) => frames.push({ line, t: snap(t), ...extra, text });
      F(0, { hl: [] }, `Array a[1..${n}] = ${a.join(' ')}. Build by adding each element.`);
      for (let i = 1; i <= n; i++) { const touched = []; for (let j = i; j <= n; j += j & -j) { t[j] += a[i - 1]; touched.push(j); } if (i <= 3 || i === n) F(0, { hl: touched }, `add(${i}, ${a[i - 1]}) touches cells ${touched.join(', ')} (i += lowbit(i)).`); }
      F(0, { hl: [] }, `Built. t[i] = sum of a[(i − lowbit(i) + 1) .. i].`);
      const qi = 3 + Math.floor(rng() * (n - 3)); let s = 0; const path = [];
      F(1, { hl: [], q: qi }, `prefix(${qi}): sum a[1..${qi}] = ${a.slice(0, qi).reduce((x, y) => x + y, 0)}.`);
      for (let j = qi; j > 0; j -= j & -j) { s += t[j]; path.push(j); F(1, { hl: snap(path), q: qi, s }, `Read t[${j}] = ${t[j]} (covers ${j - (j & -j) + 1}..${j}); s = ${s}; next j = ${j - (j & -j)}.`); }
      F(1, { hl: snap(path), q: qi, s, done: true }, `prefix(${qi}) = ${s} from ${path.length} cells — the number of 1-bits in ${qi}.`);
      return { frames, height: 300, draw: (ctx, f, W, H, T) => {
        const cw = Math.min(44, (W - 40) / (n + 1)), x0 = (W - (n + 1) * (cw + 4)) / 2;
        D.text(ctx, 'a:', x0 - 10, 50 + cw / 2, { color: T.muted, font: T.mono, align: 'right' });
        D.array(ctx, a, x0 + cw + 4, 50, cw, cw, T, { style: (i) => (f.q !== undefined && i < f.q ? { fill: T.warn + '66', stroke: T.warn } : {}), above: (i) => i + 1 });
        D.text(ctx, 't:', x0 - 10, 50 + cw + 40 + cw / 2, { color: T.muted, font: T.mono, align: 'right' });
        D.array(ctx, f.t.slice(1), x0 + cw + 4, 50 + cw + 40, cw, cw, T, { style: (i) => (f.hl.includes(i + 1) ? { fill: T.accent, color: '#fff', stroke: 'transparent' } : {}), below: (i) => { const j = i + 1, lb = j & -j; return lb === 1 ? `${j}` : `${j - lb + 1}-${j}`; } });
        if (f.s !== undefined) D.text(ctx, `prefix(${f.q}) = ${f.s}`, x0, H - 14, { color: T.ok, font: T.mono, align: 'left' });
      } };
    },
  });

  /* ---------------- sparse table ---------------- */
  Viz.register({
    id: 'sparse-table', title: 'Sparse Table (RMQ)', topic: 'segment-tree', cat: 'ds',
    desc: 't[k][i] = min of the 2ᵏ elements from i. A query uses two overlapping blocks — fine because min is idempotent.',
    params: [{ key: 'n', label: 'Size', type: 'number', min: 6, max: 16, def: 11 }],
    code: ['t[0] = a;', 'for (k = 1; (1 << k) <= n; k++)', '    for (i = 0; i + (1 << k) <= n; i++)', '        t[k][i] = min(t[k-1][i], t[k-1][i + (1 << (k-1))]);', 'query(l, r): k = log2(r - l + 1); return min(t[k][l], t[k][r - (1 << k) + 1]);'],
    build(p, rng) {
      const n = p.n; const a = randArr(rng, n, 1, 30); const LOG = Math.floor(Math.log2(n)) + 1; const t = Array.from({ length: LOG }, () => Array(n).fill(null)); const frames = [];
      const F = (line, extra, text) => frames.push({ line, t: snap(t), ...extra, text });
      for (let i = 0; i < n; i++) t[0][i] = a[i];
      F(0, { hl: [] }, 'Level 0 is the array itself.');
      for (let k = 1; (1 << k) <= n; k++) { for (let i = 0; i + (1 << k) <= n; i++) t[k][i] = Math.min(t[k - 1][i], t[k - 1][i + (1 << (k - 1))]); F(3, { hl: [], lvl: k }, `Level ${k}: each cell is the min of two level-${k - 1} blocks of length ${1 << (k - 1)}.`); }
      const l = Math.floor(rng() * (n / 2)), r = l + 1 + Math.floor(rng() * (n - l - 1)); const k = Math.floor(Math.log2(r - l + 1));
      F(4, { hl: [[k, l], [k, r - (1 << k) + 1]], q: [l, r], ans: Math.min(t[k][l], t[k][r - (1 << k) + 1]) }, `Query min[${l}, ${r}]: length ${r - l + 1}, k = ${k}; blocks [${l}, ${l + (1 << k) - 1}] and [${r - (1 << k) + 1}, ${r}] overlap and cover the range. Answer ${Math.min(t[k][l], t[k][r - (1 << k) + 1])}.`);
      return { frames, height: 80 + LOG * 40, draw: (ctx, f, W, H, T) => {
        const cw = Math.min(40, (W - 60) / n), x0 = 40;
        f.t.forEach((row, k) => { D.text(ctx, `k=${k}`, x0 - 8, 30 + k * 40 + cw / 2 - 4, { color: T.muted, font: "11px 'JetBrains Mono', monospace", align: 'right' }); D.array(ctx, row.map((v) => (v === null ? '' : v)), x0, 30 + k * 40, cw, cw - 8, T, { style: (i) => (row[i] === null ? { fill: T.bg, stroke: 'transparent' } : f.hl.some(([hk, hi]) => hk === k && hi === i) ? { fill: T.accent, color: '#fff', stroke: 'transparent' } : f.lvl === k ? { stroke: T.purple, lw: 2 } : f.q && k === 0 && i >= f.q[0] && i <= f.q[1] ? { fill: T.warn + '55', stroke: T.warn } : {}), font: "11px 'JetBrains Mono', monospace" }); });
        if (f.ans !== undefined) D.text(ctx, `min = ${f.ans}`, x0, H - 10, { color: T.ok, font: T.mono, align: 'left' });
      } };
    },
  });

  /* ---------------- lazy segment tree ---------------- */
  Viz.register({
    id: 'lazy-segment-tree', title: 'Lazy Propagation (range add)', topic: 'lazy-segment-tree', cat: 'ds',
    desc: 'A range add stores a pending tag on fully covered nodes; the tag is pushed to children only when needed.',
    params: [{ key: 'n', label: 'Size', type: 'select', def: '8', options: [{ value: '8', label: '8' }, { value: '16', label: '16' }] }],
    code: ['void update(node, l, r, ql, qr, v) {', '    if (qr < l || r < ql) return;', '    if (ql <= l && r <= qr) { sum[node] += v*(r-l+1); lazy[node] += v; return; }', '    push(node);   // give pending tag to children', '    update(left...); update(right...);', '    sum[node] = sum[left] + sum[right];', '}'],
    build(p, rng) {
      const n = +p.n; const a = randArr(rng, n, 0, 5); const sum = Array(2 * n).fill(0), lz = Array(2 * n).fill(0); const frames = [];
      const F = (line, extra, text) => frames.push({ line, sum: snap(sum), lz: snap(lz), ...extra, text });
      const build = (node, l, r) => { if (l === r) { sum[node] = a[l]; return; } const m = (l + r) >> 1; build(2 * node, l, m); build(2 * node + 1, m + 1, r); sum[node] = sum[2 * node] + sum[2 * node + 1]; };
      build(1, 0, n - 1); F(0, { hl: [] }, `Sum tree built over ${a.join(' ')}.`);
      const apply = (node, l, r, v) => { sum[node] += v * (r - l + 1); lz[node] += v; };
      const push = (node, l, r) => { if (!lz[node]) return; const m = (l + r) >> 1; apply(2 * node, l, m, lz[node]); apply(2 * node + 1, m + 1, r, lz[node]); lz[node] = 0; F(3, { hl: [2 * node, 2 * node + 1] }, `push(${node}): children receive the pending +${(sum[2 * node] - 0, lz[2 * node])} (tag cleared at ${node}).`); };
      const update = (node, l, r, ql, qr, v) => {
        if (qr < l || r < ql) return;
        if (ql <= l && r <= qr) { apply(node, l, r, v); F(2, { hl: [node] }, `Node ${node} covers [${l}, ${r}] ⊆ [${ql}, ${qr}]: sum += ${v}·${r - l + 1}, lazy += ${v}. Stop here.`); return; }
        push(node, l, r);
        const m = (l + r) >> 1; update(2 * node, l, m, ql, qr, v); update(2 * node + 1, m + 1, r, ql, qr, v);
        sum[node] = sum[2 * node] + sum[2 * node + 1]; F(5, { hl: [node] }, `Recompute sum[${node}] = ${sum[node]}.`);
      };
      const query = (node, l, r, ql, qr) => { if (qr < l || r < ql) return 0; if (ql <= l && r <= qr) { F(2, { hl: [node], mode: 'q' }, `Query uses node ${node} = ${sum[node]}.`); return sum[node]; } push(node, l, r); const m = (l + r) >> 1; return query(2 * node, l, m, ql, qr) + query(2 * node + 1, m + 1, r, ql, qr); };
      const l1 = Math.floor(rng() * (n / 3)), r1 = l1 + Math.floor(n / 2) + Math.floor(rng() * (n - l1 - Math.floor(n / 2))), v1 = 1 + Math.floor(rng() * 5);
      F(0, { hl: [], q: [l1, r1] }, `Range add +${v1} on [${l1}, ${r1}].`);
      update(1, 0, n - 1, l1, r1, v1);
      const l2 = Math.floor(rng() * (n / 2)), r2 = l2 + Math.floor(rng() * (n - l2));
      F(0, { hl: [], q: [l2, r2], mode: 'q' }, `Now query sum of [${l2}, ${r2}] — pending tags get pushed only on the path we descend.`);
      const res = query(1, 0, n - 1, l2, r2);
      F(5, { hl: [], q: [l2, r2], res, done: true }, `Sum[${l2}, ${r2}] = **${res}**. Tags not on the path stay lazy.`);
      return { frames, height: 360, draw: (ctx, f, W, H, T) => {
        drawSegTree(ctx, f.sum, n, W, 30, T, { hl: (v) => (f.hl.includes(v) ? { fill: f.mode === 'q' ? T.ok : T.accent, color: '#fff', stroke: 'transparent' } : f.lz[v] ? { stroke: T.warn, lw: 2.5 } : null), label: (s, v) => (f.lz[v] ? `${s}|+${f.lz[v]}` : s) });
        if (f.q) { const w = W / n; ctx.fillStyle = (f.mode === 'q' ? T.ok : T.accent) + '44'; ctx.fillRect(w * f.q[0], H - 40, w * (f.q[1] - f.q[0] + 1), 30); }
        D.text(ctx, 'label: sum|+pending tag' + (f.res !== undefined ? `   result = ${f.res}` : ''), 12, H - 8, { color: T.muted, font: "11px 'JetBrains Mono', monospace", align: 'left' });
      } };
    },
  });
})();
