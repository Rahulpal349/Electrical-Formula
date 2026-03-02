/* =========================================
   Circuit Theory Specific JS (circuit.js)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize AOS (Animate on Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: false,
            offset: 100
        });
    }

    // 2. Typewriter Effect for Hero Subtitle
    const subtitleEl = document.getElementById('circuit-typewriter');
    if (subtitleEl) {
        const text = "Complete Formula Reference · Animated · Interactive";
        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                subtitleEl.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        setTimeout(typeWriter, 500); // Start typing after 500ms
    }

    // 3. Three.js Background (Circuit Board abstract)
    initThreeJsBackground();

    // 4. Smooth scrolling for internal sticky nav
    const innerNavLinks = document.querySelectorAll('.circuit-nav a');
    innerNavLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                // Offset for main navbar + inner navbar
                const offset = 140;
                const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });

                // Update active state manually (optional, spy handles it too)
                innerNavLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // 5. Scroll Spy for internal nav
    const sections = document.querySelectorAll('.circuit-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                innerNavLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { rootMargin: '-150px 0px -60% 0px' });

    sections.forEach(s => observer.observe(s));

    // 6. Source Transformation Animation
    const transformAnim = document.getElementById('transform-anim');
    if (transformAnim) {
        let isVoltage = true;
        const trVs = document.querySelector('.tr-vs');
        const trIs = document.querySelector('.tr-is');

        // Initial state
        if (trVs && trIs) {
            trVs.classList.add('active');

            transformAnim.addEventListener('click', () => {
                isVoltage = !isVoltage;
                if (isVoltage) {
                    trIs.classList.remove('active');
                    trVs.classList.add('active');
                } else {
                    trVs.classList.remove('active');
                    trIs.classList.add('active');
                }
            });
        }
    }

    // 7. Topology Interactive Diagram
    const topoItems = document.querySelectorAll('.topo-hover');
    topoItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const targetClass = item.getAttribute('data-target');
            // Hide all first
            document.querySelectorAll('.topo-svg .t-elem').forEach(el => el.classList.remove('active'));
            // Show targeted
            if (targetClass) {
                document.querySelectorAll(`.${targetClass}`).forEach(el => el.classList.add('active'));
            }
        });
        item.addEventListener('mouseleave', () => {
            document.querySelectorAll('.topo-svg .t-elem').forEach(el => el.classList.remove('active'));
        });
    });

    // 8. Ohm's Law Magic Triangle
    const triangleBtns = document.querySelectorAll('.triangle-btn');
    const formulaBoxes = document.querySelectorAll('.ohms-formula-box');

    triangleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');

            // clear active
            triangleBtns.forEach(b => b.classList.remove('active'));
            formulaBoxes.forEach(box => box.classList.remove('active'));

            // set active
            btn.classList.add('active');
            const targetBox = document.getElementById(targetId);
            if (targetBox) targetBox.classList.add('active');
        });
    });

    // 9. Three-Phase Toggles
    const phaseBtns = document.querySelectorAll('.three-phase-toggle .p-btn');
    const phaseContents = document.querySelectorAll('.three-phase-content');

    phaseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPhase = btn.getAttribute('data-phase');

            phaseBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            phaseContents.forEach(content => {
                if (content.id === `${targetPhase}-content`) {
                    content.style.display = 'flex';
                } else {
                    content.style.display = 'none';
                }
            });
        });
    });

    // 11. Thevenin Stepper UI
    const stepBtns = document.querySelectorAll('.step-btn');
    const stepPanes = document.querySelectorAll('.step-pane');

    stepBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const stepNum = btn.getAttribute('data-step');

            stepBtns.forEach(b => b.classList.remove('active'));
            stepPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(`th-step-${stepNum}`);
            if (targetPane) targetPane.classList.add('active');
        });
    });

    // 12. Thevenin Try-It Calculator
    const calcTheveninBtn = document.getElementById('calc-thevenin-btn');
    if (calcTheveninBtn) {
        calcTheveninBtn.addEventListener('click', () => {
            const vs = parseFloat(document.getElementById('th-vs').value);
            const r1 = parseFloat(document.getElementById('th-r1').value);
            const r2 = parseFloat(document.getElementById('th-r2').value);
            const r3 = parseFloat(document.getElementById('th-r3').value);

            // Assuming circuit: Vs in series with R1, R2 in parallel across it, R3 in series with load.
            // Vth = Vs * [R2 / (R1 + R2)]
            const vth = vs * (r2 / (r1 + r2));
            // Rth = (R1 || R2) + R3
            const rth = ((r1 * r2) / (r1 + r2)) + r3;

            const resBox = document.getElementById('th-calc-result');
            resBox.style.display = 'block';
            resBox.innerHTML = `Vth = ${vth.toFixed(2)} V <br> Rth = ${rth.toFixed(2)} &Omega;`;
        });
    }

    // 13. Norton Morph Animation
    const morphNortonBtn = document.getElementById('morph-norton-btn');
    if (morphNortonBtn) {
        let isNorton = false;
        morphNortonBtn.addEventListener('click', () => {
            isNorton = !isNorton;
            if (isNorton) {
                morphNortonBtn.textContent = 'Reverse Transform ◀';
                // Morph to Norton (Parallel)
                gsap.to('.n-src-shape', { r: 20, stroke: '#facc15', duration: 1 });
                gsap.to('.n-src-sym-1', { opacity: 0, duration: 0.5 });
                gsap.to('.n-src-sym-2', { opacity: 0, duration: 0.5 });
                // Arrow for current source
                setTimeout(() => {
                    document.querySelector('.n-src-sym-1').innerHTML = '↑';
                    document.querySelector('.n-src-sym-1').style.fill = '#facc15';
                    gsap.to('.n-src-sym-1', { opacity: 1, duration: 0.5 });
                }, 500);
                document.querySelector('.n-src-label').textContent = 'I_N';
                document.querySelector('.n-src-label').style.fill = '#facc15';

                // Morph resistor wire to parallel
                gsap.to('.n-wire-1', { attr: { d: "M 80,50 L 150,50 L 150,80" }, duration: 1 });
                gsap.to('.n-resistor', { attr: { d: "M 150,80 L 140,85 L 160,105 L 140,125 L 160,145 L 150,150" }, stroke: '#00f5ff', duration: 1 });
                gsap.to('.n-wire-2', { attr: { d: "M 150,150 L 150,150" }, opacity: 0, duration: 1 });

                document.querySelector('.n-res-label').textContent = 'R_N';
                document.querySelector('.n-res-label').style.fill = '#00f5ff';
                gsap.to('.n-res-label', { x: -60, y: 70, duration: 1 });
            } else {
                morphNortonBtn.textContent = 'Play Transformation Animation ▶';
                // Morph to Thevenin (Series)
                gsap.to('.n-src-shape', { r: 20, stroke: 'var(--neon-cyan)', duration: 1 });
                gsap.to('.n-src-sym-1', { opacity: 0, duration: 0.5 });
                setTimeout(() => {
                    document.querySelector('.n-src-sym-1').innerHTML = '+';
                    document.querySelector('.n-src-sym-1').style.fill = 'var(--neon-cyan)';
                    gsap.to('.n-src-sym-1', { opacity: 1, duration: 0.5 });
                    gsap.to('.n-src-sym-2', { opacity: 1, duration: 0.5 });
                }, 500);
                document.querySelector('.n-src-label').textContent = 'V_th';
                document.querySelector('.n-src-label').style.fill = 'var(--neon-cyan)';

                // Resistor back to series
                gsap.to('.n-wire-1', { attr: { d: "M 80,80 L 80,50 L 150,50" }, duration: 1 });
                gsap.to('.n-resistor', { attr: { d: "M 150,50 L 155,40 L 175,60 L 195,40 L 215,60 L 220,50" }, stroke: 'var(--electric-yellow)', duration: 1 });
                gsap.to('.n-wire-2', { attr: { d: "M 220,50 L 300,50" }, opacity: 1, duration: 1 });

                document.querySelector('.n-res-label').textContent = 'R_th';
                document.querySelector('.n-res-label').style.fill = 'var(--electric-yellow)';
                gsap.to('.n-res-label', { x: 0, y: 0, duration: 1 });
            }
        });
    }

    // 14. Norton Try-It Calculator
    const calcNortonBtn = document.getElementById('calc-norton-btn');
    if (calcNortonBtn) {
        calcNortonBtn.addEventListener('click', () => {
            const vth = parseFloat(document.getElementById('nr-vth').value);
            const rth = parseFloat(document.getElementById('nr-rth').value);
            const rn = rth;
            const in_n = vth / rth;
            const res = document.getElementById('nr-calc-result');
            res.style.display = 'block';
            res.innerHTML = `I_N = ${in_n.toFixed(2)} A <br> R_N = ${rn.toFixed(2)} &Omega;`;
        });
    }

    // 15. Max Power Chart & Calculator
    if (document.getElementById('maxPowerChart')) {
        const ctxPwr = document.getElementById('maxPowerChart').getContext('2d');
        const rthInput = document.getElementById('mp-rth');
        const vthInput = document.getElementById('mp-vth');
        const rlInput = document.getElementById('mp-rl');
        const rlValLabel = document.getElementById('mp-rl-val');
        const mpRes = document.getElementById('mp-calc-result');

        // Define Chart
        window.maxPwrChart = new Chart(ctxPwr, {
            type: 'line',
            data: {
                labels: Array.from({ length: 20 }, (_, i) => i + 1), // RL from 1 to 20
                datasets: [{
                    label: 'Power at Load (W)',
                    data: [],
                    borderColor: '#ff5252',
                    backgroundColor: 'rgba(255, 82, 82, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: 'RL (Ohms)', color: '#aaa' }, ticks: { color: '#aaa' }, grid: { color: '#333' } },
                    y: { title: { display: true, text: 'Power (W)', color: '#aaa' }, ticks: { color: '#aaa' }, grid: { color: '#333' } }
                },
                plugins: {
                    legend: { labels: { color: '#fff' } }
                }
            }
        });

        function updateMaxPower() {
            const V = parseFloat(vthInput.value) || 10;
            const Rth = parseFloat(rthInput.value) || 5;
            const varRL = parseFloat(rlInput.value) || 5;

            rlValLabel.textContent = `${varRL} Ω`;

            // Pl = (V^2 / (Rth+Rl)^2) * Rl
            const pL = Math.pow(V, 2) * varRL / Math.pow(Rth + varRL, 2);
            mpRes.innerHTML = `$P_L = ${pL.toFixed(2)}$ W`;

            // Type-set KaTeX if needed manually (we're just using text here)

            // Update Chart
            const pwrData = [];
            for (let i = 1; i <= 20; i++) {
                pwrData.push(Math.pow(V, 2) * i / Math.pow(Rth + i, 2));
            }
            window.maxPwrChart.data.datasets[0].data = pwrData;
            window.maxPwrChart.update();
        }

        [vthInput, rthInput, rlInput].forEach(inp => inp.addEventListener('input', updateMaxPower));
        updateMaxPower(); // init
    }

    // 16. Superposition Animation Toggle
    const spAll = document.getElementById('btn-sp-all');
    const spV1 = document.getElementById('btn-sp-v1');
    const spV2 = document.getElementById('btn-sp-v2');

    if (spAll && spV1 && spV2) {
        const v1Shape = document.getElementById('sp-v1');
        const v1Label = document.getElementById('sp-v1-label');
        const v2Shape = document.getElementById('sp-v2');
        const v2Label = document.getElementById('sp-v2-label');
        const iLabel = document.getElementById('sp-i-label');

        function setSPState(state) {
            if (state === 'all') {
                gsap.to(v1Shape, { stroke: 'var(--neon-cyan)', duration: 0.5 });
                v1Label.textContent = 'V1';
                gsap.to(v2Shape, { stroke: '#ff5252', duration: 0.5 });
                v2Label.textContent = 'V2';
                iLabel.textContent = 'I_total = I1 + I2';
            } else if (state === 'v1') {
                // Keep V1, Short V2
                gsap.to(v1Shape, { stroke: 'var(--neon-cyan)', duration: 0.5 });
                v1Label.textContent = 'V1';
                gsap.to(v2Shape, { stroke: 'var(--text-secondary)', duration: 0.5 });
                v2Label.textContent = 'Short (0V)';
                iLabel.textContent = 'I1 (due to V1)';
            } else if (state === 'v2') {
                // Keep V2, Short V1
                gsap.to(v1Shape, { stroke: 'var(--text-secondary)', duration: 0.5 });
                v1Label.textContent = 'Short (0V)';
                gsap.to(v2Shape, { stroke: '#ff5252', duration: 0.5 });
                v2Label.textContent = 'V2';
                iLabel.textContent = 'I2 (due to V2)';
            }

            if (typeof renderMathInElement === 'function') {
                // re-render if I threw in latex, but it's just raw text here for SVG.
            }
        }

        spAll.addEventListener('click', () => { setSPState('all'); spAll.classList.add('active'); spV1.classList.remove('active'); spV2.classList.remove('active'); });
        spV1.addEventListener('click', () => { setSPState('v1'); spV1.classList.add('active'); spAll.classList.remove('active'); spV2.classList.remove('active'); });
        spV2.addEventListener('click', () => { setSPState('v2'); spV2.classList.add('active'); spAll.classList.remove('active'); spV1.classList.remove('active'); });

        spAll.classList.add('active'); // set initial
    }

    // 16. RLC Transient Overlay Simulator
    if (document.getElementById('rlcOverlayChart')) {
        const ctxTR = document.getElementById('rlcOverlayChart').getContext('2d');
        const rInp = document.getElementById('rlc-overlay-r');

        window.rlcOverlayChart = new Chart(ctxTR, {
            type: 'line',
            data: {
                labels: Array.from({ length: 200 }, (_, i) => (i * 0.05).toFixed(2)), // Time 0 to 10s
                datasets: [
                    {
                        label: 'Underdamped',
                        data: [],
                        borderColor: '#ff5252',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.1,
                        pointRadius: 0
                    },
                    {
                        label: 'Critically Damped',
                        data: [],
                        borderColor: '#42a5f5',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.1,
                        pointRadius: 0
                    },
                    {
                        label: 'Overdamped',
                        data: [],
                        borderColor: '#5c6bc0',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.1,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: 'Time (s)', color: '#aaa' }, ticks: { color: '#aaa' }, grid: { color: '#333' } },
                    y: { title: { display: true, text: 'Voltage (V)', color: '#aaa' }, ticks: { color: '#aaa' }, grid: { color: '#333' }, min: 0, max: 15 }
                },
                plugins: { legend: { labels: { color: '#fff' } } },
                animation: { duration: 0 } // Live update without chart animation delay
            }
        });

        function updateTransientOverlay() {
            const R = parseFloat(rInp.value);
            const L = 10; // fixed
            const C = 0.1; // fixed (100mF)

            const w0 = 1 / Math.sqrt(L * C);
            const Vs = 10;

            const dataUnder = [];
            const dataCrit = [];
            const dataOver = [];

            const R_crit = 2 * Math.sqrt(L / C); // 2 * sqrt(10 / 0.1) = 20 ohms

            // Generate "ideal" curves for reference
            const alpha_under = 5 / (2 * L); // R=5
            const wd = Math.sqrt(w0 * w0 - alpha_under * alpha_under);

            const alpha_over = 40 / (2 * L); // R=40
            const s1 = -alpha_over + Math.sqrt(alpha_over * alpha_over - w0 * w0);
            const s2 = -alpha_over - Math.sqrt(alpha_over * alpha_over - w0 * w0);

            for (let i = 0; i < 200; i++) {
                const t = i * 0.05;

                // Under
                const phi_under = Math.atan(alpha_under / wd);
                const A_under = -Vs / Math.cos(phi_under);
                dataUnder.push(Vs + A_under * Math.exp(-alpha_under * t) * Math.cos(wd * t - phi_under));

                // Crit (R = 20)
                dataCrit.push(Vs - Vs * (1 + w0 * t) * Math.exp(-w0 * t));

                // Over
                const A1_over = -Vs / (s1 - s2) * s2;
                const A2_over = Vs / (s1 - s2) * s1;
                dataOver.push(Vs + A1_over * Math.exp(s1 * t) + A2_over * Math.exp(s2 * t));
            }

            // Now, adjust Opacities based on current Slider R
            // If R < 20 (Under), If R == 20 (Crit), If R > 20 (Over)
            let opUnder, opCrit, opOver;

            // dynamically calculating current curve based on actual slider R
            const currentData = [];
            const alpha = R / (2 * L);
            const zeta = alpha / w0;

            for (let i = 0; i < 200; i++) {
                const t = i * 0.05;
                if (zeta > 1) { // Overdamped
                    const current_s1 = -alpha + Math.sqrt(alpha * alpha - w0 * w0);
                    const current_s2 = -alpha - Math.sqrt(alpha * alpha - w0 * w0);
                    const A1 = -Vs / (current_s1 - current_s2) * current_s2;
                    const A2 = Vs / (current_s1 - current_s2) * current_s1;
                    currentData.push(Vs + A1 * Math.exp(current_s1 * t) + A2 * Math.exp(current_s2 * t));
                } else if (Math.abs(zeta - 1) < 0.05) { // Critically damped
                    currentData.push(Vs - Vs * (1 + w0 * t) * Math.exp(-w0 * t));
                } else { // Underdamped
                    const current_wd = Math.sqrt(w0 * w0 - alpha * alpha);
                    const phi = Math.atan(alpha / current_wd);
                    const A = -Vs / Math.cos(phi);
                    currentData.push(Vs + A * Math.exp(-alpha * t) * Math.cos(current_wd * t - phi));
                }
            }

            // We will just draw the current curve onto the chart, colored appropriately
            if (zeta > 1) { opUnder = 0.2; opCrit = 0.2; opOver = 1.0; }
            else if (Math.abs(zeta - 1) < 0.05) { opUnder = 0.2; opCrit = 1.0; opOver = 0.2; }
            else { opUnder = 1.0; opCrit = 0.2; opOver = 0.2; }

            // Apply faint reference lines
            window.rlcOverlayChart.data.datasets[0].data = dataUnder;
            window.rlcOverlayChart.data.datasets[0].borderColor = `rgba(255, 82, 82, ${opUnder === 1 ? 1 : 0.15})`;

            window.rlcOverlayChart.data.datasets[1].data = dataCrit;
            window.rlcOverlayChart.data.datasets[1].borderColor = `rgba(66, 165, 245, ${opCrit === 1 ? 1 : 0.15})`;

            window.rlcOverlayChart.data.datasets[2].data = dataOver;
            window.rlcOverlayChart.data.datasets[2].borderColor = `rgba(92, 107, 192, ${opOver === 1 ? 1 : 0.15})`;

            // Override the active logic to replace the highlighted curve data entirely with the EXACT slider curve
            if (opUnder === 1) { window.rlcOverlayChart.data.datasets[0].data = currentData; window.rlcOverlayChart.data.datasets[0].borderWidth = 4; } else { window.rlcOverlayChart.data.datasets[0].borderWidth = 2; }
            if (opCrit === 1) { window.rlcOverlayChart.data.datasets[1].data = currentData; window.rlcOverlayChart.data.datasets[1].borderWidth = 4; } else { window.rlcOverlayChart.data.datasets[1].borderWidth = 2; }
            if (opOver === 1) { window.rlcOverlayChart.data.datasets[2].data = currentData; window.rlcOverlayChart.data.datasets[2].borderWidth = 4; } else { window.rlcOverlayChart.data.datasets[2].borderWidth = 2; }

            window.rlcOverlayChart.update();
        }

        rInp.addEventListener('input', updateTransientOverlay);
        updateTransientOverlay();
    }

    // 17. Laplace Circuit Morphing Animation
    const morphLapBtn = document.getElementById('morph-laplace-btn');
    if (morphLapBtn) {
        let isSDomain = false;
        morphLapBtn.addEventListener('click', () => {
            if (!isSDomain) {
                morphLapBtn.textContent = 'Morph s-Domain back to Time-Domain ▶';
                gsap.to('#l-td-group', { opacity: 0, y: -20, duration: 0.5 });
                gsap.fromTo('#l-sd-group', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.2 });
                isSDomain = true;
            } else {
                morphLapBtn.textContent = 'Morph Time-Domain L to s-Domain ▶';
                gsap.to('#l-sd-group', { opacity: 0, y: 20, duration: 0.5 });
                gsap.fromTo('#l-td-group', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.2 });
                isSDomain = false;
            }
        });
    }


    // 18. Interactive Op-Amp Calculator
    const calcOpampBtn = document.getElementById('calc-opamp-btn');
    if (calcOpampBtn) {
        calcOpampBtn.addEventListener('click', () => {
            const type = document.getElementById('opamp-type').value;
            const rf = parseFloat(document.getElementById('opamp-rf').value);
            const rin = parseFloat(document.getElementById('opamp-rin').value);
            const vin = parseFloat(document.getElementById('opamp-vin').value);
            const resBox = document.getElementById('opamp-calc-result');

            if (isNaN(rf) || isNaN(rin) || isNaN(vin) || rin === 0) {
                alert("Please enter valid non-zero values.");
                return;
            }

            let gain = 0;
            if (type === 'inverting') {
                gain = -rf / rin;
            } else {
                gain = 1 + (rf / rin);
            }

            let vout = gain * vin;

            let saturated = false;
            // Op-Amp Saturation Rails at +/- 15V
            if (vout > 15) { vout = 15; saturated = true; }
            if (vout < -15) { vout = -15; saturated = true; }

            resBox.style.display = 'block';
            resBox.innerHTML = `Signal Gain ($A_v$): <strong>${gain.toFixed(2)} V/V</strong><br>
                                Output Voltage ($V_{out}$): <strong>${vout.toFixed(2)} V</strong> ${saturated ? '<br><span style="color:#ff5252; font-size: 0.8em;">(Rail Saturation Clipped)</span>' : ''}`;

            // Re-render KaTeX if available
            if (typeof renderMathInElement === 'function') {
                renderMathInElement(resBox, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false }
                    ],
                    throwOnError: false
                });
            }
        });
    }

    // 19. Initialize Phasor Canvas Animation
    initPhasorCanvas();

});

/* ---------- Phasor Animation (Section 2) ---------- */
function initPhasorCanvas() {
    const canvas = document.getElementById('phasorCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const speedSlider = document.getElementById('phasor-speed');

    let angle = 0;
    const waveData = [];
    const originX = 100;
    const originY = 125;
    const radius = 60;
    const waveStartX = 200;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Speed
        const speed = speedSlider ? parseFloat(speedSlider.value) : 3;
        angle -= (speed * 0.02); // Rotate clockwise
        if (angle < -Math.PI * 2) angle += Math.PI * 2;

        const px = originX + radius * Math.cos(angle);
        const py = originY + radius * Math.sin(angle);

        // Record wave point y
        waveData.unshift(py);
        if (waveData.length > 250) waveData.pop();

        // Draw axes for phasor
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.moveTo(originX - 80, originY);
        ctx.lineTo(originX + 80, originY);
        ctx.moveTo(originX, originY - 80);
        ctx.lineTo(originX, originY + 80);
        ctx.stroke();

        // Draw circle
        ctx.beginPath();
        ctx.arc(originX, originY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.3)';
        ctx.stroke();

        // Draw phasor vector
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(px, py);
        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw point
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#facc15';
        ctx.fill();

        // Draw reference line from phasor to wave
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(px, py);
        ctx.lineTo(waveStartX, py);
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]); // Reset

        // Draw Wave axes
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.moveTo(waveStartX, originY);
        ctx.lineTo(canvas.width, originY);
        ctx.stroke();

        // Draw Waveform
        ctx.beginPath();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        for (let i = 0; i < waveData.length; i++) {
            if (i === 0) ctx.moveTo(waveStartX + i, waveData[i]);
            else ctx.lineTo(waveStartX + i, waveData[i]);
        }
        ctx.stroke();

        requestAnimationFrame(draw);
    }
    draw();
}

