/* subjects/power-systems/js/module1.js */

document.addEventListener("DOMContentLoaded", () => {
    // ---------------------------------
    // Initialize KaTeX Auto-Render
    // ---------------------------------
    if (window.renderMathInElement) {
        window.renderMathInElement(document.body, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false}
            ],
            throwOnError: false
        });
    }

    // 1. Initial State for Calculators
    initCalculators();

    // 2. D3: Voltage Hierarchy Pyramid
    drawVoltagePyramid();

    // 3. D3: Distributor Current Staircase
    drawCurrentStaircase();

    // 4. GSAP: Power System Flow Particles
    initPowerFlowAnim();

    // 5. D3: Conductor Volume Comparison
    drawSystemComparison();

    // 6. Master Quiz
    initMasterQuiz();

    // 7. Sidebar Interaction (Matching Power Plant)
    initSidebar();
});

// --- SIDEBAR Logic ---
function initSidebar() {
    const sidebar = document.getElementById('ppSidebar');
    const toggle = document.getElementById('ppSbToggle');
    const close = document.getElementById('ppSbClose');
    const overlay = document.getElementById('ppSbOverlay');

    if (toggle && sidebar) {
        toggle.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.classList.add('active');
        });

        const closeSidebar = () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        };

        if (close) close.addEventListener('click', closeSidebar);
        if (overlay) overlay.addEventListener('click', closeSidebar);
    }
}

// --- HELPER: Calculator Logic ---
function initCalculators() {
    // 3A: Power Loss & Volume
    const sliderV = document.getElementById('loss-v-slider');
    const sliderCos = document.getElementById('loss-cos-slider');
    if (sliderV) {
        sliderV.addEventListener('input', updateLossCalc);
        sliderCos.addEventListener('input', updateLossCalc);
        updateLossCalc();
    }

    // 4A: System Comparison
    const cosSystemSlider = document.getElementById('comp-cos-slider');
    if (cosSystemSlider) {
        cosSystemSlider.addEventListener('input', updateSystemComparison);
    }
}

function updateLossCalc() {
    const V = parseFloat(document.getElementById('loss-v-slider').value);
    const cosPhi = parseFloat(document.getElementById('loss-cos-slider').value);
    const P = 100; // 100 MW Constant
    const f = 100; // 100 km Constant
    const A = 120; // 120 mm2 Constant

    // W = P^2 * f / (V^2 * cos^2 * A)  (simplified units)
    const W = (P * P * f) / (V * V * cosPhi * cosPhi * A);
    const Volume = (P * P * f) / (V * V * cosPhi * cosPhi * W); // Normalized

    document.getElementById('loss-v-val').textContent = V + " kV";
    document.getElementById('loss-cos-val').textContent = cosPhi.toFixed(2);
    document.getElementById('loss-w-res').textContent = W.toFixed(1) + " MW Loss";
    document.getElementById('loss-vol-res').textContent = Volume.toFixed(2) + " m³";
    
    // Update visual "heat" intensity
    const lossHeat = document.querySelector('.heat-loss-glow');
    if (lossHeat) {
        lossHeat.style.opacity = Math.max(0.1, Math.min(W / 10, 0.9));
    }
}

// --- D3: POWER SYSTEM PYRAMID ---
function drawVoltagePyramid() {
    const svg = d3.select("#pyramid-svg");
    if (svg.empty()) return;
    
    const width = 300, height = 240;
    const levels = [
        { label: "UHV (765kV+)", color: "#a78bfa", var: "±12.5%", y: 40, w: 60 },
        { label: "EHV (220kV)",  color: "#ef4444", var: "±12.5%", y: 80, w: 100 },
        { label: "HV (33kV)",    color: "#f97316", var: "+6% to -9%", y: 120, w: 160 },
        { label: "MV (650V)",    color: "#facc15", var: "±6%",      y: 160, w: 220 },
        { label: "LV (230V)",    color: "#00ff88", var: "±6%",      y: 200, w: 280 }
    ];

    const tooltip = d3.select("body").append("div").attr("class", "d3-tooltip").style("opacity", 0);

    svg.selectAll(".level")
        .data(levels)
        .enter()
        .append("polygon")
        .attr("class", "pyramid-level")
        .attr("points", d => {
            const topW = d.w - 20;
            const botW = d.w + 20;
            return `${150-topW/2},${d.y} ${150+topW/2},${d.y} ${150+botW/2},${d.y+35} ${150-botW/2},${d.y+35}`;
        })
        .attr("fill", d => d.color)
        .attr("stroke", "#111")
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`${d.label}<br>Variation: <b>${d.var}</b>`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition().duration(500).style("opacity", 0);
        });

    svg.selectAll("text")
        .data(levels)
        .enter()
        .append("text")
        .attr("x", 150)
        .attr("y", d => d.y + 22)
        .attr("text-anchor", "middle")
        .attr("fill", "#000")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .text(d => d.label.split(" ")[0]);
}

