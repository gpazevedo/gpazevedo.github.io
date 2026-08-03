/* Engineering posts — newest last (sorted by `order` on render).
   Add one entry per file in this folder. */
window.engPosts = [
  {
    "order": 1,
    "slug": "what-fails-next",
    "file": "what-fails-next.html",
    "title": "What Fails Next",
    "description": "Building an ingest client for 50 million records, one failure at a time — eleven stages, each one built because the previous version broke against something specific.",
    "tags": ["Distributed Systems"],
    "date": "2026-08-03",
    "readingTime": 19
  },
  {
    "order": 2,
    "slug": "the-sink-was-a-lie",
    "file": "the-sink-was-a-lie.html",
    "title": "The Sink Was a Lie",
    "description": "What breaks when the destination stops being a stand-in: a real database, a dual write no ordering can save, CDC, an outbox that had to justify itself, and a benchmark that lied four times.",
    "tags": ["Data Pipelines"],
    "date": "2026-08-03",
    "readingTime": 16
  }
];
