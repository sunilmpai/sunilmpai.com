(() => {
  if (window.__musicPlayerBooted) return;
  window.__musicPlayerBooted = true;

  const TIME_KEY = 'musicCurrentTime';

  function shouldBePlaying() {
    return localStorage.getItem('musicPlaying') === 'true';
  }

  function ensureAudio() {
    if (window.__siteMusicAudio?.isConnected) {
      return window.__siteMusicAudio;
    }

    let audio = document.getElementById('site-music');
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = 'site-music';
      audio.loop = true;
      audio.preload = 'auto';
      audio.src = '/away-with-the-fairies.mp3';
      audio.setAttribute('playsinline', '');
      audio.style.cssText =
        'position:fixed;width:0;height:0;opacity:0;pointer-events:none;clip:rect(0,0,0,0);';
      document.documentElement.appendChild(audio);
    }

    window.__siteMusicAudio = audio;
    return audio;
  }

  function syncToggleUI() {
    const checkbox = document.getElementById('music-toggle');
    if (!checkbox) return;

    const playing = shouldBePlaying();
    checkbox.checked = playing;
    checkbox.setAttribute('aria-pressed', playing ? 'true' : 'false');
  }

  function isCurrentlyPlaying(audio) {
    return Boolean(audio && !audio.paused && !audio.ended);
  }

  async function playMusic() {
    const audio = ensureAudio();
    if (!audio) return;

    if (!isCurrentlyPlaying(audio)) {
      try {
        await audio.play();
      } catch (_) {
        localStorage.setItem('musicPlaying', 'false');
        syncToggleUI();
        return;
      }
    }

    localStorage.setItem('musicPlaying', 'true');
    syncToggleUI();
  }

  function pauseMusic() {
    const audio = ensureAudio();
    audio?.pause();
    localStorage.setItem('musicPlaying', 'false');
    syncToggleUI();
  }

  async function setMusicEnabled(enabled) {
    if (enabled) {
      await playMusic();
      return;
    }
    pauseMusic();
  }

  function restoreAfterFullReload() {
    if (!shouldBePlaying()) {
      syncToggleUI();
      return;
    }

    const audio = ensureAudio();
    const saved = parseFloat(sessionStorage.getItem(TIME_KEY) || '0');
    if (Number.isFinite(saved) && saved > 0) {
      audio.currentTime = saved;
    }

    if (audio.paused) {
      audio.play().catch(() => {});
    }

    syncToggleUI();
  }

  document.addEventListener('change', (event) => {
    if (event.target?.id !== 'music-toggle') return;
    setMusicEnabled(event.target.checked);
  });

  document.addEventListener('astro:page-load', syncToggleUI);

  window.addEventListener('beforeunload', () => {
    const audio = window.__siteMusicAudio;
    if (audio && shouldBePlaying() && !audio.paused) {
      sessionStorage.setItem(TIME_KEY, String(audio.currentTime));
    }
  });

  document.addEventListener('DOMContentLoaded', restoreAfterFullReload);
})();
