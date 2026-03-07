const fs = require('fs');

const files = [
    'machines.html', 'measurements.html', 'power.html', 'powerplant.html',
    'control.html', 'electronics.html', 'signals.html', 'micro.html',
    'estimation.html', 'utilization.html'
];

files.forEach(f => {
    try {
        const c = fs.readFileSync(f, 'utf8');
        const hasSidebar = c.includes('class="sidebar"') || c.includes("class='sidebar'");
        const hasPageWrapper = c.includes('page-wrapper');
        const hasMainContent = c.includes('main-content');
        const hasSubnav = c.includes('section-nav') || c.includes('subsection-tabs');

        // Find section IDs
        const sectionIds = [];
        const re = /id="(mod\d+|section-\w+|sec-\w+)"/g;
        let m;
        while ((m = re.exec(c)) !== null) {
            sectionIds.push(m[1]);
        }

        // Find sidebar nav items
        const sidebarItems = [];
        if (hasSidebar) {
            const sideStart = c.indexOf('class="sidebar"');
            const sideEnd = c.indexOf('</nav>', sideStart);
            if (sideEnd > -1) {
                const sidebar = c.substring(sideStart, sideEnd);
                const linkRe = /href="#([^"]+)"[^>]*>[\s\S]*?<\/a>/g;
                let lm;
                while ((lm = linkRe.exec(sidebar)) !== null) {
                    const text = lm[0].replace(/<[^>]+>/g, '').trim();
                    sidebarItems.push(lm[1] + ': ' + text);
                }
            }
        }

        console.log('--- ' + f + ' ---');
        console.log('  sidebar=' + hasSidebar + ', page-wrapper=' + hasPageWrapper + ', main-content=' + hasMainContent);
        console.log('  sections: ' + sectionIds.join(', '));
        if (sidebarItems.length > 0) {
            console.log('  sidebar items: ' + sidebarItems.join(' | '));
        }
        console.log('');
    } catch (e) {
        console.log(f + ': ERROR - ' + e.message);
    }
});
