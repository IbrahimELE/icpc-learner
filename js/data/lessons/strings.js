/* Lessons — strings I (hashing, KMP, Z, Manacher) and strings II (trie, Aho–Corasick, suffix structures). */
window.LESSONS = window.LESSONS || {};

LESSONS['strings-1'] = { md: String.raw`
## Polynomial hashing
Treat a string as a number in base B modulo M: h(s) = Σ s[i]·B^(n−1−i) mod M. With prefix hashes you get the hash of any substring in O(1):
~~~cpp
h[i+1] = (h[i] * B + s[i]) % M;  p[i+1] = p[i] * B % M;
hash(l, r) = (h[r+1] - h[l] * p[r-l+1] % M + M) % M;      // s[l..r]
~~~
Equal hashes ⇒ probably equal strings. With one 10⁹-sized modulus the collision probability per comparison is ~10⁻⁹ — fine for a few comparisons, dangerous for 10¹⁰ comparisons (birthday paradox: ~10⁵ random strings already collide with decent probability). **Use two moduli** (10⁹+7 and 998244353) or mod 2⁶¹−1 with a random base. Never use ''unsigned long long'' natural overflow (mod 2⁶⁴) — there are known anti-hash strings (Thue–Morse) that collide for every base.

Uses: compare substrings ([[problem:cses-2420]] with a segment tree of hashes for updates), count distinct substrings of a short string, longest common substring with binary search on the length + hash sets (O(n log n)), palindrome checks (hash of the reversed string), string equality in hash maps.

## Prefix function and KMP
π[i] = length of the longest proper prefix of s[0..i] that is also a suffix of it. Computed in O(n) amortized:
~~~cpp
for (int i = 1; i < n; i++) {
    int j = pi[i - 1];
    while (j > 0 && s[i] != s[j]) j = pi[j - 1];
    if (s[i] == s[j]) j++;
    pi[i] = j;
}
~~~
[[viz:kmp]] shows the jumps. Applications:
- **Pattern matching**: compute π of ''p + '#' + t''; positions with π = |p| are matches ([[problem:cses-1753]]). Or run the matching loop directly (template ''kmp-prefix-function'').
- **Borders** of s: π[n−1], π[π[n−1]−1], … ([[problem:cses-1732]]). **Periods**: n − border ([[problem:cses-1733]]); s is a repetition of a block of length k iff k divides n and π[n−1] = n − k.
- **KMP automaton**: for each state and character, the next state — used inside DPs "count strings not containing p" ([[problem:cses-1112]]).
- **Counting occurrences of every prefix** ([[problem:cf-432D]]): count π values and propagate along the border chain.

## Z-function
z[i] = length of the longest common prefix of s and s[i..]. O(n) with the [l, r) "Z-box" trick ([[viz:z-function]]). Equivalent power to the prefix function, sometimes more natural: pattern matching (z of ''p + '#' + t''), "is the string a rotation/power", number of prefixes that are also suffixes.

## Manacher: all palindromes in O(n)
d1[i] = number of odd palindromes centred at i (radius incl. centre); d2[i] = even palindromes centred between i−1 and i. Longest palindromic substring ([[problem:cses-1111]]), number of palindromic substrings (Σ d1 + Σ d2), "is s[l..r] a palindrome" in O(1) (compare the radius at the centre). Template ''manacher''.

## Minimal rotation and other classics
- Lexicographically minimal rotation: Booth’s algorithm or the two-pointer "minimum expression" method on s+s in O(n) ([[problem:cses-1110]]).
- Longest common prefix of two suffixes: hashing + binary search, or suffix array LCP.
- Number of distinct substrings of a string of length ≤ 5000: hash all O(n²) substrings into a set (or suffix array/automaton for larger).

:::pitfall
Hash subtraction going negative; using ''char'' values without offsetting (map 'a' → 1, not 0, so "a" and "aa" differ); ''#'' separator that may occur in the alphabet; recomputing π inside a loop (O(n²)); confusing "proper prefix" (excludes the whole string) in the border definition.
:::

:::seerc
Most SEERC string problems are solvable with hashing plus one classical algorithm. Hashing with two moduli is the fastest path to a correct solution under pressure — many strong teams hash first and think later.
:::
` };

