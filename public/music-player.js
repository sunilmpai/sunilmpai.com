(() => {
  if (window.__musicPlayerBooted) return;
  window.__musicPlayerBooted = true;

  const ENABLED_KEY = 'musicEnabled';
  const TIME_KEY = 'musicTime';
  const SRC = '/away-with-the-fairies.mp3';

  function readEnabled() {
    try {
      return sessionStorage.getItem(ENABLED_KEY) === 'true';
    } catch (_) {
      return false;
    }
  }

  function writeEnabled(enabled) {
    window.__musicEnabled = enabled;
    try {
      if (enabled) {
        sessionStorage.setItem(ENABLED_KEY, 'true');
      } else {
        sessionStorage.removeItem(ENABLED_KEY);
        sessionStorage.removeItem(TIME_KEY);
      }
    } catch (_) {}
  }

  function isMusicEnabled() {
    if (window.__musicEnabled !== undefined) {
      return window.__musicEnabled === true;
    }
    return readEnabled();
  }

  function saveTime() {
    const audio = window.__siteAudio;
    if (!audio || audio.paused) return;
    try {
      sessionStorage.setItem(TIME_KEY, String(audio.currentTime));
    } catch (_) {}
  }

  function restoreTime() {
    const audio = ensureAudio();
    try {
      const saved = parseFloat(sessionStorage.getItem(TIME_KEY) || '0');
      if (Number.isFinite(saved) && saved > 0) {
        audio.currentTime = saved;
      }
    } catch (_) {}
  }

  function ensureAudio() {
    if (window.__siteAudio) {
      if (!window.__siteAudio.isConnected) {
        document.documentElement.appendChild(window.__siteAudio);
      }
      return window.__siteAudio;
    }

    let audio = document.getElementById('site-music');
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = 'site-music';
      audio.src = SRC;
      audio.loop = true;
      audio.preload = 'auto';
      audio.setAttribute('playsinline', '');
    }

    if (!audio.isConnected) {
      document.documentElement.appendChild(audio);
    }

    window.__siteAudio = audio;
    return audio;
  }

  function syncToggleUI() {
    const checkbox = document.getElementById('music-toggle');
    if (!checkbox) return;

    const playing = isMusicEnabled();
    checkbox.checked = playing;
    checkbox.setAttribute('aria-pressed', playing ? 'true' : 'false');
  }

  function isCurrentlyPlaying(audio) {
    return Boolean(audio && !audio.paused && !audio.ended);
  }

  async function resumeMusic() {
    if (!isMusicEnabled()) return;

    const audio = ensureAudio();
    if (isCurrentlyPlaying(audio)) return;

    try {
      await audio.play();
    } catch (_) {
      // Keep enabled; a later user gesture can resume playback.
    }
  }

  async function playMusic() {
    const audio = ensureAudio();

    if (!isCurrentlyPlaying(audio)) {
      try {
        await audio.play();
      } catch (_) {
        writeEnabled(false);
        syncToggleUI();
        return;
      }
    }

    writeEnabled(true);
    syncToggleUI();
  }

  function pauseMusic() {
    ensureAudio().pause();
    writeEnabled(false);
    syncToggleUI();
  }

  async function setMusicEnabled(enabled) {
    if (enabled) {
      await playMusic();
      return;
    }
    pauseMusic();
  }

  function handleNavigation() {
    syncToggleUI();
    restoreTime();
    void resumeMusic();
  }

  document.addEventListener('change', (event) => {
    if (event.target?.id !== 'music-toggle') return;
    setMusicEnabled(event.target.checked);
  });

  document.addEventListener(
    'click',
    (event) => {
      const link = event.target.closest('a[href]');
      if (!link || !isMusicEnabled()) return;

      const href = link.getAttribute('href') || '';
      if (!href.startsWith('/') || href.startsWith('//')) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;

      saveTime();
      void ensureAudio().play().catch(() => {});
    },
    true
  );

  document.addEventListener('pointerdown', () => {
    if (!isMusicEnabled()) return;
    const audio = ensureAudio();
    if (!audio.paused) return;
    restoreTime();
    void audio.play().catch(() => {});
  }, true);

  document.addEventListener('astro:before-swap', () => {
    saveTime();
    void resumeMusic();
  });

  document.addEventListener('astro:after-swap', handleNavigation);
  document.addEventListener('astro:page-load', handleNavigation);

  window.addEventListener('pageshow', handleNavigation);
  window.addEventListener('beforeunload', saveTime);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      restoreTime();
      void resumeMusic();
    }
  });

  function init() {
    if (readEnabled()) {
      window.__musicEnabled = true;
      restoreTime();
    }
    syncToggleUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
