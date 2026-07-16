(() => {
  if (window.__musicPlayerBooted) return;
  window.__musicPlayerBooted = true;

  const STORAGE_KEY = 'musicEnabled';

  function isMusicEnabled() {
    if (window.__musicEnabled !== undefined) {
      return window.__musicEnabled === true;
    }
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch (_) {
      return false;
    }
  }

  function setMusicEnabledState(enabled) {
    window.__musicEnabled = enabled;
    try {
      if (enabled) {
        sessionStorage.setItem(STORAGE_KEY, 'true');
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch (_) {}
  }

  function getAudio() {
    if (!window.__siteAudio) {
      window.__siteAudio = new Audio('/away-with-the-fairies.mp3');
      window.__siteAudio.loop = true;
      window.__siteAudio.preload = 'auto';
    }
    return window.__siteAudio;
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

  function keepMusicContinuous() {
    if (!isMusicEnabled()) return;

    const audio = getAudio();
    if (isCurrentlyPlaying(audio)) return;

    audio.play().catch(() => {});
  }

  async function playMusic() {
    const audio = getAudio();

    if (!isCurrentlyPlaying(audio)) {
      try {
        await audio.play();
      } catch (_) {
        setMusicEnabledState(false);
        syncToggleUI();
        return;
      }
    }

    setMusicEnabledState(true);
    syncToggleUI();
  }

  function pauseMusic() {
    getAudio().pause();
    setMusicEnabledState(false);
    syncToggleUI();
  }

  async function setMusicEnabled(enabled) {
    if (enabled) {
      await playMusic();
      return;
    }
    pauseMusic();
  }

  document.addEventListener('change', (event) => {
    if (event.target?.id !== 'music-toggle') return;
    setMusicEnabled(event.target.checked);
  });

  document.addEventListener('astro:after-swap', () => {
    syncToggleUI();
    keepMusicContinuous();
  });

  document.addEventListener('astro:page-load', () => {
    syncToggleUI();
    keepMusicContinuous();
  });

  document.addEventListener('DOMContentLoaded', syncToggleUI);
})();
