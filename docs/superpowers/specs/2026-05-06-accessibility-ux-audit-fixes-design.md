# Accessibility & UX Audit Fixes — Design Spec

**Date:** 2026-05-06  
**Approach:** Option A — Surgical in-place fixes  
**Files affected:** `index.html`, `styles.css`, `app.js`

---

## Problem

A web-design-guidelines audit of the CFX 2.0 Reference site identified 14 compliance failures across accessibility, focus states, animation, dark mode, touch, and navigation. All must be resolved without changing the visible UI design or breaking existing behaviour.

---

## Section 1 — HTML (`index.html`)

### 1.1 Skip link
Add as first child of `<body>`:
```html
<a href="#main" class="skip-link">跳至主內容</a>
```
Styled visually-hidden until focused (see CSS section).

### 1.2 `aria-hidden` on decorative icons
All `<span class="nav-item-icon">` elements and the `<div class="ico">` in the empty-state are purely decorative. Add `aria-hidden="true"` to each.

### 1.3 Search input label
Add `aria-label="搜尋"`, `autocomplete="off"`, `name="search"` to `#search`:
```html
<input id="search" aria-label="搜尋" autocomplete="off" name="search" placeholder="搜尋流程…">
```

### 1.4 Theme-color meta tag
Add to `<head>`:
```html
<meta name="theme-color" id="theme-color-meta" content="#2d4f9e">
```
JS updates `content` on every theme switch (dark: `#161922`, light: `#2d4f9e`).

### 1.5 Aria-live region for copy announcements
Add before `</body>`:
```html
<div id="a11y-announce" class="sr-only" aria-live="polite" aria-atomic="true"></div>
```

---

## Section 2 — CSS (`styles.css`)

### 2.1 Skip link + screen-reader utility
```css
.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
.skip-link { position:fixed; top:-100%; left:8px; z-index:9999; background:var(--accent2); color:#fff; padding:6px 14px; border-radius:0 0 6px 6px; font-size:13px; font-weight:600; text-decoration:none; transition:top 0.15s; }
.skip-link:focus-visible { top:0; outline:2px solid var(--accent); outline-offset:2px; }
```

### 2.2 `color-scheme`
```css
:root { color-scheme: light; }
[data-theme="dark"] { color-scheme: dark; }
```
Makes browser chrome (scrollbars, native `<input>` backgrounds, `<select>`) adapt to current theme.

### 2.3 `#search` focus-visible ring
Remove `outline:none` from `#search`, add:
```css
#search:focus { border-color: var(--accent); }
#search:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
```

### 2.4 `touch-action: manipulation`
Add to a single combined selector covering all interactive elements:
```css
button, .flow-item, .nav-item, .flow-card, .machine-item, .scenario-item, .list-step, .guide-toc-item { touch-action: manipulation; }
```

### 2.5 `overscroll-behavior: contain` on modal
```css
.modal-overlay { overscroll-behavior: contain; }
```

