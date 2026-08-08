# gpazevedo.github.io

Personal site and blog. Static HTML, no build step, served by GitHub Pages.

## Layout

```text
index.html              ← landing: about + blog index
favicon.svg
assets/
  style.css             ← landing-page shell
  main.js               ← reveal animation, mobile nav, blog index rendering
  architect.jpg
blog/
  buyer-team-blog.css   ← post stylesheet (verbatim copy — see "Keeping CSS in sync")
  site-blog.css         ← personal-site additions on top of it
  blog.js               ← mobile nav for post pages
  _template.html        ← starting point for a new post
  eng/posts.js          ← engineering post index
```

`/home/gpazevedo/blogs/` also holds a `medium/` folder for Medium-adapted versions of
these posts. Only this repo is published.

## Publishing a post

1. Copy the template into `blog/eng/` and name it by slug:

   ```bash
   cp blog/_template.html blog/eng/my-post.html
   ```

2. Write the post. Component reference (callouts, layer stacks, eval grids, tables)
   is in the header comment of `blog/buyer-team-blog.css`.
3. Replace every placeholder: `POST TITLE`, `SLUG`, `SECTION`, `SECTION LABEL`,
   `TAG`, `YYYY-MM-DD`, `Month YYYY`, `N min read`, `ONE-SENTENCE DESCRIPTION`.
4. Flip the robots tag to `index, follow`.
5. Add an entry to `blog/eng/posts.js` — this is what renders the card on the
   landing page:

   ```js
   window.engPosts = [
     {
       "slug": "my-post",
       "file": "my-post.html",
       "title": "My post title",
       "description": "One-sentence description.",
       "tags": ["Architecture"],
       "date": "2026-08-10",
       "readingTime": 10
     }
   ];
   ```

   `tags[0]` is what shows on the card. Cards sort by `date` descending — newest
   first — so no manual ordering field is needed; same-date posts keep the order
   they are listed in.
6. Audit every internal link in the post — `related-posts-grid` cards must point at
   files that exist:

   ```bash
   cd blog/eng && for f in $(grep -o 'href="[^"]*\.html"' my-post.html | grep -v http | sed 's/href="//;s/"//'); do
     [ -f "$f" ] || echo "MISSING: $f"
   done
   ```

7. Commit and push. GitHub Pages deploys from the default branch.

## Analytics

[GoatCounter](https://www.goatcounter.com/), hosted dashboard at
**https://gpazevedo.goatcounter.com** — private, login required, only you can read it.

`count.js` is **pinned and served from this repo** (`assets/count.js`) rather than loaded
from `gc.zgo.at`, so no third-party JavaScript runs on any page. Only the counting
beacon leaves the browser, and that endpoint returns no executable code. GoatCounter
supports this and guarantees `/count` stays backward-compatible; the cost is that the
pinned script does not receive upstream updates.

```
assets/count.js   sha256 792b7abd26c1fb6ae62906833e09a301251e2641816e69e4f95aba518f3fe3f0
```

To refresh it, re-download and re-record the hash:

```bash
curl -sS -o assets/count.js https://gc.zgo.at/count.js && sha256sum assets/count.js
```

The snippet sits before `</body>` in `index.html` and `blog/_template.html`, so every
post created from the template is counted automatically. Nothing else to wire up.

### What it records

Path, hour-level timestamp, country (from IP, country granularity only), referrer,
browser, OS, screen width, and a random session ID. **No IP addresses, no full
User-Agent, no tracker ID, no cookies** — so no cookie banner is required.

### Exact per-read timestamps

The dashboard aggregates to the hour. For second-level timestamps, enable
**Settings → Data collection → Individual pageviews** (off by default), then pull the
CSV export — those rows feed the export, not the dashboard.

### Reading the numbers honestly

Ad blockers block the beacon, and this audience runs them heavily. Counts are a
**floor and a trend line, not a census**. Local previews are not counted: `count.js`
skips `localhost` and `127.*` unless `allow_local` is set.

### Reverting to the CDN version

Replace the `src` in both files with `//gc.zgo.at/count.js` and delete
`assets/count.js`. Data and dashboard are unaffected.

## Keeping CSS in sync

`blog/buyer-team-blog.css` is a verbatim copy of the Buyer Team blog stylesheet. Keep
it byte-identical so it can be refreshed from upstream; put anything site-specific in
`blog/site-blog.css`.

```bash
cp ~/buyer-team/site/blog/buyer-team-blog.css blog/buyer-team-blog.css
```

## Local preview

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploying

The repo must be named **`gpazevedo.github.io`** on GitHub to serve at
`https://gpazevedo.github.io/`. Enable Pages under Settings → Pages → Deploy from
branch → `main` / `root`. `.nojekyll` keeps Pages from running Jekyll over the files.

If it is instead pushed as a project repo (e.g. `githubio`), the site serves at
`https://gpazevedo.github.io/githubio/`. All internal paths are relative, so both
work — but the absolute URLs in canonical/OG/JSON-LD tags would need updating.
