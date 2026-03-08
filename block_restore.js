const fs = require('fs');
const { execSync } = require('child_process');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

function getBlock(content, tag) {
    const regex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'i');
    const match = content.match(regex);
    return match ? match[0] : null;
}

for (const file of files) {
    if (file === 'index.html' || file === 'hub.html') {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/\? EE Hub/g, '⚡ EE Hub').replace(/> EE Hub/g, '>⚡ EE Hub');
        fs.writeFileSync(file, content, 'utf8');
        continue;
    }

    try {
        let cleanContent = execSync(`git show origin/main:"${file}"`).toString('utf8');
        let corruptContent = fs.readFileSync(file, 'utf8');

        let finalContent = corruptContent;

        let cleanMain = getBlock(cleanContent, 'main');
        let corruptMain = getBlock(corruptContent, 'main');
        if (cleanMain && corruptMain) {
            finalContent = finalContent.replace(corruptMain, () => cleanMain);
        }

        let cleanHead = getBlock(cleanContent, 'head');
        let corruptHead = getBlock(corruptContent, 'head');
        if (cleanHead && corruptHead) {
            finalContent = finalContent.replace(corruptHead, () => cleanHead);
        }

        let cleanFooter = getBlock(cleanContent, 'footer');
        let corruptFooter = getBlock(corruptContent, 'footer');
        if (cleanFooter && corruptFooter) {
            finalContent = finalContent.replace(corruptFooter, () => cleanFooter);
        }

        finalContent = finalContent.replace(/resistor-icon([^>]*)>[^<]*<\/div>/g, 'resistor-icon$1>▱</div>');
        finalContent = finalContent.replace(/capacitor-icon([^>]*)>[^<]*<\/div>/g, 'capacitor-icon$1>⏸</div>');
        finalContent = finalContent.replace(/inductor-icon([^>]*)>[^<]*<\/div>/g, 'inductor-icon$1>➰</div>');
        finalContent = finalContent.replace(/src-icon([^>]*)>[^<]*<\/div>/g, 'src-icon$1>±</div>');

        finalContent = finalContent.replace(/>\? EE Hub/g, '>⚡ EE Hub');
        finalContent = finalContent.replace(/> EE Hub/g, '>⚡ EE Hub');
        finalContent = finalContent.replace(/>\? Explore Formulas/g, '>⚡ Explore Formulas');
        finalContent = finalContent.replace(/> Explore Formulas/g, '>⚡ Explore Formulas');
        finalContent = finalContent.replace(/>\?P & \?C/g, '>μP & μC');
        finalContent = finalContent.replace(/>P & C/g, '>μP & μC');
        finalContent = finalContent.replace(/Delta \? Star/g, 'Delta ↔ Star');
        finalContent = finalContent.replace(/\? \? Y Form/g, 'Δ ↔ Y Form');
        finalContent = finalContent.replace(/aria-label="Menu">[^<]*<\/button>/g, 'aria-label="Menu">☰</button>');

        fs.writeFileSync(file, finalContent, 'utf8');
        console.log(`Successfully restored blocks in ${file}`);
    } catch (e) {
        console.error(`Error processing ${file}: ${e.message}`);
    }
}
