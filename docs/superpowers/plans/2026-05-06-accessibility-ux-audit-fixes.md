# Accessibility & UX Audit Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all 14 web-interface-guidelines audit findings across accessibility, focus, animation, dark mode, touch interaction, and URL state sync — with zero visible UI change.

**Architecture:** Surgical in-place edits to three files (`index.html`, `styles.css`, `app.js`). No new files, no new dependencies. SVG keyboard access via DOM post-processing after `innerHTML` insert. URL state uses `history.pushState`/`replaceState` + `popstate` listener with a `_restoringHash` guard flag.

**Tech Stack:** Vanilla HTML/CSS/JS ES module; GitHub Pages; VS Code Live Server for local verification.

---

## Files Modified

| File | Changes |
|---|---|
| `index.html` | Skip link, aria-hidden on icons, search aria-label/autocomplete, theme-color meta, aria-live region |
| `styles.css` | `.sr-only`, skip-link style, `color-scheme`, `#search` focus-visible, `touch-action`, `overscroll-behavior`, `prefers-reduced-motion` |
| `app.js` | SVG CSS-var colours, `makeSeqKeyboard()`, `.xbtn` aria-label, copy announcement, `updateThemeColorMeta()`, matchMedia listener, `updateHash()`, `restoreFromHash()`, `_restoringHash` flag |

---

## Task 1: HTML structural accessibility fixes

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add skip link and aria-live region**

In `index.html`, make these 5 changes:

**1a.** Add skip link as first child of `<body>` (before `<div id="sidebar">`):
```html
<a href="#main" class="skip-link">跳至主內容</a>
```

**1b.** Add `aria-hidden="true"` to all 5 decorative icon spans in `#mode-nav`:
```html
<span class="nav-item-icon" aria-hidden="true">⬡</span>
<span class="nav-item-icon" aria-hidden="true">≡</span>
<span class="nav-item-icon" aria-hidden="true">⚙</span>
<span class="nav-item-icon" aria-hidden="true">▶</span>
<span class="nav-item-icon" aria-hidden="true">🛠</span>
```

**1c.** Add `aria-hidden="true"` to the empty-state icon div (line 91):
```html
<div class="ico" aria-hidden="true">⬡</div>
```

**1d.** Add `aria-label`, `autocomplete`, and `name` to `#search` (line 28):
```html
<input id="search" aria-label="搜尋" autocomplete="off" name="search" placeholder="搜尋流程…">
```

**1e.** Add `theme-color` meta in `<head>` (after existing meta tags, before font links):
```html
<meta name="theme-color" id="theme-color-meta" content="#2d4f9e">
```

**1f.** Add aria-live region just before `</body>`:
```html
<div id="a11y-announce" class="sr-only" aria-live="polite" aria-atomic="true"></div>
```

- [ ] **Step 2: Verify HTML is valid**

Open `index.html` in VS Code. Confirm no red squiggles on the new elements.

- [ ] **Step 3: Commit**
```
git add index.html
git commit -m "a11y: add skip link, aria-hidden icons, search label, theme-color meta, aria-live region"
```

---

## Task 2: CSS accessibility and interaction fixes

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add `.sr-only` utility and skip-link styles**

Add at the top of `styles.css` (after the `:root` and `[data-theme="dark"]` blocks, before `*{...}`):
```css
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
.skip-link{position:fixed;top:-100%;left:8px;z-index:9999;background:var(--accent2);color:#fff;padding:6px 14px;border-radius:0 0 6px 6px;font-size:13px;font-weight:600;text-decoration:none;transition:top 0.15s;}
.skip-link:focus-visible{top:0;outline:2px solid var(--accent);outline-offset:2px;}
```

- [ ] **Step 2: Add `color-scheme` to `:root` and `[data-theme="dark"]`**

In the existing `:root` block, append `color-scheme: light;`:
```css
:root {
  --bg:#f8f9fb; /* ... all existing vars ... */
  color-scheme: light;
}
```
In the existing `[data-theme="dark"]` block, append `color-scheme: dark;`:
```css
[data-theme="dark"] {
  --bg:#161922; /* ... all existing vars ... */
  color-scheme: dark;
}
```

