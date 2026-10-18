/* Flashcards for spaced repetition. front/back accept the app's markdown. */
const FLASHCARDS = [
  // ---- cpp-basics ----
  { id: 'fc-cpp-1', topic: 'cpp-basics', front: 'Largest value a signed 32-bit `int` can hold (roughly)?', back: '`2 147 483 647` ≈ **2.1·10⁹**. Anything that can reach 10¹⁰ (sums, products, n·m) needs `long long`.' },
  { id: 'fc-cpp-2', topic: 'cpp-basics', front: 'Largest value of `long long`?', back: '≈ **9.2·10¹⁸** (2⁶³−1). Product of two numbers up to 10⁹ fits; product of two up to 10¹⁰ does not.' },
  { id: 'fc-cpp-3', topic: 'cpp-basics', front: 'The two lines that make `cin`/`cout` fast enough for 10⁶ numbers?', back: '```cpp\ncin.tie(nullptr)->sync_with_stdio(false);\n```\nand never mix with `scanf`/`printf` afterwards. Use `"\\n"` instead of `endl` (endl flushes).' },
  { id: 'fc-cpp-4', topic: 'cpp-basics', front: 'Why is `1 << 40` a bug and what is the fix?', back: '`1` is an `int`, so the shift overflows (undefined behaviour). Write `1LL << 40`.' },
  { id: 'fc-cpp-5', topic: 'cpp-basics', front: 'What does `a % b` return in C++ when `a` is negative?', back: 'A **negative** (or zero) result, e.g. `-7 % 3 == -1`. For a non-negative residue use `((a % b) + b) % b`.' },
  { id: 'fc-cpp-6', topic: 'cpp-basics', front: 'Compiler flags that catch most beginner bugs locally?', back: '`-Wall -Wextra -Wshadow -fsanitize=address,undefined -g` (sanitizers catch out-of-bounds and overflow at runtime; use them when debugging, not for timing).' },
  { id: 'fc-cpp-7', topic: 'cpp-basics', front: 'Reading input until end of file in C++?', back: '```cpp\nwhile (cin >> x) { ... }\n```\n`cin >> x` evaluates to false on EOF/failure.' },
  // ---- complexity ----
  { id: 'fc-cx-1', topic: 'complexity', front: 'Rule of thumb: how many simple operations per second on a judge?', back: 'About **10⁸** (10⁷–10⁹ depending on constants: plain array loops fast, `map`/`set` slow).' },
  { id: 'fc-cx-2', topic: 'complexity', front: 'n ≤ 20 in the constraints suggests which complexity?', back: '**2ⁿ** (or 2ⁿ·n): iterate over all subsets / bitmask DP. 2²⁰ ≈ 10⁶.' },
  { id: 'fc-cx-3', topic: 'complexity', front: 'n ≤ 5000 suggests which complexity?', back: '**O(n²)** ≈ 2.5·10⁷. Nested loops over pairs are intended.' },
  { id: 'fc-cx-4', topic: 'complexity', front: 'n ≤ 2·10⁵ suggests which complexity?', back: '**O(n log n)** (sorting, binary search, segment tree, Dijkstra) or O(n√n) at most.' },
  { id: 'fc-cx-5', topic: 'complexity', front: 'n ≤ 10¹⁸ suggests what kind of solution?', back: '**O(log n)** or O(1): fast exponentiation, matrix power, digit DP, closed-form math. Never iterate to n.' },
  { id: 'fc-cx-6', topic: 'complexity', front: 'Complexity of `std::sort` on n elements? Of `lower_bound` on a sorted vector? Of `set::insert`?', back: 'O(n log n) · O(log n) · O(log n).' },
  { id: 'fc-cx-7', topic: 'complexity', front: 'n ≤ 500 suggests which complexity?', back: '**O(n³)** ≈ 1.25·10⁸: Floyd–Warshall, interval DP, cubic flows.' },
  // ---- problem-solving ----
  { id: 'fc-ps-1', topic: 'problem-solving', front: 'First three things to do after reading a statement (before coding)?', back: '1. Restate the problem in one sentence + note constraints. 2. Solve the samples by hand and invent a tiny case. 3. Write the brute force in your head — its complexity tells you what must be optimized.' },
  { id: 'fc-ps-2', topic: 'problem-solving', front: 'You have been stuck on one problem for 40 minutes in a contest. What do you do?', back: 'Switch problems. Write down your current idea first. Come back later with fresh eyes — sunk cost is the biggest time sink in ICPC.' },
  { id: 'fc-ps-3', topic: 'problem-solving', front: 'What is the "small cases" technique?', back: 'Compute answers for n = 1..6 by hand or brute force, look for a pattern (parity, formula, periodicity), then prove or at least test the pattern on more cases.' },
  // ---- stl ----
  { id: 'fc-stl-1', topic: 'stl', front: 'Difference between `lower_bound(x)` and `upper_bound(x)`?', back: '`lower_bound`: first element **≥ x**. `upper_bound`: first element **> x**. Count of x = upper − lower.' },
  { id: 'fc-stl-2', topic: 'stl', front: 'Why can `unordered_map` get you hacked/TLE and what is the fix?', back: 'Adversarial keys collide into one bucket → O(n) per operation. Fix: custom hash (`splitmix64`) or use `map`/sorting. Also call `reserve()`.' },
  { id: 'fc-stl-3', topic: 'stl', front: 'How do you make `priority_queue` a min-heap?', back: '```cpp\npriority_queue<T, vector<T>, greater<T>> pq;\n```\nor push negated values / pairs with negated key.' },
  { id: 'fc-stl-4', topic: 'stl', front: 'Remove duplicates from a vector `v`?', back: '```cpp\nsort(v.begin(), v.end());\nv.erase(unique(v.begin(), v.end()), v.end());\n```' },
  { id: 'fc-stl-5', topic: 'stl', front: 'What must a comparator for `sort` satisfy? Common bug?', back: 'Strict weak ordering: `cmp(a,a)` must be **false**. Using `<=` breaks it and can crash. Return `a.x < b.x`, never `<=`.' },
  { id: 'fc-stl-6', topic: 'stl', front: '`v.size() - 1` when `v` is empty gives…?', back: 'A huge unsigned number (wraps around), so `i < v.size() - 1` is always true. Cast: `(int)v.size() - 1` or use `ssize`.' },
  { id: 'fc-stl-7', topic: 'stl', front: 'Erasing from a `set` while iterating — safe pattern?', back: '```cpp\nfor (auto it = s.begin(); it != s.end(); ) {\n    if (bad(*it)) it = s.erase(it); else ++it;\n}\n```' },
  // ---- implementation ----
  { id: 'fc-impl-1', topic: 'implementation', front: 'What is stress testing?', back: 'Run a random generator, a slow brute force and your solution in a loop; compare outputs; stop at the first mismatch. Finds bugs no sample reveals.' },
  { id: 'fc-impl-2', topic: 'implementation', front: 'Five edge cases to test before submitting?', back: 'n = 1; all elements equal; maximum values (overflow); minimum values / zeros / negatives; answer is 0 or "impossible".' },
  { id: 'fc-impl-3', topic: 'implementation', front: 'Your solution gets WA on test 2 with no other info. Steps?', back: '1. Re-read the statement (output format, 1-indexing, multiple answers?). 2. Check overflow & array bounds. 3. Stress test against a brute force with tiny inputs.' },
  // ---- math-basics ----
  { id: 'fc-mb-1', topic: 'math-basics', front: 'Ceiling division of positive integers a / b without floating point?', back: '`(a + b - 1) / b` (or `(a - 1) / b + 1`). For possibly-negative a use `a / b + (a % b != 0 && ((a < 0) == (b < 0)))`.' },
  { id: 'fc-mb-2', topic: 'math-basics', front: 'gcd(a, b) · lcm(a, b) = ? How to compute lcm safely?', back: '`= a · b`. Compute `a / gcd(a,b) * b` to avoid overflow before dividing.' },
  { id: 'fc-mb-3', topic: 'math-basics', front: 'Comparing two doubles for equality — how?', back: 'Never `==`. Use `fabs(a - b) < EPS` (EPS ≈ 1e-9) or, better, avoid doubles entirely with integer/fraction arithmetic (cross-multiply).' },
  { id: 'fc-mb-4', topic: 'math-basics', front: 'Sum 1 + 2 + … + n, and sum of squares?', back: '`n(n+1)/2` and `n(n+1)(2n+1)/6`. Compute with long long; divide last.' },
  { id: 'fc-mb-5', topic: 'math-basics', front: 'Complexity of Euclid’s gcd?', back: 'O(log min(a, b)) — each two steps at least halve the smaller number.' },
  // ---- sorting-searching ----
  { id: 'fc-ss-1', topic: 'sorting-searching', front: 'What is coordinate compression and when do you use it?', back: 'Map values to ranks 0..k−1 (sort + unique + lower_bound). Use when values are up to 10⁹ but only n ≤ 10⁵ of them exist and only their order matters (BIT/segment tree indices).' },
  { id: 'fc-ss-2', topic: 'sorting-searching', front: 'How do you process "events" in a sweep line?', back: 'Create (position, type) pairs, sort them; when positions tie, order types deliberately (e.g. process "end" before "start" for closed/open intervals) — this tie rule is where bugs hide.' },
  { id: 'fc-ss-3', topic: 'sorting-searching', front: 'When is counting sort applicable and its complexity?', back: 'Values in a small range [0, K]. O(n + K). Great for values ≤ 10⁶.' },
  // ---- binary-search ----
  { id: 'fc-bs-1', topic: 'binary-search', front: 'Binary search on the answer requires which property?', back: 'A **monotone predicate**: if `ok(x)` is true then `ok(x+1)` (or x−1) is true too. Find the boundary in O(log range · cost of ok).' },
  { id: 'fc-bs-2', topic: 'binary-search', front: 'Bug-free integer binary search template for "smallest x with ok(x)"?', back: '```cpp\nlong long lo = L, hi = R; // ok(R) known true\nwhile (lo < hi) {\n    long long mid = lo + (hi - lo) / 2;\n    if (ok(mid)) hi = mid; else lo = mid + 1;\n}\n// lo is the answer\n```' },
  { id: 'fc-bs-3', topic: 'binary-search', front: 'Binary search on doubles: how many iterations?', back: 'Fixed count, e.g. 100 iterations (or 60 for ~1e-18 relative). Never loop on `hi - lo > eps` — it can spin forever.' },
  { id: 'fc-bs-4', topic: 'binary-search', front: 'Ternary search finds…?', back: 'The extremum of a **unimodal** function (strictly increasing then decreasing). For integers, binary search on `f(m) < f(m+1)` is simpler.' },
  // ---- prefix-sums ----
  { id: 'fc-pf-1', topic: 'prefix-sums', front: 'Sum of a[l..r] using prefix array p (p[0]=0, p[i]=a[0]+…+a[i-1])?', back: '`p[r+1] - p[l]`. Build in O(n), query in O(1). Works for any invertible operation (sum, XOR), not for min/max.' },
  { id: 'fc-pf-2', topic: 'prefix-sums', front: 'Difference array: add v to every a[i], l ≤ i ≤ r, offline?', back: '`d[l] += v; d[r+1] -= v;` then prefix-sum d at the end. O(1) per update, O(n) finish.' },
  { id: 'fc-pf-3', topic: 'prefix-sums', front: '2D prefix sum rectangle query formula?', back: '`S(r2,c2) - S(r1-1,c2) - S(r2,c1-1) + S(r1-1,c1-1)` — inclusion–exclusion.' },
  { id: 'fc-pf-4', topic: 'prefix-sums', front: 'Count subarrays with sum exactly k in O(n)?', back: 'Iterate prefix sums, keep a hash map of counts of previous prefix values; add `cnt[p - k]` at each step, then `cnt[p]++`.' },
  // ---- two-pointers ----
  { id: 'fc-tp-1', topic: 'two-pointers', front: 'Why is the two-pointer / sliding-window technique O(n)?', back: 'Each pointer only moves forward, so both together move at most 2n times — amortized O(1) per step.' },
  { id: 'fc-tp-2', topic: 'two-pointers', front: 'Sliding window minimum in O(n) uses which structure?', back: 'A **monotonic deque** holding indices with increasing values; pop from back while the new value is smaller, pop from front when out of the window.' },
  { id: 'fc-tp-3', topic: 'two-pointers', front: 'Sliding window works when the property is…?', back: 'Monotone in the window: extending a window never makes it "more valid" (e.g. sum ≤ k, ≤ k distinct). Shrink from the left while invalid.' },
  // ---- greedy ----
  { id: 'fc-gr-1', topic: 'greedy', front: 'Interval scheduling (max non-overlapping intervals): the greedy rule?', back: 'Sort by **end time**, always take the interval that ends earliest and does not overlap the last taken one.' },
  { id: 'fc-gr-2', topic: 'greedy', front: 'What is an exchange argument?', back: 'A proof: take any optimal solution, swap one choice for the greedy choice, show it does not get worse. Repeating turns optimal into greedy → greedy is optimal.' },
  { id: 'fc-gr-3', topic: 'greedy', front: 'Minimum number of rooms for n lectures (interval partitioning)?', back: 'Sort by start; keep a min-heap of end times; reuse a room if its end ≤ new start. Answer = max heap size = max overlap.' },
  { id: 'fc-gr-4', topic: 'greedy', front: 'Red flag that greedy is WRONG?', back: 'A small counterexample exists — always try to break your greedy on 3–4 element inputs before coding. If you cannot prove it or break it, prefer DP when n is small enough.' },
  // ---- recursion-backtracking ----
  { id: 'fc-rb-1', topic: 'recursion-backtracking', front: 'Generate all permutations of a vector in STL?', back: '```cpp\nsort(v.begin(), v.end());\ndo { ... } while (next_permutation(v.begin(), v.end()));\n```' },
  { id: 'fc-rb-2', topic: 'recursion-backtracking', front: 'Iterate over all subsets of n items with bitmasks?', back: '```cpp\nfor (int mask = 0; mask < (1 << n); mask++)\n    for (int i = 0; i < n; i++)\n        if (mask >> i & 1) { /* i in subset */ }\n```' },
  { id: 'fc-rb-3', topic: 'recursion-backtracking', front: 'Number of subsets of 20 items? Permutations of 10? Of 12?', back: '2²⁰ ≈ 10⁶ · 10! ≈ 3.6·10⁶ · 12! ≈ 4.8·10⁸ (borderline).' },
  // ---- bit-manipulation ----
  { id: 'fc-bit-1', topic: 'bit-manipulation', front: 'Lowest set bit of x? Remove it?', back: '`x & -x` isolates it; `x & (x - 1)` removes it. Power of two test: `x && !(x & (x-1))`.' },
  { id: 'fc-bit-2', topic: 'bit-manipulation', front: 'Iterate over all submasks of `mask`?', back: '```cpp\nfor (int s = mask; ; s = (s - 1) & mask) {\n    ...\n    if (s == 0) break;\n}\n```\nTotal over all masks: 3ⁿ.' },
  { id: 'fc-bit-3', topic: 'bit-manipulation', front: 'Count set bits of an int / long long?', back: '`__builtin_popcount(x)` / `__builtin_popcountll(x)`. Also `__builtin_ctz` (trailing zeros), `__builtin_clz` (leading zeros), or C++20 `std::popcount`.' },
  { id: 'fc-bit-4', topic: 'bit-manipulation', front: 'Key XOR facts used in problems?', back: '`a ^ a = 0`, `a ^ 0 = a`, commutative/associative, prefix XOR gives range XOR, XOR of 1..n has period 4, x ^ y is the "distance" in a XOR trie.' },
  // ---- number-theory-1 ----
  { id: 'fc-nt-1', topic: 'number-theory-1', front: 'Sieve of Eratosthenes complexity and memory for n = 10⁷?', back: 'O(n log log n); a `vector<bool>`/`bitset` of 10⁷ is ~1.25 MB, `vector<char>` 10 MB.' },
  { id: 'fc-nt-2', topic: 'number-theory-1', front: 'Modular inverse of a mod prime p?', back: '`a^(p-2) mod p` by Fermat’s little theorem (needs gcd(a,p)=1). O(log p). For non-prime modulus use extended Euclid.' },
  { id: 'fc-nt-3', topic: 'number-theory-1', front: 'Trial-division factorization complexity?', back: 'O(√n) per number; for n ≤ 10¹² that is 10⁶ steps — fine for one number, too slow for 10⁵ numbers (use SPF sieve if values ≤ 10⁷).' },
  { id: 'fc-nt-4', topic: 'number-theory-1', front: 'Binary exponentiation idea in one line?', back: 'Square the base and halve the exponent: `if (e&1) r=r*b; b=b*b; e>>=1;` — O(log e) multiplications.' },
  { id: 'fc-nt-5', topic: 'number-theory-1', front: 'Why reduce mod after every multiplication?', back: '(10⁹+7)² ≈ 10¹⁸ still fits in long long, but a third factor overflows. Reduce after each `*`, and add `+MOD` before `%` when subtracting.' },
  { id: 'fc-nt-6', topic: 'number-theory-1', front: 'Number of divisors of n from its factorization n = ∏ pᵢ^eᵢ?', back: '∏ (eᵢ + 1). Sum of divisors: ∏ (pᵢ^(eᵢ+1) − 1)/(pᵢ − 1).' },
  // ---- combinatorics ----
  { id: 'fc-cb-1', topic: 'combinatorics', front: 'nCr mod p for n up to 10⁶, many queries?', back: 'Precompute `fact[]` and `inv_fact[]` (inverse of fact[n] once, then walk down). `C = fact[n]*inv_fact[r]%p*inv_fact[n-r]%p`. O(1) per query.' },
  { id: 'fc-cb-2', topic: 'combinatorics', front: 'Stars and bars: number of ways to write n as a sum of k non-negative integers?', back: '`C(n + k − 1, k − 1)`. For positive integers: `C(n − 1, k − 1)`.' },
  { id: 'fc-cb-3', topic: 'combinatorics', front: 'Catalan numbers count…? Formula?', back: 'Balanced bracket sequences, binary trees with n nodes, monotone lattice paths not crossing the diagonal. `Cₙ = C(2n, n)/(n+1)`.' },
  { id: 'fc-cb-4', topic: 'combinatorics', front: 'Inclusion–exclusion for |A ∪ B ∪ C|?', back: '|A|+|B|+|C| − |A∩B| − |A∩C| − |B∩C| + |A∩B∩C|. Generally: sum over non-empty subsets with sign (−1)^(|S|+1).' },
  { id: 'fc-cb-5', topic: 'combinatorics', front: 'Number of lattice paths from (0,0) to (a,b) with unit steps right/up?', back: '`C(a + b, a)`.' },
  // ---- dp-1 ----
  { id: 'fc-dp-1', topic: 'dp-1', front: 'The three things that define a DP?', back: '**State** (what the subproblem is), **transition** (how it comes from smaller states), **base case** + evaluation order (or memoization).' },
  { id: 'fc-dp-2', topic: 'dp-1', front: '0/1 knapsack in O(nW) with O(W) memory — loop direction?', back: 'For each item, iterate capacity **downwards** (`for w = W..wt`) so each item is used at most once. Upwards = unbounded knapsack.' },
  { id: 'fc-dp-3', topic: 'dp-1', front: 'LIS in O(n log n) — idea?', back: 'Keep `tails[k]` = smallest tail of an increasing subsequence of length k+1; for each x replace `lower_bound(tails, x)` (strict) or `upper_bound` (non-strict). Length = tails.size().' },
  { id: 'fc-dp-4', topic: 'dp-1', front: 'Edit distance recurrence?', back: '`dp[i][j] = min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1] + (a[i]!=b[j]))`. O(nm).' },
  { id: 'fc-dp-5', topic: 'dp-1', front: 'Coin change: number of ways vs. ordered ways?', back: 'Ordered (sequences): `dp[x] += dp[x - c]` for all c, one loop over x. Unordered (combinations): loop coins outside, x inside.' },
  { id: 'fc-dp-6', topic: 'dp-1', front: 'How do you reconstruct the actual solution from a DP?', back: 'Store the choice (parent) for each state, or re-derive by checking which transition produced dp[state], then walk back from the final state.' },
  // ---- graphs-1 ----
  { id: 'fc-g1-1', topic: 'graphs-1', front: 'BFS vs DFS: which gives shortest paths and when?', back: 'BFS gives shortest paths in **unweighted** graphs (or all edges equal weight). DFS does not.' },
  { id: 'fc-g1-2', topic: 'graphs-1', front: 'Bipartite check idea?', back: 'BFS/DFS 2-colouring: colour neighbours the opposite colour; an edge between same colours → not bipartite (odd cycle exists).' },
  { id: 'fc-g1-3', topic: 'graphs-1', front: 'Four-direction moves on a grid, compactly?', back: '```cpp\nint dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};\n```\nCheck bounds before accessing.' },
  { id: 'fc-g1-4', topic: 'graphs-1', front: 'Recursive DFS on 10⁶ nodes may crash — why and fix?', back: 'Stack overflow (deep recursion). Use an explicit stack (iterative DFS), BFS, or increase stack size (compiler flag / judge dependent).' },
  { id: 'fc-g1-5', topic: 'graphs-1', front: 'Detect a cycle in a directed graph with DFS?', back: 'Colour nodes white/grey/black; an edge to a **grey** node (on the current stack) is a back edge → cycle. In undirected graphs: edge to a visited node that is not the parent.' },
  // ---- shortest-paths ----
  { id: 'fc-sp-1', topic: 'shortest-paths', front: 'Dijkstra complexity with a binary heap and its one requirement?', back: 'O((n + m) log m); **no negative edge weights**.' },
  { id: 'fc-sp-2', topic: 'shortest-paths', front: 'Lazy-deletion Dijkstra: the key `if` after popping?', back: '```cpp\nauto [d, u] = pq.top(); pq.pop();\nif (d > dist[u]) continue; // stale entry\n```' },
  { id: 'fc-sp-3', topic: 'shortest-paths', front: 'When do you use Bellman–Ford / Floyd–Warshall?', back: 'Bellman–Ford: negative edges, detect negative cycles, O(nm). Floyd–Warshall: all pairs, n ≤ 400–500, O(n³), handles negative edges.' },
  { id: 'fc-sp-4', topic: 'shortest-paths', front: '0-1 BFS is for…?', back: 'Edge weights only 0 and 1: deque, push_front for weight 0, push_back for weight 1. O(n + m).' },
  { id: 'fc-sp-5', topic: 'shortest-paths', front: '"Shortest path using at most k discount coupons" — how to model?', back: 'Expand the state: node × coupons used (or × parity, × last move…). Run Dijkstra on the state graph.' },
  // ---- dsu ----
  { id: 'fc-dsu-1', topic: 'dsu', front: 'DSU complexity with path compression + union by size?', back: 'Amortized O(α(n)) per operation — effectively constant.' },
  { id: 'fc-dsu-2', topic: 'dsu', front: 'Kruskal’s algorithm in two lines?', back: 'Sort edges by weight; for each edge, if endpoints are in different DSU sets, take it and union. O(m log m).' },
  { id: 'fc-dsu-3', topic: 'dsu', front: 'Queries "are u and v connected after removing edges in order" — trick?', back: 'Process **offline in reverse**: deletions become insertions, which DSU handles.' },
  // ---- topo-sort ----
  { id: 'fc-ts-1', topic: 'topo-sort', front: 'Kahn’s algorithm sketch?', back: 'Compute in-degrees; queue all zero in-degree nodes; pop, append to order, decrement neighbours, push when zero. If order has < n nodes → cycle.' },
  { id: 'fc-ts-2', topic: 'topo-sort', front: 'Longest path in a DAG?', back: 'Process nodes in topological order: `dp[v] = max(dp[u] + w)` over incoming edges. O(n + m). (NP-hard in general graphs.)' },
  // ---- trees-1 ----
  { id: 'fc-tr-1', topic: 'trees-1', front: 'Tree diameter with two BFS?', back: 'BFS from any node → farthest node a; BFS from a → farthest node b; dist(a, b) is the diameter.' },
  { id: 'fc-tr-2', topic: 'trees-1', front: 'Subtree of v as a contiguous range?', back: 'Euler tour / DFS order: `tin[v]`, `tout[v]`; subtree of v = positions `[tin[v], tout[v]]`. Enables segment-tree subtree queries.' },
  { id: 'fc-tr-3', topic: 'trees-1', front: 'A tree with n nodes has how many edges? Any two nodes have how many simple paths?', back: 'n − 1 edges; exactly one simple path.' },
  { id: 'fc-tr-4', topic: 'trees-1', front: 'Rerooting technique: when?', back: 'When you need a DP answer for **every** node as root. Compute down-DP, then push answers from parent to child in a second DFS, O(n).' },
  // ---- strings-1 ----
  { id: 'fc-st-1', topic: 'strings-1', front: 'Prefix function π[i] definition?', back: 'Length of the longest proper prefix of s[0..i] that is also a suffix of s[0..i]. Computed in O(n); KMP matching uses it.' },
  { id: 'fc-st-2', topic: 'strings-1', front: 'Z-function z[i] definition?', back: 'Length of the longest common prefix of s and s[i..]. O(n). Pattern matching: compute Z of `p + "#" + t`.' },
  { id: 'fc-st-3', topic: 'strings-1', front: 'Smallest period of a string from its prefix function?', back: '`n − π[n−1]`. If it divides n, the string is that period repeated.' },
  { id: 'fc-st-4', topic: 'strings-1', front: 'Why use double hashing (two moduli)?', back: 'A single 64-bit or 1e9+7 hash can be attacked (birthday paradox + anti-hash tests). Two independent moduli or a random base mod 2⁶¹−1 make collisions negligible.' },
  { id: 'fc-st-5', topic: 'strings-1', front: 'Manacher’s algorithm gives…?', back: 'For every centre, the longest palindrome radius, in O(n). Also counts all palindromic substrings.' },
  // ---- segment-tree ----
  { id: 'fc-seg-1', topic: 'segment-tree', front: 'Segment tree operations and complexity?', back: 'Point update and range query for any **associative** operation (sum, min, max, gcd, custom merge) in O(log n) each; O(n) build.' },
  { id: 'fc-seg-2', topic: 'segment-tree', front: 'Array size for a recursive segment tree on n elements?', back: '4n is safe (2·next power of two is enough). Iterative bottom-up version uses 2n with n padded to a power of two.' },
  { id: 'fc-seg-3', topic: 'segment-tree', front: 'Sparse table: build/query complexity and limitation?', back: 'O(n log n) build, O(1) query for **idempotent** ops (min, max, gcd, AND/OR). Static array only — no updates.' },
  { id: 'fc-seg-4', topic: 'segment-tree', front: '"First index where prefix sum ≥ k" with a segment tree?', back: 'Walk down from the root: go left if left child sum ≥ k, else subtract it and go right. O(log n).' },
  // ---- fenwick ----
  { id: 'fc-fw-1', topic: 'fenwick', front: 'Fenwick tree update and prefix-query loops?', back: '```cpp\nfor (; i <= n; i += i & -i) t[i] += v;   // update\nfor (; i > 0; i -= i & -i) s += t[i];    // prefix sum\n```\n1-indexed.' },
  { id: 'fc-fw-2', topic: 'fenwick', front: 'Count inversions in O(n log n)?', back: 'Compress values; scan left to right; for each a[i] add the count of already-seen values greater than it (BIT query), then insert it.' },
  // ---- lazy-segment-tree ----
  { id: 'fc-lz-1', topic: 'lazy-segment-tree', front: 'What does a lazy tag store and when is it pushed?', back: 'A pending update for the whole node’s range. Pushed to children just before descending into them (on update or query).' },
  { id: 'fc-lz-2', topic: 'lazy-segment-tree', front: 'Range add + range sum: how does the node value change?', back: '`sum += add * (r - l + 1)`; the tag accumulates: `lazy += add`.' },
  { id: 'fc-lz-3', topic: 'lazy-segment-tree', front: 'Combining range assign and range add tags — the rule?', back: 'Assign overrides everything pending; an add applied after an assign modifies the assigned value. Keep a flag `hasAssign` and clear `add` on assign.' },
  // ---- dp-2 ----
  { id: 'fc-dp2-1', topic: 'dp-2', front: 'TSP via bitmask DP: state and complexity?', back: '`dp[mask][v]` = min cost to visit set `mask` ending at v. O(2ⁿ · n²). Fine for n ≤ 18–20.' },
  { id: 'fc-dp2-2', topic: 'dp-2', front: 'Digit DP state?', back: '`(position, tight, extra)` where `tight` = whether the prefix equals N’s prefix so far; `extra` = whatever property you count (digit sum mod k, last digit…). Often also `started` for leading zeros.' },
  { id: 'fc-dp2-3', topic: 'dp-2', front: 'Interval DP order of evaluation?', back: 'By increasing length: `for len = 1..n, for l, r = l + len − 1, for split k in [l, r)`. O(n³) typically.' },
  { id: 'fc-dp2-4', topic: 'dp-2', front: 'SOS DP computes what, in what time?', back: 'For every mask, the sum over all its submasks: `for bit: for mask: if mask has bit: f[mask] += f[mask ^ bit]`. O(2ⁿ · n).' },
  // ---- dp-trees ----
  { id: 'fc-dpt-1', topic: 'dp-trees', front: 'Why is "merge child knapsacks, each capped by subtree size" O(n²) total, not O(n³)?', back: 'Each pair of nodes is combined exactly once — at their LCA. Summing sizes pairwise over all merges gives O(n²).' },
  { id: 'fc-dpt-2', topic: 'dp-trees', front: 'Maximum independent set on a tree DP?', back: '`dp[v][0] = Σ max(dp[c][0], dp[c][1])`, `dp[v][1] = 1 + Σ dp[c][0]`. Answer `max(dp[root][*])`.' },
  // ---- lca ----
  { id: 'fc-lca-1', topic: 'lca', front: 'Binary lifting: memory and query complexity?', back: '`up[LOG][n]` with LOG ≈ 18–20 for n ≤ 10⁶; k-th ancestor and LCA in O(log n) after O(n log n) preprocessing.' },
  { id: 'fc-lca-2', topic: 'lca', front: 'Distance between u and v in a tree via LCA?', back: '`depth[u] + depth[v] − 2·depth[lca(u,v)]`.' },
  { id: 'fc-lca-3', topic: 'lca', front: 'Alternative LCA in O(1) query?', back: 'Euler tour of the tree + sparse table RMQ over depths between first occurrences of u and v.' },
  // ---- scc-bridges ----
  { id: 'fc-scc-1', topic: 'scc-bridges', front: 'What is the condensation of a directed graph?', back: 'Contract each SCC into one node → a DAG. Then DP/topological order works (e.g. reachability, "minimum nodes to start from" = number of SCCs with in-degree 0).' },
  { id: 'fc-scc-2', topic: 'scc-bridges', front: 'Bridge condition with low-link values?', back: 'Tree edge (u→v) is a bridge iff `low[v] > tin[u]`. Articulation point: `low[v] >= tin[u]` (root needs ≥ 2 children).' },
  { id: 'fc-scc-3', topic: 'scc-bridges', front: '2-SAT: clause (a ∨ b) becomes which implication edges?', back: '`¬a → b` and `¬b → a`. Satisfiable iff no variable is in the same SCC as its negation; assignment from SCC topological order.' },
  // ---- number-theory-2 ----
  { id: 'fc-nt2-1', topic: 'number-theory-2', front: 'Euler’s totient φ(n) from factorization? Euler’s theorem?', back: 'φ(n) = n · ∏ (1 − 1/p). If gcd(a,n)=1: a^φ(n) ≡ 1 (mod n) → exponents can be reduced mod φ(n).' },
  { id: 'fc-nt2-2', topic: 'number-theory-2', front: 'Extended Euclid returns…?', back: '(g, x, y) with `a·x + b·y = g = gcd(a,b)`. Gives modular inverses for any modulus with gcd 1 and solves linear Diophantine equations.' },
  { id: 'fc-nt2-3', topic: 'number-theory-2', front: 'Chinese Remainder Theorem guarantees…?', back: 'A unique solution mod m₁·m₂ for x ≡ a₁ (mod m₁), x ≡ a₂ (mod m₂) when gcd(m₁, m₂) = 1. Combine pairwise; use __int128 for products.' },
  // ---- matrix-expo ----
  { id: 'fc-mx-1', topic: 'matrix-expo', front: 'Fibonacci(10¹⁸) mod p — how?', back: 'Matrix `[[1,1],[1,0]]^n` by fast exponentiation, O(2³ log n).' },
  { id: 'fc-mx-2', topic: 'matrix-expo', front: 'Number of walks of length k from u to v?', back: '`(A^k)[u][v]` where A is the adjacency matrix. O(n³ log k).' },
  // ---- probability-ev ----
  { id: 'fc-pr-1', topic: 'probability-ev', front: 'Linearity of expectation says…?', back: 'E[X + Y] = E[X] + E[Y] **always**, even if X and Y are dependent. Sum indicator variables instead of analysing the whole outcome.' },
  { id: 'fc-pr-2', topic: 'probability-ev', front: 'Probability p/q "mod 1e9+7" means?', back: 'Output `p · q⁻¹ mod p`. Compute inverses with Fermat; do all arithmetic in the modular field.' },
  { id: 'fc-pr-3', topic: 'probability-ev', front: 'Expected number of steps of a process with self-loops — how to handle E = a + p·E?', back: 'Solve algebraically: E = a / (1 − p). In modular arithmetic multiply by the inverse of (1 − p).' },
  // ---- game-theory ----
  { id: 'fc-gt-1', topic: 'game-theory', front: 'Nim with piles a₁..aₙ: who wins?', back: 'First player wins iff `a₁ ⊕ a₂ ⊕ … ⊕ aₙ ≠ 0`.' },
  { id: 'fc-gt-2', topic: 'game-theory', front: 'Sprague–Grundy: Grundy value of a position and of a sum of games?', back: '`g(pos) = mex{ g(next) }`; for a sum of independent games, XOR the Grundy values. Losing iff total XOR is 0.' },
  // ---- geometry-1 ----
  { id: 'fc-ge-1', topic: 'geometry-1', front: 'Cross product of vectors a and b tells you…?', back: 'Sign = turn direction (positive = counter-clockwise from a to b), magnitude = 2 × triangle area. `a.x*b.y − a.y*b.x`.' },
  { id: 'fc-ge-2', topic: 'geometry-1', front: 'Polygon area formula from vertices?', back: 'Shoelace: `|Σ (xᵢ·yᵢ₊₁ − xᵢ₊₁·yᵢ)| / 2`. Keep the doubled integer area to avoid fractions.' },
  { id: 'fc-ge-3', topic: 'geometry-1', front: 'Convex hull (Andrew’s monotone chain) complexity and idea?', back: 'O(n log n): sort points, build lower and upper hull popping while the last turn is not counter-clockwise (cross ≤ 0).' },
  { id: 'fc-ge-4', topic: 'geometry-1', front: 'Why avoid doubles in geometry when possible?', back: 'Precision errors break orientation tests. Use 64-bit integer cross products (coordinates ≤ 10⁹ → products ≤ 10¹⁸, fits long long).' },
  // ---- sqrt-mo ----
  { id: 'fc-sq-1', topic: 'sqrt-mo', front: 'Meet in the middle: subset sum for n = 40?', back: 'Enumerate 2²⁰ sums of each half, sort one, binary search / two pointers for complements. O(2^(n/2) · n).' },
  { id: 'fc-sq-2', topic: 'sqrt-mo', front: 'Mo’s algorithm complexity and requirement?', back: 'O((n + q)·√n) moves of add/remove; requires that adding/removing one element updates the answer in O(1) (or O(log n)). Offline only.' },
  // ---- strings-2 ----
  { id: 'fc-st2-1', topic: 'strings-2', front: 'Aho–Corasick answers which queries?', back: 'Multi-pattern matching: find all occurrences of k patterns in a text in O(|text| + total pattern length + matches).' },
  { id: 'fc-st2-2', topic: 'strings-2', front: 'Suffix array + LCP array give you…?', back: 'Sorted suffixes; number of distinct substrings = n(n+1)/2 − Σ LCP; longest repeated substring = max LCP; substring search in O(m log n).' },
  // ---- flows ----
  { id: 'fc-fl-1', topic: 'flows', front: 'Max-flow min-cut theorem?', back: 'Maximum flow value = minimum capacity of an s–t cut. "Minimum cost to disconnect" problems are max flows.' },
  { id: 'fc-fl-2', topic: 'flows', front: 'Dinic’s complexity on unit-capacity bipartite graphs?', back: 'O(E √V) — fast enough for matching on 10⁵ edges.' },
  { id: 'fc-fl-3', topic: 'flows', front: 'König’s theorem?', back: 'In a bipartite graph, max matching = min vertex cover. Max independent set = n − max matching.' },
  // ---- constructive ----
  { id: 'fc-cs-1', topic: 'constructive', front: 'Common invariants to check when a construction seems impossible?', back: 'Parity (sum, count of odd elements), sum/total, colouring (chessboard), sorted order, gcd, number of inversions.' },
  // ---- interactive ----
  { id: 'fc-int-1', topic: 'interactive', front: 'Most common interactive-problem failure and fix?', back: 'Forgetting to **flush** output: use `cout << ... << endl;` or `cout.flush()` after every query. Also count queries and stop before the limit.' },
  // ---- dp-optimizations ----
  { id: 'fc-dpo-1', topic: 'dp-optimizations', front: 'Convex hull trick applies to transitions of which form?', back: '`dp[i] = min_j (dp[j] + a[j]·b[i] + …)` — a set of lines y = m·x + c queried at x = b[i]. With sorted slopes and queries: deque, amortized O(1). Otherwise Li Chao tree O(log C).' },
  { id: 'fc-dpo-2', topic: 'dp-optimizations', front: 'Divide & conquer DP optimization requires…?', back: 'Monotone optimal split: `opt(i) ≤ opt(i+1)`. Then each layer computes in O(n log n) instead of O(n²).' },
  // ---- hld-centroid ----
  { id: 'fc-hld-1', topic: 'hld-centroid', front: 'Heavy-light decomposition guarantee?', back: 'Any root-to-node path crosses O(log n) heavy chains, so path queries become O(log² n) with a segment tree over the HLD order.' },
  { id: 'fc-hld-2', topic: 'hld-centroid', front: 'Centroid decomposition depth?', back: 'O(log n): removing a centroid leaves components of size ≤ n/2. Every path is counted at the highest centroid it passes.' },
  // ---- randomized-hashing ----
  { id: 'fc-rh-1', topic: 'randomized-hashing', front: 'Check whether two multisets (or two subtrees) are equal fast with randomness?', back: 'Assign a random 64-bit value to each element; compare sums (multiset) or XORs (set). Collision probability ≈ 2⁻⁶⁴.' },
  // ---- linear-algebra ----
  { id: 'fc-la-1', topic: 'linear-algebra', front: 'XOR basis: what does it give you?', back: 'A set of ≤ 60 vectors spanning the same XOR-span as the input: check representability, count subsets with a given XOR, maximum subset XOR — each in O(60).' },
  // ---- contest-strategy ----
  { id: 'fc-cs2-1', topic: 'contest-strategy', front: 'ICPC ranking rule?', back: 'Most solved problems; ties broken by penalty = Σ (acceptance minute + 20 · rejected attempts) over **solved** problems only.' },
  { id: 'fc-cs2-2', topic: 'contest-strategy', front: 'What does a 3-person team do in the first 15 minutes?', back: 'Split the problem set for reading, each summarises their problems in one line, agree on the easiest 2, the coder starts the first while others verify the second.' },
  { id: 'fc-cs2-3', topic: 'contest-strategy', front: 'What is the scoreboard freeze?', back: 'In the last hour, submissions still count but the public scoreboard stops updating; results are revealed after the contest. Do not rely on the board to decide what to solve late.' },
];

const Flashcards = {
  unlocked() {
    const opened = TOPICS.filter((t) => Store.topic(t.id).status).map((t) => t.id);
    const set = new Set(opened.length ? opened : TOPICS.filter((t) => t.tier === 0).map((t) => t.id));
    return FLASHCARDS.filter((c) => set.has(c.topic));
  },
  dueCount() {
    const today = U.todayKey();
    return this.unlocked().filter((c) => { const s = Store.card(c.id); return s && s.due <= today; }).length;
  },
  newCount() { return this.unlocked().filter((c) => !Store.card(c.id)).length; },
};
