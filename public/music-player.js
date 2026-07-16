(() => {
  if (window.__musicPlayerBooted) return;
  window.__musicPlayerBooted = true;

  function shouldBePlaying() {
    return localStorage.getItem('musicPlaying') === 'true';
  }

  function getAudio() {
    if (window.__siteMusicAudio) return window.__siteMusicAudio;

    const audio = document.getElementById('site-music');
    if (audio) window.__siteMusicAudio = audio;
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
    const audio = getAudio();
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
    const audio = getAudio();
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

  function initMusicToggle() {
    syncToggleUI();

    const audio = getAudio();
    if (!audio || !shouldBePlaying() || isCurrentlyPlaying(audio)) return;

    audio.play().catch(() => {});
  }

  document.addEventListener('change', (event) => {
    if (event.target?.id !== 'music-toggle') return;
    setMusicEnabled(event.target.checked);
  });

  document.addEventListener('astro:page-load', initMusicToggle);
  document.addEventListener('DOMContentLoaded', initMusicToggle);
})();
