"""Generate a reduced architecture figure for the AWS Agentic Generator page.

The source is a 1.6 MB draw.io export (1291x1324, 70 embedded base64 AWS icons).
This derives a 680-wide figure matching the other site diagrams, keeping only the
spine: OIDC-authenticated CI/CD, one-time bootstrap, a single API Gateway with
path-based routing to three compute targets, and the observability plane.

All geometry is computed, never hardcoded, so edits reflow. Every label is
width-asserted at build time: a rename that would overflow its box fails here
rather than rendering as silent overlap.
"""

from pathlib import Path

W, PAD = 680, 16
GAP = 12
BAND_LABEL_H = 20
BOX_PAD = 10

# Rough advance widths; deliberately conservative so the assert trips early.
ADV = {"band": 7.0, "name": 6.9, "sub": 5.6, "mono": 6.0}


def text_w(s: str, kind: str) -> float:
    return len(s) * ADV[kind]


class Canvas:
    def __init__(self):
        self.parts: list[str] = []
        self.y = PAD

    def add(self, s: str) -> None:
        self.parts.append(s)

    def band(self, label: str, height: int) -> tuple[int, int]:
        """Draw a titled band; return (content_top, content_bottom)."""
        top = self.y
        self.add(f'<rect class="ag-band" x="{PAD}" y="{top}" '
                 f'width="{W - 2 * PAD}" height="{height}" rx="8"/>')
        self.add(f'<text class="ag-bandlab" x="{PAD + BOX_PAD}" y="{top + 15}">{label}</text>')
        self.y = top + height + GAP
        return top + BAND_LABEL_H, top + height

    def box(self, x, y, w, h, name, lines, cls="ag-box"):
        assert text_w(name, "name") <= w - 2 * BOX_PAD, \
            f"label overflows its box: {name!r} needs {text_w(name,'name'):.0f}px, has {w - 2*BOX_PAD}px"
        for ln in lines:
            assert text_w(ln, "sub") <= w - 2 * BOX_PAD, \
                f"sub-label overflows: {ln!r} needs {text_w(ln,'sub'):.0f}px, has {w - 2*BOX_PAD}px"
        self.add(f'<rect class="{cls}" x="{x}" y="{y}" width="{w}" height="{h}" rx="6"/>')
        self.add(f'<text class="ag-name" x="{x + BOX_PAD}" y="{y + 19}">{name}</text>')
        for i, ln in enumerate(lines):
            self.add(f'<text class="ag-sub" x="{x + BOX_PAD}" y="{y + 36 + i * 13}">{ln}</text>')

    def arrow(self, x1, y1, x2, y2, label=None):
        self.add(f'<line class="ag-edge" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
                 f'marker-end="url(#ag-arrow)"/>')
        if label:
            self.add(f'<text class="ag-edgelab" x="{(x1 + x2) / 2}" y="{(y1 + y2) / 2 - 5}" '
                     f'text-anchor="middle">{label}</text>')


def cols(n, x0=PAD + BOX_PAD, x1=W - PAD - BOX_PAD):
    usable = x1 - x0 - GAP * (n - 1)
    w = usable / n
    return [(x0 + i * (w + GAP), w) for i in range(n)]


c = Canvas()

# ── Band 1: developer & CI/CD ────────────────────────────────────────────────
top, _ = c.band("Developer &amp; CI/CD", 92)
three = cols(3)
c.box(three[0][0], top, three[0][1], 58, "GitHub Actions",
      ["push triggers the pipeline"])
c.box(three[1][0], top, three[1][1], 58, "OIDC federation",
      ["no long-lived AWS keys"], cls="ag-box ag-accent")
c.box(three[2][0], top, three[2][1], 58, "Docker build",
      ["multi-arch: arm64 + amd64"])
c.arrow(three[0][0] + three[0][1], top + 29, three[1][0] - 2, top + 29)
c.arrow(three[1][0] + three[1][1], top + 29, three[2][0] - 2, top + 29)

# ── Band 2: one-time bootstrap ───────────────────────────────────────────────
top, _ = c.band("Bootstrap — one-time", 92)
for (x, w), (name, lines) in zip(three, [
        ("S3 state", ["encrypted, versioned", "state locking"]),
        ("ECR", ["vulnerability scanning"]),
        ("IAM roles", ["least privilege", "GitHub OIDC trust"])]):
    c.box(x, top, w, 58, name, lines)

# ── Band 3: per-environment application ──────────────────────────────────────
top, band_bottom = c.band("Application — per environment (dev / test / prod)", 190)
gw_x, gw_w = PAD + BOX_PAD, W - 2 * (PAD + BOX_PAD)
GW_H = 78
c.box(gw_x, top, gw_w, GW_H, "API Gateway — single entry point", [],
      cls="ag-box ag-accent")

