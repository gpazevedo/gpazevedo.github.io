/* Drive the player in a real DOM and assert what it actually does.
   Run:  node test_player.js <file.html> [origin]
   origin 'opaque' simulates about:srcdoc / sandboxed frames, where
   history.replaceState throws. */
const fs = require('fs');
const { JSDOM } = require('jsdom');

const file = process.argv[2];
const mode = process.argv[3] || 'https';   // https | file | throw
const html = fs.readFileSync(file, 'utf8');

const errors = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  // 'file' exercises the protocol guard; 'throw' exercises the try/catch for a
  // sandboxed https frame whose origin is still opaque.
  url: mode === 'file' ? 'file:///tmp/p.html'
                       : 'https://gpazevedo.github.io/blog/eng/p.html',
  beforeParse(window) {
    // must be installed before the page's inline scripts parse and run,
    // because the failure being reproduced happens during init
    delete window.IntersectionObserver;
    if (mode === 'throw') {
      Object.defineProperty(window.history, 'replaceState', {
        configurable: true,
        value: () => { throw new window.DOMException(
          "A history state object with URL 'about:srcdoc?s=spot&m=bypass' cannot " +
          "be created in a document with origin 'https://www.claudeusercontent.com'",
          'SecurityError'); }
      });
    }
  },
  virtualConsole: new (require('jsdom').VirtualConsole)()
    .on('jsdomError', e => errors.push('jsdomError: ' + e.message))
    .on('error', (...a) => errors.push('console.error: ' + a.join(' ')))
});
const { window } = dom;
const doc = window.document;


function run() {
  const P = 'bt-';
  const $ = id => doc.getElementById(P + id);
  const root = $('player');
  const fail = [];
  const ok = (cond, msg) => { if (!cond) fail.push(msg); };

  ok(!!root, 'player root missing');
  if (!root) return { fail, errors };

  // --- init state -----------------------------------------------------
  ok(root.classList.contains('running'), 'root never entered running state');
  ok($('pos').textContent.endsWith('/12'), 'init step count wrong: ' + $('pos').textContent);
  ok(/Ready/.test($('capt').textContent), 'caption not initialised: ' + $('capt').textContent);
  ok(doc.querySelectorAll('#' + P + 'player .tab.sel').length === 1, 'exactly one tab should be selected');

  const dimmed = () => Array.from(root.querySelectorAll('.stage.dim')).length;
  ok(dimmed() > 10, 'stages not dimmed at reset: ' + dimmed());

  // --- step through a whole run ---------------------------------------
  const total = parseInt($('pos').textContent.split('/')[1], 10);
  for (let n = 0; n < total; n++) $('step').click();
  ok($('pos').textContent === total + '/' + total, 'stepping did not reach the end');
  ok(root.querySelector('#' + P + 'stage-po').classList.contains('now'),
     'final step should light the PO card');
  ok(!root.querySelector('#' + P + 'col0-badge').classList.contains('subdim'),
     'cost badge should be revealed at the end');
  const costEnd = $('cost').textContent;
  ok(costEnd.startsWith('$0.0000'), 'spot|bypass should end at $0.0000, got ' + costEnd);

  // stepping past the end must be a no-op, not a throw
  $('step').click();
  ok($('pos').textContent === total + '/' + total, 'stepped past the end');

  // --- back / reset ----------------------------------------------------
  $('back').click();
  ok($('pos').textContent === (total - 1) + '/' + total, 'back did not decrement');
  $('reset').click();
  ok($('pos').textContent === '0/' + total, 'reset did not return to 0');

  // --- every tab x mode x cycle-back ----------------------------------
  const tabs = Array.from(doc.querySelectorAll('#' + P + 'player .tab'));
  ok(tabs.length === 4, 'expected 4 tabs');
  const seen = [];
  for (const tab of tabs) {
    for (const m of ['bypass', 'agent']) {
      for (const cyc of [false, true]) {
        tab.click();
        const btn = $('m-' + m);
        if (btn.disabled) continue;
        btn.click();
        $('cyc').checked = cyc;
        $('cyc').dispatchEvent(new window.Event('change'));
        const t = parseInt($('pos').textContent.split('/')[1], 10);
        for (let n = 0; n < t; n++) $('step').click();
        const key = tab.dataset.k;
        const litOwn = root.querySelector('#' + P + 'col-' + ({spot:0,lev:1,bot:2,str:3})[key]);
        ok(!litOwn.classList.contains('dim'), `${key}|${m} never lit its own column`);
        for (const [k, idx] of Object.entries({spot:0,lev:1,bot:2,str:3})) {
          if (k === key) continue;
          ok(root.querySelector('#' + P + 'col-' + idx).classList.contains('dim'),
             `${key}|${m} wrongly lit column ${k}`);
        }
        ok(root.querySelector('#' + P + 'stage-po').classList.contains('now'),
           `${key}|${m}${cyc?'+cyc':''} did not reach PO`);
        seen.push(`${key}|${m}${cyc ? '+cyc' : ''} ${t} steps ${$('cost').textContent}`);
      }
    }
  }

  // --- keyboard --------------------------------------------------------
  $('reset').click();
  root.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  ok($('pos').textContent.startsWith('1/'), 'ArrowRight did not step');

  // --- play / pause timer ---------------------------------------------
  $('reset').click();
  $('play').click();
  ok(/Pause/.test($('play').innerHTML), 'play did not switch to Pause');
  $('play').click();
  ok(/Play/.test($('play').innerHTML), 'pause did not switch back to Play');

  return { fail, errors, seen };
}

setTimeout(() => {
  let res;
  try { res = run(); }
  catch (e) { res = { fail: ['THREW: ' + e.stack.split('\n').slice(0,3).join(' | ')], errors }; }
  console.log('=== ' + file.split('/').pop() + '  [' + mode + '] ===');
  (res.seen || []).forEach(s => console.log('   ' + s));
  console.log('   page errors : ' + (res.errors.length ? res.errors.join('\n                 ') : 'none'));
  console.log('   assertions  : ' + (res.fail.length ? 'FAILED\n     - ' + res.fail.join('\n     - ') : 'all pass'));
  process.exit(res.fail.length || res.errors.length ? 1 : 0);
}, 300);
