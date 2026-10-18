/* Lessons — Tier 0: Foundations. Markdown in String.raw templates; code fences use ~~~cpp, inline code uses ''code''. */
window.LESSONS = window.LESSONS || {};

LESSONS['cpp-basics'] = { md: String.raw`
## Why this lesson exists
Almost every SEERC team codes in C++. Not because it is pretty, but because it is fast, the standard library has the containers you need, and every editorial and template on the internet is written in it. You do not need to *master* C++. You need a small, reliable subset that never surprises you under pressure.

## The template you start every problem from
~~~cpp
#include <bits/stdc++.h>     // one header that includes everything (GCC only, fine on judges)
using namespace std;
using ll = long long;

int main() {
    cin.tie(nullptr)->sync_with_stdio(false);   // fast input/output — always
    int n;
    cin >> n;
    vector<ll> a(n);
    for (auto& x : a) cin >> x;
    ll total = 0;
    for (ll x : a) total += x;
    cout << total << '\n';                      // '\n', never endl (endl flushes = slow)
    return 0;
}
~~~
Learn this by heart. You will type it several hundred times before December.

## Integer types and overflow — the #1 beginner killer
| Type | Range (approx.) | Use it for |
|---|---|---|
| ''int'' | ±2.1 · 10⁹ | indices, counts up to 10⁹ |
| ''long long'' (''ll'') | ±9.2 · 10¹⁸ | sums, products, anything that can exceed 10⁹ |
| ''unsigned long long'' | 0 … 1.8 · 10¹⁹ | hashes (overflow wraps, no UB) |
| ''__int128'' | ±1.7 · 10³⁸ | products of two long longs (comparison, mod) |
| ''double'' | 15–16 significant digits | geometry, probabilities — only when unavoidable |

:::pitfall The silent overflow
''int n = 100000; long long s = n * (n + 1) / 2;'' is **wrong**: ''n * (n + 1)'' is computed in ''int'' (≈10¹⁰, overflow) *before* being stored in the long long. Write ''(long long)n * (n + 1) / 2'' or make ''n'' a long long. Overflow is undefined behaviour: the program may print garbage, or work on your machine and fail on the judge.
:::

Rules of thumb: the moment a value can exceed 2·10⁹, it is a ''long long''. When a product of two long longs is needed (a·b mod m with m ≈ 10¹⁸), use ''__int128''. Do all arithmetic in the wider type, then convert.

## Reading input reliably
- ''cin >> x'' returns false at end of file: ''while (cin >> x) { ... }'' reads everything.
- Mixing ''cin >> n'' and ''getline'' leaves a newline in the buffer; call ''cin.ignore()'' first.
- Huge input (10⁷ numbers)? Even fast cin may be too slow; use the fread reader from the Cheat Sheet.
- Never mix ''scanf/printf'' with ''cin/cout'' after ''sync_with_stdio(false)''.
- Output ''double'' with a fixed precision: ''cout << fixed << setprecision(9) << x;'' or ''printf("%.9f\n", x);''.

## Division, modulo and negative numbers
- ''/'' truncates toward zero: ''-7 / 2 == -3''. ''%'' keeps the sign of the dividend: ''-7 % 3 == -1''.
- Non-negative residue: ''((a % m) + m) % m''.
- Floor division for any sign: ''a / b - ((a % b != 0) && ((a < 0) != (b < 0)))''.
- Ceil division of positives: ''(a + b - 1) / b''.

## Small things that save contests
- ''1 << 40'' overflows (''1'' is an int). Write ''1LL << 40''.
- ''v.size()'' is unsigned: ''v.size() - 1'' on an empty vector is a huge number. Cast: ''(int)v.size()''.
- Arrays on the stack larger than a few MB crash. Use ''vector'' or a global array.
- ''#define int long long'' is a hack some people use; it works but hides intent and breaks ''main''’s return type (''signed main()''). Prefer ''ll'' explicitly.
- Compile locally with ''-Wall -Wextra -Wshadow -fsanitize=address,undefined -g'' while debugging. Sanitizers catch out-of-bounds and overflow with a precise message.

:::seerc
SEERC judges use GNU G++ (recent versions, C++17/20). ''bits/stdc++.h'', ''__int128'', ''__builtin_popcount'', ''__gnu_pbds'' are all available. Time limits are tuned for C++; Python solutions to the harder problems usually cannot pass.
:::

:::tip Practice routine for this lesson
Solve the five easiest CSES problems below with the template above, compiling locally with sanitizers. Then open [[page:playground|the Playground]], paste the sample input and check your output automatically.
:::
` };

