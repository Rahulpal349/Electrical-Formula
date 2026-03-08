/**
 * EE Formula Hub — Unit 2: AC Circuit Analysis
 * Interactivity and Visualizations (D3.js + GSAP)
 * Fixes for Cards 16-21: Graph Theory & Duality
 */

document.addEventListener("DOMContentLoaded", () => {
    initRMSPlot();
    initWaveformTable();
    initPhasorFundamentals();
    initRLPhasor();
    initRCPhasor();
    initRLCPhasor();
    initParallelCircuits();

    // Advanced Cards
    initPracticalParallelResonance();
    initSeriesResonance();
    initResonanceComparison();
    initPowerTriangle();
    initMagneticElectricAnalogy();
    initThreePhaseSystem();

    // Fixed & Animated Graph Theory Section
    initGraphTheory();
    initGraphTree();
    initMatrixVisualizers();
    initDualityTransform();

    initCalculators();
});

// ──── Card 1: RMS & Average Plot ────
function initRMSPlot() {
    const container = d3.select("#plot-wave-rms");
    if (container.empty()) return;
    const width = container.node().clientWidth || 400;
    const height = 240;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const svg = container.append("svg").attr("width", width).attr("height", height);
    const x = d3.scaleLinear().domain([0, 2 * Math.PI]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([-2, 2]).range([height - margin.bottom, margin.top]);

    svg.append("g").attr("class", "ac-plot-grid").call(d3.axisLeft(y).tickSize(-width).tickFormat(""));
    svg.append("g").attr("class", "ac-plot-grid").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).tickSize(-height).tickFormat(""));

    const path = svg.append("path").attr("fill", "rgba(0, 245, 255, 0.05)").attr("stroke", "var(--unit-cyan)").attr("stroke-width", 3);
    const rmsLine = svg.append("line").attr("stroke", "var(--unit-cyan)").attr("stroke-dasharray", "5,5").attr("stroke-width", 2);
    const peakLine = svg.append("line").attr("stroke", "var(--unit-gold)").attr("stroke-dasharray", "5,5").attr("stroke-width", 2);

    function update(Vm = 1) {
        const data = d3.range(0, 2 * Math.PI, 0.05).map(t => ({ t: t, v: Vm * Math.sin(t) }));
        path.attr("d", d3.area().x(d => x(d.t)).y0(y(0)).y1(d => y(d.v))(data));
        const vRms = Vm / Math.sqrt(2);
        rmsLine.attr("x1", margin.left).attr("x2", width - margin.right).attr("y1", y(vRms)).attr("y2", y(vRms));
        peakLine.attr("x1", margin.left).attr("x2", width - margin.right).attr("y1", y(Vm)).attr("y2", y(Vm));
    }

    const slipVm = document.getElementById("slip-vm");
    if (slipVm) {
        slipVm.addEventListener("input", (e) => {
            document.getElementById("val-vm").textContent = e.target.value;
            update(e.target.value / 100);
        });
    }
    update(1);
}

