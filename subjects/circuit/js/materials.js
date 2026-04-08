// js/materials.js
// Handles Three.js 3D crystal structures and D3.js animated visualizations for Electrical Materials

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all material card components
    // Guards are handled per-function to avoid blocking the entire script


    const initFunctions = [
        initMaterialFundamentals, initAtomCounting, initCubicLattices,
        initCrystalComparison, initMillerBragg, initMagneticFundamentals,
        initMagnetostriction, initCurieGraph, initMagneticTypes,
        initLangevinPlot, initHysteresisTracer, initMaterialCalculators,
        initInternalField, initDielectricTypes, initActiveDielectrics,
        initDielectricSummary, initDielectricCalculators,
        initBreakdownGases, initBreakdownLiquids, initBreakdownSolids,
        initDielectricLoss, initDielectricStrength, initInsulatorProperties,
        initThermalClasses, initInsulatorClassification
    ];

    initFunctions.forEach(fn => {
        try {
            fn();
        } catch (e) {
            console.error(`Error in ${fn.name}:`, e);
        }
    });
});


// ──── Card 22: Crystal Fundamentals (Space Lattice & Basis) ────
function initMaterialFundamentals() {
    const container = document.getElementById('plot-material-1');
    if (!container) return;

    const w = container.clientWidth || 400, h = 280;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(4, 3, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    // Lattice (Points and Lines)
    const latticeGroup = new THREE.Group();
    const materialGeometry = new THREE.BufferGeometry();
    const points = [];
    const size = 1.5;

    for (let x = -size; x <= size; x += size) {
        for (let y = -size; y <= size; y += size) {
            for (let z = -size; z <= size; z += size) {
                points.push(new THREE.Vector3(x, y, z));
            }
        }
    }

    const pointsMaterial = new THREE.PointsMaterial({ color: 0xa78bfa, size: 0.2 });
    materialGeometry.setFromPoints(points);
    const latticePoints = new THREE.Points(materialGeometry, pointsMaterial);
    latticeGroup.add(latticePoints);

    // Add Grid Lines
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x374151, transparent: true, opacity: 0.5 });
    points.forEach(p1 => {
        points.forEach(p2 => {
            if (p1.distanceTo(p2) === size) {
                const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
                latticeGroup.add(new THREE.Line(geometry, lineMaterial));
            }
        });
    });

    scene.add(latticeGroup);

    let isBasisActive = false;
    let basisGroup = new THREE.Group();
    scene.add(basisGroup);

    // Interactivity
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let autoRotate = true;

    renderer.domElement.addEventListener('mousedown', (e) => { isDragging = true; autoRotate = false; });
    renderer.domElement.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaMove = { x: e.offsetX - previousMousePosition.x, y: e.offsetY - previousMousePosition.y };
            latticeGroup.rotation.y += deltaMove.x * 0.01;
            latticeGroup.rotation.x += deltaMove.y * 0.01;
            basisGroup.rotation.y += deltaMove.x * 0.01;
            basisGroup.rotation.x += deltaMove.y * 0.01;
        }
        previousMousePosition = { x: e.offsetX, y: e.offsetY };
    });
    window.addEventListener('mouseup', () => { isDragging = false; });

    // Morph Basis Button
    const morphBtn = document.getElementById("btn-lattice-morph");
    if (morphBtn) {
        morphBtn.onclick = () => {
            isBasisActive = !isBasisActive;
            if (isBasisActive) {
                morphBtn.textContent = "✨ Remove Basis";
                latticePoints.material.size = 0.05; // Shrink points

                // Add "atoms" (spheres)
                const sphereGeo = new THREE.SphereGeometry(0.3, 16, 16);
                const sphereMat = new THREE.MeshBasicMaterial({ color: 0xa78bfa });
                points.forEach(p => {
                    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
                    mesh.position.copy(p);
                    mesh.scale.set(0, 0, 0);
                    basisGroup.add(mesh);
                    gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "back.out(1.7)", delay: Math.random() * 0.5 });
                });
            } else {
                morphBtn.textContent = "✨ Morph Basis";
                latticePoints.material.size = 0.2; // Restore points
                basisGroup.children.forEach(child => {
                    gsap.to(child.scale, { x: 0, y: 0, z: 0, duration: 0.5, onComplete: () => basisGroup.remove(child) });
                });
            }
        };
    }

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        if (autoRotate) {
            latticeGroup.rotation.y += 0.005;
            latticeGroup.rotation.x += 0.002;
            basisGroup.rotation.y += 0.005;
            basisGroup.rotation.x += 0.002;
        }
        renderer.render(scene, camera);
    }
    animate();
}

// ──── Card 23: Atom Counting & APF (D3.js) ────
function initAtomCounting() {
    const container = d3.select("#plot-material-2");
    if (container.empty()) return;

    const w = container.node().clientWidth || 400, h = 280;
    const svg = container.append("svg").attr("width", w).attr("height", h);

    // 2D Representation of Unit Cell
    const size = 120;
    const cx = w / 2, cy = h / 2;

    // Draw Cube wireframe (isometric-ish projection)
    const points = {
        ftl: { x: cx - size / 2, y: cy - size / 2 }, ftr: { x: cx + size / 2, y: cy - size / 2 },
        fbl: { x: cx - size / 2, y: cy + size / 2 }, fbr: { x: cx + size / 2, y: cy + size / 2 },
        btl: { x: cx - size / 4, y: cy - size * 0.75 }, btr: { x: cx + size * 0.75, y: cy - size * 0.75 },
        bbl: { x: cx - size / 4, y: cy + size / 4 }, bbr: { x: cx + size * 0.75, y: cy + size / 4 }
    };

    const drawLine = (p1, p2, dashed = false) => {
        svg.append("line").attr("x1", points[p1].x).attr("y1", points[p1].y)
            .attr("x2", points[p2].x).attr("y2", points[p2].y)
            .attr("stroke", "var(--unit-white)").attr("stroke-width", 2).attr("opacity", 0.3)
            .attr("stroke-dasharray", dashed ? "5,5" : "none");
    };

    // Front face
    drawLine('ftl', 'ftr'); drawLine('fbl', 'fbr'); drawLine('ftl', 'fbl'); drawLine('ftr', 'fbr');
    // Back face (dashed for depth)
    drawLine('btl', 'btr', true); drawLine('bbl', 'bbr', true); drawLine('btl', 'bbl', true); drawLine('btr', 'bbr', true);
    // Connecting edges
    drawLine('ftl', 'btl'); drawLine('ftr', 'btr'); drawLine('fbl', 'bbl', true); drawLine('fbr', 'bbr');

    // Add Atoms (Interactive)
    const atoms = [
        { ...points.ftl, type: 'Corner (1/8)', col: '#a78bfa' },
        { x: (points.ftl.x + points.ftr.x) / 2, y: points.ftl.y, type: 'Edge (1/4)', col: '#00f5ff' },
        { x: cx, y: cy, type: 'Face (1/2)', col: '#facc15' },
        { x: cx + size / 8, y: cy - size / 8, type: 'Body (1)', col: '#ffffff' }
    ];

    const tooltip = svg.append("text").attr("x", w / 2).attr("y", h - 20).attr("text-anchor", "middle").attr("fill", "var(--unit-white)").style("opacity", 0);

    svg.selectAll(".atom-node")
        .data(atoms).enter()
        .append("circle")
        .attr("class", "atom-node")
        .attr("cx", d => d.x).attr("cy", d => d.y).attr("r", 15)
        .attr("fill", d => d.col).style("cursor", "pointer")
        .on("mouseover", function (e, d) {
            d3.select(this).transition().duration(200).attr("r", 20);
            tooltip.text(d.type).transition().duration(200).style("opacity", 1).attr("fill", d.col);
        })
        .on("mouseout", function () {
            d3.select(this).transition().duration(200).attr("r", 15);
            tooltip.transition().duration(200).style("opacity", 0);
        });

    // Simple continuous pulse for visual interest
    function pulse() {
        svg.selectAll(".atom-node").transition().duration(1500).attr("r", 18).transition().duration(1500).attr("r", 15).on("end", pulse);
    }
    pulse();
}

// ──── Card 24, 25, 26: Specific Cubic Lattices (SC, BCC, FCC) ────
function initCubicLattices() {
    function createStructure(containerId, atomPositions, linkPairs, color) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const w = container.clientWidth || 400, h = 280;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
        camera.position.set(3, 3, 4);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(w, h);
        container.appendChild(renderer.domElement);

        const group = new THREE.Group();

        // Add Atoms
        const sphereGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: color });

        atomPositions.forEach(pos => {
            const mesh = new THREE.Mesh(sphereGeo, material);
            mesh.position.set(pos[0], pos[1], pos[2]);
            group.add(mesh);
        });

        // Add Links (wireframe/bonds)
        const lineMat = new THREE.LineBasicMaterial({ color: 0x374151, transparent: true, opacity: 0.6 });
        linkPairs.forEach(pair => {
            const p1 = new THREE.Vector3(...atomPositions[pair[0]]);
            const p2 = new THREE.Vector3(...atomPositions[pair[1]]);
            const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
            group.add(new THREE.Line(geometry, lineMat));
        });

        scene.add(group);

        let isDragging = false, previousMousePosition = { x: 0, y: 0 }, autoRotate = true;
        renderer.domElement.addEventListener('mousedown', () => { isDragging = true; autoRotate = false; });
        renderer.domElement.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaMove = { x: e.offsetX - previousMousePosition.x, y: e.offsetY - previousMousePosition.y };
                group.rotation.y += deltaMove.x * 0.01;
                group.rotation.x += deltaMove.y * 0.01;
            }
            previousMousePosition = { x: e.offsetX, y: e.offsetY };
        });
        window.addEventListener('mouseup', () => { isDragging = false; });

        function animate() {
            requestAnimationFrame(animate);
            if (autoRotate) { group.rotation.y += 0.01; group.rotation.x += 0.005; }
            renderer.render(scene, camera);
        }
        animate();
    }

    const corners = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];
    const cubeLinks = [
        [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    // SC: Just corners (Blue)
    createStructure('plot-material-3', corners, cubeLinks, 0x60a5fa);

    // BCC: Corners + Body Centre (Orange)
    const bccAtoms = [...corners, [0, 0, 0]];
    const bccLinks = [...cubeLinks, [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8]];
    createStructure('plot-material-4', bccAtoms, bccLinks, 0xf97316);

    // FCC: Corners + Face Centres (Green)
    const fccAtoms = [...corners,
    [0, -1, 0], [0, 1, 0], // Bottom, Top
    [-1, 0, 0], [1, 0, 0], // Left, Right
    [0, 0, -1], [0, 0, 1]  // Front, Back
    ];
    // Simplifying links for FCC to just outline for clarity
    createStructure('plot-material-5', fccAtoms, cubeLinks, 0x00ff88);
}

// ──── Card 27: Crystal Comparison Ranking (D3.js Race) ────
function initCrystalComparison() {
    const container = d3.select("#plot-material-6");
    if (container.empty()) return;

    const w = container.node().clientWidth || 800, h = 350, m = { t: 40, r: 20, b: 40, l: 80 };
    const svg = container.append("svg").attr("width", w).attr("height", h);

    const data = [
        { name: "Diamond", apf: 34, color: "#fb7185" },
        { name: "SC", apf: 52, color: "#60a5fa" },
        { name: "BCC", apf: 68, color: "#f97316" },
        { name: "FCC", apf: 74, color: "#00ff88" }
    ];

    const x = d3.scaleLinear().domain([0, 100]).range([m.l, w - m.r]);
    const y = d3.scaleBand().domain(data.map(d => d.name)).range([m.t, h - m.b]).padding(0.3);

    // Axes
    svg.append("g").attr("transform", `translate(0,${h - m.b})`).call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "%"))
        .attr("color", "var(--text-muted)");
    svg.append("g").attr("transform", `translate(${m.l},0)`).call(d3.axisLeft(y))
        .attr("color", "var(--text-muted)").style("font-size", "14px");

    // Bars
    const bars = svg.selectAll(".bar")
        .data(data).enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.name))
        .attr("height", y.bandwidth())
        .attr("x", x(0))
        .attr("width", 0) // Start at 0 for animation
        .attr("fill", d => d.color)
        .attr("rx", 5);

    // Labels
    const labels = svg.selectAll(".label")
        .data(data).enter()
        .append("text")
        .attr("class", "label")
        .attr("y", d => y(d.name) + y.bandwidth() / 2 + 5)
        .attr("x", x(0) + 10)
        .attr("fill", "#fff")
        .text("0%");

    // Animate Race on Intersection (or just delay)
    setTimeout(() => {
        bars.transition().duration(2000).ease(d3.easeCubicOut)
            .attr("width", d => x(d.apf) - x(0));

        labels.transition().duration(2000).ease(d3.easeCubicOut)
            .attr("x", d => x(d.apf) + 10)
            .tween("text", function (d) {
                const i = d3.interpolateRound(0, d.apf);
                return function (t) { this.textContent = i(t) + "%"; };
            });
    }, 1000);
}

