# tidy-api JSON Endpoints (Phase 3/7) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** expose the five read queries `tidy-next` actually calls today — `getFeaturedLists()`, `getPublicLists()`, `getListWithItemsAndAuthor(id)`, `getDashboardLists(authorId)`, `getUserById(id)` — as real `tidy-api` JSON endpoints under `/api/v1`, with a response shape matching what those call sites already expect, plus CORS so `tidy-next` (running on a different port) can call them.

**Architecture:** plain PORO serializer classes (`ListSerializer`, `ItemSerializer`, `UserSerializer`) map each model's snake_case columns to the camelCase JSON keys `tidy-next`'s existing code already reads (matching `src/data/*.json`'s shape) — no new gem dependency, just an `as_json` override per serializer, called by four thin controllers. One endpoint (`GET /api/v1/me/lists`, replacing the dashboard's currently-hardcoded author id) requires authentication and derives the user from the JWT minted in Phase 2 — never from a client-supplied id, to avoid exposing any user's private lists to anyone who guesses their id.

**Tech Stack:** Rails 8.1.3 (API-only), `rack-cors` (new dependency, currently commented out in the Gemfile), RSpec request specs + FactoryBot.

## Global Constraints

- Repo: `/Users/julietteengel/code/julietteengel/tidy-api`, existing app from Phases 1-2 — do not run `rails new` again.
- Response JSON keys are camelCase, matching `tidy-next/src/data/*.json` and the TypeScript types in `tidy-next/src/app/api/{lists,items,users}/route.ts` — not Rails' default snake_case `as_json`. Every serializer in this plan hand-maps keys; do not use bare `model.as_json` anywhere a response is rendered.
- `GET /api/v1/me/lists` **must** require authentication and **must** derive the list owner from `current_user`, never from a request parameter — this is a deliberate fix for an IDOR risk identified during design (see `docs/superpowers/specs/2026-07-21-tidy-api-phases-2-3-4-design.md`), not optional hardening.
- The other four endpoints (`lists/featured`, `lists/public`, `lists/:id`, `users/:id`) require no authentication, matching today's frontend behavior (none of the four consuming pages are behind a login wall yet).
- User serialization deliberately excludes `email`, anything password-related, and Devise's confirmation/reset tokens — this is a public-profile-shaped response, not an account-details response, even though the old mock's `getUserById()` returned those fields too (that was never actually safe to expose; this plan does not replicate the exposure).
- No write endpoints (`POST`/`PATCH`/`DELETE` for `List`/`Item`) in this plan — read-only, matching current frontend usage exactly.
- Test framework: RSpec request specs (`spec/requests/`), using FactoryBot-created records, not `db/seeds.rb` data (the test DB is independent of the dev seed).
- Environment: rbenv shims aren't on `PATH` by default in a fresh shell — run `eval "$(rbenv init - zsh)"` before any `ruby`/`rails`/`bundle` command. PostgreSQL runs locally via Homebrew (`postgresql@15`).

---

### Task 1: CORS configuration

**Files:**
- Modify: `tidy-api/Gemfile`
- Create: `tidy-api/config/initializers/cors.rb`
- Create: `tidy-api/spec/requests/cors_spec.rb`

**Interfaces:**
- Produces: CORS headers on any `/api/*` response for requests from `http://localhost:3000` — required for every other task in this plan to actually be callable from a browser running `tidy-next` in dev.

- [ ] **Step 1: Enable the `rack-cors` gem**

Edit `Gemfile`, find the commented-out line and uncomment it:

```ruby
gem "rack-cors"
```

```bash
eval "$(rbenv init - zsh)"
cd /Users/julietteengel/code/julietteengel/tidy-api
bundle install
```

- [ ] **Step 2: Write the failing request spec**

Create `spec/requests/cors_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "CORS", type: :request do
  it "allows cross-origin requests from the tidy-next dev origin" do
    get "/up", headers: { "Origin" => "http://localhost:3000" }

    expect(response.headers["Access-Control-Allow-Origin"]).to eq("http://localhost:3000")
  end

  it "does not allow an arbitrary origin" do
    get "/up", headers: { "Origin" => "http://evil.example.com" }

    expect(response.headers["Access-Control-Allow-Origin"]).to be_nil
  end
end
```

(Using the existing `/up` health-check route from Phase 1 as the target — CORS middleware applies before any controller-specific logic, so any route works for this check.)

