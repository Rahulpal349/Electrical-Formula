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

    // CARD 0.1: Units Table Handling
    const unitRows = document.querySelectorAll('.unit-row');
    const unitDisplay = document.getElementById('unit-formula-display');
    const unitTitle = document.getElementById('unit-formula-title');
    const unitKatex = document.getElementById('unit-formula-katex');

    if (unitRows.length > 0) {
        unitRows.forEach(row => {
            row.addEventListener('click', () => {
                const qty = row.querySelector('.qty-col').textContent;
                const formula = row.getAttribute('data-formula');
                unitTitle.textContent = qty + " Formulas";
                unitKatex.innerHTML = `$$ ${formula} $$`;
                unitDisplay.style.display = 'block';

                if (typeof renderMathInElement === 'function') {
                    renderMathInElement(unitDisplay, {
                        delimiters: [{ left: '$$', right: '$$', display: true }],
                        throwOnError: false
                    });
                }
            });
        });
    }

    // CARD 0.2: Wire Stretch Animation
    const btnStretch = document.getElementById('btn-stretch');
    const btnCompress = document.getElementById('btn-compress');
    const btnResetWire = document.getElementById('btn-reset-wire');
    const wireRect = document.getElementById('wire-rect');
    const wireLabel = document.getElementById('wire-label');
    const wireStatus = document.getElementById('wire-status');

    if (btnStretch && btnCompress && btnResetWire) {
        btnStretch.addEventListener('click', () => {
            gsap.to(wireRect, { attr: { x: 50, width: 200, height: 15, y: 42.5 }, duration: 1 });
            wireLabel.textContent = "4R";
            wireLabel.setAttribute('y', 55);
            wireStatus.textContent = "Resistance: 4R (Glows Red)";
            wireStatus.style.color = "#ff5252";
            wireRect.style.fill = "#ff5252";
        });
        btnCompress.addEventListener('click', () => {
            gsap.to(wireRect, { attr: { x: 125, width: 50, height: 60, y: 20 }, duration: 1 });
            wireLabel.textContent = "R/4";
            wireLabel.setAttribute('y', 55);
            wireStatus.textContent = "Resistance: R/4 (Glows Green)";
            wireStatus.style.color = "#69f0ae";
            wireRect.style.fill = "#69f0ae";
        });
        btnResetWire.addEventListener('click', () => {
            gsap.to(wireRect, { attr: { x: 100, width: 100, height: 30, y: 35 }, duration: 1 });
            wireLabel.textContent = "R (ℓ, A)";
            wireLabel.setAttribute('y', 55);
            wireStatus.textContent = "Original Resistance: R";
            wireStatus.style.color = "var(--neon-cyan)";
            wireRect.style.fill = "var(--electric-yellow)";
        });
    }

    // CARD 0.2: Combination Calculator
    const combR1 = document.getElementById('comb-r1');
    const combR2 = document.getElementById('comb-r2');
    const srRes = document.getElementById('comb-series-res');
    const prRes = document.getElementById('comb-parallel-res');

    function updateCombiner() {
        if (!combR1 || !combR2 || !srRes || !prRes) return;
        const r1 = parseFloat(combR1.value) || 0;
        const r2 = parseFloat(combR2.value) || 0;
        const rSeries = r1 + r2;
        const rParallel = (r1 * r2) / (r1 + r2);

        srRes.innerHTML = `$R_{series} = ${rSeries.toFixed(2)}$ Ω`;
        if (r1 === 0 && r2 === 0) {
            prRes.innerHTML = `$R_{parallel} = 0.00$ Ω`;
        } else {
            prRes.innerHTML = `$R_{parallel} = ${rParallel.toFixed(2)}$ Ω`;
        }

        if (typeof renderMathInElement === 'function') {
            renderMathInElement(srRes.parentElement, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });
        }
    }

    if (combR1 && combR2) {
        combR1.addEventListener('input', updateCombiner);
        combR2.addEventListener('input', updateCombiner);
        updateCombiner(); // Initial calculation
    }

    // CARD 0.3: Delta ↔ Star Conversion
    const btnToggleDS = document.getElementById('btn-toggle-ds');
    const grpDelta = document.getElementById('ds-delta-group');
    const grpStar = document.getElementById('ds-star-group');
    const tabsDS = document.querySelectorAll('.ds-tab');
    const panesDS = document.querySelectorAll('.ds-pane');
    let isDelta = true;

    if (btnToggleDS && grpDelta && grpStar) {
        btnToggleDS.addEventListener('click', () => {
            isDelta = !isDelta;
            if (isDelta) {
                gsap.to(grpDelta, { opacity: 1, duration: 0.5 });
                gsap.to(grpStar, { opacity: 0, duration: 0.5 });
            } else {
                gsap.to(grpDelta, { opacity: 0, duration: 0.5 });
                gsap.to(grpStar, { opacity: 1, duration: 0.5 });
            }
        });
    }

    if (tabsDS.length > 0) {
        tabsDS.forEach(tab => {
            tab.addEventListener('click', () => {
                tabsDS.forEach(t => { t.classList.remove('active'); t.style.color = "var(--text-muted)"; t.style.borderBottom = "none"; });
                panesDS.forEach(p => p.style.display = 'none');

                tab.classList.add('active');
                tab.style.color = "var(--text-primary)";
                tab.style.borderBottom = "2px solid var(--neon-cyan)";
                const target = document.getElementById(tab.getAttribute('data-target'));
                if (target) {
                    target.style.display = 'block';
                    // Force re-render of katex in this pane to prevent clipping
                    if (typeof renderMathInElement === 'function') {
                        renderMathInElement(target, { delimiters: [{ left: '$$', right: '$$', display: true }], throwOnError: false });
                    }
                }
            });
        });
    }

    // Delta-Star Live Calculation
    const inRab = document.getElementById('ds-calc-rab');
    const inRbc = document.getElementById('ds-calc-rbc');
    const inRca = document.getElementById('ds-calc-rca');
    const dsRes = document.getElementById('ds-calc-result');

    const inRa = document.getElementById('sd-calc-ra');
    const inRb = document.getElementById('sd-calc-rb');
    const inRc = document.getElementById('sd-calc-rc');
    const sdRes = document.getElementById('sd-calc-result');

    function calcDS() {
        if (!inRab || !inRa) return;
        // D -> Y
        let rab = parseFloat(inRab.value) || 0;
        let rbc = parseFloat(inRbc.value) || 0;
        let rca = parseFloat(inRca.value) || 0;
        let sumD = rab + rbc + rca;
        if (sumD > 0) {
            let ra = (rab * rca) / sumD;
            let rb = (rab * rbc) / sumD;
            let rc = (rbc * rca) / sumD;
            dsRes.textContent = `RA = ${ra.toFixed(2)} Ω, RB = ${rb.toFixed(2)} Ω, RC = ${rc.toFixed(2)} Ω`;
        } else { dsRes.textContent = "Sum of Δ must be > 0"; }

        // Y -> D
        let a = parseFloat(inRa.value) || 0;
        let b = parseFloat(inRb.value) || 0;
        let c = parseFloat(inRc.value) || 0;
        if (a > 0 && b > 0 && c > 0) {
            let sumY = (a * b) + (b * c) + (c * a);
            let rabOut = sumY / c;
            let rbcOut = sumY / a;
            let rcaOut = sumY / b;
            sdRes.textContent = `RAB = ${rabOut.toFixed(2)} Ω, RBC = ${rbcOut.toFixed(2)} Ω, RCA = ${rcaOut.toFixed(2)} Ω`;
        } else { sdRes.textContent = "Input resistances must be > 0"; }
    }

    [inRab, inRbc, inRca, inRa, inRb, inRc].forEach(inp => {
        if (inp) inp.addEventListener('input', calcDS);
    });
    calcDS(); // init

    // CARD 0.4: Resistor VS Temp D3 Graph
    const rvtGraph = document.getElementById('rvt-graph');
    if (rvtGraph && typeof d3 !== 'undefined') {
        const width = rvtGraph.clientWidth;
        const height = rvtGraph.clientHeight;
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select('#rvt-graph').append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // X scale (Temp: -50 to 200)
        const xScale = d3.scaleLinear().domain([-50, 200]).range([0, innerWidth]);
        // Y scale (Resistance factor: 0.5 to 2.5 of base 100) -> so 50 to 250
        const yScale = d3.scaleLinear().domain([0, 200]).range([innerHeight, 0]);

        const xAxis = d3.axisBottom(xScale).ticks(6);
        const yAxis = d3.axisLeft(yScale).ticks(5);

        svg.append('g').attr('transform', `translate(0,${innerHeight})`)
            .attr('class', 'chart-axis').call(xAxis)
            .append('text').attr('x', innerWidth / 2).attr('y', 28).attr('fill', '#fff').text('Temperature (°C)');

        svg.append('g').attr('class', 'chart-axis').call(yAxis)
            .append('text').attr('transform', 'rotate(-90)').attr('y', -30).attr('x', -innerHeight / 2).attr('fill', '#fff').text('Resistance (Ω)');

        // Generate data R0 = 100 at T0 = 20
        const R0 = 100;
        const T0 = 20;
        let dataCu = [], dataSemi = [], dataMang = [];
        for (let t = -50; t <= 200; t += 5) {
            // Cu: alpha = 0.00393
            dataCu.push({ x: t, y: R0 * (1 + 0.00393 * (t - T0)) });
            // Semi: roughly exponential decay or negative linear. Let's use simple negative linear for visual, bounded.
            let rSemi = R0 * (1 - 0.005 * (t - T0));
            if (rSemi < 10) rSemi = 10; // floor
            dataSemi.push({ x: t, y: rSemi });
            // Manganin: alpha = 0.00001
            dataMang.push({ x: t, y: R0 * (1 + 0.00001 * (t - T0)) });
        }

        const lineBase = d3.line().x(d => xScale(d.x)).y(d => yScale(d.y)).curve(d3.curveMonotoneX);

        svg.append('path').datum(dataCu).attr('fill', 'none').attr('stroke', 'var(--neon-cyan)').attr('stroke-width', 2).attr('d', lineBase);
        svg.append('path').datum(dataSemi).attr('fill', 'none').attr('stroke', '#ff5252').attr('stroke-width', 2).attr('d', lineBase);
        svg.append('path').datum(dataMang).attr('fill', 'none').attr('stroke', 'var(--electric-yellow)').attr('stroke-width', 2).attr('d', lineBase);

        // Indicator Line
        const indicator = svg.append('line')
            .attr('x1', xScale(20)).attr('x2', xScale(20))
            .attr('y1', 0).attr('y2', innerHeight)
            .attr('stroke', '#fff').attr('stroke-width', 1).attr('stroke-dasharray', '4,4');

        const indCircle1 = svg.append('circle').attr('r', 5).attr('fill', 'var(--neon-cyan)');
        const indCircle2 = svg.append('circle').attr('r', 5).attr('fill', '#ff5252');

        const slider = document.getElementById('rvt-temp-slider');
        const valDisp = document.getElementById('rvt-temp-val');

        function updateRvtSlider() {
            if (!slider) return;
            const t = parseInt(slider.value);
            valDisp.textContent = t;
            indicator.attr('x1', xScale(t)).attr('x2', xScale(t));
            indCircle1.attr('cx', xScale(t)).attr('cy', yScale(R0 * (1 + 0.00393 * (t - T0))));

            let rS = R0 * (1 - 0.005 * (t - T0)); if (rS < 10) rS = 10;
            indCircle2.attr('cx', xScale(t)).attr('cy', yScale(rS));
        }
        if (slider) {
            slider.addEventListener('input', updateRvtSlider);
            updateRvtSlider();
        }
    }

    // CARD 0.6: Resistor Colour Code Calculator
    const sel1 = document.getElementById('cc-sel-1');
    const sel2 = document.getElementById('cc-sel-2');
    const selMulti = document.getElementById('cc-sel-multi');
    const selTol = document.getElementById('cc-sel-tol');
    const b1 = document.querySelector('.b-1');
    const b2 = document.querySelector('.b-2');
    const bMulti = document.querySelector('.b-multi');
    const bTol = document.querySelector('.b-tol');
    const ccResult = document.getElementById('cc-result');

    function formatRes(val) {
        if (val >= 1e9) return (val / 1e9).toFixed(1) + ' GΩ';
        if (val >= 1e6) return (val / 1e6).toFixed(1) + ' MΩ';
        if (val >= 1e3) return (val / 1e3).toFixed(1) + ' kΩ';
        return val.toFixed(1) + ' Ω';
    }

    function updateCC() {
        if (!sel1 || !sel2 || !selMulti || !selTol) return;

        // Update colors
        b1.style.background = sel1.options[sel1.selectedIndex].style.background;
        b2.style.background = sel2.options[sel2.selectedIndex].style.background;
        bMulti.style.background = selMulti.options[selMulti.selectedIndex].style.background;
        bTol.style.background = selTol.options[selTol.selectedIndex].style.background;

        // Calculate value
        const v1 = parseInt(sel1.value);
        const v2 = parseInt(sel2.value);
        const multi = parseInt(selMulti.value);
        const tol = selTol.value;

        let baseVal = (v1 * 10) + v2;
        let finalVal = 0;

        if (multi === -1) finalVal = baseVal * 0.1;
        else if (multi === -2) finalVal = baseVal * 0.01;
        else finalVal = baseVal * Math.pow(10, multi);

        ccResult.innerHTML = `${formatRes(finalVal)} ± ${tol}%`;
    }

    [sel1, sel2, selMulti, selTol].forEach(sel => {
        if (sel) sel.addEventListener('change', updateCC);
    });
    updateCC(); // Init

    // CARD 0.7: Metal Info & Chart
    const metalRows = document.querySelectorAll('.metal-row');
    const metalName = document.getElementById('metal-name');
    const metalUse = document.getElementById('metal-use');
    const metalCard = document.getElementById('metal-info-card');

    metalRows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            if (metalName && metalUse && metalCard) {
                metalName.textContent = row.getAttribute('data-metal');
                metalUse.textContent = row.getAttribute('data-use');
                metalCard.style.opacity = 1;
            }
        });
        row.addEventListener('mouseleave', () => {
            if (metalCard) metalCard.style.opacity = 0;
        });
    });

    // D3 Bar Chart for Melting Points
    const mpContainer = document.getElementById('mp-chart');
    if (mpContainer && typeof d3 !== 'undefined') {
        const mpData = [
            { metal: 'Tin', mp: 231.8 },
            { metal: 'Lead', mp: 327.4 },
            { metal: 'Zinc', mp: 419.5 },
            { metal: 'Magnesium', mp: 650 },
            { metal: 'Aluminium', mp: 658.6 },
            { metal: 'Silver', mp: 961 },
            { metal: 'Copper', mp: 1084 },
            { metal: 'Nickel', mp: 1445 },
            { metal: 'Cobalt', mp: 1490 },
            { metal: 'Iron', mp: 1538 },
            { metal: 'Chromium', mp: 1850 },
            { metal: 'Molybdenum', mp: 2622 },
            { metal: 'Tungsten', mp: 3390 },
            { metal: 'Carbon', mp: 3550 }
        ];

        const margin = { top: 10, right: 30, bottom: 20, left: 70 };
        const width = mpContainer.clientWidth - margin.left - margin.right;
        const height = mpContainer.clientHeight - margin.top - margin.bottom;

        const svg = d3.select("#mp-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear()
            .domain([0, 4000])
            .range([0, width]);

        const y = d3.scaleBand()
            .range([0, height])
            .domain(mpData.map(d => d.metal))
            .padding(.1);

        const colorScale = d3.scaleSequential()
            .interpolator(d3.interpolateTurbo)
            .domain([0, 3600]);

        // Y axis
        svg.append("g")
            .call(d3.axisLeft(y).tickSize(0))
            .select(".domain").remove();

        // X axis (bottom)
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5))
            .attr("color", "var(--text-muted)");

        // Style Y axis text
        svg.selectAll(".tick text")
            .attr("fill", "var(--text-secondary)")
            .style("font-size", "9px")
            .style("font-family", "var(--font-body)");

        // Bars with animation
        svg.selectAll("myRect")
            .data(mpData)
            .join("rect")
            .attr("x", x(0))
            .attr("y", d => y(d.metal))
            .attr("width", 0) // Start at zero for animation
            .attr("height", y.bandwidth())
            .attr("fill", d => colorScale(d.mp))
            .attr("rx", 2)
            .transition()
            .duration(1500)
            .delay((d, i) => i * 100)
            .attr("width", d => x(d.mp));
    }

    // CARD 0.8: Dielectric Table Info
    const dRows = document.querySelectorAll('.dielectric-row');
    const dInfo = document.getElementById('dielectric-info');
    if (dInfo) {
        dRows.forEach(row => {
            row.addEventListener('mouseenter', () => {
                const use = row.getAttribute('data-use');
                dInfo.innerHTML = `<strong style="color:var(--neon-purple);">${use}</strong>`;
            });
            row.addEventListener('mouseleave', () => {
                dInfo.innerHTML = '<span class="text-muted">Hover over a material to see its application...</span>';
            });
        });
    }

    // CARD 0.9 (a): Basic Parallel Plate
    const slideAa = document.getElementById('slide-A-a');
    const slideda = document.getElementById('slide-d-a');
    const plateTopA = document.getElementById('plate-top-a');
    const plateBotA = document.getElementById('plate-bot-a');
    const dielectricA = document.getElementById('dielectric-a');
    const labelDa = document.getElementById('label-d-a');
    const arrowDa = document.getElementById('arrow-d-a');
    const resCapA = document.getElementById('res-cap-a');

    function updateCapA() {
        if (!slideAa || !slideda || !resCapA) return;
        const A = parseFloat(slideAa.value);
        const d = parseFloat(slideda.value);

        // Visual updates
        plateTopA.setAttribute('x', 100 - A / 2);
        plateTopA.setAttribute('width', A);
        plateBotA.setAttribute('x', 100 - A / 2);
        plateBotA.setAttribute('width', A);

        // top plate is at y=20 (height 8), bottom plate will be at y = 28 + d
        plateBotA.setAttribute('y', 28 + d);

        dielectricA.setAttribute('x', 100 - A / 2);
        dielectricA.setAttribute('width', A);
        dielectricA.setAttribute('height', d);

        // update label arrow
        if (labelDa && arrowDa) {
            labelDa.setAttribute('y', 28 + d / 2 + 4);
            arrowDa.setAttribute('d', `M 155 28 v ${d}`);
        }

        // Calculation mapping: A=100, d=40 -> 100pF -> C = (A/d) * 40
        const cVal = (A / d) * 40;
        resCapA.innerHTML = `C = <span style="color:#fff;">${cVal.toFixed(1)} pF</span>`;
    }

    if (slideAa) slideAa.addEventListener('input', updateCapA);
    if (slideda) slideda.addEventListener('input', updateCapA);
    updateCapA();

    // CARD 0.9 (f): Variable Capacitor
    const slideMesh = document.getElementById('slide-mesh');
    const rotorGroup = document.getElementById('rotor-group');
    if (slideMesh && rotorGroup) {
        slideMesh.addEventListener('input', () => {
            const val = parseFloat(slideMesh.value);
            // Move rotor group left to mesh
            rotorGroup.setAttribute('transform', `translate(${-val}, 0)`);
        });
    }

    // CARD 0.10: Series & Parallel Capacitors
    const sc1 = document.getElementById('scalc-c1');
    const sc2 = document.getElementById('scalc-c2');
    const sc3 = document.getElementById('scalc-c3');
    const sRes = document.getElementById('scalc-res');

    function updateSCalc() {
        if (!sc1 || !sc2 || !sc3 || !sRes) return;
        const c1 = parseFloat(sc1.value) || 0;
        const c2 = parseFloat(sc2.value) || 0;
        const c3 = parseFloat(sc3.value) || 0;

        // 1/Ceq = 1/C1 + 1/C2 + 1/C3
        let invCeq = 0;
        if (c1 > 0) invCeq += 1 / c1;
        if (c2 > 0) invCeq += 1 / c2;
        if (c3 > 0) invCeq += 1 / c3;

        if (invCeq > 0) {
            const ceq = 1 / invCeq;
            sRes.textContent = `Ceq = ${ceq.toFixed(2)} µF`;
        } else {
            sRes.textContent = `Ceq = 0.00 µF`;
        }
    }

    [sc1, sc2, sc3].forEach(el => {
        if (el) el.addEventListener('input', updateSCalc);
    });
    updateSCalc();

    const pc1 = document.getElementById('pcalc-c1');
    const pc2 = document.getElementById('pcalc-c2');
    const pc3 = document.getElementById('pcalc-c3');
    const pRes = document.getElementById('pcalc-res');

    function updatePCalc() {
        if (!pc1 || !pc2 || !pc3 || !pRes) return;
        const c1 = parseFloat(pc1.value) || 0;
        const c2 = parseFloat(pc2.value) || 0;
        const c3 = parseFloat(pc3.value) || 0;

        // Ceq = C1 + C2 + C3
        const ceq = c1 + c2 + c3;
        pRes.textContent = `Ceq = ${ceq.toFixed(2)} µF`;
    }

    [pc1, pc2, pc3].forEach(el => {
        if (el) el.addEventListener('input', updatePCalc);
    });
    updatePCalc();

    // CARD 0.11: Delta-Star Capacitor Conversion
    const dsCapToggle = document.getElementById('ds-cap-toggle');
    const starCapGroup = document.getElementById('star-cap-group');
    const deltaCapGroup = document.getElementById('delta-cap-group');
    const stDCapForms = document.getElementById('st-d-cap-forms');
    const dtSCapForms = document.getElementById('dt-s-cap-forms');
    const dsCapTitle = document.getElementById('ds-cap-title');
    const stDCapLbl = document.getElementById('st-d-cap-lbl');
    const dtSCapLbl = document.getElementById('dt-s-cap-lbl');

    if (dsCapToggle) {
        dsCapToggle.addEventListener('change', (e) => {
            const isStarToDelta = !e.target.checked; // default false -> Star to Delta

            if (isStarToDelta) {
                // Star to Delta Active
                starCapGroup.style.opacity = '1';
                starCapGroup.style.filter = 'none';
                deltaCapGroup.style.opacity = '0.2';
                deltaCapGroup.style.filter = 'grayscale(1)';

                stDCapForms.style.display = 'block';
                dtSCapForms.style.display = 'none';

                dsCapTitle.innerHTML = 'Star to Delta ($\\Delta$)';
                stDCapLbl.style.color = 'var(--text-primary)';
                dtSCapLbl.style.color = 'var(--text-muted)';
            } else {
                // Delta to Star Active
                deltaCapGroup.style.opacity = '1';
                deltaCapGroup.style.filter = 'none';
                starCapGroup.style.opacity = '0.2';
                starCapGroup.style.filter = 'grayscale(1)';

                dtSCapForms.style.display = 'block';
                stDCapForms.style.display = 'none';

                dsCapTitle.innerHTML = 'Delta ($\\Delta$) to Star';
                dtSCapLbl.style.color = 'var(--text-primary)';
                stDCapLbl.style.color = 'var(--text-muted)';
            }

            // Re-render KaTeX if available
            if (typeof renderMathInElement === 'function') {
                renderMathInElement(document.getElementById('ds-cap-title'));
            }
        });

        // Init labels correctly based on default state
        // Init labels correctly based on default state
        stDCapLbl.style.color = 'var(--text-primary)';
        dtSCapLbl.style.color = 'var(--text-muted)';
    }

    // CARD 0.12 - 0.14: Capacitor Transients (RC Circuit)
    const btnCharge = document.getElementById('btn-rc-charge');
    const btnDischarge = document.getElementById('btn-rc-discharge');
    const switchBlade = document.getElementById('rc-switch-blade');
    const tauSlider = document.getElementById('rc-tau-slider');
    const tauVal = document.getElementById('rc-tau-val');
    const chartTitle = document.getElementById('rc-chart-title');
    const chartContainer = document.getElementById('rc-chart-container');

    let rcState = 'charge'; // 'charge' or 'discharge'
    let rcInterval = null;
    let rcTime = 0;
    const rcData = [];
    const maxTime = 30; // 30 seconds max window

    // Initialize D3 Chart for RC
    let rcSvg, xRc, yRc, pathLine, areaGen, pathPath, areaPath;

    if (chartContainer && typeof d3 !== 'undefined') {
        const margin = { top: 20, right: 20, bottom: 25, left: 35 };
        const width = chartContainer.clientWidth - margin.left - margin.right;
        const height = chartContainer.clientHeight - margin.top - margin.bottom;

        rcSvg = d3.select("#rc-chart-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        xRc = d3.scaleLinear().domain([0, maxTime]).range([0, width]);
        yRc = d3.scaleLinear().domain([0, 100]).range([height, 0]); // 0 to 100% of Vs

        rcSvg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xRc).ticks(5))
            .attr("color", "var(--text-muted)");

        rcSvg.append("g")
            .call(d3.axisLeft(yRc).ticks(4).tickFormat(d => d + "%"))
            .attr("color", "var(--text-muted)");

        rcSvg.selectAll(".tick text")
            .attr("fill", "var(--text-secondary)")
            .style("font-size", "9px")
            .style("font-family", "var(--font-body)");

        pathLine = d3.line()
            .x(d => xRc(d.t))
            .y(d => yRc(d.v))
            .curve(d3.curveMonotoneX);

        areaGen = d3.area()
            .x(d => xRc(d.t))
            .y0(height)
            .y1(d => yRc(d.v))
            .curve(d3.curveMonotoneX);

        areaPath = rcSvg.append("path")
            .attr("fill", "rgba(0, 240, 255, 0.2)")
            .attr("d", areaGen(rcData));

        pathPath = rcSvg.append("path")
            .attr("fill", "none")
            .attr("stroke", "var(--neon-cyan)")
            .attr("stroke-width", 2)
            .attr("d", pathLine(rcData));

        // Initial populate to show curve
        resetRCData();
    }

    function resetRCData() {
        rcData.length = 0;
        rcTime = 0;
        updateRCChart();
    }

    function updateRCChart() {
        if (!rcSvg) return;
        pathPath.attr("d", pathLine(rcData));
        areaPath.attr("d", areaGen(rcData));
    }

    function stepRC() {
        let tau = parseFloat(tauSlider.value);
        rcTime += 0.5; // step time

        if (rcTime > maxTime) rcData.shift(); // sliding window optional, or just stop

        let v = 0;
        if (rcState === 'charge') {
            v = 100 * (1 - Math.exp(-rcTime / tau));
            // Color update for charge
            pathPath.attr("stroke", "var(--neon-cyan)");
            areaPath.attr("fill", "rgba(0, 240, 255, 0.2)");
        } else {
            v = 100 * Math.exp(-rcTime / tau);
            // Color update for discharge
            pathPath.attr("stroke", "var(--neon-purple)");
            areaPath.attr("fill", "rgba(188, 19, 254, 0.2)");
        }

        rcData.push({ t: rcTime <= maxTime ? rcTime : rcData[rcData.length - 1].t + 0.5, v: v });

        // Adjust X domain if sliding
        if (rcTime > maxTime) {
            xRc.domain([rcTime - maxTime, rcTime]);
            rcSvg.select(".x-axis").call(d3.axisBottom(xRc)); // Requires adding class to x-axis g
        } else {
            xRc.domain([0, maxTime]);
        }

        updateRCChart();

        // Stop if reached near steady state
        if ((rcState === 'charge' && v > 99.5) || (rcState === 'discharge' && v < 0.5)) {
            clearInterval(rcInterval);
        }
    }

    function startRCMode(mode) {
        clearInterval(rcInterval);
        rcState = mode;
        resetRCData();

        if (mode === 'charge') {
            btnCharge.classList.add('active');
            btnDischarge.classList.remove('active');
            switchBlade.style.transform = 'rotate(0deg)'; // connected to source
            chartTitle.innerHTML = 'Charging: $V_C = V_S(1-e^{-t/\\tau})$';
        } else {
            btnDischarge.classList.add('active');
            btnCharge.classList.remove('active');
            switchBlade.style.transform = 'rotate(90deg)'; // points down to discharge loop terminal
            chartTitle.innerHTML = 'Discharging: $V_C = V_S(e^{-t/\\tau})$';
        }

        if (typeof renderMathInElement === 'function') {
            renderMathInElement(chartTitle);
        }

        // Push initial point
        rcData.push({ t: 0, v: mode === 'charge' ? 0 : 100 });
        updateRCChart();

        rcInterval = setInterval(stepRC, 100); // 100ms real time updates
    }

    if (btnCharge && btnDischarge && tauSlider) {
        btnCharge.addEventListener('click', () => startRCMode('charge'));
        btnDischarge.addEventListener('click', () => startRCMode('discharge'));

        tauSlider.addEventListener('input', () => {
            tauVal.textContent = parseFloat(tauSlider.value).toFixed(1);
            // Re-run current mode to see effect
            startRCMode(rcState);
        });

        // Init
        startRCMode('charge');
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
