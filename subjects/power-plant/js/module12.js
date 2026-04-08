// power-plant/js/module12.js

document.addEventListener("DOMContentLoaded", () => {
    // ---------------------------------
    // Initialize KaTeX Auto-Render
    // ---------------------------------
    if (window.renderMathInElement) {
        window.renderMathInElement(document.body, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false}
            ],
            throwOnError: false
        });
    }

    // ---------------------------------
    // Tabs switching
    // ---------------------------------
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Find parent animation zone
            const zone = this.closest('.anim-zone');
            zone.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            zone.querySelectorAll('.anim-content').forEach(c => c.style.display = 'none');
            
            this.classList.add('active');
            const targetId = this.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.style.display = 'block';
        });
    });

    // ---------------------------------
    // 1. Wind Shear Calculator
    // ---------------------------------
    const shearH = document.getElementById('shear-h-slider');
    const shearVref = document.getElementById('shear-vref-slider');
    const shearHVal = document.getElementById('shear-h-val');
    const shearVrefVal = document.getElementById('shear-vref-val');
    const shearVhRes = document.getElementById('shear-vh-res');
    const shearPhRes = document.getElementById('shear-ph-res');

    function calcWindShear() {
        if(!shearH || !shearVref) return;
        const H = parseFloat(shearH.value);
        const Vref = parseFloat(shearVref.value);
        const Href = 10;
        const alpha = 1.0 / 7.0;

        const Vh = Vref * Math.pow(H / Href, alpha);
        const powerRatio = Math.pow(H / Href, 3.0 * alpha);

        shearHVal.textContent = H;
        shearVrefVal.textContent = Vref.toFixed(1);
        shearVhRes.textContent = Vh.toFixed(2) + " m/s";
        shearPhRes.textContent = powerRatio.toFixed(2) + " x Ref Power";

        // Update spinning speed visually of HAWT
        const hawtBlades = document.querySelector('.hawt-blades');
        if (hawtBlades) {
            // base speed ~ 3s, higher wind = faster spin (lower duration)
            let rawDuration = 6.0 / (Vh); 
            // Clamp
            rawDuration = Math.max(0.5, Math.min(rawDuration, 5));
            hawtBlades.style.animationDuration = `${rawDuration}s`;
        }
    }

    if (shearH) {
        shearH.addEventListener('input', calcWindShear);
        shearVref.addEventListener('input', calcWindShear);
        calcWindShear();
    }

    // ---------------------------------
    // 2. OTEC Dashboard
    // ---------------------------------
    const otecTw = document.getElementById('otec-tw-slider');
    const otecTc = document.getElementById('otec-tc-slider');
    const valTw = document.getElementById('otec-tw-val');
    const valTc = document.getElementById('otec-tc-val');
    const dtLabel = document.getElementById('otec-dt-label');
    const dtBar = document.getElementById('otec-dt-bar');
    const carnotRes = document.getElementById('otec-carnot-res');
    const actualRes = document.getElementById('otec-actual-res');
    const otecStatus = document.getElementById('otec-status');

    function calcOTEC() {
        if(!otecTw) return;
        const Tw = parseFloat(otecTw.value);
        const Tc = parseFloat(otecTc.value);

        valTw.textContent = Tw.toFixed(1);
        valTc.textContent = Tc.toFixed(1);

        const dT = Tw - Tc;
        dtLabel.innerHTML = `$\\Delta T = ${dT.toFixed(1)}^{\\circ}\\text{C}$`;

        // Update bar width (max practical dT ~ 30)
        let pct = (dT / 30) * 100;
        // The bar logic requires updating the mask: right positioned
        if(dtBar) dtBar.style.width = `${100 - pct}%`;

        // Carnot Efficiency
        // T(K) = T(C) + 273.15
        const cCarnot = 1.0 - ((Tc + 273.15) / (Tw + 273.15));
        const pcCarnot = cCarnot * 100.0;
        const pcActual = pcCarnot * 0.5; // Approx

        carnotRes.textContent = pcCarnot.toFixed(2) + "%";
        actualRes.textContent = pcActual.toFixed(2) + "%";

        if (dT > 20) {
            otecStatus.textContent = "Viable Gradient (>20°C)";
            otecStatus.style.background = "#00ff88"; // green
            otecStatus.style.color = "#0e2a1d";
        } else {
            otecStatus.textContent = "Too Low for Viability";
            otecStatus.style.background = "#ef4444"; // red
            otecStatus.style.color = "#fff";
        }

        // Must re-render KaTeX for new dynamic content
        if(window.renderMathInElement) {
            window.renderMathInElement(dtLabel, {
                delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "$", right: "$", display: false}
                ]
            });
        }
    }

    if (otecTw) {
        otecTw.addEventListener('input', calcOTEC);
        otecTc.addEventListener('input', calcOTEC);
        // Defer KaTeX rendering until after DOM loads fully
        setTimeout(calcOTEC, 500); 
    }

    // ---------------------------------
    // 3. Tidal Calculator
    // ---------------------------------
    const tidalH = document.getElementById('tidal-h-slider');
    const tidalA = document.getElementById('tidal-a-slider');
    const tidalHVal = document.getElementById('tidal-h-val');
    const tidalAVal = document.getElementById('tidal-a-val');
    const tidalERes = document.getElementById('tidal-e-res');
    const tidalViable = document.getElementById('tidal-viable');

    function calcTidal() {
        if(!tidalH) return;
        const h = parseFloat(tidalH.value);
        const A_km = parseFloat(tidalA.value); // Area in km2
        
        tidalHVal.textContent = h.toFixed(1);
        tidalAVal.textContent = A_km.toFixed(1);

        // Convert A to m2
        const A = A_km * 1e6;
        const rho = 1025; // kg/m3
        const g = 9.81;

        // E = 1/2 * rho * g * A * h^2  [Joules]
        const E_joules = 0.5 * rho * g * A * Math.pow(h, 2);
        
        // Convert to MWh
        // 1 Joule = 2.77e-7 Wh => 2.77e-13 MWh
        // Or directly: J / (3600 * 10^6)
        const E_MWh = E_joules / (3600 * 1e6);

        tidalERes.textContent = E_MWh.toFixed(1) + " MWh";

        if (h > 5) {
            tidalViable.textContent = "Excellent Site (h > 5m)";
            tidalViable.style.color = "#00ff88";
        } else {
            tidalViable.textContent = "Not Viable (h < 5m)";
            tidalViable.style.color = "#ef4444";
        }
    }

    if(tidalH) {
        tidalH.addEventListener('input', calcTidal);
        tidalA.addEventListener('input', calcTidal);
        calcTidal();
    }
    // ---------------------------------
    // 4. Tidal Barrage Live Calc
    // ---------------------------------
    const barrageHSlider = document.getElementById('barrage-h-slider');
    const barrageHVal = document.getElementById('barrage-h-val');
    const barrageELive = document.getElementById('barrage-e-live');

    function calcBarrage() {
        if (!barrageHSlider) return;
        const h = parseFloat(barrageHSlider.value);
        barrageHVal.textContent = h;
        // Mock energy calculation for visual E = 10 * h^2
        const E = 10 * Math.pow(h, 2);
        barrageELive.innerHTML = `E = ${E.toFixed(0)} kWh <span style="font-size:9px">(scales h²)</span>`;
        
        // Visual Head adjustment (water drop)
        const sea = document.querySelector('.sea-level-anim');
        if (sea) {
            sea.style.animationDuration = Math.max(2, 20 - h) + 's';
        }
    }
    
    if (barrageHSlider) {
        barrageHSlider.addEventListener('input', calcBarrage);
        calcBarrage();
    }

    // ---------------------------------
    // 5. Basin Graph Toggle
    // ---------------------------------
    const btnSingle = document.getElementById('btn-single-basin');
    const btnDouble = document.getElementById('btn-double-basin');
    const basinGraph = document.getElementById('basin-power-graph');
    const basinStatus = document.getElementById('basin-status-badge');

    function drawBasinGraph(type) {
        if (!basinGraph) return;
        basinGraph.innerHTML = ''; // clear
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-width', '4');

        if (type === 'single') {
            // Square wave with gaps
            path.setAttribute('d', 'M 0,80 L 40,80 L 40,20 L 100,20 L 100,80 L 160,80 L 160,20 L 220,20 L 220,80 L 300,80');
            path.setAttribute('stroke', '#60a5fa');
            basinStatus.textContent = "Intermittent Power (Gaps)";
            basinStatus.style.background = "rgba(96,165,250,0.2)";
            basinStatus.style.color = "#60a5fa";
        } else {
            // Continuous wavy line
            path.setAttribute('d', 'M 0,40 Q 30,20 60,40 T 120,40 T 180,40 T 240,40 T 300,40');
            path.setAttribute('stroke', '#00f5ff');
            basinStatus.textContent = "Continuous Power Output";
            basinStatus.style.background = "rgba(0,245,255,0.2)";
            basinStatus.style.color = "#00f5ff";
        }
        
        // Add animated drawing
        const len = 400; // rough path length
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        path.style.transition = 'stroke-dashoffset 2s ease-in-out';
        
        basinGraph.appendChild(path);
        
        // Trigger reflow to start animation
        path.getBoundingClientRect();
        path.style.strokeDashoffset = '0';
    }

    if (btnSingle) {
        btnSingle.addEventListener('click', () => drawBasinGraph('single'));
        btnDouble.addEventListener('click', () => drawBasinGraph('double'));
        // init
        drawBasinGraph('single');
    }

    // ---------------------------------
    // 6. Tidal Turbine Speed (12G)
    // ---------------------------------
    const headSliderG = document.getElementById('m12g-head-slider');
    function updateTurbineSpeed() {
        if (!headSliderG) return;
        const val = parseInt(headSliderG.value);
        // Map 10-100 to 4.0s - 0.4s
        const duration = (105 - val) / 25; 
        
        document.querySelectorAll('.kaplan-blades-group, .propeller-blades-group, .bulb-blades-group')
            .forEach(el => el.style.animationDuration = `${duration}s`);
    }
    
    if (headSliderG) {
        headSliderG.addEventListener('input', updateTurbineSpeed);
        updateTurbineSpeed();
    }
}); // End DOMContentLoaded

