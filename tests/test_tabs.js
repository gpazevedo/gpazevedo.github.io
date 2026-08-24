/* jsdom harness for the Blog / AI Projects / Demos tabs on index.html.
 *
 *   node tests/test_tabs.js
 *
 * Run across three origin modes, mirroring the player harness:
 *   https                    — normal deployment
 *   file://                  — opening index.html off disk
 *   throwing-replaceState    — sandboxed/blocked history API
 *
 * The last mode is the one that matters: a hash update that throws must not
 * take the tab switch down with it.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

let failures = 0;
let checks = 0;

function ok(cond, label) {
  checks += 1;
  if (!cond) {
    failures += 1;
    console.error('  FAIL  ' + label);
  }
}

function eq(actual, expected, label) {
  ok(actual === expected, `${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function build({ url, breakReplaceState }) {
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', e => {
    failures += 1;
    console.error('  FAIL  jsdomError: ' + e.message);
  });

  const dom = new JSDOM(html, {
    url,
    runScripts: 'dangerously',
    resources: undefined,
    virtualConsole,
    beforeParse(window) {
      // Stubs must exist before the page scripts parse, not after.
      window.IntersectionObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
      window.Element.prototype.scrollIntoView = function () {};
      if (breakReplaceState) {
        window.history.replaceState = () => {
          throw new Error('replaceState blocked by this origin');
        };
      }
    }
  });

  // The page loads its data + behaviour via <script src>; resources are not
  // fetched in this harness, so inject them in the same order the page does.
  const inject = [
    'blog/eng/posts.js',
    'projects/projects.js',
    'demos/demos.js',
    'assets/main.js'
  ];
  for (const rel of inject) {
    const el = dom.window.document.createElement('script');
    el.textContent = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    dom.window.document.body.appendChild(el);
  }
  return dom;
}

function selected(doc) {
  const tab = doc.querySelector('.wt-tab[aria-selected="true"]');
  return tab ? tab.dataset.tab : null;
}

function visiblePanels(doc) {
  return Array.from(doc.querySelectorAll('.wt-panel'))
    .filter(p => !p.hidden)
    .map(p => p.id);
}

function run(mode, opts) {
  console.log(`\n[${mode}]`);
  const dom = build(opts);
  const { document } = dom.window;

  // — structure —
  eq(document.querySelectorAll('.wt-tab').length, 3, 'three tabs');
  eq(document.querySelectorAll('.wt-panel').length, 3, 'three panels');
  eq(selected(document), 'blog', 'blog is the default tab');
  eq(visiblePanels(document).join(','), 'wt-panel-blog', 'exactly one panel visible on load');

  // — cards rendered into every panel, including hidden ones (crawlability) —
  const counts = {
    blog: document.querySelectorAll('#eng-posts .blog-post').length,
    projects: document.querySelectorAll('#project-cards .blog-post').length,
    demos: document.querySelectorAll('#demo-cards .blog-post').length
  };
  ok(counts.blog > 0, 'blog cards rendered');
  ok(counts.projects === 5, `5 project cards rendered (got ${counts.projects})`);
  ok(counts.demos === 2, `2 demo cards rendered (got ${counts.demos})`);

  // — tab counters match what was rendered —
  for (const key of Object.keys(counts)) {
    const badge = document.querySelector(`[data-count-for="${key}"]`);
    eq(badge.textContent, String(counts[key]), `${key} tab count badge`);
  }

  // — no dead card links —
  const deadHref = Array.from(document.querySelectorAll('.wt-panel a[href]'))
    .map(a => a.getAttribute('href'))
    .filter(h => h.startsWith('undefined') || h.includes('undefined') || h === '');
  eq(deadHref.length, 0, `no malformed card hrefs (${deadHref.join(', ')})`);

  // — clicking switches panels —
  document.getElementById('wt-tab-projects').click();
  eq(selected(document), 'projects', 'click selects AI Projects');
  eq(visiblePanels(document).join(','), 'wt-panel-projects', 'only projects panel visible');
  eq(document.getElementById('wt-tab-blog').tabIndex, -1, 'unselected tab leaves the tab order');
  eq(document.getElementById('wt-tab-projects').tabIndex, 0, 'selected tab is focusable');

  document.getElementById('wt-tab-demos').click();
  eq(selected(document), 'demos', 'click selects Demos');

  // — keyboard: WAI-ARIA tabs pattern —
  const KeyboardEvent = dom.window.KeyboardEvent;
  const tablist = document.querySelector('.wt-tabs');
  tablist.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
  eq(selected(document), 'blog', 'Home selects first tab');
  tablist.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  eq(selected(document), 'projects', 'ArrowRight advances');
  tablist.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
  eq(selected(document), 'blog', 'ArrowLeft goes back');
  tablist.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
  eq(selected(document), 'demos', 'ArrowLeft wraps from first to last tab');
  tablist.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
  eq(selected(document), 'demos', 'End selects last tab');

  // — hash routing, including the legacy anchors every blog post links back to —
  const api = dom.window.__workTabs;
  const routes = {
    'blog': 'blog',
    'blog-engineering': 'blog',
    'work': 'blog',
    'ai-projects': 'projects',
    'projects': 'projects',
    'demos': 'demos'
  };
  for (const [hash, expected] of Object.entries(routes)) {
    api.applyHash(hash);
    eq(selected(document), expected, `#${hash} resolves to the ${expected} tab`);
  }
  ok(api.applyHash('contact') === false, '#contact leaves the tabs alone');

  // — anchor aliases exist so deep links have somewhere to land —
  for (const id of ['blog', 'ai-projects', 'demos']) {
    ok(document.getElementById(id) !== null, `#${id} anchor exists`);
  }

  dom.window.close();
}

function runDeepLink(hash, expectedTab) {
  const dom = build({ url: `https://gpazevedo.github.io/#${hash}` });
  const got = dom.window.document.querySelector('.wt-tab[aria-selected="true"]').dataset.tab;
  eq(got, expectedTab, `page loaded at #${hash} opens the ${expectedTab} tab`);
  dom.window.close();
}

run('https', { url: 'https://gpazevedo.github.io/' });
run('file://', { url: 'file:///home/user/site/index.html' });
run('throwing-replaceState', { url: 'https://gpazevedo.github.io/', breakReplaceState: true });

console.log('\n[deep links on first paint]');
runDeepLink('ai-projects', 'projects');
runDeepLink('demos', 'demos');
runDeepLink('blog-engineering', 'blog');

console.log(`\n${checks - failures}/${checks} checks passed`);
process.exit(failures === 0 ? 0 : 1);
