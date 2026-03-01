document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 50
        });
    }

    // 2. Setup GSAP ScrollTrigger if available
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }

                // Update active class
                document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // --- UNIT 1: MICROPROCESSOR BASICS ---
    initTimeline();
    init8085Architecture();
    initALU();
    initRegisters8085();
    initInterrupts8085();
    initPins8085();
    initTimingDiagram();

    // --- UNIT 2: MICROPROCESSOR PROGRAMMING ---
    initAddressingModes();
    initProgramSimulator();

    // --- UNIT 3: MICROPROCESSOR APPLICATIONS ---
    initDACSimulator();
    initOscilloscope();
    initMotorPWM();
    // --- UNIT 4: MICROCONTROLLER BASICS (8051) ---
    init8051Architecture();

    // --- UNIT 5: 8051 INSTRUCTIONS ---
    initIndexedAddressing();

    // --- UNIT 6: INTERRUPTS & TIMERS ---
    initTimerCalculator();

    // --- UNIT 7: MICROCONTROLLER APPLICATIONS ---
    initMotorPWM8051();

    // Additional module init functions can be called here as they are built
});

// --- Unit 1 Implementations ---

function initTimeline() {
    const ctx = document.getElementById('moores-law-chart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1971', '1974', '1978', '1982', '1989', '1993', '1997', '2000', '2006', '2010', '2015', '2020'],
            datasets: [{
                label: 'Transistor Count',
                data: [2300, 4500, 29000, 134000, 1180000, 3100000, 7500000, 42000000, 291000000, 1170000000, 3200000000, 11800000000],
                borderColor: '#00f5ff',
                backgroundColor: 'rgba(0, 245, 255, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#00ff88',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'logarithmic',
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                }
            },
            plugins: {
                legend: { labels: { color: '#e2e8f0' } },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: '#00f5ff',
                    bodyColor: '#e2e8f0',
                    borderColor: '#00f5ff',
                    borderWidth: 1
                }
            }
        }
    });
}

function init8085Architecture() {
    const container = d3.select("#arch-8085-svg-container");
    if (container.empty()) return;

    const width = container.node().getBoundingClientRect().width || 400;
    const height = 350;

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("width", "100%")
        .style("height", "100%");

    // Gradient defs
    const defs = svg.append("defs");
    const createGradient = (id, color1, color2) => {
        const grad = defs.append("linearGradient")
            .attr("id", id)
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "0%").attr("y2", "100%");
        grad.append("stop").attr("offset", "0%").style("stop-color", color1).style("stop-opacity", 0.9);
        grad.append("stop").attr("offset", "100%").style("stop-color", color2).style("stop-opacity", 0.7);
    };

    createGradient("alu-grad", "#00f5ff", "#0055ff");
    createGradient("reg-grad", "#00ff88", "#008f44");
    createGradient("ctrl-grad", "#f97316", "#8c3a00");

    const blocks = [
        { id: "ALU", x: width * 0.1, y: 50, w: width * 0.35, h: 80, text: "ALU (8-bit)", fill: "url(#alu-grad)", desc: "Performs Arithmetic & Logic operations. Uses A & Temp registers." },
        { id: "ACC", x: width * 0.1, y: 150, w: width * 0.15, h: 60, text: "A", fill: "rgba(0,245,255,0.2)", stroke: "#00f5ff", desc: "Accumulator (8-bit): Primary register for ALU results." },
        { id: "TMP", x: width * 0.3, y: 150, w: width * 0.15, h: 60, text: "Temp", fill: "rgba(0,245,255,0.2)", stroke: "#00f5ff", desc: "Temporary Register: Feeds second operand to ALU." },
        { id: "FLAGS", x: width * 0.1, y: 230, w: width * 0.35, h: 40, text: "Flags (S,Z,AC,P,CY)", fill: "rgba(0,245,255,0.1)", stroke: "#00f5ff", desc: "Flag Register: Stores ALU status (5 active bits)." },
        { id: "REGS", x: width * 0.55, y: 50, w: width * 0.35, h: 140, text: "B, C, D, E, H, L", fill: "url(#reg-grad)", desc: "General Purpose Registers (8-bit). Can form 16-bit pairs (BC, DE, HL)." },
        { id: "SPPC", x: width * 0.55, y: 200, w: width * 0.35, h: 70, text: "SP / PC (16-bit)", fill: "url(#reg-grad)", desc: "Stack Pointer & Program Counter: 16-bit address registers." },
        { id: "CTRL", x: width * 0.1, y: 290, w: width * 0.8, h: 40, text: "Timing & Control Unit", fill: "url(#ctrl-grad)", desc: "Generates control signals (RD, WR, ALE, etc.) for all operations." }
    ];

    const descBox = document.getElementById("arch-8085-desc");

    // Draw lines
    svg.append("line").attr("x1", width * 0.45).attr("y1", 90).attr("x2", width * 0.55).attr("y2", 90).attr("stroke", "#e2e8f0").attr("stroke-width", 3).attr("marker-end", "url(#arrow)");
    svg.append("line").attr("x1", width * 0.45).attr("y1", 120).attr("x2", width * 0.55).attr("y2", 120).attr("stroke", "#e2e8f0").attr("stroke-width", 3).attr("marker-start", "url(#arrow-start)");

    // Draw internal data bus connecting everything
    svg.append("path")
        .attr("d", `M ${width * 0.5} 30 L ${width * 0.5} 280`)
        .attr("stroke", "#e2e8f0")
        .attr("stroke-width", 6)
        .attr("fill", "none");

    const gBlocks = svg.selectAll(".arch-block")
        .data(blocks)
        .enter()
        .append("g")
        .attr("class", "arch-block")
        .style("cursor", "pointer")
        .on("mouseover", function (e, d) {
            d3.select(this).select("rect").style("filter", "drop-shadow(0 0 10px rgba(255,255,255,0.5))");
            if (descBox) descBox.innerHTML = `<strong>${d.text}</strong>: ${d.desc}`;
        })
        .on("mouseout", function () {
            d3.select(this).select("rect").style("filter", "none");
            if (descBox) descBox.innerHTML = "Hover over an architectural block to see details.";
        });

    gBlocks.append("rect")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("width", d => d.w)
        .attr("height", d => d.h)
        .attr("rx", 6)
        .style("fill", d => d.fill)
        .style("stroke", d => d.stroke || "#fff")
        .style("stroke-width", 2);

    gBlocks.append("text")
        .attr("x", d => d.x + d.w / 2)
        .attr("y", d => d.y + d.h / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#fff")
        .style("font-family", "Orbitron")
        .style("font-size", d => d.h < 50 ? "0.8rem" : "1rem")
        .text(d => d.text);
}

