/* Demos index — one entry per runnable demo page in this folder.
   Rendered into index.html by scripts/build_site.py (static, crawlable)
   and re-rendered client-side by assets/main.js.

   `file` must resolve to a real file under demos/ — scripts/build_site.py
   asserts this and fails the build rather than shipping a dead card.
   For a demo hosted elsewhere, use `href` instead of `file`. */
window.demos = [
  {
    "slug": "pr-to-po",
    "file": "pr-to-po.html",
    "title": "PR to PO: one spine, four negotiation strategies",
    "description": "Every negotiation takes the same path from purchase requisition to purchase order — the same six node Lambdas, the same order, the same checkpoints. The four Kraljic strategies differ in exactly one place. Walk the path one stage at a time and pick which strategy runs.",
    "tags": [
      "Buyer Team",
      "Interactive"
    ],
    "kind": "Interactive"
  },
  {
    "slug": "aws-architecture",
    "file": "aws-architecture.html",
    "title": "The same architecture, four negotiation strategies",
    "description": "Step through a negotiation across the deployed AWS architecture: Kraljic strategy, model tier, guardrails, approval gate, and the off-critical-path evaluation. Pick a strategy and a requisition value, then step or play the run.",
    "tags": [
      "Buyer Team",
      "Architecture"
    ],
    "kind": "Interactive"
  }
];
