document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize AOS animation library
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true, offset: 50 });
    }

    // 2. Setup scrollspy for sticky sidebar navigation
    setupSidebarScrollspy();

    // 3. Initialize Interactive Units
    initUnit1Basics();
    initUnit2Thermal();
    initUnit3Nuclear();
    initUnit4Hydro();
    initUnit5Diesel();
    initUnit6GasTurbine();
    initUnit7Renewables();
    initUnit8Economics();
    initUnit9Grid();
});

function setupSidebarScrollspy() {
    const sections = document.querySelectorAll('.module-section');
    const navLinks = document.querySelectorAll('.sidebar-links a');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                        link.style.backgroundColor = link.style.borderLeftColor.replace('rgb', 'rgba').replace(')', ', 0.1)');
                    } else {
                        link.style.backgroundColor = 'transparent';
                    }
                });
            }
        });
    }, { rootMargin: '-20% 0px -60% 0px' });

    sections.forEach(section => observer.observe(section));
}

// ==========================================
// UNIT 1: BASICS OF POWER GENERATION
// ==========================================
function initUnit1Basics() {
    if (typeof gsap === 'undefined' || typeof Chart === 'undefined') return;

    // 1. Energy Chain SVG Animation using GSAP
    const tlChain = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    tlChain.fromTo("#chain-node-1 circle", { fill: "#1e293b", filter: "none" }, { fill: "rgba(250, 204, 21, 0.2)", filter: "drop-shadow(0 0 10px #facc15)", duration: 0.5 })
        .fromTo("#chain-arrow-1", { strokeDashoffset: 20 }, { strokeDashoffset: 0, duration: 1, ease: "linear" }, "-=0.2")
        .fromTo("#chain-node-2 circle", { fill: "#1e293b", filter: "none" }, { fill: "rgba(255, 107, 53, 0.2)", filter: "drop-shadow(0 0 10px #ff6b35)", duration: 0.5 })
        .fromTo("#chain-arrow-2", { strokeDashoffset: 20 }, { strokeDashoffset: 0, duration: 1, ease: "linear" }, "-=0.2")
        .fromTo("#chain-node-3 circle", { fill: "#1e293b", filter: "none" }, { fill: "rgba(0, 245, 255, 0.2)", filter: "drop-shadow(0 0 10px #00f5ff)", duration: 0.5 });

    // 2. India Energy Mix Pie Chart
    const ctxPie = document.getElementById('india-energy-pie');
    if (ctxPie) {
        new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: ['Thermal', 'Renewable', 'Hydro', 'Nuclear'],
                datasets: [{
                    data: [55, 33, 10, 2],
                    backgroundColor: ['#ef4444', '#22c55e', '#3b82f6', '#a78bfa'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) { return context.label + ': ' + context.parsed + '%'; }
                        }
                    }
                },
                cutout: '70%',
                animation: { animateScale: true, animateRotate: true }
            }
        });
    }

    // 3. Efficiency Comparison Bar Chart
    const ctxBar = document.getElementById('generation-comparison-chart');
    if (ctxBar) {
        new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: ['Thermal', 'Nuclear', 'Hydro', 'Gas Turbine', 'Diesel', 'Solar PV', 'Wind'],
                datasets: [{
                    label: 'Avg Efficiency (%)',
                    data: [35, 34, 88, 30, 38, 18, 40],
                    backgroundColor: [
                        '#ef4444', '#a78bfa', '#3b82f6', '#facc15', '#78716c', '#22c55e', '#00f5ff'
                    ],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#e2e8f0' }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
}

// ==========================================
// UNIT 2: THERMAL POWER STATIONS
// ==========================================
function initUnit2Thermal() {
    if (typeof gsap === 'undefined') return;

    // 1. Thermal Block Diagram Animations
    // Spin turbine and generator
    gsap.to("#turbine-shaft", { rotation: 360, transformOrigin: "left center", repeat: -1, ease: "linear", duration: 1 });
    gsap.to(".spin-gen", { rotation: 360, transformOrigin: "center center", repeat: -1, ease: "linear", duration: 2 });
    gsap.to("#flame", { scaleY: 1.2, transformOrigin: "bottom center", repeat: -1, yoyo: true, duration: 0.2, ease: "sine.inOut" });

    // Steam particles flowing
    gsap.to(".steam-particle", { x: "+=50", opacity: 0, repeat: -1, duration: 1, ease: "linear", stagger: 0.3 });
    gsap.to(".water-particle", { x: "-=50", opacity: 0, repeat: -1, duration: 1.5, ease: "linear", stagger: 0.4 });

    // Tooltip interaction
    const comps = document.querySelectorAll('.clickable-comp');
    const tooltip = document.getElementById('comp-tooltip');
    if (comps && tooltip) {
        comps.forEach(comp => {
            comp.addEventListener('mouseenter', (e) => {
                const desc = comp.getAttribute('data-desc') || "Thermal Plant Component.";
                tooltip.textContent = desc;
                tooltip.style.opacity = 1;
            });
            comp.addEventListener('mouseleave', () => {
                tooltip.style.opacity = 0;
            });
        });
    }

    // 2. T-s Diagram Drawing
    const btnDrawTS = document.getElementById('btn-draw-ts');
    const rankPath = document.getElementById('rank-path');
    if (btnDrawTS && rankPath) {
        btnDrawTS.addEventListener('click', () => {
            gsap.fromTo(rankPath,
                { strokeDashoffset: 500 },
                { strokeDashoffset: 0, duration: 2, ease: "power1.inOut" }
            );
        });
    }

    // 3. Cooling Tower Animation
    gsap.to(".hot-drop", { y: "+=100", opacity: 0, repeat: -1, duration: 1.5, ease: "none", stagger: 0.5 });
    gsap.to(".vapor-up", { y: "-=30", x: "+=10", opacity: 0, repeat: -1, duration: 2, ease: "sine.inOut", stagger: 0.5 });
}

// ==========================================
// UNIT 3: NUCLEAR POWER STATIONS
// ==========================================
function initUnit3Nuclear() {
    if (typeof gsap === 'undefined') return;

    // 1. Fission Chain Reaction Animation
    const tlFission = gsap.timeline({ repeat: -1, repeatDelay: 2 });

    // Reset initial state
    tlFission.set(".fission-n", { x: 0, opacity: 1 })
        .set("#u235-target", { scale: 1, fill: "#a78bfa" })
        .set(".fission-prod", { opacity: 0, x: 0, y: 0 })
        .set(".fission-n2", { opacity: 0, x: 0, y: 0 });

    // Sequence
    tlFission.to(".fission-n", { x: 35, duration: 0.5, ease: "power2.in" }) // neutron hits
        .to(".fission-n", { opacity: 0, duration: 0.1 })
        .to("#u235-target", { scale: 1.2, fill: "#ef4444", duration: 0.2, yoyo: true, repeat: 1 }) // absorb & vibrate
        .to("#u235-target", { opacity: 0, duration: 0.1 })
        .to(".fission-prod", { opacity: 1, duration: 0.1 }, "-=0.1")
        .to(".fission-prod:nth-child(1)", { x: "+=30", y: "-=30", duration: 0.5, ease: "power1.out" }, "-=0.1")
        .to(".fission-prod:nth-child(2)", { x: "+=30", y: "+=30", duration: 0.5, ease: "power1.out" }, "-=0.5")
        .to(".fission-n2", { opacity: 1, duration: 0.1 }, "-=0.5")
        .to(".fission-n2:nth-child(1)", { x: "+=80", y: "-=50", duration: 0.6, ease: "power1.out" }, "-=0.5")
        .to(".fission-n2:nth-child(2)", { x: "+=100", y: 0, duration: 0.6, ease: "power1.out" }, "-=0.6")
        .to(".fission-n2:nth-child(3)", { x: "+=80", y: "+=50", duration: 0.6, ease: "power1.out" }, "-=0.6");

    // 2. Reactor Animations
    // Steam flow
    gsap.to(".steam-flow", { strokeDashoffset: -30, repeat: -1, duration: 1, ease: "linear" });
    // Turbine Shaft
    gsap.to(".reactor-shaft", { x: "+=3", repeat: -1, yoyo: true, duration: 0.05, ease: "sine.inOut" });

    // 3. Control Rod Slider Logic
    const controlSlider = document.getElementById('control-rod-slider');
    const powerDisplay = document.getElementById('power-output-display');
    const controlRodsGroup = document.getElementById('control-rods');
    const fuelRods = document.querySelectorAll('.fuel-rod');

    if (controlSlider && powerDisplay && controlRodsGroup) {
        controlSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value); // 0 to 100
            powerDisplay.textContent = val + '%';

            // Adjust visual position of control rods (100% power = rods fully up = y is smaller)
            // Range: y=0 (100%) to y=80 (0%)
            const yPos = 80 - (val / 100) * 80;
            gsap.to(controlRodsGroup, { y: yPos, duration: 0.5 });

            // Change glow of fuel rods based on power
            const glowIntensity = val / 100;
            // Base color: #a78bfa, Max glow color: #facc15
            const r = Math.floor(167 + glowIntensity * 83); // 167 to 250
            const g = Math.floor(139 + glowIntensity * 65); // 139 to 204
            const b = Math.floor(250 - glowIntensity * 229); // 250 to 21
            gsap.to(fuelRods, {
                fill: `rgb(${r},${g},${b})`,
                filter: `drop-shadow(0 0 ${glowIntensity * 10}px rgb(${r},${g},${b}))`,
                duration: 0.5
            });

            // Speed up steam flow
            const duration = 1.5 - glowIntensity * 1.2; // 0.3s to 1.5s
            gsap.getTweensOf(".steam-flow").forEach(t => t.duration(Math.max(0.1, duration)));
        });

        // Init initial state
        controlSlider.dispatchEvent(new Event('input'));
    }
}

