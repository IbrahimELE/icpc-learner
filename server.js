/* SEERC Trainer local server.
   - Serves the static app at http://localhost:7331
   - POST /api/run    { code, stdin, timeLimitMs }           -> compile with local g++ and run
   - POST /api/stress { sol, brute, gen, iterations, timeLimitMs } -> compare solution vs brute force on random tests
   No dependencies. Only listens on 127.0.0.1. Run:  node server.js [--open] [--port 7331] */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, execFileSync } = require('child_process');

const ROOT = __dirname;
const args = process.argv.slice(2);
const PORT = Number(process.env.PORT || (args.includes('--port') ? args[args.indexOf('--port') + 1] : 7331));
const OPEN = args.includes('--open');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.woff2': 'font/woff2' };

/* ---------- find g++ ---------- */
const GPP_CANDIDATES = [process.env.SEERC_GPP, 'g++', 'C:\\msys64\\ucrt64\\bin\\g++.exe', 'C:\\msys64\\mingw64\\bin\\g++.exe', 'C:\\msys64\\clang64\\bin\\g++.exe', 'C:\\MinGW\\bin\\g++.exe', 'C:\\mingw64\\bin\\g++.exe', 'C:\\TDM-GCC-64\\bin\\g++.exe', 'C:\\Program Files\\mingw-w64\\mingw64\\bin\\g++.exe', '/usr/bin/g++', '/usr/local/bin/g++', '/opt/homebrew/bin/g++'].filter(Boolean);
let GPP = null, GPP_VERSION = '';
for (const c of GPP_CANDIDATES) {
  try {
    const out = execFileSync(c, ['--version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true, timeout: 8000 });
    GPP = c; GPP_VERSION = (out.split('\n')[0] || '').trim(); break;
  } catch (_) { /* try next */ }
}
const TMP_ROOT = path.join(os.tmpdir(), 'seerc-trainer');
fs.mkdirSync(TMP_ROOT, { recursive: true });

// Self-test: some installs have a g++ that starts but whose backend (cc1plus) crashes. Detect that up front.
let GPP_ERROR = '';
if (GPP) {
  try {
    const dir = fs.mkdtempSync(path.join(TMP_ROOT, 'selftest-'));
    const src = path.join(dir, 't.cpp'), exe = path.join(dir, process.platform === 'win32' ? 't.exe' : 't.out');
    fs.writeFileSync(src, '#include <iostream>\nint main(){std::cout<<42;}');
    const r = require('child_process').spawnSync(GPP, ['-O2', '-std=gnu++20', '-o', exe, src], { encoding: 'utf8', windowsHide: true, timeout: 60000 });
    if (r.status !== 0 || !fs.existsSync(exe)) {
      GPP_ERROR = `g++ was found (${GPP}) but failed to compile a test program (exit ${r.status}). ${(r.stderr || '').trim() || 'No error message: the compiler backend probably crashed. Reinstall/update MSYS2 (pacman -Syu) or install another MinGW-w64 build.'}`;
      GPP = null;
    } else {
      const run = require('child_process').spawnSync(exe, [], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
      if ((run.stdout || '').trim() !== '42') { GPP_ERROR = 'Compiled test program did not run correctly.'; GPP = null; }
    }
    fs.rm(dir, { recursive: true, force: true }, () => {});
  } catch (e) { GPP_ERROR = 'Compiler self-test failed: ' + e.message; GPP = null; }
}

/* ---------- helpers ---------- */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const exeName = process.platform === 'win32' ? 'main.exe' : 'main.out';

function runProc(cmd, cmdArgs, { stdin = '', timeoutMs = 2000, cwd, maxOut = 1 << 20 } = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    let child;
    try { child = spawn(cmd, cmdArgs, { cwd, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] }); }
    catch (e) { return reject(e); }
    let stdout = '', stderr = '', timedOut = false, truncated = false;
    const timer = setTimeout(() => { timedOut = true; try { child.kill(); } catch (_) {} setTimeout(() => { try { child.kill('SIGKILL'); } catch (_) {} }, 300); }, timeoutMs);
    child.stdout.on('data', (d) => { if (stdout.length < maxOut) stdout += d.toString('utf8'); else truncated = true; });
    child.stderr.on('data', (d) => { if (stderr.length < maxOut) stderr += d.toString('utf8'); });
    child.on('error', (e) => { clearTimeout(timer); reject(e); });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (truncated) stdout += '\n[output truncated]';
      resolve({ stdout, stderr, code, signal, timedOut, timeMs: Date.now() - start });
    });
    child.stdin.on('error', () => {});
    child.stdin.end(stdin);
  });
}

async function compile(code, dir, base) {
  const src = path.join(dir, base + '.cpp');
  const exe = path.join(dir, base + (process.platform === 'win32' ? '.exe' : '.out'));
  fs.writeFileSync(src, code, 'utf8');
  const r = await runProc(GPP, ['-O2', '-std=gnu++20', '-Wall', '-Wextra', '-Wshadow', '-DLOCAL', '-o', exe, src], { timeoutMs: 40000, cwd: dir });
  const output = (r.stderr || '') + (r.stdout || '');
  const ok = !r.timedOut && r.code === 0 && fs.existsSync(exe);
  return { ok, output: r.timedOut ? 'Compiler timed out (40 s). Is the code extremely template-heavy?' : output.replace(new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), base + '.cpp'), exe };
}

const normalize = (s) => s.replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/g, '')).join('\n').replace(/\n+$/g, '');

