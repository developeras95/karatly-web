# Changelog

All notable changes to karatly-web are listed here. Versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added (M1: rates)

- Rates page (`/rates`, in the navigation): today's rate per gram of pure metal for every metal, with how it was
  reached (spot + premium, source) and the rate for each purity; a warning when the newest rate is from an earlier day.
- Rate history chart per metal (30 days, 90 days, 1 year); click a metal's card to switch.
- "Enter a rate" dialog for manual rates (e.g. IBJA), with the same rules as the API and the API's field errors shown
  on the form.
- Premium over spot per metal, editable in place.
- Rate providers: status, requests used this month against the budget, last and next fetch, and the cache TTL.
- "Fetch now" button, with one line saying what each provider did.
- Pages are loaded on demand; the rates page carries MUI X Charts.
- New dependencies: `@mui/x-charts`, `react-hook-form`, `zod`, `@hookform/resolvers` (same versions as duewise-web).

### Added (M0: skeleton)

- Project skeleton: React 19, TypeScript, Vite, MUI with light and dark themes, TanStack Query, a typed API client
  generated from the API's OpenAPI document, Vitest + Testing Library + MSW, ESLint, Prettier, Docker image with
  nginx, CI.
- Dashboard showing the API and database status and the metals and weight units the API serves.
