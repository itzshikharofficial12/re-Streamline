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
```

---

### Rule 4 — Mandatory change logging

Every developer and AI agent working on this repository MUST maintain [`docs/development/CHANGELOG.md`](docs/development/CHANGELOG.md).

Before and after every meaningful task:

1. **Read before working:** Read [`docs/development/CHANGELOG.md`](docs/development/CHANGELOG.md) before starting any meaningful implementation task to understand recent changes, active decisions, and known risks.
2. **Update upon completion:** Append a new entry to the change log immediately after meaningful changes have actually been made.
3. **Link architectural decisions:** Explicitly record any architectural decisions and cite their associated ADR file paths under `docs/decisions/`.
4. **Report files and validation honestly:** Explicitly list all affected repository files and document real command outputs and validation results (passed, failed, or not run, with precise reasons).
5. **Acknowledge blockers and incomplete work:** Document known limitations, risks, and unfinished items candidly rather than marking tasks complete prematurely.
6. **No fabricated status:** Never invent changes, test executions, commit hashes, mock outputs, or production readiness status.
7. **Reverse chronological order:** Place the newest entry at the top under `## Change Entries`, following the standard schema in the change log.
8. **Log in the same task:** Update the change log within the exact same pull request / task as the implementation itself — do not defer logging to later cleanup tasks.