function initALU() {
    // Add interactivity to ALU flags later if needed
}

function initRegisters8085() {
    const svg = d3.select("#reg-map-svg");
    if (svg.empty()) return;

    const defs = svg.append("defs");
    const regGrad = defs.append("linearGradient").attr("id", "reg-box").attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    regGrad.append("stop").attr("offset", "0%").style("stop-color", "#0f172a");
    regGrad.append("stop").attr("offset", "100%").style("stop-color", "#1e293b");

    const w = 140, h = 35, gap = 10, startX = 5, startY = 10;

    const regs = [
        { id: "A", x: startX, y: startY, w: w, text: "Accumulator (A)", role: "8-bit", color: "#00f5ff" },
        { id: "F", x: startX + w + gap, y: startY, w: w, text: "Flag Reg (F)", role: "8-bit", color: "#00f5ff" },
        { id: "B", x: startX, y: startY + h + gap, w: w, text: "Register B", role: "8-bit", color: "#00ff88" },
        { id: "C", x: startX + w + gap, y: startY + h + gap, w: w, text: "Register C", role: "8-bit", color: "#00ff88" },
        { id: "D", x: startX, y: startY + (h + gap) * 2, w: w, text: "Register D", role: "8-bit", color: "#00ff88" },
        { id: "E", x: startX + w + gap, y: startY + (h + gap) * 2, w: w, text: "Register E", role: "8-bit", color: "#00ff88" },
        { id: "H", x: startX, y: startY + (h + gap) * 3, w: w, text: "Register H", role: "8-bit", color: "#00ff88" },
        { id: "L", x: startX + w + gap, y: startY + (h + gap) * 3, w: w, text: "Register L", role: "8-bit", color: "#00ff88" },
        { id: "SP", x: startX, y: startY + (h + gap) * 4, w: w * 2 + gap, text: "Stack Pointer (SP)", role: "16-bit", color: "#facc15" },
        { id: "PC", x: startX, y: startY + (h + gap) * 5, w: w * 2 + gap, text: "Program Counter (PC)", role: "16-bit", color: "#facc15" }
    ];

    const descBox = document.getElementById("reg-desc");

    const boxes = svg.selectAll(".reg-box").data(regs).enter().append("g")
        .attr("class", "reg-box")
        .style("cursor", "pointer")
        .on("mouseover", function (e, d) {
            d3.select(this).select("rect").style("fill", "rgba(0, 245, 255, 0.2)").style("stroke", d.color);
            if (descBox) descBox.innerHTML = `<strong>${d.text}</strong> (${d.role})<br>${getRegDesc(d.id)}`;
        })
        .on("mouseout", function (e, d) {
            d3.select(this).select("rect").style("fill", "url(#reg-box)").style("stroke", "#475569");
            if (descBox) descBox.innerHTML = "Hover over a register.";
        });

    boxes.append("rect")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("width", d => d.w)
        .attr("height", h)
        .attr("rx", 4)
        .style("fill", "url(#reg-box)")
        .style("stroke", "#475569")
        .style("stroke-width", 1.5);

    boxes.append("text")
        .attr("x", d => d.x + d.w / 2)
        .attr("y", d => d.y + h / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", d => d.color)
        .style("font-family", "Orbitron")
        .style("font-size", "0.85rem")
        .text(d => d.text);
}

function getRegDesc(id) {
    switch (id) {
        case "A": return "Holds one operand and stores result of ALU operations.";
        case "F": return "Stores status flags (S, Z, AC, P, CY) modified by ALU.";
        case "B": case "C": case "D": case "E": return "General purpose data register.";
        case "H": case "L": return "Can hold data, but HL pair natively holds memory addresses (M).";
        case "SP": return "Stores memory address of the Top of Stack.";
        case "PC": return "Stores memory address of the NEXT instruction to fetch.";
        default: return "";
    }
}
function initPins8085() {
    const svg = d3.select("#pin-8085-svg");
    if (svg.empty()) return;

    const w = 400, h = 350;
    const cw = 120, ch = 300; // Chip width and height
    const cx = (w - cw) / 2;
    const cy = (h - ch) / 2;

    // Explicitly set width to 100% to guarantee visibility inside the flex box
    svg.attr("width", "100%").attr("height", "100%");

    // Draw Chip Body
    svg.append("rect")
        .attr("x", cx).attr("y", cy)
        .attr("width", cw).attr("height", ch)
        .attr("rx", 5)
        .style("fill", "#111827")
        .style("stroke", "#475569")
        .style("stroke-width", 2);

    // Notch
    svg.append("path")
        .attr("d", `M ${cx + cw / 2 - 15} ${cy} A 15 15 0 0 0 ${cx + cw / 2 + 15} ${cy}`)
        .style("fill", "#0a0e1a")
        .style("stroke", "#475569")
        .style("stroke-width", 2);

    // Chip Label
    svg.append("text").attr("x", cx + cw / 2).attr("y", cy + ch / 2).attr("text-anchor", "middle").attr("fill", "#334155").style("font-family", "Orbitron").style("font-size", "1.5rem").style("font-weight", "bold").text("8085");

    const pinsLeft = [
        "X1", "X2", "RESET OUT", "SOD", "SID", "TRAP", "RST 7.5", "RST 6.5", "RST 5.5", "INTR",
        "INTA", "AD0", "AD1", "AD2", "AD3", "AD4", "AD5", "AD6", "AD7", "VSS (GND)"
    ];
    const pinsRight = [
        "VCC (+5V)", "HOLD", "HLDA", "CLK OUT", "RESET IN", "READY", "IO/M", "S1", "RD", "WR",
        "ALE", "S0", "A15", "A14", "A13", "A12", "A11", "A10", "A9", "A8"
    ];

    const pinH = ch / 21;
    const descBox = document.getElementById("pin-desc");

    const drawPins = (side, pinsList) => {
        const isLeft = side === "L";
        const px = isLeft ? cx - 20 : cx + cw;
        const tx = isLeft ? cx - 25 : cx + cw + 25;
        const inx = isLeft ? cx + 5 : cx + cw - 5;

        pinsList.forEach((pin, i) => {
            const py = cy + pinH * (i + 1);

            // Pin Leg
            svg.append("line")
                .attr("x1", px).attr("y1", py)
                .attr("x2", px + 20).attr("y2", py)
                .attr("stroke", "#facc15")
                .attr("stroke-width", 3);

            // Hitbox
            svg.append("rect")
                .attr("x", isLeft ? px - 40 : px).attr("y", py - pinH / 2)
                .attr("width", 60).attr("height", pinH)
                .style("fill", "transparent")
                .style("cursor", "pointer")
                .on("mouseover", function () {
                    d3.select(this.parentNode).select(`.pin-text-${side}-${i}`).style("fill", "#00f5ff").style("font-weight", "bold");
                    if (descBox) descBox.innerHTML = `<strong>Pin ${isLeft ? i + 1 : 40 - i}: ${pin}</strong><br>${getPinDesc(pin)}`;
                })
                .on("mouseout", function () {
                    d3.select(this.parentNode).select(`.pin-text-${side}-${i}`).style("fill", "#94a3b8").style("font-weight", "normal");
                    if (descBox) descBox.innerHTML = "Hover over a pin to view its function.";
                });

            // Outer Text (Actual Pin Names)
            svg.append("text")
                .attr("class", `pin-text-${side}-${i}`)
                .attr("x", tx).attr("y", py)
                .attr("text-anchor", isLeft ? "end" : "start")
                .attr("dominant-baseline", "middle")
                .attr("fill", "#94a3b8")
                .style("font-family", "Fira Code")
                .style("font-size", "0.6rem")
                .text(pin);

            // Inner Number
            svg.append("text")
                .attr("x", inx).attr("y", py)
                .attr("text-anchor", isLeft ? "start" : "end")
                .attr("dominant-baseline", "middle")
                .attr("fill", "#475569")
                .style("font-size", "0.5rem")
                .text(isLeft ? i + 1 : 40 - i);
        });
    };

    drawPins("L", pinsLeft);
    drawPins("R", pinsRight);
}

function getPinDesc(pin) {
    if (pin.startsWith("AD")) return "Multiplexed Address/Data Bus. Lower 8 bits of memory address, or 8 bits of data.";
    if (pin.startsWith("A") && !pin.startsWith("ALE")) return "Higher order Address Bus (A8-A15). Unidirectional.";
    if (pin.startsWith("RST") || pin === "TRAP" || pin === "INTR") return "Hardware Interrupt request lines.";
    switch (pin.replace(/[^a-zA-Z0-9/ ]/g, "").trim()) {
        case "X1": case "X2": return "Crystal oscillator connections.";
        case "RESET OUT": return "Indicates MPU is being reset. Used to reset peripheral devices.";
        case "SOD": return "Serial Output Data line.";
        case "SID": return "Serial Input Data line.";
        case "INTA": return "Interrupt Acknowledge (Active Low).";
        case "VSS GND": return "Ground reference.";
        case "VCC 5V": return "+5V Power Supply.";
        case "HOLD": return "Used by DMA controller to request control of the buses.";
        case "HLDA": return "Hold Acknowledge: MPU tells DMA it has relinquished the buses.";
        case "CLK OUT": return "System clock output for peripherals.";
        case "RESET IN": return "Active Low. Resets the MPU (clears PC, disables buses).";
        case "READY": return "Used to synchronize slower peripherals with the MPU.";
        case "IOM": return "Status signal: High = I/O operation, Low = Memory operation.";
        case "S1": case "S0": return "Status signals determining the type of machine cycle.";
        case "RD": return "Read control signal (Active Low).";
        case "WR": return "Write control signal (Active Low).";
        case "ALE": return "Address Latch Enable. High indicates address on AD0-AD7.";
        default: return "";
    }
}

function initTimingDiagram() {
    const svg = d3.select("#timing-svg");
    if (svg.empty()) return;

    const w = 400, h = 150;

    // Grid lines for T-states
    for (let i = 0; i <= 4; i++) {
        const x = 50 + i * 80;
        svg.append("line").attr("x1", x).attr("y1", 10).attr("x2", x).attr("y2", h - 20).attr("stroke", "#334155").attr("stroke-dasharray", "4,4");
        if (i < 4) svg.append("text").attr("x", x + 40).attr("y", 10).attr("text-anchor", "middle").attr("fill", "#94a3b8").style("font-size", "0.7rem").text(`T${i + 1}`);
    }

    // CLK Signal
    const drawSignal = (y, pts, color, label) => {
        svg.append("text").attr("x", 40).attr("y", y).attr("text-anchor", "end").attr("dominant-baseline", "middle").attr("fill", "#e2e8f0").style("font-family", "Orbitron").style("font-size", "0.7rem").text(label);

        let pathStr = `M 50 ${y - pts[0]}`;
        let curX = 50;
        for (let i = 1; i < pts.length; i++) {
            curX += 80 / (pts.length / 4); // spread across 4 T-states
            pathStr += ` L ${curX} ${y - pts[i - 1]} L ${curX} ${y - pts[i]}`;
        }
        svg.append("path").attr("d", pathStr).attr("stroke", color).attr("stroke-width", 2).attr("fill", "none");
    };

    // 0=Low, 15=High
    // CLK
    drawSignal(35, [0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0], "#00ff88", "CLK");

    // ALE
    drawSignal(60, [0, 15, 15, 0, 0, 0, 0, 0, 0], "#00f5ff", "ALE");

    // A8-A15 (Hexagon like representation for valid data)
    const y_addr = 90;
    svg.append("text").attr("x", 40).attr("y", y_addr).attr("text-anchor", "end").attr("dominant-baseline", "middle").attr("fill", "#e2e8f0").style("font-family", "Orbitron").style("font-size", "0.7rem").text("A8-A15");
    svg.append("path").attr("d", `M 50 ${y_addr} L 60 ${y_addr - 10} L 280 ${y_addr - 10} L 290 ${y_addr} L 280 ${y_addr + 10} L 60 ${y_addr + 10} Z`).attr("stroke", "#facc15").attr("fill", "rgba(250,204,21,0.2)");
    svg.append("text").attr("x", 170).attr("y", y_addr + 3).attr("text-anchor", "middle").attr("fill", "#facc15").style("font-size", "0.7rem").text("High Order Memory Address");

    // AD0-AD7
    const y_ad = 130;
    svg.append("text").attr("x", 40).attr("y", y_ad).attr("text-anchor", "end").attr("dominant-baseline", "middle").attr("fill", "#e2e8f0").style("font-family", "Orbitron").style("font-size", "0.7rem").text("AD0-AD7");

    // Address part
    svg.append("path").attr("d", `M 50 ${y_ad} L 60 ${y_ad - 10} L 120 ${y_ad - 10} L 130 ${y_ad} L 120 ${y_ad + 10} L 60 ${y_ad + 10} Z`).attr("stroke", "#f97316").attr("fill", "rgba(249,115,22,0.2)");
    svg.append("text").attr("x", 90).attr("y", y_ad + 3).attr("text-anchor", "middle").attr("fill", "#f97316").style("font-size", "0.6rem").text("Low Addr");

    // Data part
    svg.append("path").attr("d", `M 170 ${y_ad} L 180 ${y_ad - 10} L 280 ${y_ad - 10} L 290 ${y_ad} L 280 ${y_ad + 10} L 180 ${y_ad + 10} Z`).attr("stroke", "#a78bfa").attr("fill", "rgba(167,139,250,0.2)");
    svg.append("text").attr("x", 230).attr("y", y_ad + 3).attr("text-anchor", "middle").attr("fill", "#a78bfa").style("font-size", "0.6rem").text("Opcode Data");
}

// --- Unit 2 Implementations ---

function initAddressingModes() {
    const svg = d3.select("#addr-mode-svg");
    if (svg.empty()) return;

    const descBox = document.getElementById("addr-desc-box");
    const tabs = document.querySelectorAll(".addr-tab");

    const w = 500, h = 250;

    // Defs for arrows and gradients
    const defs = svg.append("defs");
    defs.append("marker").attr("id", "addr-arrow").attr("viewBox", "0 0 10 10").attr("refX", "10").attr("refY", "5").attr("markerWidth", "6").attr("markerHeight", "6").attr("orient", "auto-start-reverse").append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", "#00f5ff");

    // Reusable drawing functions
    const drawBlock = (x, y, w, h, text, color, id) => {
        const g = svg.append("g").attr("class", `addr-elem ${id}`);
        g.append("rect").attr("x", x).attr("y", y).attr("width", w).attr("height", h).attr("rx", 4).attr("fill", "rgba(0,0,0,0.5)").attr("stroke", color).attr("stroke-width", 2);
        g.append("text").attr("x", x + w / 2).attr("y", y + h / 2).attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("fill", "#e2e8f0").style("font-family", "Orbitron").style("font-size", "0.9rem").text(text);
        return g;
    };

    const drawLine = (x1, y1, x2, y2) => {
        svg.append("line").attr("class", "addr-elem").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2).attr("stroke", "#00f5ff").attr("stroke-width", 2).attr("marker-end", "url(#addr-arrow)");
    };

    const renderMode = (mode) => {
        svg.selectAll(".addr-elem").remove(); // Clear previous

        if (mode === 'imm') {
            descBox.innerHTML = "<strong>Immediate Addressing:</strong> The operand is specified within the instruction itself. Ex: <code>MVI A, 45H</code> (Move 45H immediately to A).";
            drawBlock(50, 100, 150, 50, "Instruction: Opcode", "#facc15", "inst");
            drawBlock(200, 100, 100, 50, "Data: 45H", "#00ff88", "data");
            drawBlock(380, 100, 80, 50, "Reg A", "#00f5ff", "regA");
            drawLine(300, 125, 380, 125);
            svg.append("text").attr("class", "addr-elem").attr("x", 340).attr("y", 115).attr("text-anchor", "middle").style("fill", "#94a3b8").style("font-size", "0.8rem").text("Loads");
        } else if (mode === 'reg') {
            descBox.innerHTML = "<strong>Register Addressing:</strong> The operand is in a general-purpose register. Ex: <code>MOV A, B</code> (Copy content of Reg B to Reg A).";
            drawBlock(50, 100, 180, 50, "Instruction: MOV A, B", "#facc15", "inst");
            drawBlock(280, 50, 80, 50, "Reg B", "#00ff88", "regB");
            drawBlock(280, 150, 80, 50, "Reg A", "#00f5ff", "regA");

            svg.append("path").attr("class", "addr-elem").attr("d", "M 280 75 Q 240 112 280 175").attr("fill", "none").attr("stroke", "#00f5ff").attr("stroke-width", 2).attr("marker-end", "url(#addr-arrow)");
            svg.append("text").attr("class", "addr-elem").attr("x", 245).attr("y", 125).attr("text-anchor", "middle").style("fill", "#94a3b8").style("font-size", "0.8rem").text("Copy");
        } else if (mode === 'dir') {
            descBox.innerHTML = "<strong>Direct Addressing:</strong> The 16-bit memory address of the operand is given in the instruction. Ex: <code>LDA 2050H</code> (Load Accumulator with data at memory 2050H).";
            drawBlock(20, 100, 180, 50, "Instr: LDA 2050H", "#facc15", "inst");
            drawBlock(250, 50, 120, 150, "Memory", "#475569", "memBox");
            svg.append("text").attr("class", "addr-elem").attr("x", 310).attr("y", 70).attr("text-anchor", "middle").style("fill", "#94a3b8").text("...").style("font-family", "Fira Code");
            drawBlock(260, 100, 100, 30, "[2050H] Data", "#00ff88", "memData");
            svg.append("text").attr("class", "addr-elem").attr("x", 310).attr("y", 160).attr("text-anchor", "middle").style("fill", "#94a3b8").text("...").style("font-family", "Fira Code");
            drawBlock(400, 100, 80, 50, "Reg A", "#00f5ff", "regA");

            drawLine(200, 125, 260, 125);
            drawLine(360, 115, 400, 115);
        } else if (mode === 'indir') {
            descBox.innerHTML = "<strong>Indirect Addressing:</strong> The memory address is held in a register pair (usually HL). Ex: <code>MOV A, M</code> (Move data from Memory pointed to by HL into A).";
            drawBlock(20, 100, 140, 50, "Instr: MOV A, M", "#facc15", "inst");
            drawBlock(180, 100, 80, 50, "HL Pair", "#f97316", "regHL");
            svg.append("text").attr("class", "addr-elem").attr("x", 220).attr("y", 135).attr("text-anchor", "middle").style("fill", "#e2e8f0").style("font-size", "0.7rem").text("(Address)");

            drawBlock(290, 50, 100, 150, "Memory", "#475569", "memBox");
            drawBlock(300, 110, 80, 30, "M (Data)", "#00ff88", "memData");

            drawBlock(410, 100, 80, 50, "Reg A", "#00f5ff", "regA");

            drawLine(160, 125, 180, 125);
            drawLine(260, 125, 300, 125); // HL to Mem
            drawLine(380, 125, 410, 125); // Mem to Reg A
        } else if (mode === 'impl') {
            descBox.innerHTML = "<strong>Implicit/Implied Addressing:</strong> The operand is hidden in the opcode itself (usually the Accumulator). Ex: <code>CMA</code> (Complement Accumulator).";
            drawBlock(100, 100, 140, 50, "Instr: CMA", "#facc15", "inst");
            drawBlock(280, 100, 120, 50, "Reg A (In/Out)", "#00f5ff", "regA");

            svg.append("path").attr("class", "addr-elem").attr("d", "M 240 115 C 260 90, 270 90, 280 115").attr("fill", "none").attr("stroke", "#00f5ff").attr("stroke-width", 2).attr("marker-end", "url(#addr-arrow)");
            svg.append("path").attr("class", "addr-elem").attr("d", "M 280 135 C 270 160, 260 160, 240 135").attr("fill", "none").attr("stroke", "#00ff88").attr("stroke-width", 2).attr("marker-end", "url(#addr-arrow)");
        }
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => {
                t.classList.remove('active');
                t.style.background = "var(--bg-main)";
            });
            e.target.classList.add('active');
            e.target.style.background = "rgba(0,255,136,0.2)";
            renderMode(e.target.dataset.mode);
        });
    });

    renderMode('imm'); // initial
}

