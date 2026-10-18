/* Lessons — graphs & trees: BFS/DFS, shortest paths, DSU/MST, DAGs, trees, LCA, SCC/bridges, flows, advanced graphs, HLD/centroid. */
window.LESSONS = window.LESSONS || {};

LESSONS['graphs-1'] = { md: String.raw`
## Representing a graph
~~~cpp
int n, m; cin >> n >> m;
vector<vector<int>> adj(n + 1);              // adjacency list, nodes 1..n
for (int i = 0; i < m; i++) { int a, b; cin >> a >> b; adj[a].push_back(b); adj[b].push_back(a); }   // undirected
~~~
Weighted: ''vector<vector<pair<int,int>>>'' with (neighbour, weight). Adjacency matrices only for n ≤ ~3000. Edge lists for Kruskal/Bellman–Ford. Grids are graphs too: cell (r, c) with neighbours in 4 (or 8) directions — never build the adjacency list explicitly, just iterate the direction arrays.

## BFS — shortest paths in unweighted graphs
~~~cpp
vector<int> dist(n + 1, -1), par(n + 1, -1);
queue<int> q; q.push(s); dist[s] = 0;
while (!q.empty()) {
    int u = q.front(); q.pop();
    for (int v : adj[u]) if (dist[v] == -1) { dist[v] = dist[u] + 1; par[v] = u; q.push(v); }
}
~~~
Nodes are visited in order of distance, so the first time you see a node you know its shortest distance. Path reconstruction: walk ''par'' from the target. **Multi-source BFS**: push all sources with distance 0 (distance to the nearest source, [[problem:cses-1194]]). Watch [[viz:bfs-grid]].

## DFS — structure of the graph
~~~cpp
void dfs(int u) {
    vis[u] = true;
    for (int v : adj[u]) if (!vis[v]) dfs(v);
}
~~~
Recursive is fine up to depth ~10⁵; deeper (long paths, big grids) needs an iterative version with an explicit stack (Cheat Sheet: ''bfs-dfs-adjacency''). DFS gives you: connected components ([[viz:dfs-components]]), an ordering (pre/post), tree edges vs back edges (cycles), and the entry/exit times used by everything in [[topic:trees-1]].

## Connected components
Loop over all nodes; start a BFS/DFS from each unvisited one; label everything reached. Count = number of starts ([[problem:cses-1192]], [[problem:cses-1666]]). For "connect all components" answers, one edge per extra component.

## Bipartite check (2-colouring)
BFS/DFS assigning colours 0/1 alternately; an edge between equal colours → not bipartite (there is an odd cycle) ([[problem:cses-1668]]). Bipartite graphs are where matching algorithms apply ([[topic:flows]]).

## Cycle detection
- Undirected: a DFS edge to an already visited node that is not the parent (compare edge ids to survive multi-edges). Output the cycle with parent pointers ([[problem:cses-1669]]).
- Directed: three colours white/grey/black; an edge to a **grey** node closes a cycle ([[problem:cses-1678]]). Or: Kahn’s algorithm leaves nodes unprocessed ([[topic:topo-sort]]).

## Grid graphs
~~~cpp
const int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
auto inside = [&](int r, int c) { return 0 <= r && r < R && 0 <= c && c < C; };
~~~
Flood fill = BFS/DFS on the grid. Encode a cell as r·C + c if you need it in a DSU or as a key. 8 directions: add the diagonals. Knight moves: 8 fixed offsets.

## Modelling: the state is the vertex
Many problems are BFS on a graph you must *invent*: states = (position, keys collected), (value on a display), (position of two robots), (node, parity of steps). If moves are unit-cost and the state space is ≤ ~10⁷, BFS solves it ([[problem:cf-520B]]).

:::pitfall
Forgetting ''vis'' reset between test cases; recursion depth on 10⁶ nodes; using ''dist[v] == 0'' as "unvisited" when the source has distance 0; treating a directed graph as undirected (read the statement!); 1-indexed input into 0-indexed arrays.
:::

:::seerc
One or two SEERC problems every year are "model it as a graph, then BFS/DFS". They are often the easiest problems in the set for teams who see the graph. The [[viz:bfs-grid]] and [[viz:dfs-components]] visualizers show the traversal orders.
:::
` };

