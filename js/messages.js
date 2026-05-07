import { state } from './state.js';
import { esc, announce, MOD_LABELS, initAccordion } from './utils.js';
import { updateHash, setMode } from './router.js';
import { selectFlow, renderSeq, renderListView } from './flows.js';

export function showMsgPlaceholder() {
  document.getElementById('di').innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;color:var(--text3);text-align:center"><div style="font-size:36px;margin-bottom:12px;opacity:0.3">✉</div><p style="font-size:13px;line-height:1.9">從左側選擇 CFX 訊息<br>查看規格與 JSON 範例</p></div>';
}

export function renderMsgList(term = '') {
  const el = document.getElementById('flow-list');
  el.innerHTML = '';
  const t = term.toLowerCase();

  const groups = {};
  Object.entries(state.MSGS).forEach(([key, msg]) => {
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
      d.className = 'msg-item' + (state.curMsg === msg.key ? ' active' : '');
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

export function selectMsg(msgName) {
  const m = state.MSGS[msgName];
  if (!m) return;
  if (state.curMsg === msgName) {
    state.curMsg = null;
    document.title = 'CFX 2.0 Message Reference';
    if (state.curMode === 'messages') {
      showMsgPlaceholder();
      renderMsgList(document.getElementById('search').value);
    } else {
      document.getElementById('detail-panel').classList.add('hidden');
      if (state.curFlow) {
        if (state.curView === 'diagram') renderSeq(state.curFlow);
        else renderListView(state.curFlow);
      }
    }
    updateHash();
    return;
  }
  state.curMsg = msgName;
  document.title = `${msgName} — CFX 2.0 Reference`;
  if (state.curMode === 'flows' && state.curFlow) {
    if (state.curView === 'diagram') renderSeq(state.curFlow);
    else renderListView(state.curFlow);
  }
  if (state.curMode === 'messages') renderMsgList(document.getElementById('search').value);

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

export function appendAmqpTopic(msgName, m) {
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

export function appendFlowBacklinks(msgName) {
  const el = document.getElementById('flow-backlinks-row');
  if (!el) return;
  const allFlows = state.FLOWS.flatMap(g => g.items);
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