function initProgramSimulator() {
    const btnStep = document.getElementById("sim-step");
    const btnReset = document.getElementById("sim-reset");
    const pointer = document.getElementById("sim-pointer");
    const lines = document.querySelectorAll(".sim-line");

    if (!btnStep) return;

    // Registers
    let regA = 0;
    let regB = 0;
    let mem2050 = 0;
    let flags = { Z: 0, CY: 0 };
    let currentLine = 0;

    const updateUI = () => {
        document.getElementById("sim-reg-a").innerText = regA.toString(16).padStart(2, '0').toUpperCase() + 'H';
        document.getElementById("sim-reg-b").innerText = regB.toString(16).padStart(2, '0').toUpperCase() + 'H';
        document.getElementById("sim-mem").innerText = mem2050.toString(16).padStart(2, '0').toUpperCase() + 'H';
        document.getElementById("sim-flags").innerText = `Z=${flags.Z}, CY=${flags.CY}`;

        pointer.style.top = `${currentLine * 1.6 + 1}rem`;

        lines.forEach(l => l.style.backgroundColor = "transparent");
        if (currentLine < lines.length) {
            lines[currentLine].style.backgroundColor = "rgba(0, 255, 136, 0.1)";
        }
    };

    btnStep.addEventListener("click", () => {
        if (currentLine >= lines.length) return; // Done

        switch (currentLine) {
            case 0: // MVI A, 05H
                regA = 0x05;
                break;
            case 1: // MVI B, 03H
                regB = 0x03;
                break;
            case 2: // ADD B
                let res = regA + regB;
                flags.CY = (res > 0xFF) ? 1 : 0;
                regA = res & 0xFF;
                flags.Z = (regA === 0) ? 1 : 0;
                break;
            case 3: // STA 2050H
                mem2050 = regA;
                break;
            case 4: // HLT
                // Do nothing
                break;
        }
        currentLine++;
        updateUI();
        if (currentLine >= lines.length) {
            btnStep.disabled = true;
            btnStep.style.opacity = "0.5";
        }
    });

    btnReset.addEventListener("click", () => {
        regA = 0;
        regB = 0;
        mem2050 = 0;
        flags = { Z: 0, CY: 0 };
        currentLine = 0;
        btnStep.disabled = false;
        btnStep.style.opacity = "1";
        updateUI();
    });

    updateUI();
}

