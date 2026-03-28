// js/signals.js

document.addEventListener("DOMContentLoaded", () => {
    // Check if we are on the signals page
    if (document.body.dataset.pageCategory !== 'signals') return;

    // --- Sidebar Scrollspy & Smooth Scroll ---
    const sections = document.querySelectorAll('.module-section');
    const navLinks = document.querySelectorAll('.sidebar .nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // --- Core Initializations ---
    try { initPeriodicAnim(); } catch (e) { console.error(e); }
    try { initEnergyPowerAnim(); } catch (e) { console.error(e); }
    try { initEvenOddAnim(); } catch (e) { console.error(e); }
    try { initElementarySignals(); } catch (e) { console.error(e); }
    try { initTransformations(); } catch (e) { console.error(e); }
    try { initSystemProps(); } catch (e) { console.error(e); }
    try { initConvolution(); } catch (e) { console.error(e); }
    try { initFourierSynthesis(); } catch (e) { console.error(e); }
    try { initFTDemo(); } catch (e) { console.error(e); }
    try { initFFTButterfly(); } catch (e) { console.error(e); }
    try { initSPlane(); } catch (e) { console.error(e); }
    try { initZPlane(); } catch (e) { console.error(e); }
    try { initAliasingDemo(); } catch (e) { console.error(e); }
    try { initStateSpace(); } catch (e) { console.error(e); }
    try { initFilterDesign(); } catch (e) { console.error(e); }
});

// Helper for D3 generic setup
function setupD3SVG(containerId, margin = { top: 20, right: 20, bottom: 30, left: 40 }) {
    const container = d3.select(containerId);
    if (container.empty()) return null;
    container.html(''); // Clear existing

    // Explicit sizing
    const width = container.node().clientWidth || 400;
    const height = container.node().clientHeight || 250;

    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
        
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        
    return { svg, g, width: width - margin.left - margin.right, height: height - margin.top - margin.bottom, fullW: width, fullH: height };
}

// 1.2 Periodic Animation
function initPeriodicAnim() {
    const canvas = document.getElementById("periodic-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let t = 0;
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.beginPath(); ctx.moveTo(0, canvas.height/2); ctx.lineTo(canvas.width, canvas.height/2); ctx.stroke();
        
        // Continuous Time (Cyan)
        ctx.strokeStyle = "#00f5ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let x=0; x<canvas.width; x++) {
            let y = canvas.height/2 - 40 * Math.sin((x - t*50) * 0.05);
            if(x===0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Discrete Time (Purple dots)
        ctx.fillStyle = "#bf00ff";
        for(let x=0; x<canvas.width; x+=15) {
            let y = canvas.height/2 + 60 - 40 * Math.sin((x - t*50) * 0.05);
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI*2);
            ctx.fill();
        }
        
        t += 0.02;
        requestAnimationFrame(draw);
    }
    draw();
}

// 1.3 Energy/Power
function initEnergyPowerAnim() {
    const d3ctx = setupD3SVG("#energy-power-anim-container");
    if(!d3ctx) return;
    
    const {g, width, height} = d3ctx;
    const x = d3.scaleLinear().domain([-5, 5]).range([0, width]);
    const y = d3.scaleLinear().domain([-2, 2]).range([height, 0]);
    
    // Axes
    g.append("g").attr("transform", `translate(0,${y(0)})`).call(d3.axisBottom(x)).attr("color", "#94a3b8");
    g.append("g").attr("transform", `translate(${x(0)},0)`).call(d3.axisLeft(y)).attr("color", "#94a3b8");
    
    const path = g.append("path").attr("fill", "none").attr("stroke-width", 2);
    const area = g.append("path").attr("fill", "rgba(0, 245, 255, 0.2)").attr("stroke", "none");
    
    window.setEnergyMode = function(mode) {
        const data = d3.range(-5, 5, 0.1).map(d => {
            if(mode === 'energy') return {x: d, y: d < 0 ? 0 : Math.exp(-0.8*d)}; // Exponential
            else return {x: d, y: Math.sin(Math.PI * d)}; // Sine wave
        });
        
        const line = d3.line().x(d => x(d.x)).y(d => y(d.y));
        const areaGen = d3.area().x(d => x(d.x)).y0(y(0)).y1(d => y(Math.pow(d.y, 2))); // Area is |x|^2
        
        path.datum(data).transition().duration(500).attr("d", line).attr("stroke", mode==='energy' ? '#00f5ff' : '#00ff88');
        area.datum(data).transition().duration(500).attr("d", areaGen).attr("fill", mode==='energy' ? 'rgba(0,245,255,0.3)' : 'rgba(0,255,136,0.3)');
    };
    window.setEnergyMode('energy');
}

// 1.4 Even/Odd Decomposition
function initEvenOddAnim() {
    const d3ctx = setupD3SVG("#even-odd-anim-container", {top:10, right:10, bottom:10, left:20});
    if(!d3ctx) return;
    const {g, width, height} = d3ctx;
    
    const x = d3.scaleLinear().domain([-3, 3]).range([0, width]);
    const y = d3.scaleLinear().domain([-2, 2]).range([height, 0]);
    
    g.append("g").attr("transform", `translate(0,${y(0)})`).call(d3.axisBottom(x)).attr("color", "#555");
    g.append("g").attr("transform", `translate(${x(0)},0)`).call(d3.axisLeft(y)).attr("color", "#555");
    
    // original Signal (step-like pulse right sided)
    const points = d3.range(-3, 3.1, 0.1).map(t => ({t: t, v: t >= 0 && t <= 2 ? 1-t*0.2 : 0}));
    
    const line = d3.line().x(d => x(d.t)).y(d => y(d.v));
    const lineE = d3.line().x(d => x(d.t)).y(d => y((d.v + (d.t <= 0 && d.t >= -2 ? 1-(-d.t)*0.2 : 0))/2));
    const lineO = d3.line().x(d => x(d.t)).y(d => y((d.v - (d.t <= 0 && d.t >= -2 ? 1-(-d.t)*0.2 : 0))/2));
    
    g.append("path").datum(points).attr("stroke", "#00f5ff").attr("fill","none").attr("stroke-width",3).attr("d", line);
    g.append("path").datum(points).attr("stroke", "#fbbf24").attr("fill","none").attr("stroke-width",2).attr("stroke-dasharray","4,4").attr("d", lineE);
    g.append("path").datum(points).attr("stroke", "#fb7185").attr("fill","none").attr("stroke-width",2).attr("stroke-dasharray","4,4").attr("d", lineO);
    
    g.append("text").attr("x", width-60).attr("y", 20).attr("fill", "#00f5ff").text("x(t)");
    g.append("text").attr("x", width-60).attr("y", 40).attr("fill", "#fbbf24").text("Even");
    g.append("text").attr("x", width-60).attr("y", 60).attr("fill", "#fb7185").text("Odd");
}

// 1.5 Elementary Signals
function initElementarySignals() {
    const d3ctx = setupD3SVG("#elementary-anim-container");
    if(!d3ctx) return;
    const {g, width, height} = d3ctx;
    
    const x = d3.scaleLinear().domain([-3, 3]).range([0, width]);
    const y = d3.scaleLinear().domain([-1.5, 1.5]).range([height, 0]);
    
    g.append("g").attr("transform", `translate(0,${y(0)})`).call(d3.axisBottom(x)).attr("color", "#555");
    g.append("g").attr("transform", `translate(${x(0)},0)`).call(d3.axisLeft(y)).attr("color", "#555");
    
    const path = g.append("path").attr("stroke", "#00f5ff").attr("fill", "none").attr("stroke-width", 3);
    
    window.drawElemSignal = function(type) {
        let pts = [];
        for(let t=-3; t<=3; t+=0.05) {
            let v = 0;
            if(type === 'impulse') v = (Math.abs(t) < 0.05) ? 1.5 : 0;
            if(type === 'step') v = (t >= 0) ? 1 : 0;
            if(type === 'rect') v = (Math.abs(t) <= 1) ? 1 : 0;
            if(type === 'sinc') v = (t===0) ? 1 : Math.sin(Math.PI*t)/(Math.PI*t);
            pts.push({t, v});
        }
        let line = d3.line().x(d => x(d.t)).y(d => y(d.v));
        if(type==='step' || type==='rect') line.curve(d3.curveStepAfter);
        else line.curve(d3.curveLinear);
        
        path.datum(pts).transition().duration(200).attr("d", line);
    };
    window.drawElemSignal('step');
}

// 1.6 Transformations
function initTransformations() {
    const d3ctx = setupD3SVG("#transform-anim-container");
    if(!d3ctx) return;
    const {g, width, height} = d3ctx;
    
    const x = d3.scaleLinear().domain([-5, 5]).range([0, width]);
    const y = d3.scaleLinear().domain([-0.5, 1.5]).range([height, 0]);
    
    g.append("g").attr("transform", `translate(0,${y(0)})`).call(d3.axisBottom(x)).attr("color", "#555");
    
    const origPath = g.append("path").attr("stroke", "rgba(0, 245, 255, 0.3)").attr("fill", "none").attr("stroke-width", 2);
    const transPath = g.append("path").attr("stroke", "#00f5ff").attr("fill", "rgba(0,245,255,0.2)").attr("stroke-width", 3);
    
    let isFlipped = false;
    
    function updateTransform() {
        const b = parseFloat(document.getElementById('shift-slider').value);
        const a = parseFloat(document.getElementById('scale-slider').value) * (isFlipped ? -1 : 1);
        
        let origPts = d3.range(-5, 5, 0.05).map(t => {
            // Original triangle pulse from -1 to 1
            let v = 0;
            if(t >= -1 && t <= 0) v = t + 1;
            else if(t > 0 && t <= 1) v = 1 - t;
            return {t, v};
        });
        
        let transPts = d3.range(-5, 5, 0.05).map(t => {
            // y(t) = x(at - b) -> we need the value of x at (a*t - b)
            let tau = a*t - b;
            let v = 0;
            if(tau >= -1 && tau <= 0) v = tau + 1;
            else if(tau > 0 && tau <= 1) v = 1 - tau;
            return {t, v};
        });
        
        const line = d3.line().x(d => x(d.t)).y(d => y(d.v));
        origPath.datum(origPts).attr("d", line);
        transPath.datum(transPts).attr("d", line);
    }
    
    document.getElementById('shift-slider').addEventListener('input', updateTransform);
    document.getElementById('scale-slider').addEventListener('input', updateTransform);
    window.toggleTimeReversal = function() { isFlipped = !isFlipped; updateTransform(); };
    updateTransform();
}

// 2.1 System Properties Grid
function initSystemProps() {
    const grid = document.getElementById("sys-prop-grid");
    if(!grid) return;
    const props = ["Linear", "Time-Invariant", "Causal", "Stable", "Memoryless", "Invertible"];
    props.forEach(p => {
        let div = document.createElement('div');
        div.style.cssText = "background:rgba(255,255,255,0.05); padding:10px; border-radius:6px; text-align:center; color:#94a3b8; font-size:0.85rem; border:1px solid transparent; cursor:pointer;";
        div.innerHTML = `<i class="fas fa-check-circle" style="color:#00ff88; display:none; margin-right:5px;"></i> ${p}`;
        
        // Interactive Toggle just for visual
        div.onclick = () => {
             const icon = div.querySelector('i');
             const isActive = icon.style.display !== 'none';
             icon.style.display = isActive ? 'none' : 'inline-block';
             div.style.borderColor = isActive ? 'transparent' : '#00ff88';
             div.style.color = isActive ? '#94a3b8' : '#fff';
        };
        grid.appendChild(div);
    });
}

// 2.2 Convolution Animation (Placeholder for GSAP logic)
function initConvolution() {
    const d3ctx = setupD3SVG("#convolution-anim-container");
    if(!d3ctx) return;
    const {svg, g, width, height} = d3ctx;

    // Fixed boxes
    g.append("rect").attr("x", 50).attr("y", height/2-20).attr("width", 60).attr("height", 40).attr("fill", "#00ff88").attr("opacity", 0.5);
    g.append("text").attr("x", 80).attr("y", height/2+5).attr("text-anchor", "middle").attr("fill", "#fff").text("x(τ)");

    const hBox = g.append("rect").attr("x", 250).attr("y", height/2-20).attr("width", 50).attr("height", 30).attr("fill", "#bf00ff").attr("opacity", 0.7);
    const hText = g.append("text").attr("x", 275).attr("y", height/2+2).attr("text-anchor", "middle").attr("fill", "#fff").text("h(τ)");

    window.stepConvolution = function(step) {
        if(step === 'flip') {
            gsap.to(hBox.node(), {duration: 1, scaleX: -1, transformOrigin: "50% 50%"});
            hText.text("h(-τ)");
        } else if(step === 'slide') {
            gsap.fromTo(hBox.node(), {x: 250}, {duration: 4, x: -100, ease: "linear"});
            gsap.fromTo(hText.node(), {x: 275}, {duration: 4, x: -75, ease: "linear"});
            hText.text("h(t-τ)");
        } else if(step === 'reset') {
            gsap.killTweensOf(hBox.node());
            gsap.killTweensOf(hText.node());
            gsap.set(hBox.node(), {scaleX: 1, x: 0});
            gsap.set(hText.node(), {x: 0});
            hText.text("h(τ)");
        }
    }
}

// 3.2 Fourier Series Synthesis
function initFourierSynthesis() {
    const d3ctx = setupD3SVG("#fs-anim-container");
    if(!d3ctx) return;
    const {g, width, height} = d3ctx;
    
    const x = d3.scaleLinear().domain([0, 2*Math.PI]).range([0, width]);
    const y = d3.scaleLinear().domain([-1.5, 1.5]).range([height, 0]);
    
    g.append("g").attr("transform", `translate(0,${y(0)})`).call(d3.axisBottom(x)).attr("color", "#555");
    
    // Ideal square wave
    const idealPts = d3.range(0, 2*Math.PI+0.1, 0.05).map(t => ({t, v: t < Math.PI ? 1 : -1}));
    const lineMap = d3.line().x(d => x(d.t)).y(d => y(d.v)).curve(d3.curveStepAfter);
    g.append("path").datum(idealPts).attr("d", lineMap).attr("stroke", "rgba(255,255,255,0.2)").attr("fill", "none").attr("stroke-width", 2);
    
    const synthPath = g.append("path").attr("fill", "none").attr("stroke", "#facc15").attr("stroke-width", 2);
    
    function drawSynth(N) {
        const pts = d3.range(0, 2*Math.PI, 0.05).map(t => {
            let v = 0;
            // Square wave Fourier series: 4/PI * sum(sin((2k-1)t)/(2k-1))
            for(let n=1; n<=N; n+=2) {
                v += (4/Math.PI) * Math.sin(n*t) / n;
            }
            return {t, v};
        });
        const curve = d3.line().x(d => x(d.t)).y(d => y(d.v));
        synthPath.datum(pts).attr("d", curve);
        document.getElementById('harmonics-val').innerText = N;
    }
    
    const slider = document.getElementById('harmonics-slider');
    if(slider) {
        slider.addEventListener('input', e => drawSynth(parseInt(e.target.value)));
        drawSynth(1);
    }
}

// 4.2 FT Demo Duality
function initFTDemo() {
    const d3ctx = setupD3SVG("#ft-anim-container");
    if(!d3ctx) return;
    const {g, width, height} = d3ctx;
    
    const midY = height/2;
    g.append("text").attr("x", width/2).attr("y", midY).attr("fill", "#f97316").attr("text-anchor", "middle").text("Fourier Transform Explorer (WIP)");
    // To be expanded
}

// 5.1 FFT Butterfly
function initFFTButterfly() {
    const d3ctx = setupD3SVG("#fft-anim-container");
    if(!d3ctx) return;
    const {g, width, height} = d3ctx;
    
    // Draw basic 4-point butterfly
    const nodes = [
        {id:'x0', x:50, y:50}, {id:'x2', x:50, y:100}, {id:'x1', x:50, y:150}, {id:'x3', x:50, y:200},
        {id:'s0', x:150, y:50}, {id:'s1', x:150, y:100}, {id:'s2', x:150, y:150}, {id:'s3', x:150, y:200},
        {id:'X0', x:250, y:50}, {id:'X1', x:250, y:100}, {id:'X2', x:250, y:150}, {id:'X3', x:250, y:200},
    ];
    
    const links = [
        // Stage 1
        {s:'x0', t:'s0'}, {s:'x0', t:'s1'}, {s:'x2', t:'s0'}, {s:'x2', t:'s1'},
        {s:'x1', t:'s2'}, {s:'x1', t:'s3'}, {s:'x3', t:'s2'}, {s:'x3', t:'s3'},
        // Stage 2
        {s:'s0', t:'X0'}, {s:'s2', t:'X0'}, {s:'s1', t:'X1'}, {s:'s3', t:'X1'},
        {s:'s0', t:'X2'}, {s:'s2', t:'X2'}, {s:'s1', t:'X3'}, {s:'s3', t:'X3'}
    ];
    
    const getNode = id => nodes.find(n => n.id === id);
    
    links.forEach(l => {
        const src = getNode(l.s), tgt = getNode(l.t);
        const isCross = src.y !== tgt.y;
        g.append("line").attr("x1", src.x).attr("y1", src.y).attr("x2", tgt.x).attr("y2", tgt.y).attr("stroke", isCross ? "rgba(191,0,255,0.8)" : "rgba(255,255,255,0.3)").attr("stroke-width", 2);
        if(isCross && src.x === 150) {
           g.append("text").attr("x", (src.x+tgt.x)/2).attr("y", (src.y+tgt.y)/2 - 5).attr("fill", "#bf00ff").attr("font-size", "10px").text("W");
        }
    });
    
    nodes.forEach(n => {
        g.append("circle").attr("cx", n.x).attr("cy", n.y).attr("r", 15).attr("fill", "#111827").attr("stroke", "#bf00ff").attr("stroke-width", 2);
        g.append("text").attr("x", n.x).attr("y", n.y+4).attr("text-anchor", "middle").attr("fill", "#fff").attr("font-size", "12px").text(n.id);
    });
}

// 6.1 S-Plane Explorer
function initSPlane() {
    const d3ctx = setupD3SVG("#splane-anim-container");
    if(!d3ctx) return;
    const {svg, g, width, height} = d3ctx;

    // Center axes
    const cx = width/2;
    const cy = height/2;
    
    // Axes
    g.append("line").attr("x1", 0).attr("y1", cy).attr("x2", width).attr("y2", cy).attr("stroke", "#555");
    g.append("line").attr("x1", cx).attr("y1", 0).attr("x2", cx).attr("y2", height).attr("stroke", "#555");
    g.append("text").attr("x", width-20).attr("y", cy-10).attr("fill", "#fff").text("σ");
    g.append("text").attr("x", cx+10).attr("y", 20).attr("fill", "#fff").text("jω");
    
    // ROC Region (LHP initially)
    const roc = g.append("rect").attr("x", 0).attr("y", 0).attr("width", cx-50).attr("height", height).attr("fill", "rgba(0,255,136,0.15)");
    
    // Poles
    let poleX = cx - 50; 
    let poleY = cy;
    
    const poleGrp = g.append("g").attr("transform", `translate(${poleX}, ${poleY})`).attr("cursor", "pointer");
    poleGrp.append("line").attr("x1", -8).attr("y1", -8).attr("x2", 8).attr("y2", 8).attr("stroke", "#ef4444").attr("stroke-width", 3);
    poleGrp.append("line").attr("x1", -8).attr("y1", 8).attr("x2", 8).attr("y2", -8).attr("stroke", "#ef4444").attr("stroke-width", 3);
    
    // Drag behavior
    const drag = d3.drag().on("drag", function(event) {
        let newX = Math.max(20, Math.min(width-20, poleX + event.x)); // allow dragging
        let newY = cy; // confine to real axis for simplicity
        poleGrp.attr("transform", `translate(${newX}, ${newY})`);
        
        // Update ROC 
        if(newX < cx) {
            roc.attr("x", newX).attr("width", width-newX).attr("fill", "rgba(0,255,136,0.15)"); // Causal Stable
        } else {
            roc.attr("x", newX).attr("width", width-newX).attr("fill", "rgba(239,68,68,0.15)"); // Causal Unstable
        }
    });
    
    // Quick patch - the d3 event holds coordinates relative to origin. 
    poleGrp.call(d3.drag()
        .on("drag", function(event) {
            const currentTr = d3.select(this).attr("transform");
            const coords = currentTr.match(/translate\\(([^,]+),\\s*([^)]+)\\)/);
            if(coords) {
                let nx = parseFloat(coords[1]) + event.dx;
                let ny = parseFloat(coords[2]) + event.dy;
                d3.select(this).attr("transform", `translate(${nx}, ${cy})`); // lock Y for now
                if(nx < cx) {
                    roc.attr("x", nx).attr("width", width-nx).attr("fill", "rgba(0,255,136,0.15)"); 
                } else {
                    roc.attr("x", nx).attr("width", width-nx).attr("fill", "rgba(239,68,68,0.15)"); 
                }
            }
        })
    );
}

