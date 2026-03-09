// ═══════════════════════════════════════════════════════════════════
// measurements-ext.js  --  Cards 1.4 – 1.11 interactive visualisations
// D3 v7 · GSAP 3 · SVG  |  dark-theme palette
// ═══════════════════════════════════════════════════════════════════

/* ---------- colour tokens ---------- */
var GOLD   = '#facc15', CYAN  = '#00f5ff', GREEN  = '#00ff88',
    PURPLE = '#a78bfa', RED   = '#ef4444', ORANGE = '#f97316',
    BLUE   = '#60a5fa', ROSE  = '#fb7185', WHITE  = '#ffffff',
    MUTED  = '#94a3b8', BG    = '#0d1117';


// ═════════════════════════════════════
// 1.4  Methods of Measurement
// ═════════════════════════════════════
(function () {
    var container = document.getElementById('plot-em-methods');
    if (!container) return;

    var w = container.clientWidth || 440, h = 220;
    var svg = d3.select(container).append('svg')
        .attr('width', w).attr('height', h)
        .attr('viewBox', '0 0 ' + w + ' ' + h);

    var mid = w / 2;

    /* ── DIRECT panel (left) ── */
    var gDirect = svg.append('g').attr('class', 'panel-direct');

    // ammeter icon rectangle
    gDirect.append('rect')
        .attr('x', mid / 2 - 50).attr('y', 30).attr('width', 100).attr('height', 60)
        .attr('rx', 8).attr('fill', 'none').attr('stroke', GOLD).attr('stroke-width', 2);
    gDirect.append('text')
        .attr('x', mid / 2).attr('y', 68).attr('text-anchor', 'middle')
        .attr('fill', GOLD).attr('font-size', 22).attr('font-weight', 'bold').text('A');
    // needle
    gDirect.append('line')
        .attr('x1', mid / 2 - 20).attr('y1', 80).attr('x2', mid / 2 + 20).attr('y2', 50)
        .attr('stroke', RED).attr('stroke-width', 2);
    // title
    gDirect.append('text')
        .attr('x', mid / 2).attr('y', 120).attr('text-anchor', 'middle')
        .attr('fill', WHITE).attr('font-size', 13).attr('font-weight', 600).text('DIRECT');
    gDirect.append('text')
        .attr('x', mid / 2).attr('y', 140).attr('text-anchor', 'middle')
        .attr('fill', MUTED).attr('font-size', 10).text('Read quantity directly');

    // badge
    gDirect.append('rect')
        .attr('x', mid / 2 - 42).attr('y', 155).attr('width', 84).attr('height', 22)
        .attr('rx', 4).attr('fill', 'rgba(239,68,68,0.15)').attr('stroke', RED);
    gDirect.append('text')
        .attr('x', mid / 2).attr('y', 170).attr('text-anchor', 'middle')
        .attr('fill', RED).attr('font-size', 10).attr('font-weight', 700).text('INACCURATE');

    /* ── INDIRECT panel (right) ── */
    var gIndirect = svg.append('g').attr('class', 'panel-indirect');

    var rx = mid + mid / 2;
    gIndirect.append('text')
        .attr('x', rx).attr('y', 42).attr('text-anchor', 'middle')
        .attr('fill', CYAN).attr('font-size', 15).attr('font-weight', 700).text('V');
    gIndirect.append('text')
        .attr('x', rx).attr('y', 60).attr('text-anchor', 'middle')
        .attr('fill', MUTED).attr('font-size', 11).text('+');
    gIndirect.append('text')
        .attr('x', rx).attr('y', 78).attr('text-anchor', 'middle')
        .attr('fill', GREEN).attr('font-size', 15).attr('font-weight', 700).text('I');
    gIndirect.append('text')
        .attr('x', rx).attr('y', 100).attr('text-anchor', 'middle')
        .attr('fill', WHITE).attr('font-size', 13).text('\u2192  P = V \u00D7 I');

    gIndirect.append('text')
        .attr('x', rx).attr('y', 124).attr('text-anchor', 'middle')
        .attr('fill', WHITE).attr('font-size', 13).attr('font-weight', 600).text('INDIRECT');
    gIndirect.append('text')
        .attr('x', rx).attr('y', 142).attr('text-anchor', 'middle')
        .attr('fill', MUTED).attr('font-size', 10).text('Compute from related quantities');

    // badge
    gIndirect.append('rect')
        .attr('x', rx - 48).attr('y', 155).attr('width', 96).attr('height', 22)
        .attr('rx', 4).attr('fill', 'rgba(0,255,136,0.12)').attr('stroke', GREEN);
    gIndirect.append('text')
        .attr('x', rx).attr('y', 170).attr('text-anchor', 'middle')
        .attr('fill', GREEN).attr('font-size', 10).attr('font-weight', 700).text('ACCURATE \u2713');

    // divider
    svg.append('line')
        .attr('x1', mid).attr('y1', 10).attr('x2', mid).attr('y2', h - 10)
        .attr('stroke', 'rgba(255,255,255,0.08)').attr('stroke-width', 1).attr('stroke-dasharray', '4 4');

    /* ── initial state: show direct ── */
    gIndirect.attr('opacity', 0.25);

    var btnDirect   = document.getElementById('btn-direct');
    var btnIndirect = document.getElementById('btn-indirect');
    if (!btnDirect || !btnIndirect) return;

    btnDirect.addEventListener('click', function () {
        btnDirect.classList.add('active');
        btnIndirect.classList.remove('active');
        gsap.to(gDirect.node(),   { opacity: 1,    duration: 0.4 });
        gsap.to(gIndirect.node(), { opacity: 0.25,  duration: 0.4 });
    });
    btnIndirect.addEventListener('click', function () {
        btnIndirect.classList.add('active');
        btnDirect.classList.remove('active');
        gsap.to(gIndirect.node(), { opacity: 1,    duration: 0.4 });
        gsap.to(gDirect.node(),   { opacity: 0.25,  duration: 0.4 });
    });
})();


