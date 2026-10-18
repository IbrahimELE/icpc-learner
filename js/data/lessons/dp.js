/* Lessons — dynamic programming: DP I, DP II, DP on trees, DP optimizations. */
window.LESSONS = window.LESSONS || {};

LESSONS['dp-1'] = { md: String.raw`
## What DP is
Dynamic programming solves a problem by solving smaller versions of the *same* problem once, storing the answers, and combining them. Three ingredients, always:
1. **State** — what exactly does dp[…] mean? Write the sentence down: "dp[i] = the minimum number of coins that sum to exactly i".
2. **Transition** — how does dp[state] follow from smaller states? Every transition is a *choice* you consider.
3. **Base cases and order** — where does it start (dp[0] = 0) and in which order can you fill the table so that everything you need is already known (or use recursion with memoization).

If you can write those three sentences, the code writes itself.

## First examples
~~~cpp
// Minimum coins for sum x, coins c[]           (CSES Minimizing Coins)
vector<long long> dp(x + 1, INF); dp[0] = 0;
for (int s = 1; s <= x; s++)
    for (int c : coins) if (c <= s) dp[s] = min(dp[s], dp[s - c] + 1);
~~~
~~~cpp
// Number of ordered ways to form sum x         (CSES Coin Combinations I)
dp[0] = 1;
for (int s = 1; s <= x; s++) for (int c : coins) if (c <= s) dp[s] = (dp[s] + dp[s - c]) % MOD;
// Unordered (each combination once):           (CSES Coin Combinations II) — swap the loops:
for (int c : coins) for (int s = c; s <= x; s++) dp[s] = (dp[s] + dp[s - c]) % MOD;
~~~
The loop order is not a detail: coins-outside means "decide how many of coin 1, then coin 2, …" — each multiset counted once.

## Memoization vs tabulation
Top-down (recursive function with a memo array) mirrors the recurrence exactly and only computes reachable states; bottom-up (loops) is faster and avoids stack limits. Start with whichever is clearer; convert when needed. A memoized function for n ≤ 10⁶ states is fine; deeper recursion than that risks stack overflow.

## The classic table
| Problem | State | Transition | Complexity |
|---|---|---|---|
| Grid paths (no obstacles) | dp[r][c] = ways to reach (r, c) | dp[r−1][c] + dp[r][c−1] | O(nm) |
| 0/1 knapsack | dp[w] = best value with capacity w | for each item, w from W down: max(dp[w], dp[w−wt] + val) | O(nW) |
| Unbounded knapsack | same | w from wt up to W | O(nW) |
| LIS (quadratic) | dp[i] = longest increasing subsequence ending at i | 1 + max dp[j] over j < i, a[j] < a[i] | O(n²) |
| LIS (fast) | tails[k] = smallest tail of length k+1 | lower_bound replace | O(n log n) |
| LCS | dp[i][j] = LCS of prefixes | equal → dp[i−1][j−1]+1, else max(dp[i−1][j], dp[i][j−1]) | O(nm) |
| Edit distance | dp[i][j] | min(delete, insert, replace/match) | O(nm) |
| Maximum subarray (Kadane) | best ending at i | max(a[i], best[i−1] + a[i]) | O(n) |
| Longest path in DAG | dp[v] | max over predecessors + 1 in topological order | O(n + m) |

Watch [[viz:knapsack]], [[viz:lcs]] and [[viz:lis]] fill their tables step by step.

## How to find the DP in a statement
- Is there a natural **order** (positions in an array, prefix of a string, increasing capacity, topological order)? The state is "the answer for the first i things (plus a little extra info)".
- What **extra information** about the prefix does the future need? That is the second dimension: remaining capacity, last chosen element, count used so far, a small mask. Keep it as small as possible.
- Transitions = all choices at step i. If a choice depends on more than the state, enlarge the state.
- Check the state count × transition cost against the constraints table ([[topic:complexity]]).

## Reconstructing the answer
Store for each state which transition produced it (''par[state]'') and walk back from the final state; or recompute the choice by checking which predecessor gives dp[state]. Printing the actual knapsack items, the LCS, the path — same idea.

## Space
Transitions using only the previous layer → keep two rows (or one, with the right loop direction as in knapsack). 10⁴ × 10⁴ ''int'' table = 400 MB: too much; two rows = trivial.

:::pitfall Typical DP bugs
Wrong base case (dp[0] should be 1 for counting, 0 for min); forgetting "impossible" states (INF) and then taking INF + 1 (overflow → use INF = 1e18/4 or check before adding); wrong loop direction in 1-D knapsack; off-by-one in prefix indices (use dp over i = number of items processed, not index); not taking the modulo; iterating states in an order where a needed state is not yet computed.
:::

:::seerc
Every SEERC has DP problems, typically 2–3, ranging from a straightforward knapsack variant to a hard one with an optimization. Do the AtCoder Educational DP Contest (A–Z) once completely — it is the best DP course that exists — then the CSES DP section.
:::
` };

