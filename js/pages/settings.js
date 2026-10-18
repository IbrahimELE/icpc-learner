/* Settings: profile, theme, calculator assumptions, compiler preference, backup/restore. */
Pages.settings = (root) => {
  const esc = U.esc;
  const st = Store.state.settings;
  const used = (() => { try { return new Blob([localStorage.getItem('seerc-trainer-v1') || '']).size; } catch (_) { return 0; } })();
  root.innerHTML = `
    <div class="grid c2">
      <div class="card">
        <div class="card-title">${UI.icon('settings')} Profile</div>
        <label class="field"><span>Your name (shown on the dashboard and the TRD)</span><input class="input" id="s-name" value="${esc(st.name || '')}" placeholder="e.g. Ibrahim"></label>
        <label class="field mt"><span>Theme</span><select class="input" id="s-theme"><option value="dark" ${st.theme === 'dark' ? 'selected' : ''}>Dark</option><option value="light" ${st.theme === 'light' ? 'selected' : ''}>Light</option></select></label>
        <label class="field mt"><span>Target contest date</span><input class="input" type="date" id="s-date" value="${esc(st.contestDate || '2026-12-13')}"></label>
        <div class="muted tiny mt">SEERC 2026: December 11–13, 2026. The last day is used as the default.</div>
      </div>
      <div class="card">
        <div class="card-title">${UI.icon('tool')} Assumptions & compiler</div>
        <label class="field"><span>Simple operations per second (complexity calculator & drills)</span><select class="input" id="s-ops">${[[5e7, '5·10⁷ — pessimistic (heavy STL, maps)'], [1e8, '10⁸ — standard rule of thumb'], [3e8, '3·10⁸ — optimistic (tight array loops)'], [1e9, '10⁹ — very optimistic (bitset / SIMD-friendly)']].map(([v, l]) => `<option value="${v}" ${+st.opsPerSec === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label class="field mt"><span>Playground compiler</span><select class="input" id="s-compiler"><option value="auto" ${st.compiler === 'auto' ? 'selected' : ''}>Auto (local server if running, else Wandbox)</option><option value="local" ${st.compiler === 'local' ? 'selected' : ''}>Local only (start.bat)</option><option value="wandbox" ${st.compiler === 'wandbox' ? 'selected' : ''}>Wandbox only (online)</option></select></label>
      </div>
      <div class="card">
        <div class="card-title">${UI.icon('archive')} Backup & restore</div>
        <p class="small muted">Everything (progress, notes, contests, flashcard schedule) lives in this browser's local storage (${(used / 1024).toFixed(1)} KB used). Export a backup before clearing browser data or switching machines.</p>
        <div class="row"><button class="btn" id="s-export">${UI.icon('copy', 16)} Export JSON</button><label class="btn">${UI.icon('refresh', 16)} Import JSON<input type="file" id="s-import" accept="application/json" hidden></label></div>
      </div>
      <div class="card">
        <div class="card-title">${UI.icon('x')} Danger zone</div>
        <p class="small muted">Reset wipes all progress in this browser. Export first if you might regret it.</p>
        <button class="btn danger" id="s-reset">Reset all progress</button>
      </div>
    </div>
    <div class="card mt md">
      <h3>About</h3>
      <p>SEERC Trainer is a self-contained app: ${TOPICS.length} lessons, ${PROBLEMS.length} curated problems with hints, ${Object.values(QUIZ).reduce((s, a) => s + a.length, 0)} quiz questions, ${FLASHCARDS.length} flashcards, ${DRILLS.length} technique drills, ${Viz.list().length} visualizers, ${TEMPLATES.length} code templates, a contest simulator and a C++ runner. No accounts, no tracking; all data stays on your machine.</p>
      <p class="muted small">Problem links point to CSES, Codeforces, AtCoder and Kattis. SEERC facts were verified in September 2026 — check the official site for the latest rules.</p>
    </div>`;

  root.querySelector('#s-name').addEventListener('input', U.debounce((e) => Store.setSetting('name', e.target.value.trim()), 300));
  root.querySelector('#s-theme').addEventListener('change', (e) => { Store.setSetting('theme', e.target.value); document.documentElement.setAttribute('data-theme', e.target.value); App.renderTopbar(); });
  root.querySelector('#s-date').addEventListener('change', (e) => { if (e.target.value) Store.setSetting('contestDate', e.target.value); });
  root.querySelector('#s-ops').addEventListener('change', (e) => Store.setSetting('opsPerSec', +e.target.value));
  root.querySelector('#s-compiler').addEventListener('change', (e) => Store.setSetting('compiler', e.target.value));
  root.querySelector('#s-export').addEventListener('click', () => { U.download(`seerc-trainer-backup-${U.todayKey()}.json`, Store.exportJSON()); UI.toast('Backup downloaded', 'success'); });
  root.querySelector('#s-import').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { Store.importJSON(await f.text()); UI.toast('Progress imported', 'success'); Router.go('#/'); }
    catch (err) { UI.toast('Import failed: ' + err.message, 'error', 4000); }
  });
  root.querySelector('#s-reset').addEventListener('click', async () => {
    if (await UI.confirm('Delete all progress, notes, contests and flashcard history?', { okLabel: 'Reset everything', danger: true })) { Store.reset(); UI.toast('Progress reset'); Router.go('#/'); }
  });
};