// ==========================================
// UNIT 4: HYDRO POWER STATIONS
// ==========================================
function initUnit4Hydro() {
    if (typeof gsap === 'undefined') return;

    let isPumpMode = false;

    // Water Flow Animation
    const flowTween = gsap.to(".water-flow", { strokeDashoffset: 30, repeat: -1, duration: 0.5, ease: "linear" });
    // Turbine Spin
    const spinTween = gsap.to("#hydro-turbine", { rotation: 360, transformOrigin: "center center", repeat: -1, ease: "linear", duration: 1 });

    // Interactive Logic
    const headSlider = document.getElementById('head-slider');
    const headValText = document.getElementById('head-val');
    const powerOutDisplay = document.getElementById('hydro-power-out');
    const btnPump = document.getElementById('btn-pump-storage');
    const reservoirWater = document.getElementById('water-reservoir');

    function updatePower() {
        const H = parseInt(headSlider.value);
        headValText.textContent = H;

        // Example: Q = 50 m3/s, eta = 0.9
        // P = 0.9 * 9.81 * 50 * H (kW)
        let P_kW = 0.9 * 9.81 * 50 * H;
        let pText = (P_kW / 1000).toFixed(2); // In MW

        if (isPumpMode) {
            // Power consumed
            // eta_pump = 0.85 -> P_consumed = (9.81 * Q * H) / eta
            P_kW = (9.81 * 50 * H) / 0.85;
            pText = "-" + (P_kW / 1000).toFixed(2); // Negative indicates consumption
            powerOutDisplay.style.color = "#ef4444";
        } else {
            powerOutDisplay.style.color = "var(--mod4-color)";
        }

        powerOutDisplay.textContent = pText + " MW";

        // Speed of animation based on Head
        const dur = Math.max(0.1, 1 - (H / 300));
        flowTween.duration(dur);
        spinTween.duration(dur * 2);

        // Visual reservoir level
        // Base points: M 50 100 L 375 100 L 375 300 L 50 300 Z
        // 100 is max head (lowest y), 250 is min head (highest y)
        const newY = 250 - (H / 300) * 150;
        gsap.to(reservoirWater, { attr: { d: `M 50 ${newY} L 375 ${newY} L 375 300 L 50 300 Z` }, duration: 0.5 });
    }

    if (headSlider && btnPump) {
        headSlider.addEventListener('input', updatePower);

        btnPump.addEventListener('click', () => {
            isPumpMode = !isPumpMode;
            if (isPumpMode) {
                btnPump.textContent = "Pump";
                btnPump.style.background = "var(--mod4-color)";
                btnPump.style.color = "#0a0e1a";
                // Reverse directions
                flowTween.timeScale(-1);
                spinTween.timeScale(-1);
            } else {
                btnPump.textContent = "Generate";
                btnPump.style.background = "none";
                btnPump.style.color = "var(--mod4-color)";
                flowTween.timeScale(1);
                spinTween.timeScale(1);
            }
            updatePower();
        });

        // Initialize display
        updatePower();
    }
}

