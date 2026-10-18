/* Lessons — data structures: segment tree & sparse table, Fenwick, lazy propagation, sqrt/Mo, persistent & treap, advanced DS. */
window.LESSONS = window.LESSONS || {};

LESSONS['segment-tree'] = { md: String.raw`
## What it does
Point update and range query over an array in O(log n) each, for **any associative operation** (sum, min, max, gcd, XOR, matrix product, "best subarray sum" structs). Build in O(n). It is the workhorse data structure of competitive programming.

## The structure
A binary tree over index ranges: the root covers [0, n), children split the range in half, leaves are single elements. Node i has children 2i and 2i+1. A query [l, r) decomposes into O(log n) nodes whose ranges tile it exactly. Watch [[viz:segment-tree]]: the highlighted nodes are the decomposition.

## Iterative version (bottom-up, half-open queries)
~~~cpp
int n; vector<long long> t;                 // size 2n, leaves at t[n..2n)
void build(const vector<long long>& a) { n = a.size(); t.assign(2 * n, 0);
    for (int i = 0; i < n; i++) t[n + i] = a[i];
    for (int i = n - 1; i > 0; i--) t[i] = t[2 * i] + t[2 * i + 1]; }
void set(int i, long long v) { for (t[i += n] = v; i > 1; i >>= 1) t[i >> 1] = t[i & ~1] + t[i | 1]; }
long long query(int l, int r) {             // sum of [l, r)
    long long resl = 0, resr = 0;
    for (l += n, r += n; l < r; l >>= 1, r >>= 1) {
        if (l & 1) resl = resl + t[l++];
        if (r & 1) resr = t[--r] + resr;
    }
    return resl + resr;
}
~~~
Short, fast, works for any n. For min: replace + with min and 0 with +∞. Generic template ''segment-tree-iterative''.

## Recursive version (top-down, inclusive)
Node covers [l, r]; ''update(node, l, r, pos, v)'' and ''query(node, l, r, ql, qr)'' recurse into children, returning the identity when ranges do not intersect. Needs 4n nodes. Easier to extend with **tree walks**: "first index with prefix sum ≥ k" (go left if the left child has enough, else subtract and go right — O(log n)); "first position ≥ l with value ≥ x" ([[problem:cses-1143]]); k-th element of a multiset ([[problem:cses-1749]], [[problem:cses-2163]]). Template ''segment-tree-recursive''.

## Designing the node
Ask: *what information about a segment lets me merge two adjacent segments?* Examples:
- Maximum subarray sum: (total, best prefix, best suffix, best) — merge best = max(L.best, R.best, L.suffix + R.prefix) ([[problem:cses-1190]]).
- Number of matched brackets: (matched, unmatched '(', unmatched ')') ([[problem:cf-380C]]).
- Range gcd + count of minimum ([[problem:cf-474F]]).
- Longest run of equal elements: (left run, right run, best, length).
If the merge is associative, the segment tree works; if it also needs an *inverse*, a Fenwick tree suffices.

## Sparse table: static RMQ in O(1)
For **idempotent** operations (min, max, gcd, AND, OR) on an array that never changes: ''t[k][i]'' = min of the 2ᵏ elements starting at i. Query [l, r]: k = ⌊log₂(r − l + 1)⌋, answer = min(t[k][l], t[k][r − 2ᵏ + 1]) — the two blocks may overlap, which is fine for idempotent ops. O(n log n) memory/build, O(1) query. [[viz:sparse-table]]. Use it for LCA via Euler tour and for tight-time-limit static RMQ ([[problem:cses-1647]]).

## Segment tree over values (frequency tree)
Index the tree by *value* instead of position: leaf v stores how many times v occurs. Then k-th smallest / count of elements ≤ x / insert / erase are all O(log C) after coordinate compression. This is the standard trick for order statistics and inversions ([[problem:cses-1144]], [[problem:cses-2169]]).

## 2D and beyond
Segment tree of segment trees (or Fenwick of Fenwicks) for n, m ≤ 1000; for sparse points use offline sweeps instead ([[topic:advanced-ds]]).

:::pitfall
Query bounds half-open vs inclusive mixed up; identity element wrong for min/max (use LLONG_MAX/LLONG_MIN, not 0); array size (2n iterative with any n; 4n recursive); non-commutative merges (matrices) need the left/right accumulator trick in the iterative version; forgetting long long.
:::

:::seerc
Segment trees are in almost every SEERC set, often hidden inside a sweep or a DP. Aim to write the iterative sum/min tree in under two minutes and to design a custom merge without hesitation.
:::
` };