### 2.6 `prefers-reduced-motion`
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
  .modal-box { animation: none; }
}
```

---

## Section 3 — JS (`app.js`)

### 3.1 SVG dark mode colours
In `renderSeq()`, replace hardcoded hex `fill`/`stroke` attributes with `style="fill:var(--X)"` equivalents so the inline SVG inherits the document's CSS custom properties:

| Old value | New value |
|---|---|
| `fill="white"` (participant boxes, msg rects) | `style="fill:var(--bg2)"` |
| `fill="#1a2035"` (participant text) | `style="fill:var(--text)"` |
| `fill="#454f6b"` (arrow colour variable `col`) | Use CSS var lookup at render: `getComputedStyle(document.documentElement).getPropertyValue('--text2').trim()` |
| `stroke="#a0aabe"` (participant box borders) | `stroke="var(--border2)"` via `style` attr |
| `stroke="#4f6db8"` (lifelines) | `style="stroke:var(--accent)"` |
| `fill="#2d4f9e"` (frame label bg) | `style="fill:var(--accent2)"` |
| `fill="white"` in `fill="white"` (frame label text bg) → `fill="white"` on `<text>` already colour-safe |
| `fill="#8898b0"` (note text, raw/inactive msg text) | `style="fill:var(--text3)"` |

For SVG attributes that don't support `var()` directly (e.g. `stroke` on `<line>` as attribute), use `style="stroke:var(--X)"` inline style instead.

### 3.2 SVG keyboard accessibility
After every `seqc.innerHTML = svgStr` assignment, call `makeSeqKeyboard()`:

```js
function makeSeqKeyboard() {
  document.querySelectorAll('#seqc [data-msg]').forEach(g => {
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', `查看 ${g.dataset.msg} 規格`);
    g.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectMsg(g.dataset.msg);
      }
    });
  });
}
```

### 3.3 `.xbtn` aria-label
In `renderDetail()` (wherever `.xbtn` is generated), add `aria-label="關閉詳細面板"` to the button element string.

### 3.4 Copy confirmation announcement
In the copy click handler, after `copyBtn.textContent = '已複製！'`:
```js
const ann = document.getElementById('a11y-announce');
if (ann) ann.textContent = '已複製到剪貼板';
```

### 3.5 Theme-color meta update
Add helper called from `initTheme()` and `toggleTheme()`:
```js
function updateThemeColorMeta(dark) {
  const meta = document.getElementById('theme-color-meta');
  if (meta) meta.content = dark ? '#161922' : '#2d4f9e';
}
```

### 3.6 matchMedia live listener
In `initTheme()`, after applying saved/initial theme:
```js
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem('cfx-theme')) {
    const dark = e.matches;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.getElementById('theme-toggle').textContent = dark ? '☾' : '☀';
    updateThemeColorMeta(dark);
  }
});
```

---

## Section 4 — URL Hash State Sync

### Hash format
```
#flows                                    — flows mode, no selection
#flows/{flow.id}                          — flow selected
#flows/{flow.id}/{encodedMsgName}         — flow + message detail open
#messages/{encodedMsgName}               — messages mode + message detail
#machines                                 — machines mode
#scenarios                                — scenarios mode
#guide                                    — guide mode
```

All segments URL-encoded with `encodeURIComponent` / decoded with `decodeURIComponent`.

### Write path
Three places update the hash:

1. `setMode(mode, btn)` → `history.replaceState(null, '', '#' + mode)` at start of function
2. `selectFlow(flow)` → `history.pushState(null, '', '#flows/' + encodeURIComponent(flow.id))`
3. `selectMsg(msgName)` → updates current hash to append or replace the message segment; uses `history.pushState`

Helper:
```js
function updateHash(mode, flowId, msgName) {
  let h = '#' + mode;
  if (flowId)  h += '/' + encodeURIComponent(flowId);
  if (msgName) h += '/' + encodeURIComponent(msgName);
  history.pushState(null, '', h);
}
```

### Read path
`restoreFromHash()` — called once after `init()` data load, and on `popstate`:

```js
function restoreFromHash() {
  const raw = location.hash.slice(1);
  if (!raw) return;
  const [mode, seg1, seg2] = raw.split('/').map(decodeURIComponent);
  const btn = document.querySelector(`.nav-item[data-mode="${mode}"]`);
  if (!btn) return;
  setMode(mode, btn);
  if (mode === 'flows' && seg1) {
    const allFlows = FLOWS.flatMap(g => g.items);
    const flow = allFlows.find(f => f.id === seg1);
    if (flow) { selectFlow(flow); if (seg2) selectMsg(seg2); }
  } else if (mode === 'messages' && seg1) {
    selectMsg(seg1);
  }
}
```

`setMode()` calls `history.replaceState` — does not trigger `popstate`.  
`popstate` fires only on browser back/forward.

---

## Success Criteria

- All 14 audit findings resolved with no visual change to existing UI
- Skip link appears on keyboard focus (Tab from page top)
- SVG message labels focusable and activatable via Enter/Space
- Dark mode: SVG sequence diagrams and participant boxes use correct dark colours
- Browser back/forward navigates between flow/message selections
- Direct link to `#flows/endpoint-connected` loads and selects that flow
- OS dark/light mode switch auto-applies when no manual theme override is set
- `@media (prefers-reduced-motion: reduce)` disables all CSS transitions/animations
- Copy confirmation announced to screen readers via aria-live region
