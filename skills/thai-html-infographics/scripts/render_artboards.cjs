#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

function options(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (['--help', '--pdf'].includes(key)) result[key] = true;
    else if (['--project', '--node-modules', '--browser'].includes(key)) {
      const value = argv[++i];
      if (!value || value.startsWith('--')) throw Error(`Missing value for ${key}`);
      result[key] = value;
    } else throw Error(`Unknown argument: ${key}`);
  }
  return result;
}

async function render(args) {
  if (args['--help']) {
    console.log('Render fixed-size HTML artboards without modifying source HTML.\nnode render_artboards.cjs --project <folder> [--node-modules <folder>] [--browser <chromium-executable>] [--pdf]\nOutputs: png/<html-stem>.png, render-report.json, and optional collection.pdf.');
    return;
  }
  if (!args['--project']) throw Error('--project is required');
  const project = path.resolve(args['--project']);
  const files = fs.readdirSync(project).filter(name => name.endsWith('.html')).sort();
  let playwright;
  try {
    playwright = args['--node-modules'] ? require(path.join(path.resolve(args['--node-modules']), 'playwright')) : require('playwright');
  } catch {
    throw Error('Playwright is unavailable. Supply --node-modules using the current bundled dependency directory or an existing installation.');
  }
  const browser = await playwright.chromium.launch({ headless: true, ...(args['--browser'] ? { executablePath: path.resolve(args['--browser']) } : {}) });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  const reports = [];
  const errors = [];
  const bodies = [];
  let currentFile = '';
  let firstFile;
  page.on('pageerror', error => errors.push({ file: currentFile, error: error.message }));
  page.on('requestfailed', request => errors.push({ file: currentFile, url: request.url(), error: request.failure()?.errorText }));
  const png = path.join(project, 'png');
  fs.mkdirSync(png, { recursive: true });
  try {
    for (const file of files) {
      const source = fs.readFileSync(path.join(project, file), 'utf8');
      const artboardClasses = source.match(/class=["'][^"']*\bposter\b[^"']*["']/g) || [];
      if (artboardClasses.length !== 1) continue;
      currentFile = file;
      await page.goto(pathToFileURL(path.join(project, file)).href);
      const count = await page.locator('.poster').count();
      if (count !== 1) continue;
      await page.evaluate(() => document.fonts.ready);
      const size = await page.locator('.poster').evaluate(el => ({ width: el.offsetWidth, height: el.offsetHeight }));
      if (!size.width || !size.height) throw Error(`${file} has no artboard dimensions`);
      await page.setViewportSize(size);
      await page.evaluate(async () => {
        await document.fonts.ready;
        // ResizeObserver updates the viewing scale during the next frame.
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      const report = await page.evaluate(() => {
        const poster = document.querySelector('.poster');
        const bounds = poster.getBoundingClientRect();
        const violations = [];
        const boxes = [];
        const failedImages = [];
        const identify = el => el.id || el.getAttribute('class') || el.tagName;
        for (const el of poster.querySelectorAll('*')) {
          const style = getComputedStyle(el);
          if (style.display === 'none') continue;
          const rect = el.getBoundingClientRect();
          if (!rect.width && !rect.height) continue;
          if (rect.right > bounds.right + 1 || rect.bottom > bounds.bottom + 1 || rect.left < bounds.left - 1 || rect.top < bounds.top - 1) violations.push(identify(el));
          const textNodes = [...el.childNodes].filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
          for (const node of textNodes) {
            const range = document.createRange();
            range.selectNodeContents(node);
            const textRect = range.getBoundingClientRect();
            // Range height reports font metrics, not painted Thai glyph bounds.
            const horizontalOverflow = textRect.right > rect.right + 3 || textRect.left < rect.left - 3;
            const clippedVerticalOverflow = ['hidden', 'clip'].includes(style.overflowY) && el.clientHeight > 0 && el.scrollHeight > el.clientHeight + 2;
            if (horizontalOverflow || clippedVerticalOverflow) boxes.push({ element: identify(el), text: node.textContent.trim().slice(0, 80) });
          }
          if (el instanceof HTMLImageElement && (!el.complete || !el.naturalWidth)) failedImages.push(el.getAttribute('src'));
        }
        return { title: document.title, width: bounds.width, height: bounds.height, artboardOverflow: violations, textBoxOverflow: boxes, failedImages, loadedFonts: [...document.fonts].filter(font => font.status === 'loaded').map(font => ({ family: font.family, weight: font.weight })) };
      });
      reports.push({ file, ...report });
      if (Math.abs(report.width - size.width) > 1 || Math.abs(report.height - size.height) > 1) errors.push({ file, error: 'Artboard remains scaled at its native viewport dimensions' });
      await page.locator('.poster').screenshot({ path: path.join(png, `${path.parse(file).name}.png`) });
      bodies.push(await page.locator('.stage').evaluate(el => el.outerHTML));
      firstFile ||= file;
    }
    if (!reports.length) throw Error('No HTML files with exactly one .poster artboard were found');
    if (args['--pdf']) {
      const dimensions = new Set(reports.map(r => `${r.width}x${r.height}`));
      if (dimensions.size !== 1) throw Error('Combined PDF requires artboards with matching dimensions');
      currentFile = 'PDF collection';
      await page.goto(pathToFileURL(path.join(project, firstFile)).href);
      await page.evaluate(html => { document.body.innerHTML = html; }, bodies.join(''));
      await page.evaluate(() => document.fonts.ready);
      await page.pdf({ path: path.join(project, 'collection.pdf'), printBackground: true, preferCSSPageSize: true, width: `${reports[0].width}px`, height: `${reports[0].height}px` });
    }
    fs.writeFileSync(path.join(project, 'render-report.json'), JSON.stringify({ reports, errors }, null, 2));
    const failed = reports.filter(r => r.artboardOverflow.length || r.textBoxOverflow.length || r.failedImages.length);
    if (failed.length || errors.length) throw Error(`Review render-report.json: ${failed.length} artboards have layout/image failures; ${errors.length} browser/request failures.`);
    console.log(`Rendered ${reports.length} PNGs${args['--pdf'] ? ' and collection.pdf' : ''}. Inspect the images before delivery.`);
  } finally {
    await browser.close();
  }
}

Promise.resolve().then(() => render(options(process.argv.slice(2)))).catch(error => { console.error(error.message); process.exitCode = 1; });
