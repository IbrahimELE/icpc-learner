/* Lessons — Tier 1 core techniques (plus constructive & interactive from Tier 2). */
window.LESSONS = window.LESSONS || {};

LESSONS['sorting-searching'] = { md: String.raw`
## Sorting is the first thing to try
Half of all “array” problems become easy once the array is sorted: duplicates become adjacent, the median is in the middle, greedy choices follow the order, and binary search becomes available. If you are stuck on an array problem, ask “what if I sort it?”.

## Custom comparators
~~~cpp
struct Item { int w, v; };
vector<Item> a;
sort(a.begin(), a.end(), [](const Item& x, const Item& y) {
    if (x.w != y.w) return x.w < y.w;      // primary key ascending
    return x.v > y.v;                      // secondary key descending
});
~~~
Rules: compare the primary key, fall back to the next key only on ties, and return **false for equal elements** (''<'' not ''<=''). To sort by a computed key, precompute it into the struct — do not recompute inside the comparator.

Sorting indices instead of values keeps the original positions: ''iota(idx.begin(), idx.end(), 0); sort(idx.begin(), idx.end(), [&](int i, int j) { return a[i] < a[j]; });''.

## Coordinate compression
Values up to 10⁹ but only n ≤ 2·10⁵ of them → replace each value by its rank.
~~~cpp
vector<long long> vals = a;
sort(vals.begin(), vals.end());
vals.erase(unique(vals.begin(), vals.end()), vals.end());
for (auto& x : a) x = lower_bound(vals.begin(), vals.end(), x) - vals.begin();   // now 0..k-1
~~~
Now the values index Fenwick trees, segment trees and frequency arrays. This trick appears in a large fraction of data-structure problems.

## Sweep line with events
Turn intervals into events, sort them, process left to right while maintaining the “current state”.
~~~cpp
// maximum number of intervals covering any point (closed intervals)
vector<pair<int,int>> ev;                 // (x, type): type 0 = start, 1 = end
for (auto [l, r] : intervals) { ev.push_back({l, 0}); ev.push_back({r, 1}); }
sort(ev.begin(), ev.end());               // starts before ends at the same x, so touching intervals overlap
int cur = 0, best = 0;
for (auto [x, t] : ev) { if (t == 0) best = max(best, ++cur); else cur--; }
~~~
:::pitfall Ties are where sweeps break
Decide deliberately how to order events with the same coordinate. Closed intervals [a, b], [b, c] overlap at b → starts first. Half-open intervals → ends first. Encode the type so that ''sort'' does the right thing.
:::

## Counting sort and friends
When values are small (≤ 10⁶), a frequency array beats sorting: O(n + K). It also gives you “count of each value” for free, which many counting problems need.

## Searching in sorted data
- ''lower_bound(x)'' first element ≥ x; ''upper_bound(x)'' first element > x. Count of x = difference. Predecessor = ''lower_bound'' minus one step (check begin).
- Sorted + two pointers: pairs with sum, merging two sorted lists, “for each a find the matching b”.
- Sorted + binary search on the answer: see [[topic:binary-search]].

## Typical problems
- Minimum number of rooms for events → sort by start, min-heap of end times.
- “Nested intervals” (contains / is contained) → sort by start ascending, end descending, then a sweep with running max/min ([[problem:cses-2168]]).
- Sum of |a[i] − x| minimised → x = median ([[problem:cses-1074]]).
- Josephus, playlist, ferris wheel — the Sorting & Searching section of CSES is the ideal practice set; solve at least 15 of them.

:::seerc
Sweep lines show up in geometry-flavoured SEERC problems (rectangles, segments on a line) and in scheduling problems. The event-ordering bug is the classic reason a correct idea gets WA on test 7. Test touching intervals explicitly.
:::

See also [[viz:monotonic-stack]] for the nearest-smaller-element sweep.
` };

