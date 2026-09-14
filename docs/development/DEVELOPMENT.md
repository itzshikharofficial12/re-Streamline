# Development Guide

## Goal

Provide a predictable development workflow for every StreamLine contributor.

## Repository Layout

```text
apps/
  web/                 Next.js web application
  api/                 application/API server

services/
  media/               ingest, transcoding, recording
  realtime/            WebSockets, chat, presence
  analytics/           analytics processing

packages/
  database/            Prisma/database layer
  auth/                authentication/authorization
  config/              shared configuration
  types/               shared TypeScript contracts
  validation/          shared validation
  ui/                  shared UI components
  utils/               domain-agnostic utilities

infrastructure/        local/production infrastructure
scripts/               development/testing/media/database helpers
tests/                 integration/e2e/load/fixtures
docs/                  project documentation
```

## Development Rules

- Prefer existing patterns.
- Keep domain logic close to its domain.
- Keep shared packages genuinely shared.
- Do not create random top-level directories.
- Do not bypass validation or authorization to make development easier.
- Keep local development reproducible.

## Environment

Use `.env.example` as the source of required environment variable names.

Never commit real credentials.

## Testing

Depending on the change, run:

- type checking
- linting
- unit tests
- integration tests
- end-to-end tests
- build
- load tests for performance-sensitive infrastructure

## Definition of Done

A meaningful feature is complete only when:

- implementation is in the correct location
- relevant tests exist
- failure states are considered
- security/authorization is considered
- documentation is updated when necessary
- the diff contains no unrelated changes
