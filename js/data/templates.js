/* Code templates (part 1: setup, math, data structures). Every cpp template compiles with g++ -std=gnu++20.
   Shape: { id, title, cat, topic, tags, desc, code, lang? } — code uses String.raw so backslashes are literal. */
const TEMPLATES = [];

TEMPLATES.push(
  { id: 'main-template', title: 'Main template (fast I/O, multi-test, debug macro)', cat: 'Setup', topic: 'cpp-basics', tags: ['main', 'template', 'fast io', 'debug'],
    desc: 'Start every solution from this. `dbg(x)` prints only when compiled with `-DLOCAL`, so you can leave it in submitted code.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

#ifdef LOCAL
#define dbg(x) cerr << #x << " = " << (x) << '\n'
#else
#define dbg(x)
#endif

void solve() {
    int n;
    cin >> n;
    vector<ll> a(n);
    for (auto& x : a) cin >> x;
    ll sum = accumulate(a.begin(), a.end(), 0LL);
    dbg(sum);
    cout << sum << '\n';
}

int main() {
    cin.tie(nullptr)->sync_with_stdio(false);
    int t = 1;
    cin >> t;            // remove these two lines if there is a single test case
    while (t--) solve();
    return 0;
}
` },
  { id: 'debug-print', title: 'Debug printing for containers', cat: 'Setup', topic: 'implementation', tags: ['debug', 'print', 'vector', 'pair'],
    desc: 'Print vectors, pairs, maps and sets with one `dbg(...)` call. Compiled away without `-DLOCAL`.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

template <class A, class B> ostream& operator<<(ostream& os, const pair<A, B>& p) { return os << '(' << p.first << ", " << p.second << ')'; }
template <class T, class = decltype(begin(declval<T>())),
          class = enable_if_t<!is_same<T, string>::value && !is_array<T>::value>>
ostream& operator<<(ostream& os, const T& c) {
    os << '{';
    bool first = true;
    for (const auto& x : c) { if (!first) os << ", "; first = false; os << x; }
    return os << '}';
}
void dbg_out() { cerr << '\n'; }
template <class H, class... T> void dbg_out(const H& h, const T&... t) { cerr << h; if (sizeof...(t)) cerr << ", "; dbg_out(t...); }
#ifdef LOCAL
#define dbg(...) cerr << "[" << #__VA_ARGS__ << "] = ", dbg_out(__VA_ARGS__)
#else
#define dbg(...)
#endif

int main() {
    vector<pair<int, string>> v = {{1, "a"}, {2, "b"}};
    map<string, int> m = {{"x", 1}};
    set<int> s = {3, 1, 2};
    int k = 5;
    dbg(v, m, s, k);   // [v, m, s, k] = {(1, a), (2, b)}, {(x, 1)}, {1, 2, 3}, 5
    return 0;
}
` },
  { id: 'random-gen', title: 'Random numbers & test generator', cat: 'Setup', topic: 'implementation', tags: ['random', 'mt19937', 'generator', 'shuffle'],
    desc: 'Never use `rand()`. Seeded `mt19937_64` plus a helper; `argv[1]` seeding makes stress-test runs reproducible.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count());
long long rnd(long long lo, long long hi) { return uniform_int_distribution<long long>(lo, hi)(rng); }

int main(int argc, char** argv) {
    if (argc > 1) rng.seed(atoi(argv[1]));   // stress tester passes the iteration number
    int n = rnd(1, 8);
    vector<int> p(n);
    iota(p.begin(), p.end(), 1);
    shuffle(p.begin(), p.end(), rng);       // random permutation
    cout << n << '\n';
    for (int x : p) cout << x << ' ';
    cout << '\n';
    // random tree: parent of i is a random earlier node
    for (int i = 2; i <= n; i++) cout << rnd(1, i - 1) << ' ' << i << '\n';
    return 0;
}
` },
  { id: 'stress-script', title: 'Stress-test scripts (Windows + bash)', cat: 'Setup', topic: 'implementation', tags: ['stress', 'script', 'bat', 'bash'], lang: 'text',
    desc: 'Compile gen.cpp, brute.cpp, sol.cpp with `g++ -O2`, then run. The Playground has a built-in version of this loop.',
    code: String.raw`:: ---------- stress.bat (Windows, double-click or run in cmd) ----------
@echo off
for /L %%i in (1,1,300) do (
  gen.exe %%i > in.txt
  brute.exe < in.txt > out_brute.txt
  sol.exe < in.txt > out_sol.txt
  fc /W out_brute.txt out_sol.txt > nul || (echo Mismatch on test %%i & type in.txt & exit /b 1)
)
echo All 300 tests passed

# ---------- stress.sh (Linux, macOS, Git Bash) ----------
for i in $(seq 1 300); do
  ./gen $i > in.txt
  ./brute < in.txt > out_brute.txt
  ./sol < in.txt > out_sol.txt
  if ! diff -bq out_brute.txt out_sol.txt > /dev/null; then echo "Mismatch on test $i"; cat in.txt; exit 1; fi
done
echo "All tests passed"
` },

  /* ---------------- MATH ---------------- */
  { id: 'modint', title: 'Modular arithmetic: power, inverse, Mint', cat: 'Math', topic: 'number-theory-1', tags: ['mod', 'modpow', 'inverse', 'mint', 'fermat'],
    desc: 'Fast exponentiation, Fermat inverse and a `Mint` struct so you can write `a * b / c` without thinking about `%`.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll MOD = 1000000007;   // or 998244353

ll power(ll b, ll e, ll m = MOD) {
    ll r = 1; b %= m; if (b < 0) b += m;
    while (e > 0) { if (e & 1) r = r * b % m; b = b * b % m; e >>= 1; }
    return r;
}
ll inv(ll a) { return power(a, MOD - 2); }   // requires MOD prime and a % MOD != 0

struct Mint {
    ll v;
    Mint(ll x = 0) : v((x % MOD + MOD) % MOD) {}
    Mint& operator+=(Mint o) { v += o.v; if (v >= MOD) v -= MOD; return *this; }
    Mint& operator-=(Mint o) { v -= o.v; if (v < 0) v += MOD; return *this; }
    Mint& operator*=(Mint o) { v = v * o.v % MOD; return *this; }
    Mint& operator/=(Mint o) { return *this *= Mint(power(o.v, MOD - 2)); }
    friend Mint operator+(Mint a, Mint b) { return a += b; }
    friend Mint operator-(Mint a, Mint b) { return a -= b; }
    friend Mint operator*(Mint a, Mint b) { return a *= b; }
    friend Mint operator/(Mint a, Mint b) { return a /= b; }
    Mint pow(ll e) const { return Mint(power(v, e)); }
    friend ostream& operator<<(ostream& os, Mint m) { return os << m.v; }
};

int main() {
    Mint a = 5, b = 7;
    cout << a * b << ' ' << a / b << ' ' << Mint(2).pow(100) << ' ' << Mint(-3) << '\n';
    return 0;
}
` },
  { id: 'sieve-factorize', title: 'Sieve, smallest prime factor, factorization, divisors', cat: 'Math', topic: 'number-theory-1', tags: ['sieve', 'primes', 'factorize', 'divisors', 'spf'],
    desc: 'Linear sieve giving every prime and the smallest prime factor (O(log) factorization for values ≤ N), trial division for big values, and divisor enumeration.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

const int N = 1000000;          // up to ~1e7 fits comfortably (40 MB for spf as int)
vector<int> spf, primes;
void sieve() {
    spf.assign(N + 1, 0);
    for (int i = 2; i <= N; i++) {
        if (spf[i] == 0) { spf[i] = i; primes.push_back(i); }
        for (int p : primes) {
            if (p > spf[i] || (ll)p * i > N) break;
            spf[p * i] = p;
        }
    }
}
vector<pair<int, int>> factorize(int x) {          // x <= N, O(log x)
    vector<pair<int, int>> f;
    while (x > 1) { int p = spf[x], c = 0; while (x % p == 0) { x /= p; c++; } f.push_back({p, c}); }
    return f;
}
vector<pair<ll, int>> factorizeBig(ll x) {         // any x <= ~1e12 quickly, O(sqrt x)
    vector<pair<ll, int>> f;
    for (ll p = 2; p * p <= x; p++) {
        if (x % p) continue;
        int c = 0; while (x % p == 0) { x /= p; c++; }
        f.push_back({p, c});
    }
    if (x > 1) f.push_back({x, 1});
    return f;
}
vector<ll> divisors(const vector<pair<ll, int>>& f) {
    vector<ll> d = {1};
    for (auto [p, c] : f) {
        int sz = d.size(); ll pw = 1;
        for (int i = 1; i <= c; i++) { pw *= p; for (int j = 0; j < sz; j++) d.push_back(d[j] * pw); }
    }
    return d;
}
int main() {
    sieve();
    cout << primes.size() << " primes up to " << N << '\n';        // 78498
    for (auto [p, c] : factorize(360)) cout << p << '^' << c << ' ';  // 2^3 3^2 5^1
    cout << '\n';
    auto d = divisors(factorizeBig(360));
    sort(d.begin(), d.end());
    cout << d.size() << " divisors\n";                               // 24
    return 0;
}
` },
  { id: 'combinatorics-ncr', title: 'Factorials, nCr mod p, stars & bars, Catalan', cat: 'Math', topic: 'combinatorics', tags: ['ncr', 'binomial', 'factorial', 'catalan', 'stars and bars'],
    desc: 'Precompute factorials and inverse factorials once; every binomial coefficient is then O(1).',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll MOD = 1000000007;
const int MAXN = 1000000;
ll fact[MAXN + 1], inv_fact[MAXN + 1];

ll power(ll b, ll e) { ll r = 1; b %= MOD; while (e) { if (e & 1) r = r * b % MOD; b = b * b % MOD; e >>= 1; } return r; }
void precompute() {
    fact[0] = 1;
    for (int i = 1; i <= MAXN; i++) fact[i] = fact[i - 1] * i % MOD;
    inv_fact[MAXN] = power(fact[MAXN], MOD - 2);
    for (int i = MAXN; i > 0; i--) inv_fact[i - 1] = inv_fact[i] * i % MOD;
}
ll C(int n, int r) { if (r < 0 || r > n) return 0; return fact[n] * inv_fact[r] % MOD * inv_fact[n - r] % MOD; }
ll starsBars(int n, int k) { return C(n + k - 1, k - 1); }              // n identical items into k boxes (empty allowed)
ll catalan(int n) { return C(2 * n, n) * power(n + 1, MOD - 2) % MOD; }  // balanced brackets, binary trees, ...

int main() {
    precompute();
    cout << C(10, 3) << ' ' << starsBars(5, 3) << ' ' << catalan(4) << '\n';   // 120 21 14
    return 0;
}
` },
  { id: 'extgcd-crt', title: 'Extended Euclid, inverse for any modulus, CRT', cat: 'Math', topic: 'number-theory-2', tags: ['extgcd', 'crt', 'inverse', 'diophantine'],
    desc: 'Solves a·x + b·y = gcd, modular inverses when the modulus is not prime, and combines two congruences.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

ll extgcd(ll a, ll b, ll& x, ll& y) {   // returns g = gcd(a,b), with a*x + b*y = g
    if (b == 0) { x = 1; y = 0; return a; }
    ll x1, y1, g = extgcd(b, a % b, x1, y1);
    x = y1; y = x1 - (a / b) * y1;
    return g;
}
ll modinv(ll a, ll m) {                  // inverse of a mod m (any m), or -1 if gcd != 1
    ll x, y, g = extgcd(((a % m) + m) % m, m, x, y);
    return g != 1 ? -1 : ((x % m) + m) % m;
}
// x ≡ a1 (mod m1), x ≡ a2 (mod m2)  ->  {x, lcm(m1,m2)} or {-1,-1} if no solution
pair<ll, ll> crt(ll a1, ll m1, ll a2, ll m2) {
    ll x, y, g = extgcd(m1, m2, x, y);
    if ((a2 - a1) % g != 0) return {-1, -1};
    ll l = m1 / g * m2;
    __int128 t = (__int128)((a2 - a1) / g) % (m2 / g) * x % (m2 / g);
    ll res = (ll)(((__int128)a1 + (__int128)m1 * t) % l);
    if (res < 0) res += l;
    return {res, l};
}
int main() {
    cout << modinv(3, 7) << '\n';       // 5
    auto [x, l] = crt(2, 3, 3, 5);      // 8 15
    cout << x << ' ' << l << '\n';
    return 0;
}
` },
  { id: 'matrix-power', title: 'Matrix exponentiation (linear recurrences)', cat: 'Math', topic: 'matrix-expo', tags: ['matrix', 'fibonacci', 'recurrence', 'power'],
    desc: 'Any linear recurrence or “count walks of length k” becomes O(n³ log k).',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll MOD = 1000000007;

struct Matrix {
    int n; vector<vector<ll>> a;
    Matrix(int n) : n(n), a(n, vector<ll>(n, 0)) {}
    static Matrix identity(int n) { Matrix I(n); for (int i = 0; i < n; i++) I.a[i][i] = 1; return I; }
    Matrix operator*(const Matrix& o) const {
        Matrix r(n);
        for (int i = 0; i < n; i++)
            for (int k = 0; k < n; k++) {
                if (a[i][k] == 0) continue;
                for (int j = 0; j < n; j++) r.a[i][j] = (r.a[i][j] + a[i][k] * o.a[k][j]) % MOD;
            }
        return r;
    }
    Matrix pow(ll e) const {
        Matrix r = identity(n), b = *this;
        while (e > 0) { if (e & 1) r = r * b; b = b * b; e >>= 1; }
        return r;
    }
};
ll fib(ll n) {                       // F(0)=0, F(1)=1
    Matrix m(2);
    m.a = {{1, 1}, {1, 0}};
    return m.pow(n).a[0][1];
}
int main() {
    cout << fib(10) << ' ' << fib(1000000000000000000LL) << '\n';   // 55 ...
    return 0;
}
` },
  { id: 'phi-mobius', title: 'Linear sieve of φ and μ', cat: 'Math', topic: 'number-theory-2', tags: ['totient', 'phi', 'mobius', 'multiplicative', 'linear sieve'],
    desc: 'Euler’s totient and the Möbius function for all values up to N in O(N).',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
const int N = 1000000;
int phi[N + 1], mu[N + 1];
bool comp[N + 1];
vector<int> primes;

void sieve() {
    phi[1] = 1; mu[1] = 1;
    for (int i = 2; i <= N; i++) {
        if (!comp[i]) { primes.push_back(i); phi[i] = i - 1; mu[i] = -1; }
        for (int p : primes) {
            long long ip = (long long)p * i;
            if (ip > N) break;
            comp[ip] = true;
            if (i % p == 0) { phi[ip] = phi[i] * p; mu[ip] = 0; break; }
            phi[ip] = phi[i] * (p - 1); mu[ip] = -mu[i];
        }
    }
}
int main() {
    sieve();
    cout << phi[12] << ' ' << mu[30] << ' ' << mu[12] << '\n';   // 4 -1 0
    return 0;
}
` },
  { id: 'miller-rabin-pollard', title: 'Miller–Rabin + Pollard’s rho (64-bit)', cat: 'Math', topic: 'randomized-hashing', tags: ['prime', 'miller rabin', 'pollard', 'factorize', 'int128'],
    desc: 'Deterministic primality for all 64-bit integers and factorization of numbers up to 10¹⁸ in milliseconds.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using u64 = unsigned long long;
using u128 = unsigned __int128;

u64 mulmod(u64 a, u64 b, u64 m) { return (u128)a * b % m; }
u64 powmod(u64 b, u64 e, u64 m) { u64 r = 1; b %= m; while (e) { if (e & 1) r = mulmod(r, b, m); b = mulmod(b, b, m); e >>= 1; } return r; }
bool isPrime(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}) if (n % p == 0) return n == p;
    u64 d = n - 1; int s = 0;
    while ((d & 1) == 0) { d >>= 1; s++; }
    for (u64 a : {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}) {   // deterministic for n < 2^64
        u64 x = powmod(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 1; i < s; i++) { x = mulmod(x, x, n); if (x == n - 1) { composite = false; break; } }
        if (composite) return false;
    }
    return true;
}
u64 pollard(u64 n) {                  // a non-trivial factor of composite n
    if (n % 2 == 0) return 2;
    static mt19937_64 rng(12345);
    while (true) {
        u64 x = rng() % n, y = x, c = rng() % n, d = 1;
        auto f = [&](u64 v) { return (mulmod(v, v, n) + c) % n; };
        while (d == 1) { x = f(x); y = f(f(y)); d = __gcd(x > y ? x - y : y - x, n); }
        if (d != n) return d;
    }
}
void factor(u64 n, vector<u64>& out) {
    if (n == 1) return;
    if (isPrime(n)) { out.push_back(n); return; }
    u64 d = pollard(n);
    factor(d, out); factor(n / d, out);
}
int main() {
    vector<u64> f; factor(600851475143ULL, f); sort(f.begin(), f.end());
    for (u64 x : f) cout << x << ' ';                 // 71 839 1471 6857
    cout << '\n' << isPrime(1000000007) << '\n';     // 1
    return 0;
}
` },
  { id: 'ntt', title: 'NTT convolution (mod 998244353)', cat: 'Math', topic: 'fft-ntt', tags: ['ntt', 'fft', 'convolution', 'polynomial'],
    desc: 'Multiply two polynomials (or count pair sums) in O(n log n) with exact modular arithmetic.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll MOD = 998244353, G = 3;

ll power(ll b, ll e) { ll r = 1; b %= MOD; while (e) { if (e & 1) r = r * b % MOD; b = b * b % MOD; e >>= 1; } return r; }
void ntt(vector<ll>& a, bool invert) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        ll w = power(G, (MOD - 1) / len);
        if (invert) w = power(w, MOD - 2);
        for (int i = 0; i < n; i += len) {
            ll wn = 1;
            for (int j = 0; j < len / 2; j++) {
                ll u = a[i + j], v = a[i + j + len / 2] * wn % MOD;
                a[i + j] = u + v < MOD ? u + v : u + v - MOD;
                a[i + j + len / 2] = u - v >= 0 ? u - v : u - v + MOD;
                wn = wn * w % MOD;
            }
        }
    }
    if (invert) { ll inv_n = power(n, MOD - 2); for (ll& x : a) x = x * inv_n % MOD; }
}
vector<ll> multiply(vector<ll> a, vector<ll> b) {
    int need = a.size() + b.size() - 1, n = 1;
    while (n < need) n <<= 1;
    a.resize(n); b.resize(n);
    ntt(a, false); ntt(b, false);
    for (int i = 0; i < n; i++) a[i] = a[i] * b[i] % MOD;
    ntt(a, true);
    a.resize(need);
    return a;
}
int main() {
    auto c = multiply({1, 2, 3}, {4, 5});   // 4 13 22 15
    for (ll x : c) cout << x << ' ';
    cout << '\n';
    return 0;
}
` },
  { id: 'gauss-xor-basis', title: 'XOR basis + Gaussian elimination mod p', cat: 'Math', topic: 'linear-algebra', tags: ['xor basis', 'gauss', 'linear algebra', 'rank'],
    desc: 'Linear basis over GF(2) for maximum-XOR problems, and a modular Gauss–Jordan solver with consistency check.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct XorBasis {
    static const int B = 60;
    ll basis[B] = {};
    int size = 0;
    bool insert(ll x) {
        for (int b = B - 1; b >= 0; b--) {
            if (!(x >> b & 1)) continue;
            if (!basis[b]) { basis[b] = x; size++; return true; }
            x ^= basis[b];
        }
        return false;   // x was already representable
    }
    bool canRepresent(ll x) { for (int b = B - 1; b >= 0; b--) if (x >> b & 1) { if (!basis[b]) return false; x ^= basis[b]; } return true; }
    ll maxXor() { ll r = 0; for (int b = B - 1; b >= 0; b--) r = max(r, r ^ basis[b]); return r; }
};

const ll MOD = 1000000007;
ll power(ll b, ll e) { ll r = 1; b %= MOD; while (e) { if (e & 1) r = r * b % MOD; b = b * b % MOD; e >>= 1; } return r; }
// a is the n x (m+1) augmented matrix. Returns rank, or -1 if inconsistent. Free variables are set to 0.
int gauss(vector<vector<ll>> a, vector<ll>& x) {
    int n = a.size(), m = a[0].size() - 1, rank = 0;
    vector<int> where(m, -1);
    for (int col = 0, row = 0; col < m && row < n; col++) {
        int sel = row;
        while (sel < n && a[sel][col] == 0) sel++;
        if (sel == n) continue;
        swap(a[sel], a[row]);
        ll inv = power(a[row][col], MOD - 2);
        for (int j = col; j <= m; j++) a[row][j] = a[row][j] * inv % MOD;
        for (int i = 0; i < n; i++) if (i != row && a[i][col]) {
            ll f = a[i][col];
            for (int j = col; j <= m; j++) a[i][j] = ((a[i][j] - f * a[row][j]) % MOD + MOD) % MOD;
        }
        where[col] = row; row++; rank++;
    }
    x.assign(m, 0);
    for (int j = 0; j < m; j++) if (where[j] != -1) x[j] = a[where[j]][m];
    for (int i = 0; i < n; i++) {
        ll s = 0;
        for (int j = 0; j < m; j++) s = (s + a[i][j] * x[j]) % MOD;
        if (s != a[i][m]) return -1;
    }
    return rank;
}
int main() {
    XorBasis xb; for (ll v : {3, 5, 6}) xb.insert(v);
    cout << xb.maxXor() << ' ' << xb.size << '\n';            // 6 2
    vector<ll> x; int r = gauss({{2, 1, 5}, {1, 3, 10}}, x);  // 2a+b=5, a+3b=10 -> a=1, b=3
    cout << r << ' ' << x[0] << ' ' << x[1] << '\n';
    return 0;
}
` },
  { id: 'binary-search-templates', title: 'Binary search templates (int, real, ternary)', cat: 'Math', topic: 'binary-search', tags: ['binary search', 'first true', 'ternary', 'unimodal'],
    desc: 'Four bug-free searches you will reuse constantly: first/last true on integers, real-valued search, unimodal minimum.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

// smallest x in [lo, hi] with ok(x) (ok is false...false true...true). Returns hi+1 if none.
template <class F> ll firstTrue(ll lo, ll hi, F ok) {
    hi++;
    while (lo < hi) { ll mid = lo + (hi - lo) / 2; if (ok(mid)) hi = mid; else lo = mid + 1; }
    return lo;
}
// largest x in [lo, hi] with ok(x) (true...true false...false). Returns lo-1 if none.
template <class F> ll lastTrue(ll lo, ll hi, F ok) {
    lo--;
    while (lo < hi) { ll mid = lo + (hi - lo + 1) / 2; if (ok(mid)) lo = mid; else hi = mid - 1; }
    return lo;
}
// real numbers: fixed iteration count, never "while (hi - lo > eps)"
template <class F> double firstTrueReal(double lo, double hi, F ok) {
    for (int it = 0; it < 100; it++) { double mid = (lo + hi) / 2; if (ok(mid)) hi = mid; else lo = mid; }
    return hi;
}
// integer argmin of a unimodal (decreasing then increasing) function
template <class F> ll argminUnimodal(ll lo, ll hi, F f) {
    while (lo < hi) { ll mid = lo + (hi - lo) / 2; if (f(mid) <= f(mid + 1)) hi = mid; else lo = mid + 1; }
    return lo;
}
int main() {
    vector<int> a = {1, 3, 3, 7, 9};
    cout << firstTrue(0, 4, [&](ll i) { return a[i] >= 3; }) << '\n';                        // 1
    cout << lastTrue(0, 4, [&](ll i) { return a[i] <= 3; }) << '\n';                         // 2
    cout << firstTrue(0, 2000000000, [&](ll x) { return x * x >= 1000000000LL; }) << '\n';  // 31623
    printf("%.6f\n", firstTrueReal(0, 100, [](double x) { return x * x >= 2; }));            // 1.414214
    cout << argminUnimodal(-100, 100, [](ll x) { return (x - 7) * (x - 7); }) << '\n';       // 7
    return 0;
}
` },

  /* ---------------- DATA STRUCTURES ---------------- */
  { id: 'segment-tree-iterative', title: 'Segment tree (iterative, generic)', cat: 'Data structures', topic: 'segment-tree', tags: ['segment tree', 'range query', 'point update', 'iterative'],
    desc: 'Point assign + range query for any associative operation with an identity (sum, min, max, gcd, custom struct). Half-open queries [l, r).',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

template <class T, class F> struct SegTree {
    int n; vector<T> t; T id; F op;
    SegTree(int n, T id, F op) : n(n), t(2 * n, id), id(id), op(op) {}
    SegTree(const vector<T>& a, T id, F op) : SegTree(a.size(), id, op) {
        for (int i = 0; i < n; i++) t[n + i] = a[i];
        for (int i = n - 1; i > 0; i--) t[i] = op(t[2 * i], t[2 * i + 1]);
    }
    void set(int i, T v) { for (t[i += n] = v; i > 1; i >>= 1) t[i >> 1] = op(t[i & ~1], t[i | 1]); }
    T get(int i) { return t[i + n]; }
    T query(int l, int r) {                     // [l, r)
        T resl = id, resr = id;
        for (l += n, r += n; l < r; l >>= 1, r >>= 1) {
            if (l & 1) resl = op(resl, t[l++]);
            if (r & 1) resr = op(t[--r], resr);
        }
        return op(resl, resr);
    }
};
int main() {
    vector<long long> a = {5, 3, 8, 6, 1, 4};
    auto mn = [](long long x, long long y) { return min(x, y); };
    SegTree<long long, decltype(mn)> st(a, LLONG_MAX, mn);
    cout << st.query(1, 4) << '\n';   // 3
    st.set(1, 10);
    cout << st.query(0, 6) << '\n';   // 1
    auto add = [](long long x, long long y) { return x + y; };
    SegTree<long long, decltype(add)> sum(a, 0LL, add);
    cout << sum.query(2, 5) << '\n';  // 15
    return 0;
}
` },
  { id: 'segment-tree-recursive', title: 'Segment tree (recursive) + walk for k-th', cat: 'Data structures', topic: 'segment-tree', tags: ['segment tree', 'recursive', 'kth', 'walk'],
    desc: 'The classic recursive version. Includes the tree walk that finds the first index with prefix sum ≥ k — the “k-th element of a multiset” trick.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct SegTree {
    int n; vector<ll> t;
    SegTree(int n) : n(n), t(4 * n, 0) {}
    void add(int node, int l, int r, int pos, ll v) {
        if (l == r) { t[node] += v; return; }
        int m = (l + r) / 2;
        if (pos <= m) add(2 * node, l, m, pos, v); else add(2 * node + 1, m + 1, r, pos, v);
        t[node] = t[2 * node] + t[2 * node + 1];
    }
    ll sum(int node, int l, int r, int ql, int qr) {
        if (qr < l || r < ql) return 0;
        if (ql <= l && r <= qr) return t[node];
        int m = (l + r) / 2;
        return sum(2 * node, l, m, ql, qr) + sum(2 * node + 1, m + 1, r, ql, qr);
    }
    int walk(int node, int l, int r, ll k) {     // first index with prefix sum >= k (all values >= 0, k <= total)
        if (l == r) return l;
        int m = (l + r) / 2;
        if (t[2 * node] >= k) return walk(2 * node, l, m, k);
        return walk(2 * node + 1, m + 1, r, k - t[2 * node]);
    }
    void add(int pos, ll v) { add(1, 0, n - 1, pos, v); }
    ll sum(int l, int r) { return sum(1, 0, n - 1, l, r); }
    int kth(ll k) { return walk(1, 0, n - 1, k); }
};
int main() {
    SegTree st(8);
    for (int i = 0; i < 8; i++) st.add(i, 1);          // multiset {0,...,7}
    st.add(3, -1);                                      // remove 3
    cout << st.sum(0, 7) << ' ' << st.kth(4) << '\n';   // 7 4
    return 0;
}
` },
  { id: 'lazy-segment-tree', title: 'Lazy segment tree (range add, range sum)', cat: 'Data structures', topic: 'lazy-segment-tree', tags: ['lazy', 'range update', 'segment tree'],
    desc: 'Range add + range sum. For range-min: store min, apply `v` instead of `v·len`. For range assign: add an `hasAssign` flag that overrides pending adds.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct LazySeg {
    int n; vector<ll> t, lz;
    LazySeg(int n) : n(n), t(4 * n, 0), lz(4 * n, 0) {}
    void build(const vector<ll>& a, int node, int l, int r) {
        if (l == r) { t[node] = a[l]; return; }
        int m = (l + r) / 2;
        build(a, 2 * node, l, m); build(a, 2 * node + 1, m + 1, r);
        t[node] = t[2 * node] + t[2 * node + 1];
    }
    void apply(int node, int l, int r, ll v) { t[node] += v * (r - l + 1); lz[node] += v; }
    void push(int node, int l, int r) {
        if (lz[node] == 0) return;
        int m = (l + r) / 2;
        apply(2 * node, l, m, lz[node]); apply(2 * node + 1, m + 1, r, lz[node]);
        lz[node] = 0;
    }
    void update(int node, int l, int r, int ql, int qr, ll v) {
        if (qr < l || r < ql) return;
        if (ql <= l && r <= qr) { apply(node, l, r, v); return; }
        push(node, l, r);
        int m = (l + r) / 2;
        update(2 * node, l, m, ql, qr, v); update(2 * node + 1, m + 1, r, ql, qr, v);
        t[node] = t[2 * node] + t[2 * node + 1];
    }
    ll query(int node, int l, int r, int ql, int qr) {
        if (qr < l || r < ql) return 0;
        if (ql <= l && r <= qr) return t[node];
        push(node, l, r);
        int m = (l + r) / 2;
        return query(2 * node, l, m, ql, qr) + query(2 * node + 1, m + 1, r, ql, qr);
    }
    void build(const vector<ll>& a) { build(a, 1, 0, n - 1); }
    void add(int l, int r, ll v) { update(1, 0, n - 1, l, r, v); }
    ll sum(int l, int r) { return query(1, 0, n - 1, l, r); }
};
int main() {
    vector<ll> a = {1, 2, 3, 4, 5};
    LazySeg st(5); st.build(a);
    st.add(1, 3, 10);                                     // 1 12 13 14 5
    cout << st.sum(0, 4) << ' ' << st.sum(2, 2) << '\n';   // 45 13
    return 0;
}
` },
  { id: 'fenwick', title: 'Fenwick tree (BIT) + inversions + k-th', cat: 'Data structures', topic: 'fenwick', tags: ['fenwick', 'bit', 'inversions', 'kth', 'prefix sum'],
    desc: 'Ten lines that replace a segment tree for prefix sums with point updates. Includes order statistics and inversion counting.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct Fenwick {                 // 1-indexed
    int n; vector<ll> t;
    Fenwick(int n) : n(n), t(n + 1, 0) {}
    void add(int i, ll v) { for (; i <= n; i += i & -i) t[i] += v; }
    ll prefix(int i) { ll s = 0; for (; i > 0; i -= i & -i) s += t[i]; return s; }
    ll sum(int l, int r) { return prefix(r) - prefix(l - 1); }
    int kth(ll k) {              // smallest i with prefix(i) >= k (values >= 0); n+1 if none
        int pos = 0, LOG = 1; while ((1 << LOG) <= n) LOG++;
        for (int b = LOG; b >= 0; b--)
            if (pos + (1 << b) <= n && t[pos + (1 << b)] < k) { pos += 1 << b; k -= t[pos]; }
        return pos + 1;
    }
};
ll inversions(vector<int> a) {   // pairs i < j with a[i] > a[j]
    vector<int> s = a; sort(s.begin(), s.end()); s.erase(unique(s.begin(), s.end()), s.end());
    Fenwick fw(s.size());
    ll res = 0;
    for (int i = 0; i < (int)a.size(); i++) {
        int r = lower_bound(s.begin(), s.end(), a[i]) - s.begin() + 1;
        res += i - fw.prefix(r);            // already-seen elements greater than a[i]
        fw.add(r, 1);
    }
    return res;
}
int main() {
    cout << inversions({3, 1, 2, 5, 4}) << '\n';   // 3
    Fenwick f(10); f.add(2, 1); f.add(5, 1); f.add(9, 1);
    cout << f.kth(2) << '\n';                      // 5
    return 0;
}
` },
  { id: 'sparse-table', title: 'Sparse table (static RMQ, O(1) query)', cat: 'Data structures', topic: 'segment-tree', tags: ['sparse table', 'rmq', 'min', 'static'],
    desc: 'For idempotent operations (min, max, gcd, AND, OR) on a static array. Change `min` to swap the operation.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

struct SparseTable {
    int n, LOG; vector<vector<int>> t;
    SparseTable(const vector<int>& a) : n(a.size()) {
        LOG = 1; while ((1 << LOG) <= n) LOG++;
        t.assign(LOG, vector<int>(n));
        t[0] = a;
        for (int k = 1; k < LOG; k++)
            for (int i = 0; i + (1 << k) <= n; i++)
                t[k][i] = min(t[k - 1][i], t[k - 1][i + (1 << (k - 1))]);
    }
    int query(int l, int r) {                  // inclusive, l <= r
        int k = 31 - __builtin_clz(r - l + 1);
        return min(t[k][l], t[k][r - (1 << k) + 1]);
    }
};
int main() {
    SparseTable st({5, 2, 8, 1, 9, 3});
    cout << st.query(0, 2) << ' ' << st.query(2, 5) << ' ' << st.query(4, 4) << '\n';   // 2 1 9
    return 0;
}
` },
  { id: 'dsu', title: 'Disjoint Set Union', cat: 'Data structures', topic: 'dsu', tags: ['dsu', 'union find', 'components'],
    desc: 'Path compression + union by size. Tracks component count and sizes.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> p, sz; int comps;
    DSU(int n) : p(n), sz(n, 1), comps(n) { iota(p.begin(), p.end(), 0); }
    int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }
    bool same(int a, int b) { return find(a) == find(b); }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);
        p[b] = a; sz[a] += sz[b]; comps--;
        return true;
    }
    int size(int x) { return sz[find(x)]; }
};
int main() {
    DSU d(5);
    d.unite(0, 1); d.unite(3, 4);
    cout << d.same(0, 1) << d.same(1, 3) << ' ' << d.comps << ' ' << d.size(3) << '\n';   // 10 3 2
    return 0;
}
` },
  { id: 'dsu-rollback', title: 'DSU with rollback', cat: 'Data structures', topic: 'advanced-graphs', tags: ['dsu', 'rollback', 'offline', 'dynamic connectivity'],
    desc: 'No path compression, union by size, undo in O(1). The building block of offline dynamic connectivity (segment tree over time).',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

struct RollbackDSU {
    vector<int> p, sz; vector<pair<int, int>> hist; int comps;
    RollbackDSU(int n) : p(n), sz(n, 1), comps(n) { iota(p.begin(), p.end(), 0); }
    int find(int x) { while (p[x] != x) x = p[x]; return x; }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) { hist.push_back({-1, -1}); return false; }
        if (sz[a] < sz[b]) swap(a, b);
        p[b] = a; sz[a] += sz[b]; comps--;
        hist.push_back({a, b});
        return true;
    }
    void rollback() {
        auto [a, b] = hist.back(); hist.pop_back();
        if (a < 0) return;
        p[b] = b; sz[a] -= sz[b]; comps++;
    }
    int snapshot() { return hist.size(); }
    void rollbackTo(int snap) { while ((int)hist.size() > snap) rollback(); }
};
int main() {
    RollbackDSU d(4);
    int s = d.snapshot();
    d.unite(0, 1); d.unite(1, 2);
    cout << d.comps << ' ';        // 2
    d.rollbackTo(s);
    cout << d.comps << '\n';       // 4
    return 0;
}
` },
  { id: 'ordered-set-pbds', title: 'Ordered set with order statistics (pb_ds)', cat: 'Data structures', topic: 'stl', tags: ['pbds', 'ordered set', 'kth', 'order of key'],
    desc: 'GCC’s policy-based tree: k-th smallest and “how many are smaller” in O(log n). Not available on MSVC.',
    code: String.raw`#include <bits/stdc++.h>
#include <ext/pb_ds/assoc_container.hpp>
using namespace std;
using namespace __gnu_pbds;

template <class T> using ordered_set = tree<T, null_type, less<T>, rb_tree_tag, tree_order_statistics_node_update>;
// multiset: use pair<T,int> with a running counter as the second element

int main() {
    ordered_set<int> s;
    for (int x : {5, 1, 9, 3}) s.insert(x);
    cout << *s.find_by_order(2) << ' ' << s.order_of_key(4) << '\n';   // 5 2   (3rd smallest; count of values < 4)
    return 0;
}
` },
  { id: 'monotonic-deque', title: 'Sliding window minimum & nearest smaller', cat: 'Data structures', topic: 'two-pointers', tags: ['monotonic', 'deque', 'stack', 'sliding window', 'nearest smaller'],
    desc: 'Monotonic deque for window minima and monotonic stack for “nearest smaller element” — both O(n).',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

vector<int> slidingMin(const vector<int>& a, int k) {    // min of every window of length k
    deque<int> dq; vector<int> res;
    for (int i = 0; i < (int)a.size(); i++) {
        while (!dq.empty() && a[dq.back()] >= a[i]) dq.pop_back();
        dq.push_back(i);
        if (dq.front() <= i - k) dq.pop_front();
        if (i >= k - 1) res.push_back(a[dq.front()]);
    }
    return res;
}
vector<int> prevSmaller(const vector<int>& a) {          // index of nearest smaller to the left, -1 if none
    vector<int> st, res(a.size());
    for (int i = 0; i < (int)a.size(); i++) {
        while (!st.empty() && a[st.back()] >= a[i]) st.pop_back();
        res[i] = st.empty() ? -1 : st.back();
        st.push_back(i);
    }
    return res;
}
int main() {
    for (int x : slidingMin({4, 2, 12, 3, 8, 1}, 3)) cout << x << ' ';   // 2 2 3 1
    cout << '\n';
    for (int x : prevSmaller({3, 1, 4, 1, 5})) cout << x << ' ';        // -1 -1 1 -1 3
    cout << '\n';
    return 0;
}
` },
  { id: 'mo-algorithm', title: 'Mo’s algorithm (offline range queries)', cat: 'Data structures', topic: 'sqrt-mo', tags: ['mo', 'sqrt', 'offline', 'distinct'],
    desc: 'Answer “number of distinct values in [l, r]” for 2·10⁵ queries. Reads input; adapt add/remove for other statistics.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    cin.tie(nullptr)->sync_with_stdio(false);
    int n, q; cin >> n >> q;
    vector<int> a(n);
    for (auto& x : a) cin >> x;
    vector<int> vals = a; sort(vals.begin(), vals.end()); vals.erase(unique(vals.begin(), vals.end()), vals.end());
    for (auto& x : a) x = lower_bound(vals.begin(), vals.end(), x) - vals.begin();
    vector<array<int, 3>> qs(q);                       // l, r (0-based inclusive), original index
    for (int i = 0; i < q; i++) { cin >> qs[i][0] >> qs[i][1]; qs[i][0]--; qs[i][1]--; qs[i][2] = i; }
    int block = max(1, (int)(n / sqrt(q + 1)));
    sort(qs.begin(), qs.end(), [&](const array<int, 3>& x, const array<int, 3>& y) {
        int bx = x[0] / block, by = y[0] / block;
        if (bx != by) return bx < by;
        return (bx & 1) ? x[1] > y[1] : x[1] < y[1];   // odd-even trick halves the moves
    });
    vector<int> cnt(vals.size(), 0), ans(q);
    int distinct = 0, L = 0, R = -1;
    auto add = [&](int i) { if (cnt[a[i]]++ == 0) distinct++; };
    auto remove = [&](int i) { if (--cnt[a[i]] == 0) distinct--; };
    for (auto [l, r, idx] : qs) {
        while (R < r) add(++R);
        while (L > l) add(--L);
        while (R > r) remove(R--);
        while (L < l) remove(L++);
        ans[idx] = distinct;
    }
    for (int x : ans) cout << x << '\n';
    return 0;
}
` },
  { id: 'treap-implicit', title: 'Implicit treap (insert/erase/reverse/range sum)', cat: 'Data structures', topic: 'persistent-treap', tags: ['treap', 'implicit', 'split', 'merge', 'reverse'],
    desc: 'A sequence supporting insertion and deletion at any position, range reversal and range sums in O(log n) expected.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

mt19937 rng(712367);
struct Node {
    int val, pri, sz = 1; long long sum; bool rev = false;
    Node *l = nullptr, *r = nullptr;
    Node(int v) : val(v), pri(rng()), sum(v) {}
};
int sz(Node* t) { return t ? t->sz : 0; }
long long sum(Node* t) { return t ? t->sum : 0; }
void push(Node* t) {
    if (t && t->rev) { swap(t->l, t->r); if (t->l) t->l->rev ^= 1; if (t->r) t->r->rev ^= 1; t->rev = false; }
}
void upd(Node* t) { if (t) { t->sz = 1 + sz(t->l) + sz(t->r); t->sum = t->val + sum(t->l) + sum(t->r); } }
void split(Node* t, int k, Node*& a, Node*& b) {   // a = first k elements, b = the rest
    if (!t) { a = b = nullptr; return; }
    push(t);
    if (sz(t->l) < k) { split(t->r, k - sz(t->l) - 1, t->r, b); a = t; }
    else { split(t->l, k, a, t->l); b = t; }
    upd(t);
}
Node* merge(Node* a, Node* b) {
    if (!a || !b) return a ? a : b;
    push(a); push(b);
    if (a->pri > b->pri) { a->r = merge(a->r, b); upd(a); return a; }
    b->l = merge(a, b->l); upd(b); return b;
}
Node* insertAt(Node* t, int pos, int val) { Node *a, *b; split(t, pos, a, b); return merge(merge(a, new Node(val)), b); }
Node* eraseAt(Node* t, int pos) { Node *a, *b, *c; split(t, pos, a, b); split(b, 1, b, c); delete b; return merge(a, c); }
Node* reverseRange(Node* t, int l, int r) {          // [l, r] 0-based
    Node *a, *b, *c; split(t, l, a, b); split(b, r - l + 1, b, c); b->rev ^= 1; return merge(merge(a, b), c);
}
long long rangeSum(Node*& t, int l, int r) {
    Node *a, *b, *c; split(t, l, a, b); split(b, r - l + 1, b, c); long long s = sum(b); t = merge(merge(a, b), c); return s;
}
void print(Node* t) { if (!t) return; push(t); print(t->l); cout << t->val << ' '; print(t->r); }
int main() {
    Node* root = nullptr;
    for (int i = 1; i <= 6; i++) root = insertAt(root, sz(root), i);   // 1 2 3 4 5 6
    root = reverseRange(root, 1, 4);                                    // 1 5 4 3 2 6
    root = eraseAt(root, 0);                                            // 5 4 3 2 6
    print(root); cout << "| " << rangeSum(root, 1, 3) << '\n';          // 5 4 3 2 6 | 9
    return 0;
}
` },
  { id: 'persistent-segtree', title: 'Persistent segment tree (k-th smallest in range)', cat: 'Data structures', topic: 'persistent-treap', tags: ['persistent', 'kth', 'range', 'versions'],
    desc: 'Version i stores the value counts of a[0..i-1]; version r minus version l gives any range. O(log m) per query, O(n log m) memory.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

struct PST {
    struct Node { int l = 0, r = 0, cnt = 0; };
    vector<Node> t; int m;
    PST(int m) : t(2), m(m) {}    // node 0 = null, node 1 = empty root (version 0)
    int add(int prev, int lo, int hi, int pos) {
        Node copy = t[prev];
        int cur = t.size(); t.push_back(copy); t[cur].cnt++;
        if (lo == hi) return cur;
        int mid = (lo + hi) / 2;
        if (pos <= mid) { int c = add(t[prev].l, lo, mid, pos); t[cur].l = c; }
        else { int c = add(t[prev].r, mid + 1, hi, pos); t[cur].r = c; }
        return cur;
    }
    int add(int prev, int pos) { return add(prev, 0, m - 1, pos); }
    int kth(int u, int v, int lo, int hi, int k) {   // k-th smallest in (version v) minus (version u)
        if (lo == hi) return lo;
        int mid = (lo + hi) / 2, cl = t[t[v].l].cnt - t[t[u].l].cnt;
        if (k <= cl) return kth(t[u].l, t[v].l, lo, mid, k);
        return kth(t[u].r, t[v].r, mid + 1, hi, k - cl);
    }
};
int main() {
    vector<int> a = {5, 1, 4, 2, 3};
    vector<int> vals = a; sort(vals.begin(), vals.end()); vals.erase(unique(vals.begin(), vals.end()), vals.end());
    PST pst(vals.size());
    vector<int> root(a.size() + 1); root[0] = 1;
    for (int i = 0; i < (int)a.size(); i++) root[i + 1] = pst.add(root[i], lower_bound(vals.begin(), vals.end(), a[i]) - vals.begin());
    int l = 1, r = 3, k = 2;   // a[1..3] = {1, 4, 2}; 2nd smallest = 2
    cout << vals[pst.kth(root[l], root[r + 1], 0, vals.size() - 1, k)] << '\n';
    return 0;
}
` },
  { id: 'li-chao', title: 'Li Chao tree (min of lines at integer x)', cat: 'Data structures', topic: 'dp-optimizations', tags: ['li chao', 'cht', 'lines', 'convex hull trick'],
    desc: 'Insert lines in any order, query the minimum at any x in [LO, HI]. Replaces the monotone CHT when slopes/queries are unsorted.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct LiChao {
    struct Line { ll m, c; ll eval(ll x) const { return m * x + c; } };
    int LO, HI; vector<Line> tr; vector<bool> has;
    LiChao(int lo, int hi) : LO(lo), HI(hi) { int n = 1; while (n < hi - lo + 1) n <<= 1; tr.resize(2 * n); has.assign(2 * n, false); }
    void insert(Line ln, int node, int l, int r) {
        if (!has[node]) { tr[node] = ln; has[node] = true; return; }
        int mid = (l + r) / 2;
        bool leftBetter = ln.eval(l) < tr[node].eval(l), midBetter = ln.eval(mid) < tr[node].eval(mid);
        if (midBetter) swap(tr[node], ln);
        if (l == r) return;
        if (leftBetter != midBetter) insert(ln, 2 * node, l, mid);
        else insert(ln, 2 * node + 1, mid + 1, r);
    }
    ll query(ll x, int node, int l, int r) {
        ll res = has[node] ? tr[node].eval(x) : LLONG_MAX;
        if (l == r) return res;
        int mid = (l + r) / 2;
        return min(res, x <= mid ? query(x, 2 * node, l, mid) : query(x, 2 * node + 1, mid + 1, r));
    }
    void insert(ll m, ll c) { insert({m, c}, 1, LO, HI); }
    ll query(ll x) { return query(x, 1, LO, HI); }
};
int main() {
    LiChao lc(0, 100);
    lc.insert(1, 5); lc.insert(-1, 20); lc.insert(0, 12);
    cout << lc.query(0) << ' ' << lc.query(10) << ' ' << lc.query(50) << '\n';   // 5 10 -30
    return 0;
}
` },
  { id: 'coordinate-compression', title: 'Coordinate compression', cat: 'Data structures', topic: 'sorting-searching', tags: ['compression', 'lower_bound', 'unique'],
    desc: 'Map values up to 10¹⁸ to 0..k−1 so they can index a Fenwick/segment tree.',
    code: String.raw`#include <bits/stdc++.h>
using namespace std;

struct Compress {
    vector<long long> v;
    void add(long long x) { v.push_back(x); }
    void build() { sort(v.begin(), v.end()); v.erase(unique(v.begin(), v.end()), v.end()); }
    int id(long long x) const { return lower_bound(v.begin(), v.end(), x) - v.begin(); }   // x must have been added
    int size() const { return v.size(); }
};
int main() {
    Compress c;
    for (long long x : {1000000000LL, 5LL, 7LL, 5LL}) c.add(x);
    c.build();
    cout << c.size() << ' ' << c.id(7) << ' ' << c.id(1000000000LL) << '\n';   // 3 1 2
    return 0;
}
` }
);
