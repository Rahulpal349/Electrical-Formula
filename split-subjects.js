const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const subjects = ['circuit', 'machines', 'measurements', 'power-systems'];

subjects.forEach(subject => {
    console.log(`\n============================`);
    console.log(`Processing Subject: ${subject}`);
    console.log(`============================`);

    const sourceFile = path.join(__dirname, `subjects/${subject}/index.html`);
    if (!fs.existsSync(sourceFile)) {
        console.error(`Missing file for ${subject}`);
        return;
    }

    const htmlContent = fs.readFileSync(sourceFile, 'utf8');
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // 1. Extract Topics from Nav
    // Try both known nav classes:
    const navLinks = Array.from(document.querySelectorAll('.glass-sidebar__nav a, .circuit-nav a'));
    if (navLinks.length === 0) {
        console.error(`No navigation links found for ${subject}. Skipping.`);
        return;
    }

    const topics = [];
    navLinks.forEach((link, idx) => {
        let href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        
        const sectionId = href.substring(1);
        
        let title = link.textContent.trim().replace(/^[\n\r]+|[\n\r]+$/g, '').trim();
        // clean up multi-line weirdness
        title = title.replace(/\s+/g, ' ');
        // For machines specifically, they have numbers like "1. Intro to Machines"
        title = title.replace(/^[0-9]+[\.\-\s]*/, '').trim();

        const folderName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        topics.push({
            id: sectionId,
            title: title,
            folder: folderName,
            index: idx
        });
    });

    console.log(`Found ${topics.length} topics for ${subject}:`);
    topics.forEach(t => console.log(` - ${t.title} (${t.id} -> ${t.folder})`));

    // 2. Extract Inline Assets
    let combinedCss = '';
    const inlineStyles = document.querySelectorAll('style:not([src])');
    inlineStyles.forEach(style => {
        combinedCss += style.innerHTML + '\n\n';
        style.remove();
    });

    let combinedJs = '';
    const inlineScripts = document.querySelectorAll('script:not([src])');
    inlineScripts.forEach(script => {
        // Exclude katex renderer scripts or JSON LD if any
        if (script.innerHTML.includes('renderMathInElement')) {
            return;
        }
        combinedJs += script.innerHTML + '\n\n';
        script.remove();
    });

    // Write CSS
    const cssPath = path.join(__dirname, `subjects/${subject}/css/${subject}-inline.css`);
    if (combinedCss.trim()) {
        fs.writeFileSync(cssPath, combinedCss);
        console.log(`Created ${cssPath}`);
        // Inject link to HEAD
        const newStyle = document.createElement('link');
        newStyle.rel = 'stylesheet';
        newStyle.href = `css/${subject}-inline.css`;
        document.head.appendChild(newStyle);
    }

    // Write JS
    const jsPath = path.join(__dirname, `subjects/${subject}/js/${subject}-inline.js`);
    if (combinedJs.trim()) {
        fs.writeFileSync(jsPath, combinedJs);
        console.log(`Created ${jsPath}`);
        // Inject script to HEAD
        const newScript = document.createElement('script');
        newScript.src = `js/${subject}-inline.js`;
        newScript.defer = true;
        document.head.appendChild(newScript);
    }

    // Capture the base layout by blanking out the main container
    const mainMain = document.querySelector('main');
    if (!mainMain) {
        console.error(`Could not find <main> in ${subject}`);
        return;
    }

    // Prepare template HTML (from dom)
    const baseNavHtml = document.querySelector('nav') ? document.querySelector('nav').outerHTML : '';
    const baseFooterHtml = document.querySelector('footer') ? document.querySelector('footer').outerHTML : '';
    const baseHeadHtml = document.head.innerHTML;
    // get body attributes (like dark-theme, etc)
    const bodyClass = document.body.className;
    const bodyAttributes = Array.from(document.body.attributes).map(a => `${a.name}="${a.value}"`).join(' ');

    const topicDir = path.join(__dirname, `subjects/${subject}/topics`);
    if (!fs.existsSync(topicDir)) fs.mkdirSync(topicDir, { recursive: true });

    // Ensure shared CSS and JS exist
    const sharedCssPath = path.join(__dirname, 'shared', 'css');
    const sharedJsPath = path.join(__dirname, 'shared', 'js');
    if (!fs.existsSync(path.join(sharedCssPath, 'topic-page.css'))) {
        fs.mkdirSync(sharedCssPath, { recursive: true });
        fs.writeFileSync(path.join(sharedCssPath, 'topic-page.css'), `/* Shared visual polish across standalone topic pages */\n.breadcrumb { display: flex; align-items: center; justify-content: center; width: 100%; max-width: 1200px; padding: 10px 20px; color: var(--text-muted, #94a3b8); margin: 0 auto 20px auto; overflow: hidden; }\n.breadcrumb a { color: var(--neon-cyan, #00f5ff); text-decoration: none; font-weight: 500; transition: color 0.3s; }\n.topic-nav-footer { display: flex; justify-content: space-between; max-width: 1200px; margin: 40px auto; padding: 0 20px; }\n.btn-nav { padding: 12px 24px; font-weight: bold; border-radius: 8px; text-decoration: none; border: 1px solid var(--neon-cyan, #00f5ff); color: #fff; background: rgba(0, 245, 255, 0.1); transition: all 0.3s ease; }\n.btn-nav:hover { background: rgba(0, 245, 255, 0.3); }\n.btn-disabled { visibility: hidden; pointer-events: none; }`);
    }

    // 3. Generate Topic Pages
    topics.forEach((topic, i) => {
        console.log(`Generating Topic: ${topic.folder}`);
        const currentDir = path.join(topicDir, topic.folder);
        if (!fs.existsSync(currentDir)) fs.mkdirSync(currentDir, { recursive: true });

        // Retrieve the <section> from original DOM
        const sectionEl = document.getElementById(topic.id);
        if (!sectionEl) {
            console.error(`   - Missing section #${topic.id} for ${topic.folder}`);
            return;
        }

        let sectionHtml = sectionEl.outerHTML;
        
        const prevTopic = i > 0 ? topics[i-1] : null;
        const nextTopic = i < topics.length - 1 ? topics[i+1] : null;


        // We must fix relative paths
        // href="../../..." becomes href="../../../../..."
        const fixPaths = (str) => {
            let res = str.replace(/(href|src)="(\.\.\/\.\.\/)/g, '$1="../../../../');
            res = res.replace(/(href|src)="(\.\.\/)/g, '$1="../../../');
            res = res.replace(/(href|src)="((?!http|mailto|data|\/|#|\.\.)[^"]+)"/g, (match, attr, pathStr) => {
                return `${attr}="../../${pathStr}"`;
            });
            return res;
        };

        const fixedHead = fixPaths(baseHeadHtml);
        const fixedNav = fixPaths(baseNavHtml);
        const fixedSection = fixPaths(sectionHtml);
        const fixedFooter = fixPaths(baseFooterHtml);

        let templateHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    ${fixedHead}
    <link rel="stylesheet" href="../../../../shared/css/topic-page.css">
    <title>${topic.title} | ${subject.toUpperCase()} | EE Hub</title>
</head>
<body ${bodyAttributes}>
    ${fixedNav}
    
    <!-- Topic Nav Script (Shared) -->
    <script src="../../../../shared/js/topic-nav.js"></script>

    <div class="breadcrumb" style="margin-top: 80px;">
        <span class="home-icon">🏠</span> 
        <span class="delimiter">/</span> 
        <a href="../../index.html" style="text-transform: capitalize;">${subject.replace('-', ' ')}</a> 
        <span class="delimiter">/</span> 
        <span class="current-topic">${topic.title}</span>
    </div>

    <main class="topic-main-container">
        ${fixedSection}
    </main>

    <div class="topic-nav-footer">
        ${prevTopic ? `<a href="../${prevTopic.folder}/index.html" class="btn-nav btn-prev">← Previous: ${prevTopic.title}</a>` : `<div class="btn-disabled"></div>`}
        ${nextTopic ? `<a href="../${nextTopic.folder}/index.html" class="btn-nav btn-next">Next: ${nextTopic.title} →</a>` : `<div class="btn-disabled"></div>`}
    </div>

    ${fixedFooter}
</body>
</html>`;


        // The DOM serialization can sometimes re-add Katex if it already rendered.
        // It's usually fine since the script handles it, but let's make sure it's valid.

        fs.writeFileSync(path.join(currentDir, 'index.html'), templateHtml);
    });

    // 4. Generate Root Grid Landing Page
    console.log(`Generating Hub Landing Page for ${subject}...`);
    // Create grid layout
    let gridHtml = `
    <!-- Generated Landing Page Grid -->
    <section class="landing-grid-container" style="max-width: 1200px; margin: 100px auto 40px auto; padding: 20px;">
        <h2 style="text-align: center; font-size: 2.5em; margin-bottom: 40px; text-transform: uppercase;">Discover <span style="color: var(--neon-cyan)">${subject.replace('-', ' ')}</span></h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
    `;

    // Try to guess an icon for each topic based on name
    function getIconFor(title) {
        if (/intro|fundament|basic/i.test(title)) return '🚀';
        if (/dc|direct/i.test(title)) return '🔋';
        if (/ac|alternat/i.test(title)) return '〰️';
        if (/motor|mach/i.test(title)) return '⚙️';
        if (/transfor/i.test(title)) return '🔌';
        if (/measure|instru/i.test(title)) return '📏';
        if (/power|syste/i.test(title)) return '⚡';
        return '📑';
    }

    topics.forEach((t, i) => {
        gridHtml += `
            <a href="topics/${t.folder}/index.html" class="topic-grid-card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-decoration: none; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(0, 245, 255, 0.2); padding: 30px 20px; border-radius: 12px; transition: all 0.3s ease; text-align: center;">
                <div style="font-size: 3em; margin-bottom: 15px;">${getIconFor(t.title)}</div>
                <h3 style="color: #fff; font-size: 1.2em; margin-bottom: 10px;">Module ${i+1}</h3>
                <h4 style="color: var(--neon-cyan, #00f5ff); font-size: 1.1em; font-weight: normal;">${t.title}</h4>
            </a>
        `;
    });

    gridHtml += `
        </div>
    </section>
    
    <style>
        .topic-grid-card:hover {
            transform: translateY(-5px);
            border-color: var(--neon-cyan, #00f5ff);
            box-shadow: 0 4px 20px rgba(0, 245, 255, 0.3);
        }
    </style>
    `;

    mainMain.innerHTML = gridHtml;

    // We can also remove the floating sidebars since we don't need them on the parent grid
    const aside = document.querySelector('aside.glass-sidebar');
    if (aside) aside.remove();
    const subnav = document.querySelector('nav.circuit-nav'); // specific to machines
    if (subnav) subnav.remove();

    // Now write index.html back
    fs.writeFileSync(sourceFile, dom.serialize());
    console.log(`Re-wrote main ${subject} index.html`);
});

console.log("\nAll Done!");
