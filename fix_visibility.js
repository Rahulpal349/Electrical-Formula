const fs = require('fs');
const path = require('path');

const topicsDir = 'c:/Users/rahul/Documents/Electrical Formula/subjects/measurements/topics';
const dirs = fs.readdirSync(topicsDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);

dirs.forEach(d => {
    const p = path.join(topicsDir, d, 'index.html');
    if (!fs.existsSync(p)) return;
    
    let html = fs.readFileSync(p, 'utf8');
    const original = html;
    
    // Convert <section id="modX" class="module-section"> to include active and data-aos="fade-up"
    html = html.replace(/<section\s+(id="mod\d+")\s+class="module-section"/g, '<section $1 class="module-section active" data-aos="fade-up"');
    
    // Case where it might already have active but no data-aos
    html = html.replace(/<section\s+(id="mod\d+")\s+class="module-section active"(?![\s\S]*data-aos="fade-up")/g, '<section $1 class="module-section active" data-aos="fade-up"');

    if (html !== original) {
        fs.writeFileSync(p, html);
        console.log('Fixed visibility for ' + d);
    }
});
