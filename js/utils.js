import { state } from './state.js';
import { setMode } from './router.js';
import { selectFlow, renderSeq, renderListView } from './flows.js';

export const MOD_LABELS = {
  'CFX':                                                   'Core',
  'CFX.Production':                                        'Production',
  'CFX.Production.Assembly':                               'Production · Assembly',
  'CFX.Production.Assembly.PressInsertion':                'Production · Assembly · Press Insertion',
  'CFX.Production.Application':                            'Production · Application',
  'CFX.Production.Application.Solder':                     'Production · Application · Solder',
  'CFX.Production.Hermes':                                 'Production · Hermes',
  'CFX.Production.LoadingAndUnloading':                    'Production · Loading & Unloading',
  'CFX.Production.Processing':                             'Production · Processing',
  'CFX.Production.ReworkAndRepair':                        'Production · Rework & Repair',
  'CFX.Production.TestAndInspection':                      'Production · Test & Inspection',
  'CFX.Materials.Management':                              'Materials · Management',
  'CFX.Materials.Management.MSDManagement':                'Materials · MSD Management',
  'CFX.Materials.Storage':                                 'Materials · Storage',
  'CFX.Materials.Transport':                               'Materials · Transport',
  'CFX.ResourcePerformance':                               'Resource Performance',
  'CFX.ResourcePerformance.PressInsertion':                'Resource Perf · Press Insertion',
  'CFX.ResourcePerformance.SMTPlacement':                  'Resource Perf · SMT Placement',
  'CFX.ResourcePerformance.SolderPastePrinting':           'Resource Perf · Solder Paste',
  'CFX.ResourcePerformance.THTInsertion':                  'Resource Perf · THT Insertion',
  'CFX.InformationSystem.DataTransfer':                    'Info System · Data Transfer',
  'CFX.InformationSystem.OperatorValidation':              'Info System · Operator Validation',
  'CFX.InformationSystem.ProductionScheduling':            'Info System · Production Scheduling',
  'CFX.InformationSystem.TopicValidation':                 'Info System · Topic Validation',
  'CFX.InformationSystem.UnitValidation':                  'Info System · Unit Validation',
  'CFX.InformationSystem.WorkOrderManagement':             'Info System · Work Order Mgmt',
  'CFX.Maintenance':                                       'Maintenance',
  'CFX.Sensor.Identification':                             'Sensor · Identification',
};

export const COMMON_FLOW_IDS = ['conn', 'shutdown', 'wip', 'recipe', 'fault'];

export function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function announce(msg) {
  const el = document.getElementById('a11y-announce');
  if (!el) return;
  el.textContent = '';
  requestAnimationFrame(() => { el.textContent = msg; });
}

export function showError(msg) {
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;width:100vw;flex-direction:column;gap:12px;font-family:system-ui,-apple-system,sans-serif;background:#f8f9fb">
      <div style="font-size:36px">⚠</div>
      <div style="font-size:16px;font-weight:700;color:#c0392b">資料載入失敗</div>
      <div style="font-size:13px;color:#454f6b;max-width:420px;text-align:center">${esc(msg)}</div>
      <div style="font-size:11px;color:#8898b0">請確認 data/ 資料夾中的 JSON 檔案存在，並透過伺服器（Live Server / GitHub Pages）開啟此頁面。</div>
    </div>`;
}

export function initSidebar() {
  const sb = document.getElementById('sidebar');
  const btn = document.getElementById('sb-toggle');
  const apply = (collapsed) => {
    sb.classList.toggle('collapsed', collapsed);
    btn.textContent = collapsed ? '›' : '‹';
    btn.title = collapsed ? '展開側邊欄' : '收合側邊欄';
  };
  apply(localStorage.getItem('cfx-sb-collapsed') === '1');
  btn.addEventListener('click', () => {
    const next = !sb.classList.contains('collapsed');
    apply(next);
    localStorage.setItem('cfx-sb-collapsed', next ? '1' : '0');
  });
}

export function initDpResize() {
  const handle = document.getElementById('dp-handle');
  const dp = document.getElementById('detail-panel');
  const savedW = parseInt(localStorage.getItem('cfx-dp-width'), 10);
  if (savedW >= 280) { dp.style.width = savedW + 'px'; dp.style.minWidth = savedW + 'px'; }
  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = dp.offsetWidth;
    handle.classList.add('dragging');
    dp.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMove = e => {
      const w = Math.max(280, Math.min(800, startW - (e.clientX - startX)));
      dp.style.width = w + 'px';
      dp.style.minWidth = w + 'px';
    };
    const onUp = () => {
      handle.classList.remove('dragging');
      dp.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (state.curMode !== 'messages') localStorage.setItem('cfx-dp-width', dp.offsetWidth);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

export function initAbout() {
  const modal = document.getElementById('about-modal');
  const open  = document.getElementById('about-btn');
  const close = document.getElementById('about-close');
  const hide = () => { modal.hidden = true; document.removeEventListener('keydown', onKey); };
  const show = () => { modal.hidden = false; close.focus(); document.addEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') hide(); };
  open.addEventListener('click', show);
  close.addEventListener('click', hide);
  modal.addEventListener('click', e => { if (e.target === modal) hide(); });
}

export function findFlowGroup(flowId) {
  return state.FLOWS.find(g => g.items.some(f => f.id === flowId));
}

export function updateBreadcrumb(flow) {
  const bc = document.getElementById('breadcrumb');
  const g = findFlowGroup(flow.id);
  if (!g) { bc.style.display = 'none'; return; }
  bc.style.display = 'flex';
  bc.innerHTML = `<button class="bc-home" style="background:none;border:none;cursor:pointer;color:var(--text3);font-size:10px;padding:0" aria-label="流程列表">流程</button><span class="bc-sep">/</span><span class="bc-dot" style="background:${g.color}"></span>${g.group}<span class="bc-sep">/</span><span class="bc-cur">${flow.label}</span>`;
}

export function showViewBar(activeView) {
  const vb = document.getElementById('view-bar');
  vb.style.display = 'flex';
  vb.querySelectorAll('.vbtn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === activeView);
  });
}

export function setViewMode(view) {
  state.curView = view;
  showViewBar(view);
  const seqPanel  = document.getElementById('seq-panel');
  const listPanel = document.getElementById('list-panel');
  const fbar      = document.getElementById('fbar');
  if (view === 'diagram') {
    seqPanel.style.display  = '';
    listPanel.style.display = 'none';
    fbar.style.display      = 'none';
    if (state.curFlow) renderSeq(state.curFlow);
  } else {
    seqPanel.style.display  = 'none';
    listPanel.style.display = '';
    fbar.style.display      = 'flex';
    if (state.curFlow) renderListView(state.curFlow);
  }
}

export function initAccordion(grpBlock, storageKey) {
  const hdr = grpBlock.querySelector('.grp-hdr');
  const apply = (collapsed) => {
    grpBlock.classList.toggle('collapsed', collapsed);
    hdr.setAttribute('aria-expanded', String(!collapsed));
    localStorage.setItem(storageKey, collapsed ? '1' : '0');
  };
  apply(localStorage.getItem(storageKey) === '1');
  hdr.addEventListener('click', () => apply(!grpBlock.classList.contains('collapsed')));
  hdr.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hdr.click(); }
  });
}

// Fix: was broken in app.js (never called setMode/selectFlow)
export function goToFlow(flow) {
  const btn = document.querySelector('.nav-item[data-mode="flows"]');
  if (btn) {
    setMode('flows', btn);
    selectFlow(flow);
  }
}
