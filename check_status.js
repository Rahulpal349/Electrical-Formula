const fs = require('fs');

const files = [
    'machines.html', 'measurements.html', 'power.html', 'powerplant.html',
    'control.html', 'electronics.html', 'signals.html', 'micro.html',
    'estimation.html', 'utilization.html'
];

files.forEach(f => {
    try {
        const c = fs.readFileSync(f, 'utf8');
        const hasSidebar = c.includes('class="sidebar"');
        const hasPW = c.includes('page-wrapper');
        const hasCircuitNav = c.includes('class="circuit-nav"');
        const hasCircuitMain = c.includes('circuit-main');
        const hasMainContent = c.includes('main-content');

        // Count sections
        const sectionRe = /id="(mod\d+|section-?\w*|sec-?\w*)"/g;
        let m;
        const sections = [];
        while ((m = sectionRe.exec(c)) !== null) {
            sections.push(m[1]);
        }

        console.log(f + ':');
        console.log('  sidebar=' + hasSidebar + ' pageWrapper=' + hasPW + ' circuitNav=' + hasCircuitNav);
        console.log('  circuitMain=' + hasCircuitMain + ' mainContent=' + hasMainContent);
        console.log('  sections: ' + sections.join(', '));
        console.log('');
    } catch (e) {
        console.log(f + ': ERROR - ' + e.message);
    }
});
