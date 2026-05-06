# Machine Perspective Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "機台" (Machine) third mode to the CFX 2.0 Reference sidebar that shows a per-machine CFX implementation checklist — common flows + machine-specific flows — with clickable cards that navigate to the sequence diagram view.

**Architecture:** New third mode reuses the existing `#flow-list` sidebar div and `#seq-panel / #seqc` main content area. Machine detail is rendered as HTML into `#seqc` (same pattern as `renderSeq()`). Navigation clicks call the existing `selectFlow()` after switching mode back to 'flows'. No new data files required — all data is derived from existing `flows.json` and `participants.json`.

**Tech Stack:** Vanilla JS ES modules, no build tools, no frameworks. Live Server / GitHub Pages compatible.

---

## File Map

| File | Change |
|------|--------|
| `index.html` | Add "機台" button to `#mode-toggle` |
| `styles.css` | Add `.machine-item`, `.flow-card`, `.mach-section-hdr`, `.mach-summary`, `.no-specific` |
| `app.js` | Add state, constants, 6 new functions, update `setMode()` and `setupListeners()` |

---

### Task 1: Add "機台" Button to index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add the third mode button**

In `index.html`, the current `#mode-toggle` is:
```html
<div id="mode-toggle">
  <button class="mtbtn active" data-mode="flows">流程</button>
  <button class="mtbtn" data-mode="messages">訊息</button>
</div>
```

Change it to:
```html
<div id="mode-toggle">
  <button class="mtbtn active" data-mode="flows">流程</button>
  <button class="mtbtn" data-mode="messages">訊息</button>
  <button class="mtbtn" data-mode="machines">機台</button>
</div>
```

- [ ] **Step 2: Verify in browser**

Open with Live Server. Confirm three buttons appear side by side in the sidebar header area. The third button "機台" should be unactive (no background). Clicking it does nothing yet (JS not wired).

---

### Task 2: Add Machine UI Styles to styles.css

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Append machine styles at end of styles.css**

Add at the very end of `styles.css`:

```css
/* ── Machine perspective ───────────────────────── */
.machine-item{display:flex;align-items:center;gap:7px;padding:6px 14px;cursor:pointer;border-left:3px solid transparent;font-size:12px;color:var(--text2);transition:all 0.1s;}
.machine-item:hover{background:var(--bg3);color:var(--text);}
.machine-item.active{background:#eef2fc;border-left-color:var(--accent);color:var(--accent2);font-weight:600;}
.mach-detail{padding:8px 0 24px;}
.mach-section-hdr{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text3);padding:14px 24px 6px;border-top:1px solid var(--border);}
.mach-section-hdr:first-child{border-top:none;}
.flow-card{display:flex;align-items:flex-start;gap:10px;padding:9px 24px;cursor:pointer;border-left:3px solid transparent;transition:all 0.1s;}
.flow-card:hover{background:var(--bg3);border-left-color:var(--accent);}
.flow-card-body{flex:1;min-width:0;}
.flow-card-label{font-size:13px;font-weight:600;color:var(--text);}
.flow-card-desc{font-size:11px;color:var(--text3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.flow-card-badge{font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;border:1px solid;white-space:nowrap;flex-shrink:0;align-self:center;}
.mach-summary{padding:14px 24px;font-size:11px;color:var(--text3);border-top:1px solid var(--border);margin-top:4px;}
.no-specific{padding:10px 24px;font-size:12px;color:var(--text3);font-style:italic;}
```

- [ ] **Step 2: Verify styles load without errors**

Open browser DevTools → Console. No CSS errors. The styles are inert until classes are applied by JS.

---

### Task 3: Add State, Constants, and Pure Computation Functions to app.js

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add `curMachine` to the state line**

Current state line (line 2):
```js
let curFlow = null, curMsg = null, msgFilter = 'all', curMode = 'flows';
```

Change to:
```js
let curFlow = null, curMsg = null, msgFilter = 'all', curMode = 'flows', curMachine = null;
```

- [ ] **Step 2: Add `MACHINE_DEFS` and `COMMON_FLOW_IDS` constants**

Add these two constants immediately after the `MOD_LABELS` block (after its closing `};`):

```js
const COMMON_FLOW_IDS = ['conn', 'shutdown', 'wip', 'recipe', 'fault'];

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
```

- [ ] **Step 3: Add `getMachineFlows()` and `countMachineMessages()` functions**

Add these two functions immediately after the `MACHINE_DEFS` constant:

```js
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
```

- [ ] **Step 4: Verify no syntax errors**

Open browser DevTools → Console. Page should load without errors. All existing functionality (流程, 訊息 modes) still works.

---

### Task 4: Add Sidebar Rendering and Machine Selection Functions

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add `renderMachineList()` function**

Add immediately after `countMachineMessages()`:

```js
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
```

- [ ] **Step 2: Add `renderMachineDetail()` function**

Add immediately after `renderMachineList()`:

