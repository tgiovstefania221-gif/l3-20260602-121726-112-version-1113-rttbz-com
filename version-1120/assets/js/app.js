(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupBackTop();
    setupPlayers();
  });

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-index]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-index')) || 0);
        start();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    var input = document.querySelector('[data-filter-input]');
    var grid = document.querySelector('[data-filter-grid]');
    if (!input || !grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
    var yearSelect = document.querySelector('[data-filter-year]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var empty = document.querySelector('[data-empty-state]');
    var queryInput = document.querySelector('[data-search-query]');

    if (yearSelect && yearSelect.options.length <= 1) {
      fillSelect(yearSelect, cards.map(function (card) {
        return card.getAttribute('data-year') || '';
      }).filter(Boolean).sort().reverse());
    }

    if (regionSelect && regionSelect.options.length <= 1) {
      fillSelect(regionSelect, cards.map(function (card) {
        return card.getAttribute('data-region') || '';
      }).filter(Boolean).sort());
    }

    if (queryInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        queryInput.value = q;
      }
    }

    function filter() {
      var keyword = (input.value || '').trim().toLowerCase();
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var ok = (!keyword || text.indexOf(keyword) !== -1) && (!year || cardYear === year) && (!region || cardRegion === region);
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    input.addEventListener('input', filter);
    if (yearSelect) {
      yearSelect.addEventListener('change', filter);
    }
    if (regionSelect) {
      regionSelect.addEventListener('change', filter);
    }
    filter();
  }

  function fillSelect(select, values) {
    var seen = Object.create(null);
    values.forEach(function (value) {
      if (!value || seen[value]) {
        return;
      }
      seen[value] = true;
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupBackTop() {
    var button = document.querySelector('[data-back-top]');
    if (!button) {
      return;
    }
    function update() {
      button.classList.toggle('is-visible', window.scrollY > 320);
    }
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play-button]');
      if (!video || !button) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var started = false;
      var hlsInstance = null;

      function attach() {
        if (!stream || started) {
          return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        attach();
        button.classList.add('is-hidden');
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (!started) {
          play();
        }
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('emptied', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }
})();
