/* ═══════════════════════════════════════════════════════════════
   MODULE 7 — PT, CT vs PT & Power Measurement
   Color: #facc15 (Gold)
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    const GOLD  = '#facc15', CYAN = '#00f5ff', GREEN = '#00ff88',
          ROSE  = '#fb7185', ORANGE = '#f97316', VIOLET = '#a78bfa',
          BLUE  = '#60a5fa', RED = '#ef4444';

    const el  = id => document.getElementById(id);
    const num = id => parseFloat(el(id)?.value ?? 0);

    /* ── helpers ──────────────────────────────────── */
    const deg2rad = d => d * Math.PI / 180;
    const rad2deg = r => r * 180 / Math.PI;
    const fmt     = (v, d = 2) => Number.isFinite(v) ? v.toFixed(d) : '—';

    /* ── bookmarks ────────────────────────────────── */
    document.querySelectorAll('.m7-bookmark-btn').forEach(btn => {
        const key = 'bm_' + btn.dataset.card;
        if (localStorage.getItem(key) === '1') btn.textContent = '★ Saved';
        btn.addEventListener('click', () => {
            const on = localStorage.getItem(key) === '1';
            localStorage.setItem(key, on ? '0' : '1');
            btn.textContent = on ? '🔖 Bookmark' : '★ Saved';
        });
    });

    /* ══════════════════════════════════════════════════
       CARD 7.1 — PT Phasor Diagram & Phase Angle
       ══════════════════════════════════════════════════ */
    function initCard71() {
        const cx = 130, cy = 130, len = 90;

        function draw() {
            const im    = parseFloat(el('m7-pt-im').value);
            const ic    = parseFloat(el('m7-pt-ic').value);
            const delta = parseFloat(el('m7-pt-delta').value);
            el('m7-pt-im-val').textContent = im;
            el('m7-pt-ic-val').textContent = ic;
            el('m7-pt-delta-val').textContent = delta;

            const dRad = deg2rad(delta);
            // β ≈ (Im·cosδ + Ic·sinδ) / (n·Is) simplified for visual
            const beta = Math.atan2(im * Math.cos(dRad) + ic * Math.sin(dRad),
                                     100 * 0.1); // n=100, Is=0.1 default
            const betaDeg = rad2deg(beta);

            // nV2 rotated by β from V1
            const nv2x = cx + len * Math.cos(beta);
            const nv2y = cy + len * Math.sin(beta) * 0.3; // compressed Y
            const v2 = el('m7-pt-nV2');
            if (v2) { v2.setAttribute('x2', nv2x); v2.setAttribute('y2', nv2y); }
            const v2lbl = el('m7-pt-nV2-lbl');
            if (v2lbl) { v2lbl.setAttribute('x', nv2x + 4); v2lbl.setAttribute('y', nv2y + 8); }

            // Im vector (perpendicular) — rotated up by (90-delta)
            const imAng = deg2rad(90 - delta);
            const imLen = Math.min(im * 40, 60);
            const imx2 = cx + imLen * Math.cos(imAng + Math.PI / 2);
            const imy2 = cy - imLen * Math.sin(imAng + Math.PI / 2);
            const imLine = el('m7-pt-Im');
            if (imLine) { imLine.setAttribute('x2', imx2); imLine.setAttribute('y2', imy2); }
            const imLbl = el('m7-pt-Im-lbl');
            if (imLbl) { imLbl.setAttribute('x', imx2 - 15); imLbl.setAttribute('y', imy2); }

            // Ic vector (along flux)
            const icLen = Math.min(ic * 40, 50);
            const icLine = el('m7-pt-Ic');
            if (icLine) { icLine.setAttribute('x2', cx + icLen); }
            const icLbl = el('m7-pt-Ic-lbl');
            if (icLbl) { icLbl.setAttribute('x', cx + icLen + 4); }

            // β arc
            const r = 45;
            const ex = cx + r * Math.cos(beta);
            const ey = cy + r * Math.sin(beta) * 0.3;
            const arc = el('m7-pt-beta-arc');
            if (arc) arc.setAttribute('d', `M ${cx + r} ${cy} A ${r} ${r * 0.3} 0 0 1 ${ex} ${ey}`);

            const readout = el('m7-pt-readout');
            if (readout) readout.textContent = `β = ${fmt(betaDeg)}°`;
        }

        ['m7-pt-im', 'm7-pt-ic', 'm7-pt-delta'].forEach(id => {
            const e = el(id);
            if (e) e.addEventListener('input', draw);
        });

        // Application tree using D3
        buildAppTree();

        // Calculator
        initCalcListener('m7-pt-calc', ['m7-ptc-im', 'm7-ptc-ic', 'm7-ptc-n', 'm7-ptc-is', 'm7-ptc-delta'], () => {
            const im = num('m7-ptc-im'), ic = num('m7-ptc-ic');
            const n = num('m7-ptc-n'), Is = num('m7-ptc-is'), delta = num('m7-ptc-delta');
            const dRad = deg2rad(delta);
            const beta = (im * Math.cos(dRad) + ic * Math.sin(dRad)) / (n * Is);
            const betaDeg = rad2deg(Math.atan(beta));
            el('m7-ptc-result').textContent = `β = ${fmt(betaDeg, 4)}°`;
        });

        draw();
    }

    function buildAppTree() {
        const container = el('m7-app-tree');
        if (!container || typeof d3 === 'undefined') return;
        const data = {
            name: 'Applications',
            children: [
                { name: 'Protection', children: [{ name: 'Overcurrent relay' }, { name: 'Distance relay' }] },
                { name: 'Metering', children: [{ name: 'Energy meter' }, { name: 'Power meter' }] },
                { name: 'Isolation', children: [{ name: 'Safety' }, { name: 'Low power' }] }
            ]
        };
        const w = 290, h = 200;
        const svg = d3.select(container).append('svg').attr('width', w).attr('height', h);
        const root = d3.hierarchy(data);
        const tree = d3.tree().size([h - 20, w - 80]);
        tree(root);
        svg.selectAll('.link').data(root.links()).join('path')
            .attr('class', 'link')
            .attr('d', d3.linkHorizontal().x(d => d.y + 40).y(d => d.x + 10))
            .attr('fill', 'none').attr('stroke', GOLD).attr('stroke-opacity', 0.4).attr('stroke-width', 1);
        const node = svg.selectAll('.node').data(root.descendants()).join('g')
            .attr('transform', d => `translate(${d.y + 40},${d.x + 10})`);
        node.append('circle').attr('r', 4).attr('fill', d => d.children ? GOLD : CYAN);
        node.append('text').attr('dy', -8).attr('x', d => d.children ? -5 : 5)
            .attr('text-anchor', d => d.children ? 'end' : 'start')
            .attr('fill', '#cbd5e1').attr('font-size', '8px').text(d => d.data.name);
    }

    /* ══════════════════════════════════════════════════
       CARD 7.2 — CT vs PT Danger Toggles
       ══════════════════════════════════════════════════ */
    function initCard72() {
        let ctOpen = false, ptShort = false;
        const ctBtn = el('m7-ct-open-btn');
        const ptBtn = el('m7-pt-short-btn');

        if (ctBtn) {
            ctBtn.addEventListener('click', () => {
                ctOpen = !ctOpen;
                const st = el('m7-ct-status');
                const bg = el('m7-ct-status-bg');
                if (ctOpen) {
                    st.textContent = '⚠️ DANGER: V₂ → ∞!';
                    st.setAttribute('fill', RED);
                    bg.setAttribute('fill', 'rgba(239,68,68,0.15)');
                    ctBtn.textContent = 'Close CT Secondary';
                    ctBtn.style.borderColor = GREEN;
                    ctBtn.style.color = GREEN;
                } else {
                    st.textContent = '✓ Safe: Secondary closed';
                    st.setAttribute('fill', GREEN);
                    bg.setAttribute('fill', 'rgba(0,255,136,0.1)');
                    ctBtn.textContent = 'Open CT Secondary';
                    ctBtn.style.borderColor = '';
                    ctBtn.style.color = '';
                }
            });
        }

        if (ptBtn) {
            ptBtn.addEventListener('click', () => {
                ptShort = !ptShort;
                const st = el('m7-pt-status');
                const bg = el('m7-pt-status-bg');
                if (ptShort) {
                    st.textContent = '⚠️ DANGER: I₂ → ∞!';
                    st.setAttribute('fill', RED);
                    bg.setAttribute('fill', 'rgba(239,68,68,0.15)');
                    ptBtn.textContent = 'Restore PT';
                    ptBtn.style.borderColor = GREEN;
                    ptBtn.style.color = GREEN;
                } else {
                    st.textContent = '✓ Safe: Normal operation';
                    st.setAttribute('fill', GREEN);
                    bg.setAttribute('fill', 'rgba(0,255,136,0.1)');
                    ptBtn.textContent = 'Short PT Secondary';
                    ptBtn.style.borderColor = '';
                    ptBtn.style.color = '';
                }
            });
        }

        // Flux density comparison bars
        buildFluxBars();
    }

    function buildFluxBars() {
        const container = el('m7-flux-bars');
        if (!container || typeof d3 === 'undefined') return;
        const data = [
            { label: 'CT Flux Range', value: 90, color: CYAN },
            { label: 'PT Flux Range', value: 35, color: GOLD }
        ];
        const w = 480, h = 70;
        const svg = d3.select(container).append('svg').attr('width', '100%').attr('height', h)
            .attr('viewBox', `0 0 ${w} ${h}`);
        const x = d3.scaleLinear().domain([0, 100]).range([0, w - 150]);
        data.forEach((d, i) => {
            const y = i * 32 + 5;
            svg.append('text').attr('x', 0).attr('y', y + 14).attr('fill', d.color)
                .attr('font-size', '10px').text(d.label);
            svg.append('rect').attr('x', 130).attr('y', y).attr('width', x(d.value))
                .attr('height', 20).attr('rx', 4).attr('fill', d.color).attr('opacity', 0.35);
            svg.append('rect').attr('x', 130).attr('y', y).attr('width', 0)
                .attr('height', 20).attr('rx', 4).attr('fill', d.color)
                .transition().duration(1200).attr('width', x(d.value));
            svg.append('text').attr('x', 132 + x(d.value) + 5).attr('y', y + 14)
                .attr('fill', d.color).attr('font-size', '10px').text(d.label === 'CT Flux Range' ? 'WIDE' : 'RESTRICTED');
        });
    }

    /* ══════════════════════════════════════════════════
       CARD 7.3 — Power Overview: Triangle & Y/Δ
       ══════════════════════════════════════════════════ */
    function initCard73() {
        const ox = 30, oy = 170;

        function draw() {
            const V   = parseFloat(el('m7-pwr-v').value);
            const I   = parseFloat(el('m7-pwr-i').value);
            const phi = parseFloat(el('m7-pwr-phi').value);
            el('m7-pwr-v-val').textContent = V;
            el('m7-pwr-i-val').textContent = I;
            el('m7-pwr-phi-val').textContent = phi;

            const phiRad = deg2rad(phi);
            const S = V * I;
            const P = S * Math.cos(phiRad);
            const Q = S * Math.sin(phiRad);

            // Scale factor
            const maxLen = 170;
            const s = S > 0 ? maxLen / S : 1;
            const pLen = P * s;
            const qLen = Q * s;

            // P line
            const pLine = el('m7-tri-P');
            if (pLine) { pLine.setAttribute('x2', ox + pLen); }
            const pLbl = el('m7-tri-P-lbl');
            if (pLbl) { pLbl.setAttribute('x', ox + pLen / 2); pLbl.textContent = `P = ${fmt(P, 0)} W`; }

            // Q line
            const qLine = el('m7-tri-Q');
            if (qLine) {
                qLine.setAttribute('x1', ox + pLen); qLine.setAttribute('y1', oy);
                qLine.setAttribute('x2', ox + pLen); qLine.setAttribute('y2', oy - qLen);
            }
            const qLbl = el('m7-tri-Q-lbl');
            if (qLbl) {
                qLbl.setAttribute('x', ox + pLen + 8);
                qLbl.setAttribute('y', oy - qLen / 2);
                qLbl.textContent = `Q = ${fmt(Q, 0)} VAR`;
            }

            // S line
            const sLine = el('m7-tri-S');
            if (sLine) { sLine.setAttribute('x2', ox + pLen); sLine.setAttribute('y2', oy - qLen); }
            const sLbl = el('m7-tri-S-lbl');
            if (sLbl) {
                sLbl.setAttribute('x', ox + pLen / 2 - 20);
                sLbl.setAttribute('y', oy - qLen / 2 - 8);
                sLbl.textContent = `S = ${fmt(S, 0)} VA`;
            }

            // φ arc
            const arcR = 40;
            const ex = ox + arcR * Math.cos(phiRad);
            const ey = oy - arcR * Math.sin(phiRad);
            const arc = el('m7-tri-phi-arc');
            if (arc) arc.setAttribute('d', `M ${ox + arcR} ${oy} A ${arcR} ${arcR} 0 0 0 ${ex} ${ey}`);
            const phiLbl = el('m7-tri-phi-lbl');
            if (phiLbl) { phiLbl.setAttribute('x', ox + arcR + 5); phiLbl.textContent = `φ = ${phi}°`; }

            // Readout
            const readout = el('m7-tri-readout');
            if (readout) readout.textContent = `P=${fmt(P,0)} W | Q=${fmt(Q,0)} VAR | S=${fmt(S,0)} VA`;
        }

        ['m7-pwr-v', 'm7-pwr-i', 'm7-pwr-phi'].forEach(id => {
            const e = el(id);
            if (e) e.addEventListener('input', draw);
        });

        // Y/Δ toggle — simple SVG diagrams
        buildYDelta();

        // Y/Δ buttons
        const yBtn = el('m7-conn-y'), dBtn = el('m7-conn-delta');
        if (yBtn && dBtn) {
            yBtn.addEventListener('click', () => { yBtn.classList.add('active'); dBtn.classList.remove('active'); showYDelta('y'); });
            dBtn.addEventListener('click', () => { dBtn.classList.add('active'); yBtn.classList.remove('active'); showYDelta('d'); });
        }

        // Calculator
        initCalcListener('m7-pwr-calc', ['m7-pwrc-v', 'm7-pwrc-i', 'm7-pwrc-phi'], () => {
            const V = num('m7-pwrc-v'), I = num('m7-pwrc-i'), phi = deg2rad(num('m7-pwrc-phi'));
            const S = V * I, P = S * Math.cos(phi), Q = S * Math.sin(phi);
            el('m7-pwrc-result').textContent = `P = ${fmt(P,1)} W | Q = ${fmt(Q,1)} VAR | S = ${fmt(S,1)} VA`;
        });

        draw();
    }

    let ydSvg;
    function buildYDelta() {
        const container = el('m7-ydelta-viz');
        if (!container) return;
        container.innerHTML = '';
        ydSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        ydSvg.setAttribute('viewBox', '0 0 240 200');
        ydSvg.setAttribute('width', '240');
        ydSvg.setAttribute('height', '200');
        container.appendChild(ydSvg);
        showYDelta('y');
    }

    function showYDelta(type) {
        if (!ydSvg) return;
        ydSvg.innerHTML = '';
        const ns = 'http://www.w3.org/2000/svg';
        function line(x1,y1,x2,y2,c,w) {
            const l = document.createElementNS(ns,'line');
            l.setAttribute('x1',x1); l.setAttribute('y1',y1);
            l.setAttribute('x2',x2); l.setAttribute('y2',y2);
            l.setAttribute('stroke',c); l.setAttribute('stroke-width',w||2);
            ydSvg.appendChild(l);
        }
        function txt(x,y,t,c,sz) {
            const te = document.createElementNS(ns,'text');
            te.setAttribute('x',x); te.setAttribute('y',y);
            te.setAttribute('fill',c); te.setAttribute('font-size',sz||'10');
            te.setAttribute('text-anchor','middle'); te.textContent = t;
            ydSvg.appendChild(te);
        }
        function circ(cx,cy,r,c) {
            const ci = document.createElementNS(ns,'circle');
            ci.setAttribute('cx',cx); ci.setAttribute('cy',cy);
            ci.setAttribute('r',r); ci.setAttribute('fill',c);
            ydSvg.appendChild(ci);
        }

        if (type === 'y') {
            txt(120, 15, 'Y (Star) Connection', BLUE, '12');
            // Neutral point
            circ(120, 100, 5, BLUE);
            txt(130, 115, 'N', BLUE, '10');
            // Phase R
            line(120,100,120,30,RED,2); txt(110,25,'R','#ef4444','10');
            // Phase Y
            line(120,100,50,160,GOLD,2); txt(35,168,'Y',GOLD,'10');
            // Phase B
            line(120,100,190,160,BLUE,2); txt(200,168,'B',BLUE,'10');
            // Labels
            txt(120,185,'VL = √3·Vph, IL = Iph',BLUE,'9');
        } else {
            txt(120, 15, 'Δ (Delta) Connection', VIOLET, '12');
            // Triangle
            line(120,30,50,160,RED,2);   // R-Y
            line(50,160,190,160,GOLD,2); // Y-B
            line(190,160,120,30,BLUE,2); // B-R
            // Vertices
            circ(120,30,5,RED); txt(120,22,'R','#ef4444','10');
            circ(50,160,5,GOLD); txt(35,168,'Y',GOLD,'10');
            circ(190,160,5,BLUE); txt(205,168,'B',BLUE,'10');
            // Labels
            txt(120,185,'VL = Vph, IL = √3·Iph',VIOLET,'9');
        }
    }

    /* ══════════════════════════════════════════════════
       CARD 7.4 — DC Power V-A / A-V Error Crossover
       ══════════════════════════════════════════════════ */
    function initCard74() {
        function draw() {
            const RA = parseFloat(el('m7-dc-ra').value);
            const RV = parseFloat(el('m7-dc-rv').value) * 1000; // kΩ → Ω
            const RL = parseFloat(el('m7-dc-rl').value);
            el('m7-dc-ra-val').textContent = RA;
            el('m7-dc-rv-val').textContent = el('m7-dc-rv').value;
            el('m7-dc-rl-val').textContent = RL;

            const errVA = -(RA / RL) * 100;  // %
            const errAV = (RL / RV) * 100;   // %
            const Rc = Math.sqrt(RA * RV);

            // Update circuit error texts
            const vaErr = el('m7-va-error');
            if (vaErr) vaErr.textContent = `Error: ${fmt(Math.abs(errVA),2)}%`;
            const avErr = el('m7-av-error');
            if (avErr) avErr.textContent = `Error: ${fmt(errAV,2)}%`;

            // Recommendation
            const rec = el('m7-dc-recommend');
            if (rec) {
                if (RL > Rc) {
                    rec.textContent = `RL (${RL}Ω) > Rc (${fmt(Rc,1)}Ω) → Use V-A method`;
                    rec.style.borderColor = CYAN;
                    rec.style.color = CYAN;
                } else {
                    rec.textContent = `RL (${RL}Ω) < Rc (${fmt(Rc,1)}Ω) → Use A-V method`;
                    rec.style.borderColor = ORANGE;
                    rec.style.color = ORANGE;
                }
            }

            // D3 error crossover chart
            buildDCChart(RA, RV);
        }

        ['m7-dc-ra', 'm7-dc-rv', 'm7-dc-rl'].forEach(id => {
            const e = el(id);
            if (e) e.addEventListener('input', draw);
        });

        // Calculator
        initCalcListener('m7-dc-calc', ['m7-dcc-ra', 'm7-dcc-rv', 'm7-dcc-rl'], () => {
            const RA = num('m7-dcc-ra'), RV = num('m7-dcc-rv') * 1000, RL = num('m7-dcc-rl');
            const errVA = -(RA / RL) * 100;
            const errAV = (RL / RV) * 100;
            const Rc = Math.sqrt(RA * RV);
            el('m7-dcc-result').textContent = `V-A: ${fmt(errVA,3)}% | A-V: +${fmt(errAV,3)}% | Rc = ${fmt(Rc,1)} Ω`;
        });

        draw();
    }

    function buildDCChart(RA, RV) {
        const container = el('m7-dc-error-chart');
        if (!container || typeof d3 === 'undefined') return;
        container.innerHTML = '';

        const w = 270, h = 190, m = { t: 20, r: 15, b: 30, l: 45 };
        const svg = d3.select(container).append('svg').attr('width', '100%').attr('height', h)
            .attr('viewBox', `0 0 ${w} ${h}`);

        const RLs = d3.range(1, 5001, 50);
        const vaData = RLs.map(rl => ({ rl, err: Math.abs(RA / rl * 100) }));
        const avData = RLs.map(rl => ({ rl, err: rl / RV * 100 }));
        const Rc = Math.sqrt(RA * RV);

        const x = d3.scaleLog().domain([1, 5000]).range([m.l, w - m.r]);
        const maxErr = Math.max(d3.max(vaData, d => d.err), d3.max(avData, d => d.err), 5);
        const y = d3.scaleLinear().domain([0, Math.min(maxErr, 50)]).range([h - m.b, m.t]);

        // Axes
        svg.append('g').attr('transform', `translate(0,${h - m.b})`)
            .call(d3.axisBottom(x).ticks(4, ',.0f').tickSize(3))
            .selectAll('text').attr('fill', '#94a3b8').attr('font-size', '7px');
        svg.append('g').attr('transform', `translate(${m.l},0)`)
            .call(d3.axisLeft(y).ticks(5).tickSize(3))
            .selectAll('text').attr('fill', '#94a3b8').attr('font-size', '7px');
        svg.selectAll('.domain,.tick line').attr('stroke', '#334155');

        // V-A line
        svg.append('path').datum(vaData)
            .attr('fill', 'none').attr('stroke', CYAN).attr('stroke-width', 1.5)
            .attr('d', d3.line().x(d => x(d.rl)).y(d => y(Math.min(d.err, Math.min(maxErr, 50)))));
        // A-V line
        svg.append('path').datum(avData)
            .attr('fill', 'none').attr('stroke', ORANGE).attr('stroke-width', 1.5)
            .attr('d', d3.line().x(d => x(d.rl)).y(d => y(Math.min(d.err, Math.min(maxErr, 50)))));

        // Crossover vertical
        if (Rc > 1 && Rc < 5000) {
            svg.append('line').attr('x1', x(Rc)).attr('x2', x(Rc))
                .attr('y1', m.t).attr('y2', h - m.b)
                .attr('stroke', GOLD).attr('stroke-dasharray', '4 2').attr('stroke-width', 1);
            svg.append('text').attr('x', x(Rc)).attr('y', m.t - 4)
                .attr('fill', GOLD).attr('font-size', '8px').attr('text-anchor', 'middle')
                .text(`Rc=${fmt(Rc, 0)}Ω`);
        }

        // Legend
        svg.append('text').attr('x', w - m.r).attr('y', m.t + 10).attr('fill', CYAN)
            .attr('font-size', '8px').attr('text-anchor', 'end').text('V-A err');
        svg.append('text').attr('x', w - m.r).attr('y', m.t + 22).attr('fill', ORANGE)
            .attr('font-size', '8px').attr('text-anchor', 'end').text('A-V err');

        // Axis labels
        svg.append('text').attr('x', w / 2).attr('y', h - 3).attr('fill', '#94a3b8')
            .attr('font-size', '8px').attr('text-anchor', 'middle').text('RL (Ω)');
        svg.append('text').attr('x', 8).attr('y', m.t - 4).attr('fill', '#94a3b8')
            .attr('font-size', '8px').text('% Err');
    }

    /* ══════════════════════════════════════════════════
       CARD 7.5 — Two Wattmeter Method
       ══════════════════════════════════════════════════ */
    function initCard75() {
        const VL = 415, IL = 10; // fixed for visualization

        function draw() {
            const phi = parseFloat(el('m7-watt-phi').value);
            el('m7-watt-phi-val').textContent = phi;

            const phiRad = deg2rad(phi);
            const W1 = VL * IL * Math.cos(deg2rad(30) - phiRad);
            const W2 = VL * IL * Math.cos(deg2rad(30) + phiRad);
            const Ptot = W1 + W2;
            const pf = Math.cos(phiRad);

            // Update readings
            const w1r = el('m7-w1-reading');
            if (w1r) w1r.textContent = `W₁ = ${fmt(W1, 0)} W`;
            const w2r = el('m7-w2-reading');
            if (w2r) w2r.textContent = `W₂ = ${fmt(W2, 0)} W`;

            // Badges
            const pfBadge = el('m7-watt-pf-badge');
            if (pfBadge) {
                pfBadge.textContent = `pf = ${fmt(pf, 3)}`;
                pfBadge.style.borderColor = pf > 0.5 ? GREEN : RED;
                pfBadge.style.color = pf > 0.5 ? GREEN : RED;
            }
            const w2Badge = el('m7-watt-w2-badge');
            if (w2Badge) {
                if (W2 >= 0) {
                    w2Badge.textContent = 'W₂ > 0'; w2Badge.style.borderColor = GREEN; w2Badge.style.color = GREEN;
                } else {
                    w2Badge.textContent = 'W₂ < 0 (reverse)'; w2Badge.style.borderColor = RED; w2Badge.style.color = RED;
                }
            }

            // Bar chart
            buildWattChart(W1, W2, Ptot);
        }

        const phiSlider = el('m7-watt-phi');
        if (phiSlider) phiSlider.addEventListener('input', draw);

        // Calculator
        initCalcListener('m7-watt-calc', ['m7-wattc-w1', 'm7-wattc-w2'], () => {
            const W1 = num('m7-wattc-w1'), W2 = num('m7-wattc-w2');
            const P = W1 + W2;
            const tanPhi = P !== 0 ? Math.sqrt(3) * (W1 - W2) / P : 0;
            const phi = Math.atan(tanPhi);
            const cosPhi = Math.cos(phi);
            el('m7-wattc-result').textContent = `P = ${fmt(P, 1)} W | tan φ = ${fmt(tanPhi, 4)} | cos φ = ${fmt(cosPhi, 4)}`;
        });

        draw();
    }

    function buildWattChart(W1, W2, Ptot) {
        const container = el('m7-watt-chart');
        if (!container || typeof d3 === 'undefined') return;
        container.innerHTML = '';

        const w = 270, h = 200, m = { t: 25, r: 10, b: 25, l: 50 };
        const svg = d3.select(container).append('svg').attr('width', '100%').attr('height', h)
            .attr('viewBox', `0 0 ${w} ${h}`);

        const data = [
            { label: 'W₁', value: W1, color: CYAN },
            { label: 'W₂', value: W2, color: ORANGE },
            { label: 'P_total', value: Ptot, color: GOLD }
        ];

        const maxVal = Math.max(Math.abs(W1), Math.abs(W2), Math.abs(Ptot), 100);
        const x = d3.scaleBand().domain(data.map(d => d.label)).range([m.l, w - m.r]).padding(0.3);
        const y = d3.scaleLinear().domain([Math.min(0, W2 * 1.2), maxVal * 1.1]).range([h - m.b, m.t]);

        // Zero line
        svg.append('line').attr('x1', m.l).attr('x2', w - m.r)
            .attr('y1', y(0)).attr('y2', y(0)).attr('stroke', '#475569').attr('stroke-width', 1);

        // Bars
        data.forEach(d => {
            const barY = d.value >= 0 ? y(d.value) : y(0);
            const barH = Math.abs(y(0) - y(d.value));
            svg.append('rect')
                .attr('x', x(d.label)).attr('y', barY)
                .attr('width', x.bandwidth()).attr('height', barH)
                .attr('fill', d.color).attr('opacity', 0.7).attr('rx', 3);
            svg.append('text')
                .attr('x', x(d.label) + x.bandwidth() / 2)
                .attr('y', d.value >= 0 ? barY - 4 : barY + barH + 12)
                .attr('fill', d.color).attr('font-size', '8px').attr('text-anchor', 'middle')
                .text(fmt(d.value, 0));
        });

        // X axis labels
        data.forEach(d => {
            svg.append('text')
                .attr('x', x(d.label) + x.bandwidth() / 2).attr('y', h - 5)
                .attr('fill', '#94a3b8').attr('font-size', '9px').attr('text-anchor', 'middle')
                .text(d.label);
        });

        // Title
        svg.append('text').attr('x', w / 2).attr('y', 12).attr('fill', GOLD)
            .attr('font-size', '9px').attr('text-anchor', 'middle').text('Wattmeter Readings');
    }

    /* ══════════════════════════════════════════════════
       CARD 7.6 — Summary: Method Tree & 3-φ Calculator
       ══════════════════════════════════════════════════ */
    function initCard76() {
        buildMethodTree('dc');
        buildSummaryChart();

        // Type buttons
        ['m7-sum-dc-btn', 'm7-sum-1ph-btn', 'm7-sum-3ph-btn'].forEach(id => {
            const btn = el(id);
            if (!btn) return;
            btn.addEventListener('click', () => {
                document.querySelectorAll('#mod7 .m7-btn[data-type]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                buildMethodTree(btn.dataset.type);
            });
        });

        // 3-φ calculator
        initCalcListener('m7-3ph-calc', ['m7-3phc-vl', 'm7-3phc-il', 'm7-3phc-pf'], () => {
            const VL = num('m7-3phc-vl'), IL = num('m7-3phc-il'), pf = num('m7-3phc-pf');
            const phi = Math.acos(Math.max(0, Math.min(1, pf)));
            const P = Math.sqrt(3) * VL * IL * pf;
            const Q = Math.sqrt(3) * VL * IL * Math.sin(phi);
            const S = Math.sqrt(3) * VL * IL;
            el('m7-3phc-result').textContent = `P = ${fmt(P, 1)} W | Q = ${fmt(Q, 1)} VAR | S = ${fmt(S, 1)} VA`;
        });
    }

    function buildMethodTree(type) {
        const container = el('m7-method-tree');
        if (!container || typeof d3 === 'undefined') return;
        container.innerHTML = '';

        const trees = {
            dc: {
                name: 'DC Power', children: [
                    { name: 'V-A Method', children: [{ name: 'High RL' }] },
                    { name: 'A-V Method', children: [{ name: 'Low RL' }] },
                    { name: 'Rcrit = √(RA·RV)' }
                ]
            },
            '1ph': {
                name: '1-φ AC', children: [
                    { name: 'P = VIcosφ' },
                    { name: 'S² = P² + Q²' },
                    { name: 'Wattmeter' }
                ]
            },
            '3ph': {
                name: '3-φ AC', children: [
                    { name: '1 Wattmeter', children: [{ name: 'Balanced only' }] },
                    { name: '2 Wattmeter', children: [{ name: 'Any load' }] },
                    { name: '3 Wattmeter', children: [{ name: 'Unbalanced' }] }
                ]
            }
        };

        const data = trees[type] || trees.dc;
        const w = 290, h = 195;
        const svg = d3.select(container).append('svg').attr('width', w).attr('height', h);
        const root = d3.hierarchy(data);
        const tree = d3.tree().size([h - 20, w - 80]);
        tree(root);
        svg.selectAll('.link').data(root.links()).join('path')
            .attr('d', d3.linkHorizontal().x(d => d.y + 40).y(d => d.x + 10))
            .attr('fill', 'none').attr('stroke', GOLD).attr('stroke-opacity', 0.4).attr('stroke-width', 1);
        const node = svg.selectAll('.node').data(root.descendants()).join('g')
            .attr('transform', d => `translate(${d.y + 40},${d.x + 10})`);
        node.append('circle').attr('r', 4).attr('fill', d => d.children ? GOLD : GREEN);
        node.append('text').attr('dy', -8).attr('x', d => d.children ? -5 : 5)
            .attr('text-anchor', d => d.children ? 'end' : 'start')
            .attr('fill', '#cbd5e1').attr('font-size', '8px').text(d => d.data.name);
    }

    function buildSummaryChart() {
        const container = el('m7-summary-chart');
        if (!container || typeof d3 === 'undefined') return;
        container.innerHTML = '';

        const w = 290, h = 200, m = { t: 25, r: 15, b: 30, l: 40 };
        const svg = d3.select(container).append('svg').attr('width', '100%').attr('height', h)
            .attr('viewBox', `0 0 ${w} ${h}`);

        const VL = 415, IL = 10;
        const phis = d3.range(0, 91, 2);
        const w1Data = phis.map(p => ({ phi: p, val: VL * IL * Math.cos(deg2rad(30 - p)) }));
        const w2Data = phis.map(p => ({ phi: p, val: VL * IL * Math.cos(deg2rad(30 + p)) }));

        const x = d3.scaleLinear().domain([0, 90]).range([m.l, w - m.r]);
        const allVals = [...w1Data.map(d => d.val), ...w2Data.map(d => d.val)];
        const y = d3.scaleLinear().domain([d3.min(allVals) * 1.1, d3.max(allVals) * 1.1]).range([h - m.b, m.t]);

        // Axes
        svg.append('g').attr('transform', `translate(0,${h - m.b})`)
            .call(d3.axisBottom(x).ticks(6).tickSize(3))
            .selectAll('text').attr('fill', '#94a3b8').attr('font-size', '7px');
        svg.append('g').attr('transform', `translate(${m.l},0)`)
            .call(d3.axisLeft(y).ticks(5).tickSize(3))
            .selectAll('text').attr('fill', '#94a3b8').attr('font-size', '7px');
        svg.selectAll('.domain,.tick line').attr('stroke', '#334155');

        // Zero line
        svg.append('line').attr('x1', m.l).attr('x2', w - m.r)
            .attr('y1', y(0)).attr('y2', y(0)).attr('stroke', '#475569').attr('stroke-dasharray', '2 2');

        // W1 line
        svg.append('path').datum(w1Data)
            .attr('fill', 'none').attr('stroke', CYAN).attr('stroke-width', 1.5)
            .attr('d', d3.line().x(d => x(d.phi)).y(d => y(d.val)));
        // W2 line
        svg.append('path').datum(w2Data)
            .attr('fill', 'none').attr('stroke', ORANGE).attr('stroke-width', 1.5)
            .attr('d', d3.line().x(d => x(d.phi)).y(d => y(d.val)));

        // 60° marker
        svg.append('line').attr('x1', x(60)).attr('x2', x(60))
            .attr('y1', m.t).attr('y2', h - m.b)
            .attr('stroke', RED).attr('stroke-dasharray', '3 2').attr('stroke-width', 1);
        svg.append('text').attr('x', x(60) + 3).attr('y', m.t + 10).attr('fill', RED)
            .attr('font-size', '7px').text('60° W₂=0');

        // Legend
        svg.append('text').attr('x', w - m.r).attr('y', m.t + 10).attr('fill', CYAN)
            .attr('font-size', '8px').attr('text-anchor', 'end').text('W₁');
        svg.append('text').attr('x', w - m.r).attr('y', m.t + 22).attr('fill', ORANGE)
            .attr('font-size', '8px').attr('text-anchor', 'end').text('W₂');

        // Axis labels
        svg.append('text').attr('x', w / 2).attr('y', h - 3).attr('fill', '#94a3b8')
            .attr('font-size', '8px').attr('text-anchor', 'middle').text('φ (degrees)');
        svg.append('text').attr('x', 6).attr('y', m.t - 5).attr('fill', '#94a3b8')
            .attr('font-size', '8px').text('W');

        // Title
        svg.append('text').attr('x', w / 2).attr('y', 12).attr('fill', GOLD)
            .attr('font-size', '9px').attr('text-anchor', 'middle').text('W₁, W₂ vs φ');
    }

    /* ── shared calc listener helper ─────────────── */
    function initCalcListener(zoneId, inputIds, compute) {
        inputIds.forEach(id => {
            const inp = el(id);
            if (inp) inp.addEventListener('input', compute);
        });
        compute();
    }

    /* ══════════════════════════════════════════════════
       INIT ALL CARDS
       ══════════════════════════════════════════════════ */
    function init() {
        initCard71();
        initCard72();
        initCard73();
        initCard74();
        initCard75();
        initCard76();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
