const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const projectRoot = path.resolve(__dirname, '..');
const moduleRoot = process.env.WORKSPACE_NODE_MODULES || 'C:\\Users\\home\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules';
const { chromium } = require(path.join(moduleRoot, 'playwright'));
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const screenshotRoot = path.join(projectRoot, 'assets', 'screenshots');
fs.mkdirSync(screenshotRoot, { recursive: true });

const targets = [
  {
    source: 'experiments/experiment-01-faithful-talk-companion/index.html',
    output: '01-faithful-article.jpg',
    y: 820,
    alt: 'Faithful companion article with a source frame and timestamped technical prose'
  },
  {
    source: 'experiments/experiment-03-concept-map/index.html',
    output: '03-concept-map.jpg',
    y: 400,
    setup: async page => page.selectOption('#kind', 'feedback'),
    alt: 'Interactive concept map filtered to show amplifying feedback relationships'
  },
  {
    source: 'experiments/experiment-04-tabletop-workshop/index.html',
    output: '04-tabletop.jpg',
    y: 760,
    alt: 'Facilitator-ready tabletop scenario showing staged incident injects'
  },
  {
    source: 'experiments/experiment-06-teaching-kit/index.html',
    output: '06-teaching-kit.jpg',
    y: 420,
    alt: 'Teaching kit showing its timed lesson sequence and learning activities'
  },
  {
    source: 'experiments/experiment-08-claim-audit/index.html',
    output: '08-claim-audit.jpg',
    y: 480,
    alt: 'Skeptical claim-audit matrix with claims, assumptions, challenges, and verdicts'
  },
  {
    source: 'experiments/experiment-10-transcript-navigator/index.html',
    output: '10-transcript-navigator.jpg',
    y: 390,
    setup: async page => page.fill('#q', 'retry'),
    alt: 'Searchable transcript navigator filtered to segments containing retry'
  }
];

(async () => {
  const browser = await chromium.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--allow-file-access-from-files']
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 720 },
      deviceScaleFactor: 1,
      colorScheme: 'light'
    });
    const page = await context.newPage();

    for (const target of targets) {
      const sourcePath = path.join(projectRoot, ...target.source.split('/'));
      await page.goto(pathToFileURL(sourcePath).href, { waitUntil: 'load' });
      if (target.setup) await target.setup(page);
      await page.evaluate(y => {
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, y);
      }, target.y);
      await page.waitForTimeout(150);
      await page.screenshot({
        path: path.join(screenshotRoot, target.output),
        type: 'jpeg',
        quality: 88,
        fullPage: false
      });
    }

    const socialPage = await context.newPage();
    const backgroundUrl = `data:image/png;base64,${fs.readFileSync(path.join(projectRoot, 'assets', 'social-preview-background.png')).toString('base64')}`;
    const faviconUrl = `data:image/svg+xml;base64,${fs.readFileSync(path.join(projectRoot, 'assets', 'favicon.svg')).toString('base64')}`;
    await socialPage.setViewportSize({ width: 1200, height: 630 });
    await socialPage.setContent(`<!doctype html><html><head><style>
      *{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#081310;color:#f4ecd9;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}.stage{position:relative;width:100%;height:100%;overflow:hidden}.art{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(4,14,11,.97) 0%,rgba(4,14,11,.91) 35%,rgba(4,14,11,.42) 62%,rgba(4,14,11,.06) 100%)}.copy{position:absolute;left:66px;top:62px;width:655px}.eyebrow{font-size:18px;letter-spacing:.17em;text-transform:uppercase;color:#d96842;font-weight:800;margin-bottom:28px}.title{font:700 68px/.94 Georgia,serif;letter-spacing:-.045em;margin:0 0 24px}.summary{font-size:25px;line-height:1.35;color:#dcd5c5;max-width:590px}.proof{position:absolute;left:68px;bottom:52px;display:flex;gap:28px;font-size:16px;color:#b9c5bd}.proof b{color:#f4ecd9;font-size:25px;margin-right:7px}.mark{position:absolute;right:42px;top:38px;width:54px;height:54px}
    </style></head><body><div class="stage"><img class="art" src="${backgroundUrl}" alt=""><div class="shade"></div><div class="copy"><div class="eyebrow">Transcript Organizer · Windows</div><h1 class="title">Turn one technical talk into reusable evidence.</h1><div class="summary">Local video transcription, source-preserving extraction, and ten practical publishing experiments.</div></div><div class="proof"><span><b>1,013</b>segments</span><span><b>51</b>frames</span><span><b>10</b>workflows</span></div><img class="mark" src="${faviconUrl}" alt=""></div></body></html>`, { waitUntil: 'load' });
    await socialPage.screenshot({
      path: path.join(projectRoot, 'assets', 'social-preview.jpg'),
      type: 'jpeg',
      quality: 92
    });
    await socialPage.close();

    fs.writeFileSync(
      path.join(screenshotRoot, 'manifest.json'),
      JSON.stringify(targets.map(({ output, source, alt }) => ({ output, source, alt })), null, 2) + '\n',
      'utf8'
    );

    const landingPage = await context.newPage();
    await landingPage.setViewportSize({ width: 1440, height: 1000 });
    await landingPage.goto(pathToFileURL(path.join(projectRoot, 'index.html')).href, { waitUntil: 'load' });
    await landingPage.screenshot({ path: path.join(projectRoot, 'artifacts', 'landing-page-desktop.png'), fullPage: false });
    await landingPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await landingPage.waitForTimeout(250);
    const brokenImages = await landingPage.$$eval('img', images => images.filter(image => !image.complete || image.naturalWidth === 0).map(image => image.getAttribute('src')));
    const headingCount = await landingPage.locator('h1').count();
    const experimentLinks = await landingPage.locator('#experiments a[href*="experiment-"]').count();
    const desktopOverflow = await landingPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);

    await landingPage.setViewportSize({ width: 390, height: 844 });
    await landingPage.goto(pathToFileURL(path.join(projectRoot, 'index.html')).href, { waitUntil: 'load' });
    const mobileOverflow = await landingPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    await landingPage.screenshot({ path: path.join(projectRoot, 'artifacts', 'landing-page-mobile.png'), fullPage: false });

    const browserValidation = { headingCount, experimentLinks, brokenImages, desktopOverflow, mobileOverflow };
    fs.writeFileSync(path.join(projectRoot, 'artifacts', 'landing-page-browser-validation.json'), JSON.stringify(browserValidation, null, 2) + '\n', 'utf8');
    if (headingCount !== 1 || experimentLinks !== 10 || brokenImages.length || desktopOverflow || mobileOverflow) {
      throw new Error(`Landing-page browser validation failed: ${JSON.stringify(browserValidation)}`);
    }
    await landingPage.close();
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
