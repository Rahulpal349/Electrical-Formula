/**
 * power.js - Logic for the Electrical Power Systems module
 * Handles interactive SVGs, GSAP animations, D3/Chart.js graphs, 
 * and calculator functions for Unit 1 to Unit 8.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize AOS (Animate on Scroll)
    AOS.init({
        duration: 800,
        once: true,
        offset: 50
    });

    // 2. Sidebar Navigation ScrollSpy
    setupScrollSpy();

    // 3. Initialize specific module logic
    initUnit1Basics();
    initUnit2Components();
    initUnit3Parameters();
    initUnit4Cables();
    initUnit5Performance();
    initUnit6EHV();
    initUnit7Distribution();
    initUnit8Substations();

    // Render math again just in case dynamic content was injected
    if (window.renderMathInElement) {
        renderMathInElement(document.getElementById('formula-container'), {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false }
            ],
            throwOnError: false
        });
    }
});

/**
 * Syncs the sidebar links with the currently scrolled section
 */
function setupScrollSpy() {
    const sections = document.querySelectorAll('.module-section');
    const navLinks = document.querySelectorAll('.sidebar-links li a');

    if (sections.length === 0 || navLinks.length === 0) return;

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
}

// ==========================================
// UNIT 1: BASICS OF POWER TRANSMISSION
// ==========================================
function initUnit1Basics() {
    // 1. Single Line Diagram Animation (Electrons & Power Flow)
    const sldSvg = document.getElementById('sld-svg');
    if (sldSvg) {
        // Create electron flow effect using GSAP
        const lines = ['pri', 'sec', 'dist'];
        lines.forEach((line, i) => {
            const lineElem = document.getElementById(`line-${line}`);
            if (lineElem) {
                const x1 = parseFloat(lineElem.getAttribute('x1'));
                const x2 = parseFloat(lineElem.getAttribute('x2'));
                const y = parseFloat(lineElem.getAttribute('y1'));
                const color = lineElem.getAttribute('stroke');

                // create an electron
                const electron = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                electron.setAttribute('cx', x1);
                electron.setAttribute('cy', y);
                electron.setAttribute('r', '3');
                electron.setAttribute('fill', '#fff');
                electron.style.filter = `drop-shadow(0 0 5px ${color})`;
                sldSvg.appendChild(electron);

                // Animate electron traveling along line
                gsap.to(electron, {
                    attr: { cx: x2 },
                    duration: 1.5 + (i * 0.5),
                    repeat: -1,
                    ease: "none",
                    delay: i * 0.2
                });
            }
        });

        // Transformers pulsing
        gsap.to('.sld-tx', {
            strokeWidth: 4,
            opacity: 0.7,
            duration: 0.8,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: 0.2
        });
    }

    // 2. High Voltage Advantage Calculator
    const hvSlider = document.getElementById('hv-slider');
    const hvCalc = document.getElementById('hv-calc');
    const hvWire = document.getElementById('hv-wire');

    if (hvSlider && hvCalc && hvWire) {
        hvSlider.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            // using 11kV as base (100% loss/vol)
            const vBase = 11;
            const ratio = vBase / v;
            const percentage = (ratio * ratio * 100).toFixed(2);

            hvCalc.textContent = `Power Loss = ${percentage}% | Cu Volume = ${percentage}%`;

            // Adjust wire thickness (50px is base for 11kV, min size 2px)
            const newSize = Math.max(2, 50 * ratio);
            hvWire.style.width = `${newSize}px`;
            hvWire.style.height = `${newSize}px`;
        });
    }

    // 3. AC vs DC Break-even D3 Chart
    if (document.getElementById('ac-dc-chart')) {
        drawAcDcChart();
    }

    // 4. Kelvin's Law Optimizer D3 Chart
    if (document.getElementById('kelvin-chart-container')) {
        setupKelvinChart();
    }
}

