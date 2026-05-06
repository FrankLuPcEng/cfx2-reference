# 情境視角 (Scenario Perspective) — Feature Design

**Date:** 2026-05-06  
**Status:** Draft  
**App:** CFX 2.0 SMT Message Reference Explorer

---

## Problem Statement

The app currently has three modes:
- **流程** — individual protocol sequence diagrams (14 flows)
- **訊息** — browse all 183 CFX messages
- **機台** — per-machine-type implementation checklist

All three modes are "atomic" — they show one protocol or one machine at a time. There is no way to see how **multiple flows combine** to handle a real-world SMT manufacturing scenario. An engineer asking "what CFX messages are involved in a line changeover?" has no quick answer in the current UI.

**情境視角 (Scenario Perspective)** solves this by grouping flows into named manufacturing scenarios, showing the ordered sequence of flow involvement and which machines participate.

---

## Design

### Overview

A 4th sidebar mode **"情境"** is added to the mode toggle bar. Selecting it shows:
- **Sidebar**: list of 6 manufacturing scenarios (icon + label + one-line description)
- **Main area**: scenario detail — narrative description, ordered list of involved flows as numbered cards, machine chips showing which machine types participate

Clicking any flow card navigates to 流程 mode and loads that flow's sequence diagram (same pattern as 機台 mode's `goToFlow()`).

---

### Scenarios (6 total)

| # | ID | Label | Description | Flows Involved |
|---|---|---|---|---|
| 1 | `startup` | 正常生產啟動 | 機台上線、取得配方、開始生產 | conn → recipe → wip |
| 2 | `changeover` | 換線作業 | 更換料號，推送新配方，重啟生產 | recipe → shutdown → conn → wip |
| 3 | `fault-recovery` | 異常停機與恢復 | 機台故障回報、排除後恢復生產 | fault → wip |
| 4 | `full-smt-line` | 完整 SMT 產線生產 | PCB 從印刷到測試完整通過 SMT 產線 | printer → spi → pp → aoi → reflow → test |
| 5 | `remote-recipe` | 遠端配方切換 | MES 推送新配方，機台確認後切換 | recipe |
| 6 | `maintenance-restart` | 維護後重啟 | 維護完成，機台重新上線並同步狀態 | shutdown → conn → recipe → wip |

---

### Data: `data/scenarios.json`

New JSON file. Schema:

```json
[
  {
    "id": "startup",
    "label": "正常生產啟動",
    "icon": "🟢",
    "color": "#1a7a40",
    "desc": "機台上線、取得配方、開始生產",
    "narrative": "設備開機後，Endpoint 連線到 AMQP Broker 並廣播 EndpointConnected。MES 查詢設備資訊後，下發對應的 Recipe。設備確認配方後開始接收 WIP 工作命令並回報生產狀態。",
    "flowIds": ["conn", "recipe", "wip"],
    "machineIds": ["PRINTER_M","SPI_M","MOUNTER_M","AOI_M","REFLOW_M","SOLDER_M","TESTER_M"]
  }
]
```

Fields:
- `id` — unique string key
- `label` — Chinese display name
- `icon` — emoji for sidebar
- `color` — theme hex color for badge/accent
- `desc` — one-line sidebar description
- `narrative` — 2–4 sentence explanation for detail panel header
- `flowIds` — ordered array of flow IDs (must exist in flows.json)
- `machineIds` — optional array of relevant machine participant IDs

---

### UI Layout

**Sidebar (reuses `#flow-list`)**:
```
情境項目:
🟢 正常生產啟動
   機台上線、取得配方、開始生產

🔄 換線作業
   更換料號，推送新配方，重啟生產
```
Each item: icon + bold label + grey desc, same `.machine-item` style pattern.

**Main area (reuses `#seq-panel` / `#seqc`)**:
```
[情境名稱]  [color badge]
[Narrative paragraph]

流程步驟：
① [Endpoint 上線與能力宣告]  [連線 badge]  PRINTER MOUNTER ...
② [Recipe 查詢與遠端切換]    [配方 badge]  ...
③ [一般生產 WIP 流程]        [生產 badge]  ...
```
- Numbered flow cards (same `.flow-card` style from 機台 mode)
- Below each card: small machine chips showing `machineIds` for that flow
- Clicking a card → `goToFlow(flow)` (reuse existing function)
- Detail panel stays hidden (same as 機台 mode)

---

### State & Functions

New state variable: `let curScenario = null`

