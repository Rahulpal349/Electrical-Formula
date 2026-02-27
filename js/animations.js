/* ============================================
   EE Formula Hub — Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initTypewriter();
    initSineWave();
    initFooterCircuit();
    initElectronFlow();
});

/* ---------- Loading Screen ---------- */
function initLoadingScreen() {
    const screen = document.getElementById('loading-screen');
    if (!screen) return;
    setTimeout(() => {
        screen.classList.add('hidden');
        setTimeout(() => screen.remove(), 700);
    }, 2600);
}

/* ---------- Typewriter Effect ---------- */
function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    const text = "Every Formula. Every Law. Every Circuit.";
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    el.appendChild(cursor);

    function type() {
        if (i < text.length) {
            el.insertBefore(document.createTextNode(text[i]), cursor);
            i++;
            setTimeout(type, 55 + Math.random() * 35);
        }
    }
    setTimeout(type, 3000); // Start after loading screen
}

/* ---------- Sine Wave Canvas (AC Section) ---------- */
function initSineWave() {
    const canvas = document.getElementById('sine-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    let offset = 0;

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--neon-cyan').trim() || '#00f0ff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;

        const h = canvas.height / 2;
        const amplitude = Math.min(h * 0.35, 60);
        const freq = 0.008;

        // Draw 3 sine waves with different phases
        for (let w = 0; w < 3; w++) {
            ctx.beginPath();
            ctx.globalAlpha = 0.3 - w * 0.08;
            for (let x = 0; x < canvas.width; x++) {
                const y = h + amplitude * Math.sin(freq * x + offset + w * 1.5) * (1 + w * 0.3);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        offset += 0.03;
        animId = requestAnimationFrame(draw);
    }

    // Only animate when section is visible
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { draw(); }
            else { cancelAnimationFrame(animId); }
        });
    }, { threshold: 0.05 });

    if (canvas.parentElement) observer.observe(canvas.parentElement);
}

/* ---------- Footer Circuit Line Animation ---------- */
function initFooterCircuit() {
    const path = document.querySelector('.footer__circuit-line path');
    if (!path) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                path.style.transition = 'stroke-dashoffset 2.5s ease';
                path.style.strokeDashoffset = '0';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    observer.observe(path.closest('.footer'));
}

/* ---------- Electron Flow Animation (Hero) ---------- */
function initElectronFlow() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'electron-svg');
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.15;';
    hero.style.position = 'relative';
    hero.appendChild(svg);

    // Create a few horizontal wire paths
    const wires = [
        { y: '20%', x1: 0, x2: 100 },
        { y: '80%', x1: 100, x2: 0 },
        { y: '50%', x1: 0, x2: 100 },
    ];

    wires.forEach((w, i) => {
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', w.x1 + '%');
        line.setAttribute('y1', w.y);
        line.setAttribute('x2', w.x2 + '%');
        line.setAttribute('y2', w.y);
        line.setAttribute('stroke', 'var(--neon-cyan)');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('stroke-dasharray', '4 20');
        line.style.animation = `electronDash ${3 + i}s linear infinite`;
        if (w.x1 > w.x2) line.style.animationDirection = 'reverse';
        svg.appendChild(line);
    });

    // Add keyframes for electron dash
    if (!document.getElementById('electron-keyframes')) {
        const style = document.createElement('style');
        style.id = 'electron-keyframes';
        style.textContent = `
      @keyframes electronDash {
        to { stroke-dashoffset: -48; }
      }
    `;
        document.head.appendChild(style);
    }
}
