const fs = require('fs');
const path = require('path');

const topicsDir = 'c:/Users/rahul/Documents/Electrical Formula/subjects/measurements/topics';
const dirs = fs.readdirSync(topicsDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);

dirs.forEach(d => {
    const p = path.join(topicsDir, d, 'index.html');
    if (!fs.existsSync(p)) return;
    
    let html = fs.readFileSync(p, 'utf8');
    const match = html.match(/MODULE (\d+)/i);
    let modNum = match ? match[1] : null;

    if (modNum === '1') {
        if (!html.includes('measurements-ext.js')) {
            html = html.replace('</body>', '    <script src="../../js/measurements-ext.js"></script>\n</body>');
            fs.writeFileSync(p, html);
            console.log('Injected measurements-ext.js into ' + d);
        }
    }
});
