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

    /* ══════════════════════════════════════════════════════
       CARD 3.8: THEVENIN EQUIVALENT OF WHEATSTONE BRIDGE
       ══════════════════════════════════════════════════════ */
    function initTheveninBridge() {
        var pSlider = document.getElementById('m3-thev-p');
        var qSlider = document.getElementById('m3-thev-q');
        var rSlider = document.getElementById('m3-thev-r');
        var sSlider = document.getElementById('m3-thev-s');
        if (!pSlider) return;

        var pV = document.getElementById('m3-thev-p-val');
        var qV = document.getElementById('m3-thev-q-val');
        var rV = document.getElementById('m3-thev-r-val');
        var sV = document.getElementById('m3-thev-s-val');
        var vthLabel = document.getElementById('m3-thev-vth-label');
        var rthLabel = document.getElementById('m3-thev-rth-label');
        var igLabel  = document.getElementById('m3-thev-ig-label');
        var statusEl = document.getElementById('m3-thev-status');

        var Rg = 100, Vbat = 10;
        var chW = 320, chH = 210;
        var chartSvg = d3Container('m3-thev-chart', chW, chH);

        function drawChart(P, Q, R, S) {
            if (!chartSvg) return;
            chartSvg.selectAll('.th-el').remove();
            var margin = { t: 22, r: 15, b: 28, l: 45 };
            var w = chW - margin.l - margin.r, h = chH - margin.t - margin.b;
            var g = chartSvg.append('g').attr('class', 'th-el').attr('transform', 'translate(' + margin.l + ',' + margin.t + ')');

            // Vth vs S (varying S, fixed P, Q, R)
            var data = [];
            for (var s = 10; s <= 1000; s += 10) {
                var vth = Vbat * (P * s - Q * R) / ((P + Q) * (R + s));
                data.push({ s: s, vth: vth });
            }
            var xScale = d3.scaleLinear().domain([10, 1000]).range([0, w]);
            var ext = d3.extent(data, function (d) { return d.vth; });
            var maxA = Math.max(Math.abs(ext[0]), Math.abs(ext[1])) || 1;
            var yScale = d3.scaleLinear().domain([-maxA, maxA]).range([h, 0]);

            g.append('line').attr('x1', 0).attr('y1', h).attr('x2', w).attr('y2', h).attr('stroke', '#475569');
            g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', h).attr('stroke', '#475569');
            g.append('line').attr('x1', 0).attr('y1', yScale(0)).attr('x2', w).attr('y2', yScale(0)).attr('stroke', '#333');
            g.append('text').attr('x', w / 2).attr('y', h + 22).attr('fill', GREY).attr('font-size', 8).attr('text-anchor', 'middle').text('S (Ω)');
            g.append('text').attr('x', -5).attr('y', -6).attr('fill', GREY).attr('font-size', 7).text('Vth (V)');

            var lineGen = d3.line().x(function (d) { return xScale(d.s); }).y(function (d) { return yScale(d.vth); }).curve(d3.curveMonotoneX);
            g.append('path').attr('d', lineGen(data)).attr('fill', 'none').attr('stroke', PURPLE).attr('stroke-width', 2);

            // Balance point
            var sBal = Q * R / P;
            if (sBal >= 10 && sBal <= 1000) {
                g.append('circle').attr('cx', xScale(sBal)).attr('cy', yScale(0)).attr('r', 5).attr('fill', GREEN);
                g.append('text').attr('x', xScale(sBal)).attr('y', yScale(0) - 8).attr('fill', GREEN).attr('font-size', 8).attr('text-anchor', 'middle').text('Balance S=' + fmtR(sBal));
            }

            // Current S marker
            if (S >= 10 && S <= 1000) {
                var vthCur = Vbat * (P * S - Q * R) / ((P + Q) * (R + S));
                g.append('circle').attr('cx', xScale(S)).attr('cy', yScale(vthCur)).attr('r', 4).attr('fill', ORANGE);
            }
            g.append('text').attr('x', w / 2).attr('y', 12).attr('fill', GREY).attr('font-size', 9).attr('text-anchor', 'middle').text('Vth vs S (P=' + P + ', Q=' + Q + ', R=' + R + ')');
        }

        function update() {
            var P = +pSlider.value, Q = +qSlider.value, R = +rSlider.value, S = +sSlider.value;
            if (pV) pV.textContent = fmtR(P);
            if (qV) qV.textContent = fmtR(Q);
            if (rV) rV.textContent = fmtR(R);
            if (sV) sV.textContent = fmtR(S);

            var vth = Vbat * (P * S - Q * R) / ((P + Q) * (R + S));
            var rth = (P * Q) / (P + Q) + (R * S) / (R + S);
            var ig = vth / (rth + Rg);
            var isBalanced = Math.abs(vth) < 0.01;

            if (vthLabel) vthLabel.textContent = 'Vth=' + vth.toFixed(3) + 'V';
            if (rthLabel) rthLabel.textContent = 'Rth=' + rth.toFixed(1) + 'Ω';
            if (igLabel) igLabel.textContent = 'Ig = ' + (ig * 1000).toFixed(2) + ' mA';

            if (statusEl) {
                if (isBalanced) {
                    statusEl.textContent = '✓ BALANCED — Vth ≈ 0';
                    statusEl.setAttribute('fill', GREEN);
                } else {
                    statusEl.textContent = 'Unbalanced — Vth ≠ 0';
                    statusEl.setAttribute('fill', RED);
                }
            }
            drawChart(P, Q, R, S);
        }

        [pSlider, qSlider, rSlider, sSlider].forEach(function (sl) { sl.addEventListener('input', update); });
        update();

        // Calculator
        initCalcListener(['m3-thc-p', 'm3-thc-q', 'm3-thc-r', 'm3-thc-s', 'm3-thc-v', 'm3-thc-rg'], function () {
            var P = +document.getElementById('m3-thc-p').value;
            var Q = +document.getElementById('m3-thc-q').value;
            var R = +document.getElementById('m3-thc-r').value;
            var S = +document.getElementById('m3-thc-s').value;
            var V = +document.getElementById('m3-thc-v').value;
            var rg = +document.getElementById('m3-thc-rg').value;
            var vth = V * (P * S - Q * R) / ((P + Q) * (R + S));
            var rth = (P * Q) / (P + Q) + (R * S) / (R + S);
            var ig = vth / (rth + rg);
            setResult('m3-thc-result',
                'Vth = ' + vth.toFixed(4) + ' V | Rth = ' + rth.toFixed(2) + ' Ω | Ig = ' + (ig * 1e6).toFixed(1) + ' µA (' + (ig * 1000).toFixed(4) + ' mA)');
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 3.9: BRIDGE & GALVANOMETER SENSITIVITY
       ══════════════════════════════════════════════════════ */
    function initSensitivity() {
        var siSlider = document.getElementById('m3-sens-si');
        var vSlider  = document.getElementById('m3-sens-v');
        var rgSlider = document.getElementById('m3-sens-rg');
        var drSlider = document.getElementById('m3-sens-dr');
        if (!siSlider) return;

        var siVal = document.getElementById('m3-sens-si-val');
        var vVal  = document.getElementById('m3-sens-v-val');
        var rgVal = document.getElementById('m3-sens-rg-val');
        var drVal = document.getElementById('m3-sens-dr-val');
        var statusDiv = document.getElementById('m3-sens-status');

        // Triptych panel
        var trW = 700, trH = 140;
        var trSvg = d3Container('m3-sens-triptych', trW, trH);

        // SB vs arm ratio
        var sbW = 700, sbH = 140;
        var sbSvg = d3Container('m3-sens-sb-chart', sbW, sbH);

        function drawTriptych(SI, V, Rg, dR) {
            if (!trSvg) return;
            trSvg.selectAll('.tp-el').remove();

            var panelW = trW / 3 - 10;
            var panels = [
                { title: 'Current Sensitivity SI', value: SI.toFixed(1) + ' mm/µA', color: CYAN, barPct: Math.min(SI / 20 * 100, 100) },
                { title: 'Voltage Sensitivity SV', value: (SI / Rg).toFixed(4) + ' mm/V', color: GOLD, barPct: Math.min((SI / Rg) / 0.2 * 100, 100) },
                { title: 'Bridge Sensitivity SB', value: (SI * V / (4 * (Rg + Rg))).toFixed(2) + ' mm', color: GREEN, barPct: Math.min(SI * V / (4 * 2 * Rg) / 5 * 100, 100) }
            ];

            panels.forEach(function (p, i) {
                var x = i * (panelW + 10) + 5;
                var g = trSvg.append('g').attr('class', 'tp-el').attr('transform', 'translate(' + x + ',0)');
                g.append('rect').attr('x', 0).attr('y', 0).attr('width', panelW).attr('height', trH).attr('rx', 6).attr('fill', 'rgba(255,255,255,0.02)').attr('stroke', '#1e293b');
                g.append('text').attr('x', panelW / 2).attr('y', 18).attr('fill', p.color).attr('font-size', 9).attr('text-anchor', 'middle').attr('font-weight', 'bold').text(p.title);
                // Bar
                var barW = Math.max(panelW * 0.8 * p.barPct / 100, 4);
                g.append('rect').attr('x', (panelW - panelW * 0.8) / 2).attr('y', 40).attr('width', panelW * 0.8).attr('height', 22).attr('rx', 4).attr('fill', 'rgba(255,255,255,0.04)');
                g.append('rect').attr('x', (panelW - panelW * 0.8) / 2).attr('y', 40).attr('width', barW).attr('height', 22).attr('rx', 4).attr('fill', p.color).attr('opacity', 0.5);
                // Value
                g.append('text').attr('x', panelW / 2).attr('y', 90).attr('fill', p.color).attr('font-size', 14).attr('text-anchor', 'middle').attr('font-family', 'Orbitron, monospace').text(p.value);
                // θ
                var Rth = Rg; // assuming equal arms
                var Ig_val = V / (4 * (Rg + Rth));
                var theta = SI * Ig_val * 1e6; // µA
                g.append('text').attr('x', panelW / 2).attr('y', 115).attr('fill', GREY).attr('font-size', 8).attr('text-anchor', 'middle').text('θ = ' + theta.toFixed(1) + ' mm at ΔR/R=' + dR.toFixed(3));
            });
        }

        function drawSBChart(SI, V, Rg) {
            if (!sbSvg) return;
            sbSvg.selectAll('.sb-el').remove();

            var margin = { t: 22, r: 15, b: 28, l: 50 };
            var w = sbW - margin.l - margin.r, h = sbH - margin.t - margin.b;
            var g = sbSvg.append('g').attr('class', 'sb-el').attr('transform', 'translate(' + margin.l + ',' + margin.t + ')');
            g.append('text').attr('x', w / 2).attr('y', 10).attr('fill', GREY).attr('font-size', 9).attr('text-anchor', 'middle').text('SB vs P/Q Ratio (Equal-arm condition)');

            var data = [];
            for (var ratio = 0.1; ratio <= 10; ratio += 0.1) {
                // For ratio = P/Q, Rth varies. At equal arms ratio=1, Rth = R/2+R/2=R
                // SB = SI * V / (4 * (Rg + Rth))
                // Rth = P||Q + R||S → at equal arms with ratio r: Rth = R*(1+r^2)/(2*r) ? 
                // Simplified: SB peak at ratio=1
                var Rth = Rg * (1 + ratio * ratio) / (2 * ratio);
                var sb = SI * V / (4 * (Rg + Rth));
                data.push({ ratio: ratio, sb: sb });
            }

            var xScale = d3.scaleLinear().domain([0.1, 10]).range([0, w]);
            var maxSB = d3.max(data, function (d) { return d.sb; }) || 1;
            var yScale = d3.scaleLinear().domain([0, maxSB * 1.1]).range([h, 0]);

            g.append('line').attr('x1', 0).attr('y1', h).attr('x2', w).attr('y2', h).attr('stroke', '#475569');
            g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', h).attr('stroke', '#475569');
            g.append('text').attr('x', w / 2).attr('y', h + 20).attr('fill', GREY).attr('font-size', 7).attr('text-anchor', 'middle').text('P/Q Ratio');
            g.append('text').attr('x', -5).attr('y', -5).attr('fill', GREY).attr('font-size', 7).text('SB');

            var lineGen = d3.line().x(function (d) { return xScale(d.ratio); }).y(function (d) { return yScale(d.sb); }).curve(d3.curveMonotoneX);
            g.append('path').attr('d', lineGen(data)).attr('fill', 'none').attr('stroke', GREEN).attr('stroke-width', 2);

            // Max marker at ratio=1
            g.append('circle').attr('cx', xScale(1)).attr('cy', yScale(maxSB)).attr('r', 5).attr('fill', '#fb7185');
            g.append('text').attr('x', xScale(1) + 8).attr('y', yScale(maxSB) + 4).attr('fill', '#fb7185').attr('font-size', 8).text('MAX at P/Q=1');
        }

        function update() {
            var SI = +siSlider.value, V = +vSlider.value, Rg = +rgSlider.value, dR = +drSlider.value;
            if (siVal) siVal.textContent = SI;
            if (vVal) vVal.textContent = V;
            if (rgVal) rgVal.textContent = Rg;
            if (drVal) drVal.textContent = dR.toFixed(3);

            var SV = SI / Rg;
            var Rth = Rg; // equal arms assumption
            var SB = SI * V / (4 * (Rg + Rth));
            var SBmax = V * SI / 4;
            var theta = SB * dR / (1); // SB = θ/(ΔR/R), so θ = SB * ΔR/R
            // Corrected: θ = SB * (ΔR/R)
            theta = SB * dR;

            if (statusDiv) {
                var isMax = Math.abs(SB - SBmax) < 0.01;
                statusDiv.textContent = 'SV=' + SV.toFixed(4) + ' mm/V | SB=' + SB.toFixed(2) + ' mm | SBmax=' + SBmax.toFixed(2) + ' mm | θ=' + theta.toFixed(3) + ' mm' + (isMax ? ' | MAXIMUM SENSITIVITY ✓' : '');
                statusDiv.style.color = isMax ? '#fb7185' : GREEN;
            }

            drawTriptych(SI, V, Rg, dR);
            drawSBChart(SI, V, Rg);
        }

        [siSlider, vSlider, rgSlider, drSlider].forEach(function (sl) { sl.addEventListener('input', update); });
        update();

        // Calculator
        initCalcListener(['m3-sc-si', 'm3-sc-v', 'm3-sc-rg', 'm3-sc-rth'], function () {
            var si = +document.getElementById('m3-sc-si').value;
            var v = +document.getElementById('m3-sc-v').value;
            var rg = +document.getElementById('m3-sc-rg').value;
            var rth = +document.getElementById('m3-sc-rth').value;
            var sv = si / rg;
            var sb = si * v / (4 * (rg + rth));
            var sbmax = v * si / 4;
            setResult('m3-sc-result',
                'SV = SI/Rg = ' + sv.toFixed(4) + ' mm/V | SB = ' + sb.toFixed(3) + ' mm | SBmax = VSI/4 = ' + sbmax.toFixed(2) + ' mm');
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 3.10: KELVIN DOUBLE BRIDGE COMPLETE
       ══════════════════════════════════════════════════════ */
    function initKelvinComplete() {
        var rSlider  = document.getElementById('m3-kb2-r-slider');
        var pqSlider = document.getElementById('m3-kb2-pq');
        var ppqSlider = document.getElementById('m3-kb2-ppq');
        if (!rSlider) return;

        var rVal  = document.getElementById('m3-kb2-r-val');
        var pqVal = document.getElementById('m3-kb2-pq-val');
        var ppqVal = document.getElementById('m3-kb2-ppq-val');
        var statusEl = document.getElementById('m3-kb2-status');
        var linkEl = document.getElementById('m3-kb2-link');

        // Accuracy comparison bars
        var accW = 700, accH = 100;
        var accSvg = d3Container('m3-kb2-accuracy', accW, accH);

        if (accSvg) {
            accSvg.append('text').attr('x', accW / 2).attr('y', 14).attr('fill', GREY).attr('font-size', 9).attr('text-anchor', 'middle').text('Low-R Measurement Accuracy');
            var methods = [
                { name: 'A-V Method', acc: 5, color: RED },
                { name: 'Wheatstone', acc: 0.1, color: GOLD },
                { name: 'Kelvin Bridge', acc: 0.5, color: PURPLE },
                { name: 'Potentiometer', acc: 0.05, color: GREEN }
            ];
            var margin = { l: 100, t: 22 };
            var barH = 14, gap = 4;
            methods.forEach(function (m, i) {
                var y = margin.t + i * (barH + gap);
                var bw = Math.max((m.acc / 6) * (accW - margin.l - 40), 5);
                accSvg.append('text').attr('x', margin.l - 5).attr('y', y + 11).attr('fill', m.color).attr('font-size', 8).attr('text-anchor', 'end').text(m.name);
                accSvg.append('rect').attr('x', margin.l).attr('y', y).attr('width', bw).attr('height', barH).attr('rx', 3).attr('fill', m.color).attr('opacity', 0.5);
                accSvg.append('text').attr('x', margin.l + bw + 5).attr('y', y + 11).attr('fill', m.color).attr('font-size', 7).text('±' + m.acc + '%');
            });
        }

        function update() {
            var r = +rSlider.value, pq = +pqSlider.value, ppq = +ppqSlider.value;
            if (rVal) rVal.textContent = r.toFixed(2);
            if (pqVal) pqVal.textContent = pq.toFixed(2);
            if (ppqVal) ppqVal.textContent = ppq.toFixed(2);

            var matched = Math.abs(pq - ppq) < 0.06;
            if (statusEl) {
                if (matched) {
                    statusEl.textContent = 'P/Q ≈ p/q → link r eliminated ✓';
                    statusEl.setAttribute('fill', GREEN);
                } else {
                    statusEl.textContent = 'P/Q ≠ p/q → error from r = ' + (r * Math.abs(pq - ppq)).toFixed(4) + ' Ω';
                    statusEl.setAttribute('fill', RED);
                }
            }
            if (linkEl) {
                linkEl.setAttribute('stroke', matched ? '#333' : ORANGE);
                linkEl.setAttribute('stroke-width', matched ? '1' : '2.5');
            }
        }

        [rSlider, pqSlider, ppqSlider].forEach(function (sl) { sl.addEventListener('input', update); });
        update();

        // Kelvin complete calculator
        initCalcListener(['m3-kb2c-r', 'm3-kb2c-p', 'm3-kb2c-q', 'm3-kb2c-pp', 'm3-kb2c-qq', 'm3-kb2c-rr'], function () {
            var R = +document.getElementById('m3-kb2c-r').value;
            var P = +document.getElementById('m3-kb2c-p').value;
            var Q = +document.getElementById('m3-kb2c-q').value;
            var p = +document.getElementById('m3-kb2c-pp').value;
            var q = +document.getElementById('m3-kb2c-qq').value;
            var r = +document.getElementById('m3-kb2c-rr').value;
            var correction = (r * p * q / (p + q + r)) * (P / Q - p / q);
            var Rx = R * P / Q + correction;
            var matched = Math.abs(P / Q - p / q) < 0.001;
            setResult('m3-kb2c-result',
                'Rx = ' + Rx.toFixed(6) + ' Ω (' + fmtR(Rx) + ') | P/Q=' + (P / Q).toFixed(4) + ', p/q=' + (p / q).toFixed(4) +
                (matched ? ' <b style="color:' + GREEN + '">✓ Matched</b>' : ' <b style="color:' + RED + '">✗ Mismatch → error=' + correction.toFixed(6) + 'Ω</b>'));
        });

        // Potentiometer calculator
        initCalcListener(['m3-potc-rs', 'm3-potc-lx', 'm3-potc-ls'], function () {
            var Rs = +document.getElementById('m3-potc-rs').value;
            var lx = +document.getElementById('m3-potc-lx').value;
            var ls = +document.getElementById('m3-potc-ls').value;
            var Rx = Rs * lx / ls;
            setResult('m3-potc-result', 'Rx = Rs·(ℓx/ℓs) = ' + Rx.toFixed(6) + ' Ω (' + fmtR(Rx) + ') | ℓx/ℓs = ' + (lx / ls).toFixed(4));
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 3.11: MEDIUM RESISTANCE MEASUREMENT
       ══════════════════════════════════════════════════════ */
    function initMediumResistance() {
        var pSlider = document.getElementById('m3-med-p');
        var qSlider = document.getElementById('m3-med-q');
        var rSlider = document.getElementById('m3-med-r');
        if (!pSlider) return;

        var pVal = document.getElementById('m3-med-p-val');
        var qVal = document.getElementById('m3-med-q-val');
        var rVal = document.getElementById('m3-med-r-val');
        var needle = document.getElementById('m3-med-needle');
        var sLabel = document.getElementById('m3-med-s-label');
        var badge  = document.getElementById('m3-med-badge');

        // Balance procedure steps chart
        var stW = 320, stH = 240;
        var stSvg = d3Container('m3-med-steps', stW, stH);

        if (stSvg) {
            stSvg.append('text').attr('x', stW / 2).attr('y', 16).attr('fill', GREY).attr('font-size', 10).attr('text-anchor', 'middle').text('Balance Procedure');

            var steps = [
                { n: '1', text: 'Set ratio P/Q', sub: 'Known ratio arms', color: GOLD },
                { n: '2', text: 'Adjust R until Ig = 0', sub: 'Variable known resistance', color: CYAN },
                { n: '3', text: 'Read S = QR/P', sub: 'Unknown resistance found!', color: GREEN }
            ];
            steps.forEach(function (s, i) {
                var y = 35 + i * 65;
                stSvg.append('circle').attr('cx', 25).attr('cy', y + 12).attr('r', 12).attr('fill', 'rgba(0,255,136,0.1)').attr('stroke', s.color).attr('stroke-width', 1.5);
                stSvg.append('text').attr('x', 25).attr('y', y + 16).attr('fill', s.color).attr('font-size', 11).attr('text-anchor', 'middle').attr('font-weight', 'bold').text(s.n);
                stSvg.append('text').attr('x', 48).attr('y', y + 10).attr('fill', '#fff').attr('font-size', 10).text(s.text);
                stSvg.append('text').attr('x', 48).attr('y', y + 24).attr('fill', GREY).attr('font-size', 8).text(s.sub);
                if (i < 2) {
                    stSvg.append('line').attr('x1', 25).attr('y1', y + 26).attr('x2', 25).attr('y2', y + 55).attr('stroke', '#333').attr('stroke-width', 1).attr('stroke-dasharray', '3 2');
                }
            });
        }

        function update() {
            var P = +pSlider.value, Q = +qSlider.value, R = +rSlider.value;
            if (pVal) pVal.textContent = fmtR(P);
            if (qVal) qVal.textContent = fmtR(Q);
            if (rVal) rVal.textContent = fmtR(R);

            var S = Q * R / P;
            if (sLabel) sLabel.textContent = 'S=' + fmtR(S);
            if (badge) badge.textContent = 'PS=' + (P * S).toFixed(0) + ' = QR=' + (Q * R).toFixed(0) + ' ✓';

            // Needle always at center (balanced condition shown)
            if (needle) {
                needle.setAttribute('x2', '150');
                needle.setAttribute('y2', '103');
                needle.setAttribute('stroke', GREEN);
            }
        }

        [pSlider, qSlider, rSlider].forEach(function (sl) { sl.addEventListener('input', update); });
        update();

        // Calculator
        initCalcListener(['m3-medc-p', 'm3-medc-q', 'm3-medc-r'], function () {
            var p = +document.getElementById('m3-medc-p').value;
            var q = +document.getElementById('m3-medc-q').value;
            var r = +document.getElementById('m3-medc-r').value;
            var s = q * r / p;
            setResult('m3-medc-result', 'S = QR/P = ' + s.toFixed(3) + ' Ω (' + fmtR(s) + ') | P/Q = ' + (p / q).toFixed(4) + ' | PS = QR = ' + (q * r).toFixed(1) + ' ✓');
        });
    }

    /* ══════════════════════════════════════════════════════
       CARD 3.12: OHMMETER — SERIES & SHUNT TYPES
       ══════════════════════════════════════════════════════ */
    function initOhmmeter() {
        var rxSlider  = document.getElementById('m3-ohm-rx');
        var r1Slider  = document.getElementById('m3-ohm-r1');
        var vbatSlider = document.getElementById('m3-ohm-vbat');
        if (!rxSlider) return;

        var rxVal  = document.getElementById('m3-ohm-rx-val');
        var r1Val  = document.getElementById('m3-ohm-r1-val');
        var vbatVal = document.getElementById('m3-ohm-vbat-val');
        var needleEl = document.getElementById('m3-ohm-needle');
        var titleEl  = document.getElementById('m3-ohm-title');
        var currentEl = document.getElementById('m3-ohm-current');
        var readingEl = document.getElementById('m3-ohm-reading');

        var mode = 'series';

        // I vs Rx D3 curve
        var curveW = 320, curveH = 190;
        var curveSvg = d3Container('m3-ohm-curve', curveW, curveH);

        function drawCurve(R1, Vbat, Rm) {
            if (!curveSvg) return;
            curveSvg.selectAll('.oc-el').remove();

            var margin = { t: 22, r: 15, b: 28, l: 42 };
            var w = curveW - margin.l - margin.r, h = curveH - margin.t - margin.b;
            var g = curveSvg.append('g').attr('class', 'oc-el').attr('transform', 'translate(' + margin.l + ',' + margin.t + ')');

            var Ifsd = Vbat / R1;
            var data = [];
            for (var rx = 0; rx <= 2000; rx += 10) {
                var I;
                if (mode === 'series') {
                    I = Vbat / (R1 + rx);
                } else {
                    I = (Vbat * rx) / (R1 * (Rm + rx) + Rm * rx);
                }
                data.push({ rx: rx, i: I, pct: (I / Ifsd) * 100 });
            }

            var xScale = d3.scaleLinear().domain([0, 2000]).range([0, w]);
            var yScale = d3.scaleLinear().domain([0, 120]).range([h, 0]);

            g.append('line').attr('x1', 0).attr('y1', h).attr('x2', w).attr('y2', h).attr('stroke', '#475569');
            g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', h).attr('stroke', '#475569');
            g.append('text').attr('x', w / 2).attr('y', h + 22).attr('fill', GREY).attr('font-size', 8).attr('text-anchor', 'middle').text('Rx (Ω)');
            g.append('text').attr('x', -5).attr('y', -5).attr('fill', GREY).attr('font-size', 7).text('I/Ifsd %');

            var lineGen = d3.line().x(function (d) { return xScale(d.rx); }).y(function (d) { return yScale(d.pct); }).curve(d3.curveMonotoneX);
            g.append('path').attr('d', lineGen(data)).attr('fill', 'none').attr('stroke', mode === 'series' ? CYAN : ORANGE).attr('stroke-width', 2);

            // Mid-scale marker
            if (mode === 'series') {
                g.append('circle').attr('cx', xScale(R1)).attr('cy', yScale(50)).attr('r', 5).attr('fill', GOLD);
                g.append('text').attr('x', xScale(R1) + 8).attr('y', yScale(50) + 4).attr('fill', GOLD).attr('font-size', 8).text('Mid: Rx=R1=' + fmtR(R1));
            }

            // FSD and zero lines
            g.append('line').attr('x1', 0).attr('y1', yScale(100)).attr('x2', w).attr('y2', yScale(100)).attr('stroke', GREEN).attr('stroke-width', 1).attr('stroke-dasharray', '3 2');
            g.append('text').attr('x', w + 3).attr('y', yScale(100) + 3).attr('fill', GREEN).attr('font-size', 6).text('FSD');
            g.append('line').attr('x1', 0).attr('y1', yScale(50)).attr('x2', w).attr('y2', yScale(50)).attr('stroke', GOLD).attr('stroke-width', 1).attr('stroke-dasharray', '2 3');

            // Current Rx marker
            var rxCur = +rxSlider.value;
            if (rxCur <= 2000) {
                var ICur;
                if (mode === 'series') ICur = (Vbat / (R1 + rxCur)) / Ifsd * 100;
                else ICur = ((Vbat * rxCur) / (R1 * (Rm + rxCur) + Rm * rxCur)) / Ifsd * 100;
                g.append('circle').attr('cx', xScale(rxCur)).attr('cy', yScale(ICur)).attr('r', 4).attr('fill', '#fff');
            }

            g.append('text').attr('x', w / 2).attr('y', 10).attr('fill', GREY).attr('font-size', 9).attr('text-anchor', 'middle').text((mode === 'series' ? 'Series' : 'Shunt') + ': I vs Rx (Non-linear)');
        }

        function update() {
            var Rx = +rxSlider.value, R1 = +r1Slider.value, Vbat = +vbatSlider.value;
            if (rxVal) rxVal.textContent = fmtR(Rx);
            if (r1Val) r1Val.textContent = fmtR(R1);
            if (vbatVal) vbatVal.textContent = Vbat + 'V';

            var Ifsd = Vbat / R1;
            var Rm = 50;
            var I, pct;
            if (mode === 'series') {
                I = Vbat / (R1 + Rx);
                pct = (I / Ifsd) * 100;
            } else {
                I = (Vbat * Rx) / (R1 * (Rm + Rx) + Rm * Rx);
                pct = (I / Ifsd) * 100;
            }

            // Needle movement: series has 0Ω on right (full deflection)
            if (needleEl) {
                var angle;
                if (mode === 'series') {
                    angle = -40 + (pct / 100) * 80; // -40° (left = ∞) to +40° (right = 0Ω)
                } else {
                    angle = -40 + (pct / 100) * 80;
                }
                var rad = angle * Math.PI / 180;
                var nx = 170 + 22 * Math.sin(rad);
                var ny = 86 - 22 * Math.cos(rad);
                needleEl.setAttribute('x2', String(nx));
                needleEl.setAttribute('y2', String(ny));
            }

            if (titleEl) titleEl.textContent = mode === 'series' ? 'Series Ohmmeter' : 'Shunt Ohmmeter';
            if (currentEl) currentEl.textContent = mode === 'series' ? 'I = V/(R₁+Rx) = ' + (I * 1000).toFixed(2) + ' mA' : 'Im = V·Rx/(R₁(Rm+Rx)+RmRx) = ' + (I * 1000).toFixed(2) + ' mA';
            if (readingEl) readingEl.textContent = 'Deflection: ' + pct.toFixed(1) + '% of FSD | ' + (mode === 'series' ? (Rx === 0 ? '→ 0Ω (right)' : Rx >= 2000 ? '→ ∞ (left)' : 'Mid at Rx=R1') : (Rx === 0 ? '→ 0Ω (left)' : '→ ∞ (right)'));

            drawCurve(R1, Vbat, Rm);
        }

        window.m3OhmToggle = function (m) {
            mode = m;
            update();
        };

        [rxSlider, r1Slider, vbatSlider].forEach(function (sl) { sl.addEventListener('input', update); });
        update();

        // Series calculator
        initCalcListener(['m3-osc-v', 'm3-osc-r1', 'm3-osc-rx'], function () {
            var V = +document.getElementById('m3-osc-v').value;
            var R1 = +document.getElementById('m3-osc-r1').value;
            var Rx = +document.getElementById('m3-osc-rx').value;
            var I = V / (R1 + Rx);
            var Ifsd = V / R1;
            var pct = (I / Ifsd) * 100;
            setResult('m3-osc-result', 'I = ' + (I * 1000).toFixed(3) + ' mA | θ = ' + pct.toFixed(1) + '%FSD | Mid-scale R = R₁ = ' + fmtR(R1));
        });

        // Shunt calculator
        initCalcListener(['m3-oshc-v', 'm3-oshc-r1', 'm3-oshc-rm', 'm3-oshc-rx'], function () {
            var V = +document.getElementById('m3-oshc-v').value;
            var R1 = +document.getElementById('m3-oshc-r1').value;
            var Rm = +document.getElementById('m3-oshc-rm').value;
            var Rx = +document.getElementById('m3-oshc-rx').value;
            var Im = (V * Rx) / (R1 * (Rm + Rx) + Rm * Rx);
            var Ifsd = V / R1;
            var pct = (Im / Ifsd) * 100;
            setResult('m3-oshc-result', 'Im = ' + (Im * 1000).toFixed(3) + ' mA | θ = ' + pct.toFixed(1) + '%FSD | Shunt: low R best');
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
        initTheveninBridge();
        initSensitivity();
        initKelvinComplete();
        initMediumResistance();
        initOhmmeter();
        initBookmarks();
        initGSAPAnimations();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModule3);
    } else {
        initModule3();
    }
})();
