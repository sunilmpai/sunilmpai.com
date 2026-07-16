(() => {
  if (window.__musicPlayerBooted) return;
  window.__musicPlayerBooted = true;

  const VIDEO_ID = 'O4Q8EudQWRo';

  function shouldBePlaying() {
    return localStorage.getItem('musicPlaying') === 'true';
  }

  function getPlayer() {
    return window.__ytMusicPlayer ?? null;
  }

  function loadYouTubeAPI() {
    if (window.YT?.Player) return Promise.resolve();

    window.__ytApiLoading ??= new Promise((resolve) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        resolve();
      };

      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
    });

    return window.__ytApiLoading;
  }

  function syncToggleUI() {
    const checkbox = document.getElementById('music-toggle');
    if (!checkbox) return;

    const playing = shouldBePlaying();
    checkbox.checked = playing;
    checkbox.setAttribute('aria-pressed', playing ? 'true' : 'false');
  }

  function isCurrentlyPlaying(player) {
    if (!player?.getPlayerState) return false;
    const state = player.getPlayerState();
    return state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING;
  }

  function createPlayer() {
    const existing = getPlayer();
    if (existing) return existing;

    const target = document.getElementById('youtube-player');
    if (!target) return null;

    const iframe = target.tagName === 'IFRAME' ? target : target.querySelector('iframe');
    if (iframe && window.YT?.Player) {
      window.__ytMusicPlayer = new YT.Player(iframe);
      return window.__ytMusicPlayer;
    }

    window.__ytMusicPlayer = new YT.Player('youtube-player', {
      height: '0',
      width: '0',
      videoId: VIDEO_ID,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        loop: 1,
        playlist: VIDEO_ID,
        rel: 0,
        iv_load_policy: 3,
      },
      events: {
        onReady: (event) => {
          if (shouldBePlaying() && !isCurrentlyPlaying(event.target)) {
            event.target.playVideo();
          }
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.ENDED) {
            event.target.playVideo();
          }
        },
      },
    });

    return window.__ytMusicPlayer;
  }

  async function playMusic() {
    await loadYouTubeAPI();
    const player = createPlayer();
    if (!player) return;

    if (!isCurrentlyPlaying(player)) {
      player.playVideo?.();
    }

    localStorage.setItem('musicPlaying', 'true');
    syncToggleUI();
  }

  function pauseMusic() {
    const player = getPlayer();
    player?.pauseVideo?.();
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

    if (!shouldBePlaying() || getPlayer()) return;

    loadYouTubeAPI().then(createPlayer);
  }

  document.addEventListener('change', (event) => {
    if (event.target?.id !== 'music-toggle') return;
    setMusicEnabled(event.target.checked);
  });

  document.addEventListener('astro:page-load', initMusicToggle);
  document.addEventListener('DOMContentLoaded', initMusicToggle);
})();
