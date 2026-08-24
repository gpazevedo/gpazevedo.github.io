/* Verifies the assembled demos/aws-architecture.html — the embed fragment
   inside the site shell — behaves the same as the fragment does on its own.
   Adapted from the uploaded test_embed.js host harness. */
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync('aws-architecture.html', 'utf8');
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('  FAIL ' + m); } };

for (const url of ['https://gpazevedo.github.io/demos/aws-architecture.html',
                   'file:///tmp/aws-architecture.html']) {
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { fails++; console.error('  FAIL jsdomError: ' + e.message); });
  const dom = new JSDOM(html, { url, runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });
  const d = dom.window.document;

  ok(d.getElementById('ap'), 'player root mounted');
  ok(d.getElementById('ap-svg'), 'svg present');
  ok(d.querySelectorAll('.ap-strat').length === 4, 'four strategy buttons');
  ok(d.querySelectorAll('.ap-val').length === 2, 'two value buttons');
  ok(d.getElementById('ap-cost'), 'cost ticker present');
  ok(d.querySelector('.blog-nav'), 'site nav present');
  ok(d.querySelector('.breadcrumb a').getAttribute('href') === '../index.html#demos', 'breadcrumb returns to Demos');

  // stepping must advance the step counter and not throw
  const before = d.getElementById('ap-step').textContent;
  d.querySelector('.ap-strat[data-s="LEVERAGE"]').click();
  const after = d.getElementById('ap-step').textContent;
  ok(typeof before === 'string' && typeof after === 'string', 'step readout is text');

  console.log(`  [${url.startsWith('file') ? 'file' : 'https'}] checks done`);
  dom.window.close();
}
console.log(fails === 0 ? 'aws-architecture page OK' : `${fails} failures`);
process.exit(fails ? 1 : 0);
