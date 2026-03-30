const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// We are running this from /tmp so we need absolute path to project
const PROJ_DIR = 'C:/Users/rahul/Documents/Electrical Formula';
const SUBJECT_DIR = path.join(PROJ_DIR, 'subjects', 'power-plant');
const INDEX_HTML_PATH = path.join(SUBJECT_DIR, 'index.html');

console.log('Reading index.html...');
const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

// 1. Extract inline CSS
console.log('Extracting inline CSS...');
const styles = Array.from(document.querySelectorAll('head style'));
let cssContent = '';
styles.forEach(style => {
    cssContent += style.textContent + '\n';
    style.remove(); // Remove from DOM
});

const cssDir = path.join(SUBJECT_DIR, 'css');
if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
}
fs.writeFileSync(path.join(cssDir, 'powerplant-inline.css'), cssContent.trim());
console.log('Created css/powerplant-inline.css');

const inlineLink = document.createElement('link');
inlineLink.rel = 'stylesheet';
inlineLink.href = 'css/powerplant-inline.css';
document.querySelector('head').appendChild(inlineLink);

const topicPageCssLink = document.createElement('link');
topicPageCssLink.rel = 'stylesheet';
topicPageCssLink.href = '../../shared/css/topic-page.css';
document.querySelector('head').appendChild(topicPageCssLink);

// 1.5 Extract inline JavaScript
console.log('Extracting inline JavaScript...');
const scripts = Array.from(document.querySelectorAll('body script:not([src])'));
let jsContent = '';
scripts.forEach(script => {
    jsContent += script.textContent + '\n';
    script.remove(); // Remove huge embedded script blocks
});

const jsDir = path.join(SUBJECT_DIR, 'js');
if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir, { recursive: true });
}
fs.writeFileSync(path.join(jsDir, 'powerplant-inline.js'), jsContent.trim());
console.log('Created js/powerplant-inline.js');

const inlineJsScript = document.createElement('script');
inlineJsScript.src = 'js/powerplant-inline.js';
document.body.appendChild(inlineJsScript);

// 2. Define topics and mapping
const topics = [
    { folder: 'power-systems-overview', name: 'Power Systems', ids: ['c1','c2','c3','c4','c5'], icon: '⚡' },
    { folder: 'hydro-power', name: 'Hydro Power', ids: ['c6','c7','c8','c9','c10','c11','c12','c13'], icon: '💧' },
    { folder: 'thermal-steam', name: 'Thermal Steam', ids: ['c14','c15','c16','c17','c18','c19','c20','c21'], icon: '🔥' },
    { folder: 'coal-fuels', name: 'Coal & Fuels', ids: ['c22','c23'], icon: '⛏️' },
    { folder: 'nuclear-power', name: 'Nuclear Power', ids: ['c24','c25','c26','c27','c28','c29','c30','c31','c32','c33'], icon: '☢️' },
    { folder: 'diesel-power', name: 'Diesel Power', ids: ['c34'], icon: '🛢️' },
    { folder: 'gas-turbine', name: 'Gas Turbine', ids: ['c35','c36'], icon: '🌀' },
    { folder: 'solar-energy', name: 'Solar Energy', ids: ['c37','c38','c39','c40','c41','c42','c43','c44','c45'], icon: '☀️' },
    { folder: 'solar-collectors', name: 'Solar Collectors', ids: ['c46','c47','c48','c49','c50'], icon: '🌡️' },
    { folder: 'geothermal-mhd', name: 'Geothermal & MHD', ids: ['c51','c52','c53','c54','c55','c56','c57','c58','c59','c60','c61'], icon: '🌋' }
];

// Combine all valid IDs to know what to extract
const allValidIds = new Set(topics.flatMap(t => t.ids));

// 3. Extract content of each topic
const extractedTopics = {};
const main = document.querySelector('.pp-main');

let currentTopicIdx = -1;
let currentHtml = '';
let currentIsCardGrid = false;

// Convert children to array to safely iterate and stringify
Array.from(main.children).forEach(child => {
    const id = child.id;
    // Check if it's one of the targeted cards
    if (id && allValidIds.has(id)) {
        // Find the index of the topic it belongs to
        currentTopicIdx = topics.findIndex(t => t.ids.includes(id));
        currentIsCardGrid = true;
    } else if (child.classList.contains('pp-module-divider-tag') || child.classList.contains('pp-module-divider') ) {
        // Ignore dividers, they are not needed on individual topic pages, but let's push them if current topic is known
        currentIsCardGrid = true;
    }

    if (currentTopicIdx !== -1) {
        if (!extractedTopics[currentTopicIdx]) extractedTopics[currentTopicIdx] = '';
        extractedTopics[currentTopicIdx] += child.outerHTML + '\n';
    }
});

main.innerHTML = ''; // Clear main content on template

// Add empty script tag for topic nav
const topicNavScript = document.createElement('script');
topicNavScript.src = '../../shared/js/topic-nav.js';
document.body.appendChild(topicNavScript);

