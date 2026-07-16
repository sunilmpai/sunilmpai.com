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

    const root = document.getElementById('music-player-root');
    if (!root) return null;

    let audio = root.querySelector('#site-music');
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = 'site-music';
      audio.loop = true;
      audio.preload = 'auto';
      audio.src = '/away-with-the-fairies.mp3';
      root.appendChild(audio);
    }

    window.__siteMusicAudio = audio;
    return audio;
  }

  function savePlaybackTime() {
    const audio = window.__siteMusicAudio;
    if (audio && shouldBePlaying() && !audio.paused) {
      sessionStorage.setItem(TIME_KEY, String(audio.currentTime));
    }
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

  function restorePlaybackTime(audio) {
    const saved = parseFloat(sessionStorage.getItem(TIME_KEY) || '0');
    if (!Number.isFinite(saved) || saved <= 0) return;

    if (audio.currentTime < saved - 0.25) {
      audio.currentTime = saved;
    }
  }

  async function playMusic() {
    const audio = ensureAudio();
    if (!audio) return;

    restorePlaybackTime(audio);

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
    savePlaybackTime();
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

  function resumeIfNeeded() {
    syncToggleUI();
    ensureAudio();

    if (!shouldBePlaying()) return;

    const audio = window.__siteMusicAudio;
    if (!audio) return;

    restorePlaybackTime(audio);

    if (audio.paused) {
      audio.play().catch(() => {});
    }
  }

  document.addEventListener('change', (event) => {
    if (event.target?.id !== 'music-toggle') return;
    setMusicEnabled(event.target.checked);
  });

  document.addEventListener('astro:before-swap', savePlaybackTime);

  document.addEventListener('astro:after-swap', () => {
    window.__siteMusicAudio = null;
    resumeIfNeeded();
  });

  document.addEventListener('astro:page-load', resumeIfNeeded);
  document.addEventListener('DOMContentLoaded', resumeIfNeeded);

  setInterval(savePlaybackTime, 1000);
})();
