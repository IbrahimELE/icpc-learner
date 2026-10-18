/* Curriculum metadata. Order of TOPICS = recommended learning order.
   stars = how often the technique matters at SEERC (5 = appears almost every year / prerequisite for everything). */
const TIERS = [
  { id: 0, name: 'Foundations', short: 'Tier 0', desc: 'Language, complexity, STL and the habits that make everything else possible. Do not skip.' },
  { id: 1, name: 'Core techniques', short: 'Tier 1', desc: 'The toolbox that solves the first 3–5 problems of any SEERC set. Master these before anything fancy.' },
  { id: 2, name: 'Intermediate', short: 'Tier 2', desc: 'Data structures, harder DP, graph theory and math that separate mid-scoreboard teams from the rest.' },
  { id: 3, name: 'Advanced', short: 'Tier 3', desc: 'Techniques for the hardest 3–4 problems. Learn selectively, after the tiers above are solid.' },
  { id: 4, name: 'Contest craft', short: 'Tier 4', desc: 'How to actually convert knowledge into solved problems on contest day.' },
];

const CATS = {
  basics: { name: 'Basics', color: '#8b949e' },
  core: { name: 'Core techniques', color: '#3fb950' },
  math: { name: 'Math', color: '#f0883e' },
  dp: { name: 'Dynamic programming', color: '#bc8cff' },
  graphs: { name: 'Graphs & trees', color: '#6ea8fe' },
  ds: { name: 'Data structures', color: '#39c5bb' },
  strings: { name: 'Strings', color: '#d29922' },
  geometry: { name: 'Geometry', color: '#f85149' },
  advanced: { name: 'Advanced', color: '#ff7b72' },
  meta: { name: 'Contest craft', color: '#e6e9ef' },
};

