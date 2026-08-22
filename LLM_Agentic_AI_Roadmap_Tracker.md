# LLM & Agentic AI — Gap-Aware Master Roadmap (Tracker)

**Legend:** 🟢 Free video/doc · 🟣 Udemy (in your library, search title) · 🟡 Gap-fill callout · **[KEY]** = do not skip

---

## The 10 Pillars — Overview

| # | Pillar | Focus | Est. Length |
|---|--------|-------|-------------|
| 1 | Transformer & LLM Internals | How LLMs actually work (just enough theory) | ~2h |
| 2 | LLM App Fundamentals | Prompting, APIs, tool-calling, UIs, structured output | Udemy |
| 3 | RAG (Basic → Advanced) | Chunking, embeddings, hybrid search, reranking, RAGAS | ~4h |
| 4 | Fine-Tuning | LoRA/QLoRA, quantization, when to fine-tune vs RAG | ~1.5h |
| 5 | Agents & Design Patterns | ReAct, reflection, tool use, planning, multi-agent | ~8h |
| 6 | Context Engineering & Memory | Context window, short/long/episodic memory | ~1h |
| 7 | Frameworks | LangChain, LangGraph, CrewAI, OpenAI SDK, AutoGen | varies |
| 8 | MCP | Concepts, build server/client, sampling, security | ~4h |
| 9 | Evals & Observability | Objective vs LLM-judge, RAGAS, tracing | ~2h |
| 10 | Security | Full OWASP Top-10 for LLM + MCP-specific attacks | ~2h |

---

## Pillar 1 — Transformer & LLM Internals
*Goal: explain how an LLM works end-to-end without deep math. 3Blue1Brown chapters are the visual gold standard — watch in order.*

| ✅ | Subtopic | Resource | Length |
|---|----------|----------|--------|
| ☐ | Big-picture: what an LLM is | LLMs explained briefly — 3B1B (playlist) | 8m |
| ☐ | Full forward pass, embeddings, softmax | Ch.5 Transformers, the tech behind LLMs — 3B1B | 27m |
| ☐ | Attention: Q/K/V, masking, multi-head **[KEY]** | Ch.6 Attention, step-by-step — 3B1B | 26m |
| ☐ | How facts live in MLP layers (often skipped) | Ch.7 How might LLMs store facts — 3B1B | 23m |
| ☐ | Tokenization/BPE + positional encoding | Let's build GPT from scratch — Karpathy | 1h56m |