```js
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

  // Wire flow card clicks
  document.getElementById('seqc').querySelectorAll('.flow-card[data-flow-id]').forEach(card => {
    card.addEventListener('click', () => {
      const flow = FLOWS.flatMap(g => g.items).find(f => f.id === card.dataset.flowId);
      if (flow) goToFlow(flow);
    });
  });
}
```

- [ ] **Step 3: Add `selectMachine()` and `goToFlow()` functions**

Add immediately after `renderMachineDetail()`:

```js
function selectMachine(machineId) {
  curMachine = machineId;
  const def = MACHINE_DEFS.find(m => m.id === machineId);
  document.querySelectorAll('.machine-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.machine-item').forEach(el => {
    if (el.textContent.trim() === def.label) el.classList.add('active');
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
  const btn = document.querySelector('.mtbtn[data-mode="flows"]');
  setMode('flows', btn);
  selectFlow(flow);
}
```

- [ ] **Step 4: Verify no syntax errors in DevTools Console**

All existing functionality still intact. No errors on page load.

---

### Task 5: Update `setMode()` to Handle Machines Mode

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Replace the `setMode()` function**

The current `setMode()` function handles only `'messages'` and `'flows'`. Replace the entire function with this version that also handles `'machines'`:

```js
function setMode(mode, btn) {
  curMode = mode;
  document.querySelectorAll('.mtbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const search = document.getElementById('search');
  const main   = document.getElementById('main');
  const dp     = document.getElementById('detail-panel');
  const fbar   = document.getElementById('fbar');
  const sw     = document.getElementById('search-wrap');

  // Reset shared layout
  main.classList.remove('msg-mode');
  dp.classList.add('hidden');
  sw.style.display = '';

  if (mode === 'messages') {
    curMsg = null;
    search.value = '';
    search.placeholder = '搜尋訊息…';
    main.classList.add('msg-mode');
    dp.classList.remove('hidden');
    document.getElementById('ftitle').textContent = '訊息瀏覽器';
    document.getElementById('fdesc').textContent  = '← 從左側選擇 CFX 訊息查看規格與 JSON 範例';
    document.getElementById('fbadge').style.display = 'none';
    fbar.style.display = 'none';
    showMsgPlaceholder();
    renderMsgList();

  } else if (mode === 'machines') {
    curMsg = null;
    curMachine = null;
    search.value = '';
    sw.style.display = 'none';
    fbar.style.display = 'none';
    document.getElementById('fbadge').style.display = 'none';
    document.getElementById('ftitle').textContent = '機台視角';
    document.getElementById('fdesc').textContent  = '← 選擇機台類型查看 CFX 2.0 實作清單';
    document.getElementById('empty-state').style.display = 'flex';
    document.getElementById('seqc').innerHTML = '';
    renderMachineList();

  } else {
    // flows mode
    curMsg = null;
    search.value = '';
    search.placeholder = '搜尋流程…';
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
```

- [ ] **Step 2: Verify full end-to-end flow in browser**

1. Click "機台" button → sidebar shows 10 machine items, topbar says "機台視角", search box hidden
2. Click "Stencil Printer" → main area shows two sections: 5 common flows + 1 specific flow (Stencil Printer 印刷流程)
3. Dot and badge colors for the machine are visible
4. Summary line: "合計：6 個流程 · N 個相關訊息"
5. Click a flow card → switches to 流程 mode and renders the correct sequence diagram
6. Click "訊息" button → messages mode works as before (search visible, seq panel hidden)
7. Click "流程" button → flows mode works as before (sidebar + seq diagram)

- [ ] **Step 3: Commit**

```bash
git add index.html app.js styles.css
git commit -m "feat: add machine perspective mode

Add 機台 (Machine) as a third sidebar mode. Selecting a machine type
shows its full CFX implementation checklist split into:
- 共用基礎流程 (5 flows every CFX machine must implement)
- 機型專屬流程 (machine-specific flow)

Flow cards are clickable and navigate to the sequence diagram in 流程
mode. Machine summary shows total flows and unique message count.

New: MACHINE_DEFS, COMMON_FLOW_IDS constants; renderMachineList(),
renderMachineDetail(), selectMachine(), getMachineFlows(),
countMachineMessages(), goToFlow() functions; setMode() extended for
'machines' case.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All spec requirements covered — 3rd mode button ✅, 10 machine sidebar ✅, common flows section ✅, specific flows section ✅, flow card click navigation ✅, summary stat ✅, mode switch cleanup ✅
- [x] **Placeholders:** None — all steps have exact code
- [x] **Type consistency:** `getMachineFlows()` returns `{ common, specific }` — used correctly in `renderMachineDetail()`. `MACHINE_DEFS` has `id/label/color` — used consistently in `renderMachineList()` and `selectMachine()`. `goToFlow()` signature matches usage in event listener.
- [x] **`curFlow` preservation:** When navigating from machines → flows via `goToFlow()`, `setMode('flows')` is called which checks `curFlow`. But `goToFlow()` calls `selectFlow(flow)` immediately after, which sets `curFlow`. No state leak.
- [x] **search-wrap restore:** `setMode()` resets `sw.style.display = ''` at top before branching, so switching from machines to any other mode restores search.
