# Streamline Development Change Log

This file records every meaningful technical and architectural change made to Streamline throughout development. It provides an evolving, verifiable record of the platform's implementation history, architectural decisions, validation results, known limitations, and next steps without requiring developers or AI agents to mine Git commit logs or lost conversational context.

## Guidelines for Maintaining This Log

- **Mandatory Update:** Every task that introduces a meaningful change (architecture, feature, bug fix, refactor, documentation, infrastructure, security, testing) must append an entry before concluding.
- **Reverse Chronological:** Always add the newest entry at the top under `## Change Entries`.
- **Honest Validation:** Record actual commands executed and their real outcomes. Never claim that checks passed or builds succeeded if they failed or were not run.
- **Distinguish States:** When documenting tasks, clearly separate existing repository state, changes made during the current task, and proposed future changes.
- **Trivial Edits Excluded:** Do not log formatting-only edits, typo fixes, or trivial single-line changes unless they alter functional contracts or system behavior.

---

## Change Entries

### 2026-10-20 — Establish permanent development change log and agent workflow rules

- **Type:** Documentation / Process
- **Status:** Implemented
- **Reason:** Establish a permanent, standardized development change log (`docs/development/CHANGELOG.md`) and enforce its mandatory maintenance via `AGENTS.md` so that future contributors and AI agents maintain an unbroken record of project evolution, technical decisions, validation results, and unresolved risks.
- **Changes:**
  - Created `docs/development/CHANGELOG.md` with guidelines, required entry format, and historical records.
  - Updated `AGENTS.md` with `Rule 4 — Mandatory change logging`, detailing the 8 mandatory agent responsibilities for reading and updating the change log.
  - Updated `README.md` documentation index to list `docs/development/CHANGELOG.md`.
- **Files affected:**
  - `docs/development/CHANGELOG.md`
  - `AGENTS.md`
  - `README.md`
- **Decisions and trade-offs:**
  - Mandated that change logging occur in the same task as the implementation rather than in deferred cleanup passes, minimizing documentation drift and loss of context.
- **Validation:**
  - `git status` confirmed tracked changes and new files.
  - `git diff` reviewed for cleanliness and formatting.
- **Limitations / Risks:**
  - Requires continuous adherence by all contributors and AI agents working on the codebase.
- **Follow-up:**
  - Ensure all upcoming Milestone 1 implementation tasks update this log systematically.

### 2026-10-20 — Milestone 0: Architecture alignment and repository audit

- **Type:** Architecture / Documentation / Infrastructure Audit
- **Status:** Validated
- **Reason:** Resolve architectural contradictions in the initial documentation that assumed OBS/RTMP as the primary creator workflow, align the system design around browser-based broadcasting via Creator Studio (`getUserMedia()`, planned `getDisplayMedia()`), define the role of WebRTC signaling versus media transport, establish an accepted architectural decision record (ADR), and audit monorepo readiness.
- **Existing repository state:**
  - Documentation across `README.md`, `ARCHITECTURE.md`, `SYSTEM_FLOWS.md`, `STREAMING.md`, and `assets/architecture.svg` incorrectly positioned OBS and RTMP as the mandatory core broadcasting pipeline.
  - WebRTC, browser media capture APIs, and the distinction between signaling and raw media transport were unmentioned.
  - Monorepo consisted of empty skeleton directories (`apps/*`, `services/*`, `packages/*`, `infrastructure/*`, `tests/*`, `scripts/*`) containing only `.gitkeep` files.
  - No child package manifests (`package.json`), no lockfile (`pnpm-lock.yaml`), no TypeScript configurations (`tsconfig.json`), and no local Docker Compose definitions existed.
  - Host environment has Node.js `v24.9.0` and pnpm `9.0.0`, but lacks `docker` and `ffmpeg` in `PATH`. Root scripts invoking `turbo` failed due to missing local dependencies.
- **Changes made in this task:**
  - Created `docs/decisions/0001-browser-based-creator-studio-publishing.md` (ADR-0001) accepting browser-based WebRTC publishing and HLS viewer delivery as the primary architectural direction.
  - Updated `README.md` (core streaming path, components table, technology stack, repository layout, Phase 2 roadmap) to establish browser Creator Studio as primary and OBS/RTMP as an optional secondary ingest path.
  - Updated `docs/architecture/ARCHITECTURE.md` to specify the primary media flow, explicit WebRTC signaling role (session negotiation only, not video stream), and updated component ownership.
  - Updated `docs/architecture/SYSTEM_FLOWS.md` with multi-stage Live Streaming flows (Capture, Signaling, WebRTC Publishing, Media Routing, ABR Transcoding, HLS Packaging, Playback) and optional external RTMP flow.
  - Updated `docs/streaming/STREAMING.md` with Phase 2 end-to-end pipeline specifications and reliability considerations.
  - Updated `assets/architecture.svg` to visualize the browser Creator Studio, WebRTC transport, signaling coordination, MediaMTX gateway, FFmpeg ABR transcoding, MinIO/S3 storage, and `hls.js` viewer.
  - Added `MEDIAMTX_WEBRTC_URL` to `.env.example`.
- **Proposed future changes:**
  - Milestone 1: Initialize workspace packages, configure TypeScript and Turbo, set up local Docker Compose (PostgreSQL, Redis, MinIO, MediaMTX), and build a standalone FFmpeg-to-HLS playback proof of concept.
  - Milestone 2: Build the live ingest pipeline with browser WebRTC publishing to MediaMTX via WHIP and FFmpeg ABR transcoding.
- **Files affected:**
  - `docs/decisions/0001-browser-based-creator-studio-publishing.md`
  - `README.md`
  - `docs/architecture/ARCHITECTURE.md`
  - `docs/architecture/SYSTEM_FLOWS.md`
  - `docs/streaming/STREAMING.md`
  - `assets/architecture.svg`
  - `.env.example`
- **Decisions and trade-offs:**
  - Selected WebRTC for creator publishing to ensure zero desktop software installation requirements for broadcasters, sub-second uplink latency, and built-in network adaptation.
  - Selected HLS for viewer delivery to leverage standard HTTP caching over CDNs for cost-effective distribution to tens of thousands of concurrent viewers, accepting a 2–6 second glass-to-glass latency trade-off.
  - Retained OBS and RTMP strictly as an optional external ingest route for power users or hardware encoders.
- **Validation:**
  - `git status` passed (verified all modified and untracked files).
  - `node -v` passed (`v24.9.0`).
  - `pnpm -v` passed (`9.0.0`).
  - `docker -v` failed (`command not found: docker` — Docker missing from host PATH).
  - `ffmpeg -version` failed (`command not found: ffmpeg` — FFmpeg missing from host PATH).
  - `pnpm run lint` failed (`sh: turbo: command not found` — `turbo` binary missing from `node_modules`).
  - `pnpm run test` not run (depends on `turbo run test`, blocked by missing dependencies).
  - `pnpm run build` not run (depends on `turbo run build`, blocked by missing dependencies and empty workspace apps).
- **Limitations / Risks:**
  - Containerized MediaMTX WebRTC (WHIP) networking and candidate port mapping in local Docker environments must be proven.
  - WebRTC audio/video codec compatibility (browser Opus/VP8/H.264 vs HLS AAC/H.264) and transcoding overhead must be evaluated.
  - Restrictive NAT environments will require STUN/TURN relays for creator uplink.
- **Follow-up:**
  - Proceed to Milestone 1: Monorepo workspace scaffolding, local infrastructure configuration, and standalone HLS playback validation.