LESSONS['dp-2'] = { md: String.raw`
## Bitmask DP
State includes a **subset** encoded as a bitmask. n ≤ 20.
~~~cpp
// Held–Karp TSP: dp[mask][v] = min cost to visit exactly the set mask, ending at v
dp[1][0] = 0;
for (mask = 1 .. 2^n - 1) for (u in mask) if (dp[mask][u] < INF)
    for (v not in mask) dp[mask | 1<<v][v] = min(dp[mask | 1<<v][v], dp[mask][u] + d[u][v]);
~~~
O(2ⁿ n²) — 8·10⁷ for n = 18. Watch [[viz:tsp-bitmask]]. Variants: assignment problems (dp[mask] = ways to assign the first popcount(mask) people to the set mask, [[problem:ac-dp_o]]), "visit all nodes" ([[problem:cses-1690]]), elevator rides ([[problem:cses-1653]]), partition into groups (iterate submasks, 3ⁿ, [[problem:ac-dp_u]]).

## Broken-profile DP (tilings)
For "count domino tilings of an n × m grid" with one dimension ≤ 10: sweep cell by cell, keep a mask of which cells in the next m positions are already covered. O(nm · 2ᵐ). [[problem:cses-2181]].

## Digit DP
Count numbers in [0, N] with a digit property. Process digits of N from the most significant; state = (position, tight, extra), where *tight* = "the prefix equals N’s prefix so far" (then the next digit is limited) and *extra* = whatever the property needs (digit sum mod k, last digit, "started" flag for leading zeros, whether a forbidden pattern appeared). Count [L, R] as f(R) − f(L − 1). Memoize: 19 positions × 2 × extra. Template ''digit-dp''. Problems: [[problem:cses-2220]], [[problem:ac-dp_s]].

## Interval DP
State = a contiguous interval [l, r]; transitions split at k or remove an endpoint. Evaluate by increasing length. O(n³) typically (n ≤ 500), O(n²) when transitions only touch the ends.
- Removal game / optimal play taking from either end: dp[l][r] = max(a[l] − dp[l+1][r], a[r] − dp[l][r−1]) ([[problem:cses-1097]]).
- Merge stones / matrix chain: dp[l][r] = min_k dp[l][k] + dp[k+1][r] + cost(l, r) ([[problem:ac-dp_n]]).
- Palindromic partitions, bracket matching, polygon triangulation — all interval DP.

## Counting DP and "DP over positions with a summary"
- dp[i][j] = number of sequences of length i whose last element is the j-th smallest ([[problem:ac-dp_t]]) — transitions are prefix sums of the previous row.
- Counting strings avoiding a pattern: state = KMP automaton state ([[problem:cses-1112]]).
- Counting paths in a grid with obstacles sorted by position: inclusion–exclusion over the first obstacle hit ([[problem:ac-dp_y]]).

## DP over subsets: SOS
f[mask] = Σ_{sub ⊆ mask} a[sub] for all masks in O(2ⁿ n):
~~~cpp
for (int b = 0; b < n; b++) for (int mask = 0; mask < (1 << n); mask++)
    if (mask >> b & 1) f[mask] += f[mask ^ (1 << b)];
~~~
Use it for "for each mask, how many given numbers are submasks of it", AND-convolution, counting pairs with a & b = 0.

## Speeding up transitions
When the naive transition is O(n) per state, the fix is usually one of:
- **Prefix sums / prefix min** over the previous row (transition over a range of j).
- **Monotonic queue** when the range of j slides (window minimum) — see [[topic:two-pointers]].
- **Data structure** (Fenwick/segment tree) when the transition is "max over j with a[j] < a[i]" ([[problem:ac-dp_q]]).
- **Divide & conquer / convex hull trick / Knuth** — see [[topic:dp-optimizations]].

## DP on a string with automaton state
When the condition involves *not containing a substring*, *matching a regex-like pattern*, or *number of occurrences*, add the automaton state (KMP prefix function, Aho–Corasick node) to the DP state. Transitions follow the automaton.

:::recognize
n ≤ 20 → bitmask. Ranges [L, R] up to 10¹⁸ with digit conditions → digit DP. Costs on contiguous segments, brackets, merging → interval DP. "Number of … modulo p" with a natural order → counting DP; check whether the transition is a range sum (prefix sums) or a "best previous smaller" (BIT).
:::

:::seerc
The medium-hard DP at SEERC is typically one of these: bitmask with a twist, interval DP with a clever state, or a counting DP whose transition needs prefix sums. Reading the constraints (n ≤ 18 vs n ≤ 500 vs n ≤ 2·10⁵) usually tells you which.
:::
` };

