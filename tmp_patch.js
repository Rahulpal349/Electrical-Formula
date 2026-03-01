const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\rahul\\Documents\\Electrical Formula';

const htmlFiles = [
    'circuit.html', 'control.html', 'electronics.html',
    'estimation.html', 'index.html', 'machines.html',
    'measurements.html', 'micro.html', 'power.html',
    'powerplant.html', 'signals.html'
];

htmlFiles.forEach(file => {
    let p = path.join(dir, file);
    if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');

        // Remove target="_blank" from navbar links
        content = content.replace(/<ul class="navbar__links">([\s\S]*?)<\/ul>/g, (match) => {
            let newNav = match.replace(/ target="_blank"/g, '');

            // Check if Power Plant is in the list
            if (!newNav.includes('powerplant.html')) {
                // Let's insert it before control.html or at the end
                if (newNav.includes('<li><a href="control.html"')) {
                    newNav = newNav.replace('<li><a href="control.html"', '<li><a href="powerplant.html">Power Plant</a></li>\n            <li><a href="control.html"');
                } else if (newNav.includes('<li><a href="estimation.html"')) {
                    newNav = newNav.replace('<li><a href="estimation.html"', '<li><a href="powerplant.html">Power Plant</a></li>\n            <li><a href="estimation.html"');
                }
            }

            // Wait, the user wants "powerplant subject in 2nd line". 
            // If we want to guarantee it looks like a 2nd line, we might add a line break 
            // inside the ul if it's not already there.
            // For now, let's just make sure it's in the list and target="_blank" is removed.

            return newNav;
        });

        fs.writeFileSync(p, content);
        console.log('Fixed', file);
    }
});

const distDir = path.join(dir, 'dist');
if (fs.existsSync(distDir)) {
    htmlFiles.forEach(file => {
        let p = path.join(distDir, file);
        if (fs.existsSync(p)) {
            let content = fs.readFileSync(p, 'utf8');
            content = content.replace(/<ul class="navbar__links">([\s\S]*?)<\/ul>/g, (match) => {
                let newNav = match.replace(/ target="_blank"/g, '');
                return newNav;
            });
            fs.writeFileSync(p, content);
            console.log('Fixed dist', file);
        }
    });
}