// ---------------------------------
// D3.js Chart for AC vs DC Break-even
function drawAcDcChart() {
    const container = document.getElementById('ac-dc-chart');
    container.innerHTML = '';
    const margin = { top: 10, right: 20, bottom: 30, left: 40 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    const svg = d3.select("#ac-dc-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, 1200]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    // Graph axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(6))
        .attr("color", "#475569");
    svg.append("g")
        .call(d3.axisLeft(y).ticks(5).tickFormat(() => ""))
        .attr("color", "#475569");

    // AC Line (lower start, steeper slope)
    const acTerminal = 10;
    const acSlope = 0.08;
    // DC Line (higher start, flatter slope)
    const dcTerminal = 30;
    const dcSlope = 0.05;

    // The break-even point is where 10 + 0.08d = 30 + 0.05d => 0.03d = 20 => d = 666.6
    const breakEvenD = 666.6;
    const breakEvenC = acTerminal + acSlope * breakEvenD;

    // AC Path
    svg.append("line")
        .attr("x1", x(0)).attr("y1", y(acTerminal))
        .attr("x2", x(1200)).attr("y2", y(acTerminal + (acSlope * 1200)))
        .attr("stroke", "var(--mod3-color)")
        .attr("stroke-width", 2);

    // DC Path
    svg.append("line")
        .attr("x1", x(0)).attr("y1", y(dcTerminal))
        .attr("x2", x(1200)).attr("y2", y(dcTerminal + (dcSlope * 1200)))
        .attr("stroke", "var(--mod6-color)")
        .attr("stroke-width", 2);

    // Labels
    svg.append("text").attr("x", x(1000)).attr("y", y(95)).attr("fill", "var(--mod3-color)").text("AC Trans").style("font-size", "10px");
    svg.append("text").attr("x", x(1000)).attr("y", y(75)).attr("fill", "var(--mod6-color)").text("DC Trans").style("font-size", "10px");

    // Break Even Point
    svg.append("circle")
        .attr("cx", x(breakEvenD))
        .attr("cy", y(breakEvenC))
        .attr("r", 5)
        .attr("fill", "#fff")
        .style("filter", "drop-shadow(0 0 5px #fff)");

    svg.append("line")
        .attr("x1", x(breakEvenD)).attr("y1", y(breakEvenC))
        .attr("x2", x(breakEvenD)).attr("y2", height)
        .attr("stroke", "#fff").attr("stroke-dasharray", "4")
        .style("opacity", 0.5);

    svg.append("text")
        .attr("x", x(breakEvenD) - 40)
        .attr("y", height - 5)
        .attr("fill", "#fff")
        .style("font-size", "10px")
        .text("~600-800 km");
}

// ---------------------------------
// D3.js Chart for Kelvin's Law
function setupKelvinChart() {
    let b = 50;
    let c = 5000;

    const sliderB = document.getElementById('kelvin-b-slider');
    const sliderC = document.getElementById('kelvin-c-slider');
    const optDisplay = document.getElementById('kelvin-opt-display');
    const container = document.getElementById('kelvin-chart-container');

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    const svg = d3.select("#kelvin-chart-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([1, 20]).range([0, width]); // Area (x)
    const y = d3.scaleLinear().domain([0, 2000]).range([height, 0]); // Cost

    const xAxis = svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x)).attr("color", "#475569");
    const yAxis = svg.append("g").call(d3.axisLeft(y)).attr("color", "#475569");

    const lineGenerator = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y));

    const pathC1 = svg.append("path").attr("fill", "none").attr("stroke", "#60a5fa").attr("stroke-width", 2);  // Interest
    const pathC2 = svg.append("path").attr("fill", "none").attr("stroke", "#fb7185").attr("stroke-width", 2);  // Energy Loss
    const pathTotal = svg.append("path").attr("fill", "none").attr("stroke", "var(--mod1-color)").attr("stroke-width", 3); // Total Cost

    const optPoint = svg.append("circle").attr("r", 6).attr("fill", "#fff").style("filter", "drop-shadow(0 0 10px var(--mod1-color))");
    const optGuide = svg.append("line").attr("stroke", "rgba(255,255,255,0.3)").attr("stroke-dasharray", "4");

    function updateGraph() {
        const dataC1 = [];
        const dataC2 = [];
        const dataTotal = [];

        for (let ax = 1; ax <= 20; ax += 0.5) {
            const cost1 = b * ax;
            const cost2 = c / ax;
            const total = cost1 + cost2;

            dataC1.push({ x: ax, y: cost1 });
            dataC2.push({ x: ax, y: cost2 });
            dataTotal.push({ x: ax, y: total });
        }

        pathC1.attr("d", lineGenerator(dataC1));
        pathC2.attr("d", lineGenerator(dataC2));
        pathTotal.attr("d", lineGenerator(dataTotal));

        const xOpt = Math.sqrt(c / b);
        const yOpt = (b * xOpt) + (c / xOpt);

        optPoint
            .attr("cx", x(xOpt))
            .attr("cy", y(yOpt));

        optGuide
            .attr("x1", x(xOpt)).attr("y1", y(yOpt))
            .attr("x2", x(xOpt)).attr("y2", height);

        optDisplay.textContent = `x_opt = ${xOpt.toFixed(2)} mm²`;
    }

    if (sliderB && sliderC) {
        sliderB.addEventListener('input', (e) => { b = parseFloat(e.target.value); updateGraph(); });
        sliderC.addEventListener('input', (e) => { c = parseFloat(e.target.value); updateGraph(); });
    }

    // Handle window resize dynamically inside standard JS using ResizeObserver or bounds check later
    updateGraph();
}

