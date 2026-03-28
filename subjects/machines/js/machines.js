document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize AOS (Animate on Scroll)
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });

    // 2. Render KaTeX Formulas (provided in prompt)
    renderMathInElement(document.body, {
        delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false }
        ],
        throwOnError: false
    });

    // 3. Scroll Progress Bar
    const progressBar = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";
    });

    // 4. Smooth Scrolling & Active Link State
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 50,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Update active state on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // 5. GSAP Animations for Module 1 (Intro)

    // Faraday's Law - B-field lines pulsating
    gsap.to('#b-field-lines', {
        opacity: 0.3,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    // Torque Development force arrows pulsing
    gsap.to('#force-arrows line', {
        strokeDasharray: "5 5",
        strokeDashoffset: -20,
        duration: 1,
        repeat: -1,
        ease: "linear"
    });

    // classification flowchart hover interactions
    const treeNodes = document.querySelectorAll('.tree-node');
    treeNodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            gsap.to(node, { scale: 1.05, duration: 0.2 });
        });
        node.addEventListener('mouseleave', () => {
            gsap.to(node, { scale: 1, duration: 0.2 });
        });
    });


// --- MODULE 2: DC Machines Interactions ---

// 1. DC Construction Hover Tooltips
const dcParts = document.querySelectorAll('.dc-part');
const tooltipText = document.getElementById('dc-tooltip-text');

dcParts.forEach(part => {
    part.addEventListener('mouseenter', function () {
        const info = this.getAttribute('data-info');
        if (info) tooltipText.innerHTML = info;
        this.style.stroke = "var(--mod2-color)";
    });
    part.addEventListener('mouseleave', function () {
        tooltipText.innerHTML = "Explore the internal construction of a DC Machine to learn about its components.";
        this.style.stroke = "";
    });
});

// 2. EMF Calculator
const btnCalcEMF = document.getElementById('calc-emf-btn');
if (btnCalcEMF) {
    btnCalcEMF.addEventListener('click', () => {
        const P = parseFloat(document.getElementById('emf-p').value) || 0;
        const phi = parseFloat(document.getElementById('emf-phi').value) || 0;
        const N = parseFloat(document.getElementById('emf-n').value) || 0;
        const Z = parseFloat(document.getElementById('emf-z').value) || 0;
        const aType = document.getElementById('emf-a').value;

        let A = (aType === 'lap') ? P : 2;

        if (P && phi && N && Z && A) {
            const E = (P * phi * N * Z) / (60 * A);

            // Animate number
            const resultDisplay = document.getElementById('emf-result');
            let obj = { val: 0 };
            gsap.to(obj, {
                val: E,
                duration: 1,
                onUpdate: () => {
                    resultDisplay.innerText = obj.val.toFixed(2) + " V";
                }
            });
        } else {
            document.getElementById('emf-result').innerText = "Enter all values";
        }
    });
}