// ═════════════════════════════════════
// 1.5  Classification of Instruments
// ═════════════════════════════════════
(function () {
    var container = document.getElementById('plot-em-classify');
    if (!container) return;

    var w = container.clientWidth || 440, h = 220;
    var svg = d3.select(container).append('svg')
        .attr('width', w).attr('height', h)
        .attr('viewBox', '0 0 ' + w + ' ' + h);

    /* ---------- view: classification tree ---------- */
    var gTree = svg.append('g').attr('class', 'tree-view');

    var rootX = w / 2, rootY = 22;
    gTree.append('rect')
        .attr('x', rootX - 48).attr('y', 8).attr('width', 96).attr('height', 24).attr('rx', 5)
        .attr('fill', 'rgba(250,204,21,0.15)').attr('stroke', GOLD);
    gTree.append('text')
        .attr('x', rootX).attr('y', 25).attr('text-anchor', 'middle')
        .attr('fill', GOLD).attr('font-size', 11).attr('font-weight', 700).text('Instruments');

    var branches = [
        { label: 'Absolute / Secondary', color: CYAN,   ex: 'Tangent Galv. / Ammeter' },
        { label: 'Deflection / Null',    color: GREEN,  ex: 'PMMC / Wheatstone Bridge' },
        { label: 'Recording / Integrating', color: PURPLE, ex: 'Strip chart / kWh meter' }
    ];
    var spacing = w / (branches.length + 1);

    branches.forEach(function (b, i) {
        var bx = spacing * (i + 1), by = 70;
        gTree.append('line')
            .attr('x1', rootX).attr('y1', 32).attr('x2', bx).attr('y2', by - 12)
            .attr('stroke', b.color).attr('stroke-width', 1.5);
        gTree.append('rect')
            .attr('x', bx - 62).attr('y', by - 12).attr('width', 124).attr('height', 22).attr('rx', 4)
            .attr('fill', 'rgba(255,255,255,0.04)').attr('stroke', b.color).attr('stroke-width', 1);
        gTree.append('text')
            .attr('x', bx).attr('y', by + 3).attr('text-anchor', 'middle')
            .attr('fill', b.color).attr('font-size', 9).attr('font-weight', 600).text(b.label);
        // examples
        gTree.append('text')
            .attr('x', bx).attr('y', by + 22).attr('text-anchor', 'middle')
            .attr('fill', MUTED).attr('font-size', 8).text(b.ex);
    });

    /* ---------- view: deflection vs null ---------- */
    var gDeflNull = svg.append('g').attr('class', 'defl-null-view').attr('opacity', 0);

    // shared helper to draw a simple meter dial
    function drawMeter(g, cx, cy, label, color) {
        g.append('path')
            .attr('d', 'M ' + (cx - 50) + ' ' + (cy + 20) + ' A 50 50 0 0 1 ' + (cx + 50) + ' ' + (cy + 20))
            .attr('fill', 'none').attr('stroke', MUTED).attr('stroke-width', 2);
        // ticks
        for (var a = 0; a <= 180; a += 30) {
            var rad = a * Math.PI / 180;
            var x1 = cx - 50 * Math.cos(rad), y1 = cy + 20 - 50 * Math.sin(rad);
            var x2 = cx - 42 * Math.cos(rad), y2 = cy + 20 - 42 * Math.sin(rad);
            g.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
                .attr('stroke', MUTED).attr('stroke-width', 1);
        }
        // pivot
        g.append('circle').attr('cx', cx).attr('cy', cy + 20).attr('r', 3).attr('fill', WHITE);
        // label
        g.append('text')
            .attr('x', cx).attr('y', cy + 46).attr('text-anchor', 'middle')
            .attr('fill', color).attr('font-size', 11).attr('font-weight', 600).text(label);
        return g;
    }

    var dMeterG = gDeflNull.append('g');
    drawMeter(dMeterG, w / 4, 90, 'Deflection', GREEN);
    // deflection needle (animated)
    var deflNeedle = dMeterG.append('line')
        .attr('x1', w / 4).attr('y1', 110).attr('x2', w / 4).attr('y2', 60)
        .attr('stroke', GREEN).attr('stroke-width', 2).attr('stroke-linecap', 'round');

    var nMeterG = gDeflNull.append('g');
    drawMeter(nMeterG, 3 * w / 4, 90, 'Null (Zero)', CYAN);
    // null needle (stays at zero = left)
    nMeterG.append('line')
        .attr('x1', 3 * w / 4).attr('y1', 110).attr('x2', 3 * w / 4 - 44).attr('y2', 72)
        .attr('stroke', CYAN).attr('stroke-width', 2).attr('stroke-linecap', 'round');

    gDeflNull.append('text')
        .attr('x', w / 4).attr('y', 170).attr('text-anchor', 'middle')
        .attr('fill', MUTED).attr('font-size', 9).text('Pointer shows value');
    gDeflNull.append('text')
        .attr('x', 3 * w / 4).attr('y', 170).attr('text-anchor', 'middle')
        .attr('fill', MUTED).attr('font-size', 9).text('Adjusted until null');

    // deflection needle GSAP swing
    var deflTween;
    function animateDefl() {
        var cx = w / 4, cy = 110;
        deflTween = gsap.fromTo(deflNeedle.node(),
            { attr: { x2: cx - 44, y2: 72 } },
            { attr: { x2: cx + 30, y2: 70 }, duration: 1.5, ease: 'power2.inOut', yoyo: true, repeat: -1 }
        );
    }

    /* ── toggle buttons ── */
    var btnTree = document.getElementById('btn-class-tree');
    var btnDN   = document.getElementById('btn-defl-null');
    if (!btnTree || !btnDN) return;

    btnTree.addEventListener('click', function () {
        btnTree.classList.add('active');  btnDN.classList.remove('active');
        gsap.to(gTree.node(),     { opacity: 1, duration: 0.4 });
        gsap.to(gDeflNull.node(), { opacity: 0, duration: 0.4 });
        if (deflTween) deflTween.kill();
    });
    btnDN.addEventListener('click', function () {
        btnDN.classList.add('active');  btnTree.classList.remove('active');
        gsap.to(gTree.node(),     { opacity: 0, duration: 0.4 });
        gsap.to(gDeflNull.node(), { opacity: 1, duration: 0.4 });
        animateDefl();
    });
})();