LESSONS['binary-search'] = { md: String.raw`
## Two flavours
1. **Search in a sorted array** — find a value or the boundary of a property. ''lower_bound'' does it for you.
2. **Binary search on the answer** — the problem asks for the maximum/minimum x such that something is possible. If “possible(x)” is **monotone** (true for all x ≤ X* and false after, or the reverse), you can find X* by testing O(log range) values of x.

The second flavour turns many hard optimisation problems into easy decision problems. It is one of the highest-value techniques in this entire roadmap.

## The template that never breaks
~~~cpp
// smallest x in [lo, hi] with ok(x) == true, assuming ok is monotone (false...false true...true)
long long lo = L, hi = R;             // must know ok(R) is true (or use R+1 as "not found")
while (lo < hi) {
    long long mid = lo + (hi - lo) / 2;
    if (ok(mid)) hi = mid;            // mid works: answer is mid or smaller
    else lo = mid + 1;                // mid fails: answer is larger
}
// lo == hi is the answer
~~~
For “largest x with ok(x) true” flip it: ''mid = lo + (hi - lo + 1) / 2; if (ok(mid)) lo = mid; else hi = mid - 1;''. The ''+1'' prevents an infinite loop when hi = lo + 1. Watch the [[viz:binary-search]] visualizer to see the invariant “the answer is always inside [lo, hi]”.

:::pitfall The three classic bugs
1. ''mid = (lo + hi) / 2'' overflows when lo + hi > 2·10⁹ — use ''lo + (hi − lo) / 2''.
2. Infinite loop: with ''lo = mid'' you need the rounded-up midpoint.
3. Off-by-one in the return: decide beforehand whether you return the first true or the last false, and test on a 2-element range by hand.
:::

## Binary search on the answer — recipe
1. Identify the quantity x asked for (minimum time, maximum minimum distance, k-th value…).
2. Write ''ok(x)'': “is it possible to achieve x?” — usually a greedy or a simulation, O(n) or O(n log n).
3. Check monotonicity: if x is achievable, is every smaller (or larger) x also achievable? If yes, binary search.
4. Bounds: lo = smallest conceivable answer, hi = largest (careful with overflow inside ok when x is huge — cap sums).

:::example Factory Machines (CSES 1620)
n machines, machine i makes a product every kᵢ seconds; time to make t products? ok(T) = Σ⌊T/kᵢ⌋ ≥ t is monotone in T. lo = 1, hi = t · min(k). Each check is O(n); total O(n log(10¹⁸)) ≈ 60 checks.
:::
:::example Array Division (CSES 1085)
Split an array into k contiguous parts minimising the largest part sum. ok(S): greedily cut whenever adding the next element would exceed S; possible iff the number of parts ≤ k. Monotone in S.
:::
:::example Aggressive cows / “maximise the minimum distance”
Place c cows in n stalls maximising the minimum distance. ok(d): greedily place a cow at the first stall at least d away from the previous one; possible iff you place ≥ c cows.
:::

## Real-valued answers
~~~cpp
double lo = 0, hi = 1e9;
for (int it = 0; it < 100; it++) {        // fixed iterations, never a while on eps
    double mid = (lo + hi) / 2;
    if (ok(mid)) hi = mid; else lo = mid;
}
~~~

## Ternary search (unimodal functions)
If f first decreases then increases (or the reverse), find its extremum by comparing f(m) with f(m + 1) on integers (binary search on “is the function still decreasing?”) or by splitting into thirds on reals. Typical: minimise total distance to a point, optimise a parameter of a geometric configuration.

## Search over a monotone 2D structure
“Count pairs (i, j) with a[i] + b[j] ≤ x” for a fixed x: sort both, and for each a[i] binary search in b — O(n log n). This is often the inner ''ok'' of an outer binary search (“k-th smallest pair sum”): nested binary search, O(n log n log C).

:::recognize
Words like *minimum time*, *maximum possible minimum*, *smallest k such that*, *is it possible to… within budget* are binary-search-on-the-answer signals. Also any problem where checking a candidate is much easier than constructing the optimum.
:::

:::seerc
Almost every SEERC has at least one problem whose intended solution is “binary search the answer, check greedily”. It is the single best return on study time in this roadmap. Practice: [[problem:cses-1620]], [[problem:cses-1085]], [[problem:cf-1201C]], [[problem:cf-1370D]].
:::
` };

