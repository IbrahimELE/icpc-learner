/* Lessons — math: number theory I/II, combinatorics, matrix exponentiation, probability, game theory, linear algebra, FFT. */
window.LESSONS = window.LESSONS || {};

LESSONS['number-theory-1'] = { md: String.raw`
## Primes and factorization
### Sieve of Eratosthenes — O(n log log n)
~~~cpp
vector<bool> isPrime(N + 1, true);
isPrime[0] = isPrime[1] = false;
for (long long i = 2; i * i <= N; i++)
    if (isPrime[i]) for (long long j = i * i; j <= N; j += i) isPrime[j] = false;
~~~
Start crossing out at i² (smaller multiples were crossed by smaller primes). 10⁷ takes ~50 ms. Watch the [[viz:sieve]] visualizer.

### Smallest prime factor sieve — factorize in O(log x)
Store ''spf[x]'' = smallest prime dividing x. Then factorizing x is: divide by spf[x] repeatedly. With a linear sieve you get all primes and spf in O(n) (template in the Cheat Sheet). Use it whenever you must factorize *many* numbers ≤ 10⁷.

### Trial division — factorize one big number in O(√x)
~~~cpp
for (long long p = 2; p * p <= x; p++)
    while (x % p == 0) { factors.push_back(p); x /= p; }
if (x > 1) factors.push_back(x);       // remaining prime
~~~
Fine for x ≤ 10¹² once (10⁶ steps); for 10¹⁸ or many numbers use Pollard’s rho ([[topic:randomized-hashing]]).

### Divisors
From x = ∏ pᵢ^eᵢ: number of divisors ∏(eᵢ + 1), sum of divisors ∏(pᵢ^(eᵢ+1) − 1)/(pᵢ − 1). Enumerate divisors by recursion over the exponents. Facts: n ≤ 10⁶ has at most 240 divisors, n ≤ 10⁹ at most 1344, n ≤ 10¹⁸ about 10⁵. “For each d, over multiples of d” loops cost O(n log n) total — harmonic sum.

## Modular arithmetic
Problems say “answer modulo 10⁹+7” because the true answer is astronomically large. Keep every intermediate value in [0, M).
- Addition: ''(a + b) % M''. Subtraction: ''(a − b + M) % M''.
- Multiplication: ''a * b % M'' — a, b < M ≈ 10⁹ so the product < 10¹⁸ fits in ''long long''. Never multiply three residues without reducing in between.
- Division: **does not exist directly**. Multiply by the modular inverse.

### Fast exponentiation — O(log e)
~~~cpp
long long power(long long b, long long e, long long m) {
    long long r = 1; b %= m;
    while (e > 0) {
        if (e & 1) r = r * b % m;
        b = b * b % m;
        e >>= 1;
    }
    return r;
}
~~~
Square the base, halve the exponent; multiply into the result when the current bit is 1 ([[viz:fast-pow]]).

### Modular inverse
- If M is prime and a ≢ 0: Fermat’s little theorem a^(M−1) ≡ 1, so a⁻¹ = a^(M−2) mod M.
- If M is not prime: extended Euclid ([[topic:number-theory-2]]); the inverse exists iff gcd(a, M) = 1.
- Many inverses of 1..n at once: ''inv[1] = 1; inv[i] = M − (M / i) · inv[M % i] % M'' in O(n).
- Inverse factorials: compute ''inv_fact[n]'' once, then ''inv_fact[i−1] = inv_fact[i] · i''.

:::pitfall Classic modular bugs
Negative results from subtraction; ''%'' applied to an ''int'' product that already overflowed; forgetting to reduce after adding inside a loop (sums of 10⁵ values ≈ 10¹⁴ still fit, but products do not); using ''pow()'' (double) instead of integer fast power; dividing by 2 with ''/2'' instead of multiplying by the inverse of 2.
:::

## gcd tricks
- ''gcd(a, b) = gcd(b, a mod b)'' — O(log) steps ([[viz:gcd]]).
- gcd of a whole array in O(n log C). gcd of prefixes changes at most log C times: "count subarrays with gcd = g" is O(n log² C) by iterating distinct prefix gcds.
- Bezout: a·x + b·y = c solvable iff gcd(a, b) | c.
- lcm of many numbers overflows quickly — cap or take modulo when allowed.

## Counting with primes: a few standard results
- Number of primes ≤ n ≈ n / ln n (78 498 below 10⁶).
- Every number ≤ 10¹⁸ has at most 15 distinct prime factors; ≤ 10⁹ at most 9.
- Legendre: exponent of p in n! is Σ ⌊n/pᵏ⌋ ([[problem:cses-1618]]).
- Euler’s totient φ(n) = n ∏(1 − 1/p): count of numbers ≤ n coprime to n (more in [[topic:number-theory-2]]).

:::recognize
"Modulo 10⁹+7" → factorials/inverses; "how many divisors / sum of divisors" → factorize; "for each i, consider multiples" → harmonic loop; "is it prime" for x ≤ 10¹² → trial division, larger → Miller–Rabin; "gcd of a subarray" → log-distinct-values trick.
:::

:::seerc
Number theory shows up in most SEERC sets, usually disguised: a counting problem needing nCr mod p, a gcd-of-subarrays problem, a divisor-counting problem. The templates ''power'', ''inv'', ''sieve'' and ''factorize'' should be in your Team Reference Document.
:::
` };

