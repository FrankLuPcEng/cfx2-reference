import { state } from './state.js';
import { esc } from './utils.js';

const PHASE_LABELS = {
  1: 'Phase 1 — 基本 WIP 追蹤',
  2: 'Phase 2 — 物料追溯',
  3: 'Phase 3 — OEE 計算',
  4: 'Phase 4 — 配方管理',
};

export function renderDomainList() {
  const el = document.getElementById('flow-list');
  el.innerHTML = '';
  if (!state.DOMAIN?.entities?.length) {
    el.innerHTML = '<div class="empty-msg">資料模型尚未載入</div>';
    return;
  }
  const byPhase = {};
  state.DOMAIN.entities.forEach(e => {
    const p = e.mvpPhase || 1;
    if (!byPhase[p]) byPhase[p] = [];
    byPhase[p].push(e);
  });
  [1, 2, 3, 4].forEach(p => {
    if (!byPhase[p]) return;
    const hdr = document.createElement('div');
    hdr.className = 'domain-phase-hdr';
    hdr.textContent = PHASE_LABELS[p] || `Phase ${p}`;
    el.appendChild(hdr);
    byPhase[p].forEach(entity => {
      const d = document.createElement('div');
      d.className = 'entity-item' + (state.curEntity === entity.id ? ' active' : '');
      d.innerHTML = `
        <span class="entity-phase">P${p}</span>
        <span class="entity-item-label">${entity.id}</span>
        <span class="entity-item-zh">${entity.labelZh}</span>`;
      d.tabIndex = 0;
      d.setAttribute('role', 'button');
      d.addEventListener('click', () => selectEntity(entity.id));
      d.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectEntity(entity.id); } });
      el.appendChild(d);
    });
  });
}

export function selectEntity(entityId) {
  state.curEntity = entityId;
  document.querySelectorAll('.entity-item').forEach(el => {
    const label = el.querySelector('.entity-item-label')?.textContent;
    el.classList.toggle('active', label === entityId);
  });
  const entity = state.DOMAIN.entities.find(e => e.id === entityId);
  if (!entity) return;
  document.getElementById('ftitle').textContent = entity.id;
  document.getElementById('fdesc').textContent = entity.labelZh;
  const b = document.getElementById('fbadge');
  b.textContent = `Phase ${entity.mvpPhase}`;
  b.style.display = 'inline';
  b.style.color = phaseColor(entity.mvpPhase);
  b.style.borderColor = phaseColor(entity.mvpPhase) + '55';
  b.style.background = phaseColor(entity.mvpPhase) + '18';
  document.getElementById('empty-state').style.display = 'none';
  renderDomainDetail(entityId);
}

function phaseColor(p) {
  return ['', '#1565c0', '#2e7d32', '#e65100', '#6a1b9a'][p] || '#555e70';
}

