// ══════════════════════════════════════════════════════════
// Electrical Measurements — Interactive Visualizations
// Uses D3.js v7, GSAP 3, SVG for circuit.html
// ══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    const initFunctions = [
        initEMMethods,
        initEMClassification,
        initEMStaticChar,
        initEMErrors,
        initEMLimitingError,
        initEMCombination,
        initEMStatistics,
        initEMAnalog,
        initEMCalculators
    ];
    initFunctions.forEach(fn => {
        try { fn(); } catch (e) { console.error(`Error in ${fn.name}:`, e); }
    });
});

// ──── Helpers ────
const GOLD = '#facc15', CYAN = '#00f5ff', GREEN = '#00ff88',
      ORANGE = '#f97316', ROSE = '#f472b6', RED = '#ef4444',
      BLUE = '#60a5fa', PURPLE = '#a78bfa', WHITE = '#ffffff',
      MUTED = '#888', GRID_CLR = 'rgba(255,255,255,0.06)';

function emClear(id) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
    return el;
}

// ══════════════════════════════════════════════════════════
// CARD 1 — Methods of Measurement
// ══════════════════════════════════════════════════════════
function initEMMethods() {
    const container = document.getElementById('plot-em-1');
    if (!container) return;
    const w = container.clientWidth || 400, h = 240;
    const svg = d3.select(container).append('svg').attr('width', w).attr('height', h);
    const mid = w / 2;

    // Direct method group (left)
    const gDirect = svg.append('g').attr('transform', `translate(${mid / 2}, ${h / 2})`);
    gDirect.append('rect').attr('x', -80).attr('y', -50).attr('width', 160).attr('height', 100)
        .attr('rx', 10).attr('fill', 'rgba(0,245,255,0.08)').attr('stroke', CYAN).attr('stroke-width', 2);
    gDirect.append('text').attr('y', -25).attr('text-anchor', 'middle').attr('fill', CYAN).attr('font-size', '13px').attr('font-weight', 'bold').text('DIRECT');
    // Meter icon
    gDirect.append('circle').attr('cy', 5).attr('r', 18).attr('fill', 'none').attr('stroke', CYAN).attr('stroke-width', 1.5);
    gDirect.append('line').attr('x1', 0).attr('y1', 5).attr('x2', 10).attr('y2', -8).attr('stroke', CYAN).attr('stroke-width', 2);
    gDirect.append('text').attr('y', 42).attr('text-anchor', 'middle').attr('fill', ORANGE).attr('font-size', '11px').text('INACCURATE');

    // Indirect method group (right)
    const gIndirect = svg.append('g').attr('transform', `translate(${mid + mid / 2}, ${h / 2})`);
    gIndirect.append('rect').attr('x', -80).attr('y', -50).attr('width', 160).attr('height', 100)
        .attr('rx', 10).attr('fill', 'rgba(0,255,136,0.08)').attr('stroke', GREEN).attr('stroke-width', 2);
    gIndirect.append('text').attr('y', -25).attr('text-anchor', 'middle').attr('fill', GREEN).attr('font-size', '13px').attr('font-weight', 'bold').text('INDIRECT');
    // V meter + A meter
    gIndirect.append('circle').attr('cx', -25).attr('cy', 5).attr('r', 14).attr('fill', 'none').attr('stroke', GOLD).attr('stroke-width', 1.5);
    gIndirect.append('text').attr('x', -25).attr('y', 9).attr('text-anchor', 'middle').attr('fill', GOLD).attr('font-size', '10px').text('V');
    gIndirect.append('circle').attr('cx', 25).attr('cy', 5).attr('r', 14).attr('fill', 'none').attr('stroke', CYAN).attr('stroke-width', 1.5);
    gIndirect.append('text').attr('x', 25).attr('y', 9).attr('text-anchor', 'middle').attr('fill', CYAN).attr('font-size', '10px').text('A');
    gIndirect.append('text').attr('y', 35).attr('text-anchor', 'middle').attr('fill', WHITE).attr('font-size', '11px').text('R = V / I');
    gIndirect.append('text').attr('y', 48).attr('text-anchor', 'middle').attr('fill', GREEN).attr('font-size', '11px').text('ACCURATE ✓');

    // Divider line
    svg.append('line').attr('x1', mid).attr('y1', 15).attr('x2', mid).attr('y2', h - 15)
        .attr('stroke', 'rgba(255,255,255,0.15)').attr('stroke-width', 1).attr('stroke-dasharray', '4,4');

    // Toggle highlight
    let showDirect = true;
    function update() {
        gsap.to(gDirect.node(), { opacity: showDirect ? 1 : 0.25, duration: 0.4 });
        gsap.to(gIndirect.node(), { opacity: showDirect ? 0.25 : 1, duration: 0.4 });
    }
    const btn = document.getElementById('btn-em-method-toggle');
    if (btn) btn.addEventListener('click', () => { showDirect = !showDirect; update(); });
    update();
}