LESSONS['shortest-paths'] = { md: String.raw`
## Choosing the algorithm
| Situation | Algorithm | Complexity |
|---|---|---|
| Unit weights | BFS | O(n + m) |
| Weights in {0, 1} | 0-1 BFS (deque) | O(n + m) |
| Non-negative weights, one source | Dijkstra | O((n + m) log m) |
| Negative weights, one source / detect negative cycles | Bellman–Ford (SPFA) | O(nm) |
| All pairs, n ≤ 500 | Floyd–Warshall | O(n³) |
| DAG | DP in topological order | O(n + m) |
| Small integer weights ≤ W | Dial’s buckets | O(n·W + m) |

## Dijkstra done right
~~~cpp
priority_queue<pair<ll,int>, vector<pair<ll,int>>, greater<>> pq;
vector<ll> dist(n, INF); dist[s] = 0; pq.push({0, s});
while (!pq.empty()) {
    auto [d, u] = pq.top(); pq.pop();
    if (d > dist[u]) continue;                       // stale entry — the key line
    for (auto [v, w] : adj[u])
        if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; par[v] = u; pq.push({dist[v], v}); }
}
~~~
Why it works: with non-negative weights, the smallest tentative distance in the queue is final. Negative edges break this. Watch [[viz:dijkstra]] — the popped node turns final each step.

**Do not** use ''set<pair>'' with erase for "decrease key" — the lazy version above is simpler and just as fast. **Do** use long long for distances (10⁵ edges × 10⁹ weight).

## State-expanded graphs
Add a small extra dimension to the node: (city, coupon used) for one discounted edge ([[problem:cses-1195]]), (node, k mod something), (node, fuel left), (node, number of visits). Run Dijkstra on the expanded graph; the answer is min over the extra dimension at the target. This single idea solves a huge class of "shortest path with a twist" problems.

## Counting/extra statistics along shortest paths
Number of shortest paths, min/max number of edges on a shortest path ([[problem:cses-1202]]): when relaxing, if the new distance is *strictly* smaller, reset the statistics; if *equal*, combine them. Counts modulo a prime.

## Bellman–Ford
Relax all edges n − 1 times; if the n-th pass still improves something, a negative cycle is reachable. To extract the cycle: remember the last relaxed node, walk parents n times to get inside the cycle, then follow parents until you return ([[problem:cses-1197]]). For "longest path in a graph with positive cycles" negate the weights ([[problem:cses-1673]]) — and check that the cycle actually lies on a path from s to t (reachability both ways).

## Floyd–Warshall
~~~cpp
for (k) for (i) for (j) d[i][j] = min(d[i][j], d[i][k] + d[k][j]);   // k must be the OUTER loop
~~~
Handles negative edges; d[i][i] < 0 afterwards signals a negative cycle. Also gives the transitive closure with booleans, and "min-max" paths with (max, min) instead of (+, min). Keep INF at ~4·10¹⁸/4 and check before adding to avoid overflow.

## 0-1 BFS and Dial
Weights 0/1: deque, push front for weight 0, back for weight 1 — nodes are popped in distance order without a heap. Weights ≤ W small: W + 1 buckets, cyclic.

## k shortest walks
Run Dijkstra but allow each node to be popped up to k times; the i-th pop of the target is the i-th shortest walk ([[problem:cses-1196]]).

:::pitfall
Negative edge + Dijkstra (silently wrong); ''int'' distances overflow; missing the stale-entry check (still correct but O(m log m) pushes each processed fully — usually TLE); using ''INT_MAX'' as INF and then adding to it; ''dist[v] == -1'' checks on weighted graphs (use INF).
:::

:::seerc
Shortest-path problems are the most reliable SEERC graph problem: almost every set has one, usually with a state-expansion twist. Dijkstra should be a 90-second write from memory.
:::
` };

