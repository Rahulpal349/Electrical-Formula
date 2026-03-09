/* =====================================================================
   MODULE 5 — HIGH RESISTANCE MEASUREMENT & AC BRIDGE THEORY
   IIFE · D3 v7 · GSAP 3 · KaTeX · #fb7185 Rose Accent
   ===================================================================== */
(function () {
    'use strict';

    /* ── colour constants ── */
    const ROSE   = '#fb7185';
    const CYAN   = '#00f5ff';
    const GOLD   = '#facc15';
    const ORANGE = '#f97316';
    const GREEN  = '#00ff88';
    const RED    = '#ef4444';
    const PURPLE = '#a78bfa';
    const BLUE   = '#60a5fa';
    const MUTED  = '#94a3b8';

    /* ── helpers ── */
    function el(id) { return document.getElementById(id); }

    function fmtEng(v) {
        if (v >= 1e9) return (v / 1e9).toFixed(2) + ' GΩ';
        if (v >= 1e6) return (v / 1e6).toFixed(2) + ' MΩ';
        if (v >= 1e3) return (v / 1e3).toFixed(2) + ' kΩ';
        if (v >= 1)   return v.toFixed(2) + ' Ω';
        return (v * 1e3).toFixed(2) + ' mΩ';
    }

    function initCalcListener(ids, fn) {
        ids.forEach(function (id) {
            var e = el(id);
            if (e) e.addEventListener('input', fn);
        });
        fn();
    }

    /* ═══════════════════════════════════════════════════════════════
       CARD 5.1 — HIGH RESISTANCE OVERVIEW (log scale + method cards)
       ═══════════════════════════════════════════════════════════════ */
    function initCard51() {
        var container = el('m5-overview-chart');
        if (!container || typeof d3 === 'undefined') return;
        container.innerHTML = '';

        var w = container.clientWidth || 580, h = 200;
        var m = { t: 25, r: 20, b: 35, l: 50 };
        var iw = w - m.l - m.r, ih = h - m.t - m.b;

        var svg = d3.select('#m5-overview-chart').append('svg')
            .attr('viewBox', '0 0 ' + w + ' ' + h)
            .style('width', '100%').style('height', '100%');
        var g = svg.append('g').attr('transform', 'translate(' + m.l + ',' + m.t + ')');

        // Log scale: 0.001 Ω to 10 TΩ
        var x = d3.scaleLog().domain([1e-3, 1e13]).range([0, iw]);

        // Zone bands
        var zones = [
            { x0: 1e-3, x1: 1,    color: BLUE,   label: 'Low R (<1Ω)' },
            { x0: 1,    x1: 1e5,  color: GOLD,   label: 'Medium (1Ω–100kΩ)' },
            { x0: 1e5,  x1: 1e13, color: ROSE,   label: 'High R (>100kΩ)' }
        ];

        zones.forEach(function (z) {
            g.append('rect')
                .attr('x', x(z.x0)).attr('y', 0)
                .attr('width', x(z.x1) - x(z.x0)).attr('height', ih)
                .attr('fill', z.color).attr('opacity', 0.1);
            g.append('text')
                .attr('x', (x(z.x0) + x(z.x1)) / 2).attr('y', ih / 2)
                .attr('text-anchor', 'middle').attr('fill', z.color)
                .attr('font-size', '10px').attr('font-weight', 'bold')
                .text(z.label);
        });

        // Axis
        g.append('g').attr('transform', 'translate(0,' + ih + ')')
            .call(d3.axisBottom(x).ticks(8, '.0s'))
            .selectAll('text').attr('fill', MUTED).attr('font-size', '8px');
        g.selectAll('.domain, .tick line').attr('stroke', '#334155');

        svg.append('text').attr('x', w / 2).attr('y', h - 3)
            .attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '9px')
            .text('Resistance (Ω) — Log Scale');

        // Method markers in high R zone
        var methods = [
            { pos: 1e6,  label: 'Loss of Charge' },
            { pos: 1e8,  label: 'Megger' },
            { pos: 1e10, label: 'Direct Deflection' },
            { pos: 1e12, label: 'Mega Ohm Bridge' }
        ];

        methods.forEach(function (mt, i) {
            var cx = x(mt.pos);
            g.append('circle').attr('cx', cx).attr('cy', ih * 0.25 + i * 18)
                .attr('r', 4).attr('fill', ROSE);
            g.append('text').attr('x', cx + 8).attr('y', ih * 0.25 + i * 18 + 4)
                .attr('fill', '#fff').attr('font-size', '8px')
                .text(mt.label);
        });

        // Method cards
        var mcContainer = el('m5-method-cards');
        if (mcContainer) {
            mcContainer.innerHTML = '';
            var methodInfo = [
                { title: 'Loss of Charge', desc: 'Capacitor discharge via unknown R', color: ROSE },
                { title: 'Megger', desc: 'Self-contained insulation tester', color: PURPLE },
                { title: 'Direct Deflection', desc: 'Galvanometer measures tiny current', color: GOLD },
                { title: 'Mega Ohm Bridge', desc: 'Bridge method for ultra-high R', color: CYAN }
            ];
            methodInfo.forEach(function (mi) {
                var card = document.createElement('div');
                card.style.cssText = 'padding:8px 14px;border-radius:8px;border:1px solid ' + mi.color + '33;background:' + mi.color + '0d;text-align:center;min-width:120px;';
                card.innerHTML = '<div style="color:' + mi.color + ';font-size:0.82rem;font-weight:bold;margin-bottom:3px;">' + mi.title + '</div><div style="color:#94a3b8;font-size:0.72rem;">' + mi.desc + '</div>';
                mcContainer.appendChild(card);
            });
        }
    }

    /* ═══════════════════════════════════════════════════════════════
       CARD 5.2 — LOSS OF CHARGE METHOD
       ═══════════════════════════════════════════════════════════════ */
    function initCard52() {
        var rSlider = el('m5-loc-r');
        var cSlider = el('m5-loc-c');
        if (!rSlider || !cSlider) return;

        function updateDecay() {
            var R_MO = parseFloat(rSlider.value);
            var C_uF = parseFloat(cSlider.value);
            el('m5-loc-r-val').textContent = R_MO >= 1000 ? (R_MO / 1000).toFixed(1) + ' GΩ' : R_MO + ' MΩ';
            el('m5-loc-c-val').textContent = C_uF + ' μF';

            var R = R_MO * 1e6;      // Ω
            var C = C_uF * 1e-6;     // F
            var tau = R * C;          // seconds
            var V = 100;

            // Build decay curve data
            var data = [];
            var tMax = 5 * tau;
            for (var i = 0; i <= 100; i++) {
                var t = (i / 100) * tMax;
                data.push([t, V * Math.exp(-t / tau)]);
            }

            drawDecayCurve(data, tau, V, tMax);
        }

        function drawDecayCurve(data, tau, V, tMax) {
            var container = el('m5-decay-chart');
            if (!container || typeof d3 === 'undefined') return;
            container.innerHTML = '';

            var w = 300, h = 175;
            var m = { t: 20, r: 15, b: 30, l: 40 };
            var iw = w - m.l - m.r, ih = h - m.t - m.b;

            var svg = d3.select('#m5-decay-chart').append('svg')
                .attr('viewBox', '0 0 ' + w + ' ' + h)
                .style('width', '100%').style('height', '100%');
            var g = svg.append('g').attr('transform', 'translate(' + m.l + ',' + m.t + ')');

            var x = d3.scaleLinear().domain([0, tMax]).range([0, iw]);
            var y = d3.scaleLinear().domain([0, V * 1.05]).range([ih, 0]);

            g.append('g').attr('transform', 'translate(0,' + ih + ')')
                .call(d3.axisBottom(x).ticks(5).tickFormat(function (d) {
                    return d >= 1 ? d.toFixed(0) + 's' : (d * 1000).toFixed(0) + 'ms';
                }))
                .selectAll('text').attr('fill', MUTED).attr('font-size', '7px');
            g.append('g').call(d3.axisLeft(y).ticks(5))
                .selectAll('text').attr('fill', MUTED).attr('font-size', '7px');
            g.selectAll('.domain, .tick line').attr('stroke', '#334155');

            // Decay curve
            g.append('path').datum(data)
                .attr('fill', 'none').attr('stroke', ROSE).attr('stroke-width', 2)
                .attr('d', d3.line().x(function (d) { return x(d[0]); }).y(function (d) { return y(d[1]); }).curve(d3.curveMonotoneX));

            // τ markers
            var markers = [
                { t: tau, vc: V * 0.368, label: 'τ: 0.368V', color: CYAN },
                { t: 2 * tau, vc: V * 0.135, label: '2τ: 0.135V', color: GOLD },
                { t: 5 * tau, vc: V * 0.0067, label: '5τ: ≈0V', color: MUTED }
            ];
            markers.forEach(function (mk) {
                if (mk.t <= tMax) {
                    g.append('circle').attr('cx', x(mk.t)).attr('cy', y(mk.vc))
                        .attr('r', 3.5).attr('fill', mk.color);
                    g.append('text').attr('x', x(mk.t) + 5).attr('y', y(mk.vc) - 5)
                        .attr('fill', mk.color).attr('font-size', '7px').text(mk.label);
                }
            });

            // Labels
            svg.append('text').attr('x', w / 2).attr('y', h - 2)
                .attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '8px')
                .text('Time (t)');
            svg.append('text').attr('x', 8).attr('y', 12)
                .attr('fill', MUTED).attr('font-size', '8px').text('Vc (V)');
        }

        rSlider.addEventListener('input', updateDecay);
        cSlider.addEventListener('input', updateDecay);
        updateDecay();

        // Calculator
        initCalcListener(['m5-locc-c', 'm5-locc-v', 'm5-locc-vc', 'm5-locc-t'], function () {
            var C = parseFloat(el('m5-locc-c').value) * 1e-6;
            var V = parseFloat(el('m5-locc-v').value);
            var Vc = parseFloat(el('m5-locc-vc').value);
            var t = parseFloat(el('m5-locc-t').value);
            var res = el('m5-locc-result');
            if (!C || !V || !Vc || !t || Vc >= V || Vc <= 0) {
                res.textContent = 'R = — (check inputs)';
                return;
            }
            var R = 0.4343 * t / (C * Math.log10(V / Vc));
            res.textContent = 'R = ' + fmtEng(R);
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       CARD 5.3 — MEGGER
       ═══════════════════════════════════════════════════════════════ */
    function initCard53() {
        var rxSlider = el('m5-megger-rx');
        if (!rxSlider) return;

        function updateMegger() {
            var rx = parseFloat(rxSlider.value);
            el('m5-megger-rx-val').textContent = rx >= 1000 ? (rx / 1000).toFixed(1) + ' GΩ' : rx.toFixed(1) + ' MΩ';

            // Rotate needle: ∞ at ~155° (full right), 0 at ~25° (full left)
            // θ ∝ 1/Rx → higher Rx = closer to ∞
            var angle;
            if (rx <= 0.1) angle = 25;
            else if (rx >= 500) angle = 155;
            else angle = 25 + 130 * (1 - 1 / (1 + rx / 5));

            var needle = el('m5-megger-needle');
            if (needle) {
                var rad = angle * Math.PI / 180;
                var len = 30;
                var x2 = 130 + len * Math.cos(Math.PI - rad);
                var y2 = 72 - len * Math.sin(Math.PI - rad);
                needle.setAttribute('x2', x2);
                needle.setAttribute('y2', y2);
            }

            drawInsulationGauge(rx);
        }

        function drawInsulationGauge(rx) {
            var container = el('m5-insulation-gauge');
            if (!container || typeof d3 === 'undefined') return;
            container.innerHTML = '';

            var w = 260, h = 195;
            var svg = d3.select('#m5-insulation-gauge').append('svg')
                .attr('viewBox', '0 0 ' + w + ' ' + h)
                .style('width', '100%').style('height', '100%');

            // Gauge zones
            var zones = [
                { min: 0, max: 1, color: RED, label: 'FAIL' },
                { min: 1, max: 10, color: ORANGE, label: 'Warning' },
                { min: 10, max: 100, color: GOLD, label: 'Good' },
                { min: 100, max: 500, color: GREEN, label: 'Excellent' }
            ];

            var barY = 40, barH = 30;
            var x = d3.scaleLog().domain([0.1, 500]).range([20, w - 20]).clamp(true);

            zones.forEach(function (z) {
                svg.append('rect')
                    .attr('x', x(Math.max(z.min, 0.1))).attr('y', barY)
                    .attr('width', x(z.max) - x(Math.max(z.min, 0.1))).attr('height', barH)
                    .attr('fill', z.color).attr('opacity', 0.25).attr('rx', 3);
                svg.append('text')
                    .attr('x', (x(Math.max(z.min, 0.1)) + x(z.max)) / 2).attr('y', barY + barH + 14)
                    .attr('text-anchor', 'middle').attr('fill', z.color).attr('font-size', '8px')
                    .text(z.label);
            });

            // Pointer
            var px = x(Math.max(rx, 0.1));
            svg.append('line').attr('x1', px).attr('y1', barY - 5)
                .attr('x2', px).attr('y2', barY + barH + 5)
                .attr('stroke', '#fff').attr('stroke-width', 2);
            svg.append('circle').attr('cx', px).attr('cy', barY - 8)
                .attr('r', 4).attr('fill', '#fff');

            // Reading
            var grade, gradeColor;
            if (rx >= 100) { grade = 'EXCELLENT'; gradeColor = GREEN; }
            else if (rx >= 10) { grade = 'GOOD'; gradeColor = GOLD; }
            else if (rx >= 1) { grade = 'WARNING'; gradeColor = ORANGE; }
            else { grade = 'FAIL — Rewinding needed'; gradeColor = RED; }

            svg.append('text').attr('x', w / 2).attr('y', barY + barH + 35)
                .attr('text-anchor', 'middle').attr('fill', gradeColor)
                .attr('font-size', '13px').attr('font-weight', 'bold')
                .attr('font-family', 'Orbitron, sans-serif')
                .text(grade);

            svg.append('text').attr('x', w / 2).attr('y', barY + barH + 52)
                .attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '9px')
                .text('Rx = ' + (rx >= 1000 ? (rx / 1000).toFixed(1) + ' GΩ' : rx.toFixed(1) + ' MΩ'));

            // Scale labels
            svg.append('text').attr('x', w / 2).attr('y', 20)
                .attr('text-anchor', 'middle').attr('fill', ROSE).attr('font-size', '10px')
                .attr('font-weight', 'bold').text('Insulation Quality Gauge');

            // θ ∝ 1/Rx note
            svg.append('text').attr('x', w / 2).attr('y', h - 25)
                .attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '8px')
                .text('Scale: θ ∝ 1/Rx (0 right, ∞ left)');

            // Standard
            svg.append('text').attr('x', w / 2).attr('y', h - 10)
                .attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '8px')
                .text('Min acceptable: ≥ 1 MΩ per kV');
        }

        rxSlider.addEventListener('input', updateMegger);
        updateMegger();

        // Calculator
        initCalcListener(['m5-megc-rx'], function () {
            var rx = parseFloat(el('m5-megc-rx').value);
            var res = el('m5-megc-result');
            if (!rx || rx < 0) { res.textContent = 'Grade: —'; return; }
            var grade;
            if (rx >= 100) grade = '✅ EXCELLENT (>' + '100 MΩ)';
            else if (rx >= 10) grade = '✅ GOOD (10–100 MΩ)';
            else if (rx >= 1) grade = '⚠️ WARNING (1–10 MΩ)';
            else grade = '❌ FAIL (<1 MΩ) — Insulation degraded';
            res.textContent = 'Grade: ' + grade;
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       CARD 5.4 — DIRECT DEFLECTION & CARRY FOSTER BRIDGE
       ═══════════════════════════════════════════════════════════════ */
    function initCard54() {
        // Carry Foster sliders
        var l1Sl = el('m5-cf-l1-sl');
        var l2Sl = el('m5-cf-l2-sl');
        if (l1Sl && l2Sl) {
            function updateCF() {
                var l1 = parseFloat(l1Sl.value);
                var l2 = parseFloat(l2Sl.value);
                el('m5-cf-l1-val').textContent = l1;
                el('m5-cf-l2-val').textContent = l2;

                // Move SVG circles
                var l1c = el('m5-cf-l1');
                var l2c = el('m5-cf-l2');
                var l1t = el('m5-cf-l1-txt');
                var l2t = el('m5-cf-l2-txt');
                // Map 5-95 cm to x 40-240 in SVG
                var cx1 = 40 + (l1 / 100) * 200;
                var cx2 = 40 + (l2 / 100) * 200;
                if (l1c) { l1c.setAttribute('cx', cx1); }
                if (l2c) { l2c.setAttribute('cx', cx2); }
                if (l1t) { l1t.setAttribute('x', cx1); }
                if (l2t) { l2t.setAttribute('x', cx2); }

                // Result —  R = S + s(l2-l1)
                var S = 100; // Ω (standard)
                var s = 0.01; // Ω/cm
                var R = S + s * (l2 - l1);
                var resTxt = el('m5-cf-result');
                if (resTxt) resTxt.textContent = 'R = ' + R.toFixed(2) + ' Ω (S=100Ω, s=0.01Ω/cm)';
            }
            l1Sl.addEventListener('input', updateCF);
            l2Sl.addEventListener('input', updateCF);
            updateCF();
        }

        // Direct Deflection calculator
        initCalcListener(['m5-ddc-v', 'm5-ddc-ig'], function () {
            var V = parseFloat(el('m5-ddc-v').value);
            var Ig = parseFloat(el('m5-ddc-ig').value) * 1e-9; // nA to A
            var res = el('m5-ddc-result');
            if (!V || !Ig || Ig <= 0) { res.textContent = 'Rx = V/Ig = —'; return; }
            var Rx = V / Ig;
            res.textContent = 'Rx = V/Ig = ' + fmtEng(Rx);
        });

        // Carry Foster calculator
        initCalcListener(['m5-cfc-s', 'm5-cfc-l1', 'm5-cfc-l2', 'm5-cfc-s2'], function () {
            var S = parseFloat(el('m5-cfc-s').value);
            var l1 = parseFloat(el('m5-cfc-l1').value);
            var l2 = parseFloat(el('m5-cfc-l2').value);
            var s = parseFloat(el('m5-cfc-s2').value);
            var res = el('m5-cfc-result');
            if (isNaN(S) || isNaN(l1) || isNaN(l2) || isNaN(s)) {
                res.textContent = 'R = S + s(ℓ₂−ℓ₁) = —';
                return;
            }
            var R = S + s * (l2 - l1);
            res.textContent = 'R = ' + S + ' + ' + s + '×(' + l2 + '−' + l1 + ') = ' + R.toFixed(4) + ' Ω';
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       CARD 5.5 — AC BRIDGES GENERAL THEORY
       ═══════════════════════════════════════════════════════════════ */
    function initCard55() {
        // Phase angle selector buttons
        var phaseButtons = ['m5-arm-r', 'm5-arm-l', 'm5-arm-c', 'm5-arm-rl', 'm5-arm-rc'];
        phaseButtons.forEach(function (btnId) {
            var btn = el(btnId);
            if (btn) {
                btn.addEventListener('click', function () {
                    phaseButtons.forEach(function (id) {
                        var b = el(id);
                        if (b) b.classList.remove('active');
                    });
                    btn.classList.add('active');
                    drawPhaseAngle(parseFloat(btn.dataset.angle));
                });
            }
        });

        function drawPhaseAngle(angle) {
            var container = el('m5-phase-chart');
            if (!container || typeof d3 === 'undefined') return;
            container.innerHTML = '';

            var w = 280, h = 245;
            var cx = w / 2, cy = h / 2;
            var radius = 90;

            var svg = d3.select('#m5-phase-chart').append('svg')
                .attr('viewBox', '0 0 ' + w + ' ' + h)
                .style('width', '100%').style('height', '100%');

            // Circle
            svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', radius)
                .attr('fill', 'rgba(255,255,255,0.03)').attr('stroke', '#334155').attr('stroke-width', 1);

            // Axes
            svg.append('line').attr('x1', cx - radius).attr('y1', cy)
                .attr('x2', cx + radius).attr('y2', cy)
                .attr('stroke', '#334155').attr('stroke-width', 0.5);
            svg.append('line').attr('x1', cx).attr('y1', cy - radius)
                .attr('x2', cx).attr('y2', cy + radius)
                .attr('stroke', '#334155').attr('stroke-width', 0.5);

            // Axis labels
            svg.append('text').attr('x', cx + radius + 5).attr('y', cy + 4)
                .attr('fill', MUTED).attr('font-size', '8px').text('R (0°)');
            svg.append('text').attr('x', cx - 4).attr('y', cy - radius - 5)
                .attr('fill', MUTED).attr('font-size', '8px').attr('text-anchor', 'middle').text('+jωL (+90°)');
            svg.append('text').attr('x', cx - 4).attr('y', cy + radius + 14)
                .attr('fill', MUTED).attr('font-size', '8px').attr('text-anchor', 'middle').text('−j/ωC (−90°)');

            // Phasor
            var rad = angle * Math.PI / 180;
            var px = cx + radius * 0.8 * Math.cos(-rad); // SVG y is flipped
            var py = cy - radius * 0.8 * Math.sin(-rad); // negative because up is positive
            // Wait: in math, +90 is up, so for SVG, y should decrease  

            var phasorColor;
            if (angle === 0) phasorColor = GREEN;
            else if (angle === 90) phasorColor = CYAN;
            else if (angle === -90) phasorColor = ROSE;
            else if (angle > 0) phasorColor = GOLD;
            else phasorColor = ORANGE;

            svg.append('line').attr('x1', cx).attr('y1', cy)
                .attr('x2', px).attr('y2', py)
                .attr('stroke', phasorColor).attr('stroke-width', 2.5);
            svg.append('circle').attr('cx', px).attr('cy', py)
                .attr('r', 4).attr('fill', phasorColor);

            // Arc showing angle
            if (angle !== 0) {
                var startAngle = 0;
                var endAngle = -rad; // SVG convention
                var arcR = 25;
                var arcPath;
                var sa = 0;
                var ea = -angle * Math.PI / 180;
                var largeArc = Math.abs(angle) > 180 ? 1 : 0;
                var sweep = angle > 0 ? 0 : 1;
                var sx = cx + arcR;
                var sy = cy;
                var ex = cx + arcR * Math.cos(ea);
                var ey = cy + arcR * Math.sin(ea); // note: SVG y goes down
                // Actually for SVG positive angle is clockwise. Let me recalculate.
                // angle=90 means up, which is -y in SVG, which is counterclockwise
                ex = cx + arcR * Math.cos(-rad);
                ey = cy - arcR * Math.sin(-rad);
                sweep = angle > 0 ? 0 : 1;

                svg.append('path')
                    .attr('d', 'M ' + sx + ' ' + sy + ' A ' + arcR + ' ' + arcR + ' 0 ' + largeArc + ' ' + sweep + ' ' + ex + ' ' + ey)
                    .attr('fill', 'none').attr('stroke', phasorColor).attr('stroke-width', 1.5);
            }

            // Label
            svg.append('text').attr('x', cx).attr('y', h - 10)
                .attr('text-anchor', 'middle').attr('fill', phasorColor)
                .attr('font-size', '11px').attr('font-weight', 'bold')
                .text('θ = ' + angle + '°');

            // Title
            svg.append('text').attr('x', cx).attr('y', 16)
                .attr('text-anchor', 'middle').attr('fill', ROSE)
                .attr('font-size', '10px').attr('font-weight', 'bold')
                .text('Phase Angle Diagram');
        }

        // Initial draw
        drawPhaseAngle(0);
        var rBtn = el('m5-arm-r');
        if (rBtn) rBtn.classList.add('active');

        // Angle condition calculator
        initCalcListener(['m5-acbc-t1', 'm5-acbc-t2', 'm5-acbc-t3', 'm5-acbc-t4'], function () {
            var t1 = parseFloat(el('m5-acbc-t1').value) || 0;
            var t2 = parseFloat(el('m5-acbc-t2').value) || 0;
            var t3 = parseFloat(el('m5-acbc-t3').value) || 0;
            var t4 = parseFloat(el('m5-acbc-t4').value) || 0;
            var sum13 = t1 + t3;
            var sum24 = t2 + t4;
            var met = Math.abs(sum13 - sum24) < 0.5;
            var res = el('m5-acbc-result');
            res.textContent = 'θ₁+θ₃ = ' + sum13 + '°  |  θ₂+θ₄ = ' + sum24 + '°  →  ' +
                (met ? '✓ BALANCED' : '✗ NOT BALANCED');
            res.style.color = met ? GREEN : RED;
            res.style.borderColor = met ? 'rgba(0,255,136,0.3)' : 'rgba(239,68,68,0.3)';
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       CARD 5.6 — BRIDGE BALANCE WORKED EXAMPLES
       ═══════════════════════════════════════════════════════════════ */
    function initCard56() {
        var selectors = ['m5-ps-a1', 'm5-ps-a2', 'm5-ps-a3', 'm5-ps-a4'];
        var angleMap = { r: 0, l: 90, c: -90, rl: 45, rc: -45 };
        var colorMap = { r: GREEN, l: CYAN, c: ROSE, rl: GOLD, rc: ORANGE };
        var labelMap = { r: 'R (0°)', l: 'L (+90°)', c: 'C (−90°)', rl: 'RL (≈45°)', rc: 'RC (≈−45°)' };

        function update() {
            var angles = selectors.map(function (id) {
                var sel = el(id);
                return sel ? angleMap[sel.value] || 0 : 0;
            });
            var types = selectors.map(function (id) {
                var sel = el(id);
                return sel ? sel.value : 'r';
            });

            var sum13 = angles[0] + angles[2];
            var sum24 = angles[1] + angles[3];
            var met = Math.abs(sum13 - sum24) < 1;

            var resEl = el('m5-ps-result');
            if (resEl) {
                resEl.textContent = 'θ₁+θ₃ = ' + sum13 + '° | θ₂+θ₃ = ' + sum24 + '° → ' + (met ? '✓ MET' : '✗ NOT MET');
                resEl.style.color = met ? GREEN : RED;
                resEl.style.borderColor = met ? 'rgba(0,255,136,0.3)' : 'rgba(239,68,68,0.3)';
            }

            // Identify bridge
            var bridgeEl = el('m5-ps-bridge');
            if (bridgeEl) {
                var sig = types.join(',');
                var bridge = 'Unknown configuration';
                if (sig === 'rl,r,r,rc') bridge = '→ Maxwell L-C Bridge';
                else if (sig === 'rl,r,r,rc' || sig === 'rl,rc,r,r') bridge = '→ Maxwell L-C / Hay\'s';
                else if (sig === 'rc,c,r,rc') bridge = '→ Schering Bridge';
                else if (sig === 'rl,c,r,r') bridge = '→ Owen\'s Bridge';
                else if (met) bridge = '→ Balance achievable';
                bridgeEl.textContent = bridge;
            }

            drawPhasorDiagram(angles, types);
        }

        function drawPhasorDiagram(angles, types) {
            var container = el('m5-phasor-diagram');
            if (!container || typeof d3 === 'undefined') return;
            container.innerHTML = '';

            var w = 250, h = 220;
            var cx = w / 2, cy = h / 2;
            var r = 70;

            var svg = d3.select('#m5-phasor-diagram').append('svg')
                .attr('viewBox', '0 0 ' + w + ' ' + h)
                .style('width', '100%').style('height', '100%');

            // Background circle
            svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r)
                .attr('fill', 'rgba(255,255,255,0.02)').attr('stroke', '#334155');

            // Axes
            svg.append('line').attr('x1', cx - r).attr('y1', cy).attr('x2', cx + r).attr('y2', cy)
                .attr('stroke', '#334155').attr('stroke-width', 0.5);
            svg.append('line').attr('x1', cx).attr('y1', cy - r).attr('x2', cx).attr('y2', cy + r)
                .attr('stroke', '#334155').attr('stroke-width', 0.5);

            var armLabels = ['Z₁', 'Z₂', 'Z₃', 'Z₄'];
            var armLen = [r * 0.85, r * 0.7, r * 0.65, r * 0.75];

            angles.forEach(function (angle, i) {
                var rad = angle * Math.PI / 180;
                var px = cx + armLen[i] * Math.cos(-rad);
                var py = cy - armLen[i] * Math.sin(-rad);
                var c = colorMap[types[i]] || '#fff';

                svg.append('line').attr('x1', cx).attr('y1', cy)
                    .attr('x2', px).attr('y2', py)
                    .attr('stroke', c).attr('stroke-width', 2);
                svg.append('circle').attr('cx', px).attr('cy', py)
                    .attr('r', 3).attr('fill', c);
                svg.append('text')
                    .attr('x', px + 6 * Math.cos(-rad)).attr('y', py - 6 * Math.sin(-rad))
                    .attr('fill', c).attr('font-size', '9px').attr('font-weight', 'bold')
                    .text(armLabels[i]);
            });

            svg.append('text').attr('x', cx).attr('y', 14)
                .attr('text-anchor', 'middle').attr('fill', ROSE).attr('font-size', '10px')
                .attr('font-weight', 'bold').text('Phasor Arms');
        }

        selectors.forEach(function (id) {
            var sel = el(id);
            if (sel) sel.addEventListener('change', update);
        });
        update();
    }

    /* ═══════════════════════════════════════════════════════════════
       CARD 5.7 — SELF INDUCTANCE BRIDGE SELECTOR
       ═══════════════════════════════════════════════════════════════ */
    function initCard57() {
        var lSlider = el('m5-q-l');
        var rSlider = el('m5-q-r');
        var fSlider = el('m5-q-f');
        if (!lSlider || !rSlider || !fSlider) return;

        function updateQ() {
            var L_uH = parseFloat(lSlider.value);
            var R = parseFloat(rSlider.value);
            var f_kHz = parseFloat(fSlider.value);

            el('m5-q-l-val').textContent = L_uH >= 1000 ? (L_uH / 1000).toFixed(1) + ' mH' : L_uH + ' μH';
            el('m5-q-r-val').textContent = R + ' Ω';
            el('m5-q-f-val').textContent = f_kHz >= 100 ? (f_kHz / 1000).toFixed(1) + ' MHz' : f_kHz + ' kHz';

            var L = L_uH * 1e-6; // H
            var f = f_kHz * 1e3;  // Hz
            var w = 2 * Math.PI * f;
            var Q = w * L / R;

            // Recommendation
            var bridge, bColor;
            if (Q < 1) { bridge = "Anderson's Bridge"; bColor = PURPLE; }
            else if (Q <= 10) { bridge = "Maxwell L-C Bridge"; bColor = CYAN; }
            else { bridge = "Hay's Bridge"; bColor = ORANGE; }

            var recEl = el('m5-q-recommendation');
            if (recEl) {
                recEl.textContent = 'Q = ' + Q.toFixed(2) + '  →  Use ' + bridge;
                recEl.style.color = bColor;
                recEl.style.borderColor = bColor + '30';
            }

            drawQChart(Q);
        }

        function drawQChart(currentQ) {
            var container = el('m5-q-chart');
            if (!container || typeof d3 === 'undefined') return;
            container.innerHTML = '';

            var w = container.clientWidth || 580, h = 190;
            var m = { t: 25, r: 20, b: 30, l: 50 };
            var iw = w - m.l - m.r, ih = h - m.t - m.b;

            var svg = d3.select('#m5-q-chart').append('svg')
                .attr('viewBox', '0 0 ' + w + ' ' + h)
                .style('width', '100%').style('height', '100%');
            var g = svg.append('g').attr('transform', 'translate(' + m.l + ',' + m.t + ')');

            var x = d3.scaleLog().domain([0.01, 1000]).range([0, iw]);

            // Q zones
            var qZones = [
                { min: 0.01, max: 1,   color: PURPLE, label: "Anderson's (Q<1)" },
                { min: 1,    max: 10,  color: CYAN,   label: "Maxwell L-C (1≤Q≤10)" },
                { min: 10,   max: 1000, color: ORANGE, label: "Hay's (Q>10)" }
            ];

            qZones.forEach(function (z) {
                g.append('rect')
                    .attr('x', x(z.min)).attr('y', 0)
                    .attr('width', x(z.max) - x(z.min)).attr('height', ih)
                    .attr('fill', z.color).attr('opacity', 0.12);
                g.append('text')
                    .attr('x', (x(z.min) + x(z.max)) / 2).attr('y', ih / 2 - 5)
                    .attr('text-anchor', 'middle').attr('fill', z.color)
                    .attr('font-size', '9px').attr('font-weight', 'bold')
                    .text(z.label);
            });

            // Owen's overlay (all Q)
            g.append('rect')
                .attr('x', x(0.01)).attr('y', ih - 15)
                .attr('width', iw).attr('height', 15)
                .attr('fill', ROSE).attr('opacity', 0.1);
            g.append('text')
                .attr('x', iw / 2).attr('y', ih - 4)
                .attr('text-anchor', 'middle').attr('fill', ROSE)
                .attr('font-size', '8px').text("Owen's (all Q)");

            // Axis
            g.append('g').attr('transform', 'translate(0,' + ih + ')')
                .call(d3.axisBottom(x).ticks(6, '.1s'))
                .selectAll('text').attr('fill', MUTED).attr('font-size', '8px');
            g.selectAll('.domain, .tick line').attr('stroke', '#334155');

            svg.append('text').attr('x', w / 2).attr('y', h - 2)
                .attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '9px')
                .text('Q Factor (log scale)');

            // Current Q pointer
            var safeQ = Math.max(0.01, Math.min(currentQ, 1000));
            var qx = x(safeQ);
            g.append('line').attr('x1', qx).attr('y1', -5).attr('x2', qx).attr('y2', ih + 5)
                .attr('stroke', '#fff').attr('stroke-width', 2);
            g.append('circle').attr('cx', qx).attr('cy', -8)
                .attr('r', 5).attr('fill', '#fff');
            g.append('text').attr('x', qx).attr('y', -14)
                .attr('text-anchor', 'middle').attr('fill', '#fff')
                .attr('font-size', '9px').attr('font-weight', 'bold')
                .text('Q=' + currentQ.toFixed(1));
        }

        lSlider.addEventListener('input', updateQ);
        rSlider.addEventListener('input', updateQ);
        fSlider.addEventListener('input', updateQ);
        updateQ();

        // Q calculator
        initCalcListener(['m5-qc-l', 'm5-qc-r', 'm5-qc-f'], function () {
            var L = parseFloat(el('m5-qc-l').value) * 1e-6;
            var R = parseFloat(el('m5-qc-r').value);
            var f = parseFloat(el('m5-qc-f').value) * 1e3;
            var res = el('m5-qc-result');
            if (!L || !R || !f || R <= 0) {
                res.textContent = 'Q = ωL/R = — → Bridge: —';
                return;
            }
            var Q = 2 * Math.PI * f * L / R;
            var bridge;
            if (Q < 1) bridge = "Anderson's";
            else if (Q <= 10) bridge = "Maxwell L-C";
            else bridge = "Hay's";
            res.textContent = 'Q = ' + Q.toFixed(3) + ' → Use: ' + bridge + ' Bridge';
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       BOOKMARKS
       ═══════════════════════════════════════════════════════════════ */
    function initBookmarks() {
        document.querySelectorAll('.m5-bookmark-btn').forEach(function (btn) {
            var key = 'm5_bk_' + btn.dataset.card;
            if (localStorage.getItem(key)) {
                btn.textContent = '🔖 Saved';
                btn.classList.add('active');
            }
            btn.addEventListener('click', function () {
                if (localStorage.getItem(key)) {
                    localStorage.removeItem(key);
                    btn.textContent = '🔖 Bookmark';
                    btn.classList.remove('active');
                } else {
                    localStorage.setItem(key, '1');
                    btn.textContent = '🔖 Saved';
                    btn.classList.add('active');
                }
            });
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       INIT
       ═══════════════════════════════════════════════════════════════ */
    document.addEventListener('DOMContentLoaded', function () {
        initCard51();
        initCard52();
        initCard53();
        initCard54();
        initCard55();
        initCard56();
        initCard57();
        initBookmarks();
    });

})();