- [ ] **Step 3: Run the spec, confirm it fails**

```bash
bundle exec rspec spec/requests/cors_spec.rb
```

Expected: both examples fail — no `Access-Control-Allow-Origin` header is present at all yet.

- [ ] **Step 4: Configure CORS**

Create `config/initializers/cors.rb`:

```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "http://localhost:3000"

    resource "/*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
```

- [ ] **Step 5: Run the spec, confirm it passes**

```bash
bundle exec rspec spec/requests/cors_spec.rb
```

Expected: `2 examples, 0 failures`.

- [ ] **Step 6: Run the full suite**

```bash
bundle exec rspec
```

Expected: all prior examples (30 from Phases 1-2) plus these 2, `0 failures`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: configure CORS for tidy-next dev origin"
```

---

### Task 2: List serializer, `GET /api/v1/lists/featured`, `GET /api/v1/lists/public`

**Files:**
- Create: `tidy-api/app/serializers/list_serializer.rb`
- Create: `tidy-api/app/controllers/api/v1/lists_controller.rb`
- Modify: `tidy-api/config/routes.rb`
- Create: `tidy-api/spec/requests/api/v1/lists_spec.rb`

**Interfaces:**
- Consumes: `List` model (Phase 1) — `List.featured` and `List.public_for_profile` scopes.
- Produces: `ListSerializer.new(list).as_json` → `{ id, title, description, status, visibility, displayMode, color, thumbnail, items, collaborators, notes, isOnDiscover, isFeatured, authorId, createdAt, updatedAt, deletedAt }` (matches `tidy-next`'s `List` TypeScript type in `src/app/api/lists/route.ts`). `GET /api/v1/lists/featured` and `GET /api/v1/lists/public` return `[ListSerializer, ...]` arrays. Consumed by Task 3 (reuses `ListSerializer` for the composite endpoint) and Task 5 (reuses it for `me/lists`).

- [ ] **Step 1: Write the failing request spec**

Create `spec/requests/api/v1/lists_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "Api::V1::Lists", type: :request do
  describe "GET /api/v1/lists/featured" do
    it "returns active, public, featured lists with the expected shape" do
      featured = create(:list, is_featured: true, is_on_discover: false)
      create(:list, is_featured: false) # not featured, excluded

      get "/api/v1/lists/featured"

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.map { |l| l["id"] }).to contain_exactly(featured.id)

      returned = body.first
      expect(returned.keys).to contain_exactly(
        "id", "title", "description", "status", "visibility", "displayMode",
        "color", "thumbnail", "items", "collaborators", "notes",
        "isOnDiscover", "isFeatured", "authorId", "createdAt", "updatedAt", "deletedAt"
      )
      expect(returned["authorId"]).to eq(featured.author_id)
      expect(returned["displayMode"]).to eq(featured.display_mode)
    end
  end

  describe "GET /api/v1/lists/public" do
    it "returns active, public lists" do
      public_list = create(:list, visibility: "PUBLIC")
      create(:list, visibility: "PRIVATE") # excluded

      get "/api/v1/lists/public"

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.map { |l| l["id"] }).to contain_exactly(public_list.id)
    end
  end
end
```

- [ ] **Step 2: Run the spec, confirm it fails**

```bash
eval "$(rbenv init - zsh)"
cd /Users/julietteengel/code/julietteengel/tidy-api
bundle exec rspec spec/requests/api/v1/lists_spec.rb
```

Expected: routing error (`No route matches [GET] "/api/v1/lists/featured"`).

- [ ] **Step 3: Add the routes**

Edit `config/routes.rb`, add inside the `Rails.application.routes.draw do ... end` block (after the `devise_for` line from Phase 2):

```ruby
  namespace :api do
    namespace :v1 do
      get "lists/featured", to: "lists#featured"
      get "lists/public", to: "lists#public_lists"
    end
  end
