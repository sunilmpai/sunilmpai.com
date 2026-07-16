(() => {
  const VIDEO_ID = 'O4Q8EudQWRo';

  let player = null;
  let apiLoading = null;

  function loadYouTubeAPI() {
    if (window.YT?.Player) return Promise.resolve();
    if (apiLoading) return apiLoading;

    apiLoading = new Promise((resolve) => {
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

    return apiLoading;
  }

  function setToggleState(playing) {
    const button = document.getElementById('music-toggle');
    if (!button) return;

    button.setAttribute('aria-pressed', playing ? 'true' : 'false');
    button.classList.toggle('is-playing', playing);
  }

  function shouldBePlaying() {
    return localStorage.getItem('musicPlaying') === 'true';
  }

  function createPlayer() {
    if (player || window.__ytMusicPlayer) {
      player = window.__ytMusicPlayer || player;
      return player;
    }

    const target = document.getElementById('youtube-player');
    if (!target) return null;

    player = new YT.Player('youtube-player', {
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
          if (shouldBePlaying()) {
            event.target.playVideo();
            setToggleState(true);
          }
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.ENDED) {
            event.target.playVideo();
          }
        },
      },
    });

    window.__ytMusicPlayer = player;
    return player;
  }

  async function playMusic() {
    await loadYouTubeAPI();
    createPlayer();
    player?.playVideo();
    localStorage.setItem('musicPlaying', 'true');
    setToggleState(true);
  }

  function pauseMusic() {
    player?.pauseVideo();
    localStorage.setItem('musicPlaying', 'false');
    setToggleState(false);
  }

  async function toggleMusic() {
    const button = document.getElementById('music-toggle');
    const isPlaying = button?.classList.contains('is-playing');

    if (isPlaying) {
      pauseMusic();
      return;
    }

    await playMusic();
  }

  function initMusicToggle() {
    setToggleState(shouldBePlaying());

    if (shouldBePlaying() && !player) {
      loadYouTubeAPI().then(createPlayer);
    }
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('#music-toggle');
    if (!button) return;
    toggleMusic();
  });

  document.addEventListener('astro:page-load', initMusicToggle);
  document.addEventListener('DOMContentLoaded', initMusicToggle);
})();
