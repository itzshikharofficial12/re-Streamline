# Git Workflow

## Branching

Do not work directly on `main` unless explicitly allowed by project maintainers.

Use:

```text
feat/<description>
fix/<description>
refactor/<description>
docs/<description>
test/<description>
chore/<description>
```

## Commits

Use:

```text
type: short description
```

Common types:

- `feat`
- `fix`
- `refactor`
- `docs`
- `test`
- `chore`
- `perf`

Keep commits small enough to understand and review.

## Pull Requests

A PR should normally represent one coherent piece of work.

Before opening a PR:

1. Rebase/update against the current target branch as appropriate.
2. Run relevant tests.
3. Run type checking/linting.
4. Review the complete diff.
5. Remove debugging code.
6. Update documentation if needed.

## Shared Files

If changing shared contracts such as:

- Prisma schema
- API response types
- validation schemas
- WebSocket events
- environment variables

communicate the change clearly in the PR.

## Dangerous Commands

Do not use destructive commands such as:

```bash
git reset --hard
git clean -fd
git push --force
```

unless explicitly authorized.

Never delete or overwrite another developer's work to resolve a local conflict.