// ═════════════════════════════════════
// 1.6  Static Characteristics
// ═════════════════════════════════════
(function () {
    var container = document.getElementById('plot-em-static');
    if (!container) return;

    var w = container.clientWidth || 500, h = 250;
    var svg = d3.select(container).append('svg')
        .attr('width', w).attr('height', h)
        .attr('viewBox', '0 0 ' + w + ' ' + h);

    /* create four layer groups — only one visible at a time */
    var gAccPrec    = svg.append('g').attr('class', 'layer-accprec');
    var gSensitiv   = svg.append('g').attr('class', 'layer-sens').attr('opacity', 0);
    var gDeadZone   = svg.append('g').attr('class', 'layer-dz').attr('opacity', 0);
    var gResolution = svg.append('g').attr('class', 'layer-res').attr('opacity', 0);

    /* ── A) Accuracy vs Precision bullseye ── */
    var bCx = w / 2, bCy = 105;
    [90, 65, 40, 15].forEach(function (r, i) {
        gAccPrec.append('circle')
            .attr('cx', bCx).attr('cy', bCy).attr('r', r)
            .attr('fill', i === 3 ? 'rgba(0,255,136,0.18)' : 'none')
            .attr('stroke', i === 3 ? GREEN : 'rgba(255,255,255,' + (0.08 + i * 0.04) + ')')
            .attr('stroke-width', 1.5);
    });
    // center cross-hair
    gAccPrec.append('line').attr('x1', bCx - 5).attr('y1', bCy).attr('x2', bCx + 5).attr('y2', bCy).attr('stroke', MUTED).attr('stroke-width', 1);
    gAccPrec.append('line').attr('x1', bCx).attr('y1', bCy - 5).attr('x2', bCx).attr('y2', bCy + 5).attr('stroke', MUTED).attr('stroke-width', 1);

    var dotData = {
        'ap':      [{ x: 0, y: 0 },{ x: 3, y: -4 },{ x: -3, y: 2 },{ x: 4, y: 3 },{ x: -2, y: -3 }],
        'p_only':  [{ x: 55, y: -55 },{ x: 58, y: -52 },{ x: 53, y: -57 },{ x: 56, y: -50 },{ x: 54, y: -54 }],
        'a_only':  [{ x: 0, y: -30 },{ x: -35, y: 20 },{ x: 30, y: -10 },{ x: -10, y: 35 },{ x: 25, y: 25 }],
        'neither': [{ x: -60, y: 40 },{ x: 50, y: -60 },{ x: -40, y: -50 },{ x: 60, y: 30 },{ x: 20, y: 65 }]
    };
    var dots = [];
    for (var di = 0; di < 5; di++) {
        dots.push(
            gAccPrec.append('circle').attr('cx', bCx).attr('cy', bCy).attr('r', 5).attr('fill', GOLD)
        );
    }
    var accLabel = gAccPrec.append('text')
        .attr('x', bCx).attr('y', h - 10).attr('text-anchor', 'middle')
        .attr('fill', WHITE).attr('font-size', 11).attr('font-weight', 600).text('Accurate & Precise');

    var accCases = ['ap', 'p_only', 'a_only', 'neither'];
    var accNames = ['Accurate & Precise', 'Precise Only', 'Accurate Only', 'Neither'];
    var currentCase = 0;

    function setAccCase(idx) {
        currentCase = idx;
        var key = accCases[idx];
        var pts = dotData[key];
        dots.forEach(function (d, i) {
            gsap.to(d.node(), { attr: { cx: bCx + pts[i].x, cy: bCy + pts[i].y }, duration: 0.5, ease: 'back.out(1.5)' });
        });
        accLabel.text(accNames[idx]);
    }

    // cycle on click within layer
    gAccPrec.style('cursor', 'pointer').on('click', function () {
        setAccCase((currentCase + 1) % 4);
    });
    setAccCase(0);

    /* ── B) Sensitivity: y = k*x line with adjustable slope ── */
    var margin = { t: 20, r: 20, b: 30, l: 40 };
    var pw = w - margin.l - margin.r, ph = h - margin.t - margin.b;
    var xS = d3.scaleLinear().domain([0, 10]).range([0, pw]);
    var yS = d3.scaleLinear().domain([0, 100]).range([ph, 0]);

    var gSensInner = gSensitiv.append('g').attr('transform', 'translate(' + margin.l + ',' + margin.t + ')');
    // axes
    gSensInner.append('line').attr('x1', 0).attr('y1', ph).attr('x2', pw).attr('y2', ph).attr('stroke', MUTED);
    gSensInner.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', ph).attr('stroke', MUTED);
    gSensInner.append('text').attr('x', pw / 2).attr('y', ph + 22).attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', 10).text('Input');
    gSensInner.append('text').attr('x', -25).attr('y', ph / 2).attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', 10).attr('transform', 'rotate(-90,' + (-25) + ',' + (ph / 2) + ')').text('Output');

    var sensSlope = 5;
    var sensLine = gSensInner.append('line')
        .attr('x1', xS(0)).attr('y1', yS(0)).attr('x2', xS(10)).attr('y2', yS(sensSlope * 10))
        .attr('stroke', CYAN).attr('stroke-width', 2);
    var sensText = gSensInner.append('text')
        .attr('x', pw - 10).attr('y', 15).attr('text-anchor', 'end')
        .attr('fill', CYAN).attr('font-size', 11).text('S = 5.0');

    // interactive: click left half = decrease, right half = increase
    gSensitiv.style('cursor', 'pointer').on('click', function (event) {
        var rect = container.getBoundingClientRect();
        var mx = (event ? event.clientX : 0) - rect.left;
        if (mx < w / 2) { sensSlope = Math.max(1, sensSlope - 1); }
        else { sensSlope = Math.min(10, sensSlope + 1); }
        sensLine.transition().duration(300)
            .attr('y2', yS(Math.min(100, sensSlope * 10)));
        sensText.text('S = ' + sensSlope.toFixed(1));
    });

    /* ── C) Dead Zone chart ── */
    var gDZInner = gDeadZone.append('g').attr('transform', 'translate(' + margin.l + ',' + margin.t + ')');
    gDZInner.append('line').attr('x1', 0).attr('y1', ph).attr('x2', pw).attr('y2', ph).attr('stroke', MUTED);
    gDZInner.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', ph).attr('stroke', MUTED);

    // dead zone region
    var dzWidth = pw * 0.15;
    gDZInner.append('rect')
        .attr('x', 0).attr('y', 0).attr('width', dzWidth).attr('height', ph)
        .attr('fill', 'rgba(239,68,68,0.1)');
    gDZInner.append('text')
        .attr('x', dzWidth / 2).attr('y', ph / 2).attr('text-anchor', 'middle')
        .attr('fill', RED).attr('font-size', 9).attr('font-weight', 600).text('DEAD');
    gDZInner.append('text')
        .attr('x', dzWidth / 2).attr('y', ph / 2 + 12).attr('text-anchor', 'middle')
        .attr('fill', RED).attr('font-size', 9).attr('font-weight', 600).text('ZONE');

    // transfer curve after dead zone
    var dzLineData = [];
    for (var xi = 0; xi <= 10; xi += 0.2) {
        var yi = xi <= 1.5 ? 0 : (xi - 1.5) * 11.76;
        dzLineData.push({ x: xi, y: Math.min(100, yi) });
    }
    var dzLine = d3.line().x(function (d) { return xS(d.x); }).y(function (d) { return yS(d.y); }).curve(d3.curveMonotoneX);
    gDZInner.append('path').datum(dzLineData).attr('d', dzLine)
        .attr('fill', 'none').attr('stroke', ORANGE).attr('stroke-width', 2);

    gDZInner.append('text').attr('x', pw / 2).attr('y', ph + 22).attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', 10).text('Input');

    /* ── D) Resolution ruler ── */
    var rulerY = 80, rulerH = 40;
    gResolution.append('rect')
        .attr('x', 40).attr('y', rulerY).attr('width', w - 80).attr('height', rulerH)
        .attr('rx', 4).attr('fill', 'rgba(255,255,255,0.03)').attr('stroke', MUTED);

    var divisions = 10;
    var tickGroup = gResolution.append('g').attr('class', 'ruler-ticks');
    var resLabel  = gResolution.append('text')
        .attr('x', w / 2).attr('y', rulerY + rulerH + 30).attr('text-anchor', 'middle')
        .attr('fill', BLUE).attr('font-size', 11).text('Divisions: 10  |  Resolution = FSD/10');
    var resNote   = gResolution.append('text')
        .attr('x', w / 2).attr('y', rulerY - 12).attr('text-anchor', 'middle')
        .attr('fill', MUTED).attr('font-size', 9).text('Click to change divisions (5 \u2192 10 \u2192 20 \u2192 50)');

    function drawRulerTicks(n) {
        tickGroup.selectAll('*').remove();
        var rw = w - 80;
        for (var t = 0; t <= n; t++) {
            var tx = 40 + (t / n) * rw;
            var isMajor = (t % (n / 5 | 1) === 0) || t === 0 || t === n;
            var th = isMajor ? rulerH : rulerH * 0.5;
            tickGroup.append('line')
                .attr('x1', tx).attr('y1', rulerY).attr('x2', tx).attr('y2', rulerY + th)
                .attr('stroke', isMajor ? BLUE : MUTED).attr('stroke-width', isMajor ? 2 : 1);
            if (isMajor) {
                tickGroup.append('text')
                    .attr('x', tx).attr('y', rulerY + rulerH + 14).attr('text-anchor', 'middle')
                    .attr('fill', MUTED).attr('font-size', 8).text(t);
            }
        }
        resLabel.text('Divisions: ' + n + '  |  Resolution = FSD/' + n);
    }
    drawRulerTicks(10);

    var divOptions = [5, 10, 20, 50];
    var divIdx = 1;
    gResolution.style('cursor', 'pointer').on('click', function () {
        divIdx = (divIdx + 1) % divOptions.length;
        drawRulerTicks(divOptions[divIdx]);
    });

    /* ── button wiring ── */
    var layers = [gAccPrec, gSensitiv, gDeadZone, gResolution];
    var btnIds = ['btn-acc-prec', 'btn-sensitivity', 'btn-deadzone', 'btn-resolution'];
    var btns   = btnIds.map(function (id) { return document.getElementById(id); });

    function showLayer(idx) {
        btns.forEach(function (b, i) {
            if (!b) return;
            if (i === idx) b.classList.add('active');
            else           b.classList.remove('active');
        });
        layers.forEach(function (g, i) {
            gsap.to(g.node(), { opacity: i === idx ? 1 : 0, duration: 0.35 });
        });
    }

    btns.forEach(function (b, i) {
        if (!b) return;
        b.addEventListener('click', function () { showLayer(i); });
    });
})();


