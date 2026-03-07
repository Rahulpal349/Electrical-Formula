const fs = require('fs');

const files = [
    'machines.html', 'measurements.html', 'power.html', 'powerplant.html',
    'control.html', 'electronics.html', 'signals.html', 'micro.html',
    'estimation.html', 'utilization.html'
];

// For each file, manually define the section nav items based on actual content
// We'll auto-detect from section IDs in the file
function extractSections(content) {
    const items = [];
    // Look for <section id="..."> with nearby module titles
    const sectionRe = /<section\s+id="([^"]+)"[^>]*>/g;
    let m;
    while ((m = sectionRe.exec(content)) !== null) {
        const sectionId = m[1];
        // Find the title near this section (look for <h2> within 500 chars)
        const after = content.substring(m.index, m.index + 800);

        // Try to find module title
        let title = null;
        const h2Match = after.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
        if (h2Match) {
            title = h2Match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
            // Shorten for nav display
            if (title.length > 35) {
                // Try to get just the key part
                const dashParts = title.split('—');
                if (dashParts.length > 1) {
                    title = dashParts[1].trim();
                } else if (title.includes(':')) {
                    title = title.split(':')[1].trim();
                }
            }
        }

        if (!title) {
            // Try h3 or header
            const h3Match = after.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
            if (h3Match) {
                title = h3Match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
            }
        }

        if (title) {
            items.push({ id: sectionId, text: title });
        }
    }
    return items;
}

let report = '';

files.forEach(f => {
    try {
        let content = fs.readFileSync(f, 'utf8');

        // Check current state
        const hasSidebar = content.includes('class="sidebar"');
        const hasPW = content.includes('page-wrapper');
        const hasCircuitNav = content.includes('class="circuit-nav"');
        const hasCircuitMain = content.includes('circuit-main');
        const hasMainContent = content.includes('"main-content"') && !content.includes('"circuit-main"');

        report += f + ': sidebar=' + hasSidebar + ' PW=' + hasPW + ' circuitNav=' + hasCircuitNav + ' circuitMain=' + hasCircuitMain + '\n';

        let changed = false;

        // Step 1: Remove sidebar if still present
        if (hasSidebar) {
            const sideStart = content.indexOf('<nav class="sidebar"');
            // Go back to find any comment before it
            let blockStart = sideStart;
            const before = content.substring(Math.max(0, sideStart - 200), sideStart);
            const commentIdx = before.lastIndexOf('<!--');
            if (commentIdx > -1) {
                const commentEndCheck = before.substring(commentIdx);
                if (commentEndCheck.includes('-->')) {
                    blockStart = sideStart - (before.length - commentIdx);
                }
            }

            const sideEnd = content.indexOf('</nav>', sideStart);
            if (sideEnd > -1) {
                content = content.substring(0, blockStart) + content.substring(sideEnd + 6);
                changed = true;
                report += '  -> Removed sidebar\n';
            }
        }

        // Step 2: Remove page-wrapper div (opening and closing)
        if (content.includes('page-wrapper')) {
            // Remove opening <div class="page-wrapper">
            content = content.replace(/<div\s+class="page-wrapper">\s*\r?\n?/g, '');

            // Remove the closing </div> that matched page-wrapper
            // It's typically right after </main> and before scripts
            const mainEnd = content.lastIndexOf('</main>');
            if (mainEnd > -1) {
                const afterMain = content.substring(mainEnd + 7);
                const firstDiv = afterMain.indexOf('</div>');
                if (firstDiv > -1 && firstDiv < 50) {
                    // This </div> closes the page-wrapper
                    content = content.substring(0, mainEnd + 7) + afterMain.substring(firstDiv + 6);
                    changed = true;
                    report += '  -> Removed page-wrapper\n';
                }
            }
        }

        // Step 3: Change main-content to circuit-main
        if (content.includes('"main-content"')) {
            content = content.replace('"main-content"', '"circuit-main"');
            changed = true;
            report += '  -> Changed main-content to circuit-main\n';
        }

        // Step 4: Add circuit-nav if missing
        if (!content.includes('class="circuit-nav"')) {
            const sections = extractSections(content);

            if (sections.length > 0) {
                const navLinks = sections.map(s =>
                    '            <li><a href="#' + s.id + '">' + s.text + '</a></li>'
                ).join('\n');

                const circuitNav = `
    <!-- Internal Page Navigation -->
    <nav class="circuit-nav" id="circuit-nav">
        <ul>
${navLinks}
        </ul>
    </nav>`;

                // Insert after the main navbar (</nav>)
                // Find the unified navbar's closing tag
                const navbarStart = content.indexOf('<nav class="navbar"');
                if (navbarStart > -1) {
                    const navbarEnd = content.indexOf('</nav>', navbarStart);
                    if (navbarEnd > -1) {
                        const insertAt = navbarEnd + 6;
                        content = content.substring(0, insertAt) + '\n' + circuitNav + content.substring(insertAt);
                        changed = true;
                        report += '  -> Added circuit-nav with ' + sections.length + ' items\n';
                    }
                }
            } else {
                report += '  -> No sections found for circuit-nav\n';
            }
        } else {
            report += '  -> Already has circuit-nav\n';
        }

        if (changed) {
            fs.writeFileSync(f, content, 'utf8');
            report += '  -> SAVED\n';
        }

        report += '\n';
    } catch (e) {
        report += f + ': ERROR - ' + e.message + '\n\n';
    }
});

console.log(report);
