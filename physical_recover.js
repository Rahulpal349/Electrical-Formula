const fs = require('fs');
const { execSync } = require('child_process');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

// 1. Checkout origin/main to get truly pristine raw UTF-8 files from disk
console.log("Checking out origin/main...");
execSync('git checkout origin/main .', { stdio: 'ignore' });

let cleanData = new Map();
// 2. Read their contents
for (const file of files) {
    cleanData.set(file, fs.readFileSync(file, 'utf8'));
}

// 3. Checkout HEAD to get back our new features
console.log("Checking out HEAD...");
execSync('git checkout HEAD .', { stdio: 'ignore' });

// 4. Do the block replacement
for (const file of files) {
    if (file === 'index.html' || file === 'hub.html') {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/\? EE Hub/g, '⚡ EE Hub').replace(/> EE Hub/g, '>⚡ EE Hub');
        content = content.replace(/>\?P & \?C/g, '>μP & μC').replace(/>P & C/g, '>μP & μC');
        content = content.replace(/aria-label="Menu">[^<]*<\/button>/g, 'aria-label="Menu">☰</button>');
        fs.writeFileSync(file, content, 'utf8');
        continue;
    }

    try {
        let cleanContent = cleanData.get(file);
        if (!cleanContent) continue;

        let corruptContent = fs.readFileSync(file, 'utf8');
        let finalContent = corruptContent;

        let marker = '<section id="fundamental-concepts">';
        let endMarker = '<footer';

        let cleanStart = cleanContent.indexOf(marker);
        let cleanEnd = cleanContent.indexOf(endMarker);

        let corruptStart = corruptContent.indexOf(marker);
        let corruptEnd = corruptContent.indexOf(endMarker);

        if (cleanStart !== -1 && cleanEnd !== -1 && corruptStart !== -1 && corruptEnd !== -1) {
            let cleanChunk = cleanContent.substring(cleanStart, cleanEnd);
            let corruptChunk = corruptContent.substring(corruptStart, corruptEnd);
            finalContent = finalContent.replace(corruptChunk, () => cleanChunk);
            console.log(`Successfully replaced fundamental-concepts block in ${file}`);
        } else {
            console.log(`Could not find markers in ${file}. Trying fallback.`);
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
    } catch (e) {
        console.error(`Error processing ${file}: ${e.message}`);
    }
}