LESSONS['combinatorics'] = { md: String.raw`
## Counting principles
- **Product rule**: independent choices multiply. Sequences of length n over k letters: kⁿ.
- **Sum rule / casework**: disjoint cases add. Overlapping cases → inclusion–exclusion.
- **Bijection**: count something easier that is in one-to-one correspondence (lattice paths ↔ strings of R/U; brackets ↔ ballot sequences).
- **Complement**: “at least one” = total − “none”.
- **Symmetry / double counting**: count pairs two ways to get an identity.

## Binomial coefficients
C(n, k) = n! / (k!(n−k)!) counts k-subsets of n items, lattice paths with k ups among n steps, and coefficients of (1 + x)ⁿ.
~~~cpp
// C(n, k) mod p for all n <= MAXN in O(1) each, after O(MAXN) precomputation
fact[0] = 1; for (i = 1..MAXN) fact[i] = fact[i-1] * i % MOD;
inv_fact[MAXN] = power(fact[MAXN], MOD - 2); for (i = MAXN..1) inv_fact[i-1] = inv_fact[i] * i % MOD;
C(n, k) = fact[n] * inv_fact[k] % MOD * inv_fact[n-k] % MOD;   // 0 if k < 0 or k > n
~~~
Identities you will use: Pascal C(n,k) = C(n−1,k−1) + C(n−1,k) (DP table for n ≤ 5000 with any modulus); Σₖ C(n,k) = 2ⁿ; Vandermonde Σ C(m,i)C(n,k−i) = C(m+n,k); hockey stick Σ_{i=k}^{n} C(i,k) = C(n+1,k+1); Lucas theorem for huge n with small prime p.

## Stars and bars
Ways to write n as an ordered sum of k non-negative integers: C(n + k − 1, k − 1). Positive integers: C(n − 1, k − 1). “Distribute n identical items into k boxes”, “number of non-decreasing sequences”, “solutions of x₁ + … + xₖ = n with bounds” (bounds → inclusion–exclusion on violated bounds).

## Permutations and arrangements
- Permutations of a multiset: n! / ∏ cᵢ! ([[problem:cses-1715]]).
- Derangements: D(n) = (n − 1)(D(n−1) + D(n−2)), D(0) = 1, D(1) = 0 ([[problem:cses-1717]]).
- Circular arrangements: (n − 1)!; necklaces up to rotation → Burnside ([[problem:cses-2209]]).
- Number of permutations with k cycles / k inversions: Stirling numbers, Mahonian numbers — DP.

## Inclusion–exclusion
|A₁ ∪ … ∪ Aₙ| = Σ|Aᵢ| − Σ|Aᵢ ∩ Aⱼ| + Σ|Aᵢ ∩ Aⱼ ∩ Aₖ| − …
Iterate over subsets of the "bad" conditions with sign (−1)^|S|. Typical: count numbers ≤ n divisible by none of k primes (2ᵏ subsets, [[problem:cses-2185]]); count sequences avoiding forbidden patterns; count surjections k! · S(n, k) = Σ (−1)ⁱ C(k, i)(k − i)ⁿ.

## Catalan numbers
Cₙ = C(2n, n)/(n + 1) = C(2n, n) − C(2n, n+1): 1, 1, 2, 5, 14, 42, 132… Count balanced bracket sequences of n pairs, binary trees with n nodes, monotone lattice paths not crossing the diagonal, triangulations of an (n+2)-gon, non-crossing matchings. The reflection principle proves the formula and generalizes to "paths that never go below −k" ([[problem:cses-2187]]).

## Pigeonhole
n + 1 objects in n boxes → some box has two. Used to prove existence: among n integers some non-empty subset has sum divisible by n (prefix sums mod n collide); in any sequence of n² + 1 numbers there is a monotone subsequence of length n + 1.

## Expected shapes of solutions
- Answer = product of independent counts → careful with modular multiplication.
- Answer = Σ over a parameter of (ways to fix the parameter) → often a single formula per term, O(n) total.
- Answer requires "exactly k" → inclusion–exclusion or subtract "at least k+1".
- n up to 10⁶ and many binomials → precomputed factorials; n up to 10¹⁸ → Lucas / formulas only.

:::pitfall
Forgetting that C(n, k) = 0 for k > n; double-counting ordered vs unordered selections; mixing up "sequences" (order matters, kⁿ) and "multisets" (C(n+k−1, k−1)); off-by-one in stars and bars (positive vs non-negative).
:::

:::seerc
Combinatorics problems at SEERC typically need one formula found by casework plus modular arithmetic, or a counting DP with a combinatorial speed-up. The [[problem:cses-1072]] "Two Knights" style of *count all, subtract bad* is the most common pattern. Practice the CSES Mathematics section.
:::
` };