// --- D3: DISTRIBUTOR STAIRCASE ---
function drawCurrentStaircase() {
    const svg = d3.select("#dist-chart-svg");
    if (svg.empty()) return;

    const data = [100, 85, 70, 50, 40, 25, 0]; // Current values at distance points
    const width = 280, height = 150;
    
    const x = d3.scaleLinear().domain([0, 6]).range([20, width - 20]);
    const y = d3.scaleLinear().domain([0, 100]).range([height - 20, 20]);

    const line = d3.line()
        .x((d, i) => x(i))
        .y(d => y(d))
        .curve(d3.curveStepAfter);

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#facc15")
        .attr("stroke-width", 3)
        .attr("d", line);

    // Points
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => x(i))
        .attr("cy", d => y(d))
        .attr("r", 4)
        .attr("fill", "#fff");
}

// --- GSAP: POWER FLOW ANIMATION ---
function initPowerFlowAnim() {
    const path = document.querySelector(".flow-path");
    if (!path) return;

    // Create 3 sliding particles
    for (let i = 0; i < 3; i++) {
        const p = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        p.setAttribute("r", 4);
        p.setAttribute("class", "current-particle");
        document.querySelector(".flow-group").appendChild(p);

        gsap.to(p, {
            duration: 3,
            repeat: -1,
            ease: "none",
            delay: i * 1,
            motionPath: {
                path: ".flow-path",
                align: ".flow-path",
                autoRotate: true,
                alignOrigin: [0.5, 0.5]
            }
        });
    }
}

// --- D3: SYSTEM COMPARISON BAR CHART ---
function drawSystemComparison() {
    const container = d3.select("#comparison-bars");
    if (container.empty()) return;

    updateSystemComparison();
}

function updateSystemComparison() {
    const container = d3.select("#comparison-bars");
    if (container.empty()) return;

    const cosVal = parseFloat(document.getElementById('comp-cos-slider')?.value || 1.0);
    const cosSq = cosVal * cosVal;

    const systems = [
        { name: "DC 2-wire, 1e", val: 1.0, cat: "DC" },
        { name: "DC 2-wire, mid-e", val: 0.25, cat: "DC" },
        { name: "3-ph 3-wire", val: 0.5 / cosSq, cat: "AC" },
        { name: "3-ph 4-wire", val: 0.583 / cosSq, cat: "AC" },
        { name: "1-ph 2-wire", val: 2.0 / cosSq, cat: "AC" },
        { name: "2-ph 3-wire", val: 0.75 / cosSq, cat: "AC" }
    ];

    container.selectAll("*").remove();

    const maxVal = d3.max(systems, d => d.val);
    const x = d3.scaleLinear().domain([0, maxVal]).range([0, 200]);

    const rows = container.selectAll(".bar-row")
        .data(systems)
        .enter()
        .append("div")
        .style("margin-bottom", "10px")
        .style("display", "flex")
        .style("align-items", "center");

    rows.append("div")
        .style("width", "100px")
        .style("font-size", "10px")
        .style("color", "#999")
        .text(d => d.name);

    rows.append("div")
        .style("height", "14px")
        .style("width", d => x(d.val) + "px")
        .style("background", d => d.cat === "DC" ? "#00f5ff" : "#facc15")
        .style("border-radius", "0 7px 7px 0")
        .style("transition", "width 0.3s");

    rows.append("div")
        .style("margin-left", "10px")
        .style("font-size", "10px")
        .style("color", d => d.val < 0.3 ? "#00ff88" : "#fff")
        .text(d => d.val.toFixed(3));
}

// --- MASTER QUIZ ENGINE ---
const quizData = [
    { q: "Feeder design based on?", a: "Current Carrying Capacity" },
    { q: "Distributor design based on?", a: "Voltage Drop" },
    { q: "Primary transmission voltage?", a: "132, 220, 400, 765 kV" },
    { q: "HVDC India voltage level?", a: "500 kV" },
    { q: "HVDC break-even distance?", a: "> 500 km" },
    { q: "DC neutral area (3-wire)?", a: "1/2 × area of main wire" },
    { q: "AC neutral area (2-wire)?", a: "√2 × area of main wire" },
    { q: "Most economical DC system?", a: "DC mid-point earth (0.25)" },
    { q: "Power Loss W ∝ ?", a: "1 / V²" },
    { q: "Permissible frequency variation?", a: "± 3%" },
    { q: "EHV permissible variation?", a: "± 12.5%" },
    { q: "Underground system PF?", a: "Leading Power Factor" },
    { q: "1200 kV trial route?", a: "Bina to Nashik" },
    { q: "Primary Tx system type?", a: "3-phase, 3-wire" },
    { q: "Distributor tapping effect?", a: "Current decreases along length" }
];

let currentCardIndex = 0;

function initMasterQuiz() {
    const qText = document.getElementById('quiz-q');
    const aText = document.getElementById('quiz-a');
    const card = document.querySelector('.quiz-card-inner');
    
    if (!qText || !card) return;

    window.toggleQuiz = () => {
        card.classList.toggle('flipped');
    }

    window.nextQuiz = () => {
        card.classList.remove('flipped');
        setTimeout(() => {
            currentCardIndex = (currentCardIndex + 1) % quizData.length;
            qText.textContent = quizData[currentCardIndex].q;
            aText.textContent = quizData[currentCardIndex].a;
            document.getElementById('quiz-count').textContent = `${currentCardIndex+1}/15`;
        }, 150);
    }

    // Set first card
    qText.textContent = quizData[0].q;
    aText.textContent = quizData[0].a;
}
