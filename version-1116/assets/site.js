(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  const prev = document.querySelector('.hero-prev');
  const next = document.querySelector('.hero-next');
  let current = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, idx) {
      slide.classList.toggle('is-active', idx === current);
    });
    dots.forEach(function (dot, idx) {
      dot.classList.toggle('is-active', idx === current);
    });
  }

  function startCarousel() {
    if (slides.length <= 1) {
      return;
    }
    stopCarousel();
    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function stopCarousel() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.slide || 0));
        startCarousel();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startCarousel();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startCarousel();
      });
    }
    startCarousel();
  }

  const panels = Array.from(document.querySelectorAll('.search-panel'));

  panels.forEach(function (panel) {
    const input = panel.querySelector('.search-input');
    const year = panel.querySelector('.filter-year');
    const type = panel.querySelector('.filter-type');
    const section = panel.nextElementSibling;
    const scope = section || document;
    const items = Array.from(scope.querySelectorAll('.searchable-item'));

    function applyFilter() {
      const keyword = (input && input.value ? input.value : '').trim().toLowerCase();
      const selectedYear = year && year.value ? year.value : '';
      const selectedType = type && type.value ? type.value : '';

      items.forEach(function (item) {
        const text = item.dataset.search || '';
        const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        const matchYear = !selectedYear || item.dataset.year === selectedYear;
        const matchType = !selectedType || item.dataset.type === selectedType;
        item.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchType));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (year) {
      year.addEventListener('change', applyFilter);
    }
    if (type) {
      type.addEventListener('change', applyFilter);
    }
  });
})();

function setupMoviePlayer(streamUrl) {
  const video = document.getElementById('movie-player');
  const trigger = document.getElementById('play-trigger');
  let ready = false;
  let hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function loadStream() {
    if (ready) {
      return;
    }
    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function beginPlayback() {
    loadStream();
    if (trigger) {
      trigger.classList.add('is-hidden');
    }
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (trigger) {
    trigger.addEventListener('click', beginPlayback);
  }

  video.addEventListener('play', function () {
    if (trigger) {
      trigger.classList.add('is-hidden');
    }
  });

  video.addEventListener('click', function () {
    if (!ready) {
      beginPlayback();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
