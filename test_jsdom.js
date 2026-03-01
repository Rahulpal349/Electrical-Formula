const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');

let html = fs.readFileSync('c:\\\\Users\\\\rahul\\\\Documents\\\\Electrical Formula\\\\micro.html', 'utf8');

html = html.replace(/<script[^>]*chart\.umd\.min\.js[^>]*><\/script>/gi, '');
html = html.replace(/<script[^>]*aos\.js[^>]*><\/script>/gi, '');
html = html.replace(/<script[^>]*gsap[^>]*><\/script>/gi, '');
html = html.replace(/<canvas[^>]*>.*?<\/canvas>/gi, '');

const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });

dom.window.addEventListener('error', e => console.log('RUNTIME ERR:', e.message, e.filename, e.lineno));

setTimeout(() => {
    try {
        const pinContainer = dom.window.document.getElementById('pin-8085-svg-container');
        console.log("--- PIN SVG HTML ---");
        console.log(pinContainer ? pinContainer.innerHTML.substring(0, 500) : "Not found");
        console.log("Child count:", pinContainer ? pinContainer.children.length : 0);

        const addrContainer = dom.window.document.getElementById('addr-mode-svg-container');
        console.log("--- ADDR HTML ---");
        console.log(addrContainer ? addrContainer.innerHTML.substring(0, 500) : "Not found");
        console.log("Child count:", addrContainer ? addrContainer.children.length : 0);

        const archContainer = dom.window.document.getElementById('arch-8085-svg-container');
        console.log("--- ARCH HTML ---");
        console.log(archContainer ? archContainer.innerHTML.substring(0, 500) : "Not found");
        console.log("Child count:", archContainer ? archContainer.children.length : 0);
    } catch (e) {
        console.error("error:", e);
    }
}, 3000);