LESSONS['prefix-sums'] = { md: String.raw`
## Prefix sums
Precompute p[0] = 0, p[i] = a[0] + … + a[i−1]. Then the sum of a[l..r] (inclusive) is ''p[r + 1] − p[l]'' in O(1). O(n) to build, O(1) per query, no updates.
~~~cpp
vector<long long> p(n + 1, 0);
for (int i = 0; i < n; i++) p[i + 1] = p[i] + a[i];
auto rangeSum = [&](int l, int r) { return p[r + 1] - p[l]; };   // inclusive [l, r]
~~~
The same works for any operation with an inverse: XOR (''p[r+1] ^ p[l]''), products modulo a prime (multiply by the inverse), counts of a specific value (prefix counts). It does **not** work for min/max (no inverse) — use a sparse table or segment tree.

## The “count subarrays with property” trick
Many counting problems reduce to counting pairs (i, j) of prefix values:
- Subarrays with sum exactly k: pairs with p[j] − p[i] = k → iterate j, keep a hash map of counts of earlier p[i], add cnt[p[j] − k] ([[problem:cses-1661]]).
- Subarrays with sum divisible by k: p[i] ≡ p[j] (mod k) → count residues, add C(cnt, 2) ([[problem:cses-1662]]).
- Subarrays with equal numbers of 0s and 1s: replace 0 by −1 → sum zero.
- Longest subarray with sum k: store the first index of each prefix value.

~~~cpp
map<long long, long long> cnt; cnt[0] = 1;
long long p = 0, ans = 0;
for (int x : a) { p += x; ans += cnt[p - k]; cnt[p]++; }
~~~
The [[viz:prefix-sums]] visualizer animates this.

## Difference arrays (range update, offline)
Add v to every a[i] for l ≤ i ≤ r, many times, then read the final array:
~~~cpp
vector<long long> d(n + 1, 0);
for (auto [l, r, v] : updates) { d[l] += v; d[r + 1] -= v; }
for (int i = 0; i < n; i++) a[i] += (i ? d[i] += d[i - 1] : d[i]);   // prefix-sum the differences
~~~
O(1) per update, O(n) to finish. If queries interleave with updates you need a Fenwick tree or lazy segment tree instead ([[topic:fenwick]], [[topic:lazy-segment-tree]]).

## 2D prefix sums
S[i][j] = sum of the rectangle (0,0)–(i−1,j−1):
~~~cpp
for (int i = 0; i < n; i++)
    for (int j = 0; j < m; j++)
        S[i+1][j+1] = a[i][j] + S[i][j+1] + S[i+1][j] - S[i][j];
// sum of rows r1..r2, cols c1..c2 (inclusive):
long long sum = S[r2+1][c2+1] - S[r1][c2+1] - S[r2+1][c1] + S[r1][c1];
~~~
2D difference arrays work the same way with four corner updates. Higher dimensions follow the inclusion–exclusion pattern.

## Prefix ideas beyond sums
- Prefix **maximum / minimum** (no queries in the middle, just “best so far”): Kadane’s algorithm is “prefix sum minus minimum prefix seen so far”.
- Prefix **counts of each letter** for “how many ''a'' in s[l..r]” (26 prefix arrays).
- Prefix **gcd/lcm** from the left and from the right for “remove one element” problems.
- Prefix sums on trees: root-to-node sums, then path sum = sum[u] + sum[v] − 2·sum[lca] (+ value at lca).

:::pitfall Watch for
Overflow (sums of 2·10⁵ values up to 10⁹ need long long), negative residues when taking mod, and the l = 0 case (that is why p has an extra leading zero).
:::

:::seerc
Prefix sums are rarely the *whole* solution at SEERC but they are inside most solutions: as the O(1) check inside a binary search, as the sum in a DP transition, as the cost function in a sweep. Make them automatic.
:::
` };

