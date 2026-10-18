/* Visualizers — core techniques: binary search, two pointers, sliding window min, prefix sums, subsets, gcd, fast pow, sieve, monotonic stack. */
(() => {
  const D = Viz.draw, snap = Viz.snap;
  const randArr = (rng, n, lo, hi, sorted = false) => { const a = Array.from({ length: n }, () => lo + Math.floor(rng() * (hi - lo + 1))); if (sorted) a.sort((x, y) => x - y); return a; };
  const cellSize = (W, n, maxW = 46, minW = 18) => Math.max(minW, Math.min(maxW, Math.floor((W - 40) / n) - 4));

  /* ---------------- binary search ---------------- */
  Viz.register({
    id: 'binary-search', title: 'Binary Search', topic: 'binary-search', cat: 'core',
    desc: 'Find the first element ≥ target in a sorted array. Watch the invariant: the answer is always inside [lo, hi].',
    params: [{ key: 'n', label: 'Array size', type: 'number', min: 4, max: 24, def: 14 }, { key: 'target', label: 'Target (blank = random)', type: 'text', def: '' }],
    code: ['int lo = 0, hi = n;            // answer in [lo, hi]', 'while (lo < hi) {', '    int mid = lo + (hi - lo) / 2;', '    if (a[mid] >= target) hi = mid;   // mid works', '    else lo = mid + 1;                // mid too small', '}', 'return lo;  // first index with a[i] >= target'],
    build(p, rng) {
      const a = randArr(rng, p.n, 1, 60, true);
      let target = parseInt(p.target, 10); if (isNaN(target)) target = a[Math.floor(rng() * a.length)] + (rng() < 0.3 ? 1 : 0);
      const frames = [];
      let lo = 0, hi = a.length;
      frames.push({ line: 0, lo, hi, mid: -1, text: `Sorted array, target = **${target}**. Invariant: the first index with a[i] ≥ target lies in [lo, hi] = [${lo}, ${hi}].` });
      while (lo < hi) {
        const mid = lo + Math.floor((hi - lo) / 2);
        frames.push({ line: 2, lo, hi, mid, text: `mid = ${mid}, a[mid] = ${a[mid]}. Compare with target ${target}.` });
        if (a[mid] >= target) { hi = mid; frames.push({ line: 3, lo, hi, mid, text: `a[mid] = ${a[mid]} ≥ ${target}: mid could be the answer, so hi = mid = ${mid}. Everything right of mid is discarded.` }); }
        else { lo = mid + 1; frames.push({ line: 4, lo, hi, mid, text: `a[mid] = ${a[mid]} < ${target}: the answer must be right of mid, so lo = ${lo}.` }); }
      }
      frames.push({ line: 6, lo, hi, mid: -1, done: true, text: lo < a.length ? `lo == hi == ${lo}: a[${lo}] = ${a[lo]} is the first element ≥ ${target}. ${Math.ceil(Math.log2(a.length + 1))} steps at most for n = ${a.length}.` : `lo == hi == n: no element is ≥ ${target}.` });
      return { frames, draw: (ctx, f, W, H, T) => {
        const cw = cellSize(W, a.length), x0 = (W - a.length * (cw + 4)) / 2, y0 = H / 2 - cw / 2;
        D.array(ctx, a, x0, y0, cw, cw, T, {
          style: (i) => f.done && i === f.lo ? { fill: T.ok, color: '#fff', stroke: T.ok } : i === f.mid ? { fill: T.accent, color: '#fff', stroke: T.accent } : i < f.lo || i >= f.hi ? { fill: T.bg, color: T.muted, stroke: T.border } : {},
          below: (i) => (i === f.lo && i === f.hi ? 'lo=hi' : i === f.lo ? 'lo' : i === f.hi ? 'hi' : ''),
          above: (i) => (i === f.mid ? 'mid' : ''),
        });
        if (f.hi === a.length) D.text(ctx, 'hi', x0 + a.length * (cw + 4) + cw / 2 - 2, y0 + cw + 12, { color: T.muted, font: "11px 'JetBrains Mono', monospace" });
        D.legend(ctx, [[T.accent, 'mid'], [T.panel, 'still possible'], [T.bg, 'discarded'], [T.ok, 'answer']], 16, H - 18, T);
      } };
    },
  });

  /* ---------------- two pointers (sliding window sum <= k) ---------------- */
  Viz.register({
    id: 'two-pointers', title: 'Two Pointers: Sliding Window', topic: 'two-pointers', cat: 'core',
    desc: 'Count subarrays with sum ≤ k on a positive array. Both pointers only move right, so the total work is O(n).',
    params: [{ key: 'n', label: 'Array size', type: 'number', min: 5, max: 20, def: 12 }, { key: 'k', label: 'Max sum k', type: 'number', min: 1, max: 100, def: 15 }],
    code: ['long long ans = 0, sum = 0;', 'for (int l = 0, r = 0; r < n; r++) {', '    sum += a[r];                  // extend the window', '    while (sum > k) sum -= a[l++]; // shrink until valid', '    ans += r - l + 1;             // subarrays ending at r', '}'],
    build(p, rng) {
      const a = randArr(rng, p.n, 1, 9), k = p.k;
      const frames = []; let ans = 0, sum = 0, l = 0;
      frames.push({ line: 0, l: 0, r: -1, sum, ans, text: `Array of positive numbers, k = ${k}. Window [l, r] will always have sum ≤ k after shrinking.` });
      for (let r = 0; r < a.length; r++) {
        sum += a[r];
        frames.push({ line: 2, l, r, sum, ans, text: `Extend: r = ${r}, add a[r] = ${a[r]} → sum = ${sum}.` });
        while (sum > k) { sum -= a[l]; l++; frames.push({ line: 3, l, r, sum, ans, text: `sum ${sum + a[l - 1]} > ${k}: drop a[${l - 1}] = ${a[l - 1]} from the left → sum = ${sum}, l = ${l}.` }); }
        ans += r - l + 1;
        frames.push({ line: 4, l, r, sum, ans, text: `Window [${l}, ${r}] valid (sum ${sum} ≤ ${k}). It contributes ${r - l + 1} subarrays ending at ${r}. Total so far: ${ans}.` });
      }
      frames.push({ line: 5, l, r: a.length - 1, sum, ans, done: true, text: `Done: **${ans}** subarrays with sum ≤ ${k}. Each pointer moved at most n times → O(n).` });
      return { frames, draw: (ctx, f, W, H, T) => {
        const cw = cellSize(W, a.length), x0 = (W - a.length * (cw + 4)) / 2, y0 = H / 2 - cw / 2;
        D.array(ctx, a, x0, y0, cw, cw, T, {
          style: (i) => i >= f.l && i <= f.r ? { fill: f.sum > k ? T.danger : T.accent, color: '#fff', stroke: 'transparent' } : i < f.l ? { fill: T.bg, color: T.muted } : {},
          below: (i) => (i === f.l && i === f.r ? 'l r' : i === f.l ? 'l' : i === f.r ? 'r' : ''),
        });
        D.text(ctx, `sum = ${f.sum}   k = ${k}   answer = ${f.ans}`, W / 2, y0 - 34, { color: T.text, font: T.mono });
      } };
    },
  });

  /* ---------------- sliding window minimum (monotonic deque) ---------------- */
  Viz.register({
    id: 'sliding-window-min', title: 'Sliding Window Minimum', topic: 'two-pointers', cat: 'core',
    desc: 'Monotonic deque: indices with increasing values; the front is always the minimum of the current window.',
    params: [{ key: 'n', label: 'Array size', type: 'number', min: 5, max: 20, def: 12 }, { key: 'k', label: 'Window k', type: 'number', min: 2, max: 8, def: 3 }],
    code: ['deque<int> dq;   // indices, values increasing', 'for (int i = 0; i < n; i++) {', '    while (!dq.empty() && a[dq.back()] >= a[i]) dq.pop_back();', '    dq.push_back(i);', '    if (dq.front() <= i - k) dq.pop_front();', '    if (i >= k - 1) ans.push_back(a[dq.front()]);', '}'],
    build(p, rng) {
      const a = randArr(rng, p.n, 1, 30), k = Math.min(p.k, a.length);
      const frames = [], dq = [], ans = [];
      frames.push({ line: 0, i: -1, dq: [], ans: [], text: `Window size k = ${k}. The deque stores indices whose values increase from front to back.` });
      for (let i = 0; i < a.length; i++) {
        while (dq.length && a[dq[dq.length - 1]] >= a[i]) { const x = dq.pop(); frames.push({ line: 2, i, dq: snap(dq), ans: snap(ans), text: `a[${x}] = ${a[x]} ≥ a[${i}] = ${a[i]}: index ${x} can never be a window minimum again → pop it.` }); }
        dq.push(i); frames.push({ line: 3, i, dq: snap(dq), ans: snap(ans), text: `Push index ${i} (value ${a[i]}).` });
        if (dq[0] <= i - k) { const x = dq.shift(); frames.push({ line: 4, i, dq: snap(dq), ans: snap(ans), text: `Index ${x} left the window [${i - k + 1}, ${i}] → pop front.` }); }
        if (i >= k - 1) { ans.push(a[dq[0]]); frames.push({ line: 5, i, dq: snap(dq), ans: snap(ans), text: `Window [${i - k + 1}, ${i}] minimum = a[${dq[0]}] = ${a[dq[0]]}.` }); }
      }
      frames.push({ line: 6, i: a.length - 1, dq: snap(dq), ans: snap(ans), done: true, text: `All window minima: ${ans.join(', ')}. Each index is pushed and popped at most once → O(n).` });
      return { frames, draw: (ctx, f, W, H, T) => {
        const cw = cellSize(W, a.length), x0 = (W - a.length * (cw + 4)) / 2, y0 = 60;
        const inWin = (i) => f.i >= 0 && i <= f.i && i > f.i - k;
        D.array(ctx, a, x0, y0, cw, cw, T, { style: (i) => f.dq.includes(i) ? { fill: T.accent, color: '#fff', stroke: 'transparent' } : inWin(i) ? { fill: T.panel, stroke: T.warn } : {}, below: (i) => (i === f.i ? 'i' : '') });
        D.text(ctx, 'deque (front → back):', x0, y0 + cw + 50, { color: T.muted, font: T.font, align: 'left' });
        D.array(ctx, f.dq.map((i) => `${i}:${a[i]}`), x0, y0 + cw + 62, Math.max(cw, 44), 30, T, { style: () => ({ fill: T.accent, color: '#fff', stroke: 'transparent' }), font: "11px 'JetBrains Mono', monospace" });
        D.text(ctx, 'minima so far: ' + f.ans.join(' '), x0, y0 + cw + 120, { color: T.ok, font: T.mono, align: 'left' });
        D.legend(ctx, [[T.warn, 'current window (border)'], [T.accent, 'in deque']], 16, H - 18, T);
      } };
    },
  });

  /* ---------------- prefix sums: count subarrays with sum k ---------------- */
  Viz.register({
    id: 'prefix-sums', title: 'Prefix Sums: Subarrays With Sum k', topic: 'prefix-sums', cat: 'core',
    desc: 'p[j] − p[i] = k ⇔ the subarray (i, j] sums to k. Count earlier prefix values with a hash map.',
    params: [{ key: 'n', label: 'Array size', type: 'number', min: 4, max: 16, def: 10 }, { key: 'k', label: 'Target sum k', type: 'number', min: -20, max: 40, def: 5 }],
    code: ['map<long long, long long> cnt; cnt[0] = 1;', 'long long p = 0, ans = 0;', 'for (int x : a) {', '    p += x;                    // prefix sum so far', '    ans += cnt[p - k];         // earlier prefixes that complete a sum of k', '    cnt[p]++;', '}'],
    build(p, rng) {
      const a = randArr(rng, p.n, -3, 6), k = p.k;
      const frames = []; const cnt = { 0: 1 }; let pre = 0, ans = 0; const prefixes = [0];
      frames.push({ line: 0, j: -1, prefixes: snap(prefixes), cnt: snap(cnt), ans, hit: null, text: `k = ${k}. cnt[0] = 1 represents the empty prefix p[0] = 0.` });
      for (let j = 0; j < a.length; j++) {
        pre += a[j]; prefixes.push(pre);
        frames.push({ line: 3, j, prefixes: snap(prefixes), cnt: snap(cnt), ans, hit: null, text: `p[${j + 1}] = ${pre}. Need earlier prefix value p[i] = p[j] − k = ${pre - k}.` });
        const c = cnt[pre - k] || 0; ans += c;
        frames.push({ line: 4, j, prefixes: snap(prefixes), cnt: snap(cnt), ans, hit: pre - k, text: c ? `Found ${c} earlier prefix(es) equal to ${pre - k} → ${c} subarray(s) ending at ${j} with sum ${k}. Total ${ans}.` : `No earlier prefix equals ${pre - k}. Total stays ${ans}.` });
        cnt[pre] = (cnt[pre] || 0) + 1;
        frames.push({ line: 5, j, prefixes: snap(prefixes), cnt: snap(cnt), ans, hit: null, text: `Record cnt[${pre}] = ${cnt[pre]}.` });
      }
      frames.push({ line: 6, j: a.length - 1, prefixes: snap(prefixes), cnt: snap(cnt), ans, hit: null, done: true, text: `Answer: **${ans}** subarrays with sum ${k}, in O(n log n) (O(n) with a hash map).` });
      return { frames, draw: (ctx, f, W, H, T) => {
        const cw = cellSize(W, a.length + 1), x0 = (W - (a.length + 1) * (cw + 4)) / 2;
        D.text(ctx, 'a:', x0 - 16, 60 + cw / 2, { color: T.muted, font: T.mono, align: 'right' });
        D.array(ctx, a, x0 + cw + 4, 60, cw, cw, T, { style: (i) => (i === f.j ? { fill: T.accent, color: '#fff', stroke: 'transparent' } : {}) });
        D.text(ctx, 'p:', x0 - 16, 60 + cw + 30 + cw / 2, { color: T.muted, font: T.mono, align: 'right' });
        const shown = f.prefixes.concat(Array(a.length + 1 - f.prefixes.length).fill(''));
        D.array(ctx, shown, x0, 60 + cw + 30, cw, cw, T, { style: (i) => (i < f.prefixes.length && f.hit !== null && f.prefixes[i] === f.hit && i <= f.j ? { fill: T.ok, color: '#fff', stroke: 'transparent' } : i === f.prefixes.length - 1 && f.j >= 0 ? { fill: T.accent, color: '#fff', stroke: 'transparent' } : i >= f.prefixes.length ? { fill: T.bg, stroke: T.border } : {}) });
        const entries = Object.entries(f.cnt).sort((x, y) => +x[0] - +y[0]);
        D.text(ctx, 'cnt: ' + entries.map(([v, c]) => `${v}→${c}`).join('  '), x0, 60 + 2 * cw + 70, { color: T.text, font: "12px 'JetBrains Mono', monospace", align: 'left' });
        D.text(ctx, `answer = ${f.ans}`, x0, 60 + 2 * cw + 95, { color: T.ok, font: T.mono, align: 'left' });
      } };
    },
  });

  /* ---------------- subsets by bitmask ---------------- */
  Viz.register({
    id: 'subsets', title: 'Subsets as Bitmasks', topic: 'bit-manipulation', cat: 'core',
    desc: 'Every integer 0..2ⁿ−1 is a subset: bit i set ⇔ element i chosen. Here we look for a subset with a given sum.',
    params: [{ key: 'n', label: 'Elements', type: 'number', min: 3, max: 6, def: 4 }, { key: 'target', label: 'Target sum', type: 'number', min: 1, max: 60, def: 10 }],
    code: ['for (int mask = 0; mask < (1 << n); mask++) {', '    int sum = 0;', '    for (int i = 0; i < n; i++)', '        if (mask >> i & 1) sum += a[i];', '    if (sum == target) found = true;', '}'],
    build(p, rng) {
      const a = randArr(rng, p.n, 1, 9); const n = a.length; const frames = []; const results = [];
      frames.push({ line: 0, mask: -1, results: [], text: `n = ${n} elements → 2ⁿ = ${1 << n} subsets. Target sum ${p.target}.` });
      for (let mask = 0; mask < (1 << n); mask++) {
        let sum = 0; const chosen = [];
        for (let i = 0; i < n; i++) if (mask >> i & 1) { sum += a[i]; chosen.push(i); }
        const ok = sum === p.target;
        results.push({ mask, sum, ok });
        frames.push({ line: ok ? 4 : 3, mask, sum, results: snap(results), text: `mask = ${mask} = ${mask.toString(2).padStart(n, '0')}₂ → elements {${chosen.map((i) => a[i]).join(', ')}}, sum ${sum}${ok ? ' = target ✓' : ''}.` });
      }
      const hits = results.filter((r) => r.ok).length;
      frames.push({ line: 5, mask: -1, results: snap(results), done: true, text: `${hits} subset(s) sum to ${p.target}. Cost: 2ⁿ · n = ${(1 << n) * n} operations — fine up to n ≈ 20.` });
      return { frames, height: 380, draw: (ctx, f, W, H, T) => {
        const cw = 40, x0 = 30;
        D.array(ctx, a, x0, 30, cw, cw, T, { style: (i) => (f.mask >= 0 && (f.mask >> i & 1) ? { fill: T.accent, color: '#fff', stroke: 'transparent' } : {}), below: (i) => `bit ${i}` });
        const cols = Math.min(8, 1 << n), bw = Math.min(90, (W - 60) / cols), bh = 30;
        f.results.forEach((r, idx) => {
          const cx = x0 + (idx % cols) * bw, cy = 120 + Math.floor(idx / cols) * (bh + 6);
          D.roundRect(ctx, cx, cy, bw - 6, bh, 5, r.ok ? T.ok : r.mask === f.mask ? T.accent : T.panel, T.border);
          D.text(ctx, `${r.mask.toString(2).padStart(n, '0')}=${r.sum}`, cx + (bw - 6) / 2, cy + bh / 2, { color: r.ok || r.mask === f.mask ? '#fff' : T.text, font: "11px 'JetBrains Mono', monospace" });
        });
      } };
    },
  });

  /* ---------------- gcd (Euclid) ---------------- */
  Viz.register({
    id: 'gcd', title: 'Euclid’s Algorithm', topic: 'math-basics', cat: 'math',
    desc: 'gcd(a, b) = gcd(b, a mod b). The numbers shrink geometrically: O(log) steps.',
    params: [{ key: 'a', label: 'a', type: 'number', min: 1, max: 100000, def: 1071 }, { key: 'b', label: 'b', type: 'number', min: 1, max: 100000, def: 462 }],
    code: ['long long gcd(long long a, long long b) {', '    while (b != 0) {', '        long long r = a % b;', '        a = b; b = r;', '    }', '    return a;', '}'],
    build(p) {
      let a = p.a, b = p.b; const frames = []; const steps = [];
      frames.push({ line: 0, a, b, steps: [], text: `Compute gcd(${a}, ${b}).` });
      while (b !== 0) {
        const q = Math.floor(a / b), r = a % b;
        steps.push({ a, b, q, r });
        frames.push({ line: 2, a, b, r, steps: snap(steps), text: `${a} = ${q} · ${b} + ${r}, so gcd(${a}, ${b}) = gcd(${b}, ${r}).` });
        a = b; b = r;
        frames.push({ line: 3, a, b, steps: snap(steps), text: `Now a = ${a}, b = ${b}.` });
      }
      frames.push({ line: 5, a, b, steps: snap(steps), done: true, text: `b = 0 → gcd = **${a}** after ${steps.length} divisions (bound ≈ 2·log₂ of the smaller number).` });
      return { frames, height: 340, draw: (ctx, f, W, H, T) => {
        D.text(ctx, `a = ${f.a}    b = ${f.b}`, W / 2, 34, { color: T.text, font: "bold 16px 'JetBrains Mono', monospace" });
        f.steps.forEach((s, i) => D.text(ctx, `${s.a} = ${s.q} × ${s.b} + ${s.r}`, W / 2, 70 + i * 22, { color: i === f.steps.length - 1 ? T.accent : T.muted, font: T.mono }));
        if (f.done) D.text(ctx, `gcd = ${f.a}`, W / 2, 80 + f.steps.length * 22, { color: T.ok, font: "bold 16px 'JetBrains Mono', monospace" });
        // bar view of a and b
        const maxv = Math.max(p.a, p.b), bw = W - 80;
        [[f.a, T.accent, 'a'], [f.b, T.purple, 'b']].forEach(([v, col, lab], i) => { const y = H - 60 + i * 22; ctx.fillStyle = col; ctx.fillRect(40, y, Math.max(2, (bw * v) / maxv), 14); D.text(ctx, lab, 28, y + 7, { color: T.muted, font: T.mono }); });
      } };
    },
  });

  /* ---------------- fast exponentiation ---------------- */
  Viz.register({
    id: 'fast-pow', title: 'Binary Exponentiation', topic: 'number-theory-1', cat: 'math',
    desc: 'Compute bᵉ mod m in O(log e): square the base for each bit of the exponent, multiply into the result when the bit is 1.',
    params: [{ key: 'b', label: 'Base b', type: 'number', min: 1, max: 1000, def: 3 }, { key: 'e', label: 'Exponent e', type: 'number', min: 0, max: 100000, def: 45 }, { key: 'm', label: 'Modulus m', type: 'number', min: 2, max: 1000000007, def: 1000000007 }],
    code: ['long long power(long long b, long long e, long long m) {', '    long long r = 1; b %= m;', '    while (e > 0) {', '        if (e & 1) r = r * b % m;   // current bit is 1', '        b = b * b % m;              // square', '        e >>= 1;                    // next bit', '    }', '    return r;', '}'],
    build(p) {
      const m = BigInt(p.m); let b = BigInt(p.b) % m, e = BigInt(p.e), r = 1n; const frames = []; const bits = p.e.toString(2); let bitIdx = bits.length - 1; const trail = [];
      frames.push({ line: 1, b: b.toString(), e: e.toString(), r: '1', bits, bitIdx: -1, trail: [], text: `e = ${p.e} = ${bits}₂. Process bits from the least significant.` });
      while (e > 0n) {
        const bit = e & 1n;
        if (bit) { r = r * b % m; frames.push({ line: 3, b: b.toString(), e: e.toString(), r: r.toString(), bits, bitIdx, trail: snap(trail), text: `Bit is 1 → r = r · b mod m = ${r}.` }); }
        else frames.push({ line: 3, b: b.toString(), e: e.toString(), r: r.toString(), bits, bitIdx, trail: snap(trail), text: `Bit is 0 → r unchanged (${r}).` });
        trail.push({ bit: bit.toString(), b: b.toString(), r: r.toString() });
        b = b * b % m; e >>= 1n; bitIdx--;
        frames.push({ line: 4, b: b.toString(), e: e.toString(), r: r.toString(), bits, bitIdx, trail: snap(trail), text: `Square the base: b = ${b}; shift e → ${e}.` });
      }
      frames.push({ line: 7, b: b.toString(), e: '0', r: r.toString(), bits, bitIdx: -1, trail: snap(trail), done: true, text: `Result: ${p.b}^${p.e} mod ${p.m} = **${r}** using ${bits.length} squarings (instead of ${p.e} multiplications).` });
      return { frames, height: 340, draw: (ctx, f, W, H, T) => {
        const cw = Math.min(36, (W - 60) / f.bits.length);
        D.text(ctx, 'exponent bits (most significant first):', 30, 30, { color: T.muted, font: T.font, align: 'left' });
        D.array(ctx, f.bits.split(''), 30, 44, cw, cw, T, { style: (i) => (i === f.bitIdx ? { fill: T.accent, color: '#fff', stroke: 'transparent' } : i > f.bitIdx && f.bitIdx >= 0 ? { fill: T.bg, color: T.muted } : {}) });
        D.text(ctx, `r = ${f.r}`, 30, 44 + cw + 40, { color: T.ok, font: "bold 15px 'JetBrains Mono', monospace", align: 'left' });
        D.text(ctx, `b = ${f.b}`, 30, 44 + cw + 66, { color: T.text, font: T.mono, align: 'left' });
        D.text(ctx, `e = ${f.e}`, 30, 44 + cw + 88, { color: T.text, font: T.mono, align: 'left' });
        f.trail.slice(-6).forEach((s, i) => D.text(ctx, `bit ${s.bit}: b=${s.b}  r=${s.r}`, W - 30, 60 + i * 20, { color: T.muted, font: "11px 'JetBrains Mono', monospace", align: 'right' }));
      } };
    },
  });

  /* ---------------- sieve ---------------- */
  Viz.register({
    id: 'sieve', title: 'Sieve of Eratosthenes', topic: 'number-theory-1', cat: 'math',
    desc: 'Cross out multiples of each prime starting at p². Numbers never crossed out are prime.',
    params: [{ key: 'n', label: 'Up to n', type: 'number', min: 20, max: 120, def: 60 }],
    code: ['vector<bool> isPrime(n + 1, true); isPrime[0] = isPrime[1] = false;', 'for (long long i = 2; i * i <= n; i++)', '    if (isPrime[i])', '        for (long long j = i * i; j <= n; j += i)', '            isPrime[j] = false;'],
    build(p) {
      const n = p.n, isP = Array(n + 1).fill(true); isP[0] = isP[1] = false; const frames = []; const by = Array(n + 1).fill(0);
      frames.push({ line: 0, isP: snap(isP), by: snap(by), cur: -1, text: `Assume everything ≥ 2 is prime.` });
      for (let i = 2; i * i <= n; i++) {
        if (!isP[i]) continue;
        frames.push({ line: 2, isP: snap(isP), by: snap(by), cur: i, text: `${i} is prime. Cross out its multiples starting at ${i}² = ${i * i} (smaller multiples were already crossed by smaller primes).` });
        for (let j = i * i; j <= n; j += i) { if (isP[j]) { isP[j] = false; by[j] = i; } }
        frames.push({ line: 3, isP: snap(isP), by: snap(by), cur: i, text: `Multiples of ${i} crossed out.` });
      }
      const primes = []; for (let i = 2; i <= n; i++) if (isP[i]) primes.push(i);
      frames.push({ line: 4, isP: snap(isP), by: snap(by), cur: -1, done: true, text: `${primes.length} primes ≤ ${n}: ${primes.join(', ')}. Complexity O(n log log n).` });
      const cols = 12, rows = Math.ceil((n + 1) / cols);
      return { frames, height: Math.max(300, rows * 30 + 60), draw: (ctx, f, W, H, T) => {
        const cell = Math.min(30, (W - 40) / cols), x0 = (W - cols * cell) / 2;
        const palette = [T.accent, T.purple, T.teal, T.orange, T.warn, T.danger];
        D.grid(ctx, rows, cols, x0, 20, cell, T, { style: (r, c) => { const v = r * cols + c; if (v > n) return { fill: T.bg }; if (v < 2) return { fill: T.bg, color: T.muted }; if (!f.isP[v]) { const idx = [2, 3, 5, 7, 11, 13].indexOf(f.by[v]); return { fill: idx >= 0 ? palette[idx] + '55' : T.panel, color: T.muted }; } if (f.done || (f.cur > 0 && v <= f.cur)) return { fill: T.ok, color: '#fff' }; return v === f.cur ? { fill: T.ok, color: '#fff' } : {}; }, label: (r, c) => { const v = r * cols + c; return v <= n ? v : ''; } });
      } };
    },
  });

  /* ---------------- monotonic stack: nearest smaller ---------------- */
  Viz.register({
    id: 'monotonic-stack', title: 'Monotonic Stack: Nearest Smaller Value', topic: 'sorting-searching', cat: 'core',
    desc: 'For each element, the nearest smaller value to its left. The stack keeps candidates in increasing order.',
    params: [{ key: 'n', label: 'Array size', type: 'number', min: 5, max: 18, def: 10 }],
    code: ['vector<int> st;   // indices with increasing values', 'for (int i = 0; i < n; i++) {', '    while (!st.empty() && a[st.back()] >= a[i]) st.pop_back();', '    ans[i] = st.empty() ? -1 : st.back();', '    st.push_back(i);', '}'],
    build(p, rng) {
      const a = randArr(rng, p.n, 1, 20); const frames = []; const st = []; const ans = Array(a.length).fill(null);
      frames.push({ line: 0, i: -1, st: [], ans: snap(ans), text: 'Stack holds indices whose values strictly increase from bottom to top.' });
      for (let i = 0; i < a.length; i++) {
        while (st.length && a[st[st.length - 1]] >= a[i]) { const x = st.pop(); frames.push({ line: 2, i, st: snap(st), ans: snap(ans), text: `a[${x}] = ${a[x]} ≥ a[${i}] = ${a[i]} → pop ${x}; it can never be the nearest smaller for anything to the right.` }); }
        ans[i] = st.length ? st[st.length - 1] : -1;
        frames.push({ line: 3, i, st: snap(st), ans: snap(ans), text: ans[i] >= 0 ? `Nearest smaller to the left of a[${i}] = ${a[i]} is a[${ans[i]}] = ${a[ans[i]]}.` : `Nothing smaller to the left of a[${i}] = ${a[i]} → −1.` });
        st.push(i); frames.push({ line: 4, i, st: snap(st), ans: snap(ans), text: `Push ${i}.` });
      }
      frames.push({ line: 5, i: a.length - 1, st: snap(st), ans: snap(ans), done: true, text: 'Every index is pushed once and popped at most once → O(n).' });
      return { frames, draw: (ctx, f, W, H, T) => {
        const cw = cellSize(W, a.length), x0 = (W - a.length * (cw + 4)) / 2, y0 = 50;
        D.array(ctx, a, x0, y0, cw, cw, T, { style: (i) => (i === f.i ? { fill: T.accent, color: '#fff', stroke: 'transparent' } : f.st.includes(i) ? { fill: T.panel, stroke: T.purple, lw: 2.5 } : {}), below: (i) => (f.ans[i] === null ? '' : f.ans[i] < 0 ? '−1' : `←${f.ans[i]}`) });
        // arrows from i to answer
        f.ans.forEach((j, i) => { if (j !== null && j >= 0) { const xa = x0 + i * (cw + 4) + cw / 2, xb = x0 + j * (cw + 4) + cw / 2; ctx.strokeStyle = i === f.i ? T.ok : T.border; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xa, y0 - 6); ctx.quadraticCurveTo((xa + xb) / 2, y0 - 26 - Math.abs(xa - xb) / 10, xb, y0 - 6); ctx.stroke(); } });
        D.text(ctx, 'stack (bottom → top):', x0, y0 + cw + 50, { color: T.muted, font: T.font, align: 'left' });
        D.array(ctx, f.st.map((i) => `${i}:${a[i]}`), x0, y0 + cw + 62, Math.max(cw, 44), 30, T, { style: () => ({ fill: T.purple, color: '#fff', stroke: 'transparent' }), font: "11px 'JetBrains Mono', monospace" });
      } };
    },
  });
})();
