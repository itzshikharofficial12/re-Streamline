# StreamLine — AGENTS.md

> Repository-level instructions for AI coding agents working on StreamLine.

---

## 1. Purpose

This file defines the rules, architecture, conventions, and workflow that AI agents MUST follow when modifying the StreamLine repository.

StreamLine is an open-source live video streaming infrastructure platform.

The goal is not to build a simple video player.

StreamLine is intended to demonstrate how a real streaming platform receives, processes, distributes, manages, and analyzes live video experiences.

The platform includes:

- Creator streaming
- Stream ingestion
- Live video processing
- Adaptive HLS streaming
- Viewer experience
- Real-time chat
- Community moderation
- Stream discovery
- Recording and VOD
- Creator dashboard
- Streaming analytics
- Notifications
- Scalable infrastructure

The system is expected to be reliable, maintainable, scalable, secure, and contribution-friendly.

---

# 2. Core Agent Rules

AI agents working on this repository MUST follow these rules.

### Rule 1 — Understand before modifying

Before making changes:

1. Inspect the relevant repository structure.
2. Read the relevant documentation.
3. Identify the owning application/service/package.
4. Check existing implementations before creating new ones.
5. Understand dependencies and contracts.
6. Make the smallest reasonable change.

Do NOT immediately start writing code based only on the user's request.

---

### Rule 2 — Do not invent architecture

Do not introduce a new architectural pattern, framework, service, database, queue, dependency, or infrastructure component without a clear reason.

Prefer existing project patterns.

If a new architectural decision is genuinely required:

1. Explain why it is needed.
2. Identify alternatives.
3. Document the decision in `docs/decisions/`.
4. Update relevant architecture documentation.

---

### Rule 3 — Preserve service boundaries

Do not move logic between applications/services simply because it is convenient.

Respect the repository boundaries.

Primary boundaries:

```text
apps/
├── web/
└── api/

services/
├── media/
│   ├── ingest/
│   ├── transcoder/
│   └── recorder/
├── realtime/
└── analytics/

packages/
├── database/
├── auth/
├── config/
├── types/
├── validation/
├── ui/
└── utils/