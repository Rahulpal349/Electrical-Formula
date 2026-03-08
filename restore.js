const fs = require('fs');
const { execSync } = require('child_process');

function stripNonAscii(str) {
    return str.replace(/[^\x00-\x7F]/g, '');
}

const files = fs.readdirSync('.').filter(f => f.endsWith('.html') || f.endsWith('.css') || f.endsWith('.js'));

for (const file of files) {
    if (file === 'favicon.svg') continue;
    try {
        let cleanContent = '';
        try {
            // we will pull from origin/main to be absolutely sure we have pristine unicodes
            cleanContent = execSync(`git show origin/main:"${file}"`).toString('utf8');
        } catch (e) {
            continue; // new file
        }

        let corruptContent = fs.readFileSync(file, 'utf8');
        let cleanLines = cleanContent.split(/\r?\n/);
        let curLines = corruptContent.split(/\r?\n/);

        let fixedLines = [];
        let replacementsMade = 0;

        for (let i = 0; i < curLines.length; i++) {
            let line = curLines[i];
            let asciiLine = stripNonAscii(line);

            if (line !== asciiLine || line.includes('?') || line.includes('\uFFFD')) {
                let match = cleanLines.find(cl => stripNonAscii(cl) === asciiLine && cl !== stripNonAscii(cl));
                if (match) {
                    fixedLines.push(match);
                    replacementsMade++;
                    continue;
                }
            }
            fixedLines.push(line);
        }

        let finalContent = fixedLines.join('\n');
        // Custom string replacements for the unmatchable new features in working directory
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
        console.log(`Successfully patched: ${file} (Restored ${replacementsMade} lines from git)`);
    } catch (e) {
        console.error(`Error processing ${file}: ${e.message}`);
    }
}
