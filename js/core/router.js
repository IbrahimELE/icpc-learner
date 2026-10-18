/* Hash router: #/path/:param?query=1 */
const Router = (() => {
  const routes = [];
  let current = null;
  let notFound = null;

  const add = (pattern, handler) => {
    const keys = [];
    const re = new RegExp('^' + pattern.replace(/\//g, '\/').replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^\/]+)'; }) + '$');
    routes.push({ re, keys, handler, pattern });
  };

  const parse = () => {
    let hash = location.hash.replace(/^#/, '') || '/';
    let query = {};
    const qi = hash.indexOf('?');
    if (qi >= 0) {
      hash.slice(qi + 1).split('&').forEach((kv) => {
        if (!kv) return;
        const [k, v] = kv.split('=');
        query[decodeURIComponent(k)] = v === undefined ? '1' : decodeURIComponent(v);
      });
      hash = hash.slice(0, qi);
    }
    if (hash.length > 1 && hash.endsWith('/')) hash = hash.slice(0, -1);
    return { path: hash, query };
  };

  const resolve = () => {
    const { path, query } = parse();
    for (const r of routes) {
      const m = path.match(r.re);
      if (m) {
        const params = {};
        r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
        current = { path, params, query, pattern: r.pattern };
        r.handler(params, query);
        return;
      }
    }
    current = { path, params: {}, query, pattern: null };
    if (notFound) notFound(path);
  };

  const start = (onNotFound) => {
    notFound = onNotFound;
    window.addEventListener('hashchange', resolve);
    resolve();
  };

  const go = (hash) => { if (location.hash === hash) resolve(); else location.hash = hash; };

  const qs = (obj) => {
    const parts = Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    return parts.length ? '?' + parts.join('&') : '';
  };

  return { add, start, go, qs, parse, get current() { return current; } };
})();
