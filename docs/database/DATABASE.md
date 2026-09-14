# Database Guidelines

## Technology

StreamLine uses PostgreSQL with Prisma as the primary database access layer.

## Ownership

Database access is centralized through:

```text
packages/database/
```

Applications and services should not create independent database clients without an explicit architectural reason.

## Initial Core Entities

The PRD explicitly identifies the Phase 1 base schema as:

- User
- Stream
- Follow

Additional domains are expected to grow as implementation progresses.

## Schema Changes

Every schema change should consider:

- existing data
- migrations
- indexes
- constraints
- relations
- query patterns
- backward compatibility

## Source of Truth

PostgreSQL should be the persistent source of truth for appropriate relational/business data.

Redis should generally be used for ephemeral state, coordination, counters, Pub/Sub, and caching where justified.

## Documentation

Significant schema changes should update this document and relevant architecture documentation.
