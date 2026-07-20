# tidy-next Frontend Integration with tidy-api (Phase 4/7) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** the four pages that currently import local-JSON-reading helper functions (`discover`, `dashboard`, `lists/[id]`, `users/[id]`) call the real `tidy-api` endpoints built in Phase 3 instead, over real HTTP. A minimal login page is added so `dashboard` (a client component needing a JWT) has a real way to obtain one.

**Architecture:** each of `tidy-next/src/app/api/{lists,items,users}/route.ts`'s data-fetching functions changes from a synchronous local-JSON read to an `async` `fetch` against `tidy-api`, keeping the same exported function names so each consuming page's call sites change as little as possible — the diff is "add `await`", not "rewrite the page." A shared `src/lib/tidy-api.ts` fetch helper centralizes the base URL and error handling so all five call sites don't duplicate it. `dashboard/page.tsx` (a client component) gets its JWT from `localStorage`, written there by a new minimal `/login` page — without a real login form, there is no way to obtain a token in the first place, so this phase includes exactly enough login UI to make the integration actually demonstrable end-to-end, not a full auth UI.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript. No new dependencies — plain `fetch`.

## Global Constraints

- Repos: this plan modifies `tidy-next` (`/Users/julietteengel/code/julietteengel/tidy-next`) and *requires* `tidy-api` (`/Users/julietteengel/code/julietteengel/tidy-api`, Phases 1-3) to be running locally on `http://localhost:3001` to test against.
- No fallback to `src/data/*.json` if `tidy-api` is unreachable — errors must surface (a thrown error / Next.js error boundary / explicit error state), not silently degrade to stale mock data. This was a deliberate design decision (see `docs/superpowers/specs/2026-07-21-tidy-api-phases-2-3-4-design.md`) so a broken integration is loud in dev, not masked.
- A new env var, `TIDY_API_URL`, configures the target (`http://localhost:3001` in dev) — added to a new `.env.local` (gitignored by Next.js's default `.gitignore`, so this doesn't need to be committed, and production values are out of scope until a deploy phase exists).
- `discover/page.tsx`'s existing `.sort((a, b) => b.notes - a.notes)` (for "trending") is a no-op today — `notes` (`List#notes_count`) is always `0`, no `Note` model exists yet (Phase 1 README). This plan removes that sort rather than silently porting dead logic forward — re-add it once a real notes feature exists.
- `src/data/*.json` and the now-unused JSON-reading code paths are **not deleted** in this plan — only the *call sites* change. Removing the mock JSON files is an explicit non-goal here (flagged as an open question in the design doc); deleting them is a separate, later cleanup.
- No changes to `src/app/api/users/[userId]/route.ts` (the one file with an actual HTTP `GET` handler) — it reads a different, unrelated file (`src/data.json`, not `src/data/users.json`) and looks like leftover scratch code (`parseInt` on what should be a string id) rather than something any page actually calls. Out of scope; don't "fix" it as a drive-by, and don't confuse it with `src/app/api/users/route.ts` (the one this plan does touch).
- Test framework: there is currently no test runner wired up for pages/routes in this repo (`package.json` has no `test` script; the one existing Jest test, `avatar-group.test.tsx`, covers a Storybook UI component, a different concern). This plan does not introduce a new test framework — verification is manual (dev server + browser/curl), documented per task.
- Environment: `tidy-api` must be running (`cd /Users/julietteengel/code/julietteengel/tidy-api && eval "$(rbenv init - zsh)" && bin/rails server -p 3001`) for any manual verification step in this plan.

---

### Task 1: Shared fetch helper and `TIDY_API_URL` config

**Files:**
- Create: `tidy-next/src/lib/tidy-api.ts`
- Create: `tidy-next/.env.local`

**Interfaces:**
- Produces: `tidyApiFetch<T>(path: string, init?: RequestInit): Promise<T>` — prefixes `path` with `process.env.TIDY_API_URL`, throws a descriptive `Error` on any non-2xx response or network failure (no swallowed errors, no fallback). Consumed by every later task in this plan.

- [ ] **Step 1: Add the env var**

Create `.env.local` in the repo root:

```
TIDY_API_URL=http://localhost:3001
```

