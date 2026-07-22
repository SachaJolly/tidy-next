# tidy-api Phases 2-4: Auth, API, Frontend Integration — Design

> **Purpose:** this design covers the scope and key decisions for the next three phases of the `tidy-api` build, so that detailed, agent-executable implementation plans (one per phase, same format as Phase 1's plan) can be written from it. These plans are meant for Alex to run — either herself or via an AI coding agent — as guides for the rest of the build, not as work this session will necessarily execute.

## Context

Phase 1 (`docs/superpowers/plans/2026-07-20-rails-api-foundations.md`) built the `tidy-api` Rails 8 API-only app: `User`/`List`/`ListCollaborator`/`Item` models, migrations, and seed data mirroring `tidy-next`'s mock JSON (`src/data/*.json`). It deliberately stopped short of controllers, routes, and CORS. That repo is now on GitHub at `https://github.com/julietteengel/tidy-api` (private).

`tidy-next` has no real HTTP mock API today — `src/app/api/{lists,items,users}/route.ts` are plain function modules (`getFeaturedLists()`, `getUserById()`, etc.) reading local JSON synchronously, imported and called **directly server-side** (and in one case client-side) by four pages. Phases 2-4 replace those direct calls with real HTTP calls to `tidy-api`, in three stages so each stage is independently reviewable and shippable:

**Actual current usage (verified by reading the four consuming pages, not just the route file names):**
- `discover/page.tsx` (server component): `getFeaturedLists().slice(0, 9)`, and `getPublicLists().sort((a, b) => b.notes - a.notes).slice(0, 32)` for "trending". Note: `notes` (`List#notes_count`) is always `0` today — no `Note` model exists yet (documented in Phase 1's README) — so this sort is currently a no-op; Phase 4's plan should flag this rather than silently replicate a meaningless sort.
- `dashboard/page.tsx` (**client** component, `"use client"`): `getDashboardLists(authorId)` with a **hardcoded** authorId (`"584348bf79a3c400042a5940"`, one of the 2 real seeded users). Being a client component matters for Phase 4: it can't import server-side data functions in a real deployed app once data lives in a DB — it needs an actual `fetch` from the browser, which is also exactly where the Phase 2 JWT needs to be available (client-side storage/context).
- `lists/[id]/page.tsx` (server, async): `getListWithItemsAndAuthor(id)` — a single composite call returning `{ list, items, author }` together.
- `users/[id]/page.tsx`: `getUserById(id)`.

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

**Goal:** expose exactly the five queries the frontend actually calls today (verified by reading the four consuming pages, not by assuming the route file names are real endpoints) — no generic CRUD, no more, no less — so Phase 4 is a pure plumbing change with minimal frontend logic changes.

**Endpoints (read-only, mapped 1:1 to the real usage above):**
- `GET /api/v1/lists/featured` — replaces `getFeaturedLists()`. Returns active, public, `is_featured: true` lists, most-recent-first (matches `List.featured` scope from Phase 1).
- `GET /api/v1/lists/public` — replaces `getPublicLists()`. Returns active, public lists, most-recent-first (matches `List.public_for_profile` scope from Phase 1). The frontend currently re-sorts this by `notes` client/server-side for "trending" — since `notes_count` is always `0` (no `Note` model yet), that re-sort is a no-op today; Phase 4's plan should call this out rather than silently port a meaningless sort.
- `GET /api/v1/lists/:id` — replaces `getListWithItemsAndAuthor(id)`. Returns a **composite** payload: `{ list: {...}, items: [...], author: {...} }`, items ordered by position, author being the list's `User`. This is one endpoint doing a join, not three separate ones, specifically to keep Phase 4 a near-zero-diff swap for `lists/[id]/page.tsx`.
- `GET /api/v1/me/lists` — replaces `getDashboardLists(authorId)`. Returns active lists for the **authenticated** user (matches `List.where(author_id: current_user.id, status: "ACTIVE")`, no visibility filter — dashboard shows the owner's own private lists too). **Must require authentication and must derive the author from the JWT (`current_user`), never from a client-supplied id/param** — an unauthenticated or client-parameterized version of this endpoint would let anyone read any user's private lists (IDOR). This is the one Phase 3 endpoint that needs an `Api::V1::BaseController` with `before_action :authenticate_user!`.
- `GET /api/v1/users/:id` — replaces `getUserById(id)`.

**Response shape:** must match the existing JSON shape the frontend already consumes (same key names/casing as `src/data/*.json` — e.g. `authorId` not `author_id`, `createdAt` not `created_at`) — this is what Phase 1's uppercase-enum-key convention exists to guarantee at the model layer; this phase's job is to not introduce a serializer that undoes that. The implementation plan should diff each endpoint's output against the corresponding shape in `src/data/*.json` / the TypeScript `List`/`Item`/`User` types in the four route files as its acceptance check — including the casing translation (Rails snake_case columns → the frontend's camelCase JSON keys), which needs an explicit serializer, not a bare `as_json`.

**Auth:** `lists/featured`, `lists/public`, `lists/:id`, and `users/:id` need no auth for parity with today's behavior (none of the four pages are behind a login wall yet). `me/lists` is the exception — see above, it must be authenticated. This phase creates `Api::V1::BaseController` (`before_action :authenticate_user!`) specifically for `me/lists` to inherit from; the other four controllers don't need it.

**CORS:** configure `rack-cors` (or Rails' built-in CORS support) to allow `http://localhost:3000` (tidy-next's dev origin) in development. Production origins are out of scope until a deploy phase exists.

**Testing:** request specs per endpoint, asserting against real seeded data (from Phase 1's seeds) and checking the response shape matches the equivalent `tidy-next` type/JSON shape, including key casing.

## Phase 4 — Frontend Integration

**Goal:** the four consuming pages call `tidy-api` for real; the local-JSON helper functions in `src/app/api/{lists,items,users}/route.ts` are retired.

**Approach:** replace each of the five call sites identified above with a `fetch` to the matching Phase 3 endpoint:
- `discover/page.tsx` (server component) — `fetch` can run server-side same as today; two calls (`/lists/featured`, `/lists/public`), keep the existing `.slice()` limits, drop the now-meaningless `.sort((a,b) => b.notes - a.notes)` (flag this removal explicitly rather than silently porting dead logic) or keep it as a harmless no-op — the plan should pick one and say why.
- `dashboard/page.tsx` (**client** component) — this is the one call site that changes shape, not just source: it needs the Phase 2 JWT available client-side (from wherever Phase 2/this phase decides to store it after login — e.g. `localStorage`, read in a `useEffect`/client hook) attached as `Authorization: Bearer <token>` on the `fetch` to `/api/v1/me/lists` — no id passed at all, the API derives the user from the token. If Phase 2's login flow isn't wired into any UI yet by the time this phase runs, there's no JWT to attach yet; the plan should decide whether to build a minimal login form as part of this phase (needed to obtain a real token) or use a manually-obtained token (e.g. via `curl`/Postman against Phase 2's endpoint, pasted into `localStorage` for local dev) as a documented stopgap — don't silently call the endpoint with no token and let it 401 unexplained.
- `lists/[id]/page.tsx` (server, async) — one `fetch` to `/lists/:id`, response already shaped as `{ list, items, author }`, matching the current destructuring almost exactly.
- `users/[id]/page.tsx` — one `fetch` to `/users/:id`.

A new env var (`TIDY_API_URL`, e.g. `http://localhost:3001` in dev) configures the target. No fallback to the JSON files — if `tidy-api` isn't running, the pages should surface a real error, not silently degrade, so a broken integration is loud during development rather than masked.

**Out of scope:** deployment/production `TIDY_API_URL` configuration (no deploy phase exists yet), a real login UI/flow for `dashboard/page.tsx` beyond what's needed to unblock its `fetch` (a minimal login form is in scope only if the plan decides the hardcoded-id stopgap isn't acceptable), removing `src/data/*.json` and the now-unused route files from the repo entirely (the plan should decide whether to delete them or keep them as reference — flag as an open question for that plan rather than deciding here).

**Testing:** update/replace `tidy-next`'s existing tests that depended on the mock JSON (if any assert against `src/data/*.json` directly) to either mock the `fetch` call or run against a real local `tidy-api` instance — the implementation plan should pick one and be explicit about it.

## Deliverables

Three implementation plans, same format as Phase 1's (`docs/superpowers/plans/2026-07-20-rails-api-foundations.md`), written to `docs/superpowers/plans/`:
- `2026-07-21-tidy-api-auth-endpoints.md` (Phase 2)
- `2026-07-21-tidy-api-json-endpoints.md` (Phase 3)
- `2026-07-21-tidy-next-frontend-integration.md` (Phase 4)

Each plan is self-contained and independently executable (Phase 3 depends on Phase 2 existing; Phase 4 depends on Phase 3 existing) by whoever picks it up next — most likely Alex, using her own AI coding agent session, following the same task-by-task/TDD structure Phase 1 used.