> 🟡 **Gap fill:** Most people only watch the attention video and miss (1) positional encoding — why order must be injected (Karpathy's build-GPT), (2) MLP/feed-forward layers store factual knowledge (3B1B Ch.7). Add both. Skip 3B1B Ch.1–4 (neural-net basics/backprop) unless you want them — not needed to build.

---

## Pillar 2 — LLM App Fundamentals
*Goal: go from "I can call an API" to "I can ship an LLM feature." Ed Donner's course (Ollama-first, laptop-friendly) is strongest here.*

| ✅ | Subtopic | Resource | Length |
|---|----------|----------|--------|
| ☐ | APIs, prompts, streaming, multi-provider | Ed Donner — LLM Engineering, Wks 1–2 (repo) | Udemy |
| ☐ | Tool / function calling | Ed Donner Wk2 + ReAct explainer | Udemy+6m |
| ☐ | Fast UIs (Gradio) | Ed Donner Wk2 | Udemy |
| ☐ | Open-source models & HuggingFace | Ed Donner Wk3 | Udemy |
| ☐ | Model selection / leaderboards | Ed Donner Wk4 | Udemy |
| ☐ | Structured output (JSON/Pydantic) | Structured outputs — OpenAI docs | read |

---

## Pillar 3 — RAG (Basic → Advanced → Eval)
*Goal: build RAG that works in production. Biggest hidden gap — basic tutorials stop at "embed + top-k," real systems need hybrid search, reranking, evaluation.*

**3a · Foundations**

| ✅ | Subtopic | Resource | Length |
|---|----------|----------|--------|
| ☐ | Why RAG; embeddings; vector DB; cosine **[KEY]** | RAG from First Principles — Ankit Bansal | 38m |
| ☐ | Build a real RAG app | Ed Donner — LLM Engineering, Wk5 (knowledge-worker) | Udemy |

**3b · Advanced retrieval (the gap)**

| ✅ | Subtopic | Resource | Length |
|---|----------|----------|--------|
| ☐ | Hybrid search: BM25 + dense + RRF | Production RAG w/ LangChain & Vector DBs — freeCodeCamp | 7h38m |
| ☐ | Reranking (cross-encoders/ColBERT) | Advanced RAG techniques — Field Guide to AI | 9m read |
| ☐ | Query transforms (HyDE, multi-query) | Advanced RAG: hybrid, reranking, query expansion | read |
| ☐ | Chunking: parent-child, sentence-window | 12 Advanced RAG Techniques (2026) — Atlan | read |
| ☐ | GraphRAG / RAPTOR / Contextual Retrieval | Same Atlan guide (techniques 8–12) | read |

**3c · RAG evaluation (RAGAS) [KEY]**

| ✅ | Subtopic | Resource | Length |
|---|----------|----------|--------|
| ☐ | Metrics: faithfulness, context precision/recall | RAG Evaluation, RAGAS explained — Logical Lenses | 12m |
| ☐ | RAGAS hands-on in Python | RAG Evaluation Metrics Tutorial — Analytics Vidhya | 6m |

> 🟡 **Gap fill:** Basic RAG scores ~44% factual accuracy; adding hybrid search + reranking pushes it toward ~63% (CRAG benchmark). Do NOT ship RAG without: (1) a reranker, (2) hybrid (BM25+dense) retrieval, (3) a RAGAS eval harness run in CI on every change. Rule of thumb: measure retrieval quality (context precision/recall) separately from generation quality (faithfulness).

---

## Pillar 4 — Fine-Tuning (LoRA/QLoRA)
*Goal: know when NOT to fine-tune, and how LoRA/QLoRA make it cheap. Optional for most app work — but a common interview topic.*

| ✅ | Subtopic | Resource | Length |
|---|----------|----------|--------|
| ☐ | The one rule: fine-tune = behavior, not knowledge **[KEY]** | How to Fine-Tune an LLM (2026) — read intro | read |
| ☐ | LoRA/QLoRA + rank, alpha, dropout, 4-bit NF4 | LoRA & QLoRA In-Depth — Mark Hennings | 15m |
| ☐ | Quick PEFT overview (LoRA/QLoRA/DoRA) | PEFT Explained — Arivu | 4m |
| ☐ | End-to-end deep dive + code | LoRA & QLoRA Explained Simply — Sunny Savita | 1h27m |
| ☐ | Fine-tune in the course | Ed Donner — LLM Engineering, Wks 6–7 | Udemy |

> 🟡 **Gap fill:** Interviewers love "RAG vs fine-tuning?" — RAG for fresh/changing facts & citations; fine-tuning for format, tone, domain vocabulary, reasoning style. Never fine-tune to "teach it your documents." Know QLoRA specifics: 4-bit NF4 quantization of the frozen base + small trainable low-rank adapters on the attention projections.

---

## Pillar 5 — Agents & Design Patterns
*Goal: understand agents from first principles (vendor-neutral) before frameworks. Andrew Ng's course is the backbone.*

| ✅ | Subtopic | Resource | Length |
|---|----------|----------|--------|
| ☐ | Agent vs workflow; ReAct loop **[KEY]** | AI Agents, Clearly Explained — Jeff Su | 10m |
| ☐ | ReAct in practice | ReAct Agents, clearly explained — Akshay Pachaar | 6m |
| ☐ | 4 patterns + evals (whole course) **[KEY]** | Agentic AI — Andrew Ng, DeepLearning.AI | 7h45m |
| ☐ | Reflection / Tool use / Planning / Multi-agent | Same course, Modules 2/3/1/5 · notes repo | incl. |
| ☐ | Build 8 agent projects | Ed Donner — Agentic AI Engineering (repo) | Udemy |

---

## Pillar 6 — Context Engineering & Memory
*Goal: the #1 skill for reliable agents in 2025–26, and almost always missing from course lists.*

| ✅ | Subtopic | Resource | Length |
|---|----------|----------|--------|
| ☐ | Context window as scarce RAM; write/select/compress/isolate **[KEY]** | Context Engineering for Agents — LangChain | 14m read |
| ☐ | Anthropic's mental model + failure modes | Effective context engineering — Anthropic | read |
| ☐ | Short vs long vs episodic memory | Context Engineering: LLM Memory & Retrieval — Weaviate | 22m read |
| ☐ | Memory taxonomy + tools (Mem0, Letta, Zep) | AI Agent Memory Explained — three layers | 8m read |

> 🟡 **Gap fill — why this matters:** Cognition & Anthropic both call context engineering "the #1 job of engineers building agents." Long runs cause context poisoning, distraction, confusion, and clash. Learn the four moves: write (persist), select (retrieve), compress (summarize/truncate), isolate (sub-agents). Memory = engineering you add: short-term (context window), long-term (vector store), episodic (log of past runs). Most production bugs live in the handoffs between these layers.

---

## Pillar 7 — Frameworks
*Goal: fluency in the tools that implement the patterns. Fix vocabulary first, then go deep on LangGraph (the one interviewers ask about most).*

| ✅ | Subtopic | Resource | Length |
|---|----------|----------|--------|
| ☐ | LangChain vs LangGraph vs LangSmith **[KEY]** | Stop Confusing LangChain/LangGraph/LangSmith — ByteMonk | 12m |
| ☐ | LangGraph: state, nodes, edges, memory, HITL | Krish Naik Bootcamp · free 10-hr | Udemy/11h |
| ☐ | LangGraph full free course | LangGraph complete course — freeCodeCamp | 3h |
| ☐ | CrewAI / OpenAI SDK / AutoGen / ADK | Ed Donner — Agentic AI Engineering (Wks 2–5) | Udemy |
| ☐ | Tracing & debugging (LangSmith) | LangSmith docs & walkthroughs | docs |

---

## Pillar 8 — Model Context Protocol (MCP)
*Goal: understand, build, AND secure MCP. Intro videos cover why/architecture but skip client-side primitives and the entire MCP security attack class.*

**8a · Concepts & build**

| ✅ | Subtopic | Resource | Length |
|---|----------|----------|--------|
| ☐ | Why MCP (2-min mental model) | How MCP actually works — Google Cloud Tech | 8m |
| ☐ | Why → Architecture → Lifecycle → Build | MCP Trilogy playlist — CampusX | 8 vids |
| ☐ | Full build: server+client, tools, resources, prompts, SAMPLING **[KEY]** | Ultimate MCP Crash Course — Web Dev Simplified | 1h15m |
| ☐ | Production server w/ FastMCP + auth | Production-Ready MCP Server in 90 min — codebasics | 1h42m |
| ☐ | Hands-on labs (multi-language) | MCP for Beginners — Microsoft (GitHub) | repo |
| ☐ | All-in-one course (incl. security) | Eden Marco — MCP Crash Course *or* Nikolai Schuler — Complete MCP Developer Guide (OAuth 2.1) | Udemy |

**8b · MCP security (the gap almost everyone misses) [KEY]**

| ✅ | Subtopic | Resource | Length |
|---|----------|----------|--------|
| ☐ | Tool poisoning, line jumping, rug pulls | MCP Tool Poisoning — OWASP Foundation | read |
| ☐ | Full threat model + defenses | MCP Security: Tool Poisoning threat model — Lens | read |
| ☐ | Auth, credential risk, CVEs | MCP Security Complete Guide — SentinelOne | read |

> 🟡 **Gap fill — MCP security:** The MCP spec explicitly does NOT enforce security. A malicious server can hide instructions in tool descriptions/responses that your model trusts as developer instructions (tool poisoning) — a supply-chain-style attack, worse than normal prompt injection. Defenses: treat servers like pinned dependencies (version + content hash), default read-only, re-approve after changes, sandbox execution, validate tool responses before they hit the context.

---

## Pillar 9 — Evals & Observability
*Goal: stop guess-and-tweak. Evaluation-driven development is the single biggest predictor of agent-building success (per Andrew Ng).*

| ✅ | Subtopic | Resource | Length |
|---|----------|----------|--------|
| ☐ | Objective vs LLM-judge; error analysis; traces **[KEY]** | Agentic AI — Module 4 (Andrew Ng) | in course |
| ☐ | RAG evals (RAGAS): faithfulness, precision, recall | RAG Evaluation, RAGAS explained — Logical Lenses | 12m |
| ☐ | RAGAS in code (run in CI) | RAGAS Evaluation Tutorial (local, no API) — write-up | read |
| ☐ | Tracing/observability in practice | LangSmith docs | docs |

> 🟡 **Gap fill:** Traditional metrics (BLEU/ROUGE) don't work for RAG/agents — they measure wording, not grounding. Use RAGAS (no human labels needed) and treat it like unit tests in CI. For agents: prefer a rubric with a binary score per behavior over a vague 1–10 LLM-judge.

---

## Pillar 10 — Security (Full OWASP Top-10 for LLM)
*Goal: know all ten risks, not just prompt injection. This is the biggest single-video gap — one injection video leaves 9 risks uncovered.*

| ✅ | Subtopic | Resource | Length |
|---|----------|----------|--------|
| ☐ | All 10 risks in 4 minutes (overview) **[KEY]** | OWASP Top-10 for LLM 2025, full overview — Giskard | 4m |
| ☐ | LLM01 Prompt Injection (direct/indirect) | OWASP LLM01 explained — IT Bulls | 25m |
| ☐ | Deep dive w/ real exploits & fixes | OWASP Top-10 for LLM deep dive — Ali Dorri | 30m |
| ☐ | Practitioner guide (every entry + controls) | OWASP Top-10 for LLM — Practical Guide | 18m read |
| ☐ | Full defensive course | OWASP Top 10 for LLM Applications: AI Security Explained | Udemy 13h |

> 🟡 **The 10 risks you must be able to name (LLM01–LLM10):**
> 01 Prompt Injection · 02 Sensitive Info Disclosure · 03 Supply Chain · 04 Data & Model Poisoning · 05 Improper Output Handling · 06 Excessive Agency · 07 System Prompt Leakage · 08 Vector & Embedding Weaknesses · 09 Misinformation · 10 Unbounded Consumption.
> Note: LLM08 (Vector & Embedding Weaknesses) is where RAG security lives, and LLM06 (Excessive Agency) is the agent/MCP risk — tie these back to Pillars 3 and 8.

---

## Suggested Sequence
*~1–1.5 hrs on weekday evenings. Free short videos = evening warm-ups; Udemy project weeks = the deeper blocks.*

| ✅ | Weeks | Focus | Resources |
|---|-------|-------|-----------|
| ☐ | 1–2 | Foundations | Pillar 1 (transformers, 4 videos) + Pillar 2 start (Ed Donner Wks 1–2) |
| ☐ | 3–5 | RAG **[KEY]** | Pillar 3 all (build in Wk5) + Pillar 9 RAGAS |
| ☐ | 6 | Fine-tuning (optional) | Pillar 4 — skim unless a role needs it |
| ☐ | 7–8 | Agents + Context | Pillar 5 (Andrew Ng) + Pillar 6 (context/memory) |
| ☐ | 9–11 | Frameworks | Pillar 7 — ByteMonk → LangGraph → multi-agent |
| ☐ | 12–13 | MCP + Security | Pillar 8 (build + security) + Pillar 10 (OWASP Top-10) |
| ☐ | 14–17 | Build & Ship | Ed Donner Agentic AI Engineering — deploy 2–3 projects |

---

## Portfolio (build one per phase)

| ✅ | Project |
|---|---------|
| ☐ | RAG knowledge-worker with hybrid search + reranking + RAGAS scores |
| ☐ | Multi-agent LangGraph system with memory + tracing |
| ☐ | MCP-powered agent (with a secured server) |
| ☐ | A deployed Career Digital Twin |

**Deliverable bar:** Clean READMEs (problem → approach → results → next) + a 2-min demo each. Deployed, demoable projects beat any certificate.

---

*Extracted from: LLM_Agentic_AI_Gap-Aware_Master_Roadmap.docx*
