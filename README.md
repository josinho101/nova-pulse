# Nova Pulse

Pharmacy management application built with Next.js and TypeScript.

## Prerequisites

- Node.js (see `package.json` for supported versions)
- PostgreSQL running locally (or reachable), with a database created for this app

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and adjust values for your machine/environment:

   ```bash
   cp .env.example .env
   ```

   `.env` uses discrete connection fields rather than a single `DATABASE_URL`, so that special
   characters in the password (e.g. `#`) never need URL-encoding:

   ```
   PGHOST=localhost
   PGPORT=5432
   PGUSER=postgres
   PGPASSWORD=your-password
   PGDATABASE=NovaPulse
   ```

3. Create the database (name must match `PGDATABASE`):

   ```bash
   psql -U postgres -c "CREATE DATABASE \"NovaPulse\";"
   ```

4. Run database migrations (creates tables and stored procedures):

   ```bash
   npm run migrate:up
   ```

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Backend

API routes are versioned under `src/app/api/v1/`, backed by controllers in `src/server/`.

- `GET /api/v1/health` — returns service status and current system time.

## Database migrations

Migrations are managed with [`node-pg-migrate`](https://github.com/salsita/node-pg-migrate) and read
connection details from `.env` via `--envPath .env`.

- `npm run migrate:up` — applies all pending migrations
- `npm run migrate:down` — rolls back the most recent migration

### Generating a new migration

```bash
npm run migrate -- create some_migration_name
```

This creates a new timestamped file under `migrations/`, e.g.
`migrations/1748000004_some_migration_name.js`, pre-populated with empty `up`/`down` exports. Edit that
file to load your SQL from `db/tables/` or `db/procedures/` (see the existing files in `migrations/` for
the pattern), then run `npm run migrate:up` to apply it.

### Viewing migrations

- **Available migration files**: browse `migrations/` directly — each file's name is prefixed with its
  timestamp, so the directory listing is already in run order.
- **Which migrations have actually been applied**: `node-pg-migrate` records each applied migration as a
  row in the `pgmigrations` table inside the database itself. Query it directly, e.g.:

  ```bash
  psql -U postgres -d NovaPulse -c "SELECT * FROM pgmigrations ORDER BY run_on;"
  ```

  Only migrations present in that table have actually been run against the current database — the
  `migrations/` folder on disk may contain newer, not-yet-applied files.

### Directory layout

Schema and stored-procedure SQL is kept separate from the migration-runner plumbing so each can be
reviewed/diffed independently:

```
db/
  tables/       Table DDL (e.g. 001_create_user_types_table.sql, matching .down.sql for rollback)
  procedures/   Stored procedures / functions (e.g. 003_user_type_procedures.sql)
migrations/     node-pg-migrate runner files; each one loads and executes the matching file(s)
                under db/tables or db/procedures
```

To add a new table or procedure:

1. Add the SQL file(s) under `db/tables/` or `db/procedures/` (plus a `.down.sql` companion for rollback).
2. Add a migration file under `migrations/` (following the existing files as a template) that reads
   the SQL file(s) with `fs.readFileSync` and runs them via `pgm.sql(...)` for both `up` and `down`.
3. Run `npm run migrate:up`.

Business logic for CRUD operations lives in Postgres stored procedures (e.g. `sp_list_user_types`,
`sp_create_user_type`, ...), called from the corresponding store module (`src/server/store/*.store.ts`)
rather than embedding SQL directly in application code.

## Testing

```bash
npm test
```
