import { state } from './js/state.js';
import { initTheme, toggleTheme } from './js/theme.js';
import { initSidebar, initDpResize, initAbout, showError, setViewMode, announce } from './js/utils.js';
import { renderSidebar, selectFlow, setFilter } from './js/flows.js';
import { renderMsgList, selectMsg } from './js/messages.js';
import { setMode, restoreFromHash } from './js/router.js';

async function init() {
  initTheme();
  initSidebar();
  initDpResize();
  initAbout();
  try {
    const [pRes, mRes, fRes, sRes] = await Promise.all([
      fetch('data/participants.json'),
      fetch('data/messages.json'),
      fetch('data/flows.json'),
      fetch('data/scenarios.json'),
    ]);
    if (!pRes.ok || !mRes.ok || !fRes.ok || !sRes.ok) {
      throw new Error(`HTTP error — participants:${pRes.status} messages:${mRes.status} flows:${fRes.status} scenarios:${sRes.status}`);
    }
    [state.P, state.MSGS, state.FLOWS, state.SCENARIOS] = await Promise.all([
      pRes.json(), mRes.json(), fRes.json(), sRes.json()
    ]);
  } catch (err) {
    showError(err.message);
    return;
  }
  setupListeners();
  renderSidebar();
  window.addEventListener('popstate', restoreFromHash);
  restoreFromHash();
  // Version info — fetched separately, failure is non-fatal
  fetch('data/version.json').then(r => r.ok ? r.json() : null).then(v => {
    if (!v) return;
    const el = document.getElementById('version-info');
    if (!el) return;
    const label = v.version === 'dev' ? 'dev · local' : `${v.version} · ${v.commit} · ${v.date}`;
    el.textContent = label;
    el.title = `Build: ${v.build || '—'}`;
  }).catch(() => {});
}

function setupListeners() {
  document.getElementById('search').addEventListener('input', e => {
    if (state.curMode === 'flows') renderSidebar(e.target.value);
    else renderMsgList(e.target.value);
  });

  document.querySelectorAll('#mode-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode, btn));
  });

  document.querySelectorAll('#fbar .fbtn').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter, btn));
  });

  document.querySelectorAll('#view-bar .vbtn').forEach(btn => {
    btn.addEventListener('click', () => setViewMode(btn.dataset.view));
  });

  document.getElementById('seqc').addEventListener('click', e => {
    const g = e.target.closest('[data-msg]');
    if (g) selectMsg(g.dataset.msg);
  });

  document.getElementById('listc').addEventListener('click', e => {
    const row = e.target.closest('.list-step[data-step-msg]');
    if (row && row.dataset.stepMsg) selectMsg(row.dataset.stepMsg);
  });

  document.getElementById('detail-panel').addEventListener('click', e => {
    if (e.target.closest('.xbtn')) {
      if (state.curMsg) selectMsg(state.curMsg);
    }
    const copyBtn = e.target.closest('.copy-btn');
    if (copyBtn) {
      const text = copyBtn.closest('.cb-wrap')?.querySelector('.cb')?.textContent ?? '';
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = '已複製！';
        copyBtn.classList.add('copied');
        announce('已複製到剪貼簿');
        setTimeout(() => {
          copyBtn.textContent = '複製';
          copyBtn.classList.remove('copied');
        }, 1500);
      }).catch(() => {});
    }
  });

  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}

document.addEventListener('DOMContentLoaded', init);
