const fs = require('fs');
const path = require('path');

console.log('🔧 EE Formula Hub — Build Script\n');

// 1. Clean dist/
if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
    console.log('🗑  Cleaned old dist/');
}
fs.mkdirSync('dist');

// 2. Copy Root files
const rootFiles = fs.readdirSync('.').filter(f => f.endsWith('.html') || f === '_redirects' || f === 'favicon.svg');
rootFiles.forEach(file => {
    fs.copyFileSync(file, path.join('dist', file));
});
console.log(`📄 Copied ${rootFiles.length} root files`);

// 3. Copy directories
const folders = ['shared', 'subjects', 'images'];
folders.forEach(folder => {
    if (fs.existsSync(folder)) {
        fs.cpSync(folder, path.join('dist', folder), { recursive: true });
        console.log(`📁 Copied ${folder}/`);
    }
});

// 4. Summary
const totalFiles = fs.readdirSync('dist', { recursive: true }).length;
console.log(`\n✅ Build complete! ${totalFiles} files in dist/`);
console.log('   Deploy the dist/ directory to Cloudflare Pages.');
