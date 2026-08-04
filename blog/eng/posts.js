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
  },
  {
    "order": 3,
    "slug": "dag-vs-llm-planner",
    "file": "dag-vs-llm-planner.html",
    "title": "Why we chose a deterministic DAG over a pure LLM planner",
    "description": "Governance, not capability, is why autonomous negotiation needs a deterministic graph — not a free-running LLM.",
    "tags": ["Architecture"],
    "date": "2026-05-01",
    "readingTime": 10
  },
  {
    "order": 4,
    "slug": "durable-orchestration",
    "file": "durable-orchestration.html",
    "title": "Pause for four days, resume in five seconds: durable execution in a multi-agent system",
    "description": "How a procurement negotiation survives crashes, restarts, and a 96-hour approval pause — per-node DynamoDB checkpoints, idempotent resume, recovery locks, and the interrupt pattern.",
    "tags": ["Reliability", "Durable Execution"],
    "date": "2026-05-29",
    "readingTime": 18
  },
  {
    "order": 5,
    "slug": "why-we-chose-agentcore",
    "file": "why-we-chose-agentcore.html",
    "title": "Why we chose Bedrock AgentCore — and what we turned down to get there",
    "description": "The runtime decision behind Buyer Team: AgentCore vs. ECS/Fargate, Lambda, and raw Bedrock — alternatives weighed, tradeoffs accepted, and the two constraints that decided it.",
    "tags": ["Infrastructure", "Architecture Decision"],
    "date": "2026-06-05",
    "readingTime": 10
  },
  {
    "order": 6,
    "slug": "why-we-chose-strands",
    "file": "why-we-chose-strands.html",
    "title": "How we decided to build Buyer Team",
    "description": "Why we built the procurement-negotiation agents on Strands instead of CrewAI, AutoGen, LangGraph, or a hand-rolled loop — and the one guarantee that decided it.",
    "tags": ["Agentic Frameworks", "Architecture Decision"],
    "date": "2026-06-09",
    "readingTime": 12
  }
];