const TOPICS = [
  /* ---------------- Tier 0 ---------------- */
  { id: 'cpp-basics', title: 'C++ for Competitive Programming', tier: 0, cat: 'basics', stars: 5, hours: 4, prereqs: [],
    summary: 'Fast I/O, integer types and overflow, reading input safely, the standard template, and the compiler flags that catch your bugs.',
    keywords: ['fast io', 'long long', 'overflow', 'template', 'cin', 'scanf', 'gcc flags'], viz: [] },
  { id: 'complexity', title: 'Time Complexity & Constraints', tier: 0, cat: 'basics', stars: 5, hours: 2, prereqs: ['cpp-basics'],
    summary: 'Read the constraints, guess the intended complexity, and know how many operations fit in one second.',
    keywords: ['big o', 'complexity', 'constraints', 'operations per second', 'time limit'], viz: [] },
  { id: 'problem-solving', title: 'How to Attack a Problem', tier: 0, cat: 'basics', stars: 5, hours: 3, prereqs: ['complexity'],
    summary: 'A repeatable process: restate, brute force, small cases, spot structure, prove, then code. Plus how to read a SEERC statement.',
    keywords: ['process', 'brute force', 'small cases', 'observations', 'proof', 'statement'], viz: [] },
  { id: 'stl', title: 'STL Toolkit', tier: 0, cat: 'basics', stars: 5, hours: 4, prereqs: ['cpp-basics'],
    summary: 'vector, set/map, priority_queue, deque, bitset, sort/lower_bound and the algorithms header. Know the complexity of every call.',
    keywords: ['vector', 'set', 'map', 'priority_queue', 'lower_bound', 'sort', 'unordered_map', 'bitset', 'lambda'], viz: [] },
  { id: 'implementation', title: 'Implementation, Debugging & Stress Testing', tier: 0, cat: 'basics', stars: 4, hours: 4, prereqs: ['stl'],
    summary: 'Write code that is right the first time: clean loops, edge cases, a debug macro, and stress testing against a brute force.',
    keywords: ['simulation', 'edge cases', 'debug', 'stress test', 'brute force', 'random generator', 'off by one'], viz: [] },
  { id: 'math-basics', title: 'Math Basics for CP', tier: 0, cat: 'math', stars: 4, hours: 3, prereqs: ['cpp-basics'],
    summary: 'Integer division and modulo, gcd/lcm, floating point traps, sums and logarithms, ceil/floor identities, big values with __int128.',
    keywords: ['gcd', 'lcm', 'modulo', 'floor', 'ceil', 'floating point', 'epsilon', 'int128'], viz: ['gcd'] },

  /* ---------------- Tier 1 ---------------- */
  { id: 'sorting-searching', title: 'Sorting, Comparators & Coordinate Compression', tier: 1, cat: 'core', stars: 5, hours: 3, prereqs: ['stl'],
    summary: 'Custom comparators, sorting events for sweeps, stable sort, counting sort, compressing coordinates into 0..k-1.',
    keywords: ['sort', 'comparator', 'coordinate compression', 'counting sort', 'events', 'sweep'], viz: ['monotonic-stack'] },
  { id: 'binary-search', title: 'Binary Search & Binary Search on Answer', tier: 1, cat: 'core', stars: 5, hours: 4, prereqs: ['sorting-searching', 'complexity'],
    summary: 'The monotone-predicate template, lower_bound/upper_bound, binary search on the answer, and ternary search on unimodal functions.',
    keywords: ['binary search', 'monotone', 'lower_bound', 'predicate', 'ternary search', 'answer'], viz: ['binary-search'] },
  { id: 'prefix-sums', title: 'Prefix Sums & Difference Arrays', tier: 1, cat: 'core', stars: 5, hours: 3, prereqs: ['cpp-basics'],
    summary: 'O(1) range sums, 2D prefix sums, difference arrays for range updates, prefix XOR, prefix counts and the "count subarrays with property" trick.',
    keywords: ['prefix sum', 'difference array', '2d prefix', 'range sum', 'subarray sum', 'prefix xor'], viz: ['prefix-sums'] },
  { id: 'two-pointers', title: 'Two Pointers & Sliding Window', tier: 1, cat: 'core', stars: 4, hours: 3, prereqs: ['prefix-sums', 'sorting-searching'],
    summary: 'Amortized O(n) scans: shrink/grow windows, pairs with sum, merging sorted lists, monotonic deque for sliding minimum.',
    keywords: ['two pointers', 'sliding window', 'monotonic deque', 'amortized'], viz: ['two-pointers', 'sliding-window-min'] },
  { id: 'greedy', title: 'Greedy Algorithms', tier: 1, cat: 'core', stars: 5, hours: 4, prereqs: ['sorting-searching'],
    summary: 'Interval scheduling, exchange arguments, greedy with a priority queue, and how to tell greedy from DP.',
    keywords: ['greedy', 'exchange argument', 'interval scheduling', 'huffman', 'priority queue'], viz: [] },
  { id: 'recursion-backtracking', title: 'Recursion, Backtracking & Complete Search', tier: 1, cat: 'core', stars: 4, hours: 3, prereqs: ['cpp-basics'],
    summary: 'Enumerating subsets and permutations, pruning, generating all objects up to n ≈ 20, and when brute force is the intended solution.',
    keywords: ['recursion', 'backtracking', 'subsets', 'permutations', 'complete search', 'pruning', 'next_permutation'], viz: ['subsets'] },
  { id: 'bit-manipulation', title: 'Bit Manipulation', tier: 1, cat: 'core', stars: 4, hours: 3, prereqs: ['recursion-backtracking'],
    summary: 'Masks as sets, iterating submasks, popcount, XOR properties, lowbit, bitset speedups.',
    keywords: ['bitmask', 'xor', 'popcount', 'submask', 'bitset', 'lowbit', 'shift'], viz: ['subsets'] },
  { id: 'number-theory-1', title: 'Number Theory I', tier: 1, cat: 'math', stars: 5, hours: 5, prereqs: ['math-basics'],
    summary: 'Sieve, factorization, divisors, modular arithmetic, fast exponentiation, modular inverse, and Fermat/Euler. The bread and butter of "mod 1e9+7" problems.',
    keywords: ['sieve', 'primes', 'factorization', 'modular', 'inverse', 'fermat', 'binary exponentiation', 'divisors'], viz: ['sieve', 'fast-pow'] },
  { id: 'combinatorics', title: 'Combinatorics', tier: 1, cat: 'math', stars: 4, hours: 4, prereqs: ['number-theory-1'],
    summary: 'Factorials and nCr mod p, stars and bars, inclusion–exclusion, Catalan numbers, pigeonhole, counting paths and arrangements.',
    keywords: ['binomial', 'nCr', 'factorial', 'inclusion exclusion', 'catalan', 'stars and bars', 'pigeonhole'], viz: [] },
  { id: 'dp-1', title: 'Dynamic Programming I', tier: 1, cat: 'dp', stars: 5, hours: 6, prereqs: ['recursion-backtracking', 'complexity'],
    summary: 'States, transitions, base cases. Coins, grids, LIS, LCS, edit distance, knapsack — and how to find the DP behind a statement.',
    keywords: ['dp', 'memoization', 'knapsack', 'lis', 'lcs', 'edit distance', 'grid paths', 'coin change'], viz: ['knapsack', 'lcs', 'lis'] },
  { id: 'graphs-1', title: 'Graphs I: BFS, DFS & Components', tier: 1, cat: 'graphs', stars: 5, hours: 5, prereqs: ['stl', 'recursion-backtracking'],
    summary: 'Adjacency lists, BFS distances, DFS, connected components, bipartite check, cycle detection, grids as graphs, flood fill.',
    keywords: ['bfs', 'dfs', 'components', 'bipartite', 'grid', 'flood fill', 'cycle detection', 'adjacency list'], viz: ['bfs-grid', 'dfs-components'] },
  { id: 'shortest-paths', title: 'Shortest Paths', tier: 1, cat: 'graphs', stars: 5, hours: 4, prereqs: ['graphs-1'],
    summary: 'Dijkstra done right, 0-1 BFS, Bellman–Ford and negative cycles, Floyd–Warshall, and modelling states (node, extra info) as graph vertices.',
    keywords: ['dijkstra', 'bellman ford', 'floyd warshall', '0-1 bfs', 'negative cycle', 'state graph'], viz: ['dijkstra'] },
  { id: 'dsu', title: 'Disjoint Set Union & Minimum Spanning Trees', tier: 1, cat: 'graphs', stars: 5, hours: 3, prereqs: ['graphs-1'],
    summary: 'Union–find with path compression and union by size, Kruskal, Prim, offline connectivity tricks, DSU with extra data.',
    keywords: ['dsu', 'union find', 'kruskal', 'prim', 'mst', 'connectivity'], viz: ['dsu', 'kruskal'] },
  { id: 'topo-sort', title: 'DAGs & Topological Sort', tier: 1, cat: 'graphs', stars: 4, hours: 3, prereqs: ['graphs-1'],
    summary: 'Kahn’s algorithm, DFS ordering, DP over a DAG (longest path, counting paths), detecting cycles in directed graphs.',
    keywords: ['topological sort', 'dag', 'kahn', 'longest path', 'in-degree'], viz: ['topo-sort'] },
  { id: 'trees-1', title: 'Trees I: Rooting, Subtrees & Diameter', tier: 1, cat: 'graphs', stars: 5, hours: 4, prereqs: ['graphs-1'],
    summary: 'Rooting a tree, subtree sizes, depths, diameter (two BFS), Euler tour ordering, basic tree DP and rerooting intuition.',
    keywords: ['tree', 'subtree size', 'diameter', 'euler tour', 'rooting', 'depth'], viz: ['tree-dfs'] },
  { id: 'strings-1', title: 'Strings I: Hashing, KMP, Z, Manacher', tier: 1, cat: 'strings', stars: 4, hours: 4, prereqs: ['prefix-sums', 'number-theory-1'],
    summary: 'Polynomial hashing with double mod, prefix function and KMP matching, Z-function, periods and borders, Manacher for palindromes.',
    keywords: ['hashing', 'kmp', 'prefix function', 'z function', 'manacher', 'palindrome', 'period', 'border'], viz: ['kmp', 'z-function'] },

  /* ---------------- Tier 2 ---------------- */
  { id: 'segment-tree', title: 'Segment Tree & Sparse Table', tier: 2, cat: 'ds', stars: 5, hours: 6, prereqs: ['prefix-sums', 'recursion-backtracking'],
    summary: 'Point update / range query in O(log n) for any associative operation, iterative and recursive versions, walking down the tree, and static RMQ with a sparse table.',
    keywords: ['segment tree', 'range query', 'point update', 'sparse table', 'rmq', 'associative'], viz: ['segment-tree', 'sparse-table'] },
  { id: 'fenwick', title: 'Fenwick Tree (BIT)', tier: 2, cat: 'ds', stars: 4, hours: 3, prereqs: ['bit-manipulation', 'prefix-sums'],
    summary: 'Prefix sums with updates in a few lines, counting inversions, order statistics via binary lifting on the tree, 2D BIT.',
    keywords: ['fenwick', 'bit', 'binary indexed tree', 'inversions', 'order statistic'], viz: ['fenwick'] },
  { id: 'lazy-segment-tree', title: 'Lazy Propagation', tier: 2, cat: 'ds', stars: 4, hours: 4, prereqs: ['segment-tree'],
    summary: 'Range updates + range queries: range add / range assign with sum, min, max; composing lazy tags correctly.',
    keywords: ['lazy propagation', 'range update', 'range assign', 'segment tree'], viz: ['lazy-segment-tree'] },
  { id: 'dp-2', title: 'Dynamic Programming II', tier: 2, cat: 'dp', stars: 5, hours: 6, prereqs: ['dp-1', 'bit-manipulation', 'combinatorics'],
    summary: 'Bitmask DP (TSP, assignments), digit DP, interval DP, DP on subsets (SOS), counting DP with mod, DP + prefix sums and other transition speed-ups.',
    keywords: ['bitmask dp', 'digit dp', 'interval dp', 'sos dp', 'counting dp', 'tsp', 'broken profile'], viz: ['tsp-bitmask'] },
  { id: 'dp-trees', title: 'DP on Trees', tier: 2, cat: 'dp', stars: 4, hours: 4, prereqs: ['trees-1', 'dp-1'],
    summary: 'Subtree DP, rerooting (answers for every root), tree knapsack with the O(n²) merging argument, independent sets and matchings.',
    keywords: ['tree dp', 'rerooting', 'tree knapsack', 'independent set', 'small to large'], viz: ['tree-dfs'] },
  { id: 'lca', title: 'LCA & Binary Lifting', tier: 2, cat: 'graphs', stars: 5, hours: 4, prereqs: ['trees-1', 'bit-manipulation'],
    summary: 'k-th ancestor and LCA in O(log n), distances and path aggregates on trees, LCA via Euler tour + RMQ, functional graph jumping.',
    keywords: ['lca', 'binary lifting', 'kth ancestor', 'euler tour', 'path query', 'functional graph'], viz: ['binary-lifting'] },
  { id: 'scc-bridges', title: 'SCC, 2-SAT, Bridges & Articulation Points', tier: 2, cat: 'graphs', stars: 4, hours: 5, prereqs: ['topo-sort', 'trees-1'],
    summary: 'Tarjan/Kosaraju for strongly connected components, condensation DAG, 2-SAT, bridges and cut vertices, bridge tree and biconnected components.',
    keywords: ['scc', 'tarjan', 'kosaraju', '2-sat', 'bridges', 'articulation points', 'low link', 'condensation'], viz: ['scc'] },
  { id: 'number-theory-2', title: 'Number Theory II', tier: 2, cat: 'math', stars: 3, hours: 4, prereqs: ['number-theory-1', 'combinatorics'],
    summary: 'Euler’s totient, extended Euclid and CRT, linear sieve of multiplicative functions, Möbius inversion basics, Lucas theorem, baby-step giant-step.',
    keywords: ['totient', 'phi', 'crt', 'extended euclid', 'mobius', 'multiplicative', 'lucas', 'discrete log'], viz: ['gcd'] },
  { id: 'matrix-expo', title: 'Matrix Exponentiation & Linear Recurrences', tier: 2, cat: 'math', stars: 3, hours: 3, prereqs: ['number-theory-1', 'dp-1'],
    summary: 'Turn any linear recurrence or "count walks of length k" DP into log(k) matrix multiplications.',
    keywords: ['matrix', 'exponentiation', 'linear recurrence', 'fibonacci', 'walks'], viz: ['fast-pow'] },
  { id: 'probability-ev', title: 'Probability & Expected Value', tier: 2, cat: 'math', stars: 4, hours: 4, prereqs: ['combinatorics', 'dp-1'],
    summary: 'Linearity of expectation, expected value DP, probabilities modulo a prime, Markov-chain style systems and absorbing states.',
    keywords: ['expected value', 'probability', 'linearity', 'markov', 'modular probability'], viz: [] },
  { id: 'game-theory', title: 'Game Theory', tier: 2, cat: 'math', stars: 3, hours: 3, prereqs: ['bit-manipulation', 'dp-1'],
    summary: 'Winning/losing positions, Nim and the XOR rule, Sprague–Grundy for sums of games, and symmetry/strategy-stealing arguments.',
    keywords: ['nim', 'grundy', 'sprague', 'winning position', 'impartial game', 'mex'], viz: ['grundy'] },
  { id: 'geometry-1', title: 'Geometry I', tier: 2, cat: 'geometry', stars: 4, hours: 5, prereqs: ['math-basics', 'sorting-searching'],
    summary: 'Points and vectors with integer arithmetic, cross/dot products, orientation, segment intersection, polygon area, point in polygon, convex hull.',
    keywords: ['cross product', 'dot product', 'orientation', 'convex hull', 'polygon area', 'segment intersection', 'point in polygon'], viz: ['convex-hull'] },
  { id: 'sqrt-mo', title: 'Meet in the Middle, Sqrt Decomposition & Mo’s Algorithm', tier: 2, cat: 'advanced', stars: 3, hours: 4, prereqs: ['bit-manipulation', 'prefix-sums'],
    summary: 'Split the problem in halves, blocks of size √n, offline query ordering with Mo’s algorithm, and the heavy/light threshold trick.',
    keywords: ['meet in the middle', 'sqrt decomposition', 'mo', 'offline queries', 'blocks', 'heavy light threshold'], viz: [] },
  { id: 'strings-2', title: 'Strings II: Trie, Aho–Corasick, Suffix Structures', tier: 2, cat: 'strings', stars: 3, hours: 5, prereqs: ['strings-1', 'graphs-1'],
    summary: 'Tries and XOR tries, Aho–Corasick automaton for multi-pattern matching, suffix array with LCP (Kasai), suffix automaton overview.',
    keywords: ['trie', 'aho corasick', 'suffix array', 'lcp', 'kasai', 'suffix automaton', 'xor trie'], viz: ['trie'] },
  { id: 'flows', title: 'Max Flow, Min Cut & Bipartite Matching', tier: 2, cat: 'graphs', stars: 4, hours: 5, prereqs: ['shortest-paths', 'topo-sort'],
    summary: 'Dinic, modelling problems as flows, min cut = max flow, bipartite matching (Kuhn / Hopcroft–Karp), König and Hall, vertex covers and independent sets.',
    keywords: ['max flow', 'min cut', 'dinic', 'bipartite matching', 'kuhn', 'hopcroft karp', 'konig', 'hall'], viz: ['max-flow'] },
  { id: 'constructive', title: 'Constructive & Ad-hoc Problems', tier: 2, cat: 'core', stars: 5, hours: 4, prereqs: ['problem-solving', 'greedy'],
    summary: 'Invariants, parity, extremal arguments, building an explicit object, working from small cases, and printing -1 with confidence.',
    keywords: ['constructive', 'ad hoc', 'invariant', 'parity', 'extremal', 'pattern'], viz: [] },
  { id: 'interactive', title: 'Interactive Problems', tier: 2, cat: 'core', stars: 3, hours: 2, prereqs: ['binary-search'],
    summary: 'Flush your output, count your queries, binary search and bit-by-bit strategies, adaptive vs non-adaptive judges.',
    keywords: ['interactive', 'flush', 'queries', 'adaptive', 'endl'], viz: [] },

  /* ---------------- Tier 3 ---------------- */
  { id: 'dp-optimizations', title: 'DP Optimizations', tier: 3, cat: 'dp', stars: 3, hours: 5, prereqs: ['dp-2', 'segment-tree'],
    summary: 'Monotonic queue, divide & conquer DP, convex hull trick, Li Chao tree, Knuth optimization, and the Aliens (WQS) trick.',
    keywords: ['convex hull trick', 'li chao', 'divide and conquer dp', 'knuth', 'monotone queue', 'aliens trick', 'wqs'], viz: ['convex-hull-trick'] },
  { id: 'hld-centroid', title: 'Heavy-Light & Centroid Decomposition, DSU on Tree', tier: 3, cat: 'graphs', stars: 3, hours: 5, prereqs: ['lca', 'segment-tree', 'dp-trees'],
    summary: 'Path queries with HLD + segment tree, centroid decomposition for path-counting, small-to-large merging for subtree queries.',
    keywords: ['hld', 'heavy light', 'centroid decomposition', 'dsu on tree', 'small to large', 'path query'], viz: [] },
  { id: 'persistent-treap', title: 'Persistent Structures & Treaps', tier: 3, cat: 'ds', stars: 2, hours: 5, prereqs: ['segment-tree', 'lazy-segment-tree'],
    summary: 'Persistent segment tree (k-th smallest in a range, versions), implicit treap with split/merge, merge-sort tree.',
    keywords: ['persistent', 'treap', 'split merge', 'kth smallest', 'merge sort tree', 'implicit treap'], viz: [] },
  { id: 'fft-ntt', title: 'FFT / NTT & Polynomials', tier: 3, cat: 'math', stars: 2, hours: 4, prereqs: ['number-theory-2', 'combinatorics'],
    summary: 'Convolution in O(n log n), NTT with mod 998244353, counting pair sums, string matching with wildcards via FFT.',
    keywords: ['fft', 'ntt', 'convolution', 'polynomial', '998244353'], viz: [] },
  { id: 'geometry-2', title: 'Geometry II', tier: 3, cat: 'geometry', stars: 2, hours: 4, prereqs: ['geometry-1', 'binary-search'],
    summary: 'Rotating calipers, closest pair, half-plane intersection, circles and tangents, Minkowski sums, sweep-line for segments, precision management.',
    keywords: ['rotating calipers', 'closest pair', 'half plane', 'circle', 'minkowski', 'sweep line'], viz: ['closest-pair'] },
  { id: 'advanced-graphs', title: 'Advanced Graphs', tier: 3, cat: 'graphs', stars: 3, hours: 5, prereqs: ['flows', 'scc-bridges', 'dsu'],
    summary: 'Euler paths/circuits, min-cost flow, Hungarian algorithm, DSU with rollback & offline dynamic connectivity, functional graphs and cycles, dominators overview.',
    keywords: ['euler path', 'hierholzer', 'min cost flow', 'hungarian', 'dsu rollback', 'dynamic connectivity', 'functional graph'], viz: ['euler-path'] },
  { id: 'randomized-hashing', title: 'Randomization & Hashing Tricks', tier: 3, cat: 'advanced', stars: 3, hours: 3, prereqs: ['number-theory-1', 'strings-1'],
    summary: 'Random XOR hashing of sets, Zobrist hashing, Miller–Rabin and Pollard’s rho, randomized order for anti-hash, why 1e9+7 alone is not enough.',
    keywords: ['random', 'xor hashing', 'zobrist', 'miller rabin', 'pollard rho', 'anti hash', 'mt19937'], viz: [] },
  { id: 'linear-algebra', title: 'Gaussian Elimination & XOR Basis', tier: 3, cat: 'math', stars: 3, hours: 3, prereqs: ['bit-manipulation', 'number-theory-1'],
    summary: 'Solving linear systems mod p and over reals, matrix rank and determinant, linear basis over GF(2) for maximum XOR subsets.',
    keywords: ['gaussian elimination', 'xor basis', 'linear basis', 'determinant', 'rank'], viz: [] },
  { id: 'advanced-ds', title: 'Advanced Data Structures', tier: 3, cat: 'ds', stars: 2, hours: 4, prereqs: ['lazy-segment-tree', 'fenwick', 'binary-search'],
    summary: 'Dynamic (sparse) segment trees, segment tree beats overview, 2D structures, parallel binary search, offline CDQ divide & conquer, sweep-line + BIT.',
    keywords: ['dynamic segment tree', 'segment tree beats', '2d segment tree', 'parallel binary search', 'cdq', 'offline'], viz: [] },

  /* ---------------- Tier 4 ---------------- */
  { id: 'contest-strategy', title: 'ICPC Team Strategy & Contest Day', tier: 4, cat: 'meta', stars: 5, hours: 2, prereqs: ['problem-solving', 'implementation'],
    summary: 'How a 3-person, 1-computer, 5-hour ICPC contest actually works, how to read the scoreboard, penalty math, the Team Reference Document, and how to run mock contests.',
    keywords: ['team', 'strategy', 'penalty', 'scoreboard', 'reference document', 'mock contest', 'balloons'], viz: [] },
];

