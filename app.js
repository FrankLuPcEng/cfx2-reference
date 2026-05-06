let P = {}, MSGS = {}, FLOWS = [], SCENARIOS = [];
let curFlow = null, curMsg = null, msgFilter = 'all', curMode = 'flows', curMachine = null, curScenario = null, curView = 'diagram';
let _restoringHash = false;

function updateHash() {
  if (_restoringHash) return;
  const parts = [curMode];
  if (curMode === 'flows' && curFlow) {
    parts.push(encodeURIComponent(curFlow.id ?? curFlow.label));
    if (curMsg) parts.push(encodeURIComponent(curMsg));
  } else if (curMode === 'messages' && curMsg) {
    parts.push(encodeURIComponent(curMsg));
  }
  const hash = '#' + parts.join('/');
  if (location.hash !== hash) history.pushState(null, '', hash);
}

function restoreFromHash() {
  const raw = location.hash.slice(1);
  if (!raw) return;
  const [mode, p1, p2] = raw.split('/').map(decodeURIComponent);
  const btn = document.querySelector(`.nav-item[data-mode="${mode}"]`);
  if (!btn) return;
  _restoringHash = true;
  try {
    setMode(mode, btn);
    if (mode === 'flows' && p1 && FLOWS.length) {
      const flow = FLOWS.flatMap(g => g.items).find(f => (f.id ?? f.label) === p1);
      if (flow) {
        selectFlow(flow);
        if (p2) selectMsg(p2);
      }
    } else if (mode === 'messages' && p1) {
      selectMsg(p1);
    }
  } finally {
    _restoringHash = false;
  }
}

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
    [P, MSGS, FLOWS, SCENARIOS] = await Promise.all([pRes.json(), mRes.json(), fRes.json(), sRes.json()]);
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

