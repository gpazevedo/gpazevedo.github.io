"""Regenerate crawlable artifacts from the three index data files.

Run after any edit to blog/eng/posts.js, projects/projects.js, or demos/demos.js:

    uv run scripts/build_site.py

Reads:
  - blog/eng/posts.js      (window.engPosts)
  - projects/projects.js   (window.aiProjects)
  - demos/demos.js         (window.demos)

Writes/updates:
  - index.html   (static cards between the three BUILD:* marker pairs)
  - sitemap.xml
  - rss.xml
  - robots.txt

The card markup emitted here is kept structurally identical to the renderers
in assets/main.js, which re-render the same lists client-side. Change one,
change the other.

Build-time assertions — the build fails rather than shipping a broken page:
  - each BUILD marker pair occurs exactly once in index.html
  - slugs are unique within each list
  - every project/demo `file` resolves to a real file on disk
  - every card link href resolves from the site root (not page-relative)
  - every url(#id) on a generated page resolves, and no page has duplicate ids
"""

import json
import re
from datetime import datetime, timezone
from email.utils import format_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://gpazevedo.github.io"
SITE_TITLE = "Gustavo Peixoto de Azevedo"
FEED_TITLE = "Gustavo Azevedo — Engineering Blog"
FEED_DESCRIPTION = (
    "Technical deep-dives on agentic and generative AI, the large-scale "
    "distributed systems underneath them, and what both mean for the business."
)


class BuildError(RuntimeError):
    """Raised for any condition that should stop the build."""


# ── loading ──────────────────────────────────────────────────────────────────

def load_list(rel_path: str) -> list[dict]:
    """Parse the JSON array out of a `window.<name> = [...]` data file."""
    path = ROOT / rel_path
    if not path.exists():
        raise BuildError(f"missing data file: {rel_path}")
    text = path.read_text()
    array_text = text[text.index("[") : text.rindex("]") + 1]
    items = json.loads(array_text)

    slugs = [i["slug"] for i in items]
    duplicates = {s for s in slugs if slugs.count(s) > 1}
    if duplicates:
        raise BuildError(f"{rel_path}: duplicate slugs {sorted(duplicates)}")
    return items


def assert_targets_exist(items: list[dict], folder: str, source: str) -> None:
    """Every entry with a `file` must point at something that actually exists."""
    missing = [
        i["file"] for i in items
        if i.get("file") and not (ROOT / folder / i["file"]).exists()
    ]
    if missing:
        raise BuildError(
            f"{source}: referenced {folder}/ file(s) do not exist: {missing}. "
            "Create the page or switch the entry to an external `href`."
        )


# ── rendering ────────────────────────────────────────────────────────────────

def assert_links_resolve(items: list[dict], source: str, posts: list[dict]) -> None:
    """Card link hrefs render into index.html at the site root, so a relative
    href must resolve from there — not from the folder the entry lives in.
    This is the bug this check exists for: an href written as
    ../blog/eng/x.html works on the project page and escapes the site root on
    the index card."""
    broken = []
    for item in items:
        for link in item.get("links", []) + item.get("assets", []):
            href = link["href"]
            if href.startswith(("http://", "https://", "#", "mailto:")):
                continue
            if href == "TODO":
                continue
            target = href.split("#")[0]
            if not target:
                continue
            if href.startswith("../"):
                broken.append(f'{item["slug"]}: {href} (page-relative)')
            elif target.startswith("blog/eng/"):
                # Validated against posts.js rather than disk: a link to an
                # unpublished post is the failure worth catching here.
                if target[len("blog/eng/"):] not in {p["file"] for p in posts}:
                    broken.append(f'{item["slug"]}: {href} (not in posts.js)')
            elif not (ROOT / target).exists():
                broken.append(f'{item["slug"]}: {href} (no such file)')
    if broken:
        raise BuildError(
            f"{source}: link href(s) do not resolve from the site root: {broken}. "
            "Write them site-root-relative (blog/eng/x.html), not page-relative."
        )