// --- Unit 3 Implementations ---

function initDACSimulator() {
    const bits = document.querySelectorAll(".bit-btn");
    const hexVal = document.getElementById("dac-hex-val");
    const voltVal = document.getElementById("dac-volt-val");
    if (!hexVal || !voltVal) return;

    let currentValue = 0; // 0 to 255

    const updateDAC = () => {
        hexVal.innerText = currentValue.toString(16).padStart(2, '0').toUpperCase();
        let voltage = 5.0 * (currentValue / 256.0);
        voltVal.innerText = voltage.toFixed(2);
    };

    bits.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bitPos = parseInt(btn.dataset.bit);
            const isOn = btn.classList.contains('active-bit');

            if (isOn) {
                btn.classList.remove('active-bit');
                btn.style.background = "transparent";
                btn.style.color = "#e2e8f0";
                btn.style.border = "1px solid #475569";
                btn.innerHTML = `D${bitPos}<br>0`;
                currentValue &= ~(1 << bitPos); // clear bit
            } else {
                btn.classList.add('active-bit');
                btn.style.background = "rgba(249, 115, 22, 0.2)";
                btn.style.color = "#f97316";
                btn.style.border = "1px solid #f97316";
                btn.innerHTML = `D${bitPos}<br>1`;
                currentValue |= (1 << bitPos); // set bit
            }
            updateDAC();
        });
        // Initial styling
        btn.style.background = "transparent";
        btn.style.color = "#e2e8f0";
        btn.style.border = "1px solid #475569";
        btn.style.padding = "5px";
        btn.style.borderRadius = "4px";
        btn.style.cursor = "pointer";
        btn.style.flex = "1";
        btn.style.textAlign = "center";
        btn.style.fontFamily = "Fira Code";
    });

    updateDAC();
}

