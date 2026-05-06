# CFX Reference Explorer — Data Quality Report

**Generated:** 2026-05-06  
**Scope:** `data/flows.json`, `data/messages.json`, `data/participants.json`, `data/scenarios.json`

---

## Summary

| Check | Result |
|---|---|
| **ERRORS** | **0** |
| **WARNINGS** | **1** |
| Total flows | 14 (across 9 groups) |
| Total messages | 183 ✅ (matches CSV source) |
| Total participants | 18 |
| Total scenarios | 6 |
| Flow steps (total) | 108 |
| Flow steps (CFX messages) | 104 |
| Flow steps (raw/non-CFX) | 4 (expected) |
| Messages referenced in flows | 41 / 183 (22.4%) |
| Messages unreferenced | 142 / 183 (expected — available in 訊息 mode) |
| Duplicate flow IDs | 0 |
| Duplicate scenario IDs | 0 |
| Invalid message directions | 0 |
| Step msg not in messages.json | 0 |
| Step from/to not in participants.json | 0 |
| Scenario flowIds not in flows.json | 0 |
| Scenario machineIds invalid | 0 |
| Module/key namespace mismatches | 0 |
| Step type vs message dir mismatches | 0 |

---

## Error List

> ✅ No errors found.

---

## Warning List

### W-001 · `flow=wip` — Participant `UPSTREAM` declared but never used in steps

**Severity:** Minor  
**Location:** `data/flows.json` → flow id `wip` → `participants` array

**Detail:**  
The WIP flow declares `["UPSTREAM", "PROCESS", "TRACEABILITY", "DOWNSTREAM"]` as participants, but no step uses `UPSTREAM`. All steps go `PROCESS → TRACEABILITY` (or the raw handoff to `DOWNSTREAM`). `UPSTREAM` appears in the participant list but is never the `from` or `to` of any step.

**Impact:** `UPSTREAM` will appear as a labelled swimlane column in the sequence diagram even though no arrows touch it — visual clutter in the sequence diagram.

**Suggested fix (do not auto-apply):**  
Remove `"UPSTREAM"` from the `participants` array in the `wip` flow, OR add a step that shows the upstream trigger (e.g., `UPSTREAM → PROCESS` with a raw step "board enters machine").

---

## CSV Message Coverage

Total messages in `messages.json`: **183**  
Total messages in source CSV (`cfx_messages.csv`): **184 rows** (row 1 = header → 183 data rows)  
✅ All 183 CSV messages present in messages.json.

### Direction Distribution

| Direction | Count |
|---|---|
| `event` | 98 (53.6%) |
| `response` | 43 (23.5%) |
| `request` | 42 (22.9%) |
| **Total** | **183** |

### Module Distribution (28 modules)

| Module | Messages |
|---|---|
| CFX.Production | 46 |
| CFX.ResourcePerformance | 26 |
| CFX.Materials.Management | 13 |
| CFX.Maintenance | 12 |
| CFX.Materials.Transport | 10 |
| CFX.Materials.Storage | 10 |
| CFX | 10 |
| CFX.InformationSystem.WorkOrderManagement | 5 |
| CFX.Materials.Management.MSDManagement | 5 |
| CFX.ResourcePerformance.SolderPastePrinting | 6 |
| CFX.Sensor.Identification | 4 |
| CFX.Production.Hermes | 6 |
| CFX.Production.Assembly.PressInsertion | 3 |
| CFX.InformationSystem.DataTransfer | 2 |
| CFX.InformationSystem.OperatorValidation | 2 |
| CFX.InformationSystem.ProductionScheduling | 2 |
| CFX.InformationSystem.TopicValidation | 2 |
| CFX.InformationSystem.UnitValidation | 2 |
| CFX.Production.Application | 2 |
| CFX.Production.Assembly | 2 |
| CFX.Production.LoadingAndUnloading | 2 |
| CFX.Production.TestAndInspection | 4 |
| CFX.Production.Application.Solder | 1 |
| CFX.Production.Processing | 1 |
| CFX.Production.ReworkAndRepair | 1 |
| CFX.ResourcePerformance.PressInsertion | 1 |
| CFX.ResourcePerformance.SMTPlacement | 1 |
| CFX.ResourcePerformance.THTInsertion | 1 |

---

## Flow → Message Coverage

**Messages referenced in at least one flow:** 41 / 183 (22.4%)  
**Messages not referenced in any flow:** 142 / 183 (77.6%)

> ℹ️ This is **expected by design**. The 流程 view covers the key protocol interaction patterns (connect, WIP, recipe, fault, per-machine). The remaining 142 messages are accessible via the 訊息 browser mode. Not every CFX message needs a flow diagram.

### Referenced messages by module

| Module | Referenced | Total |
|---|---|---|
| CFX (core) | 8 | 10 |
| CFX.Production | 19 | 46 |
| CFX.ResourcePerformance | 7 | 26 |
| CFX.Production.TestAndInspection | 2 | 4 |
| CFX.Materials.Storage | 2 | 10 |
| CFX.ResourcePerformance.SolderPastePrinting | 1 | 6 |
| CFX.Production.Assembly | 1 | 2 |
| CFX.Production.Processing | 1 | 1 |