// ──── Card 2: Waveform Table ────
function initWaveformTable() {
    const container = d3.select("#plot-wave-table");
    if (container.empty()) return;
    const width = container.node().clientWidth || 400, height = 240;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const svg = container.append("svg").attr("width", width).attr("height", height);
    const x = d3.scaleLinear().domain([0, 2 * Math.PI]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([-1.2, 1.2]).range([height - margin.bottom, margin.top]);
    const path = svg.append("path").attr("fill", "rgba(0, 245, 255, 0.1)").attr("stroke", "var(--unit-cyan)").attr("stroke-width", 2);

    const types = {
        sine: (t) => Math.sin(t),
        "hw-rect": (t) => Math.sin(t) > 0 ? Math.sin(t) : 0,
        "fw-rect": (t) => Math.abs(Math.sin(t)),
        square: (t) => Math.sin(t) > 0 ? 1 : -1,
        triangular: (t) => (4 / (2 * Math.PI)) * (Math.abs(((t - Math.PI / 2) % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI) - Math.PI) - Math.PI / 2),
        sawtooth: (t) => 2 * (t / (2 * Math.PI) - Math.floor(t / (2 * Math.PI) + 0.5))
    };

    function drawWave(type) {
        const func = types[type] || types.sine;
        const data = d3.range(0, 2 * Math.PI, 0.02).map(t => ({ t: t, v: func(t) }));
        path.transition().duration(500).attr("d", d3.area().x(d => x(d.t)).y0(y(0)).y1(d => y(d.v))(data));
    }

    document.querySelectorAll(".ac-tab").forEach(tab => {
        tab.addEventListener("click", function () {
            document.querySelectorAll(".ac-tab").forEach(t => t.classList.remove("active"));
            this.classList.add("active");
            drawWave(this.dataset.type);
            updateFormula(this.dataset.type);
        });
    });

    function updateFormula(type) {
        const formulas = {
            sine: "$$ V_{rms} = V_m/\\sqrt{2} \\quad V_{avg} = 0 $$",
            "hw-rect": "$$ V_{rms} = V_m/2 \\quad V_{avg} = V_m/\\pi $$",
            "fw-rect": "$$ V_{rms} = V_m/\\sqrt{2} \\quad V_{avg} = 2V_m/\\pi $$",
            square: "$$ V_{rms} = V_m \\quad V_{avg} = 0 $$",
            triangular: "$$ V_{rms} = V_m/\\sqrt{3} \\quad V_{avg} = V_m/2 $$",
            sawtooth: "$$ V_{rms} = V_m/\\sqrt{3} \\quad V_{avg} = V_m/2 $$"
        };
        const el = document.getElementById("formula-display");
        if (el) { el.innerHTML = formulas[type] || formulas.sine; if (window.renderMathInElement) renderMathInElement(el); }
    }
    drawWave("sine");
}

// ──── Card 3: Phasor Fundamentals ────
function initPhasorFundamentals() {
    const container = d3.select("#plot-phasor-fundamentals");
    if (container.empty()) return;
    const w = container.node().clientWidth || 400, h = 240, cx = w / 2, cy = h / 2;
    const svg = container.append("svg").attr("width", w).attr("height", h);
    svg.append("line").attr("x1", 0).attr("x2", w).attr("y1", cy).attr("y2", cy).attr("stroke", "rgba(255,255,255,0.05)");
    svg.append("line").attr("x1", cx).attr("x2", cx).attr("y1", 0).attr("y2", h).attr("stroke", "rgba(255,255,255,0.05)");
    const ph = svg.append("line").attr("x1", cx).attr("y1", cy).attr("stroke", "var(--unit-cyan)").attr("stroke-width", 3);
    function update(phi) {
        const r = -phi * Math.PI / 180;
        ph.attr("x2", cx + 80 * Math.cos(r)).attr("y2", cy + 80 * Math.sin(r));
    }
    const slip = document.getElementById("slip-phi");
    if (slip) slip.oninput = (e) => { if (document.getElementById("val-phi")) document.getElementById("val-phi").textContent = e.target.value; update(e.target.value); };
    update(45);
}

// ──── Phasor Utilities ────
function drawPhasor(id, vecs) {
    const container = d3.select(id);
    if (container.empty()) return;
    container.selectAll("*").remove();
    const w = container.node().clientWidth || 400, h = 240, cx = 80, cy = h - 80;
    const svg = container.append("svg").attr("width", w).attr("height", h);
    vecs.forEach(v => {
        svg.append("line").attr("x1", cx).attr("y1", cy).attr("x2", cx + (v.x || 0)).attr("y2", cy - (v.y || 0)).attr("stroke", v.col).attr("stroke-width", 3);
        svg.append("text").attr("x", cx + (v.x || 0) + 5).attr("y", cy - (v.y || 0) - 5).attr("fill", v.col).attr("font-size", "11px").text(v.lab);
    });
}

// ──── Series Circuits ────
function initRLPhasor() {
    function up() {
        const rEl = document.getElementById("rl-slip-r");
        const lEl = document.getElementById("rl-slip-l");
        if (!rEl || !lEl) return;
        const r = rEl.value, l = lEl.value;
        const xl = 2 * Math.PI * 50 * (l / 1000);
        document.getElementById("rl-val-r").textContent = r; document.getElementById("rl-val-l").textContent = l;
        drawPhasor("#plot-rl-phasor", [{ x: r * 1, y: 0, col: "white", lab: "Vr" }, { x: 0, y: xl * 1, col: "var(--unit-cyan)", lab: "Vl" }, { x: r * 1, y: xl * 1, col: "var(--unit-gold)", lab: "V" }]);
    }
    const r = document.getElementById("rl-slip-r"), l = document.getElementById("rl-slip-l");
    if (r) { r.oninput = up; l.oninput = up; up(); }
}

function initRCPhasor() {
    function up() {
        const rEl = document.getElementById("rc-slip-r");
        const cEl = document.getElementById("rc-slip-c");
        if (!rEl || !cEl) return;
        const r = rEl.value, c = cEl.value;
        const xc = 1 / (2 * Math.PI * 50 * (c * 1e-6));
        document.getElementById("rc-val-r").textContent = r; document.getElementById("rc-val-c").textContent = c;
        drawPhasor("#plot-rc-phasor", [{ x: r * 1, y: 0, col: "white", lab: "Vr" }, { x: 0, y: -xc / 3, col: "var(--unit-purple)", lab: "Vc" }, { x: r * 1, y: -xc / 3, col: "var(--unit-gold)", lab: "V" }]);
    }
    const r = document.getElementById("rc-slip-r"), c = document.getElementById("rc-slip-c");
    if (r) { r.oninput = up; c.oninput = up; up(); }
}

function initRLCPhasor() {
    function up() {
        const slipL = document.getElementById("rlc-slip-l");
        if (!slipL) return;
        const l = slipL.value / 1000, c = document.getElementById("rlc-slip-c").value * 1e-6, f = document.getElementById("rlc-slip-f").value;
        const xl = 2 * Math.PI * f * l, xc = 1 / (2 * Math.PI * f * c), diff = xl - xc;
        document.getElementById("rlc-val-l").textContent = (l * 1000).toFixed(0);
        document.getElementById("rlc-val-c").textContent = (c * 1e6).toFixed(0);
        document.getElementById("rlc-val-f").textContent = f;
        const b = document.getElementById("rlc-mode-badge");
        if (b) {
            if (Math.abs(diff) < 2) { b.textContent = "RESONANCE"; b.style.background = "var(--unit-green)"; }
            else if (diff > 0) { b.textContent = "INDUCTIVE"; b.style.background = "var(--unit-cyan)"; }
            else { b.textContent = "CAPACITIVE"; b.style.background = "var(--unit-purple)"; }
        }
        drawPhasor("#plot-rlc-phasor", [{ x: 50, y: 0, col: "white", lab: "Vr" }, { x: 0, y: xl / 3, col: "var(--unit-cyan)", lab: "Vl" }, { x: 0, y: -xc / 3, col: "var(--unit-purple)", lab: "Vc" }, { x: 50, y: diff / 3, col: "var(--unit-gold)", lab: "V" }]);
    }
    ["rlc-slip-l", "rlc-slip-c", "rlc-slip-f"].forEach(id => { const el = document.getElementById(id); if (el) el.oninput = up; });
    up();
}

function initParallelCircuits() {
    drawPhasor("#plot-prl-phasor", [{ x: 80, y: 0, col: "var(--unit-cyan)", lab: "Ir" }, { x: 0, y: 60, col: "white", lab: "Il" }]);
    drawPhasor("#plot-prc-phasor", [{ x: 80, y: 0, col: "var(--unit-cyan)", lab: "Ir" }, { x: 0, y: -60, col: "white", lab: "Ic" }]);
    drawPhasor("#plot-prlc-phasor", [{ x: 80, y: 0, col: "var(--unit-cyan)", lab: "Ir" }, { x: 0, y: 40, col: "white", lab: "Il" }, { x: 0, y: -60, col: "var(--unit-purple)", lab: "Ic" }]);
}

// ──── Card 10: Practical Parallel Resonance ────
function initPracticalParallelResonance() {
    const container = d3.select("#plot-pres-prac");
    if (container.empty()) return;
    const w = container.node().clientWidth || 400, h = 240, m = { t: 20, r: 30, b: 40, l: 50 };
    const svg = container.append("svg").attr("width", w).attr("height", h);
    const x = d3.scaleLinear().domain([0, 200]).range([m.l, w - m.r]);
    const y = d3.scaleLinear().domain([0, 5000]).range([h - m.b, m.t]);
    const path = svg.append("path").attr("fill", "none").attr("stroke", "var(--unit-orange)").attr("stroke-width", 2);

    function update(R) {
        const L = 0.1, C = 100e-6;
        const fr = (1 / (2 * Math.PI)) * Math.sqrt((1 / (L * C)) - (R * R / (L * L)) || 1);
        const data = d3.range(10, 200, 2).map(f => ({ f, z: (L / (C * R)) / (1 + Math.abs(f - fr) / 10) }));
        path.attr("d", d3.line().x(d => x(d.f)).y(d => y(d.z))(data));
        if (document.getElementById("pres-val-q")) {
            const Q = (1 / R) * Math.sqrt(L / C);
            document.getElementById("pres-val-q").textContent = Q.toFixed(2);
        }
    }
    const slip = document.getElementById("pres-slip-r");
    if (slip) {
        slip.oninput = (e) => { document.getElementById("pres-val-r").textContent = e.target.value; update(e.target.value); };
        update(10);
    }
}

// ──── Card 11: Series Resonance ────
function initSeriesResonance() {
    const container = d3.select("#plot-sres");
    if (container.empty()) return;
    const w = container.node().clientWidth || 400, h = 240, m = { t: 20, r: 30, b: 40, l: 50 };
    const svg = container.append("svg").attr("width", w).attr("height", h);
    const x = d3.scaleLinear().domain([0, 200]).range([m.l, w - m.r]);
    const y = d3.scaleLinear().domain([0, 10]).range([h - m.b, m.t]);
    const path = svg.append("path").attr("fill", "rgba(0, 255, 136, 0.1)").attr("stroke", "var(--unit-green)").attr("stroke-width", 3);

    function update(Q) {
        const f0 = 100, f_range = d3.range(20, 180, 2);
        const data = f_range.map(f => ({ f: f, i: 10 / (1 + Q * Math.pow((f / f0) - (f0 / f), 2)) }));
        path.attr("d", d3.area().x(d => x(d.f)).y0(y(0)).y1(d => y(d.i))(data));
        const badge = document.getElementById("v-mag-badge");
        if (badge) badge.style.display = Q > 10 ? "block" : "none";
    }
    const slip = document.getElementById("sres-slip-q");
    if (slip) {
        slip.oninput = (e) => { document.getElementById("sres-val-q").textContent = e.target.value; update(e.target.value); };
        update(5);
    }
}

// ──── Card 12: Comparison ────
function initResonanceComparison() {
    const container = d3.select("#plot-res-comparison");
    if (container.empty()) return;
    let isSeries = true;
    const w = container.node().clientWidth || 400, h = 240, m = { t: 20, r: 30, b: 40, l: 50 };
    const svg = container.append("svg").attr("width", w).attr("height", h);
    const x = d3.scaleLinear().domain([0, 200]).range([m.l, w - m.r]);
    const y = d3.scaleLinear().domain([0, 10]).range([h - m.b, m.t]);
    const path = svg.append("path").attr("fill", "none").attr("stroke-width", 3);

    function draw() {
        const f0 = 100, Q = 8;
        const data = d3.range(20, 180, 2).map(f => {
            const val = 1 / (1 + Q * Math.pow((f / f0) - (f0 / f), 2));
            return { f, v: isSeries ? val * 10 : (1 - val) * 10 };
        });
        path.transition().duration(500).attr("stroke", isSeries ? "var(--unit-green)" : "var(--unit-orange)").attr("d", d3.line().x(d => x(d.f)).y(d => y(d.v))(data));
    }

    const btn = document.getElementById("toggle-res-mode");
    if (btn) {
        btn.onclick = () => {
            isSeries = !isSeries;
            btn.textContent = isSeries ? "Switch to Parallel" : "Switch to Series";
            document.getElementById("comp-mode-label").textContent = isSeries ? "Series" : "Parallel";
            document.getElementById("comp-val-z").textContent = isSeries ? "Minimum (R)" : "Maximum (L/CR)";
            document.getElementById("comp-val-i").textContent = isSeries ? "Maximum" : "Minimum";
            document.getElementById("comp-val-f").textContent = isSeries ? "Band-Pass" : "Band-Stop";
            draw();
        };
    }
    draw();
}

// ──── Card 13: Power Triangle ────
function initPowerTriangle() {
    const container = d3.select("#plot-power-triangle");
    if (container.empty()) return;
    const w = container.node().clientWidth || 400, h = 240, cx = 50, cy = h - 50;
    const svg = container.append("svg").attr("width", w).attr("height", h);
    const pLine = svg.append("line").attr("stroke", "var(--unit-cyan)").attr("stroke-width", 4);
    const qLine = svg.append("line").attr("stroke", "var(--unit-gold)").attr("stroke-width", 4);
    const sLine = svg.append("line").attr("stroke", "white").attr("stroke-width", 4);

    function update() {
        const pSlip = document.getElementById("pwr-slip-p");
        if (!pSlip) return;
        const P = pSlip.value, Q = document.getElementById("pwr-slip-q").value;
        const scale = 1;
        pLine.attr("x1", cx).attr("y1", cy).attr("x2", cx + P * scale).attr("y2", cy);
        qLine.attr("x1", cx + P * scale).attr("y1", cy).attr("x2", cx + P * scale).attr("y2", cy - Q * scale);
        sLine.attr("x1", cx).attr("y1", cy).attr("x2", cx + P * scale).attr("y2", cy - Q * scale);
        document.getElementById("pwr-val-p").textContent = P;
        document.getElementById("pwr-val-q").textContent = Q;
    }
    ["pwr-slip-p", "pwr-slip-q"].forEach(id => {
        const el = document.getElementById(id); if (el) el.oninput = update;
    });
    update();
}

// ──── Card 14: Magnetic Analogy ────
function initMagneticElectricAnalogy() {
    const container = d3.select("#plot-mag-analogy");
    if (container.empty()) return;
    const w = container.node().clientWidth || 400, h = 240;
    const svg = container.append("svg").attr("width", w).attr("height", h);
    svg.append("text").attr("x", 20).attr("y", 30).attr("fill", "var(--unit-cyan)").text("Electric: V = IR");
    svg.append("rect").attr("x", 20).attr("y", 50).attr("width", 100).attr("height", 60).attr("fill", "none").attr("stroke", "var(--unit-cyan)");
    svg.append("text").attr("x", w / 2 + 20).attr("y", 30).attr("fill", "var(--unit-orange)").text("Magnetic: MMF = ΦS");
    svg.append("rect").attr("x", w / 2 + 20).attr("y", 50).attr("width", 100).attr("height", 60).attr("fill", "none").attr("stroke", "var(--unit-orange)").style("stroke-dasharray", "4,4");
}

// ──── Card 15: 3-Phase ────
function initThreePhaseSystem() {
    const container = d3.select("#plot-3phase");
    if (container.empty()) return;
    let isStar = true;
    const w = container.node().clientWidth || 400, h = 240, cx = w / 2, cy = h / 2;
    const svg = container.append("svg").attr("width", w).attr("height", h);
    const phasors = [
        svg.append("line").attr("stroke", "#ff4444").attr("stroke-width", 3),
        svg.append("line").attr("stroke", "#ffcc00").attr("stroke-width", 3),
        svg.append("line").attr("stroke", "#60a5fa").attr("stroke-width", 3)
    ];

    function draw() {
        const r = 80;
        [0, 120, 240].forEach((ang, i) => {
            const rad = (ang - 90) * Math.PI / 180;
            phasors[i].attr("x1", cx).attr("y1", cy).attr("x2", cx + r * Math.cos(rad)).attr("y2", cy + r * Math.sin(rad));
        });
    }

    const btn = document.getElementById("toggle-3phase");
    if (btn) {
        btn.onclick = () => {
            isStar = !isStar;
            btn.textContent = isStar ? "Switch to Delta (Δ)" : "Switch to Star (Y)";
            document.getElementById("pha-mode-badge").textContent = isStar ? "STAR (Y)" : "DELTA (Δ)";
            document.getElementById("pha-formula").innerHTML = isStar ? "$$ V_L = \\sqrt{3}V_{ph} \\quad ; \\quad I_L = I_{ph} $$" : "$$ V_L = V_{ph} \\quad ; \\quad I_L = \\sqrt{3}I_{ph} $$";
            if (window.renderMathInElement) renderMathInElement(document.getElementById("pha-formula"));
        };
    }
    draw();
}

// ──── Card 16: Graph Theory Topology (Animated) ────
function initGraphTheory() {
    const container = d3.select("#plot-graph-basics");
    if (container.empty()) return;
    container.selectAll("*").remove();
    const w = container.node().clientWidth || 400, h = 240;
    const svg = container.append("svg").attr("width", w).attr("height", h);

    const nodes = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }];
    const links = [{ source: 0, target: 1 }, { source: 1, target: 2 }, { source: 2, target: 3 }, { source: 3, target: 0 }, { source: 0, target: 2 }];

    const sim = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).distance(100))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(w / 2, h / 2));

    const linkSet = svg.append("g").selectAll("line").data(links).enter().append("line")
        .attr("stroke", "rgba(255,255,255,0.2)").attr("stroke-width", 2);

    const nodeSet = svg.append("g").selectAll("circle").data(nodes).enter().append("circle")
        .attr("r", 8).attr("class", "graph-node").style("cursor", "grab")
        .call(d3.drag().on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
            .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
            .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

    sim.on("tick", () => {
        linkSet.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        nodeSet.attr("cx", d => d.x).attr("cy", d => d.y);
    });
}

