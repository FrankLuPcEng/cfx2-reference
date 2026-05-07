import { state } from './state.js';
import { announce, esc, updateBreadcrumb, showViewBar, findFlowGroup, initAccordion } from './utils.js';
import { updateHash } from './router.js';
import { selectMsg } from './messages.js';

export function setFilter(type, btn) {
  state.msgFilter = type;
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (state.curFlow && state.curView === 'list') renderListView(state.curFlow);
}

export function renderSidebar(term = '') {
  const el = document.getElementById('flow-list');
  el.innerHTML = '';
  const t = term.toLowerCase();
  state.FLOWS.forEach(g => {
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
      d.className = 'flow-item' + (state.curFlow?.id === flow.id ? ' active' : '');
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

export function selectFlow(flow) {
  state.curFlow = flow;
  state.curMsg = null;
  state.curView = 'diagram';
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
  document.getElementById('fbar').style.display = 'none';
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

export function renderListView(flow) {
  const el = document.getElementById('listc');
  let html = '';
  let idx = 0;
  flow.steps.forEach(step => {
    if (state.msgFilter !== 'all' && step.type !== state.msgFilter) return;
    idx++;
    const spec  = state.MSGS[step.msg];
    const isAct = state.curMsg === step.msg;
    const from  = (state.P[step.from]?.label || step.from).replace('\n', ' ');
    const to    = (state.P[step.to]?.label || step.to).replace('\n', ' ');
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
  el.innerHTML = html || `<p class="empty-msg">沒有符合篩選條件的訊息</p>`;
}

export function makeSeqKeyboard() {
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

export function renderSeq(flow) {
  const parts = flow.participants;
  const nP = parts.length;
  const steps = flow.steps;

  const BOX_W = 140, BOX_H = 44, PAD = 20;

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
  const COL_W = Math.min(minColW, 300);
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

  parts.forEach((p, i) => {
    const info = state.P[p];
    const x = cx(i) - BOX_W / 2;
    const lines = info.label.split('\n');
    s += `<rect x="${x}" y="${TOP_PAD}" width="${BOX_W}" height="${BOX_H}" style="fill:var(--bg2);stroke:var(--border2)" stroke-width="1.5"/>`;
    lines.forEach((ln, li) => {
      s += `<text x="${cx(i)}" y="${TOP_PAD + BOX_H / 2 + (li - (lines.length - 1) / 2) * 14}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" style="fill:var(--text)">${ln}</text>`;
    });
  });

  parts.forEach((p, i) => {
    s += `<line x1="${cx(i)}" y1="${TOP_PAD + BOX_H}" x2="${cx(i)}" y2="${BOT_Y}" style="stroke:var(--accent)" stroke-width="1" opacity="0.3"/>`;
  });

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

    const spec = state.MSGS[step.msg];
    const isAct = state.curMsg === step.msg;
    const lh = 18;
    const fsize = step.msg.length > 50 ? 8.5 : step.msg.length > 38 ? 9.5 : 10.5;
    const charPx = fsize * 0.6;
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

  parts.forEach((p, i) => {
    const info = state.P[p];
    const x = cx(i) - BOX_W / 2;
    const lines = info.label.split('\n');
    s += `<rect x="${x}" y="${BOT_Y}" width="${BOX_W}" height="${BOX_H}" style="fill:var(--bg2);stroke:var(--border2)" stroke-width="1.5"/>`;
    lines.forEach((ln, li) => {
      s += `<text x="${cx(i)}" y="${BOT_Y + BOX_H / 2 + (li - (lines.length - 1) / 2) * 14}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" style="fill:var(--text)">${ln}</text>`;
    });
  });

  s += `</svg>`;

  const partChips = flow.participants.map(p => {
    const info = state.P[p];
    return info ? `<span class="part-chip">${info.label.replace('\n', ' ')}</span>` : '';
  }).join('');

  document.getElementById('seqc').innerHTML = `
    <div style="margin-bottom:16px">
      <div class="flow-desc">${flow.desc}</div>
      <div class="part-chips">${partChips}</div>
    </div>
    <div style="overflow-x:auto">${s}</div>`;
  makeSeqKeyboard();
}
