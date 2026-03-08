const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1080, deviceScaleFactor: 2 });

    // Wait a bit for server
    await new Promise(r => setTimeout(r, 2000));

    await page.goto('http://localhost:3000/circuit.html', { waitUntil: 'networkidle0' });

    // Auto-scroll to trigger any lazy loading or IntersectionObservers
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 50);
        });
        window.scrollTo(0, 0); // Scroll back to top
    });

    // Wait for animations to settle
    await new Promise(r => setTimeout(r, 4000));

    // Capture Magnetostriction & Anisotropy (Card 30)
    const card30 = await page.$('#card-magnetic-anisotropy');
    if (card30) await card30.screenshot({ path: 'verify_anisotropy_fixed.png' });

    await browser.close();
    console.log("Screenshots captured");
})();
