/* Small utility belt shared by every module. No dependencies. */
window.Pages = window.Pages || {};   // page registry, filled by js/pages/*.js before app.js runs
const U = (() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);

  const el = (html) => {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };

  const pad2 = (n) => String(n).padStart(2, '0');

  // Local-date keys (YYYY-MM-DD) so streaks follow the user's clock, not UTC.
  const dateKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const todayKey = () => dateKey(new Date());
  const parseKey = (key) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const addDays = (key, n) => {
    const d = parseKey(key);
    d.setDate(d.getDate() + n);
    return dateKey(d);
  };
  const daysBetween = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 86400000);
  const fmtDate = (key, opts = { month: 'short', day: 'numeric' }) => parseKey(key).toLocaleDateString(undefined, opts);
  const weekdayShort = (key) => parseKey(key).toLocaleDateString(undefined, { weekday: 'short' });

  const fmtClock = (ms) => {
    ms = Math.max(0, Math.floor(ms));
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${h}:${pad2(m)}:${pad2(sec)}`;
  };
  const fmtMin = (min) => {
    min = Math.round(min);
    const h = Math.floor(min / 60), m = min % 60;
    if (h === 0) return `${m}m`;
    return m ? `${h}h ${pad2(m)}m` : `${h}h`;
  };
  const fmtNum = (n) => {
    if (n >= 1e9) return (n / 1e9).toFixed(n >= 1e10 ? 0 : 1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + 'k';
    return String(Math.round(n));
  };
  const sci = (n) => {
    if (n === 0) return '0';
    const e = Math.floor(Math.log10(n));
    const m = n / Math.pow(10, e);
    return (m >= 9.95 ? '1' : m.toFixed(1).replace(/\.0$/, '')) + '×10^' + (m >= 9.95 ? e + 1 : e);
  };

  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
  const plural = (n, w, ws) => `${n} ${n === 1 ? w : (ws || w + 's')}`;
  const sum = (arr, f = (x) => x) => arr.reduce((s, x) => s + f(x), 0);
  const groupBy = (arr, f) => arr.reduce((m, x) => { const k = f(x); (m[k] = m[k] || []).push(x); return m; }, {});

  const debounce = (fn, ms = 300) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  };

  // Delegated event binding: on(root, 'click', '[data-action]', (e, el) => ...)
  const on = (root, evt, selector, handler) => {
    root.addEventListener(evt, (e) => {
      const target = e.target.closest(selector);
      if (target && root.contains(target)) handler(e, target);
    });
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (__) { ok = false; }
      ta.remove();
      return ok;
    }
  };

  const download = (filename, text, type = 'application/json') => {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  };

  const storageOK = (() => {
    try { const k = '__t'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch (_) { return false; }
  })();

  // Seeded PRNG (mulberry32) so visualizer inputs can be reproduced.
  const seeded = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  return { $, $$, esc, el, pad2, dateKey, todayKey, parseKey, addDays, daysBetween, fmtDate, weekdayShort,
    fmtClock, fmtMin, fmtNum, sci, clamp, randInt, pick, shuffle, uid, pct, plural, sum, groupBy,
    debounce, on, copy, download, storageOK, seeded };
})();