LESSONS['number-theory-2'] = { md: String.raw`
## Extended Euclid
Returns x, y with a·x + b·y = gcd(a, b).
~~~cpp
long long extgcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1, g = extgcd(b, a % b, x1, y1);
    x = y1; y = x1 - (a / b) * y1;
    return g;
}
~~~
Uses: modular inverse for any modulus with gcd(a, m) = 1 (x mod m), all solutions of a·x + b·y = c (x₀ + k·b/g, y₀ − k·a/g), and the Chinese Remainder Theorem.

## Chinese Remainder Theorem
x ≡ a₁ (mod m₁), x ≡ a₂ (mod m₂) with gcd(m₁, m₂) = 1 has a unique solution modulo m₁m₂. Combine congruences pairwise: x = a₁ + m₁·t where t ≡ (a₂ − a₁)·m₁⁻¹ (mod m₂). For non-coprime moduli a solution exists iff a₁ ≡ a₂ (mod gcd); combine modulo lcm. Use ''__int128'' for the products — moduli near 10⁹ overflow otherwise. Template in the Cheat Sheet.

## Euler’s totient
φ(n) = number of integers in [1, n] coprime to n = n ∏_{p | n} (1 − 1/p). φ is multiplicative; φ(p) = p − 1; Σ_{d | n} φ(d) = n.
**Euler’s theorem**: gcd(a, n) = 1 ⇒ a^φ(n) ≡ 1 (mod n). So exponents can be reduced mod φ(n) — this is how you compute a^(b^c) mod p ([[problem:cses-1712]]). For gcd ≠ 1 use a^e ≡ a^(φ(n) + e mod φ(n)) when e ≥ log₂ n.

## Multiplicative functions and the linear sieve
f is multiplicative if f(ab) = f(a)f(b) for coprime a, b: φ, μ, number/sum of divisors. The linear sieve computes any such f for all values ≤ n in O(n) by knowing f(p) and how f changes when multiplying by a prime already present. Template: ''phi-mobius''.

## Möbius function and inversion
μ(n) = 0 if a square divides n, otherwise (−1)^(number of prime factors). Key identity: Σ_{d | n} μ(d) = [n = 1].
Counting coprime pairs: #pairs with gcd = 1 = Σ_d μ(d) · (#pairs both divisible by d). More generally, to count objects with gcd exactly g, count those with gcd a multiple of g (easy) and invert: f(g) = Σ_{g | d} μ(d/g) F(d). ([[problem:cses-2417]]).

## Divisor-sum identities and division blocks
Σ_{i=1}^{n} ⌊n/i⌋ = Σ_{i} d(i) (number of divisors). ⌊n/i⌋ takes only O(√n) distinct values; iterate blocks: for i, the largest j with ⌊n/j⌋ = ⌊n/i⌋ is n / (n / i). This gives O(√n) algorithms for sums like Σ d(i), Σ σ(i), Σ i·⌊n/i⌋ ([[problem:cses-1082]]).

## Discrete logarithm: baby-step giant-step
Solve aˣ ≡ b (mod p) in O(√p): pick m = ⌈√p⌉, store a^j for j < m in a hash map (baby steps), then for i = 1.. check b · (a^(−m))^i (giant steps). Works for any group with a fast inverse.

## Lucas theorem
C(n, k) mod p for prime p and huge n, k: write n and k in base p; C(n, k) ≡ ∏ C(nᵢ, kᵢ) (mod p). Each factor uses digits < p, so precompute factorials up to p.

## Primitive roots and order
The multiplicative order of a mod p divides p − 1; a primitive root generates everything. NTT uses g = 3 for 998244353. Order computation: factor p − 1, divide out primes while a^((p−1)/q) ≡ 1.

:::recognize
"gcd = 1 pairs" or "gcd exactly k" → Möbius; "a^(huge tower)" → Euler; "x ≡ … (mod several moduli)" → CRT; "sum over i of floor(n/i)" → division blocks; "aˣ ≡ b" → BSGS; "C(n, k) with n ≈ 10¹⁸ and small prime modulus" → Lucas.
:::

:::seerc
Tier-2 number theory appears at SEERC roughly once per set, usually as the medium-hard math problem. Knowing the *names* (Möbius, CRT, BSGS) lets you look them up in your reference document instead of deriving under pressure.
:::
` };