LESSONS['complexity'] = { md: String.raw`
## The one number to remember
A judge executes roughly **10⁸ simple operations per second**. Tight loops over arrays run faster (up to 10⁹), code full of ''std::map'', modulo and pointer chasing runs slower (10⁷). Before writing any solution, estimate its operation count and compare with the time limit.

:::def Big-O in one sentence
O(f(n)) means “the number of steps grows like f(n), ignoring constant factors”. O(3n² + 10n) = O(n²). Only the fastest-growing term matters for large n.
:::

## Reading the constraints backwards
The constraints are the setter telling you the intended complexity. Memorise this table:

| Max n | Intended complexity | Typical techniques |
|---|---|---|
| ≤ 12 | O(n!) | permutations, brute force |
| ≤ 20 | O(2ⁿ · n) | bitmask over subsets, bitmask DP |
| ≤ 40 | O(2^(n/2)) | meet in the middle |
| ≤ 100 | O(n⁴) | quadruple loops, small DP |
| ≤ 500 | O(n³) | Floyd–Warshall, interval DP, Gaussian elimination |
| ≤ 5 000 | O(n²) | pair loops, quadratic DP (LIS/LCS/edit distance) |
| ≤ 2·10⁵ | O(n log n) or O(n√n) | sorting, binary search, segment trees, Dijkstra, Mo’s |
| ≤ 10⁶ | O(n) or O(n log n) with a small constant | sieve, prefix sums, two pointers, linear DP |
| ≤ 10⁷ | O(n) with tight code | sieve, simple loops, fast I/O |
| ≤ 10⁹ | O(√n) or O(log n) | trial division, binary search on the answer, digit DP |
| ≤ 10¹⁸ | O(log n) or O(1) | fast exponentiation, matrix power, formulas |

When two parameters appear (n cities, m roads; n rows, m columns), look at the product or the sum: n·m ≤ 10⁶ means O(nm) is intended; n, m ≤ 2·10⁵ separately means O((n + m) log n).

## Complexities of things you use every day
| Operation | Cost |
|---|---|
| ''sort'' of n elements | O(n log n) |
| ''lower_bound'' on a sorted vector, ''set''/''map'' insert/find/erase | O(log n) |
| ''unordered_map'' insert/find | O(1) average (O(n) worst case under attack) |
| ''priority_queue'' push/pop | O(log n) |
| ''vector::push_back'' | O(1) amortized |
| ''vector::insert'' / ''erase'' in the middle | O(n) |
| ''string'' concatenation ''s += c'' | O(1) amortized; ''s = s + c'' is O(n)! |
| Fenwick / segment tree query or update | O(log n) |
| DSU find/union | ~O(1) (α(n)) |
| Euclid’s gcd | O(log min(a, b)) |

## Memory limits too
A typical limit is 256 MB. ''vector<int>'' of 10⁷ = 40 MB fine; ''vector<long long>'' of 10⁸ = 800 MB not fine; a 5000 × 5000 ''int'' matrix = 100 MB borderline; ''bool'' arrays are 1 byte per element, ''bitset'' 1 bit.

## Worked examples
:::example n ≤ 2·10⁵, count pairs (i, j) with a[i] + a[j] = k
Brute force: n²/2 = 2·10¹⁰ pair checks — hopeless. Sort (n log n) and use two pointers (n), or a hash map (n). Total ≈ 4·10⁶ steps.
:::
:::example n ≤ 300, shortest paths between all pairs
n³ = 2.7·10⁷ — Floyd–Warshall’s triple loop passes comfortably, no need for n Dijkstras.
:::
:::example n ≤ 10⁵, q ≤ 10⁵ queries “sum of a[l..r]” with updates
Per query O(n) → 10¹⁰: TLE. Need O(log n) per operation → Fenwick tree: 2·10⁵ · 17 ≈ 3.4·10⁶.
:::

:::pitfall Constants matter at the boundary
O(n²) with n = 10⁴ is 10⁸ — passes in a simple loop, fails if the inner body uses ''map'' or modulo. O(n log² n) with n = 2·10⁵ ≈ 6·10⁷ — fine. When in doubt, use the [[page:tools|complexity calculator]] and prefer the algorithm with slack.
:::

Practice: do the [[page:practice/complexity|complexity drill]] until you never hesitate.
` };