// Remove the old powerplant.js from the topic template since its logic might cause errors without the cards
const pptScript = document.querySelector('script[src="js/powerplant.js"]');
if (pptScript) { 
    pptScript.id = 'powerplant-js-script'; // Just a marker
}

const templateHtml = dom.serialize();

// 4. Create topic pages
fs.mkdirSync(path.join(SUBJECT_DIR, 'topics'), { recursive: true });

topics.forEach((topic, idx) => {
    console.log(`Creating topic: ${topic.folder}...`);
    const topicPath = path.join(SUBJECT_DIR, 'topics', topic.folder);
    fs.mkdirSync(topicPath, { recursive: true });

    let nestedHtml = templateHtml;
    // Fix relative paths manually via JS strings
    // 1. Root level paths (e.g. href="../../index.html") -> href="../../../../index.html"
    nestedHtml = nestedHtml.replace(/(href|src)="(\.\.\/\.\.\/)/g, '$1="../../../../');
    nestedHtml = nestedHtml.replace(/(href|src)="(\.\.\/)/g, '$1="../../../');
    // 2. File-level paths (e.g css/... js/...) -> ../../css/
    nestedHtml = nestedHtml.replace(/(href|src)="((?!http|mailto|data|\/|#|\.\.)[^"]+)"/g, (match, attr, pathStr) => {
        return `${attr}="../../${pathStr}"`;
    });

    const topicDom = new JSDOM(nestedHtml);
    const doc = topicDom.window.document;
    doc.title = `${topic.name} — Power Plant Engineering`;

    const topicMain = doc.querySelector('.pp-main');
    
    // Add breadcrumb
    const breadcrumb = doc.createElement('div');
    breadcrumb.className = 'topic-breadcrumb';
    breadcrumb.innerHTML = `
        <a href="../../../../index.html">EE Hub</a> &rsaquo; 
        <a href="../../index.html">Power Plant</a> &rsaquo; 
        <span>${topic.name}</span>
    `;
    topicMain.appendChild(breadcrumb);
    
    // Add content wrapper
    const contentWrap = doc.createElement('div');
    contentWrap.className = 'topic-content';
    contentWrap.innerHTML = extractedTopics[idx] || '';
    topicMain.appendChild(contentWrap);

    // Prev/Next Nav
    const nav = doc.createElement('div');
    nav.className = 'topic-bottom-nav';
    nav.innerHTML = `
        ${idx > 0 ? `<a href="../${topics[idx-1].folder}/index.html" class="topic-btn prev-btn">&larr; ${topics[idx-1].name}</a>` : '<div></div>'}
        <a href="../../index.html" class="topic-btn back-btn">All Topics</a>
        ${idx < topics.length - 1 ? `<a href="../${topics[idx+1].folder}/index.html" class="topic-btn next-btn">${topics[idx+1].name} &rarr;</a>` : '<div></div>'}
    `;
    topicMain.appendChild(nav);

    // Sidebar: update the links to be relative to the topic directory
    const sidebarLinks = doc.querySelectorAll('.pp-sidebar__link');
    sidebarLinks.forEach(link => {
        const modAttr = link.getAttribute('data-mod');
        if (modAttr !== null) {
            let n = parseInt(modAttr, 10);
            if (n === 0) {
               link.href = '../../index.html';
            } else {
               if (topics[n-1]) {
                   link.href = `../${topics[n-1].folder}/index.html`;
               }
            }
        }
    });

    // Write file
    fs.writeFileSync(path.join(topicPath, 'index.html'), topicDom.serialize());
});

// 5. Build the Landing Page
const lDom = new JSDOM(templateHtml);
const lDoc = lDom.window.document;

// Remove the injected topic-nav script from the main landing page
const navScripts = lDoc.querySelectorAll('script[src="../../shared/js/topic-nav.js"]');
navScripts.forEach(s => s.remove());

const lMain = lDoc.querySelector('.pp-main');

// Create topic cards grid
let gridHtml = `
  <div class="pp-landing-grid">
`;
topics.forEach((t, i) => {
    gridHtml += `
      <a href="topics/${t.folder}/index.html" class="pp-topic-card" data-aos="fade-up" data-aos-delay="${i*50}">
        <div class="pp-topic-icon">${t.icon}</div>
        <div class="pp-topic-info">
          <h3>Module ${i+1}: ${t.name}</h3>
          <p>${t.ids.length} interactive chapters</p>
        </div>
      </a>
    `;
});
gridHtml += `</div>`;

lMain.innerHTML = gridHtml;

// Make sidebar links on landing page point to topic folders
const lSidebar = lDoc.querySelectorAll('.pp-sidebar__link');
lSidebar.forEach(link => {
    const modAttr = link.getAttribute('data-mod');
    if (modAttr !== null) {
        let n = parseInt(modAttr, 10);
        if (n !== 0 && topics[n-1]) {
            link.href = `topics/${topics[n-1].folder}/index.html`;
            link.removeAttribute('data-mod'); // No longer dynamic JS toggle
        }
    }
});

fs.writeFileSync(INDEX_HTML_PATH, lDom.serialize());
console.log('Landing page generated.');
