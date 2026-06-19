(function() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (toggle && panel) {
        toggle.addEventListener('click', function() {
            var open = panel.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var active = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
            slide.classList.toggle('active', i === active);
        });
        dots.forEach(function(dot, i) {
            dot.classList.toggle('active', i === active);
        });
    }

    function startTimer() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function() {
            showSlide(active + 1);
        }, 5200);
    }

    function resetTimer() {
        if (timer) {
            window.clearInterval(timer);
        }
        startTimer();
    }

    dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            resetTimer();
        });
    });

    if (prev) {
        prev.addEventListener('click', function() {
            showSlide(active - 1);
            resetTimer();
        });
    }

    if (next) {
        next.addEventListener('click', function() {
            showSlide(active + 1);
            resetTimer();
        });
    }

    startTimer();

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function(scope) {
        var input = scope.querySelector('[data-filter-input]');
        var year = scope.querySelector('[data-year-filter]');
        var type = scope.querySelector('[data-type-filter]');
        var container = document.querySelector('.list-filter-target');
        if (!container) {
            return;
        }
        var cards = Array.prototype.slice.call(container.querySelectorAll('[data-title]'));

        function applyFilter() {
            var q = input ? input.value.trim().toLowerCase() : '';
            var y = year ? year.value : '';
            var t = type ? type.value : '';
            cards.forEach(function(card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-tags') || ''
                ].join(' ').toLowerCase();
                var matchQuery = !q || text.indexOf(q) !== -1;
                var matchYear = !y || card.getAttribute('data-year') === y;
                var matchType = !t || card.getAttribute('data-type') === t;
                card.classList.toggle('is-hidden', !(matchQuery && matchYear && matchType));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
            var params = new URLSearchParams(window.location.search);
            var preset = params.get('q');
            if (preset) {
                input.value = preset;
            }
        }
        if (year) {
            year.addEventListener('change', applyFilter);
        }
        if (type) {
            type.addEventListener('change', applyFilter);
        }
        applyFilter();
    });
}());
