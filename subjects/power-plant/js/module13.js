/*!
 * Module 13 Logic: Economics, Depreciation & Tariffs
 * Uses D3.js and GSAP for interactions
 */
document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Tab Navigation Logic --- */
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const parentPanel = this.closest('.anim-zone');
            
            // Manage Active States
            parentPanel.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Switch content with simple GSAP fade
            parentPanel.querySelectorAll('.anim-content').forEach(content => {
                if(content.id === targetId) {
                    content.style.display = 'block';
                    gsap.fromTo(content, {opacity: 0, y: 5}, {opacity: 1, y: 0, duration: 0.3});
                } else {
                    content.style.display = 'none';
                }
            });
        });
    });

    /* --- 2. Cost Stacked Bar & Calculates (Card 1) --- */
    const valKW = document.getElementById('val-kw');
    const sliderKW = document.getElementById('slider-kw');
    const valKWh = document.getElementById('val-kwh');
    const sliderKWh = document.getElementById('slider-kwh');
    const totalDisplay = document.getElementById('cost-total-display');

    const costA = 10000;  // Fixed
    const costB = 200;    // Semi-fixed per kW
    const costC = 4;      // Running per kWh

    // D3 Setup Stacked Bar
    const cbWidth = document.getElementById('cost-bar-chart').clientWidth || 300;
    const cbHeight = 120;
    const cbSvg = d3.select('#cost-bar-chart').append('svg')
        .attr('width', '100%').attr('height', '100%')
        .attr('viewBox', `0 0 ${cbWidth} ${cbHeight}`);
    
    const cbScale = d3.scaleLinear().domain([0, 10000 + (200*1000) + (4*50000)]).range([0, cbWidth-40]);
    const cbColors = ['#facc15', '#00f5ff', '#f97316'];
    const cbLabels = ['Fixed (a)', 'Semi (b)', 'Run (c)'];

    let cbGroup = cbSvg.append('g').attr('transform', 'translate(20, 30)');

    function updateCostChart() {
        const kw = parseInt(sliderKW.value);
        const kwh = parseInt(sliderKWh.value);
        
        valKW.innerText = kw;
        valKWh.innerText = kwh.toLocaleString();
        
        const aPart = costA;
        const bPart = costB * kw;
        const cPart = costC * kwh;
        const totalCost = aPart + bPart + cPart;
        
        totalDisplay.innerText = `Total E: ₹${totalCost.toLocaleString()}`;

        const dataset = [aPart, bPart, cPart];
        
        let cumulative = 0;
        const stackedData = dataset.map(d => {
            const obj = { start: cumulative, value: d };
            cumulative += d;
            return obj;
        });

        const rects = cbGroup.selectAll('rect').data(stackedData);
        rects.enter().append('rect')
            .attr('y', 0).attr('height', 40)
            .attr('fill', (d,i) => cbColors[i])
            .merge(rects)
            .transition().duration(400)
            .attr('x', d => cbScale(d.start))
            .attr('width', d => cbScale(d.value));

        // Update Pie chart as well
        updatePieChart(aPart + bPart, cPart);
    }

    if(sliderKW && sliderKWh) {
        sliderKW.addEventListener('input', updateCostChart);
        sliderKWh.addEventListener('input', updateCostChart);
        // init
        setTimeout(updateCostChart, 200);
    }

    /* --- 3. Standing vs Running Pie Chart --- */
    const cpWidth = 180;
    const cpHeight = 180;
    const cpRadius = Math.min(cpWidth, cpHeight) / 2;
    const cpSvg = d3.select('#cost-pie-chart').append('svg')
        .attr('width', cpWidth).attr('height', cpHeight)
        .append('g').attr('transform', `translate(${cpWidth/2}, ${cpHeight/2})`);
    
    const pie = d3.pie().sort(null).value(d => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(cpRadius - 10);

    function updatePieChart(standing, running) {
        const data = [
            { label: 'Standing', value: standing, color: '#a78bfa' },
            { label: 'Running', value: running, color: '#f97316' }
        ];

        const paths = cpSvg.selectAll('path').data(pie(data));
        paths.enter().append('path')
            .attr('fill', d => d.data.color)
            .attr('stroke', '#0d1117').attr('stroke-width', '2px')
            .merge(paths)
            .transition().duration(400)
            .attrTween("d", function(d) {
                this._current = this._current || d;
                const interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) { return arc(interpolate(t)); };
            });
    }

    /* --- 4. Depreciation Curves (Card 2) --- */
    const sliderN = document.getElementById('slider-n');
    const sliderS = document.getElementById('slider-s');
    const valYears = document.getElementById('val-years');
    const valSalvage = document.getElementById('val-salvage');

    const dpWidth = document.getElementById('depreciation-line-chart').clientWidth || 300;
    const dpHeight = 180;
    const dpMargin = {top: 10, right: 10, bottom: 20, left: 40};
    
    const dpSvg = d3.select('#depreciation-line-chart').append('svg')
        .attr('width', '100%').attr('height', '100%')
        .attr('viewBox', `0 0 ${dpWidth} ${dpHeight}`);

    function updateDepreciation() {
        if(!sliderN) return;
        const n = parseInt(sliderN.value);
        const S = parseInt(sliderS.value) * 1000; // k to absolute
        const P = 2500000; // 2.5 Million
        const r = 0.08; // 8% interest

        valYears.innerText = n;
        valSalvage.innerText = parseInt(sliderS.value);

        const xScale = d3.scaleLinear().domain([0, n]).range([dpMargin.left, dpWidth - dpMargin.right]);
        const yScale = d3.scaleLinear().domain([0, P]).range([dpHeight - dpMargin.bottom, dpMargin.top]);

        // Generate data arrays
        let slData = [], dbData = [], sfData = [];
        const slRate = (P - S) / n;
        const dbRate = 1 - Math.pow(S/P, 1/n);

        // SF Annuity
        const q = (P - S) * (r / (Math.pow(1+r, n) - 1));

        for(let t = 0; t <= n; t++) {
            // Straight Line Book Value
            slData.push({x: t, y: P - (t * slRate)});
            
            // Declining Balance Book Value
            dbData.push({x: t, y: P * Math.pow(1-dbRate, t)});

            // Sinking Fund Accumulated
            const sfAccum = q * ((Math.pow(1+r, t) - 1) / r);
            sfData.push({x: t, y: P - sfAccum});
        }

        const lineGen = d3.line().x(d => xScale(d.x)).y(d => yScale(d.y)).curve(d3.curveMonotoneX);

        // Axis
        dpSvg.selectAll('.m13-axis').remove();
        dpSvg.append('g').attr('class', 'm13-axis')
            .attr('transform', `translate(0, ${dpHeight - dpMargin.bottom})`)
            .call(d3.axisBottom(xScale).ticks(5).tickSizeOuter(0));
        
        dpSvg.append('g').attr('class', 'm13-axis')
            .attr('transform', `translate(${dpMargin.left}, 0)`)
            .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => (d/1000)+'k'));

        // Bind Paths
        const paths = [
            {data: slData, color: '#facc15', id:'dl-sl'},
            {data: dbData, color: '#00f5ff', id:'dl-db'},
            {data: sfData, color: '#f97316', id:'dl-sf'}
        ];

        paths.forEach(p => {
            let pathEle = dpSvg.select(`#${p.id}`);
            if(pathEle.empty()) {
                dpSvg.append('path').attr('id', p.id)
                     .attr('fill', 'none').attr('stroke', p.color).attr('stroke-width', 2);
                pathEle = dpSvg.select(`#${p.id}`);
            }
            pathEle.datum(p.data)
                .transition().duration(200)
                .attr('d', lineGen);
        });
    }

    if(sliderN) {
        sliderN.addEventListener('input', updateDepreciation);
        sliderS.addEventListener('input', updateDepreciation);
        setTimeout(updateDepreciation, 300);
    }

    /* --- 5. Three Part Tariff Builder --- */
    const tpSliderX = document.getElementById('tp-x-slider');
    const tpSliderY = document.getElementById('tp-y-slider');
    const tpValX = document.getElementById('tp-x-val');
    const tpValY = document.getElementById('tp-y-val');
    const tpValZ = document.getElementById('tp-z-val');

    const barA = document.getElementById('bar-a');
    const barB = document.getElementById('bar-b');
    const barC = document.getElementById('bar-c');

    function updateThreePart() {
        if(!tpSliderX) return;
        const x = parseInt(tpSliderX.value); // Demand kw
        const y = parseInt(tpSliderY.value); // Energy kwh
        
        tpValX.innerText = x;
        tpValY.innerText = y.toLocaleString();

        const a_rate = 150; // ₹ / kW
        const b_rate = 5;   // ₹ / kWh
        const c_const = 500; // Fixed charge

        const ax = a_rate * x;
        const by = b_rate * y;
        const z = ax + by + c_const;
        
        tpValZ.innerText = z.toLocaleString();

        const pA = (ax / z) * 100;
        const pB = (by / z) * 100;
        const pC = (c_const / z) * 100;

        barA.style.width = pA + '%';
        barB.style.width = pB + '%';
        barC.style.width = pC + '%';
    }

    if(tpSliderX) {
        tpSliderX.addEventListener('input', updateThreePart);
        tpSliderY.addEventListener('input', updateThreePart);
        updateThreePart();
    }

    /* --- 6. Block Rate Chart --- */
    function drawBlockRate() {
        const brSvg = d3.select('#block-rate-chart').append('svg')
            .attr('width', '100%').attr('height', '100%')
            .attr('viewBox', '0 0 300 150');
        
        // Step data: Unit range vs Price
        const brData = [
            { x: 0, y: 8 }, { x: 50, y: 8 }, 
            { x: 50, y: 6 }, { x: 100, y: 6 },
            { x: 100, y: 4 }, { x: 200, y: 4 }
        ];

        const xScale = d3.scaleLinear().domain([0, 200]).range([30, 280]);
        const yScale = d3.scaleLinear().domain([0, 10]).range([130, 20]);

        const line = d3.line().x(d => xScale(d.x)).y(d => yScale(d.y)).curve(d3.curveStepAfter);

        brSvg.append('path').datum(brData)
            .attr('fill', 'none').attr('stroke', '#f97316').attr('stroke-width', 3)
            .attr('d', line);
            
        brSvg.append('g').attr('class', 'm13-axis').attr('transform', `translate(0, 130)`).call(d3.axisBottom(xScale).ticks(4));
        brSvg.append('g').attr('class', 'm13-axis').attr('transform', `translate(30, 0)`).call(d3.axisLeft(yScale).ticks(3));
        
        brSvg.append('text').attr('x', 150).attr('y', 148).attr('text-anchor', 'middle').attr('fill','#9ca3af').attr('font-size','9px').text('Units Consumed');
        brSvg.append('text').attr('x', -75).attr('y', 10).attr('transform', 'rotate(-90)').attr('text-anchor', 'middle').attr('fill','#9ca3af').attr('font-size','9px').text('₹ / Unit');
    }
    drawBlockRate();

    /* --- 7. TOD Clock --- */
    function drawTodClock() {
        const todSvg = d3.select('#tod-clock').append('svg')
            .attr('width', 160).attr('height', 160)
            .attr('viewBox', '-80 -80 160 160')
            .attr('class', 'tod-clock-svg');
        
        const rOuter = 70;
        const rInner = 40;
        const arcGen = d3.arc().innerRadius(rInner).outerRadius(rOuter);

        const hoursData = [
            { start: 23, end: 6, label: 'Off-Peak', color: '#00ff88' }, // 11pm - 6am (7)
            { start: 6, end: 10, label: 'Peak', color: '#ef4444' }, // 6am - 10am (4)
            { start: 10, end: 17, label: 'Shoulder', color: '#f97316' }, // 10am - 5pm (7)
            { start: 17, end: 23, label: 'Peak', color: '#ef4444' }, // 5pm - 11pm (6)
        ];

        const hourToRad = (h) => (h / 24) * 2 * Math.PI;

        todSvg.selectAll('.tod-segment').data(hoursData).enter().append('path')
            .attr('class', 'tod-segment')
            .attr('d', d => {
                let startAngle = hourToRad(d.start);
                let endAngle = hourToRad(d.end);
                if (d.start > d.end) endAngle += 2 * Math.PI;
                return arcGen({startAngle, endAngle});
            })
            .attr('fill', d => d.color).attr('stroke', '#0d1117').attr('stroke-width', 2);
            
        todSvg.append('text').attr('x', 0).attr('y', 4).attr('text-anchor', 'middle').attr('fill', '#e2e8f0').text('TOD');
    }
    drawTodClock();

    /* --- 8. PF Triangle --- */
    const pf1S = document.getElementById('slider-pf1');
    const pf2S = document.getElementById('slider-pf2');
    const pf1V = document.getElementById('val-pf1');
    const pf2V = document.getElementById('val-pf2');
    const qcV = document.getElementById('val-qc');

    const pfSvg = d3.select('#pf-triangle-chart').append('svg')
        .attr('width', '100%').attr('height', '100%')
        .attr('viewBox', '0 0 300 120');

    function updatePFTriangle() {
        if(!pf1S) return;
        const pf1 = parseFloat(pf1S.value);
        let pf2 = parseFloat(pf2S.value);
        if(pf2 < pf1) {
            pf2 = pf1;
            pf2S.value = pf1;
        }

        pf1V.innerText = pf1.toFixed(2);
        pf2V.innerText = pf2.toFixed(2);

        const P = 100; // 100 kW Base
        const theta1 = Math.acos(pf1);
        const theta2 = Math.acos(pf2);
        
        const kVAR1 = P * Math.tan(theta1);
        const kVAR2 = P * Math.tan(theta2);
        const Qc = kVAR1 - kVAR2;

        qcV.innerText = Qc.toFixed(1);

        const xBase = 50;
        const yBase = 110;
        const kwWidth = P * 2; // Scale
        const scaleY = 0.5;

        pfSvg.selectAll('*').remove();
        
        // Base kW Line (Horizontal)
        pfSvg.append('line').attr('x1', xBase).attr('y1', yBase).attr('x2', xBase + kwWidth).attr('y2', yBase)
            .attr('stroke', '#facc15').attr('stroke-width', 3);
        pfSvg.append('text').attr('x', xBase + kwWidth/2).attr('y', yBase+10).attr('fill', '#facc15').attr('font-size','10px').attr('text-anchor', 'middle').text('kW (Active Power)');

        // Original kVAR Line (Vertical upward)
        pfSvg.append('line').attr('x1', xBase+kwWidth).attr('y1', yBase).attr('x2', xBase+kwWidth).attr('y2', yBase - (kVAR1*scaleY))
            .attr('stroke', '#ef4444').attr('stroke-width', 2).attr('stroke-dasharray', '4');
        
        // Original kVA Hypotenuse
        pfSvg.append('line').attr('x1', xBase).attr('y1', yBase).attr('x2', xBase+kwWidth).attr('y2', yBase - (kVAR1*scaleY))
            .attr('stroke', '#ef4444').attr('stroke-width', 2);

        // Target kVAR Line (Vertical upward)
        pfSvg.append('line').attr('x1', xBase+kwWidth).attr('y1', yBase).attr('x2', xBase+kwWidth).attr('y2', yBase - (kVAR2*scaleY))
            .attr('stroke', '#00ff88').attr('stroke-width', 2);
        
        // Target kVA Hypotenuse
        pfSvg.append('line').attr('x1', xBase).attr('y1', yBase).attr('x2', xBase+kwWidth).attr('y2', yBase - (kVAR2*scaleY))
            .attr('stroke', '#00ff88').attr('stroke-width', 2);

        // Qc Capacitor bank highlighted
        pfSvg.append('line').attr('x1', xBase+kwWidth + 5).attr('y1', yBase - (kVAR2*scaleY)).attr('x2', xBase+kwWidth + 5).attr('y2', yBase - (kVAR1*scaleY))
            .attr('stroke', '#00f5ff').attr('stroke-width', 4).attr('marker-start', 'url(#arrow-up)').attr('marker-end', 'url(#arrow-down)');
        
        pfSvg.append('text').attr('x', xBase+kwWidth + 12).attr('y', yBase - ((kVAR1+kVAR2)/2 * scaleY)).attr('fill', '#00f5ff').attr('font-size','10px').text('Qc');
    }
    
    if(pf1S) {
        pf1S.addEventListener('input', updatePFTriangle);
        pf2S.addEventListener('input', updatePFTriangle);
        setTimeout(updatePFTriangle, 400);
    }

    /* --- 9. Load Factor Curve --- */
    function drawLFCurve() {
        const lfSvg = d3.select('#lf-curve-chart').append('svg')
            .attr('width', '100%').attr('height', '100%')
            .attr('viewBox', '0 0 300 160');
        
        const lfData = [];
         let maxCost = 0;
        // Cost/Unit = (a/LF·Pmax) + b
        // Simplification for graphing
        for(let lf = 0.1; lf <= 1.0; lf+=0.05) {
            const cost = 10 / lf + 5; // Fake scaling showing inverse relation
            lfData.push({x: lf, y: cost});
            if (cost > maxCost) maxCost = cost;
        }

        const xScale = d3.scaleLinear().domain([0.1, 1.0]).range([30, 280]);
        const yScale = d3.scaleLinear().domain([5, maxCost]).range([140, 20]);

        const line = d3.line().x(d => xScale(d.x)).y(d => yScale(d.y)).curve(d3.curveMonotoneX);

        lfSvg.append('path').datum(lfData)
            .attr('fill', 'none').attr('stroke', '#00ff88').attr('stroke-width', 3)
            .attr('d', line);
            
        lfSvg.append('g').attr('class', 'm13-axis').attr('transform', `translate(0, 140)`).call(d3.axisBottom(xScale).ticks(5));
        lfSvg.append('g').attr('class', 'm13-axis').attr('transform', `translate(30, 0)`).call(d3.axisLeft(yScale).ticks(3).tickFormat(d=>''));
        
        lfSvg.append('text').attr('x', 150).attr('y', 155).attr('text-anchor', 'middle').attr('fill','#9ca3af').attr('font-size','10px').text('Load Factor (LF)');
        lfSvg.append('text').attr('x', -80).attr('y', 15).attr('transform', 'rotate(-90)').attr('text-anchor', 'middle').attr('fill','#9ca3af').attr('font-size','10px').text('Cost per Unit');
    }
    drawLFCurve();


    /* --- 10. Flashcards System --- */
    const flashcards = [
        { q: "Standing Cost Formula?", a: "$a + bkW$" },
        { q: "1 kWh in Joules?", a: "$3.6 \\times 10^6 \\text{ J}$" },
        { q: "Straight Line Depreciation $d$?", a: "$(P - S) / n$" },
        { q: "Declining Balance $x$?", a: "$1 - (S/P)^{1/n}$" },
        { q: "Sinking Fund Formula $q$?", a: "$(P-S) \\times [r/((1+r)^n-1)]$" },
        { q: "General / Doherty Rate Formula?", a: "$z = ax + by + c$" },
        { q: "Hopkinson demand tariff is also known as?", a: "Two part tariff" },
        { q: "Fixed cost depends on?", a: "Neither demand nor energy output" },
        { q: "Semi-fixed cost depends on?", a: "Maximum demand only" },
        { q: "Running cost depends on?", a: "Both demand and energy output" },
        { q: "What is Salvage Value ($S$)?", a: "Value at the end of useful life" },
        { q: "TOD tariff is also known as?", a: "TOU (Time of Usage) or STOD" },
        { q: "What is the advantage of Block Rate?", a: "Lower rate at higher levels of use" },
        { q: "Most accurate tariff structure?", a: "Three part (Doherty) tariff" },
        { q: "How to improve Power Factor?", a: "Add Capacitor Banks ($Q_c$)" }
    ];

    let fcCurrent = 0;
    const fcQ = document.getElementById('fc-question');
    const fcA = document.getElementById('fc-answer');
    const fcTracker = document.getElementById('fc-tracker');
    const flashcardEl = document.getElementById('m13-flashcard');

    function renderFlashcard() {
        if(!fcQ) return;
        // Flip front if back
        flashcardEl.classList.remove('flipped');
        
        setTimeout(() => {
            fcQ.innerHTML = flashcards[fcCurrent].q;
            fcA.innerHTML = flashcards[fcCurrent].a;
            
            // Trigger MathJax/KaTeX
            if(window.renderMathInElement) {
                renderMathInElement(fcQ, { delimiters: [{left: "$", right: "$", display: false}] });
                renderMathInElement(fcA, { delimiters: [{left: "$", right: "$", display: false}] });
            }
            fcTracker.innerText = `${fcCurrent + 1} / ${flashcards.length}`;
        }, 150); // wait for flip back anim
    }

    if(flashcardEl) {
        flashcardEl.addEventListener('click', () => {
            flashcardEl.classList.toggle('flipped');
        });

        document.getElementById('fc-prev').addEventListener('click', () => {
            fcCurrent = (fcCurrent - 1 + flashcards.length) % flashcards.length;
            renderFlashcard();
        });

        document.getElementById('fc-next').addEventListener('click', () => {
            fcCurrent = (fcCurrent + 1) % flashcards.length;
            renderFlashcard();
        });

        renderFlashcard();
    }
});
