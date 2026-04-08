// =========================================================================
// GLOBAL JS - MEASUREMENTS & INSTRUMENTATION FORMULA BOOK
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // Initialize AOS Animation Library with safety
    try {
        if (typeof AOS !== 'undefined') {
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
        }
    } catch (e) {
        console.error("AOS Load Error:", e);
        // Fallback: If AOS fails, ensure everything is visible
        document.querySelectorAll('[data-aos]').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
            el.style.visibility = 'visible';
        });
    }

    // Unit Switching & Progress Bar
    const sections = document.querySelectorAll('.module-section');
    const navLinks = document.querySelectorAll('.glass-sidebar__link');
    const progressBar = document.getElementById('progress-bar');
    let activeMod = 1;

    // Glass Sidebar Toggle
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

    // Re-render KaTeX formulas for the visible section
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

    // Switch to a module by number
    function switchModule(modNum) {
        activeMod = modNum;

        // Hide all sections, show selected
        sections.forEach(s => s.classList.remove('active'));
        const target = document.getElementById('mod' + modNum);
        if (target) target.classList.add('active');

        // Update sidebar active link
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.mod === String(modNum)) {
                link.classList.add('active');
            }
        });

        // Scroll to top of content
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Re-render math & refresh AOS
        reRenderMath();
        if (typeof AOS !== 'undefined') setTimeout(() => AOS.refresh(), 100);
    }

    // Scroll progress bar
    window.addEventListener('scroll', () => {
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / docHeight) * 100;
        if (progressBar) progressBar.style.width = scrolled + '%';
    });

    // Sidebar link click → unit switching
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const modNum = +this.dataset.mod;
            if (modNum) switchModule(modNum);
            closeSidebar();
        });
    });

    // --- MODULE 1: Measurement Fundamentals ---
    try {
        const dots = document.querySelectorAll('.dot-mark');
        const accBtnGroup = document.querySelectorAll('.mod1-btn');
        const cases = {
            'ap': [{ x: 150, y: 150 }, { x: 145, y: 155 }, { x: 155, y: 145 }, { x: 148, y: 148 }, { x: 152, y: 152 }],
            'p_na': [{ x: 220, y: 80 }, { x: 215, y: 85 }, { x: 225, y: 75 }, { x: 218, y: 78 }, { x: 222, y: 82 }],
            'a_np': [{ x: 150, y: 110 }, { x: 110, y: 150 }, { x: 190, y: 150 }, { x: 150, y: 190 }, { x: 170, y: 130 }],
            'neither': [{ x: 80, y: 200 }, { x: 230, y: 220 }, { x: 100, y: 90 }, { x: 210, y: 110 }, { x: 160, y: 240 }]
        };

        if (accBtnGroup.length > 0 && dots.length > 0) {
            accBtnGroup.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    accBtnGroup.forEach(b => {
                        b.classList.remove('active');
                        b.style.color = 'var(--text-secondary)';
                    });
                    e.currentTarget.classList.add('active');
                    e.currentTarget.style.color = '#000';
                    const type = e.currentTarget.getAttribute('data-type');
                    const targetPositions = cases[type];
                    gsap.to(dots, {
                        scale: 0, opacity: 0, duration: 0.2, stagger: 0.05,
                        onComplete: () => {
                            dots.forEach((dot, i) => {
                                dot.setAttribute('cx', targetPositions[i].x);
                                dot.setAttribute('cy', targetPositions[i].y);
                            });
                            gsap.to(dots, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)", stagger: 0.1 });
                        }
                    });
                });
            });
            accBtnGroup[0].click();
        }

        const errChart = document.getElementById('error-dist-chart');
        if (errChart && typeof d3 !== 'undefined') {
            const width = errChart.clientWidth;
            const height = errChart.clientHeight;
            const svg = d3.select("#error-dist-chart").append("svg").attr("width", width).attr("height", height);
            const mean = width / 2;
            const sd = 40;
            let pathData = [];
            for (let x = 20; x <= width - 20; x += 2) {
                let z = (x - mean) / sd;
                let y = (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
                let max_y = 1 / (sd * Math.sqrt(2 * Math.PI));
                let scaledY = height - 20 - (y / max_y) * (height - 60);
                pathData.push({ x: x, y: scaledY });
            }
            const lineGen = d3.line().x(d => d.x).y(d => d.y).curve(d3.curveBasis);
            svg.append("line").attr("x1", 20).attr("y1", height - 20).attr("x2", width - 20).attr("y2", height - 20).attr("stroke", "#475569").attr("stroke-width", 2);
            const areaGen1 = d3.area().x(d => d.x).y0(height - 20).y1(d => d.y).curve(d3.curveBasis);
            let s1Data = pathData.filter(d => d.x >= mean - sd && d.x <= mean + sd);
            svg.append("path").datum(s1Data).attr("d", areaGen1).attr("fill", "rgba(0, 255, 136, 0.4)");
            let s2Left = pathData.filter(d => d.x >= mean - 2 * sd && d.x <= mean - sd);
            let s2Right = pathData.filter(d => d.x >= mean + sd && d.x <= mean + 2 * sd);
            svg.append("path").datum(s2Left).attr("d", areaGen1).attr("fill", "rgba(0, 255, 136, 0.2)");
            svg.append("path").datum(s2Right).attr("d", areaGen1).attr("fill", "rgba(0, 255, 136, 0.2)");
            const path = svg.append("path").datum(pathData).attr("fill", "none").attr("stroke", "var(--mod1-color)").attr("stroke-width", 3).attr("d", lineGen);
            const totalLength = path.node().getTotalLength();
            path.attr("stroke-dasharray", totalLength + " " + totalLength).attr("stroke-dashoffset", totalLength).transition().duration(2000).ease(d3.easeLinear).attr("stroke-dashoffset", 0);
            svg.append("line").attr("x1", mean).attr("y1", height - 20).attr("x2", mean).attr("y2", 20).attr("stroke", "#fff").attr("stroke-dasharray", "4 4");
            svg.append("text").attr("x", mean).attr("y", 15).attr("fill", "#fff").attr("text-anchor", "middle").text("μ (True Value)");
        }

        const calChart = document.getElementById('calibration-chart');
        if (calChart && typeof d3 !== 'undefined') {
            const width = calChart.clientWidth;
            const height = calChart.clientHeight;
            const svg = d3.select("#calibration-chart").append("svg").attr("width", width).attr("height", height);
            svg.append("line").attr("x1", 30).attr("y1", height - 30).attr("x2", width - 10).attr("y2", height - 30).attr("stroke", "#475569");
            svg.append("line").attr("x1", 30).attr("y1", height - 30).attr("x2", 30).attr("y2", 10).attr("stroke", "#475569");
            svg.append("line").attr("x1", 30).attr("y1", height - 30).attr("x2", width - 30).attr("y2", 30).attr("stroke", "#fff").attr("stroke-dasharray", "4 4");
            const hystPath = `M 30 ${height - 30} Q ${width / 2} ${height - 30} ${width - 30} 30 Q ${width / 2} 30 30 ${height - 30}`;
            svg.append("path").attr("d", hystPath).attr("fill", "rgba(0, 255, 136, 0.1)").attr("stroke", "var(--mod1-color)").attr("stroke-width", 2);
            svg.append("rect").attr("x", 30).attr("y", height - 30).attr("width", 20).attr("height", 5).attr("fill", "#ef4444");
        }
    } catch (e) { console.warn('Error in Module 1', e); }

    // --- MODULE 2: Analog Indicating Instruments ---
    try {
        const needle = document.getElementById('meter-needle');
        const dampBtns = ['damp-under', 'damp-crit', 'damp-over'];
        let dGraphContainer = document.getElementById('damping-graph');
        let svgDamp, pathDamp, lineGenDamp, xScaleDamp, yScaleDamp;
        let dampAnim;

        if (dGraphContainer && typeof d3 !== 'undefined') {
            const w = dGraphContainer.clientWidth;
            const h = dGraphContainer.clientHeight;
            svgDamp = d3.select('#damping-graph').append('svg').attr('width', w).attr('height', h);
            xScaleDamp = d3.scaleLinear().domain([0, 10]).range([20, w - 10]);
            yScaleDamp = d3.scaleLinear().domain([0, 1.5]).range([h - 20, 10]);
            lineGenDamp = d3.line().x(d => xScaleDamp(d.t)).y(d => yScaleDamp(d.y)).curve(d3.curveBasis);
            svgDamp.append("line").attr("x1", 20).attr("y1", yScaleDamp(1)).attr("x2", w - 10).attr("y2", yScaleDamp(1)).attr("stroke", "#94a3b8").attr("stroke-dasharray", "4 4");
            pathDamp = svgDamp.append("path").attr("fill", "none").attr("stroke", "var(--mod2-color)").attr("stroke-width", 2);
        }

        window.triggerDamping = function(type) {
            dampBtns.forEach(id => {
                const el = document.getElementById(id);
                if (el) { el.classList.remove('active'); el.style.color = 'var(--text-secondary)'; }
            });
            const activeBtn = document.getElementById(`damp-${type}`);
            if (activeBtn) { activeBtn.classList.add('active'); activeBtn.style.color = '#000'; }

            let data = [];
            for (let t = 0; t <= 10; t += 0.1) {
                let y = (type === 'under') ? 1 - Math.exp(-0.8 * t) * Math.cos(2 * t) :
                        (type === 'crit') ? 1 - (1 + 1.5 * t) * Math.exp(-1.5 * t) :
                                            1 - 1.2 * Math.exp(-0.5 * t) + 0.2 * Math.exp(-3 * t);
                data.push({ t, y });
            }
            if (pathDamp) pathDamp.datum(data).transition().duration(500).attr("d", lineGenDamp);
            if (needle) {
                if (dampAnim) dampAnim.kill();
                gsap.set(needle, { rotation: -90 });
                let ease = (type === 'under') ? "elastic.out(1, 0.3)" : (type === 'crit') ? "power2.out" : "power1.out";
                let dur = (type === 'under') ? 2 : (type === 'crit') ? 1.5 : 3;
                dampAnim = gsap.to(needle, { rotation: 0, duration: dur, ease });
            }
        };

        if (document.getElementById('damp-under')) {
            document.getElementById('damp-under').addEventListener('click', () => triggerDamping('under'));
            document.getElementById('damp-crit').addEventListener('click', () => triggerDamping('crit'));
            document.getElementById('damp-over').addEventListener('click', () => triggerDamping('over'));
            triggerDamping('under');
        }

        const rectToggle = document.getElementById('rect-toggle');
        const rectWave = document.getElementById('rect-wave');
        let isFullWave = false;
        if (rectToggle && rectWave) {
            rectToggle.addEventListener('click', () => {
                isFullWave = !isFullWave;
                rectWave.setAttribute('d', isFullWave ? 'M 10 50 Q 25 10 40 50 Q 55 10 70 50 Q 85 10 100 50 Q 115 10 130 50' : 'M 10 50 Q 25 10 40 50 Q 55 50 70 50 Q 85 10 100 50 Q 115 50 130 50');
                rectToggle.innerText = isFullWave ? "Switch to Half-Wave" : "Switch to Full-Wave";
            });
        }
    } catch (e) { console.warn('Error in Module 2', e); }

    // --- MODULE 3: Measurement of Power & Energy ---
    try {
        const btnMethA = document.getElementById('btn-meth-a');
        const btnMethB = document.getElementById('btn-meth-b');
        const wattCC = document.getElementById('watt-cc');
        const wattPC = document.getElementById('watt-pc');

        if (btnMethA && btnMethB && wattPC) {
            btnMethA.addEventListener('click', () => {
                btnMethA.classList.add('active'); btnMethB.classList.remove('active');
                wattPC.innerHTML = `<line x1="190" y1="50" x2="190" y2="65" stroke="var(--mod2-color)" stroke-width="2"/><path d="M 190 65 Q 175 75 190 85 Q 205 95 190 100" fill="none" stroke="var(--mod2-color)" stroke-width="2"/><text x="170" y="80" fill="var(--mod2-color)" font-size="12">PC</text>`;
                if (wattCC) wattCC.classList.add('watt-active'); wattPC.classList.remove('watt-active');
            });
            btnMethB.addEventListener('click', () => {
                btnMethB.classList.add('active'); btnMethA.classList.remove('active');
                wattPC.innerHTML = `<line x1="100" y1="50" x2="100" y2="65" stroke="var(--mod2-color)" stroke-width="2"/><path d="M 100 65 Q 85 75 100 85 Q 115 95 100 100" fill="none" stroke="var(--mod2-color)" stroke-width="2"/><text x="80" y="80" fill="var(--mod2-color)" font-size="12">PC</text>`;
                wattPC.classList.add('watt-active'); if (wattCC) wattCC.classList.remove('watt-active');
            });
            btnMethA.click();
        }

        const wChartContainer = document.getElementById('wattmeter-chart');
        const pfSlider = document.getElementById('pf-slider');
        if (wChartContainer && pfSlider && typeof d3 !== 'undefined') {
            const w = wChartContainer.clientWidth, h = wChartContainer.clientHeight;
            const svgW = d3.select('#wattmeter-chart').append('svg').attr('width', w).attr('height', h);
            const xScaleW = d3.scaleBand().domain(['W1', 'W2']).range([40, w - 40]).padding(0.4);
            const yScaleW = d3.scaleLinear().domain([-50, 100]).range([h - 20, 10]);
            svgW.append("line").attr("x1", 20).attr("y1", yScaleW(0)).attr("x2", w - 20).attr("y2", yScaleW(0)).attr("stroke", "#94a3b8");
            const barW1 = svgW.append("rect").attr("x", xScaleW('W1')).attr("width", xScaleW.bandwidth()).attr("fill", "var(--mod6-color)");
            const barW2 = svgW.append("rect").attr("x", xScaleW('W2')).attr("width", xScaleW.bandwidth()).attr("fill", "var(--mod3-color)");
            const textW1 = svgW.append("text").attr("x", xScaleW('W1') + xScaleW.bandwidth() / 2).attr("text-anchor", "middle").attr("fill", "#fff").attr("font-size", 12);
            const textW2 = svgW.append("text").attr("x", xScaleW('W2') + xScaleW.bandwidth() / 2).attr("text-anchor", "middle").attr("fill", "#fff").attr("font-size", 12);

            function updateWattmeters(pf) {
                let phi = Math.acos(pf), VI = 100;
                let w1 = VI * Math.cos(Math.PI / 6 - phi), w2 = VI * Math.cos(Math.PI / 6 + phi);
                barW1.transition().duration(200).attr("y", w1 >= 0 ? yScaleW(w1) : yScaleW(0)).attr("height", Math.abs(yScaleW(w1) - yScaleW(0)));
                barW2.transition().duration(200).attr("y", w2 >= 0 ? yScaleW(w2) : yScaleW(0)).attr("height", Math.abs(yScaleW(w2) - yScaleW(0)));
                textW1.text(w1.toFixed(1)).attr("y", w1 >= 0 ? yScaleW(w1) - 5 : yScaleW(w1) + 15);
                textW2.text(w2.toFixed(1)).attr("y", w2 >= 0 ? yScaleW(w2) - 5 : yScaleW(w2) + 15);
            }
            pfSlider.addEventListener('input', (e) => updateWattmeters(parseFloat(e.target.value)));
            updateWattmeters(0.8);
        }
    } catch (e) { console.warn('Error in Module 3', e); }

    // --- MODULE 4: Bridge Circuits & Resistance ---
    try {
        const wSlider = document.getElementById('wheat-s-slider');
        const galvoNeedle = document.getElementById('galvo-needle');
        if (wSlider && galvoNeedle) {
            const P = 100, Q = 100, R = 100;
            wSlider.addEventListener('input', (e) => {
                let S = parseInt(e.target.value);
                let unbalance = (P * S) - (Q * R);
                let angle = Math.max(-45, Math.min(45, (unbalance / 5000) * 45));
                gsap.to(galvoNeedle, { rotation: angle, duration: 0.2 });
            });
            wSlider.dispatchEvent(new Event('input'));
        }
    } catch (e) { console.warn('Error in Module 4', e); }

    // --- MODULE 5: Instrument Transformers ---
    try {
        const ctBtn = document.getElementById('ct-btn');
        const ctSwitch = document.getElementById('ct-switch');
        const ctSpark = document.getElementById('ct-spark');
        let ctIsOpen = false;
        if (ctBtn && ctSwitch && ctSpark) {
            ctBtn.addEventListener('click', () => {
                ctIsOpen = !ctIsOpen;
                gsap.to(ctSwitch, { rotation: ctIsOpen ? 30 : 0, duration: 0.3 });
                ctSpark.classList.toggle('danger-spark', ctIsOpen);
                ctSpark.setAttribute('stroke', ctIsOpen ? '#ef4444' : 'none');
                ctBtn.innerText = ctIsOpen ? "Close Circuit (Safe)" : "Open Circuit!";
            });
        }
    } catch (e) { console.warn('Error in Module 5', e); }

    // --- MODULE 6: Electronic & Special Instruments ---
    try {
        const dvmVin = document.getElementById('vin-slider');
        const dvmChartCont = document.getElementById('dvm-chart');
        if (dvmChartCont && dvmVin && typeof d3 !== 'undefined') {
            const cw = dvmChartCont.clientWidth, ch = dvmChartCont.clientHeight;
            const dvmSvg = d3.select('#dvm-chart').append('svg').attr('width', cw).attr('height', ch);
            const pathLine = dvmSvg.append("path").attr("fill", "none").attr("stroke", "var(--mod6-color)").attr("stroke-width", 2);
            function updateDVM() {
                let vin = parseFloat(dvmVin.value), t1_x = cw / 2;
                let peakY = (ch - 20) - (vin * 3), t2_x = t1_x + (vin / 10) * (cw / 2 - 20);
                pathLine.transition().duration(200).attr("d", `M 10 ${ch - 20} L ${t1_x} ${peakY} L ${t2_x} ${ch - 20}`);
            }
            dvmVin.addEventListener('input', updateDVM);
            updateDVM();
        }

        const croBeam = document.getElementById('cro-beam');
        const croFSlide = document.getElementById('cro-f-slider');
        const croASlide = document.getElementById('cro-a-slider');
        let croTime = 0;
        if (croBeam && croFSlide && croASlide) {
            function renderCRO() {
                croTime += 0.05;
                let f = parseFloat(croFSlide.value), A = parseFloat(croASlide.value), path = "M 0 50 ";
                for (let x = 0; x <= 100; x += 2) path += `L ${x} ${50 - A * Math.sin(f * (x / 100) * Math.PI * 2 + croTime)} `;
                croBeam.setAttribute('d', path);
                requestAnimationFrame(renderCRO);
            }
            renderCRO();
        }

        const sgLoad = document.getElementById('strain-load-slider');
        const cantilever = document.getElementById('cantilever');
        if (sgLoad && cantilever) {
            sgLoad.addEventListener('input', (e) => {
                let load = parseInt(e.target.value);
                cantilever.setAttribute('d', `M 30 70 Q 100 ${70 + load / 2} 170 ${70 + load} L 170 ${80 + load} Q 100 ${80 + load / 2} 30 80 Z`);
            });
        }
    } catch (e) { console.warn('Error in Module 6', e); }

    // --- MODULE 7: Range Extension ---
    try {
        const amSelect = document.getElementById('ammeter-range');
        const amCalc = document.getElementById('ammeter-calc');
        if (amSelect && amCalc) {
            amSelect.addEventListener('change', (e) => {
                let v = e.target.value;
                amCalc.innerText = (v == '1') ? "m = 10, R_sh = 0.111 Ω" : (v == '2') ? "m = 50, R_sh = 0.0204 Ω" : "m = 100, R_sh = 0.0101 Ω";
            });
        }
    } catch (e) { console.warn('Error in Module 7', e); }

});