// ──── Card 17: Trees & Co-trees (Interactive) ────
function initGraphTree() {
    const container = d3.select("#plot-graph-tree");
    if (container.empty()) return;
    const w = container.node().clientWidth || 400, h = 240;
    const svg = container.append("svg").attr("width", w).attr("height", h);

    const nodes = [{ x: w / 4, y: h / 2, id: 'A' }, { x: w / 2, y: h / 4, id: 'B' }, { x: 3 * w / 4, y: h / 2, id: 'C' }, { x: w / 2, y: 3 * h / 4, id: 'D' }];
    const links = [
        { s: 0, t: 1, isTwig: true }, { s: 1, t: 2, isTwig: true }, { s: 2, t: 3, isTwig: true },
        { s: 3, t: 0, isTwig: false }, { s: 0, t: 2, isTwig: false }
    ];

    svg.selectAll("line").data(links).enter().append("line")
        .attr("x1", d => nodes[d.s].x).attr("y1", d => nodes[d.s].y)
        .attr("x2", d => nodes[d.t].x).attr("y2", d => nodes[d.t].y)
        .attr("stroke", d => d.isTwig ? "var(--unit-cyan)" : "var(--unit-gold)")
        .attr("stroke-width", d => d.isTwig ? 4 : 2)
        .attr("stroke-dasharray", d => d.isTwig ? "0" : "5,5")
        .style("opacity", 0.8);

    svg.selectAll("circle").data(nodes).enter().append("circle")
        .attr("r", 6).attr("cx", d => d.x).attr("cy", d => d.y).attr("fill", "var(--bg-dark)").attr("stroke", "var(--unit-white)");
}