// ==========================================
// UNIT 2: LINE COMPONENTS
// ==========================================
function initUnit2Components() {
    // 1. Tower Components Hover Effect
    const towerSvg = document.getElementById('tower-svg-container');
    if (towerSvg) {
        // Minimal interaction, just simple CSS transition is active in core css
        gsap.to('#conductors path', {
            strokeDasharray: "10 10",
            strokeDashoffset: 20,
            repeat: -1,
            duration: 2,
            ease: "none"
        });
    }

    // 2. Types of Conductors (ACSR Layers)
    const strandSlider = document.getElementById('strand-slider');
    const strandCalc = document.getElementById('strand-calc');
    const acsrSvg = document.getElementById('acsr-svg');
    if (strandSlider && acsrSvg) {
        const layers = acsrSvg.querySelectorAll('g');
        strandSlider.addEventListener('input', (e) => {
            const n = parseInt(e.target.value);
            // Hide all first
            layers.forEach(l => l.style.display = 'none');
            // Show up to n
            let totalStrands = 1; // core
            for (let i = 1; i < n; i++) {
                layers[i - 1].style.display = 'block';
                // gsap pop
                gsap.fromTo(layers[i - 1], { scale: 0, transformOrigin: "center center" }, { scale: 1, duration: 0.5, ease: "back.out(1.7)" });
            }

            if (n === 1) totalStrands = 1;
            if (n === 2) totalStrands = 7;
            if (n === 3) totalStrands = 19;

            strandCalc.textContent = `n=${n} | Strands=${totalStrands}`;
        });
    }

    // 3. String Efficiency
    const effKSlider = document.getElementById('eff-k-slider');
    const btnGuard = document.getElementById('btn-guard-ring');
    const effVal = document.getElementById('eff-val');
    const v1Bar = document.getElementById('v1-bar');
    const v2Bar = document.getElementById('v2-bar');
    const v3Bar = document.getElementById('v3-bar');
    let guardActive = false;

    function updateEfficiency() {
        const K = parseFloat(effKSlider.value);
        let V1_pct, V2_pct, V3_pct, eff;

        if (guardActive) {
            // Ideal distribution
            V1_pct = 33.3;
            V2_pct = 33.3;
            V3_pct = 33.3;
            eff = 100.0;
        } else {
            // Formula: V = V1(3 + 4K + K^2)
            // V1/V = 1 / (3 + 4K + K^2)
            const factor = 3 + 4 * K + K * K;
            V1_pct = (1 / factor) * 100;
            V2_pct = V1_pct * (1 + K);
            V3_pct = V1_pct * (1 + 3 * K + K * K);
            eff = 100 / (3 * (V3_pct / 100)); // Vtotal / (3 * V3)
        }

        v1Bar.style.height = `${Math.max(10, V1_pct)}%`;
        v2Bar.style.height = `${Math.max(10, V2_pct)}%`;
        v3Bar.style.height = `${Math.max(10, V3_pct)}%`;
        effVal.textContent = `η = ${eff.toFixed(1)}%`;
    }

    if (effKSlider && btnGuard) {
        effKSlider.addEventListener('input', updateEfficiency);
        btnGuard.addEventListener('click', () => {
            guardActive = !guardActive;
            btnGuard.classList.toggle('active');
            effKSlider.disabled = guardActive;
            updateEfficiency();
        });
        updateEfficiency();
    }

    // 4. Corona Glow
    const coronaSlider = document.getElementById('corona-slider');
    const coronaStatus = document.getElementById('corona-status');
    const vd = 210; // Assume critical voltage is 210kV

    if (coronaSlider) {
        coronaSlider.addEventListener('input', (e) => {
            const v = parseInt(e.target.value);
            const glows = [1, 2, 3].map(i => document.getElementById(`corona-glow-${i}`));

            if (v < vd) {
                coronaStatus.textContent = `V (${v}kV) < Vd (${vd}kV): No Corona`;
                coronaStatus.style.color = "#94a3b8";
                glows.forEach(g => g.style.opacity = 0);
            } else {
                const intensity = Math.min((v - vd) / 90, 1); // 0 to 1 scaling
                coronaStatus.textContent = `V (${v}kV) > Vd (${vd}kV): Corona Active!`;
                coronaStatus.style.color = "var(--mod6-color)";
                glows.forEach(g => g.style.opacity = intensity * 0.8); // max opacity 0.8
            }
        });
    }

    // 5. Sag Calculation
    const sagSpan = document.getElementById('sag-span');
    const sagTension = document.getElementById('sag-tension');
    const btnWind = document.getElementById('sag-wind');
    const btnIce = document.getElementById('sag-ice');
    const sagVal = document.getElementById('sag-val-display');
    const sagCurve = document.getElementById('sag-curve');
    const iceLayer = document.getElementById('sag-ice-layer');
    const sagArrow = document.getElementById('sag-arrow');
    const sagText = document.getElementById('sag-text');

    let isWind = false;
    let isIce = false;

    function updateSag() {
        const l = parseFloat(sagSpan.value); // span 50 to 400
        const T = parseFloat(sagTension.value); // tension 1000 to 5000

        let w = 1.0; // base weight kg/m
        let w_wind = isWind ? 1.5 : 0;
        let w_ice = isIce ? 2.0 : 0;

        const w_total = Math.sqrt(Math.pow(w + w_ice, 2) + Math.pow(w_wind, 2));
        const S = (w_total * l * l) / (8 * T); // Actual mathematical sag

        sagVal.textContent = `Sag = ${S.toFixed(2)} m`;

        // Visual mapping: map S (usually 1m - 20m) to SVG pixels (0 to 160)
        // Let's say max theoretical S is around 25 => map to 160px
        const peakY = 20 + Math.min(160, (S / 25) * 160);

        // draw catenary (approx with bezier)
        // M 25 20 Q 200 peakY 375 20
        const d = `M 25 20 Q 200 ${peakY * 1.5} 375 20`; // multiplied control pt for sharper curve
        const visualPeak = 20 + (peakY * 1.5 - 20) / 2; // Actual y point on curve at center x=200

        gsap.to([sagCurve, iceLayer], { attr: { d: d }, duration: 0.3 });

        gsap.to(sagArrow, { attr: { y2: visualPeak }, duration: 0.3 });
        gsap.to(sagText, { attr: { y: visualPeak / 2 + 10 }, duration: 0.3 });

        // Aesthetics
        iceLayer.style.opacity = isIce ? 1 : 0;
        sagCurve.style.stroke = isWind ? "#e2e8f0" : "var(--mod3-color)"; // Wind blows it sideways (makes it look lighter/different)
    }

    if (sagSpan && sagTension) {
        sagSpan.addEventListener('input', updateSag);
        sagTension.addEventListener('input', updateSag);
        btnWind.addEventListener('click', () => { isWind = !isWind; btnWind.classList.toggle('active'); updateSag(); });
        btnIce.addEventListener('click', () => { isIce = !isIce; btnIce.classList.toggle('active'); updateSag(); });
        updateSag();
    }
}

