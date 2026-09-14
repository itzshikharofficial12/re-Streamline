# API Guidelines

## Purpose

Define conventions for StreamLine APIs so frontend and services can work against predictable contracts.

## Principles

- Validate every external input.
- Enforce authorization server-side.
- Return predictable response shapes.
- Use appropriate HTTP status codes.
- Do not expose internal infrastructure details.
- Keep API contracts backward-compatible where practical.

## Domain-Oriented APIs

API functionality should map to product domains such as:

- auth
- users
- streams
- follows
- discovery
- moderation
- recordings
- analytics
- notifications

## Contracts

Shared request/response types and validation should live in:

```text
packages/types/
packages/validation/
```

Avoid duplicating contract definitions in multiple applications.

## Breaking Changes

Before changing or removing an API field:

1. Find consumers.
2. Update shared types.
3. Update tests.
4. Update documentation.
5. Explain the breaking change in the PR.

## Security

Never trust client-provided:

- user ownership
- roles
- moderator privileges
- stream ownership
- stream status

Authorization must be enforced by the server.