LESSONS['dp-trees'] = { md: String.raw`
## Subtree DP
Root the tree. dp[v] describes the subtree of v and is computed from the children. Process children before parents: recursion, or iterate a DFS order backwards (no stack-overflow risk).
~~~cpp
// maximum independent set: dp[v][0] = v not taken, dp[v][1] = v taken
for (int i = n - 1; i >= 0; i--) {          // order[] has parents before children
    int v = order[i];
    dp[v][1] = value[v]; dp[v][0] = 0;
    for (int c : children[v]) { dp[v][0] += max(dp[c][0], dp[c][1]); dp[v][1] += dp[c][0]; }
}
~~~
Classic states: subtree size, sum of depths, number of leaves, longest downward path (→ diameter = max over v of the two longest child paths + 2), matched/unmatched ([[problem:cses-1130]]), colour of v ([[problem:ac-dp_p]]), "number of nodes chosen so far" (knapsack, below).

## Rerooting (answers for every root)
Compute down[v] (subtree information) in one pass; then in a second pass from the root compute up[v] = information about everything *outside* v’s subtree using up[parent] and the siblings of v. The answer at v combines down[v] and up[v].
~~~cpp
// sum of distances from every node                (CSES Tree Distances II)
// pass 1: sz[v], down[v] = sum of depths within subtree
// pass 2: ans[child] = ans[parent] - sz[child] + (n - sz[child])
~~~
For "max over children" quantities (e.g. the farthest node from every vertex) keep the **two best** children values so that excluding the child itself is O(1). For products modulo p, use prefix/suffix products of the children ([[problem:ac-dp_v]]) since division is unavailable.

## Tree knapsack and the O(n²) merging argument
dp[v][k] = best value choosing k nodes in v’s subtree (connected subtree containing v, or any subset with constraints). Merge children one by one:
~~~cpp
for each child c:  for i in 0..size[v]  for j in 0..size[c]:  new[i + j] = max(new[i + j], dp[v][i] + dp[c][j])
~~~
Bounding both loops by the *current* sizes makes the total O(n²), not O(n³): every pair of nodes is combined exactly once, at their LCA. Do not "optimize" by iterating to n.

## Paths in trees via DP
- Number of paths of length exactly k (k small): dp[v][d] = nodes at depth d in v’s subtree; combine children pairwise, capped at k. For large k → centroid decomposition ([[topic:hld-centroid]]).
- Maximum path sum: best downward path per node; the answer considers two children at each node.
- Counting paths with a property often decomposes as "paths whose top node is v".

## Small-to-large merging (DSU on tree)
When dp[v] is a *set* or *map* (distinct colours, frequency of values): merge children’s sets into the largest one. Each element moves O(log n) times → O(n log n) set operations. [[problem:cses-1139]].

## Implementation pattern (no recursion)
~~~cpp
vector<int> order, par(n, -1);          // iterative DFS from the root
vector<int> st = {0}; vector<bool> vis(n); vis[0] = true;
while (!st.empty()) { int u = st.back(); st.pop_back(); order.push_back(u);
    for (int v : adj[u]) if (!vis[v]) { vis[v] = true; par[v] = u; st.push_back(v); } }
for (int i = n - 1; i > 0; i--) { int v = order[i]; /* fold dp[v] into dp[par[v]] */ }
~~~
The [[viz:tree-dfs]] visualizer shows the order in which subtree values become available.

:::pitfall
Rerooting formulas that subtract the child’s contribution incorrectly (double-check on a path of 3 nodes); forgetting that the root has no parent in the up pass; recursion depth on a path-shaped tree of 2·10⁵ nodes; merging children in the wrong direction (small into large, not large into small).
:::

:::seerc
Tree DP is one of the most frequent "medium" SEERC problems. Rerooting in particular is worth drilling until you can write it from memory in 10 minutes.
:::
` };