const Topics = (() => {
  const byId = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
  const get = (id) => byId[id] || null;
  const index = (id) => TOPICS.findIndex((t) => t.id === id);
  const next = (id) => TOPICS[index(id) + 1] || null;
  const prev = (id) => TOPICS[index(id) - 1] || null;
  const inTier = (tier) => TOPICS.filter((t) => t.tier === tier);
  const status = (id) => Store.topic(id).status;
  const learned = (id) => status(id) === 'learned';
  const prereqsMet = (id) => (get(id).prereqs || []).every(learned);
  const progress = (tier) => {
    const list = tier === undefined ? TOPICS : inTier(tier);
    const done = list.filter((t) => learned(t.id)).length;
    return { done, total: list.length, ratio: list.length ? done / list.length : 0 };
  };
  // First topic in order that is not learned and whose prerequisites are met (falls back to first unlearned).
  const recommended = () => TOPICS.find((t) => !learned(t.id) && prereqsMet(t.id)) || TOPICS.find((t) => !learned(t.id)) || null;
  const search = (q) => {
    q = q.trim().toLowerCase();
    if (!q) return [];
    return TOPICS.filter((t) => t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q) || (t.keywords || []).some((k) => k.includes(q)));
  };
  return { byId, get, index, next, prev, inTier, status, learned, prereqsMet, progress, recommended, search };
})();
