# Accordion Sidebar Group Headers — Design Spec

**Date:** 2026-05-06  
**Status:** Approved  
**Scope:** Flows mode and Messages mode sidebar group headers become collapsible accordions

---

## Problem

The `#flow-list` sidebar in Flows mode contains 20+ flow items spread across multiple group headers (e.g., 基礎流程, SMT 製程). The Messages mode sidebar contains 20+ module groups (e.g., Production, Materials, Resource Performance). With no way to collapse groups, users must scroll extensively to find less-frequently used items.

---

## Solution Overview

Make each group header (`.grp-hdr`) in Flows and Messages mode clickable. Clicking toggles the group's items between expanded and collapsed via a JS class toggle. The collapse state persists in `localStorage` per group per mode. Groups that contain the currently-selected item are always force-expanded.

---

## Architecture

### Affected Functions

| Function | Location | Change |
|---|---|---|
| `renderSidebar()` | `app.js` (future: `js/flows.js`) | Wrap items in `.grp-items`, add chevron to `.grp-hdr` |
| `renderMsgList()` | `app.js` (future: `js/messages.js`) | Same pattern |
| New: `initAccordion(grpBlock, key)` | `app.js` (future: `js/utils.js`) | Attach click handler, read/write localStorage |

**Note:** This spec targets `app.js` directly (the module refactor plan is separate). The accordion feature should be implemented in `app.js` before or after the module split — the functions map 1:1 to their future module destinations.

---

## DOM Structure

### Before (current)

```html
<div>
  <div class="grp-hdr">基礎流程</div>
  <div class="flow-item active">...</div>
  <div class="flow-item">...</div>
</div>
```

### After

```html
<div class="grp-block" data-grp="基礎流程">
  <div class="grp-hdr" role="button" tabindex="0" aria-expanded="true">
    <span class="grp-chevron" aria-hidden="true">▾</span>
    基礎流程
  </div>
  <div class="grp-items">
    <div class="flow-item active">...</div>
    <div class="flow-item">...</div>
  </div>
</div>
```

The outer `<div class="grp-block">` replaces the anonymous wrapper div currently created by `renderSidebar()` and `renderMsgList()`.

---

## CSS Changes

Add to `styles.css`:

```css
/* ── Accordion sidebar ─────────────────────────── */
.grp-hdr {
  /* existing styles preserved; add: */
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  user-select: none;
}
.grp-hdr:hover { color: var(--text2); }
.grp-chevron {
  font-size: 9px;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}
.grp-block.collapsed .grp-chevron { transform: rotate(-90deg); }
.grp-items {
  max-height: 2000px;
  overflow: hidden;
  transition: max-height 0.25s ease;
}
.grp-block.collapsed .grp-items { max-height: 0; }
```

The `max-height` approach is used (not `height: auto`) because CSS transitions cannot animate to `auto`. The value `2000px` is large enough to contain any realistic group.

---

## JavaScript Logic

### localStorage Key Scheme

```
cfx-acc-flows-{groupLabel}    // e.g., "cfx-acc-flows-基礎流程"
cfx-acc-msgs-{modLabel}       // e.g., "cfx-acc-msgs-Production"
```

Values: `"1"` = collapsed, `"0"` or absent = expanded.

### `initAccordion(grpBlock, storageKey)`

```js
function initAccordion(grpBlock, storageKey) {
  const hdr = grpBlock.querySelector('.grp-hdr');
  const apply = (collapsed) => {
    grpBlock.classList.toggle('collapsed', collapsed);
    hdr.setAttribute('aria-expanded', String(!collapsed));
    localStorage.setItem(storageKey, collapsed ? '1' : '0');
  };
  // Restore saved state (default: expanded)
  apply(localStorage.getItem(storageKey) === '1');
  // Click handler
  hdr.addEventListener('click', () => {
    apply(!grpBlock.classList.contains('collapsed'));
  });
  // Keyboard: Enter / Space
  hdr.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      hdr.click();
    }
  });
}
```

### Auto-Expand Rule

After calling `initAccordion()`, check if the group contains an `.active` item. If yes, force-expand:

```js
if (grpBlock.querySelector('.flow-item.active, .msg-item.active')) {
  grpBlock.classList.remove('collapsed');
  hdr.setAttribute('aria-expanded', 'true');
  localStorage.setItem(storageKey, '0');
}
```

### Search Behaviour

When `renderSidebar(term)` or `renderMsgList(term)` is called with a non-empty search term, all rendered groups are force-expanded (no `initAccordion` persistence — the filtered view shows only matching groups, so collapsing them adds no value).

Implementation: pass the search term to the render function; when `term` is non-empty, skip calling `initAccordion` and leave the group expanded.

---

## renderSidebar Changes

```js
function renderSidebar(term = '') {
  const el = document.getElementById('flow-list');
  el.innerHTML = '';
  const t = term.toLowerCase();
  state.FLOWS.forEach(g => {
    const items = g.items.filter(f => /* existing filter */);
    if (!items.length) return;
    const grp = document.createElement('div');
    grp.className = 'grp-block';
    grp.dataset.grp = g.group;
    grp.innerHTML = `<div class="grp-hdr" role="button" tabindex="0" aria-expanded="true">
      <span class="grp-chevron" aria-hidden="true">▾</span>${g.group}
    </div>
    <div class="grp-items"></div>`;
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
      // Auto-expand if group has active item
      if (grp.querySelector('.flow-item.active')) {
        grp.classList.remove('collapsed');
        grp.querySelector('.grp-hdr').setAttribute('aria-expanded', 'true');
        localStorage.setItem(key, '0');
      }
    }
  });
}
```

`renderMsgList` follows the identical pattern with key prefix `cfx-acc-msgs-`.

---

## Accessibility

| Requirement | Implementation |
|---|---|
| `.grp-hdr` is keyboard focusable | `tabindex="0"` |
| Screen reader knows state | `aria-expanded="true/false"` |
| Keyboard activation | Enter and Space trigger click |
| Chevron is decorative | `aria-hidden="true"` on `.grp-chevron` |

---

## Out of Scope

- Machines, Scenarios, Guide modes (no group structure)
- "Collapse All" / "Expand All" button (not requested)
- Drag-to-reorder groups (not requested)
- Any animation other than `max-height` transition

---

## Files Changed

| File | Change |
|---|---|
| `app.js` | Modify `renderSidebar()`, `renderMsgList()`, add `initAccordion()` helper |
| `styles.css` | Add accordion CSS block (~12 lines) |

No new files required.