def assert_fragment_refs_resolve() -> None:
    """Every url(#id) in a generated page must resolve within that same page.

    Several figures share one page, so an SVG marker id that is not namespaced
    per figure silently points at a different figure's marker — or at nothing.
    Browsers do not warn; the arrowheads simply vanish.
    """
    import collections

    broken = []
    for page in sorted(ROOT.glob("projects/*.html")) + sorted(ROOT.glob("demos/*.html")):
        html = page.read_text()
        ids = re.findall(r'\sid="([^"]+)"', html)
        dupes = {k for k, v in collections.Counter(ids).items() if v > 1}
        unresolved = {r for r in re.findall(r"url\(#([^)]+)\)", html)} - set(ids)
        rel = page.relative_to(ROOT)
        if unresolved:
            broken.append(f"{rel}: unresolved {sorted(unresolved)}")
        if dupes:
            broken.append(f"{rel}: duplicate ids {sorted(dupes)}")
    if broken:
        raise BuildError("fragment reference check failed:\n  " + "\n  ".join(broken))

def esc(value: str) -> str:
    """Match the escaping in assets/main.js — markup chars only, quotes left alone."""
    return str(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def fmt_date_human(iso_date: str) -> str:
    return datetime.strptime(iso_date, "%Y-%m-%d").strftime("%b %Y")


def render_eng_cards(posts: list[dict]) -> str:
    return "\n".join(
        f'          <a href="blog/eng/{p["file"]}" class="blog-post">\n'
        f'            <div class="blog-post-tag">{esc(p["tags"][0])}</div>\n'
        f'            <div class="blog-post-title">{esc(p["title"])}</div>\n'
        f'            <div class="blog-post-desc">{esc(p["description"])}</div>\n'
        f'            <div class="blog-post-meta">{p["readingTime"]} min read · {fmt_date_human(p["date"])}</div>\n'
        f"          </a>"
        for p in posts
    )


def render_project_cards(projects: list[dict]) -> str:
    cards = []
    for p in projects:
        todo = " card-status-todo" if p.get("status") == "TODO" else ""
        stack = "".join(
            f'<span class="card-chip">{esc(s)}</span>' for s in p.get("stack", [])
        )
        links = "".join(
            f'<a class="card-link" href="{esc(link["href"])}"'
            + (
                ' target="_blank" rel="noopener noreferrer"'
                if link["href"].startswith(("http://", "https://"))
                else ""
            )
            + f'>{esc(link["label"])} →</a>'
            for link in p.get("links", [])
        )
        cards.append(
            f'          <div class="blog-post">\n'
            f'            <div class="card-head">\n'
            f'              <div class="blog-post-tag">{esc(p["tags"][0])}</div>\n'
            f'              <span class="card-status{todo}">{esc(p["status"])}</span>\n'
            f"            </div>\n"
            f'            <a class="blog-post-title" href="projects/{p["file"]}">{esc(p["title"])}</a>\n'
            f'            <div class="blog-post-desc">{esc(p["description"])}</div>\n'
            f'            <div class="card-stack">{stack}</div>\n'
            f'            <div class="card-links"><a class="card-link" href="projects/{p["file"]}">Read more →</a>{links}</div>\n'
            f"          </div>"
        )
    return "\n".join(cards)


def render_demo_cards(demos: list[dict]) -> str:
    cards = []
    for d in demos:
        href = d.get("href") or f"demos/{d['file']}"
        external = (
            ' target="_blank" rel="noopener noreferrer"'
            if href.startswith(("http://", "https://"))
            else ""
        )
        cards.append(
            f'          <a href="{esc(href)}" class="blog-post"{external}>\n'
            f'            <div class="card-head">\n'
            f'              <div class="blog-post-tag">{esc(d["tags"][0])}</div>\n'
            f'              <span class="card-status">{esc(d["kind"])}</span>\n'
            f"            </div>\n"
            f'            <div class="blog-post-title">{esc(d["title"])}</div>\n'
            f'            <div class="blog-post-desc">{esc(d["description"])}</div>\n'
            f"          </a>"
        )
    return "\n".join(cards)


# ── index.html ───────────────────────────────────────────────────────────────

MARKERS = {
    "eng-posts": "blog/eng/posts.js",
    "ai-projects": "projects/projects.js",
    "demos": "demos/demos.js",
}


def splice(html: str, name: str, body: str) -> str:
    start = (
        f"<!-- BUILD:{name}:START — generated by scripts/build_site.py "
        f"from {MARKERS[name]}, do not edit by hand -->"
    )
    end = f"<!-- BUILD:{name}:END -->"
    pattern = re.compile(re.escape(start) + r".*?" + re.escape(end), re.DOTALL)
    new_html, count = pattern.subn(lambda _m: f"{start}\n{body}\n{end}", html)
    if count != 1:
        raise BuildError(
            f"BUILD:{name} markers not found (or found more than once) in index.html"
        )
    return new_html


def update_index_html(posts, projects, demos) -> None:
    index_path = ROOT / "index.html"
    html = index_path.read_text()
    html = splice(html, "eng-posts", render_eng_cards(posts))
    html = splice(html, "ai-projects", render_project_cards(projects))
    html = splice(html, "demos", render_demo_cards(demos))
    index_path.write_text(html)


# ── sitemap / rss / robots ───────────────────────────────────────────────────

def write_sitemap(posts, projects, demos) -> None:
    home_lastmod = max(p["date"] for p in posts)
    urls = [(f"{BASE_URL}/", home_lastmod)]
    urls += [(f"{BASE_URL}/blog/eng/{p['file']}", p["date"]) for p in posts]
    urls += [
        (f"{BASE_URL}/projects/{p['file']}", home_lastmod)
        for p in projects
        if p.get("file")
    ]
    urls += [
        (f"{BASE_URL}/demos/{d['file']}", home_lastmod)
        for d in demos
        if d.get("file")
    ]

    entries = "\n".join(
        f"  <url>\n    <loc>{loc}</loc>\n    <lastmod>{lastmod}</lastmod>\n  </url>"
        for loc, lastmod in urls
    )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{entries}\n"
        "</urlset>\n"
    )
    (ROOT / "sitemap.xml").write_text(xml)


