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

    // AOS initialization remains (but might be duplicated, which is fine)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: false,
            offset: 100
        });
    }

    // ── Glass Sidebar Toggle ──
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const glassSidebar = document.getElementById('glass-sidebar');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    function openSidebar() {
        if (glassSidebar) glassSidebar.classList.add('open');
        if (sidebarOverlay) sidebarOverlay.classList.add('active');
        if (sidebarToggle) sidebarToggle.classList.add('hidden');
    }

    function closeSidebar() {
        if (glassSidebar) glassSidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        if (sidebarToggle) sidebarToggle.classList.remove('hidden');
    }

    if (sidebarToggle) sidebarToggle.addEventListener('click', openSidebar);
    if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    // ── Re-render KaTeX ──
    function reRenderMath() {
        if (typeof renderMathInElement === 'function') {
            renderMathInElement(document.body, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "$", right: "$", display: false }
                ],
                throwOnError: false
            });
        }
    }

    // ── Unit Switching Logic ──
    const sections = document.querySelectorAll('.circuit-section');
    const sidebarLinks = document.querySelectorAll('.glass-sidebar__link');

    function switchUnit(targetId) {
        // Hide all sections, show selected
        sections.forEach(s => s.classList.remove('active'));
        const target = document.querySelector(targetId);
        if (target) target.classList.add('active');

        // Update sidebar active link
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === targetId) {
                link.classList.add('active');
            }
        });

        // Force instant scroll to top (override CSS smooth scroll)
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        // Restore smooth scroll after reset
        requestAnimationFrame(() => {
            document.documentElement.style.scrollBehavior = '';
        });

        reRenderMath();
        if (typeof AOS !== 'undefined') setTimeout(() => AOS.refresh(), 100);
    }

    // Sidebar link click → unit switching
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') switchUnit(targetId);
            closeSidebar();
        });
    });

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

    // 11. Thevenin Step-by-Step Animation
    const thevStepBtns = document.querySelectorAll('.thev-step-btn');
    if (thevStepBtns.length) {
        const thevOverlays = {
            0: [], // original - just reset
            1: ['#thev-step-overlay'],
            2: ['#thev-rth-overlay'],
            3: ['#thev-final-overlay']
        };
        const thevLabels = [
            'Original circuit with load Z_L',
            'Step 1: Remove load, find open-circuit voltage Voc across a-b',
            'Step 2: Kill all sources, find Rth looking into a-b',
            'Step 3: Thevenin equivalent = Vth in series with Rth'
        ];

        thevStepBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const step = parseInt(btn.getAttribute('data-step'));
                thevStepBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Hide all overlays
                ['#thev-step-overlay', '#thev-rth-overlay', '#thev-final-overlay'].forEach(sel => {
                    gsap.to(sel, { opacity: 0, duration: 0.3 });
                });
                // Hide/show load based on step
                if (step >= 1 && step <= 2) {
                    gsap.to('#thev-load', { opacity: 0.2, duration: 0.3 });
                    gsap.to('#thev-load-txt', { opacity: 0.2, duration: 0.3 });
                } else {
                    gsap.to('#thev-load', { opacity: 1, duration: 0.3 });
                    gsap.to('#thev-load-txt', { opacity: 1, duration: 0.3 });
                }
                // Show relevant overlays
                if (thevOverlays[step]) {
                    thevOverlays[step].forEach(sel => {
                        gsap.to(sel, { opacity: 1, duration: 0.5, delay: 0.2 });
                    });
                }
                // Show original circuit or hide it for final
                gsap.to('#thev-step-original', { opacity: step === 3 ? 0 : 1, duration: 0.3 });
                // Update label
                const label = document.getElementById('thev-step-label');
                if (label) label.textContent = thevLabels[step] || '';
            });
        });
    }

    // 12. Thevenin Calculator
    const thevCalcBtn = document.getElementById('thev-calc-btn');
    if (thevCalcBtn) {
        thevCalcBtn.addEventListener('click', () => {
            const vs = parseFloat(document.getElementById('thev-calc-vs').value);
            const r1 = parseFloat(document.getElementById('thev-calc-r1').value);
            const r2 = parseFloat(document.getElementById('thev-calc-r2').value);
            const rl = parseFloat(document.getElementById('thev-calc-rl').value);
            if ([vs, r1, r2, rl].some(isNaN) || r1 + r2 === 0) return;
            const vth = vs * (r2 / (r1 + r2));
            const rth = (r1 * r2) / (r1 + r2);
            const il = vth / (rth + rl);
            const res = document.getElementById('thev-calc-result');
            res.style.display = 'block';
            res.innerHTML = `V<sub>th</sub> = ${vth.toFixed(2)} V &nbsp;|&nbsp; R<sub>th</sub> = ${rth.toFixed(2)} Ω &nbsp;|&nbsp; I<sub>L</sub> = ${il.toFixed(3)} A`;
        });
    }

    // 13. Norton Step-by-Step Animation
    const nortonStepBtns = document.querySelectorAll('.norton-step-btn');
    if (nortonStepBtns.length) {
        const nortonOverlays = {
            0: [],
            1: ['#norton-isc-overlay'],
            2: ['#norton-rn-overlay'],
            3: ['#norton-final-overlay']
        };
        const nortonLabels = [
            'Original circuit with load Z_L',
            'Step 1: Short-circuit terminals a-b, find Isc',
            'Step 2: Kill all sources, find Rn = Rth looking into a-b',
            'Step 3: Norton equivalent = IN in parallel with RN'
        ];

        nortonStepBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const step = parseInt(btn.getAttribute('data-step'));
                nortonStepBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                ['#norton-isc-overlay', '#norton-rn-overlay', '#norton-final-overlay'].forEach(sel => {
                    gsap.to(sel, { opacity: 0, duration: 0.3 });
                });
                if (step >= 1 && step <= 2) {
                    gsap.to('#norton-load', { opacity: 0.2, duration: 0.3 });
                    gsap.to('#norton-load-txt', { opacity: 0.2, duration: 0.3 });
                } else {
                    gsap.to('#norton-load', { opacity: 1, duration: 0.3 });
                    gsap.to('#norton-load-txt', { opacity: 1, duration: 0.3 });
                }
                if (nortonOverlays[step]) {
                    nortonOverlays[step].forEach(sel => {
                        gsap.to(sel, { opacity: 1, duration: 0.5, delay: 0.2 });
                    });
                }
                gsap.to('#norton-step-original', { opacity: step === 3 ? 0 : 1, duration: 0.3 });
                const label = document.getElementById('norton-step-label');
                if (label) label.textContent = nortonLabels[step] || '';
            });
        });
    }

    // 14. Norton Calculator
    const nortonCalcBtn = document.getElementById('norton-calc-btn');
    if (nortonCalcBtn) {
        nortonCalcBtn.addEventListener('click', () => {
            const vth = parseFloat(document.getElementById('norton-calc-vth').value);
            const rth = parseFloat(document.getElementById('norton-calc-rth').value);
            const rl = parseFloat(document.getElementById('norton-calc-rl').value);
            if ([vth, rth, rl].some(isNaN) || rth === 0) return;
            const iN = vth / rth;
            const rN = rth;
            const il = iN * (rN / (rN + rl));
            const res = document.getElementById('norton-calc-result');
            res.style.display = 'block';
            res.innerHTML = `I<sub>N</sub> = ${iN.toFixed(3)} A &nbsp;|&nbsp; R<sub>N</sub> = ${rN.toFixed(2)} Ω &nbsp;|&nbsp; I<sub>L</sub> = ${il.toFixed(3)} A`;
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
            switchBlade.style.transform = 'rotate(-60deg)'; // connected to discharge loop
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

    // --- CARD 0.15: Capacitor Key Points (Energy Live Slider) ---
    const capEnergySlide = document.getElementById('cap-f-v-slide');
    const capEnergyValTxt = document.getElementById('cap-f-v-val');
    const capEnergyE = document.getElementById('cap-f-e-val');
    const capEnergyGauge = document.getElementById('cap-f-e-gauge');

    if (capEnergySlide && capEnergyValTxt && capEnergyE && capEnergyGauge) {
        capEnergySlide.addEventListener('input', function () {
            let v = parseFloat(this.value);
            capEnergyValTxt.textContent = v;

            // Assume C = 1F for visual simplicity
            let E = 0.5 * 1 * (v * v);
            capEnergyE.textContent = E.toFixed(1) + ' J';

            // Gauge max is 200J (since 0.5 * 1 * 20^2 = 200)
            let percent = (E / 200) * 100;
            capEnergyGauge.style.width = percent + '%';

            if (percent > 75) {
                capEnergyGauge.style.backgroundColor = 'var(--neon-pink)';
            } else if (percent > 40) {
                capEnergyGauge.style.backgroundColor = 'var(--neon-cyan)';
            } else {
                capEnergyGauge.style.backgroundColor = 'var(--electric-yellow)';
            }
        });
    }

    // --- CARD 0.16: Inductor Fundamentals (Self & Mutual Sliders) ---
    const indDiDtSlide = document.getElementById('slide-di-dt');
    const indVLVal = document.getElementById('val-vL');

    if (indDiDtSlide && indVLVal) {
        indDiDtSlide.addEventListener('input', function () {
            let didt = parseFloat(this.value);
            // Assume L = 1H for visual simplicity
            let vL = 1 * didt;
            indVLVal.textContent = vL.toFixed(1);
        });
    }

    const indKSlide = document.getElementById('slide-k');
    const indKVal = document.getElementById('val-k');
    const ring2 = document.getElementById('k-ring-2');

    if (indKSlide && indKVal && ring2) {
        indKSlide.addEventListener('input', function () {
            let k = parseFloat(this.value);
            indKVal.textContent = k.toFixed(2);
            // Translate the right ring towards the left ring as K increases (max overlap when K=1)
            let intersectDist = k * 30;
            ring2.style.transform = `translateX(-${intersectDist}px)`;
        });
    }

    // --- CARD 0.20: Magnetic Coupling ---
    const tglSeriesDots = document.getElementById('toggle-series-dots');
    const lblSeriesAid = document.getElementById('lbl-series-aid');
    const formSeriesLeq = document.getElementById('formula-series-leq');
    const dotSeries2 = document.getElementById('dot-series-2');

    if (tglSeriesDots && lblSeriesAid && formSeriesLeq && dotSeries2) {
        tglSeriesDots.addEventListener('change', function () {
            if (this.checked) {
                // Aiding
                lblSeriesAid.textContent = "Aiding";
                lblSeriesAid.style.color = "var(--neon-cyan)";
                formSeriesLeq.innerHTML = "$$ L_{eq} = L_1 + L_2 + 2M $$";
                dotSeries2.setAttribute('cx', '155');
            } else {
                // Opposing
                lblSeriesAid.textContent = "Opposing";
                lblSeriesAid.style.color = "var(--neon-pink)";
                formSeriesLeq.innerHTML = "$$ L_{eq} = L_1 + L_2 - 2M $$";
                dotSeries2.setAttribute('cx', '195');
            }
            if (typeof renderMathInElement === 'function') {
                renderMathInElement(formSeriesLeq);
            }
        });
    }

    const tglParaDots = document.getElementById('toggle-para-dots');
    const lblParaAid = document.getElementById('lbl-para-aid');
    const formParaLeq = document.getElementById('formula-para-leq');
    const dotPara2 = document.getElementById('dot-para-2');

    if (tglParaDots && lblParaAid && formParaLeq && dotPara2) {
        tglParaDots.addEventListener('change', function () {
            if (this.checked) {
                // Aiding
                lblParaAid.textContent = "Aiding";
                lblParaAid.style.color = "var(--neon-purple)";
                formParaLeq.innerHTML = "$$ L_{eq} = \\frac{L_1 L_2 - M^2}{L_1 + L_2 - 2M} $$";
                dotPara2.setAttribute('cx', '75');
            } else {
                // Opposing
                lblParaAid.textContent = "Opposing";
                lblParaAid.style.color = "var(--neon-pink)";
                formParaLeq.innerHTML = "$$ L_{eq} = \\frac{L_1 L_2 - M^2}{L_1 + L_2 + 2M} $$";
                dotPara2.setAttribute('cx', '105');
            }
            if (typeof renderMathInElement === 'function') {
                renderMathInElement(formParaLeq);
            }
        });
    }

    // --- CARD 0.21: RL Transients ---
    const btnRlConnect = document.getElementById('btn-rl-connect');
    const btnRlDisconnect = document.getElementById('btn-rl-disconnect');
    const slideRlTau = document.getElementById('rl-tau-slider');
    const valRlTau = document.getElementById('rl-tau-val');
    const rlSwitch = document.getElementById('rl-switch-blade');
    const rlGlow = document.getElementById('rl-glow');
    const rlChartContainer = document.getElementById('rl-chart-container');
    const rlChartTitle = document.getElementById('rl-chart-title');

    if (rlChartContainer && typeof d3 !== 'undefined') {
        let rlMode = 'rise'; // 'rise' or 'decay'
        let rlData = [];
        let rlInterval;
        let rlTime = 0;

        const rlMargin = { top: 30, right: 20, bottom: 30, left: 40 };
        const rlWidth = rlChartContainer.clientWidth - rlMargin.left - rlMargin.right;
        const rlHeight = rlChartContainer.clientHeight - rlMargin.top - rlMargin.bottom;

        const rlSvg = d3.select("#rl-chart-container")
            .append("svg")
            .attr("width", rlWidth + rlMargin.left + rlMargin.right)
            .attr("height", rlHeight + rlMargin.top + rlMargin.bottom)
            .append("g")
            .attr("transform", `translate(${rlMargin.left},${rlMargin.top})`);

        const rlX = d3.scaleLinear().domain([0, 10]).range([0, rlWidth]);
        const rlY = d3.scaleLinear().domain([0, 100]).range([rlHeight, 0]); // 0 to 100% current

        rlSvg.append("g")
            .attr("transform", `translate(0,${rlHeight})`)
            .call(d3.axisBottom(rlX).ticks(5).tickFormat(d => d + "s"));
        rlSvg.append("g")
            .call(d3.axisLeft(rlY).ticks(5).tickFormat(d => d + "%"));

        // grid lines
        rlSvg.append("g").attr("class", "grid")
            .call(d3.axisLeft(rlY).ticks(5).tickSize(-rlWidth).tickFormat(""))
            .style("stroke-dasharray", ("3,3")).style("opacity", 0.1);

        const rlLine = d3.line()
            .x(d => rlX(d.t))
            .y(d => rlY(d.i))
            .curve(d3.curveMonotoneX);

        const rlPath = rlSvg.append("path")
            .datum(rlData)
            .attr("fill", "none")
            .attr("stroke", "var(--electric-yellow)")
            .attr("stroke-width", 2);

        function stepRL() {
            rlTime += 0.1;
            if (rlTime > 10) rlTime = 10;

            let tau = slideRlTau ? parseFloat(slideRlTau.value) : 1.5;
            let i_val = 0;

            if (rlMode === 'rise') {
                i_val = 100 * (1 - Math.exp(-rlTime / tau));
            } else {
                i_val = 100 * Math.exp(-rlTime / tau);
            }

            rlData.push({ t: rlTime, i: i_val });

            rlPath.datum(rlData).attr("d", rlLine);

            rlGlow.style.opacity = (i_val / 100) * 0.8;

            if (rlTime >= 10) {
                clearInterval(rlInterval);
            }
        }

        function startRLMode(mode) {
            clearInterval(rlInterval);
            rlMode = mode;
            rlTime = 0;
            rlData = [];
            rlPath.datum(rlData).attr("d", rlLine);

            if (mode === 'rise') {
                btnRlConnect.classList.add('active');
                btnRlDisconnect.classList.remove('active');
                if (rlSwitch) rlSwitch.style.transform = 'rotate(0deg)'; // connected
                if (rlChartTitle) rlChartTitle.innerHTML = 'Current Rise: $I_L = I_{max}(1-e^{-t/\\tau})$';
            } else {
                btnRlDisconnect.classList.add('active');
                btnRlConnect.classList.remove('active');
                if (rlSwitch) rlSwitch.style.transform = 'rotate(-60deg)'; // disconnected / shorted
                if (rlChartTitle) rlChartTitle.innerHTML = 'Current Decay: $I_L = I_{max}(e^{-t/\\tau})$';
            }

            if (typeof renderMathInElement === 'function') {
                renderMathInElement(rlChartTitle);
            }

            rlData.push({ t: 0, i: mode === 'rise' ? 0 : 100 });
            rlPath.datum(rlData).attr("d", rlLine);
            rlInterval = setInterval(stepRL, 100);
        }

        if (btnRlConnect && btnRlDisconnect && slideRlTau) {
            btnRlConnect.addEventListener('click', () => startRLMode('rise'));
            btnRlDisconnect.addEventListener('click', () => startRLMode('decay'));
            slideRlTau.addEventListener('input', () => {
                valRlTau.textContent = parseFloat(slideRlTau.value).toFixed(1);
                startRLMode(rlMode);
            });
            startRLMode('rise');
        }
    }

    // --- CARD 0.22: RLC Circuit & Damping ---
    const slideRlcR = document.getElementById('rlc-r-slider');
    const valRlcZeta = document.getElementById('rlc-zeta-val');
    const rlcCurveContainer = document.getElementById('rlc-curve-container');

    if (rlcCurveContainer && typeof d3 !== 'undefined') {
        const rlcMargin = { top: 20, right: 20, bottom: 30, left: 40 };
        const rlcWidth = rlcCurveContainer.clientWidth - rlcMargin.left - rlcMargin.right;
        const rlcHeight = rlcCurveContainer.clientHeight - rlcMargin.top - rlcMargin.bottom;

        const rlcSvg = d3.select("#rlc-curve-container")
            .append("svg")
            .attr("width", rlcWidth + rlcMargin.left + rlcMargin.right)
            .attr("height", rlcHeight + rlcMargin.top + rlcMargin.bottom)
            .append("g")
            .attr("transform", `translate(${rlcMargin.left},${rlcMargin.top})`);

        const rlcX = d3.scaleLinear().domain([0, 15]).range([0, rlcWidth]);
        const rlcY = d3.scaleLinear().domain([-0.5, 1.5]).range([rlcHeight, 0]);

        rlcSvg.append("g")
            .attr("transform", `translate(0,${rlcY(0)})`) // axis at y=0
            .call(d3.axisBottom(rlcX).ticks(5).tickFormat(d => d + "s"));

        rlcSvg.append("g")
            .call(d3.axisLeft(rlcY).ticks(5));

        const rlcLine = d3.line()
            .x(d => rlcX(d.t))
            .y(d => rlcY(d.v))
            .curve(d3.curveMonotoneX);

        const rlcPath = rlcSvg.append("path")
            .attr("fill", "none")
            .attr("stroke", "var(--neon-purple)")
            .attr("stroke-width", 2);

        function drawRLCCurve(zeta) {
            let data = [];
            let w0 = 1;
            for (let t = 0; t <= 15; t += 0.1) {
                let v = 0;
                if (zeta < 1) {
                    // Underdamped
                    let wd = w0 * Math.sqrt(1 - zeta * zeta);
                    v = 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + (zeta / (Math.sqrt(1 - zeta * zeta))) * Math.sin(wd * t));
                } else if (zeta === 1) {
                    // Critically damped
                    v = 1 - Math.exp(-w0 * t) * (1 + w0 * t);
                } else {
                    // Overdamped
                    let s1 = -w0 * (zeta - Math.sqrt(zeta * zeta - 1));
                    let s2 = -w0 * (zeta + Math.sqrt(zeta * zeta - 1));
                    v = 1 - (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1);
                }
                data.push({ t: t, v: v });
            }

            rlcPath.datum(data).attr("d", rlcLine)
                .attr("stroke", zeta < 1 ? "var(--neon-purple)" : (zeta === 1 ? "var(--neon-cyan)" : "var(--electric-yellow)"));
        }

        if (slideRlcR) {
            slideRlcR.addEventListener('input', function () {
                let r = parseFloat(this.value);
                let zeta = r;

                let type = "Underdamped";
                if (zeta === 1) type = "Critically Damped";
                if (zeta > 1) type = "Overdamped";

                valRlcZeta.innerHTML = `$\\zeta = ${zeta.toFixed(2)}$ (${type})`;
                if (typeof renderMathInElement === 'function') {
                    renderMathInElement(valRlcZeta);
                }

                drawRLCCurve(zeta);
            });
            drawRLCCurve(0.5); // init
        }
    }

    // ═══════ CARD 0.23: RLC Three-Panel Comparison ═══════
    const rlcThreePanel = document.getElementById('rlc-three-panel');
    if (rlcThreePanel && typeof d3 !== 'undefined') {
        const m = { top: 20, right: 20, bottom: 30, left: 40 };
        const w = rlcThreePanel.clientWidth - m.left - m.right;
        const h = rlcThreePanel.clientHeight - m.top - m.bottom;
        const svg3 = d3.select("#rlc-three-panel").append("svg")
            .attr("width", w + m.left + m.right).attr("height", h + m.top + m.bottom)
            .append("g").attr("transform", `translate(${m.left},${m.top})`);
        const x3 = d3.scaleLinear().domain([0, 15]).range([0, w]);
        const y3 = d3.scaleLinear().domain([-0.3, 1.5]).range([h, 0]);
        svg3.append("g").attr("transform", `translate(0,${y3(0)})`).call(d3.axisBottom(x3).ticks(5).tickFormat(d => d + "s"));
        svg3.append("g").call(d3.axisLeft(y3).ticks(5));

        function genRLCData(zeta) {
            let data = [], w0 = 1;
            for (let t = 0; t <= 15; t += 0.1) {
                let v = 0;
                if (zeta < 1) { let wd = w0 * Math.sqrt(1 - zeta * zeta); v = 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t)); }
                else if (zeta === 1) { v = 1 - Math.exp(-w0 * t) * (1 + w0 * t); }
                else { let s1 = -w0 * (zeta - Math.sqrt(zeta * zeta - 1)), s2 = -w0 * (zeta + Math.sqrt(zeta * zeta - 1)); v = 1 - (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1); }
                data.push({ t, v });
            }
            return data;
        }
        const line3 = d3.line().x(d => x3(d.t)).y(d => y3(d.v)).curve(d3.curveMonotoneX);
        [{ z: 1.5, c: "#f97316" }, { z: 1, c: "#facc15" }, { z: 0.3, c: "#00f5ff" }].forEach(cfg => {
            svg3.append("path").datum(genRLCData(cfg.z)).attr("fill", "none").attr("stroke", cfg.c).attr("stroke-width", 2).attr("d", line3);
        });
        // Steady-state line
        svg3.append("line").attr("x1", 0).attr("x2", w).attr("y1", y3(1)).attr("y2", y3(1)).attr("stroke", "#555").attr("stroke-dasharray", "4,4");
    }

    // ═══════ CARD 0.23: RLC Classifier ═══════
    const btnClassify = document.getElementById('btn-rlc-classify');
    if (btnClassify) {
        btnClassify.addEventListener('click', function () {
            const R = parseFloat(document.getElementById('rlc-class-r').value) || 10;
            const L = parseFloat(document.getElementById('rlc-class-l').value) || 1;
            const C = parseFloat(document.getElementById('rlc-class-c').value) || 0.01;
            const alpha = R / (2 * L);
            const w0 = 1 / Math.sqrt(L * C);
            const zeta = alpha / w0;
            const threshold = 4 * L / (R * R);
            let caseType, caseColor;
            if (zeta > 1) { caseType = "OVERDAMPED"; caseColor = "#f97316"; }
            else if (Math.abs(zeta - 1) < 0.01) { caseType = "CRITICALLY DAMPED"; caseColor = "#facc15"; }
            else { caseType = "UNDERDAMPED"; caseColor = "#00f5ff"; }

            const resultDiv = document.getElementById('rlc-class-result');
            resultDiv.innerHTML = `
                <p style="color:${caseColor}; font-size:1.2rem; font-weight:bold; margin:0 0 8px;">${caseType}</p>
                <p style="margin:2px 0;">$\\alpha = ${alpha.toFixed(3)}$, $\\omega_0 = ${w0.toFixed(3)}$</p>
                <p style="margin:2px 0;">$\\zeta = ${zeta.toFixed(4)}$</p>
                <p style="margin:2px 0; color:var(--text-muted);">C = ${C} vs $4L/R^2$ = ${threshold.toFixed(6)}</p>
            `;
            if (typeof renderMathInElement === 'function') renderMathInElement(resultDiv);

            // ζ gauge arrow position (0 to 100%)
            const arrow = document.getElementById('rlc-zeta-arrow');
            if (arrow) {
                let pct = Math.min(zeta / 2, 1) * 100; // 0→0%, 2→100%
                arrow.style.left = pct + '%';
            }
        });
    }

    // ═══════ CARD 0.24: Step Response Decomposition Chart ═══════
    const stepDecompChart = document.getElementById('step-decomp-chart');
    if (stepDecompChart && typeof d3 !== 'undefined') {
        const m = { top: 15, right: 15, bottom: 25, left: 35 };
        const w = stepDecompChart.clientWidth - m.left - m.right;
        const h = stepDecompChart.clientHeight - m.top - m.bottom;
        const svgD = d3.select("#step-decomp-chart").append("svg")
            .attr("width", w + m.left + m.right).attr("height", h + m.top + m.bottom)
            .append("g").attr("transform", `translate(${m.left},${m.top})`);
        const xD = d3.scaleLinear().domain([0, 12]).range([0, w]);
        const yD = d3.scaleLinear().domain([-0.3, 1.5]).range([h, 0]);
        svgD.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(xD).ticks(4));
        svgD.append("g").call(d3.axisLeft(yD).ticks(4));
        const lineD = d3.line().x(d => xD(d.t)).y(d => yD(d.v)).curve(d3.curveMonotoneX);

        // Forced (DC steady-state) = horizontal line at 1
        let forced = []; for (let t = 0; t <= 12; t += 0.2) forced.push({ t, v: 1 });
        svgD.append("path").datum(forced).attr("fill", "none").attr("stroke", "#00ff88").attr("stroke-width", 1.5).attr("stroke-dasharray", "5,3").attr("d", lineD);

        // Natural (transient, decays to 0)
        let natural = []; let zeta2 = 0.3, w02 = 1, wd2 = w02 * Math.sqrt(1 - zeta2 * zeta2);
        for (let t = 0; t <= 12; t += 0.1) {
            let v = -Math.exp(-zeta2 * w02 * t) * (Math.cos(wd2 * t) + (zeta2 / Math.sqrt(1 - zeta2 * zeta2)) * Math.sin(wd2 * t));
            natural.push({ t, v });
        }
        svgD.append("path").datum(natural).attr("fill", "none").attr("stroke", "#fb7185").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("d", lineD);

        // Complete = Forced + Natural
        let complete = []; for (let t = 0; t <= 12; t += 0.1) {
            let vn = -Math.exp(-zeta2 * w02 * t) * (Math.cos(wd2 * t) + (zeta2 / Math.sqrt(1 - zeta2 * zeta2)) * Math.sin(wd2 * t));
            complete.push({ t, v: 1 + vn });
        }
        svgD.append("path").datum(complete).attr("fill", "none").attr("stroke", "var(--electric-yellow)").attr("stroke-width", 2.5).attr("d", lineD);

        // Legend
        [{ y: 10, c: "#00ff88", t: "Forced" }, { y: 25, c: "#fb7185", t: "Natural" }, { y: 40, c: "#facc15", t: "Complete" }].forEach(l => {
            svgD.append("line").attr("x1", w - 80).attr("x2", w - 60).attr("y1", l.y).attr("y2", l.y).attr("stroke", l.c).attr("stroke-width", 2);
            svgD.append("text").attr("x", w - 55).attr("y", l.y + 4).attr("fill", l.c).attr("font-size", "10px").text(l.t);
        });
    }

    // ═══════ CARD 0.26: KCL Interactive Solver ═══════
    const kclI1 = document.getElementById('kcl-i1');
    const kclI2 = document.getElementById('kcl-i2');
    const kclI3 = document.getElementById('kcl-i3');
    if (kclI1 && kclI2 && kclI3) {
        function updateKCL() {
            const i1 = parseFloat(kclI1.value);
            const i2 = parseFloat(kclI2.value);
            const i3 = parseFloat(kclI3.value);
            const i4 = i1 - i2 - i3;
            document.getElementById('kcl-i1-val').textContent = i1.toFixed(1) + ' A';
            document.getElementById('kcl-i2-val').textContent = i2.toFixed(1) + ' A';
            document.getElementById('kcl-i3-val').textContent = i3.toFixed(1) + ' A';
            document.getElementById('kcl-i4-val').textContent = i4.toFixed(1);
            // SVG labels
            const l1 = document.getElementById('kcl-label-i1'); if (l1) l1.textContent = 'I₁=' + i1.toFixed(1);
            const l2 = document.getElementById('kcl-label-i2'); if (l2) l2.textContent = 'I₂=' + i2.toFixed(1);
            const l3 = document.getElementById('kcl-label-i3'); if (l3) l3.textContent = 'I₃=' + i3.toFixed(1);
            const l4 = document.getElementById('kcl-label-i4'); if (l4) l4.textContent = 'I₄=' + i4.toFixed(1);
            const eq = document.getElementById('kcl-equation-svg'); if (eq) eq.textContent = `${i1.toFixed(1)} = ${i2.toFixed(1)} + ${i3.toFixed(1)} + ${i4.toFixed(1)}`;
            const meter = document.getElementById('kcl-balance-meter');
            if (meter) { meter.style.background = 'rgba(0,255,100,0.08)'; meter.style.color = '#00ff64'; meter.textContent = '✓ BALANCED — ΣI = 0'; }
        }
        kclI1.addEventListener('input', updateKCL);
        kclI2.addEventListener('input', updateKCL);
        kclI3.addEventListener('input', updateKCL);
        updateKCL();
    }

    // ═══════ CARD 0.27: KVL Interactive Solver ═══════
    const kvlV1 = document.getElementById('kvl-v1');
    const kvlR1 = document.getElementById('kvl-r1');
    const kvlR2 = document.getElementById('kvl-r2');
    const kvlR3 = document.getElementById('kvl-r3');
    if (kvlV1 && kvlR1 && kvlR2 && kvlR3) {
        function updateKVL() {
            const v1 = parseFloat(kvlV1.value);
            const r1 = parseFloat(kvlR1.value);
            const r2 = parseFloat(kvlR2.value);
            const r3 = parseFloat(kvlR3.value);
            const rTotal = r1 + r2 + r3;
            const I = v1 / rTotal;
            const vr1 = I * r1, vr2 = I * r2, vr3 = I * r3;
            document.getElementById('kvl-v1-val').textContent = v1.toFixed(1) + ' V';
            document.getElementById('kvl-r1-val').textContent = r1 + ' Ω';
            document.getElementById('kvl-r2-val').textContent = r2 + ' Ω';
            document.getElementById('kvl-r3-val').textContent = r3 + ' Ω';
            document.getElementById('kvl-current').textContent = I.toFixed(2);
            document.getElementById('kvl-vr1').textContent = vr1.toFixed(1);
            document.getElementById('kvl-vr2').textContent = vr2.toFixed(1);
            document.getElementById('kvl-vr3').textContent = vr3.toFixed(1);
            const sum = (-v1 + vr1 + vr2 + vr3).toFixed(2);
            document.getElementById('kvl-sum').textContent = `✓ −V₁ + VR₁ + VR₂ + VR₃ = ${sum} V`;
        }
        kvlV1.addEventListener('input', updateKVL);
        kvlR1.addEventListener('input', updateKVL);
        kvlR2.addEventListener('input', updateKVL);
        kvlR3.addEventListener('input', updateKVL);
        updateKVL();
    }

    // ═══════ CARD 0.28: Source V-I Chart & MPT ═══════
    const srcRSlider = document.getElementById('src-r-slider');
    const srcViChart = document.getElementById('src-vi-chart');
    if (srcRSlider && srcViChart && typeof d3 !== 'undefined') {
        const Vs = 12;
        const m = { top: 15, right: 15, bottom: 30, left: 40 };
        const w = srcViChart.clientWidth - m.left - m.right;
        const h = srcViChart.clientHeight - m.top - m.bottom;
        const svgS = d3.select("#src-vi-chart").append("svg")
            .attr("width", w + m.left + m.right).attr("height", h + m.top + m.bottom)
            .append("g").attr("transform", `translate(${m.left},${m.top})`);
        const xS = d3.scaleLinear().domain([0, 15]).range([0, w]);
        const yS = d3.scaleLinear().domain([0, 20]).range([h, 0]);
        svgS.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(xS).ticks(5).tickFormat(d => d + 'A'));
        svgS.append("g").call(d3.axisLeft(yS).ticks(5));
        const lineS = d3.line().x(d => xS(d.i)).y(d => yS(d.v)).curve(d3.curveMonotoneX);

        // V-I characteristic line
        const viPath = svgS.append("path").attr("fill", "none").attr("stroke", "#fb7185").attr("stroke-width", 2);
        // Power curve
        const pPath = svgS.append("path").attr("fill", "none").attr("stroke", "var(--electric-yellow)").attr("stroke-width", 2);
        // MPT dot
        const mptDot = svgS.append("circle").attr("r", 5).attr("fill", "red");

        function drawSourceChart() {
            const r = parseFloat(srcRSlider.value) || 2;
            document.getElementById('src-r-val').textContent = r.toFixed(1) + ' Ω';
            const isc = r > 0 ? Vs / r : 999;
            document.getElementById('src-voc').textContent = Vs.toFixed(1);
            document.getElementById('src-isc').textContent = isc.toFixed(1);
            const pmax = r > 0 ? (Vs * Vs) / (4 * r) : 0;
            document.getElementById('src-pmax').textContent = pmax.toFixed(1);

            // V-I data
            let viData = [];
            for (let i = 0; i <= isc && i <= 15; i += 0.2) { viData.push({ i, v: Vs - i * r }); }
            viPath.datum(viData).attr("d", lineS);

            // P_L vs I: P_L = I^2 * R_L, R_L = (Vs - I*r)/I = Vs/I - r
            let pData = [];
            for (let rl = 0.1; rl <= 30; rl += 0.3) {
                let il = Vs / (rl + r);
                let pl = il * il * rl;
                if (il <= 15 && pl <= 20) pData.push({ i: il, v: pl });
            }
            pData.sort((a, b) => a.i - b.i);
            pPath.datum(pData).attr("d", lineS);

            // MPT dot at RL = r
            let iMpt = Vs / (2 * r);
            mptDot.attr("cx", xS(iMpt)).attr("cy", yS(pmax));
        }
        srcRSlider.addEventListener('input', drawSourceChart);
        drawSourceChart();
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