// ══════════════════════════════════════════════════════════
// CARD 2 — Classification of Instruments
// ══════════════════════════════════════════════════════════
function initEMClassification() {
    const container = document.getElementById('plot-em-2');
    if (!container) return;
    const w = container.clientWidth || 400, h = 240;
    let mode = 'tree'; // tree or deflect

    function drawTree() {
        container.innerHTML = '';
        const svg = d3.select(container).append('svg').attr('width', w).attr('height', h);
        const cx = w / 2;
        // Root
        svg.append('rect').attr('x', cx - 55).attr('y', 10).attr('width', 110).attr('height', 28).attr('rx', 6)
            .attr('fill', GOLD).attr('opacity', 0.9);
        svg.append('text').attr('x', cx).attr('y', 29).attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '11px').attr('font-weight', 'bold').text('Instruments');

        const branches = [
            { label: 'Absolute / Secondary', x: cx - 130, clr: CYAN },
            { label: 'Deflection / Null', x: cx, clr: GREEN },
            { label: 'Recording / Integrating', x: cx + 130, clr: ORANGE }
        ];
        branches.forEach((b, i) => {
            // Lines
            svg.append('line').attr('x1', cx).attr('y1', 38).attr('x2', b.x).attr('y2', 80)
                .attr('stroke', b.clr).attr('stroke-width', 1.5).attr('opacity', 0);
            // Boxes
            const bx = svg.append('g').attr('transform', `translate(${b.x}, 80)`).attr('opacity', 0);
            bx.append('rect').attr('x', -70).attr('y', 0).attr('width', 140).attr('height', 26).attr('rx', 5)
                .attr('fill', 'rgba(255,255,255,0.05)').attr('stroke', b.clr).attr('stroke-width', 1.5);
            bx.append('text').attr('y', 17).attr('text-anchor', 'middle').attr('fill', b.clr).attr('font-size', '10px').text(b.label);

            // Sub-items
            const subs = i === 0
                ? ['Tangent Galv.', 'Ammeter, Voltmeter']
                : i === 1
                    ? ['PMMC, Moving Iron', 'Potentiometer, Bridge']
                    : ['CRO, ECG', 'Energy Meter (kWh)'];
            subs.forEach((s, j) => {
                const sy = 130 + j * 35;
                svg.append('line').attr('x1', b.x).attr('y1', 106).attr('x2', b.x).attr('y2', sy)
                    .attr('stroke', b.clr).attr('stroke-width', 1).attr('opacity', 0).attr('stroke-dasharray', '3,3');
                const sg = svg.append('g').attr('transform', `translate(${b.x}, ${sy})`).attr('opacity', 0);
                sg.append('rect').attr('x', -62).attr('y', 0).attr('width', 124).attr('height', 22).attr('rx', 4)
                    .attr('fill', 'rgba(255,255,255,0.03)').attr('stroke', b.clr).attr('stroke-width', 0.8);
                sg.append('text').attr('y', 15).attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '9px').text(s);

                gsap.to(sg.node(), { opacity: 1, duration: 0.5, delay: 0.6 + i * 0.2 + j * 0.15 });
            });
            // Animate in
            gsap.to(bx.node(), { opacity: 1, duration: 0.5, delay: 0.2 + i * 0.15 });
            svg.selectAll('line').filter((_, li) => li === i).transition().delay(200 + i * 150).duration(400).attr('opacity', 1);
        });
        // Animate all lines
        svg.selectAll('line').attr('opacity', 0);
        svg.selectAll('line').each(function (d, i) { gsap.to(this, { opacity: 1, duration: 0.4, delay: 0.1 + i * 0.08 }); });
    }

    function drawDeflectNull() {
        container.innerHTML = '';
        const svg = d3.select(container).append('svg').attr('width', w).attr('height', h);
        const leftCx = w * 0.25, rightCx = w * 0.75, cy = h * 0.55, r = 50;

        // Deflection meter
        svg.append('text').attr('x', leftCx).attr('y', 25).attr('text-anchor', 'middle').attr('fill', CYAN).attr('font-size', '12px').attr('font-weight', 'bold').text('Deflection Type');
        svg.append('path').attr('d', `M${leftCx - r},${cy} A${r},${r} 0 0,1 ${leftCx + r},${cy}`)
            .attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.2)').attr('stroke-width', 2);
        // Scale marks
        for (let a = 180; a >= 0; a -= 20) {
            const rad = a * Math.PI / 180;
            const x1 = leftCx + (r - 5) * Math.cos(rad), y1 = cy - (r - 5) * Math.sin(rad);
            const x2 = leftCx + r * Math.cos(rad), y2 = cy - r * Math.sin(rad);
            svg.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
                .attr('stroke', 'rgba(255,255,255,0.3)').attr('stroke-width', 1);
        }
        const needle1 = svg.append('line').attr('x1', leftCx).attr('y1', cy)
            .attr('x2', leftCx - r + 10).attr('y2', cy)
            .attr('stroke', GOLD).attr('stroke-width', 2.5).attr('stroke-linecap', 'round');
        svg.append('circle').attr('cx', leftCx).attr('cy', cy).attr('r', 4).attr('fill', GOLD);
        svg.append('text').attr('x', leftCx).attr('y', cy + 25).attr('text-anchor', 'middle').attr('fill', CYAN).attr('font-size', '10px').text('Fast, Less Accurate');

        // Animate deflection needle to ~60 degrees
        gsap.to(needle1.node(), {
            attr: { x2: leftCx + (r - 10) * Math.cos(60 * Math.PI / 180), y2: cy - (r - 10) * Math.sin(60 * Math.PI / 180) },
            duration: 1.5, ease: 'elastic.out(1, 0.4)', delay: 0.5
        });

        // Null meter
        svg.append('text').attr('x', rightCx).attr('y', 25).attr('text-anchor', 'middle').attr('fill', GREEN).attr('font-size', '12px').attr('font-weight', 'bold').text('Null Type');
        svg.append('path').attr('d', `M${rightCx - r},${cy} A${r},${r} 0 0,1 ${rightCx + r},${cy}`)
            .attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.2)').attr('stroke-width', 2);
        for (let a = 180; a >= 0; a -= 20) {
            const rad = a * Math.PI / 180;
            const x1 = rightCx + (r - 5) * Math.cos(rad), y1 = cy - (r - 5) * Math.sin(rad);
            const x2 = rightCx + r * Math.cos(rad), y2 = cy - r * Math.sin(rad);
            svg.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
                .attr('stroke', 'rgba(255,255,255,0.3)').attr('stroke-width', 1);
        }
        // Zero marker
        svg.append('line').attr('x1', rightCx).attr('y1', cy - r + 5).attr('x2', rightCx).attr('y2', cy - r - 5)
            .attr('stroke', GREEN).attr('stroke-width', 2);
        const needle2 = svg.append('line').attr('x1', rightCx).attr('y1', cy)
            .attr('x2', rightCx + (r - 10) * Math.cos(120 * Math.PI / 180)).attr('y2', cy - (r - 10) * Math.sin(120 * Math.PI / 180))
            .attr('stroke', GOLD).attr('stroke-width', 2.5).attr('stroke-linecap', 'round');
        svg.append('circle').attr('cx', rightCx).attr('cy', cy).attr('r', 4).attr('fill', GOLD);
        svg.append('text').attr('x', rightCx).attr('y', cy + 25).attr('text-anchor', 'middle').attr('fill', GREEN).attr('font-size', '10px').text('High Accuracy, Slow');

        // Animate null needle back to center (90 deg = vertical)
        gsap.to(needle2.node(), {
            attr: { x2: rightCx, y2: cy - (r - 10) },
            duration: 2, ease: 'power2.out', delay: 0.8
        });

        // Divider
        svg.append('line').attr('x1', w / 2).attr('y1', 15).attr('x2', w / 2).attr('y2', h - 15)
            .attr('stroke', 'rgba(255,255,255,0.1)').attr('stroke-dasharray', '4,4');
    }

    const btnTree = document.getElementById('btn-em-class-tree');
    const btnDN = document.getElementById('btn-em-deflect-null');
    if (btnTree) btnTree.addEventListener('click', () => { mode = 'tree'; drawTree(); });
    if (btnDN) btnDN.addEventListener('click', () => { mode = 'deflect'; drawDeflectNull(); });
    drawTree();
}

