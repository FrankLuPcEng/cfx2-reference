# 機台視角 (Machine Perspective) — Design Spec

**Date:** 2026-05-06  
**Feature:** Third sidebar mode in CFX 2.0 Reference webapp showing a per-machine CFX implementation checklist.

---

## Problem

The existing app has two perspectives:
- **流程 (Flows)**: browse sequence diagrams organized by flow type
- **訊息 (Messages)**: browse all 183 CFX messages by namespace

Missing perspective: **"What does machine X need to implement?"** — an engineer building a Stencil Printer endpoint wants to see all the flows they must handle, not browse all flows manually.

---

## Goal

Add a **機台 (Machine)** mode that lists SMT machine types in the sidebar. Selecting a machine shows its full CFX implementation checklist in the main area, split into:
1. **共用基礎流程** — flows every CFX machine must implement (5 flows)
2. **機型專屬流程** — flows unique to this machine type (1 per machine)

Each flow item is clickable and navigates to the sequence diagram in 流程 mode.

---

## Scope

**In scope:**
- Third mode button "機台" in `#mode-toggle`
- Sidebar list of 10 machine types (9 specific + 1 generic)
- Main area: two-section flow checklist with clickable cards
- Summary stat: total flows + total unique messages
- Navigation: clicking a flow card switches to 流程 mode and loads that flow

**Out of scope:**
- No new JSON data files (derive everything from existing `flows.json` + `participants.json`)
- No machine-level message filtering beyond what flows provide
- No editing or custom machine configuration

---

## Machine List

Machine types shown in SMT production line order:

| # | Participant ID | Display Name | Color |
|---|---------------|--------------|-------|
| 1 | `ENDPOINT` | Generic CFX Endpoint | `#5e35b1` |
| 2 | `PRINTER_M` | Stencil Printer | `#1565c0` |
| 3 | `SPI_M` | SPI Machine | `#00838f` |
| 4 | `MOUNTER_M` | SMT Mounter | `#2e7d32` |
| 5 | `AOI_M` | AOI / AXI | `#558b2f` |
| 6 | `REFLOW_M` | Reflow Oven | `#e65100` |
| 7 | `SOLDER_M` | Soldering | `#bf360c` |
| 8 | `TESTER_M` | Test Equipment | `#6a1b9a` |
| 9 | `LABELER_M` | Labeler / Laser Marker | `#37474f` |
| 10 | `COATING_M` | Conformal Coating / Cleaning | `#4e342e` |

---

## Flow Mapping

### Common flows (every machine)

```js
const COMMON_FLOW_IDS = ['conn', 'shutdown', 'wip', 'recipe', 'fault'];
```

These 5 flows use generic participant IDs (`ENDPOINT`, `PROCESS`, etc.) and apply to all CFX machines regardless of type.

### Machine-specific flow derivation

For each machine participant ID (e.g., `PRINTER_M`), scan all flows and collect those whose `participants` array includes that ID. This is computed at runtime — no data changes needed.

The `ENDPOINT` generic machine has no machine-specific flows (common flows only).

---

## UI Design

### Mode Toggle

Add a third button to `#mode-toggle` in `index.html`:
```html
<button class="mtbtn" data-mode="machines">機台</button>
```

### Sidebar (Machine List)

```
┌──────────────────────────────┐
│  ● Generic CFX Endpoint      │
│  ● Stencil Printer           │  ← active
│  ● SPI Machine               │
│  ● SMT Mounter               │
│  ● AOI / AXI                 │
│  ● Reflow Oven               │
│  ● Soldering                 │
│  ● Test Equipment            │
│  ● Labeler / Laser Marker    │
│  ● Conformal Coating         │
└──────────────────────────────┘
```

Styled as `.machine-item` (same shape as `.flow-item` — dot + label, active state).  
No search bar needed in this mode (only 10 items — hide `#search-wrap`).

### Main Area (Machine Detail)

Topbar: `{MachineName}` h2 + "CFX 2.0 實作清單" description + machine count badge.

Content layout (replaces seq diagram):

```
┌─────────────────────────────────────────────────┐
│  共用基礎流程  (5)                                │
│  ┌──────────────────────────────────────────┐   │
│  │ ● Endpoint 上線與能力宣告    連線 →       │   │
│  │ ● Endpoint 下線通知          連線 →       │   │
│  │ ● 一般生產 WIP 流程          生產 WIP →   │   │
│  │ ● Recipe 查詢與遠端切換      Recipe →    │   │
│  │ ● 故障與狀態回報             故障 →      │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  機型專屬流程  (1)                               │
│  ┌──────────────────────────────────────────┐   │
│  │ ● Stencil Printer 印刷流程   機型 →       │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  合計：6 個流程 · 28 個相關訊息                   │
└─────────────────────────────────────────────────┘
```

Each flow row: `dot (group color)` + `flow label` + `flow desc (secondary text)` + `group badge →` right-aligned  
Click → `selectFlow(flow)` + switch to `flows` mode

No detail panel or filter bar in machines mode.

---

## Architecture

### New state

```js
let curMachine = null;  // participant ID string
```

### New constants