// ═════════════════════════════════════
// 1.7  Errors in Measurement (Gaussian)
// ═════════════════════════════════════
(function () {
    var container = document.getElementById('plot-em-errors');
    if (!container) return;

    var w = container.clientWidth || 500, h = 220;
    var margin = { t: 20, r: 15, b: 25, l: 15 };
    var pw = w - margin.l - margin.r, ph = h - margin.t - margin.b;

    var svgEl = d3.select(container).append('svg')
        .attr('width', w).attr('height', h);
    var g = svgEl.append('g').attr('transform', 'translate(' + margin.l + ',' + margin.t + ')');

    var mean = pw / 2;

    // axis
    g.append('line').attr('x1', 0).attr('y1', ph).attr('x2', pw).attr('y2', ph).attr('stroke', MUTED).attr('stroke-width', 1);

    // groups for bands and curve
    var bandGroup = g.append('g');
    var curvePath = g.append('path').attr('fill', 'none').attr('stroke', GREEN).attr('stroke-width', 2.5);
    var labelGroup = g.append('g');

    function gaussian(x, mu, sd) {
        var z = (x - mu) / sd;
        return (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
    }

    function render(sd) {
        /* ── build data ── */
        var pts = [];
        for (var x = 0; x <= pw; x += 2) {
            var yVal = gaussian(x, mean, sd);
            pts.push({ x: x, y: yVal });
        }
        var maxY = gaussian(mean, mean, sd);
        var yScale = d3.scaleLinear().domain([0, maxY]).range([ph, 0]);

        /* ── coloured bands ── */
        bandGroup.selectAll('*').remove();

        var bands = [
            { n: 3, color: 'rgba(96,165,250,0.10)',  label: '\u00B13\u03C3 (99.7%)' },
            { n: 2, color: 'rgba(167,139,250,0.15)', label: '\u00B12\u03C3 (95.5%)' },
            { n: 1, color: 'rgba(0,255,136,0.25)',   label: '\u00B11\u03C3 (68.3%)' }
        ];

        var areaGen = d3.area()
            .x(function (d) { return d.x; })
            .y0(ph)
            .y1(function (d) { return yScale(d.y); })
            .curve(d3.curveBasis);

        bands.forEach(function (b) {
            var filtered = pts.filter(function (d) { return d.x >= mean - b.n * sd && d.x <= mean + b.n * sd; });
            bandGroup.append('path').datum(filtered).attr('d', areaGen).attr('fill', b.color);
        });

        /* ── curve ── */
        var lineGen = d3.line().x(function (d) { return d.x; }).y(function (d) { return yScale(d.y); }).curve(d3.curveBasis);
        curvePath.datum(pts).attr('d', lineGen);

        /* ── labels ── */
        labelGroup.selectAll('*').remove();
        // mean line
        labelGroup.append('line')
            .attr('x1', mean).attr('y1', 0).attr('x2', mean).attr('y2', ph)
            .attr('stroke', WHITE).attr('stroke-dasharray', '3 3').attr('stroke-width', 1);
        labelGroup.append('text')
            .attr('x', mean).attr('y', -4).attr('text-anchor', 'middle')
            .attr('fill', WHITE).attr('font-size', 10).text('\u03BC');

        // sigma markers
        var sigmaColors = [GREEN, PURPLE, BLUE];
        var sigmaLabels = ['68.3%', '95.5%', '99.7%'];
        [1, 2, 3].forEach(function (n, i) {
            var xPos = mean + n * sd;
            if (xPos < pw) {
                labelGroup.append('text')
                    .attr('x', xPos).attr('y', ph + 14).attr('text-anchor', 'middle')
                    .attr('fill', sigmaColors[i]).attr('font-size', 8).text('+' + n + '\u03C3');
            }
            var xNeg = mean - n * sd;
            if (xNeg > 0) {
                labelGroup.append('text')
                    .attr('x', xNeg).attr('y', ph + 14).attr('text-anchor', 'middle')
                    .attr('fill', sigmaColors[i]).attr('font-size', 8).text('-' + n + '\u03C3');
            }
        });

        // percentage at center
        labelGroup.append('text')
            .attr('x', mean).attr('y', ph - 10).attr('text-anchor', 'middle')
            .attr('fill', BG).attr('font-size', 10).attr('font-weight', 700).text('68.3%');
    }

    /* ── slider wiring ── */
    var slider  = document.getElementById('em-sigma-slider');
    var display = document.getElementById('em-sigma-val');

    if (slider) {
        slider.addEventListener('input', function () {
            var sd = parseInt(this.value);
            if (display) display.textContent = sd;
            render(sd);
        });
    }
    render(15);
})();


// ═════════════════════════════════════
// 1.8  Limiting Error & Static Correction
// ═════════════════════════════════════
(function () {
    var container = document.getElementById('plot-em-correction');
    if (!container) return;

    var w = container.clientWidth || 400, h = 220;
    var svg = d3.select(container).append('svg')
        .attr('width', w).attr('height', h)
        .attr('viewBox', '0 0 ' + w + ' ' + h);

    var lineY = 80, pad = 40;
    var lineW = w - 2 * pad;

    // number line
    svg.append('line')
        .attr('x1', pad).attr('y1', lineY).attr('x2', w - pad).attr('y2', lineY)
        .attr('stroke', MUTED).attr('stroke-width', 2);

    // ticks
    for (var t = 0; t <= 10; t++) {
        var tx = pad + (t / 10) * lineW;
        svg.append('line').attr('x1', tx).attr('y1', lineY - 6).attr('x2', tx).attr('y2', lineY + 6).attr('stroke', MUTED).attr('stroke-width', 1);
        svg.append('text').attr('x', tx).attr('y', lineY + 18).attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', 8).text(t);
    }

    // At (true value) - fixed
    var atVal = 5;
    var atX = pad + (atVal / 10) * lineW;
    svg.append('circle').attr('cx', atX).attr('cy', lineY).attr('r', 6).attr('fill', CYAN);
    svg.append('text').attr('x', atX).attr('y', lineY - 14).attr('text-anchor', 'middle').attr('fill', CYAN).attr('font-size', 10).attr('font-weight', 600).text('At = 5');

    // Am (measured) - movable
    var amVal = 5.3;
    var amX = pad + (amVal / 10) * lineW;

    var amMarker = svg.append('circle').attr('cx', amX).attr('cy', lineY).attr('r', 6).attr('fill', GOLD);
    var amLabel  = svg.append('text').attr('x', amX).attr('y', lineY - 14).attr('text-anchor', 'middle').attr('fill', GOLD).attr('font-size', 10).attr('font-weight', 600).text('Am = 5.3');

    // error arrow (red)
    var errArrow = svg.append('line')
        .attr('x1', atX).attr('y1', lineY + 30).attr('x2', amX).attr('y2', lineY + 30)
        .attr('stroke', RED).attr('stroke-width', 2).attr('marker-end', 'url(#arrowRed)');
    var errText = svg.append('text')
        .attr('x', (atX + amX) / 2).attr('y', lineY + 46).attr('text-anchor', 'middle')
        .attr('fill', RED).attr('font-size', 9).attr('font-weight', 600).text('\u03B4A = +0.30');

    // correction arrow (green dashed)
    var corrArrow = svg.append('line')
        .attr('x1', amX).attr('y1', lineY + 56).attr('x2', atX).attr('y2', lineY + 56)
        .attr('stroke', GREEN).attr('stroke-width', 2).attr('stroke-dasharray', '5 3').attr('marker-end', 'url(#arrowGreen)');
    var corrText = svg.append('text')
        .attr('x', (atX + amX) / 2).attr('y', lineY + 72).attr('text-anchor', 'middle')
        .attr('fill', GREEN).attr('font-size', 9).attr('font-weight', 600).text('\u03B4C = -0.30');

    // arrowhead markers
    var defs = svg.append('defs');
    function addArrowMarker(id, color) {
        defs.append('marker')
            .attr('id', id).attr('viewBox', '0 0 10 10').attr('refX', 8).attr('refY', 5)
            .attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto-start-reverse')
            .append('path').attr('d', 'M 0 0 L 10 5 L 0 10 Z').attr('fill', color);
    }
    addArrowMarker('arrowRed', RED);
    addArrowMarker('arrowGreen', GREEN);

    // result text
    var resultText = svg.append('text')
        .attr('x', w / 2).attr('y', h - 16).attr('text-anchor', 'middle')
        .attr('fill', WHITE).attr('font-size', 10).text('Correction \u03B4C = At - Am = -\u03B4A   |   At = Am + \u03B4C');

    // slider area (click on number line to move Am)
    svg.append('rect')
        .attr('x', pad).attr('y', lineY - 20).attr('width', lineW).attr('height', 40)
        .attr('fill', 'transparent').style('cursor', 'pointer')
        .on('click', function (event) {
            var rect = container.getBoundingClientRect();
            var mx = (event ? event.clientX : 0) - rect.left - pad;
            var newAm = Math.max(0, Math.min(10, (mx / lineW) * 10));
            var newAmX = pad + (newAm / 10) * lineW;
            var delta = newAm - atVal;

            gsap.to(amMarker.node(), { attr: { cx: newAmX }, duration: 0.3 });
            amLabel.attr('x', newAmX).text('Am = ' + newAm.toFixed(1));

            errArrow.attr('x2', newAmX).attr('y1', lineY + 30).attr('y2', lineY + 30);
            errText.attr('x', (atX + newAmX) / 2).text('\u03B4A = ' + (delta >= 0 ? '+' : '') + delta.toFixed(2));

            corrArrow.attr('x1', newAmX);
            corrText.attr('x', (atX + newAmX) / 2).text('\u03B4C = ' + (delta >= 0 ? '-' : '+') + Math.abs(delta).toFixed(2));
        });
})();


// ═════════════════════════════════════
// 1.9  Combination of Errors
// ═════════════════════════════════════
(function () {
    var container = document.getElementById('plot-em-combination');
    if (!container) return;

    var w = container.clientWidth || 400, h = 220;
    var margin = { t: 25, r: 15, b: 35, l: 45 };
    var pw = w - margin.l - margin.r;
    var ph = h - margin.t - margin.b;

    var svgEl = d3.select(container).append('svg')
        .attr('width', w).attr('height', h);
    var g = svgEl.append('g').attr('transform', 'translate(' + margin.l + ',' + margin.t + ')');

    // P = V^2 / R  =>  dP/P = 2(dV/V) + dR/R
    var dvV = 2, drR = 1;           // percent
    var dpP = 2 * dvV + drR;       // 5%

    var data = [
        { label: '\u03B4V/V',  val: dvV,  color: CYAN },
        { label: '\u03B4R/R',  val: drR,  color: ORANGE },
        { label: '\u03B4P/P',  val: dpP,  color: GREEN }
    ];

    var xScale = d3.scaleBand().domain(data.map(function (d) { return d.label; })).range([0, pw]).padding(0.35);
    var yScale = d3.scaleLinear().domain([0, 8]).range([ph, 0]);

    // axes
    g.append('line').attr('x1', 0).attr('y1', ph).attr('x2', pw).attr('y2', ph).attr('stroke', MUTED);
    g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', ph).attr('stroke', MUTED);

    // y-axis label
    g.append('text').attr('x', -30).attr('y', ph / 2).attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', 9)
        .attr('transform', 'rotate(-90,' + (-30) + ',' + (ph / 2) + ')').text('% Error');

    // title
    g.append('text').attr('x', pw / 2).attr('y', -8).attr('text-anchor', 'middle').attr('fill', WHITE).attr('font-size', 11)
        .attr('font-weight', 600).text('P = V\u00B2/R  Error Propagation');

    // bars
    data.forEach(function (d) {
        var barX = xScale(d.label);
        var barW = xScale.bandwidth();
        var barH = ph - yScale(d.val);

        g.append('rect')
            .attr('x', barX).attr('y', yScale(d.val)).attr('width', barW).attr('height', barH)
            .attr('rx', 3).attr('fill', d.color).attr('opacity', 0.85);

        // value on top
        g.append('text')
            .attr('x', barX + barW / 2).attr('y', yScale(d.val) - 6).attr('text-anchor', 'middle')
            .attr('fill', d.color).attr('font-size', 11).attr('font-weight', 700).text(d.val + '%');

        // label below axis
        g.append('text')
            .attr('x', barX + barW / 2).attr('y', ph + 16).attr('text-anchor', 'middle')
            .attr('fill', WHITE).attr('font-size', 10).text(d.label);
    });

    // badge: "x2 impact!" on voltage bar
    var vBarX = xScale('\u03B4V/V') + xScale.bandwidth() / 2;
    g.append('rect')
        .attr('x', vBarX - 28).attr('y', yScale(dvV) - 28).attr('width', 56).attr('height', 16).attr('rx', 3)
        .attr('fill', 'rgba(239,68,68,0.2)').attr('stroke', RED);
    g.append('text')
        .attr('x', vBarX).attr('y', yScale(dvV) - 17).attr('text-anchor', 'middle')
        .attr('fill', RED).attr('font-size', 8).attr('font-weight', 700).text('\u00D72 impact!');

    // formula note
    g.append('text')
        .attr('x', pw / 2).attr('y', ph + 30).attr('text-anchor', 'middle')
        .attr('fill', MUTED).attr('font-size', 8).text('\u03B4P/P = 2(\u03B4V/V) + \u03B4R/R = 2(2%) + 1% = 5%');
})();


// ═════════════════════════════════════
// 1.10  Statistics Calculator & Plot
// ═════════════════════════════════════
(function () {
    var container = document.getElementById('plot-em-stats');
    if (!container) return;

    var input   = document.getElementById('em-stat-input');
    var btnComp = document.getElementById('btn-stat-compute');
    var results = document.getElementById('em-stat-results');
    if (!input || !btnComp) return;

    var w = container.clientWidth || 500, h = 200;

    function compute() {
        /* ── parse data ── */
        var raw = input.value.split(',');
        var data = [];
        raw.forEach(function (s) {
            var v = parseFloat(s.trim());
            if (!isNaN(v)) data.push(v);
        });
        if (data.length < 2) {
            if (results) results.innerHTML = '<span style="color:' + RED + '">Need at least 2 data points.</span>';
            return;
        }

        /* ── statistics ── */
        var n = data.length;
        var sum = 0;
        data.forEach(function (v) { sum += v; });
        var mean = sum / n;

        var ssq = 0;
        data.forEach(function (v) { ssq += (v - mean) * (v - mean); });
        var sigma = Math.sqrt(ssq / (n - 1));
        var variance = sigma * sigma;
        var probError = 0.6745 * sigma;
        var stdErrorMean = sigma / Math.sqrt(n);

        /* ── display results ── */
        if (results) {
            results.innerHTML =
                '<span style="color:' + GOLD + '">Mean = ' + mean.toFixed(4) + '</span> &nbsp;|&nbsp; ' +
                '<span style="color:' + CYAN + '">\u03C3 = ' + sigma.toFixed(4) + '</span> &nbsp;|&nbsp; ' +
                '<span style="color:' + PURPLE + '">V = ' + variance.toFixed(4) + '</span> &nbsp;|&nbsp; ' +
                '<span style="color:' + GREEN + '">r = ' + probError.toFixed(4) + '</span> &nbsp;|&nbsp; ' +
                '<span style="color:' + ORANGE + '">S\u0305 = ' + stdErrorMean.toFixed(4) + '</span>';
        }

        /* ── render plot ── */
        d3.select(container).select('svg').remove();

        var margin = { t: 15, r: 10, b: 25, l: 10 };
        var pw = w - margin.l - margin.r, ph = h - margin.t - margin.b;

        var svgEl = d3.select(container).append('svg').attr('width', w).attr('height', h);
        var g = svgEl.append('g').attr('transform', 'translate(' + margin.l + ',' + margin.t + ')');

        var minV = d3.min(data) - 2 * sigma;
        var maxV = d3.max(data) + 2 * sigma;
        if (minV === maxV) { minV -= 1; maxV += 1; }
        var xS = d3.scaleLinear().domain([minV, maxV]).range([0, pw]);

        // axis
        g.append('line').attr('x1', 0).attr('y1', ph).attr('x2', pw).attr('y2', ph).attr('stroke', MUTED);

        /* ── Gaussian overlay ── */
        var gPts = [];
        var step = (maxV - minV) / 200;
        for (var v = minV; v <= maxV; v += step) {
            var z = (v - mean) / sigma;
            var pdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
            gPts.push({ x: v, y: pdf });
        }
        var maxPdf = d3.max(gPts, function (d) { return d.y; });
        var yS = d3.scaleLinear().domain([0, maxPdf * 1.15]).range([ph, 0]);

        // sigma bands
        var areaGen = d3.area()
            .x(function (d) { return xS(d.x); })
            .y0(ph)
            .y1(function (d) { return yS(d.y); })
            .curve(d3.curveBasis);

        var s1 = gPts.filter(function (d) { return d.x >= mean - sigma && d.x <= mean + sigma; });
        var s2 = gPts.filter(function (d) { return d.x >= mean - 2 * sigma && d.x <= mean + 2 * sigma; });

        g.append('path').datum(s2).attr('d', areaGen).attr('fill', 'rgba(167,139,250,0.12)');
        g.append('path').datum(s1).attr('d', areaGen).attr('fill', 'rgba(0,255,136,0.18)');

        // curve
        var lineGen = d3.line().x(function (d) { return xS(d.x); }).y(function (d) { return yS(d.y); }).curve(d3.curveBasis);
        g.append('path').datum(gPts).attr('d', lineGen).attr('fill', 'none').attr('stroke', GREEN).attr('stroke-width', 2);

        // mean line
        g.append('line').attr('x1', xS(mean)).attr('y1', 0).attr('x2', xS(mean)).attr('y2', ph)
            .attr('stroke', GOLD).attr('stroke-dasharray', '3 3').attr('stroke-width', 1);
        g.append('text').attr('x', xS(mean)).attr('y', -2).attr('text-anchor', 'middle')
            .attr('fill', GOLD).attr('font-size', 9).text('\u03BC=' + mean.toFixed(2));

        /* ── data dots ── */
        data.forEach(function (v) {
            var within1 = Math.abs(v - mean) <= sigma;
            var within2 = Math.abs(v - mean) <= 2 * sigma;
            var col = within1 ? GREEN : (within2 ? PURPLE : RED);
            g.append('circle')
                .attr('cx', xS(v)).attr('cy', ph - 6).attr('r', 4)
                .attr('fill', col).attr('opacity', 0.9);
        });
    }

    btnComp.addEventListener('click', compute);

    // initial compute
    compute();
})();


// ═════════════════════════════════════
// 1.11  Error Tree + Analog / 1/sqrt(n)
// ═════════════════════════════════════
(function () {
    var container = document.getElementById('plot-em-analog');
    if (!container) return;

    var w = container.clientWidth || 500, h = 240;
    var svg = d3.select(container).append('svg')
        .attr('width', w).attr('height', h)
        .attr('viewBox', '0 0 ' + w + ' ' + h);

    /* ════ VIEW A: Error Classification Tree + Analog Grid ════ */
    var gTreeView = svg.append('g').attr('class', 'error-tree-view');

    // --- Error tree (top half) ---
    var treeRoot = { label: 'ERRORS', color: GOLD, x: w / 2, y: 18 };
    var treeBranches = [
        { label: 'Gross',      color: RED,    ex: 'Human blunders' },
        { label: 'Systematic', color: ORANGE, ex: 'Instr / Environ / Obs' },
        { label: 'Random',     color: BLUE,   ex: 'Gaussian \u00B1\u03C3' }
    ];

    gTreeView.append('rect')
        .attr('x', treeRoot.x - 32).attr('y', treeRoot.y - 10).attr('width', 64).attr('height', 20).attr('rx', 4)
        .attr('fill', 'rgba(250,204,21,0.12)').attr('stroke', GOLD);
    gTreeView.append('text')
        .attr('x', treeRoot.x).attr('y', treeRoot.y + 4).attr('text-anchor', 'middle')
        .attr('fill', GOLD).attr('font-size', 10).attr('font-weight', 700).text(treeRoot.label);

    var tSpacing = w / (treeBranches.length + 1);
    treeBranches.forEach(function (b, i) {
        var bx = tSpacing * (i + 1), by = 58;
        gTreeView.append('line')
            .attr('x1', treeRoot.x).attr('y1', treeRoot.y + 10).attr('x2', bx).attr('y2', by - 10)
            .attr('stroke', b.color).attr('stroke-width', 1.5);
        gTreeView.append('rect')
            .attr('x', bx - 48).attr('y', by - 10).attr('width', 96).attr('height', 18).attr('rx', 3)
            .attr('fill', 'rgba(255,255,255,0.04)').attr('stroke', b.color);
        gTreeView.append('text')
            .attr('x', bx).attr('y', by + 2).attr('text-anchor', 'middle')
            .attr('fill', b.color).attr('font-size', 9).attr('font-weight', 600).text(b.label);
        gTreeView.append('text')
            .attr('x', bx).attr('y', by + 16).attr('text-anchor', 'middle')
            .attr('fill', MUTED).attr('font-size', 7).text(b.ex);
    });

    // --- Analog instrument types grid (bottom half) ---
    var gridData = [
        { label: 'Indicating', icon: '\uD83D\uDCCF', color: CYAN },
        { label: 'Recording',  icon: '\uD83D\uDCC8', color: GREEN },
        { label: 'Integrating', icon: '\u2211',       color: PURPLE },
        { label: 'Null-type',  icon: '\u2696',        color: ORANGE }
    ];

    var gridY = 100, cellW = w / gridData.length;
    gridData.forEach(function (item, i) {
        var cx = cellW * i + cellW / 2;
        gTreeView.append('rect')
            .attr('x', cx - 36).attr('y', gridY).attr('width', 72).attr('height', 50).attr('rx', 6)
            .attr('fill', 'rgba(255,255,255,0.03)').attr('stroke', item.color).attr('stroke-width', 1);
        gTreeView.append('text')
            .attr('x', cx).attr('y', gridY + 22).attr('text-anchor', 'middle')
            .attr('fill', item.color).attr('font-size', 16).text(item.icon);
        gTreeView.append('text')
            .attr('x', cx).attr('y', gridY + 40).attr('text-anchor', 'middle')
            .attr('fill', WHITE).attr('font-size', 8).attr('font-weight', 600).text(item.label);
    });

    // --- Summary note ---
    gTreeView.append('text')
        .attr('x', w / 2).attr('y', gridY + 64).attr('text-anchor', 'middle')
        .attr('fill', MUTED).attr('font-size', 8)
        .text('Analog instruments classified by method of measurement');

    /* ════ VIEW B: 1/\u221An standard error reduction ════ */
    var gSqrtView = svg.append('g').attr('class', 'sqrt-n-view').attr('opacity', 0);

    var margin = { t: 25, r: 20, b: 30, l: 50 };
    var pw = w - margin.l - margin.r, ph = h - margin.t - margin.b;

    var gInner = gSqrtView.append('g').attr('transform', 'translate(' + margin.l + ',' + margin.t + ')');

    var xS = d3.scaleLinear().domain([1, 50]).range([0, pw]);
    var yS = d3.scaleLinear().domain([0, 1]).range([ph, 0]);

    // axes
    gInner.append('line').attr('x1', 0).attr('y1', ph).attr('x2', pw).attr('y2', ph).attr('stroke', MUTED);
    gInner.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', ph).attr('stroke', MUTED);
    gInner.append('text').attr('x', pw / 2).attr('y', ph + 22).attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', 9).text('Number of measurements (n)');
    gInner.append('text').attr('x', -35).attr('y', ph / 2).attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', 9)
        .attr('transform', 'rotate(-90,' + (-35) + ',' + (ph / 2) + ')').text('\u03C3 / \u221An');

    // curve data
    var curveData = [];
    for (var n = 1; n <= 50; n++) {
        curveData.push({ x: n, y: 1 / Math.sqrt(n) });
    }

    var curveArea = d3.area()
        .x(function (d) { return xS(d.x); })
        .y0(ph)
        .y1(function (d) { return yS(d.y); })
        .curve(d3.curveMonotoneX);
    gInner.append('path').datum(curveData).attr('d', curveArea).attr('fill', 'rgba(0,245,255,0.08)');

    var curveLine = d3.line()
        .x(function (d) { return xS(d.x); })
        .y(function (d) { return yS(d.y); })
        .curve(d3.curveMonotoneX);
    gInner.append('path').datum(curveData).attr('d', curveLine).attr('fill', 'none').attr('stroke', CYAN).attr('stroke-width', 2);

    // title
    gInner.append('text').attr('x', pw / 2).attr('y', -8).attr('text-anchor', 'middle')
        .attr('fill', WHITE).attr('font-size', 11).attr('font-weight', 600).text('Standard Error Reduction: \u03C3/\u221An');

    // annotate key points
    var keyPoints = [
        { n: 1,  note: 'n=1: \u03C3' },
        { n: 4,  note: 'n=4: \u03C3/2' },
        { n: 9,  note: 'n=9: \u03C3/3' },
        { n: 25, note: 'n=25: \u03C3/5' }
    ];
    keyPoints.forEach(function (kp) {
        var px = xS(kp.n), py = yS(1 / Math.sqrt(kp.n));
        gInner.append('circle').attr('cx', px).attr('cy', py).attr('r', 4).attr('fill', GOLD);
        gInner.append('text')
            .attr('x', px + 6).attr('y', py - 6).attr('fill', GOLD).attr('font-size', 8).attr('font-weight', 600)
            .text(kp.note);
    });

    // horizontal line at y = 0.2 for reference
    gInner.append('line')
        .attr('x1', 0).attr('y1', yS(0.2)).attr('x2', pw).attr('y2', yS(0.2))
        .attr('stroke', GREEN).attr('stroke-dasharray', '3 3').attr('stroke-width', 1);
    gInner.append('text')
        .attr('x', pw - 2).attr('y', yS(0.2) - 4).attr('text-anchor', 'end')
        .attr('fill', GREEN).attr('font-size', 8).text('n=25 \u2192 80% reduction');

    /* ── toggle buttons ── */
    var btnTree = document.getElementById('btn-error-tree');
    var btnSqrt = document.getElementById('btn-sqrt-n');
    if (!btnTree || !btnSqrt) return;

    btnTree.addEventListener('click', function () {
        btnTree.classList.add('active');  btnSqrt.classList.remove('active');
        gsap.to(gTreeView.node(), { opacity: 1, duration: 0.4 });
        gsap.to(gSqrtView.node(), { opacity: 0, duration: 0.4 });
    });
    btnSqrt.addEventListener('click', function () {
        btnSqrt.classList.add('active');  btnTree.classList.remove('active');
        gsap.to(gTreeView.node(), { opacity: 0, duration: 0.4 });
        gsap.to(gSqrtView.node(), { opacity: 1, duration: 0.4 });
    });
})();
