# Accordion Sidebar Group Headers — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `.grp-hdr` group headers in Flows and Messages sidebars collapsible via click, with state persisted in `localStorage` and auto-expand for the currently-selected item.

**Architecture:** Two render functions (`renderSidebar`, `renderMsgList`) are updated to wrap items in a `.grp-items` container inside a `.grp-block` wrapper, a shared `initAccordion()` helper wires up click/keyboard/localStorage, and `selectFlow()` ensures the active item's group is always visible. No new files are required.

**Tech Stack:** Vanilla JS (ES6), CSS `max-height` transitions, `localStorage`

---

## Files Changed

| File | Change |
|---|---|
| `styles.css` | Update `.grp-hdr` rule; add `.grp-chevron`, `.grp-items`, `.grp-block.collapsed` rules |
| `app.js` | Add `initAccordion()` helper; refactor `renderSidebar()`; refactor `renderMsgList()`; update `selectFlow()` |

---

### Task 1: Add accordion CSS to `styles.css`

**Files:**
- Modify: `styles.css` (line 52 — `.grp-hdr` rule)

The existing `.grp-hdr` rule is one line. Replace it and add the new accordion block immediately after.

- [ ] **Step 1: Locate the existing `.grp-hdr` rule**

Open `styles.css` and find this line (around line 52):
```css
.grp-hdr{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);padding:10px 14px 3px;}
```

- [ ] **Step 2: Replace the `.grp-hdr` rule and add accordion block**

Replace the line above with:
```css
.grp-hdr{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);padding:10px 14px 3px;cursor:pointer;display:flex;align-items:center;gap:5px;user-select:none;}
.grp-hdr:hover{color:var(--text2);}
.grp-chevron{font-size:9px;transition:transform 0.2s ease;flex-shrink:0;}
.grp-block.collapsed .grp-chevron{transform:rotate(-90deg);}
.grp-items{max-height:2000px;overflow:hidden;transition:max-height 0.25s ease;}
.grp-block.collapsed .grp-items{max-height:0;}
```

- [ ] **Step 3: Verify visually**

Open `index.html` in Live Server. The sidebar group headers (e.g., "基礎流程", "SMT 製程") should look identical to before — no visual change yet since `.grp-items` and `.grp-block` don't exist in the DOM yet.

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "style: add accordion sidebar CSS

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 2: Add `initAccordion()` helper to `app.js`

**Files:**
- Modify: `app.js` (add helper function before `renderSidebar`)

- [ ] **Step 1: Find the insertion point**

In `app.js`, locate `function renderSidebar(` (around line 689). The helper will be inserted immediately before this function.

- [ ] **Step 2: Insert `initAccordion` function**

Insert this block immediately before `function renderSidebar(`:

```js
function initAccordion(grpBlock, storageKey) {
  const hdr = grpBlock.querySelector('.grp-hdr');
  const apply = (collapsed) => {
    grpBlock.classList.toggle('collapsed', collapsed);
    hdr.setAttribute('aria-expanded', String(!collapsed));
    localStorage.setItem(storageKey, collapsed ? '1' : '0');
  };
  apply(localStorage.getItem(storageKey) === '1');
  hdr.addEventListener('click', () => apply(!grpBlock.classList.contains('collapsed')));
  hdr.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hdr.click(); }
  });
}

```

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add initAccordion helper

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 3: Refactor `renderSidebar()` to use accordion DOM

**Files:**
- Modify: `app.js` — `renderSidebar()` function (lines ~689–712)

- [ ] **Step 1: Replace `renderSidebar` body**

Find and replace the entire `renderSidebar` function. The current function is:

```js
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
```

Replace it with:

```js
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
    grp.className = 'grp-block';
    grp.dataset.grp = g.group;
    grp.innerHTML = `<div class="grp-hdr" role="button" tabindex="0" aria-expanded="true"><span class="grp-chevron" aria-hidden="true">▾</span>${g.group}</div><div class="grp-items"></div>`;
    const itemsEl = grp.querySelector('.grp-items');
    items.forEach(flow => {
      const d = document.createElement('div');
      d.className = 'flow-item' + (curFlow?.id === flow.id ? ' active' : '');
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
```

- [ ] **Step 2: Verify in browser**