// 7.1 Z-Plane Explorer
function initZPlane() {
    const d3ctx = setupD3SVG("#zplane-anim-container");
    if(!d3ctx) return;
    const {svg, g, width, height} = d3ctx;

    const cx = width/2;
    const cy = height/2;
    const r = Math.min(width, height) / 3;

    // Axes
    g.append("line").attr("x1", 0).attr("y1", cy).attr("x2", width).attr("y2", cy).attr("stroke", "#555");
    g.append("line").attr("x1", cx).attr("y1", 0).attr("x2", cx).attr("y2", height).attr("stroke", "#555");
    
    // Unit Circle
    g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", r).attr("fill", "none").attr("stroke", "#60a5fa").attr("stroke-width", 2).attr("stroke-dasharray", "5,5");

    // ROC donut
    const rocGrp = g.append("g");
    const arc = d3.arc().innerRadius(r*0.5).outerRadius(r*4).startAngle(0).endAngle(2*Math.PI);
    const rocPath = rocGrp.append("path").attr("d", arc()).attr("transform", `translate(${cx},${cy})`).attr("fill", "rgba(0,255,136,0.15)");

    // Pole
    const poleGrp = g.append("g").attr("transform", `translate(${cx + r*0.5}, ${cy})`).attr("cursor", "pointer");
    poleGrp.append("line").attr("x1", -8).attr("y1", -8).attr("x2", 8).attr("y2", 8).attr("stroke", "#ef4444").attr("stroke-width", 3);
    poleGrp.append("line").attr("x1", -8).attr("y1", 8).attr("x2", 8).attr("y2", -8).attr("stroke", "#ef4444").attr("stroke-width", 3);

    poleGrp.call(d3.drag()
        .on("drag", function(event) {
            const currentTr = d3.select(this).attr("transform");
            const coords = currentTr.match(/translate\\(([^,]+),\\s*([^)]+)\\)/);
            if(coords) {
                let nx = parseFloat(coords[1]) + event.dx;
                let ny = parseFloat(coords[2]) + event.dy;
                let dist = Math.sqrt(Math.pow(nx-cx, 2) + Math.pow(ny-cy, 2));
                
                d3.select(this).attr("transform", `translate(${nx}, ${ny})`); 
                
                // Update ROC mapping (assume Causal so ROC is |z| > |p|)
                const newArc = d3.arc().innerRadius(dist).outerRadius(r*4).startAngle(0).endAngle(2*Math.PI);
                rocPath.attr("d", newArc());
                
                if(dist < r) rocPath.attr("fill", "rgba(0,255,136,0.15)"); // Stable
                else rocPath.attr("fill", "rgba(239,68,68,0.15)"); // Unstable
            }
        })
    );
}