LESSONS['two-pointers'] = { md: String.raw`
## The idea
Two indices move through the array, both only forward. Because each index moves at most n times, the total work is O(n) even though the code has a nested loop. Two settings:
1. **Sliding window**: maintain the window [l, r] satisfying a property; extend r, shrink l while the property fails.
2. **Two sequences**: one pointer in each sorted array (merge, pairs with sum, intersection).

## Sliding window
~~~cpp
// number of subarrays with sum <= k (all values positive)
long long ans = 0, sum = 0;
for (int l = 0, r = 0; r < n; r++) {
    sum += a[r];
    while (sum > k) sum -= a[l++];    // shrink until valid
    ans += r - l + 1;                  // every subarray ending at r starting in [l, r]
}
~~~
:::proof Why it is correct
The window property must be **monotone**: if [l, r] is invalid then any [l', r] with l' < l is also invalid, and if [l, r] is valid then [l, r'] for r' < r is valid. Positive values give this for “sum ≤ k”; “at most k distinct values” has it too. With negative numbers, “sum ≤ k” is not monotone — sliding window fails; use prefix sums + a data structure.
:::

Other windows: longest substring with no repeated character (map of counts, shrink while a count is 2), minimum window containing all required letters, count subarrays with at most k distinct ([[problem:cses-2428]]). See the [[viz:two-pointers]] animation.

## Two sorted arrays
~~~cpp
// pairs (i, j) with a[i] + a[j] == x in a sorted array
int l = 0, r = n - 1;
while (l < r) {
    long long s = a[l] + a[r];
    if (s == x) { /* found */ l++; r--; }
    else if (s < x) l++; else r--;
}
~~~
Merging two sorted lists, computing set intersections, “for each element of A the first element of B that is ≥ it” — all O(n + m) with two pointers.

## Sliding window minimum: the monotonic deque
Minimum of every window of length k in O(n):
~~~cpp
deque<int> dq;                         // indices; values increasing from front to back
for (int i = 0; i < n; i++) {
    while (!dq.empty() && a[dq.back()] >= a[i]) dq.pop_back();   // a[i] is a better candidate than those
    dq.push_back(i);
    if (dq.front() <= i - k) dq.pop_front();                      // out of the window
    if (i >= k - 1) ans.push_back(a[dq.front()]);
}
~~~
Elements that are older *and* larger than the new element can never be a window minimum again — that is why they are discarded. The [[viz:sliding-window-min]] visualizer shows the deque evolving. The same structure powers the monotonic-queue DP optimisation ([[topic:dp-optimizations]]).

## Monotonic stack: nearest smaller/greater element
For each i, the nearest j < i with a[j] < a[i]: keep a stack of indices with increasing values; pop while the top is ≥ a[i]; the remaining top is the answer ([[problem:cses-1645]]). Applications: largest rectangle in a histogram, “number of subarrays where a[i] is the minimum” (contribution technique — each element counts (i − L)·(R − i) subarrays).

:::recognize
*Contiguous subarray*, *substring*, *window of length k*, *count subarrays with…*, *two sorted arrays* — try two pointers before anything heavier. If the property is not monotone, fall back to prefix sums + binary search/BIT.
:::

:::seerc
Two-pointer solutions are usually the “easy-medium” problem of a SEERC set and a common component of harder ones (the check inside a binary search). Practice: [[problem:cses-1640]], [[problem:cses-1660]], [[problem:cses-1141]], [[problem:cses-1644]].
:::
` };