LESSONS['problem-solving'] = { md: String.raw`
## The process (do this every single time)
Strong competitors do not “see” solutions by magic. They run the same routine so consistently that it looks like magic. Here is the routine.

### 1. Read for structure, not for story
SEERC statements come wrapped in a story (ogres, swamps, donkeys — see SEERC 2024). Strip it:
- What is the **input**? Sizes, ranges, guarantees (“distinct”, “connected”, “n is even”).
- What is the **output**? One number? Any valid construction? Modulo 10⁹+7? “−1 if impossible”?
- Restate the task in one sentence in your own words. If you cannot, you have not understood it.

### 2. Solve the samples by hand
Not “check that the sample output is right” — actually produce it yourself. This exposes misreadings immediately (1-indexed? inclusive ranges? multiple test cases?).

### 3. Write the brute force in your head
“Try every subset / every pair / simulate every step.” Its complexity is your starting point: if brute force is O(n²) and n ≤ 5000, you are *done* — code it. If n = 2·10⁵, you now know exactly which step must become O(log n) or O(1).

### 4. Look for the observation
Tools, in the order to try them:
- **Small cases.** Compute answers for n = 1..6 by hand or with the brute force. Patterns (parity, periodicity, a formula) jump out.
- **Extremal element.** What must be true of the largest / smallest / first / last element? Often it forces a structure.
- **Invariant.** What quantity never changes under the allowed operation (sum mod 2, number of inversions mod 2, gcd, a colouring)? Invariants prove impossibility.
- **Reformulate.** Array → prefix sums; pairs (i, j) → count per value; “exists” → maximum; graph? tree? bipartite?
- **Reverse the process.** Deletions become insertions; final state back to initial state; “last player” games.
- **Binary search on the answer.** Is “can we achieve ≥ x?” easier than “what is the maximum?” and monotone?

### 5. Prove it — at least convince yourself
A 30-second argument (“exchange any two elements in an optimal solution and it does not get worse”) prevents a 20-minute penalty. If you cannot argue why it works and cannot break it in 2 minutes of trying, you are gambling. Sometimes gambling is correct (easy problem, cheap to test); know that you are doing it.

### 6. Plan the code before typing
Write down: data structures, the main loop, the edge cases (n = 1, empty answer, everything equal). Then type in one go.

### 7. Test, then submit
Samples + one tiny hand-made case + one edge case. If wrong: read the statement again before debugging.

:::example A worked mini-example
*“Given n ≤ 2·10⁵ integers, count pairs with a[i] − a[j] = k.”*
Brute force O(n²): too slow. Reformulate: pairs with a[i] = a[j] + k — for each value v, count[v] · count[v + k]. A map of counts: O(n log n). Edge case: k = 0 → pairs within the same value, C(count, 2). Done in 3 minutes because each step was routine.
:::

## When stuck
- 10 minutes without progress: re-read the statement, check you are not solving a harder problem than asked.
- 25 minutes: write the brute force for tiny n and stare at outputs.
- 40 minutes (in a contest): **switch problems**. Write your ideas down first. Sunk cost is the most expensive bias in ICPC.

## After the contest
Upsolving — solving the problems you failed, with the editorial — is where most improvement happens. Read the editorial only until the key idea, then implement it yourself without looking.

:::seerc
SEERC sets have 12–13 problems and 5 hours. Nobody solves them all. The skill this lesson trains — quickly classifying each problem as “I know exactly how”, “I have a promising idea”, “no idea” — decides the whole contest. The [[page:practice/drills|technique drills]] in this app exist for exactly that reflex.
:::
` };

