let P = {}, MSGS = {}, FLOWS = [];
let curFlow = null, curMsg = null, msgFilter = 'all', curMode = 'flows';

async function init() {
  try {
    const [pRes, mRes, fRes] = await Promise.all([
      fetch('data/participants.json'),
      fetch('data/messages.json'),
      fetch('data/flows.json'),
    ]);
    if (!pRes.ok || !mRes.ok || !fRes.ok) {
      throw new Error(`HTTP error — participants:${pRes.status} messages:${mRes.status} flows:${fRes.status}`);
    }
    [P, MSGS, FLOWS] = await Promise.all([pRes.json(), mRes.json(), fRes.json()]);
  } catch (err) {
    showError(err.message);
    return;
  }
  setupListeners();
  renderSidebar();
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

  document.querySelectorAll('#mode-toggle .mtbtn').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode, btn));
  });

  document.querySelectorAll('#fbar .fbtn').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter, btn));
  });

  // Event delegation for SVG message label clicks
  document.getElementById('seqc').addEventListener('click', e => {
    const g = e.target.closest('[data-msg]');
    if (g) selectMsg(g.dataset.msg);
  });

  // Event delegation for detail panel close button
  document.getElementById('detail-panel').addEventListener('click', e => {
    if (e.target.closest('.xbtn')) {
      if (curMsg) selectMsg(curMsg);
    }
  });
}

function setMode(mode, btn) {
  curMode = mode;
  document.querySelectorAll('.mtbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const search = document.getElementById('search');
  search.value = '';
  search.placeholder = mode === 'flows' ? '搜尋流程…' : '搜尋訊息…';
  const main = document.getElementById('main');
  const dp   = document.getElementById('detail-panel');
  const fbar = document.getElementById('fbar');
  if (mode === 'messages') {
    curMsg = null;
    main.classList.add('msg-mode');
    dp.classList.remove('hidden');
    document.getElementById('ftitle').textContent = '訊息瀏覽器';
    document.getElementById('fdesc').textContent  = '← 從左側選擇 CFX 訊息查看規格與 JSON 範例';
    document.getElementById('fbadge').style.display = 'none';
    fbar.style.display = 'none';
    showMsgPlaceholder();
    renderMsgList();
  } else {
    curMsg = null;
    main.classList.remove('msg-mode');
    dp.classList.add('hidden');
    if (curFlow) {
      document.getElementById('ftitle').textContent = curFlow.label;
      document.getElementById('fdesc').textContent  = curFlow.desc;
      const b = document.getElementById('fbadge');
      b.textContent = curFlow.badgeText;
      b.style.display = 'inline';
      b.style.color = curFlow.badgeColor;
      b.style.borderColor = curFlow.badgeColor + '55';
      b.style.background  = curFlow.badgeColor + '18';
      fbar.style.display = 'flex';
      renderSeq(curFlow);
    } else {
      document.getElementById('ftitle').textContent = '選擇左側流程';
      document.getElementById('fdesc').textContent  = '← 選擇 SMT 流程以查看 CFX 2.0 訊息循序圖';
      fbar.style.display = 'none';
    }
    renderSidebar();
  }
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

function showMsgPlaceholder() {
  document.getElementById('di').innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;color:var(--text3);text-align:center"><div style="font-size:36px;margin-bottom:12px;opacity:0.3">✉</div><p style="font-size:13px;line-height:1.9">從左側選擇 CFX 訊息<br>查看規格與 JSON 範例</p></div>';
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
    grp.innerHTML = `<div class="grp-hdr">${MOD_LABELS[mod] || mod}</div>`;
    groups[mod].forEach(msg => {
      const shortName = msg.key.split('.').pop();
      const dc = msg.dir === 'response' ? '#555e70' : msg.dir === 'event' ? '#1a7a40' : '#1565c0';
      const dl = msg.dir === 'response' ? 'RES' : msg.dir === 'event' ? 'EVT' : 'REQ';
      const d = document.createElement('div');
      d.className = 'msg-item' + (curMsg === msg.key ? ' active' : '');
      d.innerHTML = `<span class="msg-dir" style="color:${dc};border-color:${dc}44;background:${dc}15">${dl}</span><span class="msg-name" title="${msg.key}">${shortName}</span>`;
      d.addEventListener('click', () => selectMsg(msg.key));
      grp.appendChild(d);
    });
    el.appendChild(grp);
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
    grp.innerHTML = `<div class="grp-hdr">${g.group}</div>`;
    items.forEach(flow => {
      const d = document.createElement('div');
      d.className = 'flow-item' + (curFlow?.id === flow.id ? ' active' : '');
      d.innerHTML = `<span class="dot" style="background:${g.color}"></span>${flow.label}`;
      d.onclick = () => selectFlow(flow);
      grp.appendChild(d);
    });
    el.appendChild(grp);
  });
}