LESSONS['greedy'] = { md: String.raw`
## What greedy means
Make the locally best choice at each step and never reconsider. It is fast and short — and wrong more often than beginners expect. The skill is knowing *when* it works and being able to argue it.

## The classics (know these cold)
| Problem | Greedy rule | Why it works |
|---|---|---|
| Max non-overlapping intervals | sort by **end**, take if it starts after the last taken end | earliest end leaves the most room (exchange argument) |
| Min rooms for intervals (interval partitioning) | sort by start, min-heap of end times, reuse a room if free | answer = max overlap, a lower bound |
| Min number of coins (canonical systems) | largest coin first | only for systems like {1, 2, 5, 10…}; fails for {1, 3, 4} |
| Minimise Σ finish times (single machine) | shortest job first | swapping two adjacent jobs in the wrong order increases the sum |
| Maximise on-time jobs | sort by deadline, keep a max-heap of durations, drop the longest when late | Moore–Hodgson |
| Huffman coding | repeatedly merge the two smallest weights | optimal prefix code |
| Fractional knapsack | best value/weight ratio first | fails for 0/1 knapsack (needs DP) |
| Assign smallest to smallest (two sorted lists) | sort both, match in order | rearrangement inequality |

## The exchange argument — how to prove greedy
Take any optimal solution. Find the first place where it differs from the greedy choice. Show that swapping in the greedy choice does not make it worse. Repeat until the optimal solution *is* the greedy one. If you cannot write this argument in 3 sentences, be suspicious.

:::example Interval scheduling proof
Let the greedy pick interval g (earliest end). Any optimal solution has a first interval o; since end(g) ≤ end(o), replacing o by g keeps the solution valid and the same size. Induct on the rest.
:::

## How to tell greedy from DP
- Does the future depend only on the *count/summary* of what you did, not on *which* items? Greedy candidate.
- Do you need to compare “take this now” against “save capacity for later” with items of different sizes? That is knapsack — DP.
- Small n (≤ 20) with a suspicious greedy → just do bitmask DP or brute force and be safe.
- Can you construct a 3–4 element counterexample in 2 minutes? Then greedy is wrong. Always try.

## Greedy with a priority queue
“At each step take the best available option” is a heap: Dijkstra, Huffman, task scheduling, merging k sorted lists, [[problem:cf-1526C2]] (drink every potion, undo the worst when health goes negative — a *regret* greedy).

## Greedy with sorting + two pointers
Match the smallest with the smallest (or largest): apartments/applicants ([[problem:cses-1084]]), ferris wheel ([[problem:cses-1090]]) — sort, then walk from both ends.

:::pitfall Where greedy dies
- Sorting by the wrong key (start time instead of end time).
- Ignoring ties (equal end times, equal values).
- “Local best” defined on the wrong quantity (ratio vs absolute value).
- A greedy that is right for the *feasibility* question but not for *optimality*.
:::

:::seerc
SEERC greedy problems tend to be “sort by the right key, then sweep with a heap” — medium difficulty, high value. Most WAs on them are wrong tie handling. If you and a teammate both believe a greedy without a proof, spend 2 minutes on small counterexamples before coding.
:::
` };