LESSONS['fenwick'] = { md: String.raw`
## Fenwick tree (binary indexed tree)
Prefix sums with point updates in O(log n), 10 lines, tiny constant. Index i (1-based) stores the sum of the ''lowbit(i) = i & -i'' elements ending at i.
~~~cpp
vector<long long> t(n + 1);
void add(int i, long long v) { for (; i <= n; i += i & -i) t[i] += v; }
long long prefix(int i) { long long s = 0; for (; i > 0; i -= i & -i) s += t[i]; return s; }
long long sum(int l, int r) { return prefix(r) - prefix(l - 1); }
~~~
[[viz:fenwick]] shows which cells an update touches and which a query reads. Requires an **invertible** operation (sum, XOR, counts) — no min/max.

## Standard applications
- Dynamic range sums ([[problem:cses-1648]]).
- **Counting inversions**: scan left to right, count previously seen values greater than a[i] with a prefix query over compressed values ([[problem:cf-1208D]] style problems).
- **Order statistics**: insert values as counts; k-th smallest by descending on powers of two (''kth'' in the template, O(log n)); "how many ≤ x" = prefix(x).
- **Range update, point query**: store the difference array in the BIT ([[problem:cses-1651]]).
- **Range update, range query**: two BITs (B1 for coefficients, B2 for constants) — or a lazy segment tree if you prefer clarity.
- **Offline 2D counting**: sort points by x, sweep, BIT over y ([[topic:advanced-ds]]).
- **Distinct values in ranges** offline: keep only the latest occurrence of each value marked ([[problem:cses-1734]]).
- **2D BIT** for n, m ≤ 2000 ([[problem:cses-1739]]).

## Fenwick vs segment tree
Fenwick: shorter, faster, less memory, prefix/invertible operations only, no walks except the k-th trick. Segment tree: any associative merge, range updates with lazy, tree walks. If a problem says "sum" or "count" with point updates, the BIT is the right default.

## Implementation details
- 1-indexed internally; wrap your 0-indexed positions with +1.
- Values can be negative; the k-th-element trick needs non-negative counts.
- Compress coordinates first when values are large.
- Resetting between test cases: ''fill'' the vector, O(n), or track touched indices.

:::seerc
Any "count pairs (i < j) with a[i] > a[j]"-flavoured statement or "process events in order of x and count what happened before" is a BIT problem. It is the most frequently *used* structure in SEERC solutions after arrays and sorting.
:::
` };

LESSONS['lazy-segment-tree'] = { md: String.raw`
## Range updates need laziness
Updating every element of a range is O(n). Instead, when an update covers a node’s whole range, store it as a **pending tag** on that node and update the node’s aggregate immediately; push the tag to the children only when a later operation needs to look inside. Each update/query still touches O(log n) nodes.

## Range add, range sum
~~~cpp
void apply(int node, int l, int r, long long v) { t[node] += v * (r - l + 1); lz[node] += v; }
void push(int node, int l, int r) {
    if (lz[node]) { int m = (l + r) / 2; apply(2*node, l, m, lz[node]); apply(2*node+1, m+1, r, lz[node]); lz[node] = 0; }
}
void update(int node, int l, int r, int ql, int qr, long long v) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { apply(node, l, r, v); return; }
    push(node, l, r); int m = (l + r) / 2;
    update(2*node, l, m, ql, qr, v); update(2*node+1, m+1, r, ql, qr, v);
    t[node] = t[2*node] + t[2*node+1];
}
~~~
Query is symmetric: push before descending. [[viz:lazy-segment-tree]] shows tags being created and pushed. Template ''lazy-segment-tree''.

## Other combinations
| Update | Query | Node stores | apply(v) |
|---|---|---|---|
| add v | sum | sum | sum += v·len; lazy += v |
| add v | min / max | min | min += v; lazy += v |
| assign v | sum | sum | sum = v·len; tag = v (with a "has tag" flag) |
| assign v | min | min | min = v |
| add v (arith. progression) | sum | sum | sum += a·len + d·len(len−1)/2 ([[problem:cses-1736]]) |
| multiply & add (affine x → a·x + b) | sum | sum | sum = a·sum + b·len; compose tags (a₂a₁, a₂b₁ + b₂) |
| flip bits | count of ones | ones | ones = len − ones |

The rule: the tag must be **composable** (two tags in sequence = one tag) and **applicable to the aggregate without looking at the elements**. Assign overrides a pending add; an add after an assign modifies the assigned value ([[problem:cses-1735]]).

## Segment tree beats (overview)
"Set a[i] = min(a[i], x) on a range" with range sums: store max, second max and count of max; an update that only affects the maximum is O(1) per node, otherwise recurse. Amortized O(log² n). Know it exists; look it up when needed ([[topic:advanced-ds]]).

## Debugging lazy trees
Write a brute force and stress test with tiny n (≤ 8) and random operations — lazy bugs are invisible on samples. Check: push before *every* descent (update and query), recompute the parent after children change, apply updates the aggregate *and* the tag.

:::seerc
Range-update problems appear in most SEERC sets, sometimes as the core (Polynomial Queries style), sometimes as a tool inside a sweep. Learn range add/sum and range assign/sum cold; derive the others from the table when needed.
:::
` };