// ==========================================
// UNIT 5: DIESEL ELECTRIC POWER STATIONS
// ==========================================
function initUnit5Diesel() {
    if (typeof gsap === 'undefined') return;

    // 1. Auxiliary Flow Animation
    gsap.to(".aux-flow", { strokeDashoffset: -10, repeat: -1, duration: 0.5, ease: "linear" });

    // 2. 4-Stroke Engine Animation
    const strokeDur = 1.5;
    const tlEngine = gsap.timeline({ repeat: -1 });

    // Piston travels from y:55 (TDC) to y:120 (BDC)
    // Intake
    tlEngine.addLabel("intake")
        .call(() => { document.getElementById('stroke-label').textContent = "1. INTAKE"; })
        .to("#intake-valve", { y: 10, duration: 0.2 }, "intake")
        .to("#combustion-glow", { fill: "rgba(59, 130, 246, 0.3)", duration: strokeDur, ease: "sine.inOut" }, "intake")
        .to("#piston-group", { y: 65, duration: strokeDur, ease: "sine.inOut" }, "intake")
        .to("#crank-arm", { rotation: 180, transformOrigin: "top center", duration: strokeDur, ease: "none" }, "intake")
        .to("#intake-valve", { y: 0, duration: 0.2 }, `intake+=${strokeDur - 0.2}`);

    // Compression
    tlEngine.addLabel("compression")
        .call(() => { document.getElementById('stroke-label').textContent = "2. COMPRESSION"; })
        .to("#combustion-glow", { fill: "rgba(250, 204, 21, 0.4)", duration: strokeDur, ease: "sine.inOut" }, "compression")
        .to("#piston-group", { y: 0, duration: strokeDur, ease: "sine.inOut" }, "compression")
        .to("#crank-arm", { rotation: 360, transformOrigin: "top center", duration: strokeDur, ease: "none" }, "compression");

    // Power
    tlEngine.addLabel("power")
        .call(() => { document.getElementById('stroke-label').textContent = "3. POWER"; })
        .to("#combustion-glow", { fill: "rgba(239, 68, 68, 0.8)", duration: 0.1 }, "power")
        .to("#combustion-glow", { fill: "rgba(239, 68, 68, 0.2)", duration: strokeDur - 0.1, ease: "sine.out" }, "power+=0.1")
        .to("#piston-group", { y: 65, duration: strokeDur, ease: "sine.inOut" }, "power")
        // Reset crank rotation to 0 for continuous rotation effect without snapping
        .fromTo("#crank-arm", { rotation: 0 }, { rotation: 180, transformOrigin: "top center", duration: strokeDur, ease: "none" }, "power");

    // Exhaust
    tlEngine.addLabel("exhaust")
        .call(() => { document.getElementById('stroke-label').textContent = "4. EXHAUST"; })
        .to("#exhaust-valve", { y: 10, duration: 0.2 }, "exhaust")
        .to("#combustion-glow", { fill: "rgba(148, 163, 184, 0.5)", duration: strokeDur, ease: "sine.inOut" }, "exhaust")
        .to("#piston-group", { y: 0, duration: strokeDur, ease: "sine.inOut" }, "exhaust")
        .to("#crank-arm", { rotation: 360, transformOrigin: "top center", duration: strokeDur, ease: "none" }, "exhaust")
        .to("#exhaust-valve", { y: 0, duration: 0.2 }, `exhaust+=${strokeDur - 0.2}`);
}