- [ ] **Step 3: Fix `#search` focus indicator**

Find the existing `#search:focus{border-color:var(--accent);}` rule and replace `outline:none` in the `#search` base rule with a proper focus-visible ring:

Current `#search` rule (line 26):
```css
#search{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:4px;color:var(--text);font-size:12px;padding:5px 9px;outline:none;}
#search:focus{border-color:var(--accent);}
```

Replace with:
```css
#search{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:4px;color:var(--text);font-size:12px;padding:5px 9px;outline:none;}
#search:focus{border-color:var(--accent);}
#search:focus-visible{outline:2px solid var(--accent);outline-offset:-2px;}
```

- [ ] **Step 4: Add `touch-action: manipulation` to interactive elements**

After the `.flow-item` block, add:
```css
button,.flow-item,.nav-item,.flow-card,.machine-item,.scenario-item,.list-step,.guide-toc-item{touch-action:manipulation;}
```

- [ ] **Step 5: Add `overscroll-behavior: contain` to modal overlay**

Find `.modal-overlay{...}` rule (line 33) and append `overscroll-behavior:contain;`:
```css
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(2px);overscroll-behavior:contain;}
```

- [ ] **Step 6: Add `prefers-reduced-motion` block**

At the very end of `styles.css`, append:
```css
/* ── Reduced motion ─────────────────────────────── */
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{transition-duration:0.01ms!important;animation-duration:0.01ms!important;}
  .modal-box{animation:none;}
  .skip-link{transition:none;}
}
```

- [ ] **Step 7: Verify in browser**

Open with Live Server. Press Tab from the page top — skip link should appear top-left. Check dark mode: scrollbar should update to dark style. Open modal and check no animation fires when `prefers-reduced-motion` is set in OS.

- [ ] **Step 8: Commit**
```
git add styles.css
git commit -m "a11y: sr-only, skip link, color-scheme, focus-visible, touch-action, overscroll, reduced-motion"
```

---

## Task 3: SVG sequence diagram dark mode colours

**Files:**
- Modify: `app.js` (function `renderSeq`, lines ~686–780)

- [ ] **Step 1: Fix arrowhead marker colour**

Find (line ~689):
```js
      <polygon points="0,0 10,3.5 0,7" fill="#454f6b"/>
```
Replace with:
```js
      <polygon points="0,0 10,3.5 0,7" style="fill:var(--text2)"/>
```

- [ ] **Step 2: Fix glow filter flood-color**

Find (line ~692):
```js
      <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#4f6db8" flood-opacity="0.65"/>
```
Replace with:
```js
      <feDropShadow dx="0" dy="0" stdDeviation="4" style="flood-color:var(--accent);flood-opacity:0.65"/>
```

- [ ] **Step 3: Fix top participant box colours**

Find (line ~701):
```js
    s += `<rect x="${x}" y="${TOP_PAD}" width="${BOX_W}" height="${BOX_H}" fill="white" stroke="#a0aabe" stroke-width="1.5"/>`;
    lines.forEach((ln, li) => {
      s += `<text x="${cx(i)}" y="${TOP_PAD + BOX_H / 2 + (li - (lines.length - 1) / 2) * 14}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="#1a2035">${ln}</text>`;
    });
```
Replace with:
```js
    s += `<rect x="${x}" y="${TOP_PAD}" width="${BOX_W}" height="${BOX_H}" style="fill:var(--bg2);stroke:var(--border2)" stroke-width="1.5"/>`;
    lines.forEach((ln, li) => {
      s += `<text x="${cx(i)}" y="${TOP_PAD + BOX_H / 2 + (li - (lines.length - 1) / 2) * 14}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" style="fill:var(--text)">${ln}</text>`;
    });