/* ---------- Three.js 3D Circuit Board Background ---------- */
function initThreeJsBackground() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    // Dark background matching navy theme
    scene.background = new THREE.Color(0x0a0e1a);
    scene.fog = new THREE.Fog(0x0a0e1a, 10, 50);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create a grid of points / nodes
    const nodeGeometry = new THREE.BufferGeometry();
    const nodeCount = 300;
    const positions = new Float32Array(nodeCount * 3);

    for (let i = 0; i < nodeCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 60;     // x
        positions[i + 1] = (Math.random() - 0.5) * 10;   // y
        positions[i + 2] = (Math.random() - 0.5) * 60;   // z
    }

    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Nodes material
    const nodeMaterial = new THREE.PointsMaterial({
        color: 0x00f5ff,
        size: 0.3,
        transparent: true,
        opacity: 0.8
    });

    const nodes = new THREE.Points(nodeGeometry, nodeMaterial);
    scene.add(nodes);

    // Create lines (traces) between close nodes
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00f5ff,
        transparent: true,
        opacity: 0.15
    });

    const linesGroup = new THREE.Group();

    // Very basic distance check to draw some random lines
    // In a real scenario you'd build a more structured grid, but this gives a cool abstract tech feel
    for (let i = 0; i < 150; i++) {
        const idx1 = Math.floor(Math.random() * nodeCount) * 3;
        const idx2 = Math.floor(Math.random() * nodeCount) * 3;

        const pt1 = new THREE.Vector3(positions[idx1], positions[idx1 + 1], positions[idx1 + 2]);
        const pt2 = new THREE.Vector3(positions[idx2], positions[idx2 + 1], positions[idx2 + 2]);

        if (pt1.distanceTo(pt2) < 20) {
            const geom = new THREE.BufferGeometry().setFromPoints([pt1, pt2]);
            const line = new THREE.Line(geom, lineMaterial);
            linesGroup.add(line);
        }
    }
    scene.add(linesGroup);

    // Floating 3D circuit chips
    const boxGeo = new THREE.BoxGeometry(2, 0.2, 2);
    const boxMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.8
    });
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const edgesMat = new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 2 }); // Yellow accent

    const chips = [];
    for (let i = 0; i < 5; i++) {
        const mesh = new THREE.Mesh(boxGeo, boxMat);
        const edges = new THREE.LineSegments(edgesGeo, new THREE.LineBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.5 }));
        mesh.add(edges);

        mesh.position.set(
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 40
        );
        mesh.rotation.y = Math.random() * Math.PI;
        scene.add(mesh);
        chips.push(mesh);
    }

    // Animation Loop
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.005;

        // Slowly rotate scene
        nodes.rotation.y = time * 0.5;
        linesGroup.rotation.y = time * 0.5;

        // Float chips
        chips.forEach((c, i) => {
            c.position.y += Math.sin(time * 2 + i) * 0.01;
            c.rotation.y += 0.002;
        });

        renderer.render(scene, camera);
    }

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
