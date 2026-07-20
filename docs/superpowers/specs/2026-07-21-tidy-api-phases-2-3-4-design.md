# tidy-api Phases 2-4: Auth, API, Frontend Integration — Design

> **Purpose:** this design covers the scope and key decisions for the next three phases of the `tidy-api` build, so that detailed, agent-executable implementation plans (one per phase, same format as Phase 1's plan) can be written from it. These plans are meant for Alex to run — either herself or via an AI coding agent — as guides for the rest of the build, not as work this session will necessarily execute.

## Context

Phase 1 (`docs/superpowers/plans/2026-07-20-rails-api-foundations.md`) built the `tidy-api` Rails 8 API-only app: `User`/`List`/`ListCollaborator`/`Item` models, migrations, and seed data mirroring `tidy-next`'s mock JSON (`src/data/*.json`). It deliberately stopped short of controllers, routes, and CORS. That repo is now on GitHub at `https://github.com/julietteengel/tidy-api` (private).

`tidy-next`'s current mock API (`src/app/api/{items,lists,users}/route.ts`) reads directly from local JSON files. Phases 2-4 replace that with a real Rails API, in three stages so each stage is independently reviewable and shippable:

- **Phase 2 — Auth endpoints:** turn the `User` model's existing Devise + JWT setup (Phase 1, model-level only) into real, callable login/signup/logout endpoints.
- **Phase 3 — API endpoints:** expose `List`/`Item`/`User` as read JSON endpoints, matching the current mock routes' shape exactly, protected by Phase 2's auth where relevant, with CORS so `tidy-next` can call it cross-origin in dev.
- **Phase 4 — Frontend integration:** point `tidy-next`'s existing API route handlers at `tidy-api` instead of the local JSON files, retiring the mocks.

## Phase 2 — Auth Endpoints

**Goal:** real, callable session lifecycle for `User`, stateless JWT via the `Authorization` header — no cookies, no CORS-with-credentials complexity, consistent with `tidy-api` being a fully separate origin from `tidy-next`.

**Endpoints:**
- `POST /api/v1/signup` — Devise registration, returns the created user + JWT.
- `POST /api/v1/login` — Devise session (`sessions#create`), returns the user + JWT in the `Authorization` response header (`warden-jwt_auth`'s default behavior once `devise_for` routes with the JWT dispatch/revocation requests configured — Phase 1 only set `jwt.secret`/`jwt.expiration_time`, this phase adds `jwt.dispatch_requests`/`revocation_requests`).
- `DELETE /api/v1/logout` — revokes the current JWT via the `JTIMatcher` strategy already on `User` (Phase 1).

**Shared infrastructure:** a base `Api::V1::BaseController` (or similar) with `before_action :authenticate_user!` available for Phase 3's protected endpoints to include — Phase 2 itself doesn't need any protected endpoint beyond logout (which by definition requires a valid token).

**Out of scope for this phase:** CORS (Phase 3, once there's a cross-origin caller), password reset/email confirmation flows (Devise modules exist on the model from Phase 1 but wiring their endpoints isn't needed yet), refresh tokens (`expiration_time` is 30 minutes per Phase 1 — revisit if that proves too short in practice).

**Testing:** request specs (this repo's first — Phase 1 only had model specs). Cover: signup creates a user + jti, login returns a valid JWT, a valid JWT can be used to hit a protected placeholder action, logout invalidates the JWT (a second request with the same token is rejected), invalid credentials are rejected with the right status code.

## Phase 3 — API Endpoints

**Goal:** expose exactly what the current mocks expose — no more, no less — so Phase 4 is a pure plumbing change with zero frontend logic changes.

**Endpoints (read-only, mirroring the current mock routes' behavior):**
- `GET /api/v1/lists` — mirrors `tidy-next/src/app/api/lists/route.ts` (152 lines: includes discover/featured filtering logic worth reading before writing this plan's task briefs).
- `GET /api/v1/lists/:id`
- `GET /api/v1/items` — mirrors `tidy-next/src/app/api/items/route.ts` (49 lines).
- `GET /api/v1/users` — mirrors `tidy-next/src/app/api/users/route.ts` (143 lines).
- `GET /api/v1/users/:id` — mirrors `tidy-next/src/app/api/users/[userId]/route.ts` (11 lines).

**Response shape:** must match the existing JSON shape the frontend already consumes (same key names/casing as `src/data/*.json`) — this is what Phase 1's uppercase-enum-key convention exists to guarantee at the model layer; this phase's job is to not introduce a serializer that undoes that (e.g. don't let a default `as_json` silently lowercase or rename anything the frontend depends on). Whichever serialization approach is used (plain `as_json`, `jbuilder`, or a small serializer class), the actual implementation plan should diff its output against the corresponding `src/data/*.json` shape as its acceptance check.

**Auth:** none of the mocked routes currently require auth, so none of these need `authenticate_user!` for parity — but wire the `Api::V1::BaseController` from Phase 2 in anyway so later phases (Phase 5+, out of scope here) can add write endpoints behind auth without restructuring.

**CORS:** configure `rack-cors` (or Rails' built-in CORS support) to allow `http://localhost:3000` (tidy-next's dev origin) in development. Production origins are out of scope until a deploy phase exists.

**Testing:** request specs per endpoint, asserting against real seeded data (from Phase 1's seeds) and checking the response shape matches the equivalent `tidy-next/src/data/*.json` record's keys.

## Phase 4 — Frontend Integration

**Goal:** `tidy-next` talks to `tidy-api` for real; the JSON mocks are retired.

**Approach:** each of `tidy-next/src/app/api/{lists,items,users}/route.ts` (and the `[userId]` variant) is rewritten to `fetch` the equivalent `tidy-api` endpoint and return its response, instead of reading `src/data/*.json`. A new env var (`TIDY_API_URL`, e.g. `http://localhost:3001` in dev) configures the target. No fallback to the JSON files — if `tidy-api` isn't running, the frontend routes should surface a real error, not silently degrade, so a broken integration is loud during development rather than masked.

**Out of scope:** deployment/production `TIDY_API_URL` configuration (no deploy phase exists yet), removing `src/data/*.json` from the repo entirely (the plan should decide whether to delete them or keep them as reference — flag as an open question for that plan rather than deciding here).

**Testing:** update/replace `tidy-next`'s existing tests that depended on the mock JSON (if any assert against `src/data/*.json` directly) to either mock the `fetch` call or run against a real local `tidy-api` instance — the implementation plan should pick one and be explicit about it.

## Deliverables

Three implementation plans, same format as Phase 1's (`docs/superpowers/plans/2026-07-20-rails-api-foundations.md`), written to `docs/superpowers/plans/`:
- `2026-07-21-tidy-api-auth-endpoints.md` (Phase 2)
- `2026-07-21-tidy-api-json-endpoints.md` (Phase 3)
- `2026-07-21-tidy-next-frontend-integration.md` (Phase 4)

Each plan is self-contained and independently executable (Phase 3 depends on Phase 2 existing; Phase 4 depends on Phase 3 existing) by whoever picks it up next — most likely Alex, using her own AI coding agent session, following the same task-by-task/TDD structure Phase 1 used.
