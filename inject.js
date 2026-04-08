const fs = require('fs');
const path = require('path');

const topicsDir = 'c:/Users/rahul/Documents/Electrical Formula/subjects/measurements/topics';
const jsDir = 'c:/Users/rahul/Documents/Electrical Formula/subjects/measurements/js';

const jsFiles = fs.readdirSync(jsDir);

const dirs = fs.readdirSync(topicsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

dirs.forEach(d => {
    const p = path.join(topicsDir, d, 'index.html');
    if (!fs.existsSync(p)) return;
    
    let html = fs.readFileSync(p, 'utf8');
    
    const match = html.match(/MODULE (\d+)/i);
    let modNum = match ? match[1] : null;
    
    let scripts = '\n    <!-- Scripts -->\n';
    scripts += '    <script src="../../js/measurements.js"></script>\n';
    
    if (modNum) {
        const modJs = 'measurements-mod' + modNum + '.js';
        if (jsFiles.includes(modJs)) {
            scripts += '    <script src="../../js/' + modJs + '"></script>\n';
        }
    }
    
    if (!html.includes('measurements.js')) {
        let newHtml = html.replace('</body>', scripts + '</body>');
        fs.writeFileSync(p, newHtml);
        console.log('Injected into ' + d + ' (Mod '+modNum+')');
    } else {
        console.log('Already injected in ' + d);
    }
});
