/* Visualizers — strings: prefix function (KMP), Z-function, trie. */
(() => {
  const D = Viz.draw, snap = Viz.snap;
  const drawString = (ctx, s, x0, y0, cw, T, style, above, below) => D.array(ctx, s.split(''), x0, y0, cw, cw, T, { style, above: above || (() => ''), below: below || (() => ''), font: "bold 13px 'JetBrains Mono', monospace" });

  /* ---------------- prefix function ---------------- */
  Viz.register({
    id: 'kmp', title: 'Prefix Function (KMP)', topic: 'strings-1', cat: 'strings',
    desc: 'π[i] = longest proper prefix of s[0..i] that is also a suffix. On a mismatch, jump to π[j−1] instead of restarting.',
    params: [{ key: 's', label: 'String', type: 'text', def: 'aabaaabaaac' }],
    code: ['vector<int> pi(n, 0);', 'for (int i = 1; i < n; i++) {', '    int j = pi[i - 1];', '    while (j > 0 && s[i] != s[j]) j = pi[j - 1];   // fall back', '    if (s[i] == s[j]) j++;', '    pi[i] = j;', '}'],
    build(p) {
      const s = (p.s || 'aabaaab').slice(0, 16).toLowerCase(); const n = s.length; const pi = Array(n).fill(null); pi[0] = 0; const frames = [];
      frames.push({ line: 0, pi: snap(pi), i: 0, j: 0, text: 'π[0] = 0 by definition (a border must be a proper prefix).' });
      for (let i = 1; i < n; i++) {
        let j = pi[i - 1];
        frames.push({ line: 2, pi: snap(pi), i, j, text: `i = ${i}: start from j = π[${i - 1}] = ${j}; compare s[${i}] = '${s[i]}' with s[${j}] = '${s[j]}'.` });
        while (j > 0 && s[i] !== s[j]) { const nj = pi[j - 1]; frames.push({ line: 3, pi: snap(pi), i, j, fallback: nj, text: `Mismatch ('${s[i]}' ≠ '${s[j]}'): fall back to j = π[${j - 1}] = ${nj} — the next shorter border.` }); j = nj; }
        if (s[i] === s[j]) { j++; frames.push({ line: 4, pi: snap(pi), i, j, text: `Match: extend the border to length ${j}.` }); }
        pi[i] = j; frames.push({ line: 5, pi: snap(pi), i, j, text: `π[${i}] = ${j}.` });
      }
      frames.push({ line: 6, pi: snap(pi), i: n - 1, j: pi[n - 1], done: true, text: `Done. Smallest period = n − π[n−1] = ${n - pi[n - 1]}. The while loop runs O(n) times in total (amortized).` });
      return { frames, height: 220, draw: (ctx, f, W, H, T) => {
        const cw = Math.min(40, (W - 40) / n), x0 = (W - n * (cw + 4)) / 2;
        drawString(ctx, s, x0, 50, cw, T, (k) => (k === f.i ? { fill: T.accent, color: '#fff', stroke: 'transparent' } : k < f.j ? { fill: T.ok + '66', stroke: T.ok } : k === f.j && f.j < f.i ? { fill: T.warn, color: '#fff', stroke: 'transparent' } : {}), (k) => k, () => '');
        D.text(ctx, 'π:', x0 - 12, 122 + cw / 2, { color: T.muted, font: T.mono, align: 'right' });
        D.array(ctx, f.pi.map((v) => (v === null ? '' : v)), x0, 122, cw, cw, T, { style: (k) => (k === f.i && f.pi[k] !== null ? { fill: T.accent, color: '#fff', stroke: 'transparent' } : f.pi[k] === null ? { fill: T.bg } : {}) });
        D.legend(ctx, [[T.ok, `current border (length j = ${f.j})`], [T.warn, 's[j] being compared'], [T.accent, 's[i]']], 16, H - 14, T);
      } };
    },
  });

  /* ---------------- Z-function ---------------- */
  Viz.register({
    id: 'z-function', title: 'Z-Function', topic: 'strings-1', cat: 'strings',
    desc: 'z[i] = longest common prefix of s and s[i..]. The Z-box [l, r) lets you initialize z[i] without recomparing.',
    params: [{ key: 's', label: 'String', type: 'text', def: 'aabcaabxaaaz' }],
    code: ['for (int i = 1, l = 0, r = 0; i < n; i++) {', '    if (i < r) z[i] = min(r - i, z[i - l]);   // inside the Z-box', '    while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;', '    if (i + z[i] > r) { l = i; r = i + z[i]; }', '}'],
    build(p) {
      const s = (p.s || 'aabcaab').slice(0, 16).toLowerCase(); const n = s.length; const z = Array(n).fill(null); z[0] = n; const frames = []; let l = 0, r = 0;
      frames.push({ line: 0, z: snap(z), i: 0, l, r, text: 'z[0] = n by convention. The Z-box [l, r) is the rightmost segment known to match a prefix.' });
      for (let i = 1; i < n; i++) {
        z[i] = 0;
        if (i < r) { z[i] = Math.min(r - i, z[i - l]); frames.push({ line: 1, z: snap(z), i, l, r, text: `i = ${i} is inside the Z-box [${l}, ${r}): s[i..] matches s[${i - l}..] there, so z[${i}] starts at min(${r - i}, z[${i - l}] = ${z[i - l]}) = ${z[i]}.` }); }
        else frames.push({ line: 1, z: snap(z), i, l, r, text: `i = ${i} is outside the Z-box: start comparing from scratch.` });
        let cnt = 0; while (i + z[i] < n && s[z[i]] === s[i + z[i]]) { z[i]++; cnt++; }
        frames.push({ line: 2, z: snap(z), i, l, r, text: `${cnt} extra character comparison(s) → z[${i}] = ${z[i]}.` });
        if (i + z[i] > r) { l = i; r = i + z[i]; frames.push({ line: 3, z: snap(z), i, l, r, text: `New Z-box [${l}, ${r}).` }); }
      }
      frames.push({ line: 4, z: snap(z), i: n - 1, l, r, done: true, text: 'Each character is compared successfully at most once beyond the box → O(n).' });
      return { frames, height: 220, draw: (ctx, f, W, H, T) => {
        const cw = Math.min(40, (W - 40) / n), x0 = (W - n * (cw + 4)) / 2;
        drawString(ctx, s, x0, 50, cw, T, (k) => (k === f.i ? { fill: T.accent, color: '#fff', stroke: 'transparent' } : f.z[f.i] !== null && k > f.i && k < f.i + f.z[f.i] ? { fill: T.accent + '66', stroke: T.accent } : f.z[f.i] !== null && k < f.z[f.i] && k < f.i ? { fill: T.ok + '66', stroke: T.ok } : {}), (k) => k, (k) => (k >= f.l && k < f.r && f.r > 0 ? '▔' : ''));
        D.text(ctx, 'z:', x0 - 12, 122 + cw / 2, { color: T.muted, font: T.mono, align: 'right' });
        D.array(ctx, f.z.map((v) => (v === null ? '' : v)), x0, 122, cw, cw, T, { style: (k) => (k === f.i ? { fill: T.accent, color: '#fff', stroke: 'transparent' } : f.z[k] === null ? { fill: T.bg } : {}) });
        D.legend(ctx, [[T.accent, 'suffix starting at i (matched part)'], [T.ok, 'matching prefix'], [T.muted, `Z-box [${f.l}, ${f.r}) marked below`]], 16, H - 14, T);
      } };
    },
  });

  /* ---------------- trie ---------------- */
  Viz.register({
    id: 'trie', title: 'Trie Insertion', topic: 'strings-2', cat: 'strings',
    desc: 'Each edge is a character; shared prefixes share paths. Node counters answer “how many words start with this prefix”.',
    params: [{ key: 'words', label: 'Words (comma-separated)', type: 'text', def: 'car,cart,cat,dog,do' }],
    code: ['int v = 0;', 'for (char ch : word) {', '    int c = ch - \'a\';', '    if (nxt[v][c] == -1) nxt[v][c] = newNode();', '    v = nxt[v][c]; cntPass[v]++;', '}', 'cntEnd[v]++;'],
    build(p) {
      const words = String(p.words).split(',').map((w) => w.trim().toLowerCase().replace(/[^a-z]/g, '')).filter(Boolean).slice(0, 8);
      const nodes = [{ ch: '', children: {}, pass: 0, end: 0, parent: -1 }]; const frames = [];
      const F = (line, extra, text) => frames.push({ line, nodes: snap(nodes), ...extra, text });
      F(0, { cur: 0 }, `Insert ${words.length} words: ${words.join(', ')}. Node 0 is the empty prefix.`);
      words.forEach((w) => {
        let v = 0; F(0, { cur: 0, word: w }, `Insert "${w}" starting at the root.`);
        for (const ch of w) {
          if (nodes[v].children[ch] === undefined) { nodes.push({ ch, children: {}, pass: 0, end: 0, parent: v }); nodes[v].children[ch] = nodes.length - 1; F(3, { cur: nodes.length - 1, word: w, created: true }, `No edge '${ch}' from node ${v} → create node ${nodes.length - 1}.`); }
          v = nodes[v].children[ch]; nodes[v].pass++; F(4, { cur: v, word: w }, `Move along '${ch}' to node ${v}; ${nodes[v].pass} word(s) pass here.`);
        }
        nodes[v].end++; F(6, { cur: v, word: w, ended: true }, `"${w}" ends at node ${v} (end count ${nodes[v].end}).`);
      });
      F(6, { cur: -1, done: true }, `${nodes.length} nodes for ${words.reduce((s, w) => s + w.length, 0)} characters — shared prefixes are stored once.`);
      return { frames, height: 340, draw: (ctx, f, W, H, T) => {
        const N = f.nodes.length; const children = f.nodes.map((nd) => Object.values(nd.children));
        const pos = Viz.layout.tree(children, 0, W, 30, Math.min(56, (H - 60) / (Math.max(1, ...f.nodes.map((nd) => { let d = 0, v = f.nodes.indexOf(nd); while (v > 0) { v = f.nodes[v].parent; d++; } return d; })) + 1)));
        f.nodes.forEach((nd, v) => { if (nd.parent >= 0 && pos[v] && pos[nd.parent]) { D.edge(ctx, pos[nd.parent].x, pos[nd.parent].y, pos[v].x, pos[v].y, T, { color: T.border }); D.text(ctx, nd.ch, (pos[nd.parent].x + pos[v].x) / 2 + 8, (pos[nd.parent].y + pos[v].y) / 2, { color: T.text, font: "bold 12px 'JetBrains Mono', monospace" }); } });
        f.nodes.forEach((nd, v) => { if (!pos[v]) return; D.node(ctx, pos[v].x, pos[v].y, 14, nd.pass || (v === 0 ? '' : 0), T, { fill: v === f.cur ? T.accent : nd.end ? T.ok : T.panel, color: v === f.cur || nd.end ? '#fff' : T.text, stroke: 'transparent' }); });
        D.legend(ctx, [[T.ok, 'a word ends here'], [T.accent, 'current node'], [T.panel, 'number = words passing through']], 16, H - 14, T);
      } };
    },
  });
})();