(`.env.local` is in Next.js's default `.gitignore` — confirm with `git check-ignore .env.local`; if it's somehow not ignored, add it to `.gitignore` before committing anything else in this task.)

- [ ] **Step 2: Implement the fetch helper**

Create `src/lib/tidy-api.ts`:

```typescript
const BASE_URL = process.env.TIDY_API_URL;

export async function tidyApiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (!BASE_URL) {
    throw new Error(
      "TIDY_API_URL is not set — add it to .env.local (see tidy-api-frontend-integration plan Task 1)",
    );
  }

  const response = await fetch(`${BASE_URL}${path}`, init);

  if (!response.ok) {
    throw new Error(
      `tidy-api request to ${path} failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}
```

- [ ] **Step 3: Verify it against a running tidy-api**

```bash
cd /Users/julietteengel/code/julietteengel/tidy-api
eval "$(rbenv init - zsh)"
bin/rails server -p 3001 &
sleep 2
cd /Users/julietteengel/code/julietteengel/tidy-next
node -e "
require('dotenv').config({ path: '.env.local' });
" 2>&1 || true
```

There's no test runner to write an automated check against yet (see Global Constraints), so verify manually once Task 2 actually calls this helper from a real page — this step just confirms the server is reachable:

```bash
curl -s http://localhost:3001/api/v1/lists/featured -o /dev/null -w "%{http_code}\n"
```

Expected: `200`. Leave the `tidy-api` server running (or note the PID) for the remaining tasks' verification steps.

- [ ] **Step 4: Commit**

```bash
cd /Users/julietteengel/code/julietteengel/tidy-next
git add src/lib/tidy-api.ts .env.local .gitignore 2>/dev/null
git commit -m "feat: add tidy-api fetch helper and TIDY_API_URL config"
```

(If `.env.local` is gitignored as expected, `git add` will silently skip it — that's correct, don't force-add it.)

---

### Task 2: `discover/page.tsx` — featured and public lists

**Files:**
- Modify: `tidy-next/src/app/api/lists/route.ts`
- Modify: `tidy-next/src/app/discover/page.tsx`

**Interfaces:**
- Consumes: `tidyApiFetch` (Task 1), `GET /api/v1/lists/featured`, `GET /api/v1/lists/public` (tidy-api Phase 3).
- Produces: `getFeaturedLists(): Promise<List[]>`, `getPublicLists(): Promise<List[]>` — same names as before, now `async` and backed by real HTTP instead of local JSON. Every other exported function in this file (`getAllLists`, `getListsByAuthorId`, etc.) is untouched by this task — only the two functions `discover/page.tsx` actually calls change; the rest are unused by any of the four pages and are left as dead code for a later cleanup (see Global Constraints on `src/data/*.json`).

- [ ] **Step 1: Replace `getFeaturedLists` and `getPublicLists`**

Edit `src/app/api/lists/route.ts`. Replace these two function definitions:

```typescript
// Get public lists
export function getPublicLists(): List[] {
  return sortByDate(
    lists.filter(
      (list) => list.visibility === "PUBLIC" && list.status === "ACTIVE",
    ) as List[],
  );
}
```

and

```typescript
// Get featured lists
export function getFeaturedLists(): List[] {
  return sortByDate(
    lists.filter(
      (list) =>
        list.isFeatured &&
        list.status === "ACTIVE" &&
        list.visibility === "PUBLIC",
    ) as List[],
  );
}
```

with:

```typescript
// Get public lists (now backed by tidy-api, not local JSON)
export async function getPublicLists(): Promise<List[]> {
  return tidyApiFetch<List[]>("/api/v1/lists/public");
}

// Get featured lists (now backed by tidy-api, not local JSON)
export async function getFeaturedLists(): Promise<List[]> {
  return tidyApiFetch<List[]>("/api/v1/lists/featured");
}
```

Add the import at the top of the file:

```typescript
import { tidyApiFetch } from "@/lib/tidy-api";
```

Leave every other function in this file (the local-JSON-backed ones not touched by this task) exactly as-is for now.

- [ ] **Step 2: Update `discover/page.tsx` to await the now-async calls**

Edit `src/app/discover/page.tsx`. The component itself must become `async` since it now awaits network calls:

Replace:

```typescript
const Discover: React.FC = () => {
  const featuredLists = getFeaturedLists().slice(0, 9);
  const trendingLists = getPublicLists()
    .sort((a, b) => b.notes - a.notes)
    .slice(0, 32);
```

with:

```typescript
const Discover = async () => {
  const featuredLists = (await getFeaturedLists()).slice(0, 9);
  const trendingLists = (await getPublicLists()).slice(0, 32);
```

(The `.sort((a, b) => b.notes - a.notes)` is removed — see Global Constraints: `notes` is always `0` today, so this was already a no-op; `/lists/public` already returns most-recent-first from `tidy-api`, which is at least a meaningful order.)

Update the default export at the bottom of the file if it references `React.FC` typing incompatible with an async component — Next.js App Router server components support `async function` components natively; remove the `React.FC` type annotation from the `const Discover: React.FC = ...` declaration since `React.FC` doesn't model async components:

```typescript
export default Discover;
```

(unchanged — only the function declaration itself changes, not the export line).

- [ ] **Step 3: Verify manually**

```bash
cd /Users/julietteengel/code/julietteengel/tidy-next
npm run dev &
sleep 3
curl -s http://localhost:3000/discover -o /tmp/discover.html -w "%{http_code}\n"
grep -c "list-card" /tmp/discover.html
kill %1
```

Expected: `200`, and at least one `list-card`-related element present in the rendered HTML (confirms the page rendered with real data from `tidy-api`, not a crash). Also load `http://localhost:3000/discover` in a browser once to visually confirm featured/trending sections populate — this is the only end-to-end visual check this task has, given no test runner exists for pages yet.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/lists/route.ts src/app/discover/page.tsx
git commit -m "feat: fetch featured/public lists from tidy-api on the discover page"
```

---

### Task 3: `lists/[id]/page.tsx` — composite list detail

**Files:**
- Modify: `tidy-next/src/app/api/lists/route.ts`

**Interfaces:**
- Consumes: `tidyApiFetch` (Task 1), `GET /api/v1/lists/:id` (tidy-api Phase 3, composite response).
- Produces: `getListWithItemsAndAuthor(listId: string): Promise<{ list: List | null; items: Item[]; author: User | null }>` — same name and shape as before (it was already `async`), now backed by one HTTP call instead of three in-process lookups (`getListById` + `getListItems` + `getUserById`).

- [ ] **Step 1: Replace `getListWithItemsAndAuthor`**

Edit `src/app/api/lists/route.ts`. Replace:

```typescript
// Nouvelle fonction qui retourne tout en une seule requête
export async function getListWithItemsAndAuthor(listId: string) {
  // Récupérer la liste
  const list = getListById(listId);

  if (!list) {
    return { list: null, items: [], author: null };
  }

  // Utiliser Promise.all pour récupérer les items et l'auteur en parallèle
  const [itemsResponse, author] = await Promise.all([
    getListItems(listId),
    getUserById(list.authorId),
  ]);

  // Trier les items par position
  const sortedItems = itemsResponse.items.sort(
    (a, b) => a.ownership.position - b.ownership.position,
  );

  return {
    list,
    items: sortedItems,
    author,
  };
}
```

with:

```typescript
// Backed by tidy-api's composite /lists/:id endpoint (Phase 3) — one HTTP
// call instead of three separate in-process lookups.
export async function getListWithItemsAndAuthor(listId: string) {
  try {
    return await tidyApiFetch<{ list: List; items: Item[]; author: User }>(
      `/api/v1/lists/${listId}`,
    );
  } catch (error) {
    // tidy-api returns 404 for an unknown id — the page checks for a null
    // list to render notFound(), so translate any fetch failure into that
    // same shape rather than throwing (a genuinely unreachable tidy-api
    // should still throw — only a 404 is expected/handled here).
    if (error instanceof Error && error.message.includes("404")) {
      return { list: null, items: [], author: null };
    }
    throw error;
  }
}
```

Add these imports at the top of the file if not already present from Task 2:

```typescript
import { tidyApiFetch } from "@/lib/tidy-api";
import type { Item } from "../items/route";
import type { User } from "../users/route";
```

- [ ] **Step 2: Verify manually**

With `tidy-api` running (Task 1) and seeded (`bin/rails db:seed` if not already):

```bash
cd /Users/julietteengel/code/julietteengel/tidy-next
npm run dev &
sleep 3

# Get a real seeded list id from tidy-api directly:
LIST_ID=$(curl -s http://localhost:3001/api/v1/lists/public | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['id'])")

curl -s "http://localhost:3000/lists/$LIST_ID" -o /tmp/list.html -w "%{http_code}\n"
grep -o "<title>[^<]*</title>" /tmp/list.html

curl -s "http://localhost:3000/lists/00000000-0000-0000-0000-000000000000" -w "%{http_code}\n" -o /dev/null

kill %1
```

Expected: the real list id returns `200` with the list's actual title in `<title>`; the fake id returns Next.js's 404 status (confirms `notFound()` still fires correctly through the new fetch-based path).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/lists/route.ts
git commit -m "feat: fetch composite list detail from tidy-api"
```

---

### Task 4: `users/[id]/page.tsx` — user profile

**Files:**
- Modify: `tidy-next/src/app/api/users/route.ts`
- Modify: `tidy-next/src/app/users/[id]/page.tsx`

**Interfaces:**
- Consumes: `tidyApiFetch` (Task 1), `GET /api/v1/users/:id` (tidy-api Phase 3).
- Produces: `getUserById(id: string): Promise<User | undefined>` — same name, now `async`.

- [ ] **Step 1: Replace `getUserById`**

Edit `src/app/api/users/route.ts`. Replace:

```typescript
export function getUserById(id: string): User | undefined {
  return users.find((user) => user.id === id) as User | undefined;
}
```

with:

```typescript
export async function getUserById(id: string): Promise<User | undefined> {
  try {
    return await tidyApiFetch<User>(`/api/v1/users/${id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return undefined;
    }
    throw error;
  }
}
```

Add the import at the top of the file:

```typescript
import { tidyApiFetch } from "@/lib/tidy-api";
```

(This file's `User` type includes fields like `email`, `password`, `emailVerified*` that `tidy-api`'s `UserSerializer` deliberately never returns — Task 3 of the *json-endpoints* plan documents why. Those fields will simply be `undefined` at runtime on whatever `User` object this function returns; this task does not narrow the TypeScript type to match, since `users/[id]/page.tsx` only reads `.name`/`.bio`, which are both still present. Narrowing the type properly is a reasonable follow-up if a page ever needs one of the dropped fields — don't do it speculatively here.)

- [ ] **Step 2: Update `users/[id]/page.tsx`**

Edit `src/app/users/[id]/page.tsx`. Replace:

```typescript
export default function UserPage({ params }: UserPageProps) {
  const user = getUserById(params.id);
```

with:

```typescript
export default async function UserPage({ params }: UserPageProps) {
  const user = await getUserById(params.id);
```

- [ ] **Step 3: Verify manually**

```bash
cd /Users/julietteengel/code/julietteengel/tidy-next
npm run dev &
sleep 3

curl -s http://localhost:3000/users/584348bf79a3c400042a5940 -o /tmp/user.html -w "%{http_code}\n"
grep -o "<h1>[^<]*</h1>" /tmp/user.html

kill %1
```

Expected: `200`, `<h1>` containing the seeded user's real name ("Alexandra Jolly", per Phase 1's seed data).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/users/route.ts src/app/users/[id]/page.tsx
git commit -m "feat: fetch user profile from tidy-api"
```

---

### Task 5: Minimal login page

**Files:**
- Create: `tidy-next/src/app/login/page.tsx`

**Interfaces:**
- Produces: `/login` — a page with an email/password form that calls `tidy-api`'s `POST /api/v1/login` (Phase 2) directly (client-side, not through the `src/app/api/*/route.ts` helper files, since this isn't one of the five queries those files' functions model — it's a new, one-off call), stores the returned JWT in `localStorage` under the key `tidyApiToken`, and redirects to `/dashboard`. Consumed by Task 6 (`dashboard/page.tsx` reads `localStorage.getItem("tidyApiToken")`).

This is intentionally minimal — no signup UI, no password-reset UI, no styling beyond what's needed to be usable. Building a full auth UI is out of scope for this phase (see Global Constraints); this exists only to make `dashboard/page.tsx`'s integration (Task 6) genuinely testable end-to-end instead of requiring a manually-pasted token.

- [ ] **Step 1: Implement the login page**

Create `src/app/login/page.tsx`:

```typescript
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_TIDY_API_URL}/api/v1/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: { email, password } }),
      },
    );

    if (!response.ok) {
      setError("Invalid email or password.");
      return;
    }

    const token = response.headers.get("Authorization");
    if (!token) {
      setError("Login succeeded but no token was returned — this is a bug, not a user error.");
      return;
    }

    localStorage.setItem("tidyApiToken", token);
    router.push("/dashboard");
  };

  return (
    <div>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p role="alert">{error}</p>}
        <button type="submit">Log in</button>
      </form>
    </div>
  );
};

