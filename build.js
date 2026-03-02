const fs = require('fs');
const path = require('path');

console.log('🔧 EE Formula Hub — Build Script\n');

// 1. Clean dist/
if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
    console.log('🗑  Cleaned old dist/');
}
fs.mkdirSync('dist');

// 2. Copy HTML files
const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
htmlFiles.forEach(file => {
    fs.copyFileSync(file, path.join('dist', file));
});
console.log(`📄 Copied ${htmlFiles.length} HTML files`);

// 3. Copy asset directories
const folders = ['css', 'js', 'images'];
folders.forEach(folder => {
    if (fs.existsSync(folder)) {
        fs.cpSync(folder, path.join('dist', folder), { recursive: true });
        const count = fs.readdirSync(path.join('dist', folder)).length;
        console.log(`📁 Copied ${folder}/ (${count} files)`);
    }
});

// 4. Summary
const totalFiles = fs.readdirSync('dist', { recursive: true }).length;
console.log(`\n✅ Build complete! ${totalFiles} files in dist/`);
console.log('   Deploy the dist/ directory to Cloudflare Pages.');