New functions in `app.js`:
| Function | Purpose |
|---|---|
| `renderScenarioList()` | Render scenario items in `#flow-list` |
| `renderScenarioDetail(scenarioId)` | Render flow cards + narrative in `#seqc` |
| `selectScenario(scenarioId)` | Set `curScenario`, highlight sidebar, call `renderScenarioDetail` |

Reused functions (no change needed):
- `goToFlow(flow)` — already handles navigation to 流程 mode

`setMode()` updated with `else if (mode === 'scenarios')` branch:
- Hides search bar and fbar (same as 機台 mode)
- Sets topbar to "情境視角"
- Renders scenario list in sidebar

---

### Mode Layout

| Element | 情境 mode behavior |
|---|---|
| `#search-wrap` | Hidden (`sw.style.display = 'none'`) |
| `#fbar` | Hidden |
| `#detail-panel` | Hidden (`dp.classList.add('hidden')`) |
| `#seq-panel` | Visible (scenario detail rendered into `#seqc`) |
| `#empty-state` | Visible until a scenario is selected |

---

### CSS

Reuses existing styles: `.machine-item`, `.flow-card`, `.mach-section-hdr`, `.no-specific`

New styles needed:
- `.scenario-narrative` — italic grey text block for the 2–4 sentence narrative
- `.scenario-step-num` — circular number badge (①②③) before each flow card
- `.machine-chip` — small pill showing machine type label under each flow card

---

### data/scenarios.json — Full Content

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
    "narrative": "生產料號切換時，MES 先推送新的 Recipe 到各設備，設備確認後回報就緒。若需要清空在製品資訊，MES 會先通知設備暫停再下線重新上線以清除狀態，最後重啟 WIP 流程。",
    "flowIds": ["recipe", "shutdown", "conn", "wip"],
    "machineIds": ["PRINTER_M","SPI_M","MOUNTER_M","AOI_M","REFLOW_M","SOLDER_M","TESTER_M"]
  },
  {
    "id": "fault-recovery",
    "label": "異常停機與恢復",
    "icon": "⚠️",
    "color": "#c0392b",
    "desc": "機台故障回報、排除後恢復生產",
    "narrative": "設備發生故障時，Endpoint 廣播 FaultOccurred 讓 MES 及產線人員立即得知。排除故障後設備回報 FaultCleared，MES 確認狀態正常後恢復 WIP 流程，繼續追蹤在製品。",
    "flowIds": ["fault", "wip"],
    "machineIds": ["PRINTER_M","SPI_M","MOUNTER_M","AOI_M","REFLOW_M","SOLDER_M","TESTER_M","LABELER_M","COATING_M"]
  },
  {
    "id": "full-smt-line",
    "label": "完整 SMT 產線生產",
    "icon": "🏭",
    "color": "#4f6db8",
    "desc": "PCB 從印刷到測試完整通過 SMT 產線",
    "narrative": "一片 PCB 在 SMT 產線上依序經過：鋼板印刷→錫膏檢測→SMT 貼片→AOI 光學檢測→迴焊爐→最終測試。每個站點透過 CFX WIP 訊息追蹤板卡，並上報各站點的製程資料與品質資訊到 MES。",
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
    "narrative": "設備進行預防性維護或修復後，重新連線到產線系統。Endpoint 先廣播 EndpointDisconnected（或由 Broker 偵測離線），維護完成後重新連線、宣告能力、取得最新 Recipe，再恢復生產。",
    "flowIds": ["shutdown", "conn", "recipe", "wip"],
    "machineIds": ["PRINTER_M","SPI_M","MOUNTER_M","AOI_M","REFLOW_M","SOLDER_M","TESTER_M","LABELER_M","COATING_M"]
  }
]
```

---

## Implementation Plan (high level)

1. Create `data/scenarios.json`
2. Add `SCENARIOS` variable and fetch to `init()` in `app.js`
3. Add `curScenario` state
4. Add `renderScenarioList()`, `renderScenarioDetail()`, `selectScenario()`
5. Update `setMode()` with `'scenarios'` branch
6. Add CSS for `.scenario-narrative`, `.scenario-step-num`, `.machine-chip`
7. Add "情境" button to `index.html`

No new pages, no build tools, no dependencies.

---

## Success Criteria

- [ ] "情境" button appears in mode toggle bar
- [ ] Clicking "情境" shows scenario list in sidebar, hides search bar
- [ ] Clicking a scenario shows narrative + ordered flow cards in main area
- [ ] Each flow card shows relevant machine chips
- [ ] Clicking a flow card navigates to 流程 mode + renders sequence diagram
- [ ] Switching between all 4 modes works cleanly without layout glitches
- [ ] Works with VS Code Live Server and GitHub Pages (fetch-based)
