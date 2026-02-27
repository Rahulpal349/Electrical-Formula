/* =========================================
   Circuit Theory Specific JS (circuit.js)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize AOS (Animate on Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: false,
            offset: 100
        });
    }

    // 2. Typewriter Effect for Hero Subtitle
    const subtitleEl = document.getElementById('circuit-typewriter');
    if (subtitleEl) {
        const text = "Complete Formula Reference · Animated · Interactive";
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

    // 3. Three.js Background (Circuit Board abstract)
    initThreeJsBackground();

    // 4. Smooth scrolling for internal sticky nav
    const innerNavLinks = document.querySelectorAll('.circuit-nav a');
    innerNavLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                // Offset for main navbar + inner navbar
                const offset = 140;
                const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });

                // Update active state manually (optional, spy handles it too)
                innerNavLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // 5. Scroll Spy for internal nav
    const sections = document.querySelectorAll('.circuit-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                innerNavLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { rootMargin: '-150px 0px -60% 0px' });

    sections.forEach(s => observer.observe(s));
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

    // Nodes material
    const nodeMaterial = new THREE.PointsMaterial({
        color: 0x00f5ff,
        size: 0.3,
        transparent: true,
        opacity: 0.8
    });

    const nodes = new THREE.Points(nodeGeometry, nodeMaterial);
    scene.add(nodes);

    // Create lines (traces) between close nodes
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00f5ff,
        transparent: true,
        opacity: 0.15
    });

    const linesGroup = new THREE.Group();

    // Very basic distance check to draw some random lines
    // In a real scenario you'd build a more structured grid, but this gives a cool abstract tech feel
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
    const edgesMat = new THREE.LineBasicMaterial({ color: 0nfacc15, linewidth: 2 }); // Yellow accent

    const chips = [];
    for (let i = 0; i < 5; i++) {
        const mesh = new THREE.Mesh(boxGeo, boxMat);
        const edges = new THREE.LineSegments(edgesGeo, new THREE.LineBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.5 }));
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
