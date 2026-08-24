"""Scaffold a page for every entry in the three page-backed index files.

    uv run scripts/scaffold_pages.py

Covers projects/projects.js and demos/demos.js. (Replaces
scripts/new_project_pages.py, which only handled projects.)

Existing files are never overwritten — once a page has real content this script
leaves it alone and only fills in slugs that have no page yet. Run it after
adding an entry, then write the body. scripts/build_site.py asserts every
referenced file exists, so an unscaffolded entry fails the build.

Entries carrying an external `href` instead of a `file` are skipped: the page
lives somewhere else.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# ── shared shell ─────────────────────────────────────────────────────────────

HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="robots" content="index, follow"/>
<meta name="author" content="Gustavo Peixoto de Azevedo"/>
<title>{title} — Gustavo Peixoto de Azevedo</title>
<meta name="description" content="{description}"/>
<link rel="icon" type="image/svg+xml" href="../favicon.svg"/>
<meta name="theme-color" content="#0F172A"/>

<meta property="og:type" content="article"/>
<meta property="og:url" content="https://gpazevedo.github.io/{folder}/{file}"/>
<meta property="og:title" content="{title}"/>
<meta property="og:description" content="{description}"/>
<meta property="og:image" content="https://gpazevedo.github.io/assets/architect.jpg"/>
<meta name="twitter:card" content="summary"/>
<meta name="twitter:title" content="{title}"/>
<meta name="twitter:description" content="{description}"/>
<meta name="twitter:image" content="https://gpazevedo.github.io/assets/architect.jpg"/>

<script type="application/ld+json">{jsonld}</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Sora:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../blog/buyer-team-blog.css">
<link rel="stylesheet" href="../blog/site-blog.css">
{extra_head}</head>
<body>

<nav class="blog-nav">
  <a href="../index.html" class="blog-nav-logo">
    <span class="blog-nav-wm">Gustavo<span> Azevedo</span></span>
  </a>
  <ul class="blog-nav-links">
    <li><a href="../index.html">Home</a></li>
    <li><a href="../index.html#ai-projects">AI Projects</a></li>
    <li><a href="../index.html#blog">Blog</a></li>
  </ul>
  <div class="blog-nav-right">
    <button class="blog-nav-hamburger" aria-label="Menu"><span class="hb-open">☰</span><span class="hb-close">✕</span></button>
  </div>
</nav>

<article class="page">

  <div class="breadcrumb">
    <a href="../index.html#{back_hash}">{back_label}</a>
    <span class="sep">›</span>
    <span class="current">{title}</span>
  </div>

  <div class="eyebrow">
{eyebrow}  </div>

  <h1>{title}</h1>

  <p class="deck">{description}</p>
"""

TAIL = """
</article>

</body>
</html>
"""

PROJECT_BODY = """
  <hr>

  <h2>The problem</h2>
  <p>TODO — what business problem this system exists to solve, and why the
     obvious approach does not work.</p>

  <h2>Architecture</h2>
  <p>TODO — the shape of the system, and the one or two decisions that
     determined that shape.</p>

  <h2>Decisions and trade-offs</h2>
  <p>TODO — what was considered, what was chosen, what was given up.</p>

  <h2>What it cost, and what it is not</h2>
  <p>TODO — measured numbers, and an honest statement of scope limits.</p>

  <h2>Further reading</h2>
  <ul>
{reading}
  </ul>
"""

DEMO_EXTRA_HEAD = ""

DEMO_BODY = """
  <!-- PLACEHOLDER — replace this whole file with the self-contained player HTML.
       The page is wired into demos/demos.js and the sitemap; scripts/build_site.py
       asserts it exists, so do not delete it without removing the matching entry. -->
  <p>TODO — the player has not been published here yet.</p>
"""


def href_from_page(href: str) -> str:
    """Site-root-relative -> relative to a page inside projects/ or demos/."""
    if href.startswith(("http://", "https://", "#", "mailto:")) or href == "TODO":
        return href
    return "../" + href


def load_list(rel_path: str) -> list[dict]:
    text = (ROOT / rel_path).read_text()
    return json.loads(text[text.index("[") : text.rindex("]") + 1])


def eyebrow(parts: list[str]) -> str:
    out = []
    for i, part in enumerate(parts):
        if i:
            out.append('    <span class="dot">·</span>\n')
        out.append(f"    <span>{part}</span>\n")
    return "".join(out)


def jsonld_for(kind: str, item: dict, folder: str) -> str:
    return json.dumps(
        {
            "@context": "https://schema.org",
            "@type": kind,
            "name": item["title"],
            "description": item["description"],
            "author": {
                "@type": "Person",
                "name": "Gustavo Peixoto de Azevedo",
                "url": "https://gpazevedo.github.io/",
            },
            "url": f"https://gpazevedo.github.io/{folder}/{item['file']}",
            "keywords": ", ".join(item.get("tags", [])),
        },
        separators=(",", ":"),
    )


def write(folder: str, item: dict, *, back_hash, back_label, eyebrow_parts,
          jsonld_type, body, extra_head="") -> bool:
    target = ROOT / folder / item["file"]
    if target.exists():
        return False
    target.write_text(
        HEAD.format(
            title=item["title"],
            description=item["description"].replace('"', "&quot;"),
            folder=folder,
            file=item["file"],
            jsonld=jsonld_for(jsonld_type, item, folder),
            extra_head=extra_head,
            back_hash=back_hash,
            back_label=back_label,
            eyebrow=eyebrow(eyebrow_parts),
        )
        + body
        + TAIL
    )
    return True


def main() -> None:
    created = []

    for p in load_list("projects/projects.js"):
        if not p.get("file"):
            continue
        # links are stored site-root-relative (that is how the index card renders
        # them); a project page sits one level down, so relative ones need ../
        reading = "\n".join(
            f'    <li><a href="{href_from_page(l["href"])}">{l["label"]}</a></li>'
            for l in p.get("links", [])
        ) or "    <li>TODO — link the write-ups that go deeper.</li>"
        if write(
            "projects", p,
            back_hash="ai-projects", back_label="AI Projects",
            eyebrow_parts=["Project", p["tags"][0], p["status"]],
            jsonld_type="SoftwareSourceCode",
            body=PROJECT_BODY.format(reading=reading),
        ):
            created.append(f"projects/{p['file']}")

    for d in load_list("demos/demos.js"):
        if not d.get("file"):
            continue
        if write(
            "demos", d,
            back_hash="demos", back_label="Demos",
            eyebrow_parts=["Demo", d["kind"], d["tags"][0]],
            jsonld_type="SoftwareApplication",
            body=DEMO_BODY,
            extra_head=DEMO_EXTRA_HEAD,
        ):
            created.append(f"demos/{d['file']}")

    if created:
        print(f"Created {len(created)}:")
        for c in created:
            print(f"  {c}")
    else:
        print("Nothing to scaffold — every entry already has a page.")


if __name__ == "__main__":
    main()
