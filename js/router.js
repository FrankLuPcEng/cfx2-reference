import { state } from './state.js';
import { renderSidebar, selectFlow, renderSeq } from './flows.js';
import { renderMsgList, showMsgPlaceholder, selectMsg } from './messages.js';
import { renderMachineList } from './machines.js';
import { renderScenarioList } from './scenarios.js';
import { renderGuideSidebar, renderGuide } from './guide.js';
import { updateBreadcrumb, showViewBar } from './utils.js';

export function updateHash() {
  if (state._restoringHash) return;
  const parts = [state.curMode];
  if (state.curMode === 'flows' && state.curFlow) {
    parts.push(encodeURIComponent(state.curFlow.id ?? state.curFlow.label));
    if (state.curMsg) parts.push(encodeURIComponent(state.curMsg));
  } else if (state.curMode === 'messages' && state.curMsg) {
    parts.push(encodeURIComponent(state.curMsg));
  }
  const hash = '#' + parts.join('/');
  if (location.hash !== hash) history.pushState(null, '', hash);
}

export function restoreFromHash() {
  const raw = location.hash.slice(1);
  if (!raw) return;
  const [mode, p1, p2] = raw.split('/').map(decodeURIComponent);
  const btn = document.querySelector(`.nav-item[data-mode="${mode}"]`);
  if (!btn) return;
  state._restoringHash = true;
  try {
    setMode(mode, btn);
    if (mode === 'flows' && p1 && state.FLOWS.length) {
      const flow = state.FLOWS.flatMap(g => g.items).find(f => (f.id ?? f.label) === p1);
      if (flow) {
        selectFlow(flow);
        if (p2) selectMsg(p2);
      }
    } else if (mode === 'messages' && p1) {
      selectMsg(p1);
    }
  } finally {
    state._restoringHash = false;
  }
}

export function setMode(mode, btn) {
  state.curMode = mode;
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const search = document.getElementById('search');
  const main   = document.getElementById('main');
  const dp     = document.getElementById('detail-panel');
  const fbar   = document.getElementById('fbar');
  const sw     = document.getElementById('search-wrap');

  main.classList.remove('msg-mode');
  dp.classList.add('hidden');
  sw.style.display = '';
  document.getElementById('view-bar').style.display = 'none';
  document.getElementById('breadcrumb').style.display = 'none';
  document.getElementById('list-panel').style.display = 'none';
  document.getElementById('seq-panel').style.display = '';

  if (mode === 'messages') {
    state.curMsg = null;
    search.value = '';
    search.placeholder = '搜尋訊息…';
    main.classList.add('msg-mode');
    dp.classList.remove('hidden');
    document.title = '訊息瀏覽器 — CFX 2.0 Reference';
    document.getElementById('ftitle').textContent = '訊息瀏覽器';
    document.getElementById('fdesc').textContent  = '← 從左側選擇 CFX 訊息查看規格與 JSON 範例';
    document.getElementById('fbadge').style.display = 'none';
    fbar.style.display = 'none';
    showMsgPlaceholder();
    renderMsgList();

  } else if (mode === 'machines') {
    state.curMsg = null;
    state.curMachine = null;
    sw.style.display = 'none';
    fbar.style.display = 'none';
    document.title = '機台視角 — CFX 2.0 Reference';
    document.getElementById('fbadge').style.display = 'none';
    document.getElementById('ftitle').textContent = '機台視角';
    document.getElementById('fdesc').textContent  = '← 選擇機台類型查看 CFX 2.0 實作清單';
    document.getElementById('empty-state').style.display = 'flex';
    document.getElementById('seqc').innerHTML = '';
    renderMachineList();

  } else if (mode === 'scenarios') {
    state.curMsg = null;
    state.curScenario = null;
    sw.style.display = 'none';
    fbar.style.display = 'none';
    document.title = '情境視角 — CFX 2.0 Reference';
    document.getElementById('fbadge').style.display = 'none';
    document.getElementById('ftitle').textContent = '情境視角';
    document.getElementById('fdesc').textContent  = '← 選擇製程情境查看跨流程的 CFX 訊息全貌';
    document.getElementById('empty-state').style.display = 'flex';
    document.getElementById('seqc').innerHTML = '';
    renderScenarioList();

  } else if (mode === 'guide') {
    state.curMsg = null;
    sw.style.display = 'none';
    fbar.style.display = 'none';
    document.getElementById('view-bar').style.display = 'none';
    document.getElementById('breadcrumb').style.display = 'none';
    document.getElementById('list-panel').style.display = 'none';
    document.getElementById('seq-panel').style.display = '';
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('fbadge').style.display = 'none';
    document.title = '開發指南 — CFX 2.0 Reference';
    document.getElementById('ftitle').textContent = '開發指南';
    document.getElementById('fdesc').textContent  = '了解 CFX 架構、AMQP 路由與 Endpoint 開發方式';
    renderGuideSidebar();
    renderGuide();

  } else {
    // flows
    state.curMsg = null;
    state.curView = 'diagram';
    search.value = '';
    search.placeholder = '搜尋流程…';
    document.getElementById('list-panel').style.display = 'none';
    document.getElementById('seq-panel').style.display = '';
    if (state.curFlow) {
      document.title = `${state.curFlow.label} — CFX 2.0 Reference`;
      document.getElementById('ftitle').textContent = state.curFlow.label;
      document.getElementById('fdesc').textContent  = state.curFlow.desc;
      const b = document.getElementById('fbadge');
      b.textContent = state.curFlow.badgeText;
      b.style.display = 'inline';
      b.style.color = state.curFlow.badgeColor;
      b.style.borderColor = state.curFlow.badgeColor + '55';
      b.style.background  = state.curFlow.badgeColor + '18';
      fbar.style.display = 'none';
      updateBreadcrumb(state.curFlow);
      showViewBar('diagram');
      renderSeq(state.curFlow);
    } else {
      document.title = 'CFX 2.0 Message Reference';
      document.getElementById('ftitle').textContent = '選擇左側流程';
      document.getElementById('fdesc').textContent  = '← 選擇 SMT 流程以查看 CFX 2.0 訊息循序圖';
      document.getElementById('breadcrumb').style.display = 'none';
      document.getElementById('view-bar').style.display = 'none';
      fbar.style.display = 'none';
    }
    renderSidebar();
  }
  updateHash();
}