// 3D background logic moved to hero-bg.js

// =========================================
// NEW CARDS INTERACTIVITY (30-36)
// =========================================

// 30. Voltage Source Connections
const vToggleBtn = document.getElementById('btn-v-conn-toggle');
let vAiding = true;
if (vToggleBtn) {
    vToggleBtn.addEventListener('click', () => {
        vAiding = !vAiding;
        const v2Plus = document.getElementById('v-conn-v2-plus');
        const v2Minus = document.getElementById('v-conn-v2-minus');
        const reading = document.getElementById('v-conn-reading');
        if (vAiding) {
            v2Plus.textContent = '+'; v2Minus.textContent = '-';
            reading.textContent = 'Eq: 18V';
            vToggleBtn.textContent = 'Toggle Polarity (Opposing)';
        } else {
            v2Plus.textContent = '-'; v2Minus.textContent = '+';
            reading.textContent = 'Eq: 6V';
            vToggleBtn.textContent = 'Toggle Polarity (Aiding)';
        }
    });
}

const vAddRBtn = document.getElementById('btn-v-conn-add-r');
const vResetParaBtn = document.getElementById('btn-v-conn-reset-para');
if (vAddRBtn) {
    vAddRBtn.addEventListener('click', () => {
        const paraLoad = document.getElementById('v-conn-para-load');
        const paraShape = document.getElementById('v-conn-para-shape');
        const paraPlus = document.getElementById('v-conn-para-plus');
        const paraMinus = document.getElementById('v-conn-para-minus');
        const paraLabel = document.getElementById('v-conn-para-label');

        // Change V2 to Resistor
        paraShape.outerHTML = '<path id="v-conn-para-shape" d="M 120 35 L 112 39 L 128 47 L 112 55 L 128 63 L 120 67" stroke="#f97316" stroke-width="2" fill="none"/>';
        paraPlus.style.display = 'none';
        paraMinus.style.display = 'none';
        paraLabel.textContent = '12V (Fixed)';
        paraLabel.style.color = 'var(--electric-yellow)';
        vAddRBtn.style.display = 'none';
        vResetParaBtn.style.display = 'inline-block';
    });
}