LESSONS['strings-2'] = { md: String.raw`
## Trie
A tree of characters: each root-to-node path spells a prefix of some inserted word. Insert/lookup in O(|word|). Array-based nodes (''int nxt[MAXN][26]'') are fastest; total nodes ≤ total inserted length + 1. Uses: count words with a given prefix, dictionary lookups inside a DP ([[problem:cses-1731]]), autocomplete, and the **binary trie** on bits for maximum XOR pairs (walk toward the opposite bit at each level) ([[viz:trie]], template ''trie'').

## Aho–Corasick
Trie of all patterns + **suffix links** (the KMP failure function generalised): link[v] = the longest proper suffix of v’s string that is also a trie node. BFS computes links level by level and fills missing transitions so the automaton has a full goto function. Scanning a text then takes O(|text|), and at each position the chain of suffix links lists every pattern that ends there.
- Count total occurrences of all patterns: precompute cnt[v] = out[v] + cnt[link[v]] ([[problem:cses-2103]]).
- Which patterns occur at least once: mark visited nodes, propagate to suffix links in reverse BFS order ([[problem:cses-2102]]).
- DP over a text with automaton state: "strings of length n avoiding k forbidden words", "expected time until a pattern appears".
Template ''aho-corasick''.

## Suffix array
The sorted order of all suffixes. Build in O(n log n) by prefix doubling with counting sort (template ''suffix-array-lcp''); O(n) SA-IS exists but is rarely needed. With the **LCP array** (Kasai, O(n)) — LCP of adjacent suffixes in sorted order — you get:
- Number of distinct substrings = n(n+1)/2 − Σ LCP ([[problem:cses-2105]]).
- Longest repeated substring = max LCP ([[problem:cses-2106]]).
- Pattern search in O(m log n) by binary search over the SA; all occurrences form a contiguous SA range ([[problem:cses-2104]]).
- LCP of any two suffixes = min over the LCP array between their ranks (sparse table).
- Longest common substring of several strings: concatenate with separators, sliding window over the SA.

## Suffix automaton
The smallest automaton accepting all suffixes of s; ≤ 2n states, built online in O(n) (template ''suffix-automaton''). Each state is a set of substrings sharing the same set of end positions; len[v] − len[link[v]] new substrings per state. Gives: distinct substrings ([[problem:cses-2105]]), occurrences of any substring (propagate end-position counts along suffix links), k-th distinct substring ([[problem:cses-2108]], [[problem:cses-2109]]), longest common substring of two strings (walk the automaton of one with the other), substring distribution by length ([[problem:cses-2110]]). When both work, suffix automaton is usually shorter to *use*; suffix arrays are easier to *reason about* with binary searches.

## Choosing
| Task | Tool |
|---|---|
| one pattern, one text | KMP / Z / hashing |
| many patterns, one text | Aho–Corasick |
| many queries on one text | suffix array or automaton |
| prefix queries on a dictionary | trie |
| maximum XOR pairs | binary trie |
| "count distinct substrings" | automaton or SA + LCP |
| substring equality checks | hashing |

:::pitfall
Trie memory: 10⁶ nodes × 26 ints = 104 MB — use ''vector<array<int,26>>'' only if the total length allows, otherwise a map per node for large alphabets; Aho–Corasick without the goto completion needs a while-loop on links (fine but easy to get wrong); suffix array sentinel must be smaller than all characters; Kasai needs the rank array of the *original* string.
:::

:::seerc
One string problem per SEERC set is typical; every second year it needs one of these structures. Suffix automaton and Aho–Corasick are worth having in the reference document even if you only half-remember how they work.
:::
` };
