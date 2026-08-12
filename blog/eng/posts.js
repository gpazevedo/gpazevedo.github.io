/* Engineering posts — newest first, sorted by `date` on render.
   Add one entry per file in this folder. Ties keep the order listed here. */
window.engPosts = [
  {
    "slug": "atlas-counsel-mcp-v2-oauth",
    "file": "atlas-counsel-mcp-v2-oauth.html",
    "title": "ATLAS Counsel MCP v2: an OAuth resource server built for broad exposure",
    "description": "An OAuth 2.1 resource server that cannot boot without a credential, cannot be told which tenant to act as, and cannot answer from a corpus the tenant never ingested.",
    "tags": ["MCP", "OAuth", "Multi-tenancy"],
    "date": "2026-08-07",
    "readingTime": 14
  },
  {
    "slug": "failure-handling",
    "file": "failure-handling.html",
    "title": "Designing for failure in a multi-agent procurement system",
    "description": "How six autonomous agents are built to fail, degrade, and recover without corrupting state or acting silently — the resilience patterns and the trade-offs behind them.",
    "tags": ["Reliability", "Architecture"],
    "date": "2026-08-06",
    "readingTime": 20
  },
  {
    "slug": "what-fails-next",
    "file": "what-fails-next.html",
    "title": "What Fails Next",
    "description": "Building an ingest client for 50 million records, one failure at a time — eleven stages, each one built because the previous version broke against something specific.",
    "tags": ["Scalable Consumer"],
    "date": "2026-08-03",
    "readingTime": 19
  },
  {
    "slug": "the-sink-was-a-lie",
    "file": "the-sink-was-a-lie.html",
    "title": "The Sink Was a Lie",
    "description": "What breaks when the destination stops being a stand-in: a real database, a dual write no ordering can save, CDC, an outbox that had to justify itself, and a benchmark that lied four times.",
    "tags": ["Scalable Producer"],
    "date": "2026-08-03",
    "readingTime": 16
  },
  {
    "slug": "atlas-counsel",
    "file": "atlas-counsel.html",
    "title": "Building ATLAS Counsel: grounding, escalation, and safety in a citation-first RAG agent",
    "description": "A LangGraph agent that cites every claim to a retrievable span, refuses when the corpus doesn't cover a question, and escalates to a human across a stateless HTTP/MCP boundary when it isn't sure.",
    "tags": ["RAG", "LangGraph", "AI Procurement"],
    "date": "2026-07-10",
    "readingTime": 15
  },
  {
    "slug": "why-we-chose-strands",
    "file": "why-we-chose-strands.html",
    "title": "How we decided to build Buyer Team",
    "description": "Why we built the procurement-negotiation agents on Strands instead of CrewAI, AutoGen, LangGraph, or a hand-rolled loop — and the one guarantee that decided it.",
    "tags": ["Agentic Frameworks", "Architecture Decision"],
    "date": "2026-06-09",
    "readingTime": 12
  },
  {
    "slug": "why-we-chose-agentcore",
    "file": "why-we-chose-agentcore.html",
    "title": "Why we chose Bedrock AgentCore — and what we turned down to get there",
    "description": "The runtime decision behind Buyer Team: AgentCore vs. ECS/Fargate, Lambda, and raw Bedrock — alternatives weighed, tradeoffs accepted, and the two constraints that decided it.",
    "tags": ["Infrastructure", "Architecture Decision"],
    "date": "2026-06-05",
    "readingTime": 10
  },
  {
    "slug": "durable-orchestration",
    "file": "durable-orchestration.html",
    "title": "Pause for four days, resume in five seconds: durable execution in a multi-agent system",
    "description": "How a procurement negotiation survives crashes, restarts, and a 96-hour approval pause — per-node DynamoDB checkpoints, idempotent resume, recovery locks, and the interrupt pattern.",
    "tags": ["Durability"],
    "date": "2026-05-29",
    "readingTime": 18
  },
  {
    "slug": "dag-vs-llm-planner",
    "file": "dag-vs-llm-planner.html",
    "title": "Why we chose a deterministic DAG over a pure LLM planner",
    "description": "Governance, not capability, is why autonomous negotiation needs a deterministic graph — not a free-running LLM.",
    "tags": ["Architecture"],
    "date": "2026-05-01",
    "readingTime": 10
  }
];