// ──── Card 28: Miller Indices & Bragg's Law ────
function initMillerBragg() {
    const container = document.getElementById('plot-material-7');
    if (!container) return;

    const w = container.clientWidth || 400, h = 300;

    // We'll split the container into two halves: Left for 3D Cube (Miller), Right for SVG (Bragg)
    container.style.display = "flex";
    container.style.gap = "1rem";

    // Left: Miller Indices (Three.js)
    const millerDiv = document.createElement("div");
    millerDiv.style.flex = "1";
    millerDiv.style.position = "relative";
    container.appendChild(millerDiv);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, (w / 2) / h, 0.1, 100);
    camera.position.set(2.5, 2.5, 3.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w / 2, h);
    millerDiv.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Draw Axis (x, y, z)
    const axisMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const axes = [
        [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1.5, 0, 0)], // x
        [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1.5, 0)], // y
        [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1.5)]  // z
    ];
    axes.forEach(pts => {
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        group.add(new THREE.Line(geo, axisMat));
    });

    // Draw Unit Cube Outline
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    boxGeo.translate(0.5, 0.5, 0.5); // align corner to origin
    const edges = new THREE.EdgesGeometry(boxGeo);
    const boxLines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x374151 }));
    group.add(boxLines);

    // The Miller Plane
    let planeMesh = null;
    function drawPlane(h_idx, k_idx, l_idx) {
        if (planeMesh) group.remove(planeMesh);

        // Intercepts (1/h, 1/k, 1/l). If index is 0, intercept is infinity (parallel)
        const ix = h_idx === 0 ? 999 : 1 / h_idx;
        const iy = k_idx === 0 ? 999 : 1 / k_idx;
        const iz = l_idx === 0 ? 999 : 1 / l_idx;

        const pts = [];
        // Determine vertices of the plane bounded by the unit cube [0,1]^3
        // This is a simplified visualizer primarily for standard positive indices (100, 110, 111, 210 etc)

        if (h_idx > 0 && k_idx === 0 && l_idx === 0) { // (100)
            pts.push(new THREE.Vector3(ix, 0, 0), new THREE.Vector3(ix, 1, 0), new THREE.Vector3(ix, 1, 1), new THREE.Vector3(ix, 0, 1));
        } else if (h_idx === 0 && k_idx > 0 && l_idx === 0) { // (010)
            pts.push(new THREE.Vector3(0, iy, 0), new THREE.Vector3(0, iy, 1), new THREE.Vector3(1, iy, 1), new THREE.Vector3(1, iy, 0));
        } else if (h_idx === 0 && k_idx === 0 && l_idx > 0) { // (001)
            pts.push(new THREE.Vector3(0, 0, iz), new THREE.Vector3(1, 0, iz), new THREE.Vector3(1, 1, iz), new THREE.Vector3(0, 1, iz));
        } else if (h_idx > 0 && k_idx > 0 && l_idx === 0) { // Pts on x, y, z-parallel
            pts.push(new THREE.Vector3(ix, 0, 0), new THREE.Vector3(0, iy, 0), new THREE.Vector3(0, iy, 1), new THREE.Vector3(ix, 0, 1));
        } else if (h_idx > 0 && k_idx === 0 && l_idx > 0) {
            pts.push(new THREE.Vector3(ix, 0, 0), new THREE.Vector3(ix, 1, 0), new THREE.Vector3(0, 1, iz), new THREE.Vector3(0, 0, iz));
        } else if (h_idx === 0 && k_idx > 0 && l_idx > 0) {
            pts.push(new THREE.Vector3(0, iy, 0), new THREE.Vector3(1, iy, 0), new THREE.Vector3(1, 0, iz), new THREE.Vector3(0, 0, iz));
        } else if (h_idx > 0 && k_idx > 0 && l_idx > 0) { // (111) etc
            pts.push(new THREE.Vector3(ix, 0, 0), new THREE.Vector3(0, iy, 0), new THREE.Vector3(0, 0, iz));
        }

        if (pts.length >= 3) {
            const geom = new THREE.BufferGeometry().setFromPoints(pts);
            // computeVertexNormals requires indexed or specific triangle setup, we'll use a basic double-sided material
            const mat = new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.6, side: THREE.DoubleSide });

            // For general polygons in ThreeJS without EarCut, we do a simple fan from pts[0]
            const indices = [];
            for (let i = 1; i < pts.length - 1; i++) {
                indices.push(0, i, i + 1);
            }
            geom.setIndex(indices);
            geom.computeVertexNormals();

            planeMesh = new THREE.Mesh(geom, mat);
            // shift to origin center for rotation
            planeMesh.position.set(-0.5, -0.5, -0.5);
            group.add(planeMesh);

            // Pulse animation
            gsap.fromTo(planeMesh.material, { opacity: 0.2 }, { opacity: 0.8, duration: 0.5, yoyo: true, repeat: 1 });
        }
    }

    // Shift group center for better rotation pivoting
    group.position.set(-0.5, -0.5, -0.5);

    // UI Controls for Miller
    const ctrlDiv = document.createElement("div");
    ctrlDiv.style.position = "absolute";
    ctrlDiv.style.bottom = "10px";
    ctrlDiv.style.left = "10px";
    ctrlDiv.innerHTML = `
        <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:5px;">Presets (h k l)</div>
        <button id="btn-m100" class="ac-btn-icon" style="padding: 2px 6px; font-size: 0.75rem;">(100)</button>
        <button id="btn-m110" class="ac-btn-icon" style="padding: 2px 6px; font-size: 0.75rem;">(110)</button>
        <button id="btn-m111" class="ac-btn-icon" style="padding: 2px 6px; font-size: 0.75rem;">(111)</button>
    `;
    millerDiv.appendChild(ctrlDiv);

    const btn100 = document.getElementById("btn-m100");
    if (btn100) btn100.onclick = () => drawPlane(1, 0, 0);
    const btn110 = document.getElementById("btn-m110");
    if (btn110) btn110.onclick = () => drawPlane(1, 1, 0);
    const btn111 = document.getElementById("btn-m111");
    if (btn111) btn111.onclick = () => drawPlane(1, 1, 1);

    drawPlane(1, 1, 1); // init

    let isDragging = false, prevMouse = { x: 0, y: 0 }, isAuto = true;
    renderer.domElement.addEventListener('mousedown', () => { isDragging = true; isAuto = false; });
    renderer.domElement.addEventListener('mousemove', (e) => {
        if (isDragging) {
            group.rotation.y += (e.offsetX - prevMouse.x) * 0.01;
            group.rotation.x += (e.offsetY - prevMouse.y) * 0.01;
        }
        prevMouse = { x: e.offsetX, y: e.offsetY };
    });
    window.addEventListener('mouseup', () => isDragging = false);

    // Right: Bragg's Law (SVG)
    const braggDiv = document.createElement("div");
    braggDiv.style.flex = "1";
    braggDiv.style.position = "relative";
    container.appendChild(braggDiv);

    const svg = d3.select(braggDiv).append("svg").attr("width", w / 2).attr("height", h);

    // Draw Crystal Planes
    const bW = w / 2, bH = h;
    const dSpacing = 40;
    const p1y = bH / 2 - dSpacing / 2;
    const p2y = bH / 2 + dSpacing / 2;

    svg.append("line").attr("x1", 20).attr("y1", p1y).attr("x2", bW - 20).attr("y2", p1y).attr("stroke", "#374151").attr("stroke-width", 3);
    svg.append("line").attr("x1", 20).attr("y1", p2y).attr("x2", bW - 20).attr("y2", p2y).attr("stroke", "#374151").attr("stroke-width", 3);

    // Draw Atoms on planes
    for (let i = 40; i < bW - 20; i += 40) {
        svg.append("circle").attr("cx", i).attr("cy", p1y).attr("r", 6).attr("fill", "var(--unit-purple)");
        svg.append("circle").attr("cx", i).attr("cy", p2y).attr("r", 6).attr("fill", "var(--unit-purple)");
    }

    // Incident X-Rays
    const thetaLine = svg.append("g");
    const ray1In = thetaLine.append("line").attr("stroke", "var(--unit-gold)").attr("stroke-width", 2).attr("marker-end", "url(#arrowhead)");
    const ray1Out = thetaLine.append("line").attr("stroke", "var(--unit-gold)").attr("stroke-width", 2);
    const ray2In = thetaLine.append("line").attr("stroke", "var(--unit-cyan)").attr("stroke-width", 2).attr("marker-end", "url(#arrowhead)");
    const ray2Out = thetaLine.append("line").attr("stroke", "var(--unit-cyan)").attr("stroke-width", 2);

    // Path difference highlights
    const pathDiff1 = thetaLine.append("line").attr("stroke", "var(--unit-red)").attr("stroke-width", 3).attr("stroke-dasharray", "4,4");
    const pathDiff2 = thetaLine.append("line").attr("stroke", "var(--unit-red)").attr("stroke-width", 3).attr("stroke-dasharray", "4,4");

    // Add arrowhead def
    svg.append("defs").append("marker")
        .attr("id", "arrowhead").attr("viewBox", "0 -5 10 10").attr("refX", 8).attr("refY", 0)
        .attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto")
        .append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", "var(--unit-gold)");

    // Controls
    const braggCtrl = document.createElement("div");
    braggCtrl.style.position = "absolute";
    braggCtrl.style.bottom = "10px";
    braggCtrl.style.left = "0";
    braggCtrl.style.width = "100%";
    braggCtrl.style.textAlign = "center";
    braggCtrl.innerHTML = `<label style="color:white;font-size:0.8rem;">Angle θ <input type="range" id="bragg-theta" min="10" max="80" value="30"></label>`;
    braggDiv.appendChild(braggCtrl);

    function updateBragg() {
        const thetaDeg = parseInt(document.getElementById("bragg-theta").value);
        const rad = thetaDeg * Math.PI / 180;

        // Target points (atoms to hit)
        const hit1 = { x: bW / 2 - 20, y: p1y };
        const hit2 = { x: bW / 2 + 20, y: p2y };

        // Calculate hypotenuse to edge
        const l1 = hit1.y / Math.sin(rad);
        const start1 = { x: hit1.x - hit1.y / Math.tan(rad), y: 0 };
        const end1 = { x: hit1.x + (bH - hit1.y) / Math.tan(rad), y: bH }; // Reflected symmetric

        const start2 = { x: hit2.x - hit2.y / Math.tan(rad), y: 0 };
        const end2 = { x: hit2.x + (bH - hit2.y) / Math.tan(rad), y: bH };

        ray1In.attr("x1", start1.x).attr("y1", start1.y).attr("x2", hit1.x).attr("y2", hit1.y);
        ray1Out.attr("x1", hit1.x).attr("y1", hit1.y).attr("x2", end1.x).attr("y2", end1.y);

        ray2In.attr("x1", start2.x).attr("y1", start2.y).attr("x2", hit2.x).attr("y2", hit2.y);
        ray2Out.attr("x1", hit2.x).attr("y1", hit2.y).attr("x2", end2.x).attr("y2", end2.y);

        // Draw path difference perpendiculars
        // Drop perpendicular from hit1 onto ray2In and ray2Out
        // x_perp = hit1.x, y_perp = ray2In line at that x? No, geometric approx for visual
        const shiftX = dSpacing / Math.tan(rad);
        pathDiff1.attr("x1", hit1.x).attr("y1", hit1.y).attr("x2", hit2.x - shiftX).attr("y2", hit1.y); // Approx horizontal ref
    }

    const braggSlider = document.getElementById("bragg-theta");
    if (braggSlider) braggSlider.addEventListener("input", updateBragg);
    updateBragg();

    function animate() {
        requestAnimationFrame(animate);
        if (isAuto) {
            group.rotation.y += 0.005;
            group.rotation.x += 0.002;
        }
        renderer.render(scene, camera);
    }
    animate();
}

// ──── Card 29: Magnetic Fundamentals ────
function initMagneticFundamentals() {
    const container = d3.select("#plot-material-8");
    if (container.empty()) return;

    const w = container.node().clientWidth || 800, h = 250;
    container.style("display", "flex").style("gap", "1rem");

    // 1. Dipole SVG
    const dipDiv = container.append("div").style("flex", "1").style("text-align", "center");
    dipDiv.append("div").style("font-size", "0.8rem").style("color", "var(--text-muted)").style("margin-bottom", "5px").text("Magnetic Dipole");
    const svgDip = dipDiv.append("svg").attr("width", "100%").attr("height", h - 30);

    // Magnet Bar
    const bW = 100, bH = 30;
    const cx = (w / 3) / 2, cy = (h - 30) / 2;

    svgDip.append("rect").attr("x", cx - bW / 2).attr("y", cy - bH / 2).attr("width", bW / 2).attr("height", bH).attr("fill", "var(--unit-red)"); // N
    svgDip.append("rect").attr("x", cx).attr("y", cy - bH / 2).attr("width", bW / 2).attr("height", bH).attr("fill", "var(--unit-blue)"); // S
    svgDip.append("text").attr("x", cx - bW / 4).attr("y", cy + 5).attr("fill", "white").attr("text-anchor", "middle").text("N");
    svgDip.append("text").attr("x", cx + bW / 4).attr("y", cy + 5).attr("fill", "white").attr("text-anchor", "middle").text("S");

    // Field lines sketch
    for (let i = 1; i <= 3; i++) {
        const ry = 20 * i;
        svgDip.append("path").attr("d", `M ${cx - bW / 2} ${cy - bH / 2} Q ${cx} ${cy - bH / 2 - ry} ${cx + bW / 2} ${cy - bH / 2}`)
            .attr("fill", "none").attr("stroke", "var(--text-muted)").attr("stroke-dasharray", "4,4").attr("class", "field-line");
        svgDip.append("path").attr("d", `M ${cx - bW / 2} ${cy + bH / 2} Q ${cx} ${cy + bH / 2 + ry} ${cx + bW / 2} ${cy + bH / 2}`)
            .attr("fill", "none").attr("stroke", "var(--text-muted)").attr("stroke-dasharray", "4,4").attr("class", "field-line");
    }

    // Dipole moment m arrow (S to N inside)
    svgDip.append("line").attr("x1", cx + 20).attr("y1", cy + bH + 15).attr("x2", cx - 20).attr("y2", cy + bH + 15)
        .attr("stroke", "var(--unit-gold)").attr("stroke-width", 2).attr("marker-end", "url(#arrowhead)");
    svgDip.append("text").attr("x", cx).attr("y", cy + bH + 30).attr("fill", "var(--unit-gold)").attr("text-anchor", "middle").text("m = IA");

    // 2. Vector Addition B = μ0(H + M)
    const vecDiv = container.append("div").style("flex", "1").style("text-align", "center");
    vecDiv.append("div").style("font-size", "0.8rem").style("color", "var(--text-muted)").style("margin-bottom", "5px").text("B = μ₀(H + M)");
    const svgVec = vecDiv.append("svg").attr("width", "100%").attr("height", h - 30);
    const vx = 20, vy = cy;

    // Base line
    svgVec.append("line").attr("x1", vx).attr("y1", vy).attr("x2", (w / 3) - 20).attr("y2", vy).attr("stroke", "#374151").attr("stroke-dasharray", "2,2");

    // Vectors
    const vecH = svgVec.append("line").attr("x1", vx).attr("y1", vy).attr("x2", vx + 50).attr("y2", vy).attr("stroke", "var(--unit-cyan)").attr("stroke-width", 4).attr("marker-end", "url(#arrowhead)");
    const lblH = svgVec.append("text").attr("x", vx + 25).attr("y", vy - 10).attr("fill", "var(--unit-cyan)").attr("text-anchor", "middle").text("H");

    const vecM = svgVec.append("line").attr("x1", vx + 50).attr("y1", vy).attr("x2", vx + 100).attr("y2", vy).attr("stroke", "var(--unit-purple)").attr("stroke-width", 4).attr("marker-end", "url(#arrowhead)");
    const lblM = svgVec.append("text").attr("x", vx + 75).attr("y", vy - 10).attr("fill", "var(--unit-purple)").attr("text-anchor", "middle").text("M");

    const vecB = svgVec.append("line").attr("x1", vx).attr("y1", vy + 20).attr("x2", vx + 100).attr("y2", vy + 20).attr("stroke", "var(--unit-gold)").attr("stroke-width", 2).attr("marker-end", "url(#arrowhead)");
    const lblB = svgVec.append("text").attr("x", vx + 50).attr("y", vy + 35).attr("fill", "var(--unit-gold)").attr("text-anchor", "middle").text("B (Total)");

    // Controls
    const vecCtrl = vecDiv.append("div").style("margin-top", "-10px");
    vecCtrl.html(`<label style="color:white;font-size:0.75rem;">Apply H <input type="range" id="mag-h-slider" min="0" max="100" value="50"></label>`);

    const magHSlider = document.getElementById("mag-h-slider");
    if (magHSlider) magHSlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value);
        const lenH = val;
        // Simple linear M = chi * H simulation (assuming chi > 0 ferromagnetic)
        const lenM = val * 1.5;

        vecH.attr("x2", vx + lenH);
        lblH.attr("x", vx + lenH / 2);

        vecM.attr("x1", vx + lenH).attr("x2", vx + lenH + lenM);
        lblM.attr("x", vx + lenH + lenM / 2);

        vecB.attr("x2", vx + lenH + lenM);
        lblB.attr("x", vx + (lenH + lenM) / 2);
    });

}

