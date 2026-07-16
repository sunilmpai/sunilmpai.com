(() => {
  if (window.__fontToggleBooted) return;
  window.__fontToggleBooted = true;

  const KEY = 'fontPref';
  const ORDER = ['sans', 'serif', 'mono'];

  function readPref() {
    try {
      const saved = localStorage.getItem(KEY);
      return ORDER.includes(saved) ? saved : 'sans';
    } catch (_) {
      return 'sans';
    }
  }

  function applyPref(pref) {
    const html = document.documentElement;
    if (pref === 'sans') {
      html.removeAttribute('data-font');
    } else {
      html.setAttribute('data-font', pref);
    }

    const btn = document.getElementById('font-toggle');
    if (btn) {
      const labels = { sans: 'sans serif', serif: 'serif', mono: 'monospace' };
      btn.setAttribute('aria-label', 'Font: ' + labels[pref] + '. Click to change.');
    }
  }

  function sync() {
    applyPref(readPref());
  }

  document.addEventListener('click', (event) => {
    const btn = event.target.closest?.('#font-toggle');
    if (!btn) return;

    const next = ORDER[(ORDER.indexOf(readPref()) + 1) % ORDER.length];
    try {
      localStorage.setItem(KEY, next);
    } catch (_) {}
    applyPref(next);
  });

  document.addEventListener('astro:after-swap', sync);
  document.addEventListener('astro:page-load', sync);
  document.addEventListener('DOMContentLoaded', sync);
})();