function showError(msg) {
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;width:100vw;flex-direction:column;gap:12px;font-family:system-ui,-apple-system,sans-serif;background:#f8f9fb">
      <div style="font-size:36px">⚠</div>
      <div style="font-size:16px;font-weight:700;color:#c0392b">資料載入失敗</div>
      <div style="font-size:13px;color:#454f6b;max-width:420px;text-align:center">${esc(msg)}</div>
      <div style="font-size:11px;color:#8898b0">請確認 data/ 資料夾中的 JSON 檔案存在，並透過伺服器（Live Server / GitHub Pages）開啟此頁面。</div>
    </div>`;
}

function setupListeners() {
  document.getElementById('search').addEventListener('input', e => {
    if (curMode === 'flows') renderSidebar(e.target.value);
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

  // Event delegation for SVG message label clicks
  document.getElementById('seqc').addEventListener('click', e => {
    const g = e.target.closest('[data-msg]');
    if (g) selectMsg(g.dataset.msg);
  });

  // Event delegation for list view clicks
  document.getElementById('listc').addEventListener('click', e => {
    const row = e.target.closest('.list-step[data-step-msg]');
    if (row && row.dataset.stepMsg) selectMsg(row.dataset.stepMsg);
  });

  // Event delegation for detail panel close button + copy button
  document.getElementById('detail-panel').addEventListener('click', e => {
    if (e.target.closest('.xbtn')) {
      if (curMsg) selectMsg(curMsg);
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

function initTheme() {
  const saved = localStorage.getItem('cfx-theme');
  const prefersDark = !saved && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = saved === 'dark' || prefersDark;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.getElementById('theme-toggle').textContent = dark ? '☾' : '☀';
  updateThemeColorMeta(dark);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('cfx-theme')) {
      document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
      document.getElementById('theme-toggle').textContent = e.matches ? '☾' : '☀';
      updateThemeColorMeta(e.matches);
    }
  });
}

function toggleTheme() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'light' : 'dark';
  localStorage.setItem('cfx-theme', isDark ? 'light' : 'dark');
  document.getElementById('theme-toggle').textContent = isDark ? '☀' : '☾';
  updateThemeColorMeta(!isDark);
}

function updateThemeColorMeta(isDark) {
  const meta = document.getElementById('theme-color-meta');
  if (meta) meta.content = isDark ? '#1f2335' : '#2d4f9e';
}

function announce(msg) {
  const el = document.getElementById('a11y-announce');
  if (!el) return;
  el.textContent = '';
  requestAnimationFrame(() => { el.textContent = msg; });
}

function makeSeqKeyboard() {
  const seqc = document.getElementById('seqc');
  seqc.querySelectorAll('[data-msg]').forEach(g => {
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', g.dataset.msg);
    g.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectMsg(g.dataset.msg);
      }
    });
  });
}

function initSidebar() {
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

function initDpResize() {
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
      localStorage.setItem('cfx-dp-width', dp.offsetWidth);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

function initAbout() {
  const modal = document.getElementById('about-modal');
  const open  = document.getElementById('about-btn');
  const close = document.getElementById('about-close');
  const hide = () => { modal.hidden = true; document.removeEventListener('keydown', onKey); };
  const show = () => { modal.hidden = false; close.focus(); document.addEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') hide(); };
  open.addEventListener('click', show);
  close.addEventListener('click', hide);
  modal.addEventListener('click', e => { if (e.target === modal) hide(); }); // click backdrop
}

function setMode(mode, btn) {
  curMode = mode;
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const search = document.getElementById('search');
  const main   = document.getElementById('main');
  const dp     = document.getElementById('detail-panel');
  const fbar   = document.getElementById('fbar');
  const sw     = document.getElementById('search-wrap');

  // Reset shared layout state
  main.classList.remove('msg-mode');
  dp.classList.add('hidden');
  sw.style.display = '';
  document.getElementById('view-bar').style.display = 'none';
  document.getElementById('breadcrumb').style.display = 'none';
  document.getElementById('list-panel').style.display = 'none';
  document.getElementById('seq-panel').style.display = '';

  if (mode === 'messages') {
    curMsg = null;
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
    curMsg = null;
    curMachine = null;
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
    curMsg = null;
    curScenario = null;
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
    curMsg = null;
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
    curMsg = null;
    curView = 'diagram';
    search.value = '';
    search.placeholder = '搜尋流程…';
    document.getElementById('list-panel').style.display = 'none';
    document.getElementById('seq-panel').style.display = '';
    if (curFlow) {
      document.title = `${curFlow.label} — CFX 2.0 Reference`;
      document.getElementById('ftitle').textContent = curFlow.label;
      document.getElementById('fdesc').textContent  = curFlow.desc;
      const b = document.getElementById('fbadge');
      b.textContent = curFlow.badgeText;
      b.style.display = 'inline';
      b.style.color = curFlow.badgeColor;
      b.style.borderColor = curFlow.badgeColor + '55';
      b.style.background  = curFlow.badgeColor + '18';
      fbar.style.display = 'none'; // filter only available in list view
      updateBreadcrumb(curFlow);
      showViewBar('diagram');
      renderSeq(curFlow);
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

const MOD_LABELS = {
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

const COMMON_FLOW_IDS = ['conn', 'shutdown', 'wip', 'recipe', 'fault'];

/* ── Flow group helpers ─────────────────────────── */
function findFlowGroup(flowId) {
  return FLOWS.find(g => g.items.some(f => f.id === flowId));
}

function updateBreadcrumb(flow) {
  const bc = document.getElementById('breadcrumb');
  const g = findFlowGroup(flow.id);
  if (!g) { bc.style.display = 'none'; return; }
  bc.style.display = 'flex';
  bc.innerHTML = `<a href="#" class="bc-home">流程</a><span class="bc-sep">/</span><span class="bc-dot" style="background:${g.color}"></span>${g.group}<span class="bc-sep">/</span><span class="bc-cur">${flow.label}</span>`;
  bc.querySelector('.bc-home').addEventListener('click', e => e.preventDefault());
}

function showViewBar(activeView) {
  const vb = document.getElementById('view-bar');
  vb.style.display = 'flex';
  vb.querySelectorAll('.vbtn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === activeView);
  });
}

function setViewMode(view) {
  curView = view;
  showViewBar(view);
  const seqPanel  = document.getElementById('seq-panel');
  const listPanel = document.getElementById('list-panel');
  const fbar      = document.getElementById('fbar');
  if (view === 'diagram') {
    seqPanel.style.display  = '';
    listPanel.style.display = 'none';
    fbar.style.display      = 'none';
    if (curFlow) renderSeq(curFlow);
  } else {
    seqPanel.style.display  = 'none';
    listPanel.style.display = '';
    fbar.style.display      = 'flex';
    if (curFlow) renderListView(curFlow);
  }
}

function renderListView(flow) {
  const el = document.getElementById('listc');
  let html = '';
  let idx = 0;
  flow.steps.forEach(step => {
    if (msgFilter !== 'all' && step.type !== msgFilter) return;
    idx++;
    const spec  = MSGS[step.msg];
    const isAct = curMsg === step.msg;
    const from  = (P[step.from]?.label || step.from).replace('\n', ' ');
    const to    = (P[step.to]?.label || step.to).replace('\n', ' ');
    const dc = step.type === 'response' ? '#555e70' : step.type === 'event' ? 'var(--green)' : '#1565c0';
    const dl = step.type === 'response' ? 'RES' : step.type === 'event' ? 'EVT' : 'REQ';
    const canClick = !!spec;
    html += `<div class="list-step${isAct ? ' active' : ''}${canClick ? '' : ' no-spec'}" ${canClick ? `data-step-msg="${step.msg.replace(/"/g,'&quot;')}"` : ''}>
      <div class="list-step-num">${idx}</div>
      <span class="msg-dir" style="color:${dc};border-color:${dc}44;background:${dc}15">${dl}</span>
      <div class="list-step-via">${from} → ${to}</div>
      <div class="list-step-name${step.raw ? ' raw' : ''}" title="${step.msg}">${step.msg}</div>
      ${step.note ? `<div class="list-step-note">${step.note}</div>` : ''}
    </div>`;
  });
  el.innerHTML = html || `<p style="color:var(--text3);font-size:12px;padding:24px 0;text-align:center">沒有符合篩選條件的訊息</p>`;
}

const MACHINE_DEFS = [
  { id: 'ENDPOINT',   label: 'Generic CFX Endpoint',          color: '#5e35b1' },
  { id: 'PRINTER_M',  label: 'Stencil Printer',               color: '#1565c0' },
  { id: 'SPI_M',      label: 'SPI Machine',                   color: '#00838f' },
  { id: 'MOUNTER_M',  label: 'SMT Mounter',                   color: '#2e7d32' },
  { id: 'AOI_M',      label: 'AOI / AXI',                     color: '#558b2f' },
  { id: 'REFLOW_M',   label: 'Reflow Oven',                   color: '#e65100' },
  { id: 'SOLDER_M',   label: 'Soldering',                     color: '#bf360c' },
  { id: 'TESTER_M',   label: 'Test Equipment',                color: '#6a1b9a' },
  { id: 'LABELER_M',  label: 'Labeler / Laser Marker',        color: '#37474f' },
  { id: 'COATING_M',  label: 'Conformal Coating / Cleaning',  color: '#4e342e' },
];

function getMachineFlows(machineId) {
  const allFlows = FLOWS.flatMap(g =>
    g.items.map(f => ({ ...f, groupColor: g.color, groupLabel: g.group }))
  );
  const common   = COMMON_FLOW_IDS.map(id => allFlows.find(f => f.id === id)).filter(Boolean);
  const specific = machineId === 'ENDPOINT'
    ? []
    : allFlows.filter(f => f.participants.includes(machineId) && !COMMON_FLOW_IDS.includes(f.id));
  return { common, specific };
}

function countMachineMessages(flows) {
  const seen = new Set();
  flows.forEach(f => f.steps.forEach(s => { if (s.msg && !s.raw) seen.add(s.msg); }));
  return seen.size;
}

function showMsgPlaceholder() {
  document.getElementById('di').innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;color:var(--text3);text-align:center"><div style="font-size:36px;margin-bottom:12px;opacity:0.3">✉</div><p style="font-size:13px;line-height:1.9">從左側選擇 CFX 訊息<br>查看規格與 JSON 範例</p></div>';
}

function renderMachineList() {
  const el = document.getElementById('flow-list');
  el.innerHTML = '';
  MACHINE_DEFS.forEach(m => {
    const d = document.createElement('div');
    d.className = 'machine-item' + (curMachine === m.id ? ' active' : '');
    d.innerHTML = `<span class="dot" style="background:${m.color}"></span>${m.label}`;
    d.addEventListener('click', () => selectMachine(m.id));
    el.appendChild(d);
  });
}

function renderMachineDetail(machineId) {
  const def = MACHINE_DEFS.find(m => m.id === machineId);
  const { common, specific } = getMachineFlows(machineId);
  const allFlows = [...common, ...specific];
  const msgCount = countMachineMessages(allFlows);

  function cardHTML(flow) {
    const bc = flow.badgeColor || flow.groupColor;
    return `<div class="flow-card" data-flow-id="${flow.id}">
      <span class="dot" style="background:${flow.groupColor};margin-top:3px;flex-shrink:0"></span>
      <div class="flow-card-body">
        <div class="flow-card-label">${flow.label}</div>
        <div class="flow-card-desc">${flow.desc}</div>
      </div>
      <span class="flow-card-badge" style="color:${bc};border-color:${bc}44;background:${bc}15">${flow.groupLabel} →</span>
    </div>`;
  }

  const specificHTML = specific.length
    ? specific.map(cardHTML).join('')
    : `<div class="no-specific">此機型無獨立的專屬流程</div>`;

  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('seqc').innerHTML = `
    <div class="mach-detail">
      <div class="mach-section-hdr">共用基礎流程 (${common.length})</div>
      ${common.map(cardHTML).join('')}
      <div class="mach-section-hdr">機型專屬流程 (${specific.length})</div>
      ${specificHTML}
      <div class="mach-summary">合計：${allFlows.length} 個流程 &nbsp;·&nbsp; ${msgCount} 個相關訊息</div>
    </div>`;

  document.getElementById('seqc').querySelectorAll('.flow-card[data-flow-id]').forEach(card => {
    card.addEventListener('click', () => {
      const flow = FLOWS.flatMap(g => g.items).find(f => f.id === card.dataset.flowId);
      if (flow) goToFlow(flow);
    });
  });
}

function selectMachine(machineId) {
  curMachine = machineId;
  const def = MACHINE_DEFS.find(m => m.id === machineId);
  document.querySelectorAll('.machine-item').forEach(el => {
    el.classList.toggle('active', el.textContent.trim() === def.label);
  });
  document.getElementById('ftitle').textContent = def.label;
  document.getElementById('fdesc').textContent  = 'CFX 2.0 實作清單 — 此機台需實作的完整流程列表';
  const b = document.getElementById('fbadge');
  b.textContent = '機台';
  b.style.display = 'inline';
  b.style.color = def.color;
  b.style.borderColor = def.color + '55';
  b.style.background  = def.color + '18';
  renderMachineDetail(machineId);
}

function goToFlow(flow) {
  const btn = document.querySelector('.nav-item[data-mode="flows"]');
}

function renderScenarioList() {
  const el = document.getElementById('flow-list');
  el.innerHTML = '';
  SCENARIOS.forEach(sc => {
    const d = document.createElement('div');
    d.className = 'scenario-item' + (curScenario === sc.id ? ' active' : '');
    d.innerHTML = `
      <span class="scenario-item-icon">${sc.icon}</span>
      <span class="scenario-item-body">
        <div class="scenario-item-label">${sc.label}</div>
        <div class="scenario-item-desc">${sc.desc}</div>
      </span>`;
    d.addEventListener('click', () => selectScenario(sc.id));
    el.appendChild(d);
  });
}

function renderScenarioDetail(scenarioId) {
  const sc = SCENARIOS.find(s => s.id === scenarioId);
  if (!sc) return;
  const allFlows = FLOWS.flatMap(g =>
    g.items.map(f => ({ ...f, groupColor: g.color, groupLabel: g.group }))
  );

  const flowCards = sc.flowIds.map((fid, idx) => {
    const flow = allFlows.find(f => f.id === fid);
    if (!flow) return '';
    const bc = flow.badgeColor || flow.groupColor;
    const machineDefs = MACHINE_DEFS.filter(m => sc.machineIds.includes(m.id) && flow.participants.includes(m.id));
    const chipsHTML = machineDefs.length
      ? `<div class="scenario-chips">${machineDefs.map(m => `<span class="machine-chip">${m.label}</span>`).join('')}</div>`
      : '';
    return `
      <div class="flow-card" data-flow-id="${flow.id}" style="align-items:flex-start">
        <span class="scenario-step-num">${idx + 1}</span>
        <div class="flow-card-body">
          <div class="flow-card-label">${flow.label}</div>
          <div class="flow-card-desc">${flow.desc}</div>
        </div>
        <span class="flow-card-badge" style="color:${bc};border-color:${bc}44;background:${bc}15">${flow.groupLabel} →</span>
      </div>
      ${chipsHTML}`;
  }).join('');

  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('seqc').innerHTML = `
    <div class="scenario-detail">
      <div class="scenario-narrative">${sc.narrative}</div>
      <div class="mach-section-hdr">流程步驟 (${sc.flowIds.length})</div>
      ${flowCards}
      <div class="mach-summary">涵蓋 ${sc.flowIds.length} 個流程，點選任一步驟查看詳細循序圖</div>
    </div>`;

  document.getElementById('seqc').querySelectorAll('.flow-card[data-flow-id]').forEach(card => {
    card.addEventListener('click', () => {
      const flow = allFlows.find(f => f.id === card.dataset.flowId);
      if (flow) goToFlow(flow);
    });
  });
}

function selectScenario(scenarioId) {
  curScenario = scenarioId;
  const sc = SCENARIOS.find(s => s.id === scenarioId);
  document.querySelectorAll('.scenario-item').forEach((el, idx) => {
    el.classList.toggle('active', SCENARIOS[idx]?.id === scenarioId);
  });
  document.getElementById('ftitle').textContent = sc.label;
  document.getElementById('fdesc').textContent  = sc.desc;
  const b = document.getElementById('fbadge');
  b.textContent = '情境';
  b.style.display = 'inline';
  b.style.color = sc.color;
  b.style.borderColor = sc.color + '55';
  b.style.background  = sc.color + '18';
  renderScenarioDetail(scenarioId);
}

function renderMsgList(term = '') {
  const el = document.getElementById('flow-list');
  el.innerHTML = '';
  const t = term.toLowerCase();

  const groups = {};
  Object.entries(MSGS).forEach(([key, msg]) => {
    if (t) {
      const shortName = key.split('.').pop().toLowerCase();
      if (!key.toLowerCase().includes(t) && !shortName.includes(t) && !msg.desc.toLowerCase().includes(t)) return;
    }
    const mod = msg.module || 'CFX.Core';
    if (!groups[mod]) groups[mod] = [];
    groups[mod].push({ key, ...msg });
  });

  const modOrder = Object.keys(MOD_LABELS);
  const sortedMods = Object.keys(groups).sort((a, b) => {
    const ai = modOrder.indexOf(a), bi = modOrder.indexOf(b);
    if (ai < 0 && bi < 0) return a.localeCompare(b);
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
  });

  if (!sortedMods.length) {
    el.innerHTML = '<div style="padding:24px 14px;color:var(--text3);font-size:11px;text-align:center">無符合的訊息</div>';
    return;
  }

  sortedMods.forEach(mod => {
    const grp = document.createElement('div');
    grp.className = 'grp-block';
    grp.dataset.grp = mod;
    grp.innerHTML = `<div class="grp-hdr" role="button" tabindex="0" aria-expanded="true"><span class="grp-chevron" aria-hidden="true">▾</span>${MOD_LABELS[mod] || mod}</div><div class="grp-items"></div>`;
    const itemsEl = grp.querySelector('.grp-items');
    groups[mod].forEach(msg => {
      const shortName = msg.key.split('.').pop();
      const dc = msg.dir === 'response' ? '#555e70' : msg.dir === 'event' ? '#1a7a40' : '#1565c0';
      const dl = msg.dir === 'response' ? 'RES' : msg.dir === 'event' ? 'EVT' : 'REQ';
      const d = document.createElement('div');
      d.className = 'msg-item' + (curMsg === msg.key ? ' active' : '');
      d.innerHTML = `<span class="msg-dir" style="color:${dc};border-color:${dc}44;background:${dc}15">${dl}</span><span class="msg-name" title="${msg.key}">${shortName}</span>`;
      d.addEventListener('click', () => selectMsg(msg.key));
      itemsEl.appendChild(d);
    });
    el.appendChild(grp);
    if (!t) {
      const key = `cfx-acc-msgs-${mod}`;
      initAccordion(grp, key);
      if (grp.querySelector('.msg-item.active')) {
        grp.classList.remove('collapsed');
        grp.querySelector('.grp-hdr').setAttribute('aria-expanded', 'true');
        localStorage.setItem(key, '0');
      }
    }
  });
}

function initAccordion(grpBlock, storageKey) {
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

function renderSidebar(term = '') {
  const el = document.getElementById('flow-list');
  el.innerHTML = '';
  const t = term.toLowerCase();
  FLOWS.forEach(g => {
    const items = g.items.filter(f =>
      !t ||
      f.label.toLowerCase().includes(t) ||
      f.desc.toLowerCase().includes(t) ||
      (f.steps && f.steps.some(s => s.msg.toLowerCase().includes(t)))
    );
    if (!items.length) return;
    const grp = document.createElement('div');
    grp.className = 'grp-block';
    grp.dataset.grp = g.group;
    grp.innerHTML = `<div class="grp-hdr" role="button" tabindex="0" aria-expanded="true"><span class="grp-chevron" aria-hidden="true">▾</span>${g.group}</div><div class="grp-items"></div>`;
    const itemsEl = grp.querySelector('.grp-items');
    items.forEach(flow => {
      const d = document.createElement('div');
      d.className = 'flow-item' + (curFlow?.id === flow.id ? ' active' : '');
      d.innerHTML = `<span class="dot" style="background:${g.color}"></span>${flow.label}`;
      d.onclick = () => selectFlow(flow);
      itemsEl.appendChild(d);
    });
    el.appendChild(grp);
    if (!t) {
      const key = `cfx-acc-flows-${g.group}`;
      initAccordion(grp, key);
      if (grp.querySelector('.flow-item.active')) {
        grp.classList.remove('collapsed');
        grp.querySelector('.grp-hdr').setAttribute('aria-expanded', 'true');
        localStorage.setItem(key, '0');
      }
    }
  });
}

function selectFlow(flow) {
  curFlow = flow;
  curMsg = null;
  curView = 'diagram';
  document.title = `${flow.label} — CFX 2.0 Reference`;
  document.getElementById('detail-panel').classList.add('hidden');
  document.getElementById('list-panel').style.display = 'none';
  document.getElementById('seq-panel').style.display = '';
  document.querySelectorAll('.flow-item').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.flow-item').forEach(e => {
    if (e.textContent.trim() === flow.label) e.classList.add('active');
  });
  document.getElementById('ftitle').textContent = flow.label;
  document.getElementById('fdesc').textContent = flow.desc;
  const b = document.getElementById('fbadge');
  b.textContent = flow.badgeText;
  b.style.display = 'inline';
  b.style.color = flow.badgeColor;
  b.style.borderColor = flow.badgeColor + '55';
  b.style.background = flow.badgeColor + '18';
  document.getElementById('fbar').style.display = 'none'; // filter only in list view
  document.getElementById('empty-state').style.display = 'none';
  updateBreadcrumb(flow);
  showViewBar('diagram');
  renderSeq(flow);
  const activeFlowItem = document.querySelector('.flow-item.active');
  if (activeFlowItem) {
    const grpBlock = activeFlowItem.closest('.grp-block');
    if (grpBlock) {
      grpBlock.classList.remove('collapsed');
      grpBlock.querySelector('.grp-hdr').setAttribute('aria-expanded', 'true');
      localStorage.setItem(`cfx-acc-flows-${grpBlock.dataset.grp}`, '0');
    }
  }
  updateHash();
}

function renderSeq(flow) {
  const parts = flow.participants;
  const nP = parts.length;
  const steps = flow.steps; // always show ALL steps in diagram — preserves narrative

  const BOX_W = 140, BOX_H = 44, PAD = 20;

  // Dynamic COL_W: wide enough that adjacent-column messages fit comfortably,
  // but capped at 300px — labels for very long names extend beyond lifelines (UML convention)
  let minColW = BOX_W + 40;
  steps.forEach(step => {
    const fi = parts.indexOf(step.from);
    const ti = parts.indexOf(step.to);
    if (fi < 0 || ti < 0) return;
    const colSpan = Math.abs(fi - ti);
    if (colSpan === 0) return;
    const estLabelW = step.msg.length * 6.8 + 20;
    const neededColW = Math.ceil(estLabelW / colSpan);
    minColW = Math.max(minColW, neededColW);
  });
  const COL_W = Math.min(minColW, 300); // cap; very long labels extend via lx clamping
  const TOTAL_W = COL_W * nP + PAD * 2;
  const ROW_H = 56;
  const TOP_PAD = 10;
  const FIRST_Y = BOX_H + TOP_PAD + 24;
  const CANVAS_H = steps.length * ROW_H + 40;
  const BOT_Y = FIRST_Y + CANVAS_H;
  const SVG_H = BOT_Y + BOX_H + 20;

  const cx = i => PAD + i * COL_W + COL_W / 2;

  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${TOTAL_W}" height="${SVG_H}" style="font-family:system-ui,-apple-system,sans-serif">
  <defs>
    <marker id="ah" viewBox="0 0 10 7" refX="9" refY="3.5" markerWidth="8" markerHeight="8" orient="auto">
      <polygon points="0,0 10,3.5 0,7" style="fill:var(--text2)"/>
    </marker>
    <filter id="msg-glow" x="-40%" y="-80%" width="180%" height="260%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" style="flood-color:var(--accent)" flood-opacity="0.65"/>
    </filter>
  </defs>`;

  // Top participant boxes
  parts.forEach((p, i) => {
    const info = P[p];
    const x = cx(i) - BOX_W / 2;
    const lines = info.label.split('\n');
    s += `<rect x="${x}" y="${TOP_PAD}" width="${BOX_W}" height="${BOX_H}" style="fill:var(--bg2);stroke:var(--border2)" stroke-width="1.5"/>`;
    lines.forEach((ln, li) => {
      s += `<text x="${cx(i)}" y="${TOP_PAD + BOX_H / 2 + (li - (lines.length - 1) / 2) * 14}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" style="fill:var(--text)">${ln}</text>`;
    });
  });

  // Lifelines
  parts.forEach((p, i) => {
    s += `<line x1="${cx(i)}" y1="${TOP_PAD + BOX_H}" x2="${cx(i)}" y2="${BOT_Y}" style="stroke:var(--accent)" stroke-width="1" opacity="0.3"/>`;
  });

  // Frames (opt/alt)
  if (flow.frames) {
    flow.frames.forEach(fr => {
      const sy = FIRST_Y + fr.startStep * ROW_H - ROW_H / 2 - 6;
      const ey = FIRST_Y + fr.endStep * ROW_H + ROW_H / 2 + 6;
      const fh = ey - sy;
      s += `<rect x="${PAD}" y="${sy}" width="${TOTAL_W - PAD * 2}" height="${fh}" fill="none" style="stroke:var(--border2)" stroke-width="1.5" stroke-dasharray="6,3"/>`;
      s += `<rect x="${PAD}" y="${sy}" width="28" height="14" style="fill:var(--accent2)"/>`;
      s += `<text x="${PAD + 14}" y="${sy + 7}" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="700" style="fill:#fff">${fr.label}</text>`;
      s += `<text x="${PAD + 36}" y="${sy + 7}" dominant-baseline="central" font-size="9" style="fill:var(--text2)" font-style="italic">[${fr.cond}]</text>`;
    });
  }

  // Message arrows
  steps.forEach((step, idx) => {
    const y = FIRST_Y + idx * ROW_H;
    const fi = parts.indexOf(step.from);
    const ti = parts.indexOf(step.to);
    if (fi < 0 || ti < 0) return;
    const x1 = cx(fi), x2 = cx(ti);
    const goRight = x2 >= x1;
    const dash = step.type === 'response' ? 'stroke-dasharray="6,3"' : step.raw ? 'stroke-dasharray="4,4"' : '';
    const col = step.raw ? 'var(--border2)' : 'var(--text2)';
    const midX = (x1 + x2) / 2;
    const hasNote = !!step.note;

    if (hasNote) {
      s += `<text x="${midX}" y="${y - 20}" text-anchor="middle" font-size="9" style="fill:var(--text3)" font-style="italic">${step.note}</text>`;
    }

    const ax1 = goRight ? x1 + 2 : x1 - 2;
    const ax2 = goRight ? x2 - 7 : x2 + 7;
    s += `<line x1="${ax1}" y1="${y}" x2="${ax2}" y2="${y}" style="stroke:${col}" stroke-width="1.2" ${dash} marker-end="url(#ah)"/>`;
    if (!goRight) {
      s += `<polygon points="${x2 + 1},${y - 4} ${x2 + 9},${y} ${x2 + 1},${y + 4}" style="fill:${col}"/>`;
    }

    // Clickable message label — label width based on text, clamped to SVG bounds
    const spec = MSGS[step.msg];
    const isAct = curMsg === step.msg;
    const lh = 18;
    // Natural width from text; font-size tiered by message length
    const fsize = step.msg.length > 50 ? 8.5 : step.msg.length > 38 ? 9.5 : 10.5;
    const charPx = fsize * 0.6; // approximate proportional char width
    const naturalW = Math.ceil(step.msg.length * charPx + 20);
    const lw = Math.min(naturalW, TOTAL_W - PAD * 2 - 4);
    const lx = Math.max(PAD + 2, Math.min(midX - lw / 2, TOTAL_W - PAD - lw - 2));
    const ly = y - lh / 2;
    const dataMsgAttr = spec ? ` data-msg="${step.msg.replace(/"/g, '&quot;')}"` : '';
    const glowAttr = isAct ? ' filter="url(#msg-glow)"' : '';
    s += `<g style="cursor:${spec ? 'pointer' : 'default'}"${dataMsgAttr}${glowAttr}>
      <rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="3" style="fill:${isAct ? 'var(--accent)' : 'var(--bg2)'};stroke:${isAct ? 'var(--accent2)' : spec ? 'var(--border2)' : 'var(--border)'}" stroke-width="${isAct ? 2 : 1}"/>
      <text x="${lx + lw / 2}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${fsize}" font-weight="${isAct ? '700' : '600'}" style="fill:${isAct ? '#fff' : step.raw ? 'var(--text3)' : spec ? 'var(--text)' : 'var(--text3)'}">${step.msg}</text>
    </g>`;
  });

  // Bottom participant boxes
  parts.forEach((p, i) => {
    const info = P[p];
    const x = cx(i) - BOX_W / 2;
    const lines = info.label.split('\n');
    s += `<rect x="${x}" y="${BOT_Y}" width="${BOX_W}" height="${BOX_H}" style="fill:var(--bg2);stroke:var(--border2)" stroke-width="1.5"/>`;
    lines.forEach((ln, li) => {
      s += `<text x="${cx(i)}" y="${BOT_Y + BOX_H / 2 + (li - (lines.length - 1) / 2) * 14}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" style="fill:var(--text)">${ln}</text>`;
    });
  });

  s += `</svg>`;

  const partChips = flow.participants.map(p => {
    const info = P[p];
    return info ? `<span class="part-chip">${info.label.replace('\n', ' ')}</span>` : '';
  }).join('');

  document.getElementById('seqc').innerHTML = `
    <div style="margin-bottom:16px">
      <div style="font-size:11px;color:var(--text2);margin-bottom:6px">${flow.desc}</div>
      <div class="part-chips">${partChips}</div>
    </div>
    <div style="overflow-x:auto">${s}</div>`;
  makeSeqKeyboard();
}