// ==========================================
// UNIT 3: LINE PARAMETERS
// ==========================================
function initUnit3Parameters() {
    // 1. RLC Magnetic & Electric Field Animation
    const rlcSvg = document.getElementById('rlc-field-svg');
    if (rlcSvg) {
        gsap.to(['#mag-fields-a circle', '#mag-fields-b circle'], {
            scale: 1.1,
            opacity: 0.2,
            transformOrigin: "center center",
            repeat: -1,
            yoyo: true,
            duration: 1.5,
            stagger: 0.2,
            ease: "sine.inOut"
        });

        gsap.to('#elec-fields path', {
            strokeDasharray: "5 5",
            strokeDashoffset: 10,
            repeat: -1,
            duration: 1,
            ease: "none"
        });
    }

    // 2. Skin Effect Slider
    const skinFreq = document.getElementById('skin-freq');
    const skinLayer = document.getElementById('skin-layer');
    const skinVal = document.getElementById('skin-val');

    if (skinFreq && skinLayer) {
        skinFreq.addEventListener('input', (e) => {
            const f = parseFloat(e.target.value); // 0 to 1000

            if (f === 0) {
                // DC
                skinLayer.style.strokeWidth = "45"; // Full solid circle
                skinVal.textContent = "DC (f=0): Uniform Current Density";
                skinVal.style.color = "#fff";
            } else {
                // AC
                // approximate visual mapping: higher f = thinner outer ring
                // f=50 -> width ~25, f=1000 -> width ~5
                const thickness = Math.max(2, 45 - (f / 1000) * 40);
                skinLayer.style.strokeWidth = thickness.toString();
                skinVal.textContent = `AC (f=${f}Hz): Skin Effect Active`;
                skinVal.style.color = "var(--mod3-color)";
            }
        });
        // Initial trigger
        skinFreq.dispatchEvent(new Event('input'));
    }

    // 3. Ferranti Effect Toggle
    const btnFerranti = document.getElementById('btn-ferranti');
    const vrLine = document.getElementById('ferranti-vr');
    const vrText = document.getElementById('ferranti-vr-text');
    let noLoad = false;

    if (btnFerranti && vrLine) {
        btnFerranti.addEventListener('click', () => {
            noLoad = !noLoad;
            if (noLoad) {
                // Vr > Vs (charging current predominant)
                // Animate Vr to be longer and slightly angled up
                vrLine.setAttribute('x2', '190');
                vrLine.setAttribute('y2', '100'); // angled up
                vrText.setAttribute('x', '175');
                vrText.setAttribute('y', '90');
                btnFerranti.textContent = "Toggle Load (No Load → Full Load)";
                btnFerranti.classList.add('active');
            } else {
                // Vr < Vs (lagging typical)
                vrLine.setAttribute('x2', '140');
                vrLine.setAttribute('y2', '140'); // angled down slightly
                vrText.setAttribute('x', '130');
                vrText.setAttribute('y', '155');
                btnFerranti.textContent = "Toggle Load (Full Load → No Load)";
                btnFerranti.classList.remove('active');
            }
        });
        // Start in Full Load
        btnFerranti.click(); btnFerranti.click();
    }

    // 4. Transposition Animation
    const transR = document.getElementById('trans-r');
    if (transR) {
        // Continuous flow animation to make it look alive
        gsap.to(['#trans-r', '#trans-y', '#trans-b'], {
            strokeDasharray: "20 10",
            strokeDashoffset: 30,
            repeat: -1,
            duration: 1.5,
            ease: "none"
        });
    }
}