// ==========================================
// UNIT 6: GAS TURBINE POWER PLANTS
// ==========================================
function initUnit6GasTurbine() {
    if (typeof gsap === 'undefined') return;

    // 1. Brayton Cycle Drawing
    const btnBrayton = document.getElementById('btn-draw-brayton');
    const braytonPath = document.getElementById('brayton-path');
    if (btnBrayton && braytonPath) {
        btnBrayton.addEventListener('click', () => {
            gsap.fromTo(braytonPath,
                { strokeDashoffset: 500 },
                { strokeDashoffset: 0, duration: 2, ease: "power1.inOut" }
            );
        });
    }

    // 2. Gas Turbine Plant Animations
    // Shaft spinning (dashed line representing shaft)
    gsap.to("#gt-shaft", { strokeDashoffset: -20, repeat: -1, duration: 0.5, ease: "linear" });

    // Flame pulsing
    gsap.to("#gt-flame", { scale: 1.1, transformOrigin: "left center", repeat: -1, yoyo: true, duration: 0.1, ease: "sine.inOut" });

    // Air and gas flow
    gsap.to(".gt-flow", { strokeDashoffset: -8, repeat: -1, duration: 0.4, ease: "linear" });
}

// ==========================================
// UNIT 7: NON-CONVENTIONAL ENERGY (Renewables)
// ==========================================
function initUnit7Renewables() {
    if (typeof gsap === 'undefined' || typeof Chart === 'undefined') return;

    // 1. Solar SVG Animations
    gsap.to("#solar-sun", { scale: 1.1, transformOrigin: "center center", repeat: -1, yoyo: true, duration: 1 });
    gsap.to(".sun-ray", { scale: 1.2, transformOrigin: "center center", opacity: 0.5, repeat: -1, yoyo: true, duration: 1 });
    gsap.to(".photon-ray", { strokeDashoffset: -10, repeat: -1, duration: 0.5, ease: "linear" });
    gsap.to(".dc-flow", { strokeDashoffset: -15, repeat: -1, duration: 0.5, ease: "linear" });

    // 2. Solar I-V Chart.js
    const ctxIV = document.getElementById('solar-iv-chart');
    const irrSlider = document.getElementById('irr-slider');
    const irrVal = document.getElementById('irr-val');
    const tempSlider = document.getElementById('temp-slider');
    const tempVal = document.getElementById('temp-val');

    let ivChart;
    if (ctxIV && irrSlider && tempSlider) {
        // Simple I-V curve generator
        function generateIVData(irr, temp) {
            const data = [];
            // Base specs at STC (1000 W/m2, 25C)
            const Isc_ref = 8.0;
            const Voc_ref = 40.0;
            const alpha = 0.005; // Temp coeff for Isc
            const beta = -0.15;  // Temp coeff for Voc

            const dT = temp - 25;
            const irrRatio = irr / 1000;

            const Isc = (Isc_ref + alpha * dT) * irrRatio;
            const Voc = Voc_ref + beta * dT + 2 * Math.log(irrRatio || 0.01);

            // Plot 20 points
            for (let v = 0; v <= Voc; v += Voc / 20) {
                // Approximate curve: I = Isc * (1 - exp(q(V-Voc)/kT)) simplified
                let i = Isc * (1 - Math.exp((v - Voc) / 2));
                if (i < 0) i = 0;
                data.push({ x: v, y: i });
            }
            return data;
        }

        ivChart = new Chart(ctxIV, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'I-V Curve',
                    data: generateIVData(1000, 25),
                    borderColor: '#00f5ff',
                    backgroundColor: '#00f5ff',
                    showLine: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: 'Voltage (V)', color: '#94a3b8' }, min: 0, max: 50, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#e2e8f0' } },
                    y: { title: { display: true, text: 'Current (A)', color: '#94a3b8' }, min: 0, max: 10, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#e2e8f0' } }
                },
                plugins: { legend: { display: false } },
                animation: { duration: 0 }
            }
        });

        function updateIV() {
            const irr = parseInt(irrSlider.value);
            const temp = parseInt(tempSlider.value);
            irrVal.textContent = irr;
            tempVal.textContent = temp;

            ivChart.data.datasets[0].data = generateIVData(irr, temp);
            ivChart.update();
        }

        irrSlider.addEventListener('input', updateIV);
        tempSlider.addEventListener('input', updateIV);
    }

    // 3. Wind Turbine Animation & Logic
    const windSlider = document.getElementById('wind-slider');
    const windValText = document.getElementById('wind-val');
    const windPowerText = document.getElementById('wind-power-val');

    // Wind flow lines
    const windFlowTween = gsap.to(".wind-flow", { strokeDashoffset: -10, repeat: -1, duration: 1, ease: "linear" });
    // Rotor spinning
    const rotorTween = gsap.to("#wind-rotor", { rotation: 360, transformOrigin: "center center", repeat: -1, duration: 2, ease: "linear" });

    if (windSlider && windPowerText) {
        windSlider.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            windValText.textContent = v;

            // P = 0.5 * rho * A * v^3 * Cp
            // Assume rho = 1.225, A = 1000 m2 (Radius ~ 18m), Cp = 0.4
            // P_kW = (0.5 * 1.225 * 1000 * Math.pow(v, 3) * 0.4) / 1000;
            const P_MW = (0.5 * 1.225 * 1000 * Math.pow(v, 3) * 0.4) / 1000000;

            windPowerText.textContent = P_MW.toFixed(2);

            // Update animation speeds based on v
            // map v:3->25 to duration: 3s -> 0.2s
            const speed = Math.max(0.2, 3 - (v / 10));
            rotorTween.duration(speed);
            windFlowTween.duration(speed / 2);
        });

        // Init initial values
        windSlider.dispatchEvent(new Event('input'));
    }
}