LESSONS['matrix-expo'] = { md: String.raw`
## The idea
If a state vector evolves by a fixed linear rule vₖ₊₁ = M · vₖ, then vₖ = Mᵏ · v₀, and Mᵏ costs O(n³ log k) with fast exponentiation. Anything you would compute with a linear DP for k = 10¹⁸ steps becomes feasible.

## Linear recurrences
f(n) = c₁ f(n−1) + c₂ f(n−2) + … + c_d f(n−d):
~~~
| f(n)   |   | c1 c2 ... cd |   | f(n-1) |
| f(n-1) | = | 1  0  ... 0  | · | f(n-2) |
| ...    |   | 0  1  ... 0  |   | ...    |
~~~
Fibonacci: M = [[1, 1], [1, 0]], F(n) = (Mⁿ)[0][1]. A constant term c₀ becomes an extra state fixed at 1. Template: ''matrix-power''.

## Counting walks
(Aᵏ)[u][v] for the adjacency matrix A counts walks of length exactly k from u to v ([[problem:cses-1723]]). Replace (·, +) by (+, min) — a "min-plus" product — and the same power gives the shortest walk with exactly k edges ([[problem:cses-1724]]). Any (⊕, ⊗) that forms a semiring works (min-plus, max-plus, OR-AND for reachability).

## DP with small state and huge length
"Count strings of length n = 10¹⁸ over {a, b, c} with no two equal adjacent letters", "count tilings of a 3 × n board", "dice rolls summing to n with each roll ≤ 6" ([[problem:cses-1096]]): the transition from one position to the next is position-independent → write it as a matrix over the finite state set.

## Implementation notes
- Store matrices as ''vector<vector<long long>>'' or fixed arrays for n ≤ 100; reduce mod after every multiplication.
- Skip zero entries in the inner loop (''if (a[i][k] == 0) continue'') — big win for sparse transitions.
- Exponent 0 → identity matrix. Exponent as ''long long''.
- For d ≤ 3 you can hand-inline the multiplication.
- Faster alternatives for scalar linear recurrences: Kitamasa / Bostan–Mori (O(d² log n) or O(d log d log n)); rarely needed at regional level.

:::example Tribonacci mod 10⁹+7 for n = 10¹⁸
State (T(n), T(n−1), T(n−2)); M = [[1,1,1],[1,0,0],[0,1,0]]; answer = (M^(n−2) · (T(2), T(1), T(0)))[0]. About 60 squarings of a 3×3 matrix.
:::

:::recognize
A recurrence or DP whose transition does not depend on the index, plus an index around 10¹² or larger. If the state set has more than ~200 elements, look for structure (periodicity, decomposition) instead.
:::

:::seerc
A classic "the observation is easy, the n is huge" SEERC pattern. See also [[viz:fast-pow]] for the exponentiation loop that powers this technique.
:::
` };