export default LoginPage;
```

Note the env var is `NEXT_PUBLIC_TIDY_API_URL`, not `TIDY_API_URL` — this fetch runs in the browser (`"use client"`), and only env vars prefixed `NEXT_PUBLIC_` are exposed to client-side code by Next.js. `TIDY_API_URL` (Task 1, server-side only) and `NEXT_PUBLIC_TIDY_API_URL` (this task, client-side) are two separate variables that happen to hold the same value in dev.

- [ ] **Step 2: Add the client-side env var**

Edit `.env.local` (created in Task 1), add:

```
NEXT_PUBLIC_TIDY_API_URL=http://localhost:3001
```

- [ ] **Step 3: Verify manually**

With `tidy-api` running and seeded, and a known password for a seeded user (Phase 1's seed sets every user's password to `"password123"`):

```bash
cd /Users/julietteengel/code/julietteengel/tidy-next
npm run dev &
sleep 3
```

Open `http://localhost:3000/login` in a browser, submit the seeded user's email (`alex.sacha.jolly@gmail.com`, per Phase 1's seed data) with password `password123`. Expected: redirect to `/dashboard`, and `localStorage.getItem("tidyApiToken")` (check via browser devtools console) holds a `Bearer ...` string.

```bash
kill %1
```

- [ ] **Step 4: Commit**