// 31. Current Sources
const rlSlider = document.getElementById('v-conn-rl-slider');
if (rlSlider) {
    rlSlider.addEventListener('input', (e) => {
        const rVal = e.target.value;
        const is = 1; // Assume 1A
        const v = is * rVal;
        document.getElementById('v-conn-rl-val').textContent = v + 'V';
        // Move characteristic dot or line if needed (simple update for now)
    });
}

const rintSlider = document.getElementById('v-conn-rint-slider');
if (rintSlider) {
    rintSlider.addEventListener('input', (e) => {
        const rint = e.target.value;
        const pracLine = document.getElementById('v-conn-prac-line');
        // Update slope: line starts at (120,40), ends at (120+rint/scale, 100)
        // Scale rint for display
        const offset = Math.min(80, rint / 10);
        pracLine.setAttribute('x2', 120 + offset);
    });
}

// 32. Dependent Sources
const depSlider = document.getElementById('dep-v-control');
if (depSlider) {
    depSlider.addEventListener('input', (e) => {
        const v = e.target.value;
        const gm = 2; // transconductance
        const i = gm * v;
        document.getElementById('dep-i-out').textContent = i.toFixed(1) + ' mA';
        gsap.to('#dep-i-out', { scale: 1.1, duration: 0.1, yoyo: true, repeat: 1 });
    });
}