```js
const COMMON_FLOW_IDS = ['conn', 'shutdown', 'wip', 'recipe', 'fault'];

const MACHINE_DEFS = [
  { id: 'ENDPOINT',   label: 'Generic CFX Endpoint',       color: '#5e35b1' },
  { id: 'PRINTER_M',  label: 'Stencil Printer',            color: '#1565c0' },
  { id: 'SPI_M',      label: 'SPI Machine',                color: '#00838f' },
  { id: 'MOUNTER_M',  label: 'SMT Mounter',                color: '#2e7d32' },
  { id: 'AOI_M',      label: 'AOI / AXI',                  color: '#558b2f' },
  { id: 'REFLOW_M',   label: 'Reflow Oven',                color: '#e65100' },
  { id: 'SOLDER_M',   label: 'Soldering',                  color: '#bf360c' },
  { id: 'TESTER_M',   label: 'Test Equipment',             color: '#6a1b9a' },
  { id: 'LABELER_M',  label: 'Labeler / Laser Marker',     color: '#37474f' },
  { id: 'COATING_M',  label: 'Conformal Coating / Cleaning', color: '#4e342e' },
];
```

### New functions

| Function | Purpose |
|----------|---------|
| `renderMachineList()` | Render sidebar with `.machine-item` elements |
| `selectMachine(machineId)` | Update `curMachine`, call `renderMachineDetail()` |
| `renderMachineDetail(machineId)` | Compute flows, render cards in `#seqc`, update topbar |
| `getMachineFlows(machineId)` | Return `{ common: Flow[], specific: Flow[] }` |
| `countMachineMessages(flows)` | Count unique message names across all flows' steps |

### `getMachineFlows(machineId)` logic

```js
function getMachineFlows(machineId) {
  const allFlows = FLOWS.flatMap(g => g.items.map(f => ({...f, groupColor: g.color, groupLabel: g.group})));
  const common   = COMMON_FLOW_IDS.map(id => allFlows.find(f => f.id === id)).filter(Boolean);
  const specific = machineId === 'ENDPOINT' ? []
    : allFlows.filter(f => f.participants.includes(machineId) && !COMMON_FLOW_IDS.includes(f.id));
  return { common, specific };
}
```

### `setMode()` update

When switching to `'machines'` mode:
- Add `machine-mode` class to `#main` (separate from `msg-mode` used by messages)
- Hide `#search-wrap` (via JS), hide `#fbar`, hide `#detail-panel`
- Clear `curMsg`, `curFlow`, `curMachine`
- Call `renderMachineList()`
- Show machine-mode placeholder in main area until machine selected

When switching away from `'machines'` mode:
- Show `#search-wrap` again

### Navigation: flow card click

```js
function goToFlow(flow) {
  setMode('flows', document.querySelector('.mtbtn[data-mode="flows"]'));
  selectFlow(flow);
}
```

---

## CSS additions

```css
/* Machine list sidebar items — same pattern as .flow-item */
.machine-item { display:flex; align-items:center; gap:7px; padding:6px 14px; cursor:pointer;
  border-left:3px solid transparent; font-size:12px; color:var(--text2); transition:all 0.1s; }
.machine-item:hover { background:var(--bg3); color:var(--text); }
.machine-item.active { background:#eef2fc; border-left-color:var(--accent); color:var(--accent2); font-weight:600; }

/* Machine detail content area */
.mach-section-hdr { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px;
  color:var(--text3); padding:14px 24px 6px; }
.flow-card { display:flex; align-items:flex-start; gap:10px; padding:10px 24px;
  cursor:pointer; border-left:3px solid transparent; transition:all 0.1s; }
.flow-card:hover { background:var(--bg3); border-left-color:var(--accent); }
.flow-card-label { font-size:13px; font-weight:600; color:var(--text); }
.flow-card-desc  { font-size:11px; color:var(--text3); margin-top:2px; }
.flow-card-badge { font-size:9px; font-weight:700; padding:2px 7px; border-radius:20px;
  border:1px solid; white-space:nowrap; margin-left:auto; flex-shrink:0; align-self:center; }
.mach-summary { padding:16px 24px; font-size:11px; color:var(--text3); border-top:1px solid var(--border); }

/* Machines mode layout — hide seq-panel and detail-panel, content area fills full width */
#main.machine-mode #seq-panel { display:none; }
#main.machine-mode #detail-panel,
#main.machine-mode #detail-panel.hidden { width:100%; min-width:0; border-left:none; overflow-y:auto; }
```

`#search-wrap` visibility is managed in JS (`setMode()`) since search is shown in messages mode but hidden in machines mode.

---

## Files Changed

| File | Change |
|------|--------|
| `index.html` | Add "機台" button to `#mode-toggle` |
| `app.js` | Add `MACHINE_DEFS`, `COMMON_FLOW_IDS`, `curMachine`, `renderMachineList()`, `selectMachine()`, `renderMachineDetail()`, `getMachineFlows()`, `countMachineMessages()`, `goToFlow()`; update `setMode()` |
| `styles.css` | Add `.machine-item`, `.flow-card`, `.mach-section-hdr`, `.mach-summary` |

No changes to `data/*.json`.

---

## Success Criteria

1. Clicking "機台" shows a sidebar list of 10 machine types
2. Clicking any machine shows two sections of flow cards in the main area
3. Common flows section always shows 5 flows
4. Machine-specific section shows the correct flow (or "此機型無專屬流程" for Generic)
5. Clicking a flow card switches to 流程 mode and renders the sequence diagram
6. Summary shows correct flow count and unique message count
7. Switching back to 流程 or 訊息 mode works correctly with no state leaks