```bash
git add src/app/login/page.tsx .env.local
git commit -m "feat: add minimal login page storing the tidy-api JWT in localStorage"
```

---

### Task 6: `dashboard/page.tsx` — authenticated own-lists fetch

**Files:**
- Modify: `tidy-next/src/app/dashboard/page.tsx`
- Modify: `tidy-next/src/app/api/lists/route.ts`

**Interfaces:**
- Consumes: `GET /api/v1/me/lists` (tidy-api Phase 3, requires `Authorization` header), the `tidyApiToken` written to `localStorage` by Task 5's login page.
- Produces: `dashboard/page.tsx` renders the authenticated user's own lists, or redirects to `/login` if no token is present.

- [ ] **Step 1: Remove the hardcoded-author-id function** (no longer used once this task is done — leaving it would be dead code introduced by this same plan, unlike the pre-existing unused functions this plan otherwise leaves alone)

Edit `src/app/api/lists/route.ts`, remove:

```typescript
// Get all active lists by authorId for dashboard (including private lists for dashboard)
export function getDashboardLists(authorId: string): List[] {
  return lists.filter(
    (list) => list.authorId === authorId && list.status === "ACTIVE",
  ) as List[];
}
```

- [ ] **Step 2: Rewrite `dashboard/page.tsx`**