LESSONS['probability-ev'] = { md: String.raw`
## Linearity of expectation — the tool
E[X + Y] = E[X] + E[Y] **always**, whether or not X and Y are independent. Decompose the quantity you want into a sum of indicator variables (1 if an event happens, else 0); E[indicator] = probability of the event. Then sum the probabilities.

:::example Expected number of inversions in a random permutation
Each pair (i, j) is inverted with probability 1/2, independent of anything else: E = C(n, 2)/2. No need to reason about the whole permutation.
:::
:::example Expected number of distinct values among n rolls of a k-sided die
Value v appears with probability 1 − (1 − 1/k)ⁿ; sum over v: k(1 − (1 − 1/k)ⁿ).
:::

## Expected value DP
When a process moves between states with known probabilities, E[state] = Σ p(next) · (cost + E[next]). Evaluate in an order where all "next" states are known (a DAG of states), like any DP.
- Dice/steps to reach n: E[i] = 1 + (1/6) Σ E[i + d] ([[problem:cses-1725]] style).
- Self-loops: E = a + p·E ⇒ E = a / (1 − p). Solve algebraically, then continue the DP ([[problem:ac-dp_j]]).
- Cycles among several states → system of linear equations → Gaussian elimination ([[topic:linear-algebra]]) for small state counts.

## Probabilities modulo a prime
"Print the answer modulo 998244353" means the probability is a rational p/q and you print p·q⁻¹ mod P. Do the entire DP in modular arithmetic: probabilities become field elements, 1/6 becomes inv(6). Nothing else changes.

## Useful facts
- P(A ∪ B) = P(A) + P(B) − P(A ∩ B); for "at least one" use the complement: 1 − ∏(1 − pᵢ) when independent.
- E[max] = Σ_x P(max ≥ x) for non-negative integer variables ([[problem:cses-1727]]).
- Geometric distribution: expected trials until success with probability p is 1/p.
- Independence lets you multiply probabilities: E[XY] = E[X]E[Y] only if independent (but E[X + Y] never needs it).
- Variance / second moments occasionally appear: E[X²] = Σ over pairs of indicators E[IᵢIⱼ].

## Common problem shapes
- **Random process with a small state** → expected value DP, possibly with matrix power for huge time.
- **Random permutation / random subset** → indicator variables per element or per pair.
- **Sum over all subsets/permutations of some statistic** → (number of objects) × E[statistic]; compute E by linearity.
- **Game with optimal player vs random events** → minimax at player nodes, expectation at chance nodes.

:::pitfall
Dividing by (1 − p) when p = 1 (absorbing state); using ''double'' when the answer must be exact modulo a prime; assuming independence to multiply probabilities of overlapping events; forgetting that E over a *uniformly random* permutation is often just a count divided by n!.
:::

:::seerc
Expected-value problems are a SEERC staple, usually medium difficulty: the whole trick is decomposing into indicators or writing the right DP. Practice the CSES probability set and AtCoder DP contest problems I and J.
:::
` };