Open `index.html` in Live Server. Confirm:
- The Flows mode sidebar still lists all flow groups and items
- Each group header (e.g., "基礎流程") has a small `▾` chevron to its left
- Clicking a group header collapses/expands its items with a smooth animation
- Chevron rotates when collapsed
- Reloading the page, collapsed groups stay collapsed (localStorage persists)
- Typing in the search box shows filtered results — all groups are expanded during search
- Clicking a flow item still opens the sequence diagram correctly

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: accordion groups in Flows sidebar

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 4: Refactor `renderMsgList()` to use accordion DOM

**Files:**
- Modify: `app.js` — `renderMsgList()` function (lines ~644–687)

- [ ] **Step 1: Replace the `sortedMods.forEach` block inside `renderMsgList`**

Find this block inside `renderMsgList` (everything from `sortedMods.forEach` to the final `});`):

```js
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
```

Replace it with:

```js
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
      d.className = 'msg-item' + (curMsg === msg.key ? ' active' : '');
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
```

- [ ] **Step 2: Verify in browser**

Switch to Messages mode in the sidebar. Confirm:
- All module groups (Production, Materials, etc.) show with `▾` chevron
- Clicking a group header collapses/expands its messages
- Clicking a message item opens the detail panel correctly
- When a message is active (highlighted), its group stays expanded even after reload
- Searching filters results and all matching groups are expanded (no accordion during search)

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: accordion groups in Messages sidebar

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 5: Auto-expand active flow group in `selectFlow()`

**Files:**
- Modify: `app.js` — `selectFlow()` function (lines ~714–740)

**Why needed:** `selectFlow()` marks a `.flow-item` as active but does NOT re-render the sidebar. If the group was collapsed (from localStorage), the active item is hidden. This task ensures the active item's group is always expanded when a flow is selected.

- [ ] **Step 1: Find the insertion point inside `selectFlow`**

In `selectFlow()`, find these lines (near the end of the function, before `updateHash()`):

```js
  showViewBar('diagram');
  renderSeq(flow);
  updateHash();
```

- [ ] **Step 2: Insert auto-expand logic before `updateHash()`**

Insert between `renderSeq(flow);` and `updateHash();`:

```js
  const activeFlowItem = document.querySelector('.flow-item.active');
  if (activeFlowItem) {
    const grpBlock = activeFlowItem.closest('.grp-block');
    if (grpBlock) {
      grpBlock.classList.remove('collapsed');
      grpBlock.querySelector('.grp-hdr').setAttribute('aria-expanded', 'true');
      localStorage.setItem(`cfx-acc-flows-${grpBlock.dataset.grp}`, '0');
    }
  }
```

The full end of `selectFlow()` should now look like:

```js
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
```

- [ ] **Step 3: Verify URL hash restore**

1. Open the app, select a flow, note its URL hash (e.g., `#flows/equipment-setup`)
2. Collapse all sidebar groups using the chevrons
3. Reload the page — the URL hash should restore the flow AND auto-expand its group

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat: auto-expand active flow group on selectFlow

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 6: Final verification

- [ ] **Step 1: Full behaviour check (Flows mode)**

Open the app (Live Server or GitHub Pages):
1. ✅ All groups show `▾` chevron in the sidebar
2. ✅ Clicking a group header collapses it with animation; chevron rotates
3. ✅ Clicking again expands it
4. ✅ Reload — collapsed state is remembered
5. ✅ Clicking a flow item in a collapsed group is impossible (items are hidden); expanding works
6. ✅ Paste a URL with `#flows/<flow-id>` into the browser — the correct flow loads AND its group is expanded even if it was saved as collapsed
7. ✅ Search: type a term — all matching groups expand, accordion disabled during search
8. ✅ Clear search — accordion state restored from localStorage

- [ ] **Step 2: Full behaviour check (Messages mode)**

1. ✅ Switch to Messages mode — all module groups show `▾` chevron
2. ✅ Clicking a group header collapses/expands
3. ✅ Reload — state remembered
4. ✅ Click a message item — detail panel opens; if group was collapsed, it force-expands
5. ✅ Paste `#messages/CFX.Production.WorkOrderStarted` — message loads, its group is expanded
6. ✅ Search filters + all matching groups expanded

- [ ] **Step 3: Accessibility check**

1. ✅ Tab to a group header — it receives focus (blue outline)
2. ✅ Press Enter or Space — group collapses/expands
3. ✅ Screen reader (or browser accessibility tree) shows `aria-expanded="true/false"` on each header

- [ ] **Step 4: Push to remote**

```bash
git push origin master
```

Expected: GitHub Pages deploys the updated app automatically via the existing GitHub Actions workflow.
