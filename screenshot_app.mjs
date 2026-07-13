import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle0', timeout: 30000 });
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'my_app_hero.png' });
  
  await page.evaluate(() => window.scrollBy(0, 500));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'my_app_scroll.png' });
  
  await browser.close();
})();