// ══════════════════════════════════════════════════════════
// CARD 3 — Static Characteristics
// ══════════════════════════════════════════════════════════
function initEMStaticChar() {
    const container = document.getElementById('plot-em-3');
    if (!container) return;
    const w = container.clientWidth || 800, h = container.clientHeight || 300;
    const btns = {
        'btn-em-acc-prec': drawAccPrec,
        'btn-em-sensitivity': drawSensitivity,
        'btn-em-deadzone': drawDeadZone,
        'btn-em-resolution': drawResolution
    };
    Object.keys(btns).forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', () => {
            container.innerHTML = '';
            Object.keys(btns).forEach(bid => {
                const b = document.getElementById(bid);
                if (b) { b.classList.remove('active'); b.style.borderColor = ''; }
            });
            btn.classList.add('active');
            btns[id]();
        });
    });
    drawAccPrec(); // default

    function drawAccPrec() {
        const svg = d3.select(container).append('svg').attr('width', w).attr('height', h);
        const cases = [
            { label: 'High Acc + High Prec', cx: w * 0.15, bias: 0, spread: 8, accClr: GREEN, precClr: GREEN },
            { label: 'High Acc + Low Prec', cx: w * 0.38, bias: 0, spread: 25, accClr: GREEN, precClr: RED },
            { label: 'Low Acc + High Prec', cx: w * 0.62, bias: 20, spread: 8, accClr: RED, precClr: GREEN },
            { label: 'Low Acc + Low Prec', cx: w * 0.85, bias: 20, spread: 25, accClr: RED, precClr: RED }
        ];
        cases.forEach(c => {
            const cy = h * 0.45, r = 40;
            // Target rings
            [1, 0.66, 0.33].forEach(f => {
                svg.append('circle').attr('cx', c.cx).attr('cy', cy).attr('r', r * f)
                    .attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.15)').attr('stroke-width', 1);
            });
            svg.append('circle').attr('cx', c.cx).attr('cy', cy).attr('r', 2).attr('fill', GOLD);
            // Dots
            for (let i = 0; i < 8; i++) {
                const angle = Math.random() * 2 * Math.PI;
                const dist = (Math.random() * c.spread);
                const dot = svg.append('circle')
                    .attr('cx', c.cx + c.bias * 0.7 + dist * Math.cos(angle))
                    .attr('cy', cy - c.bias * 0.3 + dist * Math.sin(angle))
                    .attr('r', 3).attr('fill', CYAN).attr('opacity', 0);
                gsap.to(dot.node(), { opacity: 0.9, duration: 0.3, delay: 0.1 + i * 0.05 });
            }
            // Label
            svg.append('text').attr('x', c.cx).attr('y', cy + r + 20).attr('text-anchor', 'middle')
                .attr('fill', MUTED).attr('font-size', '9px').text(c.label);
            // Badges
            svg.append('text').attr('x', c.cx - 20).attr('y', cy + r + 35).attr('text-anchor', 'middle')
                .attr('fill', c.accClr).attr('font-size', '8px').text(c.accClr === GREEN ? 'ACC ✓' : 'ACC ✗');
            svg.append('text').attr('x', c.cx + 20).attr('y', cy + r + 35).attr('text-anchor', 'middle')
                .attr('fill', c.precClr).attr('font-size', '8px').text(c.precClr === GREEN ? 'PREC ✓' : 'PREC ✗');
        });
    }

    function drawSensitivity() {
        const svg = d3.select(container).append('svg').attr('width', w).attr('height', h);
        const m = { t: 30, r: 30, b: 50, l: 60 };
        const pw = w - m.l - m.r, ph = h - m.t - m.b;
        const g = svg.append('g').attr('transform', `translate(${m.l},${m.t})`);
        const x = d3.scaleLinear().domain([0, 10]).range([0, pw]);
        const y = d3.scaleLinear().domain([0, 100]).range([ph, 0]);
        g.append('g').attr('transform', `translate(0,${ph})`).call(d3.axisBottom(x).ticks(5)).attr('color', MUTED);
        g.append('g').call(d3.axisLeft(y).ticks(5)).attr('color', MUTED);
        g.append('text').attr('x', pw / 2).attr('y', ph + 40).attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '11px').text('Input (ΔQ)');
        g.append('text').attr('x', -ph / 2).attr('y', -45).attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '11px').attr('transform', 'rotate(-90)').text('Output (Δθ)');

        let sensitivity = 5;
        const line = g.append('line').attr('x1', x(0)).attr('y1', y(0)).attr('x2', x(10)).attr('y2', y(sensitivity * 10))
            .attr('stroke', GOLD).attr('stroke-width', 2.5);
        const label = g.append('text').attr('x', pw - 10).attr('y', 15).attr('text-anchor', 'end').attr('fill', GOLD).attr('font-size', '12px');

        // Slider
        const sliderDiv = d3.select(container).append('div').style('padding', '8px 20px').style('font-size', '12px').style('color', MUTED);
        sliderDiv.append('label').text('Sensitivity (S): ');
        const valSpan = sliderDiv.append('span').text('5');
        sliderDiv.append('br');
        const slider = sliderDiv.append('input').attr('type', 'range').attr('min', 1).attr('max', 10).attr('value', 5)
            .attr('class', 'ac-slider').style('width', '100%');

        function update(s) {
            sensitivity = s;
            const yEnd = Math.min(s * 10, 100);
            line.attr('y2', y(yEnd));
            label.text(`S = ${s} div/unit`);
            valSpan.text(s);
        }
        slider.on('input', function () { update(+this.value); });
        update(5);
    }

    function drawDeadZone() {
        const svg = d3.select(container).append('svg').attr('width', w).attr('height', h);
        const m = { t: 30, r: 30, b: 50, l: 60 };
        const pw = w - m.l - m.r, ph = h - m.t - m.b;
        const g = svg.append('g').attr('transform', `translate(${m.l},${m.t})`);
        const x = d3.scaleLinear().domain([0, 10]).range([0, pw]);
        const y = d3.scaleLinear().domain([0, 10]).range([ph, 0]);
        g.append('g').attr('transform', `translate(0,${ph})`).call(d3.axisBottom(x).ticks(5)).attr('color', MUTED);
        g.append('g').call(d3.axisLeft(y).ticks(5)).attr('color', MUTED);
        g.append('text').attr('x', pw / 2).attr('y', ph + 40).attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '11px').text('Input');
        g.append('text').attr('x', -ph / 2).attr('y', -45).attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '11px').attr('transform', 'rotate(-90)').text('Output');

        let dz = 2;
        const idealLine = g.append('line').attr('x1', x(0)).attr('y1', y(0)).attr('x2', x(10)).attr('y2', y(10))
            .attr('stroke', CYAN).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,4').attr('opacity', 0.5);
        const deadPath = g.append('path').attr('fill', 'none').attr('stroke', GOLD).attr('stroke-width', 2.5);
        const deadZoneRect = g.append('rect').attr('y', 0).attr('height', ph).attr('fill', 'rgba(239,68,68,0.1)');
        const dzLabel = g.append('text').attr('y', 15).attr('text-anchor', 'middle').attr('fill', RED).attr('font-size', '11px');

        const sliderDiv = d3.select(container).append('div').style('padding', '8px 20px').style('font-size', '12px').style('color', MUTED);
        sliderDiv.append('label').text('Dead Zone Width: ');
        const valSpan = sliderDiv.append('span').text('2');
        sliderDiv.append('br');
        const slider = sliderDiv.append('input').attr('type', 'range').attr('min', 0).attr('max', 5).attr('value', 2).attr('step', '0.5')
            .attr('class', 'ac-slider').style('width', '100%');

        function update(d) {
            dz = d;
            const pts = d3.range(0, 10.1, 0.1).map(v => [x(v), y(Math.max(0, v - dz))]);
            deadPath.attr('d', d3.line()(pts));
            deadZoneRect.attr('x', x(0)).attr('width', x(dz) - x(0));
            dzLabel.attr('x', x(dz / 2)).text(`Dead Zone = ${dz}`);
            valSpan.text(dz);
        }
        slider.on('input', function () { update(+this.value); });
        update(2);
    }

    function drawResolution() {
        const svg = d3.select(container).append('svg').attr('width', w).attr('height', h);
        const m = { t: 40, r: 30, b: 60, l: 30 };
        const pw = w - m.l - m.r;
        const g = svg.append('g').attr('transform', `translate(${m.l},${m.t})`);
        const fsd = 100;
        let n = 10;

        const scaleBar = g.append('rect').attr('x', 0).attr('y', 50).attr('width', pw).attr('height', 6).attr('rx', 3)
            .attr('fill', 'rgba(255,255,255,0.1)');
        const tickGroup = g.append('g');
        const resLabel = g.append('text').attr('x', pw / 2).attr('y', 30).attr('text-anchor', 'middle').attr('fill', GOLD).attr('font-size', '14px');
        const fsdLabel = g.append('text').attr('x', pw / 2).attr('y', 100).attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '11px');

        const sliderDiv = d3.select(container).append('div').style('padding', '8px 20px').style('font-size', '12px').style('color', MUTED);
        sliderDiv.append('label').text('Number of Divisions (N): ');
        const valSpan = sliderDiv.append('span').text('10');
        sliderDiv.append('br');
        const slider = sliderDiv.append('input').attr('type', 'range').attr('min', 2).attr('max', 50).attr('value', 10)
            .attr('class', 'ac-slider').style('width', '100%');

        function update(divisions) {
            n = divisions;
            tickGroup.selectAll('*').remove();
            const step = pw / n;
            for (let i = 0; i <= n; i++) {
                const xp = i * step;
                const big = (i % 5 === 0);
                tickGroup.append('line').attr('x1', xp).attr('y1', 45).attr('x2', xp).attr('y2', big ? 35 : 40)
                    .attr('stroke', big ? GOLD : 'rgba(255,255,255,0.3)').attr('stroke-width', big ? 1.5 : 0.8);
                if (big) {
                    tickGroup.append('text').attr('x', xp).attr('y', 75).attr('text-anchor', 'middle')
                        .attr('fill', MUTED).attr('font-size', '9px').text(Math.round(fsd * i / n));
                }
            }
            const res = (fsd / n).toFixed(2);
            resLabel.text(`Resolution = FSD / N = ${fsd} / ${n} = ${res}`);
            fsdLabel.text(`FSD = ${fsd} | N = ${n} divisions`);
            valSpan.text(n);
        }
        slider.on('input', function () { update(+this.value); });
        update(10);
    }
}