```

(`public_lists`, not `public` — `public` is a Ruby method-visibility keyword and can't be used as a controller action name without ambiguity. The URL segment stays `/lists/public`; only the Ruby-side action name differs.)

- [ ] **Step 4: Implement the serializer**

Create `app/serializers/list_serializer.rb`:

```ruby
class ListSerializer
  def initialize(list)
    @list = list
  end

  def as_json(*)
    {
      id: @list.id,
      title: @list.title,
      description: @list.description,
      status: @list.status,
      visibility: @list.visibility,
      displayMode: @list.display_mode,
      color: @list.color,
      thumbnail: @list.thumbnail,
      items: @list.items_count,
      collaborators: @list.collaborators_count,
      notes: @list.notes_count,
      isOnDiscover: @list.is_on_discover,
      isFeatured: @list.is_featured,
      authorId: @list.author_id,
      createdAt: @list.created_at,
      updatedAt: @list.updated_at,
      deletedAt: @list.deleted_at
    }
  end
end
```

Note: the `items` key is `items_count` (an integer), not the list's actual items — this matches `tidy-next`'s existing `List` type exactly (`items: number`). The composite endpoint in Task 3 returns the actual item records under a *different*, top-level `items` key in its own response — the two aren't the same field, just an unfortunately-reused name inherited from the original mock shape.

- [ ] **Step 5: Implement the controller**

Create `app/controllers/api/v1/lists_controller.rb`:

```ruby
class Api::V1::ListsController < ApplicationController
  def featured
    lists = List.featured
    render json: lists.map { |list| ListSerializer.new(list) }
  end

  def public_lists
    lists = List.public_for_profile
    render json: lists.map { |list| ListSerializer.new(list) }
  end
end
```

- [ ] **Step 6: Run the spec, confirm it passes**

```bash
bundle exec rspec spec/requests/api/v1/lists_spec.rb
```

Expected: `2 examples, 0 failures`.

- [ ] **Step 7: Run the full suite**

```bash
bundle exec rspec
```

Expected: `34 examples, 0 failures` (32 from Phases 1-2 + CORS, plus these 2).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add List serializer and featured/public list endpoints"
```

---

### Task 3: Item and User serializers, `GET /api/v1/lists/:id` composite endpoint

**Files:**
- Create: `tidy-api/app/serializers/item_serializer.rb`
- Create: `tidy-api/app/serializers/user_serializer.rb`
- Modify: `tidy-api/app/controllers/api/v1/lists_controller.rb`
- Modify: `tidy-api/config/routes.rb`
- Modify: `tidy-api/spec/requests/api/v1/lists_spec.rb`

