import { state } from './state.js';
import { goToFlow } from './utils.js';
import { MACHINE_DEFS } from './machines.js';

export function renderScenarioList() {
  const el = document.getElementById('flow-list');
  el.innerHTML = '';
  state.SCENARIOS.forEach(sc => {
    const d = document.createElement('div');
    d.className = 'scenario-item' + (state.curScenario === sc.id ? ' active' : '');
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

export function renderScenarioDetail(scenarioId) {
  const sc = state.SCENARIOS.find(s => s.id === scenarioId);
  if (!sc) return;
  const allFlows = state.FLOWS.flatMap(g =>
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

export function selectScenario(scenarioId) {
  state.curScenario = scenarioId;
  const sc = state.SCENARIOS.find(s => s.id === scenarioId);
  document.querySelectorAll('.scenario-item').forEach((el, idx) => {
    el.classList.toggle('active', state.SCENARIOS[idx]?.id === scenarioId);
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
