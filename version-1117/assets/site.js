document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-main-nav]");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  showSlide(0);

  var searchInput = document.querySelector("[data-filter-input]");
  var yearSelect = document.querySelector("[data-filter-year]");
  var regionSelect = document.querySelector("[data-filter-region]");
  var typeSelect = document.querySelector("[data-filter-type]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var empty = document.querySelector("[data-empty-result]");

  function filterCards() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var year = yearSelect ? yearSelect.value : "";
    var region = regionSelect ? regionSelect.value : "";
    var type = typeSelect ? typeSelect.value : "";
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = (card.getAttribute("data-keywords") || "").toLowerCase();
      var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var okYear = !year || String(card.getAttribute("data-year")) === year;
      var okRegion = !region || String(card.getAttribute("data-region")) === region;
      var okType = !type || String(card.getAttribute("data-type")) === type;
      var matched = okKeyword && okYear && okRegion && okType;

      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.style.display = visible ? "none" : "block";
    }
  }

  [searchInput, yearSelect, regionSelect, typeSelect].forEach(function (node) {
    if (node) {
      node.addEventListener("input", filterCards);
      node.addEventListener("change", filterCards);
    }
  });

  filterCards();
});
