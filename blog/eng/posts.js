/* Engineering posts — newest first, sorted by `date` on render.
   Add one entry per file in this folder. Ties keep the order listed here. */
window.engPosts = [
  {
    "slug": "oauth-resource-server-pattern",
    "file": "oauth-resource-server-pattern.html",
    "title": "No users table: the OAuth 2.0 resource server pattern, adapted",
    "description": "How a multi-agent AI procurement system became an OAuth 2.0 resource server — Cognito as OIDC relying party and federation hub, two principal types, two authorisation planes, and the architectural trade-offs along the way.",
    "tags": ["OAuth", "Identity", "Multi-tenancy"],
    "date": "2026-08-19",
    "readingTime": 14
  },
  {
    "slug": "deployment-rollout-rollback",
    "file": "deployment-rollout-rollback.html",
    "title": "Shipping Agents Safely: deployment, rollout, and rollback",
    "description": "How a multi-agent procurement platform deploys: immutable promotion, a monitoring-only observation window, tenant-scoped variant routing, and two different things both called rollback.",
    "tags": ["Deployment", "GitOps"],
    "date": "2026-08-19",
    "readingTime": 23
  },
  {
    "slug": "evaluation",
    "file": "evaluation.html",
    "title": "Not a Testing Problem: how a multi-agent system evaluates itself in production",
    "description": "The evaluation architecture behind an autonomous multi-agent procurement system: three evaluator types, a 25-point quality composite, risk-tiered sampling, and alarms wired to five automated remediations — plus the gaps still open.",
    "tags": ["Evaluation", "Quality"],
    "date": "2026-08-19",
    "readingTime": 15
  },
  {
    "slug": "security-without-trust",
    "file": "security-without-trust.html",
    "title": "Security Without Trust: defending an autonomous negotiation agent",
    "description": "Six independent layers of deterministic, infrastructure-level control around an autonomous procurement agent \u2014 and an honest audit of which ones are as strong as they sound.",
    "tags": ["Security", "MITRE ATLAS", "Architecture"],
    "date": "2026-08-19",
    "readingTime": 28
  },
  {
    "slug": "no-silent-failures",
    "file": "no-silent-failures.html",
    "title": "Five tools, no silent failures: where Buyer Team handles failure",
    "description": "Buyer Team handles failure in exactly five places: the agent microkernel, a shared Lambda layer, a shared MCP base, the orchestrator resilience layer, and the AWS alarms. A mechanism-by-mechanism tour — and the silent failures that proved each tool necessary.",
    "tags": ["Reliability", "Architecture"],
    "date": "2026-08-19",
    "readingTime": 21
  },
  {
    "slug": "cost-architecture",
    "file": "cost-architecture.html",
    "title": "The cost architecture of an autonomous procurement agent",
    "description": "How Buyer Team keeps an AI procurement negotiation cheap — a 3-tier Nova model ladder with an automated rollback safety net, prompt caching with cross-tenant isolation designed in at the build boundary, a self-invalidating Kraljic classification cache, and context compaction — plus what a full live end-to-end suite actually costs, measured.",
    "tags": ["Cost Architecture", "FinOps"],
    "date": "2026-08-19",
    "readingTime": 18
  },
  {
    "slug": "architecture-and-design-patterns",
    "file": "architecture-and-design-patterns.html",
    "title": "One microkernel, six plug-ins: the patterns behind Buyer Team",
    "description": "A named-patterns tour of the Buyer Team agent runtime: a microkernel core with per-agent plug-ins, held together by Factory Method, two-phase Builder, Strategy, load shedding, and graceful drain — and an honest split between the guarantees the code enforces and the ones a CI test stands in for.",
    "tags": ["Architecture", "Design Patterns"],
    "date": "2026-08-19",
    "readingTime": 12
  },
  {
    "slug": "tenant-isolation-agent-attack-vector",
    "file": "tenant-isolation-agent-attack-vector.html",
    "title": "When the agent is the attack vector: extending tenant isolation beyond partition keys",
    "description": "How Buyer Team extended multi-tenant isolation when prompt injection became an active threat — JWT claim normalisation, a Gateway request interceptor, per-request ABAC, and a SQL rewriter that doesn't trust the agent.",
    "tags": ["Security", "Multi-tenancy"],
    "date": "2026-08-19",
    "readingTime": 15
  },
  {
    "slug": "scalable-mcp",
    "file": "scalable-mcp.html",
    "title": "scalable-mcp: a reusable base for MCP servers and clients, grown out of ATLAS Counsel",
    "description": "The auth, rate-limiting, session-lifecycle, and sealed continuation-token infrastructure ATLAS Counsel's MCP server grew, packaged as a base for building MCP servers and clients on the current protocol.",
    "tags": ["MCP", "Open Source", "Architecture"],
    "date": "2026-08-12",
    "readingTime": 9
  },
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
    "slug": "observability",
    "file": "observability.html",
    "title": "Observing the Unobservable: how a multi-agent system watches itself think",
    "description": "Agentic systems fail silently — they don't crash, they drift. The four-layer metric model, distributed tracing, three evaluator types, and alarm-to-action loop built to catch quality degradation before it costs a contract.",
    "tags": ["Observability", "Evaluation"],
    "date": "2026-08-19",
    "readingTime": 19
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
    "description": "The read half of a reference implementation for scalable ingestion: 50 million records, eleven stages, each one added because data volume outgrew the last.",
    "tags": ["Scalable Consumer"],
    "date": "2026-08-03",
    "readingTime": 19
  },
  {
    "slug": "the-sink-gets-real",
    "file": "the-sink-gets-real.html",
    "title": "The Sink Gets Real",
    "description": "The write half of the same reference implementation: a real database, CDC in place of an unsafe dual write, an outbox that had to earn its place, and a benchmark rig rebuilt until it could be trusted.",
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
