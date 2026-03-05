
// ==========================================
// TWO PORT NETWORKS - JS Interactivity (Cards 44-54)
// ==========================================

(function () {

    // ---- Card 44: Intro Param Selector ----
    const paramSelBtns = document.querySelectorAll('.param-sel-btn');
    const introIndep = document.getElementById('intro-indep');
    const introDep = document.getElementById('intro-dep');

    const paramInfo = {
        z: { indep: 'I₁, I₂', dep: 'V₁, V₂' },
        y: { indep: 'V₁, V₂', dep: 'I₁, I₂' },
        h: { indep: 'I₁, V₂', dep: 'V₁, I₂' },
        g: { indep: 'V₁, I₂', dep: 'I₁, V₂' },
        abcd: { indep: 'V₂, -I₂', dep: 'V₁, I₁' },
        'abcd-inv': { indep: 'V₁, -I₁', dep: 'V₂, I₂' }
    };

    paramSelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const param = btn.getAttribute('data-param');
            if (introIndep && introDep && paramInfo[param]) {
                introIndep.textContent = paramInfo[param].indep;
                introDep.textContent = paramInfo[param].dep;
            }
            paramSelBtns.forEach(b => b.style.opacity = '0.6');
            btn.style.opacity = '1';
        });
    });

    // ---- Card 47/48: h/g Tab Toggle ----
    const btnShowH = document.getElementById('btn-show-h');
    const btnShowG = document.getElementById('btn-show-g');
    const hContent = document.getElementById('h-content');
    const gContent = document.getElementById('g-content');

    function showH() {
        if (!hContent || !gContent) return;
        hContent.style.opacity = '1';
        hContent.style.transform = 'translateX(0)';
        hContent.style.pointerEvents = 'auto';
        gContent.style.opacity = '0';
        gContent.style.transform = 'translateX(20px)';
        gContent.style.pointerEvents = 'none';
        btnShowH.classList.add('active');
        btnShowG.classList.remove('active');
    }
    function showG() {
        if (!hContent || !gContent) return;
        gContent.style.opacity = '1';
        gContent.style.transform = 'translateX(0)';
        gContent.style.pointerEvents = 'auto';
        hContent.style.opacity = '0';
        hContent.style.transform = 'translateX(-20px)';
        hContent.style.pointerEvents = 'none';
        btnShowG.classList.add('active');
        btnShowH.classList.remove('active');
    }

    if (btnShowH) btnShowH.addEventListener('click', showH);
    if (btnShowG) btnShowG.addEventListener('click', showG);

    // ---- Card 51: Connection Tabs ----
    const connTabBtns = document.querySelectorAll('[data-conn]');
    const connPanes = document.querySelectorAll('.conn-pane');

    connTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-conn');
            connPanes.forEach(pane => {
                pane.style.display = pane.id === 'conn-' + target ? 'block' : 'none';
            });
            connTabBtns.forEach(b => {
                b.classList.remove('neon-btn');
                b.classList.add('outline-btn');
            });
            btn.classList.add('neon-btn');
            btn.classList.remove('outline-btn');
        });
    });

    // ---- Card 52: Transformer Slider ----
    const xformerSlider = document.getElementById('xformer-slider');
    if (xformerSlider) {
        function updateTransformer() {
            const n = parseFloat(xformerSlider.value);
            const nStr = n.toFixed(1);
            const display = document.getElementById('xformer-n-display');
            const val = document.getElementById('xformer-n-val');
            const xfa = document.getElementById('xfa');
            const xfd = document.getElementById('xfd');
            if (display) display.textContent = 'n = ' + nStr;
            if (val) val.textContent = nStr;
            if (xfa) xfa.textContent = (1 / n).toFixed(3);
            if (xfd) xfd.textContent = nStr;
        }
        xformerSlider.addEventListener('input', updateTransformer);
    }

    // ---- Card 50: Symmetry & Reciprocity Checker ----
    const symCheckType = document.getElementById('sym-check-type');
    const symP11 = document.getElementById('sym-p11');
    const symP12 = document.getElementById('sym-p12');
    const symP21 = document.getElementById('sym-p21');
    const symP22 = document.getElementById('sym-p22');
    const badgeReciprocal = document.getElementById('badge-reciprocal');
    const badgeSymmetrical = document.getElementById('badge-symmetrical');

    function checkSymmetry() {
        if (!symCheckType || !badgeReciprocal || !badgeSymmetrical) return;
        const type = symCheckType.value;
        const p11 = parseFloat(symP11.value) || 0;
        const p12 = parseFloat(symP12.value) || 0;
        const p21 = parseFloat(symP21.value) || 0;
        const p22 = parseFloat(symP22.value) || 0;

        let isReciprocal = false, isSymmetrical = false;
        const EPS = 1e-9;

        if (type === 'z' || type === 'y') {
            isReciprocal = Math.abs(p12 - p21) < EPS;
            isSymmetrical = Math.abs(p11 - p22) < EPS;
        } else if (type === 'h' || type === 'g') {
            isReciprocal = Math.abs(p12 + p21) < EPS;  // h12 = -h21
            isSymmetrical = Math.abs(p11 * p22 - p12 * p21 - 1) < EPS;
        } else if (type === 'abcd') {
            isReciprocal = Math.abs(p11 * p22 - p12 * p21 - 1) < EPS; // AD-BC=1
            isSymmetrical = Math.abs(p11 - p22) < EPS; // A=D
        }

        const setStatus = (el, ok) => {
            const label = el.id.includes('reciprocal') ? 'Reciprocal' : 'Symmetrical';
            el.textContent = label + ': ' + (ok ? '✓ YES' : '✗ NO');
            el.style.background = ok ? 'rgba(0,255,100,0.15)' : 'rgba(255,50,50,0.15)';
            el.style.borderColor = ok ? '#00ff88' : '#ff5050';
            el.style.color = ok ? '#00ff88' : '#ff5050';
        };

        setStatus(badgeReciprocal, isReciprocal);
        setStatus(badgeSymmetrical, isSymmetrical);
    }

    if (symCheckType) {
        [symCheckType, symP11, symP12, symP21, symP22].forEach(el => {
            if (el) el.addEventListener('input', checkSymmetry);
        });
        checkSymmetry();
    }

    // ---- Card 53: T-Pi Network Toggle ----
    let isTPi = false;
    const btnTPiToggle = document.getElementById('btn-t-pi-toggle');
    const tpiHeading = document.getElementById('t-pi-heading');
    const tFormulas = document.getElementById('t-formulas');
    const piFormulas = document.getElementById('pi-formulas');
    const labelZ1 = document.getElementById('label-z1');
    const labelZ2 = document.getElementById('label-z2');
    const labelZ3 = document.getElementById('label-z3');
    const inpZ1 = document.getElementById('inp-z1');
    const inpZ2 = document.getElementById('inp-z2');
    const inpZ3 = document.getElementById('inp-z3');
    const tPiMatrixRes = document.getElementById('t-pi-matrix-res');

    function updateTPiMatrix() {
        const z1 = parseFloat(inpZ1 ? inpZ1.value : 0) || 0;
        const z2 = parseFloat(inpZ2 ? inpZ2.value : 0) || 0;
        const z3 = parseFloat(inpZ3 ? inpZ3.value : 0) || 0;
        if (tPiMatrixRes) {
            if (!isTPi) {
                // T-network: [Z] matrix
                tPiMatrixRes.innerHTML = `[${z1 + z3}, ${z3}]<br>[${z3}, ${z2 + z3}]`;
            } else {
                // Pi-network: [Y] matrix, Za=z1, Zb=z2, Zc=z3
                const ya = z1 !== 0 ? 1 / z1 : 0;
                const yb = z2 !== 0 ? 1 / z2 : 0;
                const yc = z3 !== 0 ? 1 / z3 : 0;
                tPiMatrixRes.innerHTML = `[${(ya + yb).toFixed(3)}, ${(-yb).toFixed(3)}]<br>[${(-yb).toFixed(3)}, ${(yb + yc).toFixed(3)}]`;
            }
        }
    }

    if (btnTPiToggle) {
        btnTPiToggle.addEventListener('click', () => {
            isTPi = !isTPi;

            if (isTPi) {
                // Switch to Pi display
                if (tpiHeading) { tpiHeading.textContent = 'π-Network Parameters'; tpiHeading.style.color = '#fb7185'; }
                if (tFormulas) tFormulas.style.display = 'none';
                if (piFormulas) piFormulas.style.display = 'block';
                if (labelZ1) { labelZ1.textContent = 'Yₐ (S)'; labelZ1.style.color = '#fb7185'; }
                if (labelZ2) { labelZ2.textContent = 'Y_b (S)'; labelZ2.style.color = '#fb7185'; }
                if (labelZ3) { labelZ3.textContent = 'Y_c (S)'; labelZ3.style.color = '#fb7185'; }
                // Update SVG lines to Pi
                const svgEl = document.getElementById('t-pi-svg');
                if (svgEl) {
                    document.getElementById('morph-l1').setAttribute('x1', '20');
                    document.getElementById('morph-l1').setAttribute('y1', '40');
                    document.getElementById('morph-l1').setAttribute('x2', '20');
                    document.getElementById('morph-l1').setAttribute('y2', '120');
                    document.getElementById('morph-t1').setAttribute('x', '5');
                    document.getElementById('morph-t1').setAttribute('y', '85');
                    document.getElementById('morph-t1').textContent = 'Yₐ';

                    document.getElementById('morph-l2').setAttribute('x1', '20');
                    document.getElementById('morph-l2').setAttribute('y1', '40');
                    document.getElementById('morph-l2').setAttribute('x2', '180');
                    document.getElementById('morph-l2').setAttribute('y2', '40');
                    document.getElementById('morph-t2').setAttribute('x', '100');
                    document.getElementById('morph-t2').setAttribute('y', '30');
                    document.getElementById('morph-t2').textContent = 'Y_b';

                    document.getElementById('morph-l3').setAttribute('x1', '180');
                    document.getElementById('morph-l3').setAttribute('y1', '40');
                    document.getElementById('morph-l3').setAttribute('x2', '180');
                    document.getElementById('morph-l3').setAttribute('y2', '120');
                    document.getElementById('morph-t3').setAttribute('x', '185');
                    document.getElementById('morph-t3').setAttribute('y', '85');
                    document.getElementById('morph-t3').textContent = 'Y_c';

                    [document.getElementById('morph-l1'), document.getElementById('morph-l2'), document.getElementById('morph-l3')].forEach(l => {
                        if (l) l.setAttribute('stroke', '#fb7185');
                    });
                    [document.getElementById('morph-t1'), document.getElementById('morph-t2'), document.getElementById('morph-t3')].forEach(t => {
                        if (t) t.setAttribute('fill', '#fb7185');
                    });
                }
            } else {
                // Switch back to T display
                if (tpiHeading) { tpiHeading.textContent = 'T-Network Parameters'; tpiHeading.style.color = '#60a5fa'; }
                if (tFormulas) tFormulas.style.display = 'block';
                if (piFormulas) piFormulas.style.display = 'none';
                if (labelZ1) { labelZ1.textContent = 'Z₁'; labelZ1.style.color = '#60a5fa'; }
                if (labelZ2) { labelZ2.textContent = 'Z₂'; labelZ2.style.color = '#60a5fa'; }
                if (labelZ3) { labelZ3.textContent = 'Z₃'; labelZ3.style.color = '#60a5fa'; }
                // Restore T SVG
                const svgEl = document.getElementById('t-pi-svg');
                if (svgEl) {
                    document.getElementById('morph-l1').setAttribute('x1', '20');
                    document.getElementById('morph-l1').setAttribute('y1', '40');
                    document.getElementById('morph-l1').setAttribute('x2', '100');
                    document.getElementById('morph-l1').setAttribute('y2', '40');
                    document.getElementById('morph-t1').setAttribute('x', '60');
                    document.getElementById('morph-t1').setAttribute('y', '30');
                    document.getElementById('morph-t1').textContent = 'Z₁';

                    document.getElementById('morph-l2').setAttribute('x1', '100');
                    document.getElementById('morph-l2').setAttribute('y1', '40');
                    document.getElementById('morph-l2').setAttribute('x2', '180');
                    document.getElementById('morph-l2').setAttribute('y2', '40');
                    document.getElementById('morph-t2').setAttribute('x', '140');
                    document.getElementById('morph-t2').setAttribute('y', '30');
                    document.getElementById('morph-t2').textContent = 'Z₂';

                    document.getElementById('morph-l3').setAttribute('x1', '100');
                    document.getElementById('morph-l3').setAttribute('y1', '40');
                    document.getElementById('morph-l3').setAttribute('x2', '100');
                    document.getElementById('morph-l3').setAttribute('y2', '120');
                    document.getElementById('morph-t3').setAttribute('x', '115');
                    document.getElementById('morph-t3').setAttribute('y', '80');
                    document.getElementById('morph-t3').textContent = 'Z₃';

                    [document.getElementById('morph-l1'), document.getElementById('morph-l2'), document.getElementById('morph-l3')].forEach(l => {
                        if (l) l.setAttribute('stroke', '#60a5fa');
                    });
                    [document.getElementById('morph-t1'), document.getElementById('morph-t2'), document.getElementById('morph-t3')].forEach(t => {
                        if (t) t.setAttribute('fill', '#60a5fa');
                    });
                }
            }
            updateTPiMatrix();
        });
    }

    if (inpZ1) inpZ1.addEventListener('input', updateTPiMatrix);
    if (inpZ2) inpZ2.addEventListener('input', updateTPiMatrix);
    if (inpZ3) inpZ3.addEventListener('input', updateTPiMatrix);
    updateTPiMatrix();

    // ---- Card 54: Universal Parameter Converter ----
    const btnCalcConvert = document.getElementById('btn-calc-convert');
    if (btnCalcConvert) {
        btnCalcConvert.addEventListener('click', () => {
            const type = document.getElementById('conv-input-type').value;
            const p11 = parseFloat(document.getElementById('conv-p11').value) || 0;
            const p12 = parseFloat(document.getElementById('conv-p12').value) || 0;
            const p21 = parseFloat(document.getElementById('conv-p21').value) || 0;
            const p22 = parseFloat(document.getElementById('conv-p22').value) || 0;

            let z11, z12, z21, z22, det;
            const f = v => parseFloat(v).toFixed(4);

            if (type === 'z') {
                z11 = p11; z12 = p12; z21 = p21; z22 = p22;
            } else if (type === 'y') {
                det = p11 * p22 - p12 * p21;
                if (Math.abs(det) < 1e-10) { showError('Singular [Y] matrix'); return; }
                z11 = p22 / det; z12 = -p12 / det; z21 = -p21 / det; z22 = p11 / det;
            } else if (type === 'abcd') {
                // A=p11,B=p12,C=p21,D=p22 => Z params
                if (Math.abs(p21) < 1e-10) { showError('C cannot be 0 for ABCD→Z'); return; }
                z11 = p11 / p21; z12 = (p11 * p22 - p12 * p21) / p21; z21 = 1 / p21; z22 = p22 / p21;
            }

            det = z11 * z22 - z12 * z21;

            // [Z]
            document.getElementById('res-z').innerHTML = `[ ${f(z11)},  ${f(z12)} ]<br>[ ${f(z21)},  ${f(z22)} ]`;

            // [Y] = inverse of [Z]
            if (Math.abs(det) > 1e-10) {
                const y11 = z22 / det, y12 = -z12 / det, y21 = -z21 / det, y22 = z11 / det;
                document.getElementById('res-y').innerHTML = `[ ${f(y11)},  ${f(y12)} ]<br>[ ${f(y21)},  ${f(y22)} ]`;
            } else {
                document.getElementById('res-y').innerHTML = '<span style="color:#ff5050;">Singular</span>';
            }

            // [ABCD] from Z
            if (Math.abs(z21) > 1e-10) {
                const A = z11 / z21, B = det / z21, C = 1 / z21, D = z22 / z21;
                document.getElementById('res-abcd').innerHTML = `A=${f(A)}, B=${f(B)}<br>C=${f(C)}, D=${f(D)}`;
            } else {
                document.getElementById('res-abcd').innerHTML = '<span style="color:#ff5050;">Z21=0</span>';
            }

            // [h] from Z
            if (Math.abs(z22) > 1e-10) {
                const h11 = det / z22, h12 = z12 / z22, h21 = -z21 / z22, h22 = 1 / z22;
                document.getElementById('res-h').innerHTML = `h11=${f(h11)}<br>h12=${f(h12)}, h21=${f(h21)}<br>h22=${f(h22)}`;
            } else {
                document.getElementById('res-h').innerHTML = '<span style="color:#ff5050;">Z22=0</span>';
            }

            // Trigger KaTeX re-render on results if available
            if (window.renderMathInElement) {
                ['res-z', 'res-y', 'res-abcd', 'res-h'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) renderMathInElement(el);
                });
            }
        });
    }

    function showError(msg) {
        ['res-z', 'res-y', 'res-abcd', 'res-h'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<span style="color:#ff5050;">' + msg + '</span>';
        });
    }

})(); // End IIFE
