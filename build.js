const fs = require('fs');
const path = require('path');

console.log("Building static assets into dist/ directory...");

if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Copy HTML files
const files = fs.readdirSync('.');
files.forEach(file => {
    if (file.endsWith('.html')) {
        fs.copyFileSync(file, path.join('dist', file));
        console.log(`Copied ${file}`);
    }
});

// Copy directories
const folders = ['css', 'js', 'images', 'assets'];
folders.forEach(folder => {
    if (fs.existsSync(folder)) {
        fs.cpSync(folder, path.join('dist', folder), { recursive: true });
        console.log(`Copied ${folder}/`);
    }
});

console.log("Build complete! Deploy 'dist' directory via Cloudflare Pages.");