function renderExampleSection(m) {
  if (m.examplePayload !== undefined) {
    const keys = Object.keys(m.examplePayload);
    if (keys.length === 0) {
      return `<div class="sl">範例 Payload</div><div style="font-size:11px;color:var(--text3);padding:6px 0 10px">（此訊息無 Body 欄位）</div>`;
    }
    const json = JSON.stringify(m.examplePayload, null, 2);
    return `<div class="sl">範例 Payload</div><div class="cb-wrap"><div class="cb">${esc(json)}</div><button class="copy-btn">複製</button></div>`;
  }
  if (m.schema && m.schema.trim() && m.schema !== '{}') {
    return `<div class="sl">JSON Schema</div><div class="cb-wrap"><div class="cb">${esc(m.schema)}</div><button class="copy-btn">複製</button></div>`;
  }
  return '';
}

function selectMsg(msgName) {
  const m = MSGS[msgName];
  if (!m) return;
  if (curMsg === msgName) {
    curMsg = null;
    document.title = 'CFX 2.0 Message Reference';
    if (curMode === 'messages') {
      showMsgPlaceholder();
      renderMsgList(document.getElementById('search').value);
    } else {
      document.getElementById('detail-panel').classList.add('hidden');
      if (curFlow) {
        if (curView === 'diagram') renderSeq(curFlow);
        else renderListView(curFlow);
      }
    }
    updateHash();
    return;
  }
  curMsg = msgName;
  document.title = `${msgName} — CFX 2.0 Reference`;
  if (curMode === 'flows' && curFlow) {
    if (curView === 'diagram') renderSeq(curFlow);
    else renderListView(curFlow);
  }
  if (curMode === 'messages') renderMsgList(document.getElementById('search').value);

  const dc = m.dir === 'response' ? '#555e70' : m.dir === 'event' ? '#1a7a40' : '#1565c0';
  const dl = m.dir === 'response' ? 'RESPONSE' : m.dir === 'event' ? 'EVENT' : 'REQUEST';
  let fh = '';
  if (m.fields?.length) {
    fh = `<div class="sl">欄位規格</div><table class="ft"><thead><tr><th>欄位名稱</th><th>型別</th><th>必填</th><th>說明</th></tr></thead><tbody>`;
    m.fields.forEach(f => {
      fh += `<tr><td class="fn">${f.name}</td><td class="ftype">${f.type}</td><td><span class="rb ${f.req ? 'req' : 'opt'}">${f.req ? 'Required' : 'Optional'}</span></td><td style="color:var(--text2);font-size:11px">${f.desc}</td></tr>`;
    });
    fh += `</tbody></table>`;
  }
  document.getElementById('di').innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px">
      <div><div class="dt">${msgName}</div><div class="ds">${m.module}</div>
        <span class="badge" style="color:${dc};border-color:${dc}44;background:${dc}15">${dl}</span></div>
      <button class="xbtn" aria-label="關閉詳細面板">✕</button>
    </div>
    <div id="amqp-topic-row"></div>
    <p style="font-size:12px;color:var(--text2);line-height:1.75">${m.desc}</p>
    <div id="flow-backlinks-row"></div>
    ${renderExampleSection(m)}
    ${fh}
    ${m.notes ? `<div class="nb">⚠ ${m.notes}</div>` : ''}`;
  appendAmqpTopic(msgName, m);
  appendFlowBacklinks(msgName);
  document.getElementById('detail-panel').classList.remove('hidden');
  updateHash();
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ── Message detail enrichment ──────────────────────── */

function appendAmqpTopic(msgName, m) {
  const el = document.getElementById('amqp-topic-row');
  if (!el) return;
  const isReqRes = m.dir === 'request' || m.dir === 'response';
  if (isReqRes) {
    el.innerHTML = `<div class="amqp-topic-row"><span class="amqp-topic-label">Topic</span><span class="amqp-topic-note">此訊息使用 reply-to queue，不以 topic 路由</span></div>`;
  } else {
    const wildcardTopic = `CFX/*/${msgName}`;
    el.innerHTML = `<div class="amqp-topic-row">
      <span class="amqp-topic-label">Topic</span>
      <code class="amqp-topic-val">CFX/<em>{your-handle}</em>/${msgName}</code>
      <button class="amqp-copy-btn" title="複製 wildcard 訂閱 topic">複製</button>
    </div>`;
    el.querySelector('.amqp-copy-btn').addEventListener('click', e => {
      navigator.clipboard.writeText(wildcardTopic).then(() => {
        const btn = e.target;
        btn.textContent = '已複製！';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = '複製'; btn.classList.remove('copied'); }, 1500);
      }).catch(() => {});
    });
  }
}

function appendFlowBacklinks(msgName) {
  const el = document.getElementById('flow-backlinks-row');
  if (!el) return;
  const allFlows = FLOWS.flatMap(g => g.items);
  const matching = allFlows.filter(f => f.steps.some(s => s.msg === msgName));
  if (!matching.length) {
    el.innerHTML = `<div class="sl">出現在 Flows</div><p style="font-size:11px;color:var(--text3);font-style:italic;margin-bottom:4px">此訊息未出現在任何 Flow 中</p>`;
    return;
  }
  const chips = matching.map(f =>
    `<button class="flow-chip" data-fid="${f.id}" style="border-color:${f.badgeColor || 'var(--border)'};color:${f.badgeColor || 'var(--text2)'}">${f.label}</button>`
  ).join('');
  el.innerHTML = `<div class="sl">出現在 Flows</div><div class="flow-chips">${chips}</div>`;
  el.querySelectorAll('.flow-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const flow = allFlows.find(f => f.id === chip.dataset.fid);
      if (!flow) return;
      const btn = document.querySelector('.nav-item[data-mode="flows"]');
      setMode('flows', btn);
      selectFlow(flow);
    });
  });
}

/* ── Dev Guide ──────────────────────────────────────── */

const GUIDE_SECTIONS = [
  { id: 'arch',    icon: '📐', label: 'CFX 架構概覽' },
  { id: 'handle',  icon: '🔑', label: 'CFXHandle 格式' },
  { id: 'topic',   icon: '📡', label: 'AMQP Topic 路由' },
  { id: 'start',   icon: '🚀', label: 'Endpoint 開發入門' },
  { id: 'pattern', icon: '📋', label: '常見開發模式' },
];

function renderGuideSidebar() {
  const el = document.getElementById('flow-list');
  el.innerHTML = GUIDE_SECTIONS.map(s =>
    `<div class="guide-toc-item" data-sec="${s.id}">
       <span class="guide-toc-icon">${s.icon}</span>${s.label}
     </div>`
  ).join('');
  el.querySelectorAll('.guide-toc-item').forEach(item => {
    item.addEventListener('click', () => {
      const target = document.getElementById('guide-' + item.dataset.sec);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function renderGuide() {
  document.getElementById('seqc').innerHTML = `<div class="guide-content">${guideHTML()}</div>`;
}

function guideHTML() {
  return `
<!-- ① Architecture -->
<div class="guide-section" id="guide-arch">
  <h3>📐 CFX 架構概覽</h3>
  <p>CFX（Connected Factory Exchange，IPC-CFX-2591）是基於 <strong>AMQP 訊息協議</strong>的工廠設備通訊標準。它採用 <strong>Pub/Sub</strong> 模型，讓設備（Endpoint）與製造執行系統（MES）透過中間的 Broker 解耦通訊。</p>
  <div class="arch-diagram">
    <div class="arch-box highlight">
      <div class="arch-box-title">CFX Endpoint</div>
      <div class="arch-box-sub">設備側代理人<br>（SMT 機台、測試機…）</div>
    </div>
    <div class="arch-arrow">
      <div class="arch-arrow-line">⇄</div>
      <div class="arch-arrow-label">Event / Request<br>Response</div>
    </div>
    <div class="arch-box highlight">
      <div class="arch-box-title">AMQP Broker</div>
      <div class="arch-box-sub">訊息路由中心<br>（RabbitMQ、Azure…）</div>
    </div>
    <div class="arch-arrow">
      <div class="arch-arrow-line">⇄</div>
      <div class="arch-arrow-label">訂閱 / 發布<br>Request / Response</div>
    </div>
    <div class="arch-box">
      <div class="arch-box-title">MES / ERP</div>
      <div class="arch-box-sub">製造執行系統<br>（訂閱事件、下發指令）</div>
    </div>
  </div>
  <h4>三種角色說明</h4>
  <ul>
    <li><strong>CFX Endpoint</strong>：設備側的軟體代理人，負責發布狀態事件（Event）並回應 MES 的查詢（Request/Response）</li>
    <li><strong>AMQP Broker</strong>：訊息路由中心，所有訊息都經過它傳遞；Endpoint 與 MES 不直連</li>
    <li><strong>MES / ERP</strong>：訂閱設備事件，並對設備發送 Request（如下發配方、查詢狀態）</li>
  </ul>
  <h4>重要觀念</h4>
  <ul>
    <li>CFX <strong>不是 REST API</strong>，不是 HTTP 直連，而是非同步 Pub/Sub</li>
    <li>每個訊息都有明確的 <strong>方向</strong>（Event / Request / Response），詳見訊息瀏覽器</li>
    <li>Endpoint 上線後必須先發布 <code>CFX.EndpointConnected</code>，MES 才能感知它的存在</li>
  </ul>
</div>
<hr class="guide-divider">

<!-- ② CFXHandle -->
<div class="guide-section" id="guide-handle">
  <h3>🔑 CFXHandle 格式</h3>
  <p>CFXHandle 是每個 Endpoint 在 CFX 網路中的唯一識別字串，格式如下：</p>
  <div class="handle-breakdown">
    <div class="handle-part">
      <div class="handle-part-val">SMTPlus</div>
      <div class="handle-part-label">Vendor（廠牌）</div>
    </div>
    <div class="handle-part">
      <div class="handle-part-val">Model_21232</div>
      <div class="handle-part-label">Model（機型）</div>
    </div>
    <div class="handle-part">
      <div class="handle-part-val">SN23123</div>
      <div class="handle-part-label">SerialNumber（序號）</div>
    </div>
  </div>
  <pre class="guide-code">CFXHandle = "{Vendor}.{Model}.{SerialNumber}"
// 範例：
CFXHandle = "SMTPlus.Model_21232.SN23123"</pre>
  <h4>使用場景</h4>
  <ul>
    <li><strong>AMQP Topic 前綴</strong>：每台設備有自己的 topic 命名空間（見下一節）</li>
    <li><strong>訊息欄位</strong>：所有 CFX 訊息的 <code>CFXHandle</code> 欄位填入此值</li>
    <li><strong>AreYouThereRequest</strong>：MES 用 CFXHandle 查詢特定設備是否在線</li>
  </ul>
  <h4>命名規則</h4>
  <ul>
    <li>各段以 <strong>點（.）</strong>分隔，段內不能有點</li>
    <li>同一 AMQP 網路中必須<strong>唯一</strong>（通常用序號保證）</li>
    <li>字串不能包含 <code>/</code>（會與 AMQP topic 路由衝突）</li>
  </ul>
</div>
<hr class="guide-divider">

<!-- ③ AMQP Topic -->
<div class="guide-section" id="guide-topic">
  <h3>📡 AMQP Topic 路由</h3>
  <p>CFX 訊息在 AMQP 中以 topic 路由。每個 Event 的 topic 格式為：</p>
  <pre class="guide-code">CFX/{senderCFXHandle}/{MessageType}

// 具體範例（設備發布事件）：
CFX/SMTPlus.Model_21232.SN23123/CFX.Production.WorkCompleted</pre>
  <h4>訂閱模式</h4>
  <pre class="guide-code"># 訂閱單台設備的特定訊息：
CFX/SMTPlus.Model_21232.SN23123/CFX.Production.WorkCompleted

# 訂閱所有設備的特定訊息（最常用）：
CFX/*/CFX.Production.WorkCompleted

# 訂閱單台設備的所有訊息：
CFX/SMTPlus.Model_21232.SN23123/#

# 訂閱所有設備的所有訊息：
CFX/#</pre>
  <p class="guide-code-note">⚠ 不同 AMQP 實作的 wildcard 字元可能不同（RabbitMQ 用 <code>*</code> 和 <code>#</code>，Azure Service Bus 用 SQL filter）。請依使用的 Broker 確認。</p>
  <h4>Request / Response 的特殊路由</h4>
  <ul>
    <li>Request 訊息（如 <code>CFX.AreYouThereRequest</code>）<strong>不走 topic 路由</strong></li>
    <li>MES 發送 Request 時，在訊息中帶上 <code>reply-to</code>（回覆佇列）與 <code>CorrelationId</code></li>
    <li>Endpoint 收到 Request 後，將 Response 發布到 <code>reply-to</code> 指定的佇列，並附上相同的 <code>CorrelationId</code></li>
  </ul>
  <p>在訊息面板中查看任何訊息時，都可以直接看到它的 AMQP topic 字串（Event 類型才有）。</p>
</div>
<hr class="guide-divider">

<!-- ④ Getting Started -->
<div class="guide-section" id="guide-start">
  <h3>🚀 Endpoint 開發入門</h3>
  <p>以下是從零建立一個最小可運作 CFX Endpoint 的 5 個步驟：</p>
  <div class="guide-steps">
    <div class="guide-step">
      <div class="guide-step-num">1</div>
      <div class="guide-step-body">
        <div class="guide-step-title">選擇 AMQP 函式庫</div>
        <div class="guide-step-desc">
          CFX 官方 SDK 是 .NET（C#）。其他語言可使用：<br>
          Node.js → <code>amqplib</code>、Python → <code>pika</code>、Java → <code>RabbitMQ Java Client</code>
        </div>
      </div>
    </div>
    <div class="guide-step">
      <div class="guide-step-num">2</div>
      <div class="guide-step-body">
        <div class="guide-step-title">建立 AMQP 連線與 Channel</div>
        <pre class="guide-code">connection = amqp.connect("amqp://broker-host:5672/")
channel = connection.createChannel()</pre>
      </div>
    </div>
    <div class="guide-step">
      <div class="guide-step-num">3</div>
      <div class="guide-step-body">
        <div class="guide-step-title">上線後立即發布 EndpointConnected</div>
        <pre class="guide-code">topic = "CFX/" + myHandle + "/CFX.EndpointConnected"
payload = {
  "CFXHandle": myHandle,
  "RequestNetworkUri": "amqp://broker-host/",
  "RequestTargetAddress": "/queue/" + myHandle
}
channel.publish(topic, json(payload))</pre>
      </div>
    </div>
    <div class="guide-step">
      <div class="guide-step-num">4</div>
      <div class="guide-step-body">
        <div class="guide-step-title">訂閱需要的訊息（依機台類型）</div>
        <div class="guide-step-desc">參考「機台視角」找出你的設備需要哪些 Flow，再訂閱對應訊息的 topic。</div>
        <pre class="guide-code">channel.subscribe("CFX/" + myHandle + "/CFX.Production.GetScheduledWorkOrdersRequest")
// → 收到後處理並回應 Response</pre>
      </div>
    </div>
    <div class="guide-step">
      <div class="guide-step-num">5</div>
      <div class="guide-step-body">
        <div class="guide-step-title">實作 AreYouThereRequest（必要）</div>
        <div class="guide-step-desc">MES 會定期傳送心跳查詢。若未回應，MES 可能將設備標記為離線。</div>
        <pre class="guide-code">on_request("CFX.AreYouThereRequest"):
  respond({
    "Result": { "Result": "Success", "ResultCode": 0 },
    "CFXHandle": myHandle,
    "RequestNetworkUri": "amqp://broker-host/",
    "RequestTargetAddress": "/queue/" + myHandle
  })</pre>
      </div>
    </div>
  </div>
</div>
<hr class="guide-divider">

<!-- ⑤ Patterns -->
<div class="guide-section" id="guide-pattern">
  <h3>📋 常見開發模式</h3>

  <div class="guide-pattern">
    <div class="guide-pattern-title">模式 1：發布 Event</div>
    <pre class="guide-code">// 任何狀態改變都應以 Event 通知 MES
topic = "CFX/" + myHandle + "/" + messageType
payload = {
  "TransactionId": uuid(),      // 每次發布產生新的 UUID
  "Timestamp":     isoNow(),    // ISO 8601 時間戳
  // ... 訊息特有欄位
}
channel.publish(topic, json(payload))</pre>
    <p class="guide-code-note">TransactionId 讓 MES 可以追蹤每一筆交易，建議每次發布都產生新值。</p>
  </div>

  <div class="guide-pattern">
    <div class="guide-pattern-title">模式 2：處理 Request / 回應 Response</div>
    <pre class="guide-code">// 收到 Request
on_message(request):
  correlationId = request.headers.correlationId
  replyTo       = request.headers.replyTo

  // 處理業務邏輯...
  result = doWork(request.body)

  // 回應到 reply-to queue，帶相同 correlationId
  response = {
    "Result": { "Result": "Success", "ResultCode": 0, "Message": null },
    // ... Response 特有欄位
  }
  channel.publishTo(replyTo, json(response), correlationId)</pre>
  </div>

  <div class="guide-pattern">
    <div class="guide-pattern-title">模式 3：Result 物件與錯誤處理</div>
    <pre class="guide-code">// CFX 標準 Result 結構（所有 Response 都包含）
{
  "Result": {
    "Result":     "Success" | "Failed" | "Blocked",
    "ResultCode": 0,           // 0 = 成功；非 0 = 廠商定義的錯誤碼
    "Message":    null         // 錯誤時填寫說明文字
  }
}

// 接收端處理建議：
if response.Result.Result != "Success":
  log.error("CFX Error: " + response.Result.Message)
  // 不要假設成功；永遠先檢查 Result</pre>
    <p class="guide-code-note">Result.Result 是字串，不是布林值。三種值：Success / Failed / Blocked（設備忙碌）。</p>
  </div>
</div>`;
}

function setFilter(type, btn) {
  msgFilter = type;
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (curFlow && curView === 'list') renderListView(curFlow);
}

document.addEventListener('DOMContentLoaded', init);