// ══════════════════════════════════════════════════════════
// CARD 4 — Errors in Measurement (Gaussian bell curve)
// ══════════════════════════════════════════════════════════
function initEMErrors() {
    const container = document.getElementById('plot-em-4');
    if (!container) return;
    const w = container.clientWidth || 400, h = 240;
    const svg = d3.select(container).append('svg').attr('width', w).attr('height', h);
    const m = { t: 20, r: 20, b: 40, l: 50 };
    const pw = w - m.l - m.r, ph = h - m.t - m.b;
    const g = svg.append('g').attr('transform', `translate(${m.l},${m.t})`);

    const x = d3.scaleLinear().domain([-4, 4]).range([0, pw]);
    const y = d3.scaleLinear().domain([0, 0.45]).range([ph, 0]);
    g.append('g').attr('transform', `translate(0,${ph})`).call(d3.axisBottom(x).ticks(8).tickFormat(d => d === 0 ? 'μ' : d > 0 ? `+${d}σ` : `${d}σ`)).attr('color', MUTED);

    function gauss(xv, sd) { return (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * (xv / sd) ** 2); }

    let sd = 1;
    // σ bands
    const band1 = g.append('path').attr('fill', 'rgba(0,245,255,0.15)');
    const band2 = g.append('path').attr('fill', 'rgba(250,204,21,0.1)');
    const band3 = g.append('path').attr('fill', 'rgba(0,255,136,0.06)');
    const curve = g.append('path').attr('fill', 'none').attr('stroke', GOLD).attr('stroke-width', 2.5);

    // Labels
    const bandLabels = [
        g.append('text').attr('text-anchor', 'middle').attr('fill', CYAN).attr('font-size', '10px'),
        g.append('text').attr('text-anchor', 'middle').attr('fill', GOLD).attr('font-size', '9px'),
        g.append('text').attr('text-anchor', 'middle').attr('fill', GREEN).attr('font-size', '9px')
    ];

    function makeBand(lo, hi) {
        const pts = d3.range(lo, hi + 0.05, 0.05);
        return d3.area().x(d => x(d)).y0(y(0)).y1(d => y(gauss(d, sd)))(pts);
    }

    function update() {
        const pts = d3.range(-4, 4.05, 0.05);
        curve.attr('d', d3.line().x(d => x(d)).y(d => y(gauss(d, sd)))(pts));
        band1.attr('d', makeBand(-sd, sd));
        band2.attr('d', makeBand(-2 * sd, 2 * sd));
        band3.attr('d', makeBand(-3 * sd, 3 * sd));
        bandLabels[0].attr('x', x(0)).attr('y', y(gauss(0, sd)) - 10).text(`±1σ → 68.27%`);
        bandLabels[1].attr('x', x(2 * sd - 0.3)).attr('y', y(0) - 5).text(`±2σ → 95.45%`);
        bandLabels[2].attr('x', x(3 * sd - 0.5)).attr('y', y(0) + 12).text(`±3σ → 99.73%`);
    }

    // Add slider
    const sliderDiv = d3.select(container).append('div').style('padding', '4px 15px').style('font-size', '11px').style('color', MUTED)
        .style('position', 'absolute').style('bottom', '2px').style('left', '0').style('right', '0');
    sliderDiv.append('label').text('σ = ');
    const valSpan = sliderDiv.append('span').text('1.0');
    const slider = sliderDiv.append('input').attr('type', 'range').attr('min', 0.3).attr('max', 2).attr('value', 1).attr('step', '0.1')
        .attr('class', 'ac-slider').style('width', '80%').style('margin-left', '8px');
    slider.on('input', function () {
        sd = +this.value;
        valSpan.text(sd.toFixed(1));
        update();
    });
    update();
}

