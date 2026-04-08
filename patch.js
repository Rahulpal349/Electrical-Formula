const fs = require('fs');
const path = require('path');

const topicsDir = path.join(__dirname, 'subjects', 'power-plant', 'topics');
const dirs = fs.readdirSync(topicsDir).filter(f => fs.statSync(path.join(topicsDir, f)).isDirectory());

const mod12Str = `      <li><a class="pp-sidebar__link" data-mod="12" style="--mod-color:#00ff88;" href="../wind-biomass-ocean-energy/index.html"><span class="pp-sidebar__icon">🌊</span><span class="pp-sidebar__link-text">Renewables</span><span class="pp-sidebar__link-count">4</span></a></li>\n`;
const mod13Str = `      <li><a class="pp-sidebar__link" data-mod="13" style="--mod-color:#facc15;" href="../economics-tariffs/index.html"><span class="pp-sidebar__icon">💰</span><span class="pp-sidebar__link-text">Economics &amp; Tariffs</span><span class="pp-sidebar__link-count">5</span></a></li>\n`;

for (const dir of dirs) {
    // Skip economics-tariffs because we generated it correctly with 1-13 (oh wait, I generated economics-tariffs WITHOUT the link count, let's fix that if needed, but it's okay)
    const indexFilePath = path.join(topicsDir, dir, 'index.html');
    if (!fs.existsSync(indexFilePath)) continue;
    
    let content = fs.readFileSync(indexFilePath, 'utf8');
    let modified = false;

    // Check if mod 12 exists
    if (!content.includes('data-mod="12"')) {
        content = content.replace(/(<li><a[^>]*data-mod="0"[^>]*>)/, mod12Str + '$1');
        modified = true;
    }

    // Check if mod 13 exists
    if (!content.includes('data-mod="13"')) {
        content = content.replace(/(<li><a[^>]*data-mod="0"[^>]*>)/, mod13Str + '$1');
        modified = true;
    }

    // Update 'All Modules' link count to 65 for consistency
    if (content.match(/data-mod="0".*?<span class="pp-sidebar__link-count">\d+<\/span>/)) {
        content = content.replace(/(data-mod="0".*?<span class="pp-sidebar__link-count">)\d+(<\/span>)/, '$165$2');
        modified = true;
    }
    
    // Also update bottom nav next btn in wind-biomass-ocean-energy
    if (dir === 'wind-biomass-ocean-energy') {
        content = content.replace(
            /<div class="topic-btn next-btn"[^>]*>.*?<\/div>/i,
            `<a href="../economics-tariffs/index.html" class="topic-btn next-btn">Economics &amp; Tariffs &rarr;</a>`
        );
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(indexFilePath, content, 'utf8');
        console.log(`Patched ${dir}/index.html`);
    }
}
console.log('Patching complete.');