// 8.1 Aliasing
function initAliasingDemo() {
    const d3ctx = setupD3SVG("#aliasing-anim-container");
    if(!d3ctx) return;
    const {g, width, height} = d3ctx;

    const x = d3.scaleLinear().domain([-10, 10]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 2]).range([height, 0]);

    g.append("g").attr("transform", `translate(0,${y(0)})`).call(d3.axisBottom(x)).attr("color", "#555");
    g.append("text").attr("x", width-20).attr("y", y(0)-10).attr("fill", "#fff").text("f");

    // Triangle spectrum representing signal (f_max = 1)
    const basePts = [{f:-1, v:0}, {f:0, v:1.5}, {f:1, v:0}];

    const paths = [];
    for(let k=-3; k<=3; k++) {
        paths.push(g.append("path").attr("fill", k===0 ? "rgba(0,245,255,0.6)" : "rgba(255,255,255,0.2)"));
    }
    
    const overlapWarn = g.append("text").attr("x", width/2).attr("y", 30).attr("text-anchor", "middle").attr("fill", "#ef4444").attr("font-size", "18px").attr("font-weight", "bold").style("opacity", 0).text("ALIASING OCCURS");

    function renderAliasing(fs) {
        let isAliasing = fs < 2.0;
        overlapWarn.style("opacity", isAliasing ? 1 : 0);

        for(let k=-3; k<=3; k++) {
            let offset = k * fs;
            let pts = basePts.map(p => ({f: p.f + offset, v: p.v}));
            const line = d3.line().x(d => x(d.f)).y(d => y(d.v));
            paths[k+3].datum(pts).attr("d", line).attr("fill", k===0 ? "rgba(0,245,255,0.6)" : (isAliasing ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.2)"));
        }
        document.getElementById('fs-val').innerText = fs.toFixed(1);
    }

    const slider = document.getElementById('fs-slider');
    if(slider) {
        slider.addEventListener('input', e => renderAliasing(parseFloat(e.target.value)));
        renderAliasing(2.5);
    }
}