// Global Functions Setup for Inline Event Handlers
window.triggerCorrosion = window.triggerCorrosion || function() {
    const anode = document.getElementById('zinc-anode');
    const rustGroup = document.getElementById('rust-particles');
    const label = document.getElementById('corrosion-label');
    
    if (!anode || !rustGroup) return;
    
    // Clear old rust
    rustGroup.innerHTML = '';
    
    // Anode shrinks/corrodes
    gsap.to(anode, { scaleX: 0.2, scaleY: 0.5, duration: 2, ease: "power1.inOut" });
    
    // Dust particles near anode
    for(let i=0; i<10; i++) {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', 105 + Math.random()*15);
        c.setAttribute('cy', 80 + Math.random()*30);
        c.setAttribute('r', Math.random()*2+1);
        c.setAttribute('fill', '#facc15');
        rustGroup.appendChild(c);
        
        gsap.to(c, {
            x: (Math.random()-0.5)*50,
            y: Math.random()*50,
            opacity: 0,
            duration: 1.5 + Math.random(),
            ease: "circ.out"
        });
    }
    
    label.textContent = "Zn completely oxidized. Steel intact.";
    
    // Reset after 4s
    setTimeout(() => {
        gsap.to(anode, { scaleX: 1, scaleY: 1, duration: 1 });
        label.textContent = "Zn Anode Corroding (Steel protected)";
    }, 4000);
};

