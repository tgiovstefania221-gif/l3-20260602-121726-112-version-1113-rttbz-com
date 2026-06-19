(function () {
  function $(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = $('[data-hero-slide]', root);
    var dots = $('[data-hero-dot]', root);
    var index = 0;
    function setSlide(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setSlide(Number(dot.getAttribute('data-hero-dot') || 0));
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        setSlide(index + 1);
      }, 5600);
    }
  }

  function initFilters() {
    $('.filter-panel').forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var area = panel.parentElement || document;
      var cards = $('[data-card]', area);
      function apply() {
        var q = normalize(input && input.value);
        var t = normalize(type && type.value);
        var y = normalize(year && year.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
          ].join(' '));
          var okQuery = !q || haystack.indexOf(q) !== -1;
          var okType = !t || normalize(card.getAttribute('data-type')) === t;
          var okYear = !y || normalize(card.getAttribute('data-year')) === y;
          card.classList.toggle('is-hidden', !(okQuery && okType && okYear));
        });
      }
      [input, type, year].forEach(function (node) {
        if (node) {
          node.addEventListener('input', apply);
          node.addEventListener('change', apply);
        }
      });
    });
  }

  function cardMarkup(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + escapeAttr(item.url) + '">',
      '<img src="' + escapeAttr(item.cover) + '" alt="' + escapeAttr(item.title) + '" loading="lazy">',
      '<span class="play-chip">播放</span>',
      '</a>',
      '<div class="card-body">',
      '<a class="card-title" href="' + escapeAttr(item.url) + '">' + escapeHtml(item.title) + '</a>',
      '<p class="card-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>',
      '<p class="card-summary">' + escapeHtml(item.summary) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function initGlobalSearch() {
    var input = document.querySelector('[data-global-search]');
    var target = document.querySelector('[data-search-results]');
    if (!input || !target || !window.SEARCH_LIBRARY && typeof SEARCH_LIBRARY === 'undefined') {
      return;
    }
    var library = typeof SEARCH_LIBRARY !== 'undefined' ? SEARCH_LIBRARY : window.SEARCH_LIBRARY;
    function render() {
      var q = normalize(input.value);
      if (!q) {
        target.hidden = true;
        target.innerHTML = '';
        return;
      }
      var results = library.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          item.category,
          item.summary,
          (item.tags || []).join(' ')
        ].join(' '));
        return haystack.indexOf(q) !== -1;
      }).slice(0, 36);
      target.hidden = false;
      target.innerHTML = '<div class="section-title"><div><p>搜索结果</p><h2>相关影片</h2></div></div>' +
        (results.length ? '<div class="movie-grid">' + results.map(cardMarkup).join('') + '</div>' : '<div class="empty-state">没有找到相关影片</div>');
    }
    input.addEventListener('input', render);
    var form = input.closest('form');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
      });
    }
  }

  function initPlayers() {
    $('[data-player]').forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('.video-play');
      var stream = box.getAttribute('data-stream');
      var hlsInstance = null;
      function attach() {
        if (!video || !stream || box.getAttribute('data-ready') === '1') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        box.setAttribute('data-ready', '1');
      }
      function start() {
        attach();
        if (video) {
          var playAction = video.play();
          if (playAction && typeof playAction.catch === 'function') {
            playAction.catch(function () {});
          }
        }
      }
      if (button) {
        button.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', attach);
        video.addEventListener('play', function () {
          box.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          box.classList.remove('is-playing');
        });
        video.addEventListener('ended', function () {
          box.classList.remove('is-playing');
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initGlobalSearch();
    initPlayers();
  });
})();