LESSONS['dsu'] = { md: String.raw`
## Disjoint Set Union (Union–Find)
Maintains a partition of {0..n−1} into sets under two operations: ''find(x)'' — which set is x in (a representative), ''unite(a, b)'' — merge the sets. With **path compression** and **union by size/rank** each operation is amortized O(α(n)) ≈ constant.
~~~cpp
struct DSU {
    vector<int> p, sz;
    DSU(int n) : p(n), sz(n, 1) { iota(p.begin(), p.end(), 0); }
    int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }     // compress the path
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);                                   // attach smaller under larger
        p[b] = a; sz[a] += sz[b];
        return true;
    }
};
~~~
[[viz:dsu]] shows the forest flattening as ''find'' compresses paths.

## What DSU is for
- Incremental connectivity: "add an edge, are u and v connected?" online ([[problem:cses-1676]]).
- Cycle detection while adding edges: ''unite'' returns false ⇒ the edge closes a cycle.
- Grouping by an equivalence relation (same colour, same row/column, equal strings…) ([[problem:cf-217A]], [[problem:cf-1263D]]).
- Kruskal’s MST. Offline reverse processing of deletions ([[problem:cf-1213G]]).
- Extra per-set data: size, sum, min, count of something — update at the root on union. Parity/bipartiteness: store the parity of the path to the root, and detect odd cycles.

## Minimum spanning tree
**Kruskal**: sort edges by weight; add each edge whose endpoints are in different sets. O(m log m). Also gives: the *maximum* spanning tree (reverse order), "minimum bottleneck path" (first edge connecting u and v in sorted order), and the number of components after processing edges up to weight w. [[viz:kruskal]].
**Prim**: grow from one vertex with a heap of crossing edges, O(m log n); simpler for dense graphs stored as matrices (O(n²) version).
Properties worth knowing: the MST is unique when all weights are distinct; the MST minimises the maximum edge (bottleneck); any cut’s lightest edge is in some MST (cut property); the heaviest edge on a cycle is in no MST (cycle property).

## Offline tricks
- **Reverse time**: deletions become insertions. "After removing edges one by one, when do u and v disconnect?" → add edges in reverse ([[problem:cses-2101]] with edge indices as answers).
- **Sort queries by threshold**: "count pairs connected using edges ≤ w" → process edges and queries in increasing weight, adding size_a·size_b pairs on each union ([[problem:cf-1213G]]).
- **Kruskal reconstruction tree**: make each union create a new node with the edge weight; then "max edge on the path between u and v" = weight of their LCA ([[topic:lca]]).

## DSU with rollback
Union by size *without* path compression can be undone in O(1) by remembering what changed. Used with a segment tree over time for offline dynamic connectivity ([[topic:advanced-graphs]], [[problem:cses-2133]]).

:::pitfall
Forgetting to ''find'' both endpoints before comparing; recursion depth of ''find'' on a chain *before* compression (fine with union by size, since depth is O(log n)); using DSU for *deletions* (it cannot — think offline/reverse); treating DSU roots as stable ids (they change on union).
:::

:::seerc
DSU is small enough to write from memory in a minute and appears in several SEERC problems each year, often as a component (MST, offline queries, grouping). Kruskal + "process in sorted order" is a pattern to look for whenever weights and connectivity meet.
:::
` };

