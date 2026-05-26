# flexy-booker-server

Server for the Flexy Booker app built with Node.js, Express, TypeScript, and PostgreSQL.

## Requirements

- Node.js 20+
- Docker and Docker Compose

## First setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3005

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=flexy_booker

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d

ADMIN_EMAIL=admin@email.com
ADMIN_PASSWORD=admin123
```

### 3. Start the database and run migrations

```bash
docker compose up -d
```

This starts PostgreSQL on port `5432` and runs all Flyway migrations automatically.

### 4. Seed the admin user

```bash
npx ts-node src/db/seedAdmin.ts
```

This creates the admin user (from `ADMIN_EMAIL` / `ADMIN_PASSWORD`), a linked demo business, and two demo services. Running it again is safe — it won't duplicate data.

### 5. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Development (with file watching + restart)
npm run dev:watch
```

The API will be available at `http://localhost:3005`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start in development mode |
| `npm run dev:watch` | Start with auto-restart on changes |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled build |
| `npm test` | Run tests |
| `npm run test:coverage` | Run tests with coverage report |

## Commit message format

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/) with a GitHub issue number as scope. This is enforced locally via Husky and on pull requests via GitHub Actions.

### Format

```
type(#issue): short description
```

### Valid examples

```bash
feat(#42): add availability endpoint
fix(#17): handle null session on logout
chore(#8): upgrade express to v5
refactor(#31): extract booking validator to separate module
docs(#5): add commit format to README
test(#23): add unit tests for auth middleware
```

### Invalid examples

```bash
feat: add something          # missing issue number
feat(FLEX-42): add something # wrong format, use #number
Add new feature              # missing type and issue
```

### Allowed types

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Maintenance, deps, tooling |
| `refactor` | Code change with no feature/fix |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |

## API docs

Interactive Swagger UI is available at `http://localhost:3005/api-docs` once the server is running.

To test protected endpoints:
1. Call `POST /api/auth/login` to get a token.
2. Click **Authorize** in the Swagger UI and paste the token.
