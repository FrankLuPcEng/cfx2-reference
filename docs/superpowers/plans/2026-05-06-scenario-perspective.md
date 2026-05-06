# 情境視角 (Scenario Perspective) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 4th sidebar mode "情境" that groups existing CFX flows into named real-world SMT manufacturing scenarios, each with a narrative description and ordered flow cards that navigate to the sequence diagram.

**Architecture:** Follows the exact same pattern as the "機台" mode — sidebar list + main-area detail rendered into `#seqc` + `goToFlow()` for navigation. New `data/scenarios.json` holds the 6 scenario definitions. No new layout primitives are needed.

**Tech Stack:** Vanilla JS ES module, HTML5, CSS3. No build tools. Works with VS Code Live Server and GitHub Pages via `fetch`.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `data/scenarios.json` | **Create** | 6 scenario definitions (id, label, icon, color, desc, narrative, flowIds, machineIds) |
| `index.html` | **Modify** | Add "情境" button to `#mode-toggle` |
| `styles.css` | **Modify** | Add `.scenario-narrative`, `.scenario-step-num`, `.machine-chip` |
| `app.js` | **Modify** | Add `SCENARIOS`, `curScenario` state; fetch; `renderScenarioList()`, `renderScenarioDetail()`, `selectScenario()`; update `setMode()` |

---

### Task 1: Create `data/scenarios.json`

**Files:**
- Create: `data/scenarios.json`

- [ ] **Step 1: Create `data/scenarios.json` with 6 scenarios**

```json
[
  {
    "id": "startup",
    "label": "正常生產啟動",
    "icon": "🟢",
    "color": "#1a7a40",
    "desc": "機台上線、取得配方、開始生產",
    "narrative": "設備開機後 Endpoint 連線到 AMQP Broker 並廣播 EndpointConnected，MES 查詢設備資訊後下發對應 Recipe。設備確認配方後開始接收 WIP 工作命令並回報生產狀態。",
    "flowIds": ["conn", "recipe", "wip"],
    "machineIds": ["PRINTER_M","SPI_M","MOUNTER_M","AOI_M","REFLOW_M","SOLDER_M","TESTER_M"]
  },
  {
    "id": "changeover",
    "label": "換線作業",
    "icon": "🔄",
    "color": "#b45d00",
    "desc": "更換料號，推送新配方，重啟生產",
    "narrative": "生產料號切換時，MES 先推送新的 Recipe 到各設備。若需清空在製品資訊，MES 通知設備暫停再下線重新上線以清除狀態，確認新配方後重啟 WIP 流程。",
    "flowIds": ["recipe", "shutdown", "conn", "wip"],
    "machineIds": ["PRINTER_M","SPI_M","MOUNTER_M","AOI_M","REFLOW_M","SOLDER_M","TESTER_M"]
  },
  {
    "id": "fault-recovery",
    "label": "異常停機與恢復",
    "icon": "⚠️",
    "color": "#c0392b",
    "desc": "機台故障回報、排除後恢復生產",
    "narrative": "設備發生故障時 Endpoint 廣播 FaultOccurred 讓 MES 及產線人員立即得知。排除故障後設備回報 FaultCleared，MES 確認狀態正常後恢復 WIP 流程繼續追蹤在製品。",
    "flowIds": ["fault", "wip"],
    "machineIds": ["PRINTER_M","SPI_M","MOUNTER_M","AOI_M","REFLOW_M","SOLDER_M","TESTER_M","LABELER_M","COATING_M"]
  },
  {
    "id": "full-smt-line",
    "label": "完整 SMT 產線生產",
    "icon": "🏭",
    "color": "#4f6db8",
    "desc": "PCB 從印刷到測試完整通過 SMT 產線",
    "narrative": "一片 PCB 在 SMT 產線上依序經過鋼板印刷→錫膏檢測→SMT 貼片→AOI 光學檢測→迴焊爐→最終測試。每個站點透過 CFX WIP 訊息追蹤板卡，並上報各站點的製程資料與品質資訊到 MES。",
    "flowIds": ["printer", "spi", "pp", "aoi", "reflow", "test"],
    "machineIds": ["PRINTER_M","SPI_M","MOUNTER_M","AOI_M","REFLOW_M","TESTER_M"]
  },
  {
    "id": "remote-recipe",
    "label": "遠端配方切換",
    "icon": "📋",
    "color": "#2d4f9e",
    "desc": "MES 推送新配方，機台確認後切換",
    "narrative": "MES 在不停機的情況下推送新的 Recipe 到指定設備。設備收到 SetRecipeRequest 後執行切換，回傳 SetRecipeResponse 確認成功。適用於小批量多樣化生產的快速換型需求。",
    "flowIds": ["recipe"],
    "machineIds": ["PRINTER_M","SPI_M","MOUNTER_M","AOI_M","REFLOW_M","SOLDER_M","TESTER_M","LABELER_M","COATING_M"]
  },
  {
    "id": "maintenance-restart",
    "label": "維護後重啟",
    "icon": "🔧",
    "color": "#5e35b1",
    "desc": "維護完成，機台重新上線並同步狀態",
    "narrative": "設備進行預防性維護或修復後重新連線到產線系統。Endpoint 先廣播 EndpointDisconnected（或由 Broker 偵測離線），維護完成後重新連線、宣告能力、取得最新 Recipe，再恢復生產。",
    "flowIds": ["shutdown", "conn", "recipe", "wip"],
    "machineIds": ["PRINTER_M","SPI_M","MOUNTER_M","AOI_M","REFLOW_M","SOLDER_M","TESTER_M","LABELER_M","COATING_M"]
  }
]
```