function initOscilloscope() {
    const svg = d3.select("#oscilloscope-svg");
    const select = document.getElementById("wave-type");
    if (svg.empty() || !select) return;

    let width = 300;
    let height = 120;
    const midY = height / 2;

    // Grid
    const gGrid = svg.append("g").attr("class", "grid");
    for (let i = 0; i < width; i += 20) gGrid.append("line").attr("x1", i).attr("y1", 0).attr("x2", i).attr("y2", height).attr("stroke", "#1e293b").attr("stroke-width", 1);
    for (let i = 0; i < height; i += 20) gGrid.append("line").attr("x1", 0).attr("y1", i).attr("x2", width).attr("y2", i).attr("stroke", "#1e293b").attr("stroke-width", 1);
    gGrid.append("line").attr("x1", 0).attr("y1", midY).attr("x2", width).attr("y2", midY).attr("stroke", "#475569").attr("stroke-width", 1.5);

    const path = svg.append("path").attr("fill", "none").attr("stroke", "#00ff88").attr("stroke-width", 2);

    const drawWave = (type) => {
        let d = "M 0 " + midY;
        const pts = [];
        const freq = 4; // cycles across screen
        const amp = 40;

        for (let x = 0; x <= width; x += 2) {
            let t = (x / width) * freq; // normalized time 0 to freq
            let y = 0;
            let cyclePos = t % 1; // 0 to 1 part of current cycle

            switch (type) {
                case 'square':
                    y = cyclePos < 0.5 ? amp : -amp;
                    // Add vertical lines for strict square wave look
                    if (x > 0) {
                        let prevCyclePos = ((x - 2) / width * freq) % 1;
                        if ((prevCyclePos < 0.5 && cyclePos >= 0.5) || (prevCyclePos > 0.5 && cyclePos < 0.5)) {
                            // Instant drop/rise logic is tricky to just draw continuously with step, easiest method:
                        }
                    }
                    break;
                case 'sine':
                    y = Math.sin(t * Math.PI * 2) * amp;
                    break;
                case 'tri':
                    if (cyclePos < 0.25) y = cyclePos * 4 * amp;
                    else if (cyclePos < 0.75) y = amp - (cyclePos - 0.25) * 4 * amp;
                    else y = -amp + (cyclePos - 0.75) * 4 * amp;
                    break;
                case 'saw':
                    y = (cyclePos * 2 * amp) - amp;
                    break;
            }
            pts.push(`L ${x} ${midY - y}`);
        }

        // Fix up square wave vertical drops purely with d-string manipulation if needed
        if (type === 'square') {
            let sqD = `M 0 ${midY - amp}`;
            for (let c = 0; c < freq; c++) {
                let wStart = (c / freq) * width;
                let wMid = ((c + 0.5) / freq) * width;
                let wEnd = ((c + 1) / freq) * width;
                sqD += ` L ${wMid} ${midY - amp} L ${wMid} ${midY + amp} L ${wEnd} ${midY + amp}`;
                if (c < freq - 1) sqD += ` L ${wEnd} ${midY - amp}`;
            }
            path.attr("d", sqD);
        } else {
            path.attr("d", `M 0 ${midY - (type === 'tri' ? 0 : type === 'saw' ? -amp : 0)} ` + pts.join(" "));
        }
    };

    select.addEventListener("change", (e) => {
        drawWave(e.target.value);
    });

    drawWave('square');
}