def write_rss(posts: list[dict]) -> None:
    def rfc822(iso_date: str) -> str:
        dt = datetime.strptime(iso_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        return format_datetime(dt)

    items = []
    for p in posts:
        link = f"{BASE_URL}/blog/eng/{p['file']}"
        categories = "".join(f"\n      <category>{t}</category>" for t in p["tags"])
        items.append(
            "    <item>\n"
            f"      <title>{p['title']}</title>\n"
            f"      <link>{link}</link>\n"
            f"      <guid>{link}</guid>\n"
            f"      <pubDate>{rfc822(p['date'])}</pubDate>\n"
            f"      <description>{p['description']}</description>{categories}\n"
            "    </item>"
        )

    build_date = rfc822(max(p["date"] for p in posts))
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
        "<channel>\n"
        f"  <title>{FEED_TITLE}</title>\n"
        f"  <link>{BASE_URL}/</link>\n"
        f'  <atom:link href="{BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>\n'
        f"  <description>{FEED_DESCRIPTION}</description>\n"
        "  <language>en-us</language>\n"
        f"  <lastBuildDate>{build_date}</lastBuildDate>\n"
        + "\n".join(items)
        + "\n</channel>\n</rss>\n"
    )
    (ROOT / "rss.xml").write_text(xml)


def write_robots() -> None:
    (ROOT / "robots.txt").write_text(
        "User-agent: *\nAllow: /\n\nSitemap: " + BASE_URL + "/sitemap.xml\n"
    )


# ── entry point ──────────────────────────────────────────────────────────────

def main() -> None:
    posts = load_list("blog/eng/posts.js")
    posts.sort(key=lambda p: p["date"], reverse=True)
    projects = load_list("projects/projects.js")
    demos = load_list("demos/demos.js")

    assert_targets_exist(projects, "projects", "projects/projects.js")
    assert_targets_exist(demos, "demos", "demos/demos.js")
    assert_links_resolve(projects, "projects/projects.js", posts)
    assert_fragment_refs_resolve()

    update_index_html(posts, projects, demos)
    write_sitemap(posts, projects, demos)
    write_rss(posts)
    write_robots()
    print(
        f"Regenerated index.html, sitemap.xml, rss.xml, robots.txt from "
        f"{len(posts)} posts, {len(projects)} projects, {len(demos)} demos."
    )


if __name__ == "__main__":
    raise SystemExit(main())
