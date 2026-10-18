/* Minimal markdown renderer tuned for lesson content.
   Supports: headings, paragraphs, lists, tables, blockquotes, fenced code (```cpp),
   callouts (:::tip Title ... :::), links, bold/italic/code, and app links:
   [[topic:id]] [[viz:id]] [[problem:id]] [[page:hash|label]]. */
const MD = (() => {
  const esc = U.esc;

  const inline = (text) => {
    const codes = [];
    // protect inline code from the other transforms using a sentinel unlikely to appear in prose
    // inline code: `code` or ''code'' (the latter lets lesson text live inside JS template literals)
    let s = text.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `%%CODE${codes.length - 1}%%`; });
    s = s.replace(/''([^']+(?:'[^'][^']*)*?)''/g, (_, c) => { codes.push(c); return `%%CODE${codes.length - 1}%%`; });
    s = esc(s);
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
    s = s.replace(/\[\[topic:([a-z0-9-]+)\]\]/g, (_, id) => {
      const t = (typeof TOPICS !== 'undefined') && TOPICS.find((x) => x.id === id);
      return `<a class="applink" href="#/topic/${id}">${t ? esc(t.title) : id}</a>`;
    });
    s = s.replace(/\[\[viz:([a-z0-9-]+)\]\]/g, (_, id) => {
      const v = (typeof Viz !== 'undefined') && Viz.get(id);
      return `<a class="applink viz" href="#/viz/${id}">▶ ${v ? esc(v.title) : id} visualizer</a>`;
    });
    s = s.replace(/\[\[problem:([\w-]+)\]\]/g, (_, id) => {
      const p = (typeof PROBLEMS !== 'undefined') && PROBLEMS.find((x) => x.id === id);
      return p ? `<a class="applink prob" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)} <span class="muted">(${esc(p.src)})</span></a>` : id;
    });
    s = s.replace(/\[\[page:([^\]|]+)\|([^\]]+)\]\]/g, '<a class="applink" href="#/$1">$2</a>');
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1 ↗</a>');
    s = s.replace(/\[([^\]]+)\]\((#[^\s)]+)\)/g, '<a href="$2">$1</a>');
    s = s.replace(/%%CODE(\d+)%%/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
    return s;
  };

  const codeBlock = (code, lang, meta) => {
    const id = 'cb' + Math.random().toString(36).slice(2, 8);
    const runnable = /int\s+main\s*\(/.test(code) && (lang === 'cpp' || lang === 'c++');
    const title = meta ? `<span class="code-title">${esc(meta)}</span>` : '';
    return `<div class="codeblock" data-lang="${esc(lang || 'text')}">
      <div class="code-head">${title}<span class="code-lang">${esc(lang || 'text')}</span>
        <span class="spacer"></span>
        ${runnable ? `<button class="btn tiny ghost" data-code-run="${id}" title="Open in Playground">▶ Run</button>` : ''}
        <button class="btn tiny ghost" data-code-copy="${id}" title="Copy">Copy</button>
      </div>
      <pre><code id="${id}" class="lang-${esc(lang || 'text')}">${HL.render(code.replace(/\n$/, ''), lang)}</code></pre>
    </div>`;
  };

  const CALLOUT_ICON = { tip: '💡', warn: '⚠️', pitfall: '🪤', recognize: '🔎', seerc: '🏆', def: '📘', proof: '🧮', example: '🧪', team: '👥' };
  const CALLOUT_TITLE = { tip: 'Tip', warn: 'Warning', pitfall: 'Common pitfall', recognize: 'How to recognize it', seerc: 'SEERC angle', def: 'Definition', proof: 'Why it works', example: 'Worked example', team: 'Team tip' };

  const render = (src) => {
    const lines = (src || '').replace(/\r\n?/g, '\n').split('\n');
    let html = '';
    let i = 0;
    let para = [];
    const flushPara = () => {
      if (para.length) { html += `<p>${inline(para.join(' '))}</p>`; para = []; }
    };
    while (i < lines.length) {
      const line = lines[i];
      // fenced code
      const fence = line.match(/^(```|~~~)(\w+)?\s*(.*)$/);
      if (fence) {
        flushPara();
        const lang = fence[2] || 'text';
        const meta = fence[3] || '';
        const buf = [];
        i++;
        while (i < lines.length && !/^(```|~~~)\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++;
        html += codeBlock(buf.join('\n'), lang, meta);
        continue;
      }
      // callout
      const co = line.match(/^:::(\w+)\s*(.*)$/);
      if (co) {
        flushPara();
        const type = co[1];
        const title = co[2] || CALLOUT_TITLE[type] || type;
        const buf = [];
        i++;
        while (i < lines.length && !/^:::\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++;
        html += `<div class="callout ${esc(type)}"><div class="callout-title">${CALLOUT_ICON[type] || '•'} ${esc(title)}</div>${render(buf.join('\n'))}</div>`;
        continue;
      }
      // heading
      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) { flushPara(); const lvl = h[1].length; html += `<h${lvl}>${inline(h[2])}</h${lvl}>`; i++; continue; }
      // hr
      if (/^---+\s*$/.test(line)) { flushPara(); html += '<hr>'; i++; continue; }
      // table
      if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
        flushPara();
        const head = line.trim().slice(1, -1).split('|').map((c) => c.trim());
        i += 2;
        const rows = [];
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { rows.push(lines[i].trim().slice(1, -1).split('|').map((c) => c.trim())); i++; }
        html += `<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
        continue;
      }
      // lists
      if (/^\s*[-*]\s+/.test(line) || /^\s*\d+[.)]\s+/.test(line)) {
        flushPara();
        const ordered = /^\s*\d+[.)]\s+/.test(line);
        const items = [];
        while (i < lines.length && (/^\s*[-*]\s+/.test(lines[i]) || /^\s*\d+[.)]\s+/.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
          if (/^\s{2,}\S/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*\d+[.)]\s+/.test(lines[i])) {
            items[items.length - 1] += ' ' + lines[i].trim();
          } else {
            items.push(lines[i].replace(/^\s*([-*]|\d+[.)])\s+/, ''));
          }
          i++;
        }
        const tag = ordered ? 'ol' : 'ul';
        html += `<${tag}>${items.map((it) => `<li>${inline(it)}</li>`).join('')}</${tag}>`;
        continue;
      }
      // blockquote
      if (/^>\s?/.test(line)) {
        flushPara();
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
        html += `<blockquote>${render(buf.join('\n'))}</blockquote>`;
        continue;
      }
      if (!line.trim()) { flushPara(); i++; continue; }
      para.push(line.trim());
      i++;
    }
    flushPara();
    return html;
  };

  // Wire up copy/run buttons inside a rendered container.
  const activate = (root) => {
    if (root.dataset.mdActive) return;
    root.dataset.mdActive = '1';
    U.on(root, 'click', '[data-code-copy]', async (e, btn) => {
      const code = root.querySelector('#' + btn.dataset.codeCopy);
      if (code && (await U.copy(code.textContent))) { btn.textContent = 'Copied!'; setTimeout(() => (btn.textContent = 'Copy'), 1200); }
    });
    U.on(root, 'click', '[data-code-run]', (e, btn) => {
      const code = root.querySelector('#' + btn.dataset.codeRun);
      if (code) { sessionStorage.setItem('seerc-play-code', code.textContent); location.hash = '#/playground?load=1'; }
    });
  };

  return { render, inline, activate, codeBlock };
})();
