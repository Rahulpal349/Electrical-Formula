const fs = require('fs');
const { execSync } = require('child_process');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

execSync('git checkout HEAD .', { stdio: 'ignore' });

for (const file of files) {
    if (file === 'index.html' || file === 'hub.html') continue;

    let diffCmd = `git --no-pager diff -U0 --color=never origin/main..HEAD -- "${file}"`;
    let diffOut = '';
    try {
        diffOut = execSync(diffCmd, { env: { ...process.env, LESSCHARSET: 'utf-8', LANG: 'en_US.UTF-8' } }).toString('utf8');
    } catch (e) { continue; }

    let diffLines = diffOut.split('\n');
    let replacements = new Map();

    for (let i = 0; i < diffLines.length; i++) {
        let line = diffLines[i];
        if (line.startsWith('-') && !line.startsWith('---')) {
            let minusBlock = [];
            let j = i;
            while (j < diffLines.length && diffLines[j].startsWith('-') && !diffLines[j].startsWith('---')) {
                minusBlock.push(diffLines[j].substring(1));
                j++;
            }
            let plusBlock = [];
            let k = j;
            while (k < diffLines.length && diffLines[k].startsWith('+') && !diffLines[k].startsWith('+++')) {
                plusBlock.push(diffLines[k].substring(1));
                k++;
            }

            if (minusBlock.length === plusBlock.length) {
                for (let x = 0; x < minusBlock.length; x++) {
                    let minusStr = minusBlock[x];
                    let plusStr = plusBlock[x];

                    let minusTags = minusStr.match(/<[^>]+>/g) || [];
                    let plusTags = plusStr.match(/<[^>]+>/g) || [];

                    if (JSON.stringify(minusTags) === JSON.stringify(plusTags)) {
                        if (minusStr.trim() !== plusStr.trim()) {
                            replacements.set(plusStr.trim(), minusStr.trim());
                        }
                    }
                }
            }
            i = k - 1;
        }
    }

    let content = fs.readFileSync(file, 'utf8');
    let lines = content.split(/\r?\n/);
    let patchedLines = [];

    let replacedCount = 0;
    for (let line of lines) {
        let trimmed = line.trim();
        if (trimmed !== '' && replacements.has(trimmed)) {
            let newStr = line.replace(trimmed, replacements.get(trimmed));
            patchedLines.push(newStr);
            replacedCount++;
        } else {
            patchedLines.push(line);
        }
    }

    let finalContent = patchedLines.join('\n');

    // Explicit static string additions that git diff won't catch securely
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
    finalContent = finalContent.replace(/\?  Y Form/g, 'Δ ↔ Y Form');
    finalContent = finalContent.replace(/aria-label="Menu">[^<]*<\/button>/g, 'aria-label="Menu">☰</button>');

    fs.writeFileSync(file, finalContent, 'utf8');
    console.log(`Patched ${file} with ${replacedCount} structural diff lines.`);
}