```

- [ ] **Step 4: Fix lifeline colour**

Find (line ~709):
```js
    s += `<line x1="${cx(i)}" y1="${TOP_PAD + BOX_H}" x2="${cx(i)}" y2="${BOT_Y}" stroke="#4f6db8" stroke-width="1" opacity="0.3"/>`;
```
Replace with:
```js
    s += `<line x1="${cx(i)}" y1="${TOP_PAD + BOX_H}" x2="${cx(i)}" y2="${BOT_Y}" style="stroke:var(--accent)" stroke-width="1" opacity="0.3"/>`;
```

- [ ] **Step 5: Fix frame colours**

Find (lines ~718–721):
```js
      s += `<rect x="${PAD}" y="${sy}" width="${TOTAL_W - PAD * 2}" height="${fh}" fill="none" stroke="#a0aabe" stroke-width="1.5" stroke-dasharray="6,3"/>`;
      s += `<rect x="${PAD}" y="${sy}" width="28" height="14" fill="#2d4f9e"/>`;
      s += `<text x="${PAD + 14}" y="${sy + 7}" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="700" fill="white">${fr.label}</text>`;
      s += `<text x="${PAD + 36}" y="${sy + 7}" dominant-baseline="central" font-size="9" fill="#454f6b" font-style="italic">[${fr.cond}]</text>`;
```
Replace with:
```js
      s += `<rect x="${PAD}" y="${sy}" width="${TOTAL_W - PAD * 2}" height="${fh}" fill="none" style="stroke:var(--border2)" stroke-width="1.5" stroke-dasharray="6,3"/>`;
      s += `<rect x="${PAD}" y="${sy}" width="28" height="14" style="fill:var(--accent2)"/>`;
      s += `<text x="${PAD + 14}" y="${sy + 7}" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="700" fill="white">${fr.label}</text>`;
      s += `<text x="${PAD + 36}" y="${sy + 7}" dominant-baseline="central" font-size="9" style="fill:var(--text2)" font-style="italic">[${fr.cond}]</text>`;
```

- [ ] **Step 6: Fix arrow and note colours**

Find the `col` variable and arrow lines (~733–746):
```js
    const col = step.raw ? '#a0aabe' : '#454f6b';
    ...
    s += `<text x="${midX}" y="${y - 20}" text-anchor="middle" font-size="9" fill="#8898b0" font-style="italic">${step.note}</text>`;
    ...
    s += `<line x1="${ax1}" y1="${y}" x2="${ax2}" y2="${y}" stroke="${col}" stroke-width="1.2" ${dash} marker-end="url(#ah)"/>`;
    if (!goRight) {
      s += `<polygon points="${x2 + 1},${y - 4} ${x2 + 9},${y} ${x2 + 1},${y + 4}" fill="${col}"/>`;
    }
```
Replace with:
```js
    const col = step.raw ? 'var(--border2)' : 'var(--text2)';
    ...
    s += `<text x="${midX}" y="${y - 20}" text-anchor="middle" font-size="9" style="fill:var(--text3)" font-style="italic">${step.note}</text>`;
    ...
    s += `<line x1="${ax1}" y1="${y}" x2="${ax2}" y2="${y}" style="stroke:${col}" stroke-width="1.2" ${dash} marker-end="url(#ah)"/>`;
    if (!goRight) {
      s += `<polygon points="${x2 + 1},${y - 4} ${x2 + 9},${y} ${x2 + 1},${y + 4}" style="fill:${col}"/>`;
    }
```

- [ ] **Step 7: Fix message label rect and text colours**

Find the clickable message label block (~762–765):
```js
    s += `<g style="cursor:${spec ? 'pointer' : 'default'}"${dataMsgAttr}${glowAttr}>
      <rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="3" fill="${isAct ? '#4f6db8' : 'white'}" stroke="${isAct ? '#2d4f9e' : spec ? '#b0b8cc' : '#c8cedc'}" stroke-width="${isAct ? 2 : 1}"/>
      <text x="${lx + lw / 2}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${fsize}" font-weight="${isAct ? '700' : '600'}" fill="${isAct ? '#ffffff' : step.raw ? '#8898b0' : spec ? '#1a2035' : '#8898b0'}">${step.msg}</text>
    </g>`;