LESSONS['topo-sort'] = { md: String.raw`
## DAGs and topological order
A directed graph without cycles (DAG) can be ordered so every edge goes from earlier to later. That order lets you run DP over the graph: when you process a node, everything that feeds into it is finished.

## Kahn’s algorithm (BFS style)
~~~cpp
vector<int> indeg(n), order;
for (u) for (v : adj[u]) indeg[v]++;
queue<int> q;                                   // priority_queue<int, vector<int>, greater<int>> for the lexicographically smallest order
for (u) if (indeg[u] == 0) q.push(u);
while (!q.empty()) {
    int u = q.front(); q.pop(); order.push_back(u);
    for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);
}
if (order.size() < n) { /* cycle: the remaining nodes have indeg > 0 */ }
~~~
[[viz:topo-sort]] shows in-degrees dropping and nodes entering the queue. DFS alternative: reverse post-order of a DFS is a topological order (grey-node detection finds cycles).

## DP on DAGs
Process nodes in topological order:
- Longest path (in edges or with weights): dp[v] = max over predecessors dp[u] + w ([[problem:cses-1680]], [[problem:ac-dp_g]]).
- Number of paths from s: dp[s] = 1, dp[v] += dp[u] ([[problem:cses-1681]]) — counts can be exponential, so mod.
- Reachability sets with bitsets in reverse topological order ([[problem:cses-2138]]).
- Minimum number of paths to cover a DAG, "earliest completion time" (critical path) — all the same pattern.

## Problems that are secretly DAGs
- Prerequisites / dependencies / build orders ([[problem:cses-1679]]).
- Comparisons "a must come before b" → is there a consistent order? (cycle check); how many orders? (hard in general, but small n → bitmask DP).
- Games on a DAG: win/lose by reverse topological order ([[topic:game-theory]]).
- Functional graphs (each node has one out-edge) are cycles with trees attached — not DAGs, but the trees part is processed like one.
- After condensing SCCs, *any* directed graph becomes a DAG ([[topic:scc-bridges]]).

## Counting topological orders and uniqueness
A topological order is unique iff at every step of Kahn’s algorithm exactly one node has in-degree 0. Counting all orders is #P-hard in general; for n ≤ 20 use dp[mask] over subsets of processed nodes.

:::pitfall
Multi-edges double count in-degree (fine, as long as you decrement per edge); using a stack instead of a queue changes the order but stays valid; forgetting nodes with no edges at all (in-degree 0, must appear); running DP before verifying acyclicity.
:::

:::seerc
"Order the tasks / count the paths / longest chain" problems are common easy-medium SEERC fare. Kahn’s algorithm + DP in order is a 5-minute solution once recognised.
:::
` };

LESSONS['trees-1'] = { md: String.raw`
## Facts about trees
A tree is a connected graph with n − 1 edges (equivalently: connected and acyclic; or any two nodes joined by exactly one simple path). Removing any edge splits it into two components; adding any edge creates exactly one cycle. Every tree with n ≥ 2 has at least two leaves.

## Rooting a tree
Pick a root (usually node 0 or 1). Then every node has a parent, a depth, and a subtree. Almost every tree algorithm starts with this pass:
~~~cpp
vector<int> par(n, -1), depth(n, 0), order;      // order: parents before children
vector<int> st = {root}; vector<bool> vis(n, false); vis[root] = true;
while (!st.empty()) {
    int u = st.back(); st.pop_back(); order.push_back(u);
    for (int v : adj[u]) if (!vis[v]) { vis[v] = true; par[v] = u; depth[v] = depth[u] + 1; st.push_back(v); }
}
~~~
Now compute subtree sizes by iterating ''order'' backwards: ''sz[par[v]] += sz[v]''. [[viz:tree-dfs]] shows this order and the values being folded upward.

## Subtree sizes, depths, and what they give you
- Number of subordinates = sz[v] − 1 ([[problem:cses-1674]]).
- Sum of depths, number of leaves, maximum depth below v — all "fold children into parent" computations.
- Centroid: a node whose removal leaves components of size ≤ n/2; walk from the root toward a child with sz > n/2 while one exists ([[problem:cses-2079]]).

## Diameter
Longest path between two nodes. Two methods:
1. Two BFS/DFS: farthest node from any start is one end of a diameter; the farthest node from it is the other end.
2. DP: for each node keep the two longest downward paths; diameter = max over nodes of their sum.
The farthest node from *any* vertex v is one of the two diameter endpoints — that gives "for each node, the distance to the farthest node" in O(n) ([[problem:cses-1132]]).

## Euler tour: subtrees as ranges
Record ''tin[v]'' when entering and ''tout[v]'' when leaving (or tout = tin + sz − 1). The subtree of v is exactly the index range [tin[v], tout[v]]:
- Subtree sum queries with point updates → Fenwick/segment tree over the tour ([[problem:cses-1137]]).
- "Is u an ancestor of v?" ⇔ tin[u] ≤ tin[v] ≤ tout[u] — O(1) ([[problem:cf-1328E]]).
- Path-to-root sums with point updates → range add on the subtree range, point query ([[problem:cses-1138]]).

## Distances and paths
dist(u, v) = depth[u] + depth[v] − 2·depth[lca(u, v)] — LCA is the subject of [[topic:lca]]. Sum of distances from every node → rerooting ([[topic:dp-trees]]).

## Edge cases and representation
- Trees given as parent arrays (parent of i is p_i < i) need no DFS at all: process i from n down to 1.
- Forests: run the rooting from every unvisited node.
- Recursion depth: a path of 2·10⁵ nodes kills a recursive DFS on many judges — the iterative version above is the safe default.

:::recognize
"n nodes and n − 1 edges, connected" is a tree even when the statement calls it a network. Look for subtree queries (Euler tour), path queries (LCA / HLD), and "for every node" answers (rerooting).
:::

:::seerc
Tree problems are a SEERC constant: at least one per set, often two. The rooting pass + subtree sizes + Euler tour cover the easy ones; LCA and tree DP cover the medium ones.
:::
` };

