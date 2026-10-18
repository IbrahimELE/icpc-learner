/* Lessons — randomization & hashing tricks. */
window.LESSONS = window.LESSONS || {};

LESSONS['randomized-hashing'] = { md: String.raw`
## Why randomness helps
Deterministic hashing can be attacked (anti-hash tests) and some exact problems are hard, but a **random** choice made by your program at run time cannot be anticipated by the test data. Many "compare two things quickly" problems become easy with random 64-bit fingerprints, and the failure probability (~2⁻⁶⁴ per comparison) is negligible.

## Random 64-bit values as fingerprints
Assign an independent random 64-bit number r(v) to every value v.
- **Multiset equality of ranges**: prefix sums of r(a[i]) — two ranges have the same multiset iff their sums are equal (with overwhelming probability). Works for "is a[l..r] a permutation of b[l..r]" ([[problem:cf-1175F]]-style tricks).
- **Set equality / symmetric difference**: XOR of r(v). XOR-hash of a subtree, of a path (prefix XOR to the root), of the set of colours "seen an odd number of times".
- **"Every value appears exactly k times"**: use values modulo k in an exponent, or sums of random values with a counter mod k ([[problem:cf-1418G]]).
- **Tree isomorphism**: hash(v) = f(sorted or combined hashes of children) with random per-depth constants.
- **Zobrist hashing** of a board state: XOR of r(piece, square) — update in O(1) per move.
Use ''mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count())'' for the seed. Never ''rand()''.

## Anti-hash and how to avoid it
On judges with open hacking (Codeforces), fixed hash parameters are attacked: ''unordered_map'' with default hashing, polynomial string hashes with a fixed base modulo 2⁶⁴ (Thue–Morse strings collide for *every* base), fixed bases modulo 10⁹+7. Countermeasures: random base chosen at run time, two moduli, or a custom ''splitmix64'' hash for ''unordered_map''. At ICPC there is no hacking, but tests may still contain classic anti-hash cases.

## Randomized algorithms you should know
- **Miller–Rabin** primality for 64-bit numbers — deterministic with the 12 fixed bases ≤ 37 (template ''miller-rabin-pollard'').
- **Pollard’s rho** factorization: expected O(n^(1/4)) per factor; factorizes 10¹⁸ in milliseconds.
- **Random pivot** (quickselect / ''nth_element''), random shuffling before greedy heuristics to avoid worst cases.
- **Random sampling for "majority" or "frequent element" problems**: an element appearing in ≥ half the positions is found with probability 1 − 2⁻ᵏ after k samples; then verify.
- **Randomized expected O(n) constructions**: minimum enclosing circle (Welzl), treaps.
- **Schwartz–Zippel**: test polynomial identities (e.g. perfect matching existence via a random Tutte matrix determinant) by evaluating at random points.
- **Freivalds**: verify a matrix product A·B = C in O(n²) with random vectors.

## Estimating failure probability
- Collision of two random 64-bit values: 2⁻⁶⁴. Over m comparisons: m·2⁻⁶⁴ — safe for any m you can afford.
- Birthday bound: with k random values in a space of size N, some pair collides with probability ≈ k²/(2N). For 32-bit hashes, k = 10⁵ already gives ~1 — use 64 bits.
- Repeating a Monte-Carlo test t times with one-sided error p gives error pᵗ.

## When to reach for randomness
Signals: "compare sets/multisets quickly", "count subarrays that are permutations / have equal multisets", "determine if two structures are the same shape", exact algorithms that feel too hard for the constraints, and any place where a deterministic hash would be attackable.

:::seerc
Random XOR/sum hashing is a modern regional favourite because it turns an intimidating statement into prefix sums. Have the pattern ready: "assign random 64-bit weights, compare sums".
:::
` };