LESSONS['sqrt-mo'] = { md: String.raw`
## Meet in the middle
Split the input into two halves, enumerate all possibilities for each (2^(n/2) each), then combine with sorting/hashing/two pointers. Turns 2⁴⁰ into 2·2²⁰ + matching.
:::example Subset sum equal to x, n ≤ 40 (CSES Meet in the Middle)
Enumerate all 2²⁰ sums of the first half into vector A, of the second half into B; sort B; for each a in A count occurrences of x − a in B with binary search (or hash map). O(2^(n/2) · n).
:::
Also: "four values with sum x" ([[problem:cses-1642]]) via pair sums, bidirectional BFS for shortest paths in huge implicit graphs, and "half the string / half the digits" enumerations.

## Sqrt decomposition
Split an array into blocks of size B ≈ √n. Keep an aggregate per block. A range query touches ≤ 2 partial blocks (O(B) elements) and ≤ n/B whole blocks: O(√n) per query and O(1) or O(√n) per update. Less powerful than a segment tree for sums but far more flexible: any per-block aggregate you can recompute in O(B) works (e.g. sorted blocks for "count elements < x in a range with updates", mode of a range, "number of elements equal to x").

## Mo’s algorithm (offline range queries)
When you can maintain the answer for a window [L, R] under **adding or removing one element** in O(1) (or O(log)), Mo’s algorithm answers q arbitrary range queries offline in O((n + q)√n) moves: sort queries by (block of L, then R — alternating direction per block), move the two pointers between consecutive queries. Distinct values in a range, mode, number of pairs with equal values, sum of squares of frequencies ([[problem:cses-1734]] alternative). Template ''mo-algorithm''. Variations: Mo with updates (O(n^(5/3))), Mo on trees (Euler tour).

## The heavy/light threshold
Elements that appear more than √n times are "heavy" — there are at most √n of them; handle them with precomputation (prefix counts), handle light ones with brute force bounded by √n. Same idea for degrees in graphs (counting triangles in O(m√m)), for "small k" vs "large k" query splits, and for strings (short vs long patterns).

## Sqrt on values / time
- Process queries in batches of size √q, rebuilding a static structure between batches (when the structure supports fast queries but no updates).
- Precompute answers for all multiples of √n ("jump pointers") to answer "k steps" queries in O(√n) with O(n√n) memory.

## When to reach for √n
The constraints say n, q ≤ 10⁵ with a 3–4 second limit, and the "obvious" segment tree fails because the operation is not associative (mode, distinct count, "k-th in range with updates"). O(n√n) ≈ 3·10⁷ is comfortable; O(n√n log n) ≈ 5·10⁸ is not.

:::pitfall
Choosing block size without thinking (B = n/√q is better than √n when q ≪ n); forgetting the odd-even trick for R (halves the constant); Mo’s add/remove order producing a negative window (extend before shrinking: R++ then L−−, then L++, R−−).
:::

:::seerc
Meet in the middle is a genuine SEERC regular (n ≤ 40 is the tell). Mo’s and sqrt decomposition appear less often but rescue problems when you cannot find the clever O(n log n) solution — that pragmatic value matters in a 5-hour contest.
:::
` };

