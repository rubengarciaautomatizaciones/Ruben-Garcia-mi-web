import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 30000 });
  
  // Wait a couple of seconds for WebGL to render
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'hero.png' });
  
  // Scroll down by 500px to see the overlap effect
  await page.evaluate(() => window.scrollBy(0, 500));
  await new Promise(r => setTimeout(r, 1000));
  
  await page.screenshot({ path: 'scroll.png' });
  
  await browser.close();
})();
