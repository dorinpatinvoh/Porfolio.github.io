const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

test('public portfolio, editor and mobile navigation', async () => {
  const root = path.resolve(__dirname, '..');
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + (req.url === '/' ? '/index.html' : req.url.split('?')[0]));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.webp':'image/webp', '.png':'image/png', '.svg':'image/svg+xml', '.pdf':'application/pdf' };
    fs.readFile(file, (error, data) => { res.writeHead(error ? 404 : 200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream'}); res.end(error ? 'Not found' : data); });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({headless:true,
      ...(process.env.CHROMIUM_EXECUTABLE ? {executablePath: process.env.CHROMIUM_EXECUTABLE, args: ['--no-sandbox', '--disable-dev-shm-usage']} : {})
    });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // Keep tests deterministic without third-party fonts or icon servers.
    await page.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({width, height:900});
      await page.goto(base);
      await page.waitForFunction(() => document.getElementById('btnSubmit').textContent === 'Préparer mon email');
      assert.equal(await page.locator('#gestionProjets').count(), 0);
      assert.equal(await page.locator('#projetsGrid .projet-carte:visible').count(), 3);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}px`);
      await page.getByRole('button', {name:'Frontend', exact:true}).click();
      assert.equal(await page.locator('#projetsGrid .projet-carte:visible').count(), 0);
      assert.match(await page.locator('#projetsGrid').innerText(), /Aucun projet/);
      await page.getByRole('button', {name:'Tous', exact:true}).click();
      assert.equal(await page.locator('#projetsGrid .projet-carte:visible').count(), 3);
      if (width < 860) {
        await page.locator('#burger').click();
        assert.equal(await page.locator('#burger').getAttribute('aria-expanded'), 'true');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#burger').getAttribute('aria-expanded'), 'false');
      }
      assert.equal(await page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0)), true);
      if (process.env.QA_SCREENSHOTS) {
        fs.mkdirSync(process.env.QA_SCREENSHOTS, {recursive:true});
        await page.evaluate(() => { document.activeElement.blur(); window.scrollTo({top:0, behavior:'instant'}); });
        await page.waitForTimeout(100);
        await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS, `portfolio-${width}.png`), fullPage:true});
      }
    }
    // A stale local editor draft must never override the published public page.
    await page.evaluate(() => localStorage.setItem('portfolio-patinvoh-v1', JSON.stringify({version:1,projets:[],competences:['DRAFT ONLY']})));
    await page.reload();
    await page.waitForFunction(() => document.querySelector('#skillsList').textContent.includes('Java'));
    assert.equal(await page.locator('#skillsList').getByText('DRAFT ONLY').count(), 0);
    assert.equal((await page.request.get(base+'/assets/cv-dorin-patinvoh.pdf')).status(), 200);
    await page.goto(base+'/admin.html');
    assert.equal(await page.locator('#gestionProjets').isVisible(), true);
    await page.locator('#skillInput').fill('Docker');
    await page.locator('#skillForm button').click();
    assert.match(await page.locator('#manageSkillsList').innerText(), /Docker/);
    assert.deepEqual(errors, []);
    // Confirm Netlify success and failure handling with mocked responses; no message is sent.
    await page.unroute('**/*');
    await page.route('https://portfolio-test.netlify.app/**', async route => {
      if (route.request().method() === 'POST') {
        assert.match(route.request().postData(), /form-name=contact/);
        await route.fulfill({status:200,body:'OK'});
        return;
      }
      const relative = new URL(route.request().url()).pathname;
      const file = path.join(root, relative === '/' ? 'index.html' : relative);
      await route.fulfill({path:file});
    });
    await page.goto('https://portfolio-test.netlify.app/');
    await page.locator('#name').fill('Test');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#message').fill('Test local, aucun envoi réel');
    await page.locator('#btnSubmit').click();
    await page.waitForFunction(() => document.getElementById('formStatus').textContent.includes('Message transmis'));
    await page.route('https://portfolio-test.netlify.app/', route => route.request().method() === 'POST' ? route.fulfill({status:500,body:'Error'}) : route.fallback());
    await page.locator('#name').fill('Test');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#message').fill('Test erreur');
    await page.locator('#btnSubmit').click();
    await page.waitForFunction(() => document.getElementById('formStatus').textContent.includes('n’a pas pu être envoyé'));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
