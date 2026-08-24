/* AI Projects index — one entry per project page in this folder.
   Rendered into index.html by scripts/build_site.py (static, crawlable)
   and re-rendered client-side by assets/main.js.

   `status` is a short honest label shown as the card's eyebrow.
   Order here is the display order — there is no date sort. */
window.aiProjects = [
  {
    "slug": "buyer-team",
    "file": "buyer-team.html",
    "title": "Buyer Team",
    "description": "An autonomous multi-agent negotiation system that takes a purchase requisition from a tenant ERP and returns an issued purchase order. A deterministic Step Functions DAG owns the workflow shape and records every transition; six LLM agents supply judgment at fixed nodes, under runtime guardrails they cannot be prompted past — all inside a ten-cent-per-negotiation cost ceiling.",
    "tags": [
      "Multi-agent",
      "AgentCore",
      "Step Functions"
    ],
    "status": "Deployed · no live tenants",
    "stack": [
      "Step Functions",
      "Lambda",
      "Bedrock AgentCore",
      "Strands",
      "Amazon Nova",
      "DynamoDB",
      "Cedar",
      "Terraform"
    ],
    "links": [
      {
        "label": "Site",
        "href": "https://www.buyer-team.com"
      },
      {
        "label": "Write-ups",
        "href": "index.html#blog"
      }
    ]
  },
  {
    "slug": "atlas-counsel",
    "file": "atlas-counsel.html",
    "title": "ATLAS Counsel",
    "description": "A citation-first RAG agent that answers procurement-policy and contract questions. Every claim is bound to a retrievable source span by a type contract rather than a prompt request, the agent refuses when the corpus does not cover a question, and it escalates to a human across a stateless HTTP/MCP boundary when it is not sure.",
    "tags": [
      "RAG",
      "LangGraph",
      "MCP"
    ],
    "status": "Deployed",
    "stack": [
      "LangGraph",
      "scalable-mcp",
      "OpenSearch Serverless",
      "Qdrant",
      "FalkorDB",
      "OAuth 2.1",
      "Cognito",
      "FastAPI"
    ],
    "links": [
      {
        "label": "Write-up",
        "href": "blog/eng/atlas-counsel.html"
      },
      {
        "label": "MCP v2",
        "href": "blog/eng/atlas-counsel-mcp-v2-oauth.html"
      }
    ]
  },
  {
    "slug": "scalable-mcp",
    "file": "scalable-mcp.html",
    "title": "scalable-mcp",
    "description": "The auth, rate limiting, session lifecycle and sealed pause/resume convention that ATLAS Counsel's MCP server grew, extracted as a base other servers build on instead of re-deriving from the SDK's primitives. Current with the 2026-07-28 stateless transport revision and the stateful handshake before it — at the same endpoint, so adopting the new era costs older clients nothing.",
    "tags": [
      "MCP",
      "Open Source",
      "Library"
    ],
    "status": "On PyPI · v0.1.0",
    "stack": [
      "Python",
      "MCP SDK 2.x",
      "FastAPI",
      "Redis (optional)",
      "AES-256-GCM"
    ],
    "links": [
      {
        "label": "PyPI",
        "href": "https://pypi.org/project/scalable-mcp"
      },
      {
        "label": "GitHub",
        "href": "https://github.com/gpazevedo/scalable-mcp"
      },
      {
        "label": "Write-up",
        "href": "blog/eng/scalable-mcp.html"
      }
    ]
  },
  {
    "slug": "spring-genai",
    "file": "spring-genai.html",
    "title": "Spring GenAI",
    "description": "Can an organisation put its existing Java stack on a managed agent runtime without rewriting it in Python? Amazon Bedrock AgentCore's reference material assumes Python, so the path for a Spring Boot team is undocumented rather than unsupported — and that difference is where projects stall. The agent is deliberately trivial; the deliverable is proof that everything around it works.",
    "tags": [
      "Spring AI",
      "AgentCore",
      "Java"
    ],
    "status": "Deployed",
    "stack": [
      "Spring Boot 3",
      "Spring AI",
      "AgentCore Runtime",
      "Nova Lite",
      "Cognito",
      "ADOT / OTel",
      "Terraform"
    ],
    "links": [
      {
        "label": "GitHub",
        "href": "TODO"
      }
    ]
  },
  {
    "slug": "aws-agentic-generator",
    "file": "aws-agentic-generator.html",
    "title": "AWS Agentic Generator",
    "description": "A production-ready IaC template and code generator that deploys a Python application to AWS in under thirty minutes. A modular Terraform codebase puts Lambda, App Runner and EKS behind a single API Gateway with path-based routing, so adding the next service is one command rather than another bespoke stack.",
    "tags": [
      "Terraform",
      "IaC",
      "Open Source"
    ],
    "status": "Open source",
    "stack": [
      "Terraform",
      "GitHub Actions",
      "OIDC",
      "Lambda",
      "App Runner",
      "EKS",
      "FastAPI",
      "OpenTelemetry"
    ],
    "links": [
      {
        "label": "GitHub",
        "href": "TODO"
      }
    ]
  }
];
