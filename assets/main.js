/* Landing page behaviour: reveal-on-scroll, mobile nav, blog index population. */

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

/* Blog index — requires blog/<section>/posts.js loaded first. */
(function () {
  function fmtDate(iso) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  function renderPosts(containerId, posts, pathPrefix) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!posts || !posts.length) {
      container.innerHTML = '<div class="blog-empty">First post coming soon.</div>';
      return;
    }
    container.innerHTML = posts
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(p => `
        <a href="${pathPrefix}${p.file}" class="blog-post">
          <div class="blog-post-tag">${p.tags[0]}</div>
          <div class="blog-post-title">${p.title}</div>
          <div class="blog-post-desc">${p.description}</div>
          <div class="blog-post-meta">${p.readingTime} min read · ${fmtDate(p.date)}</div>
        </a>`)
      .join('');
  }

  renderPosts('eng-posts', window.engPosts, 'blog/eng/');
})();