LESSONS['lca'] = { md: String.raw`
## Binary lifting
Store ''up[k][v]'' = the 2ᵏ-th ancestor of v (the root’s ancestor is the root itself). Build with ''up[k][v] = up[k−1][up[k−1][v]]'' in O(n log n). Then:
- **k-th ancestor** in O(log n): for each set bit b of k, jump ''v = up[b][v]'' ([[problem:cses-1687]]).
- **LCA**: lift the deeper node to the same depth; if equal, done; otherwise for k from LOG down to 0, if ''up[k][a] != up[k][b]'' jump both; the LCA is ''up[0][a]'' ([[problem:cses-1688]]).
- **Distance** = depth[a] + depth[b] − 2·depth[lca] ([[problem:cses-1135]]).
[[viz:binary-lifting]] animates the jumps. Template ''lca-binary-lifting'' (iterative build, no recursion).

## Alternatives
- **Euler tour + sparse table**: write the tour of nodes with depths; LCA(u, v) = node of minimum depth between the first occurrences of u and v. O(n log n) build, O(1) query, no updates.
- **Offline Tarjan** with DSU: O((n + q) α) when all queries are known up front.
- **Binary lifting over values**: also stores min/max/sum of edge weights along the 2ᵏ jumps → path min/max queries without HLD when there are no updates.

## Path queries via LCA
- Path sum of node values: prefix sums to the root: sum[u] + sum[v] − 2·sum[lca] + val[lca].
- Path max/min without updates: lift with aggregates.
- "Number of paths passing through each node/edge": difference on tree — +1 at u and v, −2 at lca (node version: −1 at lca and −1 at parent of lca), then subtree sums ([[problem:cses-1136]]).
- Is w on the path u–v? ⇔ dist(u, w) + dist(w, v) = dist(u, v), or w is an ancestor of exactly one of u, v and a descendant of the lca.
- Midpoint of a path, "vertices equidistant from x and y" ([[problem:cf-519E]]): k-th ancestor and subtree sizes.

## Functional graphs and jumping
Binary lifting works on any structure with one successor per node: "where am I after k = 10¹⁸ steps of a permutation/function" ([[problem:cses-1750]]), "how many steps until I enter the cycle", and with aggregates "sum of values along k steps".

## Complexity and memory
LOG = ⌈log₂ n⌉ (18 for 2·10⁵, 20 for 10⁶). Memory n·LOG ints — 80 MB for 10⁶ nodes, which may exceed limits: fall back to Euler tour + sparse table (also O(n log n) but ints of the tour), or offline Tarjan.

:::pitfall
Forgetting to make the root its own ancestor (then up[k][root] = −1 breaks the jumps); lifting the *shallower* node instead of the deeper one; using ''int k'' loops with ''1 << k'' for k up to 60 (use long long for functional-graph jumps); computing LOG too small for n exactly a power of two.
:::

:::seerc
LCA is the prerequisite for most SEERC tree problems: distances, path queries, "on the path" checks, HLD. Having the template printed and understood saves 20 minutes every time.
:::
` };