/* ---------- API ---------- */
async function apiRun(body) {
  if (!GPP) return { error: GPP_ERROR || 'No g++ found. Install MSYS2/MinGW-w64 (or set SEERC_GPP to your g++.exe path) and restart start.bat.' };
  const code = String(body.code || '');
  if (!code.trim()) return { error: 'Empty code' };
  const dir = fs.mkdtempSync(path.join(TMP_ROOT, 'run-'));
  try {
    const c = await compile(code, dir, 'main');
    if (!c.ok) return { ok: true, compileFailed: true, compileOutput: c.output };
    const r = await runProc(c.exe, [], { stdin: String(body.stdin || ''), timeoutMs: Math.min(10000, Math.max(200, Number(body.timeLimitMs) || 2000)), cwd: dir });
    return { ok: true, compileOutput: c.output, stdout: r.stdout, stderr: r.stderr, exitCode: r.code, signal: r.signal, timedOut: r.timedOut, timeMs: r.timeMs };
  } finally { fs.rm(dir, { recursive: true, force: true }, () => {}); }
}

async function apiStress(body) {
  if (!GPP) return { error: GPP_ERROR || 'No g++ found on this machine.' };
  const dir = fs.mkdtempSync(path.join(TMP_ROOT, 'stress-'));
  const started = Date.now();
  try {
    const parts = [['sol', body.sol], ['brute', body.brute], ['gen', body.gen]];
    const exes = {};
    for (const [name, code] of parts) {
      const c = await compile(String(code || ''), dir, name);
      if (!c.ok) return { ok: true, compileFailed: name + '.cpp', compileOutput: c.output };
      exes[name] = c.exe;
    }
    const iterations = Math.min(300, Math.max(1, Number(body.iterations) || 100));
    const tl = Math.min(10000, Math.max(100, Number(body.timeLimitMs) || 2000));
    for (let it = 1; it <= iterations; it++) {
      if (Date.now() - started > 90000) return { ok: true, failed: null, iterations: it - 1, timeMs: Date.now() - started, note: 'stopped after 90 s' };
      const g = await runProc(exes.gen, [String(it)], { timeoutMs: tl, cwd: dir });
      if (g.timedOut || g.code !== 0) return { ok: true, failed: { iteration: it, kind: 'generator crashed or timed out', input: '', expected: '', got: g.stderr || '' }, iterations: it, timeMs: Date.now() - started };
      const input = g.stdout;
      const b = await runProc(exes.brute, [], { stdin: input, timeoutMs: tl, cwd: dir });
      if (b.timedOut || b.code !== 0) return { ok: true, failed: { iteration: it, kind: 'brute force crashed or timed out', input, expected: '', got: b.stderr || '' }, iterations: it, timeMs: Date.now() - started };
      const s = await runProc(exes.sol, [], { stdin: input, timeoutMs: tl, cwd: dir });
      if (s.timedOut) return { ok: true, failed: { iteration: it, kind: 'solution timed out', input, expected: b.stdout, got: s.stdout }, iterations: it, timeMs: Date.now() - started };
      if (s.code !== 0) return { ok: true, failed: { iteration: it, kind: 'solution crashed (exit ' + s.code + ')', input, expected: b.stdout, got: (s.stdout || '') + (s.stderr ? '\n[stderr] ' + s.stderr : '') }, iterations: it, timeMs: Date.now() - started };
      if (normalize(s.stdout) !== normalize(b.stdout)) return { ok: true, failed: { iteration: it, kind: 'wrong answer', input, expected: b.stdout, got: s.stdout }, iterations: it, timeMs: Date.now() - started };
    }
    return { ok: true, failed: null, iterations, timeMs: Date.now() - started };
  } finally { fs.rm(dir, { recursive: true, force: true }, () => {}); }
}

/* ---------- HTTP ---------- */
const readBody = (req) => new Promise((resolve, reject) => {
  let data = '';
  req.on('data', (c) => { data += c; if (data.length > 4e6) { reject(new Error('Body too large')); req.destroy(); } });
  req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(new Error('Invalid JSON')); } });
  req.on('error', reject);
});
const json = (res, obj, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname === '/api/status') return json(res, { ok: true, gpp: GPP ? GPP_VERSION : null, hasGpp: !!GPP, gppError: GPP_ERROR || null, platform: process.platform });
    if (url.pathname === '/api/run' && req.method === 'POST') return json(res, await apiRun(await readBody(req)));
    if (url.pathname === '/api/stress' && req.method === 'POST') return json(res, await apiStress(await readBody(req)));
    if (url.pathname.startsWith('/api/')) return json(res, { error: 'Unknown API endpoint' }, 404);
    // static
    let p = decodeURIComponent(url.pathname);
    if (p === '/') p = '/index.html';
    const file = path.normalize(path.join(ROOT, p));
    if (!file.startsWith(ROOT) || p.includes('..')) { res.writeHead(403); return res.end('Forbidden'); }
    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      fs.createReadStream(file).pipe(res);
    });
  } catch (e) {
    json(res, { error: e.message || String(e) }, 500);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log('');
  console.log('  SEERC Trainer running at ' + url);
  console.log(GPP ? `  C++ compiler: ${GPP_VERSION} (${GPP})` : '  WARNING: no working g++. ' + (GPP_ERROR || 'g++ not found.') + '\n  The playground will fall back to the online compiler (Wandbox).');
  console.log('  Keep this window open while you use the app. Press Ctrl+C to stop.');
  console.log('');
  if (OPEN) {
    const cmd = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
    try { spawn(cmd[0], cmd[1], { detached: true, stdio: 'ignore', windowsHide: true }).unref(); } catch (_) {}
  }
});
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') console.error(`Port ${PORT} is already in use. Is another copy running? Open http://localhost:${PORT} or run: node server.js --port 7332`);
  else console.error(e);
  process.exit(1);
});