// ══════════════════════════════════════════════════════════
// CARD 5 — Limiting Error & Static Correction
// ══════════════════════════════════════════════════════════
function initEMLimitingError() {
    const container = document.getElementById('plot-em-5');
    if (!container) return;
    const w = container.clientWidth || 400, h = 240;
    const svg = d3.select(container).append('svg').attr('width', w).attr('height', h);
    const m = { l: 40, r: 40 };
    const pw = w - m.l - m.r;
    const xScale = d3.scaleLinear().domain([45, 55]).range([m.l, w - m.r]);
    const yLine = h * 0.4;
    const At = 50;

    // Number line
    svg.append('line').attr('x1', m.l).attr('y1', yLine).attr('x2', w - m.r).attr('y2', yLine)
        .attr('stroke', 'rgba(255,255,255,0.2)').attr('stroke-width', 2);
    // Ticks
    for (let v = 45; v <= 55; v++) {
        svg.append('line').attr('x1', xScale(v)).attr('y1', yLine - 5).attr('x2', xScale(v)).attr('y2', yLine + 5)
            .attr('stroke', 'rgba(255,255,255,0.2)').attr('stroke-width', 1);
        if (v % 2 === 0) svg.append('text').attr('x', xScale(v)).attr('y', yLine + 20).attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '9px').text(v);
    }

    // At marker (fixed)
    svg.append('circle').attr('cx', xScale(At)).attr('cy', yLine).attr('r', 6).attr('fill', CYAN);
    svg.append('text').attr('x', xScale(At)).attr('y', yLine - 15).attr('text-anchor', 'middle').attr('fill', CYAN).attr('font-size', '11px').text('Aₜ (True)');

    // Am marker (moveable)
    const amDot = svg.append('circle').attr('cx', xScale(52)).attr('cy', yLine).attr('r', 6).attr('fill', GOLD);
    const amLabel = svg.append('text').attr('x', xScale(52)).attr('y', yLine - 30).attr('text-anchor', 'middle').attr('fill', GOLD).attr('font-size', '11px');

    // Error arrow
    const errArrow = svg.append('line').attr('y1', yLine + 30).attr('y2', yLine + 30).attr('stroke', RED).attr('stroke-width', 2).attr('marker-end', 'url(#em-arrow-red)');
    const errLabel = svg.append('text').attr('y', yLine + 50).attr('text-anchor', 'middle').attr('fill', RED).attr('font-size', '11px');

    // Correction arrow
    const corrArrow = svg.append('line').attr('y1', yLine + 60).attr('y2', yLine + 60).attr('stroke', GREEN).attr('stroke-width', 2).attr('marker-end', 'url(#em-arrow-green)');
    const corrLabel = svg.append('text').attr('y', yLine + 80).attr('text-anchor', 'middle').attr('fill', GREEN).attr('font-size', '11px');

    // Arrow markers
    const defs = svg.append('defs');
    [{ id: 'em-arrow-red', clr: RED }, { id: 'em-arrow-green', clr: GREEN }].forEach(a => {
        defs.append('marker').attr('id', a.id).attr('markerWidth', 8).attr('markerHeight', 6).attr('refX', 8).attr('refY', 3).attr('orient', 'auto')
            .append('path').attr('d', 'M0,0 L8,3 L0,6 Z').attr('fill', a.clr);
    });

    // Slider
    const sliderDiv = d3.select(container).append('div').style('padding', '4px 15px').style('font-size', '11px').style('color', MUTED)
        .style('position', 'absolute').style('bottom', '2px').style('left', '0').style('right', '0');
    sliderDiv.append('label').text('Aₘ = ');
    const valSpan = sliderDiv.append('span').text('52');
    const slider = sliderDiv.append('input').attr('type', 'range').attr('min', 46).attr('max', 54).attr('value', 52).attr('step', '0.1')
        .attr('class', 'ac-slider').style('width', '80%').style('margin-left', '8px');

    function update(am) {
        const err = am - At;
        const corr = -err;
        amDot.attr('cx', xScale(am));
        amLabel.attr('x', xScale(am)).text(`Aₘ = ${am.toFixed(1)}`);
        errArrow.attr('x1', xScale(At)).attr('x2', xScale(am));
        errLabel.attr('x', xScale((At + am) / 2)).text(`δA = ${err.toFixed(1)}`);
        corrArrow.attr('x1', xScale(am)).attr('x2', xScale(At));
        corrLabel.attr('x', xScale((At + am) / 2)).text(`δC = ${corr.toFixed(1)} (correction)`);
        valSpan.text(am.toFixed(1));
    }
    slider.on('input', function () { update(+this.value); });
    update(52);
}

// ══════════════════════════════════════════════════════════
// CARD 6 — Combination of Quantities with Limiting Errors
// ══════════════════════════════════════════════════════════
function initEMCombination() {
    const container = document.getElementById('plot-em-6');
    if (!container) return;
    const w = container.clientWidth || 800, h = container.clientHeight || 300;

    function drawPowerExample() {
        container.innerHTML = '';
        const svg = d3.select(container).append('svg').attr('width', w).attr('height', h);
        const m = { t: 35, r: 40, b: 50, l: 60 };
        const pw = w - m.l - m.r, ph = h - m.t - m.b;
        const g = svg.append('g').attr('transform', `translate(${m.l},${m.t})`);

        // P = V²/R
        const V = 100, dV = 2, R = 50, dR = 1;
        const P = V * V / R;
        const relV = (dV / V) * 100, relR = (dR / R) * 100;
        const relP = 2 * relV + relR;
        const dP = (relP / 100) * P;

        const data = [
            { name: 'V', value: relV, contribution: 2 * relV, color: CYAN, label: `δV/V = ${relV}%` },
            { name: 'R', value: relR, contribution: relR, color: ORANGE, label: `δR/R = ${relR}%` },
            { name: 'P', value: relP, contribution: relP, color: GOLD, label: `δP/P = ${relP.toFixed(1)}%` }
        ];

        const xBand = d3.scaleBand().domain(data.map(d => d.name)).range([0, pw]).padding(0.3);
        const yMax = Math.max(...data.map(d => d.contribution)) * 1.3;
        const yScale = d3.scaleLinear().domain([0, yMax]).range([ph, 0]);

        g.append('g').attr('transform', `translate(0,${ph})`).call(d3.axisBottom(xBand)).attr('color', MUTED);
        g.append('g').call(d3.axisLeft(yScale).ticks(5).tickFormat(d => d + '%')).attr('color', MUTED);

        data.forEach(d => {
            const bar = g.append('rect').attr('x', xBand(d.name)).attr('y', yScale(0)).attr('width', xBand.bandwidth())
                .attr('height', 0).attr('fill', d.color).attr('opacity', 0.7).attr('rx', 3);
            gsap.to(bar.node(), { attr: { y: yScale(d.contribution), height: ph - yScale(d.contribution) }, duration: 0.8, ease: 'power2.out' });
            g.append('text').attr('x', xBand(d.name) + xBand.bandwidth() / 2).attr('y', yScale(d.contribution) - 8)
                .attr('text-anchor', 'middle').attr('fill', d.color).attr('font-size', '10px').text(d.label);
        });

        // P formula
        g.append('text').attr('x', pw / 2).attr('y', -10).attr('text-anchor', 'middle').attr('fill', GOLD).attr('font-size', '12px')
            .text(`P = V²/R = ${P}W | δP/P = 2(δV/V) + δR/R = ${relP.toFixed(1)}% | δP = ±${dP.toFixed(1)}W`);
        // Highlight V has double impact
        g.append('text').attr('x', xBand('V') + xBand.bandwidth() / 2).attr('y', ph + 35).attr('text-anchor', 'middle')
            .attr('fill', RED).attr('font-size', '10px').attr('font-weight', 'bold').text('V has 2× impact!');
    }

    function drawGeneral() {
        container.innerHTML = '';
        const svg = d3.select(container).append('svg').attr('width', w).attr('height', h);
        const m = { t: 35, r: 40, b: 50, l: 60 };
        const pw = w - m.l - m.r, ph = h - m.t - m.b;
        const g = svg.append('g').attr('transform', `translate(${m.l},${m.t})`);

        const items = [
            { label: 'SUM: δX = |δA| + |δB|', type: 'Sum', a: 100, da: 2, b: 50, db: 1, res: 150, dres: 3, clr: CYAN },
            { label: 'PRODUCT: εX = εA + εB', type: 'Product', a: 100, da: 2, b: 50, db: 1, res: 5000, dres: null, clr: GREEN },
            { label: 'POWER: εX = n·εA', type: 'Power', a: 100, da: 2, b: 2, db: 0, res: 10000, dres: null, clr: ORANGE }
        ];

        const yBand = d3.scaleBand().domain(items.map(d => d.type)).range([0, ph]).padding(0.25);
        const xMax = 5;
        const xScale = d3.scaleLinear().domain([0, xMax]).range([0, pw]);

        g.append('g').attr('transform', `translate(0,${ph})`).call(d3.axisBottom(xScale).ticks(5).tickFormat(d => d + '%')).attr('color', MUTED);
        g.append('g').call(d3.axisLeft(yBand)).attr('color', MUTED);

        items.forEach(d => {
            const relA = (d.da / d.a) * 100;
            const relB = d.b !== 0 ? (d.db / d.b) * 100 : 0;
            let total;
            if (d.type === 'Sum') total = (d.da + d.db) / (d.a + d.b) * 100;
            else if (d.type === 'Product') total = relA + relB;
            else total = d.b * relA;

            // Stacked bars: εA portion and εB portion
            const bar1 = g.append('rect').attr('x', 0).attr('y', yBand(d.type)).attr('width', 0).attr('height', yBand.bandwidth())
                .attr('fill', d.clr).attr('opacity', 0.6).attr('rx', 3);
            gsap.to(bar1.node(), { attr: { width: xScale(d.type === 'Power' ? d.b * relA : relA) }, duration: 0.6, ease: 'power2.out' });

            if (d.type !== 'Power') {
                const bar2 = g.append('rect').attr('x', xScale(relA)).attr('y', yBand(d.type)).attr('width', 0).attr('height', yBand.bandwidth())
                    .attr('fill', d.clr).attr('opacity', 0.35).attr('rx', 3);
                gsap.to(bar2.node(), { attr: { width: xScale(relB) }, duration: 0.6, delay: 0.3, ease: 'power2.out' });
            }

            g.append('text').attr('x', xScale(Math.min(total, xMax)) + 8).attr('y', yBand(d.type) + yBand.bandwidth() / 2 + 4)
                .attr('fill', d.clr).attr('font-size', '10px').text(`= ${total.toFixed(2)}%`);
        });

        g.append('text').attr('x', pw / 2).attr('y', -10).attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '11px')
            .text('Error Propagation: A=100±2, B=50±1');
    }

    const btnPower = document.getElementById('btn-em-power-example');
    if (btnPower) btnPower.addEventListener('click', drawPowerExample);
    drawGeneral();
}

