document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('#theme-toggle');
    if (!toggle) return;
  
    // 👇 NEW: Reapply theme on load
    const isDark =
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
  
    if (isDark) {
      document.body.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.body.classList.remove('dark');
      localStorage.theme = 'light';
    }
  
    toggle.checked = isDark;
  
    toggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.body.classList.add('dark');
        localStorage.theme = 'dark';
      } else {
        document.body.classList.remove('dark');
        localStorage.theme = 'light';
      }
    });
  });
  