function initMotorPWM() {
    const slider = document.getElementById("pwm-slider");
    const valText = document.getElementById("pwm-val");
    const bar = document.getElementById("pwm-bar");
    const fan = document.getElementById("fan-icon");

    if (!slider || !valText || !bar || !fan) return;

    let rotation = 0;
    let speed = 50; // default value
    let animFrame = null;

    const updateFan = () => {
        rotation += (speed / 100) * 20; // max rotation speed
        fan.style.transform = `rotate(${rotation}deg)`;
        animFrame = requestAnimationFrame(updateFan);
    };

    slider.addEventListener("input", (e) => {
        speed = e.target.value;
        valText.innerText = `${speed}%`;
        bar.style.width = `${speed}%`;

        // Change colors mapping orange (0%) to cyan (100%) through filter or background, here just bar width is visual
    });

    updateFan();
}

// --- Unit 4 Implementations ---

function init8051Architecture() {
    const container = d3.select("#arch-8051-svg-container");
    if (container.empty()) return;

    // Use viewBox to make it responsive
    const svg = container.append("svg")
        .attr("viewBox", "0 0 500 350")
        .attr("width", "100%")
        .attr("height", "100%")
        .style("overflow", "visible");

    // Defs for gradients/arrows
    const defs = svg.append("defs");
    defs.append("marker")
        .attr("id", "bus-arrow")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", "10")
        .attr("refY", "5")
        .attr("markerWidth", "6")
        .attr("markerHeight", "6")
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .attr("fill", "#a78bfa"); // Using Unit 4 accent color

    const w = 500;
    const h = 350;

    // Central Data Bus
    svg.append("rect")
        .attr("x", 150)
        .attr("y", 160)
        .attr("width", 200)
        .attr("height", 20)
        .attr("fill", "rgba(167,139,250,0.3)")
        .attr("stroke", "#a78bfa")
        .attr("stroke-width", 2);

    svg.append("text")
        .attr("x", 250)
        .attr("y", 172)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#e2e8f0")
        .style("font-family", "Orbitron")
        .style("font-size", "0.7rem")
        .text("8-bit Internal Data Bus");

    const blocks = [
        { id: 'cpu', x: 200, y: 70, w: 100, h: 60, text: '8-bit CPU', color: '#facc15', desc: "The core executing instructions. Consists of an 8-bit ALU, Accumulator, and B register." },
        { id: 'rom', x: 40, y: 50, w: 90, h: 60, text: '4KB ROM', color: '#00ff88', desc: "On-chip Program Memory (Flash). Stores the application code. External ROM can be up to 64KB." },
        { id: 'ram', x: 40, y: 130, w: 90, h: 60, text: '128B RAM', color: '#00f5ff', desc: "On-chip Data Memory. Includes Register banks, Bit-addressable space, and General Purpose RAM." },
        { id: 'timer', x: 40, y: 220, w: 90, h: 60, text: 'Timers\n(T0, T1)', color: '#f97316', desc: "Two 16-bit Timer/Counters used for generating delays or counting external events." },
        { id: 'int', x: 200, y: 220, w: 100, h: 60, text: 'Interrupt\nControl', color: '#fb7185', desc: "Handles 5 interrupt sources: 2 external (INT0, INT1), 2 timers, and 1 serial." },
        { id: 'serial', x: 370, y: 60, w: 90, h: 60, text: 'Serial\nPort', color: '#60a5fa', desc: "Full-duplex UART for serial communication (TXD, RXD)." },
        { id: 'ports', x: 370, y: 150, w: 90, h: 100, text: '4 I/O\nPorts', color: '#a78bfa', desc: "Four 8-bit bidirectional I/O ports (P0, P1, P2, P3). P0 and P2 are multiplexed with Address/Data bus." },
    ];

    blocks.forEach(b => {
        const g = svg.append("g")
            .attr("class", `arch-block arch-block-${b.id}`)
            .style("cursor", "pointer");

        g.append("rect")
            .attr("x", b.x)
            .attr("y", b.y)
            .attr("width", b.w)
            .attr("height", b.h)
            .attr("rx", 5)
            .attr("fill", "rgba(0,0,0,0.6)")
            .attr("stroke", b.color)
            .attr("stroke-width", 2)
            .style("transition", "all 0.3s ease");

        // Handle multiline text
        const lines = b.text.split('\n');
        lines.forEach((line, i) => {
            g.append("text")
                .attr("x", b.x + b.w / 2)
                .attr("y", b.y + b.h / 2 + (i === 0 && lines.length > 1 ? -6 : (i === 1 ? 8 : 0)))
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("fill", "#e2e8f0")
                .style("font-family", "Orbitron")
                .style("font-size", "0.75rem")
                .text(line);
        });

        // Hover events
        g.on("mouseenter", function () {
            d3.select(this).select("rect")
                .attr("fill", `${b.color}33`)
                .attr("filter", "drop-shadow(0 0 5px " + b.color + ")");
            document.getElementById("arch-8051-desc").innerHTML = `<strong style="color:${b.color}">${b.text.replace('\n', ' ')}:</strong> ${b.desc}`;
        }).on("mouseleave", function () {
            d3.select(this).select("rect")
                .attr("fill", "rgba(0,0,0,0.6)")
                .attr("filter", null);
            document.getElementById("arch-8051-desc").innerHTML = "Hover over an architectural block to see details.";
        });

        // Draw connections to the bus
        const busY = 170; // Center of the bus
        let lineX1 = b.x + b.w / 2;
        let lineY1 = b.y + (b.y < busY ? b.h : 0);
        let lineY2 = b.y < busY ? 160 : 180;

        // Custom bus connections for layout
        if (b.id === 'rom') { lineY1 = b.y + b.h; lineY2 = 160; lineX1 = b.x + b.w; }
        if (b.id === 'serial') { lineY1 = b.y + b.h; lineY2 = 160; lineX1 = b.x; }
        if (b.id === 'ports') { lineY1 = b.y + b.h / 2; lineY2 = 170; lineX1 = b.x; }

        if (b.id !== 'ports') {
            svg.append("line")
                .attr("x1", lineX1)
                .attr("y1", lineY1)
                .attr("x2", lineX1)
                .attr("y2", lineY2)
                .attr("stroke", "#a78bfa")
                .attr("stroke-width", 2)
                .attr("marker-end", "url(#bus-arrow)")
                .attr("marker-start", "url(#bus-arrow)");
        } else {
            svg.append("line")
                .attr("x1", lineX1)
                .attr("y1", lineY1)
                .attr("x2", 350)
                .attr("y2", lineY1)
                .attr("stroke", "#a78bfa")
                .attr("stroke-width", 2)
                .attr("marker-end", "url(#bus-arrow)")
                .attr("marker-start", "url(#bus-arrow)");
        }
    });
}

