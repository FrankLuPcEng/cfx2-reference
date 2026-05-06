# App.js Refactor Design

**Date:** 2026-05-06  
**Goal:** Split the 1,250-line `app.js` into focused ES modules, extract static inline styles to CSS classes, and remove dead code — without changing any visible behaviour or UI.

---

## Motivation

- `app.js` has grown to 1,250 lines with 43 functions covering 7 distinct concerns.
- A 230-line static HTML string (`guideHTML`) and machine/scenario views are unrelated to the core flows viewer but live in the same file.
- 12 static inline styles are repeated across JS-generated HTML; they belong in `styles.css`.
- No dead code found (all functions are called).

---

## Constraints

- Pure native ES modules — **no bundler, no build step**. GitHub Pages + VS Code Live Server serve files directly.
- All `import` paths must be relative (e.g., `./js/flows.js`).
- `index.html` loads only `app.js` via `<script type="module">`. No change to HTML required.
- Behaviour, UI, and visual design must be identical after refactoring.

---

## File Structure

### New files created

```
js/
  state.js      Shared mutable state object (single source of truth)
  theme.js      Theme initialisation, toggle, theme-color meta, matchMedia
  router.js     URL hash sync, setMode, popstate listener
  utils.js      Shared helpers: esc, announce, showError, initSidebar,
                initDpResize, initAbout, findFlowGroup, updateBreadcrumb,
                showViewBar, setViewMode, goToFlow, MOD_LABELS
  flows.js      Flow sidebar, selectFlow, renderSeq, renderListView,
                makeSeqKeyboard, setFilter
  messages.js   Message list, selectMsg, appendAmqpTopic,
                appendFlowBacklinks, showMsgPlaceholder
  machines.js   Machine list + detail, selectMachine, getMachineFlows,
                countMachineMessages
  scenarios.js  Scenario list + detail, selectScenario
  guide.js      renderGuideSidebar, renderGuide, guideHTML (static HTML)
```

### Modified files

```
app.js          Entry point only: init(), showError call, fetch, setupListeners,
                imports from all js/* modules
styles.css      +4 new utility classes (see CSS section below)
```

---

## Shared State (`js/state.js`)

All mutable application state lives in one exported object. Every module imports it and reads/writes properties directly — the same access pattern as today, but with a clear home.

```js
export const state = {
  P: {}, MSGS: {}, FLOWS: [], SCENARIOS: [],
  curFlow: null, curMsg: null, msgFilter: 'all',
  curMode: 'flows', curMachine: null, curScenario: null,
  curView: 'diagram', _restoringHash: false
};
```

Every module that needs state imports it as:
```js
import { state } from './state.js';
```

`app.js` imports `state` and sets `state.P`, `state.MSGS`, etc. after fetch resolves.

---

## Module Responsibilities

### `js/theme.js`
- Exports: `initTheme`, `toggleTheme`, `updateThemeColorMeta`
- Side effect on load: none
- Imports: nothing (reads/writes DOM only)

### `js/router.js`
- Exports: `updateHash`, `restoreFromHash`, `setMode`
- Imports: `state`, all view modules (flows, messages, machines, scenarios, guide) for the `setMode` dispatch
- `popstate` listener registered from `app.js` init (not auto-registered on import)

### `js/utils.js`
- Exports: `esc`, `announce`, `showError`, `initSidebar`, `initDpResize`, `initAbout`, `findFlowGroup`, `updateBreadcrumb`, `showViewBar`, `setViewMode`, `goToFlow`, `MOD_LABELS`
- Imports: `state`

### `js/flows.js`
- Exports: `renderSidebar`, `selectFlow`, `renderSeq`, `renderListView`, `makeSeqKeyboard`, `setFilter`
- Imports: `state`, `announce`, `esc`, `updateHash`, `selectMsg`, `updateBreadcrumb`, `showViewBar`

### `js/messages.js`
- Exports: `renderMsgList`, `selectMsg`, `appendAmqpTopic`, `appendFlowBacklinks`, `showMsgPlaceholder`
- Imports: `state`, `announce`, `esc`, `updateHash`, `selectFlow`

### `js/machines.js`
- Exports: `renderMachineList`, `renderMachineDetail`, `selectMachine`, `getMachineFlows`, `countMachineMessages`
- Imports: `state`, `selectFlow`, `MOD_LABELS`

### `js/scenarios.js`
- Exports: `renderScenarioList`, `renderScenarioDetail`, `selectScenario`
- Imports: `state`, `selectFlow`

### `js/guide.js`
- Exports: `renderGuideSidebar`, `renderGuide`, `guideHTML`
- Imports: nothing (pure HTML generation)

### `app.js` (after refactor)
- Imports all modules
- Owns `init()`: calls `initTheme`, `initSidebar`, `initDpResize`, `initAbout`, fetches data, sets `state.P/MSGS/FLOWS/SCENARIOS`, calls `setupListeners`, `renderSidebar`, registers `popstate`, calls `restoreFromHash`
- Owns `setupListeners()`: wires all DOM event listeners (search, nav-item clicks, filter, view-bar, list-panel, detail-panel)
- Estimated size after refactor: ~80 lines

---

## Circular Import Risk

`router.js` calls `setMode`, which dispatches to all view renderers — it needs to import from `flows.js`, `messages.js`, etc. Those modules call `updateHash` (from `router.js`). This creates a potential circular dependency:

```
router.js → flows.js → updateHash (router.js)
```

**Resolution:** In ES modules, circular imports are resolved at runtime if the import is read after module initialisation (function body, not top-level). Since `updateHash` is only called inside function bodies (never at top-level), this circular reference is safe. No changes needed.

---

## CSS Changes

Add these 4 classes to `styles.css`. All are extracted from static inline styles in generated HTML:

```css
/* ── JS-generated layout helpers ─────────────────── */
.dp-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;}
.flow-desc{font-size:11px;color:var(--text2);margin-bottom:6px;}
.empty-msg{padding:24px 14px;color:var(--text3);font-size:11px;text-align:center;}
.detail-fields-row{color:var(--text2);font-size:11px;}
```

Dynamic inline styles (those using `${variable}` interpolation or SVG `fill`/`stroke`) remain inline — they cannot be expressed as static CSS classes.

---

## What Does NOT Change

- `index.html` — no changes needed
- `data/*.json` — no changes
- All visual behaviour, interactions, URL hash format
- Any JS logic — this is purely structural movement, not rewriting

---

## Testing

No automated tests exist. Manual verification checklist after refactoring:
1. Open via Live Server — app loads, no console errors
2. Select a flow → sequence diagram renders correctly in light and dark mode
3. Click a message → detail panel opens
4. URL hash updates on flow/message select; back button restores state
5. Switch all 5 nav modes (flows, messages, machines, scenarios, guide)
6. Theme toggle works
7. Copy button announces via screen reader region
8. SVG keyboard navigation (Tab to message, Enter to open detail)
