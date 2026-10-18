/* Visualizers — graphs & trees: BFS grid, DFS components, Dijkstra, topological sort, DSU, Kruskal, tree DFS order, binary lifting, SCC, max flow, Euler path. */
(() => {
  const D = Viz.draw, snap = Viz.snap, L = Viz.layout;

  // random connected undirected graph with n nodes and m edges (no multi-edges), weights optional
  const randGraph = (rng, n, m, weighted) => {
    const edges = [], seen = new Set();
    const add = (a, b) => { if (a === b) return false; const k = a < b ? a + '-' + b : b + '-' + a; if (seen.has(k)) return false; seen.add(k); edges.push({ a, b, w: weighted ? 1 + Math.floor(rng() * 9) : 1 }); return true; };
    for (let v = 1; v < n; v++) add(Math.floor(rng() * v), v);          // spanning tree first
    let guard = 0;
    while (edges.length < Math.min(m, (n * (n - 1)) / 2) && guard++ < 1000) add(Math.floor(rng() * n), Math.floor(rng() * n));
    return edges;
  };
  const drawGraph = (ctx, pos, edges, T, { nodeStyle = () => ({}), edgeStyle = () => ({}), directed = false, r = 16, sub = () => '' } = {}) => {
    edges.forEach((e, i) => { const st = edgeStyle(e, i) || {}; D.edge(ctx, pos[e.a].x, pos[e.a].y, pos[e.b].x, pos[e.b].y, T, { color: st.color, lw: st.lw || 1.5, directed, label: st.label !== undefined ? st.label : (e.w !== undefined && e.showW ? e.w : undefined), r: directed ? r : 0, dash: st.dash }); });
    pos.forEach((p, v) => { const st = nodeStyle(v) || {}; D.node(ctx, p.x, p.y, r, st.label !== undefined ? st.label : v, T, { fill: st.fill, stroke: st.stroke, color: st.color, lw: st.lw, sub: sub(v), subColor: st.subColor }); });
  };

  /* ---------------- BFS on a grid ---------------- */
  Viz.register({
    id: 'bfs-grid', title: 'BFS on a Grid', topic: 'graphs-1', cat: 'graphs',
    desc: 'Breadth-first search from the top-left cell: cells are discovered in order of distance, layer by layer.',
    params: [{ key: 'rows', label: 'Rows', type: 'number', min: 4, max: 10, def: 7 }, { key: 'cols', label: 'Columns', type: 'number', min: 4, max: 14, def: 11 }, { key: 'walls', label: 'Wall %', type: 'number', min: 0, max: 45, def: 25 }],
    code: ['queue<pair<int,int>> q; dist[sr][sc] = 0; q.push({sr, sc});', 'while (!q.empty()) {', '    auto [r, c] = q.front(); q.pop();', '    for (int d = 0; d < 4; d++) {', '        int nr = r + dr[d], nc = c + dc[d];', '        if (!inside(nr, nc) || wall[nr][nc] || dist[nr][nc] != -1) continue;', '        dist[nr][nc] = dist[r][c] + 1; q.push({nr, nc});', '    }', '}'],
    build(p, rng) {
      const R = p.rows, C = p.cols;
      const wall = Array.from({ length: R }, () => Array.from({ length: C }, () => rng() * 100 < p.walls));
      wall[0][0] = false; wall[R - 1][C - 1] = false;
      const dist = Array.from({ length: R }, () => Array(C).fill(-1));
      const frames = []; const q = [[0, 0]]; dist[0][0] = 0; const dr = [1, -1, 0, 0], dc = [0, 0, 1, -1];
      frames.push({ line: 0, dist: snap(dist), q: snap(q), cur: null, text: 'Start at (0,0) with distance 0. The queue holds discovered-but-not-processed cells.' });
      let head = 0;
      while (head < q.length) {
        const [r, c] = q[head++];
        frames.push({ line: 2, dist: snap(dist), q: snap(q.slice(head)), cur: [r, c], text: `Pop (${r},${c}) with distance ${dist[r][c]}; look at its 4 neighbours.` });
        for (let d = 0; d < 4; d++) {
          const nr = r + dr[d], nc = c + dc[d];
          if (nr < 0 || nr >= R || nc < 0 || nc >= C || wall[nr][nc] || dist[nr][nc] !== -1) continue;
          dist[nr][nc] = dist[r][c] + 1; q.push([nr, nc]);
        }
        frames.push({ line: 6, dist: snap(dist), q: snap(q.slice(head)), cur: [r, c], text: `Neighbours of (${r},${c}) that are free and unseen get distance ${dist[r][c] + 1} and join the queue (${q.length - head} waiting).` });
      }
      const reach = dist[R - 1][C - 1];
      frames.push({ line: 8, dist: snap(dist), q: [], cur: null, done: true, text: reach >= 0 ? `Queue empty. Shortest path to the bottom-right corner has ${reach} steps; every reachable cell knows its distance.` : 'Queue empty. The bottom-right corner is unreachable (blocked by walls).' });
      return { frames, height: Math.max(300, R * 40 + 60), draw: (ctx, f, W, H, T) => {
        const cell = Math.min(40, (W - 40) / C, (H - 50) / R), x0 = (W - C * cell) / 2, y0 = 10;
        const maxd = Math.max(1, ...f.dist.flat());
        D.grid(ctx, R, C, x0, y0, cell, T, { style: (r, c) => { if (wall[r][c]) return { fill: T.border }; const d = f.dist[r][c]; if (f.cur && f.cur[0] === r && f.cur[1] === c) return { fill: T.accent, color: '#fff' }; if (f.q.some(([a, b]) => a === r && b === c)) return { fill: T.warn, color: '#fff' }; if (d >= 0) return { fill: `hsl(${140 - (100 * d) / maxd}, 55%, 35%)`, color: '#fff' }; return {}; }, label: (r, c) => (wall[r][c] ? '' : f.dist[r][c] >= 0 ? f.dist[r][c] : '') });
        D.legend(ctx, [[T.accent, 'processing'], [T.warn, 'in queue'], ['hsl(120,55%,35%)', 'visited (distance shown)'], [T.border, 'wall']], 16, H - 16, T);
      } };
    },
  });

  /* ---------------- DFS connected components ---------------- */
  Viz.register({
    id: 'dfs-components', title: 'DFS: Connected Components', topic: 'graphs-1', cat: 'graphs',
    desc: 'Iterative DFS with an explicit stack; each new start discovers one component.',
    params: [{ key: 'n', label: 'Nodes', type: 'number', min: 6, max: 16, def: 11 }, { key: 'm', label: 'Edges', type: 'number', min: 3, max: 20, def: 8 }],
    code: ['for (int s = 0; s < n; s++) {', '    if (comp[s]) continue;', '    comp[s] = ++comps; stack<int> st; st.push(s);', '    while (!st.empty()) {', '        int u = st.top(); st.pop();', '        for (int v : adj[u]) if (!comp[v]) { comp[v] = comps; st.push(v); }', '    }', '}'],
    build(p, rng) {
      const n = p.n; const edges = [], seen = new Set();
      let guard = 0; while (edges.length < p.m && guard++ < 500) { const a = Math.floor(rng() * n), b = Math.floor(rng() * n); if (a === b) continue; const k = a < b ? a + '-' + b : b + '-' + a; if (seen.has(k)) continue; seen.add(k); edges.push({ a, b }); }
      const adj = Array.from({ length: n }, () => []); edges.forEach((e) => { adj[e.a].push(e.b); adj[e.b].push(e.a); });
      const pos = L.force(n, edges.map((e) => [e.a, e.b]), 600, 330, rng);
      const comp = Array(n).fill(0); let comps = 0; const frames = [];
      frames.push({ line: 0, comp: snap(comp), st: [], cur: -1, text: `${n} nodes, ${edges.length} edges. Loop over all nodes; start a DFS from each unvisited one.` });
      for (let s = 0; s < n; s++) {
        if (comp[s]) continue;
        comps++; comp[s] = comps; const st = [s];
        frames.push({ line: 2, comp: snap(comp), st: snap(st), cur: s, text: `Node ${s} is unvisited → new component #${comps}. Push it.` });
        while (st.length) {
          const u = st.pop();
          frames.push({ line: 4, comp: snap(comp), st: snap(st), cur: u, text: `Pop ${u}; mark its unvisited neighbours with component #${comps}.` });
          for (const v of adj[u]) if (!comp[v]) { comp[v] = comps; st.push(v); }
          frames.push({ line: 5, comp: snap(comp), st: snap(st), cur: u, text: `Neighbours pushed. Stack: [${st.join(', ')}].` });
        }
      }
      frames.push({ line: 7, comp: snap(comp), st: [], cur: -1, done: true, text: `Done: **${comps}** connected components.` });
      const palette = ['#6ea8fe', '#3fb950', '#bc8cff', '#f0883e', '#39c5bb', '#d29922', '#f85149', '#79c0ff', '#56d364', '#d2a8ff'];
      return { frames, height: 340, draw: (ctx, f, W, H, T) => {
        const sx = W / 600; const P = pos.map((q) => ({ x: q.x * sx, y: q.y }));
        drawGraph(ctx, P, edges, T, { nodeStyle: (v) => (v === f.cur ? { fill: T.text, color: T.bg, stroke: T.text } : f.comp[v] ? { fill: palette[(f.comp[v] - 1) % palette.length], color: '#fff', stroke: 'transparent' } : f.st.includes(v) ? { stroke: T.warn, lw: 3 } : {}) });
        D.text(ctx, `components: ${Math.max(0, ...f.comp)}   stack: [${f.st.join(' ')}]`, 12, H - 14, { color: T.muted, font: T.mono, align: 'left' });
      } };
    },
  });

  /* ---------------- Dijkstra ---------------- */
  Viz.register({
    id: 'dijkstra', title: 'Dijkstra’s Algorithm', topic: 'shortest-paths', cat: 'graphs',
    desc: 'Pop the closest unfinished node, relax its edges. Once popped, a node’s distance is final (non-negative weights).',
    params: [{ key: 'n', label: 'Nodes', type: 'number', min: 5, max: 12, def: 8 }, { key: 'm', label: 'Edges', type: 'number', min: 5, max: 20, def: 12 }],
    code: ['dist[s] = 0; pq.push({0, s});', 'while (!pq.empty()) {', '    auto [d, u] = pq.top(); pq.pop();', '    if (d > dist[u]) continue;          // stale', '    for (auto [v, w] : adj[u])', '        if (dist[u] + w < dist[v]) {', '            dist[v] = dist[u] + w; par[v] = u; pq.push({dist[v], v});', '        }', '}'],
    build(p, rng) {
      const n = p.n, edges = randGraph(rng, n, p.m, true); edges.forEach((e) => (e.showW = true));
      const adj = Array.from({ length: n }, () => []); edges.forEach((e, i) => { adj[e.a].push({ v: e.b, w: e.w, i }); adj[e.b].push({ v: e.a, w: e.w, i }); });
      const pos = L.force(n, edges.map((e) => [e.a, e.b]), 600, 330, rng);
      const INF = Infinity, dist = Array(n).fill(INF), par = Array(n).fill(-1), done = Array(n).fill(false); const frames = [];
      let pq = [[0, 0]]; dist[0] = 0;
      frames.push({ line: 0, dist: snap(dist.map((d) => (d === INF ? null : d))), par: snap(par), done: snap(done), cur: -1, pq: snap(pq), text: 'Source 0 has distance 0; all others ∞. Priority queue holds (distance, node).' });
      while (pq.length) {
        pq.sort((x, y) => x[0] - y[0]); const [d, u] = pq.shift();
        if (d > dist[u]) { frames.push({ line: 3, dist: snap(dist.map((x) => (x === INF ? null : x))), par: snap(par), done: snap(done), cur: u, pq: snap(pq), text: `Pop (${d}, ${u}) — stale (dist[${u}] = ${dist[u]} is better). Skip.` }); continue; }
        done[u] = true;
        frames.push({ line: 2, dist: snap(dist.map((x) => (x === INF ? null : x))), par: snap(par), done: snap(done), cur: u, pq: snap(pq), text: `Pop (${d}, ${u}): node ${u} is now final with distance ${d}.` });
        for (const { v, w } of adj[u]) if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; par[v] = u; pq.push([dist[v], v]); frames.push({ line: 6, dist: snap(dist.map((x) => (x === INF ? null : x))), par: snap(par), done: snap(done), cur: u, relax: v, pq: snap(pq), text: `Relax edge ${u}→${v} (w=${w}): dist[${v}] = ${dist[v]}. Push it.` }); }
      }
      frames.push({ line: 8, dist: snap(dist.map((x) => (x === INF ? null : x))), par: snap(par), done: snap(done), cur: -1, pq: [], finished: true, text: `Queue empty. Final distances: ${dist.map((x, i) => `${i}:${x}`).join(' ')}. Bold edges form the shortest-path tree.` });
      return { frames, height: 340, draw: (ctx, f, W, H, T) => {
        const sx = W / 600; const P = pos.map((q) => ({ x: q.x * sx, y: q.y }));
        const treeEdge = (e) => (f.par[e.b] === e.a || f.par[e.a] === e.b);
        drawGraph(ctx, P, edges, T, { edgeStyle: (e) => (treeEdge(e) ? { color: T.ok, lw: 3 } : {}), nodeStyle: (v) => (v === f.cur ? { fill: T.accent, color: '#fff', stroke: T.accent } : f.done[v] ? { fill: T.ok, color: '#fff', stroke: T.ok } : f.relax === v ? { stroke: T.warn, lw: 3 } : {}), sub: (v) => (f.dist[v] === null ? '∞' : f.dist[v]) });
        D.text(ctx, 'pq: ' + f.pq.map(([d, v]) => `(${d},${v})`).join(' '), 12, H - 14, { color: T.muted, font: "11px 'JetBrains Mono', monospace", align: 'left' });
      } };
    },
  });

  /* ---------------- topological sort (Kahn) ---------------- */
  Viz.register({
    id: 'topo-sort', title: 'Topological Sort (Kahn)', topic: 'topo-sort', cat: 'graphs',
    desc: 'Repeatedly remove a node with in-degree 0. If nodes remain with positive in-degree, there is a cycle.',
    params: [{ key: 'n', label: 'Nodes', type: 'number', min: 5, max: 12, def: 8 }, { key: 'm', label: 'Edges', type: 'number', min: 4, max: 18, def: 10 }, { key: 'cycle', label: 'Add a cycle?', type: 'select', def: 'no', options: [{ value: 'no', label: 'no (DAG)' }, { value: 'yes', label: 'yes' }] }],
    code: ['for (u) for (v : adj[u]) indeg[v]++;', 'queue<int> q; for (u) if (indeg[u] == 0) q.push(u);', 'while (!q.empty()) {', '    int u = q.front(); q.pop(); order.push_back(u);', '    for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);', '}', 'if (order.size() < n) -> cycle'],
    build(p, rng) {
      const n = p.n; const perm = Array.from({ length: n }, (_, i) => i).sort(() => rng() - 0.5);
      const edges = [], seen = new Set(); let guard = 0;
      while (edges.length < p.m && guard++ < 500) { let a = Math.floor(rng() * n), b = Math.floor(rng() * n); if (a === b) continue; if (perm.indexOf(a) > perm.indexOf(b)) [a, b] = [b, a]; const k = a + '>' + b; if (seen.has(k)) continue; seen.add(k); edges.push({ a, b }); }
      if (p.cycle === 'yes' && edges.length) { const e = edges[Math.floor(rng() * edges.length)]; if (!seen.has(e.b + '>' + e.a)) edges.push({ a: e.b, b: e.a }); }
      const adj = Array.from({ length: n }, () => []); edges.forEach((e) => adj[e.a].push(e.b));
      const pos = L.force(n, edges.map((e) => [e.a, e.b]), 600, 330, rng);
      const indeg = Array(n).fill(0); edges.forEach((e) => indeg[e.b]++);
      const frames = [], order = []; let q = [];
      for (let u = 0; u < n; u++) if (indeg[u] === 0) q.push(u);
      frames.push({ line: 1, indeg: snap(indeg), q: snap(q), order: [], cur: -1, text: `In-degrees computed. Nodes with in-degree 0 start in the queue: [${q.join(', ')}].` });
      while (q.length) {
        const u = q.shift(); order.push(u);
        frames.push({ line: 3, indeg: snap(indeg), q: snap(q), order: snap(order), cur: u, text: `Pop ${u} → append to the order.` });
        for (const v of adj[u]) { indeg[v]--; if (indeg[v] === 0) q.push(v); }
        frames.push({ line: 4, indeg: snap(indeg), q: snap(q), order: snap(order), cur: u, text: `Decrement in-degrees of ${u}’s successors; those reaching 0 join the queue: [${q.join(', ')}].` });
      }
      frames.push({ line: 6, indeg: snap(indeg), q: [], order: snap(order), cur: -1, done: true, text: order.length < n ? `Only ${order.length} of ${n} nodes processed → the remaining nodes lie on a **cycle**.` : `All ${n} nodes processed. Topological order: ${order.join(' → ')}.` });
      return { frames, height: 340, draw: (ctx, f, W, H, T) => {
        const sx = W / 600; const P = pos.map((q) => ({ x: q.x * sx, y: q.y }));
        drawGraph(ctx, P, edges, T, { directed: true, nodeStyle: (v) => (v === f.cur ? { fill: T.accent, color: '#fff', stroke: T.accent } : f.order.includes(v) ? { fill: T.ok, color: '#fff', stroke: T.ok } : f.q.includes(v) ? { stroke: T.warn, lw: 3 } : f.done && !f.order.includes(v) ? { fill: T.danger, color: '#fff', stroke: T.danger } : {}), sub: (v) => `in ${f.indeg[v]}` });
        D.text(ctx, 'order: ' + f.order.join(' → '), 12, H - 14, { color: T.text, font: "11px 'JetBrains Mono', monospace", align: 'left' });
      } };
    },
  });

  /* ---------------- DSU ---------------- */
  Viz.register({
    id: 'dsu', title: 'Disjoint Set Union', topic: 'dsu', cat: 'graphs',
    desc: 'Union by size with path compression. Watch the forest stay shallow as unions happen and finds flatten paths.',
    params: [{ key: 'n', label: 'Elements', type: 'number', min: 5, max: 14, def: 10 }, { key: 'ops', label: 'Random unions', type: 'number', min: 3, max: 16, def: 9 }],
    code: ['int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }', 'bool unite(int a, int b) {', '    a = find(a); b = find(b);', '    if (a == b) return false;', '    if (sz[a] < sz[b]) swap(a, b);', '    p[b] = a; sz[a] += sz[b]; return true;', '}'],
    build(p, rng) {
      const n = p.n; const par = Array.from({ length: n }, (_, i) => i), sz = Array(n).fill(1); const frames = [];
      const findPath = (x) => { const path = []; while (par[x] !== x) { path.push(x); x = par[x]; } return { root: x, path }; };
      frames.push({ line: 0, par: snap(par), hl: [], text: `${n} singleton sets. Each element is its own root.` });
      for (let k = 0; k < p.ops; k++) {
        let a = Math.floor(rng() * n), b = Math.floor(rng() * n); if (a === b) b = (b + 1) % n;
        const fa = findPath(a), fb = findPath(b);
        frames.push({ line: 2, par: snap(par), hl: [a, b], text: `unite(${a}, ${b}): find(${a}) = ${fa.root}, find(${b}) = ${fb.root}.` });
        fa.path.forEach((x) => (par[x] = fa.root)); fb.path.forEach((x) => (par[x] = fb.root));
        if (fa.path.length > 1 || fb.path.length > 1) frames.push({ line: 0, par: snap(par), hl: [...fa.path, ...fb.path], text: 'Path compression: every node visited by find now points directly to its root.' });
        if (fa.root === fb.root) { frames.push({ line: 3, par: snap(par), hl: [a, b], text: `Same root ${fa.root} → already connected, nothing to do.` }); continue; }
        let ra = fa.root, rb = fb.root; if (sz[ra] < sz[rb]) [ra, rb] = [rb, ra];
        par[rb] = ra; sz[ra] += sz[rb];
        frames.push({ line: 5, par: snap(par), hl: [ra, rb], text: `Attach the smaller tree (root ${rb}, size ${sz[ra] - sz[rb]}) under the larger (root ${ra}); new size ${sz[ra]}.` });
      }
      const roots = par.filter((x, i) => x === i).length;
      frames.push({ line: 6, par: snap(par), hl: [], done: true, text: `${roots} sets remain. Union by size keeps depth O(log n); compression makes it effectively constant.` });
      return { frames, height: 340, draw: (ctx, f, W, H, T) => {
        // layout: forest by depth
        const children = Array.from({ length: n }, () => []); f.par.forEach((pp, v) => { if (pp !== v) children[pp].push(v); });
        const roots = f.par.map((pp, v) => v).filter((v) => f.par[v] === v);
        const posArr = Array(n); let x = 0;
        const place = (u, d) => { const kids = children[u]; if (!kids.length) { posArr[u] = { x: x++, y: d }; return; } kids.forEach((c) => place(c, d + 1)); posArr[u] = { x: (posArr[kids[0]].x + posArr[kids[kids.length - 1]].x) / 2, y: d }; };
        roots.forEach((r) => { place(r, 0); x += 0.6; });
        const totalW = Math.max(1, x - 0.6), pad = 30;
        const P = posArr.map((q) => ({ x: pad + (q.x / totalW) * (W - 2 * pad), y: 40 + q.y * 70 }));
        f.par.forEach((pp, v) => { if (pp !== v) D.edge(ctx, P[v].x, P[v].y, P[pp].x, P[pp].y, T, { color: T.border, directed: true, r: 16 }); });
        P.forEach((q, v) => D.node(ctx, q.x, q.y, 16, v, T, { fill: f.hl.includes(v) ? T.accent : f.par[v] === v ? T.ok : T.panel, color: f.hl.includes(v) || f.par[v] === v ? '#fff' : T.text, stroke: 'transparent' }));
      } };
    },
  });

  /* ---------------- Kruskal ---------------- */
  Viz.register({
    id: 'kruskal', title: 'Kruskal’s MST', topic: 'dsu', cat: 'graphs',
    desc: 'Sort edges by weight; take an edge iff it connects two different components (DSU).',
    params: [{ key: 'n', label: 'Nodes', type: 'number', min: 5, max: 11, def: 8 }, { key: 'm', label: 'Edges', type: 'number', min: 6, max: 18, def: 13 }],
    code: ['sort(edges by weight);', 'DSU d(n); long long total = 0;', 'for (auto [a, b, w] : edges)', '    if (d.unite(a, b)) { total += w; chosen.push_back(edge); }', '    else skip (would create a cycle);'],
    build(p, rng) {
      const n = p.n, edges = randGraph(rng, n, p.m, true); edges.forEach((e) => (e.showW = true));
      const pos = L.force(n, edges.map((e) => [e.a, e.b]), 600, 330, rng);
      const order = edges.map((e, i) => i).sort((i, j) => edges[i].w - edges[j].w);
      const par = Array.from({ length: n }, (_, i) => i); const find = (x) => (par[x] === x ? x : (par[x] = find(par[x])));
      const frames = []; const chosen = [], rejected = []; let total = 0;
      frames.push({ line: 0, chosen: [], rejected: [], cur: -1, total: 0, text: `Edges sorted by weight: ${order.map((i) => edges[i].w).join(', ')}.` });
      for (const i of order) {
        const e = edges[i];
        frames.push({ line: 2, chosen: snap(chosen), rejected: snap(rejected), cur: i, total, text: `Consider edge ${e.a}–${e.b} (w=${e.w}).` });
        const ra = find(e.a), rb = find(e.b);
        if (ra !== rb) { par[ra] = rb; chosen.push(i); total += e.w; frames.push({ line: 3, chosen: snap(chosen), rejected: snap(rejected), cur: i, total, text: `Different components → take it. Total = ${total}.` }); }
        else { rejected.push(i); frames.push({ line: 4, chosen: snap(chosen), rejected: snap(rejected), cur: i, total, text: `Same component → it would close a cycle. Skip.` }); }
        if (chosen.length === n - 1) break;
      }
      frames.push({ line: 3, chosen: snap(chosen), rejected: snap(rejected), cur: -1, total, done: true, text: `MST complete with ${chosen.length} edges, total weight **${total}**.` });
      return { frames, height: 340, draw: (ctx, f, W, H, T) => {
        const sx = W / 600; const P = pos.map((q) => ({ x: q.x * sx, y: q.y }));
        drawGraph(ctx, P, edges, T, { edgeStyle: (e, i) => (i === f.cur ? { color: T.accent, lw: 4 } : f.chosen.includes(i) ? { color: T.ok, lw: 3 } : f.rejected.includes(i) ? { color: T.border, dash: [4, 4] } : {}) });
        D.text(ctx, `total = ${f.total}`, 12, H - 14, { color: T.ok, font: T.mono, align: 'left' });
      } };
    },
  });

  /* ---------------- tree DFS order & subtree sizes ---------------- */
  Viz.register({
    id: 'tree-dfs', title: 'Tree: DFS Order & Subtree Sizes', topic: 'trees-1', cat: 'graphs',
    desc: 'Root the tree, record tin/tout (Euler tour) and compute subtree sizes by folding children into parents.',
    params: [{ key: 'n', label: 'Nodes', type: 'number', min: 5, max: 15, def: 10 }],
    code: ['void dfs(int u, int p) {', '    tin[u] = timer++; sz[u] = 1;', '    for (int v : adj[u]) if (v != p) {', '        dfs(v, u); sz[u] += sz[v];', '    }', '    tout[u] = timer - 1;', '}'],
    build(p, rng) {
      const n = p.n; const parent = [-1]; for (let v = 1; v < n; v++) parent.push(Math.floor(rng() * v));
      const children = Array.from({ length: n }, () => []); for (let v = 1; v < n; v++) children[parent[v]].push(v);
      const tin = Array(n).fill(null), tout = Array(n).fill(null), sz = Array(n).fill(null); let timer = 0; const frames = []; const stack = [];
      frames.push({ line: 0, tin: snap(tin), tout: snap(tout), sz: snap(sz), cur: -1, stack: [], text: 'Root the tree at 0. tin = entry time, tout = exit time, sz = subtree size.' });
      const dfs = (u) => {
        tin[u] = timer++; sz[u] = 1; stack.push(u);
        frames.push({ line: 1, tin: snap(tin), tout: snap(tout), sz: snap(sz), cur: u, stack: snap(stack), text: `Enter ${u}: tin[${u}] = ${tin[u]}.` });
        for (const v of children[u]) { dfs(v); sz[u] += sz[v]; frames.push({ line: 3, tin: snap(tin), tout: snap(tout), sz: snap(sz), cur: u, stack: snap(stack), text: `Back at ${u}: add sz[${v}] = ${sz[v]} → sz[${u}] = ${sz[u]}.` }); }
        tout[u] = timer - 1; stack.pop();
        frames.push({ line: 5, tin: snap(tin), tout: snap(tout), sz: snap(sz), cur: u, stack: snap(stack), text: `Leave ${u}: tout[${u}] = ${tout[u]}. Its subtree occupies Euler-tour positions [${tin[u]}, ${tout[u]}].` });
      };
      dfs(0);
      frames.push({ line: 6, tin: snap(tin), tout: snap(tout), sz: snap(sz), cur: -1, stack: [], done: true, text: 'Every subtree is a contiguous range of the tour — the basis for subtree queries with a Fenwick/segment tree.' });
      return { frames, height: 360, draw: (ctx, f, W, H, T) => {
        const P = L.tree(children, 0, W, 34, 62);
        for (let v = 1; v < n; v++) D.edge(ctx, P[v].x, P[v].y, P[parent[v]].x, P[parent[v]].y, T, { color: f.stack.includes(v) && f.stack.includes(parent[v]) ? T.accent : T.border, lw: 1.5 });
        P.forEach((q, v) => D.node(ctx, q.x, q.y, 15, v, T, { fill: v === f.cur ? T.accent : f.tout[v] !== null ? T.ok : f.tin[v] !== null ? T.warn : T.panel, color: f.tin[v] !== null ? '#fff' : T.text, stroke: 'transparent', sub: f.tin[v] === null ? '' : `${f.tin[v]}${f.tout[v] !== null ? '–' + f.tout[v] : ''}${f.sz[v] !== null && f.tout[v] !== null ? ' sz' + f.sz[v] : ''}`, subColor: T.muted }));
        // euler tour strip
        const tour = Array(n).fill(''); for (let v = 0; v < n; v++) if (f.tin[v] !== null) tour[f.tin[v]] = v;
        const cw = Math.min(30, (W - 40) / n);
        D.array(ctx, tour, (W - n * (cw + 4)) / 2, H - cw - 10, cw, cw, T, { style: (i) => (tour[i] === '' ? { fill: T.bg } : tour[i] === f.cur ? { fill: T.accent, color: '#fff', stroke: 'transparent' } : { fill: T.panel }), font: "11px 'JetBrains Mono', monospace" });
      } };
    },
  });

  /* ---------------- binary lifting / LCA ---------------- */
  Viz.register({
    id: 'binary-lifting', title: 'Binary Lifting & LCA', topic: 'lca', cat: 'graphs',
    desc: 'Jump by powers of two: equalize depths, then lift both nodes while their ancestors differ.',
    params: [{ key: 'n', label: 'Nodes', type: 'number', min: 6, max: 16, def: 12 }],
    code: ['int lca(int a, int b) {', '    if (depth[a] < depth[b]) swap(a, b);', '    for (k) if ((depth[a]-depth[b]) >> k & 1) a = up[k][a];   // equalize', '    if (a == b) return a;', '    for (int k = LOG; k >= 0; k--)', '        if (up[k][a] != up[k][b]) { a = up[k][a]; b = up[k][b]; }', '    return up[0][a];', '}'],
    build(p, rng) {
      const n = p.n; const parent = [0]; const depth = [0]; for (let v = 1; v < n; v++) { const pr = Math.floor(rng() * v); parent.push(pr); depth.push(depth[pr] + 1); }
      const children = Array.from({ length: n }, () => []); for (let v = 1; v < n; v++) children[parent[v]].push(v);
      const LOG = 4; const up = Array.from({ length: LOG + 1 }, () => Array(n).fill(0)); for (let v = 0; v < n; v++) up[0][v] = parent[v];
      for (let k = 1; k <= LOG; k++) for (let v = 0; v < n; v++) up[k][v] = up[k - 1][up[k - 1][v]];
      // pick two deep-ish nodes
      const leaves = Array.from({ length: n }, (_, i) => i).filter((v) => !children[v].length); let a = leaves[Math.floor(rng() * leaves.length)], b = leaves[Math.floor(rng() * leaves.length)]; if (a === b) b = parent[a];
      const a0 = a, b0 = b; const frames = [];
      frames.push({ line: 0, a, b, text: `Find LCA(${a}, ${b}). depth[${a}] = ${depth[a]}, depth[${b}] = ${depth[b]}. up[k][v] = 2ᵏ-th ancestor.` });
      if (depth[a] < depth[b]) { [a, b] = [b, a]; frames.push({ line: 1, a, b, text: `Swap so that a is the deeper node: a = ${a}, b = ${b}.` }); }
      const diff = depth[a] - depth[b];
      for (let k = 0; k <= LOG; k++) if (diff >> k & 1) { const na = up[k][a]; frames.push({ line: 2, a, b, jump: [a, na], text: `Difference ${diff} has bit ${k} set → jump a by 2^${k} = ${1 << k}: ${a} → ${na}.` }); a = na; }
      if (a === b) frames.push({ line: 3, a, b, done: true, text: `Now a == b == ${a}: one was an ancestor of the other. LCA = ${a}.` });
      else {
        frames.push({ line: 3, a, b, text: `Same depth now (${depth[a]}), a = ${a}, b = ${b} differ. Lift both while their 2ᵏ-th ancestors differ, k from high to low.` });
        for (let k = LOG; k >= 0; k--) {
          if (up[k][a] !== up[k][b]) { frames.push({ line: 5, a, b, jump: [a, up[k][a]], jump2: [b, up[k][b]], text: `k = ${k}: up[${k}][${a}] = ${up[k][a]} ≠ up[${k}][${b}] = ${up[k][b]} → jump both by ${1 << k}.` }); a = up[k][a]; b = up[k][b]; }
          else frames.push({ line: 5, a, b, text: `k = ${k}: up[${k}][${a}] = up[${k}][${b}] = ${up[k][a]} — jumping would overshoot the LCA; skip.` });
        }
        frames.push({ line: 6, a, b, done: true, lca: up[0][a], text: `a and b are now children of the LCA. LCA(${a0}, ${b0}) = up[0][${a}] = **${up[0][a]}**.` });
      }
      return { frames, height: 380, draw: (ctx, f, W, H, T) => {
        const P = L.tree(children, 0, W, 30, Math.min(60, (H - 60) / (Math.max(...depth) + 1)));
        for (let v = 1; v < n; v++) D.edge(ctx, P[v].x, P[v].y, P[parent[v]].x, P[parent[v]].y, T, { color: T.border });
        if (f.jump) D.edge(ctx, P[f.jump[0]].x, P[f.jump[0]].y, P[f.jump[1]].x, P[f.jump[1]].y, T, { color: T.accent, lw: 3, directed: true, r: 15, dash: [5, 4] });
        if (f.jump2) D.edge(ctx, P[f.jump2[0]].x, P[f.jump2[0]].y, P[f.jump2[1]].x, P[f.jump2[1]].y, T, { color: T.purple, lw: 3, directed: true, r: 15, dash: [5, 4] });
        P.forEach((q, v) => D.node(ctx, q.x, q.y, 15, v, T, { fill: f.done && (f.lca === v || (f.lca === undefined && f.a === v)) ? T.ok : v === f.a ? T.accent : v === f.b ? T.purple : v === a0 || v === b0 ? T.panel : T.panel, color: (v === f.a || v === f.b || (f.done && f.lca === v)) ? '#fff' : T.text, stroke: v === a0 || v === b0 ? T.warn : 'transparent', lw: 2.5 }));
        D.legend(ctx, [[T.accent, 'a'], [T.purple, 'b'], [T.warn, 'original query nodes (border)'], [T.ok, 'LCA']], 16, H - 14, T);
      } };
    },
  });

  /* ---------------- Tarjan SCC ---------------- */
  Viz.register({
    id: 'scc', title: 'Strongly Connected Components (Tarjan)', topic: 'scc-bridges', cat: 'graphs',
    desc: 'DFS with tin/low values and a stack; when low[u] == tin[u] the stack above u is one SCC.',
    params: [{ key: 'n', label: 'Nodes', type: 'number', min: 5, max: 10, def: 8 }, { key: 'm', label: 'Edges', type: 'number', min: 6, max: 18, def: 11 }],
    code: ['void dfs(int u) {', '    tin[u] = low[u] = timer++; st.push(u); onst[u] = true;', '    for (int v : adj[u]) {', '        if (tin[v] == -1) { dfs(v); low[u] = min(low[u], low[v]); }', '        else if (onst[v]) low[u] = min(low[u], tin[v]);', '    }', '    if (low[u] == tin[u]) { pop stack down to u -> one SCC }', '}'],
    build(p, rng) {
      const n = p.n; const edges = [], seen = new Set(); let guard = 0;
      while (edges.length < p.m && guard++ < 500) { const a = Math.floor(rng() * n), b = Math.floor(rng() * n); if (a === b) continue; const k = a + '>' + b; if (seen.has(k)) continue; seen.add(k); edges.push({ a, b }); }
      const adj = Array.from({ length: n }, () => []); edges.forEach((e) => adj[e.a].push(e.b));
      const pos = L.force(n, edges.map((e) => [e.a, e.b]), 600, 330, rng);
      const tin = Array(n).fill(-1), low = Array(n).fill(-1), comp = Array(n).fill(-1), onst = Array(n).fill(false); let timer = 0, ncomp = 0; const st = []; const frames = [];
      const F = (line, cur, text) => frames.push({ line, tin: snap(tin), low: snap(low), comp: snap(comp), st: snap(st), cur, text });
      const dfs = (u) => {
        tin[u] = low[u] = timer++; st.push(u); onst[u] = true; F(1, u, `Enter ${u}: tin = low = ${tin[u]}; push on stack.`);
        for (const v of adj[u]) {
          if (tin[v] === -1) { dfs(v); low[u] = Math.min(low[u], low[v]); F(3, u, `Back from ${v}: low[${u}] = min(low[${u}], low[${v}]) = ${low[u]}.`); }
          else if (onst[v]) { low[u] = Math.min(low[u], tin[v]); F(4, u, `Edge ${u}→${v} to a node on the stack: low[${u}] = ${low[u]}.`); }
          else F(4, u, `Edge ${u}→${v}: ${v} already belongs to a finished SCC — ignore.`);
        }
        if (low[u] === tin[u]) { const members = []; while (true) { const v = st.pop(); onst[v] = false; comp[v] = ncomp; members.push(v); if (v === u) break; } ncomp++; F(6, u, `low[${u}] == tin[${u}] → pop {${members.join(', ')}} as SCC #${ncomp}.`); }
      };
      F(0, -1, 'Directed graph. Run DFS from every unvisited node.');
      for (let u = 0; u < n; u++) if (tin[u] === -1) dfs(u);
      frames.push({ line: 7, tin: snap(tin), low: snap(low), comp: snap(comp), st: [], cur: -1, done: true, text: `${ncomp} strongly connected components (numbered in reverse topological order: #1 is a sink).` });
      const palette = ['#6ea8fe', '#3fb950', '#bc8cff', '#f0883e', '#39c5bb', '#d29922', '#f85149', '#79c0ff', '#56d364', '#d2a8ff'];
      return { frames, height: 340, draw: (ctx, f, W, H, T) => {
        const sx = W / 600; const P = pos.map((q) => ({ x: q.x * sx, y: q.y }));
        drawGraph(ctx, P, edges, T, { directed: true, nodeStyle: (v) => (v === f.cur ? { fill: T.text, color: T.bg, stroke: T.text } : f.comp[v] >= 0 ? { fill: palette[f.comp[v] % palette.length], color: '#fff', stroke: 'transparent' } : f.st.includes(v) ? { stroke: T.warn, lw: 3 } : {}), sub: (v) => (f.tin[v] >= 0 ? `${f.tin[v]}/${f.low[v]}` : '') });
        D.text(ctx, 'stack: [' + f.st.join(' ') + ']   labels: tin/low', 12, H - 14, { color: T.muted, font: "11px 'JetBrains Mono', monospace", align: 'left' });
      } };
    },
  });

  /* ---------------- max flow (Edmonds–Karp) ---------------- */
  Viz.register({
    id: 'max-flow', title: 'Max Flow: Augmenting Paths', topic: 'flows', cat: 'graphs',
    desc: 'Edmonds–Karp: BFS finds a shortest augmenting path in the residual graph; push the bottleneck; repeat.',
    params: [{ key: 'n', label: 'Nodes', type: 'number', min: 4, max: 8, def: 6 }],
    code: ['while (true) {', '    BFS from s in the residual graph (edges with cap > 0)', '    if (t not reached) break;', '    f = min residual capacity along the path', '    for each edge on the path: cap -= f, reverse cap += f', '    flow += f;', '}'],
    build(p, rng) {
      const n = p.n, s = 0, t = n - 1; const edges = []; const seen = new Set();
      const add = (a, b, c) => { const k = a + '>' + b; if (a === b || seen.has(k) || seen.has(b + '>' + a)) return; seen.add(k); edges.push({ a, b, cap: c, flow: 0 }); };
      for (let v = 1; v < n; v++) add(Math.floor(rng() * v), v, 2 + Math.floor(rng() * 8));
      for (let i = 0; i < n; i++) { let a = Math.floor(rng() * (n - 1)), b = a + 1 + Math.floor(rng() * (n - 1 - a)); add(a, b, 2 + Math.floor(rng() * 8)); }
      edges.forEach((e) => { if (e.b === s) [e.a, e.b] = [e.b, e.a]; if (e.a === t) [e.a, e.b] = [e.b, e.a]; });
      const pos = L.force(n, edges.map((e) => [e.a, e.b]), 600, 330, rng); pos[s].x = 40; pos[t].x = 560;
      const res = edges.map((e) => e.cap), rev = edges.map(() => 0); const frames = []; let flow = 0;
      const snapE = () => edges.map((e, i) => ({ ...e, res: res[i], flow: e.cap - res[i] }));
      frames.push({ line: 0, E: snapE(), path: [], flow, text: `Source ${s}, sink ${t}. Labels show flow/capacity.` });
      while (true) {
        // BFS over residual: forward edges with res>0, backward edges with rev>0
        const par = Array(n).fill(null); par[s] = { v: -1 }; const q = [s];
        while (q.length && par[t] === null) { const u = q.shift(); edges.forEach((e, i) => { if (e.a === u && res[i] > 0 && par[e.b] === null) { par[e.b] = { v: u, i, dir: 1 }; q.push(e.b); } if (e.b === u && rev[i] > 0 && par[e.a] === null) { par[e.a] = { v: u, i, dir: -1 }; q.push(e.a); } }); }
        if (par[t] === null) { frames.push({ line: 2, E: snapE(), path: [], flow, done: true, text: `No augmenting path left. Maximum flow = **${flow}**. Nodes reachable from s form the min cut’s source side.` }); break; }
        const path = []; let v = t, f = Infinity; while (v !== s) { const pr = par[v]; path.push(pr.i); f = Math.min(f, pr.dir === 1 ? res[pr.i] : rev[pr.i]); v = pr.v; }
        frames.push({ line: 1, E: snapE(), path: snap(path), flow, text: `BFS found an augmenting path with ${path.length} edges; bottleneck = ${f}.` });
        path.forEach((i) => { const pr = Object.values(par).find((x) => x && x.i === i); if (pr.dir === 1) { res[i] -= f; rev[i] += f; } else { res[i] += f; rev[i] -= f; } });
        flow += f;
        frames.push({ line: 5, E: snapE(), path: snap(path), flow, text: `Push ${f} units along it. Total flow = ${flow}.` });
      }
      return { frames, height: 340, draw: (ctx, f, W, H, T) => {
        const sx = W / 600; const P = pos.map((q) => ({ x: q.x * sx, y: q.y }));
        f.E.forEach((e, i) => D.edge(ctx, P[e.a].x, P[e.a].y, P[e.b].x, P[e.b].y, T, { color: f.path.includes(i) ? T.accent : e.flow === e.cap ? T.danger : e.flow > 0 ? T.ok : T.border, lw: f.path.includes(i) ? 3.5 : 1.5 + 2 * (e.flow / e.cap), directed: true, r: 16, label: `${e.flow}/${e.cap}` }));
        P.forEach((q, v) => D.node(ctx, q.x, q.y, 16, v === s ? 's' : v === t ? 't' : v, T, { fill: v === s || v === t ? T.accent : T.panel, color: v === s || v === t ? '#fff' : T.text, stroke: 'transparent' }));
        D.text(ctx, `flow = ${f.flow}`, 12, H - 14, { color: T.ok, font: T.mono, align: 'left' });
        D.legend(ctx, [[T.accent, 'augmenting path'], [T.ok, 'carries flow'], [T.danger, 'saturated']], 110, H - 14, T);
      } };
    },
  });

  /* ---------------- Euler path (Hierholzer) ---------------- */
  Viz.register({
    id: 'euler-path', title: 'Euler Circuit (Hierholzer)', topic: 'advanced-graphs', cat: 'graphs',
    desc: 'Walk greedily along unused edges; when stuck, record the vertex and backtrack. The recorded sequence (reversed) is the circuit.',
    params: [{ key: 'n', label: 'Nodes', type: 'number', min: 4, max: 9, def: 6 }],
    code: ['stack<int> st = {start}; vector<int> circuit;', 'while (!st.empty()) {', '    int u = st.top();', '    if (ptr[u] < adj[u].size()) { take next unused edge u->v; st.push(v); }', '    else { circuit.push_back(u); st.pop(); }', '}', 'reverse(circuit);'],
    build(p, rng) {
      // build an Eulerian undirected graph: union of random cycles
      const n = p.n; const edges = []; const key = (a, b) => (a < b ? a + '-' + b : b + '-' + a); const seen = new Set();
      const addCycle = (nodes) => { for (let i = 0; i < nodes.length; i++) { const a = nodes[i], b = nodes[(i + 1) % nodes.length]; if (a !== b && !seen.has(key(a, b))) { seen.add(key(a, b)); edges.push({ a, b, used: false }); } } };
      const all = Array.from({ length: n }, (_, i) => i); addCycle(all);
      for (let c = 0; c < 2; c++) { const sub = all.filter(() => rng() < 0.6); if (sub.length >= 3) addCycle(sub.sort(() => rng() - 0.5)); }
      // ensure even degrees: cycles of distinct vertices keep parity even only if edges not duplicated; duplicates were skipped -> fix by removing cycles that would break parity: recompute and drop odd vertices' cycles simplistically
      const deg = Array(n).fill(0); edges.forEach((e) => { deg[e.a]++; deg[e.b]++; });
      const odd = all.filter((v) => deg[v] % 2); for (let i = 0; i + 1 < odd.length; i += 2) if (!seen.has(key(odd[i], odd[i + 1]))) { seen.add(key(odd[i], odd[i + 1])); edges.push({ a: odd[i], b: odd[i + 1], used: false }); } else { const idx = edges.findIndex((e) => key(e.a, e.b) === key(odd[i], odd[i + 1])); edges.splice(idx, 1); }
      const adj = Array.from({ length: n }, () => []); edges.forEach((e, i) => { adj[e.a].push({ v: e.b, i }); adj[e.b].push({ v: e.a, i }); });
      const pos = L.circle(n, 300, 165, 120);
      const used = edges.map(() => false), ptr = Array(n).fill(0); const st = [0], circuit = []; const frames = [];
      const F = (line, text) => frames.push({ line, used: snap(used), st: snap(st), circuit: snap(circuit), text });
      F(0, `All degrees are even → an Euler circuit exists. Start at 0.`);
      let guard = 0;
      while (st.length && guard++ < 500) {
        const u = st[st.length - 1];
        while (ptr[u] < adj[u].length && used[adj[u][ptr[u]].i]) ptr[u]++;
        if (ptr[u] < adj[u].length) { const { v, i } = adj[u][ptr[u]]; used[i] = true; st.push(v); F(3, `From ${u} take unused edge to ${v}. Stack: [${st.join(' ')}].`); }
        else { circuit.push(u); st.pop(); F(4, `${u} has no unused edges → append ${u} to the circuit and backtrack.`); }
      }
      circuit.reverse();
      frames.push({ line: 6, used: snap(used), st: [], circuit: snap(circuit), done: true, text: `Reversed circuit: ${circuit.join(' → ')} — every edge used exactly once.` });
      return { frames, height: 340, draw: (ctx, f, W, H, T) => {
        const sx = W / 600; const P = pos.map((q) => ({ x: q.x * sx, y: q.y }));
        edges.forEach((e, i) => D.edge(ctx, P[e.a].x, P[e.a].y, P[e.b].x, P[e.b].y, T, { color: f.used[i] ? T.ok : T.border, lw: f.used[i] ? 3 : 1.5 }));
        P.forEach((q, v) => D.node(ctx, q.x, q.y, 16, v, T, { fill: f.st.length && f.st[f.st.length - 1] === v ? T.accent : f.st.includes(v) ? T.warn : T.panel, color: f.st.includes(v) ? '#fff' : T.text, stroke: 'transparent' }));
        D.text(ctx, 'stack: [' + f.st.join(' ') + ']   circuit: ' + f.circuit.join(' '), 12, H - 14, { color: T.muted, font: "11px 'JetBrains Mono', monospace", align: 'left' });
      } };
    },
  });
})();
