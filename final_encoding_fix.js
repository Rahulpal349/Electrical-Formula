const fs = require('fs');
const path = require('path');

const replacements = [
    { target: /\ufffd/g, replacement: '⚡' }, // Replace weird diamonds with lightning in meta/nav
    { target: /Ohm \(O\)/g, replacement: 'Ohm (Ω)' },
    { target: /Ohm·meter/g, replacement: 'Ohm·meter (Ω·m)' },
    { target: /\[ML\?T\?\?\]/g, replacement: '[ML²T⁻²]' },
    { target: />\? EE Hub/g, replacement: '>⚡ EE Hub' },
    { target: />\? Explore Formulas/g, replacement: '>⚡ Explore Formulas' },
    { target: />\?P & \?C/g, replacement: '>μP & μC' },
    { target: /Delta \? Star/g, replacement: 'Delta ↔ Star' },
    { target: /\? \? Y Form/g, replacement: 'Δ ↔ Y Form' },
    { target: /href=\"css\/style\.css\?v=\d+\"/g, replacement: (match) => match.replace(/\?v=\d+/, '') } // Clean up version strings just in case
];

const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    replacements.forEach(r => {
        content = content.replace(r.target, r.replacement);
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed encoding issues in: ${file}`);
    } else {
        console.log(`No encoding issues found in: ${file}`);
    }
});

console.log('Final encoding fix complete.');