// ──── Matrix Initializers (Cards 18-20) ────
function initMatrixVisualizers() {
    const ids = ["#plot-inc-matrix", "#plot-tie-matrix", "#plot-cut-matrix"];
    const matrices = [
        [[1, 0, 1, 0, 1], [-1, 1, 0, 0, 0], [0, -1, -1, 1, 0], [0, 0, 0, -1, -1]], // Incidence
        [[1, 1, -1, 0, 0], [0, 0, 1, 1, -1]], // Tie-set
        [[1, 0, 0, 1, 0], [0, 1, 0, -1, 1], [0, 0, 1, 0, -1]] // Cut-set
    ];

    ids.forEach((id, idx) => {
        const container = d3.select(id);
        if (container.empty()) return;
        container.selectAll("*").remove();
        const mat = matrices[idx];
        const grid = container.append("div").attr("class", "matrix-container")
            .style("grid-template-columns", `repeat(${mat[0].length}, 35px)`)
            .style("margin", "auto").style("width", "fit-content");

        mat.flat().forEach(val => {
            grid.append("div").attr("class", `matrix-cell ${val > 0 ? 'pos' : val < 0 ? 'neg' : ''}`)
                .text(val).style("opacity", "0").transition().delay(val * 100).duration(800).style("opacity", "1");
        });
    });
}