LESSONS['scc-bridges'] = { md: String.raw`
## Strongly connected components
In a directed graph, u and v are in the same SCC if each reaches the other. Contracting SCCs gives the **condensation**, a DAG — so reachability, "minimum nodes to start from", DP over the graph all become DAG problems ([[problem:cses-1683]], [[problem:cses-1686]]).

**Tarjan’s algorithm** (one DFS, O(n + m)): ''tin[u]'' = entry time, ''low[u]'' = smallest tin reachable from u’s DFS subtree via at most one back edge to a node still on the stack. When ''low[u] == tin[u]'', pop the stack down to u: that is one SCC. Components are produced in *reverse topological order* (sinks first) — convenient for DP. [[viz:scc]] shows the stack and low values. Template ''scc-tarjan''.
**Kosaraju**: DFS post-order on the graph, then DFS on the reversed graph in reverse post-order; simpler to remember, two passes.

## 2-SAT
Variables x₁..xₙ, clauses (a ∨ b) with literals. Build the implication graph on 2n literal nodes: (a ∨ b) ⇒ edges ¬a → b and ¬b → a. Satisfiable iff no variable shares an SCC with its negation. Assignment: x = true iff comp[x] comes *after* comp[¬x] in topological order (with Tarjan numbering: comp[x] < comp[¬x]). Encodes "at least one of", "at most one of two", "if a then b", forced literals ([[problem:cses-1684]]). Template ''two-sat''.

## Bridges and articulation points (undirected)
DFS with ''tin'' and ''low'' where low[v] = min tin reachable from v’s subtree via back edges (skip only the *edge* you came from, by id, to survive multi-edges):
- Tree edge (u, v) is a **bridge** iff low[v] > tin[u] ([[problem:cses-2076]]).
- u is an **articulation point** iff some child v has low[v] ≥ tin[u] (for the root: at least two DFS children) ([[problem:cses-2077]]).
Template ''bridges-articulation''.

## What you build on top
- **Bridge tree / 2-edge-connected components**: contract components without bridges → a tree; questions like "minimum edges to add so no bridge remains" = ⌈leaves/2⌉.
- **Block-cut tree** (biconnected components): for "which vertices are on some simple path between u and v".
- **Edge orientation**: a connected graph can be oriented strongly connected iff it has no bridges (Robbins); orient by DFS: tree edges down, back edges up.
- **Minimum edges to make a DAG strongly connected**: max(#sources, #sinks) in the condensation.
- **Graph colouring of edges with 2 colours so no directed cycle is monochromatic** ([[problem:cf-1217D]]): back edges vs the rest.

## Reading the problem
"Mutually reachable", "can go there and back" → SCC. "Either… or…" constraints with two options per item → 2-SAT. "Roads whose removal disconnects" → bridges. "Cities whose removal disconnects" → articulation points. "Two edge-disjoint paths exist" → no bridge on the way.

:::pitfall
Multi-edges break the naive "skip the parent vertex" rule — skip by edge id; recursion depth on 2·10⁵ nodes (iterative Tarjan exists but is fiddly; increase the stack if allowed); forgetting that 2-SAT clause (a ∨ b) needs *both* implications; in Kosaraju, running the second pass in the wrong order.
:::

:::seerc
SCC/2-SAT/bridges cover the "hard graph problem" slot at SEERC in many years. They are template-heavy: understand the low-link idea once, then rely on tested code from your reference document.
:::
` };