- [ ] **Step 2: Commit**

```bash
git add data/scenarios.json
git commit -m "feat(data): add scenarios.json with 6 SMT manufacturing scenarios

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 2: Add "情境" button to `index.html`

**Files:**
- Modify: `index.html` — line 15–18 (the `#mode-toggle` div)

- [ ] **Step 1: Add the button**

Current:
```html
  <div id="mode-toggle">
    <button class="mtbtn active" data-mode="flows">流程</button>
    <button class="mtbtn" data-mode="messages">訊息</button>
    <button class="mtbtn" data-mode="machines">機台</button>
```

Replace with:
```html
  <div id="mode-toggle">
    <button class="mtbtn active" data-mode="flows">流程</button>
    <button class="mtbtn" data-mode="messages">訊息</button>
    <button class="mtbtn" data-mode="machines">機台</button>
    <button class="mtbtn" data-mode="scenarios">情境</button>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat(ui): add 情境 (scenarios) mode button to mode toggle

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 3: Add CSS for scenario styles to `styles.css`

**Files:**
- Modify: `styles.css` — append after line 85 (end of file, after `.no-specific` rule)

- [ ] **Step 1: Append these rules to the end of `styles.css`**

```css
/* ── Scenario perspective ──────────────────────── */
.scenario-item{display:flex;align-items:center;gap:7px;padding:6px 14px;cursor:pointer;border-left:3px solid transparent;font-size:12px;color:var(--text2);transition:all 0.1s;}
.scenario-item:hover{background:var(--bg3);color:var(--text);}
.scenario-item.active{background:#eef2fc;border-left-color:var(--accent);color:var(--accent2);font-weight:600;}
.scenario-item-icon{font-size:14px;line-height:1;flex-shrink:0;}
.scenario-item-body{min-width:0;}
.scenario-item-label{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.scenario-item-desc{font-size:10px;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.scenario-detail{padding:8px 0 24px;}
.scenario-narrative{padding:12px 24px 16px;font-size:12px;color:var(--text2);line-height:1.7;font-style:italic;border-bottom:1px solid var(--border);}
.scenario-step-num{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:var(--accent);color:#fff;font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px;}
.machine-chip{display:inline-block;font-size:9px;padding:1px 6px;border-radius:10px;border:1px solid var(--border);color:var(--text3);margin:2px 2px 0 0;}
.scenario-chips{padding:4px 24px 2px 57px;display:flex;flex-wrap:wrap;gap:2px;}
```

- [ ] **Step 2: Commit**

```bash
git add styles.css
git commit -m "feat(styles): add scenario perspective CSS

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 4: Update `app.js` — state, fetch, and `setMode()`

**Files:**
- Modify: `app.js`

This task covers 3 related changes that must land together:
1. Add `SCENARIOS` module-level variable and `curScenario` to state line
2. Add `data/scenarios.json` fetch to `init()`
3. Add `else if (mode === 'scenarios')` branch to `setMode()`

- [ ] **Step 1: Update the state/data variables (line 1–2 of `app.js`)**

Current:
```js
let P = {}, MSGS = {}, FLOWS = [];
let curFlow = null, curMsg = null, msgFilter = 'all', curMode = 'flows', curMachine = null;
```

Replace with:
```js
let P = {}, MSGS = {}, FLOWS = [], SCENARIOS = [];
let curFlow = null, curMsg = null, msgFilter = 'all', curMode = 'flows', curMachine = null, curScenario = null;
```

- [ ] **Step 2: Update `init()` to fetch `data/scenarios.json`**

Current `init()` (lines 4–21):
```js
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
```

Replace with:
```js
async function init() {
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
}
```

- [ ] **Step 3: Add `'scenarios'` branch to `setMode()`**

Current `setMode()` has the pattern:
```js
  if (mode === 'messages') {
    ...
  } else if (mode === 'machines') {
    ...
  } else {
    // flows
    ...
  }
```

Add a new `else if` branch for `'scenarios'` **between** the `'machines'` branch and the `else` (flows) branch:

Replace:
```js
  } else if (mode === 'machines') {
    curMsg = null;
    curMachine = null;
    sw.style.display = 'none';
    fbar.style.display = 'none';
    document.getElementById('fbadge').style.display = 'none';
    document.getElementById('ftitle').textContent = '機台視角';
    document.getElementById('fdesc').textContent  = '← 選擇機台類型查看 CFX 2.0 實作清單';
    document.getElementById('empty-state').style.display = 'flex';
    document.getElementById('seqc').innerHTML = '';
    renderMachineList();

  } else {
```

With:
```js
  } else if (mode === 'machines') {
    curMsg = null;
    curMachine = null;
    sw.style.display = 'none';
    fbar.style.display = 'none';
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
    document.getElementById('fbadge').style.display = 'none';
    document.getElementById('ftitle').textContent = '情境視角';
    document.getElementById('fdesc').textContent  = '← 選擇製程情境查看跨流程的 CFX 訊息全貌';
    document.getElementById('empty-state').style.display = 'flex';
    document.getElementById('seqc').innerHTML = '';
    renderScenarioList();

  } else {
```

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat(app): add SCENARIOS data, fetch, and setMode scenarios branch

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 5: Add `renderScenarioList()`, `renderScenarioDetail()`, `selectScenario()` to `app.js`

**Files:**
- Modify: `app.js` — insert after the `goToFlow()` function (currently around line 262–266)

- [ ] **Step 1: Locate the end of `goToFlow()` and insert 3 new functions after it**

Current `goToFlow()` (end of the function block):
```js
function goToFlow(flow) {
  const btn = document.querySelector('.mtbtn[data-mode="flows"]');
  setMode('flows', btn);
  selectFlow(flow);
}
```

Immediately **after** the closing `}` of `goToFlow()`, insert:

```js
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
    // Machine chips: participants that are machine types (have _M suffix or are ENDPOINT)
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
```

- [ ] **Step 2: Verify brace balance**

Run in PowerShell:
```powershell
$c = Get-Content app.js -Raw
$o = ([regex]::Matches($c,'\{')).Count
$cl = ([regex]::Matches($c,'\}')).Count
Write-Host "Open: $o  Close: $cl  Diff: $($o-$cl)"
```

Expected output: `Open: NNN  Close: NNN  Diff: 0`

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat(app): add renderScenarioList, renderScenarioDetail, selectScenario

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 6: Final verification and combined commit

**Files:** (read-only verification)

- [ ] **Step 1: Verify `data/scenarios.json` loads — check Node can parse it**

```powershell
node -e "const s=JSON.parse(require('fs').readFileSync('data/scenarios.json','utf8')); console.log('Scenarios:', s.length, s.map(x=>x.id).join(', '))"
```

Expected: `Scenarios: 6 startup, changeover, fault-recovery, full-smt-line, remote-recipe, maintenance-restart`

- [ ] **Step 2: Verify all flowIds in scenarios exist in flows.json**

```powershell
node -e "
const flows = JSON.parse(require('fs').readFileSync('data/flows.json','utf8'));
const scenarios = JSON.parse(require('fs').readFileSync('data/scenarios.json','utf8'));
const allIds = new Set(flows.flatMap(g=>g.items.map(f=>f.id)));
let ok=true;
scenarios.forEach(sc=>sc.flowIds.forEach(fid=>{if(!allIds.has(fid)){console.error('MISSING:',sc.id,fid);ok=false;}}));
if(ok) console.log('All flowIds valid');
"
```

Expected: `All flowIds valid`

- [ ] **Step 3: Verify all machineIds in scenarios exist in MACHINE_DEFS**

```powershell
node -e "
const scenarios = JSON.parse(require('fs').readFileSync('data/scenarios.json','utf8'));
const VALID = new Set(['ENDPOINT','PRINTER_M','SPI_M','MOUNTER_M','AOI_M','REFLOW_M','SOLDER_M','TESTER_M','LABELER_M','COATING_M']);
let ok=true;
scenarios.forEach(sc=>sc.machineIds.forEach(mid=>{if(!VALID.has(mid)){console.error('INVALID:',sc.id,mid);ok=false;}}));
if(ok) console.log('All machineIds valid');
"
```

Expected: `All machineIds valid`

- [ ] **Step 4: Verify brace balance in app.js**

```powershell
$c = Get-Content app.js -Raw
$o = ([regex]::Matches($c,'\{')).Count
$cl = ([regex]::Matches($c,'\}')).Count
Write-Host "Open: $o  Close: $cl  Diff: $($o-$cl)"
```

Expected: `Diff: 0`

- [ ] **Step 5: Manual browser test checklist**

Open with Live Server (`index.html`). Verify:

1. Four mode buttons appear: 流程 | 訊息 | 機台 | **情境**
2. Click "情境" → sidebar shows 6 items with icons (🟢🔄⚠️🏭📋🔧), no search bar, topbar reads "情境視角"
3. Click "正常生產啟動" → topbar updates, narrative text appears in green italic, 3 numbered flow cards appear (Endpoint上線 / Recipe / WIP)
4. Machine chips appear below each card showing relevant machine labels
5. Click a flow card → switches to 流程 mode and renders correct sequence diagram
6. Click 機台 → machines mode still works
7. Click 訊息 → messages mode still works  
8. Click 流程 → flows mode still works
9. Search bar reappears when switching to 流程 or 訊息
10. No JS errors in browser console

- [ ] **Step 6: Final commit with all changes**

```bash
git add data/scenarios.json index.html styles.css app.js
git commit -m "feat: add 情境視角 (scenario perspective) mode

Fourth sidebar mode grouping CFX flows into 6 real-world SMT scenarios:
- 正常生產啟動, 換線作業, 異常停機與恢復
- 完整SMT產線生產, 遠端配方切換, 維護後重啟

Each scenario shows: narrative description, ordered numbered flow cards,
machine chips showing which machines participate, and click-to-navigate
into 流程 mode sequence diagram.

New file: data/scenarios.json
Modified: index.html, styles.css, app.js

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Self-Review

**Spec coverage check:**
- ✅ 4th "情境" mode button → Task 2
- ✅ Sidebar list of 6 scenarios with icon + label + desc → Task 5 (`renderScenarioList`)
- ✅ Narrative description in main area → Task 5 (`renderScenarioDetail` `.scenario-narrative`)
- ✅ Ordered numbered flow cards → Task 5 (`.scenario-step-num` + numbered index)
- ✅ Machine chips under each card → Task 5 (`.machine-chip`)
- ✅ Click card → navigate to 流程 mode → Task 5 (`goToFlow()` reuse)
- ✅ Detail panel hidden in 情境 mode → Task 4 (`setMode` branch)
- ✅ Search bar hidden in 情境 mode → Task 4 (`sw.style.display = 'none'`)
- ✅ data/scenarios.json → Task 1
- ✅ CSS for new elements → Task 3

**Placeholder scan:** No TBD or TODO. All code complete.

**Type consistency:**
- `SCENARIOS` array used consistently across Task 4 and Task 5
- `curScenario` (string id, not object) used consistently
- `renderScenarioList()` accesses `SCENARIOS[idx]?.id` — safe optional chaining for index alignment
- `MACHINE_DEFS` referenced in `renderScenarioDetail` — already defined in `app.js` before insertion point
- `goToFlow()` called in `renderScenarioDetail` — already defined before insertion point
