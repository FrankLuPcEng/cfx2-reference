import { state } from './state.js';
import { goToFlow, MOD_LABELS, COMMON_FLOW_IDS } from './utils.js';

export const MACHINE_DEFS = [
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

export function getMachineFlows(machineId) {
  const allFlows = state.FLOWS.flatMap(g =>
    g.items.map(f => ({ ...f, groupColor: g.color, groupLabel: g.group }))
  );
  const common   = COMMON_FLOW_IDS.map(id => allFlows.find(f => f.id === id)).filter(Boolean);
  const specific = machineId === 'ENDPOINT'
    ? []
    : allFlows.filter(f => f.participants.includes(machineId) && !COMMON_FLOW_IDS.includes(f.id));
  return { common, specific };
}

export function countMachineMessages(flows) {
  const seen = new Set();
  flows.forEach(f => f.steps.forEach(s => { if (s.msg && !s.raw) seen.add(s.msg); }));
  return seen.size;
}

export function renderMachineList() {
  const el = document.getElementById('flow-list');
  el.innerHTML = '';
  MACHINE_DEFS.forEach(m => {
    const d = document.createElement('div');
    d.className = 'machine-item' + (state.curMachine === m.id ? ' active' : '');
    d.innerHTML = `<span class="dot" style="background:${m.color}"></span>${m.label}`;
    d.tabIndex = 0;
    d.setAttribute('role', 'button');
    d.addEventListener('click', () => selectMachine(m.id));
    d.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectMachine(m.id); } });
    el.appendChild(d);
  });
}

export function renderMachineDetail(machineId) {
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
    const handler = () => {
      const flow = state.FLOWS.flatMap(g => g.items).find(f => f.id === card.dataset.flowId);
      if (flow) goToFlow(flow);
    };
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.addEventListener('click', handler);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } });
  });
}

export function selectMachine(machineId) {
  state.curMachine = machineId;
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