// ==========================================
// UNIT 8: ECONOMICS OF POWER GENERATION
// ==========================================
function initUnit8Economics() {
    if (typeof Chart === 'undefined') return;

    // 1. Daily Load Curve Chart
    const ctxLoad = document.getElementById('load-curve-chart');
    if (ctxLoad) {
        new Chart(ctxLoad, {
            type: 'line',
            data: {
                labels: ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM', '12 AM'],
                datasets: [
                    {
                        label: 'Total Load',
                        data: [40, 35, 70, 85, 80, 100, 50],
                        borderColor: '#e2e8f0',
                        backgroundColor: 'rgba(244, 63, 94, 0.2)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        segment: {
                            backgroundColor: (ctx) => {
                                // Peak load > 60 fill red, base load < 60 fill purple
                                if (ctx.p1DataIndex !== undefined) {
                                    return 'rgba(244, 63, 94, 0.4)'; // Peak
                                }
                            }
                        }
                    },
                    {
                        label: 'Base Load Capacity',
                        data: [60, 60, 60, 60, 60, 60, 60],
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.4)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: 'origin',
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    y: {
                        title: { display: true, text: 'Load (MW)', color: '#94a3b8' },
                        min: 0,
                        max: 120,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#94a3b8' }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // 2. Depreciation Calculator
    const depP = document.getElementById('dep-p');
    const depS = document.getElementById('dep-s');
    const depN = document.getElementById('dep-n');
    const depR = document.getElementById('dep-r');
    const outSlm = document.getElementById('out-slm');
    const outSfm = document.getElementById('out-sfm');

    if (depP && depS && depN && depR && outSlm && outSfm) {
        function calcDep() {
            const P = parseFloat(depP.value) || 0;
            const S = parseFloat(depS.value) || 0;
            const n = parseFloat(depN.value) || 1;
            const r = (parseFloat(depR.value) || 0) / 100;

            // Straight Line Method: (P-S)/n
            const slm = (P - S) / n;
            outSlm.textContent = "$" + slm.toFixed(2);

            // Sinking Fund Method: q = (P-S)*r / ((1+r)^n - 1)
            let sfm = 0;
            if (r > 0) {
                sfm = ((P - S) * r) / (Math.pow(1 + r, n) - 1);
            } else {
                sfm = slm;
            }
            outSfm.textContent = "$" + sfm.toFixed(2);
        }

        [depP, depS, depN, depR].forEach(el => el.addEventListener('input', calcDep));
        calcDep();
    }
}

// ==========================================
// UNIT 9: INTERCONNECTED POWER SYSTEMS
// ==========================================
function initUnit9Grid() {
    if (typeof gsap === 'undefined') return;

    // Pulse node circles
    gsap.to(".grid-pulse", { scale: 1.3, opacity: 0, repeat: -1, duration: 1.5, ease: "power1.out", stagger: 0.5 });

    // Flowing power lines
    gsap.to(".grid-power-flow", { strokeDashoffset: -20, repeat: -1, duration: 0.5, ease: "linear" });
}
