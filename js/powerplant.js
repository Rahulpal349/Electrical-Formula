document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize AOS animation library
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true, offset: 50 });
    }

    // 2. Setup scrollspy for sticky sidebar navigation
    setupSidebarScrollspy();

    // 3. Initialize Interactive Units
    initUnit1Basics();
    initUnit2Thermal();
});

function setupSidebarScrollspy() {
    const sections = document.querySelectorAll('.module-section');
    const navLinks = document.querySelectorAll('.sidebar-links a');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                        link.style.backgroundColor = link.style.borderLeftColor.replace('rgb', 'rgba').replace(')', ', 0.1)');
                    } else {
                        link.style.backgroundColor = 'transparent';
                    }
                });
            }
        });
    }, { rootMargin: '-20% 0px -60% 0px' });

    sections.forEach(section => observer.observe(section));
}

// ==========================================
// UNIT 1: BASICS OF POWER GENERATION
// ==========================================
function initUnit1Basics() {
    if (typeof gsap === 'undefined' || typeof Chart === 'undefined') return;

    // 1. Energy Chain SVG Animation using GSAP
    const tlChain = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    tlChain.fromTo("#chain-node-1 circle", { fill: "#1e293b", filter: "none" }, { fill: "rgba(250, 204, 21, 0.2)", filter: "drop-shadow(0 0 10px #facc15)", duration: 0.5 })
        .fromTo("#chain-arrow-1", { strokeDashoffset: 20 }, { strokeDashoffset: 0, duration: 1, ease: "linear" }, "-=0.2")
        .fromTo("#chain-node-2 circle", { fill: "#1e293b", filter: "none" }, { fill: "rgba(255, 107, 53, 0.2)", filter: "drop-shadow(0 0 10px #ff6b35)", duration: 0.5 })
        .fromTo("#chain-arrow-2", { strokeDashoffset: 20 }, { strokeDashoffset: 0, duration: 1, ease: "linear" }, "-=0.2")
        .fromTo("#chain-node-3 circle", { fill: "#1e293b", filter: "none" }, { fill: "rgba(0, 245, 255, 0.2)", filter: "drop-shadow(0 0 10px #00f5ff)", duration: 0.5 });

    // 2. India Energy Mix Pie Chart
    const ctxPie = document.getElementById('india-energy-pie');
    if (ctxPie) {
        new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: ['Thermal', 'Renewable', 'Hydro', 'Nuclear'],
                datasets: [{
                    data: [55, 33, 10, 2],
                    backgroundColor: ['#ef4444', '#22c55e', '#3b82f6', '#a78bfa'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) { return context.label + ': ' + context.parsed + '%'; }
                        }
                    }
                },
                cutout: '70%',
                animation: { animateScale: true, animateRotate: true }
            }
        });
    }

    // 3. Efficiency Comparison Bar Chart
    const ctxBar = document.getElementById('generation-comparison-chart');
    if (ctxBar) {
        new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: ['Thermal', 'Nuclear', 'Hydro', 'Gas Turbine', 'Diesel', 'Solar PV', 'Wind'],
                datasets: [{
                    label: 'Avg Efficiency (%)',
                    data: [35, 34, 88, 30, 38, 18, 40],
                    backgroundColor: [
                        '#ef4444', '#a78bfa', '#3b82f6', '#facc15', '#78716c', '#22c55e', '#00f5ff'
                    ],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#e2e8f0' }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
}

// ==========================================
// UNIT 2: THERMAL POWER STATIONS
// ==========================================
function initUnit2Thermal() {
    if (typeof gsap === 'undefined') return;

    // 1. Thermal Block Diagram Animations
    // Spin turbine and generator
    gsap.to("#turbine-shaft", { rotation: 360, transformOrigin: "left center", repeat: -1, ease: "linear", duration: 1 });
    gsap.to(".spin-gen", { rotation: 360, transformOrigin: "center center", repeat: -1, ease: "linear", duration: 2 });
    gsap.to("#flame", { scaleY: 1.2, transformOrigin: "bottom center", repeat: -1, yoyo: true, duration: 0.2, ease: "sine.inOut" });

    // Steam particles flowing
    gsap.to(".steam-particle", { x: "+=50", opacity: 0, repeat: -1, duration: 1, ease: "linear", stagger: 0.3 });
    gsap.to(".water-particle", { x: "-=50", opacity: 0, repeat: -1, duration: 1.5, ease: "linear", stagger: 0.4 });

    // Tooltip interaction
    const comps = document.querySelectorAll('.clickable-comp');
    const tooltip = document.getElementById('comp-tooltip');
    if (comps && tooltip) {
        comps.forEach(comp => {
            comp.addEventListener('mouseenter', (e) => {
                const desc = comp.getAttribute('data-desc') || "Thermal Plant Component.";
                tooltip.textContent = desc;
                tooltip.style.opacity = 1;
            });
            comp.addEventListener('mouseleave', () => {
                tooltip.style.opacity = 0;
            });
        });
    }

    // 2. T-s Diagram Drawing
    const btnDrawTS = document.getElementById('btn-draw-ts');
    const rankPath = document.getElementById('rank-path');
    if (btnDrawTS && rankPath) {
        btnDrawTS.addEventListener('click', () => {
            gsap.fromTo(rankPath,
                { strokeDashoffset: 500 },
                { strokeDashoffset: 0, duration: 2, ease: "power1.inOut" }
            );
        });
    }

    // 3. Cooling Tower Animation
    gsap.to(".hot-drop", { y: "+=100", opacity: 0, repeat: -1, duration: 1.5, ease: "none", stagger: 0.5 });
    gsap.to(".vapor-up", { y: "-=30", x: "+=10", opacity: 0, repeat: -1, duration: 2, ease: "sine.inOut", stagger: 0.5 });
}