LESSONS['stl'] = { md: String.raw`
## The containers you actually need
| Container | Ordered? | Access | Insert/erase | Use for |
|---|---|---|---|---|
| ''vector<T>'' | by index | O(1) | O(1) at back, O(n) elsewhere | almost everything |
| ''deque<T>'' | by index | O(1) | O(1) both ends | sliding windows, 0-1 BFS |
| ''set<T>'' / ''multiset<T>'' | sorted | O(log n) find | O(log n) | ordered unique/duplicate values, predecessor/successor queries |
| ''map<K, V>'' | sorted by key | O(log n) | O(log n) | counting, key → value with order |
| ''unordered_map<K, V>'' | none | O(1) avg | O(1) avg | fast counting when order does not matter (beware hacks) |
| ''priority_queue<T>'' | max at top | O(1) top | O(log n) | Dijkstra, greedy “take the best next” |
| ''stack<T>'' / ''queue<T>'' | LIFO / FIFO | O(1) | O(1) | DFS / BFS (a vector works as a stack too) |
| ''bitset<N>'' | by index | O(1) | — | subset-sum DP, adjacency as bits, 64× speedups |
| ''string'' | by index | O(1) | O(1) append | text; ''+='' is fine, repeated ''s = s + c'' is O(n²) |

## Patterns worth memorising
~~~cpp
vector<int> v = {5, 3, 9, 3, 1};
sort(v.begin(), v.end());                                   // 1 3 3 5 9
sort(v.rbegin(), v.rend());                                 // descending
v.erase(unique(v.begin(), v.end()), v.end());               // remove duplicates (after sorting)
int idx = lower_bound(v.begin(), v.end(), 4) - v.begin();   // first index with v[idx] >= 4
int cnt = upper_bound(v.begin(), v.end(), 3) - lower_bound(v.begin(), v.end(), 3);  // how many 3s
reverse(v.begin(), v.end());
int mx = *max_element(v.begin(), v.end());
long long sum = accumulate(v.begin(), v.end(), 0LL);        // 0LL! otherwise the sum is an int
iota(v.begin(), v.end(), 0);                                // 0 1 2 3 ...
~~~

~~~cpp
// custom sort: by second descending, ties by first ascending
sort(p.begin(), p.end(), [](const pair<int,int>& a, const pair<int,int>& b) {
    if (a.second != b.second) return a.second > b.second;
    return a.first < b.first;
});
~~~

~~~cpp
set<int> s = {1, 4, 9};
auto it = s.lower_bound(5);        // iterator to 9 (first element >= 5)
if (it != s.begin()) --it;         // now the largest element < 5, i.e. 4
s.erase(it);                       // erase by iterator (erasing by value in a multiset removes ALL copies)
~~~

~~~cpp
priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;   // min-heap
pq.push({dist, node});
auto [d, u] = pq.top(); pq.pop();
~~~

~~~cpp
map<string, int> cnt;
for (auto& w : words) cnt[w]++;          // operator[] inserts 0 if missing
for (auto& [word, c] : cnt) cout << word << ' ' << c << '\n';   // sorted by key
if (cnt.count("abc")) ...                // check existence WITHOUT inserting
~~~

## Rules that prevent disasters
- **Comparators must be strict**: return ''a < b'', never ''a <= b''. A non-strict comparator is undefined behaviour and can crash ''sort''.
- **Iterators invalidate**: ''push_back'' can move the whole vector; erasing from a ''set'' while iterating needs ''it = s.erase(it)''.
- ''unordered_map'' on Codeforces-style judges can be attacked with colliding keys → O(n²). Use a custom hash or plain ''map''; call ''reserve'' for speed.
- ''vector<bool>'' is a bit-packed special case; use ''vector<char>'' if you need real bytes or references.
- Prefer ''emplace_back'' / structured bindings (''auto [a, b] = p;'') for readability under time pressure.

## Useful extras
- ''__gnu_pbds::tree'' — an ordered set with **k-th element** and **count of smaller elements** in O(log n). Template in the Cheat Sheet.
- ''bitset<N>::count()'', ''_Find_first()'', ''_Find_next(i)'' — iterate set bits fast.
- ''nth_element(v.begin(), v.begin() + k, v.end())'' — k-th smallest in O(n).
- ''__builtin_popcountll'', ''__builtin_ctzll'', ''__builtin_clzll'' — bit tricks in one instruction.
- ''string_view'' for substring comparisons without copying (C++17).

:::recognize
“Maintain a collection with insertions, deletions and *smallest element ≥ x*” → ''set''. “k-th smallest with updates” → pb_ds tree or Fenwick tree. “Repeatedly take the largest” → ''priority_queue''. “Membership tests only” → sorted vector + binary search or hash set.
:::

:::seerc
SEERC problems are rarely about the STL, but nearly every solution leans on it. A team that fumbles ''lower_bound'' semantics under pressure loses 20 minutes on a problem everybody solves. Drill the patterns above until they are muscle memory — the quiz for this topic tests exactly those semantics.
:::
` };

