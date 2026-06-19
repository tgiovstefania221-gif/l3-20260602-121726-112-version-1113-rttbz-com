(function () {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".menu-toggle");

    if (header && toggle) {
        toggle.addEventListener("click", function () {
            header.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("active", itemIndex === current);
            });

            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("active", itemIndex === current);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        show(0);
        start();
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function filter(value) {
        var query = normalize(value);
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

        cards.forEach(function (card) {
            var source = normalize(card.getAttribute("data-search") || card.textContent);
            card.hidden = Boolean(query && source.indexOf(query) === -1);
        });
    }

    if (filterInputs.length) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";

        filterInputs.forEach(function (input) {
            if (initial && input.hasAttribute("data-query-sync")) {
                input.value = initial;
            }

            input.addEventListener("input", function () {
                filter(input.value);
            });
        });

        if (initial) {
            filter(initial);
        }
    }
})();
