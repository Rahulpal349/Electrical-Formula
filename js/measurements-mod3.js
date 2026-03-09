/* ═══════════════════════════════════════════════════════════
   MODULE 3: RECTIFIER INSTRUMENTS & RESISTANCE MEASUREMENT
   Green accent #00ff88
   ═══════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    const GREEN  = '#00ff88', ORANGE = '#f97316', CYAN = '#00f5ff',
          GOLD   = '#facc15', PURPLE = '#a78bfa', BLUE = '#60a5fa',
          RED    = '#ef4444', GREY   = '#94a3b8', BG   = '#0d1117';

    /* ── helpers (same pattern as mod2) ────────────────── */
    function d3Container(id, w, h) {
        const el = document.getElementById(id);
        if (!el) return null;
        return d3.select('#' + id).append('svg')
            .attr('viewBox', '0 0 ' + w + ' ' + h)
            .attr('width', '100%').attr('height', '100%')
            .style('background', 'rgba(0,0,0,0.2)')
            .style('border-radius', '8px');
    }

    function initCalcListener(ids, fn) {
        ids.forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.addEventListener('input', fn);
        });
        fn();
    }

    function setResult(id, html) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = html;
    }

    function fmtR(v) {
        if (v >= 1e9) return (v / 1e9).toFixed(1) + ' GΩ';
        if (v >= 1e6) return (v / 1e6).toFixed(1) + ' MΩ';
        if (v >= 1e3) return (v / 1e3).toFixed(1) + ' kΩ';
        if (v >= 1)   return v.toFixed(1) + ' Ω';
        return (v * 1000).toFixed(1) + ' mΩ';
    }

    /* ══════════════════════════════════════════════════════
       CARD 3.1: HALF WAVE RECTIFIER METER
       ══════════════════════════════════════════════════════ */
    function initHalfWave() {
        var waveW = 300, waveH = 175;
        var waveSvg = d3Container('m3-hw-wave', waveW, waveH);

        if (waveSvg) {
            // Title
            waveSvg.append('text').attr('x', waveW / 2).attr('y', 14)
                .attr('fill', GREY).attr('font-size', 9).attr('text-anchor', 'middle')
                .text('HW Rectifier Waveforms');

            var pts = 200, midY = waveH / 2 + 5;
            var amp = 55;

            // Input sine (cyan)
            var inputData = [];
            for (var i = 0; i <= pts; i++) {
                var t = i / pts;
                inputData.push({ x: 15 + t * (waveW - 30), y: midY - amp * Math.sin(2 * Math.PI * t * 3) });
            }
            var line = d3.line().x(function (d) { return d.x; }).y(function (d) { return d.y; }).curve(d3.curveMonotoneX);
            waveSvg.append('path').attr('d', line(inputData)).attr('fill', 'none').attr('stroke', CYAN).attr('stroke-width', 1.5).attr('opacity', 0.5);

            // Output (only positive halves - gold)
            var outputData = [];
            for (var i = 0; i <= pts; i++) {
                var t = i / pts;
                var val = Math.sin(2 * Math.PI * t * 3);
                outputData.push({ x: 15 + t * (waveW - 30), y: val > 0 ? midY - amp * val : midY });
            }
            waveSvg.append('path').attr('d', line(outputData)).attr('fill', 'none').attr('stroke', GOLD).attr('stroke-width', 2);

            // Vavg line
            var vavg = amp / Math.PI;
            waveSvg.append('line').attr('x1', 15).attr('y1', midY - vavg).attr('x2', waveW - 15).attr('y2', midY - vavg)
                .attr('stroke', GREEN).attr('stroke-width', 1.5).attr('stroke-dasharray', '4 3');
            waveSvg.append('text').attr('x', waveW - 12).attr('y', midY - vavg - 4).attr('fill', GREEN).attr('font-size', 7).attr('text-anchor', 'end').text('V_avg = Vm/π');

            // Vrms line
            var vrms = amp / Math.sqrt(2);
            waveSvg.append('line').attr('x1', 15).attr('y1', midY - vrms).attr('x2', waveW - 15).attr('y2', midY - vrms)
                .attr('stroke', ORANGE).attr('stroke-width', 1).attr('stroke-dasharray', '2 2');
            waveSvg.append('text').attr('x', waveW - 12).attr('y', midY - vrms - 4).attr('fill', ORANGE).attr('font-size', 7).attr('text-anchor', 'end').text('V_rms');

            // FF label
            waveSvg.append('text').attr('x', waveW / 2).attr('y', waveH - 8).attr('fill', GOLD).attr('font-size', 9).attr('text-anchor', 'middle')
                .text('FF = Vrms/Vavg = π/√2 ≈ 2.22');

            // zero line
            waveSvg.append('line').attr('x1', 15).attr('y1', midY).attr('x2', waveW - 15).attr('y2', midY)
                .attr('stroke', '#333').attr('stroke-width', 1);
        }

        // Sensitivity bars
        var sensW = 400, sensH = 80;
        var sensSvg = d3Container('m3-hw-sens', sensW, sensH);
        if (sensSvg) {
            var barY = 15, barH = 20;
            // DC bar (100%)
            sensSvg.append('rect').attr('x', 40).attr('y', barY).attr('width', 300).attr('height', barH).attr('rx', 4).attr('fill', CYAN).attr('opacity', 0.6);
            sensSvg.append('text').attr('x', 195).attr('y', barY + 14).attr('fill', '#000').attr('font-size', 9).attr('text-anchor', 'middle').text('DC Sensitivity = 100%');

            // AC bar (45%)
            sensSvg.append('rect').attr('x', 40).attr('y', barY + 30).attr('width', 135).attr('height', barH).attr('rx', 4).attr('fill', GOLD).attr('opacity', 0.7);
            sensSvg.append('text').attr('x', 107).attr('y', barY + 44).attr('fill', '#000').attr('font-size', 9).attr('text-anchor', 'middle').text('AC = 45%');

            sensSvg.append('text').attr('x', 200).attr('y', barY + 44).attr('fill', ORANGE).attr('font-size', 8).text('S_ac = 0.45 × S_dc');
        }

        // Arrow pulse animation
        var arrow = document.getElementById('m3-hw-arrow');
        if (arrow && typeof gsap !== 'undefined') {
            gsap.to(arrow, { x: 8, duration: 0.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        }

        // Calculator
        initCalcListener(['m3-hw-pmmc', 'm3-hw-sdc', 'm3-hw-v', 'm3-hw-rm', 'm3-hw-rd'], function () {
            var pmmc = +document.getElementById('m3-hw-pmmc').value;
            var sdc = +document.getElementById('m3-hw-sdc').value;
            var V = +document.getElementById('m3-hw-v').value;
            var rm = +document.getElementById('m3-hw-rm').value;
            var rd = +document.getElementById('m3-hw-rd').value;
            var hwReading = (2.22 * pmmc).toFixed(3);
            var sac = 0.45 * sdc;
            var rs = sac * V - rm - rd;
            setResult('m3-hw-result', 'HW reading = ' + hwReading + ' V | S_ac = ' + sac.toFixed(0) + ' Ω/V | R_s = ' + rs.toFixed(1) + ' Ω');
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 3.2: FULL WAVE RECTIFIER METER
       ══════════════════════════════════════════════════════ */
    function initFullWave() {
        var waveW = 300, waveH = 195;
        var waveSvg = d3Container('m3-fw-wave', waveW, waveH);

        if (waveSvg) {
            waveSvg.append('text').attr('x', waveW / 2).attr('y', 14).attr('fill', GREY).attr('font-size', 9).attr('text-anchor', 'middle').text('HW vs FW Waveform Comparison');

            var pts = 200, midY = waveH / 2 + 10, amp = 55;
            var line = d3.line().x(function (d) { return d.x; }).y(function (d) { return d.y; }).curve(d3.curveMonotoneX);

            // Input sine (faint cyan)
            var inputData = [];
            for (var i = 0; i <= pts; i++) {
                var t = i / pts;
                inputData.push({ x: 15 + t * (waveW - 30), y: midY - amp * Math.sin(2 * Math.PI * t * 3) });
            }
            waveSvg.append('path').attr('d', line(inputData)).attr('fill', 'none').attr('stroke', CYAN).attr('stroke-width', 1).attr('opacity', 0.3);

            // HW output (orange, faint)
            var hwData = [];
            for (var i = 0; i <= pts; i++) {
                var t = i / pts;
                var val = Math.sin(2 * Math.PI * t * 3);
                hwData.push({ x: 15 + t * (waveW - 30), y: val > 0 ? midY - amp * val : midY });
            }
            waveSvg.append('path').attr('d', line(hwData)).attr('fill', 'none').attr('stroke', ORANGE).attr('stroke-width', 1.5).attr('opacity', 0.5);

            // FW output (green)
            var fwData = [];
            for (var i = 0; i <= pts; i++) {
                var t = i / pts;
                var val = Math.abs(Math.sin(2 * Math.PI * t * 3));
                fwData.push({ x: 15 + t * (waveW - 30), y: midY - amp * val });
            }
            waveSvg.append('path').attr('d', line(fwData)).attr('fill', 'none').attr('stroke', GREEN).attr('stroke-width', 2);

            // Vavg lines
            var vavgHW = amp / Math.PI;
            var vavgFW = 2 * amp / Math.PI;
            waveSvg.append('line').attr('x1', 15).attr('y1', midY - vavgHW).attr('x2', waveW - 15).attr('y2', midY - vavgHW).attr('stroke', ORANGE).attr('stroke-width', 1).attr('stroke-dasharray', '3 3');
            waveSvg.append('text').attr('x', 12).attr('y', midY - vavgHW - 3).attr('fill', ORANGE).attr('font-size', 7).text('HW avg');

            waveSvg.append('line').attr('x1', 15).attr('y1', midY - vavgFW).attr('x2', waveW - 15).attr('y2', midY - vavgFW).attr('stroke', GREEN).attr('stroke-width', 1).attr('stroke-dasharray', '3 3');
            waveSvg.append('text').attr('x', 12).attr('y', midY - vavgFW - 3).attr('fill', GREEN).attr('font-size', 7).text('FW avg');

            // zero line
            waveSvg.append('line').attr('x1', 15).attr('y1', midY).attr('x2', waveW - 15).attr('y2', midY).attr('stroke', '#333').attr('stroke-width', 1);

            // Legend
            waveSvg.append('text').attr('x', waveW / 2).attr('y', waveH - 5).attr('fill', GREY).attr('font-size', 8).attr('text-anchor', 'middle').text('FW Vavg = 2× HW Vavg');
        }

        // Form factor bars
        var ffW = 200, ffH = 120;
        var ffSvg = d3Container('m3-fw-ff', ffW, ffH);
        if (ffSvg) {
            ffSvg.append('text').attr('x', ffW / 2).attr('y', 14).attr('fill', GREY).attr('font-size', 9).attr('text-anchor', 'middle').text('Form Factor Comparison');
            var bars = [{ label: 'HW', val: 2.22, color: ORANGE }, { label: 'FW', val: 1.11, color: CYAN }];
            var barW = 50, maxH = 70;
            bars.forEach(function (b, i) {
                var x = 30 + i * 90;
                var h = (b.val / 2.5) * maxH;
                ffSvg.append('rect').attr('x', x).attr('y', ffH - 20 - h).attr('width', barW).attr('height', h).attr('rx', 4).attr('fill', b.color).attr('opacity', 0.7);
                ffSvg.append('text').attr('x', x + barW / 2).attr('y', ffH - 22 - h).attr('fill', b.color).attr('font-size', 10).attr('text-anchor', 'middle').attr('font-weight', 'bold').text(b.val);
                ffSvg.append('text').attr('x', x + barW / 2).attr('y', ffH - 6).attr('fill', GREY).attr('font-size', 9).attr('text-anchor', 'middle').text(b.label);
            });
        }

        // Sensitivity gauge
        var sensW = 250, sensH = 120;
        var sensSvg = d3Container('m3-fw-sens', sensW, sensH);
        if (sensSvg) {
            sensSvg.append('text').attr('x', sensW / 2).attr('y', 14).attr('fill', GREY).attr('font-size', 9).attr('text-anchor', 'middle').text('Sensitivity Comparison');
            var data = [
                { label: 'DC', pct: 100, color: GREEN },
                { label: 'FW', pct: 90, color: CYAN },
                { label: 'HW', pct: 45, color: ORANGE }
            ];
            var barH = 18, startY = 25;
            data.forEach(function (d, i) {
                var y = startY + i * 28;
                var w = (d.pct / 100) * (sensW - 80);
                sensSvg.append('rect').attr('x', 40).attr('y', y).attr('width', w).attr('height', barH).attr('rx', 4).attr('fill', d.color).attr('opacity', 0.6);
                sensSvg.append('text').attr('x', 36).attr('y', y + 13).attr('fill', d.color).attr('font-size', 8).attr('text-anchor', 'end').text(d.label);
                sensSvg.append('text').attr('x', 42 + w + 3).attr('y', y + 13).attr('fill', d.color).attr('font-size', 8).text(d.pct + '%');
            });
        }

        // Calculator
        initCalcListener(['m3-fw-pmmc', 'm3-fw-sdc', 'm3-fw-v', 'm3-fw-rm', 'm3-fw-rd'], function () {
            var pmmc = +document.getElementById('m3-fw-pmmc').value;
            var sdc = +document.getElementById('m3-fw-sdc').value;
            var V = +document.getElementById('m3-fw-v').value;
            var rm = +document.getElementById('m3-fw-rm').value;
            var rd = +document.getElementById('m3-fw-rd').value;
            var fwReading = (1.11 * pmmc).toFixed(3);
            var sac = 0.9 * sdc;
            var rs = sac * V - rm - 2 * rd;
            setResult('m3-fw-result', 'FW reading = ' + fwReading + ' V | S_ac = ' + sac.toFixed(0) + ' Ω/V | R_s = ' + rs.toFixed(1) + ' Ω');
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 3.3: RESISTANCE CLASSIFICATION
       ══════════════════════════════════════════════════════ */
    function initResistanceClassification() {
        var scaleW = 700, scaleH = 140;
        var scaleSvg = d3Container('m3-rclass-scale', scaleW, scaleH);

        if (scaleSvg) {
            scaleSvg.append('text').attr('x', scaleW / 2).attr('y', 14).attr('fill', GREY).attr('font-size', 10).attr('text-anchor', 'middle').text('Resistance Classification — Log Scale');

            var margin = { l: 50, r: 30 }, w = scaleW - margin.l - margin.r;
            var xScale = d3.scaleLog().domain([0.001, 1e9]).range([margin.l, margin.l + w]);
            var barY = 35, barH = 35;

            // Zones
            var zones = [
                { start: 0.001, end: 1, color: BLUE, label: 'Low R', sub: '< 1Ω' },
                { start: 1, end: 100000, color: GOLD, label: 'Medium R', sub: '1Ω – 100kΩ' },
                { start: 100000, end: 1e9, color: RED, label: 'High R', sub: '> 100kΩ' }
            ];
            zones.forEach(function (z) {
                var x1 = xScale(z.start), x2 = xScale(z.end);
                scaleSvg.append('rect').attr('x', x1).attr('y', barY).attr('width', x2 - x1).attr('height', barH).attr('fill', z.color).attr('opacity', 0.15).attr('stroke', z.color).attr('stroke-width', 1);
                scaleSvg.append('text').attr('x', (x1 + x2) / 2).attr('y', barY + 15).attr('fill', z.color).attr('font-size', 10).attr('text-anchor', 'middle').attr('font-weight', 'bold').text(z.label);
                scaleSvg.append('text').attr('x', (x1 + x2) / 2).attr('y', barY + 28).attr('fill', GREY).attr('font-size', 8).attr('text-anchor', 'middle').text(z.sub);
            });

            // Tick marks
            var ticks = [0.001, 0.01, 0.1, 1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9];
            ticks.forEach(function (t) {
                var x = xScale(t);
                scaleSvg.append('line').attr('x1', x).attr('y1', barY + barH).attr('x2', x).attr('y2', barY + barH + 8).attr('stroke', '#475569').attr('stroke-width', 1);
                var label = t >= 1e9 ? '1G' : t >= 1e6 ? (t / 1e6) + 'M' : t >= 1e3 ? (t / 1e3) + 'k' : t >= 1 ? t + '' : t < 0.01 ? '1m' : t < 0.1 ? '10m' : '100m';
                scaleSvg.append('text').attr('x', x).attr('y', barY + barH + 18).attr('fill', '#475569').attr('font-size', 7).attr('text-anchor', 'middle').text(label);
            });

            // Divider lines at 1Ω and 100kΩ
            [1, 100000].forEach(function (v) {
                scaleSvg.append('line').attr('x1', xScale(v)).attr('y1', barY - 5).attr('x2', xScale(v)).attr('y2', barY + barH + 5).attr('stroke', '#fff').attr('stroke-width', 2).attr('stroke-dasharray', '3 2');
            });

            // Bottom labels
            scaleSvg.append('text').attr('x', xScale(1)).attr('y', barY + barH + 32).attr('fill', '#fff').attr('font-size', 8).attr('text-anchor', 'middle').text('1 Ω');
            scaleSvg.append('text').attr('x', xScale(100000)).attr('y', barY + barH + 32).attr('fill', '#fff').attr('font-size', 8).attr('text-anchor', 'middle').text('100 kΩ');
        }

        // Methods tree
        var treeW = 700, treeH = 120;
        var treeSvg = d3Container('m3-rclass-tree', treeW, treeH);
        if (treeSvg) {
            treeSvg.append('text').attr('x', treeW / 2).attr('y', 14).attr('fill', GREY).attr('font-size', 9).attr('text-anchor', 'middle').text('Measurement Methods by Range');

            var cols = [
                { x: 120, color: BLUE, title: 'Low R', methods: ['Kelvin Bridge', 'Potentiometer', 'A-V (Case II)'] },
                { x: 350, color: GOLD, title: 'Medium R', methods: ['Wheatstone Bridge', 'A-V Method', 'Ohmmeter'] },
                { x: 580, color: RED, title: 'High R', methods: ['Megger', 'Loss of Charge', 'A-V (Case I)'] }
            ];
            cols.forEach(function (c) {
                treeSvg.append('text').attr('x', c.x).attr('y', 30).attr('fill', c.color).attr('font-size', 9).attr('text-anchor', 'middle').attr('font-weight', 'bold').text(c.title);
                c.methods.forEach(function (m, i) {
                    treeSvg.append('text').attr('x', c.x).attr('y', 48 + i * 16).attr('fill', GREY).attr('font-size', 8).attr('text-anchor', 'middle').text('• ' + m);
                });
            });
        }
    }

    /* ══════════════════════════════════════════════════════
       CARD 3.4: AMMETER-VOLTMETER METHOD
       ══════════════════════════════════════════════════════ */
    function initAmmeterVoltmeter() {
        var rxSlider = document.getElementById('m3-av-rx');
        var raSlider = document.getElementById('m3-av-ra');
        var rvSlider = document.getElementById('m3-av-rv');
        if (!rxSlider || !raSlider || !rvSlider) return;

        var rxVal = document.getElementById('m3-av-rx-val');
        var raVal = document.getElementById('m3-av-ra-val');
        var rvVal = document.getElementById('m3-av-rv-val');
        var err1  = document.getElementById('m3-av-err1');
        var err2  = document.getElementById('m3-av-err2');

        // Error crossover chart
        var chW = 500, chH = 180;
        var crossSvg = d3Container('m3-av-crossover', chW, chH);

        function drawCrossover(RA, RV) {
            if (!crossSvg) return;
            crossSvg.selectAll('.cr-elem').remove();

            var margin = { t: 20, r: 20, b: 30, l: 45 };
            var w = chW - margin.l - margin.r, h = chH - margin.t - margin.b;
            var g = crossSvg.append('g').attr('class', 'cr-elem').attr('transform', 'translate(' + margin.l + ',' + margin.t + ')');

            var xScale = d3.scaleLog().domain([1, 1e6]).range([0, w]);
            var yScale = d3.scaleLinear().domain([0, 25]).range([h, 0]);

            // Axes
            g.append('line').attr('x1', 0).attr('y1', h).attr('x2', w).attr('y2', h).attr('stroke', '#475569');
            g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', h).attr('stroke', '#475569');
            g.append('text').attr('x', w / 2).attr('y', h + 24).attr('fill', GREY).attr('font-size', 8).attr('text-anchor', 'middle').text('Rx (Ω) — log scale');
            g.append('text').attr('x', -h / 2).attr('y', -32).attr('fill', GREY).attr('font-size', 8).attr('text-anchor', 'middle').attr('transform', 'rotate(-90)').text('|Error| %');

            // Case I error: RA/Rx × 100
            var case1 = [], case2 = [];
            for (var rx = 1; rx <= 1e6; rx *= 1.15) {
                case1.push({ x: rx, y: Math.min((RA / rx) * 100, 25) });
                case2.push({ x: rx, y: Math.min((rx / RV) * 100, 25) });
            }

            var lineGen = d3.line().x(function (d) { return xScale(d.x); }).y(function (d) { return yScale(d.y); }).curve(d3.curveMonotoneX);

            g.append('path').attr('d', lineGen(case1)).attr('fill', 'none').attr('stroke', ORANGE).attr('stroke-width', 2);
            g.append('path').attr('d', lineGen(case2)).attr('fill', 'none').attr('stroke', BLUE).attr('stroke-width', 2);

            // Labels
            g.append('text').attr('x', w - 5).attr('y', yScale(case1[case1.length - 1].y) - 5).attr('fill', ORANGE).attr('font-size', 7).attr('text-anchor', 'end').text('Case I (+RA/Rx)');
            g.append('text').attr('x', w - 5).attr('y', yScale(case2[case2.length - 1].y) + 12).attr('fill', BLUE).attr('font-size', 7).attr('text-anchor', 'end').text('Case II (−Rx/RV)');

            // Rcritical line
            var rcrit = Math.sqrt(RA * RV);
            if (rcrit >= 1 && rcrit <= 1e6) {
                g.append('line').attr('x1', xScale(rcrit)).attr('y1', 0).attr('x2', xScale(rcrit)).attr('y2', h).attr('stroke', GREEN).attr('stroke-width', 2).attr('stroke-dasharray', '4 3');
                g.append('text').attr('x', xScale(rcrit)).attr('y', -4).attr('fill', GREEN).attr('font-size', 8).attr('text-anchor', 'middle').text('R_crit = ' + fmtR(rcrit));

                // Zones
                g.append('text').attr('x', xScale(rcrit) - 20).attr('y', 14).attr('fill', BLUE).attr('font-size', 7).attr('text-anchor', 'end').text('← Case II (low R)');
                g.append('text').attr('x', xScale(rcrit) + 20).attr('y', 14).attr('fill', ORANGE).attr('font-size', 7).text('Case I (high R) →');
            }

            // Tick marks
            [1, 10, 100, 1e3, 1e4, 1e5, 1e6].forEach(function (t) {
                g.append('text').attr('x', xScale(t)).attr('y', h + 14).attr('fill', '#475569').attr('font-size', 7).attr('text-anchor', 'middle').text(fmtR(t));
            });
        }

        function update() {
            var Rx = +rxSlider.value;
            var RA = +raSlider.value;
            var RV = +rvSlider.value * 1000; // kΩ → Ω

            if (rxVal) rxVal.textContent = fmtR(Rx);
            if (raVal) raVal.textContent = RA + 'Ω';
            if (rvVal) rvVal.textContent = fmtR(RV);

            var e1 = (RA / Rx) * 100;
            var e2 = (Rx / RV) * 100;
            if (err1) err1.textContent = 'Error = +RA/Rx = +' + e1.toFixed(3) + '%';
            if (err2) err2.textContent = 'Error = −Rx/RV = −' + e2.toFixed(3) + '%';

            drawCrossover(RA, RV);
        }

        [rxSlider, raSlider, rvSlider].forEach(function (s) { s.addEventListener('input', update); });
        update();

        // Calculator
        initCalcListener(['m3-avc-rx', 'm3-avc-ra', 'm3-avc-rv'], function () {
            var rx = +document.getElementById('m3-avc-rx').value;
            var ra = +document.getElementById('m3-avc-ra').value;
            var rv = +document.getElementById('m3-avc-rv').value;
            var e1 = (ra / rx) * 100;
            var e2 = (rx / rv) * 100;
            var rcrit = Math.sqrt(ra * rv);
            var recommend = rx > rcrit ? 'Case I' : 'Case II';
            setResult('m3-avc-result',
                'Case I err = +' + e1.toFixed(4) + '% | Case II err = −' + e2.toFixed(4) + '% | R_crit = ' + fmtR(rcrit) + ' → Use <b style="color:' + (recommend === 'Case I' ? ORANGE : BLUE) + '">' + recommend + '</b>');
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 3.5: WHEATSTONE BRIDGE
       ══════════════════════════════════════════════════════ */
    function initWheatstoneBridge() {
        var pSlider = document.getElementById('m3-wb-p');
        var qSlider = document.getElementById('m3-wb-q');
        var rSlider = document.getElementById('m3-wb-r');
        var sSlider = document.getElementById('m3-wb-s');
        if (!pSlider || !qSlider || !rSlider || !sSlider) return;

        var pVal = document.getElementById('m3-wb-p-val');
        var qVal = document.getElementById('m3-wb-q-val');
        var rVal = document.getElementById('m3-wb-r-val');
        var sVal = document.getElementById('m3-wb-s-val');
        var needle = document.getElementById('m3-wb-needle');
        var status = document.getElementById('m3-wb-status');

        // Sensitivity chart
        var sensW = 280, sensH = 245;
        var sensSvg = d3Container('m3-wb-sens', sensW, sensH);

        function drawSensitivity(P, Q, R, S) {
            if (!sensSvg) return;
            sensSvg.selectAll('.ws-el').remove();

            var margin = { t: 25, r: 15, b: 30, l: 45 };
            var w = sensW - margin.l - margin.r, h = sensH - margin.t - margin.b;
            var g = sensSvg.append('g').attr('class', 'ws-el').attr('transform', 'translate(' + margin.l + ',' + margin.t + ')');

            // Show unbalance vs R
            var Sbal = Q * R / P;
            var data = [];
            for (var r = Math.max(10, Sbal - 2000); r <= Sbal + 2000; r += 40) {
                var unbalance = P * r - Q * R;
                data.push({ s: r, ub: unbalance });
            }

            var xScale = d3.scaleLinear().domain(d3.extent(data, function (d) { return d.s; })).range([0, w]);
            var maxUb = d3.max(data, function (d) { return Math.abs(d.ub); }) || 1;
            var yScale = d3.scaleLinear().domain([-maxUb, maxUb]).range([h, 0]);

            // Axes
            g.append('line').attr('x1', 0).attr('y1', h / 2).attr('x2', w).attr('y2', h / 2).attr('stroke', '#475569');
            g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', h).attr('stroke', '#475569');
            g.append('text').attr('x', w / 2).attr('y', h + 22).attr('fill', GREY).attr('font-size', 8).attr('text-anchor', 'middle').text('S (Ω)');
            g.append('text').attr('x', -5).attr('y', -8).attr('fill', GREY).attr('font-size', 7).text('PS−QR');

            var lineGen = d3.line().x(function (d) { return xScale(d.s); }).y(function (d) { return yScale(d.ub); }).curve(d3.curveMonotoneX);
            g.append('path').attr('d', lineGen(data)).attr('fill', 'none').attr('stroke', PURPLE).attr('stroke-width', 2);

            // Balance point
            if (Sbal > 0) {
                g.append('circle').attr('cx', xScale(Sbal)).attr('cy', yScale(0)).attr('r', 5).attr('fill', GREEN);
                g.append('text').attr('x', xScale(Sbal)).attr('y', yScale(0) - 8).attr('fill', GREEN).attr('font-size', 8).attr('text-anchor', 'middle').text('S=' + fmtR(Sbal));
            }

            // Current S marker
            if (S >= d3.min(data, function (d) { return d.s; }) && S <= d3.max(data, function (d) { return d.s; })) {
                var ubCur = P * S - Q * R;
                g.append('circle').attr('cx', xScale(S)).attr('cy', yScale(ubCur)).attr('r', 4).attr('fill', ORANGE);
            }

            g.append('text').attr('x', w / 2).attr('y', 12).attr('fill', GREY).attr('font-size', 9).attr('text-anchor', 'middle').text('Unbalance: PS − QR vs S');
        }

        function update() {
            var P = +pSlider.value, Q = +qSlider.value, R = +rSlider.value, S = +sSlider.value;
            if (pVal) pVal.textContent = fmtR(P);
            if (qVal) qVal.textContent = fmtR(Q);
            if (rVal) rVal.textContent = fmtR(R);
            if (sVal) sVal.textContent = fmtR(S);

            var balance = P * S - Q * R;
            var isBalanced = Math.abs(balance) < Math.max(P * S, Q * R) * 0.02;

            // Needle deflection
            if (needle) {
                var maxDeflect = 30;
                var deflect = Math.max(-maxDeflect, Math.min(maxDeflect, balance / (P * S || 1) * 500));
                var rad = deflect * Math.PI / 180;
                var nx = 140 + 14 * Math.sin(rad);
                var ny = 110 - 14 * Math.cos(rad);
                needle.setAttribute('x2', String(nx));
                needle.setAttribute('y2', String(ny));
                needle.setAttribute('stroke', isBalanced ? GREEN : RED);
            }

            if (status) {
                if (isBalanced) {
                    status.textContent = '✓ BALANCED — Ig ≈ 0, S = QR/P = ' + fmtR(Q * R / P);
                    status.setAttribute('fill', GREEN);
                } else {
                    status.textContent = 'Unbalanced — PS ≠ QR, S should be ' + fmtR(Q * R / P);
                    status.setAttribute('fill', RED);
                }
            }

            drawSensitivity(P, Q, R, S);
        }

        [pSlider, qSlider, rSlider, sSlider].forEach(function (s) { s.addEventListener('input', update); });
        update();

        // Calculator
        initCalcListener(['m3-wbc-p', 'm3-wbc-q', 'm3-wbc-r'], function () {
            var p = +document.getElementById('m3-wbc-p').value;
            var q = +document.getElementById('m3-wbc-q').value;
            var r = +document.getElementById('m3-wbc-r').value;
            var s = q * r / p;
            setResult('m3-wbc-result', 'S = QR/P = ' + s.toFixed(3) + ' Ω (' + fmtR(s) + ') | PS = ' + (p * s).toFixed(1) + ', QR = ' + (q * r).toFixed(1) + ' ✓');
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 3.6: KELVIN DOUBLE BRIDGE
       ══════════════════════════════════════════════════════ */
    function initKelvinBridge() {
        var compW = 280, compH = 215;
        var compSvg = d3Container('m3-kb-compare', compW, compH);

        if (compSvg) {
            compSvg.append('text').attr('x', compW / 2).attr('y', 14).attr('fill', GREY).attr('font-size', 9).attr('text-anchor', 'middle').text('Wheatstone vs Kelvin: Lead Error');

            var margin = { t: 28, r: 15, b: 35, l: 15 };
            var w = compW - margin.l - margin.r, h = compH - margin.t - margin.b;
            var g = compSvg.append('g').attr('transform', 'translate(' + margin.l + ',' + margin.t + ')');

            // Error bars for different lead resistances
            var leads = [0.01, 0.05, 0.1, 0.2, 0.5];
            var Rx = 0.1; // 0.1 Ω
            var barW = w / (leads.length * 2 + 1);

            leads.forEach(function (r, i) {
                var x = i * (barW * 2 + 5) + 10;
                // Wheatstone error (lead adds to R)
                var whErr = (r / Rx) * 100;
                var kErr = 0.1; // Kelvin eliminates it

                var maxErr = 600;
                var hW = Math.min((whErr / maxErr) * (h - 20), h - 20);
                var hK = Math.min((kErr / maxErr) * (h - 20), h - 20);

                // Wheatstone bar
                g.append('rect').attr('x', x).attr('y', h - 15 - hW).attr('width', barW).attr('height', hW).attr('rx', 3).attr('fill', RED).attr('opacity', 0.6);
                // Kelvin bar
                g.append('rect').attr('x', x + barW + 2).attr('y', h - 15 - hK).attr('width', barW).attr('height', Math.max(hK, 3)).attr('rx', 3).attr('fill', GREEN).attr('opacity', 0.7);

                g.append('text').attr('x', x + barW).attr('y', h - 2).attr('fill', GREY).attr('font-size', 7).attr('text-anchor', 'middle').text('r=' + r + 'Ω');
                g.append('text').attr('x', x + barW / 2).attr('y', h - 17 - hW).attr('fill', RED).attr('font-size', 6).attr('text-anchor', 'middle').text(whErr.toFixed(0) + '%');
            });

            // Legend
            g.append('rect').attr('x', 0).attr('y', h + 5).attr('width', 10).attr('height', 8).attr('fill', RED).attr('opacity', 0.6);
            g.append('text').attr('x', 13).attr('y', h + 12).attr('fill', RED).attr('font-size', 7).text('Wheatstone');
            g.append('rect').attr('x', 80).attr('y', h + 5).attr('width', 10).attr('height', 8).attr('fill', GREEN).attr('opacity', 0.7);
            g.append('text').attr('x', 93).attr('y', h + 12).attr('fill', GREEN).attr('font-size', 7).text('Kelvin (≈0%)');

            g.append('text').attr('x', w / 2).attr('y', h + 25).attr('fill', GREY).attr('font-size', 7).attr('text-anchor', 'middle').text('Rx = 0.1 Ω, varying lead resistance r');
        }

        // Link resistance pulse animation
        var link = document.getElementById('m3-kb-link');
        if (link && typeof gsap !== 'undefined') {
            gsap.to(link, {
                stroke: GREEN,
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        }

        // Calculator
        initCalcListener(['m3-kbc-r', 'm3-kbc-p', 'm3-kbc-q'], function () {
            var R = +document.getElementById('m3-kbc-r').value;
            var P = +document.getElementById('m3-kbc-p').value;
            var Q = +document.getElementById('m3-kbc-q').value;
            var X = R * P / Q;
            setResult('m3-kbc-result', 'X = R·P/Q = ' + X.toFixed(6) + ' Ω (' + fmtR(X) + ') | P/Q = ' + (P / Q).toFixed(4) + ' (must equal p/q) ✓');
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 3.7: RESISTANCE METHODS SUMMARY
       ══════════════════════════════════════════════════════ */
    function initMethodsSummary() {
        var rSlider = document.getElementById('m3-sum-r');
        if (!rSlider) return;
        var rVal = document.getElementById('m3-sum-r-val');

        // Range selector with recommendation
        var rangeW = 700, rangeH = 100;
        var rangeSvg = d3Container('m3-sum-range', rangeW, rangeH);

        // Accuracy bars
        var accW = 700, accH = 140;
        var accSvg = d3Container('m3-sum-accuracy', accW, accH);

        if (accSvg) {
            accSvg.append('text').attr('x', accW / 2).attr('y', 14).attr('fill', GREY).attr('font-size', 9).attr('text-anchor', 'middle').text('Method Accuracy Comparison');

            var methods = [
                { name: 'Potentiometer', acc: 0.05, lo: 0.001, hi: 1, color: GREEN },
                { name: 'Kelvin Bridge', acc: 0.1, lo: 0.001, hi: 1, color: PURPLE },
                { name: 'Wheatstone Bridge', acc: 0.1, lo: 1, hi: 1e5, color: GOLD },
                { name: 'A-V Method', acc: 2, lo: 0.1, hi: 1e7, color: CYAN },
                { name: 'Megger', acc: 5, lo: 1e6, hi: 1e9, color: RED }
            ];

            var margin = { l: 110, r: 20, t: 22, b: 10 };
            var w = accW - margin.l - margin.r;
            var barH = 16, gap = 6;
            var maxAcc = 6;

            methods.forEach(function (m, i) {
                var y = margin.t + i * (barH + gap);
                var bw = (m.acc / maxAcc) * w * 0.6;
                accSvg.append('text').attr('x', margin.l - 5).attr('y', y + 12).attr('fill', m.color).attr('font-size', 8).attr('text-anchor', 'end').text(m.name);
                accSvg.append('rect').attr('x', margin.l).attr('y', y).attr('width', bw).attr('height', barH).attr('rx', 3).attr('fill', m.color).attr('opacity', 0.5);
                accSvg.append('text').attr('x', margin.l + bw + 5).attr('y', y + 12).attr('fill', m.color).attr('font-size', 8).text('±' + m.acc + '%');
            });
        }

        function drawRange(rLog) {
            if (!rangeSvg) return;
            rangeSvg.selectAll('.rng-el').remove();

            var R = Math.pow(10, rLog);
            if (rVal) rVal.textContent = fmtR(R);

            var margin = { l: 50, r: 30 };
            var w = rangeW - margin.l - margin.r;
            var xScale = d3.scaleLog().domain([0.001, 1e9]).range([margin.l, margin.l + w]);

            var g = rangeSvg.append('g').attr('class', 'rng-el');

            // Zones
            var zones = [
                { start: 0.001, end: 1, color: BLUE, label: 'Low' },
                { start: 1, end: 100000, color: GOLD, label: 'Medium' },
                { start: 100000, end: 1e9, color: RED, label: 'High' }
            ];
            zones.forEach(function (z) {
                var x1 = xScale(z.start), x2 = xScale(z.end);
                g.append('rect').attr('x', x1).attr('y', 15).attr('width', x2 - x1).attr('height', 25).attr('fill', z.color).attr('opacity', 0.1).attr('stroke', z.color).attr('stroke-width', 1);
                g.append('text').attr('x', (x1 + x2) / 2).attr('y', 32).attr('fill', z.color).attr('font-size', 9).attr('text-anchor', 'middle').text(z.label);
            });

            // Current R marker
            var rx = xScale(Math.max(0.001, Math.min(1e9, R)));
            g.append('line').attr('x1', rx).attr('y1', 5).attr('x2', rx).attr('y2', 45).attr('stroke', '#fff').attr('stroke-width', 2);
            g.append('circle').attr('cx', rx).attr('cy', 10).attr('r', 5).attr('fill', GREEN);
            g.append('text').attr('x', rx).attr('y', 60).attr('fill', GREEN).attr('font-size', 9).attr('text-anchor', 'middle').attr('font-weight', 'bold').text(fmtR(R));

            // Best method recommendation
            var best;
            if (R < 1) best = 'Kelvin Double Bridge (±0.1%)';
            else if (R <= 100000) best = 'Wheatstone Bridge (±0.1%)';
            else if (R > 1e6) best = 'Megger / Loss of Charge';
            else best = 'Wheatstone or A-V Method';

            g.append('rect').attr('x', rangeW / 2 - 140).attr('y', 70).attr('width', 280).attr('height', 22).attr('rx', 6).attr('fill', 'rgba(0,255,136,0.1)').attr('stroke', GREEN).attr('stroke-width', 1);
            g.append('text').attr('x', rangeW / 2).attr('y', 85).attr('fill', GREEN).attr('font-size', 9).attr('text-anchor', 'middle').attr('font-weight', 'bold').text('Best: ' + best);
        }

        rSlider.addEventListener('input', function () { drawRange(+rSlider.value); });
        drawRange(+rSlider.value);

        // Loss of charge calculator
        initCalcListener(['m3-loc-v0', 'm3-loc-v', 'm3-loc-t', 'm3-loc-c'], function () {
            var V0 = +document.getElementById('m3-loc-v0').value;
            var V = +document.getElementById('m3-loc-v').value;
            var t = +document.getElementById('m3-loc-t').value;
            var C = +document.getElementById('m3-loc-c').value * 1e-6;
            if (V <= 0 || V >= V0 || C <= 0) {
                setResult('m3-loc-result', 'Invalid input — V must be between 0 and V₀');
                return;
            }
            var R = t / (C * Math.log(V0 / V));
            setResult('m3-loc-result', 'R = t / [C·ln(V₀/V)] = ' + fmtR(R) + ' (' + R.toFixed(0) + ' Ω)');
        });
    }

    /* ── BOOKMARKS ── */
    function initBookmarks() {
        var stored = {};
        try { stored = JSON.parse(localStorage.getItem('m3_bookmarks') || '{}'); } catch (e) { /* ignore */ }

        document.querySelectorAll('.m3-bookmark-btn').forEach(function (btn) {
            var card = btn.getAttribute('data-card');
            if (stored[card]) btn.classList.add('bookmarked');

            btn.addEventListener('click', function () {
                stored[card] = !stored[card];
                btn.classList.toggle('bookmarked');
                try { localStorage.setItem('m3_bookmarks', JSON.stringify(stored)); } catch (e) { /* ignore */ }
            });
        });
    }

    /* ── GSAP ENTRANCE ── */
    function initGSAPAnimations() {
        if (typeof gsap === 'undefined') return;

        gsap.utils.toArray('.m3-card').forEach(function (card) {
            gsap.from(card, {
                scrollTrigger: { trigger: card, start: 'top 85%' },
                y: 30, opacity: 0, duration: 0.8, ease: 'power2.out'
            });
        });

        gsap.utils.toArray('.m3-badge').forEach(function (badge) {
            gsap.to(badge, {
                boxShadow: '0 0 12px rgba(0,255,136,0.4)',
                duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut'
            });
        });
    }

    /* ── INIT ALL ── */
    function initModule3() {
        initHalfWave();
        initFullWave();
        initResistanceClassification();
        initAmmeterVoltmeter();
        initWheatstoneBridge();
        initKelvinBridge();
        initMethodsSummary();
        initBookmarks();
        initGSAPAnimations();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModule3);
    } else {
        initModule3();
    }
})();
