export function initTheme() {
  const saved = localStorage.getItem('cfx-theme');
  const prefersDark = !saved && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = saved === 'dark' || prefersDark;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.getElementById('theme-toggle').textContent = dark ? '☾' : '☀';
  updateThemeColorMeta(dark);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('cfx-theme')) {
      document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
      document.getElementById('theme-toggle').textContent = e.matches ? '☾' : '☀';
      updateThemeColorMeta(e.matches);
    }
  });
}

export function toggleTheme() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'light' : 'dark';
  localStorage.setItem('cfx-theme', isDark ? 'light' : 'dark');
  document.getElementById('theme-toggle').textContent = isDark ? '☀' : '☾';
  updateThemeColorMeta(!isDark);
}

export function updateThemeColorMeta(isDark) {
  const meta = document.getElementById('theme-color-meta');
  if (meta) meta.content = isDark ? '#1f2335' : '#2d4f9e';
}
