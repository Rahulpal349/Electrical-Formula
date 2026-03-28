/* =========================================
   Shared Animated Hero Script (hero-bg.js)
   Used across all subject pages for the 3D Circuit Background
   and Typewriter effect.
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize AOS (Animate on Scroll) if not already initialized
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: false,
            offset: 100
        });
    }

    // 2. Typewriter Effect for Hero Subtitle
    // Expected to find an element with id="circuit-typewriter" or similar generic ID
    const subtitleEl = document.getElementById('circuit-typewriter') || document.getElementById('hero-typewriter');
    if (subtitleEl) {
        // Read text from data attribute or fallback to default
        const text = subtitleEl.getAttribute('data-text') || "Complete Formula Reference · Animated · Interactive";
        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                subtitleEl.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        setTimeout(typeWriter, 500); // Start typing after 500ms
    }

    // 3. Three.js Background
    initThreeJsBackground();

});

/* ---------- Three.js 3D Circuit Board Background ---------- */
function initThreeJsBackground() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    // Dark background matching navy theme
    scene.background = new THREE.Color(0x0a0e1a);
    scene.fog = new THREE.Fog(0x0a0e1a, 10, 50);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create a grid of points / nodes
    const nodeGeometry = new THREE.BufferGeometry();
    const nodeCount = 300;
    const positions = new Float32Array(nodeCount * 3);

    for (let i = 0; i < nodeCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 60;     // x
        positions[i + 1] = (Math.random() - 0.5) * 10;   // y
        positions[i + 2] = (Math.random() - 0.5) * 60;   // z
    }

    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Colors can be dynamic based on the page theme. 
    // We try to read a CSS variable --neon-cyan, fallback to 0x00f5ff
    let primaryColorHex = 0x00f5ff;
    let accentColorHex = 0xfacc15;

    // Check if the current page has custom variables defined on the body
    const bodyStyles = getComputedStyle(document.body);
    const primVar = bodyStyles.getPropertyValue('--neon-cyan').trim();
    const accVar = bodyStyles.getPropertyValue('--electric-yellow').trim();

    if (primVar && primVar.startsWith('#')) {
        primaryColorHex = parseInt(primVar.replace('#', '0x'));
    }
    if (accVar && accVar.startsWith('#')) {
        accentColorHex = parseInt(accVar.replace('#', '0x'));
    }


    // Nodes material
    const nodeMaterial = new THREE.PointsMaterial({
        color: primaryColorHex,
        size: 0.3,
        transparent: true,
        opacity: 0.8
    });

    const nodes = new THREE.Points(nodeGeometry, nodeMaterial);
    scene.add(nodes);

    // Create lines (traces) between close nodes
    const lineMaterial = new THREE.LineBasicMaterial({
        color: primaryColorHex,
        transparent: true,
        opacity: 0.15
    });

    const linesGroup = new THREE.Group();

    // Very basic distance check to draw some random lines
    for (let i = 0; i < 150; i++) {
        const idx1 = Math.floor(Math.random() * nodeCount) * 3;
        const idx2 = Math.floor(Math.random() * nodeCount) * 3;

        const pt1 = new THREE.Vector3(positions[idx1], positions[idx1 + 1], positions[idx1 + 2]);
        const pt2 = new THREE.Vector3(positions[idx2], positions[idx2 + 1], positions[idx2 + 2]);

        if (pt1.distanceTo(pt2) < 20) {
            const geom = new THREE.BufferGeometry().setFromPoints([pt1, pt2]);
            const line = new THREE.Line(geom, lineMaterial);
            linesGroup.add(line);
        }
    }
    scene.add(linesGroup);

    // Floating 3D circuit chips
    const boxGeo = new THREE.BoxGeometry(2, 0.2, 2);
    const boxMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.8
    });
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const edgesMat = new THREE.LineBasicMaterial({ color: accentColorHex, linewidth: 2 });

    const chips = [];
    for (let i = 0; i < 5; i++) {
        const mesh = new THREE.Mesh(boxGeo, boxMat);
        const edges = new THREE.LineSegments(edgesGeo, new THREE.LineBasicMaterial({ color: accentColorHex, transparent: true, opacity: 0.5 }));
        mesh.add(edges);

        mesh.position.set(
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 40
        );
        mesh.rotation.y = Math.random() * Math.PI;
        scene.add(mesh);
        chips.push(mesh);
    }

    // Animation Loop
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.005;

        // Slowly rotate scene
        nodes.rotation.y = time * 0.5;
        linesGroup.rotation.y = time * 0.5;

        // Float chips
        chips.forEach((c, i) => {
            c.position.y += Math.sin(time * 2 + i) * 0.01;
            c.rotation.y += 0.002;
        });

        renderer.render(scene, camera);
    }

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
