/* ============================================
   EE Formula Hub — Core Application Logic
   ============================================ */

(function () {
    'use strict';

    /* ---------- State ---------- */
    let bookmarks = JSON.parse(localStorage.getItem('ee_bookmarks') || '[]');
    const isDark = () => !document.body.classList.contains('light-mode');

    /* ---------- DOM References ---------- */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    /* ---------- Render Category Sections ---------- */
    function renderSections() {
        const container = $('#formula-sections');
        if (!container) return;

        const pageCat = document.body.dataset.pageCategory;

        // If it's the Hub page, render big navigation cards instead of formulas
        if (!pageCat || pageCat === 'hub') {
            renderHub(container);
            return;
        }

        const catOrder = [pageCat];

        catOrder.forEach(catKey => {
            const cat = CATEGORIES[catKey];
            const formulas = FORMULA_DATA.filter(f => f.category === catKey);
            const section = document.createElement('section');
            section.className = 'section';
            section.id = `section-${catKey}`;
            section.dataset.category = catKey;
            if (catKey === 'signals') section.style.position = 'relative';

            let cardsHTML = '';
            formulas.forEach(f => {
                const isBookmarked = bookmarks.includes(f.id);
                const hasCalc = !!f.calc;
                cardsHTML += `
        <div class="formula-card" data-cat="${f.category}" data-id="${f.id}" data-name="${f.name.toLowerCase()}" data-desc="${f.description.toLowerCase()}">
          <div class="formula-card__header">
            <span class="formula-card__name">${f.name}</span>
            <div class="formula-card__actions">
              ${hasCalc ? `<button class="calc-btn" title="Calculate" data-id="${f.id}">🧮</button>` : ''}
              <button class="copy-btn" title="Copy LaTeX" data-latex="${f.latex.replace(/"/g, '&quot;')}">📋</button>
              <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" title="Bookmark" data-id="${f.id}">★</button>
            </div>
          </div>
          <div class="formula-card__formula" data-latex="${f.latex.replace(/"/g, '&quot;')}"></div>
          <p class="formula-card__desc">${f.description}</p>
          <div class="formula-card__units"><strong>Units:</strong> ${f.units}</div>
          <span class="formula-card__tag" style="background:${cat.color}22;color:${cat.color}">${cat.icon} ${cat.name}</span>
        </div>`;
            });

            section.innerHTML = `
        ${catKey === 'signals' ? '<canvas class="sine-canvas" id="sine-canvas"></canvas>' : ''}
        <div class="section__header">
          <h2>${cat.icon} ${cat.name}</h2>
          <p>${getSectionDesc(catKey)}</p>
        </div>
        <div class="formula-grid">${cardsHTML}</div>
      `;
            container.appendChild(section);
        });

        // Render KaTeX
        $$('.formula-card__formula').forEach(el => {
            try {
                katex.render(el.dataset.latex, el, { throwOnError: false, displayMode: true });
            } catch (e) {
                el.textContent = el.dataset.latex;
            }
        });
    }

    /* ---------- Render Hub Page ---------- */
    function renderHub(container) {
        const catOrder = ['circuit', 'machines', 'measurements', 'power', 'control', 'electronics', 'signals', 'micro', 'estimation'];

        const section = document.createElement('section');
        section.className = 'section';
        section.id = 'hub-sections';

        let cardsHTML = '';
        catOrder.forEach(catKey => {
            const cat = CATEGORIES[catKey];
            const desc = getSectionDesc(catKey);
            cardsHTML += `
            <a href="${catKey}.html" target="_blank" class="formula-card hub-card" style="text-decoration:none; display:flex; flex-direction:column; align-items:center; text-align:center;" data-cat="${catKey}">
                <div style="font-size:3rem; margin-bottom:12px;">${cat.icon}</div>
                <h3 style="color:${cat.color}; font-family:var(--font-head); letter-spacing:1px; margin-bottom:8px;">${cat.name}</h3>
                <p style="color:var(--text-secondary); font-size:0.9rem;">${desc}</p>
            </a>
            `;
        });

        section.innerHTML = `
            <div class="section__header">
                <h2>Explore Subjects</h2>
                <p>Select a category below to view its specific engineering formulas.</p>
            </div>
            <div class="formula-grid">${cardsHTML}</div>
        `;
        container.appendChild(section);
        setTimeout(() => $$('.hub-card').forEach(c => c.classList.add('visible')), 50);
    }

    function getSectionDesc(cat) {
        const descs = {
            circuit: 'Fundamental properties and laws governing electrical circuits including DC, AC, and complex network analysis.',
            machines: 'Principles of electromechanical energy conversion — transformers, motors, and generators.',
            measurements: 'Instruments and techniques for measuring voltage, current, power, energy, and component values.',
            power: 'Generation, transmission, and distribution of electrical power, including fault analysis and protection.',
            control: 'Modeling, analysis, and design of feedback systems for stability and performance.',
            electronics: 'Analog and digital solid-state devices — diodes, BJTs, MOSFETs, and op-amp applications.',
            signals: 'Continuous and discrete-time signals, filtering, and system transforms (Laplace, Fourier, Z-transform).',
            micro: 'Architecture, programming, and interfacing of microprocessors and microcontrollers.',
            estimation: 'Load calculations, energy billing, tariff structures, and electrical installation design.'
        };
        return descs[cat] || '';
    }

    /* ---------- Search / Filter ---------- */
    function initSearch() {
        const input = $('#search-input');
        if (!input) return;
        input.addEventListener('input', () => {
            const q = input.value.toLowerCase().trim();
            let anyVisible = false;
            $$('.formula-card').forEach(card => {
                const match = !q ||
                    card.dataset.name.includes(q) ||
                    card.dataset.desc.includes(q) ||
                    card.dataset.cat.includes(q);
                card.style.display = match ? '' : 'none';
                if (match) anyVisible = true;
            });
            // Show/hide sections
            $$('.section').forEach(sec => {
                const cards = $$('.formula-card', sec);
                const hasVisible = cards.some(c => c.style.display !== 'none');
                sec.style.display = hasVisible ? '' : 'none';
            });
            const noRes = $('#no-results');
            if (noRes) noRes.classList.toggle('show', !anyVisible && q.length > 0);
        });
    }

    /* ---------- Theme Toggle ---------- */
    function initTheme() {
        const saved = localStorage.getItem('ee_theme');
        if (saved === 'light') document.body.classList.add('light-mode');
        const btn = $('#theme-toggle');
        if (!btn) return;
        updateThemeIcon(btn);
        btn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            localStorage.setItem('ee_theme', isDark() ? 'dark' : 'light');
            updateThemeIcon(btn);
        });
    }
    function updateThemeIcon(btn) {
        btn.textContent = isDark() ? '☀️' : '🌙';
    }

    /* ---------- Bookmarks ---------- */
    function initBookmarks() {
        document.addEventListener('click', e => {
            const btn = e.target.closest('.bookmark-btn');
            if (!btn) return;
            const id = btn.dataset.id;
            if (bookmarks.includes(id)) {
                bookmarks = bookmarks.filter(b => b !== id);
                btn.classList.remove('bookmarked');
            } else {
                bookmarks.push(id);
                btn.classList.add('bookmarked');
            }
            localStorage.setItem('ee_bookmarks', JSON.stringify(bookmarks));
            renderBookmarksPanel();
        });

        // Toggle panel
        const toggleBtn = $('#bookmarks-toggle');
        const panel = $('#bookmarks-panel');
        if (toggleBtn && panel) {
            toggleBtn.addEventListener('click', () => panel.classList.toggle('open'));
            document.addEventListener('click', e => {
                if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== toggleBtn) {
                    panel.classList.remove('open');
                }
            });
        }
        renderBookmarksPanel();
    }

    function renderBookmarksPanel() {
        const list = $('#bookmarks-list');
        if (!list) return;
        if (bookmarks.length === 0) {
            list.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No bookmarks yet — star a formula to save it here.</p>';
            return;
        }
        list.innerHTML = bookmarks.map(id => {
            const f = FORMULA_DATA.find(x => x.id === id);
            if (!f) return '';
            return `<div class="bookmark-item" data-target="${f.id}">
        <div class="bookmark-item__name">${f.name}</div>
      </div>`;
        }).join('');
        $$('.bookmark-item', list).forEach(item => {
            item.addEventListener('click', () => {
                const card = $(`.formula-card[data-id="${item.dataset.target}"]`);
                if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.style.boxShadow = '0 0 0 2px var(--neon-cyan), var(--glow-cyan)';
                    setTimeout(() => card.style.boxShadow = '', 2000);
                }
                $('#bookmarks-panel').classList.remove('open');
            });
        });
    }

    /* ---------- Copy LaTeX ---------- */
    function initCopy() {
        document.addEventListener('click', e => {
            const btn = e.target.closest('.copy-btn');
            if (!btn) return;
            const latex = btn.dataset.latex;
            navigator.clipboard.writeText(latex).then(() => {
                const orig = btn.textContent;
                btn.textContent = '✅';
                setTimeout(() => btn.textContent = orig, 1200);
            });
        });
    }

    /* ---------- Calculator Open ---------- */
    function initCalcTrigger() {
        document.addEventListener('click', e => {
            const btn = e.target.closest('.calc-btn');
            if (!btn) return;
            const id = btn.dataset.id;
            if (typeof openCalculator === 'function') openCalculator(id);
        });
    }

    /* ---------- Navigation & Active State ---------- */
    function initNav() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const pageCat = document.body.dataset.pageCategory;

        $$('.navbar__links a').forEach(link => {
            const href = link.getAttribute('href');

            // Set active class based on href matching current path
            if (href === currentPath || (pageCat && href.includes(pageCat))) {
                link.classList.add('active');
            }

            // Remove e.preventDefault() so normal HTML navigation works
            link.addEventListener('click', e => {
                // If the link happens to be a hash link (e.g., #bookmarks), handle it here
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = $(href);
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                }
                // Close mobile menu on click
                const linksContainer = $('.navbar__links');
                if (linksContainer) linksContainer.classList.remove('open');
            });
        });

        // Mobile menu toggle
        const menuBtn = $('#mobile-menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                $('.navbar__links').classList.toggle('open');
            });
        }
    }

    /* ---------- CTA Scroll / Navigate ---------- */
    function initCTA() {
        const cta = $('#cta-btn');
        if (cta) {
            cta.addEventListener('click', e => {
                const pageCat = document.body.dataset.pageCategory;
                if (!pageCat || pageCat === 'hub') {
                    e.preventDefault();
                    const first = $('#hub-sections');
                    if (first) first.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    /* ---------- Card Visibility (Scroll) ---------- */
    function initCardObserver() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });
        $$('.formula-card').forEach(card => observer.observe(card));
    }

    /* ---------- Init ---------- */
    document.addEventListener('DOMContentLoaded', () => {
        renderSections();
        initTheme();
        initSearch();
        initBookmarks();
        initCopy();
        initCalcTrigger();
        initNav();
        initCTA();
        setTimeout(initCardObserver, 100);
    });
})();
