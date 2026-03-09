/* =====================================================================
   MODULE 4 — HIGH RESISTANCE & AC BRIDGE MEASUREMENTS
   IIFE · D3 v7 · GSAP 3 · KaTeX · #a78bfa Purple Accent
   ===================================================================== */
(function () {
    'use strict';

    /* ── colour constants ── */
    const PURPLE = '#a78bfa';
    const CYAN   = '#00f5ff';
    const GOLD   = '#facc15';
    const ORANGE = '#f97316';
    const GREEN  = '#00ff88';
    const RED    = '#ef4444';
    const BLUE   = '#60a5fa';
    const ROSE   = '#fb7185';
    const MUTED  = '#94a3b8';

    /* ── helpers ── */
    function el(id) { return document.getElementById(id); }

    function d3Line(containerId, w, h, data, xLabel, yLabel, colour) {
        const c = el(containerId);
        if (!c) return;
        c.innerHTML = '';
        const m = { t: 25, r: 15, b: 32, l: 44 };
        const iw = w - m.l - m.r, ih = h - m.t - m.b;
        const svg = d3.select('#' + containerId).append('svg')
            .attr('width', w).attr('height', h);
        const g = svg.append('g').attr('transform', `translate(${m.l},${m.t})`);
        const x = d3.scaleLinear().domain(d3.extent(data, d => d[0])).range([0, iw]);
        const y = d3.scaleLinear().domain([0, d3.max(data, d => d[1]) * 1.1 || 1]).range([ih, 0]);
        g.append('g').attr('transform', `translate(0,${ih})`).call(d3.axisBottom(x).ticks(5))
            .selectAll('text').attr('fill', MUTED).attr('font-size', '8px');
        g.append('g').call(d3.axisLeft(y).ticks(5))
            .selectAll('text').attr('fill', MUTED).attr('font-size', '8px');
        g.selectAll('.domain, .tick line').attr('stroke', '#334155');
        g.append('path').datum(data)
            .attr('fill', 'none').attr('stroke', colour).attr('stroke-width', 2)
            .attr('d', d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveMonotoneX));
        svg.append('text').attr('x', w / 2).attr('y', h - 3).attr('text-anchor', 'middle')
            .attr('fill', MUTED).attr('font-size', '8px').text(xLabel);
        svg.append('text').attr('x', 10).attr('y', 12).attr('fill', MUTED).attr('font-size', '8px').text(yLabel);
    }

    function fmtEng(v) {
        if (v >= 1e9) return (v / 1e9).toFixed(2) + ' GΩ';
        if (v >= 1e6) return (v / 1e6).toFixed(2) + ' MΩ';
        if (v >= 1e3) return (v / 1e3).toFixed(2) + ' kΩ';
        if (v >= 1) return v.toFixed(2) + ' Ω';
        return (v * 1e3).toFixed(2) + ' mΩ';
    }

    function fmtFreq(f) {
        if (f >= 1e6) return (f / 1e6).toFixed(2) + ' MHz';
        if (f >= 1e3) return (f / 1e3).toFixed(2) + ' kHz';
        return f.toFixed(1) + ' Hz';
    }

    function fmtL(h) {
        if (h >= 1) return h.toFixed(3) + ' H';
        if (h >= 1e-3) return (h * 1e3).toFixed(3) + ' mH';
        return (h * 1e6).toFixed(3) + ' µH';
    }

    function fmtC(f) {
        if (f >= 1e-6) return (f * 1e6).toFixed(3) + ' µF';
        if (f >= 1e-9) return (f * 1e9).toFixed(3) + ' nF';
        return (f * 1e12).toFixed(3) + ' pF';
    }

    function addCalcListener(ids, fn) {
        ids.forEach(function (id) {
            var e = el(id);
            if (e) e.addEventListener('input', fn);
        });
    }

    /* =================================================================
       CARD 4.1 — LOSS OF CHARGE METHOD
       ================================================================= */
    function initLossOfCharge() {
        var tSlider = el('m4-rc-t'), cSlider = el('m4-rc-c'), v0Slider = el('m4-rc-v0');
        if (!tSlider) return;
        function update() {
            var t = +tSlider.value, C = +cSlider.value, V0 = +v0Slider.value;
            el('m4-rc-t-val').textContent = t;
            el('m4-rc-c-val').textContent = C;
            el('m4-rc-v0-val').textContent = V0;

            var Cfarad = C * 1e-6;
            // Compute expected Vc at time t for a demo R
            var Rdemo = t / (Cfarad * Math.log(V0 / (V0 * 0.368)));
            var tau = Rdemo * Cfarad;

            el('m4-rc-tau-label').textContent = 'τ = RC = ' + tau.toFixed(2) + ' s';
            el('m4-rc-r-label').textContent = 'R = ' + fmtEng(Rdemo);
            var Vc = V0 * Math.exp(-t / tau);
            el('m4-rc-vc-label').textContent = 'Vc = ' + Vc.toFixed(1) + ' V';

            // D3 decay curve
            var data = [];
            var tMax = Math.max(t * 2, tau * 5);
            for (var i = 0; i <= 50; i++) {
                var ti = (i / 50) * tMax;
                data.push([ti, V0 * Math.exp(-ti / tau)]);
            }
            d3Line('m4-rc-curve', 320, 175, data, 'Time (s)', 'V(t)', BLUE);

            // Overlay tau marker on chart
            var svg = d3.select('#m4-rc-curve svg');
            if (svg.node()) {
                var m = { l: 44, t: 25, b: 32 };
                var iw = 320 - m.l - 15, ih = 175 - m.t - m.b;
                var xS = d3.scaleLinear().domain([0, tMax]).range([0, iw]);
                var yS = d3.scaleLinear().domain([0, V0 * 1.1]).range([ih, 0]);
                var g = svg.select('g');
                g.selectAll('.tau-line').remove();
                g.append('line').attr('class', 'tau-line')
                    .attr('x1', xS(tau)).attr('x2', xS(tau)).attr('y1', 0).attr('y2', ih)
                    .attr('stroke', GOLD).attr('stroke-dasharray', '4 2').attr('stroke-width', 1);
                g.append('text').attr('class', 'tau-line')
                    .attr('x', xS(tau) + 3).attr('y', 12).attr('fill', GOLD).attr('font-size', '8px').text('τ');
            }
        }
        tSlider.addEventListener('input', update);
        cSlider.addEventListener('input', update);
        v0Slider.addEventListener('input', update);
        update();

        // Calculator
        addCalcListener(['m4-locc-c', 'm4-locc-v', 'm4-locc-vc', 'm4-locc-t'], function () {
            var C = +el('m4-locc-c').value * 1e-6;
            var V = +el('m4-locc-v').value;
            var Vc = +el('m4-locc-vc').value;
            var t = +el('m4-locc-t').value;
            if (Vc >= V || Vc <= 0 || C <= 0 || t <= 0) {
                el('m4-locc-result').textContent = 'Invalid input (Vc must be < V)';
                return;
            }
            var R = 0.4343 * t / (C * Math.log10(V / Vc));
            el('m4-locc-result').textContent = 'R = ' + fmtEng(R);
        });
    }

    /* =================================================================
       CARD 4.2 — MEGGER & DIRECT DEFLECTION
       ================================================================= */
    function initMegger() {
        var rxSlider = el('m4-megger-rx');
        if (!rxSlider) return;
        var needle = el('m4-megger-needle');
        function update() {
            var Rx = +rxSlider.value;
            el('m4-megger-rx-val').textContent = Rx.toFixed(1);
            el('m4-megger-reading').textContent = 'R = ' + Rx.toFixed(1) + ' MΩ';
            // Needle: θ ∝ 1/Rx → scale between -60° (high R) and 60° (low R)
            var maxAngle = 60;
            var angle = -maxAngle + (maxAngle * 2) / (1 + Rx / 2);
            if (needle) needle.setAttribute('transform', 'translate(200,90) rotate(' + angle.toFixed(1) + ')');

            // Update CF result
            var cfRes = el('m4-cf-result');
            if (cfRes) cfRes.textContent = 'R − S = (ℓ₂ − ℓ₁)·r';
        }
        rxSlider.addEventListener('input', update);
        update();

        // Calculator
        addCalcListener(['m4-megc-vr', 'm4-megc-rm'], function () {
            var Vr = +el('m4-megc-vr').value;
            var Rm = +el('m4-megc-rm').value;
            var Rmin = Vr / 1000;
            var status = Rm >= Rmin ? '✅ PASS' : '❌ FAIL';
            var colour = Rm >= Rmin ? GREEN : RED;
            el('m4-megc-result').textContent =
                'Required ≥ ' + Rmin.toFixed(1) + ' MΩ | Measured = ' + Rm.toFixed(1) + ' MΩ → ' + status;
            el('m4-megc-result').style.color = colour;
            el('m4-megc-result').style.borderColor = colour + '44';
        });
    }

    /* =================================================================
       CARD 4.3 — AC BRIDGE FUNDAMENTALS
       ================================================================= */
    function initACBridge() {
        var z1mSlider = el('m4-acb-z1m'), t1Slider = el('m4-acb-t1');
        var z2mSlider = el('m4-acb-z2m'), t2Slider = el('m4-acb-t2');
        if (!z1mSlider) return;

        function update() {
            var z1m = +z1mSlider.value, t1 = +t1Slider.value;
            var z2m = +z2mSlider.value, t2 = +t2Slider.value;
            el('m4-acb-z1m-val').textContent = z1m;
            el('m4-acb-t1-val').textContent = t1;
            el('m4-acb-z2m-val').textContent = z2m;
            el('m4-acb-t2-val').textContent = t2;

            // For demo: Z3 = Z2 (same magnitude, opposite angle to Z1), Z4 computed for balance
            // Balance: Z1·Z4 = Z2·Z3 → |Z4| = |Z2|·|Z3|/|Z1|, θ4 = θ2 + θ3 - θ1
            var z3m = z2m, t3 = t2;
            var z4m = (z2m * z3m) / z1m;
            var t4 = t2 + t3 - t1;

            var magLHS = z1m * z4m, magRHS = z2m * z3m;
            var angLHS = t1 + t4, angRHS = t2 + t3;
            var balanced = Math.abs(magLHS - magRHS) < 1 && Math.abs(angLHS - angRHS) < 1;

            var statusEl = el('m4-acb-status');
            if (balanced) {
                statusEl.textContent = '✅ BALANCED: Z₁Z₄ = Z₂Z₃';
                statusEl.setAttribute('fill', GREEN);
            } else {
                statusEl.textContent = '❌ Unbalanced: adjust sliders';
                statusEl.setAttribute('fill', RED);
            }

            // Phasor chart
            drawPhasorChart(t1, t2, t3, t4);
        }

        function drawPhasorChart(t1, t2, t3, t4) {
            var container = el('m4-acb-phasor');
            if (!container) return;
            container.innerHTML = '';
            var w = 320, h = 210;
            var svg = d3.select('#m4-acb-phasor').append('svg').attr('width', w).attr('height', h);
            var cx = w / 2, cy = h / 2 + 10, R = 70;

            // Circle
            svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', R)
                .attr('fill', 'none').attr('stroke', '#334155').attr('stroke-width', 1);
            svg.append('line').attr('x1', cx - R - 10).attr('x2', cx + R + 10).attr('y1', cy).attr('y2', cy)
                .attr('stroke', '#334155').attr('stroke-width', 0.5);
            svg.append('line').attr('x1', cx).attr('x2', cx).attr('y1', cy - R - 10).attr('y2', cy + R + 10)
                .attr('stroke', '#334155').attr('stroke-width', 0.5);

            // Phasors
            var angles = [
                { a: t1, label: 'θ₁', color: CYAN },
                { a: t2, label: 'θ₂', color: ORANGE },
                { a: t3, label: 'θ₃', color: GOLD },
                { a: t4, label: 'θ₄', color: PURPLE }
            ];
            angles.forEach(function (p) {
                var rad = p.a * Math.PI / 180;
                var ex = cx + R * Math.cos(-rad), ey = cy + R * Math.sin(-rad);
                svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', ex).attr('y2', ey)
                    .attr('stroke', p.color).attr('stroke-width', 2);
                svg.append('circle').attr('cx', ex).attr('cy', ey).attr('r', 3).attr('fill', p.color);
                svg.append('text').attr('x', ex + 5).attr('y', ey - 5)
                    .attr('fill', p.color).attr('font-size', '9px').text(p.label + '=' + p.a + '°');
            });

            // Legend
            var sumLHS = t1 + (t2 + t3 - t1); // θ1 + θ4 (since θ4 = θ2+θ3-θ1)
            var sumRHS = t2 + t3;
            svg.append('text').attr('x', 10).attr('y', 14).attr('fill', MUTED).attr('font-size', '8px')
                .text('θ₁+θ₄ = ' + sumLHS + '° | θ₂+θ₃ = ' + sumRHS + '°');
        }

        z1mSlider.addEventListener('input', update);
        t1Slider.addEventListener('input', update);
        z2mSlider.addEventListener('input', update);
        t2Slider.addEventListener('input', update);
        update();

        // Calculator
        addCalcListener(['m4-abc-z1', 'm4-abc-t1', 'm4-abc-z2', 'm4-abc-t2',
                          'm4-abc-z3', 'm4-abc-t3', 'm4-abc-z4', 'm4-abc-t4'], function () {
            var z1 = +el('m4-abc-z1').value, a1 = +el('m4-abc-t1').value;
            var z2 = +el('m4-abc-z2').value, a2 = +el('m4-abc-t2').value;
            var z3 = +el('m4-abc-z3').value, a3 = +el('m4-abc-t3').value;
            var z4 = +el('m4-abc-z4').value, a4 = +el('m4-abc-t4').value;
            var lhsMag = z1 * z4, rhsMag = z2 * z3;
            var lhsAng = a1 + a4, rhsAng = a2 + a3;
            var magOk = Math.abs(lhsMag - rhsMag) / Math.max(lhsMag, rhsMag, 1) < 0.02;
            var angOk = Math.abs(lhsAng - rhsAng) < 2;
            var result = '|Z₁Z₄| = ' + lhsMag.toFixed(0) + ' | |Z₂Z₃| = ' + rhsMag.toFixed(0) +
                         ' | Σθ₁₄ = ' + lhsAng + '° | Σθ₂₃ = ' + rhsAng + '°';
            if (magOk && angOk) result += ' → ✅ BALANCED';
            else result += ' → ❌ Unbalanced';
            el('m4-abc-result').textContent = result;
            el('m4-abc-result').style.color = (magOk && angOk) ? GREEN : RED;
        });
    }

    /* =================================================================
       CARD 4.4 — SELF-INDUCTANCE MEASUREMENT
       ================================================================= */
    function initInductance() {
        var btns = {
            maxwell: el('m4-ind-maxwell-btn'),
            hay: el('m4-ind-hay-btn'),
            anderson: el('m4-ind-anderson-btn')
        };
        if (!btns.maxwell) return;

        var currentBridge = 'maxwell';
        var r1 = el('m4-ind-r1'), r2 = el('m4-ind-r2'), r3 = el('m4-ind-r3');
        var c1 = el('m4-ind-c1'), fSlider = el('m4-ind-f');

        function setActive(name) {
            currentBridge = name;
            Object.keys(btns).forEach(function (k) {
                if (btns[k]) btns[k].classList.toggle('active', k === name);
            });
            updateLabels();
            update();
        }

        function updateLabels() {
            var title = el('m4-ind-title');
            var z1l = el('m4-ind-z1-label'), z2l = el('m4-ind-z2-label');
            var z3l = el('m4-ind-z3-label'), z4l = el('m4-ind-z4-label');
            if (currentBridge === 'maxwell') {
                title.textContent = "Maxwell's L/C Bridge";
                z1l.textContent = 'Z₁: R₁∥C₁'; z2l.textContent = 'Z₂: R₂';
                z3l.textContent = 'Z₃: R₃'; z4l.textContent = 'Z₄: Rx+jωLx';
            } else if (currentBridge === 'hay') {
                title.textContent = "Hay's Bridge";
                z1l.textContent = 'Z₁: R₁+1/jωC₁'; z2l.textContent = 'Z₂: R₂';
                z3l.textContent = 'Z₃: R₃'; z4l.textContent = 'Z₄: Rx+jωLx';
            } else {
                title.textContent = "Anderson's Bridge";
                z1l.textContent = 'Z₁: R₁'; z2l.textContent = 'Z₂: R₂';
                z3l.textContent = 'Z₃: R₃'; z4l.textContent = 'Z₄: Lx+Rx (C-arm)';
            }
        }

        function update() {
            var R1 = +r1.value, R2 = +r2.value, R3 = +r3.value;
            var C1 = +c1.value * 1e-6, f = +fSlider.value;
            var w = 2 * Math.PI * f;
            el('m4-ind-r1-val').textContent = R1;
            el('m4-ind-r2-val').textContent = R2;
            el('m4-ind-r3-val').textContent = R3;
            el('m4-ind-c1-val').textContent = c1.value;
            el('m4-ind-f-val').textContent = f;

            var Lx, Rx, Q, resultText;
            if (currentBridge === 'maxwell') {
                Lx = R2 * R3 * C1;
                Rx = R2 * R3 / R1;
                Q = w * C1 * R1;
                resultText = 'Lx = ' + fmtL(Lx) + ' | Rx = ' + fmtEng(Rx) + ' | Q = ' + Q.toFixed(2);
            } else if (currentBridge === 'hay') {
                var d = 1 + Math.pow(w * C1 * R1, 2);
                Lx = R2 * R3 * C1 / d;
                Rx = w * w * C1 * C1 * R1 * R2 * R3 / d;
                Q = 1 / (w * C1 * R1);
                resultText = 'Lx = ' + fmtL(Lx) + ' | Rx = ' + fmtEng(Rx) + ' | Q = ' + Q.toFixed(2);
            } else {
                // Anderson approximation: Lx ≈ C[R4·(R1+R3)+R1·R3] where R4=R1 for simplicity
                Lx = C1 * (R1 * (R1 + R3) + R1 * R3);
                Rx = R2 * R3 / R1;
                Q = w * Lx / Rx;
                resultText = 'Lx = ' + fmtL(Lx) + ' | Rx = ' + fmtEng(Rx) + ' | Q = ' + Q.toFixed(2);
            }
            el('m4-ind-result').textContent = resultText;

            // Lx vs freq chart: show Lx for Hay's depends on freq, Maxwell's doesn't
            var data = [];
            for (var fi = 50; fi <= 10000; fi += 200) {
                var wi = 2 * Math.PI * fi;
                var Lfi;
                if (currentBridge === 'maxwell') {
                    Lfi = R2 * R3 * C1;
                } else if (currentBridge === 'hay') {
                    Lfi = R2 * R3 * C1 / (1 + Math.pow(wi * C1 * R1, 2));
                } else {
                    Lfi = C1 * (R1 * (R1 + R3) + R1 * R3);
                }
                data.push([fi, Lfi * 1e3]); // mH
            }
            d3Line('m4-ind-freq', 320, 210, data, 'Frequency (Hz)', 'Lx (mH)',
                currentBridge === 'maxwell' ? CYAN : currentBridge === 'hay' ? GOLD : ORANGE);
        }

        Object.keys(btns).forEach(function (k) {
            if (btns[k]) btns[k].addEventListener('click', function () { setActive(k); });
        });
        [r1, r2, r3, c1, fSlider].forEach(function (s) {
            if (s) s.addEventListener('input', update);
        });
        update();

        // Maxwell calculator
        addCalcListener(['m4-mxc-r1', 'm4-mxc-r2', 'm4-mxc-r3', 'm4-mxc-c1', 'm4-mxc-f'], function () {
            var R1 = +el('m4-mxc-r1').value, R2 = +el('m4-mxc-r2').value;
            var R3 = +el('m4-mxc-r3').value, C1 = +el('m4-mxc-c1').value * 1e-6;
            var f = +el('m4-mxc-f').value, w = 2 * Math.PI * f;
            var Lx = R2 * R3 * C1, Rx = R2 * R3 / R1, Q = w * C1 * R1;
            el('m4-mxc-result').textContent = 'Lx = ' + fmtL(Lx) + ' | Rx = ' + fmtEng(Rx) + ' | Q = ' + Q.toFixed(2);
        });

        // Hay calculator
        addCalcListener(['m4-hyc-r1', 'm4-hyc-r2', 'm4-hyc-r3', 'm4-hyc-c1', 'm4-hyc-f'], function () {
            var R1 = +el('m4-hyc-r1').value, R2 = +el('m4-hyc-r2').value;
            var R3 = +el('m4-hyc-r3').value, C1 = +el('m4-hyc-c1').value * 1e-6;
            var f = +el('m4-hyc-f').value, w = 2 * Math.PI * f;
            var d = 1 + Math.pow(w * C1 * R1, 2);
            var Lx = R2 * R3 * C1 / d;
            var Rx = w * w * C1 * C1 * R1 * R2 * R3 / d;
            var Q = 1 / (w * C1 * R1);
            el('m4-hyc-result').textContent = 'Lx = ' + fmtL(Lx) + ' | Rx = ' + fmtEng(Rx) + ' | Q = ' + Q.toFixed(2);
        });
    }

    /* =================================================================
       CARD 4.5 — CAPACITANCE & DISSIPATION FACTOR
       ================================================================= */
    function initCapacitance() {
        var c1Slider = el('m4-cap-c1'), r3Slider = el('m4-cap-r3'), fSlider = el('m4-cap-f');
        if (!c1Slider) return;

        function update() {
            var C1nF = +c1Slider.value, R3 = +r3Slider.value, f = +fSlider.value;
            el('m4-cap-c1-val').textContent = C1nF;
            el('m4-cap-r3-val').textContent = R3;
            el('m4-cap-f-val').textContent = f;

            var w = 2 * Math.PI * f;
            var C1 = C1nF * 1e-9;
            var D = w * C1 * R3;

            // Demo: Cx = Cs * R4/R3, assume Cs = 100nF, R4 = 200Ω for the slider demo
            var Cs = 100e-9, R4 = 200;
            var Cx = Cs * R4 / R3;

            el('m4-cap-result').textContent = 'Cx = ' + fmtC(Cx) + ' | D = ' + D.toFixed(4);

            // Gauge — D factor visualization
            drawDGauge(D);
        }

        function drawDGauge(D) {
            var container = el('m4-cap-gauge');
            if (!container) return;
            container.innerHTML = '';
            var w = 320, h = 210;
            var svg = d3.select('#m4-cap-gauge').append('svg').attr('width', w).attr('height', h);

            var cx = w / 2, cy = 140, R = 80;
            // Arc from -150° to -30° (180° sweep)
            var startA = -150 * Math.PI / 180, endA = -30 * Math.PI / 180;

            // Background arc
            var arc = d3.arc().innerRadius(R - 8).outerRadius(R).startAngle(startA).endAngle(endA);
            svg.append('path').attr('d', arc()).attr('transform', 'translate(' + cx + ',' + cy + ')')
                .attr('fill', '#1e293b');

            // Value arc (D clamped 0-1)
            var Dc = Math.min(D, 1);
            var valEnd = startA + (endA - startA) * Dc;
            var valArc = d3.arc().innerRadius(R - 8).outerRadius(R).startAngle(startA).endAngle(valEnd);
            var gaugeCol = D < 0.01 ? GREEN : D < 0.05 ? GOLD : RED;
            svg.append('path').attr('d', valArc()).attr('transform', 'translate(' + cx + ',' + cy + ')')
                .attr('fill', gaugeCol);

            // Labels
            svg.append('text').attr('x', cx).attr('y', cy - 20).attr('text-anchor', 'middle')
                .attr('fill', gaugeCol).attr('font-size', '18px').attr('font-weight', 'bold')
                .attr('font-family', 'Orbitron').text('D = ' + D.toFixed(4));
            svg.append('text').attr('x', cx).attr('y', cy).attr('text-anchor', 'middle')
                .attr('fill', MUTED).attr('font-size', '10px').text('tan δ = ωC₁R₃');
            svg.append('text').attr('x', cx).attr('y', cy + 18).attr('text-anchor', 'middle')
                .attr('fill', MUTED).attr('font-size', '9px')
                .text(D < 0.01 ? 'Excellent dielectric' : D < 0.05 ? 'Acceptable' : 'Lossy capacitor');

            // Q label
            var Qc = D > 0 ? 1 / D : Infinity;
            svg.append('text').attr('x', cx).attr('y', 30).attr('text-anchor', 'middle')
                .attr('fill', PURPLE).attr('font-size', '12px').attr('font-family', 'Orbitron')
                .text('Q = 1/D = ' + (Qc > 9999 ? '∞' : Qc.toFixed(1)));
        }

        c1Slider.addEventListener('input', update);
        r3Slider.addEventListener('input', update);
        fSlider.addEventListener('input', update);
        update();

        // Calculator
        addCalcListener(['m4-shc-cs', 'm4-shc-r3', 'm4-shc-r4', 'm4-shc-c1', 'm4-shc-f'], function () {
            var Cs = +el('m4-shc-cs').value * 1e-9;
            var R3 = +el('m4-shc-r3').value;
            var R4 = +el('m4-shc-r4').value;
            var C1 = +el('m4-shc-c1').value * 1e-9;
            var f = +el('m4-shc-f').value;
            var w = 2 * Math.PI * f;
            var Cx = Cs * R4 / R3;
            var Rx = R3 * C1 / Cs;
            var D = w * C1 * R3;
            el('m4-shc-result').textContent = 'Cx = ' + fmtC(Cx) + ' | Rx = ' + fmtEng(Rx) + ' | D = ' + D.toFixed(4);
        });
    }

    /* =================================================================
       CARD 4.6 — WIEN'S BRIDGE / FREQUENCY MEASUREMENT
       ================================================================= */
    function initWien() {
        var rSlider = el('m4-wien-r'), cSlider = el('m4-wien-c');
        if (!rSlider) return;

        function update() {
            var Rk = +rSlider.value, CnF = +cSlider.value;
            el('m4-wien-r-val').textContent = Rk;
            el('m4-wien-c-val').textContent = CnF;
            var R = Rk * 1e3, C = CnF * 1e-9;
            var f = 1 / (2 * Math.PI * R * C);
            el('m4-wien-freq').textContent = 'f = ' + fmtFreq(f);

            // f vs R chart (fixed C)
            var data = [];
            for (var ri = 100; ri <= 100000; ri += 2000) {
                data.push([ri / 1000, 1 / (2 * Math.PI * ri * C)]);
            }
            d3Line('m4-wien-chart', 320, 190, data, 'R (kΩ)', 'f (Hz)', ROSE);
        }

        rSlider.addEventListener('input', update);
        cSlider.addEventListener('input', update);
        update();

        // Calculator
        addCalcListener(['m4-wnc-r', 'm4-wnc-c'], function () {
            var R = +el('m4-wnc-r').value * 1e3;
            var C = +el('m4-wnc-c').value * 1e-9;
            if (R <= 0 || C <= 0) { el('m4-wnc-result').textContent = 'Invalid'; return; }
            var f = 1 / (2 * Math.PI * R * C);
            el('m4-wnc-result').textContent = 'f = ' + fmtFreq(f);
        });
    }

    /* ── Bookmarks ── */
    function initBookmarks() {
        document.querySelectorAll('.m4-bookmark-btn').forEach(function (btn) {
            var card = btn.getAttribute('data-card');
            var key = 'mod4_bm_' + card;
            if (localStorage.getItem(key) === '1') btn.textContent = '⭐ Bookmarked';
            btn.addEventListener('click', function () {
                var saved = localStorage.getItem(key) === '1';
                localStorage.setItem(key, saved ? '0' : '1');
                btn.textContent = saved ? '🔖 Bookmark' : '⭐ Bookmarked';
            });
        });
    }

    /* ── GSAP scroll animations ── */
    function initGSAP() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.utils.toArray('#mod4 .machine-card').forEach(function (card) {
            gsap.from(card, {
                scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
                y: 40, opacity: 0, duration: 0.6, ease: 'power2.out'
            });
        });
        gsap.utils.toArray('.m4-badge').forEach(function (b) {
            gsap.to(b, {
                boxShadow: '0 0 12px rgba(167,139,250,0.4)',
                repeat: -1, yoyo: true, duration: 1.5, ease: 'sine.inOut'
            });
        });
    }

    /* ── Master init ── */
    function initModule4() {
        initLossOfCharge();
        initMegger();
        initACBridge();
        initInductance();
        initCapacitance();
        initWien();
        initBookmarks();
        initGSAP();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModule4);
    } else {
        initModule4();
    }
})();