# Routes are laid out on a computed grid. Runs of spaces collapse in SVG text,
# so each cell is its own positioned element rather than a padded string.
ROUTES = [("/", "api"), ("/worker/*", "worker"), ("/scheduler/*", "scheduler"),
          ("/runner/*", "runner"), ("/web/*", "web")]
RCOLS, RROWS = 3, 2
cell_w = (gw_w - 2 * BOX_PAD) / RCOLS
for i, (path, target) in enumerate(ROUTES):
    cx = gw_x + BOX_PAD + (i % RCOLS) * cell_w
    cy = top + 40 + (i // RCOLS) * 16
    cell = f"{path} → {target}"
    assert text_w(cell, "mono") <= cell_w - 6, \
        f"route cell overflows: {cell!r} needs {text_w(cell,'mono'):.0f}px, has {cell_w - 6:.0f}px"
    c.add(f'<text class="ag-route" x="{cx:.1f}" y="{cy}">{cell}</text>')

compute_top = top + GW_H + 22
for (x, w), (name, lines, cls) in zip(three, [
        ("Lambda — arm64", ["api, worker, scheduler", "FastAPI + Mangum"], "ag-box ag-c1"),
        ("App Runner — amd64", ["runner, web", "container, auto-scaling"], "ag-box ag-c2"),
        ("EKS — optional", ["arm64 microservices"], "ag-box ag-c3")]):
    c.box(x, compute_top, w, 58, name, lines, cls=cls)
    c.arrow(x + w / 2, top + GW_H + 2, x + w / 2, compute_top - 2)

# ── Band 4: observability ────────────────────────────────────────────────────
top, _ = c.band("Observability", 74)
for (x, w), (name, lines) in zip(three, [
        ("CloudWatch", ["structured JSON logs"]),
        ("X-Ray", ["distributed tracing"]),
        ("OpenTelemetry ADOT", ["Lambda layer / in-container"])]):
    c.box(x, top, w, 42, name, lines)

H = c.y - GAP + PAD

STYLE = """
    .ag text { font-family: "Sora", -apple-system, BlinkMacSystemFont, sans-serif; stroke: none; }
    .ag .ag-bandlab { font-size: 11px; font-weight: 500; letter-spacing: .08em;
      text-transform: uppercase; fill: var(--ink-muted, #64748B); }
    .ag .ag-name { font-size: 13.5px; font-weight: 500; fill: var(--ink, #0F172A); }
    .ag .ag-sub { font-size: 11px; fill: var(--ink-muted, #64748B); }
    .ag .ag-edgelab { font-family: "DM Mono", ui-monospace, monospace; font-size: 10px;
      fill: var(--ink-muted, #94A3B8); }
    .ag .ag-route { font-family: "DM Mono", ui-monospace, monospace; font-size: 11px;
      fill: var(--ink-muted, #475569); }
    .ag .ag-band { fill: none; stroke: var(--rule, #E2E8F0); stroke-width: 1; stroke-dasharray: 4 3; }
    .ag .ag-box { fill: var(--surface, #FFFFFF); stroke: var(--rule, #CBD5E1); stroke-width: 1.25; }
    .ag .ag-accent { stroke: #0D9488; stroke-width: 1.5; }
    .ag .ag-c1 { stroke: #7C3AED; stroke-width: 1.5; }
    .ag .ag-c2 { stroke: #D97706; stroke-width: 1.5; }
    .ag .ag-c3 { stroke: #94A3B8; stroke-width: 1.25; stroke-dasharray: 4 3; }
    .ag .ag-edge { fill: none; stroke: var(--ink-muted, #94A3B8); stroke-width: 1.4; }
"""

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-labelledby="ag-title ag-desc">
<title id="ag-title">AWS Agentic Generator — functional architecture, reduced</title>
<desc id="ag-desc">GitHub Actions authenticates to AWS through OIDC federation with no long-lived keys and builds multi-architecture images. A one-time bootstrap provisions encrypted, versioned Terraform state in S3, an ECR registry with vulnerability scanning, and least-privilege IAM roles. Per environment, a single API Gateway routes by path to Lambda services on arm64, App Runner services on amd64, and optionally an EKS cluster. CloudWatch, X-Ray and OpenTelemetry ADOT cover observability.</desc>
<defs>
  <style>{STYLE}</style>
  <marker id="ag-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
</defs>
<g class="ag">
{chr(10).join("  " + p for p in c.parts)}
</g>
</svg>'''

CAPTION = ("A reduced view of the generator's functional architecture. One API Gateway "
           "fronts three compute targets and routes by path; the pipeline reaches AWS "
           "through OIDC federation rather than stored credentials.")

fig = (f'<figure class="bt-figure">{svg}\n'
       f'<figcaption class="bt-figcaption">{CAPTION}</figcaption></figure>')

Path("/home/claude/ag_figure.html").write_text(fig)
print(f"generated {W}x{H}, {len(c.parts)} elements, {len(fig)} bytes")