function selectFlow(flow) {
  curFlow = flow;
  curMsg = null;
  document.getElementById('detail-panel').classList.add('hidden');
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
  document.getElementById('fbar').style.display = 'flex';
  document.getElementById('empty-state').style.display = 'none';
  renderSeq(flow);
}

function renderSeq(flow) {
  const parts = flow.participants;
  const nP = parts.length;
  const steps = flow.steps.filter(s => msgFilter === 'all' || s.type === msgFilter);

  const BOX_W = 120, BOX_H = 44, PAD = 10;
  const COL_W = Math.max(BOX_W + 30, Math.floor((Math.min(nP * 160, 900)) / nP));
  const TOTAL_W = COL_W * nP + PAD * 2;
  const ROW_H = 50;
  const TOP_PAD = 10;
  const FIRST_Y = BOX_H + TOP_PAD + 24;
  const CANVAS_H = steps.length * ROW_H + 40;
  const BOT_Y = FIRST_Y + CANVAS_H;
  const SVG_H = BOT_Y + BOX_H + 20;

  const cx = i => PAD + i * COL_W + COL_W / 2;

  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${TOTAL_W}" height="${SVG_H}" style="font-family:system-ui,-apple-system,sans-serif">
  <defs>
    <marker id="ah" viewBox="0 0 10 7" refX="9" refY="3.5" markerWidth="8" markerHeight="8" orient="auto">
      <polygon points="0,0 10,3.5 0,7" fill="#454f6b"/>
    </marker>
  </defs>`;

  // Top participant boxes
  parts.forEach((p, i) => {
    const info = P[p];
    const x = cx(i) - BOX_W / 2;
    const lines = info.label.split('\n');
    s += `<rect x="${x}" y="${TOP_PAD}" width="${BOX_W}" height="${BOX_H}" fill="white" stroke="#a0aabe" stroke-width="1.5"/>`;
    lines.forEach((ln, li) => {
      s += `<text x="${cx(i)}" y="${TOP_PAD + BOX_H / 2 + (li - (lines.length - 1) / 2) * 14}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="#1a2035">${ln}</text>`;
    });
  });

  // Lifelines
  parts.forEach((p, i) => {
    s += `<line x1="${cx(i)}" y1="${TOP_PAD + BOX_H}" x2="${cx(i)}" y2="${BOT_Y}" stroke="#4f6db8" stroke-width="1" opacity="0.3"/>`;
  });

  // Frames (opt/alt)
  if (flow.frames) {
    flow.frames.forEach(fr => {
      const sy = FIRST_Y + fr.startStep * ROW_H - ROW_H / 2 - 6;
      const ey = FIRST_Y + fr.endStep * ROW_H + ROW_H / 2 + 6;
      const fh = ey - sy;
      s += `<rect x="${PAD}" y="${sy}" width="${TOTAL_W - PAD * 2}" height="${fh}" fill="none" stroke="#a0aabe" stroke-width="1.5" stroke-dasharray="6,3"/>`;
      s += `<rect x="${PAD}" y="${sy}" width="28" height="14" fill="#2d4f9e"/>`;
      s += `<text x="${PAD + 14}" y="${sy + 7}" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="700" fill="white">${fr.label}</text>`;
      s += `<text x="${PAD + 36}" y="${sy + 7}" dominant-baseline="central" font-size="9" fill="#454f6b" font-style="italic">[${fr.cond}]</text>`;
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
    const col = step.raw ? '#a0aabe' : '#454f6b';
    const midX = (x1 + x2) / 2;
    const hasNote = !!step.note;

    if (hasNote) {
      s += `<text x="${midX}" y="${y - 20}" text-anchor="middle" font-size="9" fill="#8898b0" font-style="italic">${step.note}</text>`;
    }

    const ax1 = goRight ? x1 + 2 : x1 - 2;
    const ax2 = goRight ? x2 - 7 : x2 + 7;
    s += `<line x1="${ax1}" y1="${y}" x2="${ax2}" y2="${y}" stroke="${col}" stroke-width="1.2" ${dash} marker-end="url(#ah)"/>`;
    if (!goRight) {
      s += `<polygon points="${x2 + 1},${y - 4} ${x2 + 9},${y} ${x2 + 1},${y + 4}" fill="${col}"/>`;
    }

    // Clickable message label — use data-msg for event delegation
    const spec = MSGS[step.msg];
    const isAct = curMsg === step.msg;
    const maxLW = Math.min(Math.abs(x2 - x1) - 6, 300);
    const lh = 16;
    const lw = Math.min(step.msg.length * 6.5 + 16, maxLW);
    const lx = midX - lw / 2;
    const ly = y - lh / 2;
    const fsize = step.msg.length > 50 ? 8.5 : step.msg.length > 38 ? 9.5 : 10.5;
    const dataMsgAttr = spec ? ` data-msg="${step.msg.replace(/"/g, '&quot;')}"` : '';
    s += `<g style="cursor:${spec ? 'pointer' : 'default'}"${dataMsgAttr}>
      <rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="2" fill="${isAct ? '#dce6fa' : 'white'}" stroke="${isAct ? '#2d4f9e' : spec ? '#b0b8cc' : '#c8cedc'}" stroke-width="${isAct ? 1.5 : 1}"/>
      <text x="${midX}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${fsize}" font-weight="${isAct ? '700' : '600'}" fill="${isAct ? '#2d4f9e' : step.raw ? '#8898b0' : spec ? '#1a2035' : '#8898b0'}">${step.msg}</text>
    </g>`;
  });

  // Bottom participant boxes
  parts.forEach((p, i) => {
    const info = P[p];
    const x = cx(i) - BOX_W / 2;
    const lines = info.label.split('\n');
    s += `<rect x="${x}" y="${BOT_Y}" width="${BOX_W}" height="${BOX_H}" fill="white" stroke="#a0aabe" stroke-width="1.5"/>`;
    lines.forEach((ln, li) => {
      s += `<text x="${cx(i)}" y="${BOT_Y + BOX_H / 2 + (li - (lines.length - 1) / 2) * 14}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="#1a2035">${ln}</text>`;
    });
  });

  s += `</svg>`;

  document.getElementById('seqc').innerHTML = `
    <div style="margin-bottom:16px">
      <div style="font-size:15px;font-weight:700;color:#1a2035;margin-bottom:3px">${flow.label}</div>
      <div style="font-size:11px;color:#8898b0">${flow.desc}</div>
    </div>
    <div style="overflow-x:auto">${s}</div>`;
}