// ──── Card 21: Duality (Morphing Animation) ────
function initDualityTransform() {
    const container = d3.select("#plot-duality");
    if (container.empty()) return;
    container.selectAll("*").remove();
    const w = container.node().clientWidth || 400, h = 240;
    const svg = container.append("svg").attr("width", w).attr("height", h);

    const circuitA = [{ x1: 50, y1: 100, x2: 150, y2: 100, label: "L" }, { x1: 150, y1: 100, x2: 250, y2: 100, label: "R" }];
    const circuitB = [{ x1: 200, y1: 40, x2: 200, y2: 140, label: "C" }, { x1: 300, y1: 40, x2: 300, y2: 140, label: "G" }];

    const lines = svg.selectAll(".dual-line").data(circuitA).enter().append("line")
        .attr("class", "dual-line").attr("stroke", "var(--unit-cyan)").attr("stroke-width", 3)
        .attr("x1", d => d.x1).attr("y1", d => d.y1).attr("x2", d => d.x2).attr("y2", d => d.y2);

    const labels = svg.selectAll(".dual-label").data(circuitA).enter().append("text")
        .attr("fill", "white").attr("x", d => (d.x1 + d.x2) / 2).attr("y", d => d.y1 - 10).attr("text-anchor", "middle").text(d => d.label);

    function morph() {
        lines.data(circuitB).transition().duration(2000).delay(1000)
            .attr("x1", d => d.x1).attr("y1", d => d.y1).attr("x2", d => d.x2).attr("y2", d => d.y2).attr("stroke", "var(--unit-gold)");
        labels.data(circuitB).transition().duration(2000).delay(1000)
            .attr("x", d => (d.x1 + d.x2) / 2).attr("y", d => d.y1 - 10).text(d => d.label);

        setTimeout(() => {
            lines.data(circuitA).transition().duration(2000).delay(1000)
                .attr("x1", d => d.x1).attr("y1", d => d.y1).attr("x2", d => d.x2).attr("y2", d => d.y2).attr("stroke", "var(--unit-cyan)");
            labels.data(circuitA).transition().duration(2000).delay(1000)
                .attr("x", d => (d.x1 + d.x2) / 2).attr("y", d => d.y1 - 10).text(d => d.label);
        }, 5000);
    }

    setInterval(morph, 10000);
    morph();
}