// ══════════════════════════════════════════════════════════
// CARD 7 — Arithmetic Mean & Deviation Analysis
// ══════════════════════════════════════════════════════════
function initEMStatistics() {
    const container = document.getElementById('plot-em-7');
    if (!container) return;

    function compute(dataStr) {
        const vals = dataStr.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
        if (vals.length < 2) return null;
        const n = vals.length;
        const mean = vals.reduce((a, b) => a + b, 0) / n;
        const devs = vals.map(v => v - mean);
        const sumD2 = devs.reduce((a, d) => a + d * d, 0);
        const sigma = Math.sqrt(sumD2 / (n < 20 ? n - 1 : n));
        const variance = sigma * sigma;
        const probErr = 0.6745 * sigma;
        const semean = sigma / Math.sqrt(n);
        const avgDev = devs.reduce((a, d) => a + Math.abs(d), 0) / n;
        return { vals, n, mean, devs, sigma, variance, probErr, semean, avgDev };
    }

    function render(stats) {
        if (!stats) return;
        container.innerHTML = '';
        const { vals, n, mean, sigma } = stats;
        const w = container.clientWidth || 400, h = container.clientHeight || 240;
        const svg = d3.select(container).append('svg').attr('width', w).attr('height', h);
        const m = { t: 30, r: 20, b: 30, l: 20 };
        const pw = w - m.l - m.r, ph = h - m.t - m.b;
        const g = svg.append('g').attr('transform', `translate(${m.l},${m.t})`);

        const xMin = mean - 4 * Math.max(sigma, 0.1);
        const xMax = mean + 4 * Math.max(sigma, 0.1);
        const x = d3.scaleLinear().domain([xMin, xMax]).range([0, pw]);

        // Sigma bands
        const bands = [
            { lo: mean - 3 * sigma, hi: mean + 3 * sigma, fill: 'rgba(0,255,136,0.06)', label: '±3σ (99.73%)' },
            { lo: mean - 2 * sigma, hi: mean + 2 * sigma, fill: 'rgba(250,204,21,0.1)', label: '±2σ (95.45%)' },
            { lo: mean - sigma, hi: mean + sigma, fill: 'rgba(0,245,255,0.15)', label: '±1σ (68.27%)' }
        ];
        bands.forEach(b => {
            g.append('rect').attr('x', x(b.lo)).attr('y', 0).attr('width', x(b.hi) - x(b.lo)).attr('height', ph)
                .attr('fill', b.fill);
        });

        // Mean line
        g.append('line').attr('x1', x(mean)).attr('y1', 0).attr('x2', x(mean)).attr('y2', ph)
            .attr('stroke', GOLD).attr('stroke-width', 2).attr('stroke-dasharray', '4,4');
        g.append('text').attr('x', x(mean)).attr('y', -5).attr('text-anchor', 'middle').attr('fill', GOLD).attr('font-size', '10px')
            .text(`X̄ = ${mean.toFixed(3)}`);

        // Gaussian overlay
        const sd = Math.max(sigma, 0.01);
        function gauss(v) { return (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((v - mean) / sd) ** 2); }
        const gaussMax = gauss(mean);
        const yG = d3.scaleLinear().domain([0, gaussMax * 1.1]).range([ph, 0]);
        const pts = d3.range(xMin, xMax, (xMax - xMin) / 200);
        g.append('path').attr('fill', 'none').attr('stroke', GOLD).attr('stroke-width', 1.5).attr('opacity', 0.6)
            .attr('d', d3.line().x(d => x(d)).y(d => yG(gauss(d)))(pts));

        // Data dots
        const dotY = ph - 15;
        vals.forEach((v, i) => {
            const dot = g.append('circle').attr('cx', x(v)).attr('cy', dotY).attr('r', 5).attr('fill', CYAN).attr('opacity', 0);
            gsap.to(dot.node(), { opacity: 0.85, duration: 0.3, delay: i * 0.05 });
        });

        // Axis
        g.append('g').attr('transform', `translate(0,${ph})`).call(d3.axisBottom(x).ticks(6)).attr('color', MUTED);

        // Results text
        const resDiv = document.getElementById('em-stat-results');
        if (resDiv) {
            resDiv.innerHTML = `<strong>n=${stats.n}</strong> | X̄=${stats.mean.toFixed(4)} | σ=${stats.sigma.toFixed(4)} | V=${stats.variance.toFixed(4)} | r=${stats.probErr.toFixed(4)} | σ<sub>X̄</sub>=${stats.semean.toFixed(4)} | D̄=${stats.avgDev.toFixed(4)}`;
        }
    }

    const btn = document.getElementById('btn-em-stat-compute');
    const input = document.getElementById('em-stat-input');
    if (btn && input) {
        btn.addEventListener('click', () => {
            const stats = compute(input.value);
            if (stats) render(stats);
        });
        // Initial render
        const stats = compute(input.value);
        if (stats) render(stats);
    }
}