function renderDomainDetail(entityId) {
  const entity = state.DOMAIN.entities.find(e => e.id === entityId);
  if (!entity) return;

  // Attributes table
  const pkSet = new Set(entity.pk || []);
  const fkSet = new Set((entity.fk || []).map(f => f.field));
  let attrRows = '';
  (entity.attributes || []).forEach(attr => {
    const pkBadge = pkSet.has(attr.name) ? '<span class="entity-attr-pk">PK</span>' : '';
    const fkBadge = fkSet.has(attr.name) ? '<span class="entity-attr-fk">FK</span>' : '';
    const reqText = attr.required ? '<span class="entity-attr-req">必填</span>' : '';
    const typeText = attr.values
      ? `<span class="entity-attr-type">${attr.type}</span> <span style="font-size:9px;color:var(--text3)">(${attr.values.join(' | ')})</span>`
      : `<span class="entity-attr-type">${attr.type}</span>`;
    attrRows += `<tr>
      <td>${esc(attr.name)}${pkBadge}${fkBadge}</td>
      <td>${typeText}</td>
      <td>${reqText}</td>
      <td>${esc(attr.desc || '')}</td>
    </tr>`;
  });

  // FK references
  let fkRows = '';
  (entity.fk || []).forEach(fk => {
    fkRows += `<span class="entity-rel-chip"><em>${esc(fk.field)}</em> → ${esc(fk.ref)}</span>`;
  });

  // Relationships
  const rels = (state.DOMAIN.relationships || []).filter(r => r.from === entityId || r.to === entityId);
  let relChips = '';
  rels.forEach(r => {
    const isFrom = r.from === entityId;
    const other = isFrom ? r.to : r.from;
    const card = isFrom ? r.cardinality : r.cardinality.split(':').reverse().join(':');
    relChips += `<span class="entity-rel-chip entity-rel-nav" data-entity="${esc(other)}" title="${esc(r.desc)}">${isFrom ? '' : '← '}<em>${esc(other)}</em> ${card}${isFrom ? ' →' : ''}</span>`;
  });

  // CFX message chips
  const makeChips = (msgs, cls) =>
    (msgs || []).map(m => {
      const short = m.split('.').slice(-2).join('.');
      return `<button class="entity-msg-chip ${cls}" data-msg="${esc(m)}" title="${esc(m)}">${esc(short)}</button>`;
    }).join('');

  const createdChips = makeChips(entity.createdBy, 'create');
  const updatedChips = makeChips(entity.updatedBy, 'update');
  const deletedChips = makeChips(entity.deletedBy, 'delete');
  const noMsgNote = (!entity.createdBy?.length && !entity.updatedBy?.length && !entity.deletedBy?.length)
    ? '<span style="font-size:11px;color:var(--text3);font-style:italic">無直接對應的 CFX 訊息（由其他 Entity 隱含建立）</span>'
    : '';

  document.getElementById('seqc').innerHTML = `
    <div class="entity-detail">
      <div class="entity-detail-hdr">
        <div>
          <div class="entity-title">${esc(entity.id)}</div>
          <div class="entity-zh">${esc(entity.labelZh)}</div>
        </div>
        <span class="entity-phase" style="font-size:11px;padding:3px 8px">Phase ${entity.mvpPhase} — ${esc(state.DOMAIN.mvpPhases?.[entity.mvpPhase] || '')}</span>
      </div>
      ${entity.notes ? `<div class="entity-notes">${esc(entity.notes)}</div>` : ''}
      ${(entity.fk?.length) ? `<div class="sl">外鍵關聯</div><div class="entity-rels-row">${fkRows}</div>` : ''}
      <div class="sl">屬性定義</div>
      <table class="entity-attr-table">
        <thead><tr><th>欄位名稱</th><th>型別</th><th>必填</th><th>說明</th></tr></thead>
        <tbody>${attrRows}</tbody>
      </table>
      ${rels.length ? `<div class="sl">資料關係</div><div class="entity-rels-row">${relChips}</div>` : ''}
      <div class="sl">CFX 訊息對應</div>
      ${noMsgNote}
      ${createdChips ? `<div style="margin-bottom:4px"><span style="font-size:10px;color:var(--text3);margin-right:6px">建立</span>${createdChips}</div>` : ''}
      ${updatedChips ? `<div style="margin-bottom:4px"><span style="font-size:10px;color:var(--text3);margin-right:6px">更新</span>${updatedChips}</div>` : ''}
      ${deletedChips ? `<div style="margin-bottom:4px"><span style="font-size:10px;color:var(--text3);margin-right:6px">刪除</span>${deletedChips}</div>` : ''}
    </div>`;

  // Click: navigate to message in messages mode
  document.getElementById('seqc').querySelectorAll('.entity-msg-chip[data-msg]').forEach(chip => {
    chip.addEventListener('click', async () => {
      const { setMode }  = await import('./router.js');
      const { selectMsg } = await import('./messages.js');
      const btn = document.querySelector('.nav-item[data-mode="messages"]');
      if (btn) {
        setMode('messages', btn);
        selectMsg(chip.dataset.msg);
      }
    });
  });

  // Click: navigate to related entity
  document.getElementById('seqc').querySelectorAll('.entity-rel-nav[data-entity]').forEach(chip => {
    chip.addEventListener('click', () => selectEntity(chip.dataset.entity));
  });
}
