/* Tiny dependency-free C++ syntax highlighter. Produces spans with hl-* classes. */
const HL = (() => {
  const KEYWORDS = new Set(('alignas alignof and asm auto bitand bitor bool break case catch char char16_t char32_t class compl concept ' +
    'const consteval constexpr constinit const_cast continue co_await co_return co_yield decltype default delete do double dynamic_cast ' +
    'else enum explicit export extern false float for friend goto if inline int long mutable namespace new noexcept not nullptr operator ' +
    'or private protected public register reinterpret_cast requires return short signed sizeof static static_assert static_cast struct ' +
    'switch template this thread_local throw true try typedef typeid typename union unsigned using virtual void volatile wchar_t while ' +
    'override final').split(' '));
  const TYPES = new Set(('vector string pair map set unordered_map unordered_set multiset multimap priority_queue queue deque stack array ' +
    'tuple bitset function optional variant int64_t uint64_t int32_t uint32_t size_t ll ull ld pii pll vi vll vpii ostream istream ' +
    'string_view complex list forward_list iterator numeric_limits mt19937 mt19937_64 uniform_int_distribution chrono __int128 ' +
    'ptrdiff_t intmax_t uint8_t int8_t int16_t uint16_t point pt Point Line Circle Edge Node Tree Seg SegTree DSU Fenwick BIT Matrix ' +
    'Mint mint Z Frac').split(' '));

  const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(^[ \t]*#[^\n]*)|("(?:\.|[^"\\n])*"|'(?:\.|[^'\\n])*')|(\b(?:0[xX][0-9a-fA-F']+|0[bB][01']+|\d[\d']*\.?\d*(?:[eE][+-]?\d+)?)(?:[uUlLfF]{0,3})\b)|([A-Za-z_]\w*)(?=\s*\()|([A-Za-z_]\w*)|(\S)/gm;

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const cpp = (code) => {
    let out = '';
    let last = 0;
    code.replace(TOKEN, (m, comment, pre, str, num, fn, ident, sym, offset) => {
      out += esc(code.slice(last, offset));
      last = offset + m.length;
      if (comment) out += `<span class="hl-c">${esc(m)}</span>`;
      else if (pre) out += `<span class="hl-p">${esc(m)}</span>`;
      else if (str) out += `<span class="hl-s">${esc(m)}</span>`;
      else if (num) out += `<span class="hl-n">${esc(m)}</span>`;
      else if (fn) out += KEYWORDS.has(fn) ? `<span class="hl-k">${esc(m)}</span>` : TYPES.has(fn) ? `<span class="hl-t">${esc(m)}</span>` : `<span class="hl-f">${esc(m)}</span>`;
      else if (ident) out += KEYWORDS.has(ident) ? `<span class="hl-k">${esc(m)}</span>` : TYPES.has(ident) ? `<span class="hl-t">${esc(m)}</span>` : esc(m);
      else out += esc(m);
      return m;
    });
    out += esc(code.slice(last));
    return out;
  };

  const plain = (code) => esc(code);

  const render = (code, lang) => {
    const l = (lang || '').toLowerCase();
    if (l === 'cpp' || l === 'c++' || l === 'c' || l === 'cc') return cpp(code);
    return plain(code);
  };

  return { cpp, plain, render };
})();