// ──── Card 30: Magnetostriction & Anisotropy ────
function initMagnetostriction() {
    const container = d3.select("#plot-material-9");
    if (container.empty()) return;

    const w = container.node().clientWidth || 800, h = 280; // Tighter height constraint to remove bottom gap
    container.style("display", "flex").style("flex-direction", "column").style("align-items", "center").style("width", "100%");

    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${w} ${h}`)
        .style("max-width", `${w}px`);

    const cx = w / 2, cy = h / 2 - 40; // Center vertically within the new height
    const padding = w / 3.2; // Increase spread

    // Base unmagnetized blocks
    const baseW = 140, baseH = 140; // Extremely large blocks to fill the space

    // 1. Longitudinal
    const gLong = svg.append("g").attr("transform", `translate(${cx - padding}, ${cy})`);
    gLong.append("text").attr("y", -90).attr("fill", "white").attr("text-anchor", "middle").style("font-size", "1.1rem").text("Longitudinal");
    const rectLong = gLong.append("rect").attr("x", -baseW / 2).attr("y", -baseH / 2).attr("width", baseW).attr("height", baseH).attr("fill", "var(--unit-cyan)").attr("opacity", 0.7);

    // 2. Transverse
    const gTrans = svg.append("g").attr("transform", `translate(${cx}, ${cy})`);
    gTrans.append("text").attr("y", -90).attr("fill", "white").attr("text-anchor", "middle").style("font-size", "1.1rem").text("Transverse");
    const rectTrans = gTrans.append("rect").attr("x", -baseW / 2).attr("y", -baseH / 2).attr("width", baseW).attr("height", baseH).attr("fill", "var(--unit-gold)").attr("opacity", 0.7);

    // 3. Volume
    const gVol = svg.append("g").attr("transform", `translate(${cx + padding}, ${cy})`);
    gVol.append("text").attr("y", -90).attr("fill", "white").attr("text-anchor", "middle").style("font-size", "1.1rem").text("Volume");
    const rectVol = gVol.append("rect").attr("x", -baseW / 2).attr("y", -baseH / 2).attr("width", baseW).attr("height", baseH).attr("fill", "var(--unit-purple)").attr("opacity", 0.7);

    // H field indicator arrows
    const hArrows = svg.append("g").attr("opacity", 0);
    [cx - padding, cx, cx + padding].forEach(x => {
        hArrows.append("line").attr("x1", x - 90).attr("y1", cy + 100).attr("x2", x + 90).attr("y2", cy + 100)
            .attr("stroke", "var(--unit-red)").attr("stroke-width", 3).attr("marker-end", "url(#arrowhead)");
        hArrows.append("text").attr("x", x).attr("y", cy + 120).attr("fill", "var(--unit-red)").attr("text-anchor", "middle").style("font-size", "1rem").text("H Field");
    });

    const ctrl = container.append("div").style("margin-top", "20px").style("margin-bottom", "10px");
    ctrl.html(`<label style="color:white;font-size:1.1rem;">Apply H-Field <input type="range" id="ms-slider" min="0" max="100" value="0" style="width:250px;margin-left:15px;"></label>`);

    let isVillari = false;
    const villariBtn = document.getElementById("btn-villari-toggle");
    if (villariBtn) {
        villariBtn.addEventListener("click", (e) => {
            isVillari = !isVillari;
            e.target.textContent = isVillari ? "🔄 Magnetostriction Context" : "🔄 Villari Effect Toggle";
            e.target.style.background = isVillari ? "var(--unit-red)" : "";
            ctrl.html(isVillari ?
                `<label style="color:var(--unit-red);font-size:0.8rem;">Apply Mechanical Stress <input type="range" id="ms-slider" min="0" max="100" value="0"></label>` :
                `<label style="color:white;font-size:0.8rem;">Apply H-Field <input type="range" id="ms-slider" min="0" max="100" value="0"></label>`
            );
            bindSlider();
        });

        function bindSlider() {
            document.getElementById("ms-slider").addEventListener("input", (e) => {
                const val = parseInt(e.target.value);
                const factor = val / 100; // 0 to 1

                if (!isVillari) {
                    hArrows.attr("opacity", factor > 0 ? 1 : 0);

                    // Longitudinal: length increases, width decreases slightly (Poisson)
                    rectLong.attr("width", baseW + factor * 60).attr("x", -(baseW + factor * 60) / 2);
                    rectLong.attr("height", baseH - factor * 20).attr("y", -(baseH - factor * 20) / 2);

                    // Transverse: width increases
                    rectTrans.attr("height", baseH + factor * 60).attr("y", -(baseH + factor * 60) / 2);

                    // Volume: expands evenly
                    rectVol.attr("width", baseW + factor * 40).attr("x", -(baseW + factor * 40) / 2);
                    rectVol.attr("height", baseH + factor * 40).attr("y", -(baseH + factor * 40) / 2);
                } else {
                    hArrows.attr("opacity", 0); // Hide H arrows when applying stress
                    // Squeeze animations for stress
                    rectLong.attr("width", baseW + factor * 30).attr("height", baseH - factor * 40).attr("y", -(baseH - factor * 40) / 2).attr("x", -(baseW + factor * 30) / 2);
                    // Color intensity indicates changes in B (Villari)
                    rectLong.attr("fill", d3.interpolateLab("var(--unit-cyan)", "var(--unit-red)")(factor));
                    rectTrans.attr("fill", d3.interpolateLab("var(--unit-gold)", "var(--unit-red)")(factor));
                    rectVol.attr("fill", d3.interpolateLab("var(--unit-purple)", "var(--unit-red)")(factor));
                }
            });
        }
        bindSlider();
    }
}

// ──── Card 31: Curie Temperature Laws (D3.js Graph) ────
function initCurieGraph() {
        const container = d3.select("#plot-material-10");
        if (container.empty()) return;

        const w = container.node().clientWidth || 800, h = 330;
        const m = { t: 20, r: 20, b: 40, l: 60 };
        const innerW = w - m.l - m.r, innerH = h - m.t - m.b;

        const svg = container.append("svg").attr("width", w).attr("height", h);
        const g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);

        // Domain: Temp T from 1 to 1000 K
        const xScale = d3.scaleLinear().domain([0, 1000]).range([0, innerW]);
        // Range: Susceptibility chi from -5 to 50
        const yScale = d3.scaleLinear().domain([0, 50]).range([innerH, 0]).clamp(true);

        // Axes
        g.append("g").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(xScale).ticks(10))
            .attr("color", "var(--text-muted)");
        g.append("g").call(d3.axisLeft(yScale).ticks(5))
            .attr("color", "var(--text-muted)");

        g.append("text").attr("x", innerW / 2).attr("y", innerH + 35).attr("fill", "var(--text-muted)").style("font-size", "12px").text("Temperature T (K)");
        g.append("text").attr("transform", "rotate(-90)").attr("x", -innerH / 2).attr("y", -40).attr("fill", "var(--text-muted)").style("font-size", "12px").text("Susceptibility χ");

        // Constants
        let Tc = 400; // Curie / Neel temp
        let C = 5000; // Curie constant scale

        const linePara = d3.line().x(d => xScale(d)).y(d => yScale(C / d));
        const lineFerro = d3.line().defined(d => d > Tc).x(d => xScale(d)).y(d => yScale(C / (d - Tc)));
        const lineAnti = d3.line().defined(d => d > Tc).x(d => xScale(d)).y(d => yScale(C / (d + Tc)));

        const tData = d3.range(10, 1000, 5);

        // Draw paths
        const pathPara = g.append("path").attr("fill", "none").attr("stroke", "var(--unit-cyan)").attr("stroke-width", 2).attr("d", linePara(tData));
        const pathFerro = g.append("path").attr("fill", "none").attr("stroke", "var(--unit-gold)").attr("stroke-width", 2).attr("d", lineFerro(tData));
        const pathAnti = g.append("path").attr("fill", "none").attr("stroke", "var(--unit-orange)").attr("stroke-width", 2).attr("d", lineAnti(tData));

        // Tc boundary line
        const tcLine = g.append("line").attr("x1", xScale(Tc)).attr("y1", 0).attr("x2", xScale(Tc)).attr("y2", innerH)
            .attr("stroke", "var(--unit-red)").attr("stroke-width", 2).attr("stroke-dasharray", "4,4");
        g.append("text").attr("x", xScale(Tc) + 5).attr("y", 20).attr("fill", "var(--unit-red)").style("font-size", "12px").text("Tc / Tn");

        // Scanner
        const scanner = g.append("line").attr("x1", xScale(300)).attr("y1", 0).attr("x2", xScale(300)).attr("y2", innerH)
            .attr("stroke", "white").attr("stroke-width", 1).attr("opacity", 0.5);
        const scanDot = g.append("circle").attr("cx", xScale(300)).attr("cy", yScale(C / 300)).attr("r", 5).attr("fill", "white");
        const scanLbl = g.append("text").attr("x", xScale(300) + 10).attr("y", yScale(C / 300) - 10).attr("fill", "white").style("font-size", "12px");

        // Controls
        const ctrlDiv = container.append("div").style("margin-top", "10px").style("display", "flex").style("justify-content", "center").style("gap", "20px");
        ctrlDiv.html(`
        <label style="color:white;font-size:0.8rem;">Current Temp T <input type="range" id="curie-t-slider" min="10" max="1000" value="300"></label>
    `);

        const curieSlider = document.getElementById("curie-t-slider");
        if (curieSlider) curieSlider.addEventListener("input", (e) => {
            const t = parseInt(e.target.value);
            scanner.attr("x1", xScale(t)).attr("x2", xScale(t));

            // Show active point on Paramagnetic curve for simplicity of scanner
            const chi = C / t;
            scanDot.attr("cx", xScale(t)).attr("cy", yScale(chi));
            scanLbl.attr("x", xScale(t) + 10).attr("y", yScale(chi) - 10).text(`T=${t}K, χ=${chi.toFixed(1)}`);

            if (t < Tc) {
                scanLbl.style("fill", "var(--unit-gold)").text(`FERRO (T < Tc)`);
                scanDot.attr("cy", innerH); // Off chart for simple ferro
            } else {
                scanLbl.style("fill", "white");
            }
        });
    }

    // ──── Card 32: Types of Magnetic Materials (Interactive Dipoles) ────
    function initMagneticTypes() {
        const container = d3.select("#plot-material-11");
        if (container.empty()) return;

        const w = container.node().clientWidth || 800, h = 400;

        // Create 5 panels
        const types = [
            { id: "dia", name: "Diamagnetic", color: "#60a5fa", getRot: (align) => Math.random() * 360, getLen: () => 0.2 },
            { id: "para", name: "Paramagnetic", color: "#facc15", getRot: (align) => align ? (Math.random() * 40 - 20 - 90) : Math.random() * 360, getLen: () => 0.8 },
            { id: "ferro", name: "Ferromagnetic", color: "#00ff88", getRot: (align) => align ? -90 : (Math.random() * 20 - 90), getLen: () => 1 },
            { id: "anti", name: "Anti-Ferro", color: "#f97316", getRot: (align, i) => align ? (i % 2 === 0 ? -90 : 90) : (i % 2 === 0 ? -90 : 90), getLen: () => 1 },
            { id: "ferri", name: "Ferrimagnetic", color: "#a78bfa", getRot: (align, i) => align ? (i % 2 === 0 ? -90 : 90) : (i % 2 === 0 ? -90 : 90), getLen: (i) => i % 2 === 0 ? 1 : 0.4 }
        ];

        container.style("display", "grid")
            .style("grid-template-columns", "repeat(auto-fit, minmax(130px, 1fr))")
            .style("gap", "10px");

        const panels = [];

        types.forEach(type => {
            const div = container.append("div").style("background", "var(--bg-dark)").style("border-radius", "8px").style("padding", "10px").style("text-align", "center");
            div.append("div").style("color", type.color).style("font-weight", "bold").style("margin-bottom", "10px").style("font-size", "0.9rem").text(type.name);

            const pw = w / 5 - 20, ph = 200; // slightly smaller height for better fit
            const svg = div.append("svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("viewBox", `0 0 ${pw} ${ph}`)
                .style("max-width", `${pw}px`);

            // Grid of dipoles (3x4)
            const dipoles = [];
            const spacingX = pw / 4, spacingY = ph / 5;
            for (let r = 1; r <= 4; r++) {
                for (let c = 1; c <= 3; c++) {
                    const i = (r - 1) * 3 + c;
                    // Add arrowhead def inside each SVG (if not bleeding globally)
                    svg.append("defs").append("marker")
                        .attr("id", `arrow-${type.id}`).attr("viewBox", "0 -5 10 10").attr("refX", 8).attr("refY", 0)
                        .attr("markerWidth", 5).attr("markerHeight", 5).attr("orient", "auto")
                        .append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", type.color);

                    const dip = svg.append("line").attr("x1", c * spacingX).attr("y1", r * spacingY).attr("x2", c * spacingX + 1).attr("y2", r * spacingY)
                        .attr("stroke", type.color).attr("stroke-width", 3).attr("marker-end", `url(#arrow-${type.id})`)
                        .style("transform-origin", `${c * spacingX}px ${r * spacingY}px`);
                    dipoles.push({ el: dip, i: i, cx: c * spacingX, cy: r * spacingY });
                }
            }
            panels.push({ type: type, dipoles: dipoles });
        });

        const ctrlContainer = container.append("div").style("grid-column", "span 5").style("text-align", "center").style("margin-top", "15px");
        ctrlContainer.html(`<label style="color:white;">Apply External H-Field (Vertical Upwards) <input type="range" id="mag-types-slider" min="0" max="100" value="0" style="width: 200px; margin-left:10px;"></label>`);

        function updateDipoles(alignStrength) {
            panels.forEach(panel => {
                const isAligned = alignStrength > 50;
                panel.dipoles.forEach(d => {
                    const rot = panel.type.getRot(isAligned, d.i);
                    const len = panel.type.getLen(d.i) * 20; // max length 20px

                    // Add some random jitter if not fully aligned
                    const jitter = isAligned ? 0 : (Math.random() * 20 - 10);
                    const finalRot = rot + jitter;

                    // Simple trig to set x2, y2 based on rotation in degrees
                    const rad = finalRot * Math.PI / 180;

                    d.el.transition().duration(500)
                        .attr("x2", d.cx + len * Math.cos(rad))
                        .attr("y2", d.cy + len * Math.sin(rad));
                });
            });
        }

        const typesSlider = document.getElementById("mag-types-slider");
        if (typesSlider) typesSlider.addEventListener("change", (e) => {
            updateDipoles(parseInt(e.target.value));
        });

        updateDipoles(0); // Initial random state
    }

    // ──── Card 33: Langevin Paramagnetic Magnetization (D3.js) ────
    function initLangevinPlot() {
        const container = d3.select("#plot-material-12");
        if (container.empty()) return;

        const w = container.node().clientWidth || 800, h = 300;
        const m = { t: 20, r: 20, b: 40, l: 60 };
        const innerW = w - m.l - m.r, innerH = h - m.t - m.b;

        // Use viewBox for auto-scaling
        const svg = container.append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${w} ${h}`)
            .style("max-width", `${w}px`);

        const g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);

        // Domain: alpha = mu0*H/kT from 0 to 10
        const xScale = d3.scaleLinear().domain([0, 10]).range([0, innerW]);
        // Range: M/(N*mu0) from 0 to 1
        const yScale = d3.scaleLinear().domain([0, 1.1]).range([innerH, 0]).clamp(true);

        // Axes
        g.append("g").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(xScale))
            .attr("color", "var(--text-muted)");
        g.append("g").call(d3.axisLeft(yScale))
            .attr("color", "var(--text-muted)");

        g.append("text").attr("x", innerW / 2).attr("y", innerH + 35).attr("fill", "var(--text-muted)").style("font-size", "12px").text("α = μ₀H/kBT");
        g.append("text").attr("transform", "rotate(-90)").attr("x", -innerH / 2).attr("y", -40).attr("fill", "var(--text-muted)").style("font-size", "12px").text("M / Nμ₀");

        // Saturation line M = 1 (dashed gold)
        g.append("line").attr("x1", 0).attr("y1", yScale(1)).attr("x2", innerW).attr("y2", yScale(1))
            .attr("stroke", "var(--unit-gold)").attr("stroke-width", 2).attr("stroke-dasharray", "4,4");
        g.append("text").attr("x", innerW - 50).attr("y", yScale(1) - 10).attr("fill", "var(--unit-gold)").style("font-size", "12px").text("Saturation");

        // Linear approximation M = alpha/3
        const lineApprox = d3.line().x(d => xScale(d)).y(d => yScale(d / 3));
        g.append("path").attr("fill", "none").attr("stroke", "var(--unit-cyan)").attr("stroke-width", 2).attr("stroke-dasharray", "4,4").attr("d", lineApprox([0, 3]));
        g.append("text").attr("x", xScale(2)).attr("y", yScale(2 / 3) - 10).attr("fill", "var(--unit-cyan)").style("font-size", "12px").text("Linear Regime");

        // Langevin Function L(x) = coth(x) - 1/x
        function L(x) {
            if (x < 0.001) return x / 3; // L'Hopital limit as x->0
            return (1 / Math.tanh(x)) - (1 / x);
        }

        const aData = d3.range(0.01, 10, 0.1);
        const lineL = d3.line().x(d => xScale(d)).y(d => yScale(L(d)));

        // Draw L(a) curve
        const pathL = g.append("path").attr("fill", "none").attr("stroke", "var(--unit-purple)").attr("stroke-width", 3).attr("d", lineL(aData));

        // Temperature Slider
        const ctrlDiv = container.append("div").style("margin-top", "10px").style("display", "flex").style("justify-content", "center").style("gap", "20px");
        ctrlDiv.html(`
        <label style="color:white;font-size:0.8rem;">Temperature T <input type="range" id="lang-t-slider" min="50" max="600" value="300"></label>
    `);

        // We simulate T changing the steepness by scaling the 'effective' alpha on the x-axis for visual purposes
        const langSlider = document.getElementById("lang-t-slider");
        if (langSlider) langSlider.addEventListener("input", (e) => {
            const t = parseInt(e.target.value);
            // Base T=300 -> scale=1. Lower T -> steeper curve -> scale > 1
            const scale = 300 / t;

            const scaledAData = d3.range(0.01, 10, 0.1);
            const newLineL = d3.line().x(d => xScale(d)).y(d => yScale(L(d * scale)));

            pathL.attr("d", newLineL(scaledAData));
        });
    }

    // ──── Card 34: Interactive Hysteresis Tracer (D3.js) ────
    function initHysteresisTracer() {
        const container = d3.select("#plot-material-13");
        if (container.empty()) return;

        const w = container.node().clientWidth || 800, h = 400;
        const m = { t: 20, r: 20, b: 40, l: 60 };
        const innerW = w - m.l - m.r, innerH = h - m.t - m.b;

        const svg = container.append("svg").attr("width", w).attr("height", h);
        const g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);

        // Domain: H from -100 to 100
        const xScale = d3.scaleLinear().domain([-100, 100]).range([0, innerW]);
        // Range: B from -1.5 to 1.5
        const yScale = d3.scaleLinear().domain([-1.5, 1.5]).range([innerH, 0]).clamp(true);

        // Axes through origin
        g.append("line").attr("x1", 0).attr("y1", yScale(0)).attr("x2", innerW).attr("y2", yScale(0)).attr("stroke", "var(--text-muted)"); // x-axis
        g.append("line").attr("x1", xScale(0)).attr("y1", 0).attr("x2", xScale(0)).attr("y2", innerH).attr("stroke", "var(--text-muted)"); // y-axis

        g.append("text").attr("x", innerW - 10).attr("y", yScale(0) - 10).attr("fill", "var(--text-muted)").style("font-size", "14px").text("H");
        g.append("text").attr("x", xScale(0) + 10).attr("y", 10).attr("fill", "var(--text-muted)").style("font-size", "14px").text("B");

        // Math for sigmoid hysteresis loop (arctan approximation)
        // Upward branch: B_up(H) = (2*Bsat/pi) * arctan(a*(H + Hc))
        // Downward branch: B_dn(H) = (2*Bsat/pi) * arctan(a*(H - Hc))

        let Bsat = 1.0;
        let Hc = 25; // Coercivity (width of loop)
        let a = 0.05; // Steepness

        const hData = d3.range(-100, 101, 1);

        function makeLoopPath(Hc_val) {
            const upPts = hData.map(h => [xScale(h), yScale(Bsat * (2 / Math.PI) * Math.atan(a * (h + Hc_val)))]);
            // Reverse hData for downward branch so it's a closed loop
            const dnPts = hData.slice().reverse().map(h => [xScale(h), yScale(Bsat * (2 / Math.PI) * Math.atan(a * (h - Hc_val)))]);
            return d3.line()([...dnPts, ...upPts, dnPts[0]]);
        }

        const pathLoop = g.append("path").attr("fill", "var(--unit-cyan)").attr("fill-opacity", 0.1).attr("stroke", "var(--unit-cyan)").attr("stroke-width", 3).attr("d", makeLoopPath(Hc));

        // Markers for Br and Hc
        const brPoint = g.append("circle").attr("cx", xScale(0)).attr("cy", yScale(Bsat * (2 / Math.PI) * Math.atan(a * Hc))).attr("r", 5).attr("fill", "var(--unit-green)");
        g.append("text").attr("x", xScale(0) + 10).attr("y", yScale(Bsat * (2 / Math.PI) * Math.atan(a * Hc))).attr("fill", "var(--unit-green)").style("font-weight", "bold").text("Br");

        const hcPoint = g.append("circle").attr("cx", xScale(-Hc)).attr("cy", yScale(0)).attr("r", 5).attr("fill", "var(--unit-purple)");
        g.append("text").attr("x", xScale(-Hc) - 10).attr("y", yScale(0) - 10).attr("fill", "var(--unit-purple)").style("font-weight", "bold").text("-Hc");

        const hcPoint2 = g.append("circle").attr("cx", xScale(Hc)).attr("cy", yScale(0)).attr("r", 5).attr("fill", "var(--unit-purple)");
        g.append("text").attr("x", xScale(Hc) + 5).attr("y", yScale(0) + 15).attr("fill", "var(--unit-purple)").style("font-weight", "bold").text("+Hc");

        // Controls
        const ctrlDiv = container.append("div").style("margin-top", "10px").style("display", "flex").style("justify-content", "center").style("gap", "20px");
        ctrlDiv.html(`
        <label style="color:var(--unit-cyan);font-size:0.8rem;">Change Coercivity (Soft/Hard) <input type="range" id="hyst-soft-hard-slider" min="5" max="60" value="25"></label>
    `);

        const slider = document.getElementById("hyst-soft-hard-slider");
        if (slider) {
            slider.addEventListener("input", (e) => {
                Hc = parseInt(e.target.value);

                pathLoop.attr("d", makeLoopPath(Hc));
                brPoint.attr("cy", yScale(Bsat * (2 / Math.PI) * Math.atan(a * Hc)));
                hcPoint.attr("cx", xScale(-Hc));
                hcPoint2.attr("cx", xScale(Hc));
            });
        }
    }


    // ──── Materials Calculators ────
    function initMaterialCalculators() {
        // Buttons to open modals
        document.querySelectorAll('[data-calc]').forEach(btn => {
            btn.addEventListener('click', () => {
                const overlay = document.getElementById("modal-overlay");
                const modal = document.getElementById(`calc-${btn.dataset.calc}-modal`);
                if (overlay && modal) { overlay.style.display = "block"; modal.style.display = "block"; }
            });
        });

        // 1. Atom Counter
        const nc = document.getElementById("mat-in-nc"), nf = document.getElementById("mat-in-nf"),
            ne = document.getElementById("mat-in-ne"), nb = document.getElementById("mat-in-nb"),
            resAtoms = document.getElementById("mat-res-atoms");

        const calcAtoms = () => {
            if (!nc) return;
            const total = (parseFloat(nc.value) || 0) * (1 / 8) + (parseFloat(nf.value) || 0) * (1 / 2) +
                (parseFloat(ne.value) || 0) * (1 / 4) + (parseFloat(nb.value) || 0) * 1;
            resAtoms.textContent = `Total Atoms (N): ${total}`;
        };
        if (nc) [nc, nf, ne, nb].forEach(el => el.addEventListener('input', calcAtoms));

        // 2. APF Calculator
        const typeIn = document.getElementById("mat-in-type"), resApf = document.getElementById("mat-res-apf");
        const apfVals = { "SC": 52, "BCC": 68, "FCC": 74, "DC": 34 };
        if (typeIn) {
            typeIn.addEventListener('change', () => {
                const val = apfVals[typeIn.value];
                resApf.textContent = `APF: ${val}% | Void: ${100 - val}%`;
            });
        }

        // 3. Lattice Parameter
        const latR = document.getElementById("mat-in-r"), latType = document.getElementById("mat-in-lat-type"), resLatA = document.getElementById("mat-res-lat-a");
        const calcLatA = () => {
            if (!latR) return;
            const r = parseFloat(latR.value) || 0;
            let a = 0;
            switch (latType.value) {
                case "SC": a = 2 * r; break;
                case "BCC": a = (4 * r) / Math.sqrt(3); break;
                case "FCC": a = (4 * r) / Math.sqrt(2); break;
                case "DC": a = (8 * r) / Math.sqrt(3); break;
            }
            resLatA.textContent = `a: ${a.toFixed(3)} Å`;
        };
        if (latR) {
            latR.addEventListener('input', calcLatA);
            latType.addEventListener('change', calcLatA);
        }

        // 4. Identifier
        const idCn = document.getElementById("mat-in-cn"), resId = document.getElementById("mat-res-ident");
        const cnMap = { "4": "Diamond Cubic (DC)", "6": "Simple Cubic (SC)", "8": "Body Centred Cubic (BCC)", "12": "Face Centred Cubic (FCC)" };
        if (idCn) {
            idCn.addEventListener('change', () => {
                resId.textContent = `Matches: ${cnMap[idCn.value]}`;
            });
        }

        // --- NEW CALCULATORS FOR ADVANCED TOPICS ---

        // 5. Miller Indices
        const mi_x = document.getElementById('miller-in-x'), mi_y = document.getElementById('miller-in-y'), mi_z = document.getElementById('miller-in-z');
        const mi_res = document.getElementById('miller-res');
        const calcMiller = () => {
            if (!mi_x) return;
            let x = parseFloat(mi_x.value) || 0;
            let y = parseFloat(mi_y.value) || 0;
            let z = parseFloat(mi_z.value) || 0;

            // Simple reciprocal handling. If user enters 999 to mean infinity, assume index 0.
            let h = x === 999 ? 0 : (x === 0 ? 0 : 1 / x);
            let k = y === 999 ? 0 : (y === 0 ? 0 : 1 / y);
            let l = z === 999 ? 0 : (z === 0 ? 0 : 1 / z);

            // Very basic clearing of fractions for simple integer inputs (e.g. 1/2 -> 2)
            // In reality, LCM of denominators is needed. We'll simplify for standard pedagogical inputs.
            let mult = 1;
            [h, k, l].forEach(val => {
                if (val > 0 && val < 1) mult = Math.max(mult, Math.round(1 / val));
                if (val > 1 && !Number.isInteger(val)) mult = Math.max(mult, 10); // arbitrary catch
            });

            h = Math.round(h * mult);
            k = Math.round(k * mult);
            l = Math.round(l * mult);

            mi_res.textContent = `Indices: (${h} ${k} ${l})`;
        };
        if (mi_x) [mi_x, mi_y, mi_z].forEach(el => el.addEventListener('input', calcMiller));

        // 6. Bragg's Law
        const br_n = document.getElementById('bragg-in-n'), br_d = document.getElementById('bragg-in-d'), br_t = document.getElementById('bragg-in-theta');
        const br_res = document.getElementById('bragg-res');
        const calcBragg = () => {
            if (!br_n) return;
            const n = parseFloat(br_n.value) || 1;
            const d = parseFloat(br_d.value) || 0.5;
            const theta = parseFloat(br_t.value) || 30;
            const rad = theta * Math.PI / 180;

            const lambda = (2 * d * Math.sin(rad)) / n;
            br_res.textContent = `Wavelength λ: ${lambda.toFixed(3)} nm`;
        };
        if (br_n) [br_n, br_d, br_t].forEach(el => el.addEventListener('input', calcBragg));

        // 7. Magnetic Identifier
        const mag_id = document.getElementById('mag-in-id-type');
        const mag_res = document.getElementById('mag-res-id');
        const magMap = {
            "chi_small_neg": "Classification: Diamagnetic (χ ~ -10⁻⁵)",
            "chi_small_pos": "Classification: Paramagnetic (χ ~ 10⁻³)",
            "chi_large_pos": "Classification: Ferromagnetic (χ ~ 10³ to 10⁵)",
            "chi_approx_0": "Classification: Vacuum or Non-magnetic"
        };
        if (mag_id) {
            mag_id.addEventListener('change', () => {
                mag_res.textContent = magMap[mag_id.value] || "Unknown";
            });
            mag_res.textContent = magMap[mag_id.value]; // init
        }

        // 8. Curie Temp
        const cur_mat = document.getElementById('curie-in-mat');
        const cur_res = document.getElementById('curie-res');
        const curMap = {
            "Fe": "Tc = 770 °C (1043 K)",
            "Co": "Tc = 1121 °C (1394 K)",
            "Ni": "Tc = 358 °C (631 K)",
            "FeO": "Tn = 198 K (Néel Temp)"
        };
        if (cur_mat) {
            cur_mat.addEventListener('change', () => {
                cur_res.textContent = curMap[cur_mat.value] || "";
            });
            cur_res.textContent = curMap[cur_mat.value]; // init
        }

        // 9. Langevin L(a) rough approx
        const lan_n = document.getElementById('lan-in-n'), lan_t = document.getElementById('lan-in-t'), lan_h = document.getElementById('lan-in-h');
        const lan_res = document.getElementById('lan-res');
        const calcLan = () => {
            if (!lan_n) return;
            const n = parseFloat(lan_n.value) || 1;
            const t = parseFloat(lan_t.value) || 300;
            const h = parseFloat(lan_h.value) || 1;

            // Very rough proxy for alpha
            const alpha = (h / t) * 1000;

            let state = "Linear Regime (M ∝ H/T)";
            if (alpha > 3) state = "Approaching Saturation";
            if (alpha > 10) state = "Saturated (M ≈ Nμ)";

            lan_res.textContent = `State: ${state}`;
        };
        if (lan_n) [lan_n, lan_t, lan_h].forEach(el => el.addEventListener('input', calcLan));

        // 10. Soft/Hard Magnet
        const hc_in = document.getElementById('hyst-in-hc');
        const hc_res = document.getElementById('hyst-res');
        const calcHc = () => {
            if (!hc_in) return;
            const hc = parseFloat(hc_in.value) || 0;
            if (hc < 1000) {
                hc_res.textContent = `Type: Soft Magnetic (Transformers, Motors)`;
                hc_res.style.color = "var(--unit-green)";
            } else {
                hc_res.textContent = `Type: Hard Magnetic (Permanent Magnets, Data Storage)`;
                hc_res.style.color = "var(--unit-red)";
            }
        };
        if (hc_in) {
            hc_in.addEventListener('input', calcHc);
            calcHc(); // init
        }

        // 11. Unit Converter
        const uc_type = document.getElementById('unit-in-type');
        const uc_val = document.getElementById('unit-in-val');
        const uc_res = document.getElementById('unit-res');
        const calcUc = () => {
            if (!uc_type) return;
            const val = parseFloat(uc_val.value) || 0;
            let res = 0;
            let unit = "";
            switch (uc_type.value) {
                case "G2T": res = val * 1e-4; unit = "Tesla (T)"; break;
                case "T2G": res = val * 1e4; unit = "Gauss (G)"; break;
                case "Oe2Am": res = val * (1000 / (4 * Math.PI)); unit = "A/m"; break;
                case "Am2Oe": res = val * (4 * Math.PI / 1000); unit = "Oersted (Oe)"; break;
            }

            // Format nicely
            let formattedStr = res.toExponential(2);
            if (res >= 0.01 && res < 100000) formattedStr = res.toFixed(2);

            uc_res.textContent = `Result: ${formattedStr} ${unit}`;
        };
        if (uc_type) {
            uc_type.addEventListener('change', calcUc);
            uc_val.addEventListener('input', calcUc);
            calcUc(); // init
        }

        // 12. Combined Crystal Calculator
        const cryR = document.getElementById('cry-in-r'), cryT = document.getElementById('cry-in-type');
        const cryA = document.getElementById('cry-res-a'), cryN = document.getElementById('cry-res-n'), cryApf = document.getElementById('cry-res-apf');
        const calcCry = () => {
            if (!cryR) return;
            const r = parseFloat(cryR.value) || 0;
            const type = cryT.value;
            let a = 0, n = 0, apf = 0;
            switch (type) {
                case "SC": a = 2 * r; n = 1; apf = 52; break;
                case "BCC": a = 4 * r / Math.sqrt(3); n = 2; apf = 68; break;
                case "FCC": a = 4 * r / Math.sqrt(2); n = 4; apf = 74; break;
                case "DC": a = 8 * r / Math.sqrt(3); n = 8; apf = 34; break;
            }
            cryA.textContent = `Lattice Parameter a: ${a.toFixed(3)} Å`;
            cryN.textContent = `Effective Atoms N: ${n}`;
            cryApf.textContent = `Packing Efficiency: ${apf}%`;
        };
        if (cryR) {
            [cryR, cryT].forEach(el => el.addEventListener('input', calcCry));
            calcCry();
        }
    }

    // ──── Card 14: Internal Field (Lorentz & Clausius-Mossotti) ────
    function initInternalField() {
        const container = d3.select("#plot-dielectric-1");
        if (container.empty()) return;

        container.style("display", "flex").style("gap", "20px").style("flex-wrap", "wrap").style("justify-content", "center");

        // 1. Lorentz SVG Diagram
        const svgW = 350, h = 350;
        const svg = container.append("svg").attr("width", svgW).attr("height", h).style("background", "rgba(0,0,0,0.2)").style("border-radius", "8px");

        // Plates
        svg.append("rect").attr("x", 20).attr("y", 20).attr("width", 20).attr("height", 310).attr("fill", "var(--unit-red)");
        svg.append("rect").attr("x", 310).attr("y", 20).attr("width", 20).attr("height", 310).attr("fill", "var(--unit-blue)");
        svg.append("text").attr("x", 30).attr("y", 15).attr("fill", "var(--unit-red)").attr("text-anchor", "middle").text("+Q");
        svg.append("text").attr("x", 320).attr("y", 15).attr("fill", "var(--unit-blue)").attr("text-anchor", "middle").text("-Q");

        // Dielectric Slab
        svg.append("rect").attr("x", 80).attr("y", 50).attr("width", 190).attr("height", 250).attr("fill", "rgba(167, 139, 250, 0.2)").attr("stroke", "var(--unit-purple)");

        // Defs for arrows
        const defs = svg.append("defs");
        defs.append("marker").attr("id", "arrow-cyan").attr("viewBox", "0 0 10 10").attr("refX", 5).attr("refY", 5).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto-start-reverse")
            .append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", "var(--neon-cyan)");
        defs.append("marker").attr("id", "arrow-red").attr("viewBox", "0 0 10 10").attr("refX", 5).attr("refY", 5).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto-start-reverse")
            .append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", "var(--unit-red)");

        // Applied E (Cyan)
        svg.append("line").attr("x1", 50).attr("y1", 100).attr("x2", 300).attr("y2", 100).attr("stroke", "var(--neon-cyan)").attr("stroke-width", 2).attr("marker-end", "url(#arrow-cyan)");
        svg.append("text").attr("x", 175).attr("y", 90).attr("fill", "var(--neon-cyan)").attr("text-anchor", "middle").text("E (Applied Field)");

        // Depolarization Field E1 (Red)
        svg.append("line").attr("x1", 260).attr("y1", 140).attr("x2", 90).attr("y2", 140).attr("stroke", "var(--unit-red)").attr("stroke-width", 2).attr("marker-end", "url(#arrow-red)");
        svg.append("text").attr("x", 175).attr("y", 130).attr("fill", "var(--unit-red)").attr("text-anchor", "middle").text("E₁ (Depolarization)");

        // Lorentz Sphere
        const cy = 250, cx = 175;
        svg.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 40).attr("fill", "none").attr("stroke", "var(--unit-gold)").attr("stroke-width", 2).attr("stroke-dasharray", "4,4");
        svg.append("text").attr("x", cx).attr("y", cy - 45).attr("fill", "var(--unit-gold)").attr("text-anchor", "middle").text("Lorentz Cavity");

        // Local Field vector
        svg.append("line").attr("x1", cx - 30).attr("y1", cy).attr("x2", cx + 30).attr("y2", cy).attr("stroke", "var(--unit-gold)").attr("stroke-width", 3).attr("marker-end", "url(#arrow-cyan)");
        svg.append("text").attr("x", cx).attr("y", cy + 20).attr("fill", "var(--unit-gold)").attr("text-anchor", "middle").text("E_local = E + P/3ε₀");

        // 2. Clausius-Mossotti Plot
        const plotDiv = container.append("div").style("width", "400px").style("height", "350px");
        const m = { t: 20, r: 20, b: 40, l: 50 };
        const iW = 400 - m.l - m.r, iH = 350 - m.t - m.b;
        const svgPlot = plotDiv.append("svg").attr("width", 400).attr("height", 350);
        const g = svgPlot.append("g").attr("transform", `translate(${m.l},${m.t})`);

        g.append("text").attr("x", iW / 2).attr("y", iH + 35).attr("fill", "white").attr("text-anchor", "middle").text("Nα / 3ε₀");
        g.append("text").attr("transform", "rotate(-90)").attr("x", -iH / 2).attr("y", -35).attr("fill", "white").attr("text-anchor", "middle").text("Relative Permittivity ε_r");

        const xScale = d3.scaleLinear().domain([0, 0.9]).range([0, iW]);
        const yScale = d3.scaleLinear().domain([1, 10]).range([iH, 0]);

        g.append("g").attr("transform", `translate(0,${iH})`).call(d3.axisBottom(xScale)).attr("color", "#666");
        g.append("g").call(d3.axisLeft(yScale)).attr("color", "#666");

        const lineGen = d3.line().x(d => xScale(d)).y(d => yScale((1 + 2 * d) / (1 - d)));
        const dataPts = d3.range(0, 0.85, 0.05);

        g.append("path").datum(dataPts).attr("fill", "none").attr("stroke", "var(--unit-purple)").attr("stroke-width", 3).attr("d", lineGen);

        const dot = g.append("circle").attr("r", 6).attr("fill", "var(--unit-gold)");

        // Add interactive controls below plot
        const ctrlDiv = plotDiv.append("div").style("display", "flex").style("flex-direction", "column").style("gap", "10px").style("margin-top", "-30px").style("padding-left", "50px");
        ctrlDiv.html(`
        <label style="color:white; font-size:0.9rem;">Density Extent (x): <span id="cm-val-x">0.5</span>
        <input type="range" id="cm-slip-x" min="0" max="80" value="50" style="width:100%"></label>
    `);

        d3.select("#cm-slip-x").on("input", function () {
            const val = this.value / 100;
            d3.select("#cm-val-x").text(val.toFixed(2));
            const er = (1 + 2 * val) / (1 - val);
            dot.attr("cx", xScale(val)).attr("cy", yScale(er > 10 ? 10 : er));
        });
        // Init dot
        dot.attr("cx", xScale(0.5)).attr("cy", yScale((1 + 2 * 0.5) / (1 - 0.5)));
    }

    // ──── Card 15: Types of Dielectric Materials ────
    function initDielectricTypes() {
        const container = d3.select("#plot-dielectric-2");
        if (container.empty()) return;
        container.style("display", "flex").style("flex-wrap", "wrap").style("gap", "20px").style("justify-content", "center");

        // 1. Classification Tree
        const treeDiv = container.append("div").style("width", "350px");
        treeDiv.html(`
        <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 15px; text-align: center; height: 100%;">
            <h4 style="color: var(--unit-cyan); margin-bottom: 20px;">Dielectric Material Tree</h4>
            <div style="display:flex; justify-content: space-around; font-size: 0.9rem; margin-bottom: 10px;">
                <div style="color: var(--unit-orange); border: 1px solid var(--unit-orange); padding: 5px; border-radius:4px;">Polar<br>(Permanent Dipole)</div>
                <div style="color: var(--neon-cyan); border: 1px solid var(--neon-cyan); padding: 5px; border-radius:4px;">Non-Polar<br>(Induced Dipole)</div>
            </div>
            <div style="display:flex; justify-content: space-around; font-size: 0.8rem; color: #aaa;">
                <div style="width:45%">Polyatomic asymmetric (H2O, HCl)</div>
                <div style="width:45%">Symmetric/Elemental (Si, Ge, Diamond, N2)</div>
            </div>
            <div style="margin-top: 20px; font-size: 0.85rem; text-align:left; color: white;">
                <b>Polarization Types:</b><br><br>
                <div style="color:var(--neon-cyan)">• Electronic: Fast ($10^{15}$ Hz). All materials.</div>
                <div style="color:var(--unit-gold)">• Ionic: Medium ($10^{13}$ Hz). Ionic solids (NaCl).</div>
                <div style="color:var(--unit-orange)">• Dipolar: Slow ($10^{10}$ Hz). Polar molecules.</div>
                <div style="color:var(--unit-blue)">• Space Charge: Very Slow ($10^3$ Hz). Interfaces.</div>
            </div>
        </div>
    `);

        // 2. Frequency Response Step Curve
        const plotDiv = container.append("div").style("width", "400px").style("height", "400px");
        const m = { t: 30, r: 20, b: 50, l: 50 };
        const iW = 400 - m.l - m.r, iH = 400 - m.t - m.b;
        const svgPlot = plotDiv.append("svg").attr("width", 400).attr("height", 400);
        const g = svgPlot.append("g").attr("transform", `translate(${m.l},${m.t})`);

        g.append("text").attr("x", iW / 2).attr("y", iH + 40).attr("fill", "white").attr("text-anchor", "middle").text("Log Frequency (Hz)");
        g.append("text").attr("transform", "rotate(-90)").attr("x", -iH / 2).attr("y", -35).attr("fill", "white").attr("text-anchor", "middle").text("Total Polarizability α");

        const xScale = d3.scaleLinear().domain([0, 16]).range([0, iW]);
        const yScale = d3.scaleLinear().domain([0, 100]).range([iH, 0]);

        g.append("g").attr("transform", `translate(0,${iH})`).call(d3.axisBottom(xScale).tickValues([3, 10, 13, 15])).attr("color", "#666");
        g.append("g").call(d3.axisLeft(yScale).ticks(5)).attr("color", "#666");

        const pathData = [
            [0, 95], [2.8, 95], [3.2, 75],
            [9.8, 75], [10.2, 50],
            [12.8, 50], [13.2, 20],
            [14.8, 20], [15.2, 0],
            [16, 0]
        ];

        g.append("rect").attr("x", 0).attr("y", 0).attr("width", xScale(3)).attr("height", iH).attr("fill", "var(--unit-blue)").attr("opacity", 0.1);
        g.append("rect").attr("x", xScale(3)).attr("y", 0).attr("width", xScale(10) - xScale(3)).attr("height", iH).attr("fill", "var(--unit-orange)").attr("opacity", 0.1);
        g.append("rect").attr("x", xScale(10)).attr("y", 0).attr("width", xScale(13) - xScale(10)).attr("height", iH).attr("fill", "var(--unit-gold)").attr("opacity", 0.1);
        g.append("rect").attr("x", xScale(13)).attr("y", 0).attr("width", xScale(16) - xScale(13)).attr("height", iH).attr("fill", "var(--neon-cyan)").attr("opacity", 0.1);

        const lineGen = d3.line().x(d => xScale(d[0])).y(d => yScale(d[1])).curve(d3.curveMonotoneX);
        g.append("path").datum(pathData).attr("fill", "none").attr("stroke", "white").attr("stroke-width", 3).attr("d", lineGen);

        g.append("text").attr("x", xScale(1.5)).attr("y", yScale(85)).attr("fill", "var(--unit-blue)").attr("text-anchor", "middle").style("font-size", "0.75rem").text("Space Ch.");
        g.append("text").attr("x", xScale(6.5)).attr("y", yScale(62)).attr("fill", "var(--unit-orange)").attr("text-anchor", "middle").style("font-size", "0.75rem").text("Dipolar");
        g.append("text").attr("x", xScale(11.5)).attr("y", yScale(35)).attr("fill", "var(--unit-gold)").attr("text-anchor", "middle").style("font-size", "0.75rem").text("Ionic");
        g.append("text").attr("x", xScale(14.5)).attr("y", yScale(10)).attr("fill", "var(--neon-cyan)").attr("text-anchor", "middle").style("font-size", "0.75rem").text("Electronic");
    }

    // ──── Card 16: Active Dielectrics ────
    function initActiveDielectrics() {
        const container = d3.select("#plot-dielectric-3");
        if (container.empty()) return;
        container.style("display", "flex").style("flex-wrap", "wrap").style("gap", "20px").style("justify-content", "space-around");

        // 1. Piezoelectric direct vs inverse
        const piezoDiv = container.append("div").style("width", "300px").style("height", "450px").style("position", "relative");
        piezoDiv.html(`
        <div style="background: rgba(0,255,136,0.1); border: 1px solid var(--unit-green); border-radius: 8px; padding: 10px; height: 100%; text-align: center;">
            <h4 style="color: var(--unit-green); margin-bottom: 10px;">Piezoelectric Effect</h4>
            <div style="height: 150px; border-bottom: 1px dashed #555; position: relative; margin-bottom: 10px;">
                <b style="color:white;font-size:0.9rem;">Direct: Stress → Voltage</b>
                <div style="position:absolute; top: 40px; left: 100px; width: 80px; height: 60px; background: rgba(255,255,255,0.2); border: 2px solid white; display:flex; flex-direction:column; justify-content:space-between; align-items:center;">
                    <div style="color:red; font-weight:bold;">+++</div>
                    <div style="color:cyan; font-weight:bold;">---</div>
                </div>
                <div style="position:relative; top: 110px; color:var(--unit-gold); font-weight:bold;">← 💥 Compression 💥 →</div>
            </div>
            <div style="height: 150px; position: relative;">
                <b style="color:white;font-size:0.9rem;">Inverse: Voltage → Strain</b>
                <div style="position:absolute; top: 40px; left: 70px; width: 140px; height: 60px; background: rgba(255,255,255,0.2); border: 2px solid white; display:flex; justify-content:center; align-items:center;">
                    <span style="color:var(--unit-gold); font-size:1.5rem; font-weight:bold;">↔ Expands ↔</span>
                </div>
                <div style="position:relative; top: 110px; color:var(--neon-cyan); font-weight:bold;">⚡ External E-Field Applied ⚡</div>
            </div>
        </div>
    `);

        const ferroDiv = container.append("div").style("width", "300px").style("height", "450px");
        ferroDiv.html(`
        <div style="background: rgba(251,113,133,0.1); border: 1px solid var(--unit-rose); border-radius: 8px; padding: 10px; height: 100%; text-align: center;">
            <h4 style="color: var(--unit-rose); margin-bottom: 10px;">Ferroelectric P-E Loop</h4>
            <svg id="ferro-svg" width="280" height="280"></svg>
            <div style="margin-top:20px;">
                <label style="color:white; font-size:0.85rem;">Cycle Electric Field (E):</label><br>
                <input type="range" id="fe-slip-e" min="0" max="100" value="50" style="width:80%;">
            </div>
            <p style="font-size:0.8rem; color:#aaa; margin-top:10px;">Displays Remanent P_r and Coercive field E_c</p>
        </div>
    `);

        const feSvg = d3.select("#ferro-svg");
        const fw = 280, fh = 280;
        feSvg.append("line").attr("x1", 0).attr("y1", fh / 2).attr("x2", fw).attr("y2", fh / 2).attr("stroke", "#666");
        feSvg.append("line").attr("x1", fw / 2).attr("y1", 0).attr("x2", fw / 2).attr("y2", fh).attr("stroke", "#666");
        feSvg.append("text").attr("x", fw - 10).attr("y", fh / 2 - 5).attr("fill", "white").style("font-size", "10px").text("E");
        feSvg.append("text").attr("x", fw / 2 + 5).attr("y", 15).attr("fill", "white").style("font-size", "10px").text("P");

        const fePts = [];
        for (let t = 0; t <= Math.PI * 2; t += 0.1) {
            const x = Math.cos(t) * 100 + fw / 2;
            const y = Math.sin(t) * 80 + Math.sign(Math.cos(t)) * 20 + fh / 2;
            fePts.push([x, y]);
        }
        const feLine = d3.line().x(d => d[0]).y(d => d[1]).curve(d3.curveBasisClosed);
        feSvg.append("path").datum(fePts).attr("fill", "rgba(167, 139, 250, 0.2)").attr("stroke", "var(--unit-rose)").attr("stroke-width", 2).attr("d", feLine);

        feSvg.append("circle").attr("cx", fw / 2).attr("cy", fh / 2 - 50).attr("r", 4).attr("fill", "var(--unit-gold)");
        feSvg.append("text").attr("x", fw / 2 + 10).attr("y", fh / 2 - 50).attr("fill", "var(--unit-gold)").style("font-size", "10px").text("P_r");
        feSvg.append("circle").attr("cx", fw / 2 - 60).attr("cy", fh / 2).attr("r", 4).attr("fill", "var(--unit-cyan)");
        feSvg.append("text").attr("x", fw / 2 - 65).attr("y", fh / 2 - 10).attr("fill", "var(--unit-cyan)").text("-E_c").style("font-size", "10px");

        const feDot = feSvg.append("circle").attr("r", 6).attr("fill", "white");
        d3.select("#fe-slip-e").on("input", function () {
            const pct = this.value / 100;
            const idx = Math.floor(pct * (fePts.length - 1));
            feDot.attr("cx", fePts[idx][0]).attr("cy", fePts[idx][1]);
        });
        feDot.attr("cx", fePts[fePts.length / 2][0]).attr("cy", fePts[fePts.length / 2][1]);

        const pyroDiv = container.append("div").style("width", "300px").style("height", "450px");
        pyroDiv.html(`
        <div style="background: rgba(239,68,68,0.1); border: 1px solid var(--unit-red); border-radius: 8px; padding: 10px; height: 100%; text-align: center; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
                <h4 style="color: var(--unit-red); margin-bottom: 10px;">Pyroelectric Effect</h4>
                <div style="padding: 20px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <span style="font-size: 2rem;">🔥</span><br>
                    <span style="color: white; font-size: 0.9rem;">Heat crystal (ΔT)</span><br>
                    <span style="color: var(--neon-cyan); font-weight: bold;">↓</span><br>
                    <span style="color: var(--unit-purple); font-size: 0.9rem;">Polarization changes (ΔP)</span>
                </div>
            </div>
            <div>
                <h4 style="color: var(--unit-gold); margin-bottom: 10px;">Dielectric Hierarchy</h4>
                <svg width="250" height="200" style="background: rgba(0,0,0,0.5); border-radius: 8px; padding: 10px;">
                    <circle cx="125" cy="100" r="90" fill="none" stroke="var(--unit-green)" stroke-width="2"/>
                    <text x="125" y="30" fill="var(--unit-green)" text-anchor="middle" font-size="12">Piezoelectric</text>
                    
                    <circle cx="125" cy="115" r="65" fill="none" stroke="var(--unit-red)" stroke-width="2"/>
                    <text x="125" y="70" fill="var(--unit-red)" text-anchor="middle" font-size="12">Pyroelectric</text>
                    
                    <circle cx="125" cy="135" r="40" fill="none" stroke="var(--unit-rose)" stroke-width="2"/>
                    <text x="125" y="115" fill="var(--unit-rose)" text-anchor="middle" font-size="12">Ferro-</text>
                    <text x="125" y="130" fill="var(--unit-rose)" text-anchor="middle" font-size="12">electric</text>
                </svg>
            </div>
        </div>
    `);
    }

    // ──── Card 17: Dielectric Properties Summary ────
    function initDielectricSummary() {
        const container = d3.select("#plot-dielectric-4");
        if (container.empty()) return;

        container.style("display", "grid").style("grid-template-columns", "repeat(auto-fit, minmax(250px, 1fr))").style("gap", "15px");

        const cards = [
            { name: "Piezoelectric", desc: "Stress ↔ Electric Field", ex: "Quartz, BaTiO₃", color: "var(--unit-green)" },
            { name: "Ferroelectric", desc: "Spontaneous P, Reversible", ex: "KDP, Rochelle Salt", color: "var(--unit-rose)" },
            { name: "Pyroelectric", desc: "Temperature → P change", ex: "Tourmaline, PVDF", color: "var(--unit-red)" },
            { name: "Elemental Solid", desc: "Electronic Pol. Only", ex: "Si, Ge, Diamond", color: "var(--neon-cyan)" },
            { name: "Ionic Non-Polar", desc: "Electronic + Ionic Pol.", ex: "NaCl, KCl", color: "var(--unit-gold)" },
            { name: "Polar Solid", desc: "Permanent Dipoles", ex: "H₂O, HCl", color: "var(--unit-orange)" }
        ];

        cards.forEach((c, i) => {
            const card = container.append("div")
                .style("background", "rgba(0,0,0,0.4)")
                .style("border", `2px solid ${c.color}`)
                .style("border-radius", "8px")
                .style("padding", "15px")
                .style("opacity", 0)
                .style("transform", "translateY(20px)")
                .html(`
                <h4 style="color: ${c.color}; margin-bottom: 5px;">${c.name}</h4>
                <p style="color: white; font-size: 0.9rem; margin-bottom: 5px;">${c.desc}</p>
                <p style="color: #aaa; font-size: 0.8rem;"><i>Ex: ${c.ex}</i></p>
            `);

            gsap.to(card.node(), {
                opacity: 1,
                y: 0,
                duration: 0.5,
                delay: i * 0.15,
                ease: "power2.out"
            });
        });
    }


    function initDielectricCalculators() {
        // Clausius-Mossotti Calc
        const cN = document.getElementById('dl-in-n');
        const cA = document.getElementById('dl-in-alpha');
        const cRes = document.getElementById('dl-res-final');
        if (cN && cA) {
            const calcCL = () => {
                const n = parseFloat(cN.value) || 0;
                const a = parseFloat(cA.value) || 0;
                const x = (n * a) / (3 * 8.854);
                const er = (1 + 2 * x) / (1 - x);
                cRes.innerHTML = (x >= 1) ? "<span style='color:red'>Spontaneous Polarization (x ≥ 1)</span>" : `Relative Permittivity ε_r: ${er.toFixed(2)}`;
            };
            [cN, cA].forEach(el => el.addEventListener('input', calcCL));
            calcCL();
        }

        // Refractive Index Calc
        const refN = document.getElementById('ref-in-n');
        const refRes = document.getElementById('ref-res-er');
        if (refN) {
            const calcRef = () => {
                const n = parseFloat(refN.value) || 1;
                const er = Math.pow(n, 2);
                refRes.innerHTML = `Permittivity ε<sub>r</sub> = n² : ${er.toFixed(2)}`;
            };
            refN.addEventListener('input', calcRef);
            calcRef();
        }

        // Lorentz-Lorentz Calc
        const lorN = document.getElementById('lor-in-n');
        const lorM = document.getElementById('lor-in-m');
        const lorRho = document.getElementById('lor-in-rho');
        const lorRes = document.getElementById('lor-res-rm');
        if (lorN && lorM && lorRho) {
            const calcLor = () => {
                const n = parseFloat(lorN.value) || 1;
                const m = parseFloat(lorM.value) || 1;
                const rho = parseFloat(lorRho.value) || 1;
                const rm = ((Math.pow(n, 2) - 1) / (Math.pow(n, 2) + 2)) * (m / rho);
                lorRes.innerHTML = `Molar Refraction R<sub>m</sub>: ${rm.toExponential(3)}`;
            };
            [lorN, lorM, lorRho].forEach(el => el.addEventListener('input', calcLor));
            calcLor();
        }

        // Piezo Calc
        const pT = document.getElementById('pz-in-t');
        const pD = document.getElementById('pz-in-d');
        const pRes = document.getElementById('pz-res-p');
        if (pT) {
            const calcPz = () => {
                const t = parseFloat(pT.value) || 0; // MPa
                const d = parseFloat(pD.value) || 0; // pC/N
                const p = (d * t).toFixed(2); // μC/m² 
                pRes.textContent = `Polarization P: ${p} μC/m²`;
            };
            [pT, pD].forEach(el => el.addEventListener('input', calcPz));
            calcPz();
        }

        // Pyro Calc
        const pyT = document.getElementById('py-in-dt');
        const pyL = document.getElementById('py-in-lambda');
        const pyRes = document.getElementById('py-res-p');
        if (pyT) {
            const calcPy = () => {
                const dt = parseFloat(pyT.value) || 0;
                const l = parseFloat(pyL.value) || 0;
                const p = (l * dt).toFixed(2);
                pyRes.textContent = `Change in P: ${p} μC/m²`;
            };
            [pyT, pyL].forEach(el => el.addEventListener('input', calcPy));
            calcPy();
        }

        // Townsend Breakdown Calc
        const twnAlpha = document.getElementById('twn-in-alpha');
        const twnD = document.getElementById('twn-in-d');
        const twnGamma = document.getElementById('twn-in-gamma');
        const twnVal = document.getElementById('twn-res-val');
        const twnStatus = document.getElementById('twn-res-status');
        if (twnAlpha) {
            const calcTwn = () => {
                const a = parseFloat(twnAlpha.value) || 0;
                const d = (parseFloat(twnD.value) || 0) / 1000; // mm to m
                const g = parseFloat(twnGamma.value) || 0;
                const res = g * (Math.exp(a * d) - 1);
                twnVal.textContent = `Criterion γ(e^αd - 1): ${res.toFixed(3)}`;
                if (res >= 1) {
                    twnStatus.textContent = "BREAKDOWN! (Self-sustaining)";
                    twnStatus.style.color = "var(--unit-red)";
                } else {
                    twnStatus.textContent = "Safe (No Spark)";
                    twnStatus.style.color = "var(--unit-green)";
                }
            };
            [twnAlpha, twnD, twnGamma].forEach(el => el.addEventListener('input', calcTwn));
            calcTwn();
        }

        // Liquid Globule Calc
        const glbSig = document.getElementById('glb-in-sigma');
        const glbR = document.getElementById('glb-in-r');
        const glbEr = document.getElementById('glb-in-er');
        const glbRes = document.getElementById('glb-res-e');
        if (glbSig) {
            const calcGlb = () => {
                const s = parseFloat(glbSig.value) || 0;
                const r = (parseFloat(glbR.value) || 1) * 1e-6; // μm to m
                const er = parseFloat(glbEr.value) || 1;
                const ec = 487.7 * Math.sqrt(s / (r * 1e6 * er));
                glbRes.textContent = `Critical E: ${ec.toFixed(1)} kV/cm`;
            };
            [glbSig, glbR, glbEr].forEach(el => el.addEventListener('input', calcGlb));
            calcGlb();
        }

        // Thermal Breakdown Calc
        const thmE = document.getElementById('thm-in-e');
        const thmF = document.getElementById('thm-in-f');
        const thmEr = document.getElementById('thm-in-er');
        const thmTand = document.getElementById('thm-in-tand');
        const thmRes = document.getElementById('thm-res-w');
        if (thmE) {
            const calcThm = () => {
                const e = parseFloat(thmE.value) || 0;
                const f = parseFloat(thmF.value) || 0;
                const er = parseFloat(thmEr.value) || 1;
                const td = parseFloat(thmTand.value) || 0;
                const w = (Math.pow(e, 2) * f * er * td) / 1.8e10;
                thmRes.textContent = `Heat W: ${w.toFixed(4)} W/cm³`;
            };
            [thmE, thmF, thmEr, thmTand].forEach(el => el.addEventListener('input', calcThm));
            calcThm();
        }

        // Loss Tangent Calc
        const ltEp = document.getElementById('lt-in-ep');
        const ltEpp = document.getElementById('lt-in-epp');
        const ltTd = document.getElementById('lt-res-tand');
        const ltQ = document.getElementById('lt-res-q');
        if (ltEp) {
            const calcLT = () => {
                const ep = parseFloat(ltEp.value) || 1;
                const epp = parseFloat(ltEpp.value) || 0;
                const tand = epp / ep;
                ltTd.textContent = `tan δ: ${tand.toFixed(3)}`;
                ltQ.textContent = `Q-Factor: ${tand > 0 ? (1 / tand).toFixed(1) : '∞'}`;
            };
            [ltEp, ltEpp].forEach(el => el.addEventListener('input', calcLT));
            calcLT();
        }

        // Debye Plotter Calc
        const debEs = document.getElementById('deb-in-es');
        const debEinf = document.getElementById('deb-in-einf');
        const debTau = document.getElementById('deb-in-tau');
        const debRes = document.getElementById('deb-res-peak');
        if (debEs) {
            const calcDeb = () => {
                const t = (parseFloat(debTau.value) || 1) * 1e-9;
                const fr = 1 / (2 * Math.PI * t);
                debRes.textContent = `Peak Loss at: ${(fr / 1e6).toFixed(1)} MHz`;
            };
            [debEs, debEinf, debTau].forEach(el => el.addEventListener('input', calcDeb));
            calcDeb();
        }

        // Dielectric Strength Calc
        const strEbd = document.getElementById('str-in-ebd');
        const strD = document.getElementById('str-in-d');
        const strRes = document.getElementById('str-res-vmax');
        if (strEbd) {
            const calcStr = () => {
                const e = parseFloat(strEbd.value) || 0;
                const d = (parseFloat(strD.value) || 0) / 10; // mm to cm
                strRes.textContent = `Max Voltage Vmax: ${(e * d).toFixed(1)} kV`;
            };
            [strEbd, strD].forEach(el => el.addEventListener('input', calcStr));
            calcStr();
        }

        // Energy Loss Calc
        const enW = document.getElementById('en-in-omega');
        const enEr = document.getElementById('en-in-er');
        const enTd = document.getElementById('en-in-tand');
        const enE0 = document.getElementById('en-in-e0');
        const enRes = document.getElementById('en-res-w');
        if (enW) {
            const calcEn = () => {
                const w = parseFloat(enW.value) || 0;
                const er = parseFloat(enEr.value) || 1;
                const td = parseFloat(enTd.value) || 0;
                const e0 = parseFloat(enE0.value) || 0;
                const res = (w / 2) * 8.854e-12 * er * td * Math.pow(e0, 2);
                enRes.textContent = `Loss W: ${res.toExponential(3)} W/m³`;
            };
            [enW, enEr, enTd, enE0].forEach(el => el.addEventListener('input', calcEn));
            calcEn();
        }

        // Material Selector
        const selEbd = document.getElementById('sel-in-ebd');
        const selTemp = document.getElementById('sel-in-temp');
        const selRes = document.getElementById('sel-res-list');
        if (selEbd) {
            const materials = [
                { name: "Air", ebd: 30, tmax: 200 },
                { name: "Paper", ebd: 15, tmax: 105 },
                { name: "Polystyrene", ebd: 20, tmax: 70 },
                { name: "Rubber", ebd: 21, tmax: 60 },
                { name: "Bakelite", ebd: 25, tmax: 120 },
                { name: "Glass", ebd: 30, tmax: 200 },
                { name: "Mica", ebd: 200, tmax: 500 },
                { name: "Ceramic", ebd: 100, tmax: 1000 },
                { name: "SF6", ebd: 90, tmax: 200 }
            ];
            const updateSel = () => {
                const e = parseFloat(selEbd.value) || 0;
                const t = parseFloat(selTemp.value) || 0;
                const filtered = materials.filter(m => m.ebd >= e && m.tmax >= t);
                selRes.textContent = filtered.length > 0 ? `Recommended: ${filtered.map(m => m.name).join(', ')}` : "No matching material found.";
            };
            [selEbd, selTemp].forEach(el => el.addEventListener('input', updateSel));
            updateSel();
        }

        // Thermal Class Finder
        const clfTemp = document.getElementById('clf-in-temp');
        const clfRes = document.getElementById('clf-res-class');
        if (clfTemp) {
            const classes = [
                { name: "Y", limit: 90 },
                { name: "A", limit: 105 },
                { name: "E", limit: 120 },
                { name: "B", limit: 130 },
                { name: "F", limit: 155 },
                { name: "H", limit: 180 },
                { name: "C", limit: 250 }
            ];
            const updateClf = () => {
                const t = parseFloat(clfTemp.value) || 0;
                const found = classes.find(c => c.limit >= t);
                clfRes.textContent = found ? `Required: Class ${found.name} (${found.limit}°C)` : "Extreme Temp: Beyond Class C";
                clfRes.style.color = found ? "var(--unit-gold)" : "var(--unit-red)";
            };
            clfTemp.addEventListener('input', updateClf);
            updateClf();
        }

        // Life Calculator
        const clT1 = document.getElementById('cl-in-t1');
        const clL1 = document.getElementById('cl-in-l1');
        const clT2 = document.getElementById('cl-in-t2');
        const clRes = document.getElementById('cl-res-l2');
        if (clT1) {
            const calcLife = () => {
                const t1 = parseFloat(clT1.value) || 0;
                const l1 = parseFloat(clL1.value) || 0;
                const t2 = parseFloat(clT2.value) || 0;
                const l2 = l1 * Math.pow(2, -(t2 - t1) / 10);
                clRes.textContent = `Predicted Life L₂: ${l2.toFixed(2)} yrs`;
            };
            [clT1, clL1, clT2].forEach(el => el.addEventListener('input', calcLife));
            calcLife();
        }

        // Dielectric Identifier
        const diType = document.getElementById('di-in-type'), diRes = document.getElementById('di-res-val');
        const diMap = {
            "nonpolar": "Non-Polar: Electronic only. εᵣ ≈ n². (Diamond, Si)",
            "polar": "Polar: Electronic + Dipolar. Temp dependent. (H2O, HCl)",
            "piezo": "Piezoelectric: Asymmetric center. Stress → P. (Quartz)",
            "ferro": "Ferroelectric: Spontaneous P. Hysteresis. (BaTiO3)"
        };
        if (diType) {
            diType.addEventListener('change', () => {
                diRes.textContent = diMap[diType.value] || "";
            });
            diRes.textContent = diMap[diType.value];
        }
    }

    // ──── Card 19: Dielectric Breakdown in Gases ────
    function initBreakdownGases() {
        const container = d3.select("#plot-dielectric-5");
        if (container.empty()) return;
        container.style("display", "flex").style("flex-wrap", "wrap").style("gap", "20px").style("justify-content", "center");

        // 1. Townsend Avalanche SVG
        const townDiv = container.append("div").style("width", "350px").style("height", "400px").style("position", "relative");
        townDiv.html(`
        <div style="background: rgba(249,115,22,0.1); border: 1px solid var(--unit-orange); border-radius: 8px; padding: 15px; height: 100%; text-align: center;">
            <h4 style="color: var(--unit-orange); margin-bottom: 15px;">Townsend Avalanche</h4>
            <svg id="twn-svg" width="320" height="250" style="background: rgba(0,0,0,0.5); border-radius: 4px;"></svg>
            <div style="margin-top: 15px; text-align: left; font-size: 0.8rem; color: white;">
                <button id="btn-twn-spark" class="ac-btn-icon" style="width: 100%; justify-content: center; margin-bottom: 10px;">🌟 Trigger Primary Electron</button>
                α (Ionization): Branching probability<br>
                γ (Secondary): Ion impact at cathode
            </div>
        </div>
    `);

        const tSvg = d3.select("#twn-svg");
        const tw = 320, th = 250;
        // electrodes
        tSvg.append("line").attr("x1", 30).attr("y1", 20).attr("x2", 30).attr("y2", th - 20).attr("stroke", "var(--unit-blue)").attr("stroke-width", 4); // Cathode
        tSvg.append("line").attr("x1", tw - 30).attr("y1", 20).attr("x2", tw - 30).attr("y2", th - 20).attr("stroke", "var(--unit-red)").attr("stroke-width", 4); // Anode
        tSvg.append("text").attr("x", 10).attr("y", th / 2).attr("fill", "var(--unit-blue)").attr("text-anchor", "middle").attr("transform", `rotate(-90, 10, ${th / 2})`).text("Cathode (-)");
        tSvg.append("text").attr("x", tw - 10).attr("y", th / 2).attr("fill", "var(--unit-red)").attr("text-anchor", "middle").attr("transform", `rotate(90, ${tw - 10}, ${th / 2})`).text("Anode (+)");

        const triggerAvalanche = () => {
            const primary = tSvg.append("circle").attr("cx", 40).attr("cy", th / 2).attr("r", 3).attr("fill", "white");

            const move = (node, depth) => {
                if (depth > 5) return;
                node.transition().duration(500).ease(d3.easeLinear)
                    .attr("cx", parseInt(node.attr("cx")) + 50)
                    .on("end", function () {
                        if (parseInt(d3.select(this).attr("cx")) < tw - 40) {
                            // ionizing event
                            const newChild = tSvg.append("circle").attr("cx", d3.select(this).attr("cx")).attr("cy", parseInt(d3.select(this).attr("cy")) + (Math.random() - 0.5) * 40).attr("r", 3).attr("fill", "var(--unit-orange)");
                            move(d3.select(this), depth + 1);
                            move(newChild, depth + 1);
                        } else {
                            d3.select(this).transition().duration(200).attr("r", 0).remove();
                        }
                    });
            };
            move(primary, 0);
        };
        d3.select("#btn-twn-spark").on("click", triggerAvalanche);

        // 2. Paschen Curve
        const pasDiv = container.append("div").style("width", "400px").style("height", "400px");
        const pm = { t: 30, r: 20, b: 50, l: 60 };
        const piW = 400 - pm.l - pm.r, piH = 400 - pm.t - pm.b;
        const pSvg = pasDiv.append("svg").attr("width", 400).attr("height", 400);
        const pg = pSvg.append("g").attr("transform", `translate(${pm.l},${pm.t})`);

        const px = d3.scaleLog().domain([0.1, 100]).range([0, piW]);
        const py = d3.scaleLog().domain([100, 10000]).range([piH, 0]);

        pg.append("g").attr("transform", `translate(0,${piH})`).call(d3.axisBottom(px).ticks(5, ".1f")).attr("color", "#666");
        pg.append("g").call(d3.axisLeft(py).ticks(5, d3.format(".0s"))).attr("color", "#666");
        pg.append("text").attr("x", piW / 2).attr("y", piH + 40).attr("fill", "white").attr("text-anchor", "middle").text("Pressure x Gap (p·d)");
        pg.append("text").attr("transform", "rotate(-90)").attr("x", -piH / 2).attr("y", -45).attr("fill", "white").attr("text-anchor", "middle").text("Breakdown V (V)");

        const pData = d3.range(-1, 2.1, 0.1).map(v => Math.pow(10, v));
        // Paschen formula approximation: V = B*pd / (ln(A*pd) - ln(ln(1+1/gamma)))
        const paschenVal = (pd) => {
            const A = 12, B = 365, g = 0.01;
            const den = Math.log(A * pd) - Math.log(Math.log(1 + 1 / g));
            return B * pd / (den > 0.1 ? den : 0.1);
        };

        const pLine = d3.line().x(d => px(d)).y(d => py(paschenVal(d))).curve(d3.curveMonotoneX);
        pg.append("path").datum(pData).attr("fill", "none").attr("stroke", "var(--unit-orange)").attr("stroke-width", 3).attr("d", pLine);

        const pDot = pg.append("circle").attr("r", 6).attr("fill", "white");
        const pLabel = pg.append("text").attr("y", -10).attr("fill", "white").attr("font-size", "10px").attr("text-anchor", "middle");

        pasDiv.append("div").html(`
        <div style="padding: 10px; color:white; font-size: 0.85rem;">
            Operating p·d: <input type="range" id="pd-slider" min="1" max="1000" value="50" style="width: 200px;">
        </div>
    `);

        d3.select("#pd-slider").on("input", function () {
            const val = this.value / 10;
            const vbd = paschenVal(val);
            pDot.attr("cx", px(val)).attr("cy", py(vbd));
            pLabel.attr("x", px(val)).attr("y", py(vbd) - 10).text(`${vbd.toFixed(0)}V`);
        });
        // init
        const vbdInit = paschenVal(5);
        pDot.attr("cx", px(5)).attr("cy", py(vbdInit));
        pLabel.attr("x", px(5)).attr("y", py(vbdInit) - 10).text(`${vbdInit.toFixed(0)}V`);
    }

    // ──── Card 20: Dielectric Breakdown in Liquids ────
    function initBreakdownLiquids() {
        const container = d3.select("#plot-dielectric-6");
        if (container.empty()) return;

        const w = container.node().clientWidth || 800, h = 400;
        const svg = container.append("svg").attr("width", "100%").attr("height", h).attr("viewBox", `0 0 ${w} ${h}`);

        // Capacitor setup
        svg.append("rect").attr("x", 50).attr("y", 50).attr("width", w - 100).attr("height", h - 100).attr("fill", "rgba(96,165,250,0.1)").attr("stroke", "#333");
        svg.append("rect").attr("x", 50).attr("y", 50).attr("width", 20).attr("height", h - 100).attr("fill", "var(--unit-blue)"); // Plate
        svg.append("rect").attr("x", w - 70).attr("y", 50).attr("width", 20).attr("height", h - 100).attr("fill", "var(--unit-red)"); // Plate

        const globule = svg.append("ellipse").attr("cx", w / 2).attr("cy", h / 2).attr("rx", 30).attr("ry", 30).attr("fill", "rgba(255,255,255,0.3)").attr("stroke", "white").attr("stroke-width", 2);

        // Field lines
        const lineGroup = svg.append("g");
        const updateLines = (rx) => {
            lineGroup.selectAll("*").remove();
            for (let i = 70; i < h - 70; i += 30) {
                const path = d3.path();
                path.moveTo(70, i);
                path.quadraticCurveTo(w / 2, i + (i < h / 2 ? -rx / 2 : rx / 2), w - 70, i);
                lineGroup.append("path").attr("d", path.toString()).attr("stroke", "rgba(255,255,255,0.2)").attr("fill", "none");
            }
        };
        updateLines(30);

        const ctrl = container.append("div").style("text-align", "center").style("margin-top", "10px");
        ctrl.html(`
        <label style="color:white;">Apply External Field E: <input type="range" id="liq-e-slider" min="30" max="150" value="30" style="width:250px;"></label>
        <div id="liq-status" style="color:var(--unit-cyan); font-weight:bold; margin-top:10px;">Stable Globule</div>
    `);

        d3.select("#liq-e-slider").on("input", function () {
            const e = this.value;
            const rx = e * 1.5;
            const ry = 30 * 30 / rx; // volume conservation constant area approx
            globule.transition().duration(50).attr("rx", rx).attr("ry", ry);
            updateLines(rx);

            if (e > 130) {
                d3.select("#liq-status").text("⚠️ INSTABILITY - CRITICAL FIELD EXCEEDED!").style("color", "var(--unit-red)");
                globule.attr("fill", "rgba(239,68,68,0.5)");
                if (e > 145) {
                    svg.append("line").attr("id", "spark").attr("x1", 70).attr("y1", h / 2).attr("x2", w - 70).attr("y2", h / 2).attr("stroke", "white").attr("stroke-width", 5).transition().duration(100).style("opacity", 0).remove();
                }
            } else {
                d3.select("#liq-status").text("Stable Globule").style("color", "var(--unit-cyan)");
                globule.attr("fill", "rgba(255,255,255,0.3)");
            }
        });
    }

    // ──── Card 21: Dielectric Breakdown in Solids ────
    function initBreakdownSolids() {
        const container = d3.select("#plot-dielectric-7");
        if (container.empty()) return;
        container.style("display", "flex").style("flex-wrap", "wrap").style("gap", "20px").style("justify-content", "center");

        // Interactive Heat Map (Thermal Breakdown)
        const heatDiv = container.append("div").style("width", "400px").style("height", "450px");
        heatDiv.html(`
        <div style="background: rgba(239,68,68,0.1); border: 1px solid var(--unit-red); border-radius: 8px; padding: 15px; height: 100%; text-align: center;">
            <h4 style="color: var(--unit-red); margin-bottom: 10px;">Thermal Heat Map</h4>
            <div id="thermal-grid" style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 2px; width: 300px; height: 300px; margin: 0 auto; background: #222; padding: 5px;"></div>
            <div style="margin-top: 15px; color: white; font-size: 0.8rem;">
                Power P = E² f ε<sub>r</sub> tan δ / C<br>
                Field E: <input type="range" id="thm-e-slider" min="0" max="100" value="20" style="width: 150px;">
            </div>
        </div>
    `);

        const grid = d3.select("#thermal-grid");
        const cells = [];
        for (let i = 0; i < 100; i++) {
            cells.push(grid.append("div").style("background", "#333").style("border-radius", "1px"));
        }

        const updateHeat = (e) => {
            const p = (e * e) / 500; // arbitrary power scale
            cells.forEach((cell, idx) => {
                const row = Math.floor(idx / 10);
                const col = idx % 10;
                const dist = Math.sqrt(Math.pow(row - 4.5, 2) + Math.pow(col - 4.5, 2));
                const temp = Math.max(0, p * (1 - dist / 7));
                const color = d3.interpolateReds(temp);
                cell.style("background", color);
                if (temp > 0.95) {
                    cell.style("box-shadow", "0 0 5px white");
                    cell.style("background", "white");
                } else {
                    cell.style("box-shadow", "none");
                }
            });
        };

        d3.select("#thm-e-slider").on("input", function () {
            updateHeat(this.value);
        });
        updateHeat(20);

        // Intrinsic info
        const infoDiv = container.append("div").style("width", "350px").style("color", "white").style("font-size", "0.9rem");
        infoDiv.html(`
        <h4 style="color: var(--unit-red);">Solid Breakdown Types</h4>
        <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom:10px; padding:8px; background:rgba(255,255,255,0.05); border-radius:4px;"><b>Intrinsic (Electronic):</b> <br>Von Hippel theory. Avalanche occurs in < 10⁻⁸s.</li>
            <li style="margin-bottom:10px; padding:8px; background:rgba(255,255,255,0.05); border-radius:4px;"><b>Thermal Breakdown:</b> <br>Rate of heat generation > Rate of dissipation. Cumulative process.</li>
            <li style="margin-bottom:10px; padding:8px; background:rgba(255,255,255,0.05); border-radius:4px;"><b>Electromechanical:</b> <br>Compressive stress exceeds yield limit.</li>
        </ul>
    `);
    }

    // ──── Card 22: Dielectric Loss ────
    function initDielectricLoss() {
        const container = d3.select("#plot-dielectric-8");
        if (container.empty()) return;
        container.style("display", "flex").style("flex-wrap", "wrap").style("gap", "20px").style("justify-content", "center");

        // Phasor Diagram
        const phaDiv = container.append("div").style("width", "380px").style("height", "450px");
        phaDiv.html(`
        <div style="background: rgba(34,211,238,0.1); border: 1px solid var(--neon-cyan); border-radius: 8px; padding: 15px; height: 100%; text-align: center;">
            <h4 style="color: var(--neon-cyan); margin-bottom: 15px;">Phasor Diagram (tan δ)</h4>
            <svg id="loss-phasor" width="300" height="300"></svg>
            <div style="margin-top: 15px; color: white; font-size: 0.8rem;">
                Loss Angle δ: <input type="range" id="loss-delta-slider" min="1" max="45" value="5" style="width: 150px;">
            </div>
        </div>
    `);

        const pSvg = d3.select("#loss-phasor");
        const cx = 50, cy = 250;

        // Axes
        pSvg.append("line").attr("x1", cx).attr("y1", cy).attr("x2", cx + 200).attr("y2", cy).attr("stroke", "white").attr("stroke-dasharray", "4");
        pSvg.append("line").attr("x1", cx).attr("y1", cy).attr("x2", cx).attr("y2", cy - 200).attr("stroke", "white").attr("stroke-dasharray", "4");

        const vI = pSvg.append("line").attr("id", "vec-i").attr("stroke", "var(--unit-gold)").attr("stroke-width", 3);
        const vIc = pSvg.append("line").attr("id", "vec-ic").attr("stroke", "var(--unit-blue)").attr("stroke-width", 2);
        const vIr = pSvg.append("line").attr("id", "vec-ir").attr("stroke", "var(--unit-red)").attr("stroke-width", 2);
        const arc = pSvg.append("path").attr("id", "loss-arc").attr("fill", "none").attr("stroke", "var(--unit-cyan)");
        const lblD = pSvg.append("text").attr("fill", "var(--unit-cyan)").attr("font-size", "12px");

        const updatePhasor = (deg) => {
            const rad = deg * Math.PI / 180;
            const len = 180;
            const x = cx + len * Math.sin(rad);
            const y = cy - len * Math.cos(rad);

            vI.attr("x1", cx).attr("y1", cy).attr("x2", x).attr("y2", y);
            vIc.attr("x1", cx).attr("y1", cy).attr("x2", cx).attr("y2", y);
            vIr.attr("x1", cx).attr("y1", cy).attr("x2", x).attr("y2", cy);

            const path = d3.arc().innerRadius(40).outerRadius(42).startAngle(0).endAngle(rad);
            arc.attr("d", path()).attr("transform", `translate(${cx},${cy})`);
            lblD.attr("x", cx + 25).attr("y", cy - 45).text(`δ = ${deg}°`);
        };

        d3.select("#loss-delta-slider").on("input", function () {
            updatePhasor(this.value);
        });
        updatePhasor(5);

        // Cole-Cole Plot logic (simplified)
        const coleDiv = container.append("div").style("width", "380px").style("height", "450px");
        const cm = { t: 30, r: 20, b: 50, l: 60 };
        const cw = 380 - cm.l - cm.r, ch = 300 - cm.t - cm.b;
        const cSvg = coleDiv.append("svg").attr("width", 380).attr("height", 310);
        const cg = cSvg.append("g").attr("transform", `translate(${cm.l},${cm.t})`);

        coleDiv.append("div").style("color", "white").style("text-align", "center").html(`
        <h4 style="color: var(--neon-cyan);">Cole-Cole Plot</h4>
        ε'' vs ε' (Freq response)
    `);

        const cxS = d3.scaleLinear().domain([2, 12]).range([0, cw]);
        const cyS = d3.scaleLinear().domain([0, 5]).range([ch, 0]);

        cg.append("g").attr("transform", `translate(0,${ch})`).call(d3.axisBottom(cxS).ticks(5)).attr("color", "#666");
        cg.append("g").call(d3.axisLeft(cyS).ticks(3)).attr("color", "#666");

        // Semi circle representing Debye relaxation
        const data = d3.range(0, Math.PI + 0.1, 0.1).map(a => ({
            x: 7 + 5 * Math.cos(a),
            y: 5 * Math.sin(a)
        }));
        const line = d3.line().x(d => cxS(d.x)).y(d => cyS(d.y));
        cg.append("path").datum(data).attr("fill", "rgba(34,211,238,0.1)").attr("stroke", "var(--neon-cyan)").attr("stroke-width", 2).attr("d", line);

        const cDot = cg.append("circle").attr("r", 6).attr("fill", "white");
        coleDiv.append("div").style("padding", "10px").style("text-align", "center").html(`
        <input type="range" id="cole-freq-slider" min="0" max="100" value="50" style="width: 250px;">
    `);

        d3.select("#cole-freq-slider").on("input", function () {
            const p = this.value / 100;
            const angle = p * Math.PI;
            cDot.transition().duration(50).attr("cx", cxS(7 + 5 * Math.cos(angle))).attr("cy", cyS(5 * Math.sin(angle)));
        });
        cDot.attr("cx", cxS(7 + 5 * Math.cos(Math.PI / 2))).attr("cy", cyS(5 * Math.sin(Math.PI / 2)));
    }

    // ──── Card 23: Dielectric Strength & Energy Absorbed ────
    function initDielectricStrength() {
        const container = d3.select("#plot-dielectric-9");
        if (container.empty()) return;
        container.style("display", "flex").style("flex-wrap", "wrap").style("gap", "20px").style("justify-content", "center");

        const data = [
            { name: "Air", val: 30 },
            { name: "Transformer Oil", val: 150 },
            { name: "Paper", val: 200 },
            { name: "Porcelain", val: 300 },
            { name: "Glass", val: 500 },
            { name: "Mica", val: 2000 }
        ];

        const m = { t: 40, r: 20, b: 60, l: 120 };
        const w = 400 - m.l - m.r, h = 350 - m.t - m.b;
        const svg = container.append("div").style("width", "400px").append("svg").attr("width", 400).attr("height", 350);
        const g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);

        const x = d3.scaleLinear().domain([0, 2000]).range([0, w]);
        const y = d3.scaleBand().domain(data.map(d => d.name)).range([0, h]).padding(0.2);

        g.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).ticks(5)).attr("color", "#666");
        g.append("g").call(d3.axisLeft(y)).attr("color", "#666");
        svg.append("text").attr("x", 200).attr("y", 340).attr("fill", "white").attr("text-anchor", "middle").attr("font-size", "12px").text("Dielectric Strength (kV/cm)");

        const bars = g.selectAll(".bar").data(data).enter().append("rect").attr("y", d => y(d.name)).attr("height", y.bandwidth()).attr("x", 0).attr("width", d => x(d.val)).attr("fill", "var(--unit-rose)").attr("rx", 2);

        // Safety Line
        const safetyG = g.append("g").attr("id", "safety-zone");
        const sLine = safetyG.append("line").attr("y1", 0).attr("y2", h).attr("stroke", "white").attr("stroke-width", 2).attr("stroke-dasharray", "5,5");
        const sLabel = safetyG.append("text").attr("y", -10).attr("fill", "white").attr("text-anchor", "middle").attr("font-size", "12px");

        container.append("div").style("width", "350px").style("padding", "20px").html(`
        <div style="background: rgba(244,63,94,0.1); border: 1px solid var(--unit-rose); border-radius: 8px; padding: 15px; color: white;">
            <h4 style="color: var(--unit-rose); margin-bottom: 10px;">Applied Field Safety</h4>
            Select Applied Field [E]: <br>
            <input type="range" id="safety-e-slider" min="0" max="1000" value="100" style="width: 100%; margin: 10px 0;">
            <div id="safety-status" style="font-size: 0.9rem;"></div>
        </div>
    `);

        const updateSafety = (e) => {
            sLine.attr("x1", x(e)).attr("x2", x(e));
            sLabel.attr("x", x(e)).text(`${e} kV/cm`);
            bars.attr("fill", d => d.val < e ? "var(--unit-red)" : "var(--unit-rose)");
            const breakdownCount = data.filter(d => d.val < e).length;
            d3.select("#safety-status").html(`Field E = ${e} kV/cm. <br> <span style="color:${breakdownCount > 0 ? 'var(--unit-red)' : 'var(--unit-green)'}">${breakdownCount} materials would BREAKDOWN!</span>`);
        };

        d3.select("#safety-e-slider").on("input", function () {
            updateSafety(this.value);
        });
        updateSafety(100);
    }

    // ──── Card 24: Insulating Materials: Basics & Properties ────
    function initInsulatorProperties() {
        const container = d3.select("#plot-dielectric-10");
        if (container.empty()) return;
        container.style("display", "flex").style("flex-wrap", "wrap").style("gap", "20px").style("justify-content", "center");

        // 1. Property Wheel (SVG)
        const wheelDiv = container.append("div").style("width", "380px").style("text-align", "center");
        wheelDiv.html(`
        <h4 style="color: var(--unit-green); margin-bottom: 10px;">Properties Wheel</h4>
        <svg id="prop-wheel" width="300" height="300"></svg>
        <div id="prop-desc" style="color: white; font-size: 0.85rem; min-height: 50px; margin-top: 10px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
            Hover a segment to see details
        </div>
    `);

        const pData = [
            { label: "Electrical", color: "var(--neon-cyan)", desc: "High resistivity, Low loss factor, High dielectric strength." },
            { label: "Mechanical", color: "var(--unit-gold)", desc: "High tensile strength, Compression resistance, Machinability." },
            { label: "Thermal", color: "var(--unit-red)", desc: "Thermal stability, Flame resistance, Low thermal expansion." },
            { label: "Chemical", color: "var(--unit-purple)", desc: "Acid/Alkali resistance, Non-corrosive, Humidity stability." }
        ];

        const wSvg = d3.select("#prop-wheel");
        const arc = d3.arc().innerRadius(60).outerRadius(100).padAngle(0.05);
        const pie = d3.pie().value(1);

        const arcs = wSvg.append("g").attr("transform", "translate(150,150)").selectAll(".arc").data(pie(pData)).enter().append("g");
        arcs.append("path").attr("d", arc).attr("fill", d => d.data.color).style("cursor", "pointer")
            .on("mouseover", function (event, d) {
                d3.select(this).transition().duration(200).attr("d", d3.arc().innerRadius(60).outerRadius(115).padAngle(0.05));
                d3.select("#prop-desc").html(`<b style="color:${d.data.color}">${d.data.label}:</b><br>${d.data.desc}`);
            })
            .on("mouseout", function (event, d) {
                d3.select(this).transition().duration(200).attr("d", arc);
            });

        arcs.append("text").attr("transform", d => `translate(${arc.centroid(d)})`).attr("fill", "black").attr("text-anchor", "middle").attr("font-size", "10px").attr("font-weight", "bold").text(d => d.data.label);

        // 2. NTC Graph
        const ntcDiv = container.append("div").style("width", "380px");
        const nm = { t: 30, r: 20, b: 50, l: 60 };
        const nw = 380 - nm.l - nm.r, nh = 300 - nm.t - nm.b;
        ntcDiv.append("h4").style("color", "var(--unit-green)").style("text-align", "center").text("NTC vs PTC Curves");
        const nSvg = ntcDiv.append("svg").attr("width", 380).attr("height", 300);
        const ng = nSvg.append("g").attr("transform", `translate(${nm.l},${nm.t})`);

        const nx = d3.scaleLinear().domain([0, 200]).range([0, nw]);
        const ny = d3.scaleLinear().domain([0, 1000]).range([nh, 0]);

        ng.append("g").attr("transform", `translate(0,${nh})`).call(d3.axisBottom(nx).ticks(5)).attr("color", "#666");
        ng.append("g").call(d3.axisLeft(ny).ticks(5)).attr("color", "#666");
        ng.append("text").attr("x", nw / 2).attr("y", nh + 40).attr("fill", "white").attr("text-anchor", "middle").attr("font-size", "12px").text("Temperature (°C)");
        ng.append("text").attr("transform", "rotate(-90)").attr("x", -nh / 2).attr("y", -45).attr("fill", "white").attr("text-anchor", "middle").attr("font-size", "12px").text("Resistance (Ω)");

        // NTC Line (Insulators)
        const ntcData = d3.range(0, 201, 10).map(t => ({ t, r: 900 * Math.exp(-0.02 * t) }));
        const ntcLine = d3.line().x(d => nx(d.t)).y(d => ny(d.r));
        ng.append("path").datum(ntcData).attr("fill", "none").attr("stroke", "var(--unit-blue)").attr("stroke-width", 2).attr("d", ntcLine);
        ng.append("text").attr("x", nx(150)).attr("y", ny(200)).attr("fill", "var(--unit-blue)").attr("font-size", "10px").text("NTC (Insulators)");

        // PTC Line (Metals)
        const ptcData = d3.range(0, 201, 10).map(t => ({ t, r: 100 * (1 + 0.004 * t) }));
        const ptcLine = d3.line().x(d => nx(d.t)).y(d => ny(d.r));
        ng.append("path").datum(ptcData).attr("fill", "none").attr("stroke", "var(--unit-red)").attr("stroke-width", 2).attr("d", ptcLine);
        ng.append("text").attr("x", nx(150)).attr("y", ny(180) + 20).attr("fill", "var(--unit-red)").attr("font-size", "10px").text("PTC (Metals)");
    }

    // ──── Card 25: Thermal Classification of Insulators ────
    function initThermalClasses() {
        const container = d3.select("#plot-dielectric-11");
        if (container.empty()) return;
        container.style("display", "flex").style("flex-wrap", "wrap").style("gap", "20px").style("justify-content", "center");

        const classes = [
            { name: "Y", limit: 90, color: "#fff3bf" },
            { name: "A", limit: 105, color: "#ffe066" },
            { name: "E", limit: 120, color: "#fab005" },
            { name: "B", limit: 130, color: "#f59f00" },
            { name: "F", limit: 155, color: "#e67700" },
            { name: "H", limit: 180, color: "#d9480f" },
            { name: "C", limit: 250, color: "#c92a2a" }
        ];

        // 1. Thermal Thermometer
        const thermDiv = container.append("div").style("width", "350px").style("text-align", "center");
        thermDiv.html(`
        <h4 style="color: var(--unit-gold); margin-bottom: 15px;">Thermal Classification</h4>
        <div style="display: flex; height: 320px; border: 1px solid #444; border-radius: 8px; overflow: hidden; position: relative;">
            <div id="thermometer-bar" style="width: 40px; background: #1a1a1a; height: 100%; border-right: 1px solid #444; position: relative;">
                <div id="thermometer-fill" style="position: absolute; bottom: 0; width: 100%; height: 50%; background: linear-gradient(to top, #ff922b, #fa5252); transition: height 0.5s;"></div>
            </div>
            <div id="class-markers" style="flex: 1; position: relative; background: rgba(0,0,0,0.5);"></div>
        </div>
        <div style="margin-top: 15px; color: white;">
            Current Temp: <input type="range" id="therm-temp-slider" min="20" max="250" value="105" style="width: 200px;">
            <div id="therm-class-val" style="font-weight: bold; margin-top: 5px; color: var(--unit-gold);">Class A (105°C)</div>
        </div>
    `);

        const markers = d3.select("#class-markers");
        classes.forEach(c => {
            const h = (c.limit / 250) * 100;
            markers.append("div").style("position", "absolute").style("bottom", `${h}%`).style("width", "100%").style("border-top", "1px dashed rgba(255,255,255,0.3)")
                .html(`<span style="position: absolute; left: 5px; bottom: 2px; font-size: 10px; color: ${c.color};">Class ${c.name}: ${c.limit}°C</span>`);
        });

        const updateTherm = (t) => {
            d3.select("#thermometer-fill").style("height", `${(t / 250) * 100}%`);
            const found = classes.find(c => c.limit >= t) || { name: 'Beyond C', color: 'red' };
            d3.select("#therm-class-val").text(`Detected: Class ${found.name}`).style("color", found.color);
        };

        d3.select("#therm-temp-slider").on("input", function () {
            updateTherm(this.value);
        });
        updateTherm(105);

        // 2. Life expectancy decay
        const lifeDiv = container.append("div").style("width", "400px");
        const lm = { t: 30, r: 20, b: 50, l: 60 };
        const lw = 400 - lm.l - lm.r, lh = 300 - lm.t - lm.b;
        lifeDiv.append("h4").style("color", "var(--unit-gold)").style("text-align", "center").text("Insulation Life (Montsinger's Rule)");
        const lSvg = lifeDiv.append("svg").attr("width", 400).attr("height", 300);
        const lg = lSvg.append("g").attr("transform", `translate(${lm.l},${lm.t})`);

        const lx = d3.scaleLinear().domain([90, 150]).range([0, lw]);
        const ly = d3.scaleLog().domain([1, 50]).range([lh, 0]);

        lg.append("g").attr("transform", `translate(0,${lh})`).call(d3.axisBottom(lx).ticks(5)).attr("color", "#666");
        lg.append("g").call(d3.axisLeft(ly).ticks(5, ".0s")).attr("color", "#666");

        const lData = d3.range(90, 151, 1).map(temp => ({ temp, life: 20 * Math.pow(2, -(temp - 105) / 10) }));
        const line = d3.line().x(d => lx(d.temp)).y(d => ly(d.life));
        lg.append("path").datum(lData).attr("fill", "none").attr("stroke", "var(--unit-orange)").attr("stroke-width", 2).attr("d", line);
        lg.append("text").attr("x", lw / 2).attr("y", lh + 40).attr("fill", "white").attr("text-anchor", "middle").text("Temperature (°C)");
        lg.append("text").attr("transform", "rotate(-90)").attr("x", -lh / 2).attr("y", -45).attr("fill", "white").attr("text-anchor", "middle").text("Relative Life (Years)");

        const lifeDot = lg.append("circle").attr("r", 5).attr("fill", "white");
        d3.select("#therm-temp-slider").on("input.life", function () {
            const t = this.value;
            if (t >= 90 && t <= 150) {
                const life = 20 * Math.pow(2, -(t - 105) / 10);
                lifeDot.style("display", "block").attr("cx", lx(t)).attr("cy", ly(life));
            } else {
                lifeDot.style("display", "none");
            }
        });
    }

    // ──── Card 26: Classification of Insulating Materials ────
    function initInsulatorClassification() {
        const container = d3.select("#plot-dielectric-12");
        if (container.empty()) return;
        container.style("display", "flex").style("flex-direction", "column").style("gap", "20px").style("align-items", "center");

        const nav = container.append("div").style("display", "flex").style("gap", "10px");
        const views = ["Physical State", "Hierarchical Tree", "SF6 vs Air"];
        const content = container.append("div").style("width", "100%").style("min-height", "400px").style("background", "rgba(255,255,255,0.02)").style("border-radius", "8px").style("padding", "20px");

        let currentView = 0;

        const renderView = () => {
            content.selectAll("*").remove();
            nav.selectAll("button").style("opacity", (d, i) => i === currentView ? 1 : 0.5);

            if (currentView === 0) {
                // Physical State View
                content.append("h5").style("color", "var(--unit-purple)").text("Classification by Physical State");
                const grid = content.append("div").style("display", "grid").style("grid-template-columns", "repeat(3, 1fr)").style("gap", "15px").style("margin-top", "20px");

                const states = [
                    { s: "Solid", ex: "Mica, Glass, Porcelain, Rubber, Wood, PVC" },
                    { s: "Liquid", ex: "Mineral Oil, Synthetic Oils, Transformer Oil" },
                    { s: "Gaseous", ex: "Air, SF6, Hydrogen, Nitrogen" }
                ];

                grid.selectAll("div").data(states).enter().append("div").style("padding", "15px").style("background", "rgba(168,85,247,0.1)").style("border", "1px solid var(--unit-purple)").style("border-radius", "8px")
                    .html(d => `<b style="color:var(--unit-purple); font-size:1.1rem;">${d.s}</b><br><span style="font-size:0.85rem; color:#ccc;">${d.ex}</span>`);
            } else if (currentView === 1) {
                // Tree View
                content.append("h5").style("color", "var(--unit-purple)").text("Structural & Chemical Classification");
                const treeData = {
                    name: "Insulators",
                    children: [
                        {
                            name: "Organic",
                            children: [{ name: "Natural (Wood/Paper)" }, { name: "Synthetic (PVC/Nylon)" }]
                        },
                        {
                            name: "Inorganic",
                            children: [{ name: "Glass/Ceramic" }, { name: "Mica" }]
                        }
                    ]
                };

                const tw = 700, th = 300;
                const tSvg = content.append("svg").attr("width", tw).attr("height", th);
                const tg = tSvg.append("g").attr("transform", "translate(100,0)");
                const treeRoot = d3.hierarchy(treeData);
                const treeLayout = d3.tree().size([th, tw - 300]);
                treeLayout(treeRoot);

                tg.selectAll(".link").data(treeRoot.links()).enter().append("path").attr("fill", "none").attr("stroke", "#444").attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x));
                const node = tg.selectAll(".node").data(treeRoot.descendants()).enter().append("g").attr("transform", d => `translate(${d.y},${d.x})`);
                node.append("circle").attr("r", 5).attr("fill", "var(--unit-purple)");
                node.append("text").attr("dy", ".31em").attr("x", d => d.children ? -8 : 8).attr("fill", "white").attr("text-anchor", d => d.children ? "end" : "start").attr("font-size", "12px").text(d => d.name);

            } else {
                // SF6 vs Air
                content.append("h5").style("color", "var(--unit-purple)").text("Dielectric Strength: SF6 vs Air");
                const sm = { t: 30, r: 20, b: 50, l: 60 };
                const sw = 600 - sm.l - sm.r, sh = 300 - sm.t - sm.b;
                const sSvg = content.append("svg").attr("width", 600).attr("height", 300);
                const sg = sSvg.append("g").attr("transform", `translate(${sm.l},${sm.t})`);

                const sx = d3.scaleLinear().domain([0, 10]).range([0, sw]);
                const sy = d3.scaleLinear().domain([0, 900]).range([sh, 0]);

                sg.append("g").attr("transform", `translate(0,${sh})`).call(d3.axisBottom(sx)).attr("color", "#666");
                sg.append("g").call(d3.axisLeft(sy)).attr("color", "#666");
                sg.append("text").attr("x", sw / 2).attr("y", sh + 40).attr("fill", "white").attr("text-anchor", "middle").text("Pressure (atm)");
                sg.append("text").attr("transform", "rotate(-90)").attr("x", -sh / 2).attr("y", -45).attr("fill", "white").attr("text-anchor", "middle").text("Strength (kV/cm)");

                const airData = d3.range(1, 11).map(p => ({ p, s: 30 * p }));
                const sfData = d3.range(1, 11).map(p => ({ p, s: 90 * p }));
                const sLine = d3.line().x(d => sx(d.p)).y(d => sy(d.s));
                sg.append("path").datum(airData).attr("fill", "none").attr("stroke", "var(--unit-blue)").attr("stroke-width", 2).attr("d", sLine);
                sg.append("path").datum(sfData).attr("fill", "none").attr("stroke", "var(--unit-purple)").attr("stroke-width", 2).attr("d", sLine);
                sg.append("text").attr("x", sx(8)).attr("y", sy(240) - 10).attr("fill", "var(--unit-blue)").text("Air");
                sg.append("text").attr("x", sx(8)).attr("y", sy(720) - 10).attr("fill", "var(--unit-purple)").text("SF6 (3x Air)");
            }
        };

        views.forEach((v, i) => {
            nav.append("button").attr("class", "ac-btn-icon").text(v).on("click", () => {
                currentView = i;
                renderView();
            });
        });
        renderView();
    }