// 33. Power Balance (Mockup interactive)
// Simply shows that sum is 0
if (document.getElementById('p-del-val')) {
    // Real implementation would have V and I sliders
}

// 34. Source Transformation Morph
const stBtn = document.getElementById('btn-st-morph');
let stIsNorton = false;
if (stBtn) {
    stBtn.addEventListener('click', () => {
        stIsNorton = !stIsNorton;
        const group = document.getElementById('st-morph-group');
        const src = document.getElementById('st-src-shape');
        const res = document.getElementById('st-res-path');
        const arrow = document.getElementById('st-src-arrow');
        const vSym = document.getElementById('st-src-sym-v');
        const vSym2 = document.getElementById('st-src-sym-v2');
        const labelVal = document.getElementById('st-label-val');
        const labelRes = document.getElementById('st-label-res');

        if (stIsNorton) {
            stBtn.textContent = 'Transform: Is → Vs';
            // Morph to Parallel
            gsap.to(src, { stroke: '#facc15', duration: 0.6 });
            gsap.to([vSym, vSym2], { opacity: 0, duration: 0.3 });
            gsap.to(arrow, { opacity: 1, duration: 0.3 });
            // Move R to parallel position (vertical)
            gsap.to(res, {
                attr: { d: "M 200 20 L 200 35 L 192 40 L 208 48 L 192 56 L 208 64 L 200 69 L 200 100" },
                duration: 0.6
            });
            labelVal.textContent = 'Is = 6A';
            labelRes.textContent = 'Rp = 2Ω';
        } else {
            stBtn.textContent = 'Transform: Vs → Is';
            gsap.to(src, { stroke: 'var(--neon-cyan)', duration: 0.6 });
            gsap.to([vSym, vSym2], { opacity: 1, duration: 0.3 });
            gsap.to(arrow, { opacity: 0, duration: 0.3 });
            gsap.to(res, {
                attr: { d: "M 180 60 L 195 60 L 200 52 L 210 68 L 220 52 L 230 68 L 235 60 L 250 60" },
                duration: 0.6
            });
            labelVal.textContent = 'Vs = 12V';
            labelRes.textContent = 'Rs = 2Ω';
        }
    });
}