LESSONS['implementation'] = { md: String.raw`
## Implementation problems are not “easy” problems
Every SEERC has 2–3 problems where the algorithm is obvious and the whole difficulty is writing 80 lines of code with zero mistakes: simulate a process, follow a long list of rules, parse a format. Teams lose them through carelessness, not lack of knowledge.

## Writing code that is correct the first time
1. **Name things.** ''rows'', ''cols'', ''cur'', ''best'' beat ''a'', ''b'', ''c''. Off-by-one bugs hide behind bad names.
2. **One idea per line.** Long clever expressions are where ''<'' becomes ''<='' unnoticed.
3. **Half-open ranges everywhere** (''[l, r)'') unless the problem forces inclusive ones. Length = r − l, no +1s.
4. **Direction arrays** for grids: ''int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};'' and a bounds check function ''inside(r, c)''.
5. **Compute, do not track.** If a value can be recomputed cheaply, recompute it instead of maintaining it incrementally (fewer states to get wrong).
6. **Write the edge cases first** (n = 1, empty input, all equal) as ''if'' statements at the top when they need special output.

## Debugging in five minutes instead of fifty
- Add the debug macro from the Cheat Sheet: ''dbg(x)'' prints ''x = value'' to stderr only with ''-DLOCAL''. Leave the calls in; the judge never sees them.
- Print state at the *boundary* of the suspected region, not everywhere.
- Sanitizers: ''-fsanitize=address,undefined'' turns silent memory corruption into a stack trace.
- Rubber-duck: explain the code line by line to a teammate (or out loud). The bug usually surfaces before you finish.

## Stress testing — the skill that separates levels
When samples pass and the judge says WA, do not stare. Stress test:
1. ''gen.cpp'' prints one small random test (n ≤ 6, values ≤ 5). Small tests find bugs fast and are easy to debug.
2. ''brute.cpp'' solves the problem in the dumbest correct way (try everything).
3. A loop runs both on the same input and stops on the first difference.

~~~cpp
// gen.cpp — seed from argv so every iteration differs
#include <bits/stdc++.h>
using namespace std;
int main(int argc, char** argv) {
    mt19937 rng(argc > 1 ? atoi(argv[1]) : 1);
    auto rnd = [&](int lo, int hi) { return (int)(rng() % (hi - lo + 1)) + lo; };
    int n = rnd(1, 6);
    cout << n << "\n";
    for (int i = 0; i < n; i++) cout << rnd(1, 5) << " ";
    cout << "\n";
}
~~~
The [[page:playground?tab=stress|Playground stress tab]] runs this loop for you with the local compiler. The Cheat Sheet also has ''stress.bat''/''stress.sh'' for the command line.

:::tip What to do with the failing case
It is tiny, so trace it by hand. Compare your intermediate values with what they *should* be. Nine times out of ten the bug is an off-by-one, an uninitialized value, or a wrong assumption about the input (“values are distinct” — no they are not).
:::

## Edge-case checklist (tape it to the monitor)
- n = 1, n = 2; empty string; single character.
- All elements equal; strictly increasing; strictly decreasing.
- Maximum values → overflow; minimum values → negative numbers, zeros.
- Answer is 0 / empty / “NO” / −1.
- Multiple test cases: did you **reset every global** between cases? (The most common WA in multi-test problems.)
- Output format: exact spacing, trailing newline, ''YES''/''Yes'' case, floating precision.

## Speed without bugs
- Type your template from memory. Time yourself: under 30 seconds.
- Write the whole solution, then compile once. Fixing 5 compile errors at once is faster than compile-fix cycles.
- Read compiler errors top-down; only the first one matters.

:::seerc
In an ICPC team the person coding is the bottleneck. A clean implementation habit means the other two can verify while you type, and a wrong answer costs the team a 20-minute penalty. Stress testing at a contest is realistic for simple brute forces (5 minutes to write) and has saved countless medals.
:::
` };