// 9.1 State Space
function initStateSpace() {
    const d3ctx = setupD3SVG("#statespace-anim-container");
    if(!d3ctx) return;
    const {g, width, height} = d3ctx;

    // Draw simple block diagram
    const cx = width/2, cy = height/2;
    
    // Nodes
    const sum1 = {x: cx-100, y: cy};
    const integ = {x: cx, y: cy};
    const sum2 = {x: cx+100, y: cy};
    
    g.append("circle").attr("cx", sum1.x).attr("cy", sum1.y).attr("r", 15).attr("fill", "none").attr("stroke", "#fff");
    g.append("text").attr("x", sum1.x).attr("y", sum1.y+5).attr("text-anchor", "middle").attr("fill", "#fff").text("+");

    g.append("rect").attr("x", integ.x-20).attr("y", integ.y-20).attr("width", 40).attr("height", 40).attr("fill", "rgba(167,139,250,0.2)").attr("stroke", "#a78bfa");
    g.append("text").attr("x", integ.x).attr("y", integ.y+5).attr("text-anchor", "middle").attr("fill", "#fff").text("∫");
    
    g.append("circle").attr("cx", sum2.x).attr("cy", sum2.y).attr("r", 15).attr("fill", "none").attr("stroke", "#fff");
    g.append("text").attr("x", sum2.x).attr("y", sum2.y+5).attr("text-anchor", "middle").attr("fill", "#fff").text("+");

    // Lines (Input u to sum1)
    g.append("line").attr("x1", sum1.x-60).attr("y1", sum1.y).attr("x2", sum1.x-15).attr("y2", sum1.y).attr("stroke", "#fff").attr("marker-end", "url(#arrow)");
    g.append("text").attr("x", sum1.x-40).attr("y", sum1.y-10).attr("fill", "#fff").text("u(t)").attr("text-anchor", "middle");

    // B matrix
    g.append("text").attr("x", sum1.x-25).attr("y", sum1.y+20).attr("fill", "#a78bfa").text("B");

    // sum1 to integr
    g.append("line").attr("x1", sum1.x+15).attr("y1", sum1.y).attr("x2", integ.x-20).attr("y2", integ.y).attr("stroke", "#fff").attr("marker-end", "url(#arrow)");
    g.append("text").attr("x", (sum1.x+integ.x)/2).attr("y", sum1.y-10).attr("fill", "#fff").text("ẋ(t)").attr("text-anchor", "middle");

    // integ to sum2
    g.append("line").attr("x1", integ.x+20).attr("y1", integ.y).attr("x2", sum2.x-15).attr("y2", integ.y).attr("stroke", "#fff").attr("marker-end", "url(#arrow)");
    g.append("text").attr("x", (integ.x+sum2.x)/2).attr("y", sum1.y-10).attr("fill", "#fff").text("x(t)").attr("text-anchor", "middle");

    // C matrix
    g.append("text").attr("x", sum2.x-25).attr("y", sum2.y+20).attr("fill", "#a78bfa").text("C");

    // sum2 to y
    g.append("line").attr("x1", sum2.x+15).attr("y1", sum2.y).attr("x2", sum2.x+60).attr("y2", sum2.y).attr("stroke", "#fff").attr("marker-end", "url(#arrow)");
    g.append("text").attr("x", sum2.x+40).attr("y", sum2.y-10).attr("fill", "#fff").text("y(t)").attr("text-anchor", "middle");

    // A feedback
    g.append("path").attr("d", `M ${integ.x+20} ${integ.y} L ${integ.x+20} ${integ.y+60} L ${sum1.x} ${integ.y+60} L ${sum1.x} ${sum1.y+15}`).attr("fill", "none").attr("stroke", "#fff").attr("marker-end", "url(#arrow)");
    g.append("rect").attr("x", (sum1.x+integ.x)/2-15).attr("y", integ.y+45).attr("width", 30).attr("height", 30).attr("fill", "rgba(167,139,250,0.2)").attr("stroke", "#a78bfa");
    g.append("text").attr("x", (sum1.x+integ.x)/2).attr("y", integ.y+65).attr("text-anchor", "middle").attr("fill", "#a78bfa").text("A");

    // Define arrow
    svg.append("defs").append("marker").attr("id", "arrow").attr("viewBox", "0 0 10 10")
        .attr("refX", 9).attr("refY", 5).attr("markerWidth", 5).attr("markerHeight", 5)
        .attr("orient", "auto-start-reverse").append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", "#fff");
}

