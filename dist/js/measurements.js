// =========================================================================
// GLOBAL JS - MEASUREMENTS & INSTRUMENTATION FORMULA BOOK
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // Initialize AOS Animation Library with safety
    try {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: false,
            offset: 50
        });

        // Forced refresh and scroll event to trigger animations on slow loads or deep links
        window.addEventListener('load', () => {
            AOS.refresh();
            window.dispatchEvent(new Event('scroll'));
        });

        console.log("AOS Initialized & Refreshed");
    } catch (e) {
        console.error("AOS Load Error:", e);
        // Fallback: If AOS fails, ensure everything is visible
        document.querySelectorAll('[data-aos]').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }

    // Sidebar Navigation & Scroll Progress Indicator
    const sections = document.querySelectorAll('.module-section');
    const navLinks = document.querySelectorAll('.nav-link');
    const progressBar = document.getElementById('progress-bar');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;

        // Update Progress Bar
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (scrollY / docHeight) * 100;
        if (progressBar) progressBar.style.width = scrolled + '%';

        // Update Active Sidebar Link
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // Smooth scroll for sidebar links
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 50,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- MODULE 1: Measurement Fundamentals ---

    // 1.1 Bullseye Accuracy vs Precision Animation
    const dots = document.querySelectorAll('.dot-mark');
    const accBtnGroup = document.querySelectorAll('.mod1-btn');

    // Positions (x, y) around center (150, 150)
    const cases = {
        'ap': [{ x: 150, y: 150 }, { x: 145, y: 155 }, { x: 155, y: 145 }, { x: 148, y: 148 }, { x: 152, y: 152 }], // Acc & Prec
        'p_na': [{ x: 220, y: 80 }, { x: 215, y: 85 }, { x: 225, y: 75 }, { x: 218, y: 78 }, { x: 222, y: 82 }], // Prec, Not Acc
        'a_np': [{ x: 150, y: 110 }, { x: 110, y: 150 }, { x: 190, y: 150 }, { x: 150, y: 190 }, { x: 170, y: 130 }], // Acc, Not Prec
        'neither': [{ x: 80, y: 200 }, { x: 230, y: 220 }, { x: 100, y: 90 }, { x: 210, y: 110 }, { x: 160, y: 240 }] // Neither
    };

    if (accBtnGroup.length > 0 && dots.length > 0) {
        accBtnGroup.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update button styles
                accBtnGroup.forEach(b => {
                    b.classList.remove('active');
                    b.style.color = 'var(--text-secondary)';
                });
                e.currentTarget.classList.add('active');
                e.currentTarget.style.color = '#000';

                const type = e.currentTarget.getAttribute('data-type');
                const targetPositions = cases[type];

                // Animate dots disappearing then reappearing at new spots
                gsap.to(dots, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.2,
                    stagger: 0.05,
                    onComplete: () => {
                        dots.forEach((dot, i) => {
                            dot.setAttribute('cx', targetPositions[i].x);
                            dot.setAttribute('cy', targetPositions[i].y);
                        });
                        gsap.to(dots, {
                            scale: 1,
                            opacity: 1,
                            duration: 0.4,
                            ease: "back.out(1.7)",
                            stagger: 0.1
                        });
                    }
                });
            });
        });

        // Trigger initial state
        accBtnGroup[0].click();
    }

    // 1.2 Gaussian Error Distribution (D3.js)
    const errChart = document.getElementById('error-dist-chart');
    if (errChart) {
        const width = errChart.clientWidth;
        const height = errChart.clientHeight;
        const svg = d3.select("#error-dist-chart").append("svg").attr("width", width).attr("height", height);

        // Normal distribution function: f(x) = (1/(s*sqrt(2PI))) * exp(-0.5 * ((x-m)/s)^2)
        const mean = width / 2;
        const sd = 40;

        let pathData = [];
        for (let x = 20; x <= width - 20; x += 2) {
            let z = (x - mean) / sd;
            let y = (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
            // Scale y to fit height (max y occurs at x=mean, mapped to height-40)
            let max_y = 1 / (sd * Math.sqrt(2 * Math.PI));
            let scaledY = height - 20 - (y / max_y) * (height - 60);
            pathData.push({ x: x, y: scaledY });
        }

        const lineGen = d3.line().x(d => d.x).y(d => d.y).curve(d3.curveBasis);

        // Base Axis
        svg.append("line").attr("x1", 20).attr("y1", height - 20).attr("x2", width - 20).attr("y2", height - 20).attr("stroke", "#475569").attr("stroke-width", 2);

        // Sigma Bands (Shading)
        const areaGen1 = d3.area().x(d => d.x).y0(height - 20).y1(d => d.y).curve(d3.curveBasis);

        // -1 to 1 sigma
        let s1Data = pathData.filter(d => d.x >= mean - sd && d.x <= mean + sd);
        svg.append("path").datum(s1Data).attr("d", areaGen1).attr("fill", "rgba(0, 255, 136, 0.4)");

        // -2 to 2 sigma (excluding 1)
        let s2Left = pathData.filter(d => d.x >= mean - 2 * sd && d.x <= mean - sd);
        let s2Right = pathData.filter(d => d.x >= mean + sd && d.x <= mean + 2 * sd);
        svg.append("path").datum(s2Left).attr("d", areaGen1).attr("fill", "rgba(0, 255, 136, 0.2)");
        svg.append("path").datum(s2Right).attr("d", areaGen1).attr("fill", "rgba(0, 255, 136, 0.2)");

        // The Bell Curve
        const path = svg.append("path")
            .datum(pathData)
            .attr("fill", "none")
            .attr("stroke", "var(--mod1-color)")
            .attr("stroke-width", 3)
            .attr("d", lineGen);

        // Animate drawing
        const totalLength = path.node().getTotalLength();
        path.attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);

        // Mean line
        svg.append("line").attr("x1", mean).attr("y1", height - 20).attr("x2", mean).attr("y2", 20).attr("stroke", "#fff").attr("stroke-dasharray", "4 4");
        svg.append("text").attr("x", mean).attr("y", 15).attr("fill", "#fff").attr("text-anchor", "middle").text("μ (True Value)");

        // Labels
        svg.append("text").attr("x", mean + sd / 2).attr("y", height - 40).attr("fill", "#0a0e1a").attr("text-anchor", "middle").attr("font-size", 12).attr("font-weight", "bold").text("68.2%");
    }

    // 1.3 Calibration Transfer Curve
    const calChart = document.getElementById('calibration-chart');
    if (calChart) {
        const width = calChart.clientWidth;
        const height = calChart.clientHeight;
        const svg = d3.select("#calibration-chart").append("svg").attr("width", width).attr("height", height);

        // Axes
        svg.append("line").attr("x1", 30).attr("y1", height - 30).attr("x2", width - 10).attr("y2", height - 30).attr("stroke", "#475569");
        svg.append("line").attr("x1", 30).attr("y1", parseInt(height) - 30).attr("x2", 30).attr("y2", 10).attr("stroke", "#475569");

        // Ideal Linear
        svg.append("line").attr("x1", 30).attr("y1", height - 30).attr("x2", width - 30).attr("y2", 30).attr("stroke", "#fff").attr("stroke-dasharray", "4 4");

        // Hysteresis Loop
        const hystPath = `M 30 ${height - 30} Q ${width / 2} ${height - 30} ${width - 30} 30 Q ${width / 2} 30 30 ${height - 30}`;
        svg.append("path")
            .attr("d", hystPath)
            .attr("fill", "rgba(0, 255, 136, 0.1)")
            .attr("stroke", "var(--mod1-color)")
            .attr("stroke-width", 2);

        // Dead zone marker
        svg.append("rect").attr("x", 30).attr("y", height - 30).attr("width", 20).attr("height", 5).attr("fill", "#ef4444");
        svg.append("text").attr("x", 40).attr("y", height - 10).attr("fill", "#ef4444").attr("font-size", 10).text("Dead Zone");
    }


    // --- MODULE 2: Analog Indicating Instruments ---

    // 2.1 Damping Ratio Animator & D3 Graph
    const needle = document.getElementById('meter-needle');
    const dampBtns = ['damp-under', 'damp-crit', 'damp-over'];
    let dampAnim;

    // Setup D3 Damping Graph
    let dGraphContainer = document.getElementById('damping-graph');
    let svgDamp, pathDamp, lineGenDamp, xScaleDamp, yScaleDamp;

    if (dGraphContainer) {
        const w = dGraphContainer.clientWidth;
        const h = dGraphContainer.clientHeight;
        svgDamp = d3.select('#damping-graph').append('svg').attr('width', w).attr('height', h);

        xScaleDamp = d3.scaleLinear().domain([0, 10]).range([20, w - 10]);
        yScaleDamp = d3.scaleLinear().domain([0, 1.5]).range([h - 20, 10]);

        lineGenDamp = d3.line().x(d => xScaleDamp(d.t)).y(d => yScaleDamp(d.y)).curve(d3.curveBasis);

        // Target line (1.0)
        svgDamp.append("line").attr("x1", 20).attr("y1", yScaleDamp(1)).attr("x2", w - 10).attr("y2", yScaleDamp(1)).attr("stroke", "#94a3b8").attr("stroke-dasharray", "4 4");

        pathDamp = svgDamp.append("path").attr("fill", "none").attr("stroke", "var(--mod2-color)").attr("stroke-width", 2);
    }

    function triggerDamping(type) {
        // Reset CSS classes
        dampBtns.forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.classList.remove('active'); el.style.color = 'var(--text-secondary)'; }
        });
        const activeBtn = document.getElementById(`damp-${type}`);
        if (activeBtn) { activeBtn.classList.add('active'); activeBtn.style.color = '#000'; }

        // Maths for curve
        let data = [];
        for (let t = 0; t <= 10; t += 0.1) {
            let y = 0;
            if (type === 'under') {
                // zeta = 0.3
                y = 1 - Math.exp(-0.8 * t) * Math.cos(2 * t);
            } else if (type === 'crit') {
                // zeta = 1
                y = 1 - (1 + 1.5 * t) * Math.exp(-1.5 * t);
            } else if (type === 'over') {
                // zeta = 2
                y = 1 - 1.2 * Math.exp(-0.5 * t) + 0.2 * Math.exp(-3 * t);
            }
            data.push({ t: t, y: y });
        }

        if (pathDamp) {
            pathDamp.datum(data)
                .transition().duration(500)
                .attr("d", lineGenDamp);
        }

        // Animate SVG Needle GSAP
        if (needle) {
            if (dampAnim) dampAnim.kill();
            gsap.set(needle, { rotation: -90 }); // reset to 0

            if (type === 'under') {
                dampAnim = gsap.to(needle, { rotation: 0, duration: 2, ease: "elastic.out(1, 0.3)" });
            } else if (type === 'crit') {
                dampAnim = gsap.to(needle, { rotation: 0, duration: 1.5, ease: "power2.out" });
            } else if (type === 'over') {
                dampAnim = gsap.to(needle, { rotation: 0, duration: 3, ease: "power1.out" });
            }
        }
    }

    if (document.getElementById('damp-under')) {
        document.getElementById('damp-under').addEventListener('click', () => triggerDamping('under'));
        document.getElementById('damp-crit').addEventListener('click', () => triggerDamping('crit'));
        document.getElementById('damp-over').addEventListener('click', () => triggerDamping('over'));
        triggerDamping('under'); // init
    }

    // 2.6 Rectifier Toggle
    const rectToggle = document.getElementById('rect-toggle');
    const rectWave = document.getElementById('rect-wave');
    let isFullWave = false;

    if (rectToggle && rectWave) {
        rectToggle.addEventListener('click', () => {
            isFullWave = !isFullWave;
            if (isFullWave) {
                rectWave.setAttribute('d', 'M 10 50 Q 25 10 40 50 Q 55 10 70 50 Q 85 10 100 50 Q 115 10 130 50');
                rectToggle.innerText = "Switch to Half-Wave";
            } else {
                rectWave.setAttribute('d', 'M 10 50 Q 25 10 40 50 Q 55 50 70 50 Q 85 10 100 50 Q 115 50 130 50');
                rectToggle.innerText = "Switch to Full-Wave";
            }
        });
    }


    // --- MODULE 3: Measurement of Power & Energy ---

    // 3.1 Wattmeter Connection Toggle
    const btnMethA = document.getElementById('btn-meth-a');
    const btnMethB = document.getElementById('btn-meth-b');
    const wattCC = document.getElementById('watt-cc');
    const wattPC = document.getElementById('watt-pc');

    if (btnMethA && btnMethB) {
        btnMethA.addEventListener('click', () => {
            btnMethA.classList.add('active');
            btnMethB.classList.remove('active');

            // Method A: CC is before PC. PC connects after CC (across load).
            // In our SVG: CC is at x=120 to 180.
            // If PC connects AFTER CC, it should drop down from x=190.
            wattPC.innerHTML = `<line x1="190" y1="50" x2="190" y2="65" stroke="var(--mod2-color)" stroke-width="2"/>
                                <path d="M 190 65 Q 175 75 190 85 Q 205 95 190 100" fill="none" stroke="var(--mod2-color)" stroke-width="2"/>
                                <text x="170" y="80" fill="var(--mod2-color)" font-size="12">PC</text>`;

            wattCC.classList.add('watt-active');
            wattPC.classList.remove('watt-active');
        });

        btnMethB.addEventListener('click', () => {
            btnMethB.classList.add('active');
            btnMethA.classList.remove('active');

            // Method B: PC connects BEFORE CC (across supply).
            // Drops down from x=100 (before CC starts at 120).
            wattPC.innerHTML = `<line x1="100" y1="50" x2="100" y2="65" stroke="var(--mod2-color)" stroke-width="2"/>
                                <path d="M 100 65 Q 85 75 100 85 Q 115 95 100 100" fill="none" stroke="var(--mod2-color)" stroke-width="2"/>
                                <text x="80" y="80" fill="var(--mod2-color)" font-size="12">PC</text>`;

            wattPC.classList.add('watt-active');
            wattCC.classList.remove('watt-active');
        });

        btnMethA.click(); // Init
    }

    // 3.2 Two Wattmeter Method D3 Bar Chart
    const wChartContainer = document.getElementById('wattmeter-chart');
    const pfSlider = document.getElementById('pf-slider');
    const pfVal = document.getElementById('pf-val');
    const pfNote = document.getElementById('pf-note');

    if (wChartContainer && pfSlider) {
        const w = wChartContainer.clientWidth;
        const h = wChartContainer.clientHeight;
        const svgW = d3.select('#wattmeter-chart').append('svg').attr('width', w).attr('height', h);

        const xScaleW = d3.scaleBand().domain(['W1', 'W2']).range([40, w - 40]).padding(0.4);
        const yScaleW = d3.scaleLinear().domain([-50, 100]).range([h - 20, 10]);

        // Zero Line
        svgW.append("line").attr("x1", 20).attr("y1", yScaleW(0)).attr("x2", w - 20).attr("y2", yScaleW(0)).attr("stroke", "#94a3b8");

        // Bars
        const barW1 = svgW.append("rect").attr("x", xScaleW('W1')).attr("width", xScaleW.bandwidth()).attr("fill", "var(--mod6-color)");
        const barW2 = svgW.append("rect").attr("x", xScaleW('W2')).attr("width", xScaleW.bandwidth()).attr("fill", "var(--mod3-color)");

        // Labels
        svgW.append("text").attr("x", xScaleW('W1') + xScaleW.bandwidth() / 2).attr("y", h - 5).attr("fill", "#fff").attr("text-anchor", "middle").text("W1");
        svgW.append("text").attr("x", xScaleW('W2') + xScaleW.bandwidth() / 2).attr("y", h - 5).attr("fill", "#fff").attr("text-anchor", "middle").text("W2");

        const textW1 = svgW.append("text").attr("x", xScaleW('W1') + xScaleW.bandwidth() / 2).attr("text-anchor", "middle").attr("fill", "#fff").attr("font-size", 12);
        const textW2 = svgW.append("text").attr("x", xScaleW('W2') + xScaleW.bandwidth() / 2).attr("text-anchor", "middle").attr("fill", "#fff").attr("font-size", 12);

        function updateWattmeters(pf) {
            if (pfVal) pfVal.innerText = pf;
            // Angle phi from PF
            let phi = Math.acos(pf); // radians

            // Assume VI = 100 basis
            let VI = 100;
            // W1 = VI cos(30 - phi), W2 = VI cos(30 + phi)
            // Note: 30 deg in radians = PI/6
            let w1 = VI * Math.cos(Math.PI / 6 - phi);
            let w2 = VI * Math.cos(Math.PI / 6 + phi);

            // Update UI
            if (pfNote) {
                if (pf == 1) pfNote.innerText = "W1 = W2. Total P = 2W";
                else if (pf == 0.5) pfNote.innerText = "W2 = 0. One meter reads total power.";
                else if (pf == 0) pfNote.innerText = "W1 = -W2. Total P = 0.";
                else pfNote.innerText = "Normal lagging load distribution.";
            }

            // D3 Update
            barW1.transition().duration(200)
                .attr("y", w1 >= 0 ? yScaleW(w1) : yScaleW(0))
                .attr("height", Math.abs(yScaleW(w1) - yScaleW(0)));

            barW2.transition().duration(200)
                .attr("y", w2 >= 0 ? yScaleW(w2) : yScaleW(0))
                .attr("height", Math.abs(yScaleW(w2) - yScaleW(0)));

            textW1.text(w1.toFixed(1)).attr("y", w1 >= 0 ? yScaleW(w1) - 5 : yScaleW(w1) + 15);
            textW2.text(w2.toFixed(1)).attr("y", w2 >= 0 ? yScaleW(w2) - 5 : yScaleW(w2) + 15);
        }

        pfSlider.addEventListener('input', (e) => updateWattmeters(parseFloat(e.target.value)));
        updateWattmeters(0.8);
    }

    // 3.3 Energy Meter (kWh)
    const emDisc = document.getElementById('energy-disc');
    const loadSlider = document.getElementById('load-slider');
    const revCounter = document.getElementById('rev-counter');
    let kwhValue = 0.0;

    if (emDisc && loadSlider) {
        loadSlider.addEventListener('input', (e) => {
            let load = parseInt(e.target.value);
            if (load === 0) {
                emDisc.style.animationPlayState = 'paused';
            } else {
                emDisc.style.animationPlayState = 'running';
                let speedSecs = 6 - (load / 100) * 5;
                emDisc.style.animationDuration = `${speedSecs}s`;
            }
        });

        setInterval(() => {
            let load = parseInt(loadSlider.value);
            if (load > 0 && revCounter) {
                kwhValue += (load / 1000);
                revCounter.innerText = kwhValue.toFixed(1).padStart(6, '0') + " kWh";
                revCounter.classList.remove('rev-increment');
                void revCounter.offsetWidth;
                revCounter.classList.add('rev-increment');
            }
        }, 1000);
    }


    // --- MODULE 4: Bridge Circuits & Resistance ---

    // 4.1 Wheatstone Bridge Balance interaction
    const wSlider = document.getElementById('wheat-s-slider');
    const wValText = document.getElementById('wheat-s-val');
    const wStatusText = document.getElementById('wheat-status');
    const galvoNeedleElement = document.getElementById('galvo-needle');

    const wArmP = document.getElementById('arm-p');
    const wArmQ = document.getElementById('arm-q');
    const wArmR = document.getElementById('arm-r');
    const wArmS = document.getElementById('arm-s');

    if (wSlider && galvoNeedleElement) {
        const P = 100, Q = 100, R = 100;

        wSlider.addEventListener('input', (e) => {
            let S = parseInt(e.target.value);
            if (wValText) wValText.innerText = S;

            let unbalanceAmount = (P * S) - (Q * R);
            let angle = (unbalanceAmount / 5000) * 45;

            if (angle > 45) angle = 45;
            if (angle < -45) angle = -45;

            gsap.to(galvoNeedleElement, { rotation: angle, duration: 0.2 });

            if (angle === 0) {
                if (wStatusText) wStatusText.innerHTML = `<span style="color:var(--mod1-color); font-weight:bold;">BALANCED: PS = QR (Null Detected)</span>`;
                if (wArmP) wArmP.classList.add('balanced-bridge');
                if (wArmQ) wArmQ.classList.add('balanced-bridge');
                if (wArmR) wArmR.classList.add('balanced-bridge');
                if (wArmS) wArmS.classList.add('balanced-bridge');
            } else {
                if (wStatusText) wStatusText.innerHTML = `Unbalanced. Galvanometer deflected.`;
                if (wArmP) wArmP.classList.remove('balanced-bridge');
                if (wArmQ) wArmQ.classList.remove('balanced-bridge');
                if (wArmR) wArmR.classList.remove('balanced-bridge');
                if (wArmS) wArmS.classList.remove('balanced-bridge');
            }
        });

        wSlider.dispatchEvent(new Event('input'));
    }


    // --- MODULE 5: Instrument Transformers ---

    const ctBtn = document.getElementById('ct-btn');
    const ctSwitch = document.getElementById('ct-switch');
    const ctSpark = document.getElementById('ct-spark');
    let ctIsOpen = false;

    if (ctBtn && ctSwitch && ctSpark) {
        ctBtn.addEventListener('click', () => {
            ctIsOpen = !ctIsOpen;
            if (ctIsOpen) {
                gsap.to(ctSwitch, { rotation: 30, duration: 0.3 });
                ctSpark.classList.add('danger-spark');
                ctSpark.setAttribute('stroke', '#ef4444');
                ctBtn.innerText = "Close Circuit (Safe)";
                ctBtn.style.background = 'rgba(239, 68, 68, 0.2)';
            } else {
                gsap.to(ctSwitch, { rotation: 0, duration: 0.3 });
                ctSpark.classList.remove('danger-spark');
                ctSpark.setAttribute('stroke', 'none');
                ctBtn.innerText = "Open Circuit!";
                ctBtn.style.background = 'transparent';
            }
        });
    }


    // --- MODULE 7: Range Extension ---

    const amSelect = document.getElementById('ammeter-range');
    const amCalcDisplay = document.getElementById('ammeter-calc');

    if (amSelect) {
        amSelect.addEventListener('change', (e) => {
            let val = e.target.value;
            if (val == '1') {
                amCalcDisplay.innerText = "m = 10, R_sh = 0.111 Ω";
            } else if (val == '2') {
                amCalcDisplay.innerText = "m = 50, R_sh = 0.0204 Ω";
            } else {
                amCalcDisplay.innerText = "m = 100, R_sh = 0.0101 Ω";
            }
        });
    }

    const voltSelect = document.getElementById('voltmeter-range');
    const voltCalcDisplay = document.getElementById('voltmeter-calc');
    const voltBladeElement = document.getElementById('volt-blade');

    const rse1 = document.getElementById('rse-1');
    const rse2 = document.getElementById('rse-2');
    const rse3 = document.getElementById('rse-3');

    if (voltSelect && voltBladeElement) {
        voltSelect.addEventListener('change', (e) => {
            let val = e.target.value;
            if (val == '1') {
                voltCalcDisplay.innerText = "m=10, R_se = 9 kΩ (Rse1)";
                gsap.to(voltBladeElement, { rotation: 0, duration: 0.3 });
                if (rse1) rse1.classList.add('active-res');
                if (rse2) rse2.classList.remove('active-res');
                if (rse3) rse3.classList.remove('active-res');
            } else if (val == '2') {
                voltCalcDisplay.innerText = "m=50, R_se = 49 kΩ (Rse1+2)";
                gsap.to(voltBladeElement, { rotation: 30, duration: 0.3 });
                if (rse1) rse1.classList.add('active-res');
                if (rse2) rse2.classList.add('active-res');
                if (rse3) rse3.classList.remove('active-res');
            } else {
                voltCalcDisplay.innerText = "m=100, R_se = 99 kΩ (All)";
                gsap.to(voltBladeElement, { rotation: 60, duration: 0.3 });
                if (rse1) rse1.classList.add('active-res');
                if (rse2) rse2.classList.add('active-res');
                if (rse3) rse3.classList.add('active-res');
            }
        });
        voltSelect.dispatchEvent(new Event('change'));
    }

    const rvSlider = document.getElementById('rv-slider');
    const vMeasuredText = document.getElementById('v-measured');
    const loadingErrorDisplay = document.getElementById('loading-error-calc');

    if (rvSlider && vMeasuredText) {
        const E = 10;
        const R1 = 100;
        const R2 = 100;
        const vTrueValue = 5.0;

        rvSlider.addEventListener('input', (e) => {
            let rv = parseInt(e.target.value) * 10;
            let ReqVal = (R2 * rv) / (R2 + rv);
            let vmVal = E * (ReqVal / (R1 + ReqVal));

            if (vMeasuredText) vMeasuredText.innerText = `V_m = ${vmVal.toFixed(2)}V`;

            let errVal = ((vmVal - vTrueValue) / vTrueValue) * 100;
            if (loadingErrorDisplay) {
                loadingErrorDisplay.innerText = `Error: ${errVal.toFixed(1)}%`;
                if (errVal < -5) {
                    loadingErrorDisplay.style.color = "#ef4444";
                } else {
                    loadingErrorDisplay.style.color = "var(--mod1-color)";
                }
            }
        });
        rvSlider.dispatchEvent(new Event('input'));
    }

});