LESSONS['recursion-backtracking'] = { md: String.raw`
## Complete search is a real technique
When constraints are small (n ≤ 20, permutations of ≤ 10, grids of ≤ 9 cells), the intended solution *is* to try everything, cleverly. Setters put such problems in every set; recognising that “n ≤ 15” is an invitation, not a coincidence, wins easy points.

## Enumerating subsets
~~~cpp
for (int mask = 0; mask < (1 << n); mask++) {        // 2^n subsets
    long long sum = 0;
    for (int i = 0; i < n; i++)
        if (mask >> i & 1) sum += a[i];               // element i is in the subset
    // ... use sum
}
~~~
2²⁰ ≈ 10⁶ subsets × 20 = 2·10⁷ steps. Iterating submasks of a mask, Gray codes, and the [[viz:subsets]] visualizer are in [[topic:bit-manipulation]].

## Enumerating permutations
~~~cpp
vector<int> p(n); iota(p.begin(), p.end(), 0);
do { /* use p */ } while (next_permutation(p.begin(), p.end()));   // n! permutations in lexicographic order
~~~
10! = 3.6·10⁶ fine; 11! = 4·10⁷ fine if the body is light; 12! = 4.8·10⁸ borderline; 13! too slow.

## Recursive generation and backtracking
~~~cpp
int n, cnt = 0;
vector<int> col, used, diag1, diag2;   // N-queens: one queen per row
void search(int row) {
    if (row == n) { cnt++; return; }
    for (int c = 0; c < n; c++) {
        if (used[c] || diag1[row + c] || diag2[row - c + n]) continue;   // prune: attacked
        used[c] = diag1[row + c] = diag2[row - c + n] = 1;
        search(row + 1);
        used[c] = diag1[row + c] = diag2[row - c + n] = 0;               // undo (backtrack)
    }
}
~~~
Backtracking = depth-first generation of partial solutions + **pruning**: abandon a branch as soon as it cannot lead to a valid answer. Good pruning turns impossible searches into instant ones ([[problem:cses-1625]] is the extreme example).

## Pruning ideas
- Feasibility: partial sum already exceeds the target; a constraint already violated.
- Bounding (branch and bound): partial cost + optimistic estimate of the rest ≥ best found so far → cut.
- Symmetry: fix the first choice (e.g. the first move goes right) and multiply.
- Ordering: try the most constrained choices first (Warnsdorff’s rule for knight’s tours), so dead ends are found early.
- Memoization: if the same partial state recurs, cache it — this is where backtracking turns into DP ([[topic:dp-1]]).

## Meet in the middle (preview)
2⁴⁰ subsets is too many, but 2²⁰ + 2²⁰ is fine: enumerate both halves and combine with sorting/hashing. Details in [[topic:sqrt-mo]].

## Recursion mechanics to remember
- Each call uses stack memory; depth 10⁵–10⁶ can overflow. Grid DFS and tree DFS on paths are the usual victims; convert to iterative or increase the stack.
- Pass big containers by reference (''const vector<int>&''), never by value, or you copy them at every level.
- Global “current path” vectors with push/pop are simpler than passing copies.

:::recognize
n ≤ 20 with subsets; n ≤ 10 with orderings; a board of ≤ 10×10 with placements; “count the number of ways” with tiny limits; “find any arrangement” with tiny limits. If the intended complexity table says exponential, do not look for a clever polynomial algorithm.
:::

:::seerc
Expect one problem per SEERC where the whole difficulty is realising the search space is small enough (sometimes after one observation halves it). Also, brute force is your stress-testing oracle for every other problem — write it fast.
:::
` };