// 35. VDR Sliders
const vdrSlider = document.getElementById('vdr-slider');
if (vdrSlider) {
    vdrSlider.addEventListener('input', (e) => {
        const val = e.target.value; // Percentage for R1
        const vs = 12;
        const v1 = (val / 100) * vs;
        const v2 = vs - v1;
        document.getElementById('vdr-v1-val').textContent = `V₁: ${v1.toFixed(1)}V`;
        document.getElementById('vdr-v2-val').textContent = `V₂: ${v2.toFixed(1)}V`;
        document.getElementById('vdr-bar1').style.width = val + '%';
        document.getElementById('vdr-bar2').style.width = (100 - val) + '%';
        document.getElementById('vdr-r1-label').textContent = `R₁: ${val}Ω`;
        document.getElementById('vdr-r2-label').textContent = `R₂: ${100 - val}Ω`;
    });
}

// 36. CDR Sliders
const cdrSlider = document.getElementById('cdr-slider');
if (cdrSlider) {
    cdrSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        const is = 10;
        // Current is INVERSE to R. 
        // If slider is 30, R1=30, R2=70. 
        // I1 = 70/100 * 10 = 7A. 
        // I2 = 30/100 * 10 = 3A.
        const i1 = ((100 - val) / 100) * is;
        const i2 = is - i1;
        document.getElementById('cdr-i1-val').textContent = `I₁: ${i1.toFixed(1)}A`;
        document.getElementById('cdr-i2-val').textContent = `I₂: ${i2.toFixed(1)}A`;
        document.getElementById('cdr-bar1').style.width = ((100 - val)) + '%';
        document.getElementById('cdr-bar2').style.width = val + '%';
    });
}

// 37. Nodal Analysis
const nodalNodes = document.querySelectorAll('.node-clickable');
const nodalDisplay = document.getElementById('nodal-eq-display');
nodalNodes.forEach(node => {
    node.addEventListener('click', () => {
        const id = node.id;
        let eq = '';
        nodalNodes.forEach(n => n.setAttribute('stroke-width', '2'));
        node.setAttribute('stroke-width', '4');

        if (id === 'node-v1') eq = '$$\\frac{V_1 - V_s}{R_1} + \\frac{V_1 - V_2}{R_3} = 0$$';
        else if (id === 'node-v2') eq = '$$\\frac{V_2 - V_1}{R_3} + \\frac{V_2 - V_3}{R_4} + \\frac{V_2}{R_2} = 0$$';
        else if (id === 'node-v3') eq = '$$\\frac{V_3 - V_2}{R_4} + \\frac{V_3}{R_5} = I_s$$';

        nodalDisplay.innerHTML = eq;
        if (window.renderMathInElement) renderMathInElement(nodalDisplay);
        gsap.from(nodalDisplay, { opacity: 0, y: 5, duration: 0.3 });
    });
});

// 38. Mesh Analysis
const meshLoops = document.querySelectorAll('.mesh-clickable');
const meshDisplay = document.getElementById('mesh-eq-display');
meshLoops.forEach(loop => {
    loop.addEventListener('click', () => {
        const id = loop.id;
        let eq = '';
        meshLoops.forEach(l => l.setAttribute('stroke-width', '2'));
        loop.setAttribute('stroke-width', '4');

        if (id === 'mesh-i1') eq = '$$V_1 - I_1 R_1 - (I_1 - I_2)R_3 = 0$$';
        else if (id === 'mesh-i2') eq = '$$(I_2 - I_1)R_3 + I_2 R_2 + V_2 = 0$$';

        meshDisplay.innerHTML = eq;
        if (window.renderMathInElement) renderMathInElement(meshDisplay);
        gsap.from(meshDisplay, { opacity: 0, scale: 0.95, duration: 0.3 });
    });
});