Replace the entire file:

```typescript
"use client";

import React, { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Page from "@/components/page/page";
import PageHeader from "@/components/page-header/page-header";
import CollectionList from "@/components/collection-list/collection-list";
import Section from "@/components/section/section";
import SectionHeader from "@/components/section-header/section-header";
import ListCard from "@/components/list-card/list-card";
import MetaGroup from "@/app/components/meta-group/meta-group";
import Meta from "@/app/components/meta/meta";
import { List } from "@/app/api/lists/route";

function Dashboard(): JSX.Element {
  const router = useRouter();
  const [lists, setLists] = useState<List[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("tidyApiToken");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_TIDY_API_URL}/api/v1/me/lists`, {
      headers: { Authorization: token },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load lists: ${response.status}`);
        }
        return response.json();
      })
      .then(setLists)
      .catch((err) => setError(err.message));
  }, [router]);

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (!lists) {
    return <p>Loading...</p>;
  }

  return (
    <Page>
      <PageHeader
        title="Dashboard"
        caption="Create, organise and collaborate on your lists and collections."
      >
      </PageHeader>
      <Section>
        <SectionHeader title="My lists">
          <MetaGroup>
            <Meta>Default collection</Meta>
            <Meta>Only public lists are visible to everyone</Meta>
          </MetaGroup>
        </SectionHeader>
        <CollectionList>
          {lists.map((list) => (
            <ListCard list={list} key={list.id} />
          ))}
        </CollectionList>
      </Section>
    </Page>
  );
}

export default Dashboard;
```

This doesn't use the shared `tidyApiFetch` helper (Task 1) — that helper is server-side only (`process.env.TIDY_API_URL`, no `NEXT_PUBLIC_` prefix, and it isn't marked for client bundling). Attaching the JWT and calling `tidy-api` directly from this client component with `fetch` and `NEXT_PUBLIC_TIDY_API_URL` is the correct, separate path for browser-side calls — don't try to force this through the server-side helper.

