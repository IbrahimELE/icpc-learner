/* C++ Playground: editor + stdin + expected output diff + stress tester.
   Runs on the local server (server.js + your g++) when available, otherwise via the public Wandbox API. */
Pages.playground = (root, params, query) => {
  const esc = U.esc;
  const pg = Store.state.playground;
  const DEFAULT_CODE = `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    cin.tie(nullptr)->sync_with_stdio(false);
    int n;
    cin >> n;
    vector<ll> a(n);
    for (auto& x : a) cin >> x;
    ll sum = 0;
    for (ll x : a) sum += x;
    cout << sum << "\\n";
    return 0;
}
`;
  const DEFAULT_GEN = `// Generator: prints ONE random test. Seed comes from argv[1].
#include <bits/stdc++.h>
using namespace std;
int main(int argc, char** argv) {
    mt19937 rng(argc > 1 ? atoi(argv[1]) : 1);
    auto rnd = [&](int lo, int hi) { return (int)(rng() % (hi - lo + 1)) + lo; };
    int n = rnd(1, 6);
    cout << n << "\\n";
    for (int i = 0; i < n; i++) cout << rnd(-5, 5) << " ";
    cout << "\\n";
}
`;
  const DEFAULT_BRUTE = `// Brute force: obviously-correct but slow solution of the same problem.
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    long long s = 0;
    for (int i = 0; i < n; i++) { long long x; cin >> x; s += x; }
    cout << s << "\\n";
}
`;
  let code = pg.code || DEFAULT_CODE;
  if (query.load) { const c = sessionStorage.getItem('seerc-play-code'); if (c) { code = c; sessionStorage.removeItem('seerc-play-code'); } }
  let runner = { mode: 'checking', label: 'checking…' };
  let localHint = '';

  root.innerHTML = `
    <div class="row between mb">
      <div><h1 style="margin-bottom:2px">C++ Playground</h1><div class="muted small">Write, run and check solutions here. <span class="kbd">Ctrl</span>+<span class="kbd">Enter</span> runs. Code is saved automatically in this browser.</div></div>
      <div class="runner-status" id="runner-status"><span class="dot"></span> checking runner…</div>
    </div>
    <div class="tabs" id="pg-tabs"><button data-tab="run">Run & check</button><button data-tab="stress">Stress test</button><button data-tab="help">How to use</button></div>

    <div data-panel="run">
      <div class="play-layout">
        <div>
          <div class="row mb" style="gap:6px">
            <select class="input" id="tpl-sel" style="width:auto"><option value="">Load template…</option><option value="__default">Basic: read n numbers</option>${TEMPLATES.slice(0, 60).map((t) => `<option value="${t.id}">${esc(t.title)}</option>`).join('')}</select>
            <span class="spacer"></span>
            <button class="btn small ghost" id="fmt-btn" title="Re-indent with 4 spaces (very basic)">Tidy</button>
            <button class="btn primary" id="run-btn">${UI.icon('play', 16)} Run (Ctrl+Enter)</button>
          </div>
          <div class="editor-wrap"><div class="gutter" id="gutter">1</div><textarea id="code" spellcheck="false">${esc(code)}</textarea></div>
          <div class="muted tiny mt">Compiled with <code>g++ -O2 -std=gnu++20 -Wall -Wextra -DLOCAL</code> locally (2 s time limit by default) or with GCC head on Wandbox.</div>
        </div>
        <div class="col">
          <div class="card io-box" style="padding:12px"><div class="row between"><b class="small">Input (stdin)</b><button class="btn tiny ghost" id="sample-btn">sample</button></div><textarea class="input" id="stdin" placeholder="3&#10;1 2 3">${esc(pg.stdin || '')}</textarea></div>
          <div class="card io-box" style="padding:12px"><div class="row between"><b class="small">Expected output (optional)</b><label class="checkbox tiny"><input type="checkbox" id="tl-loose" checked> ignore trailing whitespace</label></div><textarea class="input" id="expected" placeholder="6">${esc(pg.expected || '')}</textarea></div>
          <div class="card" style="padding:12px"><div class="row between"><b class="small">Output</b><span id="verdict"></span><span class="muted tiny" id="time"></span></div><div class="output" id="output">Press Run.</div><div id="diff" class="mt"></div></div>
        </div>
      </div>
    </div>

    <div data-panel="stress" class="hidden">
      <div class="card md">
        <p><b>Stress testing</b> finds the bug you cannot see: a <em>generator</em> makes small random tests, a <em>brute force</em> computes the correct answer slowly, and your solution (the code in the "Run & check" tab) is compared against it on hundreds of tests. Requires the local server (start.bat).</p>
        <div class="grid c2">
          <div><b class="small">gen.cpp — random test generator</b><div class="editor-wrap mt" style="min-height:0"><textarea id="gen" style="min-height:240px" spellcheck="false">${esc(pg.gen || DEFAULT_GEN)}</textarea></div></div>
          <div><b class="small">brute.cpp — slow but correct</b><div class="editor-wrap mt" style="min-height:0"><textarea id="brute" style="min-height:240px" spellcheck="false">${esc(pg.brute || DEFAULT_BRUTE)}</textarea></div></div>
        </div>
        <div class="row mt"><label class="field"><span>Iterations</span><input class="input" id="iters" type="number" value="100" min="1" max="300" style="width:100px"></label><label class="field"><span>Time limit per run (ms)</span><input class="input" id="stl" type="number" value="2000" min="100" max="10000" style="width:120px"></label><span class="spacer"></span><button class="btn primary" id="stress-btn">${UI.icon('bolt', 16)} Run stress test</button></div>
        <div id="stress-out" class="mt"></div>
      </div>
    </div>

    <div data-panel="help" class="hidden">
      <div class="card md">
        <h3>Two ways to run code</h3>
        <ul>
          <li><b>Local (recommended):</b> double-click <code>start.bat</code> in the app folder. It starts a tiny server that compiles with the g++ on your machine and opens the app at <code>http://localhost:7331</code>. Fast, offline, and enables the stress tester.</li>
          <li><b>Online fallback:</b> when the app is opened directly as a file, code is sent to the public Wandbox compiler API. It needs internet and is slower; never paste secrets into it.</li>
        </ul>
        <h3>Workflow for a problem</h3>
        <ol>
          <li>Paste the sample input into <b>Input</b> and the sample output into <b>Expected</b>. Run: the verdict shows AC / WA with a line-by-line diff.</li>
          <li>Add your own edge cases: n = 1, all equal values, maximum values (overflow!), empty answers.</li>
          <li>If the judge still says WA: write a brute force, open <b>Stress test</b>, generate tiny tests until a mismatch appears. Then debug that small case by hand.</li>
        </ol>
        <h3>Reading compiler errors</h3>
        <p>Read the <em>first</em> error only; the rest are usually consequences. <code>-Wall -Wextra</code> warnings about "unused variable" or "comparison between signed and unsigned" are worth a look — the second one often hides a bug like <code>i < v.size() - 1</code> when <code>v</code> is empty.</p>
      </div>
    </div>`;

  UI.tabs(root.querySelector('#pg-tabs').parentElement, { initial: query.tab || 'run' });

  const ta = root.querySelector('#code'), gutter = root.querySelector('#gutter');
  const updateGutter = () => { const n = ta.value.split('\n').length; gutter.innerHTML = Array.from({ length: n }, (_, i) => i + 1).join('<br>'); };
  ta.addEventListener('scroll', () => (gutter.scrollTop = ta.scrollTop));
  ta.addEventListener('input', () => { updateGutter(); save(); });
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') { e.preventDefault(); const s = ta.selectionStart, en = ta.selectionEnd; ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(en); ta.selectionStart = ta.selectionEnd = s + 4; save(); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const s = ta.selectionStart; const before = ta.value.slice(0, s); const line = before.slice(before.lastIndexOf('\n') + 1);
      let indent = (line.match(/^\s*/) || [''])[0]; if (/[{(\[]\s*$/.test(line)) indent += '    ';
      const after = ta.value.slice(ta.selectionEnd);
      const closing = /^\s*[}\])]/.test(after) && /[{(\[]\s*$/.test(line);
      ta.value = before + '\n' + indent + (closing ? '\n' + indent.slice(0, -4) : '') + after;
      ta.selectionStart = ta.selectionEnd = s + 1 + indent.length; updateGutter(); save();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
  });
  root.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && e.target !== ta) { e.preventDefault(); run(); } });
  updateGutter();
  const save = U.debounce(() => Store.setPlayground({ code: ta.value, stdin: root.querySelector('#stdin').value, expected: root.querySelector('#expected').value, gen: root.querySelector('#gen').value, brute: root.querySelector('#brute').value }), 400);
  ['#stdin', '#expected', '#gen', '#brute'].forEach((id) => root.querySelector(id).addEventListener('input', save));
  if (query.load) save();

  root.querySelector('#tpl-sel').addEventListener('change', (e) => {
    const v = e.target.value; if (!v) return;
    const t = v === '__default' ? { code: DEFAULT_CODE } : TEMPLATES.find((x) => x.id === v);
    if (t && (ta.value.trim() === '' || ta.value === DEFAULT_CODE || confirm('Replace the current code with this template?'))) { ta.value = t.code; updateGutter(); save(); }
    e.target.value = '';
  });
  root.querySelector('#sample-btn').addEventListener('click', () => { root.querySelector('#stdin').value = '3\n1 2 3\n'; root.querySelector('#expected').value = '6\n'; save(); });
  root.querySelector('#fmt-btn').addEventListener('click', () => {
    const lines = ta.value.split('\n'); let depth = 0; const out = [];
    for (let l of lines) { l = l.trim(); if (/^[}\])]/.test(l)) depth = Math.max(0, depth - 1); out.push('    '.repeat(depth) + l); const opens = (l.match(/[{(\[]/g) || []).length, closes = (l.match(/[}\])]/g) || []).length; depth = Math.max(0, depth + opens - closes - (/^[}\])]/.test(l) ? -1 : 0) - (/^[}\])]/.test(l) ? 1 : 0)); }
    ta.value = out.join('\n'); updateGutter(); save();
  });

  /* ---- runner detection ---- */
  const setStatus = () => {
    const el = root.querySelector('#runner-status');
    if (!el) return;
    const cls = runner.mode === 'local' ? 'ok' : runner.mode === 'wandbox' ? 'warn' : runner.mode === 'none' ? 'bad' : '';
    el.innerHTML = `<span class="dot ${cls}"></span> ${esc(runner.label)}`;
    const sb = root.querySelector('#stress-btn'); if (sb) sb.disabled = runner.mode !== 'local';
  };
  const detect = async () => {
    const pref = Store.state.settings.compiler || 'auto';
    if (pref !== 'wandbox' && location.protocol.startsWith('http')) {
      try {
        const ctrl = new AbortController(); setTimeout(() => ctrl.abort(), 1500);
        const r = await fetch('/api/status', { signal: ctrl.signal });
        if (r.ok) { const j = await r.json(); if (j.ok && j.hasGpp) { runner = { mode: 'local', label: `local ${j.gpp || 'g++'}` }; setStatus(); return; } if (j.ok && !j.hasGpp) { localHint = j.gppError || 'no working g++ found by the local server'; } }
      } catch (_) { /* fall through */ }
    }
    if (pref === 'local') { runner = { mode: 'none', label: 'local server not running — run start.bat' }; }
    else runner = { mode: 'wandbox', label: (navigator.onLine ? 'online compiler (Wandbox)' : 'offline — Wandbox unreachable') + (localHint ? ' — local g++ unusable: ' + localHint.slice(0, 90) : ' — run start.bat for local g++') };
    setStatus();
  };
  detect();

  /* ---- run ---- */
  const normalize = (s, loose) => (loose ? s.replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/g, '')).join('\n').replace(/\n+$/g, '') : s);
  const showDiff = (got, exp) => {
    const g = got.split('\n'), e = exp.split('\n');
    const n = Math.max(g.length, e.length);
    let html = '<div class="diff-line muted tiny"><span>line</span><span>expected</span><span>your output</span></div>';
    let shown = 0;
    for (let i = 0; i < n && shown < 30; i++) { const bad = (g[i] || '') !== (e[i] || ''); if (!bad && n > 12) continue; shown++; html += `<div class="diff-line ${bad ? 'bad' : ''}"><span class="muted">${i + 1}</span><span>${esc(e[i] === undefined ? '∅' : e[i])}</span><span>${esc(g[i] === undefined ? '∅' : g[i])}</span></div>`; }
    return html;
  };
  const run = async () => {
    const out = root.querySelector('#output'), verdict = root.querySelector('#verdict'), time = root.querySelector('#time'), diff = root.querySelector('#diff');
    const btn = root.querySelector('#run-btn');
    if (runner.mode === 'checking') await detect();
    if (runner.mode === 'none') { UI.toast('Start start.bat first, or set compiler to "auto" in Settings', 'error'); return; }
    btn.disabled = true; btn.textContent = 'Running…'; out.className = 'output'; out.textContent = runner.mode === 'local' ? 'Compiling with local g++…' : 'Sending to Wandbox…'; verdict.textContent = ''; time.textContent = ''; diff.innerHTML = '';
    const stdin = root.querySelector('#stdin').value;
    try {
      let res;
      if (runner.mode === 'local') {
        const r = await fetch('/api/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: ta.value, stdin, timeLimitMs: 2000 }) });
        res = await r.json();
      } else {
        const r = await fetch('https://wandbox.org/api/compile.json', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ compiler: 'gcc-head', code: ta.value, stdin, options: 'warning,gnu++2b', 'compiler-option-raw': '-O2\n-DLOCAL' }) });
        const j = await r.json();
        res = { ok: true, compileOutput: j.compiler_error || j.compiler_message || '', compileFailed: !!(j.compiler_error && !j.program_message && j.status !== '0' && j.program_output === undefined) || (j.compiler_error && j.status === undefined), stdout: j.program_output || '', stderr: j.program_error || '', exitCode: Number(j.status), signal: j.signal || '', timeMs: null };
        if (j.compiler_error && !j.program_output && j.status !== '0') res.compileFailed = true;
      }
      if (res.error) throw new Error(res.error);
      if (res.compileFailed) { out.className = 'output err'; out.textContent = res.compileOutput || 'Compilation failed'; verdict.innerHTML = '<span class="verdict ce">Compilation Error</span>'; return; }
      let text = res.stdout || '';
      if (res.stderr) text += (text ? '\n' : '') + '--- stderr ---\n' + res.stderr;
      if (res.compileOutput) text += '\n--- compiler warnings ---\n' + res.compileOutput;
      out.textContent = text || '(no output)';
      time.textContent = res.timeMs != null ? `${res.timeMs} ms` : '';
      if (res.timedOut) { out.className = 'output err'; verdict.innerHTML = '<span class="verdict tle">Time Limit Exceeded</span>'; return; }
      if ((res.exitCode && res.exitCode !== 0) || res.signal) { out.className = 'output err'; verdict.innerHTML = `<span class="verdict wa">Runtime Error${res.signal ? ' (' + esc(res.signal) + ')' : ' (exit ' + res.exitCode + ')'}</span>`; return; }
      const exp = root.querySelector('#expected').value;
      if (exp.trim()) {
        const loose = root.querySelector('#tl-loose').checked;
        const ok = normalize(res.stdout || '', loose) === normalize(exp, loose);
        verdict.innerHTML = ok ? '<span class="verdict ac">Accepted ✓</span>' : '<span class="verdict wa">Wrong Answer</span>';
        out.className = 'output ' + (ok ? 'ok' : 'err');
        if (!ok) diff.innerHTML = showDiff(normalize(res.stdout || '', loose), normalize(exp, loose));
        if (ok) Store.addXP(2, null);
      } else { out.className = 'output ok'; verdict.innerHTML = '<span class="verdict ac">Ran OK</span>'; }
    } catch (e) {
      out.className = 'output err'; out.textContent = 'Could not run: ' + e.message + (runner.mode === 'wandbox' ? '\n(Wandbox may be down or you are offline. Start start.bat to compile locally.)' : '');
    } finally { btn.disabled = false; btn.innerHTML = `${UI.icon('play', 16)} Run (Ctrl+Enter)`; }
  };
  root.querySelector('#run-btn').addEventListener('click', run);

  /* ---- stress ---- */
  root.querySelector('#stress-btn').addEventListener('click', async () => {
    const outEl = root.querySelector('#stress-out'), btn = root.querySelector('#stress-btn');
    btn.disabled = true; outEl.innerHTML = '<div class="muted">Compiling three programs and running tests… this can take up to a minute.</div>';
    try {
      const r = await fetch('/api/stress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sol: ta.value, gen: root.querySelector('#gen').value, brute: root.querySelector('#brute').value, iterations: U.clamp(+root.querySelector('#iters').value || 100, 1, 300), timeLimitMs: U.clamp(+root.querySelector('#stl').value || 2000, 100, 10000) }) });
      const j = await r.json();
      if (j.error) throw new Error(j.error);
      if (j.compileFailed) { outEl.innerHTML = `<div class="output err">${esc(j.compileFailed)} failed to compile:\n${esc(j.compileOutput)}</div>`; return; }
      if (j.failed) {
        const f = j.failed;
        outEl.innerHTML = `<div class="verdict wa">Mismatch found on iteration ${f.iteration} ${f.kind ? '(' + esc(f.kind) + ')' : ''}</div>
          <div class="grid c3 mt"><div><b class="small">Input</b><div class="output">${esc(f.input)}</div></div><div><b class="small">Brute (expected)</b><div class="output ok">${esc(f.expected)}</div></div><div><b class="small">Your output</b><div class="output err">${esc(f.got)}</div></div></div>
          <div class="row mt"><button class="btn small" id="use-fail">Load this input into Run & check</button><span class="muted small">Debug this tiny case by hand — print intermediate values with dbg().</span></div>`;
        outEl.querySelector('#use-fail').addEventListener('click', () => { root.querySelector('#stdin').value = f.input; root.querySelector('#expected').value = f.expected; save(); UI.tabs(root.querySelector('#pg-tabs').parentElement, { initial: 'run' }); });
      } else {
        outEl.innerHTML = `<div class="verdict ac">All ${j.iterations} tests passed ✓</div><div class="muted small">${j.timeMs} ms total. Increase iterations or the generator's ranges if you still suspect a bug — most bugs show up within 50 tiny tests.</div>`;
        Store.addXP(10, 'stress test passed');
      }
    } catch (e) { outEl.innerHTML = `<div class="output err">Stress test failed to run: ${esc(e.message)}\nIs the local server running (start.bat)?</div>`; }
    finally { btn.disabled = runner.mode !== 'local'; }
  });
};
