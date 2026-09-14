# Contributing to StreamLine

Thank you for contributing to StreamLine.

StreamLine is being developed as a collaborative, contribution-friendly open-source project. The repository is intentionally structured around clear domain and service boundaries.

## Before You Start

1. Read `AGENTS.md` if you are using an AI coding agent.
2. Read `docs/development/DEVELOPMENT.md`.
3. Read `docs/development/GIT_WORKFLOW.md`.
4. Check the relevant architecture documentation.
5. Check existing issues/PRs before starting substantial work.

## Principles

- Keep changes focused.
- Respect service and domain boundaries.
- Avoid unnecessary dependencies.
- Do not commit secrets.
- Add tests for meaningful behavior.
- Update documentation when behavior or architecture changes.
- Do not modify unrelated code.

## Branches

Use:

- `feat/<description>`
- `fix/<description>`
- `refactor/<description>`
- `docs/<description>`
- `test/<description>`
- `chore/<description>`

Example:

`feat/stream-creation`

## Commits

Use concise conventional-style commits:

- `feat: add stream creation`
- `fix: handle stream reconnect`
- `docs: document HLS pipeline`
- `test: add viewer presence tests`
- `refactor: simplify stream lifecycle`
- `chore: update tooling`

Keep commits logically focused.

## Pull Requests

Every PR should explain:

1. What changed?
2. Why was it needed?
3. What areas are affected?
4. How was it tested?
5. Are there architectural or API changes?
6. Is documentation updated?

Avoid combining unrelated work into one PR.

## AI-Assisted Contributions

AI tools are allowed and encouraged when used responsibly.

The contributor remains responsible for:

- understanding generated code
- reviewing every change
- validating correctness
- checking security implications
- running tests
- ensuring the change follows project architecture

Never submit AI-generated code blindly.