LESSONS['persistent-treap'] = { md: String.raw`
## Persistent segment tree
A point update normally overwrites O(log n) nodes. Instead, **copy** those nodes and leave the old ones intact: the new root describes the new version, the old root the old version, and they share everything else. Memory O(log n) per update, versions in O(1).
Uses:
- **k-th smallest in a[l..r]** with no updates: version i = frequency tree of a[0..i−1]; answer with roots r and l by walking down comparing counts (template ''persistent-segtree'').
- "Count values ≤ x in a range" similarly.
- Range queries on *historical* versions: "copy the array as it was at time t, then continue" ([[problem:cses-1737]]).
- Functional data structures for DP over "number of distinct values in prefixes", offline 2D dominance counting.

## Treaps
A binary search tree where each node has a random priority; the tree is a heap on priorities. Expected depth O(log n) with no balancing code — only two operations: ''split(t, key)'' and ''merge(a, b)''.
### Implicit treap (sequence by position)
Replace the key with the subtree size: node i is the i-th element. Then in O(log n): insert/erase at any position, split a sequence, concatenate, **reverse a range** (lazy flag), range sums/min via stored aggregates, move a block to the end ([[problem:cses-2072]], [[problem:cses-2073]], [[problem:cses-2074]]). Template ''treap-implicit''. This is the tool for "cut and paste" string/array problems that a segment tree cannot do.

## Other order-statistic structures
- **Merge sort tree**: segment tree whose nodes hold sorted vectors; count ≤ x in a range in O(log² n); no updates; O(n log n) memory.
- **Wavelet tree**: k-th smallest, count ≤ x, count in value range — O(log C) per query, more code.
- **pb_ds ordered set**: k-th and rank for a single dynamic set (not per range).
- **Fenwick of sorted values (offline)**: for range k-th with no updates, also fine: sort queries by value threshold and binary search — parallel binary search ([[topic:advanced-ds]]).

## Choosing
| Need | Structure |
|---|---|
| k-th smallest in [l, r], no updates | persistent segment tree (or merge sort tree / wavelet) |
| range queries on old versions | persistent segment tree |
| insert/erase in the middle, reverse ranges, cut & paste | implicit treap |
| a single set with k-th / rank | pb_ds tree or BIT over values |

:::pitfall
Vector reallocation invalidating pointers in persistent trees (reserve, or copy the node before pushing); forgetting to push the lazy reverse before split/merge in treaps; using recursion depth proportional to n (treaps are fine in expectation; persistent trees are log-deep).
:::

:::seerc
Tier-3: these structures solve one hard problem every few years. Understand *what* they enable so you recognise the problem type; keep the templates printed.
:::
` };

LESSONS['advanced-ds'] = { md: String.raw`
## Dynamic (sparse) segment tree
Indices up to 10¹⁸? Allocate nodes only when touched: each update creates O(log C) nodes. Alternative: collect all coordinates offline and compress. A dynamic tree is also how you get "a segment tree per node" (merging small ones into large ones: segment tree merging, O(n log C) total).

## Offline is a superpower
- **Sweep + BIT**: rectangle/point counting ("how many points with x ≤ a and y ≤ b") by sorting events by x and querying a BIT over y. Dominance counting, inversions in 2D, "count queries" on static data.
- **Sort queries by a threshold**: process elements and queries in increasing order of value/time so the "≤ x" condition becomes "already inserted".
- **Parallel binary search**: many queries each ask "the first time t at which condition holds"; instead of one binary search each (with an expensive check), binary search all queries simultaneously: in each of O(log T) rounds, sweep the timeline once, evaluating every query at its current midpoint. O((n + q) log T · cost of sweep).
- **CDQ divide & conquer** (offline dynamic problems): split operations by time, handle "left half updates affect right half queries" with a sweep — e.g. 3D dominance, dynamic inversions.
- **Segment tree over time** + rollback DSU: offline dynamic connectivity ([[topic:advanced-graphs]]).

## Segment tree beats
Range chmin/chmax with range sum: keep (max, second max, count of max); a chmin(x) with second max < x < max updates the node in O(1); otherwise recurse. Amortized O(log² n). Also handles range add simultaneously. Recognise: "set each element to min(element, x) over a range" with sums.

## 2D structures
- 2D prefix sums / 2D BIT (n, m ≤ 2000) for static-ish grids.
- Segment tree of BITs / BIT of sorted vectors for offline dominance with updates (O(log² n) per op, memory O(n log n)).
- k-d trees and quadtrees are rarely worth it at regional level.

## Sqrt tree, disjoint sparse table
O(1) range queries for any associative op (not only idempotent): disjoint sparse table (O(n log n) build). Useful when q is huge and the op is a product of matrices or a non-idempotent monoid.

## Data-structure sanity checklist
1. Is the operation associative? (segment tree) Invertible? (BIT/prefix) Idempotent? (sparse table)
2. Are there updates? Point or range? (lazy)
3. Are queries online or can they be sorted? (offline sweeps)
4. Is the domain huge? (compress or dynamic tree)
5. Is the answer monotone in some parameter? (binary search / parallel binary search)

:::seerc
Advanced structures decide the last problem of a set; offline thinking (sorting queries, sweeping, parallel binary search) is far more valuable than any single exotic structure and often replaces it.
:::
` };
