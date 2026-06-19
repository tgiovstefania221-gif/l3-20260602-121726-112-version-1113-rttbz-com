(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  ready(function () {
    var header = document.querySelector(".site-header");
    var menuToggle = document.querySelector(".menu-toggle");

    if (header && menuToggle) {
      menuToggle.addEventListener("click", function () {
        header.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var heroIndex = 0;
    var heroTimer = null;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      heroIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === heroIndex);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === heroIndex);
      });
    }

    function restartHero() {
      if (heroTimer) {
        window.clearInterval(heroTimer);
      }
      if (slides.length > 1) {
        heroTimer = window.setInterval(function () {
          showHero(heroIndex + 1);
        }, 5200);
      }
    }

    if (slides.length) {
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showHero(index);
          restartHero();
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          showHero(heroIndex - 1);
          restartHero();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showHero(heroIndex + 1);
          restartHero();
        });
      }
      restartHero();
    }

    var searchInput = document.querySelector(".search-input");
    var selects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : "");
      var activeFilters = {};
      selects.forEach(function (select) {
        activeFilters[select.getAttribute("data-filter")] = normalize(select.value);
      });
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" "));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesFilters = Object.keys(activeFilters).every(function (key) {
          var selected = activeFilters[key];
          return !selected || normalize(card.getAttribute("data-" + key)) === selected;
        });
        card.classList.toggle("is-hidden-card", !(matchesQuery && matchesFilters));
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", applyFilters);
    });

    var playerShells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

    function bootPlayer(shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".player-cover");
      if (!video) {
        return;
      }
      var source = video.getAttribute("data-src");
      if (!source) {
        return;
      }
      if (video.getAttribute("data-ready") !== "true") {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = source;
        }
        video.setAttribute("data-ready", "true");
      }
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    playerShells.forEach(function (shell) {
      var cover = shell.querySelector(".player-cover");
      var video = shell.querySelector("video");
      if (cover) {
        cover.addEventListener("click", function () {
          bootPlayer(shell);
        });
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.getAttribute("data-ready") !== "true") {
            bootPlayer(shell);
          }
        });
        video.addEventListener("play", function () {
          if (cover) {
            cover.classList.add("is-hidden");
          }
        });
      }
    });
  });
})();
