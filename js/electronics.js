document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }
    // ----------------------------------------------------------------------
    // MODULE 1: Basic Electronics Components
    // ----------------------------------------------------------------------

    // CARD 1.1: Component Symbols
    const symbolsData = [
        { name: "Fixed Resistor", type: "resistor", path: "M 0 20 L 15 20 L 20 10 L 30 30 L 40 10 L 50 30 L 60 10 L 65 20 L 80 20", glow: "var(--mod1-color)" },
        { name: "Variable Resistor", type: "resistor-var", path: "M 0 20 L 15 20 L 20 10 L 30 30 L 40 10 L 50 30 L 60 10 L 65 20 L 80 20 M 20 35 L 60 5", glow: "var(--mod1-color)", arrow: true },
        { name: "Preset Resistor", type: "preset", path: "M 0 20 L 15 20 L 20 10 L 30 30 L 40 10 L 50 30 L 60 10 L 65 20 L 80 20 M 35 30 L 45 10 M 40 10 L 50 10 M 40 10 L 40 20", glow: "var(--mod1-color)" },
        { name: "Thermistor", type: "thermistor", path: "M 10 10 L 70 10 L 70 30 L 10 30 Z M 0 20 L 15 20 L 20 15 L 30 25 L 40 15 L 50 25 L 60 15 L 65 20 L 80 20", glow: "var(--mod1-color)", text: "-t°" },
        { name: "Non-polarized Cap", type: "cap-np", path: "M 0 20 L 35 20 M 35 5 L 35 35 M 45 5 L 45 35 M 45 20 L 80 20", glow: "var(--mod3-color)" },
        { name: "Variable Capacitor", type: "cap-var", path: "M 0 20 L 35 20 M 35 5 L 35 35 M 45 5 L 45 35 M 45 20 L 80 20 M 20 35 L 60 5", glow: "var(--mod3-color)", arrow: true },
        { name: "Polarized Cap", type: "cap-pol", path: "M 0 20 L 35 20 M 35 5 Q 45 20 35 35 M 45 5 L 45 35 M 45 20 L 80 20", glow: "var(--mod3-color)", text: "+" },
        { name: "Fixed Inductor", type: "inductor", path: "M 0 20 L 20 20 Q 30 0 40 20 Q 50 0 60 20 L 80 20", glow: "var(--mod2-color)" },
        { name: "Varactor Diode", type: "varactor", path: "M 0 20 L 30 20 L 30 10 L 50 20 L 30 30 Z M 50 10 L 50 30 M 55 10 L 55 30 M 55 20 L 80 20", glow: "var(--mod4-color)" },
    ];

    const gallery = document.getElementById('symbols-gallery');
    const tooltip = document.getElementById('symbol-tooltip');

    if (gallery) {
        symbolsData.forEach((sym, index) => {
            const wrapper = document.createElement('div');
            wrapper.style.width = '100px';
            wrapper.style.height = '80px';
            wrapper.style.cursor = 'pointer';
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'center';
            wrapper.dataset.index = index;

            let extraHtml = '';
            if (sym.arrow) {
                extraHtml += `<polygon points="56,2 64,5 59,9" fill="${sym.glow}" />`;
            }
            if (sym.text) {
                extraHtml += `<text x="15" y="10" fill="${sym.glow}" font-size="10" font-family="Orbitron">${sym.text}</text>`;
            }

            wrapper.innerHTML = `
                <svg viewBox="0 0 80 40" width="80" height="40">
                    <path d="${sym.path}" fill="none" stroke="${sym.glow}" stroke-width="2" class="symbol-path" />
                    ${extraHtml}
                </svg>
                <div style="font-size:0.7rem; color:#94a3b8; text-align:center; margin-top:5px; transition:color 0.3s;" class="sym-name">${sym.name}</div>
            `;

            wrapper.addEventListener('mouseenter', () => {
                tooltip.style.color = sym.glow;
                tooltip.innerHTML = `<strong>${sym.name}</strong><br><span style="font-size: 0.8rem; color: #fff;">Typical use in circuits. Click to expand.</span>`;
                wrapper.querySelector('.sym-name').style.color = sym.glow;
                wrapper.querySelector('.symbol-path').style.filter = `drop-shadow(0 0 5px ${sym.glow})`;
            });
            wrapper.addEventListener('mouseleave', () => {
                tooltip.innerHTML = 'Hover over a symbol to see details';
                tooltip.style.color = 'var(--mod3-color)';
                wrapper.querySelector('.sym-name').style.color = '#94a3b8';
                wrapper.querySelector('.symbol-path').style.filter = 'none';
            });

            gallery.appendChild(wrapper);
        });

        // GSAP Animation for symbols
        gsap.from(".symbol-path", {
            scrollTrigger: {
                trigger: "#mod1",
                start: "top 80%",
            },
            strokeDasharray: 100,
            strokeDashoffset: 100,
            duration: 2,
            stagger: 0.1,
            ease: "power2.out"
        });
    }

    // CARD 1.2: Resistor Table Animation
    gsap.from(".table-row-anim", {
        scrollTrigger: {
            trigger: ".table-container",
            start: "top 85%",
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)"
    });

    // CARD 1.3: Capacitor Types Hover Animation
    const capRows = document.querySelectorAll('.cap-row');
    const capSvg = document.getElementById('cap-svg-display');
    const capText = document.getElementById('cap-feature-text');

    const capDict = {
        "paper": { path: "M 20 30 L 80 30 M 20 50 L 80 50 M 20 70 L 80 70", stroke: "#facc15", text: "Rolled dielectric layers for high AC/DC voltage." },
        "ceramic": { path: "M 30 30 L 70 30 M 30 70 L 70 70 M 50 30 L 50 70", stroke: "#00f5ff", text: "Ceramic disc structure. High K, low leakage." },
        "mica": { path: "M 20 20 L 80 20 M 20 40 L 80 40 M 20 60 L 80 60 M 20 80 L 80 80", stroke: "#a78bfa", text: "Mica sheets stacked. Very stable for RF circuits." },
        "electro": { path: "M 30 50 L 70 50 M 40 20 L 40 80 M 60 20 Q 70 50 60 80", stroke: "#00ff88", text: "Aluminum oxide layer forming massive capacitance. Polarized." }
    };

    capRows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            const type = row.dataset.type;
            const data = capDict[type];
            row.style.background = "rgba(255,255,255,0.05)";

            if (data) {
                capSvg.innerHTML = `<path d="${data.path}" stroke="${data.stroke}" stroke-width="4" fill="none" class="glow-effect"/>`;
                capText.innerHTML = data.text;
                capText.style.color = data.stroke;
            }
        });
        row.addEventListener('mouseleave', () => {
            row.style.background = "none";
        });
    });

    // ----------------------------------------------------------------------
    // MODULE 2: Semiconductor Fundamentals
    // ----------------------------------------------------------------------

    // CARD 2.1: Energy Bandgap SVG Animation
    gsap.from("#bandgap-svg rect", {
        scrollTrigger: { trigger: "#bandgap-svg", start: "top 85%" },
        scaleY: 0, transformOrigin: "bottom", duration: 1, stagger: 0.1, ease: "bounce.out"
    });

    // CARD 2.2: Fermi Level Interactive
    const fermiLine = document.getElementById('fermi-line');
    const fermiText = document.getElementById('fermi-text');
    const btnInt = document.getElementById('btn-intrinsic');
    const btnNType = document.getElementById('btn-ntype');
    const btnPType = document.getElementById('btn-ptype');
    const fermiEqDisplay = document.getElementById('fermi-eq-display'); // optional update eq

    if (btnInt) {
        btnInt.addEventListener('click', () => {
            btnInt.classList.add('active'); btnNType.classList.remove('active'); btnPType.classList.remove('active');
            fermiLine.setAttribute('y1', '75'); fermiLine.setAttribute('y2', '75');
            fermiText.setAttribute('y', '70'); fermiText.textContent = "EF (Intrinsic)";
            fermiEqDisplay.innerHTML = "$$ E_F = \\frac{E_c + E_v}{2} - \\frac{KT}{2}\\ln\\left(\\frac{N_c}{N_v}\\right) $$";
            if (window.renderMathInElement) renderMathInElement(fermiEqDisplay);
        });
        btnNType.addEventListener('click', () => {
            btnNType.classList.add('active'); btnInt.classList.remove('active'); btnPType.classList.remove('active');
            fermiLine.setAttribute('y1', '55'); fermiLine.setAttribute('y2', '55');
            fermiText.setAttribute('y', '50'); fermiText.textContent = "EF (N-Type)";
            fermiEqDisplay.innerHTML = "$$ E_F = E_c - KT\\ln\\left(\\frac{N_c}{N_D}\\right) $$";
            if (window.renderMathInElement) renderMathInElement(fermiEqDisplay);
        });
        btnPType.addEventListener('click', () => {
            btnPType.classList.add('active'); btnInt.classList.remove('active'); btnNType.classList.remove('active');
            fermiLine.setAttribute('y1', '95'); fermiLine.setAttribute('y2', '95');
            fermiText.setAttribute('y', '90'); fermiText.textContent = "EF (P-Type)";
            fermiEqDisplay.innerHTML = "$$ E_F = E_v + KT\\ln\\left(\\frac{N_v}{N_A}\\right) $$";
            if (window.renderMathInElement) renderMathInElement(fermiEqDisplay);
        });
    }

    // CARD 2.3: Doping Lattice and Slider
    const latticeSvg = document.getElementById('lattice-svg');
    const dopingSlider = document.getElementById('doping-slider');
    const dopingDisp = document.getElementById('doping-disp');

    // Generate Lattice
    if (latticeSvg) {
        // Simple 3x3 lattice visualization
        const drawLattice = (type) => {
            let svgContent = '';
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const cx = 40 + j * 60;
                    const cy = 40 + i * 60;

                    // Draw Bonds
                    if (j < 2) svgContent += `<line x1="${cx + 20}" y1="${cy}" x2="${cx + 40}" y2="${cy}" stroke="rgba(255,255,255,0.2)" stroke-width="4"/>`;
                    if (i < 2) svgContent += `<line x1="${cx}" y1="${cy + 20}" x2="${cx}" y2="${cy + 40}" stroke="rgba(255,255,255,0.2)" stroke-width="4"/>`;

                    // Draw Atoms
                    let fill = "var(--mod3-color)"; // Si
                    let text = "Si";
                    let chargeHtml = "";

                    if (i === 1 && j === 1) { // Center atom
                        if (type === 'n-type') {
                            fill = "var(--mod1-color)"; text = "P";
                            chargeHtml = `<circle cx="${cx + 25}" cy="${cy - 25}" r="5" fill="var(--mod1-color)" class="glow-effect" /> <text x="${cx + 20}" y="${cy - 35}" fill="#fff" font-size="10">e⁻</text>`;
                        } else if (type === 'p-type') {
                            fill = "var(--mod2-color)"; text = "B";
                            chargeHtml = `<circle cx="${cx + 25}" cy="${cy - 25}" r="5" fill="none" stroke="var(--mod2-color)" stroke-width="2" /> <text x="${cx + 15}" y="${cy - 35}" fill="#fff" font-size="10">hole</text>`;
                        }
                    }

                    svgContent += `<circle cx="${cx}" cy="${cy}" r="15" fill="#0f172a" stroke="${fill}" stroke-width="2"/>
                                   <text x="${cx}" y="${cy + 4}" fill="${fill}" font-size="12" text-anchor="middle">${text}</text>
                                   ${chargeHtml}`;
                }
            }
            latticeSvg.innerHTML = svgContent;
        };

        drawLattice('intrinsic');

        document.getElementById('btn-lattice-p').addEventListener('click', (e) => {
            document.querySelectorAll('#btn-lattice-p, #btn-lattice-i, #btn-lattice-n').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            drawLattice('p-type');
        });
        document.getElementById('btn-lattice-i').addEventListener('click', (e) => {
            document.querySelectorAll('#btn-lattice-p, #btn-lattice-i, #btn-lattice-n').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            drawLattice('intrinsic');
        });
        document.getElementById('btn-lattice-n').addEventListener('click', (e) => {
            document.querySelectorAll('#btn-lattice-p, #btn-lattice-i, #btn-lattice-n').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            drawLattice('n-type');
        });

        dopingSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            let text = "";
            let color = "var(--mod2-color)";
            if (val <= 4) { text = "Heavy Doping (N+, P+)"; color = "var(--mod1-color)"; }
            else if (val <= 8) { text = "Moderate Doping (N, P)"; color = "var(--mod2-color)"; }
            else { text = "Light Doping (N-, P-)"; color = "var(--mod3-color)"; }

            dopingDisp.style.color = color;
            dopingDisp.innerHTML = `${text} | 1:10<sup>${val}</sup>`;
        });
    }

    // CARD 2.5: Thermal Voltage
    const tempSlider = document.getElementById('temp-vt-slider');
    const vtDisplay = document.getElementById('vt-display');
    if (tempSlider) {
        tempSlider.addEventListener('input', (e) => {
            const T = parseInt(e.target.value);
            const Vt = T / 11600;
            vtDisplay.innerHTML = `V<sub>T</sub> = ${(Vt * 1000).toFixed(2)} mV`;
        });
    }

    // CARD 2.6: Drift and Diffusion Particles
    const driftAnim = document.getElementById('drift-anim');
    const diffAnim = document.getElementById('diff-anim');

    if (driftAnim && diffAnim) {
        // Create particles
        for (let i = 0; i < 8; i++) {
            let p1 = document.createElement('div');
            p1.style.cssText = `position:absolute; width:6px; height:6px; background:var(--mod1-color); border-radius:50%; top:${10 + i * 8}px; left:10px; box-shadow:0 0 5px var(--mod1-color);`;
            driftAnim.appendChild(p1);

            // Drift animation (all move same direction steadily)
            gsap.to(p1, { x: 200, duration: 2 + Math.random(), repeat: -1, ease: "linear", delay: Math.random() });

            // Diff particles clustered at left
            let p2 = document.createElement('div');
            p2.style.cssText = `position:absolute; width:6px; height:6px; background:var(--mod2-color); border-radius:50%; top:${10 + i * 8}px; left:${10 + Math.random() * 20}px; box-shadow:0 0 5px var(--mod2-color);`;
            diffAnim.appendChild(p2);

            // Diff animation (move from high to low conc, varied speed)
            gsap.to(p2, { x: 150 + Math.random() * 50, y: (Math.random() - 0.5) * 20, duration: 1.5 + Math.random() * 2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: Math.random() });
        }
    }

    // CARD 2.7: Mobility Chart
    if (document.getElementById('mobility-chart')) {
        const svg = d3.select("#mobility-chart");
        svg.selectAll("*").remove();
        const width = 300, height = 150;

        svg.attr("viewBox", `0 0 ${width} ${height}`);

        const data = [
            { material: "Ge", e: 3800, h: 1800, color: "var(--mod4-color)" },
            { material: "Si", e: 1300, h: 500, color: "var(--mod3-color)" },
            { material: "GaAs", e: 8500, h: 400, color: "var(--mod1-color)" }
        ];

        const x = d3.scaleBand().domain(data.map(d => d.material)).range([40, width - 20]).padding(0.2);
        const y = d3.scaleLinear().domain([0, 9000]).range([height - 30, 20]);

        // Axes
        svg.append("g").attr("transform", `translate(0,${height - 30})`).call(d3.axisBottom(x)).attr("color", "#94a3b8");
        svg.append("g").attr("transform", `translate(40,0)`).call(d3.axisLeft(y).ticks(4)).attr("color", "#94a3b8");

        // Electron Mobility Bars
        svg.selectAll(".bar-e")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar-e glow-effect")
            .attr("x", d => x(d.material))
            .attr("y", d => y(d.e))
            .attr("width", x.bandwidth() / 2)
            .attr("height", d => height - 30 - y(d.e))
            .attr("fill", d => d.color);

        // Hole Mobility Bars
        svg.selectAll(".bar-h")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar-h")
            .attr("x", d => x(d.material) + x.bandwidth() / 2)
            .attr("y", d => y(d.h))
            .attr("width", x.bandwidth() / 2)
            .attr("height", d => height - 30 - y(d.h))
            .attr("fill", "rgba(255,255,255,0.2)");

        // Legend
        svg.append("circle").attr("cx", 60).attr("cy", 10).attr("r", 4).attr("fill", "var(--mod3-color)");
        svg.append("text").attr("x", 70).attr("y", 14).text("Electron").style("font-size", "10px").attr("fill", "#fff");
        svg.append("circle").attr("cx", 130).attr("cy", 10).attr("r", 4).attr("fill", "rgba(255,255,255,0.2)");
        svg.append("text").attr("x", 140).attr("y", 14).text("Hole").style("font-size", "10px").attr("fill", "#fff");

        // GSAP animate bars
        gsap.from("#mobility-chart rect", {
            scrollTrigger: { trigger: "#mobility-chart", start: "top 85%" },
            y: 120, height: 0, duration: 1, stagger: 0.1, ease: "power2.out"
        });
    }

    // ----------------------------------------------------------------------
    // MODULE 3: PN Junction Diode
    // ----------------------------------------------------------------------

    // CARD 3.1: PN Junction Formation
    const biasSlider = document.getElementById('bias-slider');
    const biasDisplay = document.getElementById('bias-display');
    const depRegion = document.getElementById('depletion-region');
    const plateLeft = document.getElementById('plate-left');
    const plateRight = document.getElementById('plate-right');
    const capText3 = document.getElementById('cap-text');

    if (biasSlider) {
        biasSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            // val: -10 to +10.  <0 is Reverse, >0 is Forward

            // Adjust depletion region in 3.1
            const baseWidth = 60;
            const newWidth = baseWidth - (val * 3); // forward shrinks, reverse expands
            depRegion.setAttribute('width', newWidth);
            depRegion.setAttribute('x', 150 - (newWidth / 2));

            // Update text
            if (val < 0) {
                biasDisplay.textContent = `Reverse Bias: ${Math.abs(val)}V`;
                biasDisplay.style.color = "var(--mod3-color)";
                if (plateLeft && plateRight) {
                    plateLeft.style.left = `${20 - Math.abs(val)}px`;
                    plateRight.style.right = `${20 - Math.abs(val)}px`;
                    capText3.textContent = "Reverse Bias: Plates separating (CT decreasing)";
                }
            } else if (val > 0) {
                biasDisplay.textContent = `Forward Bias: ${val}V`;
                biasDisplay.style.color = "var(--mod1-color)";
                if (plateLeft && plateRight) {
                    plateLeft.style.left = `${20 + val}px`;
                    plateRight.style.right = `${20 + val}px`;
                    capText3.textContent = "Forward Bias: High Diffusion Capacitance CD";
                }
            } else {
                biasDisplay.textContent = `Zero Bias`;
                biasDisplay.style.color = "#94a3b8";
                if (plateLeft && plateRight) {
                    plateLeft.style.left = "20px";
                    plateRight.style.right = "20px";
                    capText3.textContent = "Equilibrium";
                }
            }
        });
    }

    // CARD 3.2: I-V Curve D3 JS
    if (document.getElementById('iv-chart')) {
        const svgIV = d3.select("#iv-chart").append("svg")
            .attr("viewBox", "0 0 300 250").attr("width", "100%").attr("height", "100%");

        const g = svgIV.append("g").attr("transform", "translate(150, 150)");

        // Axes
        g.append("line").attr("x1", -140).attr("x2", 140).attr("y1", 0).attr("y2", 0).attr("stroke", "#475569");
        g.append("line").attr("x1", 0).attr("x2", 0).attr("y1", -140).attr("y2", 90).attr("stroke", "#475569");

        g.append("text").attr("x", 120).attr("y", -5).fill("#94a3b8").text("+V").style("font-size", "10px");
        g.append("text").attr("x", -130).attr("y", -5).fill("#94a3b8").text("-V").style("font-size", "10px");
        g.append("text").attr("x", 5).attr("y", -130).fill("#94a3b8").text("+I").style("font-size", "10px");
        g.append("text").attr("x", 5).attr("y", 80).fill("#94a3b8").text("-I").style("font-size", "10px");

        // Simple mathematical approximations for visual curve
        const generateCurve = (cutIn, scaleFactor) => {
            const points = [];
            // reverse
            for (let v = -140; v < 0; v += 5) points.push([v, 2]);
            // forward
            for (let v = 0; v <= 140; v += 2) {
                if (v < cutIn) {
                    points.push([v, 2 - (v / cutIn) * 2]); // small curve
                } else {
                    let i = -Math.pow(1.1, (v - cutIn) / scaleFactor);
                    if (i > -140) points.push([v, i]);
                }
            }
            return points;
        };

        const lineGen = d3.line().x(d => d[0]).y(d => d[1]).curve(d3.curveMonotoneX);

        const curvePath = g.append("path")
            .attr("d", lineGen(generateCurve(40, 2))) // SI default
            .attr("fill", "none")
            .attr("stroke", "var(--mod3-color)")
            .attr("stroke-width", 2)
            .attr("class", "glow-effect");

        // Animation of drawing the curve
        const totalLength = curvePath.node().getTotalLength();
        curvePath.attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);

        // Buttons
        document.getElementById('btn-iv-si').addEventListener('click', (e) => {
            document.querySelectorAll('#btn-iv-si, #btn-iv-ge').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            curvePath.transition().duration(500).attr("d", lineGen(generateCurve(40, 2))).attr("stroke", "var(--mod3-color)");
        });
        document.getElementById('btn-iv-ge').addEventListener('click', (e) => {
            document.querySelectorAll('#btn-iv-si, #btn-iv-ge').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            curvePath.transition().duration(500).attr("d", lineGen(generateCurve(15, 1.5))).attr("stroke", "var(--mod1-color)");
        });
    }

    // ----------------------------------------------------------------------
    // MODULE 4: Special Purpose Diodes
    // ----------------------------------------------------------------------

    // CARD 4.1: Zener Diode Curve
    if (document.getElementById('zener-chart-container')) {
        const svgZener = d3.select("#zener-chart-container").append("svg")
            .attr("viewBox", "0 0 200 150").attr("width", "100%").attr("height", "100%");

        const gz = svgZener.append("g").attr("transform", "translate(150, 50)");

        // Axes
        gz.append("line").attr("x1", -140).attr("x2", 40).attr("y1", 0).attr("y2", 0).attr("stroke", "#475569");
        gz.append("line").attr("x1", 0).attr("x2", 0).attr("y1", -40).attr("y2", 90).attr("stroke", "#475569");

        gz.append("text").attr("x", 20).attr("y", -5).fill("#94a3b8").text("+v").style("font-size", "8px");
        gz.append("text").attr("x", -130).attr("y", -5).fill("#94a3b8").text("-v").style("font-size", "8px");
        gz.append("text").attr("x", 5).attr("y", 80).fill("#94a3b8").text("-i").style("font-size", "8px");

        // Zener Curve
        const zenerPoints = [];
        for (let v = 20; v >= -80; v -= 2) zenerPoints.push([v, 1]); // slight reverse leakage
        for (let v = -80; v >= -100; v -= 2) zenerPoints.push([v, Math.pow(1.2, -80 - v) + 1]); // Avalanche/Zener breakdown

        const lineZ = d3.line().x(d => d[0]).y(d => d[1]).curve(d3.curveMonotoneY);

        const zPath = gz.append("path")
            .attr("d", lineZ(zenerPoints))
            .attr("fill", "none")
            .attr("stroke", "var(--mod4-color)")
            .attr("stroke-width", 2)
            .attr("class", "glow-effect");

        gsap.from(zPath.node(), {
            scrollTrigger: { trigger: "#zener-chart-container", start: "top 85%" },
            strokeDasharray: 500, strokeDashoffset: 500, duration: 2, ease: "power2.out"
        });

        // Vz label
        gz.append("line").attr("x1", -80).attr("x2", -80).attr("y1", -5).attr("y2", 5).attr("stroke", "#fff");
        gz.append("text").attr("x", -85).attr("y", -10).fill("var(--mod4-color)").text("-Vz").style("font-size", "10px");
    }

    // CARD 4.2: Tunnel Diode Anime
    gsap.to("#tunnel-curve", {
        scrollTrigger: { trigger: "#tunnel-curve", start: "top 85%" },
        strokeDasharray: "400, 400",
        strokeDashoffset: 400,
        duration: 2,
        ease: "power2.out"
    });

    // CARD 4.3: Varactor Slider
    const varSlider = document.getElementById('varactor-slider');
    const varDisp = document.getElementById('varactor-cap-display');
    if (varSlider) {
        varSlider.addEventListener('input', (e) => {
            const Vr = parseFloat(e.target.value);
            // C = K / (Vk + Vr)^n.  Let K = 50, Vk = 1, n=0.5
            const C = 50 / Math.pow((1 + Vr), 0.5);
            varDisp.innerHTML = `C = ${C.toFixed(1)} pF`;
        });
    }

    // ----------------------------------------------------------------------
    // MODULE 5: Power Supply
    // ----------------------------------------------------------------------

    // CARD 5.1: Block Diagram Animation
    const psSvgNode = document.getElementById('ps-block-diagram');
    const psDesc = document.getElementById('ps-stage-desc');

    if (psSvgNode) {
        const d3Svg = d3.select(psSvgNode);

        const blocks = [
            { id: "tx", label: "Transformer", x: 50, w: 120, desc: "Steps down 230V AC to required low voltage AC." },
            { id: "rect", label: "Rectifier", x: 250, w: 100, desc: "Converts AC to pulsating DC (HWR, FWR, Bridge)." },
            { id: "filt", label: "Filter", x: 430, w: 100, desc: "Removes AC ripples, provides smooth DC voltage." },
            { id: "reg", label: "Regulator", x: 610, w: 120, desc: "Maintains constant output DC voltage despite load/line variations." }
        ];

        // Draw connections and signals
        const signals = [
            { x1: 10, x2: 50, type: "ac_high" },
            { x1: 170, x2: 250, type: "ac_low" },
            { x1: 350, x2: 430, type: "pulsating" },
            { x1: 530, x2: 610, type: "smooth", ripple: true },
            { x1: 730, x2: 790, type: "pure_dc" }
        ];

        signals.forEach(sig => {
            d3Svg.append("line")
                .attr("x1", sig.x1).attr("y1", 100).attr("x2", sig.x2).attr("y2", 100)
                .attr("stroke", "#475569").attr("stroke-width", 2).attr("marker-end", "url(#hall-arrow)");

            // Draw tiny waveforms above lines
            let wavePath = '';
            let mx = (sig.x1 + sig.x2) / 2 - 15;
            let my = 80;
            switch (sig.type) {
                case "ac_high": wavePath = `M ${mx} ${my} Q ${mx + 7.5} ${my - 20} ${mx + 15} ${my} T ${mx + 30} ${my}`; break;
                case "ac_low": wavePath = `M ${mx} ${my} Q ${mx + 7.5} ${my - 10} ${mx + 15} ${my} T ${mx + 30} ${my}`; break;
                case "pulsating": wavePath = `M ${mx} ${my} Q ${mx + 7.5} ${my - 15} ${mx + 15} ${my} Q ${mx + 22.5} ${my - 15} ${mx + 30} ${my}`; break;
                case "smooth": wavePath = `M ${mx} ${my - 10} L ${mx + 10} ${my - 15} L ${mx + 20} ${my - 10} L ${mx + 30} ${my - 15}`; break;
                case "pure_dc": wavePath = `M ${mx} ${my - 15} L ${mx + 30} ${my - 15}`; break;
            }
            d3Svg.append("path").attr("d", wavePath).attr("fill", "none")
                .attr("stroke", "var(--mod1-color)").attr("stroke-width", 2).attr("class", "glow-effect");
        });

        // Draw blocks
        blocks.forEach((b, i) => {
            const g = d3Svg.append("g").attr("class", "ps-block").attr("data-idx", i).attr("style", "cursor:pointer;");
            g.append("rect").attr("x", b.x).attr("y", 60).attr("width", b.w).attr("height", 80).attr("rx", 8)
                .attr("fill", "rgba(0,0,0,0.5)").attr("stroke", "var(--mod1-color)").attr("stroke-width", 2).attr("class", "glow-effect");
            g.append("text").attr("x", b.x + b.w / 2).attr("y", 105).attr("fill", "#fff")
                .attr("font-size", "14").attr("font-family", "Orbitron").attr("text-anchor", "middle").text(b.label);
        });

        // Hover events
        const blockEls = psSvgNode.querySelectorAll('.ps-block');
        blockEls.forEach(el => {
            el.addEventListener('mouseenter', () => {
                const idx = el.getAttribute('data-idx');
                psDesc.textContent = blocks[idx].desc;
                el.querySelector('rect').setAttribute('fill', 'rgba(0, 255, 136, 0.2)');
            });
            el.addEventListener('mouseleave', () => {
                psDesc.textContent = "Hover over a block to see details";
                el.querySelector('rect').setAttribute('fill', 'rgba(0,0,0,0.5)');
            });
        });

        // Block animation removed for stability; they will just render statically.
    }

    // CARD 5.2: Rectifiers Table & Waveforms
    const rectData = {
        hwr: {
            title: "Half-Wave Rectifier",
            rows: [["No. of Diodes", "1"], ["$V_{dc}$", "$V_m / \\pi$ (0.318 $V_m$)"], ["$I_{dc}$", "$I_m / \\pi$"], ["$V_{rms}$", "$V_m / 2$"], ["Efficiency ($\\eta$)", "40.6%"], ["Ripple Factor ($\\gamma$)", "1.21"], ["PIV", "$V_m$"], ["Ripple Freq", "$f_{in}$"]],
            wave: "M 10 60 Q 30 10 50 60 L 90 60 Q 110 10 130 60 L 170 60 Q 190 10 210 60 L 250 60 Q 270 10 290 60", color: "var(--mod3-color)"
        },
        ct: {
            title: "Center-Tap Full-Wave",
            rows: [["No. of Diodes", "2"], ["$V_{dc}$", "$2V_m / \\pi$ (0.636 $V_m$)"], ["$I_{dc}$", "$2I_m / \\pi$"], ["$V_{rms}$", "$V_m / \\sqrt{2}$"], ["Efficiency ($\\eta$)", "81.2%"], ["Ripple Factor ($\\gamma$)", "0.48"], ["PIV", "$2V_m$"], ["Ripple Freq", "$2f_{in}$"]],
            wave: "M 10 60 Q 30 10 50 60 Q 70 10 90 60 Q 110 10 130 60 Q 150 10 170 60 Q 190 10 210 60 Q 230 10 250 60 Q 270 10 290 60", color: "var(--mod4-color)"
        },
        br: {
            title: "Bridge Rectifier (FWR)",
            rows: [["No. of Diodes", "4"], ["$V_{dc}$", "$2V_m / \\pi$ (0.636 $V_m$)"], ["$I_{dc}$", "$2I_m / \\pi$"], ["$V_{rms}$", "$V_m / \\sqrt{2}$"], ["Efficiency ($\\eta$)", "81.2%"], ["Ripple Factor ($\\gamma$)", "0.48"], ["PIV", "$V_m$"], ["Ripple Freq", "$2f_{in}$"]],
            wave: "M 10 60 Q 30 10 50 60 Q 70 10 90 60 Q 110 10 130 60 Q 150 10 170 60 Q 190 10 210 60 Q 230 10 250 60 Q 270 10 290 60", color: "var(--mod1-color)"
        }
    };

    const tbody = document.getElementById('rect-table-body');
    const rectWave = document.getElementById('rect-wave-svg');
    const updateRectifier = (type) => {
        if (!tbody || !rectWave) return;
        const data = rectData[type];

        // Update table
        let html = '';
        data.rows.forEach(r => {
            html += `<tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <td style="padding: 8px; font-weight:bold;">${r[0]}</td>
                        <td style="padding: 8px;">${r[1]}</td>
                     </tr>`;
        });
        tbody.innerHTML = html;
        if (window.renderMathInElement) renderMathInElement(tbody);

        // Update SVG Waveform using D3 instead of innerHTML
        const svgW = d3.select(rectWave);
        svgW.selectAll("*").remove(); // Clear previous

        svgW.append("line")
            .attr("x1", 10).attr("y1", 60).attr("x2", 290).attr("y2", 60)
            .attr("stroke", "#475569").attr("stroke-dasharray", "2");

        const path = svgW.append("path")
            .attr("d", data.wave)
            .attr("fill", "none")
            .attr("stroke", data.color)
            .attr("stroke-width", 3)
            .attr("class", "glow-effect");

        // Anim path
        const pathNode = path.node();
        if (pathNode) {
            gsap.to(pathNode, { strokeDashoffset: 0, duration: 1, ease: "power1.inOut" });
        }
    };

    // Initialize
    if (document.getElementById('btn-rect-hwr')) {
        updateRectifier('hwr');
        ['hwr', 'ct', 'br'].forEach(type => {
            document.getElementById(`btn-rect-${type}`).addEventListener('click', (e) => {
                document.querySelectorAll('#btn-rect-hwr, #btn-rect-ct, #btn-rect-br').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                updateRectifier(type);
            });
        });
    }

    // ----------------------------------------------------------------------
    // MODULE 6: Bipolar Junction Transistor (BJT)
    // ----------------------------------------------------------------------

    // CARD 6.1: BJT Structure Animation
    const bjtAnim = document.getElementById('bjt-anim');
    if (bjtAnim) {
        // Create electron particles moving from Emitter to Collector (and a few to Base)
        let particlesHtml = '';
        for (let i = 0; i < 15; i++) {
            particlesHtml += `<circle class="bjt-electron-main" cx="0" cy="0" r="3" fill="var(--mod3-color)" filter="url(#glow)" />`;
        }
        for (let i = 0; i < 3; i++) {
            particlesHtml += `<circle class="bjt-electron-base" cx="0" cy="0" r="2" fill="var(--mod2-color)" />`;
        }
        bjtAnim.innerHTML += particlesHtml;

        const mainEls = bjtAnim.querySelectorAll('.bjt-electron-main');
        mainEls.forEach(el => {
            gsap.set(el, { x: 50 + Math.random() * 50, y: 60 + Math.random() * 80 });
            gsap.to(el, {
                x: 250 + Math.random() * 50, // Move to collector
                duration: 1.5 + Math.random(),
                repeat: -1,
                ease: "power1.inOut",
                delay: Math.random()
            });
        });

        const baseEls = bjtAnim.querySelectorAll('.bjt-electron-base');
        baseEls.forEach(el => {
            gsap.set(el, { x: 100 + Math.random() * 30, y: 60 + Math.random() * 80 });
            gsap.to(el, {
                x: 155, // Move to base region
                y: 160 + Math.random() * 20, // exit via base terminal
                duration: 2 + Math.random(),
                repeat: -1,
                ease: "power1.inOut",
                delay: Math.random()
            });
        });
    } // Closing brace for if (bjtAnim)

    // CARD 6.3: CE Output Characteristics (D3)
    if (document.getElementById('ce-curve-chart')) {
        const svgCE = d3.select("#ce-curve-chart").append("svg")
            .attr("viewBox", "0 0 400 250").attr("width", "100%").attr("height", "100%");

        const gce = svgCE.append("g").attr("transform", "translate(40, 210)");

        // Axes
        gce.append("line").attr("x1", 0).attr("x2", 340).attr("y1", 0).attr("y2", 0).attr("stroke", "#475569").attr("stroke-width", 2); // Vce
        gce.append("line").attr("x1", 0).attr("x2", 0).attr("y1", 0).attr("y2", -190).attr("stroke", "#475569").attr("stroke-width", 2); // Ic

        // Labels
        gce.append("text").attr("x", 320).attr("y", -10).fill("#94a3b8").text("Vce (V)").style("font-size", "12px");
        gce.append("text").attr("x", 10).attr("y", -180).fill("#94a3b8").text("Ic (mA)").style("font-size", "12px");

        // Generate curves for different Ib values
        const numCurves = 5;
        const lineCe = d3.line().x(d => d[0]).y(d => d[1]).curve(d3.curveMonotoneX);

        for (let i = 1; i <= numCurves; i++) {
            const points = [];
            const saturationVce = 10 + i * 2; // arbitrary scale for visual
            const activeIc = -i * 30; // higher Ib -> higher Ic (negative y is upward in SVG)

            for (let v = 0; v <= 300; v += 5) {
                if (v < saturationVce) {
                    points.push([v, activeIc * (v / saturationVce)]);
                } else {
                    // Early effect slope (slight upward tilt)
                    points.push([v, activeIc - ((v - saturationVce) * 0.05 * i)]);
                }
            }

            const path = gce.append("path")
                .attr("d", lineCe(points))
                .attr("fill", "none")
                .attr("stroke", i === numCurves ? "var(--mod2-color)" : `rgba(0, 245, 255, ${0.2 + 0.15 * i})`)
                .attr("stroke-width", 2)
                .attr("class", i === numCurves ? "glow-effect" : "");

            // Label the curve
            gce.append("text")
                .attr("x", 305)
                .attr("y", points[points.length - 1][1] - 5)
                .fill(i === numCurves ? "var(--mod2-color)" : "#94a3b8")
                .text(`Ib${i} `)
                .style("font-size", "10px");

            // Render curve statically without animation to ensure visibility
            const pathNode = path.node();
            if (pathNode) {
                // path is fully visible by default
            }
        }

        // Highlight Regions
        gce.append("rect").attr("x", 0).attr("y", -190).attr("width", 25).attr("height", 190).attr("fill", "rgba(0, 255, 136, 0.1)");
        gce.append("text").attr("x", 5).attr("y", -90).fill("var(--mod1-color)").text("Sat.").style("font-size", "9px").attr("transform", "rotate(-90 5,-90)");

        gce.append("rect").attr("x", 25).attr("y", -190).attr("width", 315).attr("height", 190).attr("fill", "rgba(0, 245, 255, 0.05)");
        gce.append("text").attr("x", 150).attr("y", -90).fill("var(--mod3-color)").text("Active Region").style("font-size", "12px").style("opacity", "0.5");

        gce.append("rect").attr("x", 0).attr("y", 0).attr("width", 340).attr("height", 20).attr("fill", "rgba(239, 68, 68, 0.1)");
        gce.append("text").attr("x", 150).attr("y", 15).fill("rgba(239, 68, 68, 0.8)").text("Cutoff Region").style("font-size", "10px");
    } // Closing brace for if (document.getElementById('ce-curve-chart'))

}); // Closing brace for DOMContentLoaded
