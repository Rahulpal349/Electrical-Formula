document.addEventListener('DOMContentLoaded', () => {
    // === Initialize GSAP ===
    gsap.registerPlugin(ScrollTrigger);

    // === Global Tab Logic ===
    document.querySelectorAll('.tabs').forEach(tabGroup => {
        tabGroup.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab')) {
                const group = e.target.parentElement;
                group.querySelector('.active').classList.remove('active');
                e.target.classList.add('active');
                const tabName = e.target.getAttribute('data-tab');
                const cardId = group.parentElement.id;
                updateAnimation(cardId, tabName);
            }
        });
    });

    function updateAnimation(cardId, tabName) {
        console.log(`Updating ${cardId} to ${tabName}`);
        // Handle specific tab transitions here if needed
        if (cardId === 'card-3') {
            if (tabName === 'map') initIndiaMap();
            if (tabName === 'world') initWorldChart();
            if (tabName === 'proscons') initProsConsRadar();
        }
        if (cardId === 'card-2') {
            if (tabName === 'plant') initGeoPlant();
            if (tabName === 'rankine') initRankineDiagram();
            if (tabName === 'apps') initTempThreshold();
        }
    }

    // === CARD 1: Geothermal Resources & Earth Section ===
    const geoResZone = d3.select('#animation-geo-resources');
    const geoWidth = geoResZone.node().getBoundingClientRect().width || 400;
    const geoHeight = 260;

    const geoSvg = geoResZone.append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${geoWidth} ${geoHeight}`);

    function initEarthSection() {
        geoSvg.selectAll('*').remove();
        
        const layers = [
            { name: 'Core', color: '#ef4444', r: 40, temp: 6000 },
            { name: 'Lower Mantle', color: '#f97316', r: 80, temp: 3000 },
            { name: 'Upper Mantle', color: '#fbbf24', r: 120, temp: 1000 },
            { name: 'Crust', color: '#9ca3af', r: 140, temp: 500 },
            { name: 'Surface', color: '#22c55e', r: 145, temp: 25 }
        ];

        const centerX = geoWidth / 2;
        const centerY = geoHeight + 50; // Semi-circle view

        layers.reverse().forEach(layer => {
            geoSvg.append('circle')
                .attr('cx', centerX)
                .attr('cy', centerY)
                .attr('r', layer.r * (geoHeight / 150))
                .attr('fill', layer.color)
                .attr('stroke', 'rgba(0,0,0,0.2)');
        });

        // Borehole line
        const borehole = geoSvg.append('line')
            .attr('x1', centerX)
            .attr('y1', centerY - (145 * (geoHeight / 150)))
            .attr('x2', centerX)
            .attr('y2', centerY - (140 * (geoHeight / 150)))
            .attr('stroke', '#facc15')
            .attr('stroke-width', 4);

        // Gradient Calculator Interaction
        const depthSlider = document.getElementById('depth-slider');
        const tSurfaceInput = document.getElementById('t-surface');
        const tDepthResult = document.getElementById('t-depth-result');

        function updateGeoCalc() {
            const d = parseFloat(depthSlider.value);
            const ts = parseFloat(tSurfaceInput.value);
            const g = 30; // 30 C/km
            const td = ts + g * d;
            tDepthResult.innerText = `At ${d} km: T ≈ ${td.toFixed(1)}°C`;
            
            // Animate borehole
            const targetY = centerY - ( (145 - (d * 5)) * (geoHeight / 150) );
            borehole.attr('y2', Math.min(centerY, targetY));
        }

        depthSlider.addEventListener('input', updateGeoCalc);
        tSurfaceInput.addEventListener('input', updateGeoCalc);
        updateGeoCalc();
    }

    initEarthSection();

    // === CARD 2: Geothermal Power Plant ===
    const plantZone = d3.select('#animation-geo-plant');
    function initGeoPlant() {
        plantZone.selectAll('*').remove();
        const svg = plantZone.append('svg').attr('width', '100%').attr('height', '100%').attr('viewBox', '0 0 500 260');
        
        // Ground line
        svg.append('line').attr('x1', 0).attr('y1', 200).attr('x2', 500).attr('y2', 200).attr('stroke', '#4b5563').attr('stroke-width', 2);
        
        // Wells
        svg.append('rect').attr('x', 50).attr('y', 200).attr('width', 10).attr('height', 60).attr('fill', '#ef4444'); // Production
        svg.append('rect').attr('x', 440).attr('y', 200).attr('width', 10).attr('height', 60).attr('fill', '#60a5fa'); // Injection
        
        // Plant Components (simplified)
        svg.append('rect').attr('x', 40).attr('y', 140).attr('width', 30).attr('height', 40).attr('fill', '#374151'); // Flash
        svg.append('rect').attr('x', 150).attr('y', 80).attr('width', 60).attr('height', 40).attr('fill', '#1f2937'); // Turbine
        svg.append('circle').attr('id', 'turbine-spin').attr('cx', 180).attr('cy', 100).attr('r', 15).attr('fill', 'none').attr('stroke', '#facc15').attr('stroke-width', 2).attr('stroke-dasharray', '5,5');
        
        svg.append('rect').attr('x', 250).attr('y', 80).attr('width', 50).attr('height', 40).attr('fill', '#fbbf24'); // Alternator
        svg.append('rect').attr('x', 350).attr('y', 120).attr('width', 60).attr('height', 60).attr('fill', '#3b82f6').attr('opacity', 0.6); // Cooling Tower
        
        // Pipes & Flow
        const pipePath = "M 55 200 L 55 180 L 150 100 M 210 100 L 250 100 M 300 100 L 380 120 M 380 180 L 445 180 L 445 200";
        svg.append('path').attr('d', pipePath).attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.2)').attr('stroke-width', 3);
        
        const flow = svg.append('path').attr('d', pipePath).attr('fill', 'none').attr('stroke', '#f97316').attr('stroke-width', 3).attr('stroke-dasharray', '10,10');
        
        gsap.to(flow.node(), { strokeDashoffset: -100, repeat: -1, duration: 2, ease: "none" });
        gsap.to("#turbine-spin", { rotation: 360, transformOrigin: "center", repeat: -1, duration: 1.5, ease: "none" });
    }

    initGeoPlant();

    // Efficiency Calc
    const thInput = document.getElementById('t-high');
    const tlInput = document.getElementById('t-low');
    const etaResult = document.getElementById('eta-result');

    function updateEta() {
        const th = parseFloat(thInput.value) + 273.15;
        const tl = parseFloat(tlInput.value) + 273.15;
        const eta = (1 - tl / th) * 100;
        etaResult.innerText = `η_Carnot ≈ ${eta.toFixed(1)}%`;
    }
    thInput.addEventListener('input', updateEta);
    tlInput.addEventListener('input', updateEta);

    // === CARD 4: MHD Channel ===
    const mhdZone = d3.select('#animation-mhd-channel');
    function initMHDChannel() {
        mhdZone.selectAll('*').remove();
        const svg = mhdZone.append('svg').attr('width', '100%').attr('height', '100%').attr('viewBox', '0 0 500 260');
        
        // Channel
        svg.append('rect').attr('x', 50).attr('y', 60).attr('width', 400).attr('height', 140).attr('fill', '#1f2937').attr('stroke', '#374151');
        
        // Magnets
        svg.append('rect').attr('x', 50).attr('y', 20).attr('width', 400).attr('height', 40).attr('fill', '#3b82f6').attr('opacity', 0.8); // N
        svg.append('rect').attr('x', 50).attr('y', 200).attr('width', 400).attr('height', 40).attr('fill', '#ef4444').attr('opacity', 0.8); // S
        
        // Electric field arrows (B)
        for(let i=100; i<450; i+=100) {
            svg.append('line').attr('x1', i).attr('y1', 60).attr('x2', i).attr('y2', 200).attr('stroke', '#60a5fa').attr('stroke-width', 2).attr('marker-end', 'url(#arrow)');
        }

        // Plasma Flow
        const plasma = svg.append('rect').attr('x', 50).attr('y', 70).attr('width', 0).attr('height', 120).attr('fill', 'url(#plasma-grad)').attr('opacity', 0.6);
        gsap.to(plasma.node(), { width: 400, duration: 2, repeat: -1 });

        // Particles
        const particles = svg.append('g');
        function createParticle() {
            const isPos = Math.random() > 0.5;
            const p = particles.append('circle')
                .attr('cx', 50)
                .attr('cy', 70 + Math.random() * 120)
                .attr('r', 4)
                .attr('fill', isPos ? '#ef4444' : '#60a5fa');
            
            const v = parseFloat(document.getElementById('mhd-v').value);
            const b = parseFloat(document.getElementById('mhd-b').value);
            const duration = 4000 / v;
            
            gsap.to(p.node(), {
                x: 400,
                y: isPos ? -40 : 40, // Deviate based on Lorentz
                duration: duration,
                ease: "none",
                onComplete: () => p.remove()
            });
        }
        setInterval(createParticle, 200);

        // Gradient & Markers
        const defs = svg.append('defs');
        const grad = defs.append('linearGradient').attr('id', 'plasma-grad');
        grad.append('stop').attr('offset', '0%').attr('stop-color', '#f97316');
        grad.append('stop').attr('offset', '100%').attr('stop-color', 'transparent');
    }
    initMHDChannel();

    // MHD Calc
    const mhdB = document.getElementById('mhd-b');
    const mhdV = document.getElementById('mhd-v');
    const mhdRes = document.getElementById('mhd-emf-result');
    function updateMHD() {
        const b = parseFloat(mhdB.value);
        const v = parseFloat(mhdV.value);
        const d = 0.5; // assume 0.5m
        const e = b * v * d;
        mhdRes.innerText = `E = ${e.toFixed(0)} Volts (B=${b}T, v=${v}m/s)`;
    }
    mhdB.addEventListener('input', updateMHD);
    mhdV.addEventListener('input', updateMHD);

    // === CARD 3: India Map & World Chart ===
    const statsZone = d3.select('#animation-geo-stats');
    const indiaSites = [
        { name: "Puga Valley, Ladakh", lat: 33.2, lon: 78.4, t: 84 },
        { name: "Tattapani, MP", lat: 23.4, lon: 82.5, t: 90 },
        { name: "Manikaran, HP", lat: 32.0, lon: 77.3, t: 95 },
        { name: "Cambay, Gujarat", lat: 22.3, lon: 72.6, t: 80 },
        { name: "Bakreshwar, WB", lat: 23.9, lon: 87.4, t: 89 }
    ];

    function initIndiaMap() {
        statsZone.selectAll('*').remove();
        const svg = statsZone.append('svg').attr('width', '100%').attr('height', '100%').attr('viewBox', '0 0 400 260');
        svg.append('path').attr('d', "M180,20 L220,40 L230,100 L200,200 L120,220 L100,100 L130,50 Z").attr('fill', '#1f2937').attr('stroke', '#4b5563');
        svg.selectAll('.site').data(indiaSites).enter().append('circle')
            .attr('cx', d => (d.lon - 68) * 12 + 60).attr('cy', d => 260 - (d.lat - 8) * 8).attr('r', 5).attr('fill', 'var(--accent-geo)')
            .on('mouseover', function(e, d) { d3.select(this).attr('r', 8); });
    }

    function initWorldChart() {
        statsZone.selectAll('*').remove();
        const data = [{c:"USA",v:3700},{c:"IDN",v:2276},{c:"PHL",v:1918},{c:"TUR",v:1700}];
        const svg = statsZone.append('svg').attr('width', '100%').attr('height', '100%');
        svg.selectAll('rect').data(data).enter().append('rect').attr('x', 60).attr('y', (d,i)=>i*40+20).attr('height', 20).attr('fill', 'var(--accent-geo)').attr('width', 0).transition().attr('width', d => d.v/15);
        svg.selectAll('text').data(data).enter().append('text').attr('x', 5).attr('y', (d,i)=>i*40+35).attr('fill', 'white').attr('font-size', '10px').text(d => d.c);
    }
    initIndiaMap();

    // === CARD 2 Extras ===
    function initRankineDiagram() {
        plantZone.selectAll('*').remove();
        const svg = plantZone.append('svg').attr('width', '100%').attr('height', '100%').attr('viewBox', '0 0 400 260');
        svg.append('path').attr('d', "M50,200 Q150,50 250,50 L350,200 Z").attr('fill', 'none').attr('stroke', '#f97316');
        svg.append('text').attr('x', 180).attr('y', 40).attr('fill', 'white').attr('font-size', '10px').text("T-s Diagram");
    }

    function initTempThreshold() {
        plantZone.selectAll('*').remove();
        const svg = plantZone.append('svg').attr('width', '100%').attr('height', '100%');
        svg.append('rect').attr('x', 50).attr('y', 100).attr('width', 300).attr('height', 30).attr('fill', 'linear-gradient(90deg, #60a5fa, #fbbf24)');
        svg.append('line').attr('x1', 140).attr('y1', 90).attr('x2', 140).attr('y2', 140).attr('stroke', 'white');
        svg.append('text').attr('x', 60).attr('y', 80).attr('fill', '#60a5fa').attr('font-size', '10px').text("Below 90°C: Direct Heat");
        svg.append('text').attr('x', 240).attr('y', 80).attr('fill', '#fbbf24').attr('font-size', '10px').text("Above 90°C: Electricity");
    }

    // === CARD 5 Combined Cycle ===
    const combinedZone = d3.select('#animation-mhd-combined');
    function initCombinedCycle() {
        combinedZone.selectAll('*').remove();
        const svg = combinedZone.append('svg').attr('width', '100%').attr('height', '100%').attr('viewBox', '0 0 500 260');
        const comps = [{x:20,n:"MHD",c:'var(--accent-mhd)'},{x:140,n:"Boiler",c:'#f97316'},{x:260,n:"Turbine",c:'#fbbf24'}];
        svg.selectAll('.c').data(comps).enter().append('rect').attr('x', d=>d.x).attr('y', 100).attr('width', 80).attr('height', 50).attr('fill', d=>d.c).attr('rx', 5);
    }
    initCombinedCy    // === CARD 6: Master Quiz ===
    const questions = [
        { q: "Most abundant geothermal source?", a: ["Hydrothermal", "Petrothermal", "Geopressured", "Volcanic"], c: 1 },
        { q: "Typical efficiency of geothermal plants?", a: ["30-40%", "7-10%", "2-5%", "50-60%"], c: 1 },
        { q: "Best seeding agent for MHD?", a: ["Potassium", "Sodium", "Cesium", "Argon"], c: 2 },
        { q: "MHD gas velocity required?", a: ["100 m/s", "500 m/s", "1000 m/s", "5000 m/s"], c: 2 },
        { q: "India's most promising geothermal site?", a: ["Cambay", "Puga Valley", "Tattapani", "Bakreshwar"], c: 1 },
        { q: "Lorentz Force formula?", a: ["F = ma", "F = qvB", "F = BIL", "F = qE"], c: 1 },
        { q: "MHD output power is proportional to?", a: ["v", "v²", "√v", "1/v"], c: 1 },
        { q: "Geothermal gradient (°C/km)?", a: ["10-15", "25-30", "50-60", "100+"], c: 1 },
        { q: "MHD Combined cycle efficiency?", a: ["40%", "58%", "80%", "95%"], c: 1 },
        { q: "Cesium is used in MHD to increase?", a: ["Velocity", "Temperature", "Conductivity", "Pressure"], c: 2 }
    ];

    let currentQ = 0;
    const qText = document.getElementById('quiz-question');
    const qOptions = document.getElementById('quiz-options');
    const startBtn = document.getElementById('start-quiz-btn');
quiz-btn');

    function loadQuestion() {
        if (currentQ >= questions.length) {
            qText.innerText = "Quiz Completed! Well done.";
            qOptions.innerHTML = `<button class="tab" onclick="location.reload()" style="grid-column: span 2; background: var(--accent-geo); opacity: 1;">Restart</button>`;
            return;
        }
        const data = questions[currentQ];
        qText.innerText = `Q${currentQ + 1}: ${data.q}`;
        qOptions.innerHTML = '';
        data.a.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'tab';
            btn.style.opacity = '1';
            btn.innerText = opt;
            btn.onclick = () => {
                if (i === data.c) {
                    btn.style.background = '#22c55e';
                    setTimeout(() => { currentQ++; loadQuestion(); }, 500);
                } else {
                    btn.style.background = '#ef4444';
                }
            };
            qOptions.appendChild(btn);
        });
    }

    startBtn.onclick = () => loadQuestion();

    // === Copy LaTeX Logic ===
    document.querySelectorAll('.footer-btn').forEach(btn => {
        if (btn.innerText.includes('Copy LaTeX')) {
            btn.onclick = () => {
                const formula = btn.closest('.card').querySelector('.formula-zone').innerText;
                navigator.clipboard.writeText(formula).then(() => {
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '✅ Copied!';
                    setTimeout(() => btn.innerHTML = originalText, 2000);
                });
            };
        }
        if (btn.innerText.includes('Calculator')) {
            btn.onclick = () => {
                btn.closest('.card').querySelector('.calculator').scrollIntoView({ behavior: 'smooth', block: 'center' });
            };
        }
    });

    // === Final Entrance Stagger ===
    gsap.from(".card", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power4.out",
        scrollTrigger: {
            trigger: ".card-grid",
            start: "top 85%"
        }
    });
});