// 39. Superposition Sequence
const btnSpV = document.getElementById('btn-sp-v-only');
const btnSpI = document.getElementById('btn-sp-i-only');
const btnSpBoth = document.getElementById('btn-sp-both');
const spVsrc = document.getElementById('sp-src1-v');
const spIsrc = document.getElementById('sp-src2-i');
const spResp = document.getElementById('sp-resp-val');

if (btnSpV) {
    btnSpV.addEventListener('click', () => {
        gsap.to(spIsrc, { opacity: 0.1, duration: 0.5 });
        gsap.to(spVsrc, { opacity: 1, duration: 0.5 });
        spResp.textContent = "I' = 4A";
        spResp.style.color = 'var(--neon-cyan)';
    });
    btnSpI.addEventListener('click', () => {
        gsap.to(spVsrc, { opacity: 0.1, duration: 0.5 });
        gsap.to(spIsrc, { opacity: 1, duration: 0.5 });
        spResp.textContent = "I'' = 2A";
        spResp.style.color = '#facc15';
    });
    btnSpBoth.addEventListener('click', () => {
        gsap.to([spVsrc, spIsrc], { opacity: 1, duration: 0.5 });
        spResp.textContent = "I_total = 6A";
        spResp.style.color = '#fff';
    });
}

// 40. (Removed — Thevenin/Norton morph replaced by step-by-step animations)

// 41. Tellegen Verification
const btnTell = document.getElementById('btn-verify-tellegen');
if (btnTell) {
    btnTell.addEventListener('click', () => {
        const branches = ['tell-b1', 'tell-b2', 'tell-b3', 'tell-b4', 'tell-b5'];
        const tl = gsap.timeline();
        branches.forEach((b, i) => {
            tl.to(`#${b}`, { strokeWidth: 4, duration: 0.2 })
                .to(`#${b}`, { strokeWidth: 2, duration: 0.2 });
        });
        tl.call(() => {
            document.getElementById('tellegen-check').style.display = 'inline-block';
            gsap.from('#tellegen-check', { scale: 0, rotation: -20, duration: 0.5, ease: 'back.out' });
        });
    });
}

// 42. Millman Solver
const btnMill = document.getElementById('btn-millman-solve');
if (btnMill) {
    btnMill.addEventListener('click', () => {
        // E1=10, R1=2, E2=20, R2=4, E3=0 (shorted), R3=5
        const E1 = 10, R1 = 2, E2 = 20, R2 = 4, E3 = 0, R3 = 5;
        const Y1 = 1 / R1, Y2 = 1 / R2, Y3 = 1 / R3;
        const Eeq = (E1 * Y1 + E2 * Y2 + E3 * Y3) / (Y1 + Y2 + Y3);
        const Req = 1 / (Y1 + Y2 + Y3);
        document.getElementById('millman-res').innerHTML = `Result: $E_{eq} = ${Eeq.toFixed(2)}V$, $R_{eq} = ${Req.toFixed(2)}\\Omega$`;
        if (window.renderMathInElement) renderMathInElement(document.getElementById('millman-res'));
    });
}

// 43. Reciprocity Swap
const btnRecip = document.getElementById('btn-recip-swap');
let recipSwapped = false;
if (btnRecip) {
    btnRecip.addEventListener('click', () => {
        recipSwapped = !recipSwapped;
        const vsrc = document.getElementById('recip-vsrc');
        const ammeter = document.getElementById('recip-ammeter');
        if (recipSwapped) {
            gsap.to(vsrc, { x: 160, duration: 0.8, ease: 'power2.inOut' });
            gsap.to(ammeter, { x: -160, duration: 0.8, ease: 'power2.inOut' });
        } else {
            gsap.to(vsrc, { x: 0, duration: 0.8, ease: 'power2.inOut' });
            gsap.to(ammeter, { x: 0, duration: 0.8, ease: 'power2.inOut' });
        }
    });
}

// 44. MPT Slider
const mptSlider = document.getElementById('mpt-slider');
if (mptSlider) {
    mptSlider.addEventListener('input', (e) => {
        const rl = parseFloat(e.target.value);
        const rth = 50; // Optimized at midpoint
        const vth = 20;
        const p = (vth * vth * rl) / Math.pow(rth + rl, 2);
        const eff = (rl / (rth + rl)) * 100;

        document.getElementById('mpt-rl-val').textContent = rl;
        document.getElementById('mpt-p-val').textContent = (p * 10).toFixed(1) + 'W'; // Scaled for display
        document.getElementById('mpt-eff-val').textContent = eff.toFixed(0) + '%';

        // Move dot on curve. Midpoint (RL=Rth=50) is CX=120, CY=65
        // RL=1 -> CX=30, RL=100 -> CX=210
        const cx = 30 + (rl - 1) * (180 / 99);
        // Approximation for the bell curve CY
        const cy = 120 - (p * 200);
        gsap.to('#mpt-dot', { attr: { cx: cx, cy: cy }, duration: 0.1 });
    });
}


// ————————————— TWO PORT NETWORK INTERACTIVITY —————————————

// Card 45: Intro Selector
const tpSelect = document.getElementById('tp-param-select');
if (tpSelect) {
    tpSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        const i1 = document.getElementById('tp-i1-path');
        const i2 = document.getElementById('tp-i2-path');
        // Reset
        gsap.to(['#tp-i1-path', '#tp-i2-path'], { stroke: 'var(--electric-yellow)', opacity: 1, duration: 0.3 });

        if (val === 'z') {
            gsap.to(['#tp-i1-path', '#tp-i2-path'], { stroke: 'var(--neon-cyan)', duration: 0.3 }); // Independent in cyanide
        } else if (val === 'y') {
            gsap.to(['#tp-i1-path', '#tp-i2-path'], { stroke: 'var(--neon-pink)', duration: 0.3 }); // Dependent in pink
        }
    });
}

// Card 46 & 47: Z/Y Measurement
document.getElementById('btn-z-m1')?.addEventListener('click', () => {
    gsap.to('#z-test-i1', { scale: 1.2, repeat: 3, yoyo: true, duration: 0.2 });
    gsap.fromTo('#z-port2-open', { opacity: 0 }, { opacity: 1, duration: 0.5 });
});

// Card 53: Transformer Slider
const nSlider = document.getElementById('n-ratio-slider');
if (nSlider) {
    nSlider.addEventListener('input', (e) => {
        const n = parseFloat(e.target.value).toFixed(1);
        document.getElementById('n-ratio-val').textContent = n;
        gsap.to('#transformer-tp-svg path', { strokeWidth: 2 + (n * 0.5), duration: 0.2 });
    });
}

// Card 54: T-Pi Morphing
let isPi = false;
document.getElementById('btn-tpi-morph')?.addEventListener('click', (e) => {
    isPi = !isPi;
    const btn = e.target;
    if (isPi) {
        // Morph to Pi
        gsap.to('#tp-res-1', { attr: { d: 'M 40 40 L 40 90' }, duration: 0.6, ease: 'power2.inOut' });
        gsap.to('#tp-res-2', { attr: { d: 'M 40 40 L 200 40' }, duration: 0.6, ease: 'power2.inOut' });
        gsap.to('#tp-res-3', { attr: { d: 'M 200 40 L 200 90' }, duration: 0.6, ease: 'power2.inOut' });
        btn.textContent = 'Switch to T-Network';
    } else {
        // Morph back to T
        gsap.to('#tp-res-1', { attr: { d: 'M 40 40 L 90 40' }, duration: 0.6, ease: 'power2.inOut' });
        gsap.to('#tp-res-2', { attr: { d: 'M 120 40 L 120 90' }, duration: 0.6, ease: 'power2.inOut' });
        gsap.to('#tp-res-3', { attr: { d: 'M 150 40 L 200 40' }, duration: 0.6, ease: 'power2.inOut' });
        btn.textContent = 'Switch to π-Network';
    }
});

// Card 55: Parameter Conversion Logic
document.getElementById('btn-tp-convert')?.addEventListener('click', () => {
    const z11 = parseFloat(document.getElementById('conv-m11').value) || 1;
    const z12 = parseFloat(document.getElementById('conv-m12').value) || 0;
    const z21 = parseFloat(document.getElementById('conv-m21').value) || 0;
    const z22 = parseFloat(document.getElementById('conv-m22').value) || 1;

    const deltaZ = (z11 * z22) - (z12 * z21);
    if (Math.abs(deltaZ) < 0.0001) {
        document.getElementById('tp-conv-res').innerHTML = '<p class="text-danger">Singular Matrix (Cannot Invert)</p>';
        return;
    }

    const y11 = (z22 / deltaZ).toFixed(2);
    const a = (z11 / z21).toFixed(2);
    const b = (deltaZ / z21).toFixed(2);

    document.getElementById('tp-conv-res').innerHTML = `
        <div class="text-xs">
            <p><strong>[Y] Matrix:</strong> [[${y11}, ...], ...]</p>
            <p class="mt-2"><strong>[ABCD] Matrix:</strong></p>
            <p>A = ${a}, B = ${b} Ω</p>
            <p>Det([Z]) = ${deltaZ.toFixed(2)}</p>
        </div>
    `;
});
// ==========================================
// TWO PORT NETWORKS - JS Interactivity (Cards 44-54)
// ==========================================

