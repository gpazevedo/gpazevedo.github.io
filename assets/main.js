/* Landing page behaviour: reveal-on-scroll, mobile nav, work tabs, index population. */

document.querySelector('.nav-hamburger')?.addEventListener('click', function () {
  this.closest('nav').classList.toggle('nav-open');
});

const blogDropTrigger = document.querySelector('.nav-drop-trigger');
const blogDropdown = blogDropTrigger?.closest('.nav-dropdown');
if (blogDropTrigger && blogDropdown) {
  blogDropTrigger.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    blogDropdown.classList.toggle('nav-dropdown-open');
    const expanded = blogDropdown.classList.contains('nav-dropdown-open');
    blogDropTrigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  });

  document.addEventListener('click', function (event) {
    if (!blogDropdown.contains(event.target) && blogDropdown.classList.contains('nav-dropdown-open')) {
      blogDropdown.classList.remove('nav-dropdown-open');
      blogDropTrigger.setAttribute('aria-expanded', 'false');
    }
  });
}

const io = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  }),
  { threshold: .1 }
);
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ------------------------------------------------------------------
   Card renderers.
   Markup here is kept structurally identical to scripts/build_site.py,
   which pre-renders the same three lists into index.html for crawlers.
   Change one, change the other.
   ------------------------------------------------------------------ */
(function () {
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function fmtDate(iso) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  function fill(containerId, items, emptyText, toHtml) {
    const container = document.getElementById(containerId);
    if (!container) return 0;
    if (!items || !items.length) {
      container.innerHTML = '<div class="blog-empty">' + esc(emptyText) + '</div>';
      return 0;
    }
    container.innerHTML = items.map(toHtml).join('');
    return items.length;
  }

  function renderPosts(containerId, posts, pathPrefix) {
    const sorted = (posts || []).slice().sort((a, b) => b.date.localeCompare(a.date));
    return fill(containerId, sorted, 'First post coming soon.', p => `
        <a href="${pathPrefix}${p.file}" class="blog-post">
          <div class="blog-post-tag">${esc(p.tags[0])}</div>
          <div class="blog-post-title">${esc(p.title)}</div>
          <div class="blog-post-desc">${esc(p.description)}</div>
          <div class="blog-post-meta">${p.readingTime} min read · ${fmtDate(p.date)}</div>
        </a>`);
  }

  function renderProjects(containerId, projects, pathPrefix) {
    return fill(containerId, projects, 'Project index coming soon.', p => {
      const todo = p.status === 'TODO';
      const stack = (p.stack || []).map(s => `<span class="card-chip">${esc(s)}</span>`).join('');
      const links = (p.links || [])
        .map(l => `<a class="card-link" href="${esc(l.href)}"${/^https?:/.test(l.href) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(l.label)} →</a>`)
        .join('');
      return `
        <div class="blog-post">
          <div class="card-head">
            <div class="blog-post-tag">${esc(p.tags[0])}</div>
            <span class="card-status${todo ? ' card-status-todo' : ''}">${esc(p.status)}</span>
          </div>
          <a class="blog-post-title" href="${pathPrefix}${p.file}">${esc(p.title)}</a>
          <div class="blog-post-desc">${esc(p.description)}</div>
          <div class="card-stack">${stack}</div>
          <div class="card-links"><a class="card-link" href="${pathPrefix}${p.file}">Read more →</a>${links}</div>
        </div>`;
    });
  }

  function renderDemos(containerId, demos, pathPrefix) {
    return fill(containerId, demos, 'Demos coming soon.', d => {
      const href = d.href ? d.href : pathPrefix + d.file;
      const external = /^https?:/.test(href);
      return `
        <a href="${esc(href)}" class="blog-post"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
          <div class="card-head">
            <div class="blog-post-tag">${esc(d.tags[0])}</div>
            <span class="card-status">${esc(d.kind)}</span>
          </div>
          <div class="blog-post-title">${esc(d.title)}</div>
          <div class="blog-post-desc">${esc(d.description)}</div>
        </a>`;
    });
  }


  const counts = {
    blog: renderPosts('eng-posts', window.engPosts, 'blog/eng/'),
    projects: renderProjects('project-cards', window.aiProjects, 'projects/'),
    demos: renderDemos('demo-cards', window.demos, 'demos/')
  };

  document.querySelectorAll('[data-count-for]').forEach(el => {
    const n = counts[el.getAttribute('data-count-for')];
    el.textContent = n ? String(n) : '';
  });
})();

/* ------------------------------------------------------------------
   Work tabs — Blog / AI Projects / Demos.
   Deep-linkable. Legacy anchors (#blog, #blog-engineering) must keep
   resolving to the Blog tab: every published post links back to them.
   ------------------------------------------------------------------ */
(function () {
  const tablist = document.querySelector('.wt-tabs');
  if (!tablist) return;

  const tabs = Array.from(tablist.querySelectorAll('.wt-tab'));
  const panels = new Map(
    tabs.map(t => [t.dataset.tab, document.getElementById(t.getAttribute('aria-controls'))])
  );

  /* hash -> tab name. Anything unlisted leaves the current tab alone. */
  const HASH_TO_TAB = {
    'work': 'blog',
    'blog': 'blog',
    'blog-engineering': 'blog',
    'eng-posts': 'blog',
    'ai-projects': 'projects',
    'projects': 'projects',
    'demos': 'demos',
    'demo': 'demos'
  };
  const TAB_TO_HASH = { blog: 'blog', projects: 'ai-projects', demos: 'demos' };

  function activate(name, opts) {
    const options = opts || {};
    if (!panels.has(name)) return false;

    tabs.forEach(tab => {
      const on = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      const panel = panels.get(tab.dataset.tab);
      if (panel) panel.hidden = !on;
    });

    if (options.focusTab) {
      const target = tabs.find(t => t.dataset.tab === name);
      if (target) target.focus();
    }

    if (options.updateHash) {
      // replaceState keeps the back button meaning "the page before this one"
      // rather than filling history with tab flips. It throws on some
      // origins (file://, sandboxed frames) - a thrown hash update must not
      // take the tab switch down with it.
      try {
        history.replaceState(null, '', '#' + TAB_TO_HASH[name]);
      } catch (_) { /* hash is cosmetic; the tab is already switched */ }
    }
    return true;
  }

  function scrollToHash(hash) {
    const el = hash && document.getElementById(hash);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
  }

  function applyHash(hash, opts) {
    const name = HASH_TO_TAB[hash];
    if (!name) return false;
    activate(name, opts);
    return true;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activate(tab.dataset.tab, { updateHash: true }));
  });

  /* WAI-ARIA tabs keyboard pattern. */
  tablist.addEventListener('keydown', event => {
    const current = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
    let next = null;
    if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    event.preventDefault();
    activate(tabs[next].dataset.tab, { updateHash: true, focusTab: true });
  });

  window.addEventListener('hashchange', () => {
    const hash = location.hash.replace(/^#/, '');
    if (applyHash(hash)) scrollToHash(hash);
  });

  /* Initial load: the browser cannot scroll to an anchor inside a hidden
     panel, so switch the tab first and then scroll ourselves. */
  const initial = location.hash.replace(/^#/, '');
  if (applyHash(initial)) scrollToHash(initial);
  else activate('blog');

  window.__workTabs = { activate, applyHash, tabs, panels };
})();