- [ ] **Step 3: Verify manually**

With `tidy-api` running and seeded:

```bash
cd /Users/julietteengel/code/julietteengel/tidy-next
npm run dev &
sleep 3
```

In a browser: visit `http://localhost:3000/dashboard` directly with no prior login — expect an immediate redirect to `/login`. Then log in via `/login` (Task 5) with a seeded user's credentials, confirm redirect to `/dashboard`, and confirm the page shows that user's own lists (not someone else's, not all lists).

```bash
kill %1
```

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/page.tsx src/app/api/lists/route.ts
git commit -m "feat: fetch the authenticated user's own lists on the dashboard"
```

---

### Task 7: End-to-end verification and cleanup notes

**Files:**
- Modify: `tidy-next/README.md`

**Interfaces:**
- None — this task verifies Tasks 1-6 hold together with both servers running simultaneously, and records what's intentionally left unfinished for whoever picks up the next phase.

- [ ] **Step 1: Run both servers together**

```bash
cd /Users/julietteengel/code/julietteengel/tidy-api
eval "$(rbenv init - zsh)"
bin/rails db:drop db:create db:migrate db:seed
bin/rails server -p 3001 &

cd /Users/julietteengel/code/julietteengel/tidy-next
npm run dev &
sleep 3
```

- [ ] **Step 2: Walk through every integrated page**

In a browser: `/discover` (featured + trending sections populate), `/lists/<a-real-seeded-id>` (list detail with items and author name), `/users/584348bf79a3c400042a5940` (profile with real name/bio), `/login` → log in → `/dashboard` (own lists only).

```bash
kill %1 %2
```

Expected: no page shows an unhandled error, no page silently falls back to stale/mock data (Global Constraints — that would indicate an accidental fallback path was left in somewhere).

- [ ] **Step 3: Document what's intentionally unfinished**

Add to `tidy-next/README.md` (create a "## Backend integration notes" section if one doesn't exist):

```markdown
## Backend integration notes (Phase 4)

- `/discover`, `/lists/:id`, `/users/:id`, and `/dashboard` now call `tidy-api`
  (must be running locally on `TIDY_API_URL`, default `http://localhost:3001`)
  instead of reading `src/data/*.json`. There is no fallback — if `tidy-api`
  is down, these pages error rather than silently showing stale mock data.
- `src/data/*.json` and most functions in `src/app/api/{lists,items,users}/route.ts`
  are now dead code (only `getFeaturedLists`, `getPublicLists`,
  `getListWithItemsAndAuthor`, `getUserById` are still used, and all four now
  call `tidy-api`). Deleting the unused files/functions is a deliberate
  follow-up, not done in this phase.
- `/login` is intentionally minimal (email/password, no signup/password-reset
  UI) — it exists only so `/dashboard` has a real way to obtain a JWT to test
  against. A real auth UI is future scope.
- `discover/page.tsx`'s "trending" section dropped its `notes`-count sort
  (always `0` today — no `Note` model exists in `tidy-api` yet); it now just
  shows public lists most-recent-first. Revisit once a real notes feature
  exists.
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: document Phase 4 frontend integration and its known gaps"
```