```
Replace with:
```js
    s += `<g style="cursor:${spec ? 'pointer' : 'default'}"${dataMsgAttr}${glowAttr}>
      <rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="3" style="fill:${isAct ? 'var(--accent)' : 'var(--bg2)'};stroke:${isAct ? 'var(--accent2)' : spec ? 'var(--border2)' : 'var(--border)'}" stroke-width="${isAct ? 2 : 1}"/>
      <text x="${lx + lw / 2}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${fsize}" font-weight="${isAct ? '700' : '600'}" style="fill:${isAct ? '#ffffff' : step.raw ? 'var(--text3)' : spec ? 'var(--text)' : 'var(--text3)'}">${step.msg}</text>
    </g>`;
```

- [ ] **Step 8: Fix bottom participant box colours**

Find (lines ~773–776):
```js
    s += `<rect x="${x}" y="${BOT_Y}" width="${BOX_W}" height="${BOX_H}" fill="white" stroke="#a0aabe" stroke-width="1.5"/>`;
    lines.forEach((ln, li) => {
      s += `<text x="${cx(i)}" y="${BOT_Y + BOX_H / 2 + (li - (lines.length - 1) / 2) * 14}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="#1a2035">${ln}</text>`;
    });
```
Replace with:
```js
    s += `<rect x="${x}" y="${BOT_Y}" width="${BOX_W}" height="${BOX_H}" style="fill:var(--bg2);stroke:var(--border2)" stroke-width="1.5"/>`;
    lines.forEach((ln, li) => {
      s += `<text x="${cx(i)}" y="${BOT_Y + BOX_H / 2 + (li - (lines.length - 1) / 2) * 14}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" style="fill:var(--text)">${ln}</text>`;
    });
```

- [ ] **Step 9: Verify dark mode SVG rendering**

Open in browser → select any flow → toggle dark mode. Participant boxes should show dark background with light text. Message labels should have dark background. Lifelines should be visible in dark mode.

- [ ] **Step 10: Commit**
```
git add app.js
git commit -m "fix: SVG sequence diagram uses CSS custom properties for dark mode support"
```

---

## Task 4: SVG keyboard accessibility + aria fixes

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add `makeSeqKeyboard()` function**

After `renderSeq()` function (around line 780, before `function renderListView`), add:
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

- [ ] **Step 2: Call `makeSeqKeyboard()` after every `seqc.innerHTML` assignment**

In `renderSeq()`, find the line where `s` is assigned to `seqc.innerHTML` (the last few lines of `renderSeq`). After the assignment, call `makeSeqKeyboard()`:

Find:
```js
  document.getElementById('seqc').innerHTML = s;
```
Replace with:
```js
  document.getElementById('seqc').innerHTML = s;
  makeSeqKeyboard();
```

- [ ] **Step 3: Add `aria-label` to `.xbtn` close button**

In `selectMsg()`, find (line ~834):
```js
      <button class="xbtn">✕</button>
```
Replace with:
```js
      <button class="xbtn" aria-label="關閉詳細面板">✕</button>
```

- [ ] **Step 4: Add copy announcement to aria-live region**

In `setupListeners()`, find the copy success block (line ~77):
```js
        copyBtn.textContent = '已複製！';
        copyBtn.classList.add('copied');
```
After those two lines, add:
```js
        const ann = document.getElementById('a11y-announce');
        if (ann) ann.textContent = '已複製到剪貼板';
