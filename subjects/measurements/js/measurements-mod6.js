/* =====================================================================
   MODULE 6 — FREQUENCY MEASUREMENT & INSTRUMENT TRANSFORMERS
   IIFE · D3 v7 · GSAP 3 · KaTeX · #60a5fa Blue Accent
   ===================================================================== */
(function () {
    'use strict';

    /* ── colour constants ── */
    var BLUE   = '#60a5fa';
    var CYAN   = '#00f5ff';
    var GOLD   = '#facc15';
    var ORANGE = '#f97316';
    var GREEN  = '#00ff88';
    var RED    = '#ef4444';
    var PURPLE = '#a78bfa';
    var ROSE   = '#fb7185';
    var MUTED  = '#94a3b8';

    /* ── helpers ── */
    function el(id) { return document.getElementById(id); }

    function fmtFreq(f) {
        if (f >= 1e6) return (f / 1e6).toFixed(2) + ' MHz';
        if (f >= 1e3) return (f / 1e3).toFixed(2) + ' kHz';
        return f.toFixed(2) + ' Hz';
    }

    function initCalcListener(ids, fn) {
        ids.forEach(function (id) {
            var e = el(id);
            if (e) e.addEventListener('input', fn);
        });
        fn();
    }

    /* bookmark system */
    function initBookmarks() {
        document.querySelectorAll('.m6-bookmark-btn').forEach(function (btn) {
            var key = 'bm_' + btn.dataset.card;
            if (localStorage.getItem(key) === '1') btn.textContent = '★ Saved';
            btn.addEventListener('click', function () {
                var saved = localStorage.getItem(key) === '1';
                localStorage.setItem(key, saved ? '0' : '1');
                btn.textContent = saved ? '🔖 Bookmark' : '★ Saved';
            });
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       CARD 6.1 — WIEN'S BRIDGE FREQUENCY MEASUREMENT
       ═══════════════════════════════════════════════════════════════ */
    function initCard61() {
        var chartEl = el('m6-wien-chart');
        if (!chartEl || typeof d3 === 'undefined') return;
        chartEl.innerHTML = '';

        var w = chartEl.clientWidth || 320, h = 190;
        var m = { t: 25, r: 15, b: 35, l: 50 };
        var iw = w - m.l - m.r, ih = h - m.t - m.b;

        var svg = d3.select('#m6-wien-chart').append('svg')
            .attr('width', w).attr('height', h);
        var g = svg.append('g').attr('transform', 'translate(' + m.l + ',' + m.t + ')');

        var xScale = d3.scaleLog().domain([100, 1e6]).range([0, iw]);
        var yScale = d3.scaleLog().domain([0.1, 1000]).range([ih, 0]);

        g.append('g').attr('transform', 'translate(0,' + ih + ')')
            .call(d3.axisBottom(xScale).ticks(4, '.0s'))
            .selectAll('text').style('fill', MUTED).style('font-size', '8px');

        g.append('g')
            .call(d3.axisLeft(yScale).ticks(4, '.1s'))
            .selectAll('text').style('fill', MUTED).style('font-size', '8px');

        svg.append('text').attr('x', w / 2).attr('y', h - 3)
            .attr('fill', MUTED).attr('font-size', '9').attr('text-anchor', 'middle').text('Frequency (Hz)');
        svg.append('text').attr('transform', 'rotate(-90)')
            .attr('x', -h / 2).attr('y', 12).attr('fill', MUTED).attr('font-size', '9').attr('text-anchor', 'middle').text('R (kΩ)');

        var line = d3.line().x(function (d) { return xScale(d.f); }).y(function (d) { return yScale(d.r); });
        var path = g.append('path').attr('fill', 'none').attr('stroke', BLUE).attr('stroke-width', 2);
        var dot = g.append('circle').attr('r', 5).attr('fill', BLUE).attr('stroke', '#fff').attr('stroke-width', 1.5);

        function update() {
            var R = parseFloat(el('m6-wien-r').value);  // kΩ
            var C = parseFloat(el('m6-wien-c').value);  // nF
            el('m6-wien-r-val').textContent = R;
            el('m6-wien-c-val').textContent = C;

            var Rohm = R * 1e3;
            var Cfarad = C * 1e-9;
            var freq = 1 / (2 * Math.PI * Rohm * Cfarad);

            el('m6-wien-freq').textContent = 'f = ' + fmtFreq(freq);

            // Generate curve: vary R from 0.1kΩ to 1000kΩ at fixed C
            var data = [];
            for (var rv = 0.1; rv <= 1000; rv *= 1.15) {
                var fv = 1 / (2 * Math.PI * rv * 1e3 * Cfarad);
                if (fv >= 100 && fv <= 1e6 && rv >= 0.1 && rv <= 1000) {
                    data.push({ f: fv, r: rv });
                }
            }
            path.attr('d', line(data));

            // Position dot at current R
            if (freq >= 100 && freq <= 1e6) {
                dot.attr('cx', xScale(freq)).attr('cy', yScale(R)).attr('opacity', 1);
            } else {
                dot.attr('opacity', 0);
            }
        }

        el('m6-wien-r').addEventListener('input', update);
        el('m6-wien-c').addEventListener('input', update);
        update();

        // Calculator
        initCalcListener(['m6-wienc-r', 'm6-wienc-c'], function () {
            var R = parseFloat(el('m6-wienc-r').value) * 1e3;
            var C = parseFloat(el('m6-wienc-c').value) * 1e-9;
            if (R > 0 && C > 0) {
                var f = 1 / (2 * Math.PI * R * C);
                el('m6-wienc-result').textContent = 'f = ' + fmtFreq(f);
            }
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       CARD 6.2 — INSTRUMENT TRANSFORMER OVERVIEW
       ═══════════════════════════════════════════════════════════════ */
    function initCard62() {
        var chartEl = el('m6-ct-pt-chart');
        if (!chartEl || typeof d3 === 'undefined') return;
        chartEl.innerHTML = '';

        var w = chartEl.clientWidth || 280, h = 200;
        var m = { t: 30, r: 15, b: 40, l: 40 };
        var iw = w - m.l - m.r, ih = h - m.t - m.b;

        var svg = d3.select('#m6-ct-pt-chart').append('svg')
            .attr('width', w).attr('height', h);
        var g = svg.append('g').attr('transform', 'translate(' + m.l + ',' + m.t + ')');

        var categories = ['Accuracy', 'Isolation', 'Cost', 'Burden', 'Safety'];
        var ctData  = [85, 95, 60, 30, 40];
        var ptData  = [80, 95, 70, 75, 70];

        var xScale = d3.scaleBand().domain(categories).range([0, iw]).padding(0.3);
        var yScale = d3.scaleLinear().domain([0, 100]).range([ih, 0]);

        g.append('g').attr('transform', 'translate(0,' + ih + ')')
            .call(d3.axisBottom(xScale))
            .selectAll('text').style('fill', MUTED).style('font-size', '7px').attr('transform', 'rotate(-20)');

        g.append('g').call(d3.axisLeft(yScale).ticks(5))
            .selectAll('text').style('fill', MUTED).style('font-size', '8px');

        var bw = xScale.bandwidth() / 2;

        // CT bars
        g.selectAll('.ct-bar').data(ctData).enter().append('rect')
            .attr('x', function (d, i) { return xScale(categories[i]); })
            .attr('y', function (d) { return yScale(d); })
            .attr('width', bw)
            .attr('height', function (d) { return ih - yScale(d); })
            .attr('fill', BLUE).attr('rx', 2).attr('opacity', 0.8);

        // PT bars
        g.selectAll('.pt-bar').data(ptData).enter().append('rect')
            .attr('x', function (d, i) { return xScale(categories[i]) + bw; })
            .attr('y', function (d) { return yScale(d); })
            .attr('width', bw)
            .attr('height', function (d) { return ih - yScale(d); })
            .attr('fill', GOLD).attr('rx', 2).attr('opacity', 0.8);

        // Legend
        svg.append('rect').attr('x', w - 80).attr('y', 5).attr('width', 10).attr('height', 10).attr('fill', BLUE);
        svg.append('text').attr('x', w - 66).attr('y', 14).attr('fill', BLUE).attr('font-size', '9').text('CT');
        svg.append('rect').attr('x', w - 80).attr('y', 20).attr('width', 10).attr('height', 10).attr('fill', GOLD);
        svg.append('text').attr('x', w - 66).attr('y', 29).attr('fill', GOLD).attr('font-size', '9').text('PT');

        svg.append('text').attr('x', w / 2).attr('y', 15)
            .attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '10').text('CT vs PT Comparison');
    }

    /* ═══════════════════════════════════════════════════════════════
       CARD 6.3 — TRANSFORMER RATIOS (RCF)
       ═══════════════════════════════════════════════════════════════ */
    function initCard63() {
        var gaugeEl = el('m6-rcf-gauge');
        var chartEl = el('m6-rcf-chart');

        // RCF Gauge (D3 arc)
        if (gaugeEl && typeof d3 !== 'undefined') {
            gaugeEl.innerHTML = '';
            var gw = 200, gh = 200;
            var svg = d3.select('#m6-rcf-gauge').append('svg')
                .attr('width', gw).attr('height', gh);
            var gg = svg.append('g').attr('transform', 'translate(100,110)');

            var arc = d3.arc().innerRadius(55).outerRadius(75).startAngle(-Math.PI * 0.75);
            // Background arc
            gg.append('path')
                .attr('d', arc.endAngle(Math.PI * 0.75)())
                .attr('fill', 'rgba(96,165,250,0.1)');

            var fillArc = gg.append('path').attr('fill', BLUE);
            var rcfText = svg.append('text').attr('x', 100).attr('y', 105)
                .attr('text-anchor', 'middle').attr('fill', BLUE)
                .attr('font-size', '18').attr('font-family', 'Orbitron, sans-serif');
            var rcfLabel = svg.append('text').attr('x', 100).attr('y', 125)
                .attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '10').text('RCF');

            function updateGauge() {
                var R = parseFloat(el('m6-ratio-r').value);
                var Kn = parseFloat(el('m6-ratio-kn').value);
                el('m6-ratio-r-val').textContent = R.toFixed(1);
                el('m6-ratio-kn-val').textContent = Kn;

                var rcf = R / Kn;
                // Map rcf 0.9–1.1 to arc range
                var t = Math.max(0, Math.min(1, (rcf - 0.9) / 0.2));
                var endAngle = -Math.PI * 0.75 + t * Math.PI * 1.5;
                fillArc.attr('d', arc.endAngle(endAngle)());
                rcfText.text(rcf.toFixed(4));

                // Color based on deviation
                var dev = Math.abs(rcf - 1);
                var c = dev < 0.002 ? GREEN : dev < 0.005 ? GOLD : dev < 0.01 ? ORANGE : RED;
                fillArc.attr('fill', c);
                rcfText.attr('fill', c);
            }

            el('m6-ratio-r').addEventListener('input', updateGauge);
            el('m6-ratio-kn').addEventListener('input', updateGauge);
            updateGauge();
        }

        // RCF vs Burden chart
        if (chartEl && typeof d3 !== 'undefined') {
            chartEl.innerHTML = '';
            var w = chartEl.clientWidth || 320, h = 200;
            var m = { t: 25, r: 15, b: 35, l: 50 };
            var iw = w - m.l - m.r, ih = h - m.t - m.b;

            var svg2 = d3.select('#m6-rcf-chart').append('svg')
                .attr('width', w).attr('height', h);
            var g2 = svg2.append('g').attr('transform', 'translate(' + m.l + ',' + m.t + ')');

            var burdens = d3.range(5, 205, 5);
            var data = burdens.map(function (b) { return { burden: b, rcf: 1 + 0.0003 * b + 0.000001 * b * b }; });

            var xScale = d3.scaleLinear().domain([0, 200]).range([0, iw]);
            var yScale = d3.scaleLinear().domain([1.0, 1.06]).range([ih, 0]);

            g2.append('g').attr('transform', 'translate(0,' + ih + ')')
                .call(d3.axisBottom(xScale).ticks(5))
                .selectAll('text').style('fill', MUTED).style('font-size', '8px');

            g2.append('g').call(d3.axisLeft(yScale).ticks(5, '.3f'))
                .selectAll('text').style('fill', MUTED).style('font-size', '8px');

            var line = d3.line().x(function (d) { return xScale(d.burden); }).y(function (d) { return yScale(d.rcf); });
            g2.append('path').attr('d', line(data)).attr('fill', 'none').attr('stroke', BLUE).attr('stroke-width', 2);

            // Ideal line at RCF = 1
            g2.append('line').attr('x1', 0).attr('x2', iw).attr('y1', yScale(1)).attr('y2', yScale(1))
                .attr('stroke', GREEN).attr('stroke-width', 1).attr('stroke-dasharray', '4 3');

            svg2.append('text').attr('x', w / 2).attr('y', h - 3)
                .attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '9').text('Burden (VA)');
            svg2.append('text').attr('x', w / 2).attr('y', 15)
                .attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '10').text('RCF vs Burden');
        }

        // Calculator
        initCalcListener(['m6-ratioc-r', 'm6-ratioc-kn', 'm6-ratioc-is'], function () {
            var R = parseFloat(el('m6-ratioc-r').value);
            var Kn = parseFloat(el('m6-ratioc-kn').value);
            var Is = parseFloat(el('m6-ratioc-is').value);
            if (Kn > 0) {
                var rcf = R / Kn;
                var Ip = rcf * Kn * Is;
                el('m6-ratioc-result').textContent = 'RCF = ' + rcf.toFixed(4) + ' | Ip = ' + Ip.toFixed(2) + ' A';
            }
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       CARD 6.4 — CT COMPLETE ANALYSIS (Phasor + Error chart)
       ═══════════════════════════════════════════════════════════════ */
    function initCard64() {
        var chartEl = el('m6-ct-error-chart');
        var phasorSvg = el('m6-ct-phasor');

        // Error vs current chart
        if (chartEl && typeof d3 !== 'undefined') {
            chartEl.innerHTML = '';
            var w = chartEl.clientWidth || 300, h = 200;
            var m = { t: 25, r: 15, b: 35, l: 50 };
            var iw = w - m.l - m.r, ih = h - m.t - m.b;

            var svg = d3.select('#m6-ct-error-chart').append('svg')
                .attr('width', w).attr('height', h);
            var g = svg.append('g').attr('transform', 'translate(' + m.l + ',' + m.t + ')');

            var xScale = d3.scaleLinear().domain([0, 150]).range([0, iw]);
            var yScale = d3.scaleLinear().domain([-5, 5]).range([ih, 0]);

            g.append('g').attr('transform', 'translate(0,' + ih + ')')
                .call(d3.axisBottom(xScale).ticks(5))
                .selectAll('text').style('fill', MUTED).style('font-size', '8px');

            g.append('g').call(d3.axisLeft(yScale).ticks(5))
                .selectAll('text').style('fill', MUTED).style('font-size', '8px');

            // Zero line
            g.append('line').attr('x1', 0).attr('x2', iw).attr('y1', yScale(0)).attr('y2', yScale(0))
                .attr('stroke', GREEN).attr('stroke-width', 1).attr('stroke-dasharray', '4 3');

            var errorLine = g.append('path').attr('fill', 'none').attr('stroke', RED).attr('stroke-width', 2);
            var phaseLine = g.append('path').attr('fill', 'none').attr('stroke', CYAN).attr('stroke-width', 1.5).attr('stroke-dasharray', '4 2');

            var line = d3.line().x(function (d) { return xScale(d.pct); }).y(function (d) { return yScale(d.ratioErr); });
            var line2 = d3.line().x(function (d) { return xScale(d.pct); }).y(function (d) { return yScale(d.phaseErr); });

            svg.append('text').attr('x', w / 2).attr('y', h - 3)
                .attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '9').text('% Rated Current');
            svg.append('text').attr('x', w / 2).attr('y', 15)
                .attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '10').text('CT Error vs Load');

            function updateChart() {
                var Im = parseFloat(el('m6-ct-im').value);
                var Ic = parseFloat(el('m6-ct-ic').value);
                var delta = parseFloat(el('m6-ct-delta').value) * Math.PI / 180;

                el('m6-ct-im-val').textContent = Im.toFixed(2);
                el('m6-ct-ic-val').textContent = Ic.toFixed(2);
                el('m6-ct-delta-val').textContent = Math.round(delta * 180 / Math.PI);

                var n = 100; // turns ratio
                var data = [];
                for (var pct = 10; pct <= 150; pct += 5) {
                    var Is = 5 * pct / 100;
                    var R_actual = n + (Ic * Math.cos(delta) + Im * Math.sin(delta)) / Is;
                    var Kn = n;
                    var Ip = R_actual * Is;
                    var ratioErr = ((Kn * Is - Ip) / Ip) * 100;
                    var phaseErr = (180 / Math.PI) * (Im * Math.cos(delta) - Ic * Math.sin(delta)) / (n * Is);
                    data.push({ pct: pct, ratioErr: ratioErr, phaseErr: phaseErr * 10 }); // scale phase for visibility
                }

                errorLine.attr('d', line(data));
                phaseLine.attr('d', line2(data));
            }

            el('m6-ct-im').addEventListener('input', updateChart);
            el('m6-ct-ic').addEventListener('input', updateChart);
            el('m6-ct-delta').addEventListener('input', updateChart);
            updateChart();
        }

        // Phasor diagram update
        if (phasorSvg) {
            function updatePhasor() {
                var Im = parseFloat(el('m6-ct-im').value);
                var Ic = parseFloat(el('m6-ct-ic').value);
                var delta = parseFloat(el('m6-ct-delta').value) * Math.PI / 180;
                var n = 100;
                var Is = 5;
                var cx = 120, cy = 120, scale = 80;

                // Ip along positive x
                var IpLen = scale;
                el('m6-ct-Ip').setAttribute('x2', cx + IpLen);

                // nIs (slightly deviated by ratio error)
                var R_actual = n + (Ic * Math.cos(delta) + Im * Math.sin(delta)) / Is;
                var nIsLen = scale * n / R_actual;
                var theta = Math.atan2(Im * Math.cos(delta) - Ic * Math.sin(delta), n * Is) ;
                el('m6-ct-nIs').setAttribute('x2', cx + nIsLen * Math.cos(theta));
                el('m6-ct-nIs').setAttribute('y2', cy + nIsLen * Math.sin(theta));
                el('m6-ct-nIs-lbl').setAttribute('x', cx + nIsLen * Math.cos(theta) + 5);
                el('m6-ct-nIs-lbl').setAttribute('y', cy + nIsLen * Math.sin(theta) + 5);

                // I0 excitation current
                var I0mag = Math.sqrt(Im * Im + Ic * Ic);
                var I0scale = Math.min(40, I0mag * 25);
                var I0angle = Math.atan2(-Im, Ic); // Im is 90° ahead of flux
                el('m6-ct-I0').setAttribute('x2', cx + I0scale * Math.cos(I0angle));
                el('m6-ct-I0').setAttribute('y2', cy + I0scale * Math.sin(I0angle));

                // Im component (vertical)
                var ImScale = Math.min(40, Im * 25);
                el('m6-ct-Im').setAttribute('y2', cy - ImScale);

                // Ic component (horizontal)
                var IcScale = Math.min(30, Ic * 20);
                el('m6-ct-Ic').setAttribute('x2', cx + IcScale);
            }

            el('m6-ct-im').addEventListener('input', updatePhasor);
            el('m6-ct-ic').addEventListener('input', updatePhasor);
            el('m6-ct-delta').addEventListener('input', updatePhasor);
            updatePhasor();
        }

        // Calculator
        initCalcListener(['m6-ctc-kn', 'm6-ctc-is', 'm6-ctc-ip'], function () {
            var Kn = parseFloat(el('m6-ctc-kn').value);
            var Is = parseFloat(el('m6-ctc-is').value);
            var Ip = parseFloat(el('m6-ctc-ip').value);
            if (Ip > 0) {
                var err = ((Kn * Is - Ip) / Ip) * 100;
                el('m6-ctc-result').textContent = '% Ratio Error = ' + err.toFixed(3) + '%';
            }
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       CARD 6.5 — PT COMPLETE ANALYSIS
       ═══════════════════════════════════════════════════════════════ */
    function initCard65() {
        var chartEl = el('m6-pt-error-chart');

        if (chartEl && typeof d3 !== 'undefined') {
            chartEl.innerHTML = '';
            var w = chartEl.clientWidth || 280, h = 200;
            var m = { t: 25, r: 15, b: 35, l: 50 };
            var iw = w - m.l - m.r, ih = h - m.t - m.b;

            var svg = d3.select('#m6-pt-error-chart').append('svg')
                .attr('width', w).attr('height', h);
            var g = svg.append('g').attr('transform', 'translate(' + m.l + ',' + m.t + ')');

            var xScale = d3.scaleLinear().domain([0, 200]).range([0, iw]);
            var yScale = d3.scaleLinear().domain([-1, 3]).range([ih, 0]);

            g.append('g').attr('transform', 'translate(0,' + ih + ')')
                .call(d3.axisBottom(xScale).ticks(5))
                .selectAll('text').style('fill', MUTED).style('font-size', '8px');

            g.append('g').call(d3.axisLeft(yScale).ticks(5))
                .selectAll('text').style('fill', MUTED).style('font-size', '8px');

            g.append('line').attr('x1', 0).attr('x2', iw).attr('y1', yScale(0)).attr('y2', yScale(0))
                .attr('stroke', GREEN).attr('stroke-width', 1).attr('stroke-dasharray', '4 3');

            var errorPath = g.append('path').attr('fill', 'none').attr('stroke', GOLD).attr('stroke-width', 2);
            var line = d3.line().x(function (d) { return xScale(d.burden); }).y(function (d) { return yScale(d.err); });

            svg.append('text').attr('x', w / 2).attr('y', h - 3)
                .attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '9').text('Burden (VA)');
            svg.append('text').attr('x', w / 2).attr('y', 15)
                .attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '10').text('PT Error vs Burden');

            function updatePTChart() {
                var burden = parseFloat(el('m6-pt-burden').value);
                var pf = parseFloat(el('m6-pt-pf').value);
                el('m6-pt-burden-val').textContent = burden;
                el('m6-pt-pf-val').textContent = pf.toFixed(2);

                var data = [];
                for (var b = 5; b <= 200; b += 5) {
                    // Simplified model: error increases with burden, worse at low pf
                    var err = 0.005 * b * (1.2 - pf * 0.5) + 0.00001 * b * b;
                    data.push({ burden: b, err: err });
                }
                errorPath.attr('d', line(data));
            }

            el('m6-pt-burden').addEventListener('input', updatePTChart);
            el('m6-pt-pf').addEventListener('input', updatePTChart);
            updatePTChart();
        }

        // Calculator
        initCalcListener(['m6-ptc-kn', 'm6-ptc-vs', 'm6-ptc-vp'], function () {
            var Kn = parseFloat(el('m6-ptc-kn').value);
            var Vs = parseFloat(el('m6-ptc-vs').value);
            var Vp = parseFloat(el('m6-ptc-vp').value);
            if (Vp > 0) {
                var err = ((Kn * Vs - Vp) / Vp) * 100;
                el('m6-ptc-result').textContent = '% Ratio Error = ' + err.toFixed(3) + '%';
            }
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       CARD 6.6 — ERRORS IN INSTRUMENT TRANSFORMERS
       ═══════════════════════════════════════════════════════════════ */
    function initCard66() {
        var burdenChartEl = el('m6-error-burden-chart');
        var freqChartEl = el('m6-error-freq-chart');

        // Error vs Burden
        if (burdenChartEl && typeof d3 !== 'undefined') {
            burdenChartEl.innerHTML = '';
            var w = burdenChartEl.clientWidth || 320, h = 210;
            var m = { t: 25, r: 15, b: 35, l: 50 };
            var iw = w - m.l - m.r, ih = h - m.t - m.b;

            var svg = d3.select('#m6-error-burden-chart').append('svg')
                .attr('width', w).attr('height', h);
            var g = svg.append('g').attr('transform', 'translate(' + m.l + ',' + m.t + ')');

            var xScale = d3.scaleLinear().domain([0, 200]).range([0, iw]);
            var yScale = d3.scaleLinear().domain([0, 5]).range([ih, 0]);

            g.append('g').attr('transform', 'translate(0,' + ih + ')')
                .call(d3.axisBottom(xScale).ticks(5))
                .selectAll('text').style('fill', MUTED).style('font-size', '8px');
            g.append('g').call(d3.axisLeft(yScale).ticks(5))
                .selectAll('text').style('fill', MUTED).style('font-size', '8px');

            // Accuracy class lines
            var classes = [
                { cls: '0.1', limit: 0.1, color: GREEN },
                { cls: '0.5', limit: 0.5, color: GOLD },
                { cls: '1.0', limit: 1.0, color: ORANGE },
                { cls: '3.0', limit: 3.0, color: RED }
            ];
            classes.forEach(function (c) {
                g.append('line').attr('x1', 0).attr('x2', iw)
                    .attr('y1', yScale(c.limit)).attr('y2', yScale(c.limit))
                    .attr('stroke', c.color).attr('stroke-width', 1).attr('stroke-dasharray', '4 3').attr('opacity', 0.6);
                g.append('text').attr('x', iw - 2).attr('y', yScale(c.limit) - 3)
                    .attr('text-anchor', 'end').attr('fill', c.color).attr('font-size', '8').text('Class ' + c.cls);
            });

            var ctLine = g.append('path').attr('fill', 'none').attr('stroke', BLUE).attr('stroke-width', 2);
            var ptLine = g.append('path').attr('fill', 'none').attr('stroke', GOLD).attr('stroke-width', 2).attr('stroke-dasharray', '5 3');
            var line = d3.line().x(function (d) { return xScale(d.b); }).y(function (d) { return yScale(d.err); });

            function updateBurdenChart() {
                var burden = parseFloat(el('m6-err-burden').value);
                el('m6-err-burden-val').textContent = burden;

                var ctData = [], ptData = [];
                for (var b = 5; b <= 200; b += 5) {
                    ctData.push({ b: b, err: 0.008 * b + 0.00005 * b * b });
                    ptData.push({ b: b, err: 0.005 * b + 0.00003 * b * b });
                }
                ctLine.attr('d', line(ctData));
                ptLine.attr('d', line(ptData));
            }

            el('m6-err-burden').addEventListener('input', updateBurdenChart);
            updateBurdenChart();

            svg.append('text').attr('x', w / 2).attr('y', h - 3)
                .attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '9').text('Burden (VA)');
            svg.append('text').attr('x', w / 2).attr('y', 15)
                .attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '10').text('Error vs Burden');

            // Legend
            svg.append('line').attr('x1', m.l + 5).attr('y1', 22).attr('x2', m.l + 20).attr('y2', 22).attr('stroke', BLUE).attr('stroke-width', 2);
            svg.append('text').attr('x', m.l + 24).attr('y', 25).attr('fill', BLUE).attr('font-size', '8').text('CT');
            svg.append('line').attr('x1', m.l + 45).attr('y1', 22).attr('x2', m.l + 60).attr('y2', 22).attr('stroke', GOLD).attr('stroke-width', 2).attr('stroke-dasharray', '5 3');
            svg.append('text').attr('x', m.l + 64).attr('y', 25).attr('fill', GOLD).attr('font-size', '8').text('PT');
        }

        // Error vs Frequency
        if (freqChartEl && typeof d3 !== 'undefined') {
            freqChartEl.innerHTML = '';
            var w2 = freqChartEl.clientWidth || 280, h2 = 210;
            var m2 = { t: 25, r: 15, b: 35, l: 45 };
            var iw2 = w2 - m2.l - m2.r, ih2 = h2 - m2.t - m2.b;

            var svg2 = d3.select('#m6-error-freq-chart').append('svg')
                .attr('width', w2).attr('height', h2);
            var g2 = svg2.append('g').attr('transform', 'translate(' + m2.l + ',' + m2.t + ')');

            var xScale2 = d3.scaleLinear().domain([25, 400]).range([0, iw2]);
            var yScale2 = d3.scaleLinear().domain([0, 3]).range([ih2, 0]);

            g2.append('g').attr('transform', 'translate(0,' + ih2 + ')')
                .call(d3.axisBottom(xScale2).ticks(5))
                .selectAll('text').style('fill', MUTED).style('font-size', '8px');
            g2.append('g').call(d3.axisLeft(yScale2).ticks(5))
                .selectAll('text').style('fill', MUTED).style('font-size', '8px');

            // Data: error is minimum near rated freq (50 Hz) and increases at other frequencies
            var freqData = [];
            for (var f = 25; f <= 400; f += 5) {
                var errF = 0.2 + 0.0001 * Math.pow(f - 50, 2);
                freqData.push({ f: f, err: Math.min(errF, 3) });
            }

            var freqLine = d3.line().x(function (d) { return xScale2(d.f); }).y(function (d) { return yScale2(d.err); });
            g2.append('path').attr('d', freqLine(freqData)).attr('fill', 'none').attr('stroke', PURPLE).attr('stroke-width', 2);

            // Optimal frequency marker
            g2.append('line').attr('x1', xScale2(50)).attr('x2', xScale2(50))
                .attr('y1', 0).attr('y2', ih2)
                .attr('stroke', GREEN).attr('stroke-width', 1).attr('stroke-dasharray', '3 3');
            g2.append('text').attr('x', xScale2(50) + 3).attr('y', 10)
                .attr('fill', GREEN).attr('font-size', '8').text('50 Hz');

            svg2.append('text').attr('x', w2 / 2).attr('y', h2 - 3)
                .attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '9').text('Frequency (Hz)');
            svg2.append('text').attr('x', w2 / 2).attr('y', 15)
                .attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '10').text('Error vs Frequency');
        }
    }

    /* ═══════════════════════════════════════════════════════════════
       CARD 6.7 — SUMMARY RADAR CHART (CT vs PT)
       ═══════════════════════════════════════════════════════════════ */
    function initCard67() {
        var chartEl = el('m6-summary-chart');
        if (!chartEl || typeof d3 === 'undefined') return;

        chartEl.innerHTML = '';
        var w = 350, h = 220;
        var svg = d3.select('#m6-summary-chart').append('svg')
            .attr('width', w).attr('height', h);
        var cx = w / 2, cy = h / 2 + 5, radius = 80;

        var axes = ['Accuracy', 'Isolation', 'Cost', 'Burden\nTolerance', 'Safety'];
        var ctVals  = [0.85, 0.95, 0.60, 0.30, 0.40];
        var ptVals  = [0.80, 0.95, 0.70, 0.75, 0.70];

        var angleSlice = 2 * Math.PI / axes.length;

        // Grid circles
        [0.25, 0.5, 0.75, 1].forEach(function (level) {
            var r = radius * level;
            var pts = [];
            for (var i = 0; i < axes.length; i++) {
                var angle = i * angleSlice - Math.PI / 2;
                pts.push((cx + r * Math.cos(angle)) + ',' + (cy + r * Math.sin(angle)));
            }
            svg.append('polygon').attr('points', pts.join(' '))
                .attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.08)').attr('stroke-width', 1);
        });

        // Axis lines and labels
        axes.forEach(function (axis, i) {
            var angle = i * angleSlice - Math.PI / 2;
            var x2 = cx + radius * Math.cos(angle);
            var y2 = cy + radius * Math.sin(angle);
            svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', x2).attr('y2', y2)
                .attr('stroke', 'rgba(255,255,255,0.15)').attr('stroke-width', 1);

            var lx = cx + (radius + 18) * Math.cos(angle);
            var ly = cy + (radius + 18) * Math.sin(angle);
            var lines = axis.split('\n');
            lines.forEach(function (line, li) {
                svg.append('text').attr('x', lx).attr('y', ly + li * 11)
                    .attr('text-anchor', 'middle').attr('fill', MUTED).attr('font-size', '8')
                    .text(line);
            });
        });

        function drawPolygon(vals, color, opacity) {
            var pts = [];
            for (var i = 0; i < vals.length; i++) {
                var angle = i * angleSlice - Math.PI / 2;
                var r = radius * vals[i];
                pts.push((cx + r * Math.cos(angle)) + ',' + (cy + r * Math.sin(angle)));
            }
            return svg.append('polygon').attr('points', pts.join(' '))
                .attr('fill', color).attr('fill-opacity', opacity)
                .attr('stroke', color).attr('stroke-width', 1.5);
        }

        var ctPoly = drawPolygon(ctVals, BLUE, 0.15);
        var ptPoly = drawPolygon(ptVals, GOLD, 0.15);
        ptPoly.attr('opacity', 0);

        // Legend
        svg.append('rect').attr('x', 10).attr('y', 5).attr('width', 12).attr('height', 8).attr('fill', BLUE).attr('rx', 2);
        svg.append('text').attr('x', 26).attr('y', 13).attr('fill', BLUE).attr('font-size', '9').text('CT');
        svg.append('rect').attr('x', 50).attr('y', 5).attr('width', 12).attr('height', 8).attr('fill', GOLD).attr('rx', 2);
        svg.append('text').attr('x', 66).attr('y', 13).attr('fill', GOLD).attr('font-size', '9').text('PT');

        // Button controls
        var btnCT = el('m6-sum-ct-btn');
        var btnPT = el('m6-sum-pt-btn');
        var btnBoth = el('m6-sum-both-btn');

        function setActive(btn) {
            [btnCT, btnPT, btnBoth].forEach(function (b) { if (b) b.classList.remove('active'); });
            if (btn) btn.classList.add('active');
        }

        if (btnCT) btnCT.addEventListener('click', function () {
            setActive(btnCT);
            ctPoly.attr('opacity', 1);
            ptPoly.attr('opacity', 0);
        });
        if (btnPT) btnPT.addEventListener('click', function () {
            setActive(btnPT);
            ctPoly.attr('opacity', 0);
            ptPoly.attr('opacity', 1);
        });
        if (btnBoth) btnBoth.addEventListener('click', function () {
            setActive(btnBoth);
            ctPoly.attr('opacity', 1);
            ptPoly.attr('opacity', 1);
        });

        // Default: show CT
        ctPoly.attr('opacity', 1);
    }

    /* ═══════════════════════════════════════════════════════════════
       BOOT
       ═══════════════════════════════════════════════════════════════ */
    function boot() {
        initCard61();
        initCard62();
        initCard63();
        initCard64();
        initCard65();
        initCard66();
        initCard67();
        initBookmarks();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();
