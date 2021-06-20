const puppeteer = require('puppeteer');

const addr = process.argv[2];

if (!addr) {
  console.log('Must provide address on argument!');
  process.exit(0);
}

const interval = Number(process.argv[3] || 1000);

// const parsePage = (content) => {}

(async () => {
  const browser = await puppeteer.launch();
  
  process.on('exit', async () => {
    console.log('\nClosing.');
    await browser.close();
  });

  const page = await browser.newPage();
  console.log('Watching ' + addr);
  console.log('Press Ctrl+C to stop.');
  await page.goto(addr);
  let c = 1;
  while (true) {
    process.stdout.write(`\rLoaded ${c} times.`);
    await new Promise(resolve => setTimeout(resolve, interval));
    await page.reload({ waitUntil: 'domcontentloaded' });
    // parsePage(await page.content());
    c = c + 1;
  }
})();