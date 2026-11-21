# karatly-web

The web app for **Karatly**: your precious metals, measured. It talks to
[karatly-api](../karatly-api); the plan, calculation rules and data model are in the API's
[docs/requirements-and-design.md](../karatly-api/docs/requirements-and-design.md).

> Status: **skeleton (milestone M0)**. A dashboard that shows the API status and the reference data it serves.

## Stack

React 19 · TypeScript · Vite · MUI · TanStack Query · openapi-fetch (typed client) · Vitest + Testing Library + MSW

## Run it

You need Node.js 22, and the API running on http://localhost:8081 (see the API's README).

```bash
npm install
npm run dev        # http://localhost:5174, API calls are forwarded to http://localhost:8081
```

Everything in Docker instead (database, API built from `../karatly-api`, and this app behind nginx):

```bash
docker compose up -d --build     # http://localhost:3001
```

Ports 5174, 8081 and 3001 are chosen so Karatly runs next to Duewise without clashes.

## Scripts

| Script                            | What it does                                                          |
| --------------------------------- | --------------------------------------------------------------------- |
| `npm run dev`                     | Development server with hot reload                                    |
| `npm run build`                   | Type-check and build to `dist/`                                       |
| `npm test` / `npm run coverage`   | Tests (coverage gate: 75% lines, 60% branches)                        |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                     |
| `npm run fetch:api`               | Save the running API's OpenAPI document to `openapi/karatly-api.json` |
| `npm run generate:api`            | Regenerate `src/api/schema.d.ts` from that document                   |

After changing the API: `npm run fetch:api && npm run generate:api`. The TypeScript build then fails wherever
the web app no longer matches the API. (The OpenAPI document in the skeleton was written by hand; replace it
the first time the API runs.)

## Structure

```
src/
  api/          typed client, React Query hooks per API area, error handling
  components/   layout and shared components
  pages/        one folder per area as they arrive (holdings, transactions, rates)
  lib/          formatting helpers
  test/         MSW mock API and render helper
```

## Licence

Proprietary. The code is public to read, not to use. See [LICENSE](LICENSE).
