const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const projectRoot = path.resolve(__dirname, '..');
const moduleRoot = process.env.WORKSPACE_NODE_MODULES || 'C:\\Users\\home\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules';
const { chromium } = require(path.join(moduleRoot, 'playwright'));
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const reviewRoot = path.join(projectRoot, 'artifacts', 'site-review');
fs.mkdirSync(reviewRoot, { recursive: true });

const pages = [
  'index.html',
  'docs/manual/index.html',
  'experiments/index.html',
  'experiments/experiment-01-faithful-talk-companion/index.html',
  'experiments/experiment-02-researched-field-guide/index.html',
  'experiments/experiment-03-concept-map/index.html',
  'experiments/experiment-04-tabletop-workshop/index.html',
  'experiments/experiment-05-saturation-runbook/index.html',
  'experiments/experiment-06-teaching-kit/index.html',
  'experiments/experiment-06-teaching-kit/answer-key.html',
  'experiments/experiment-07-executive-brief/index.html',
  'experiments/experiment-08-claim-audit/index.html',
  'experiments/experiment-09-publishing-kit/index.html',
  'experiments/experiment-10-transcript-navigator/index.html',
  'dist/transcript-organizer-windows-version-001/docs/manual/index.html'
];

function lightness(rgb) {
  const values = (rgb.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
  if (values.length !== 3) return 0;
  return (values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722) / 255;
}

(async () => {
  const browser = await chromium.launch({ executablePath: edgePath, headless: true, args: ['--allow-file-access-from-files'] });
  const results = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'light' });
    const page = await context.newPage();

    for (const relative of pages) {
      const errors = [];
      const onPageError = error => errors.push(error.message);
      page.on('pageerror', onPageError);
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(pathToFileURL(path.join(projectRoot, ...relative.split('/'))).href, { waitUntil: 'load' });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(120);
      const desktop = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        const background = getComputedStyle(document.body).backgroundColor;
        const pillSelectors = [...document.querySelectorAll('.tag,.time,.recovery')];
        return {
          headingCount: document.querySelectorAll('h1').length,
          h1Pixels: h1 ? Number.parseFloat(getComputedStyle(h1).fontSize) : 0,
          background,
          overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
          brokenImages: [...document.images].filter(image => !image.complete || image.naturalWidth === 0).map(image => image.getAttribute('src')),
          sharedStylesheet: [...document.styleSheets].some(sheet => (sheet.href || '').includes('documentation.css')),
          pillRadii: pillSelectors.map(element => getComputedStyle(element).borderRadius)
        };
      });
      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(50);
      await page.screenshot({ path: path.join(reviewRoot, relative.replace(/[\\/]/g, '--') + '.png'), fullPage: false });

      await page.setViewportSize({ width: 390, height: 844 });
      await page.reload({ waitUntil: 'load' });
      const mobileState = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        offenders: [...document.querySelectorAll('body *')]
          .filter(element => element.getBoundingClientRect().right > window.innerWidth + 1)
          .slice(0, 8)
          .map(element => ({ tag: element.tagName, className: element.className || '', right: Math.round(element.getBoundingClientRect().right), scrollWidth: element.scrollWidth }))
      }));
      page.off('pageerror', onPageError);

      results.push({
        page: relative,
        ...desktop,
        lightness: Number(lightness(desktop.background).toFixed(3)),
        mobileOverflow: mobileState.overflow,
        mobileOverflowElements: mobileState.offenders,
        pageErrors: errors
      });
    }
  } finally {
    await browser.close();
  }

  fs.writeFileSync(path.join(reviewRoot, 'review.json'), JSON.stringify(results, null, 2) + '\n', 'utf8');
  const failures = results.filter(result =>
    result.headingCount !== 1 ||
    result.h1Pixels > 48 ||
    result.lightness < 0.85 ||
    result.overflow ||
    result.mobileOverflow ||
    result.brokenImages.length ||
    !result.sharedStylesheet ||
    result.pillRadii.some(radius => radius !== '0px') ||
    result.pageErrors.length
  );
  if (failures.length) {
    console.error(JSON.stringify(failures, null, 2));
    process.exitCode = 1;
  } else {
    console.log(`Reviewed ${results.length} HTML pages: no visual-contract failures.`);
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
