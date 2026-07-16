(() => {
  if (window.__musicPlayerBooted) return;
  window.__musicPlayerBooted = true;

  localStorage.removeItem('musicPlaying');

  function getAudio() {
    return document.getElementById('site-music');
  }

  function shouldBePlaying() {
    return window.__musicEnabled === true;
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

  function keepMusicContinuous() {
    const audio = getAudio();
    if (!audio || !shouldBePlaying()) return;
    if (isCurrentlyPlaying(audio)) return;

    audio.play().catch(() => {});
  }

  async function playMusic() {
    const audio = getAudio();
    if (!audio) return;

    if (!isCurrentlyPlaying(audio)) {
      try {
        await audio.play();
      } catch (_) {
        window.__musicEnabled = false;
        syncToggleUI();
        return;
      }
    }

    window.__musicEnabled = true;
    syncToggleUI();
  }

  function pauseMusic() {
    const audio = getAudio();
    audio?.pause();
    window.__musicEnabled = false;
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

  document.addEventListener('astro:after-swap', keepMusicContinuous);
  document.addEventListener('astro:page-load', syncToggleUI);
  document.addEventListener('DOMContentLoaded', syncToggleUI);
})();