// ==========================================
// UNIT 4: UNDERGROUND CABLES
// ==========================================
function initUnit4Cables() {
    // 1. Cable Construction & Stress
    const r1Slider = document.getElementById('cable-r1-slider');
    const btnAssemble = document.getElementById('btn-build-cable');
    const layers = ['layer-serving', 'layer-armour', 'layer-sheath', 'layer-insulation', 'layer-core'];
    const stressDesc = document.getElementById('cable-stress-desc');
    const labels = document.getElementById('cable-labels');

    let isAssembled = false;

    if (r1Slider && btnAssemble) {
        // Initial state: separate
        gsap.set('#layer-serving', { x: -150, opacity: 0 });
        gsap.set('#layer-armour', { x: -100, opacity: 0 });
        gsap.set('#layer-sheath', { x: -50, opacity: 0 });
        gsap.set('#layer-insulation', { opacity: 0 });

        btnAssemble.addEventListener('click', () => {
            isAssembled = !isAssembled;
            if (isAssembled) {
                // Animate Assembly
                gsap.to(['#layer-serving', '#layer-armour', '#layer-sheath', '#layer-insulation'], {
                    x: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.2,
                    ease: "power2.out"
                });
                gsap.to(labels, { opacity: 1, duration: 1, delay: 1 });
                btnAssemble.textContent = "Disassemble Cable";
                btnAssemble.classList.add('active');
            } else {
                // Disassemble
                gsap.to(labels, { opacity: 0, duration: 0.3 });
                gsap.to('#layer-serving', { x: -150, opacity: 0, duration: 0.8 });
                gsap.to('#layer-armour', { x: -100, opacity: 0, duration: 0.8 });
                gsap.to('#layer-sheath', { x: -50, opacity: 0, duration: 0.8 });
                gsap.to('#layer-insulation', { opacity: 0, duration: 0.8 });
                btnAssemble.textContent = "Assemble Cable";
                btnAssemble.classList.remove('active');
            }
        });

        r1Slider.addEventListener('input', (e) => {
            const r1 = parseInt(e.target.value);
            // core size changes
            document.getElementById('layer-core').setAttribute('r', r1);

            // Re-calculate stress
            // Emax = V / (r1 * ln(R/r1))
            const R = 60; // insulation outer radius
            if (r1 >= R) {
                stressDesc.textContent = "Invalid: Core cannot be larger than insulation.";
                return;
            }
            const lnRatio = Math.log(R / r1);
            const relativeStress = 1 / (r1 * lnRatio); // Normalized, assuming V=1

            // Adjust gradient intensity based on relative stress (higher stress = brighter red)
            // Just for visual flair, we won't strictly compute true kV/cm unless we define V.
            // Optimal roughly occurs when r1 = R/e = R/2.718 = 22

            if (r1 > 20 && r1 < 25) {
                stressDesc.textContent = `r1=${r1} | Near optimal (r1 ≈ R/e). Emax is minimized.`;
                stressDesc.style.color = "#00ff88";
            } else if (r1 < 10) {
                stressDesc.textContent = `r1=${r1} | Core too small. High Emax (Risk of breakdown).`;
                stressDesc.style.color = "#ef4444";
            } else {
                stressDesc.textContent = `r1=${r1} | Increased cost, higher capacitance.`;
                stressDesc.style.color = "var(--mod4-color)";
            }
        });
    }

    // 2. Thermal Derating
    const toggles = [
        { id: 'derate-soil', k: 0.85 },
        { id: 'derate-depth', k: 0.95 },
        { id: 'derate-group', k: 0.75 },
        { id: 'derate-temp', k: 0.88 }
    ];

    let activeFactors = { 'derate-soil': false, 'derate-depth': false, 'derate-group': false, 'derate-temp': false };
    const baseCurrent = 1000;
    const valDisplay = document.getElementById('derate-val');
    const barDisplay = document.getElementById('derate-bar');

    function updateDerating() {
        let current = baseCurrent;
        toggles.forEach(t => {
            if (activeFactors[t.id]) {
                current *= t.k;
            }
        });

        // Format
        valDisplay.innerHTML = `${Math.round(current)}<span style="font-size:1.5rem;">A</span>`;

        // Update bar width and color
        const pct = (current / baseCurrent) * 100;
        barDisplay.style.width = `${pct}%`;

        if (pct > 80) barDisplay.style.background = "linear-gradient(90deg, #00ff88, #3b82f6)";
        else if (pct > 60) barDisplay.style.background = "linear-gradient(90deg, #facc15, #f97316)";
        else barDisplay.style.background = "linear-gradient(90deg, #f97316, #ef4444)";

        // Pulse effect if very low
        if (pct < 60) {
            gsap.to(valDisplay, { color: "#ef4444", duration: 0.3 });
        } else {
            gsap.to(valDisplay, { color: "var(--mod4-color)", duration: 0.3 });
        }
    }

    toggles.forEach(t => {
        const btn = document.getElementById(t.id);
        if (btn) {
            btn.addEventListener('click', () => {
                activeFactors[t.id] = !activeFactors[t.id];
                btn.classList.toggle('active');
                updateDerating();
            });
        }
    });
}