// --- Unit 5 Implementations ---

function initIndexedAddressing() {
    const slider = document.getElementById("idx-slider");
    const offsetDisplay = document.getElementById("idx-offset");
    const calcAddr = document.getElementById("idx-calc-addr");
    const romData = document.getElementById("idx-rom-data");

    if (!slider || !offsetDisplay || !calcAddr || !romData) return;

    // Simulated 7-segment display lookup table in ROM starting at 0300H
    const lookUpTable = [
        { val: "3FH", desc: "Digit '0'" },
        { val: "06H", desc: "Digit '1'" },
        { val: "5BH", desc: "Digit '2'" },
        { val: "4FH", desc: "Digit '3'" },
        { val: "66H", desc: "Digit '4'" },
        { val: "6DH", desc: "Digit '5'" },
        { val: "7DH", desc: "Digit '6'" },
        { val: "07H", desc: "Digit '7'" },
        { val: "7FH", desc: "Digit '8'" },
        { val: "6FH", desc: "Digit '9'" }
    ];

    const dptrBase = 0x0300;

    slider.addEventListener("input", (e) => {
        let a = parseInt(e.target.value);
        let addr = dptrBase + a;

        offsetDisplay.innerText = a.toString(16).padStart(2, '0').toUpperCase() + "H";
        calcAddr.innerText = `@A+DPTR = ${addr.toString(16).padStart(4, '0').toUpperCase()}H`;
        romData.innerText = `${lookUpTable[a].val} (${lookUpTable[a].desc})`;

        // Add a little flash effect
        romData.style.color = "#fff";
        setTimeout(() => { romData.style.color = "#facc15"; }, 150);
    });
}

