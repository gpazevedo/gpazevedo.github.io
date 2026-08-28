#!/usr/bin/env python3
"""Fail if "canary" or "rollback" appears without a qualifier.

Buyer Team has three mechanisms once called "canary" and three called "rollback".
The posts now name them: observation window / variant routing / canary, and
model-tier rollback / roll-forward / tag re-point / unpin.

This is the INVERSE of the check in the buyer-team-impl repo. There, the codebase
is huge and bare words are legitimate (AD-153's Synthetics canary, AD-034's
rollback), so only exact retired spellings are denied. Here the surface is a dozen
files of prose, every legitimate phrasing is enumerable, and the failure that
motivated this check was an *unqualified* use — a stale title and description left
behind in index.html, rss.xml and posts.js after the post itself was corrected.
A retired-spelling denylist would not have caught that. This does.

Stdlib only, no install step.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCAN = ["index.html", "rss.xml", "blog/eng/*.html", "blog/eng/posts.js", "blog/**/*.html"]

# Every sanctioned way the two words may appear. Anything else is a bare use.
ALLOWED = [
    # --- canary ---
    r"conventional canary",  # the generic industry concept
    r"traditional canary",
    r"a true \"send 10% of traffic to the new version\" canary",
    r"[Ss]ynthetics? [Cc]anary",  # AD-153 — owns the bare word
    r"synthetic-transaction canary",
    r"[Tt]he canary &mdash; the one that keeps the name",
    r"this canary in practice",
    r"this probe keeps the bare word",
    # Prose *about* the retired name, in the post whose subject is the collision.
    r"once called the \"canary\"",
    r"a second thing called \"canary\"",
    r"once also called \"canary\"",
    # --- rollback ---
    r"model-tier rollbacks?",
    r"rollback-as-forward-deploy",  # AD-054's named principle
    r"<code>Model rollback</code>",  # historical labels, in the passage that
    r"<code>Configuration rollback</code>",  # exists to say they were superseded
    r"were both once called rollback",
    r"both once called \"rollback\"",
    # --- not prose ---
    r"pill-rollback",  # CSS class
    r"deployment-rollout-rollback",  # published slug: indexed, must not move
]
ALLOWED_RE = re.compile("|".join(ALLOWED))
BARE_RE = re.compile(r"canary|rollback", re.IGNORECASE)


def files() -> list[Path]:
    seen: dict[Path, None] = {}
    for pat in SCAN:
        for p in sorted(ROOT.glob(pat)):
            if p.is_file():
                seen[p] = None
    return list(seen)


def main() -> int:
    hits = []
    for path in files():
        for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            if not BARE_RE.search(line):
                continue
            stripped = ALLOWED_RE.sub("", line)
            for m in BARE_RE.finditer(stripped):
                ctx = stripped[max(0, m.start() - 45) : m.end() + 35].strip()
                rel = path.relative_to(ROOT)
                hits.append(f"{rel}:{lineno}: unqualified '{m.group(0)}' — …{ctx}…")

    if hits:
        print(f"Unqualified naming ({len(hits)}). Say which mechanism you mean:\n")
        print("  canary   -> observation window (deploy) | variant (tenant) | canary (AD-153 probe only)")
        print("  rollback -> model-tier rollback | roll-forward | tag re-point | unpin\n")
        print("\n".join(f"  {h}" for h in hits))
        return 1

    print(f"naming ok — no unqualified uses across {len(files())} files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