```

- [ ] **Step 5: Verify keyboard navigation**

Open in browser → select a flow → press Tab to move focus into the SVG → press Enter on a highlighted message label → detail panel should open. Check that `aria-label` on `.xbtn` is present in DevTools → Elements.

- [ ] **Step 6: Commit**
```
git add app.js
git commit -m "a11y: SVG keyboard navigation, xbtn aria-label, copy announcement aria-live"
```

---

## Task 5: Theme-color meta + matchMedia live listener

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add `updateThemeColorMeta()` helper**

After `toggleTheme()` function (around line 103), add:
```js
function updateThemeColorMeta(dark) {
  const meta = document.getElementById('theme-color-meta');
  if (meta) meta.content = dark ? '#161922' : '#2d4f9e';
}
```

- [ ] **Step 2: Call `updateThemeColorMeta` in `initTheme()`**

Find `initTheme()` (line 90):
```js
function initTheme() {
  const saved = localStorage.getItem('cfx-theme');
  const prefersDark = !saved && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = saved === 'dark' || prefersDark;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.getElementById('theme-toggle').textContent = dark ? '☾' : '☀';
}
```
Replace with:
```js
function initTheme() {
  const saved = localStorage.getItem('cfx-theme');
  const prefersDark = !saved && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = saved === 'dark' || prefersDark;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.getElementById('theme-toggle').textContent = dark ? '☾' : '☀';
  updateThemeColorMeta(dark);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('cfx-theme')) {
      const d = e.matches;
      document.documentElement.dataset.theme = d ? 'dark' : 'light';
      document.getElementById('theme-toggle').textContent = d ? '☾' : '☀';
      updateThemeColorMeta(d);
    }
  });
}
```

- [ ] **Step 3: Call `updateThemeColorMeta` in `toggleTheme()`**

Find `toggleTheme()` (line 98):
```js
function toggleTheme() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'light' : 'dark';
  localStorage.setItem('cfx-theme', isDark ? 'light' : 'dark');
  document.getElementById('theme-toggle').textContent = isDark ? '☀' : '☾';
}
```
Replace with:
```js
function toggleTheme() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'light' : 'dark';
  localStorage.setItem('cfx-theme', isDark ? 'light' : 'dark');
  document.getElementById('theme-toggle').textContent = isDark ? '☀' : '☾';
  updateThemeColorMeta(!isDark);
}
```

- [ ] **Step 4: Verify**

Open in browser. In DevTools → Elements → `<head>`, find the `theme-color` meta. Toggle dark mode; the `content` attribute value should change between `#161922` and `#2d4f9e`.

- [ ] **Step 5: Commit**
```
git add app.js
git commit -m "feat: theme-color meta updates on theme switch; auto-follow OS theme changes"
```

---

## Task 6: URL hash state sync

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add `_restoringHash` flag and `updateHash()` helper**

After the module-level state variables at the top of `app.js` (after line 2):
```js
let _restoringHash = false;

function updateHash(mode, flowId, msgName) {
  let h = '#' + mode;
  if (flowId)  h += '/' + encodeURIComponent(flowId);
  if (msgName) h += '/' + encodeURIComponent(msgName);
  history.pushState(null, '', h);
}
```

- [ ] **Step 2: Update hash in `setMode()`**

In `setMode()` (line 165), add `history.replaceState` call as the second line of the function body:
```js
function setMode(mode, btn) {
  curMode = mode;
  if (!_restoringHash) history.replaceState(null, '', '#' + mode);
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  // ... rest unchanged
```

- [ ] **Step 3: Update hash in `selectFlow()`**

In `selectFlow()` (line 628), add hash update after `curFlow = flow;`:
```js
function selectFlow(flow) {
  curFlow = flow;
  curMsg = null;
  if (!_restoringHash) history.pushState(null, '', '#flows/' + encodeURIComponent(flow.id));
  // ... rest unchanged
```

- [ ] **Step 4: Update hash in `selectMsg()`**

In `selectMsg()` (line 794), add hash updates in both the deselect branch and the select branch:

In the deselect branch (when `curMsg === msgName`, before `return`):
```js
  if (curMsg === msgName) {
    curMsg = null;
    if (!_restoringHash) {
      if (curMode === 'flows' && curFlow) history.pushState(null, '', '#flows/' + encodeURIComponent(curFlow.id));
      else if (curMode === 'messages') history.replaceState(null, '', '#messages');
    }
    // ... rest of deselect unchanged
    return;
  }
```

