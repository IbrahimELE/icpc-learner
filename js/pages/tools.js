/* Tools: complexity calculator, constraint → technique guide, modular calculator, number facts, test generator, template generator. */
Pages.tools = (root) => {
  const esc = U.esc;
  const ops = Store.state.settings.opsPerSec || 1e8;
  const COMPLEXITIES = [
    ['O(1)', () => 1], ['O(log n)', (n) => Math.log2(n)], ['O(√n)', (n) => Math.sqrt(n)], ['O(n)', (n) => n], ['O(n log n)', (n) => n * Math.log2(n)],
    ['O(n log² n)', (n) => n * Math.log2(n) ** 2], ['O(n √n)', (n) => n * Math.sqrt(n)], ['O(n²)', (n) => n * n], ['O(n² log n)', (n) => n * n * Math.log2(n)], ['O(n³)', (n) => n ** 3],
    ['O(n⁴)', (n) => n ** 4], ['O(2ⁿ)', (n) => 2 ** n], ['O(2ⁿ · n)', (n) => 2 ** n * n], ['O(3ⁿ)', (n) => 3 ** n], ['O(n!)', (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }],
  ];
  const GUIDE = [
    [12, 'Try everything: permutations (n! ≈ 4.8·10⁸ for 12), 3ⁿ subset splits, brute force with pruning.'],
    [20, 'Bitmask over subsets: 2ⁿ or 2ⁿ·n. Meet in the middle for 2^(n/2). Bitmask DP (TSP-style).'],
    [40, 'Meet in the middle (2^20 per half), or exponential with heavy pruning; sometimes DP with a small extra dimension.'],
    [100, 'O(n⁴) is fine, O(n³) trivially. Floyd–Warshall, interval DP with an extra loop, matrix exponentiation over n×n.'],
    [500, 'O(n³): Floyd–Warshall, interval DP, Gaussian elimination, O(n³) flows, DP over pairs with a linear transition.'],
    [5000, 'O(n²) (or O(n² log n) with a small constant): pairwise checks, LIS/LCS quadratic, DP over (i, j).'],
    [1e5, 'O(n log n) or O(n √n): sorting, binary search, segment trees, Dijkstra, DSU, Mo’s algorithm, sqrt decomposition.'],
    [1e6, 'O(n) or O(n log n) with low constant: sieve, prefix sums, two pointers, hashing, linear DP. Watch memory and I/O.'],
    [1e7, 'O(n) only, with tight code and fast I/O. Sieve-like precomputation, bit tricks.'],
    [1e9, 'O(√n) or O(log n): factorization by trial division, binary search on the answer, digit DP, math formulas.'],
    [1e18, 'O(log n) or O(1): fast exponentiation, matrix power, digit DP, number theory identities, Pisano-style periodicity.'],
  ];

  root.innerHTML = `
    <div class="tool-grid">
      <div class="card">
        <div class="card-title">${UI.icon('timer')} Will it fit? — complexity calculator</div>
        <div class="inline-fields">
          <label class="field"><span>n</span><input class="input" id="cx-n" type="number" value="200000" min="1"></label>
          <label class="field"><span>Time limit (s)</span><input class="input" id="cx-tl" type="number" value="1" min="0.1" step="0.5"></label>
          <label class="field"><span>Ops / second</span><input class="input" id="cx-ops" type="number" value="${ops}" step="1e7"></label>
        </div>
        <div class="table-wrap mt"><table class="compact" id="cx-table"></table></div>
        <div class="muted tiny mt">"OK" = under 30% of the budget, "risky" = under the budget but constants matter (nested vectors, modulo, cache misses), "TLE" = over. Simple array loops run 3–10× faster than this estimate; map/set-heavy code 3–5× slower.</div>
      </div>

      <div class="card">
        <div class="card-title">${UI.icon('lightbulb')} Constraint → what the setters intend</div>
        <label class="field"><span>Maximum n in the statement</span><input class="input" id="g-n" type="number" value="100000" min="1"></label>
        <div id="g-out" class="mt"></div>
        <div class="muted tiny mt">Multiple parameters? Look at the product: n·m ≤ 10⁶ means O(nm) is intended; n ≤ 10⁵ with q ≤ 10⁵ means O((n+q) log n).</div>
      </div>

      <div class="card">
        <div class="card-title">${UI.icon('tool')} Modular calculator</div>
        <div class="inline-fields">
          <label class="field"><span>a</span><input class="input" id="m-a" value="2"></label>
          <label class="field"><span>b (exponent)</span><input class="input" id="m-b" value="100"></label>
          <label class="field"><span>mod</span><input class="input" id="m-m" value="1000000007"></label>
        </div>
        <div id="m-out" class="mt mono small"></div>
        <div class="inline-fields mt">
          <label class="field"><span>n</span><input class="input" id="c-n" value="10"></label>
          <label class="field"><span>k</span><input class="input" id="c-k" value="3"></label>
        </div>
        <div id="c-out" class="mt mono small"></div>
      </div>

      <div class="card">
        <div class="card-title">${UI.icon('info')} Numbers you should know</div>
        <table class="compact"><tbody>
          <tr><td><code>int</code> max</td><td class="mono">2 147 483 647 ≈ 2.1·10⁹</td></tr>
          <tr><td><code>long long</code> max</td><td class="mono">9 223 372 036 854 775 807 ≈ 9.2·10¹⁸</td></tr>
          <tr><td><code>unsigned long long</code> max</td><td class="mono">≈ 1.8·10¹⁹</td></tr>
          <tr><td><code>__int128</code> max</td><td class="mono">≈ 1.7·10³⁸</td></tr>
          <tr><td>(10⁹+7)² </td><td class="mono">≈ 10¹⁸ — fits in long long, so one multiplication of two residues is safe; two are not.</td></tr>
          <tr><td>double precision</td><td class="mono">~15–16 significant digits; exact for integers below 2⁵³ ≈ 9·10¹⁵</td></tr>
          <tr><td>2¹⁰, 2²⁰, 2³⁰</td><td class="mono">1 024 · 1 048 576 · 1 073 741 824</td></tr>
          <tr><td>12!, 13!, 20!, 21!</td><td class="mono">4.8·10⁸ (fits int) · 6.2·10⁹ · 2.4·10¹⁸ (fits ll) · overflow</td></tr>
          <tr><td>Memory</td><td class="mono">10⁶ ints = 4 MB; 10⁸ bytes (bool array) ≈ 95 MB; typical limit 256 MB</td></tr>
          <tr><td>Primes</td><td class="mono">10⁹+7, 998 244 353 (= 119·2²³+1, NTT-friendly), 10⁹+9, 10⁹+21, 10⁹+33</td></tr>
          <tr><td>Divisors</td><td class="mono">max divisors for n ≤ 10⁶: 240; n ≤ 10⁹: 1344; n ≤ 10¹⁸: 103 680</td></tr>
          <tr><td>Primes below</td><td class="mono">10⁶: 78 498 · 10⁷: 664 579 · 10⁸: 5 761 455</td></tr>
        </tbody></table>
      </div>

      <div class="card">
        <div class="card-title">${UI.icon('dice')} Random test generator</div>
        <div class="inline-fields">
          <label class="field"><span>Type</span><select class="input" id="rg-type"><option value="array">Array of n integers</option><option value="matrix">n × m matrix</option><option value="tree">Tree (n-1 edges)</option><option value="graph">Graph (n nodes, m edges)</option><option value="string">Lowercase string</option><option value="perm">Permutation</option></select></label>
          <label class="field"><span>n</span><input class="input" id="rg-n" type="number" value="8" min="1" max="2000"></label>
          <label class="field"><span>m</span><input class="input" id="rg-m" type="number" value="10" min="1" max="5000"></label>
          <label class="field"><span>min</span><input class="input" id="rg-lo" type="number" value="1"></label>
          <label class="field"><span>max</span><input class="input" id="rg-hi" type="number" value="20"></label>
        </div>
        <div class="row mt"><button class="btn primary small" id="rg-go">Generate</button><button class="btn small" id="rg-copy">Copy</button><a class="btn small ghost" href="#/playground">Use in playground →</a></div>
        <textarea class="input mt" id="rg-out" rows="7" readonly placeholder="Output appears here"></textarea>
      </div>

      <div class="card">
        <div class="card-title">${UI.icon('code')} Starter template generator</div>
        <div class="col small">
          <label class="checkbox"><input type="checkbox" id="tg-fast" checked> Fast I/O (cin.tie / sync_with_stdio)</label>
          <label class="checkbox"><input type="checkbox" id="tg-multi" checked> Multiple test cases loop</label>
          <label class="checkbox"><input type="checkbox" id="tg-debug" checked> Debug macro (prints only with -DLOCAL)</label>
          <label class="checkbox"><input type="checkbox" id="tg-defs"> Short aliases (ll, vi, pii, all())</label>
          <label class="checkbox"><input type="checkbox" id="tg-mod"> MOD constant + modpow</label>
        </div>
        <div class="row mt"><button class="btn primary small" id="tg-copy">Copy template</button><button class="btn small" id="tg-play">Open in playground</button></div>
        <div id="tg-out" class="mt"></div>
      </div>
    </div>`;

  /* complexity table */
  const cx = () => {
    const n = Math.max(1, +root.querySelector('#cx-n').value || 1), tl = +root.querySelector('#cx-tl').value || 1, o = +root.querySelector('#cx-ops').value || 1e8;
    const budget = tl * o;
    root.querySelector('#cx-table').innerHTML = `<thead><tr><th>Complexity</th><th>Operations</th><th>Est. time</th><th>Verdict</th></tr></thead><tbody>${COMPLEXITIES.map(([name, f]) => {
      const v = f(n);
      const t = v / o;
      const verdict = !isFinite(v) || v > budget ? 'TLE' : v > budget * 0.3 ? 'risky' : 'OK';
      return `<tr><td class="mono">${name}</td><td class="mono">${isFinite(v) ? U.sci(v) : '∞'}</td><td class="mono">${!isFinite(t) ? '—' : t < 1e-3 ? '<1 ms' : t < 1 ? Math.round(t * 1000) + ' ms' : t < 3600 ? t.toFixed(1) + ' s' : t < 3600 * 24 * 365 ? (t / 3600).toFixed(1) + ' h' : 'ages'}</td><td class="verdict-cell ${verdict.toLowerCase()}">${verdict}</td></tr>`;
    }).join('')}</tbody>`;
  };
  ['#cx-n', '#cx-tl', '#cx-ops'].forEach((id) => root.querySelector(id).addEventListener('input', cx));
  cx();

  /* guide */
  const guide = () => {
    const n = +root.querySelector('#g-n').value || 1;
    const row = GUIDE.find(([lim]) => n <= lim) || GUIDE[GUIDE.length - 1];
    const idx = GUIDE.indexOf(row);
    root.querySelector('#g-out').innerHTML = `<div class="callout recognize" style="margin:0"><div class="callout-title">n ≤ ${U.fmtNum(row[0])}</div><p>${esc(row[1])}</p></div>${idx + 1 < GUIDE.length ? `<div class="muted small mt">If the limit were up to ${U.fmtNum(GUIDE[idx + 1][0])}: ${esc(GUIDE[idx + 1][1])}</div>` : ''}`;
  };
  root.querySelector('#g-n').addEventListener('input', guide);
  guide();

  /* modular */
  const big = (s) => { try { return BigInt(String(s).trim()); } catch (_) { return null; } };
  const modpow = (a, b, m) => { a = ((a % m) + m) % m; let r = 1n; while (b > 0n) { if (b & 1n) r = (r * a) % m; a = (a * a) % m; b >>= 1n; } return r; };
  const gcd = (a, b) => { while (b) { [a, b] = [b, a % b]; } return a; };
  const modcalc = () => {
    const a = big(root.querySelector('#m-a').value), b = big(root.querySelector('#m-b').value), m = big(root.querySelector('#m-m').value);
    const out = root.querySelector('#m-out');
    if (a === null || b === null || m === null || m <= 0n || b < 0n) { out.textContent = 'Enter integers (mod > 0, b ≥ 0).'; return; }
    const g = gcd(((a % m) + m) % m, m);
    const lines = [`a^b mod m = ${modpow(a, b, m)}`];
    lines.push(g === 1n ? `a⁻¹ mod m = ${modpow(a, m - 2n, m)}  (via Fermat; valid only if m is prime — for composite m use extended Euclid)` : `a has no inverse mod m (gcd = ${g})`);
    lines.push(`a mod m = ${((a % m) + m) % m}`);
    out.innerHTML = lines.map(esc).join('<br>');
  };
  ['#m-a', '#m-b', '#m-m'].forEach((id) => root.querySelector(id).addEventListener('input', modcalc));
  modcalc();
  const ncr = () => {
    const n = +root.querySelector('#c-n').value, k = +root.querySelector('#c-k').value, m = big(root.querySelector('#m-m').value) || 1000000007n;
    const out = root.querySelector('#c-out');
    if (!(n >= 0 && k >= 0 && n <= 5000)) { out.textContent = 'n, k ≥ 0 and n ≤ 5000 for exact values.'; return; }
    if (k > n) { out.textContent = `C(${n}, ${k}) = 0`; return; }
    let r = 1n;
    for (let i = 1n; i <= BigInt(k); i++) r = (r * (BigInt(n) - i + 1n)) / i;
    const s = r.toString();
    out.innerHTML = `C(${n}, ${k}) = ${esc(s.length > 60 ? s.slice(0, 57) + '…' : s)} (${s.length} digits)<br>C(${n}, ${k}) mod m = ${r % m}`;
  };
  ['#c-n', '#c-k', '#m-m'].forEach((id) => root.querySelector(id).addEventListener('input', ncr));
  ncr();

  /* random generator */
  const gen = () => {
    const type = root.querySelector('#rg-type').value, n = U.clamp(+root.querySelector('#rg-n').value || 1, 1, 2000), m = U.clamp(+root.querySelector('#rg-m').value || 1, 1, 5000);
    const lo = +root.querySelector('#rg-lo').value || 0, hi = Math.max(lo, +root.querySelector('#rg-hi').value || 0);
    const r = () => U.randInt(lo, hi);
    let out = '';
    if (type === 'array') out = `${n}\n${Array.from({ length: n }, r).join(' ')}\n`;
    else if (type === 'matrix') out = `${n} ${m}\n${Array.from({ length: n }, () => Array.from({ length: m }, r).join(' ')).join('\n')}\n`;
    else if (type === 'tree') out = `${n}\n${Array.from({ length: n - 1 }, (_, i) => `${U.randInt(1, i + 1)} ${i + 2}`).join('\n')}\n`;
    else if (type === 'graph') { const edges = new Set(); const mm = Math.min(m, (n * (n - 1)) / 2); let guard = 0; while (edges.size < mm && guard++ < 1e5) { const a = U.randInt(1, n), b = U.randInt(1, n); if (a !== b) edges.add(a < b ? `${a} ${b}` : `${b} ${a}`); } out = `${n} ${edges.size}\n${Array.from(edges).join('\n')}\n`; }
    else if (type === 'string') out = `${Array.from({ length: n }, () => String.fromCharCode(97 + U.randInt(0, Math.min(25, Math.max(0, hi - 1))))).join('')}\n`;
    else if (type === 'perm') out = `${n}\n${U.shuffle(Array.from({ length: n }, (_, i) => i + 1)).join(' ')}\n`;
    root.querySelector('#rg-out').value = out;
  };
  root.querySelector('#rg-go').addEventListener('click', gen);
  root.querySelector('#rg-copy').addEventListener('click', async () => { if (await U.copy(root.querySelector('#rg-out').value)) UI.toast('Copied'); });
  gen();

  /* template generator */
  const tpl = () => {
    const fast = root.querySelector('#tg-fast').checked, multi = root.querySelector('#tg-multi').checked, dbg = root.querySelector('#tg-debug').checked, defs = root.querySelector('#tg-defs').checked, mod = root.querySelector('#tg-mod').checked;
    let s = '#include <bits/stdc++.h>\nusing namespace std;\n';
    if (defs) s += 'using ll = long long;\nusing vi = vector<int>;\nusing pii = pair<int, int>;\n#define all(x) begin(x), end(x)\n';
    else s += 'using ll = long long;\n';
    if (dbg) s += '\n#ifdef LOCAL\n#define dbg(x) cerr << #x << " = " << (x) << "\\n"\n#else\n#define dbg(x)\n#endif\n';
    if (mod) s += '\nconst ll MOD = 1000000007;\nll modpow(ll b, ll e) {\n    ll r = 1; b %= MOD;\n    while (e > 0) { if (e & 1) r = r * b % MOD; b = b * b % MOD; e >>= 1; }\n    return r;\n}\n';
    s += '\nvoid solve() {\n    int n;\n    cin >> n;\n    // ...\n}\n\nint main() {\n';
    if (fast) s += '    cin.tie(nullptr)->sync_with_stdio(false);\n';
    if (multi) s += '    int t = 1;\n    cin >> t;\n    while (t--) solve();\n'; else s += '    solve();\n';
    s += '    return 0;\n}\n';
    root.querySelector('#tg-out').innerHTML = MD.codeBlock(s, 'cpp', 'main.cpp');
    MD.activate(root.querySelector('#tg-out'));
    return s;
  };
  ['#tg-fast', '#tg-multi', '#tg-debug', '#tg-defs', '#tg-mod'].forEach((id) => root.querySelector(id).addEventListener('change', tpl));
  root.querySelector('#tg-copy').addEventListener('click', async () => { if (await U.copy(tpl())) UI.toast('Template copied'); });
  root.querySelector('#tg-play').addEventListener('click', () => { sessionStorage.setItem('seerc-play-code', tpl()); Router.go('#/playground?load=1'); });
  tpl();
};
