/* ============================================
   EE Formula Hub — Calculator Modal
   ============================================ */

function openCalculator(formulaId) {
    const formula = FORMULA_DATA.find(f => f.id === formulaId);
    if (!formula || !formula.calc || !formula.variables) return;

    const modal = document.querySelector('.calc-modal');
    const title = modal.querySelector('h3');
    const inputsDiv = modal.querySelector('.calc-modal__inputs');
    const resultDiv = modal.querySelector('.calc-modal__result');
    const calcBtn = modal.querySelector('.calc-modal__btn');
    const formulaDisplay = modal.querySelector('.calc-modal__formula-display');

    title.textContent = formula.name;
    resultDiv.textContent = '';

    // Render formula preview
    if (formulaDisplay) {
        try {
            katex.render(formula.latex, formulaDisplay, { throwOnError: false, displayMode: true });
        } catch (e) {
            formulaDisplay.textContent = formula.latex;
        }
    }

    // Build inputs
    inputsDiv.innerHTML = formula.variables.map(v =>
        `<div style="margin-bottom:10px;">
      <label style="display:block;font-size:0.8rem;color:var(--text-secondary);margin-bottom:4px;">${v.label}</label>
      <input type="number" step="any" data-sym="${v.sym}" placeholder="Enter ${v.label}" />
    </div>`
    ).join('') + '<p style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">Leave the unknown variable empty to solve for it.</p>';

    // Calculate handler
    const handler = () => {
        const vars = {};
        inputsDiv.querySelectorAll('input').forEach(inp => {
            const val = inp.value.trim();
            if (val !== '') vars[inp.dataset.sym] = parseFloat(val);
        });
        const res = formula.calc(vars);
        if (res && !isNaN(res.result)) {
            resultDiv.innerHTML = `<span style="color:var(--text-secondary);font-size:0.85rem;">${res.label} = </span>${res.result.toPrecision(6)} ${res.unit}`;
        } else {
            resultDiv.innerHTML = '<span style="color:var(--neon-orange);">Please provide enough known values.</span>';
        }
    };

    // Clean up old listeners
    const newBtn = calcBtn.cloneNode(true);
    calcBtn.parentNode.replaceChild(newBtn, calcBtn);
    newBtn.addEventListener('click', handler);

    // Enter key support
    inputsDiv.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') handler(); });
    });

    // Open modal
    modal.classList.add('open');
}

// Close calculator
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.querySelector('.calc-modal');
    if (!modal) return;
    const closeBtn = modal.querySelector('.calc-modal__close');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', e => {
        if (e.target === modal) modal.classList.remove('open');
    });
});
