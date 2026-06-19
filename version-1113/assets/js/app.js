document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            const open = mobileNav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    const next = document.querySelector('.hero-next');
    const prev = document.querySelector('.hero-prev');
    let current = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    if (slides.length) {
        showSlide(0);
        startHero();
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
        });
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.dataset.slide || 0));
        });
    });

    const pageSearch = document.querySelector('.page-search');
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    const empty = document.querySelector('.empty-state');

    if (pageSearch && cards.length) {
        pageSearch.addEventListener('input', function () {
            const keyword = pageSearch.value.trim().toLowerCase();
            let visible = 0;
            cards.forEach(function (card) {
                const haystack = [
                    card.dataset.title || '',
                    card.dataset.genre || '',
                    card.dataset.year || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();
                const match = haystack.includes(keyword);
                card.hidden = !match;
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        });
    }

    const searchForm = document.querySelector('.search-panel');
    const searchInput = document.getElementById('global-search-input');
    const searchResults = document.getElementById('search-results');
    const searchEmpty = document.getElementById('search-empty');

    function renderSearch(keyword) {
        if (!searchResults || !searchEmpty || !Array.isArray(window.MOVIE_SEARCH_INDEX)) {
            return;
        }
        const value = (keyword || '').trim().toLowerCase();
        searchResults.innerHTML = '';
        if (!value) {
            searchEmpty.hidden = false;
            searchEmpty.textContent = '请输入关键词开始搜索';
            return;
        }
        const results = window.MOVIE_SEARCH_INDEX.filter(function (item) {
            return [
                item.title,
                item.region,
                item.type,
                item.year,
                item.genre,
                item.category,
                item.oneLine
            ].join(' ').toLowerCase().includes(value);
        }).slice(0, 80);
        results.forEach(function (item) {
            const article = document.createElement('article');
            article.className = 'movie-card poster-card';
            article.innerHTML = '<a href="' + item.url + '">' +
                '<figure class="poster-frame">' +
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                '<span class="poster-badge">' + escapeHtml(item.type) + '</span>' +
                '<span class="poster-play">▶</span>' +
                '</figure>' +
                '<h3>' + escapeHtml(item.title) + '</h3>' +
                '<p>' + escapeHtml(item.oneLine) + '</p>' +
                '<div class="tag-line"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.category) + '</span></div>' +
                '</a>';
            searchResults.appendChild(article);
        });
        searchEmpty.hidden = results.length !== 0;
        searchEmpty.textContent = '暂无匹配内容';
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    if (searchInput && searchForm) {
        const params = new URLSearchParams(window.location.search);
        const initial = params.get('q') || '';
        searchInput.value = initial;
        renderSearch(initial);
        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const value = searchInput.value.trim();
            const url = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
            window.history.replaceState(null, '', url);
            renderSearch(value);
        });
        searchInput.addEventListener('input', function () {
            renderSearch(searchInput.value);
        });
    }
});