// --- Unit 6 Implementations ---

function initTimerCalculator() {
    const btnCalc = document.getElementById("btn-calc-timer");
    const inputMs = document.getElementById("calc-delay-ms");
    const outCycles = document.getElementById("calc-cycles");
    const outInitDec = document.getElementById("calc-init-dec");
    const outTh = document.getElementById("calc-th");
    const outTl = document.getElementById("calc-tl");

    if (!btnCalc || !inputMs) return;

    // Fixed frequency assumptions for 8051
    const crystalFreqStr = 11.0592 * 1000000;
    const machineCycleFreq = crystalFreqStr / 12;
    const tCycleSec = 1 / machineCycleFreq; // Approx 1.085 us

    const doCalc = () => {
        let delayMs = parseFloat(inputMs.value);
        if (isNaN(delayMs) || delayMs <= 0) delayMs = 50;

        // Max delay in Mode 1 is 65536 * 1.085us = ~71ms
        if (delayMs > 71) {
            delayMs = 71;
            inputMs.value = 71;
            alert("Max delay in Mode 1 for 11.0592MHz is roughly 71ms.");
        }

        let delaySec = delayMs / 1000.0;
        let cyclesNeeded = Math.round(delaySec / tCycleSec);

        let initialValue = 65536 - cyclesNeeded;
        if (initialValue < 0) initialValue = 0;

        let hexVal = initialValue.toString(16).padStart(4, '0').toUpperCase();
        let th = hexVal.substring(0, 2);
        let tl = hexVal.substring(2, 4);

        outCycles.innerText = cyclesNeeded.toString();
        outInitDec.innerText = initialValue.toString();
        outTh.innerText = th;
        outTl.innerText = tl;
    };

    btnCalc.addEventListener("click", doCalc);
    inputMs.addEventListener("keyup", (e) => {
        if (e.key === 'Enter') doCalc();
    });
}

// --- Unit 7 Implementations ---

function initMotorPWM8051() {
    const slider = document.getElementById('motor-slider-8051');
    const valDisplay = document.getElementById('motor-pwm-val-8051');
    const waveform = document.getElementById('pwm-waveform-8051');
    const fan = document.getElementById('motor-fan-8051');

    if (!slider || !fan || !waveform || !valDisplay) return;

    let dutyCycle = 0;
    let rotation = 0;
    let lastTime = performance.now();

    slider.addEventListener('input', (e) => {
        dutyCycle = parseInt(e.target.value);
        valDisplay.innerText = dutyCycle + '%';
        waveform.style.width = dutyCycle + '%';
    });

    function updateFan() {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Speed is proportional to duty cycle
        const currentSpeed = (dutyCycle / 100) * 30; // Max 30 degrees per ms

        if (currentSpeed > 0) {
            rotation += currentSpeed * (deltaTime / 16); // Normalize to ~60fps
            fan.style.transform = `rotate(${rotation}deg)`;
        }

        requestAnimationFrame(updateFan);
    }

    updateFan();
}