function selectMsg(msgName) {
  const m = MSGS[msgName];
  if (!m) return;
  if (curMsg === msgName) {
    curMsg = null;
    if (curMode === 'messages') {
      showMsgPlaceholder();
      renderMsgList(document.getElementById('search').value);
    } else {
      document.getElementById('detail-panel').classList.add('hidden');
      if (curFlow) renderSeq(curFlow);
    }
    return;
  }
  curMsg = msgName;
  if (curMode === 'flows' && curFlow) renderSeq(curFlow);
  if (curMode === 'messages') renderMsgList(document.getElementById('search').value);

  const dc = m.dir === 'response' ? '#555e70' : m.dir === 'event' ? '#1a7a40' : '#1565c0';
  const dl = m.dir === 'response' ? 'RESPONSE' : m.dir === 'event' ? 'EVENT' : 'REQUEST';
  let fh = '';
  if (m.fields?.length) {
    fh = `<div class="sl">欄位規格</div><table class="ft"><thead><tr><th>欄位名稱</th><th>型別</th><th>必填</th><th>說明</th></tr></thead><tbody>`;
    m.fields.forEach(f => {
      fh += `<tr><td class="fn">${f.name}</td><td class="ftype">${f.type}</td><td><span class="rb ${f.req ? 'req' : 'opt'}">${f.req ? 'Required' : 'Optional'}</span></td><td style="color:#454f6b;font-size:11px">${f.desc}</td></tr>`;
    });
    fh += `</tbody></table>`;
  }
  document.getElementById('di').innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px">
      <div><div class="dt">${msgName}</div><div class="ds">${m.module}</div>
        <span class="badge" style="color:${dc};border-color:${dc}44;background:${dc}15">${dl}</span></div>
      <button class="xbtn">✕</button>
    </div>
    <p style="font-size:12px;color:#454f6b;line-height:1.75">${m.desc}</p>
    <div class="sl">JSON 範例</div>
    <div class="cb">${esc(m.schema)}</div>
    ${fh}
    ${m.notes ? `<div class="nb">⚠ ${m.notes}</div>` : ''}`;
  document.getElementById('detail-panel').classList.remove('hidden');
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function setFilter(type, btn) {
  msgFilter = type;
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (curFlow) renderSeq(curFlow);
}

document.addEventListener('DOMContentLoaded', init);