// ==========================================
// UNIT 5: LINE PERFORMANCE
// ==========================================
function initUnit5Performance() {
    console.log("Init Unit 5");
}

// ==========================================
// UNIT 5: OVER VOLTAGE
// ==========================================
function initUnit5Overvoltages() {
    // 1. Lightning Surge Strike
    const btnStrike = document.getElementById('btn-strike');
    const bolt = document.getElementById('lightning-bolt');
    const surge = document.getElementById('surge-wave');

    if (btnStrike && bolt && surge) {
        btnStrike.addEventListener('click', () => {
            btnStrike.disabled = true;

            // Strike Animation
            const tl = gsap.timeline({ onComplete: () => btnStrike.disabled = false });

            // Flash bolt
            tl.to(bolt, { opacity: 1, duration: 0.1 })
                .to(bolt, { opacity: 0, duration: 0.1 })
                .to(bolt, { opacity: 1, duration: 0.1 })
                .to(bolt, { opacity: 0, duration: 0.2 });

            // Traveling Surge 
            tl.fromTo(surge,
                { opacity: 1, x: 50 },
                { x: 300, duration: 1.5, ease: "power1.inOut" },
                "-=0.2"
            );
            tl.to(surge, { opacity: 0, duration: 0.2 });
        });
    }

    // 2. Surge Arrester Simulation
    const btnArrester = document.getElementById('btn-arrester');
    const saSurge = document.getElementById('sa-surge');
    const saDischarge = document.getElementById('sa-discharge');

    if (btnArrester && saSurge && saDischarge) {
        btnArrester.addEventListener('click', () => {
            btnArrester.disabled = true;

            const tl = gsap.timeline({ onComplete: () => btnArrester.disabled = false });

            // Incoming Surge
            tl.fromTo(saSurge,
                { opacity: 1, x: -50 },
                { x: 50, duration: 0.8, ease: "power1.in" }
            );

            // Hit Arrester -> discharge to ground
            tl.to(saSurge, { opacity: 0, duration: 0.1 });

            tl.fromTo(saDischarge,
                { opacity: 1, strokeDasharray: "100", strokeDashoffset: "100" },
                { strokeDashoffset: "0", duration: 0.5, ease: "power2.out" }
            );

            tl.to(saDischarge, { opacity: 0, duration: 0.3, delay: 0.2 });
        });
    }
}