LESSONS['bit-manipulation'] = { md: String.raw`
## Bits as sets
A 32- or 64-bit integer is a set of up to 32/64 elements: bit i set ⇔ element i present. Set operations become single instructions.
| Set operation | Bit operation |
|---|---|
| contains i | ''mask >> i & 1'' |
| add i | ''mask \| (1 << i)'' |
| remove i | ''mask & ~(1 << i)'' |
| toggle i | ''mask ^ (1 << i)'' |
| union / intersection / difference | ''a \| b'' / ''a & b'' / ''a & ~b'' |
| size | ''__builtin_popcount(mask)'' (''ll'' suffix for 64-bit) |
| is subset (a ⊆ b) | ''(a & b) == a'' |
| lowest set bit | ''mask & -mask'' |
| remove lowest set bit | ''mask & (mask - 1)'' |
| is power of two | ''mask && !(mask & (mask - 1))'' |

Always use ''1LL << i'' when i can be ≥ 31.

## Iterating over submasks
~~~cpp
for (int sub = mask; ; sub = (sub - 1) & mask) {
    // process sub (a subset of mask), including 0
    if (sub == 0) break;
}
~~~
Summed over all masks this is 3ⁿ — fine for n ≤ 15. It is the loop inside subset-partition DPs ([[problem:ac-dp_u]]).

## XOR: the algebra you need
- ''a ^ a = 0'', ''a ^ 0 = a'', commutative and associative → prefix XORs give range XORs; the odd-one-out element is the XOR of everything.
- ''a ^ b'' is a "distance" (Hamming) on bits; maximise it with a binary trie ([[topic:strings-2]]).
- XOR of 1..n has period 4: n, 1, n+1, 0 for n mod 4 = 0, 1, 2, 3.
- ''a + b = (a ^ b) + 2·(a & b)''.
- Any set of numbers spans a linear space over GF(2) → XOR basis ([[topic:linear-algebra]]).

## Bitsets: the 64× speed-up
''bitset<N>'' stores N bits and does AND/OR/XOR/shift on 64 at a time.
~~~cpp
bitset<100001> reach; reach[0] = 1;
for (int w : weights) reach |= reach << w;      // subset-sum feasibility, O(n·W/64)
cout << reach.count();                           // number of reachable sums
~~~
Also: adjacency bitsets for transitive closure / counting triangles, "beautiful subgrids" ([[problem:cses-2137]]), string matching with wildcards.

## Bit tricks in DP
- State = subset of items → bitmask DP ([[topic:dp-2]]): TSP, assignment, "visit all", broken-profile tilings.
- Gray code: successive subsets differing in one bit ([[problem:cses-2205]]).
- Sum over subsets DP: for each mask the sum over all its submasks in O(2ⁿ·n).

## Number-of-bits facts
- popcount, ctz (trailing zeros = index of the lowest bit), clz (leading zeros): ''31 − __builtin_clz(x)'' is ⌊log₂ x⌋ for x > 0.
- Highest power of two ≤ x: ''1 << (31 − __builtin_clz(x))''.
- Round up to a power of two: while (p < x) p <<= 1.

:::pitfall Precedence
''mask & 1 << i'' parses as ''mask & (1 << i)'' — fine — but ''mask >> i & 1 == 1'' parses as ''mask >> (i & (1 == 1))''. Parenthesize comparisons: ''((mask >> i) & 1) == 1''. Also ''x >> 64'' is undefined; shifts must be < width.
:::

:::seerc
Bitmask DP and XOR tricks are SEERC regulars; the [[viz:subsets]] visualizer walks through subset enumeration. The bitset speed-up is the secret weapon when an O(n²) solution is 10× too slow.
:::
` };

LESSONS['constructive'] = { md: String.raw`
## What a constructive problem asks
"Output **any** array / permutation / graph / sequence of operations satisfying …, or report that none exists." There is no formula to recall; you must design an object. These problems reward thinking over knowledge — which is why they are the most common problem type at SEERC and the most feared by beginners.

## The workflow
1. **Small cases by hand.** n = 1, 2, 3, 4, 5. Write the answers down. Patterns appear (alternate parity, pair the ends, reverse blocks, "all equal except one").
2. **Brute force as a pattern generator.** For n ≤ 8 enumerate everything, print all valid answers, look at the *simplest* one for each n.
3. **Find invariants for impossibility.** Parity of a sum, count of odd elements, a chessboard colouring, gcd, sortedness — if the target violates an invariant of all reachable states, print −1 with confidence.
4. **Generalise and prove.** Check your pattern on the brute force for n ≤ 10, then argue why it always works.
5. **Handle the special small cases** separately (n = 1, n = 2 are frequently the only exceptions).

## Recurring patterns
- **Alternate parities**: evens then odds ([[problem:cses-1070]]); interleave largest/smallest.
- **Pairing ends**: (1, n), (2, n−1), … each summing to n+1 ([[problem:cses-1092]]).
- **Adjust one element**: make everything equal, fix the remainder on a single position.
- **Reversal / rotation by k**: turn a shift into a permutation with a needed property.
- **Chessboard colouring**: force parities by position ([[problem:cf-1438C]]).
- **Greedy repair**: build something almost valid, then fix violations locally.
- **Graph constructions**: a star for "diameter 2", a path for "unique paths", a complete bipartite graph for "no odd cycles", a cycle plus chords for degree constraints.
- **Binary representation**: represent k as a sum of powers of two to build "exactly k of something".

## Extremal principle
Look at the largest element: where must it be? The longest interval: what does it force? Often the construction is "place the extreme element, then recurse on the rest".

## Proving impossibility properly
:::example Parity invariant
Operation: swap two adjacent elements. Each swap changes the number of inversions by exactly 1, so the parity of the inversion count after k swaps is fixed. Reaching a permutation with the wrong parity in exactly k swaps is impossible.
:::
:::example Sum invariant
Operation: add 1 to two adjacent cells. The total increases by 2 every time, so a target with the wrong parity of the total is unreachable — regardless of any other cleverness.
:::

## Writing the output safely
Constructive outputs are long; print with ''\n'' and a fast stream. If multiple answers are valid the checker accepts any — but "any valid" still requires validity: write a tiny checker in your brute force and stress test your construction against it for random small inputs.

:::seerc
Recent SEERC sets have had 3–4 constructive/ad-hoc problems, including the easiest and some of the hardest ones. Learning to attack them systematically (small cases → pattern → invariant → proof) is the biggest lever a beginner team has. Practice: [[problem:cf-1352G]], [[problem:cf-1367B]], [[problem:cf-1497C2]], [[problem:cf-1594C]].
:::
` };