// ══════════════════════════════════════════════════════════
// CARD 8 — Error Types & Analog Instruments
// ══════════════════════════════════════════════════════════
function initEMAnalog() {
    const container = document.getElementById('plot-em-8');
    if (!container) return;
    const w = container.clientWidth || 400, h = 240;

    const btns = {
        'btn-em-error-tree': drawErrorTree,
        'btn-em-parallax': drawParallax,
        'btn-em-sqrt-n': drawSqrtN
    };
    Object.keys(btns).forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', () => {
            container.innerHTML = '';
            Object.keys(btns).forEach(bid => { const b = document.getElementById(bid); if (b) b.classList.remove('active'); });
            btn.classList.add('active');
            btns[id]();
        });
    });
    drawErrorTree();

    function drawErrorTree() {
        const svg = d3.select(container).append('svg').attr('width', w).attr('height', h);
        const cx = w / 2;
        // Root
        const rootRx = 45;
        svg.append('rect').attr('x', cx - rootRx).attr('y', 8).attr('width', rootRx * 2).attr('height', 24).attr('rx', 5)
            .attr('fill', GOLD).attr('opacity', 0.9);
        svg.append('text').attr('x', cx).attr('y', 24).attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '11px').attr('font-weight', 'bold').text('Errors');

        const level1 = [
            { label: 'Gross', x: cx - 140, clr: RED, subs: ['Human mistakes', 'Parallax, wrong reading', 'Cannot treat math.'] },
            { label: 'Systematic', x: cx, clr: ORANGE, subs: ['Instrument errors', 'Environmental errors', 'Observational errors'] },
            { label: 'Random', x: cx + 140, clr: BLUE, subs: ['Statistical fluctuations', 'Gaussian distribution', 'Reduced by mean of n'] }
        ];

        level1.forEach((item, i) => {
            svg.append('line').attr('x1', cx).attr('y1', 32).attr('x2', item.x).attr('y2', 60)
                .attr('stroke', item.clr).attr('stroke-width', 1.5).attr('opacity', 0);
            const box = svg.append('g').attr('transform', `translate(${item.x}, 60)`).attr('opacity', 0);
            box.append('rect').attr('x', -50).attr('y', 0).attr('width', 100).attr('height', 22).attr('rx', 4)
                .attr('fill', 'rgba(255,255,255,0.05)').attr('stroke', item.clr).attr('stroke-width', 1.5);
            box.append('text').attr('y', 15).attr('text-anchor', 'middle').attr('fill', item.clr).attr('font-size', '10px').attr('font-weight', 'bold').text(item.label);

            item.subs.forEach((s, j) => {
                const sy = 100 + j * 32;
                svg.append('line').attr('x1', item.x).attr('y1', 82).attr('x2', item.x).attr('y2', sy)
                    .attr('stroke', item.clr).attr('stroke-width', 0.8).attr('stroke-dasharray', '3,3').attr('opacity', 0);
                const sg = svg.append('g').attr('transform', `translate(${item.x}, ${sy})`).attr('opacity', 0);
                sg.append('rect').attr('x', -58).attr('y', 0).attr('width', 116).attr('height', 20).attr('rx', 3)
                    .attr('fill', 'rgba(255,255,255,0.02)').attr('stroke', item.clr).attr('stroke-width', 0.6);
                sg.append('text').attr('y', 14).attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '8px').text(s);
                gsap.to(sg.node(), { opacity: 1, duration: 0.4, delay: 0.5 + i * 0.15 + j * 0.1 });
            });
            gsap.to(box.node(), { opacity: 1, duration: 0.4, delay: 0.2 + i * 0.15 });
        });
        // Animate lines
        svg.selectAll('line').each(function (d, i) { gsap.to(this, { opacity: 1, duration: 0.3, delay: 0.1 + i * 0.05 }); });
    }

    function drawParallax() {
        const svg = d3.select(container).append('svg').attr('width', w).attr('height', h);
        const cx = w / 2, meterY = h * 0.6;
        // Meter scale
        svg.append('rect').attr('x', cx - 100).attr('y', meterY - 3).attr('width', 200).attr('height', 6).attr('rx', 3)
            .attr('fill', 'rgba(255,255,255,0.1)');
        for (let v = 0; v <= 10; v++) {
            const xp = cx - 100 + v * 20;
            svg.append('line').attr('x1', xp).attr('y1', meterY - 8).attr('x2', xp).attr('y2', meterY + 8)
                .attr('stroke', 'rgba(255,255,255,0.3)').attr('stroke-width', 1);
            svg.append('text').attr('x', xp).attr('y', meterY + 22).attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '8px').text(v);
        }
        // Pointer at value 6
        const pointerX = cx - 100 + 6 * 20;
        svg.append('line').attr('x1', pointerX).attr('y1', meterY - 20).attr('x2', pointerX).attr('y2', meterY + 3)
            .attr('stroke', RED).attr('stroke-width', 2);

        // Correct eye (perpendicular)
        svg.append('circle').attr('cx', pointerX).attr('cy', 30).attr('r', 8).attr('fill', 'none').attr('stroke', GREEN).attr('stroke-width', 1.5);
        svg.append('circle').attr('cx', pointerX).attr('cy', 30).attr('r', 3).attr('fill', GREEN);
        svg.append('line').attr('x1', pointerX).attr('y1', 38).attr('x2', pointerX).attr('y2', meterY - 20)
            .attr('stroke', GREEN).attr('stroke-width', 1).attr('stroke-dasharray', '4,3');
        svg.append('text').attr('x', pointerX).attr('y', 15).attr('text-anchor', 'middle').attr('fill', GREEN).attr('font-size', '10px').text('Correct ✓');

        // Wrong eye (offset)
        const wrongX = pointerX + 50;
        svg.append('circle').attr('cx', wrongX).attr('cy', 30).attr('r', 8).attr('fill', 'none').attr('stroke', RED).attr('stroke-width', 1.5);
        svg.append('circle').attr('cx', wrongX).attr('cy', 30).attr('r', 3).attr('fill', RED);
        svg.append('line').attr('x1', wrongX).attr('y1', 38).attr('x2', pointerX).attr('y2', meterY - 20)
            .attr('stroke', RED).attr('stroke-width', 1).attr('stroke-dasharray', '4,3');
        svg.append('text').attr('x', wrongX).attr('y', 15).attr('text-anchor', 'middle').attr('fill', RED).attr('font-size', '10px').text('Parallax ✗');

        // Apparent reading from wrong angle
        const apparentX = cx - 100 + 7 * 20;
        svg.append('line').attr('x1', wrongX).attr('y1', 38).attr('x2', apparentX).attr('y2', meterY - 3)
            .attr('stroke', RED).attr('stroke-width', 0.8).attr('stroke-dasharray', '2,3').attr('opacity', 0.5);
        svg.append('text').attr('x', apparentX).attr('y', meterY + 38).attr('text-anchor', 'middle').attr('fill', RED).attr('font-size', '9px').text('Reads ≈ 7');
        svg.append('text').attr('x', pointerX).attr('y', meterY + 38).attr('text-anchor', 'middle').attr('fill', GREEN).attr('font-size', '9px').text('Reads 6 ✓');

        svg.append('text').attr('x', cx).attr('y', h - 8).attr('text-anchor', 'middle').attr('fill', GOLD).attr('font-size', '11px')
            .text('Mirror-backed scales eliminate parallax error');
    }

    function drawSqrtN() {
        const svg = d3.select(container).append('svg').attr('width', w).attr('height', h);
        const m = { t: 25, r: 20, b: 45, l: 55 };
        const pw = w - m.l - m.r, ph = h - m.t - m.b;
        const g = svg.append('g').attr('transform', `translate(${m.l},${m.t})`);

        const xScale = d3.scaleLinear().domain([1, 100]).range([0, pw]);
        const yScale = d3.scaleLinear().domain([0, 1]).range([ph, 0]);

        g.append('g').attr('transform', `translate(0,${ph})`).call(d3.axisBottom(xScale).ticks(10)).attr('color', MUTED);
        g.append('g').call(d3.axisLeft(yScale).ticks(5)).attr('color', MUTED);
        g.append('text').attr('x', pw / 2).attr('y', ph + 38).attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '11px').text('Number of readings (n)');
        g.append('text').attr('x', -ph / 2).attr('y', -42).attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '11px').attr('transform', 'rotate(-90)').text('σ / √n (relative)');

        // Curve: 1/sqrt(n)
        const pts = d3.range(1, 101).map(n => ({ n, y: 1 / Math.sqrt(n) }));
        g.append('path').attr('fill', 'none').attr('stroke', GOLD).attr('stroke-width', 2.5)
            .attr('d', d3.line().x(d => xScale(d.n)).y(d => yScale(d.y))(pts));

        // Area under curve
        g.append('path').attr('fill', 'rgba(250,204,21,0.08)')
            .attr('d', d3.area().x(d => xScale(d.n)).y0(yScale(0)).y1(d => yScale(d.y))(pts));

        // Key markers
        [1, 4, 10, 25, 100].forEach(n => {
            const val = 1 / Math.sqrt(n);
            g.append('circle').attr('cx', xScale(n)).attr('cy', yScale(val)).attr('r', 4).attr('fill', CYAN);
            g.append('text').attr('x', xScale(n) + 5).attr('y', yScale(val) - 8).attr('fill', CYAN).attr('font-size', '9px')
                .text(`n=${n}: ${(val * 100).toFixed(1)}%`);
        });

        g.append('text').attr('x', pw / 2).attr('y', -8).attr('text-anchor', 'middle').attr('fill', GOLD).attr('font-size', '12px')
            .text('Standard Error of Mean = σ / √n');
    }
}

