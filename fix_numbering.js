const fs = require('fs');
const path = require('path');

const htmlFile = path.join(__dirname, 'circuit.html');
let content = fs.readFileSync(htmlFile, 'utf8');
const origLen = content.length;

// Step 1: Remove the empty "UNIT 1 COMPLETE — MASTER TOOL LIST" section
// It's wrapped in a card-panel div from line ~4063 to ~4078
const masterToolStart = content.indexOf('UNIT 1 COMPLETE');
if (masterToolStart === -1) {
    console.log('MASTER TOOL LIST not found - may already be removed');
} else {
    // Find the card-panel div that contains it
    const cardPanelStart = content.lastIndexOf('<div class="card-panel', masterToolStart);
    // Find its closing </div> - the card-panel ends with </div> on its own line
    // The structure is: <div class="card-panel">...<div class="row">...</div></div>
    // We need to find the matching closing </div>
    let depth = 0;
    let i = cardPanelStart;
    let endIdx = -1;
    while (i < content.length) {
        if (content.substring(i, i + 4) === '<div') {
            depth++;
        } else if (content.substring(i, i + 6) === '</div>') {
            depth--;
            if (depth === 0) {
                endIdx = i + 6;
                break;
            }
        }
        i++;
    }

    if (endIdx > -1) {
        // Also remove any trailing whitespace/newlines
        while (endIdx < content.length && (content[endIdx] === '\r' || content[endIdx] === '\n')) {
            endIdx++;
        }
        console.log('Removing MASTER TOOL LIST from index', cardPanelStart, 'to', endIdx);
        console.log('Removed content length:', endIdx - cardPanelStart);
        content = content.substring(0, cardPanelStart) + content.substring(endIdx);
    }
}

// Step 2: Fix numbering
// Current numbering after card 43 starts at 55, should start at 44
// So we need to subtract 11 from numbers 55-68
// The pattern is: >NUMBER. (inside subsection__title elements)
// e.g., >55. Energy Sources</h3>

const renumberMap = {};
for (let oldNum = 55; oldNum <= 68; oldNum++) {
    renumberMap[oldNum] = oldNum - 11;  // 55->44, 56->45, ..., 68->57
}

// Also the Two-Port section header says "57. Two Port Networks" - after renumbering
// the ones before it, this will need to be adjusted too since it was already 57
// Let me check: the Two-Port section had number 57, and after renumbering:
// 55->44, 56->45, 57->46 (first 57 at line 4247), 57->46 (second 57, the Two-Port at 4760)
// But wait - 57 appears twice. The Two-Port section is the SECOND 57.
// After the other sections are renumbered (44-46), the Two-Port should be 47.
// Actually, let me just find all the numbers and renumber them sequentially.

// Better approach: find all subsection__title with numbers and renumber everything after 43
const regex = /subsection__title[^>]*>\s*(\d+)\./g;
let match;
let lastNum = 43;
const replacements = [];

while ((match = regex.exec(content)) !== null) {
    const num = parseInt(match[1]);
    if (num > 43) {
        lastNum++;
        if (num !== lastNum) {
            replacements.push({
                index: match.index,
                fullMatch: match[0],
                oldNum: num,
                newNum: lastNum
            });
        } else {
            // Number is already correct
        }
    }
}

console.log('\nRenumbering plan:');
replacements.forEach(r => {
    console.log(`  ${r.oldNum} -> ${r.newNum}`);
});

// Apply replacements in reverse order to preserve indices
replacements.reverse().forEach(r => {
    const oldStr = r.oldNum + '.';
    const newStr = r.newNum + '.';
    const searchStart = r.index;
    const replaceIdx = content.indexOf(oldStr, searchStart);
    if (replaceIdx > -1 && replaceIdx < searchStart + r.fullMatch.length + 10) {
        content = content.substring(0, replaceIdx) + newStr + content.substring(replaceIdx + oldStr.length);
    }
});

console.log('\nOriginal size:', origLen);
console.log('New size:', content.length);
console.log('Removed:', origLen - content.length, 'chars');

fs.writeFileSync(htmlFile, content, 'utf8');
console.log('SUCCESS: Fixed numbering and removed MASTER TOOL LIST');

// Verify
const verifyRegex = /subsection__title[^>]*>\s*(\d+)\./g;
let vm;
const nums = [];
while ((vm = verifyRegex.exec(content)) !== null) {
    nums.push(parseInt(vm[1]));
}
console.log('\nVerification - all section numbers:', nums.join(', '));

// Check for gaps
let hasGap = false;
for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[i - 1] + 1 && nums[i] !== 1) { // Allow reset at section boundaries
        // Check if this is a section boundary (new section starts at 1 or a new range)
        if (nums[i] > nums[i - 1] + 1) {
            console.log('Gap found:', nums[i - 1], '->', nums[i]);
            hasGap = true;
        }
    }
}
if (!hasGap) console.log('No numbering gaps found!');
