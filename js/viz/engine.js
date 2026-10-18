/* Visualizer engine: register algorithm visualizers that produce a list of frames,
   then play them back on a canvas with step controls, explanation and code highlighting. */
const Viz = (() => {
  const registry = new Map();
  const register = (def) => { registry.set(def.id, def); return def; };
  const get = (id) => registry.get(id) || null;
  const list = () => Array.from(registry.values());

  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const theme = () => ({
    bg: cssVar('--bg2') || '#141820', panel: cssVar('--panel2') || '#1f2430', border: cssVar('--border') || '#2a3040',
    text: cssVar('--text') || '#e6e9ef', muted: cssVar('--muted') || '#9aa3b2', accent: cssVar('--accent') || '#6ea8fe',
    ok: cssVar('--ok') || '#3fb950', warn: cssVar('--warn') || '#d29922', danger: cssVar('--danger') || '#f85149',
    purple: cssVar('--purple') || '#bc8cff', teal: cssVar('--teal') || '#39c5bb', orange: cssVar('--orange') || '#f0883e',
    mono: "13px 'JetBrains Mono', Consolas, monospace", font: "13px Inter, system-ui, sans-serif",
  });

  /* ---------- drawing helpers ---------- */
  const draw = {
    clear(ctx, W, H, T) { ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H); },
    text(ctx, s, x, y, { color, font, align = 'center', baseline = 'middle' } = {}) {
      ctx.fillStyle = color; ctx.font = font; ctx.textAlign = align; ctx.textBaseline = baseline; ctx.fillText(String(s), x, y);
    },
    roundRect(ctx, x, y, w, h, r, fill, stroke, lw = 1.5) {
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
    },
    // Array of cells. cellStyle(i) -> {fill, stroke, color} ; labelsBelow(i) -> string
    array(ctx, arr, x, y, cellW, cellH, T, { style = () => ({}), below = () => '', above = () => '', gap = 4, font } = {}) {
      arr.forEach((v, i) => {
        const cx = x + i * (cellW + gap);
        const st = style(i) || {};
        draw.roundRect(ctx, cx, y, cellW, cellH, 6, st.fill || T.panel, st.stroke || T.border, st.lw || 1.5);
        draw.text(ctx, v, cx + cellW / 2, y + cellH / 2, { color: st.color || T.text, font: font || T.mono });
        const b = below(i); if (b) draw.text(ctx, b, cx + cellW / 2, y + cellH + 12, { color: st.belowColor || T.muted, font: "11px 'JetBrains Mono', monospace" });
        const a = above(i); if (a) draw.text(ctx, a, cx + cellW / 2, y - 12, { color: st.aboveColor || T.accent, font: "bold 11px 'JetBrains Mono', monospace" });
      });
    },
    grid(ctx, rows, cols, x, y, cell, T, { style = () => ({}), label = () => '' } = {}) {
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const st = style(r, c) || {};
        ctx.fillStyle = st.fill || T.panel; ctx.fillRect(x + c * cell, y + r * cell, cell - 1, cell - 1);
        if (st.stroke) { ctx.strokeStyle = st.stroke; ctx.lineWidth = 2; ctx.strokeRect(x + c * cell + 1, y + r * cell + 1, cell - 3, cell - 3); }
        const l = label(r, c); if (l !== '' && l !== undefined && l !== null) draw.text(ctx, l, x + c * cell + cell / 2, y + r * cell + cell / 2, { color: st.color || T.text, font: `${Math.max(9, Math.min(13, cell / 2.4))}px 'JetBrains Mono', monospace` });
      }
    },
    node(ctx, x, y, r, label, T, { fill, stroke, color, lw = 2, sub, subColor } = {}) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill || T.panel; ctx.fill(); ctx.strokeStyle = stroke || T.border; ctx.lineWidth = lw; ctx.stroke();
      draw.text(ctx, label, x, y, { color: color || T.text, font: "bold 12px 'JetBrains Mono', monospace" });
      if (sub !== undefined && sub !== null && sub !== '') draw.text(ctx, sub, x, y + r + 11, { color: subColor || T.accent, font: "bold 11px 'JetBrains Mono', monospace" });
    },
    edge(ctx, x1, y1, x2, y2, T, { color, lw = 1.5, directed = false, label, r = 0, dash } = {}) {
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      const sx = x1 + ux * r, sy = y1 + uy * r, ex = x2 - ux * r, ey = y2 - uy * r;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.strokeStyle = color || T.border; ctx.lineWidth = lw;
      if (dash) ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]);
      if (directed) { ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - ux * 9 - uy * 5, ey - uy * 9 + ux * 5); ctx.lineTo(ex - ux * 9 + uy * 5, ey - uy * 9 - ux * 5); ctx.closePath(); ctx.fillStyle = color || T.border; ctx.fill(); }
      if (label !== undefined && label !== null) {
        const mx = (sx + ex) / 2, my = (sy + ey) / 2;
        ctx.fillStyle = T.bg; ctx.fillRect(mx - 10, my - 8, 20, 16);
        draw.text(ctx, label, mx, my, { color: color && color !== T.border ? color : T.muted, font: "11px 'JetBrains Mono', monospace" });
      }
    },
    // DP table with row/col headers
    table(ctx, data, x, y, cell, T, { rowHead = [], colHead = [], style = () => ({}), fmt = (v) => (v === null || v === undefined ? '' : v) } = {}) {
      const rows = data.length, cols = rows ? data[0].length : 0;
      const ox = x + (rowHead.length ? cell : 0), oy = y + (colHead.length ? cell * 0.8 : 0);
      colHead.forEach((h, c) => draw.text(ctx, h, ox + c * cell + cell / 2, y + cell * 0.4, { color: T.muted, font: "11px 'JetBrains Mono', monospace" }));
      rowHead.forEach((h, r) => draw.text(ctx, h, x + cell / 2, oy + r * cell + cell / 2, { color: T.muted, font: "11px 'JetBrains Mono', monospace" }));
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const st = style(r, c) || {};
        draw.roundRect(ctx, ox + c * cell + 1, oy + r * cell + 1, cell - 2, cell - 2, 4, st.fill || T.panel, st.stroke || T.border, st.lw || 1);
        draw.text(ctx, fmt(data[r][c]), ox + c * cell + cell / 2, oy + r * cell + cell / 2, { color: st.color || T.text, font: `${Math.max(9, Math.min(12, cell / 2.6))}px 'JetBrains Mono', monospace` });
      }
    },
    legend(ctx, items, x, y, T) {
      let cx = x;
      items.forEach(([color, label]) => { ctx.fillStyle = color; ctx.fillRect(cx, y - 6, 12, 12); draw.text(ctx, label, cx + 16, y, { color: T.muted, font: "11px Inter, sans-serif", align: 'left' }); cx += 16 + ctx.measureText(label).width + 18; });
    },
  };

  /* ---------- layouts ---------- */
  const layout = {
    circle(n, cx, cy, r) { return Array.from({ length: n }, (_, i) => ({ x: cx + r * Math.cos((2 * Math.PI * i) / n - Math.PI / 2), y: cy + r * Math.sin((2 * Math.PI * i) / n - Math.PI / 2) })); },
    // simple layered tree layout: children[] lists, root; returns positions
    tree(children, root, W, top, levelH) {
      const pos = [];
      let x = 0;
      const depth = (u, d) => {
        const kids = children[u] || [];
        if (!kids.length) { pos[u] = { x: x++, y: d }; return; }
        kids.forEach((v) => depth(v, d + 1));
        pos[u] = { x: (pos[kids[0]].x + pos[kids[kids.length - 1]].x) / 2, y: d };
      };
      depth(root, 0);
      const leaves = Math.max(1, x - 1);
      const pad = 40;
      return pos.map((p) => (p ? { x: pad + (p.x / leaves) * (W - 2 * pad), y: top + p.y * levelH } : null));
    },
    // deterministic pseudo force layout for small graphs
    force(n, edges, W, H, rng, iters = 300) {
      const P = Array.from({ length: n }, () => ({ x: W * (0.2 + 0.6 * rng()), y: H * (0.2 + 0.6 * rng()), vx: 0, vy: 0 }));
      const k = Math.sqrt((W * H) / (n + 1)) * 0.7;
      for (let it = 0; it < iters; it++) {
        const t = 1 - it / iters;
        for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
          let dx = P[i].x - P[j].x, dy = P[i].y - P[j].y; let d = Math.hypot(dx, dy) || 0.01;
          const f = (k * k) / d; dx /= d; dy /= d;
          P[i].vx += dx * f; P[i].vy += dy * f; P[j].vx -= dx * f; P[j].vy -= dy * f;
        }
        edges.forEach(([a, b]) => {
          let dx = P[a].x - P[b].x, dy = P[a].y - P[b].y; const d = Math.hypot(dx, dy) || 0.01;
          const f = (d * d) / k; dx /= d; dy /= d;
          P[a].vx -= dx * f; P[a].vy -= dy * f; P[b].vx += dx * f; P[b].vy += dy * f;
        });
        P.forEach((p) => {
          const sp = Math.hypot(p.vx, p.vy) || 0.01; const lim = 12 * t + 0.5;
          p.x += (p.vx / sp) * Math.min(sp, lim); p.y += (p.vy / sp) * Math.min(sp, lim); p.vx = p.vy = 0;
          p.x = Math.max(30, Math.min(W - 30, p.x)); p.y = Math.max(30, Math.min(H - 30, p.y));
        });
      }
      return P.map((p) => ({ x: p.x, y: p.y }));
    },
  };

  /* ---------- mounting / playback ---------- */
  const mount = (def, container) => {
    const esc = U.esc;
    const params = {};
    (def.params || []).forEach((p) => (params[p.key] = p.def));
    container.innerHTML = `
      <div class="viz-layout">
        <div>
          <div class="viz-stage"><canvas id="viz-canvas"></canvas>
            <div class="viz-controls">
              <button class="btn small" data-act="first" title="First step">⏮</button>
              <button class="btn small" data-act="prev" title="Previous step (←)">◀</button>
              <button class="btn small primary" data-act="play" title="Play / pause (space)">▶ Play</button>
              <button class="btn small" data-act="next" title="Next step (→)">▶</button>
              <button class="btn small" data-act="last" title="Last step">⏭</button>
              <span class="step-counter" id="viz-step">0 / 0</span>
              <input type="range" id="viz-slider" min="0" max="0" value="0">
              <label class="small muted nowrap">Speed <input type="range" id="viz-speed" min="1" max="10" value="5" style="width:80px;vertical-align:middle"></label>
            </div>
            <div class="viz-explain" id="viz-explain"></div>
          </div>
        </div>
        <div class="col">
          <div class="card">
            <div class="card-title">${UI.icon('settings')} Input</div>
            <div class="viz-params" id="viz-params">
              ${(def.params || []).map((p) => p.type === 'select'
                ? `<label class="field"><span>${esc(p.label)}</span><select class="input" data-param="${p.key}">${p.options.map((o) => `<option value="${esc(o.value)}" ${o.value === p.def ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select></label>`
                : p.type === 'text'
                  ? `<label class="field"><span>${esc(p.label)}</span><input class="input" data-param="${p.key}" value="${esc(p.def)}" style="width:150px"></label>`
                  : `<label class="field"><span>${esc(p.label)}</span><input class="input" type="number" data-param="${p.key}" value="${p.def}" min="${p.min}" max="${p.max}" step="${p.step || 1}"></label>`).join('')}
              <div class="row"><button class="btn small" data-act="shuffle">${UI.icon('dice', 14)} New random input</button><button class="btn small ghost" data-act="rebuild">Apply</button></div>
            </div>
          </div>
          ${def.code ? `<div class="card" style="padding:12px"><div class="card-title" style="margin-bottom:6px">${UI.icon('code')} Code</div><div class="viz-code" id="viz-code">${def.code.map((l, i) => `<div data-line="${i}">${esc(l) || ' '}</div>`).join('')}</div></div>` : ''}
        </div>
      </div>`;

    const canvas = container.querySelector('#viz-canvas');
    const ctx = canvas.getContext('2d');
    const explain = container.querySelector('#viz-explain');
    const slider = container.querySelector('#viz-slider');
    const stepLabel = container.querySelector('#viz-step');
    const speedEl = container.querySelector('#viz-speed');
    const playBtn = container.querySelector('[data-act="play"]');
    let frames = [], drawFrame = null, idx = 0, timer = null, seed = Math.floor(Math.random() * 1e9);
    let H = def.height || 380;

    const readParams = () => {
      container.querySelectorAll('[data-param]').forEach((inp) => {
        const p = def.params.find((x) => x.key === inp.dataset.param);
        if (p.type === 'number') { let v = Number(inp.value); if (isNaN(v)) v = p.def; v = U.clamp(v, p.min, p.max); inp.value = v; params[p.key] = v; }
        else params[p.key] = inp.value;
      });
    };
    const size = () => {
      const W = canvas.parentElement.clientWidth - 24;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(200, W) * dpr; canvas.height = H * dpr;
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return W;
    };
    const render = () => {
      const W = size();
      const T = theme();
      draw.clear(ctx, W, H, T);
      const f = frames[idx];
      if (f && drawFrame) drawFrame(ctx, f, W, H, T);
      explain.innerHTML = f ? (f.html || MD.inline(f.text || '')) : '';
      stepLabel.textContent = `${idx + 1} / ${frames.length}`;
      slider.value = idx;
      if (def.code) container.querySelectorAll('#viz-code div').forEach((d) => d.classList.toggle('hl', f && +d.dataset.line === f.line));
      if (f && def.code && f.line !== undefined) { const el = container.querySelector(`#viz-code div[data-line="${f.line}"]`); if (el) el.scrollIntoView({ block: 'nearest' }); }
    };
    const build = () => {
      readParams();
      const rng = U.seeded(seed);
      const out = def.build(params, rng);
      frames = out.frames || [];
      drawFrame = out.draw;
      if (out.height) { H = out.height; }
      idx = 0;
      slider.max = Math.max(0, frames.length - 1);
      stop();
      render();
    };
    const goTo = (i) => { idx = U.clamp(i, 0, frames.length - 1); render(); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } playBtn.textContent = '▶ Play'; playBtn.classList.add('primary'); };
    const play = () => {
      if (timer) return stop();
      if (idx >= frames.length - 1) idx = 0;
      playBtn.textContent = '⏸ Pause'; playBtn.classList.remove('primary');
      const tick = () => { if (idx >= frames.length - 1) { stop(); return; } goTo(idx + 1); };
      const delay = () => 1300 - 120 * (+speedEl.value);
      timer = setInterval(tick, delay());
      speedEl.oninput = () => { if (timer) { clearInterval(timer); timer = setInterval(tick, delay()); } };
    };
    container.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => {
      const a = b.dataset.act;
      if (a === 'first') goTo(0); else if (a === 'prev') goTo(idx - 1); else if (a === 'next') goTo(idx + 1); else if (a === 'last') goTo(frames.length - 1);
      else if (a === 'play') play(); else if (a === 'shuffle') { seed = Math.floor(Math.random() * 1e9); build(); } else if (a === 'rebuild') build();
    }));
    slider.addEventListener('input', () => { stop(); goTo(+slider.value); });
    container.querySelectorAll('[data-param]').forEach((inp) => inp.addEventListener('change', build));
    const onKey = (e) => {
      if (!container.isConnected) { document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); stop(); return; }
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); stop(); goTo(idx + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); stop(); goTo(idx - 1); }
      else if (e.code === 'Space') { e.preventDefault(); play(); }
    };
    const onResize = U.debounce(render, 100);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    build();
    return { build, goTo, stop };
  };

  // Frame helper: snapshot arrays so later mutation doesn't leak into earlier frames.
  const snap = (obj) => JSON.parse(JSON.stringify(obj));

  return { register, get, list, mount, draw, layout, theme, snap };
})();