window.checkTidalQ = window.checkTidalQ || function(btn, isCorrect) {
    if(isCorrect) {
        btn.style.background = "#00ff88";
        btn.style.color = "#0e2a1d";
        btn.textContent = "Correct! ✓";
    } else {
        btn.style.background = "#ef4444";
        btn.style.color = "#fff";
        btn.textContent = "Incorrect ✗";
    }
    // Switch question after 1.5s
    setTimeout(() => {
        const qText = document.getElementById('tidal-quiz-question');
        if(!qText) return;
        qText.innerHTML = "What turbine is best for tidal barrage? <br><span style='font-size:12px; font-weight:normal; color:#9ca3af;'>(Kaplan/Bulb vs Pelton)</span>";
        
        const btns = document.querySelectorAll('#m12-master-quiz .q-btn');
        if(btns.length > 1) {
            btns[0].textContent = "Kaplan/Bulb";
            btns[0].style.background = "transparent";
            btns[0].style.color = "#00f5ff";
            btns[0].onclick = () => window.checkTidalQ(btns[0], true);
            
            btns[1].textContent = "Pelton";
            btns[1].style.background = "transparent";
            btns[1].style.color = "#00f5ff";
            btns[1].onclick = () => window.checkTidalQ(btns[1], false);
        }
    }, 1500);
};
