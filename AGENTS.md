# Backend Agent Guide

## Stack

- Runtime: Node.js + TypeScript ESM.
- HTTP: Express 5.
- DB: PostgreSQL.
- ORM/query layer: Sequelize.
- Migrations: Umzug.
- Auth: Better Auth, mounted at `/api/auth/*`.

## Commands

```powershell
npm.cmd run build
npm.cmd run lint
npm.cmd run dev
npm.cmd run db:status
npm.cmd run db:migrate
npm.cmd run db:rollback
npm.cmd run db:create <migration-name>
```

Run build + lint before handing off code.

## Structure

```text
src/
  app.ts
  index.ts
  config/
    env.ts
    database.ts
  db/
    sequelize.ts
    migrator.ts
    migrate.ts
    models/
    migrations/
    seeders/
  lib/
    auth.ts
  middleware/
  modules/
    health/
    users/
  routes/
  utils/
```

Rules:

- Put feature code in `src/modules/<feature>/`.
- Keep route/controller/service/repository split.
- Keep Sequelize model files inside the feature module unless shared.
- Register shared DB/model wiring from `src/db/models/index.ts` when needed.
- Keep app-wide wiring in `src/app.ts`.

## Env

Real secrets stay in `.env`; do not commit them.

Tracked examples:

- `.env.example`
- `.env.docker.example`

Required runtime env:

```env
PORT=4000
NODE_ENV=development
DB_CLIENT=postgres
DB_HOST=
DB_PORT=5432
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_LOGGING=false
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:3000
```

Never put real host/user/password/secret values in example files.

## Auth

Better Auth config lives in:

```text
src/lib/auth.ts
```

Mounted in `src/app.ts` before `express.json()`:

```text
app.all("/api/auth/{*any}", toNodeHandler(auth));
```

Do not move `express.json()` before Better Auth. Better Auth parses its own body.

Frontend calls:

```text
POST /api/auth/sign-up/email
POST /api/auth/sign-in/email
POST /api/auth/sign-out
GET  /api/auth/ok
```

## Migrations

Migration files live in:

```text
src/db/migrations/
```

Create:

```powershell
npm.cmd run db:create add-something
```

Apply:

```powershell
npm.cmd run db:migrate
```

Status:

```powershell
npm.cmd run db:status
```

Rollback last migration:

```powershell
npm.cmd run db:rollback
```

Executed migrations are tracked in DB table:

```text
SequelizeMeta
```

Do not edit already-run/shared migrations. Add a new migration instead.

Current base migration creates Better Auth core tables:

```text
user
session
account
verification
```

## Logging

Request logger:

```text
src/middleware/request-logger.middleware.ts
```

Format:

```text
[timestamp] METHOD path status duration
```

Colors:

- green: `<400`
- yellow: `4xx`
- red: `5xx`

Sequelize SQL logging is controlled by:

```env
DB_LOGGING=true|false
```

## DB Safety

- Default DB operations should be read-only unless the task explicitly requires writes.
- Migrations write schema. Confirm target DB/env before running them.
- Do not run destructive rollback/drop/reset commands unless explicitly requested.
- Prefer parameterized queries when using raw SQL.

## API Pattern

For a module:

```text
modules/example/
  example.routes.ts
  example.controller.ts
  example.service.ts
  example.repository.ts
  example.model.ts
  example.types.ts
```

Flow:

```text
route -> controller -> service -> repository -> model/db
```

Mount feature routers in:

```text
src/routes/index.ts
```

Use `asyncHandler` from:

```text
src/utils/async-handler.ts
```

for async Express handlers that should go to error middleware.
