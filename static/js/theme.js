'use strict';

// Runs synchronously in <head>, before CSS is applied — avoids a
// flash of the wrong theme on first paint.
(function () {
  const stored = localStorage.getItem('axiom-theme');
  const theme  = stored || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('axiom-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('axiom-theme', 'light');
    }
  });
});