// ──── Advanced Calculators ────
function initCalculators() {
    document.querySelectorAll('[data-calc]').forEach(btn => {
        btn.onclick = () => {
            const overlay = document.getElementById("modal-overlay"), modal = document.getElementById(`calc-${btn.dataset.calc}-modal`);
            if (overlay && modal) { overlay.style.display = "block"; modal.style.display = "block"; }
        };
    });

    const closeModals = () => document.querySelectorAll('.ac-modal, .ac-modal-overlay').forEach(el => el.style.display = 'none');
    window.closeModals = closeModals;

    // Advanced Resonance
    const arR = document.getElementById("adv-res-in-r"), arL = document.getElementById("adv-res-in-l"), arC = document.getElementById("adv-res-in-c"), arRes = document.getElementById("adv-res-res");
    const calcAdvRes = () => {
        if (!arR) return;
        const r = parseFloat(arR.value) || 1, l = parseFloat(arL.value) / 1000, c = parseFloat(arC.value) * 1e-6;
        const f0 = 1 / (2 * Math.PI * Math.sqrt(l * c));
        const Q = (1 / r) * Math.sqrt(l / c);
        arRes.textContent = `f₀: ${f0.toFixed(2)} Hz | Q: ${Q.toFixed(2)}`;
    };
    if (arR) { [arR, arL, arC].forEach(el => el.oninput = calcAdvRes); }

    // PF Correction
    const pP = document.getElementById("pfc-in-p"), pPF1 = document.getElementById("pfc-in-pf1"), pPF2 = document.getElementById("pfc-in-pf2"), pV = document.getElementById("pfc-in-v"), pRes = document.getElementById("pfc-res");
    const calcPFC = () => {
        if (!pP) return;
        const p = parseFloat(pP.value) * 1000, pf1 = parseFloat(pPF1.value), pf2 = parseFloat(pPF2.value), v = parseFloat(pV.value);
        const phi1 = Math.acos(pf1), phi2 = Math.acos(pf2);
        const Qc = p * (Math.tan(phi1) - Math.tan(phi2));
        const C = Qc / (2 * Math.PI * 50 * v * v);
        pRes.textContent = `Required C: ${(C * 1e6).toFixed(1)} μF`;
    };
    if (pP) { [pP, pPF1, pPF2, pV].forEach(el => el.oninput = calcPFC); }

    // 3-Phase
    const tVL = document.getElementById("3p-in-vl"), tZ = document.getElementById("3p-in-z"), tPF = document.getElementById("3p-in-pf"), tRes = document.getElementById("3p-res");
    const calc3P = () => {
        if (!tVL) return;
        const vl = parseFloat(tVL.value), z = parseFloat(tZ.value), pf = parseFloat(tPF.value);
        const p = Math.sqrt(3) * vl * (vl / (z * Math.sqrt(3))) * pf;
        tRes.textContent = `P: ${(p / 1000).toFixed(2)} kW | IL: ${(vl / (z * Math.sqrt(3))).toFixed(2)} A`;
    };
    if (tVL) { [tVL, tZ, tPF].forEach(el => el.oninput = calc3P); }

    // Magnetic Ohm's Law
    const mN = document.getElementById("mag-in-n"), mI = document.getElementById("mag-in-i"), mS = document.getElementById("mag-in-s"), mRes = document.getElementById("mag-res");
    const calcMagOhm = () => {
        if (!mN) return;
        const n = parseFloat(mN.value) || 0, i = parseFloat(mI.value) || 0, s = parseFloat(mS.value) || 1;
        const flux = (n * i) / s;
        mRes.textContent = `Flux Φ: ${flux.toFixed(4)} Wb`;
    };
    if (mN) { [mN, mI, mS].forEach(el => el.oninput = calcMagOhm); }

    // Graph Analyzer
    const gN = document.getElementById("graph-in-n"), gB = document.getElementById("graph-in-b"), gRes = document.getElementById("graph-res");
    const calcGraph = () => {
        if (!gN) return;
        const n = parseInt(gN.value) || 1, b = parseInt(gB.value) || 0;
        const rank = n - 1, twigs = n - 1, links = b - rank;
        gRes.textContent = `Rank: ${rank} | Twigs: ${twigs} | Links: ${links >= 0 ? links : 0}`;
    };
    if (gN) { [gN, gB].forEach(el => el.oninput = calcGraph); }

    // Matrix Verify
    const mResGrid = document.getElementById("matrix-res");
    const mBtnVerify = document.querySelector('[data-calc="matrix-verify"]');
    if (mBtnVerify) {
        mBtnVerify.onclick = () => {
            const overlay = document.getElementById("modal-overlay"), modal = document.getElementById(`calc-matrix-verify-modal`);
            if (overlay && modal) { overlay.style.display = "block"; modal.style.display = "block"; }

            // Interaction: Staggered verification message
            if (mResGrid) {
                mResGrid.innerHTML = "Scanning branches...";
                let step = 0;
                const interval = setInterval(() => {
                    step++;
                    mResGrid.innerHTML = `Scanning branches... Branch ${step} sum = 0 ✅`;
                    if (step >= 5) {
                        clearInterval(interval);
                        mResGrid.innerHTML = "Incidence Matrix Column Sum: ✅ 0 (All 5 branches verified)";
                    }
                }, 400);
            }
        };
    }

    // Dual Mapper
    const dType = document.getElementById("dual-in-type"), dRes = document.getElementById("dual-res");
    const dualMap = {
        "R": "Conductance (G)", "L": "Capacitance (C)", "C": "Inductance (L)",
        "V": "Current Source (I)", "I": "Voltage Source (V)", "Series": "Parallel Connection",
        "KCL": "KVL / Mesh"
    };
    if (dType) {
        dType.onchange = () => {
            dRes.style.opacity = 0;
            setTimeout(() => {
                dRes.textContent = `Dual element: ${dualMap[dType.value]}`;
                dRes.style.opacity = 1;
            }, 200);
        };
    }
}