**Interfaces:**
- Consumes: `List`, `Item`, `User` models (Phase 1); `ListSerializer` (Task 2).
- Produces: `ItemSerializer.new(item).as_json` → `{ id, title, caption, type, status, visibility, displayMode, content, ownership: { authorId, listId, position }, stats: { views, likes, comments }, timestamps: { createdAt, updatedAt, deletedAt } }` (matches `tidy-next`'s `Item` type). `UserSerializer.new(user).as_json` → `{ id, name, username, bio, status, role, avatar, cover, social: { website, twitter, github, linkedin }, stats: { listsCount, followersCount, followingCount }, createdAt, updatedAt, deletedAt }` — deliberately excludes `email`/password/confirmation-token fields (see Global Constraints). `GET /api/v1/lists/:id` returns `{ list: ListSerializer, items: [ItemSerializer, ...], author: UserSerializer }`, replacing `getListWithItemsAndAuthor(id)`. Consumed by Task 4 (`UserSerializer` reused for `users/:id`).

- [ ] **Step 1: Write the failing request spec**

Edit `spec/requests/api/v1/lists_spec.rb`, add a new `describe` block at the end (before the final `end`):

```ruby
  describe "GET /api/v1/lists/:id" do
    it "returns the list, its items ordered by position, and its author" do
      author = create(:user, name: "Alex Author")
      list = create(:list, author: author, title: "My List")
      second_item = create(:item, list: list, author: author, position: 1, title: "Second")
      first_item = create(:item, list: list, author: author, position: 0, title: "First")

      get "/api/v1/lists/#{list.id}"

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)

      expect(body["list"]["id"]).to eq(list.id)
      expect(body["author"]["name"]).to eq("Alex Author")
      expect(body["author"]).not_to have_key("email")

      expect(body["items"].map { |i| i["title"] }).to eq(["First", "Second"])
      expect(body["items"].first["ownership"]).to eq(
        "authorId" => author.id, "listId" => list.id, "position" => 0
      )
    end

    it "returns 404 for a list that doesn't exist" do
      get "/api/v1/lists/00000000-0000-0000-0000-000000000000"

      expect(response).to have_http_status(:not_found)
    end
  end
```

- [ ] **Step 2: Run the spec, confirm it fails**

```bash
eval "$(rbenv init - zsh)"
cd /Users/julietteengel/code/julietteengel/tidy-api
bundle exec rspec spec/requests/api/v1/lists_spec.rb
```

Expected: routing error (`No route matches [GET] "/api/v1/lists/<uuid>"`).

- [ ] **Step 3: Add the route**

Edit `config/routes.rb`, add `get "lists/:id", to: "lists#show"` **after** the `lists/featured` and `lists/public` lines added in Task 2 (order matters — a `:id` wildcard declared first would swallow `featured`/`public` as if they were an id):

```ruby
  namespace :api do
    namespace :v1 do
      get "lists/featured", to: "lists#featured"
      get "lists/public", to: "lists#public_lists"
      get "lists/:id", to: "lists#show"
    end
  end
```

- [ ] **Step 4: Implement the serializers**

Create `app/serializers/item_serializer.rb`:

```ruby
class ItemSerializer
  def initialize(item)
    @item = item
  end

  def as_json(*)
    {
      id: @item.id,
      title: @item.title,
      caption: @item.caption,
      type: @item.item_type,
      status: @item.status,
      visibility: @item.visibility,
      displayMode: @item.display_mode,
      content: @item.content,
      ownership: {
        authorId: @item.author_id,
        listId: @item.list_id,
        position: @item.position
      },
      stats: {
        views: @item.views_count,
        likes: @item.likes_count,
        comments: @item.comments_count
      },
      timestamps: {
        createdAt: @item.created_at,
        updatedAt: @item.updated_at,
        deletedAt: @item.deleted_at
      }
    }
  end
end
```

Create `app/serializers/user_serializer.rb`:

```ruby
class UserSerializer
  def initialize(user)
    @user = user
  end

  def as_json(*)
    {
      id: @user.id,
      name: @user.name,
      username: @user.username,
      bio: @user.bio,
      status: @user.status,
      role: @user.role,
      avatar: @user.avatar,
      cover: @user.cover,
      social: {
        website: @user.website,
        twitter: @user.twitter,
        github: @user.github,
        linkedin: @user.linkedin
      },
      stats: {
        listsCount: @user.lists_count,
        followersCount: @user.followers_count,
        followingCount: @user.following_count
      },
      createdAt: @user.created_at,
      updatedAt: @user.updated_at,
      deletedAt: @user.deleted_at
    }
  end
end
```

- [ ] **Step 5: Implement `#show`**

Edit `app/controllers/api/v1/lists_controller.rb`, add:

```ruby
  def show
    list = List.find(params[:id])
    items = list.items.ordered

    render json: {
      list: ListSerializer.new(list),
      items: items.map { |item| ItemSerializer.new(item) },
      author: UserSerializer.new(list.author)
    }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "List not found" }, status: :not_found
  end
```

(`list.items.ordered` uses the `-> { order(:position) }` default scope on `List#items` plus the `ordered` scope from `Item`, Phase 1 — either alone would already sort correctly; using `.ordered` here makes the ordering explicit at the call site rather than relying on the association's implicit default.)

- [ ] **Step 6: Run the spec, confirm it passes**

```bash
bundle exec rspec spec/requests/api/v1/lists_spec.rb
```

Expected: `4 examples, 0 failures`.

- [ ] **Step 7: Run the full suite**

```bash
bundle exec rspec
```

Expected: `36 examples, 0 failures`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add Item/User serializers and composite list-detail endpoint"
```

---

### Task 4: `GET /api/v1/users/:id`

**Files:**
- Create: `tidy-api/app/controllers/api/v1/users_controller.rb`
- Modify: `tidy-api/config/routes.rb`
- Create: `tidy-api/spec/requests/api/v1/users_spec.rb`

**Interfaces:**
- Consumes: `User` model, `UserSerializer` (Task 3).
- Produces: `GET /api/v1/users/:id` → `UserSerializer` JSON, or 404. Replaces `getUserById(id)`.

- [ ] **Step 1: Write the failing request spec**

Create `spec/requests/api/v1/users_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "Api::V1::Users", type: :request do
  describe "GET /api/v1/users/:id" do
    it "returns the user's public profile" do
      user = create(:user, name: "Profile Name", bio: "A short bio")

      get "/api/v1/users/#{user.id}"

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["name"]).to eq("Profile Name")
      expect(body["bio"]).to eq("A short bio")
      expect(body).not_to have_key("email")
      expect(body).not_to have_key("password")
    end

    it "returns 404 for a user that doesn't exist" do
      get "/api/v1/users/00000000-0000-0000-0000-000000000000"

      expect(response).to have_http_status(:not_found)
    end
  end
end
```

- [ ] **Step 2: Run the spec, confirm it fails**

```bash
eval "$(rbenv init - zsh)"
cd /Users/julietteengel/code/julietteengel/tidy-api
bundle exec rspec spec/requests/api/v1/users_spec.rb
```

Expected: routing error.

- [ ] **Step 3: Add the route**

Edit `config/routes.rb`, add `get "users/:id", to: "users#show"` inside the `namespace :v1 do ... end` block (order relative to the `lists` routes doesn't matter, they're different path prefixes):

```ruby
      get "users/:id", to: "users#show"
```

- [ ] **Step 4: Implement the controller**

Create `app/controllers/api/v1/users_controller.rb`:

```ruby
class Api::V1::UsersController < ApplicationController
  def show
    user = User.find(params[:id])
    render json: UserSerializer.new(user)
  rescue ActiveRecord::RecordNotFound
    render json: { error: "User not found" }, status: :not_found
  end
end
```

- [ ] **Step 5: Run the spec, confirm it passes**

```bash
bundle exec rspec spec/requests/api/v1/users_spec.rb
```

Expected: `2 examples, 0 failures`.

- [ ] **Step 6: Run the full suite**

```bash
bundle exec rspec
```

Expected: `38 examples, 0 failures`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add user profile endpoint"
```

---

### Task 5: `Api::V1::BaseController` and `GET /api/v1/me/lists`

**Files:**
- Create: `tidy-api/app/controllers/api/v1/base_controller.rb`
- Create: `tidy-api/app/controllers/api/v1/me_controller.rb`
- Modify: `tidy-api/config/routes.rb`
- Create: `tidy-api/spec/requests/api/v1/me_spec.rb`

**Interfaces:**
- Consumes: `User` model, Phase 2's JWT auth (`authenticate_user!`/`current_user`, from Devise's controller helpers — available automatically in `ActionController::API` subclasses once Devise is installed, no extra include needed), `List` model, `ListSerializer` (Task 2).
- Produces: `Api::V1::BaseController` (authenticated base class, for this and any future protected endpoint to inherit from), `GET /api/v1/me/lists` → the authenticated user's active lists. Replaces `getDashboardLists(hardcodedAuthorId)` — see Global Constraints on why this derives the user from the token, not a param.