LESSONS['math-basics'] = { md: String.raw`
## Integer arithmetic you must own
### gcd and lcm
~~~cpp
long long g = __gcd(a, b);            // or std::gcd in <numeric> (C++17)
long long l = a / g * b;              // divide first: a * b may overflow
~~~
Euclid’s algorithm is O(log min(a, b)). Properties used in problems: gcd(a, b) = gcd(a − b, b); gcd of a range shrinks at most log(max) times as the range grows (the “at most 30 distinct gcds” trick); gcd(a, b) · lcm(a, b) = a · b.

### Division and rounding
- Floor for positives: ''a / b''. Ceil: ''(a + b - 1) / b''.
- Rounding to nearest: ''(2a + b) / (2b)'' for positives.
- Negative numbers: C++ truncates toward zero; write a ''floorDiv'' helper if you need mathematical floor.
- ''a % b'' with negative a is ≤ 0. Normalize with ''((a % b) + b) % b''.

### Sums and closed forms
- 1 + 2 + … + n = n(n+1)/2. Squares: n(n+1)(2n+1)/6. Cubes: (n(n+1)/2)².
- Arithmetic series: count · (first + last) / 2. Geometric: (rⁿ − 1)/(r − 1).
- Σ_{i=1}^{n} ⌊n/i⌋ has only O(√n) distinct values — group them (“division blocks”).
- Number of multiples of k in [l, r]: ''r/k − (l−1)/k''.

### Logarithms and digits
- Digits of n in base b: ⌊log_b n⌋ + 1 — but use a loop; floating logs are off by one at exact powers.
- log₂ 10⁹ ≈ 30, log₂ 10¹⁸ ≈ 60: this is why binary lifting tables have 30 or 60 rows.
- Halving repeatedly: log₂ n steps. Squaring repeatedly: log log n steps.

## Floating point: avoid, and if not, respect
- Doubles carry ~15–16 significant digits. Integers below 2⁵³ ≈ 9·10¹⁵ are exact; beyond that they are not.
- Never ''=='' on doubles: use ''fabs(a − b) < EPS'' with EPS ≈ 1e-9, or better, compare cross-multiplied integers (a/b < c/d ⇔ a·d < c·b for positive denominators).
- ''sqrt'' of a perfect square may return 2.9999999. Use ''long long r = sqrtl(x); while (r*r > x) r--; while ((r+1)*(r+1) <= x) r++;''.
- Print with ''printf("%.10f")'' or ''cout << fixed << setprecision(10)''. Check the required precision in the statement.
- ''long double'' gives ~18 digits at little cost on GCC — useful for geometry sums.

## Big numbers
- ''long long'' for anything up to 9·10¹⁸; ''unsigned long long'' up to 1.8·10¹⁹.
- ''__int128'' for comparing products a·b vs c·d or for (a · b) mod m with m ≈ 10¹⁸. Printing needs a helper (see Cheat Sheet).
- Truly big (10⁵ digits): usually the problem wants the answer modulo a prime; otherwise store digits in a vector and implement schoolbook addition/multiplication.

## Modular arithmetic (preview of [[topic:number-theory-1]])
Answers “modulo 10⁹+7” mean: keep every intermediate value reduced. ''(a + b) % M'', ''(a * b) % M'' (with a, b < M ≈ 10⁹, the product < 10¹⁸ fits in long long), ''(a − b + M) % M''. Division becomes multiplication by the modular inverse.

:::pitfall Common math slips
- ''pow(2, 10)'' returns a double; ''(int)pow(2, 10)'' can be 1023. Use ''1 << 10'' or integer loops.
- ''abs'' on long long: include ''<cstdlib>''; ''llabs'' or ''std::abs''.
- Comparing ''a / b'' as integers when you meant real division.
- Forgetting that ''%'' by zero crashes — check divisors coming from input.
:::

:::seerc
Math problems at SEERC are usually “find the formula” problems: brute force small cases, spot the closed form, prove it by induction or a combinatorial argument, output it modulo a prime. The [[viz:gcd]] visualizer shows Euclid’s algorithm step by step.
:::
` };