### Modules with 0 flow references (no flow diagram exists)

These modules have messages in the 訊息 browser but no corresponding sequence diagram:

- `CFX.InformationSystem.DataTransfer` (2 messages)
- `CFX.InformationSystem.OperatorValidation` (2)
- `CFX.InformationSystem.ProductionScheduling` (2)
- `CFX.InformationSystem.TopicValidation` (2)
- `CFX.InformationSystem.UnitValidation` (2)
- `CFX.InformationSystem.WorkOrderManagement` (5)
- `CFX.Maintenance` (12)
- `CFX.Materials.Management` (13)
- `CFX.Materials.Management.MSDManagement` (5)
- `CFX.Materials.Transport` (10)
- `CFX.Production.Application` (2)
- `CFX.Production.Application.Solder` (1)
- `CFX.Production.Assembly.PressInsertion` (3)
- `CFX.Production.Hermes` (6)
- `CFX.Production.LoadingAndUnloading` (2)
- `CFX.Production.ReworkAndRepair` (1)
- `CFX.ResourcePerformance.PressInsertion` (1)
- `CFX.ResourcePerformance.SMTPlacement` (1)
- `CFX.ResourcePerformance.THTInsertion` (1)
- `CFX.Sensor.Identification` (4)

### CFX core messages not referenced in flows

- `CFX.Heartbeat` — heartbeat keepalive (not in any flow diagram)
- `CFX.NotSupportedResponse` — generic error response (not in any flow diagram)

---

## Machine → Flow Coverage

**Common flows (shared by all machine types):** 5 — all exist in flows.json ✅

| Common Flow ID | Label |
|---|---|
| `conn` | Endpoint 上線與能力宣告 |
| `shutdown` | Endpoint 下線通知 |
| `wip` | 一般生產 WIP 流程 |
| `recipe` | Recipe 查詢與遠端切換 |
| `fault` | 故障與狀態回報 |

**Machine-specific flows:** All machine types have exactly 1 specific flow ✅

| Machine ID | In participants.json | Specific Flow |
|---|---|---|
| `ENDPOINT` | ✅ | none (generic — expected) |
| `PRINTER_M` | ✅ | `printer` |
| `SPI_M` | ✅ | `spi` |
| `MOUNTER_M` | ✅ | `pp` |
| `AOI_M` | ✅ | `aoi` |
| `REFLOW_M` | ✅ | `reflow` |
| `SOLDER_M` | ✅ | `solder` |
| `TESTER_M` | ✅ | `test` |
| `LABELER_M` | ✅ | `labeler` |
| `COATING_M` | ✅ | `coating` |

---

## Scenario → Flow Coverage

All 6 scenarios resolve correctly. All `flowIds` exist in `flows.json`. ✅

| Scenario ID | Flows | Flow IDs | Missing |
|---|---|---|---|
| `startup` | 3 | `conn, recipe, wip` | 0 |
| `changeover` | 4 | `recipe, shutdown, conn, wip` | 0 |
| `fault-recovery` | 2 | `fault, wip` | 0 |
| `full-smt-line` | 6 | `printer, spi, pp, aoi, reflow, test` | 0 |
| `remote-recipe` | 1 | `recipe` | 0 |
| `maintenance-restart` | 4 | `shutdown, conn, recipe, wip` | 0 |

All `machineIds` in all scenarios are valid machine participant IDs. ✅

---

## Suggested Fix List

### Fix 1 (Recommended) — Remove `UPSTREAM` from `wip` flow participants

**File:** `data/flows.json`  
**Flow:** `wip`  
**Change:** Remove `"UPSTREAM"` from the `participants` array.

Before:
```json
"participants": ["UPSTREAM", "PROCESS", "TRACEABILITY", "DOWNSTREAM"]
```

After:
```json
"participants": ["PROCESS", "TRACEABILITY", "DOWNSTREAM"]
```

**Rationale:** `UPSTREAM` is never used in any step. It adds an empty swimlane to the sequence diagram. The Hermes handoff to `DOWNSTREAM` is already captured as a raw step.

---

### Opportunity (Not an Error) — Missing flow coverage for large modules

The following modules have many messages but no sequence diagram. Consider adding flows in a future iteration:

| Priority | Module | Messages | Suggested Flow |
|---|---|---|---|
| High | `CFX.Maintenance` | 12 | 預防性維護排程流程 |
| High | `CFX.Materials.Management` | 13 | 物料管理流程 |
| Medium | `CFX.Materials.Transport` | 10 | 物料搬運流程 |
| Medium | `CFX.InformationSystem.WorkOrderManagement` | 5 | 工單管理流程 |
| Low | `CFX.Production.Hermes` | 6 | Hermes 板卡追蹤流程 |
| Low | `CFX.Sensor.Identification` | 4 | 條碼掃描識別流程 |

---

*Report generated by manual data quality audit script.*  
*No automated fixes applied — all changes require explicit user approval.*