(function () {

    // ---- Card 44: Intro Param Selector ----
    const paramSelBtns = document.querySelectorAll('.param-sel-btn');
    const introIndep = document.getElementById('intro-indep');
    const introDep = document.getElementById('intro-dep');

    const paramInfo = {
        z: { indep: 'I₁, I₂', dep: 'V₁, V₂' },
        y: { indep: 'V₁, V₂', dep: 'I₁, I₂' },
        h: { indep: 'I₁, V₂', dep: 'V₁, I₂' },
        g: { indep: 'V₁, I₂', dep: 'I₁, V₂' },
        abcd: { indep: 'V₂, -I₂', dep: 'V₁, I₁' },
        'abcd-inv': { indep: 'V₁, -I₁', dep: 'V₂, I₂' }
    };

    paramSelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const param = btn.getAttribute('data-param');
            if (introIndep && introDep && paramInfo[param]) {
                introIndep.textContent = paramInfo[param].indep;
                introDep.textContent = paramInfo[param].dep;
            }
            paramSelBtns.forEach(b => b.style.opacity = '0.6');
            btn.style.opacity = '1';
        });
    });

    // ---- Card 47/48: h/g Tab Toggle ----
    const btnShowH = document.getElementById('btn-show-h');
    const btnShowG = document.getElementById('btn-show-g');
    const hContent = document.getElementById('h-content');
    const gContent = document.getElementById('g-content');

    function showH() {
        if (!hContent || !gContent) return;
        hContent.style.opacity = '1';
        hContent.style.transform = 'translateX(0)';
        hContent.style.pointerEvents = 'auto';
        gContent.style.opacity = '0';
        gContent.style.transform = 'translateX(20px)';
        gContent.style.pointerEvents = 'none';
        btnShowH.classList.add('active');
        btnShowG.classList.remove('active');
    }
    function showG() {
        if (!hContent || !gContent) return;
        gContent.style.opacity = '1';
        gContent.style.transform = 'translateX(0)';
        gContent.style.pointerEvents = 'auto';
        hContent.style.opacity = '0';
        hContent.style.transform = 'translateX(-20px)';
        hContent.style.pointerEvents = 'none';
        btnShowG.classList.add('active');
        btnShowH.classList.remove('active');
    }

    if (btnShowH) btnShowH.addEventListener('click', showH);
    if (btnShowG) btnShowG.addEventListener('click', showG);

    // ---- Card 51: Connection Tabs ----
    const connTabBtns = document.querySelectorAll('[data-conn]');
    const connPanes = document.querySelectorAll('.conn-pane');

    connTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-conn');
            connPanes.forEach(pane => {
                pane.style.display = pane.id === 'conn-' + target ? 'block' : 'none';
            });
            connTabBtns.forEach(b => {
                b.classList.remove('neon-btn');
                b.classList.add('outline-btn');
            });
            btn.classList.add('neon-btn');
            btn.classList.remove('outline-btn');
        });
    });

    // ---- Card 52: Transformer Slider ----
    const xformerSlider = document.getElementById('xformer-slider');
    if (xformerSlider) {
        function updateTransformer() {
            const n = parseFloat(xformerSlider.value);
            const nStr = n.toFixed(1);
            const display = document.getElementById('xformer-n-display');
            const val = document.getElementById('xformer-n-val');
            const xfa = document.getElementById('xfa');
            const xfd = document.getElementById('xfd');
            if (display) display.textContent = 'n = ' + nStr;
            if (val) val.textContent = nStr;
            if (xfa) xfa.textContent = (1 / n).toFixed(3);
            if (xfd) xfd.textContent = nStr;
        }
        xformerSlider.addEventListener('input', updateTransformer);
    }

    // ---- Card 50: Symmetry & Reciprocity Checker ----
    const symCheckType = document.getElementById('sym-check-type');
    const symP11 = document.getElementById('sym-p11');
    const symP12 = document.getElementById('sym-p12');
    const symP21 = document.getElementById('sym-p21');
    const symP22 = document.getElementById('sym-p22');
    const badgeReciprocal = document.getElementById('badge-reciprocal');
    const badgeSymmetrical = document.getElementById('badge-symmetrical');

    function checkSymmetry() {
        if (!symCheckType || !badgeReciprocal || !badgeSymmetrical) return;
        const type = symCheckType.value;
        const p11 = parseFloat(symP11.value) || 0;
        const p12 = parseFloat(symP12.value) || 0;
        const p21 = parseFloat(symP21.value) || 0;
        const p22 = parseFloat(symP22.value) || 0;

        let isReciprocal = false, isSymmetrical = false;
        const EPS = 1e-9;

        if (type === 'z' || type === 'y') {
            isReciprocal = Math.abs(p12 - p21) < EPS;
            isSymmetrical = Math.abs(p11 - p22) < EPS;
        } else if (type === 'h' || type === 'g') {
            isReciprocal = Math.abs(p12 + p21) < EPS;  // h12 = -h21
            isSymmetrical = Math.abs(p11 * p22 - p12 * p21 - 1) < EPS;
        } else if (type === 'abcd') {
            isReciprocal = Math.abs(p11 * p22 - p12 * p21 - 1) < EPS; // AD-BC=1
            isSymmetrical = Math.abs(p11 - p22) < EPS; // A=D
        }

        const setStatus = (el, ok) => {
            const label = el.id.includes('reciprocal') ? 'Reciprocal' : 'Symmetrical';
            el.textContent = label + ': ' + (ok ? '✓ YES' : '✗ NO');
            el.style.background = ok ? 'rgba(0,255,100,0.15)' : 'rgba(255,50,50,0.15)';
            el.style.borderColor = ok ? '#00ff88' : '#ff5050';
            el.style.color = ok ? '#00ff88' : '#ff5050';
        };

        setStatus(badgeReciprocal, isReciprocal);
        setStatus(badgeSymmetrical, isSymmetrical);
    }

    if (symCheckType) {
        [symCheckType, symP11, symP12, symP21, symP22].forEach(el => {
            if (el) el.addEventListener('input', checkSymmetry);
        });
        checkSymmetry();
    }

    // ---- Card 53: T-Pi Network Toggle ----
    let isTPi = false;
    const btnTPiToggle = document.getElementById('btn-t-pi-toggle');
    const tpiHeading = document.getElementById('t-pi-heading');
    const tFormulas = document.getElementById('t-formulas');
    const piFormulas = document.getElementById('pi-formulas');
    const labelZ1 = document.getElementById('label-z1');
    const labelZ2 = document.getElementById('label-z2');
    const labelZ3 = document.getElementById('label-z3');
    const inpZ1 = document.getElementById('inp-z1');
    const inpZ2 = document.getElementById('inp-z2');
    const inpZ3 = document.getElementById('inp-z3');
    const tPiMatrixRes = document.getElementById('t-pi-matrix-res');

    function updateTPiMatrix() {
        const z1 = parseFloat(inpZ1 ? inpZ1.value : 0) || 0;
        const z2 = parseFloat(inpZ2 ? inpZ2.value : 0) || 0;
        const z3 = parseFloat(inpZ3 ? inpZ3.value : 0) || 0;
        if (tPiMatrixRes) {
            if (!isTPi) {
                // T-network: [Z] matrix
                tPiMatrixRes.innerHTML = `[${z1 + z3}, ${z3}]<br>[${z3}, ${z2 + z3}]`;
            } else {
                // Pi-network: [Y] matrix, Za=z1, Zb=z2, Zc=z3
                const ya = z1 !== 0 ? 1 / z1 : 0;
                const yb = z2 !== 0 ? 1 / z2 : 0;
                const yc = z3 !== 0 ? 1 / z3 : 0;
                tPiMatrixRes.innerHTML = `[${(ya + yb).toFixed(3)}, ${(-yb).toFixed(3)}]<br>[${(-yb).toFixed(3)}, ${(yb + yc).toFixed(3)}]`;
            }
        }
    }

    if (btnTPiToggle) {
        btnTPiToggle.addEventListener('click', () => {
            isTPi = !isTPi;

            if (isTPi) {
                // Switch to Pi display
                if (tpiHeading) { tpiHeading.textContent = 'π-Network Parameters'; tpiHeading.style.color = '#fb7185'; }
                if (tFormulas) tFormulas.style.display = 'none';
                if (piFormulas) piFormulas.style.display = 'block';
                if (labelZ1) { labelZ1.textContent = 'Yₐ (S)'; labelZ1.style.color = '#fb7185'; }
                if (labelZ2) { labelZ2.textContent = 'Y_b (S)'; labelZ2.style.color = '#fb7185'; }
                if (labelZ3) { labelZ3.textContent = 'Y_c (S)'; labelZ3.style.color = '#fb7185'; }
                // Update SVG lines to Pi
                const svgEl = document.getElementById('t-pi-svg');
                if (svgEl) {
                    document.getElementById('morph-l1').setAttribute('x1', '20');
                    document.getElementById('morph-l1').setAttribute('y1', '40');
                    document.getElementById('morph-l1').setAttribute('x2', '20');
                    document.getElementById('morph-l1').setAttribute('y2', '120');
                    document.getElementById('morph-t1').setAttribute('x', '5');
                    document.getElementById('morph-t1').setAttribute('y', '85');
                    document.getElementById('morph-t1').textContent = 'Yₐ';

                    document.getElementById('morph-l2').setAttribute('x1', '20');
                    document.getElementById('morph-l2').setAttribute('y1', '40');
                    document.getElementById('morph-l2').setAttribute('x2', '180');
                    document.getElementById('morph-l2').setAttribute('y2', '40');
                    document.getElementById('morph-t2').setAttribute('x', '100');
                    document.getElementById('morph-t2').setAttribute('y', '30');
                    document.getElementById('morph-t2').textContent = 'Y_b';

                    document.getElementById('morph-l3').setAttribute('x1', '180');
                    document.getElementById('morph-l3').setAttribute('y1', '40');
                    document.getElementById('morph-l3').setAttribute('x2', '180');
                    document.getElementById('morph-l3').setAttribute('y2', '120');
                    document.getElementById('morph-t3').setAttribute('x', '185');
                    document.getElementById('morph-t3').setAttribute('y', '85');
                    document.getElementById('morph-t3').textContent = 'Y_c';

                    [document.getElementById('morph-l1'), document.getElementById('morph-l2'), document.getElementById('morph-l3')].forEach(l => {
                        if (l) l.setAttribute('stroke', '#fb7185');
                    });
                    [document.getElementById('morph-t1'), document.getElementById('morph-t2'), document.getElementById('morph-t3')].forEach(t => {
                        if (t) t.setAttribute('fill', '#fb7185');
                    });
                }
            } else {
                // Switch back to T display
                if (tpiHeading) { tpiHeading.textContent = 'T-Network Parameters'; tpiHeading.style.color = '#60a5fa'; }
                if (tFormulas) tFormulas.style.display = 'block';
                if (piFormulas) piFormulas.style.display = 'none';
                if (labelZ1) { labelZ1.textContent = 'Z₁'; labelZ1.style.color = '#60a5fa'; }
                if (labelZ2) { labelZ2.textContent = 'Z₂'; labelZ2.style.color = '#60a5fa'; }
                if (labelZ3) { labelZ3.textContent = 'Z₃'; labelZ3.style.color = '#60a5fa'; }
                // Restore T SVG
                const svgEl = document.getElementById('t-pi-svg');
                if (svgEl) {
                    document.getElementById('morph-l1').setAttribute('x1', '20');
                    document.getElementById('morph-l1').setAttribute('y1', '40');
                    document.getElementById('morph-l1').setAttribute('x2', '100');
                    document.getElementById('morph-l1').setAttribute('y2', '40');
                    document.getElementById('morph-t1').setAttribute('x', '60');
                    document.getElementById('morph-t1').setAttribute('y', '30');
                    document.getElementById('morph-t1').textContent = 'Z₁';

                    document.getElementById('morph-l2').setAttribute('x1', '100');
                    document.getElementById('morph-l2').setAttribute('y1', '40');
                    document.getElementById('morph-l2').setAttribute('x2', '180');
                    document.getElementById('morph-l2').setAttribute('y2', '40');
                    document.getElementById('morph-t2').setAttribute('x', '140');
                    document.getElementById('morph-t2').setAttribute('y', '30');
                    document.getElementById('morph-t2').textContent = 'Z₂';

                    document.getElementById('morph-l3').setAttribute('x1', '100');
                    document.getElementById('morph-l3').setAttribute('y1', '40');
                    document.getElementById('morph-l3').setAttribute('x2', '100');
                    document.getElementById('morph-l3').setAttribute('y2', '120');
                    document.getElementById('morph-t3').setAttribute('x', '115');
                    document.getElementById('morph-t3').setAttribute('y', '80');
                    document.getElementById('morph-t3').textContent = 'Z₃';

                    [document.getElementById('morph-l1'), document.getElementById('morph-l2'), document.getElementById('morph-l3')].forEach(l => {
                        if (l) l.setAttribute('stroke', '#60a5fa');
                    });
                    [document.getElementById('morph-t1'), document.getElementById('morph-t2'), document.getElementById('morph-t3')].forEach(t => {
                        if (t) t.setAttribute('fill', '#60a5fa');
                    });
                }
            }
            updateTPiMatrix();
        });
    }

    if (inpZ1) inpZ1.addEventListener('input', updateTPiMatrix);
    if (inpZ2) inpZ2.addEventListener('input', updateTPiMatrix);
    if (inpZ3) inpZ3.addEventListener('input', updateTPiMatrix);
    updateTPiMatrix();

    // ---- Card 54: Universal Parameter Converter ----
    const btnCalcConvert = document.getElementById('btn-calc-convert');
    if (btnCalcConvert) {
        btnCalcConvert.addEventListener('click', () => {
            const type = document.getElementById('conv-input-type').value;
            const p11 = parseFloat(document.getElementById('conv-p11').value) || 0;
            const p12 = parseFloat(document.getElementById('conv-p12').value) || 0;
            const p21 = parseFloat(document.getElementById('conv-p21').value) || 0;
            const p22 = parseFloat(document.getElementById('conv-p22').value) || 0;

            let z11, z12, z21, z22, det;
            const f = v => parseFloat(v).toFixed(4);

            if (type === 'z') {
                z11 = p11; z12 = p12; z21 = p21; z22 = p22;
            } else if (type === 'y') {
                det = p11 * p22 - p12 * p21;
                if (Math.abs(det) < 1e-10) { showError('Singular [Y] matrix'); return; }
                z11 = p22 / det; z12 = -p12 / det; z21 = -p21 / det; z22 = p11 / det;
            } else if (type === 'abcd') {
                // A=p11,B=p12,C=p21,D=p22 => Z params
                if (Math.abs(p21) < 1e-10) { showError('C cannot be 0 for ABCD→Z'); return; }
                z11 = p11 / p21; z12 = (p11 * p22 - p12 * p21) / p21; z21 = 1 / p21; z22 = p22 / p21;
            }

            det = z11 * z22 - z12 * z21;

            // [Z]
            document.getElementById('res-z').innerHTML = `[ ${f(z11)},  ${f(z12)} ]<br>[ ${f(z21)},  ${f(z22)} ]`;

            // [Y] = inverse of [Z]
            if (Math.abs(det) > 1e-10) {
                const y11 = z22 / det, y12 = -z12 / det, y21 = -z21 / det, y22 = z11 / det;
                document.getElementById('res-y').innerHTML = `[ ${f(y11)},  ${f(y12)} ]<br>[ ${f(y21)},  ${f(y22)} ]`;
            } else {
                document.getElementById('res-y').innerHTML = '<span style="color:#ff5050;">Singular</span>';
            }

            // [ABCD] from Z
            if (Math.abs(z21) > 1e-10) {
                const A = z11 / z21, B = det / z21, C = 1 / z21, D = z22 / z21;
                document.getElementById('res-abcd').innerHTML = `A=${f(A)}, B=${f(B)}<br>C=${f(C)}, D=${f(D)}`;
            } else {
                document.getElementById('res-abcd').innerHTML = '<span style="color:#ff5050;">Z21=0</span>';
            }

            // [h] from Z
            if (Math.abs(z22) > 1e-10) {
                const h11 = det / z22, h12 = z12 / z22, h21 = -z21 / z22, h22 = 1 / z22;
                document.getElementById('res-h').innerHTML = `h11=${f(h11)}<br>h12=${f(h12)}, h21=${f(h21)}<br>h22=${f(h22)}`;
            } else {
                document.getElementById('res-h').innerHTML = '<span style="color:#ff5050;">Z22=0</span>';
            }

            // Trigger KaTeX re-render on results if available
            if (window.renderMathInElement) {
                ['res-z', 'res-y', 'res-abcd', 'res-h'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) renderMathInElement(el);
                });
            }
        });
    }

    function showError(msg) {
        ['res-z', 'res-y', 'res-abcd', 'res-h'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<span style="color:#ff5050;">' + msg + '</span>';
        });
    }

})(); // End IIFE
