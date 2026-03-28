const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const subjectsDir = path.join(rootDir, 'subjects');

const subjectMap = {
  'circuit.html': 'circuit/index.html',
  'machines.html': 'machines/index.html',
  'measurements.html': 'measurements/index.html',
  'power.html': 'power-systems/index.html',
  'powerplant.html': 'power-plant/index.html',
  'control.html': 'control/index.html',
  'electronics.html': 'electronics/index.html',
  'signals.html': 'signals/index.html',
  'micro.html': 'microprocessor/index.html',
  'estimation.html': 'estimation/index.html',
  'utilization.html': 'utilization/index.html',
};

const sharedJsFiles = ['app.js', 'formulas.js', 'calculator.js', 'animations.js', 'hero-bg.js'];
const sharedCssFiles = ['style.css'];

// 1. Update root index.html
function updateRootIndex() {
  const p = path.join(rootDir, 'index.html');
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');

  // css/style.css -> shared/css/style.css
  content = content.replace(/href="css\/style\.css"/g, 'href="shared/css/style.css"');
  
  // js -> shared/js
  for(const js of sharedJsFiles) {
    content = content.replace(new RegExp(`src="js\/${js.replace('.','\\.')}([^"]*)"`, 'g'), `src="shared/js/${js}$1"`);
  }
  
  // nav links
  for(const [oldLink, newLink] of Object.entries(subjectMap)) {
    content = content.replace(new RegExp(`href="${oldLink}"`, 'g'), `href="subjects/${newLink}"`);
  }
  
  fs.writeFileSync(p, content);
  console.log('Updated index.html');
}

// 2. Update subject HTML files
function updateSubjectFiles() {
  const folders = fs.readdirSync(subjectsDir);
  for(const folder of folders) {
    const subjPath = path.join(subjectsDir, folder);
    if(fs.statSync(subjPath).isDirectory()) {
      const files = fs.readdirSync(subjPath).filter(f => f.endsWith('.html'));
      for(const file of files) {
        const p = path.join(subjPath, file);
        let content = fs.readFileSync(p, 'utf8');

        // shared css
        for(const css of sharedCssFiles) {
          content = content.replace(new RegExp(`href="css\/${css.replace('.','\\.')}"`, 'g'), `href="../../shared/css/${css}"`);
        }
        
        // shared js
        for(const js of sharedJsFiles) {
          content = content.replace(new RegExp(`src="js\/${js.replace('.','\\.')}([^"]*)"`, 'g'), `src="../../shared/js/${js}$1"`);
        }

        // image/icon paths
        content = content.replace(/href="favicon\.svg"/g, 'href="../../favicon.svg"');
        content = content.replace(/src="images\/inductor\.png"/g, 'src="../../images/inductor.png"');

        // index.html link
        content = content.replace(/href="index\.html"/g, 'href="../../index.html"');

        // nav links
        for(const [oldLink, newLink] of Object.entries(subjectMap)) {
          // They are siblings in subjects folder
          const split = newLink.split('/'); // 'circuit', 'index.html'
          content = content.replace(new RegExp(`href="${oldLink}"`, 'g'), `href="../${split[0]}/index.html"`);
        }

        fs.writeFileSync(p, content);
        console.log(`Updated ${folder}/${file}`);
      }
    }
  }
}

updateRootIndex();
updateSubjectFiles();
console.log('Done!');
