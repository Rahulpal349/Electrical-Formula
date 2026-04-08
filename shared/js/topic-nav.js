/* Topic Navigation Scripts */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS if loaded on the page
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 50
        });
    }

    // We can add logic here for swiping and interactive elements common to all topic sub-pages.
    
    // Add simple smooth scrolling for module internal hash links
    const hashLinks = document.querySelectorAll('a[href^="#"]');
    hashLinks.forEach(link => {
        link.addEventListener('click', e => {
            const targetId = link.getAttribute('href');
            if(targetId === '#') return;
            const target = document.querySelector(targetId);
            if(target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Make sure KaTeX renders properly inside cards
    const mathElements = document.querySelectorAll('.formula-card__formula, .pp-formula, .card-math');
    mathElements.forEach(el => {
        if(el.dataset.latex && window.katex) {
            try {
                katex.render(el.dataset.latex, el, { throwOnError: false, displayMode: true });
            } catch(err) {
                console.warn('Katex parse error: ', err);
            }
        }
    });

    // Activate the sidebar section toggle logic
    const sbToggle = document.getElementById('ppSbToggle');
    const sb = document.getElementById('ppSidebar');
    const sbOverlay = document.getElementById('ppSbOverlay');
    const sbClose = document.getElementById('ppSbClose');

    if(sbToggle && sb) {
        sbToggle.addEventListener('click', () => {
            sb.classList.add('open');
            sbOverlay.classList.add('open');
        });
    }
    if(sbClose) {
        sbClose.addEventListener('click', () => {
            sb.classList.remove('open');
            sbOverlay.classList.remove('open');
        });
    }
    if(sbOverlay) {
        sbOverlay.addEventListener('click', () => {
            sb.classList.remove('open');
            sbOverlay.classList.remove('open');
        });
    }

    // IntersectObserver to reveal cards
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // observer.unobserve(entry.target); // Let it toggle if we want
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.pp-card').forEach(card => observer.observe(card));
});