// 10.1 Filter Design
function initFilterDesign() {
    const d3ctx = setupD3SVG("#filter-anim-container");
    if(!d3ctx) return;
    const {g, width, height} = d3ctx;

    const x = d3.scaleLinear().domain([0, Math.PI]).range([0, width]);
    const y = d3.scaleLinear().domain([-100, 10]).range([height, 0]);

    g.append("g").attr("transform", `translate(0,${y(0)})`).call(d3.axisBottom(x).tickValues([0, Math.PI/2, Math.PI]).tickFormat(d => d === 0 ? "0" : (d === Math.PI ? "π" : "π/2"))).attr("color", "#555");
    g.append("g").call(d3.axisLeft(y).ticks(5)).attr("color", "#555");
    g.append("text").attr("x", -10).attr("y", -10).attr("fill", "#fff").text("Magnitude (dB)");

    const path = g.append("path").attr("fill", "none").attr("stroke", "#fbbf24").attr("stroke-width", 2);

    window.setFilterWindow = function(winType) {
        let pts = [];
        // Approximate magnitude responses for ideal LPF using different windows
        // Rect: slowest rolloff, highest sidelobe (-13dB)
        // Hann: faster rolloff, lower sidelobe (-31dB)
        // Hamm: even lower sidelobe (-41dB)
        const N = 31; 
        for(let w=0; w<=Math.PI; w+=0.02) {
            let v = 0;
            let dW = Math.abs(w - Math.PI/2); // cutoff at PI/2
            if(winType === 'rect') {
                v = dW < 0.1 ? 0 : -13 - 20*dW;
            } else if(winType === 'hann') {
                v = dW < 0.2 ? 0 : -31 - 30*dW;
            } else if(winType === 'hamm') {
                v = dW < 0.2 ? 0 : -41 - 30*dW;
            }
            v = Math.max(-100, Math.min(0, v));
            // add some ripple simulation
            if(dW > 0.1) {
                if(winType === 'rect') v += 5*Math.sin(20*w);
                if(winType === 'hann') v += 1*Math.sin(20*w);
            }
            pts.push({w, v});
        }
        
        const line = d3.line().x(d => x(d.w)).y(d => y(d.v)).curve(d3.curveMonotoneX);
        path.datum(pts).transition().duration(500).attr("d", line);
    };
    window.setFilterWindow('rect');
}