LESSONS['interactive'] = { md: String.raw`
## What is different
Instead of reading all input up front, your program asks **queries**, the judge answers, and you must find the hidden answer within a query limit. The algorithmic content is usually binary search, bit-by-bit reconstruction, or a clever elimination strategy; the *implementation* content is about I/O discipline.

## The rules of I/O
- **Flush after every query**: ''cout << "? " << x << endl;'' (''endl'' flushes) or ''cout.flush()'' / ''fflush(stdout)''. Without a flush your question sits in a buffer and the judge waits forever → "Idleness limit exceeded".
- Read the answer with normal ''cin >>''. Handle a "−1" response (you already lost) by exiting immediately.
- Do not use ''sync_with_stdio(false)'' together with C-style I/O; pick one family. Fast I/O is rarely needed in interactive problems.
- Count your queries; stop and print the answer before exceeding the limit.
- Testing locally: write a tiny "judge" program, or run your solution manually typing responses, or use two terminals with named pipes. Codeforces provides an interactor in many problems' statements — read it.

## Typical strategies
- **Binary search**: hidden number in [1, n] with "is x ≤ k?" answers → ⌈log₂ n⌉ queries; 10⁹ needs 30, 10¹⁸ needs 60 ([[problem:cses-2189]] is not interactive, but the skeleton in the Cheat Sheet is).
- **Bit by bit**: queries returning XOR/AND/OR of pairs let you recover values one bit or one element at a time.
- **Find the maximum / a special element** with comparison queries: tournament style, n − 1 comparisons.
- **Adaptive judges**: the hidden value may not be fixed in advance — it is chosen consistently with all your previous answers. Your strategy must be correct in the worst case, not on average.
- **Randomization**: when the judge is *not* adaptive, random probes plus a bound on failure probability are legitimate.

## Query-budget arithmetic
Given a limit L, ask: what information do I need (log₂ of the number of possible answers)? Each yes/no query gives at most one bit. If L is 2·log₂ n you have slack for a two-phase strategy; if L is exactly ⌈log₂ n⌉, the search must be perfectly tight — ternary search on integers is *not* fine.

~~~cpp
int lo = 1, hi = n;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    cout << "? " << mid << endl;                 // flush!
    string ans; cin >> ans;                      // e.g. "YES" if hidden <= mid
    if (ans == "YES") hi = mid; else lo = mid + 1;
}
cout << "! " << lo << endl;
~~~

:::pitfall Mistakes that end contests
Missing flush; off-by-one in the query count; printing the final answer with the wrong prefix; reading with ''getline'' after ''>>''; assuming a fixed hidden value when the judge is adaptive.
:::

:::seerc
Interactive problems appear occasionally at SEERC and other European regionals. They are a gift to teams who practised the I/O discipline and a trap for those who did not. Solve two or three on Codeforces (filter by the "interactive" tag) before December.
:::
` };