// ==========================================
// UNIT 6: DISTRIBUTION SYSTEMS
// ==========================================
function initUnit6Distribution() {
    // 1. DC Distribution Toggle
    const btnRadial = document.getElementById('dist-radial');
    const btnRing = document.getElementById('dist-ring');
    const btnInter = document.getElementById('dist-inter');

    const svgRadial = document.getElementById('svg-radial');
    const svgRing = document.getElementById('svg-ring');
    const svgInter = document.getElementById('svg-inter');

    function setActiveSystem(type) {
        // Reset all buttons
        [btnRadial, btnRing, btnInter].forEach(b => {
            if (b) {
                b.style.background = "rgba(255,255,255,0.02)";
                b.style.borderLeftColor = "#64748b";
                b.querySelector('h4').style.color = "#cbd5e1";
            }
        });

        // Hide all SVGs
        gsap.to([svgRadial, svgRing, svgInter], {
            opacity: 0, duration: 0.3, onComplete: () => {
                if (svgRadial) { svgRadial.style.visibility = "hidden"; }
                if (svgRing) { svgRing.style.visibility = "hidden"; }
                if (svgInter) { svgInter.style.visibility = "hidden"; }

                // Show Active
                if (type === 'radial' && btnRadial && svgRadial) {
                    btnRadial.style.background = "rgba(255,255,255,0.05)";
                    btnRadial.style.borderLeftColor = "var(--mod6-color)";
                    btnRadial.querySelector('h4').style.color = "var(--mod6-color)";
                    svgRadial.style.visibility = "visible";
                    gsap.fromTo(svgRadial, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5 });
                }
                else if (type === 'ring' && btnRing && svgRing) {
                    btnRing.style.background = "rgba(255,255,255,0.05)";
                    btnRing.style.borderLeftColor = "var(--mod6-color)";
                    btnRing.querySelector('h4').style.color = "var(--mod6-color)";
                    svgRing.style.visibility = "visible";
                    gsap.fromTo(svgRing, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5 });
                }
                else if (type === 'inter' && btnInter && svgInter) {
                    btnInter.style.background = "rgba(255,255,255,0.05)";
                    btnInter.style.borderLeftColor = "var(--mod6-color)";
                    btnInter.querySelector('h4').style.color = "var(--mod6-color)";
                    svgInter.style.visibility = "visible";
                    gsap.fromTo(svgInter, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5 });
                }
            }
        });
    }

    if (btnRadial) btnRadial.addEventListener('click', () => setActiveSystem('radial'));
    if (btnRing) btnRing.addEventListener('click', () => setActiveSystem('ring'));
    if (btnInter) btnInter.addEventListener('click', () => setActiveSystem('inter'));
}