LESSONS['game-theory'] = { md: String.raw`
## Winning and losing positions
For a finite two-player game where the player who cannot move loses (normal play):
- A position is **losing** (P-position) if every move leads to a winning position.
- A position is **winning** (N-position) if some move leads to a losing position.
- Terminal positions (no moves) are losing.
Compute backwards with DP over states: ''win[s] = exists move s → t with !win[t]'' ([[problem:cses-1729]]). Small state spaces only.

## Nim
Piles a₁ … aₙ, remove any positive number from one pile. The first player wins iff a₁ ⊕ a₂ ⊕ … ⊕ aₙ ≠ 0.
:::proof Sketch
From XOR ≠ 0 you can always move to XOR = 0 (take the pile with the highest bit of the XOR set, reduce it to pile ⊕ total). From XOR = 0 every move makes it non-zero. Terminal (all empty) has XOR 0.
:::

## Sprague–Grundy: every impartial game is Nim
Define the Grundy value g(s) = mex{ g(t) : s → t } (mex = smallest non-negative integer not in the set). Then:
- g(s) = 0 ⇔ losing position.
- A sum of independent games (you move in exactly one component) has Grundy value g₁ ⊕ g₂ ⊕ … — treat each component as a Nim pile of size g.
Compute g for one pile/component by DP (often periodic → find the period from small values and use it), XOR across components ([[problem:cses-1098]], [[problem:cses-2207]]). The [[viz:grundy]] visualizer computes mex tables step by step.

## Recognising the type of game
| Game type | Tool |
|---|---|
| Impartial, normal play, independent components | Sprague–Grundy XOR |
| Impartial, misère (last mover loses) | usually Nim with a parity twist on piles of size 1 |
| Partisan (players have different moves) | usually pure minimax/DP or a specific theorem |
| Symmetric position | mirror strategy: second player copies moves |
| "Strategy stealing" | first player cannot lose in games where an extra move never hurts |
| Two players alternately pick from ends / take max | interval DP or a parity/pairing argument |

## Standard Grundy values
- Nim pile: g(n) = n.
- Remove 1..k stones: g(n) = n mod (k + 1).
- Remove from a fixed set S: compute by DP; periodic with period ≤ 2·max(S).
- Staircase Nim: XOR of odd-indexed stairs ([[problem:cses-1099]]).
- Splitting a pile into two unequal parts (Grundy’s game): compute small values, becomes eventually periodic.

## Things to check in a game problem
1. Who moves first, and does the last mover win or lose?
2. Are the components truly independent (a move affects only one)?
3. Is there a simple invariant (parity of total, sum mod k) — many "games" are just parity puzzles with story.
4. If the state space is tiny (≤ 10⁶), just DP the win/lose table and look for a pattern.

:::seerc
Game problems at SEERC are usually either a parity/pairing argument in disguise or straight Sprague–Grundy with a periodic table. Compute the first 30 Grundy values in your head or with brute force, and the pattern is usually obvious.
:::
` };

LESSONS['linear-algebra'] = { md: String.raw`
## Gaussian elimination
Solve a system of n linear equations in m unknowns by row operations: pick a pivot column, swap a row with a non-zero entry into place, normalise it, eliminate that column from all other rows. O(n·m·min(n, m)). Works over the reals (with pivoting for stability), modulo a prime (using inverses), and over GF(2) (XOR rows — 64× faster with bitsets).
- Rank = number of pivots. Determinant = product of pivots × sign of row swaps.
- Inconsistent if a zero row has a non-zero right-hand side. Free variables when rank < m (infinitely many solutions; count them as p^(m − rank) modulo p).
Template ''gauss-xor-basis'' (mod p) in the Cheat Sheet. Applications: expected-value systems with cycles ([[topic:probability-ev]]), counting spanning trees (Kirchhoff’s matrix-tree theorem = a determinant), electrical networks, "lights out" puzzles over GF(2).

## XOR linear basis (GF(2) vector space)
A set of numbers spans a linear space under XOR. Keep a basis with at most 60 vectors, one per leading bit:
~~~cpp
long long basis[60];          // basis[b] has highest bit b, or 0
bool insert(long long x) {
    for (int b = 59; b >= 0; b--) {
        if (!(x >> b & 1)) continue;
        if (!basis[b]) { basis[b] = x; return true; }
        x ^= basis[b];
    }
    return false;                 // x already representable
}
~~~
With the basis you answer in O(60):
- Can x be formed as a XOR of some subset? Reduce x; representable iff it becomes 0.
- Maximum subset XOR: greedily XOR basis vectors from the top when it increases the result.
- Number of distinct XOR values: 2^(basis size). Number of subsets with XOR = x: 2^(n − size) if representable.
- k-th smallest XOR value: make the basis reduced (each leading bit appears in only one vector), then read k in binary.
Problems: [[problem:cf-845G]], [[problem:cf-1101G]], [[problem:cses-2078]].

## Matrices as data
- Adjacency matrices and powers → walks ([[topic:matrix-expo]]).
- Determinants count things: spanning trees (matrix-tree), non-intersecting path systems (Lindström–Gessel–Viennot).
- Rank over GF(2) counts independent constraints ("can you toggle these lights to any configuration").

## Numerical care
Over doubles, choose the largest absolute pivot (partial pivoting) and treat |x| < 1e-9 as zero. Over a prime, everything is exact — prefer it when the problem allows.

:::recognize
"Maximum XOR of a subset", "number of subsets with XOR equal to…", "can this value be obtained by XOR-ing", "system of equations with n ≤ 500", "expected value with cyclic dependencies", "count spanning trees" — linear algebra.
:::

:::seerc
XOR-basis problems are a modern favourite at European regionals — they look scary and are 20 lines once you know the basis trick. Gaussian elimination appears less often but is the fallback for any small system of equations.
:::
` };