- [ ] **Step 1: Write the failing request spec**

Create `spec/requests/api/v1/me_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "Api::V1::Me", type: :request do
  describe "GET /api/v1/me/lists" do
    it "returns the authenticated user's active lists, including private ones" do
      user = create(:user, password: "password123", confirmed_at: Time.current)
      other_user = create(:user, password: "password123", confirmed_at: Time.current)

      own_active = create(:list, author: user, status: "ACTIVE", visibility: "PRIVATE")
      create(:list, author: user, status: "ARCHIVED") # excluded: not active
      create(:list, author: other_user, status: "ACTIVE") # excluded: different author

      post "/api/v1/login", params: { user: { email: user.email, password: "password123" } }
      token = response.headers["Authorization"]

      get "/api/v1/me/lists", headers: { "Authorization" => token }

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.map { |l| l["id"] }).to contain_exactly(own_active.id)
    end

    it "rejects a request with no token" do
      get "/api/v1/me/lists"

      expect(response).to have_http_status(:unauthorized)
    end

    it "does not accept a client-supplied author id instead of the token's user" do
      user = create(:user, password: "password123", confirmed_at: Time.current)
      other_user = create(:user, password: "password123", confirmed_at: Time.current)
      create(:list, author: other_user, status: "ACTIVE", visibility: "PRIVATE")

      post "/api/v1/login", params: { user: { email: user.email, password: "password123" } }
      token = response.headers["Authorization"]

      get "/api/v1/me/lists", params: { authorId: other_user.id }, headers: { "Authorization" => token }

      body = JSON.parse(response.body)
      expect(body).to eq([]) # other_user's list must NOT leak through a spoofed param
    end
  end
end
```

- [ ] **Step 2: Run the spec, confirm it fails**

