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
  procurement/posts.js  ← procurement post index
```

`/home/gpazevedo/blogs/` also holds a `medium/` folder for Medium-adapted versions of
these posts. Only this repo is published.

## Publishing a post

1. Copy the template into the right section and name it by slug:

   ```bash
   cp blog/_template.html blog/eng/my-post.html
   ```

2. Write the post. Component reference (callouts, layer stacks, eval grids, tables)
   is in the header comment of `blog/buyer-team-blog.css`.
3. Replace every placeholder: `POST TITLE`, `SLUG`, `SECTION`, `SECTION LABEL`,
   `TAG`, `YYYY-MM-DD`, `Month YYYY`, `N min read`, `ONE-SENTENCE DESCRIPTION`.
4. Flip the robots tag to `index, follow`.
5. Add an entry to the section's `posts.js` — this is what renders the card on the
   landing page:

   ```js
   window.engPosts = [
     {
       "order": 1,
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

   `tags[0]` is what shows on the card. Cards sort by `order` ascending.
6. Audit every internal link in the post — `related-posts-grid` cards must point at
   files that exist:

   ```bash
   cd blog/eng && for f in $(grep -o 'href="[^"]*\.html"' my-post.html | grep -v http | sed 's/href="//;s/"//'); do
     [ -f "$f" ] || echo "MISSING: $f"
   done
   ```

7. Commit and push. GitHub Pages deploys from the default branch.

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