// 3. Torque Equation Chart (Chart.js)
const ctxTorque = document.getElementById('torqueChart');
if (ctxTorque) {
    let torqueData = [];
    for (let ia = 0; ia <= 100; ia += 10) {
        torqueData.push({ x: ia, y: 0.5 * ia }); // T propto Ia (assuming const phi)
    }

    let torqueChart = new Chart(ctxTorque, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Torque (Nm)',
                data: torqueData,
                borderColor: '#facc15',
                backgroundColor: 'rgba(250, 204, 21, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { type: 'linear', position: 'bottom', title: { display: true, text: 'Armature Current Ia (A)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { title: { display: true, text: 'Torque T (Nm)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, min: 0, max: 60 }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Interactive slider
    const iaSlider = document.getElementById('ia-slider');
    iaSlider.addEventListener('input', (e) => {
        let currentIa = parseFloat(e.target.value);
        // Highlight point on chart
        let newData = [];
        for (let ia = 0; ia <= 100; ia += 10) {
            newData.push({ x: ia, y: 0.5 * ia * (ia <= currentIa ? 1 : 0.2) });
        }
        torqueChart.data.datasets[0].data = newData;
        torqueChart.update();
    });
}

// 4. Speed Control D3.js Characteristic Tracer
const speedContainer = document.getElementById('speed-control-chart');
if (speedContainer) {
    // Simple D3 setup for Speed N vs Torque T
    const width = speedContainer.clientWidth;
    const height = speedContainer.clientHeight;

    const svg = d3.select("#speed-control-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Setup scales
    const xScale = d3.scaleLinear().domain([0, 100]).range([30, width - 10]);
    const yScale = d3.scaleLinear().domain([0, 1500]).range([height - 20, 10]);

    // Base line N = 1000 - 2*T
    const lineGen = d3.line()
        .x(d => xScale(d.T))
        .y(d => yScale(d.N))
        .curve(d3.curveBasis);

    let path = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "#00f5ff")
        .attr("stroke-width", 3);

    // Axes
    svg.append("g").attr("transform", `translate(0,${height - 20})`).call(d3.axisBottom(xScale).ticks(5)).attr("color", "#94a3b8");
    svg.append("g").attr("transform", `translate(30,0)`).call(d3.axisLeft(yScale).ticks(4)).attr("color", "#94a3b8");

    function updateSpeedCurve(V_percent, Phi_percent) {
        let V = V_percent / 100;
        let phi = Phi_percent / 100;

        let data = [];
        for (let T = 0; T <= 100; T += 10) {
            // N = V/phi - (R/phi^2)*T (simplified DC motor model)
            // Base N = 1000 at V=1, phi=1, T=0
            let N = (1000 * V / phi) - (2 * T / (phi * phi));
            if (N < 0) N = 0;
            data.push({ T: T, N: N });
        }
        path.datum(data)
            .transition().duration(200)
            .attr("d", lineGen);
    }

    updateSpeedCurve(100, 100);

    const voltSlider = document.getElementById('volt-slider');
    const fluxSlider = document.getElementById('flux-slider');

    voltSlider.addEventListener('input', () => updateSpeedCurve(voltSlider.value, fluxSlider.value));
    fluxSlider.addEventListener('input', () => updateSpeedCurve(voltSlider.value, fluxSlider.value));
}




// --- MODULE 3: 1-Phase Transformer ---

// 1. Transformer Principle Slider
const tRatioSlider = document.getElementById('t-ratio-slider');
const nRatioDisplay = document.getElementById('n-ratio-display');
const v2Display = document.getElementById('v2-display');
const secCoilPath = document.getElementById('sec-coil-path');
const secWave = document.getElementById('t-sec-wave');

if (tRatioSlider) {
    tRatioSlider.addEventListener('input', (e) => {
        const a = parseFloat(e.target.value);
        nRatioDisplay.innerText = a.toFixed(2);

        // V2 = V1 / a (Wait. a = N1/N2 or N2/N1. Formula says V1/V2 = N1/N2 = a. But label says N2/N1. Let's fix calculation: if ratio=N2/N1, V2 = V1 * ratio)
        const v2 = 240 * a;
        v2Display.innerText = Math.round(v2) + "V";

        // visually scale secondary items
        // Wave amplitude scaling
        gsap.to(secWave, { scaleY: a > 1 ? 1.5 : (a < 1 ? 0.5 : 1), transformOrigin: "center center", duration: 0.3 });
    });
}

// 2. Ideal vs Real Toggle
const toggleRealBtn = document.getElementById('toggle-real-btn');
const realCoreHeat = document.getElementById('real-core-heat');
const idealFormulas = document.getElementById('ideal-formulas');
const realFormulas = document.getElementById('real-formulas');
let isReal = false;

if (toggleRealBtn) {
    toggleRealBtn.addEventListener('click', () => {
        isReal = !isReal;
        if (isReal) {
            toggleRealBtn.innerText = "Switch to Ideal Model";
            realCoreHeat.classList.add('heat-glow');
            document.getElementById('real-cu-heat-1').classList.add('heat-glow');
            document.getElementById('real-cu-heat-2').classList.add('heat-glow');
            idealFormulas.style.display = 'none';
            realFormulas.style.display = 'block';
        } else {
            toggleRealBtn.innerText = "Toggle Real Model";
            realCoreHeat.classList.remove('heat-glow');
            document.getElementById('real-cu-heat-1').classList.remove('heat-glow');
            document.getElementById('real-cu-heat-2').classList.remove('heat-glow');
            realFormulas.style.display = 'none';
            idealFormulas.style.display = 'block';
        }
    });
}

// 3. Efficiency Chart
const ctxEff = document.getElementById('efficiencyChart');
if (ctxEff) {
    let effData = [];
    for (let x = 0; x <= 1.5; x += 0.1) {
        // Eff = (x*S)/(x*S + Pi + x^2*Pcu)
        let eff = (x * 100) / (x * 100 + 2 + x * x * 3);
        effData.push({ x: x, y: eff * 100 });
    }

    new Chart(ctxEff, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Efficiency %',
                data: effData,
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                borderWidth: 2, fill: true, tension: 0.4,
                pointRadius: (ctx) => { return ctx.dataIndex === 8 ? 6 : 0; }, // x=0.8 is max eff ish
                pointBackgroundColor: '#facc15'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { type: 'linear', position: 'bottom', title: { display: true, text: 'Fractional Load (x)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { title: { display: true, text: 'Efficiency %', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, min: 80, max: 100 }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// 4. VR power factor
const pfSelector = document.getElementById('pf-selector');
const vrDisplay = document.getElementById('vr-display');
if (pfSelector) {
    pfSelector.addEventListener('change', (e) => {
        if (e.target.value === 'lag') {
            vrDisplay.innerText = "VR > 0 (Voltage Drops)";
            vrDisplay.style.color = "var(--mod3-color)";
        } else if (e.target.value === 'unity') {
            vrDisplay.innerText = "VR ≈ 0 (Slight Drop)";
            vrDisplay.style.color = "var(--text-primary)";
        } else {
            vrDisplay.innerText = "VR < 0 (Voltage Rises)";
            vrDisplay.style.color = "var(--neon-cyan)";
        }
    });
}


// --- MODULE 4: 3-Phase Transformer ---

// 1. Vector Groups Tab Switcher & Clock Animation
const vTabs = document.querySelectorAll('.v-tab');
const lvPhasor = document.getElementById('lv-phasor-group');

vTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        // Remove active class from all
        vTabs.forEach(t => {
            t.classList.remove('active');
            t.style.background = 'transparent';
            t.style.borderBottom = 'none';
            t.style.color = 'var(--text-secondary)';
        });

        // Add active to clicked
        const activeTab = e.currentTarget;
        activeTab.classList.add('active');
        activeTab.style.background = 'rgba(167, 139, 250, 0.1)';
        activeTab.style.borderBottom = '3px solid var(--mod4-color)';
        activeTab.style.color = '#fff';

        const group = activeTab.getAttribute('data-group');

        // Hide all formulas
        document.querySelectorAll('[id^="v-formula-"]').forEach(f => f.style.display = 'none');
        // Show targeted formula
        document.getElementById('v-formula-' + group).style.display = 'block';

        // Rotate LV Phasor
        if (group === 'Yy0' || group === 'Dd0') {
            lvPhasor.style.transform = 'rotate(0deg)';
        } else if (group === 'Yd1') {
            lvPhasor.style.transform = 'rotate(30deg)'; // 1 o'clock (+30 deg from 12)
        } else if (group === 'Dy11') {
            lvPhasor.style.transform = 'rotate(-30deg)'; // 11 o'clock (-30 deg from 12)
        }
    });
});


// --- MODULE 5: 3-Phase Induction Motor ---

// 1. Slip Speedometer
const slipSlider = document.getElementById('slip-slider');
const slipDisplay = document.getElementById('slip-percentage');
const rotorNeedle = document.getElementById('rotor-needle');

if (slipSlider) {
    slipSlider.addEventListener('input', (e) => {
        let slip = parseFloat(e.target.value);
        slipDisplay.innerText = `Slip: ${slip}%`;

        // Speed = Ns(1 - s). If s=100%, speed=0. If s=0%, speed=100%.
        // SVG arc goes from 180 deg (left, 0 speed) to 0 deg (right, max speed).
        // Actually in SVG transform rotating around center:
        // Let's say 0 speed is angle -180 (or 180 looking left).
        // If we use standard rotation, 0 degrees is right (3 o'clock). 180 is left (9 o'clock).
        // At slip 100% (speed 0), angle = 180.
        // At slip 0% (speed Ns), angle = 0.
        let angle = 180 * (slip / 100);
        rotorNeedle.style.transform = `rotate(${angle}deg)`;
    });
    // Init
    slipSlider.dispatchEvent(new Event('input'));
}

// 2. Torque-Slip D3 Chart
const tsContainer = document.getElementById('torque-slip-chart');
if (tsContainer) {
    const width = tsContainer.clientWidth;
    const height = tsContainer.clientHeight;

    const svg = d3.select("#torque-slip-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // X-axis is slip from 1 (standstill) to 0 (sync). Better to show Speed from 0 to Ns.
    const xScale = d3.scaleLinear().domain([1, 0]).range([40, width - 10]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([height - 30, 10]);

    // Base line
    const lineGen = d3.line()
        .x(d => xScale(d.s))
        .y(d => yScale(d.T))
        .curve(d3.curveBasis);

    let path = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "#34d399")
        .attr("stroke-width", 3);

    // Axes
    svg.append("g").attr("transform", `translate(0,${height - 30})`).call(d3.axisBottom(xScale).ticks(5)).attr("color", "#94a3b8");
    svg.append("g").attr("transform", `translate(40,0)`).call(d3.axisLeft(yScale).ticks(4)).attr("color", "#94a3b8");

    svg.append("text").attr("x", width / 2).attr("y", height - 5).attr("fill", "#94a3b8").attr("text-anchor", "middle").attr("font-size", 10).text("Slip (s)");

    function updateTSCurve(R2) {
        let data = [];
        // Assuming X2 = 1, E2 = 1. Max T ~ 0.5/(X2) = 50 scale.
        const X2 = 0.5;
        for (let s = 0.01; s <= 1; s += 0.02) {
            // T prop to (s * R2) / (R2^2 + (s*X2)^2)
            let T = 30 * (s * R2) / (R2 * R2 + (s * X2) * (s * X2));
            data.push({ s: s, T: T });
        }
        // Add exact zero
        data.push({ s: 0, T: 0 });
        // Sort by slip
        data.sort((a, b) => b.s - a.s);

        path.datum(data)
            .transition().duration(200)
            .attr("d", lineGen);
    }

    updateTSCurve(0.2);

    const r2Slider = document.getElementById('r2-slider');
    r2Slider.addEventListener('input', () => updateTSCurve(parseFloat(r2Slider.value)));
}

// 3. Starting Methods Chart (Chart.js)
const ctxStart = document.getElementById('startMethodsChart');
if (ctxStart) {
    new Chart(ctxStart, {
        type: 'bar',
        data: {
            labels: ['Starting Current (I_st)', 'Starting Torque (T_st)'],
            datasets: [
                {
                    label: 'Direct On-Line (DOL)',
                    data: [100, 100], // Normalized to 100%
                    backgroundColor: '#ff5252',
                    borderColor: '#ff5252',
                    borderWidth: 1
                },
                {
                    label: 'Star-Delta (Y-Δ)',
                    data: [33.3, 33.3], // 1/3 of DOL
                    backgroundColor: '#34d399',
                    borderColor: '#34d399',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 110, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#fff', font: { family: "'Orbitron', sans-serif" } } }
            },
            plugins: {
                legend: { labels: { color: '#fff' } }
            }
        }
    });
}

// 4. VFD Speed Control 
const vfdSlider = document.getElementById('vfd-f-slider');
const vfdVal = document.getElementById('vfd-f-val');
const vfdWave = document.getElementById('vfd-wave');

if (vfdSlider) {
    vfdSlider.addEventListener('input', (e) => {
        let f = parseInt(e.target.value);
        vfdVal.innerText = f;

        // Generate sine wave path points based on frequency
        // Base f=50 -> 3 full waves in 300px width.
        let numWaves = f / 16.66; // 50/16.66 = 3 waves
        let points = [];
        for (let x = 10; x <= 290; x += 5) {
            // map x to angle
            let angle = (x - 10) / 280 * (numWaves * Math.PI * 2);
            let y = 50 - 40 * Math.sin(angle);
            points.push(`${x},${y}`);
        }

        // Convert to smooth path (roughly)
        let d = `M 10 50 `;
        for (let i = 1; i < points.length; i++) {
            d += `L ${points[i].split(',')[0]} ${points[i].split(',')[1]} `;
        }
        vfdWave.setAttribute('d', d);
    });

    // init
    vfdSlider.dispatchEvent(new Event('input'));
}


// --- MODULE 6: 1-Phase Induction Motor ---

// 1. Double Revolving Field Curve (D3)
const drfContainer = document.getElementById('drf-torque-chart');
if (drfContainer) {
    const width = drfContainer.clientWidth;
    const height = drfContainer.clientHeight;

    const svg = d3.select("#drf-torque-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // X-axis is speed from -Ns to +Ns (slip from 2 to 0)
    // Let's plot from s=2 to s=0
    const xScale = d3.scaleLinear().domain([2, 0]).range([40, width - 10]);
    const yScale = d3.scaleLinear().domain([-100, 100]).range([height - 30, 10]);

    const lineGen = d3.line()
        .x(d => xScale(d.s))
        .y(d => yScale(d.T))
        .curve(d3.curveBasis);

    // Zero Line
    svg.append("line")
        .attr("x1", xScale(2)).attr("y1", yScale(0))
        .attr("x2", xScale(0)).attr("y2", yScale(0))
        .attr("stroke", "rgba(255,255,255,0.2)").attr("stroke-dasharray", "4 4");

    // Standstill Line (s=1)
    svg.append("line")
        .attr("x1", xScale(1)).attr("y1", yScale(-100))
        .attr("x2", xScale(1)).attr("y2", yScale(100))
        .attr("stroke", "rgba(255,255,255,0.2)").attr("stroke-dasharray", "4 4");

    // Axes
    svg.append("g").attr("transform", `translate(0,${height - 30})`).call(d3.axisBottom(xScale).ticks(5)).attr("color", "#94a3b8");
    svg.append("g").attr("transform", `translate(40,0)`).call(d3.axisLeft(yScale).ticks(5)).attr("color", "#94a3b8");
    svg.append("text").attr("x", width / 2).attr("y", height - 5).attr("fill", "#94a3b8").attr("text-anchor", "middle").attr("font-size", 10).text("Slip (s)");

    // Data gen
    let dataFwd = [], dataBwd = [], dataNet = [];
    const R2 = 0.2, X2 = 0.5;
    for (let s = 0.01; s <= 1.99; s += 0.02) {
        let Tf = 60 * (s * R2) / (R2 * R2 + (s * X2) * (s * X2));
        let sb = 2 - s;
        let Tb = 60 * (sb * R2) / (R2 * R2 + (sb * X2) * (sb * X2));
        dataFwd.push({ s: s, T: Tf });
        dataBwd.push({ s: s, T: -Tb });
        dataNet.push({ s: s, T: Tf - Tb });
    }

    svg.append("path").datum(dataFwd).attr("d", lineGen).attr("fill", "none").attr("stroke", "var(--neon-cyan)").attr("stroke-width", 2).attr("stroke-dasharray", "5 5");
    svg.append("path").datum(dataBwd).attr("d", lineGen).attr("fill", "none").attr("stroke", "var(--electric-gold)").attr("stroke-width", 2).attr("stroke-dasharray", "5 5");
    svg.append("path").datum(dataNet).attr("d", lineGen).attr("fill", "none").attr("stroke", "var(--mod6-color)").attr("stroke-width", 3);

    svg.append("text").attr("x", xScale(0.2)).attr("y", yScale(80)).attr("fill", "var(--neon-cyan)").attr("font-size", 10).text("T_fwd");
    svg.append("text").attr("x", xScale(1.8)).attr("y", yScale(-80)).attr("fill", "var(--electric-gold)").attr("font-size", 10).text("T_bwd");
    svg.append("text").attr("x", xScale(0.5)).attr("y", yScale(50)).attr("fill", "var(--mod6-color)").attr("font-size", 12).attr("font-weight", "bold").text("T_net");
}

// 2. Starting Methods Phasor
const sTabs = document.querySelectorAll('.s-tab');
const iAuxGroup = document.getElementById('i-aux-group');
const alphaArc = document.getElementById('alpha-arc');

sTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        // Remove active
        sTabs.forEach(t => {
            t.classList.remove('active');
            t.style.background = 'transparent';
            t.style.borderBottom = 'none';
            t.style.color = 'var(--text-secondary)';
        });
        // Add active
        const activeTab = e.currentTarget;
        activeTab.classList.add('active');
        activeTab.style.background = 'rgba(251, 113, 133, 0.1)';
        activeTab.style.borderBottom = '3px solid var(--mod6-color)';
        activeTab.style.color = '#fff';

        const type = activeTab.getAttribute('data-type');

        // Hide all desc
        document.querySelectorAll('[id^="start-desc-"]').forEach(f => f.style.display = 'none');
        document.getElementById('start-desc-' + type).style.display = 'block';

        // Update Phasor (I_m is fixed at roughly -45 deg from V)
        // Need I_a to rotate.
        // Split: alpha~30. Cap Start: alpha~80. Cap Run: alpha~90
        // Since Im is at angle -45, if alpha = 30, Ia is at -15.
        // If alpha = 80, Ia is at +35.
        // If alpha = 90, Ia is at +45.
        // Let's just rotate i-aux-group around base (40, 130).
        iAuxGroup.style.transformOrigin = "40px 130px";
        if (type === 'split') {
            iAuxGroup.style.transform = "rotate(0deg)"; // Base position
            alphaArc.setAttribute("d", "M 80 130 A 40 40 0 0 0 95 105");
        } else if (type === 'cap1') {
            iAuxGroup.style.transform = "rotate(-40deg)"; // Move up
            alphaArc.setAttribute("d", "M 80 130 A 40 40 0 0 0 75 90");
        } else if (type === 'cap2') {
            iAuxGroup.style.transform = "rotate(-50deg)"; // Move higher
            alphaArc.setAttribute("d", "M 80 130 A 40 40 0 0 0 65 85");
        }
    });
});


// --- MODULE 7: Synchronous Machines ---

// 1. Pitch Factor Animation
const alphaSlider = document.getElementById('alpha-slider');
const alphaVal = document.getElementById('alpha-val');
const coilArc = document.getElementById('coil-arc');
const alphaText = document.getElementById('alpha-text');

if (alphaSlider) {
    alphaSlider.addEventListener('input', (e) => {
        let alpha = parseInt(e.target.value);
        alphaVal.innerText = alpha;

        // Calculate SVG positions. 
        // Arc goes from left (50,120) to right (350,120), center is (200,120), radius is 150.
        // 180 degrees mapping to width 300.
        // So each degree is 300/180 = 1.66 px.
        // If chording by alpha, left side starts at 50 + alpha*1.66
        let startX = 50 + alpha * (300 / 180);
        // Right side stays at 350.

        coilArc.setAttribute('d', `M ${startX} 120 A ${150 - alpha * 0.8} ${150 - alpha * 0.8} 0 0 1 350 120`);

        alphaText.setAttribute('x', 50 + (startX - 50) / 2);

        // Update Formula
        const kp = Math.cos((alpha / 2) * Math.PI / 180);
        alphaSlider.parentElement.nextElementSibling.innerHTML = `$$K_p = \\cos(${alpha / 2}^\\circ) = ${kp.toFixed(3)}$$`;

        if (window.renderMathInElement) {
            renderMathInElement(alphaSlider.parentElement.nextElementSibling, { delimiters: [{ left: "$$", right: "$$", display: true }] });
        }
    });
    alphaSlider.dispatchEvent(new Event('input'));
}

// 2. Power Angle Chart
const ctxPower = document.getElementById('powerAngleChart');
if (ctxPower) {
    let delta = [], cyl = [], sal = [];
    for (let d = 0; d <= 180; d += 5) {
        delta.push(d);
        let rad = d * Math.PI / 180;
        // Cylindrical: EV/X sin(d)
        cyl.push(100 * Math.sin(rad));
        // Salient: EV/Xd sin(d) + V^2/2(1/Xq - 1/Xd) sin(2d)
        // Assuming reluctance term adds ~20% peak at 45 deg
        sal.push(80 * Math.sin(rad) + 20 * Math.sin(2 * rad));
    }

    new Chart(ctxPower, {
        type: 'line',
        data: {
            labels: delta,
            datasets: [
                { label: 'Cylindrical (Smooth)', data: cyl, borderColor: '#60a5fa', borderWidth: 2, tension: 0.4 },
                { label: 'Salient Pole', data: sal, borderColor: '#facc15', borderWidth: 2, tension: 0.4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Load Angle δ (degrees)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', callback: function (val, idx) { return delta[idx] % 30 === 0 ? delta[idx] : ''; } } },
                y: { title: { display: true, text: 'Power (P)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
            },
            plugins: { legend: { labels: { color: '#fff' } } }
        }
    });
}

// 3. V-Curves Chart
const ctxV = document.getElementById('vCurveChart');
if (ctxV) {
    let ifield = [], noLoad = [], halfLoad = [], fullLoad = [];
    for (let f = 0.2; f <= 1.8; f += 0.1) {
        ifield.push(f.toFixed(1));
        // Approximate V shape: Ia = sqrt( I_active^2 + I_reactive^2 )
        // I_active depends on load. I_reactive = V/Xs - E/Xs = V/Xs - (k*f)/Xs
        // Minimum Ia occurs when E = V / cos(delta) (Unity PF) - simple model
        noLoad.push(Math.abs(1 - f) * 100 + 5);
        halfLoad.push(Math.sqrt(2500 + Math.pow((1.1 - f) * 100, 2))); // active ~ 50
        fullLoad.push(Math.sqrt(10000 + Math.pow((1.2 - f) * 100, 2))); // active ~ 100
    }

    new Chart(ctxV, {
        type: 'line',
        data: {
            labels: ifield,
            datasets: [
                { label: 'No Load', data: noLoad, borderColor: '#34d399', borderWidth: 2, tension: 0.4 },
                { label: 'Half Load', data: halfLoad, borderColor: '#facc15', borderWidth: 2, tension: 0.4 },
                { label: 'Full Load', data: fullLoad, borderColor: '#ff5252', borderWidth: 2, tension: 0.4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Field Current (If)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                y: { title: { display: true, text: 'Armature Current (Ia)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
            },
            plugins: { legend: { labels: { color: '#fff' } } }
        }
    });
}

// 4. Synchronization Animation
const syncBtn = document.getElementById('sync-btn');
const lamps = [document.getElementById('lamp1'), document.getElementById('lamp2'), document.getElementById('lamp3')];
let syncAnim;

if (syncBtn) {
    syncBtn.addEventListener('click', () => {
        if (syncAnim && syncAnim.isActive()) {
            syncAnim.kill();
            lamps.forEach(l => l.classList.remove('glow'));
            document.getElementById('gen-freq-indicator').innerText = "$f_{gen} = f_{bus}$ (Synchronized)";
            if (window.renderMathInElement) renderMathInElement(document.getElementById('gen-freq-indicator'), { delimiters: [{ left: "$", right: "$", display: false }] });
            syncBtn.innerText = "Simulate Slip Frequency (Lamps Flicker)";
            return;
        }

        document.getElementById('gen-freq-indicator').innerText = "$f_{gen} \\neq f_{bus}$";
        if (window.renderMathInElement) renderMathInElement(document.getElementById('gen-freq-indicator'), { delimiters: [{ left: "$", right: "$", display: false }] });
        syncBtn.innerText = "Stop (Synchronize)";

        // Flicker lamps based on beat frequency. All dark together -> Dark Lamp Method.
        // If they were bright/dark sequentially -> Bright Lamp Method.
        // Dark lamp method: All 3 lamps flicker at the beat frequency together if phase sequence is correct.
        syncAnim = gsap.to(lamps, {
            opacity: 0.1, // Wait, lamps glow!
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            onUpdate: function () {
                // map opacity to glow class? nah, just change background opacity
                let prog = this.progress();
                lamps.forEach(l => {
                    l.style.background = `rgba(250, 204, 21, ${prog})`;
                    l.style.boxShadow = `0 0 ${prog * 20}px rgba(250,204,21,${prog})`;
                });
            }
        });
    });
}


// --- MODULE 8: Special Machines ---

// 1. Stepper Motor Animation
const stepBtn = document.getElementById('step-btn');
const stepperRotor = document.getElementById('stepper-rotor');
let stepCount = 0;

// 4 poles on stator (A, B, C, D). Let's simulate step sequence: A -> B -> C -> D
const poles = ['pole-a', 'pole-b', 'pole-c', 'pole-d'];

if (stepBtn) {
    stepBtn.addEventListener('click', () => {
        // Remove active from all poles
        poles.forEach(p => document.getElementById(p).classList.remove('stepper-pole-active'));

        // Activate current pole
        let pIdx = stepCount % 4;
        document.getElementById(poles[pIdx]).classList.add('stepper-pole-active');

        // Rotate Rotor. Motor resolves to align teeth.
        // Simplified: every step is 30 degrees for this 12/8 or 6-teeth rotor layout visually
        let currentAngle = stepCount * 30;
        stepperRotor.style.transform = `rotate(${currentAngle}deg)`;

        stepCount++;
    });

    // Initial state
    document.getElementById(poles[0]).classList.add('stepper-pole-active');
}

// 2. SRM Inductance Profile Chart
const ctxSRM = document.getElementById('inductanceProfileChart');
if (ctxSRM) {
    let theta = [], L = [];
    for (let t = 0; t <= 360; t += 5) {
        theta.push(t);
        // Triangular / Trapezoidal inductance profile
        // Max L at alignment (say 0, 90, 180, 270 degrees)
        let period = t % 90;
        if (period < 30) {
            L.push(10 + (period / 30) * 40); // rising
        } else if (period < 60) {
            L.push(50); // high flat
        } else {
            L.push(50 - ((period - 60) / 30) * 40); // falling
        }
    }

    new Chart(ctxSRM, {
        type: 'line',
        data: {
            labels: theta,
            datasets: [{
                label: 'Phase Inductance L(θ)',
                data: L,
                borderColor: '#f472b6', // mod8 color
                backgroundColor: 'rgba(244, 114, 182, 0.1)',
                borderWidth: 2, fill: true, tension: 0.1
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Rotor Angle θ (deg)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', callback: function (val, idx) { return theta[idx] % 90 === 0 ? theta[idx] : ''; } } },
                y: { title: { display: false }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { display: false }, min: 0 }
            },
            plugins: { legend: { display: false } }
        }
    });
}


// --- MODULE 9: Synchronous Motors ---

// 1. Motor V-Curves Chart
const ctxMotV = document.getElementById('motorVChart');
if (ctxMotV) {
    let ifield = [], noLoad = [], halfLoad = [], fullLoad = [];
    for (let f = 0.2; f <= 1.8; f += 0.1) {
        ifield.push(f.toFixed(1));
        // Simulating motor V-curve with min armature current around f=1.0
        noLoad.push(Math.abs(1 - f) * 100 + 10);
        halfLoad.push(Math.sqrt(2500 + Math.pow((1.1 - f) * 100, 2)));
        fullLoad.push(Math.sqrt(10000 + Math.pow((1.25 - f) * 100, 2)));
    }

    new Chart(ctxMotV, {
        type: 'line',
        data: {
            labels: ifield,
            datasets: [
                { label: 'No Load', data: noLoad, borderColor: '#34d399', borderWidth: 2, tension: 0.4 },
                { label: 'Half Load', data: halfLoad, borderColor: '#60a5fa', borderWidth: 2, tension: 0.4 },
                { label: 'Full Load', data: fullLoad, borderColor: '#fbbf24', borderWidth: 2, tension: 0.4 } // mod9 color
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Field Current (If)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                y: { title: { display: true, text: 'Armature Current (Ia)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
            },
            plugins: { legend: { labels: { color: '#fff' } } }
        }
    });
}

});