// ==========================================
// UNIT 7: SUBSTATIONS
// ==========================================
function initUnit7Substations() {
    const btnOperate = document.getElementById('btn-operate-sub');
    const blade = document.getElementById('iso-blade');

    let isClosed = false;

    if (btnOperate && blade) {
        btnOperate.addEventListener('click', () => {
            isClosed = !isClosed;
            if (isClosed) {
                // Close Isolator
                blade.style.transform = "rotate(0deg)";
                btnOperate.textContent = "Open Isolator";
                btnOperate.classList.add('active');

                // Energize Transformer (Pulse)
                gsap.to('#substation-svg circle', {
                    strokeWidth: 6,
                    filter: "drop-shadow(0 0 10px #00f5ff)",
                    duration: 0.5,
                    repeat: -1,
                    yoyo: true,
                    delay: 0.5 // wait for blade to close
                });
            } else {
                // Open Isolator
                blade.style.transform = "rotate(40deg)";
                btnOperate.textContent = "Close Isolator & Energize TX";
                btnOperate.classList.remove('active');

                // De-energize
                gsap.killTweensOf('#substation-svg circle');
                gsap.to('#substation-svg circle', {
                    strokeWidth: 4,
                    filter: "none",
                    duration: 0.3
                });
            }
        });
    }
}

// ==========================================
// UNIT 8: HVDC
// ==========================================
function initUnit8HVDC() {
    // For unit 8, we just have static SVG diagrams right now, but we can add simple hover pulses
    gsap.to('#mod8 rect', {
        scale: 1.05,
        transformOrigin: "center center",
        repeat: -1,
        yoyo: true,
        duration: 2,
        ease: "sine.inOut",
        stagger: 0.2
    });
}

// ------------------------------------------
// MAIN INITIALIZATION
// ------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Basic Navigation Map
    setupSidebarScrollspy();

    // Call Unit Initializes
    // Assuming initUnit1Basics, initUnit2Components, initUnit3Parameters, initUnit4Cables exist elsewhere
    // and should be called as per the instruction "ensure that all initUnit... functions are called"
    initUnit1Basics();
    initUnit2Components();
    initUnit3Parameters();
    initUnit4Cables();
    initUnit5Performance(); // Added based on existing function
    initUnit5Overvoltages();
    initUnit6Distribution();
    initUnit7Substations();
    initUnit8HVDC();
});