LESSONS['flows'] = { md: String.raw`
## Max flow
A network with a source s, sink t and edge capacities. A flow sends units along edges without exceeding capacities, conserving flow at intermediate nodes. **Max-flow = min-cut**: the maximum total flow equals the minimum total capacity of edges whose removal separates s from t. That equality turns many "minimum cost to break/separate" problems into flow computations.

**Dinic’s algorithm**: BFS to build a level graph, then DFS to push blocking flows along level-increasing edges; repeat. O(V²E) in general, O(E√V) for unit-capacity graphs — fast in practice for up to ~10⁵ edges. Template ''dinic'' (with min-cut extraction). [[viz:max-flow]] shows augmenting paths.

## Modelling — the actual skill
| Problem | Network |
|---|---|
| Maximum bipartite matching | s → left (cap 1), left → right (cap 1), right → t (cap 1) |
| Each worker up to c jobs | s → worker with capacity c |
| Edge-disjoint paths | all capacities 1; answer = flow ([[problem:cses-1711]]) |
| Vertex-disjoint paths | split each vertex into in/out with a capacity-1 edge |
| Minimum cut / minimum edges to disconnect | unit capacities; the cut edges are between reachable and unreachable residual nodes ([[problem:cses-1695]]) |
| Project selection / closure | s-side = chosen; profits from s, costs to t, dependencies as ∞ edges; answer = total profit − min cut |
| Minimum vertex cover in bipartite graphs | = max matching (König) |
| Maximum independent set in bipartite graphs | = n − max matching |
| Minimum path cover in a DAG | n − max matching between copies of the nodes |
| Lower bounds on edges, circulation | reduce to a flow with adjusted demands |

## Bipartite matching without flows
Kuhn’s algorithm (augmenting paths, O(VE), tiny code) for V ≤ ~1000; Hopcroft–Karp (O(E√V)) otherwise; template ''bipartite-matching''. Hall’s theorem tells you *when* a perfect matching exists (every subset of the left side has at least as many neighbours) — useful for proofs and for greedy alternatives.

## Min-cost flow
Each edge also has a cost per unit; find the cheapest max flow (or the cheapest flow of exactly k units). Successive shortest paths with Bellman–Ford/SPFA (template ''min-cost-flow''); Dijkstra with potentials for speed. Assignment problem (n workers, n jobs, cost matrix) → Hungarian algorithm O(n³) (template ''hungarian'') or min-cost flow ([[problem:cses-2129]], [[problem:cses-2121]]).

## Recognising a flow problem
Signals: "maximum number of pairs/assignments/paths", "each … can be used at most once", "minimum number of edges/vertices to remove to disconnect", "choose a subset maximizing profit minus penalties for dependencies", bipartite structure, small graphs (n ≤ 500, m ≤ 10⁴) with a hard-looking optimisation.

:::pitfall
Adding only one direction of the residual edge; ''int'' capacities overflowing with ∞ = 10⁹ edges summed; using DFS-only Ford–Fulkerson on large capacities (exponential); modelling vertex capacities without splitting; forgetting that the min-cut *edges* are those from the reachable to the unreachable side, not all saturated edges.
:::

:::seerc
Flow problems appear at SEERC roughly every other year, usually as a modelling puzzle where the algorithm itself is a copy from the reference document. Bipartite matching (School Dance style) is more frequent and often disguised.
:::
` };

LESSONS['advanced-graphs'] = { md: String.raw`
## Euler paths and circuits
Use every edge exactly once.
- Undirected: circuit exists iff connected (ignoring isolated vertices) and all degrees even; path iff exactly two odd-degree vertices (start and end).
- Directed: circuit iff in-degree = out-degree everywhere (and connected); path iff one vertex has out − in = 1 (start), one has in − out = 1 (end), rest balanced.
**Hierholzer**: walk greedily using unused edges with a per-vertex pointer; when stuck, append the vertex to the answer and backtrack; reverse the result. O(n + m). Always verify the output uses all m edges (disconnected edges otherwise slip through). Template ''euler-path''; problems [[problem:cses-1691]], [[problem:cses-1693]], De Bruijn sequences ([[problem:cses-1692]]). [[viz:euler-path]].

## Functional graphs
Each node has exactly one outgoing edge: the structure is disjoint cycles with in-trees hanging off them. Standard tasks: find the cycle for each node and the distance to it (iterate with colours, or Floyd cycle-finding), k-th successor via binary lifting ([[problem:cses-1750]]), "distance between two nodes" case analysis ([[problem:cses-1160]]), cycle lengths ([[problem:cses-1751]]).

## DSU with rollback and offline dynamic connectivity
Edges exist during time intervals; queries "are u, v connected at time t". Build a segment tree over time, insert each edge into the O(log q) nodes covering its interval, DFS the segment tree uniting edges on entry and rolling back on exit; answer queries at the leaves. O((m + q) log q · log n) ([[problem:cses-2133]]). Templates ''dsu-rollback''.

## Min-cost flow and the Hungarian algorithm
See [[topic:flows]]; here the twist is recognising cost structures: "k disjoint paths of minimum total length" ([[problem:cses-2130]]), "assign n tasks to n workers minimizing total cost" ([[problem:cses-2129]]), "transport k units at minimum cost" ([[problem:cses-2121]]).

## Trees from edges: the Kruskal reconstruction tree
Process edges by weight; each union creates a new internal node with that weight as its value. The tree has 2n − 1 nodes; the maximum edge weight on the path u–v in the MST is the value at their LCA, and "all vertices reachable using edges ≤ w from v" is a subtree found by binary lifting on values ([[problem:cses-2101]]).

## Miscellany worth recognising
- **Dominator tree**: which nodes must every path from s to v pass through (Lengauer–Tarjan is heavy; for small graphs, remove each node and BFS).
- **Bipartite graph checks** on "graph with two kinds of edges" or "2-colour the cycle" problems.
- **Cactus graphs** (every edge in at most one cycle) often admit tree-like DP.
- **Tournament / complete graph** problems usually hide a construction or a degree argument rather than an algorithm.
- **Shortest cycle (girth)**: BFS from every vertex, O(n·m); for small graphs only.
- **Matching in general graphs** (Blossom) — essentially never needed at regionals; if a problem seems to need it, look for bipartiteness or a parity trick.

:::seerc
These are the "hard graph" ingredients of a SEERC set: Euler paths and functional graphs are the most frequent, offline dynamic connectivity the rarest. Study them selectively once Tier 2 is solid; keep the templates printed.
:::
` };

