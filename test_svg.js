const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('LOG:', msg.text()));

    await page.goto('http://localhost:4000/micro.html');

    // Wait for the SVG to be rendered by D3
    await new Promise(r => setTimeout(r, 2000));

    const result = await page.evaluate(() => {
        const addr = document.getElementById('addr-mode-svg-container');
        const pin = document.getElementById('pin-8085-svg-container');
        const arch = document.getElementById('arch-8085-svg-container'); // This one works
        return {
            addr_html: addr ? addr.innerHTML : 'NULL',
            pin_html: pin ? pin.innerHTML : 'NULL',
            arch_html: arch ? arch.innerHTML : 'NULL'
        };
    });

    console.log('--- ADDR HTML ---');
    console.log(result.addr_html.substring(0, 300) + '...');
    console.log('--- PIN HTML ---');
    console.log(result.pin_html.substring(0, 300) + '...');
    console.log('--- ARCH HTML (WORKING) ---');
    console.log(result.arch_html.substring(0, 300) + '...');

    await browser.close();
})();