In the select branch (after `curMsg = msgName;`):
```js
  curMsg = msgName;
  if (!_restoringHash) {
    if (curMode === 'flows' && curFlow) updateHash('flows', curFlow.id, msgName);
    else if (curMode === 'messages') updateHash('messages', null, msgName);
  }
  // ... rest unchanged
```

- [ ] **Step 5: Add `restoreFromHash()` function**

After `setMode()` function, add:
```js
function restoreFromHash() {
  const raw = location.hash.slice(1);
  if (!raw) return;
  const segs = raw.split('/').map(decodeURIComponent);
  const mode = segs[0];
  const seg1 = segs[1];
  const seg2 = segs[2];
  const btn = document.querySelector(`.nav-item[data-mode="${mode}"]`);
  if (!btn) return;
  _restoringHash = true;
  try {
    setMode(mode, btn);
    if (mode === 'flows' && seg1) {
      const allFlows = FLOWS.flatMap(g => g.items);
      const flow = allFlows.find(f => f.id === seg1);
      if (flow) { selectFlow(flow); if (seg2) selectMsg(seg2); }
    } else if (mode === 'messages' && seg1) {
      selectMsg(seg1);
    }
  } finally {
    _restoringHash = false;
  }
}
```

- [ ] **Step 6: Wire up `popstate` listener and initial restore in `init()`**

In `init()`, after `setupListeners(); renderSidebar();` add:
```js
  window.addEventListener('popstate', restoreFromHash);
  restoreFromHash();
```

Full updated end of `init()`:
```js
  setupListeners();
  renderSidebar();
  window.addEventListener('popstate', restoreFromHash);
  restoreFromHash();
```

- [ ] **Step 7: Verify URL sync**

Open in browser:
1. Select a flow → URL should update to `#flows/flow-id`
2. Click a message → URL should update to `#flows/flow-id/CFX.MessageName`
3. Press browser back → message panel should close, URL reverts to `#flows/flow-id`
4. Press back again → empty flows state, URL becomes `#flows`
5. Copy URL with `#flows/endpoint-connected` → open in new tab → that flow should auto-select
6. Copy URL with `#flows/endpoint-connected/CFX.EndpointConnected` → open in new tab → flow + message detail both open

- [ ] **Step 8: Commit**
```
git add app.js
git commit -m "feat: URL hash state sync for mode, flow, and message — enables deep-links and back/forward"
```

---

## Task 7: Push all fixes to GitHub Pages

- [ ] **Step 1: Push all commits**
```
$token = gh auth token
git remote set-url origin "https://$token@github.com/FrankLuPcEng/cfx2-reference.git"
git push origin master
```

- [ ] **Step 2: Verify on GitHub Pages**

Open `https://franklupceng.github.io/cfx2-reference/` in browser. Run through the verification checklist:
- [ ] Tab key shows skip link top-left
- [ ] Dark mode: toggle via ☀/☾ button — SVG participant boxes match dark bg
- [ ] Select a flow, click a message — URL updates in address bar
- [ ] Browser back button works
- [ ] Open `https://franklupceng.github.io/cfx2-reference/#flows/conn` directly — `conn` flow auto-selects

---

## Self-Review Checklist

- [x] Spec §1 HTML → Task 1 ✓
- [x] Spec §2 CSS → Task 2 ✓
- [x] Spec §3.1 SVG dark mode → Task 3 ✓
- [x] Spec §3.2 SVG keyboard → Task 4 Step 1-2 ✓
- [x] Spec §3.3 xbtn aria-label → Task 4 Step 3 ✓
- [x] Spec §3.4 copy announcement → Task 4 Step 4 ✓
- [x] Spec §3.5 theme-color meta → Task 5 ✓
- [x] Spec §3.6 matchMedia listener → Task 5 Step 2 ✓
- [x] Spec §4 URL hash sync → Task 6 ✓
- [x] No TBDs or placeholders
- [x] `makeSeqKeyboard` name consistent throughout
- [x] `_restoringHash` flag used in all 3 write-hash locations
- [x] `updateHash()` helper used consistently