```bash
eval "$(rbenv init - zsh)"
cd /Users/julietteengel/code/julietteengel/tidy-api
bundle exec rspec spec/requests/api/v1/me_spec.rb
```

Expected: routing error.

- [ ] **Step 3: Add the route**

Edit `config/routes.rb`, add inside the `namespace :v1 do ... end` block:

```ruby
      get "me/lists", to: "me#lists"
```

- [ ] **Step 4: Implement the base controller**

Create `app/controllers/api/v1/base_controller.rb`:

```ruby
class Api::V1::BaseController < ApplicationController
  before_action :authenticate_user!
end
```

- [ ] **Step 5: Implement the `me` controller**

Create `app/controllers/api/v1/me_controller.rb`:

```ruby
class Api::V1::MeController < Api::V1::BaseController
  def lists
    lists = List.where(author_id: current_user.id, status: "ACTIVE")
    render json: lists.map { |list| ListSerializer.new(list) }
  end
end
```

Note there is no `params[:authorId]` anywhere in this action — `current_user.id` (resolved by Devise from the JWT via `authenticate_user!`) is the *only* source of the author id. This is intentional, not an oversight: see Global Constraints.

- [ ] **Step 6: Run the spec, confirm it passes**

```bash
bundle exec rspec spec/requests/api/v1/me_spec.rb
```

Expected: `3 examples, 0 failures`.

- [ ] **Step 7: Run the full suite**

```bash
bundle exec rspec
```

Expected: `41 examples, 0 failures`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add authenticated me/lists endpoint"
```

---

### Task 6: Manual end-to-end verification and README update

**Files:**
- Modify: `tidy-api/README.md`

**Interfaces:**
- None — this task verifies Tasks 1-5 hold together against a running server and records the new endpoints for the walkthrough.

- [ ] **Step 1: Rebuild the dev database and start the server**

```bash
eval "$(rbenv init - zsh)"
cd /Users/julietteengel/code/julietteengel/tidy-api
bin/rails db:drop db:create db:migrate db:seed
bin/rails server -p 3001 &
sleep 2
```

- [ ] **Step 2: Exercise each endpoint manually**

```bash
curl -s http://localhost:3001/api/v1/lists/featured -i | head -5
curl -s http://localhost:3001/api/v1/lists/public -i | head -5

# Grab a real list id from the featured response above, then:
curl -s http://localhost:3001/api/v1/lists/<paste-a-real-id-here> -i | head -20

curl -s http://localhost:3001/api/v1/users/584348bf79a3c400042a5940 -i | head -20

# me/lists without a token:
curl -s http://localhost:3001/api/v1/me/lists -i | head -5

# me/lists with a token (login first):
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"<a real seeded user email>","password":"password123"}}' \
  -D - -o /dev/null | grep -i '^Authorization:' | cut -d' ' -f2- | tr -d '\r')
curl -s http://localhost:3001/api/v1/me/lists -H "Authorization: $TOKEN" -i | head -10

kill %1
```

Expected: `featured`/`public` return arrays with camelCase keys; the list-detail endpoint returns `{ list, items, author }` with the author's `name` populated; the user endpoint returns a profile with no `email`/password field; `me/lists` returns `401` with no token and the logged-in user's own lists with one.

- [ ] **Step 3: Document the new endpoints**

Add to `README.md`, after the existing "Schema notes" section:

```markdown
## API endpoints (Phase 3)

All under `/api/v1`, JSON responses with camelCase keys matching `tidy-next`'s
existing data shapes (see `docs/superpowers/specs/2026-07-21-tidy-api-phases-2-3-4-design.md`
in the `tidy-next` repo for the full design rationale).

- `GET /lists/featured` — active, public, featured lists.
- `GET /lists/public` — active, public lists.
- `GET /lists/:id` — a list with its items (ordered) and author, in one response.
- `GET /users/:id` — a public user profile (no email, no password/token fields —
  those exist on `User` but are never serialized).
- `GET /me/lists` — **requires** `Authorization: Bearer <jwt>` (from Phase 2's
  `/login`). Returns the authenticated user's own active lists (including
  private ones). The author is always taken from the token, never from a
  request parameter — do not add an `authorId` param to this endpoint without
  re-reading why that was deliberately avoided.
- CORS is open to `http://localhost:3000` only, in all environments so far —
  revisit for a production origin once a deploy phase exists.
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: document Phase 3 API endpoints"
```