// ══════════════════════════════════════════════════════════
// Calculator Modals & Wiring
// ══════════════════════════════════════════════════════════
function initEMCalculators() {
    // Open modals via data-calc buttons
    document.querySelectorAll('[data-calc^="em-"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const overlay = document.getElementById('modal-overlay');
            const modal = document.getElementById(`calc-${btn.dataset.calc}-modal`);
            if (overlay && modal) { overlay.style.display = 'block'; modal.style.display = 'block'; }
        });
    });

    // ── Error Calculator ──
    const setupCalc = (inputIds, resultId, computeFn) => {
        const inputs = inputIds.map(id => document.getElementById(id));
        const result = document.getElementById(resultId);
        if (!inputs.every(Boolean) || !result) return;
        const update = () => { result.textContent = computeFn(...inputs.map(el => parseFloat(el.value) || 0)); };
        inputs.forEach(el => el.addEventListener('input', update));
        update();
    };

    setupCalc(['em-err-am', 'em-err-at'], 'em-err-res', (am, at) => {
        const abs = am - at;
        const rel = at !== 0 ? (abs / at) * 100 : 0;
        const accPct = at !== 0 ? (1 - Math.abs(abs / at)) * 100 : 0;
        return `Abs Error: ${abs.toFixed(3)} | Rel: ${rel.toFixed(2)}% | %Acc: ${accPct.toFixed(2)}% | Correction: ${(-abs).toFixed(3)}`;
    });

    setupCalc(['em-lim-fs', 'em-lim-acc', 'em-lim-am'], 'em-lim-res', (fs, acc, am) => {
        const limErr = (acc / 100) * fs;
        const relAtReading = am !== 0 ? (limErr / am) * 100 : 0;
        return `Limiting Error: ±${limErr.toFixed(2)} | Relative at reading: ${relAtReading.toFixed(2)}%`;
    });

    // ── Propagation Calculator ──
    const propInputs = ['em-prop-a', 'em-prop-da', 'em-prop-b', 'em-prop-db'].map(id => document.getElementById(id));
    const propOp = document.getElementById('em-prop-op');
    const propRes = document.getElementById('em-prop-res');
    if (propInputs.every(Boolean) && propOp && propRes) {
        const updateProp = () => {
            const [A, dA, B, dB] = propInputs.map(el => parseFloat(el.value) || 0);
            const op = propOp.value;
            let result, dResult;
            if (op === 'sum') { result = A + B; dResult = Math.abs(dA) + Math.abs(dB); }
            else if (op === 'diff') { result = A - B; dResult = Math.abs(dA) + Math.abs(dB); }
            else if (op === 'prod') {
                result = A * B;
                dResult = result !== 0 ? Math.abs(result) * (Math.abs(dA / A) + Math.abs(dB / B)) : 0;
            } else if (op === 'quot') {
                result = B !== 0 ? A / B : 0;
                dResult = result !== 0 ? Math.abs(result) * (Math.abs(dA / A) + Math.abs(dB / B)) : 0;
            } else { // power
                result = Math.pow(A, B);
                dResult = result !== 0 && A !== 0 ? Math.abs(result) * Math.abs(B) * Math.abs(dA / A) : 0;
            }
            propRes.textContent = `Result: ${result.toFixed(4)} ± ${dResult.toFixed(4)} | Relative: ${result !== 0 ? ((dResult / Math.abs(result)) * 100).toFixed(2) : 0}%`;
        };
        [...propInputs, propOp].forEach(el => el.addEventListener('input', updateProp));
        propOp.addEventListener('change', updateProp);
        updateProp();
    }

    // ── Stats Modal Calculator ──
    const statsBtn = document.getElementById('btn-em-stats-modal-compute');
    const statsData = document.getElementById('em-stats-data');
    const statsRes = document.getElementById('em-stats-res');
    if (statsBtn && statsData && statsRes) {
        statsBtn.addEventListener('click', () => {
            const vals = statsData.value.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
            if (vals.length < 2) { statsRes.textContent = 'Need at least 2 data points'; return; }
            const n = vals.length;
            const mean = vals.reduce((a, b) => a + b, 0) / n;
            const devs = vals.map(v => v - mean);
            const sumD2 = devs.reduce((a, d) => a + d * d, 0);
            const sigma = Math.sqrt(sumD2 / (n < 20 ? n - 1 : n));
            const variance = sigma * sigma;
            const probErr = 0.6745 * sigma;
            const semean = sigma / Math.sqrt(n);
            const avgDev = devs.reduce((a, d) => a + Math.abs(d), 0) / n;
            statsRes.innerHTML =
                `<strong>n = ${n}</strong> (using ${n < 20 ? 'n-1' : 'n'} formula)<br>` +
                `Mean (X̄) = ${mean.toFixed(4)}<br>` +
                `Avg Deviation (D̄) = ${avgDev.toFixed(4)}<br>` +
                `Std Deviation (σ) = ${sigma.toFixed(4)}<br>` +
                `Variance (σ²) = ${variance.toFixed(4)}<br>` +
                `Probable Error (r) = ${probErr.toFixed(4)}<br>` +
                `Std Error of Mean (σ_X̄) = ${semean.toFixed(4)}<br>` +
                `True value ∈ [${(mean - semean).toFixed(4)}, ${(mean + semean).toFixed(4)}]`;
        });
    }
}
