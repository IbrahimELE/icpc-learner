/* Code templates (part 2: graphs, trees, DP, strings, geometry, misc). */
TEMPLATES.push(
  /* ---------------- GRAPHS ---------------- */
  { id: 'bfs-dfs-adjacency', title: 'Graph input, BFS with path, iterative DFS components', cat: 'Graphs', topic: 'graphs-1', tags: ['bfs', 'dfs', 'adjacency list', 'components', 'path'],
    desc: 'The boilerplate you retype every contest: read an undirected graph, BFS distances + path reconstruction, and components without recursion.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    cin.tie(nullptr)->sync_with_stdio(false);
    int n, m; cin >> n >> m;                       // nodes 1..n
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < m; i++) { int a, b; cin >> a >> b; adj[a].push_back(b); adj[b].push_back(a); }

    // BFS from 1: shortest edge counts and parents
    vector<int> dist(n + 1, -1), par(n + 1, 0);
    queue<int> q; q.push(1); dist[1] = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) if (dist[v] == -1) { dist[v] = dist[u] + 1; par[v] = u; q.push(v); }
    }
    if (dist[n] == -1) cout << "IMPOSSIBLE\n";
    else {
        vector<int> path;
        for (int v = n; v; v = par[v]) path.push_back(v);
        reverse(path.begin(), path.end());
        cout << path.size() << '\n';
        for (int v : path) cout << v << ' ';
        cout << '\n';
    }

    // connected components with an explicit stack (safe for 1e6 nodes)
    vector<int> comp(n + 1, 0); int comps = 0;
    for (int s = 1; s <= n; s++) {
        if (comp[s]) continue;
        comp[s] = ++comps;
        vector<int> st = {s};
        while (!st.empty()) {
            int u = st.back(); st.pop_back();
            for (int v : adj[u]) if (!comp[v]) { comp[v] = comps; st.push_back(v); }
        }
    }
    cout << comps << '\n';
    return 0;
}
` },
  { id: 'dijkstra', title: 'Dijkstra with path reconstruction', cat: 'Graphs', topic: 'shortest-paths', tags: ['dijkstra', 'shortest path', 'priority queue'],
    desc: 'Lazy-deletion Dijkstra: push duplicates, skip stale entries. Works for 2·10⁵ nodes and edges with long long distances.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll INF = 4e18;

pair<vector<ll>, vector<int>> dijkstra(const vector<vector<pair<int, ll>>>& adj, int src) {
    int n = adj.size();
    vector<ll> dist(n, INF); vector<int> par(n, -1);
    priority_queue<pair<ll, int>, vector<pair<ll, int>>, greater<>> pq;
    dist[src] = 0; pq.push({0, src});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;                              // stale entry
        for (auto [v, w] : adj[u])
            if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; par[v] = u; pq.push({dist[v], v}); }
    }
    return {dist, par};
}
int main() {
    int n = 4;
    vector<vector<pair<int, ll>>> adj(n);
    auto addEdge = [&](int a, int b, ll w) { adj[a].push_back({b, w}); adj[b].push_back({a, w}); };
    addEdge(0, 1, 4); addEdge(0, 2, 1); addEdge(2, 1, 2); addEdge(1, 3, 5);
    auto [dist, par] = dijkstra(adj, 0);
    cout << dist[3] << '\n';                                    // 8
    vector<int> path; for (int v = 3; v != -1; v = par[v]) path.push_back(v);
    reverse(path.begin(), path.end());
    for (int v : path) cout << v << ' ';                         // 0 2 1 3
    cout << '\n';
    return 0;
}
` },
  { id: 'bellman-ford-floyd', title: 'Bellman–Ford (negative cycles) + Floyd–Warshall', cat: 'Graphs', topic: 'shortest-paths', tags: ['bellman ford', 'floyd warshall', 'negative cycle', 'all pairs'],
    desc: 'Use Bellman–Ford for negative edges / cycle detection, Floyd–Warshall for all pairs when n ≤ 500.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll INF = 4e18;
struct Edge { int a, b; ll w; };

vector<ll> bellmanFord(int n, const vector<Edge>& edges, int src, bool& negCycle) {
    vector<ll> dist(n, INF); dist[src] = 0; negCycle = false;
    for (int it = 0; it < n; it++) {
        bool changed = false;
        for (auto [a, b, w] : edges)
            if (dist[a] != INF && dist[a] + w < dist[b]) { dist[b] = dist[a] + w; changed = true; }
        if (!changed) break;
        if (it == n - 1) negCycle = true;                        // still relaxing on the n-th pass
    }
    return dist;
}
void floyd(vector<vector<ll>>& d) {                              // d[i][i] < 0 afterwards => negative cycle through i
    int n = d.size();
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++) if (d[i][k] != INF)
            for (int j = 0; j < n; j++)
                if (d[k][j] != INF && d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
}
int main() {
    vector<Edge> e = {{0, 1, 4}, {0, 2, 5}, {1, 2, -3}, {2, 3, 2}};
    bool neg; auto d = bellmanFord(4, e, 0, neg);
    cout << d[3] << ' ' << neg << '\n';                          // 3 0
    vector<vector<ll>> m(4, vector<ll>(4, INF));
    for (int i = 0; i < 4; i++) m[i][i] = 0;
    for (auto [a, b, w] : e) m[a][b] = min(m[a][b], w);
    floyd(m);
    cout << m[0][3] << '\n';                                     // 3
    return 0;
}
` },
  { id: 'zero-one-bfs', title: '0-1 BFS', cat: 'Graphs', topic: 'shortest-paths', tags: ['0-1 bfs', 'deque', 'shortest path'],
    desc: 'Shortest paths when every edge weighs 0 or 1, in O(n + m) with a deque.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

vector<int> zeroOneBFS(const vector<vector<pair<int, int>>>& adj, int src) {
    vector<int> dist(adj.size(), INT_MAX);
    deque<int> dq; dist[src] = 0; dq.push_back(src);
    while (!dq.empty()) {
        int u = dq.front(); dq.pop_front();
        for (auto [v, w] : adj[u]) if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            if (w == 0) dq.push_front(v); else dq.push_back(v);
        }
    }
    return dist;
}
int main() {
    vector<vector<pair<int, int>>> adj(4);
    adj[0] = {{1, 1}, {2, 0}}; adj[2] = {{1, 0}}; adj[1] = {{3, 1}};
    auto d = zeroOneBFS(adj, 0);
    cout << d[1] << ' ' << d[3] << '\n';   // 0 1
    return 0;
}
` },
  { id: 'topological-sort', title: 'Topological sort (Kahn) + DAG longest path', cat: 'Graphs', topic: 'topo-sort', tags: ['topological', 'kahn', 'dag', 'longest path'],
    desc: 'Returns an empty order when there is a cycle. Swap the queue for a priority_queue to get the lexicographically smallest order.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

vector<int> topoSort(int n, const vector<vector<int>>& adj) {
    vector<int> indeg(n, 0), order;
    for (int u = 0; u < n; u++) for (int v : adj[u]) indeg[v]++;
    queue<int> q;
    for (int u = 0; u < n; u++) if (indeg[u] == 0) q.push(u);
    while (!q.empty()) {
        int u = q.front(); q.pop(); order.push_back(u);
        for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);
    }
    if ((int)order.size() < n) return {};                        // cycle
    return order;
}
int main() {
    int n = 5;
    vector<vector<int>> adj(n);
    adj[0] = {1, 2}; adj[1] = {3}; adj[2] = {3}; adj[3] = {4};
    auto order = topoSort(n, adj);
    for (int v : order) cout << v << ' ';                        // 0 1 2 3 4
    cout << '\n';
    vector<int> dp(n, 0);                                        // longest path (in edges) ending at v
    for (int u : order) for (int v : adj[u]) dp[v] = max(dp[v], dp[u] + 1);
    cout << *max_element(dp.begin(), dp.end()) << '\n';          // 3
    return 0;
}
` },
  { id: 'kruskal-prim', title: 'Minimum spanning tree: Kruskal + Prim', cat: 'Graphs', topic: 'dsu', tags: ['mst', 'kruskal', 'prim', 'spanning tree'],
    desc: 'Kruskal with DSU for edge lists, Prim with a heap for adjacency lists. Both return −1 if the graph is disconnected.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct DSU {
    vector<int> p;
    DSU(int n) : p(n) { iota(p.begin(), p.end(), 0); }
    int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }
    bool unite(int a, int b) { a = find(a); b = find(b); if (a == b) return false; p[a] = b; return true; }
};
struct Edge { int a, b; ll w; bool operator<(const Edge& o) const { return w < o.w; } };

ll kruskal(int n, vector<Edge> edges, vector<Edge>& chosen) {
    sort(edges.begin(), edges.end());
    DSU d(n); ll total = 0;
    for (auto& e : edges) if (d.unite(e.a, e.b)) { total += e.w; chosen.push_back(e); }
    return (int)chosen.size() == n - 1 ? total : -1;
}
ll prim(const vector<vector<pair<int, ll>>>& adj) {
    int n = adj.size(), cnt = 0; ll total = 0;
    vector<bool> in(n, false);
    priority_queue<pair<ll, int>, vector<pair<ll, int>>, greater<>> pq; pq.push({0, 0});
    while (!pq.empty() && cnt < n) {
        auto [w, u] = pq.top(); pq.pop();
        if (in[u]) continue;
        in[u] = true; total += w; cnt++;
        for (auto [v, c] : adj[u]) if (!in[v]) pq.push({c, v});
    }
    return cnt == n ? total : -1;
}
int main() {
    vector<Edge> e = {{0, 1, 1}, {1, 2, 2}, {0, 2, 3}, {2, 3, 4}};
    vector<Edge> chosen;
    cout << kruskal(4, e, chosen) << '\n';                        // 7
    vector<vector<pair<int, ll>>> adj(4);
    for (auto [a, b, w] : e) { adj[a].push_back({b, w}); adj[b].push_back({a, w}); }
    cout << prim(adj) << '\n';                                    // 7
    return 0;
}
` },
  { id: 'scc-tarjan', title: 'Strongly connected components (Tarjan) + condensation', cat: 'Graphs', topic: 'scc-bridges', tags: ['scc', 'tarjan', 'condensation', 'dag'],
    desc: 'Components are numbered in reverse topological order (component 0 is a sink). `condense()` builds the DAG for DP.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

struct SCC {
    int n, timer = 0, ncomp = 0;
    vector<vector<int>> adj; vector<int> tin, low, comp, st; vector<bool> onst;
    SCC(int n) : n(n), adj(n), tin(n, -1), low(n), comp(n, -1), onst(n, false) {}
    void addEdge(int a, int b) { adj[a].push_back(b); }
    void dfs(int u) {
        tin[u] = low[u] = timer++; st.push_back(u); onst[u] = true;
        for (int v : adj[u]) {
            if (tin[v] == -1) { dfs(v); low[u] = min(low[u], low[v]); }
            else if (onst[v]) low[u] = min(low[u], tin[v]);
        }
        if (low[u] == tin[u]) {
            while (true) { int v = st.back(); st.pop_back(); onst[v] = false; comp[v] = ncomp; if (v == u) break; }
            ncomp++;
        }
    }
    void run() { for (int u = 0; u < n; u++) if (tin[u] == -1) dfs(u); }
    vector<vector<int>> condense() {                               // deduplicated DAG between components
        vector<set<int>> s(ncomp);
        for (int u = 0; u < n; u++) for (int v : adj[u]) if (comp[u] != comp[v]) s[comp[u]].insert(comp[v]);
        vector<vector<int>> dag(ncomp);
        for (int c = 0; c < ncomp; c++) dag[c].assign(s[c].begin(), s[c].end());
        return dag;
    }
};
int main() {
    SCC g(5);
    g.addEdge(0, 1); g.addEdge(1, 2); g.addEdge(2, 0); g.addEdge(2, 3); g.addEdge(3, 4);
    g.run();
    cout << g.ncomp << '\n';                                       // 3
    for (int v = 0; v < 5; v++) cout << g.comp[v] << ' ';          // 2 2 2 1 0
    cout << '\n';
    return 0;
}
` },
  { id: 'two-sat', title: '2-SAT', cat: 'Graphs', topic: 'scc-bridges', tags: ['2-sat', 'satisfiability', 'implication graph'],
    desc: 'Clauses (a ∨ b) become implications; unsatisfiable iff x and ¬x share an SCC. Returns an assignment.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

struct TwoSat {
    int n, timer = 0, ncomp = 0;
    vector<vector<int>> adj; vector<int> tin, low, comp, st; vector<bool> onst;
    TwoSat(int n) : n(n), adj(2 * n) {}
    int neg(int x) { return x ^ 1; }
    int var(int i, bool value) { return 2 * i + (value ? 0 : 1); }   // literal "variable i == value"
    void implies(int a, int b) { adj[a].push_back(b); adj[neg(b)].push_back(neg(a)); }
    void either(int a, int b) { implies(neg(a), b); }                // clause (a or b)
    void mustBe(int a) { implies(neg(a), a); }
    void dfs(int u) {
        tin[u] = low[u] = timer++; st.push_back(u); onst[u] = true;
        for (int v : adj[u]) {
            if (tin[v] == -1) { dfs(v); low[u] = min(low[u], low[v]); }
            else if (onst[v]) low[u] = min(low[u], tin[v]);
        }
        if (low[u] == tin[u]) { while (true) { int v = st.back(); st.pop_back(); onst[v] = false; comp[v] = ncomp; if (v == u) break; } ncomp++; }
    }
    vector<bool> solve() {                                           // empty => unsatisfiable
        tin.assign(2 * n, -1); low.assign(2 * n, 0); comp.assign(2 * n, -1); onst.assign(2 * n, false);
        for (int u = 0; u < 2 * n; u++) if (tin[u] == -1) dfs(u);
        vector<bool> val(n);
        for (int i = 0; i < n; i++) {
            if (comp[2 * i] == comp[2 * i + 1]) return {};
            val[i] = comp[2 * i] < comp[2 * i + 1];                  // Tarjan numbers components in reverse topological order
        }
        return val;
    }
};
int main() {
    TwoSat ts(3);
    ts.either(ts.var(0, true), ts.var(1, true));                     // x0 or x1
    ts.either(ts.var(0, false), ts.var(1, false));                   // !x0 or !x1
    ts.mustBe(ts.var(2, true));                                      // x2
    auto v = ts.solve();
    if (v.empty()) cout << "UNSAT\n"; else { for (bool b : v) cout << b << ' '; cout << '\n'; }
    return 0;
}
` },
  { id: 'bridges-articulation', title: 'Bridges and articulation points', cat: 'Graphs', topic: 'scc-bridges', tags: ['bridges', 'articulation', 'low link', 'cut vertex'],
    desc: 'Low-link DFS handling multi-edges through edge ids. Bridges: low[v] > tin[u]; cut vertices: low[v] ≥ tin[u].',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

struct Cuts {
    int n, timer = 0, m = 0;
    vector<vector<pair<int, int>>> adj; vector<int> tin, low; vector<bool> isCut; vector<pair<int, int>> bridges;
    Cuts(int n) : n(n), adj(n), tin(n, -1), low(n), isCut(n, false) {}
    void addEdge(int a, int b) { adj[a].push_back({b, m}); adj[b].push_back({a, m}); m++; }
    void dfs(int u, int pe) {
        tin[u] = low[u] = timer++; int children = 0;
        for (auto [v, id] : adj[u]) {
            if (id == pe) continue;
            if (tin[v] != -1) { low[u] = min(low[u], tin[v]); continue; }
            dfs(v, id); children++;
            low[u] = min(low[u], low[v]);
            if (low[v] > tin[u]) bridges.push_back({u, v});
            if (low[v] >= tin[u] && pe != -1) isCut[u] = true;
        }
        if (pe == -1 && children > 1) isCut[u] = true;
    }
    void run() { for (int u = 0; u < n; u++) if (tin[u] == -1) dfs(u, -1); }
};
int main() {
    Cuts g(5);
    g.addEdge(0, 1); g.addEdge(1, 2); g.addEdge(2, 0); g.addEdge(2, 3); g.addEdge(3, 4);
    g.run();
    cout << g.bridges.size() << " bridges; cut vertices:";            // 2 bridges; cut vertices: 2 3
    for (int v = 0; v < 5; v++) if (g.isCut[v]) cout << ' ' << v;
    cout << '\n';
    return 0;
}
` },
  { id: 'euler-path', title: 'Euler path / circuit (Hierholzer)', cat: 'Graphs', topic: 'advanced-graphs', tags: ['euler', 'hierholzer', 'eulerian path'],
    desc: 'Directed version with degree checks. For undirected graphs store edge ids, mark them used, and allow 0 or 2 odd-degree vertices.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

vector<int> eulerPathDirected(int n, vector<vector<int>> adj, int m) {   // m = number of edges
    vector<int> indeg(n, 0), outdeg(n, 0);
    for (int u = 0; u < n; u++) { outdeg[u] = adj[u].size(); for (int v : adj[u]) indeg[v]++; }
    int start = -1, plus = 0, minus = 0;
    for (int u = 0; u < n; u++) {
        if (outdeg[u] - indeg[u] == 1) { plus++; start = u; }
        else if (indeg[u] - outdeg[u] == 1) minus++;
        else if (indeg[u] != outdeg[u]) return {};
    }
    if (!((plus == 0 && minus == 0) || (plus == 1 && minus == 1))) return {};
    if (start == -1) for (int u = 0; u < n; u++) if (outdeg[u]) { start = u; break; }
    if (start == -1) return {};
    vector<int> path, st = {start}, ptr(n, 0);
    while (!st.empty()) {
        int u = st.back();
        if (ptr[u] < (int)adj[u].size()) st.push_back(adj[u][ptr[u]++]);
        else { path.push_back(u); st.pop_back(); }
    }
    reverse(path.begin(), path.end());
    if ((int)path.size() != m + 1) return {};                          // edges not all reachable
    return path;
}
int main() {
    vector<vector<int>> adj(4);
    adj[0] = {1}; adj[1] = {2}; adj[2] = {0, 3};
    for (int v : eulerPathDirected(4, adj, 4)) cout << v << ' ';       // 2 0 1 2 3
    cout << '\n';
    return 0;
}
` },
  { id: 'dinic', title: 'Max flow (Dinic) + min cut', cat: 'Flows & matching', topic: 'flows', tags: ['max flow', 'dinic', 'min cut'],
    desc: 'O(V²E) in general, O(E√V) on unit networks. After `maxFlow`, `minCutSide` marks the source side of a minimum cut.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct Dinic {
    struct E { int to; ll cap; };
    int n; vector<E> e; vector<vector<int>> g; vector<int> level, it;
    Dinic(int n) : n(n), g(n), level(n), it(n) {}
    void addEdge(int a, int b, ll cap) { g[a].push_back(e.size()); e.push_back({b, cap}); g[b].push_back(e.size()); e.push_back({a, 0}); }
    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1); level[s] = 0;
        queue<int> q; q.push(s);
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int id : g[u]) if (e[id].cap > 0 && level[e[id].to] == -1) { level[e[id].to] = level[u] + 1; q.push(e[id].to); }
        }
        return level[t] != -1;
    }
    ll dfs(int u, int t, ll f) {
        if (u == t) return f;
        for (int& i = it[u]; i < (int)g[u].size(); i++) {
            int id = g[u][i], v = e[id].to;
            if (e[id].cap > 0 && level[v] == level[u] + 1) {
                ll d = dfs(v, t, min(f, e[id].cap));
                if (d > 0) { e[id].cap -= d; e[id ^ 1].cap += d; return d; }
            }
        }
        return 0;
    }
    ll maxFlow(int s, int t) {
        ll flow = 0;
        while (bfs(s, t)) { fill(it.begin(), it.end(), 0); while (ll f = dfs(s, t, LLONG_MAX)) flow += f; }
        return flow;
    }
    vector<bool> minCutSide(int s) {
        vector<bool> side(n, false); vector<int> st = {s}; side[s] = true;
        while (!st.empty()) { int u = st.back(); st.pop_back(); for (int id : g[u]) if (e[id].cap > 0 && !side[e[id].to]) { side[e[id].to] = true; st.push_back(e[id].to); } }
        return side;
    }
};
int main() {
    Dinic d(4);
    d.addEdge(0, 1, 3); d.addEdge(0, 2, 2); d.addEdge(1, 2, 1); d.addEdge(1, 3, 2); d.addEdge(2, 3, 3);
    cout << d.maxFlow(0, 3) << '\n';   // 5
    return 0;
}
` },
  { id: 'bipartite-matching', title: 'Bipartite matching: Hopcroft–Karp and Kuhn', cat: 'Flows & matching', topic: 'flows', tags: ['matching', 'hopcroft karp', 'kuhn', 'bipartite'],
    desc: 'Hopcroft–Karp for big graphs (O(E√V)); Kuhn when V ≤ ~1000 and you want ten lines.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

struct HopcroftKarp {                    // left 0..n-1, right 0..m-1
    int n, m; vector<vector<int>> adj; vector<int> matchL, matchR, dist;
    HopcroftKarp(int n, int m) : n(n), m(m), adj(n), matchL(n, -1), matchR(m, -1), dist(n) {}
    void addEdge(int l, int r) { adj[l].push_back(r); }
    bool bfs() {
        queue<int> q; bool found = false;
        for (int u = 0; u < n; u++) { if (matchL[u] == -1) { dist[u] = 0; q.push(u); } else dist[u] = -1; }
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int v : adj[u]) { int w = matchR[v]; if (w == -1) found = true; else if (dist[w] == -1) { dist[w] = dist[u] + 1; q.push(w); } }
        }
        return found;
    }
    bool dfs(int u) {
        for (int v : adj[u]) { int w = matchR[v]; if (w == -1 || (dist[w] == dist[u] + 1 && dfs(w))) { matchL[u] = v; matchR[v] = u; return true; } }
        dist[u] = -1; return false;
    }
    int maxMatching() { int res = 0; while (bfs()) for (int u = 0; u < n; u++) if (matchL[u] == -1 && dfs(u)) res++; return res; }
};
struct Kuhn {
    int n, m; vector<vector<int>> adj; vector<int> matchR; vector<bool> used;
    Kuhn(int n, int m) : n(n), m(m), adj(n), matchR(m, -1) {}
    void addEdge(int l, int r) { adj[l].push_back(r); }
    bool tryKuhn(int u) {
        if (used[u]) return false;
        used[u] = true;
        for (int v : adj[u]) if (matchR[v] == -1 || tryKuhn(matchR[v])) { matchR[v] = u; return true; }
        return false;
    }
    int maxMatching() { int res = 0; for (int u = 0; u < n; u++) { used.assign(n, false); if (tryKuhn(u)) res++; } return res; }
};
int main() {
    HopcroftKarp hk(3, 3); Kuhn k(3, 3);
    for (auto [a, b] : vector<pair<int, int>>{{0, 0}, {0, 1}, {1, 0}, {2, 2}}) { hk.addEdge(a, b); k.addEdge(a, b); }
    cout << hk.maxMatching() << ' ' << k.maxMatching() << '\n';   // 3 3
    return 0;
}
` },
  { id: 'min-cost-flow', title: 'Min-cost max-flow (SPFA)', cat: 'Flows & matching', topic: 'advanced-graphs', tags: ['min cost flow', 'mcmf', 'spfa'],
    desc: 'Successive shortest paths with Bellman–Ford/SPFA; handles negative costs (no negative cycles). Fine for a few thousand edges.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct MCMF {
    struct E { int to; ll cap, cost; };
    int n; vector<E> e; vector<vector<int>> g;
    MCMF(int n) : n(n), g(n) {}
    void addEdge(int a, int b, ll cap, ll cost) { g[a].push_back(e.size()); e.push_back({b, cap, cost}); g[b].push_back(e.size()); e.push_back({a, 0, -cost}); }
    pair<ll, ll> run(int s, int t, ll maxf = LLONG_MAX) {           // {flow, cost}
        ll flow = 0, cost = 0;
        while (flow < maxf) {
            vector<ll> d(n, LLONG_MAX); vector<int> pe(n, -1); vector<bool> inq(n, false);
            queue<int> q; d[s] = 0; q.push(s);
            while (!q.empty()) {
                int u = q.front(); q.pop(); inq[u] = false;
                for (int id : g[u]) if (e[id].cap > 0 && d[u] + e[id].cost < d[e[id].to]) {
                    d[e[id].to] = d[u] + e[id].cost; pe[e[id].to] = id;
                    if (!inq[e[id].to]) { inq[e[id].to] = true; q.push(e[id].to); }
                }
            }
            if (d[t] == LLONG_MAX) break;
            ll f = maxf - flow;
            for (int v = t; v != s; v = e[pe[v] ^ 1].to) f = min(f, e[pe[v]].cap);
            for (int v = t; v != s; v = e[pe[v] ^ 1].to) { e[pe[v]].cap -= f; e[pe[v] ^ 1].cap += f; }
            flow += f; cost += f * d[t];
        }
        return {flow, cost};
    }
};
int main() {
    MCMF g(4);
    g.addEdge(0, 1, 2, 1); g.addEdge(0, 2, 1, 2); g.addEdge(1, 3, 1, 1); g.addEdge(1, 2, 1, 1); g.addEdge(2, 3, 2, 1);
    auto [f, c] = g.run(0, 3);
    cout << f << ' ' << c << '\n';   // 3 8
    return 0;
}
` },
  { id: 'hungarian', title: 'Hungarian algorithm (assignment problem)', cat: 'Flows & matching', topic: 'advanced-graphs', tags: ['hungarian', 'assignment', 'matching', 'min cost'],
    desc: 'Minimum-cost perfect assignment of n rows to m ≥ n columns in O(n²m). Matrix is 1-indexed.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

pair<ll, vector<int>> hungarian(const vector<vector<ll>>& a) {   // a: (n+1) x (m+1), 1-indexed, n <= m
    int n = a.size() - 1, m = a[0].size() - 1;
    const ll INF = LLONG_MAX / 4;
    vector<ll> u(n + 1), v(m + 1); vector<int> p(m + 1), way(m + 1);
    for (int i = 1; i <= n; i++) {
        p[0] = i; int j0 = 0;
        vector<ll> minv(m + 1, INF); vector<bool> used(m + 1, false);
        do {
            used[j0] = true; int i0 = p[j0], j1 = 0; ll delta = INF;
            for (int j = 1; j <= m; j++) if (!used[j]) {
                ll cur = a[i0][j] - u[i0] - v[j];
                if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
                if (minv[j] < delta) { delta = minv[j]; j1 = j; }
            }
            for (int j = 0; j <= m; j++) { if (used[j]) { u[p[j]] += delta; v[j] -= delta; } else minv[j] -= delta; }
            j0 = j1;
        } while (p[j0] != 0);
        do { int j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
    }
    ll cost = 0;
    for (int j = 1; j <= m; j++) if (p[j]) cost += a[p[j]][j];
    return {cost, p};                                             // p[j] = row assigned to column j (0 = none)
}
int main() {
    vector<vector<ll>> a = {{0, 0, 0, 0}, {0, 4, 1, 3}, {0, 2, 0, 5}, {0, 3, 2, 2}};
    auto [cost, p] = hungarian(a);
    cout << cost << '\n';   // 5
    return 0;
}
` },

  /* ---------------- TREES ---------------- */
  { id: 'lca-binary-lifting', title: 'LCA, k-th ancestor, distance (binary lifting)', cat: 'Trees', topic: 'lca', tags: ['lca', 'binary lifting', 'kth ancestor', 'distance'],
    desc: 'Iterative build (no recursion), O(n log n) memory, O(log n) queries.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

struct LCA {
    int n, LOG; vector<vector<int>> up, adj; vector<int> depth;
    LCA(int n) : n(n), adj(n), depth(n, 0) { LOG = 1; while ((1 << LOG) < n) LOG++; up.assign(LOG + 1, vector<int>(n, 0)); }
    void addEdge(int a, int b) { adj[a].push_back(b); adj[b].push_back(a); }
    void build(int root = 0) {
        vector<int> st = {root}; vector<bool> vis(n, false); vis[root] = true; up[0][root] = root;
        while (!st.empty()) {
            int u = st.back(); st.pop_back();
            for (int v : adj[u]) if (!vis[v]) { vis[v] = true; depth[v] = depth[u] + 1; up[0][v] = u; st.push_back(v); }
        }
        for (int k = 1; k <= LOG; k++) for (int v = 0; v < n; v++) up[k][v] = up[k - 1][up[k - 1][v]];
    }
    int kthAncestor(int v, int k) { for (int b = 0; b <= LOG; b++) if (k >> b & 1) v = up[b][v]; return v; }   // stops at root
    int lca(int a, int b) {
        if (depth[a] < depth[b]) swap(a, b);
        a = kthAncestor(a, depth[a] - depth[b]);
        if (a == b) return a;
        for (int k = LOG; k >= 0; k--) if (up[k][a] != up[k][b]) { a = up[k][a]; b = up[k][b]; }
        return up[0][a];
    }
    int dist(int a, int b) { return depth[a] + depth[b] - 2 * depth[lca(a, b)]; }
};
int main() {
    LCA t(7);
    for (auto [a, b] : vector<pair<int, int>>{{0, 1}, {0, 2}, {1, 3}, {1, 4}, {2, 5}, {5, 6}}) t.addEdge(a, b);
    t.build(0);
    cout << t.lca(3, 4) << ' ' << t.lca(4, 6) << ' ' << t.dist(3, 6) << ' ' << t.kthAncestor(6, 2) << '\n';   // 1 0 5 2
    return 0;
}
` },
  { id: 'euler-tour-subtree', title: 'Euler tour: subtree queries with a Fenwick tree', cat: 'Trees', topic: 'trees-1', tags: ['euler tour', 'tin', 'tout', 'subtree', 'flatten'],
    desc: 'Flatten the tree so every subtree is a contiguous range, then any array structure answers subtree queries.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct Fenwick {
    int n; vector<ll> t;
    Fenwick(int n) : n(n), t(n + 1) {}
    void add(int i, ll v) { for (i++; i <= n; i += i & -i) t[i] += v; }       // 0-indexed API
    ll pre(int i) { ll s = 0; for (i++; i > 0; i -= i & -i) s += t[i]; return s; }
    ll sum(int l, int r) { return pre(r) - pre(l - 1); }
};
int main() {
    int n = 5;
    vector<vector<int>> children(n);
    children[0] = {1, 2}; children[1] = {3, 4};
    vector<int> tin(n), tout(n), order;
    vector<pair<int, int>> st = {{0, 0}};                                   // (node, next child index)
    while (!st.empty()) {
        int u = st.back().first, i = st.back().second;
        if (i == 0) { tin[u] = order.size(); order.push_back(u); }
        if (i < (int)children[u].size()) { st.back().second++; st.push_back({children[u][i], 0}); }
        else { tout[u] = order.size() - 1; st.pop_back(); }
    }
    vector<ll> val = {1, 2, 3, 4, 5};
    Fenwick fw(n);
    for (int v = 0; v < n; v++) fw.add(tin[v], val[v]);
    cout << fw.sum(tin[1], tout[1]) << '\n';   // subtree of 1: 2 + 4 + 5 = 11
    fw.add(tin[3], 10);                        // val[3] += 10
    cout << fw.sum(tin[0], tout[0]) << '\n';   // 25
    return 0;
}
` },
  { id: 'tree-rerooting-diameter', title: 'Tree: sum of distances by rerooting + diameter', cat: 'Trees', topic: 'dp-trees', tags: ['rerooting', 'diameter', 'tree dp', 'subtree size'],
    desc: 'Reads a tree. Computes the sum of distances from every node in O(n) (down pass + up pass) and the diameter with two BFS.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    cin.tie(nullptr)->sync_with_stdio(false);
    int n; cin >> n;
    vector<vector<int>> adj(n);
    for (int i = 0; i < n - 1; i++) { int a, b; cin >> a >> b; a--; b--; adj[a].push_back(b); adj[b].push_back(a); }
    // DFS order: parents before children
    vector<int> par(n, -1), order; order.reserve(n);
    { vector<int> st = {0}; vector<bool> vis(n, false); vis[0] = true;
      while (!st.empty()) { int u = st.back(); st.pop_back(); order.push_back(u);
        for (int v : adj[u]) if (!vis[v]) { vis[v] = true; par[v] = u; st.push_back(v); } } }
    // down pass: subtree sizes and sum of depths inside the subtree
    vector<ll> sz(n, 1), down(n, 0);
    for (int i = n - 1; i > 0; i--) { int v = order[i], p = par[v]; sz[p] += sz[v]; down[p] += down[v] + sz[v]; }
    // up pass (rerooting): moving the root from p to v makes sz[v] nodes closer and n - sz[v] nodes farther
    vector<ll> ans(n); ans[0] = down[0];
    for (int i = 1; i < n; i++) { int v = order[i], p = par[v]; ans[v] = ans[p] - sz[v] + (n - sz[v]); }
    for (int v = 0; v < n; v++) cout << ans[v] << ' ';
    cout << '\n';
    // diameter: farthest from any node, then farthest from that
    auto bfs = [&](int s) {
        vector<int> d(n, -1); queue<int> q; q.push(s); d[s] = 0; int far = s;
        while (!q.empty()) { int u = q.front(); q.pop(); if (d[u] > d[far]) far = u; for (int v : adj[u]) if (d[v] == -1) { d[v] = d[u] + 1; q.push(v); } }
        return make_pair(far, d[far]);
    };
    int a = bfs(0).first;
    cout << bfs(a).second << '\n';
    return 0;
}
` },
  { id: 'hld', title: 'Heavy-light decomposition (path max, point update)', cat: 'Trees', topic: 'hld-centroid', tags: ['hld', 'heavy light', 'path query', 'segment tree'],
    desc: 'Path queries in O(log² n). Uses an iterative max segment tree over the HLD order; swap `max` for sum if needed.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct HLD {
    int n, N = 1, cur = 0; vector<vector<int>> adj; vector<int> par, depth, heavy, head, pos, sz; vector<ll> seg;
    HLD(int n) : n(n), adj(n), par(n, -1), depth(n, 0), heavy(n, -1), head(n), pos(n), sz(n, 1) { while (N < n) N <<= 1; seg.assign(2 * N, LLONG_MIN); }
    void addEdge(int a, int b) { adj[a].push_back(b); adj[b].push_back(a); }
    void build(int root = 0) {
        vector<int> order, st = {root};
        while (!st.empty()) { int u = st.back(); st.pop_back(); order.push_back(u); for (int v : adj[u]) if (v != par[u]) { par[v] = u; depth[v] = depth[u] + 1; st.push_back(v); } }
        for (int i = n - 1; i >= 0; i--) { int v = order[i]; if (par[v] != -1) { sz[par[v]] += sz[v]; if (heavy[par[v]] == -1 || sz[v] > sz[heavy[par[v]]]) heavy[par[v]] = v; } }
        for (int u : order) if (par[u] == -1 || heavy[par[u]] != u)          // u starts a new chain
            for (int v = u; v != -1; v = heavy[v]) { head[v] = u; pos[v] = cur++; }
    }
    void update(int v, ll val) { int i = pos[v] + N; seg[i] = val; for (i >>= 1; i; i >>= 1) seg[i] = max(seg[2 * i], seg[2 * i + 1]); }
    ll query(int l, int r) { ll res = LLONG_MIN; for (l += N, r += N + 1; l < r; l >>= 1, r >>= 1) { if (l & 1) res = max(res, seg[l++]); if (r & 1) res = max(res, seg[--r]); } return res; }
    ll pathMax(int a, int b) {
        ll res = LLONG_MIN;
        for (; head[a] != head[b]; b = par[head[b]]) { if (depth[head[a]] > depth[head[b]]) swap(a, b); res = max(res, query(pos[head[b]], pos[b])); }
        if (depth[a] > depth[b]) swap(a, b);
        return max(res, query(pos[a], pos[b]));
    }
};
int main() {
    HLD h(6);
    for (auto [a, b] : vector<pair<int, int>>{{0, 1}, {0, 2}, {1, 3}, {1, 4}, {2, 5}}) h.addEdge(a, b);
    h.build(0);
    vector<ll> val = {1, 7, 3, 2, 9, 4};
    for (int v = 0; v < 6; v++) h.update(v, val[v]);
    cout << h.pathMax(3, 5) << ' ' << h.pathMax(4, 3) << '\n';   // 7 9
    h.update(0, 20);
    cout << h.pathMax(3, 5) << '\n';                             // 20
    return 0;
}
` },
  { id: 'centroid-decomposition', title: 'Centroid decomposition (count paths of length K)', cat: 'Trees', topic: 'hld-centroid', tags: ['centroid', 'decomposition', 'paths', 'divide and conquer'],
    desc: 'Every path is counted at the highest centroid it passes through. O(n log n) node visits.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

struct Centroid {
    int n; vector<vector<int>> adj; vector<bool> removed; vector<int> sz; long long K, answer = 0;
    Centroid(int n, long long K) : n(n), adj(n), removed(n, false), sz(n), K(K) {}
    void addEdge(int a, int b) { adj[a].push_back(b); adj[b].push_back(a); }
    int calcSize(int u, int p) { sz[u] = 1; for (int v : adj[u]) if (v != p && !removed[v]) sz[u] += calcSize(v, u); return sz[u]; }
    int findCentroid(int u, int p, int total) { for (int v : adj[u]) if (v != p && !removed[v] && sz[v] * 2 > total) return findCentroid(v, u, total); return u; }
    void collect(int u, int p, int d, vector<int>& out) { if (d > K) return; out.push_back(d); for (int v : adj[u]) if (v != p && !removed[v]) collect(v, u, d + 1, out); }
    void solve(int root) {
        int c = findCentroid(root, -1, calcSize(root, -1));
        removed[c] = true;
        vector<long long> cnt(K + 2, 0); cnt[0] = 1;                        // depths seen in earlier child subtrees (+ the centroid itself)
        for (int v : adj[c]) if (!removed[v]) {
            vector<int> ds; collect(v, c, 1, ds);
            for (int d : ds) if (K - d >= 0) answer += cnt[K - d];
            for (int d : ds) cnt[d]++;
        }
        for (int v : adj[c]) if (!removed[v]) solve(v);
    }
};
int main() {
    Centroid cd(5, 2);
    for (auto [a, b] : vector<pair<int, int>>{{0, 1}, {1, 2}, {2, 3}, {3, 4}}) cd.addEdge(a, b);
    cd.solve(0);
    cout << cd.answer << '\n';   // 3
    return 0;
}
` },
  { id: 'dsu-on-tree', title: 'Small-to-large merging (distinct colours per subtree)', cat: 'Trees', topic: 'hld-centroid', tags: ['small to large', 'dsu on tree', 'subtree', 'distinct'],
    desc: 'Reads a coloured tree; answers “distinct colours in the subtree of v” for all v by always merging the smaller set into the larger.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    cin.tie(nullptr)->sync_with_stdio(false);
    int n; cin >> n;
    vector<int> color(n);
    for (auto& c : color) cin >> c;
    vector<vector<int>> adj(n);
    for (int i = 0; i < n - 1; i++) { int a, b; cin >> a >> b; a--; b--; adj[a].push_back(b); adj[b].push_back(a); }
    vector<int> par(n, -1), order, st = {0}; vector<bool> vis(n, false); vis[0] = true;
    while (!st.empty()) { int u = st.back(); st.pop_back(); order.push_back(u); for (int v : adj[u]) if (!vis[v]) { vis[v] = true; par[v] = u; st.push_back(v); } }
    vector<set<int>> s(n); vector<int> ans(n);
    for (int i = n - 1; i >= 0; i--) {                       // children are processed before their parent
        int v = order[i];
        s[v].insert(color[v]);
        ans[v] = s[v].size();
        if (par[v] != -1) {
            int p = par[v];
            if (s[p].size() < s[v].size()) swap(s[p], s[v]);
            for (int c : s[v]) s[p].insert(c);
            s[v].clear();
        }
    }
    for (int v = 0; v < n; v++) cout << ans[v] << ' ';
    cout << '\n';
    return 0;
}
` },

  /* ---------------- DP ---------------- */
  { id: 'knapsack-variants', title: 'Knapsack: 0/1, unbounded, bounded, bitset subset-sum', cat: 'Dynamic programming', topic: 'dp-1', tags: ['knapsack', 'subset sum', 'bitset', 'bounded'],
    desc: 'The four knapsack loops side by side. The only difference between 0/1 and unbounded is the direction of the capacity loop.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    int W = 10;
    vector<int> wt = {3, 4, 5}, val = {4, 5, 7};
    int n = wt.size();
    vector<ll> dp(W + 1, 0);                                   // 0/1: capacity downwards
    for (int i = 0; i < n; i++) for (int w = W; w >= wt[i]; w--) dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
    cout << dp[W] << '\n';                                     // 12
    vector<ll> un(W + 1, 0);                                   // unbounded: capacity upwards
    for (int i = 0; i < n; i++) for (int w = wt[i]; w <= W; w++) un[w] = max(un[w], un[w - wt[i]] + val[i]);
    cout << un[W] << '\n';                                     // 14
    vector<int> cnt = {2, 1, 1};                               // bounded: split cnt into 1,2,4,... copies, then 0/1
    vector<ll> bd(W + 1, 0);
    for (int i = 0; i < n; i++) for (int k = 1, left = cnt[i]; left > 0; k <<= 1) {
        int take = min(k, left); left -= take;
        int w0 = wt[i] * take; ll v0 = (ll)val[i] * take;
        for (int w = W; w >= w0; w--) bd[w] = max(bd[w], bd[w - w0] + v0);
    }
    cout << bd[W] << '\n';                                     // 13
    bitset<11> reach; reach[0] = 1;                            // subset-sum feasibility, 64x faster than bool DP
    for (int x : wt) reach |= reach << x;
    cout << reach << '\n';                                     // 01110111001
    return 0;
}
` },
  { id: 'lis-nlogn', title: 'LIS in O(n log n) with reconstruction', cat: 'Dynamic programming', topic: 'dp-1', tags: ['lis', 'longest increasing subsequence', 'lower_bound'],
    desc: 'tails[k] = smallest possible tail of an increasing subsequence of length k+1. Use upper_bound for non-decreasing.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<int> a = {3, 1, 4, 1, 5, 9, 2, 6};
    int n = a.size();
    vector<int> tails, tailIdx, prevIdx(n, -1);
    for (int i = 0; i < n; i++) {
        int k = lower_bound(tails.begin(), tails.end(), a[i]) - tails.begin();
        if (k == (int)tails.size()) { tails.push_back(a[i]); tailIdx.push_back(i); }
        else { tails[k] = a[i]; tailIdx[k] = i; }
        prevIdx[i] = k ? tailIdx[k - 1] : -1;
    }
    cout << tails.size() << '\n';                              // 4
    vector<int> lis;
    for (int i = tailIdx.back(); i != -1; i = prevIdx[i]) lis.push_back(a[i]);
    reverse(lis.begin(), lis.end());
    for (int x : lis) cout << x << ' ';                        // 1 4 5 6
    cout << '\n';
    return 0;
}
` },
  { id: 'bitmask-tsp', title: 'Bitmask DP: travelling salesman (Held–Karp)', cat: 'Dynamic programming', topic: 'dp-2', tags: ['bitmask', 'tsp', 'held karp', 'subsets'],
    desc: 'dp[mask][v] = cheapest way to visit exactly `mask` ending at v. O(2ⁿ·n²), n ≤ 18.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    int n = 4;
    vector<vector<ll>> d = {{0, 10, 15, 20}, {10, 0, 35, 25}, {15, 35, 0, 30}, {20, 25, 30, 0}};
    const ll INF = LLONG_MAX / 4;
    vector<vector<ll>> dp(1 << n, vector<ll>(n, INF));
    dp[1][0] = 0;                                              // start at node 0
    for (int mask = 1; mask < (1 << n); mask++)
        for (int u = 0; u < n; u++) {
            if (dp[mask][u] == INF || !(mask >> u & 1)) continue;
            for (int v = 0; v < n; v++) if (!(mask >> v & 1))
                dp[mask | 1 << v][v] = min(dp[mask | 1 << v][v], dp[mask][u] + d[u][v]);
        }
    ll best = INF;
    for (int u = 1; u < n; u++) best = min(best, dp[(1 << n) - 1][u] + d[u][0]);   // return to start
    cout << best << '\n';                                      // 80
    return 0;
}
` },
  { id: 'digit-dp', title: 'Digit DP (count numbers ≤ N with a digit property)', cat: 'Dynamic programming', topic: 'dp-2', tags: ['digit dp', 'tight', 'count numbers'],
    desc: 'State (position, tight, accumulated property). Count in [L, R] as count(R) − count(L−1).',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

string s; int K;
ll memo[20][2][200];
bool seen[20][2][200];
ll go(int pos, bool tight, int sum) {                          // numbers whose digit sum % K == 0
    if (pos == (int)s.size()) return sum % K == 0;
    if (seen[pos][tight][sum]) return memo[pos][tight][sum];
    seen[pos][tight][sum] = true;
    int lim = tight ? s[pos] - '0' : 9;
    ll res = 0;
    for (int d = 0; d <= lim; d++) res += go(pos + 1, tight && d == lim, sum + d);
    return memo[pos][tight][sum] = res;
}
ll count(ll N) { if (N < 0) return 0; s = to_string(N); memset(seen, 0, sizeof seen); return go(0, true, 0); }
int main() {
    K = 3;
    cout << count(100) - count(0) << '\n';                    // 33 (multiples of 3 in [1, 100])
    return 0;
}
` },
  { id: 'sos-dp', title: 'Sum over subsets (SOS) DP', cat: 'Dynamic programming', topic: 'dp-2', tags: ['sos', 'subsets', 'supersets', 'bitmask'],
    desc: 'f[mask] = Σ a[sub] over sub ⊆ mask in O(2ⁿ n). Flip the condition for superset sums.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    int n = 3;
    vector<ll> a = {1, 2, 3, 4, 5, 6, 7, 8};                   // a[mask]
    vector<ll> f = a;
    for (int b = 0; b < n; b++) for (int mask = 0; mask < (1 << n); mask++) if (mask >> b & 1) f[mask] += f[mask ^ (1 << b)];
    cout << f[5] << ' ' << f[7] << '\n';                       // 14 36
    vector<ll> g = a;                                          // superset sums
    for (int b = 0; b < n; b++) for (int mask = 0; mask < (1 << n); mask++) if (!(mask >> b & 1)) g[mask] += g[mask | (1 << b)];
    cout << g[6] << '\n';                                      // 15
    return 0;
}
` },
  { id: 'divide-conquer-dp', title: 'Divide & conquer DP optimization', cat: 'Dynamic programming', topic: 'dp-optimizations', tags: ['divide and conquer', 'dp optimization', 'monotone opt'],
    desc: 'When the optimal split point is monotone, each DP layer costs O(n log n) instead of O(n²). Example: split into k groups minimizing Σ(group sum)².',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int n, k; vector<ll> pre, prevLayer, cur;
ll cost(int j, int i) { ll s = pre[i] - pre[j]; return s * s; }   // group covers elements (j, i]
void compute(int lo, int hi, int optLo, int optHi) {
    if (lo > hi) return;
    int mid = (lo + hi) / 2; pair<ll, int> best = {LLONG_MAX, -1};
    for (int j = optLo; j <= min(mid - 1, optHi); j++) best = min(best, {prevLayer[j] + cost(j, mid), j});
    cur[mid] = best.first;
    compute(lo, mid - 1, optLo, best.second);
    compute(mid + 1, hi, best.second, optHi);
}
int main() {
    vector<ll> a = {1, 2, 3, 4, 5, 6}; n = a.size(); k = 3;
    pre.assign(n + 1, 0); for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
    prevLayer.assign(n + 1, LLONG_MAX / 4); prevLayer[0] = 0; cur.assign(n + 1, 0);
    for (int g = 1; g <= k; g++) { fill(cur.begin(), cur.end(), LLONG_MAX / 4); compute(g, n, g - 1, n - 1); swap(prevLayer, cur); }
    cout << prevLayer[n] << '\n';                              // 153  ({1,2,3},{4,5},{6})
    return 0;
}
` },
  { id: 'cht-monotone', title: 'Convex hull trick (monotone, deque)', cat: 'Dynamic programming', topic: 'dp-optimizations', tags: ['cht', 'convex hull trick', 'lines', 'deque'],
    desc: 'Minimum over lines when slopes are added in decreasing order and queries come in increasing x. Amortized O(1).',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct CHT {
    deque<pair<ll, ll>> d;                                     // lines (m, c), slopes strictly decreasing
    bool bad(pair<ll, ll> a, pair<ll, ll> b, pair<ll, ll> c) { // is b useless between a and c?
        return (__int128)(c.second - a.second) * (a.first - b.first) <= (__int128)(b.second - a.second) * (a.first - c.first);
    }
    void add(ll m, ll c) {
        pair<ll, ll> ln = {m, c};
        while (d.size() >= 2 && bad(d[d.size() - 2], d.back(), ln)) d.pop_back();
        d.push_back(ln);
    }
    ll query(ll x) {                                           // x non-decreasing between calls
        while (d.size() >= 2 && d[0].first * x + d[0].second >= d[1].first * x + d[1].second) d.pop_front();
        return d[0].first * x + d[0].second;
    }
};
int main() {
    CHT h; h.add(3, 0); h.add(1, 2); h.add(0, 5);              // y = 3x, y = x + 2, y = 5
    for (ll x : {0, 1, 2, 4}) cout << h.query(x) << ' ';       // 0 3 4 5
    cout << '\n';
    return 0;
}
` },

  /* ---------------- STRINGS ---------------- */
  { id: 'string-hashing', title: 'Polynomial string hashing (double modulus)', cat: 'Strings', topic: 'strings-1', tags: ['hash', 'rolling hash', 'substring compare'],
    desc: 'Compare any two substrings in O(1). Random base defeats anti-hash tests; two moduli make collisions negligible.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct Hash {
    static const ll M1 = 1000000007, M2 = 998244353;
    static ll B;
    vector<ll> h1, h2, p1, p2;
    Hash(const string& s) {
        int n = s.size(); h1.assign(n + 1, 0); h2.assign(n + 1, 0); p1.assign(n + 1, 1); p2.assign(n + 1, 1);
        for (int i = 0; i < n; i++) {
            h1[i + 1] = (h1[i] * B + s[i]) % M1; h2[i + 1] = (h2[i] * B + s[i]) % M2;
            p1[i + 1] = p1[i] * B % M1;       p2[i + 1] = p2[i] * B % M2;
        }
    }
    pair<ll, ll> get(int l, int r) const {                     // hash of s[l..r]
        ll a = (h1[r + 1] - h1[l] * p1[r - l + 1] % M1 + M1) % M1;
        ll b = (h2[r + 1] - h2[l] * p2[r - l + 1] % M2 + M2) % M2;
        return {a, b};
    }
};
ll Hash::B = 131 + chrono::steady_clock::now().time_since_epoch().count() % 1000;
int main() {
    Hash h("abracadabra");
    cout << (h.get(0, 3) == h.get(7, 10)) << ' ' << (h.get(0, 3) == h.get(1, 4)) << '\n';   // 1 0
    return 0;
}
` },
  { id: 'kmp-prefix-function', title: 'Prefix function (KMP) + matching + period', cat: 'Strings', topic: 'strings-1', tags: ['kmp', 'prefix function', 'pattern matching', 'period'],
    desc: 'π[i] = longest proper border of s[0..i]. Matching in O(n + m); smallest period = n − π[n−1].',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

vector<int> prefixFunction(const string& s) {
    int n = s.size(); vector<int> pi(n, 0);
    for (int i = 1; i < n; i++) {
        int j = pi[i - 1];
        while (j > 0 && s[i] != s[j]) j = pi[j - 1];
        if (s[i] == s[j]) j++;
        pi[i] = j;
    }
    return pi;
}
vector<int> kmpFind(const string& t, const string& p) {         // start positions of p in t
    vector<int> pi = prefixFunction(p), res;
    int j = 0;
    for (int i = 0; i < (int)t.size(); i++) {
        while (j > 0 && t[i] != p[j]) j = pi[j - 1];
        if (t[i] == p[j]) j++;
        if (j == (int)p.size()) { res.push_back(i - j + 1); j = pi[j - 1]; }
    }
    return res;
}
int main() {
    for (int x : prefixFunction("abcabcd")) cout << x << ' ';   // 0 0 0 1 2 3 0
    cout << '\n';
    for (int x : kmpFind("abababa", "aba")) cout << x << ' ';   // 0 2 4
    cout << '\n';
    string s = "abcabcab"; auto pi = prefixFunction(s);
    cout << s.size() - pi.back() << '\n';                       // 3 = smallest period
    return 0;
}
` },
  { id: 'z-function', title: 'Z-function', cat: 'Strings', topic: 'strings-1', tags: ['z function', 'pattern matching', 'lcp'],
    desc: 'z[i] = LCP of s and s[i..]. Pattern matching via Z of pattern + separator + text.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

vector<int> zFunction(const string& s) {
    int n = s.size(); vector<int> z(n, 0); z[0] = n;
    for (int i = 1, l = 0, r = 0; i < n; i++) {
        if (i < r) z[i] = min(r - i, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    return z;
}
int main() {
    for (int x : zFunction("aabxaab")) cout << x << ' ';        // 7 1 0 0 3 1 0
    cout << '\n';
    string p = "aab", t = "aabxaab";
    auto z = zFunction(p + '#' + t);
    for (int i = p.size() + 1; i < (int)z.size(); i++) if (z[i] == (int)p.size()) cout << i - p.size() - 1 << ' ';   // 0 4
    cout << '\n';
    return 0;
}
` },
  { id: 'manacher', title: 'Manacher (all palindromes in O(n))', cat: 'Strings', topic: 'strings-1', tags: ['manacher', 'palindrome'],
    desc: 'd1[i] = odd palindromes centred at i, d2[i] = even palindromes centred between i−1 and i. Total = number of palindromic substrings.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

pair<vector<int>, vector<int>> manacher(const string& s) {
    int n = s.size(); vector<int> d1(n), d2(n);
    for (int i = 0, l = 0, r = -1; i < n; i++) {
        int k = i > r ? 1 : min(d1[l + r - i], r - i + 1);
        while (i - k >= 0 && i + k < n && s[i - k] == s[i + k]) k++;
        d1[i] = k--;
        if (i + k > r) { l = i - k; r = i + k; }
    }
    for (int i = 0, l = 0, r = -1; i < n; i++) {
        int k = i > r ? 0 : min(d2[l + r - i + 1], r - i + 1);
        while (i - k - 1 >= 0 && i + k < n && s[i - k - 1] == s[i + k]) k++;
        d2[i] = k--;
        if (i + k > r) { l = i - k - 1; r = i + k; }
    }
    return {d1, d2};
}
int main() {
    string s = "abaab";
    auto [d1, d2] = manacher(s);
    long long total = 0; int best = 0;
    for (int i = 0; i < (int)s.size(); i++) { total += d1[i] + d2[i]; best = max({best, 2 * d1[i] - 1, 2 * d2[i]}); }
    cout << total << ' ' << best << '\n';                       // 8 4
    return 0;
}
` },
  { id: 'trie', title: 'Trie (words & prefixes) + XOR trie', cat: 'Strings', topic: 'strings-2', tags: ['trie', 'prefix', 'xor trie', 'maximum xor'],
    desc: 'Array-based trie for lowercase words, and a binary trie for “maximum XOR with any inserted number”.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

struct Trie {
    vector<array<int, 26>> nxt; vector<int> cntEnd, cntPass;
    Trie() { newNode(); }
    int newNode() { nxt.push_back({}); nxt.back().fill(-1); cntEnd.push_back(0); cntPass.push_back(0); return nxt.size() - 1; }
    void insert(const string& s) {
        int v = 0;
        for (char ch : s) { int c = ch - 'a'; if (nxt[v][c] == -1) { int u = newNode(); nxt[v][c] = u; } v = nxt[v][c]; cntPass[v]++; }
        cntEnd[v]++;
    }
    int countPrefix(const string& p) { int v = 0; for (char ch : p) { int c = ch - 'a'; if (nxt[v][c] == -1) return 0; v = nxt[v][c]; } return cntPass[v]; }
    bool contains(const string& s) { int v = 0; for (char ch : s) { int c = ch - 'a'; if (nxt[v][c] == -1) return false; v = nxt[v][c]; } return cntEnd[v] > 0; }
};
struct XorTrie {                                               // values < 2^30
    vector<array<int, 2>> nxt = {{-1, -1}};
    void insert(int x) { int v = 0; for (int b = 29; b >= 0; b--) { int c = x >> b & 1; if (nxt[v][c] == -1) { nxt[v][c] = nxt.size(); nxt.push_back({-1, -1}); } v = nxt[v][c]; } }
    int maxXor(int x) { int v = 0, res = 0; for (int b = 29; b >= 0; b--) { int c = x >> b & 1; if (nxt[v][c ^ 1] != -1) { res |= 1 << b; v = nxt[v][c ^ 1]; } else v = nxt[v][c]; } return res; }
};
int main() {
    Trie t; for (string w : {"car", "cart", "cat", "dog"}) t.insert(w);
    cout << t.countPrefix("ca") << ' ' << t.contains("car") << t.contains("ca") << '\n';   // 3 10
    XorTrie xt; for (int x : {3, 10, 5}) xt.insert(x);
    cout << xt.maxXor(6) << '\n';                              // 12
    return 0;
}
` },
  { id: 'aho-corasick', title: 'Aho–Corasick (multi-pattern matching)', cat: 'Strings', topic: 'strings-2', tags: ['aho corasick', 'automaton', 'multiple patterns'],
    desc: 'Builds the automaton with full goto transitions; `cnt[v]` = number of patterns that are suffixes of the current position.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

struct AhoCorasick {
    vector<array<int, 26>> nxt; vector<int> link, out, cnt;
    AhoCorasick() { nxt.push_back({}); nxt[0].fill(-1); link.push_back(0); out.push_back(0); cnt.push_back(0); }
    void insert(const string& s) {
        int v = 0;
        for (char ch : s) {
            int c = ch - 'a';
            if (nxt[v][c] == -1) { nxt[v][c] = nxt.size(); nxt.push_back({}); nxt.back().fill(-1); link.push_back(0); out.push_back(0); cnt.push_back(0); }
            v = nxt[v][c];
        }
        out[v]++;
    }
    void build() {
        queue<int> q;
        for (int c = 0; c < 26; c++) { if (nxt[0][c] == -1) nxt[0][c] = 0; else { link[nxt[0][c]] = 0; q.push(nxt[0][c]); } }
        while (!q.empty()) {
            int v = q.front(); q.pop();
            cnt[v] = out[v] + cnt[link[v]];
            for (int c = 0; c < 26; c++) {
                int u = nxt[v][c];
                if (u == -1) nxt[v][c] = nxt[link[v]][c];
                else { link[u] = nxt[link[v]][c]; q.push(u); }
            }
        }
    }
    long long countOccurrences(const string& text) {
        long long total = 0; int v = 0;
        for (char ch : text) { v = nxt[v][ch - 'a']; total += cnt[v]; }
        return total;
    }
};
int main() {
    AhoCorasick ac; for (string p : {"he", "she", "his", "hers"}) ac.insert(p);
    ac.build();
    cout << ac.countOccurrences("ushers") << '\n';             // 3
    return 0;
}
` },
  { id: 'suffix-array-lcp', title: 'Suffix array O(n log n) + Kasai LCP', cat: 'Strings', topic: 'strings-2', tags: ['suffix array', 'lcp', 'kasai', 'distinct substrings'],
    desc: 'Prefix doubling with counting sort. LCP array gives distinct substrings, longest repeated substring, and more.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

vector<int> suffixArray(const string& s0) {
    string s = s0 + '$';                                       // sentinel smaller than every letter
    int n = s.size(), classes = 256;
    vector<int> p(n), c(n), cnt(max(n, classes), 0), pn(n), cn(n);
    for (char ch : s) cnt[(unsigned char)ch]++;
    for (int i = 1; i < classes; i++) cnt[i] += cnt[i - 1];
    for (int i = n - 1; i >= 0; i--) p[--cnt[(unsigned char)s[i]]] = i;
    c[p[0]] = 0; classes = 1;
    for (int i = 1; i < n; i++) { if (s[p[i]] != s[p[i - 1]]) classes++; c[p[i]] = classes - 1; }
    for (int h = 0; (1 << h) < n; h++) {
        for (int i = 0; i < n; i++) { pn[i] = p[i] - (1 << h); if (pn[i] < 0) pn[i] += n; }
        fill(cnt.begin(), cnt.begin() + classes, 0);
        for (int i = 0; i < n; i++) cnt[c[pn[i]]]++;
        for (int i = 1; i < classes; i++) cnt[i] += cnt[i - 1];
        for (int i = n - 1; i >= 0; i--) p[--cnt[c[pn[i]]]] = pn[i];
        cn[p[0]] = 0; classes = 1;
        for (int i = 1; i < n; i++) {
            pair<int, int> cur = {c[p[i]], c[(p[i] + (1 << h)) % n]}, prev = {c[p[i - 1]], c[(p[i - 1] + (1 << h)) % n]};
            if (cur != prev) classes++;
            cn[p[i]] = classes - 1;
        }
        c.swap(cn);
    }
    return vector<int>(p.begin() + 1, p.end());                // drop the sentinel suffix
}
vector<int> kasai(const string& s, const vector<int>& sa) {   // lcp[i] = LCP(sa[i], sa[i+1])
    int n = s.size(); vector<int> rank(n), lcp(max(0, n - 1));
    for (int i = 0; i < n; i++) rank[sa[i]] = i;
    for (int i = 0, k = 0; i < n; i++) {
        if (rank[i] == n - 1) { k = 0; continue; }
        int j = sa[rank[i] + 1];
        while (i + k < n && j + k < n && s[i + k] == s[j + k]) k++;
        lcp[rank[i]] = k;
        if (k) k--;
    }
    return lcp;
}
int main() {
    string s = "banana";
    auto sa = suffixArray(s);
    for (int x : sa) cout << x << ' ';                         // 5 3 1 0 4 2
    cout << '\n';
    auto lcp = kasai(s, sa);
    long long distinct = (long long)s.size() * (s.size() + 1) / 2;
    for (int x : lcp) distinct -= x;
    cout << distinct << '\n';                                  // 15
    return 0;
}
` },
  { id: 'suffix-automaton', title: 'Suffix automaton (distinct substrings, occurrences)', cat: 'Strings', topic: 'strings-2', tags: ['suffix automaton', 'sam', 'distinct substrings', 'occurrences'],
    desc: 'Linear-size automaton of all substrings. Distinct substrings = Σ(len[v] − len[link[v]]); occurrence counts via suffix links.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

struct SuffixAutomaton {
    struct State { int len = 0, link = -1; map<char, int> next; long long cnt = 0; };
    vector<State> st; int last = 0;
    SuffixAutomaton() { st.emplace_back(); }
    void extend(char ch) {
        int cur = st.size(); st.emplace_back(); st[cur].len = st[last].len + 1; st[cur].cnt = 1;
        int p = last;
        while (p != -1 && !st[p].next.count(ch)) { st[p].next[ch] = cur; p = st[p].link; }
        if (p == -1) st[cur].link = 0;
        else {
            int q = st[p].next[ch];
            if (st[p].len + 1 == st[q].len) st[cur].link = q;
            else {
                int clone = st.size(); State copy = st[q]; st.push_back(copy);
                st[clone].len = st[p].len + 1; st[clone].cnt = 0;
                while (p != -1 && st[p].next[ch] == q) { st[p].next[ch] = clone; p = st[p].link; }
                st[q].link = st[cur].link = clone;
            }
        }
        last = cur;
    }
    long long distinctSubstrings() { long long r = 0; for (int i = 1; i < (int)st.size(); i++) r += st[i].len - st[st[i].link].len; return r; }
    void computeOccurrences() {                                // propagate cnt along suffix links, longest first
        vector<int> order(st.size()); iota(order.begin(), order.end(), 0);
        sort(order.begin(), order.end(), [&](int a, int b) { return st[a].len > st[b].len; });
        for (int v : order) if (st[v].link != -1) st[st[v].link].cnt += st[v].cnt;
    }
    long long occurrences(const string& p) {
        int v = 0;
        for (char ch : p) { auto it = st[v].next.find(ch); if (it == st[v].next.end()) return 0; v = it->second; }
        return st[v].cnt;
    }
};
int main() {
    SuffixAutomaton sa; for (char ch : string("banana")) sa.extend(ch);
    sa.computeOccurrences();
    cout << sa.distinctSubstrings() << ' ' << sa.occurrences("ana") << '\n';   // 15 2
    return 0;
}
` },

  /* ---------------- GEOMETRY ---------------- */
  { id: 'geometry-basics', title: 'Integer geometry: cross/dot, orientation, segments, polygon area, point in polygon', cat: 'Geometry', topic: 'geometry-1', tags: ['geometry', 'cross product', 'orientation', 'segment intersection', 'polygon area', 'point in polygon'],
    desc: 'Everything exact in long long (coordinates up to ~10⁹). No doubles, no epsilons.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct P {
    ll x, y;
    P operator-(P o) const { return {x - o.x, y - o.y}; }
    P operator+(P o) const { return {x + o.x, y + o.y}; }
    ll cross(P o) const { return x * o.y - y * o.x; }
    ll dot(P o) const { return x * o.x + y * o.y; }
    ll norm2() const { return x * x + y * y; }
    bool operator<(P o) const { return make_pair(x, y) < make_pair(o.x, o.y); }
    bool operator==(P o) const { return x == o.x && y == o.y; }
};
ll cross(P a, P b, P c) { return (b - a).cross(c - a); }     // > 0: a->b->c turns left (counter-clockwise)
int sgn(ll v) { return (v > 0) - (v < 0); }
bool onSegment(P p, P a, P b) { return cross(a, b, p) == 0 && (p - a).dot(p - b) <= 0; }
bool segmentsIntersect(P a, P b, P c, P d) {                // closed segments, touching counts
    int d1 = sgn(cross(c, d, a)), d2 = sgn(cross(c, d, b)), d3 = sgn(cross(a, b, c)), d4 = sgn(cross(a, b, d));
    if (d1 * d2 < 0 && d3 * d4 < 0) return true;
    return onSegment(a, c, d) || onSegment(b, c, d) || onSegment(c, a, b) || onSegment(d, a, b);
}
ll polygonArea2(const vector<P>& poly) {                    // doubled signed area; > 0 if counter-clockwise
    ll s = 0; int n = poly.size();
    for (int i = 0; i < n; i++) s += poly[i].cross(poly[(i + 1) % n]);
    return s;
}
int pointInPolygon(P p, const vector<P>& poly) {            // 0 outside, 1 inside, 2 on boundary (any simple polygon)
    int n = poly.size(); bool in = false;
    for (int i = 0; i < n; i++) {
        P a = poly[i], b = poly[(i + 1) % n];
        if (onSegment(p, a, b)) return 2;
        if ((a.y > p.y) != (b.y > p.y)) {
            ll c = cross(a, b, p);
            if ((c > 0) == (b.y > a.y)) in = !in;             // ray to +x crosses the edge
        }
    }
    return in ? 1 : 0;
}
int main() {
    vector<P> sq = {{0, 0}, {4, 0}, {4, 4}, {0, 4}};
    cout << polygonArea2(sq) / 2 << ' ' << pointInPolygon({2, 2}, sq) << pointInPolygon({4, 2}, sq) << pointInPolygon({5, 5}, sq) << '\n';   // 16 120
    cout << segmentsIntersect({0, 0}, {4, 4}, {0, 4}, {4, 0}) << segmentsIntersect({0, 0}, {1, 1}, {2, 2}, {3, 3}) << '\n';                  // 10
    return 0;
}
` },
  { id: 'convex-hull', title: 'Convex hull (Andrew’s monotone chain)', cat: 'Geometry', topic: 'geometry-1', tags: ['convex hull', 'monotone chain', 'geometry'],
    desc: 'O(n log n), counter-clockwise output, collinear points removed (change `<= 0` to `< 0` to keep them).',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct P { ll x, y; bool operator<(P o) const { return make_pair(x, y) < make_pair(o.x, o.y); } };
ll cross(P o, P a, P b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }
vector<P> convexHull(vector<P> pts) {
    sort(pts.begin(), pts.end());
    pts.erase(unique(pts.begin(), pts.end(), [](P a, P b) { return a.x == b.x && a.y == b.y; }), pts.end());
    int n = pts.size(); if (n < 3) return pts;
    vector<P> h(2 * n); int k = 0;
    for (int i = 0; i < n; i++) { while (k >= 2 && cross(h[k - 2], h[k - 1], pts[i]) <= 0) k--; h[k++] = pts[i]; }
    for (int i = n - 2, t = k + 1; i >= 0; i--) { while (k >= t && cross(h[k - 2], h[k - 1], pts[i]) <= 0) k--; h[k++] = pts[i]; }
    h.resize(k - 1);
    return h;
}
int main() {
    auto h = convexHull({{0, 0}, {2, 0}, {1, 1}, {2, 2}, {0, 2}, {1, 3}});
    cout << h.size() << '\n';                                  // 5
    for (auto p : h) cout << '(' << p.x << ',' << p.y << ") ";  // (0,0) (2,0) (2,2) (1,3) (0,2)
    cout << '\n';
    return 0;
}
` },
  { id: 'closest-pair', title: 'Closest pair of points (sweep, O(n log n))', cat: 'Geometry', topic: 'geometry-2', tags: ['closest pair', 'sweep line', 'geometry'],
    desc: 'Sweep by x with an active set ordered by y; only points within the current best distance are compared.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

ll closestPair2(vector<pair<ll, ll>> pts) {                   // squared distance of the closest pair
    sort(pts.begin(), pts.end());
    set<pair<ll, ll>> active;                                  // (y, x)
    ll best = LLONG_MAX; int left = 0;
    for (int i = 0; i < (int)pts.size(); i++) {
        ll d = best == LLONG_MAX ? (ll)2e18 : (ll)ceil(sqrt((long double)best));
        while (left < i && pts[i].first - pts[left].first > d) { active.erase({pts[left].second, pts[left].first}); left++; }
        auto it = active.lower_bound({pts[i].second - d, LLONG_MIN});
        for (; it != active.end() && it->first - pts[i].second <= d; ++it) {
            ll dx = it->second - pts[i].first, dy = it->first - pts[i].second;
            best = min(best, dx * dx + dy * dy);
        }
        active.insert({pts[i].second, pts[i].first});
    }
    return best;
}
int main() {
    cout << closestPair2({{0, 0}, {5, 5}, {3, 4}, {10, 0}, {4, 3}}) << '\n';   // 2
    return 0;
}
` },
  { id: 'geometry-double', title: 'Floating-point geometry: line intersection, projection, circle–line', cat: 'Geometry', topic: 'geometry-2', tags: ['geometry', 'double', 'line intersection', 'circle', 'projection'],
    desc: 'For the problems that genuinely need real coordinates. Compare with EPS, never with ==.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
const double EPS = 1e-9;

struct V {
    double x, y;
    V operator+(V o) const { return {x + o.x, y + o.y}; }
    V operator-(V o) const { return {x - o.x, y - o.y}; }
    V operator*(double k) const { return {x * k, y * k}; }
    double dot(V o) const { return x * o.x + y * o.y; }
    double cross(V o) const { return x * o.y - y * o.x; }
    double len() const { return sqrt(x * x + y * y); }
};
bool lineIntersection(V a1, V a2, V b1, V b2, V& out) {       // false if parallel
    V d1 = a2 - a1, d2 = b2 - b1; double den = d1.cross(d2);
    if (fabs(den) < EPS) return false;
    out = a1 + d1 * ((b1 - a1).cross(d2) / den); return true;
}
V projectOnLine(V p, V a, V b) { V d = b - a; return a + d * ((p - a).dot(d) / d.dot(d)); }
double distPointSegment(V p, V a, V b) { V d = b - a; double t = max(0.0, min(1.0, (p - a).dot(d) / d.dot(d))); return (p - (a + d * t)).len(); }
vector<V> circleLine(V c, double r, V a, V b) {              // 0, 1 or 2 points
    V p = projectOnLine(c, a, b); double d = (p - c).len();
    if (d > r + EPS) return {};
    if (fabs(d - r) < EPS) return {p};
    double h = sqrt(max(0.0, r * r - d * d)); V u = (b - a) * (1.0 / (b - a).len());
    return {p + u * h, p - u * h};
}
int main() {
    V out; lineIntersection({0, 0}, {2, 2}, {0, 2}, {2, 0}, out);
    printf("%.3f %.3f\n", out.x, out.y);                      // 1.000 1.000
    printf("%.3f\n", distPointSegment({0, 5}, {-1, 0}, {1, 0}));   // 5.000
    auto v = circleLine({0, 0}, 5, {-10, 3}, {10, 3});
    printf("%zu %.3f %.3f\n", v.size(), v[0].x, v[0].y);       // 2 4.000 3.000
    return 0;
}
` },

  /* ---------------- MISC ---------------- */
  { id: 'grundy', title: 'Sprague–Grundy values', cat: 'Misc', topic: 'game-theory', tags: ['grundy', 'nim', 'mex', 'game'],
    desc: 'Grundy number = mex of reachable Grundy numbers; XOR across independent piles decides the winner.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

int grundy(int n, vector<int>& memo) {                        // moves: remove 1, 3 or 4 stones
    if (memo[n] != -1) return memo[n];
    set<int> s;
    for (int mv : {1, 3, 4}) if (n >= mv) s.insert(grundy(n - mv, memo));
    int g = 0; while (s.count(g)) g++;                         // mex
    return memo[n] = g;
}
int main() {
    vector<int> memo(51, -1);
    for (int i = 0; i <= 10; i++) cout << grundy(i, memo) << ' ';   // 0 1 0 1 2 3 2 0 1 0 1
    cout << '\n';
    int x = 0; for (int p : {3, 7, 9}) x ^= grundy(p, memo);
    cout << (x ? "First wins" : "Second wins") << '\n';       // First wins
    return 0;
}
` },
  { id: 'interactive-template', title: 'Interactive problem skeleton', cat: 'Misc', topic: 'interactive', tags: ['interactive', 'flush', 'endl', 'binary search'],
    desc: 'Guess a hidden number with comparison queries. `endl` flushes after every query — forgetting that is the classic Idleness Limit Exceeded.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    int n; cin >> n;                                           // hidden number in [1, n]
    int lo = 1, hi = n;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        cout << "? " << mid << endl;                           // endl = flush
        string verdict; cin >> verdict;                        // "<": hidden < mid, ">": hidden > mid, "=": found
        if (verdict == "=") { lo = hi = mid; break; }
        if (verdict == "<") hi = mid - 1; else lo = mid + 1;
    }
    cout << "! " << lo << endl;
    return 0;
}
` },
  { id: 'int128-io', title: '__int128 helpers', cat: 'Misc', topic: 'math-basics', tags: ['int128', 'overflow', 'big numbers', 'print'],
    desc: '128-bit integers for products up to ~10³⁸ (compare a·b vs c·d safely). No stream support, so print manually.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using i128 = __int128;

string to_string128(i128 v) {
    if (v == 0) return "0";
    bool neg = v < 0; if (neg) v = -v;
    string s; while (v > 0) { s += char('0' + (int)(v % 10)); v /= 10; }
    if (neg) s += '-';
    reverse(s.begin(), s.end()); return s;
}
i128 read128() { string s; cin >> s; i128 v = 0; bool neg = s[0] == '-'; for (char ch : s) if (isdigit(ch)) v = v * 10 + (ch - '0'); return neg ? -v : v; }
int main() {
    i128 a = (i128)1000000000000000000LL * 1000000000000000000LL;   // 1e36
    cout << to_string128(a) << '\n';
    long long p = 3000000000LL, q = 4000000000LL, r = 2000000000LL, s = 7000000000LL;
    cout << ((i128)p * q < (i128)r * s) << '\n';               // 1  (1.2e19 < 1.4e19, both overflow long long)
    return 0;
}
` },
  { id: 'fast-input', title: 'Fast input reader (fread)', cat: 'Misc', topic: 'cpp-basics', tags: ['fast io', 'fread', 'input'],
    desc: 'For inputs with ~10⁷ numbers where even fast cin is too slow. Reads signed integers.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

static char buf[1 << 16]; static size_t bufLen = 0, bufPos = 0;
inline int readChar() {
    if (bufPos == bufLen) { bufLen = fread(buf, 1, sizeof(buf), stdin); bufPos = 0; if (bufLen == 0) return -1; }
    return buf[bufPos++];
}
inline bool readInt(long long& out) {
    int c = readChar();
    while (c != -1 && c != '-' && (c < '0' || c > '9')) c = readChar();
    if (c == -1) return false;
    bool neg = c == '-'; if (neg) c = readChar();
    long long v = 0; while (c >= '0' && c <= '9') { v = v * 10 + (c - '0'); c = readChar(); }
    out = neg ? -v : v; return true;
}
int main() {
    long long n, x = 0, sum = 0;
    if (!readInt(n)) return 0;
    for (long long i = 0; i < n; i++) { readInt(x); sum += x; }
    printf("%lld\n", sum);
    return 0;
}
` }
);
