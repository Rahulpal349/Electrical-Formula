const fs = require('fs');
let text = fs.readFileSync('js/signals.js', 'utf8');
// Fix escaped backticks
text = text.replace(/\\`/g, '`');
// Fix escaped ${
text = text.replace(/\\\$\{/g, '${');
fs.writeFileSync('js/signals.js', text);
console.log('Fixed signals.js');