LESSONS['dp-optimizations'] = { md: String.raw`
## When you need this
A correct DP has O(n²) transitions but n = 2·10⁵. The transition usually has the form dp[i] = min over j < i of (dp[j] + cost(j, i)). Different structures of cost(j, i) give different speed-ups.

## 1. Prefix aggregates and monotonic queue
- cost(j, i) = f(i) + g(j): dp[i] = f(i) + min_j g(j) → running prefix minimum, O(n).
- j restricted to a sliding window [i − k, i − 1]: monotonic deque of candidates ([[topic:two-pointers]]), O(n).

## 2. Convex hull trick (CHT)
cost(j, i) = a[j]·b[i] + c[j]: each j is a line y = a[j]·x + c[j] evaluated at x = b[i]. Maintain the lower envelope of lines.
- Slopes a[j] monotone **and** queries b[i] monotone → deque, amortized O(1) per operation (template ''cht-monotone'').
- Slopes monotone, queries arbitrary → binary search on the hull, O(log n).
- Nothing monotone → **Li Chao tree** over the query domain, O(log C) per insert/query (template ''li-chao''); or a dynamic hull (rarely needed).
Recognise it by expanding squares: dp[i] = min_j dp[j] + (x_i − x_j)² = x_i² + min_j (dp[j] + x_j² − 2x_j·x_i) — a line in x_i with slope −2x_j ([[problem:ac-dp_z]], [[problem:cses-2084]], [[problem:cses-2085]]). See [[viz:convex-hull-trick]].

## 3. Divide & conquer optimization
dp[k][i] = min_{j<i} dp[k−1][j] + cost(j, i), where the optimal j (call it opt(i)) is **monotone non-decreasing in i**. Then compute the middle i, find its opt by scanning, and recurse on the left half with j ≤ opt and the right half with j ≥ opt: O(n log n) per layer instead of O(n²). Monotonicity holds when cost satisfies the quadrangle inequality (cost(a,c) + cost(b,d) ≤ cost(a,d) + cost(b,c) for a ≤ b ≤ c ≤ d) — e.g. cost = (sum of segment)², sums of pairwise distances. Template ''divide-conquer-dp''. [[problem:cses-2086]], [[problem:cses-2087]].

## 4. Knuth optimization
Interval DP dp[l][r] = min_{l≤k<r} dp[l][k] + dp[k+1][r] + w(l, r) with w satisfying the quadrangle inequality and monotonicity: the optimal k satisfies opt[l][r−1] ≤ opt[l][r] ≤ opt[l+1][r]. Iterating k only in that range gives O(n²) total. [[problem:cses-2088]].

## 5. Aliens trick (WQS binary search / Lagrangian relaxation)
"Choose exactly k segments/items" where the optimal value is **convex in k**. Drop the k-dimension: add a penalty λ per item, solve the unconstrained DP (usually O(n)), and binary search λ until exactly k items are chosen. O(n log C). Verify convexity (or trust the problem when k is in the constraints and the naive dp[k][i] is too big).

## 6. SMAWK / monotone matrices, slope trick
Rare at regionals: SMAWK finds row minima of totally monotone matrices in O(n); slope trick maintains a convex piecewise-linear function with a heap of breakpoints for problems like "make the array non-decreasing with minimum total change".

## Recognition table
| Transition shape | Technique |
|---|---|
| dp[i] = f(i) + min g(j) | prefix min |
| j in a sliding window | monotonic deque |
| dp[j] + a[j]·b[i] | CHT / Li Chao |
| dp[j] + cost(j,i), opt monotone, layered by k | divide & conquer |
| interval split with quadrangle inequality | Knuth |
| exactly k items, convex in k | Aliens trick |

:::pitfall
Applying CHT with the wrong monotonicity assumption (use Li Chao if unsure); overflow in line evaluations (m·x up to 10¹⁸ — use __int128 in the comparison); D&C recursion with wrong bounds giving opt = −1; assuming convexity for the Aliens trick without reason.
:::

:::seerc
These optimizations solve the hard DP problem in a SEERC set. Even if you never fully master them, being able to *recognise* "this is CHT" and having the template printed can turn a hopeless problem into a 40-minute implementation.
:::
` };