LESSONS['fft-ntt'] = { md: String.raw`
## What convolution is
Given arrays a and b, the convolution c[k] = Σᵢ a[i]·b[k − i] is the coefficient array of the polynomial product A(x)·B(x). Naively O(n·m); with FFT/NTT O((n + m) log(n + m)).

## When you need it
- Count pairs (i, j) with a[i] + b[j] = s for all s: convolve the frequency arrays ([[problem:cses-2111]]).
- Count matches of a pattern with wildcards, or occurrences of pairs at each distance ([[problem:cses-2112]]): correlations are convolutions with a reversed array.
- Multiply big numbers / polynomials; count subsets with a given sum modulo a prime via generating functions; speed up "dp[i] = Σ dp[j]·f(i − j)" transitions (with divide-and-conquer FFT for the online case).

## NTT — the version you should use
Work modulo P = 998244353 = 119·2²³ + 1: a primitive root g = 3 exists whose powers give roots of unity of order 2²³, so exact integer arithmetic replaces floating point. The transform is the same butterfly algorithm as FFT with the root of unity ω = g^((P − 1)/len). Template ''ntt'' in the Cheat Sheet (multiply two vectors, result modulo P).

If the problem’s modulus is 10⁹+7 (not NTT-friendly) or values are huge: use FFT over doubles with coefficient splitting (values into 15-bit halves) or three NTT primes + CRT. At regional level, most FFT problems are designed around 998244353.

## The algorithm in one paragraph
Evaluate the polynomial at the n = 2ᵏ roots of unity (forward transform), multiply values pointwise (n multiplications), interpolate back (inverse transform = forward with ω⁻¹, divided by n). Each transform is O(n log n) by splitting into even and odd coefficients recursively — implemented iteratively with bit-reversal ordering.

## Practical checklist
- Pad both arrays to a power of two ≥ |a| + |b| − 1.
- Reduce coefficients modulo P before transforming.
- For squaring, transform once and multiply pointwise with itself.
- n up to 2·10⁵ per multiplication: a few milliseconds. 10⁶: fine. Many multiplications (D&C FFT) O(n log² n): fine for 10⁵.
- Watch memory and time when the problem actually needs O(n²) "small" convolutions — sometimes brute force per pair is intended instead.

:::recognize
"For every possible sum/difference, count the pairs", "number of ways for each total", patterns with wildcards over a long text, generating-function products with n ≥ 10⁵. If n ≤ 5000, O(n²) is intended and FFT is a waste of time.
:::

:::seerc
FFT/NTT is a Tier-3 topic: perhaps one problem in two years at SEERC, usually among the hardest. Have the template printed in the reference document, know the "sum of pairs" and "wildcard matching" shapes, and do not study it before Tiers 1–2 are solid.
:::
` };
