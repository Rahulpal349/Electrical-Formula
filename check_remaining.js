const fs = require('fs');

['control.html', 'estimation.html', 'utilization.html'].forEach(f => {
    try {
        const c = fs.readFileSync(f, 'utf8');

        // Find any IDs used in the page
        const idRe = /\bid="([^"]+)"/g;
        let m;
        const ids = [];
        while ((m = idRe.exec(c)) !== null) {
            ids.push(m[1]);
        }

        console.log('=== ' + f + ' ===');
        console.log('IDs: ' + ids.join(', '));

        // Find divs with specific class patterns that might be section containers
        const divClassRe = /class="([^"]*(?:section|module|chapter|unit|part)[^"]*)"/gi;
        let dm;
        const divClasses = [];
        while ((dm = divClassRe.exec(c)) !== null) {
            divClasses.push(dm[1]);
        }
        console.log('Section-like classes: ' + divClasses.join(', '));

        // Find h2 headings
        const h2Re = /<h2[^>]*>([\s\S]*?)<\/h2>/g;
        let h2m;
        const headings = [];
        while ((h2m = h2Re.exec(c)) !== null) {
            const text = h2m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
            headings.push(text);
        }
        console.log('h2s: ' + headings.join(' | '));
        console.log('Lines: ' + c.split('\n').length);
        console.log('');
    } catch (e) {
        console.log(f + ': ' + e.message);
    }
});