LESSONS['hld-centroid'] = { md: String.raw`
## Heavy-light decomposition
Goal: answer **path queries with updates** (max/sum on the path u–v, add to all nodes on a path) in O(log² n).
Idea: for each node mark the child with the largest subtree as *heavy*. Heavy edges form chains; any root-to-node path uses at most O(log n) light edges, hence O(log n) chains. Lay the nodes out so each chain is contiguous (pos[]), put a segment tree over that array, and a path query becomes O(log n) range queries. Template ''hld'' (max with point updates; swap in a lazy tree for range updates) — [[problem:cses-2134]].
~~~
pathQuery(a, b):
  while head[a] != head[b]:
      if depth[head[a]] > depth[head[b]] swap(a, b)
      res = combine(res, segQuery(pos[head[b]], pos[b]))     // whole chain segment of b
      b = par[head[b]]
  res = combine(res, segQuery(pos[min-depth], pos[max-depth]))   // same chain
~~~
Edge values: store each edge at its child node and skip the LCA in the final segment. Subtree queries come for free: the subtree of v is pos[v] .. pos[v] + sz[v] − 1 (HLD order is a DFS order).

## Centroid decomposition
Goal: **count/aggregate paths** with some property (length exactly k, sum ≤ x, …). Find the centroid (all remaining components ≤ n/2 after removal), account for all paths through it by combining the depths of the children’s subtrees (each child’s subtree against the ones already processed to avoid double counting), remove it, recurse. Depth O(log n), so every node is visited in O(log n) decompositions → O(n log n) (times the combine cost). Template ''centroid-decomposition''; problems [[problem:cses-2080]], [[problem:cses-2081]]. Also: "nearest marked node" queries by storing distances to the O(log n) centroid ancestors.

## Small-to-large (DSU on tree)
For subtree queries about *sets* (distinct values, most frequent colour, number of values ≥ x): keep a set/map per node, merge each child into the parent — always the smaller into the larger. Each element moves O(log n) times → O(n log n) set operations ([[problem:cses-1139]]). The Sack variant (process the heavy child first and keep its structure, re-add light children) achieves O(n log n) with a plain frequency array. Template ''dsu-on-tree''.

## Euler tour + segment tree (the simple cousin)
Before reaching for HLD, check whether the query is on a **subtree** or a **root path**: both are single ranges in the Euler tour and need only a Fenwick/segment tree ([[topic:trees-1]]). HLD is for arbitrary u–v paths.

## Choosing
| Query type | Tool |
|---|---|
| subtree aggregate, point updates | Euler tour + BIT/segment tree |
| path aggregate, no updates | binary lifting with aggregates or prefix sums + LCA |
| path aggregate, point/range updates | HLD + segment tree |
| count paths with a property | centroid decomposition (or tree DP if k small) |
| subtree set/frequency queries | small-to-large / Sack |

:::pitfall
Off-by-one in chain positions; forgetting to compare *heads’* depths (not the nodes’) when climbing; edge-value queries including the LCA node; centroid recursion forgetting to mark the centroid removed before descending; small-to-large merging in the wrong direction (O(n²)).
:::

:::seerc
Tier-3 tree techniques appear in the hardest 2–3 SEERC problems. A well-tested HLD template plus recognising "path queries with updates" can steal a problem few teams solve — but only after Tier 2 tree skills are automatic.
:::
` };
