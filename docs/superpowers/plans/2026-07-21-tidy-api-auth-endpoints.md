# tidy-api Auth Endpoints (Phase 2/7) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** turn `tidy-api`'s existing `User` model (Devise + devise-jwt, model-level only, built in Phase 1) into real, callable `POST /api/v1/signup`, `POST /api/v1/login`, and `DELETE /api/v1/logout` endpoints, returning a JWT in the `Authorization` response header on signup/login and revoking it on logout.

**Architecture:** Devise's own `SessionsController`/`RegistrationsController` are subclassed under `Api::V1::`, each overriding `respond_with` (and `respond_to_on_destroy` for sessions) to render JSON directly instead of Devise's default HTML-oriented behavior. `devise-jwt`'s `dispatch_requests`/`revocation_requests` config (matched by HTTP verb + path regex) handles attaching/revoking the JWT automatically around these controller actions — the controllers themselves never touch JWT encoding directly, except when decoding the token in `respond_to_on_destroy` to report whether the logout actually found an active session.

**Tech Stack:** Rails 8.1.3 (API-only), Devise 5.0 + devise-jwt 0.13 (already installed, Phase 1), RSpec + FactoryBot (request specs — this plan's tests are this repo's first outside of model specs).

## Global Constraints

- Repo: `/Users/julietteengel/code/julietteengel/tidy-api`, existing app from Phase 1 — do not run `rails new` again.
- Auth strategy: stateless JWT via the `Authorization` header (`Bearer <token>`) — no cookies, no sessions, no CORS-with-credentials. (Decided during Phase 2-4 design; see `docs/superpowers/specs/2026-07-21-tidy-api-phases-2-3-4-design.md`.)
- All three endpoints live under `/api/v1` — `POST /api/v1/signup`, `POST /api/v1/login`, `DELETE /api/v1/logout`.
- No CORS configuration in this plan — that's Phase 3 (`2026-07-21-tidy-api-json-endpoints.md`), once there's a cross-origin caller.
- No password-reset/email-confirmation endpoints in this plan — the Devise modules exist on `User` (Phase 1) but wiring their endpoints is future scope, not needed yet.
- Test framework: RSpec request specs (`spec/requests/`). This plan does not touch model specs.
- Environment: rbenv shims aren't on `PATH` by default in a fresh shell — run `eval "$(rbenv init - zsh)"` before any `ruby`/`rails`/`bundle` command. PostgreSQL runs locally via Homebrew (`postgresql@15`), start it if not running: `brew services start postgresql@15`.

---

### Task 1: JWT dispatch/revocation config, routes, and the sessions controller (login/logout)

**Files:**
- Modify: `tidy-api/config/initializers/devise.rb`
- Modify: `tidy-api/config/routes.rb`
- Create: `tidy-api/app/controllers/api/v1/sessions_controller.rb`
- Create: `tidy-api/spec/requests/api/v1/sessions_spec.rb`

**Interfaces:**
- Consumes: `User` model (Phase 1) — `devise :database_authenticatable, ..., :jwt_authenticatable, jwt_revocation_strategy: self`, `include Devise::JWT::RevocationStrategies::JTIMatcher`, already present in `app/models/user.rb`.
- Produces: `POST /api/v1/login` (returns `{ user: {...} }` JSON + `Authorization: Bearer <jwt>` response header), `DELETE /api/v1/logout` (revokes the JWT via `JTIMatcher` — changes `User#jti` — returns `{ message: "..." }`). Consumed by Task 2 (registrations controller reuses the same `dispatch_requests` mechanism) and by Phase 3/4 (whichever endpoint needs `authenticate_user!` will accept tokens minted here).

- [ ] **Step 1: Configure JWT dispatch and revocation request matchers**

Edit `config/initializers/devise.rb`, replace the existing `config.jwt do |jwt| ... end` block (added in Phase 1) with:

```ruby
  config.jwt do |jwt|
    jwt.secret = Rails.application.credentials.devise_jwt_secret_key
    jwt.dispatch_requests = [
      ["POST", %r{^/api/v1/login$}],
      ["POST", %r{^/api/v1/signup$}]
    ]
    jwt.revocation_requests = [
      ["DELETE", %r{^/api/v1/logout$}]
    ]
    jwt.expiration_time = 30.minutes.to_i
  end
```

(The `signup` dispatch entry is used by Task 2, added now so both tasks share one edit to this file.)

- [ ] **Step 2: Add routes**

Edit `config/routes.rb`, replace its contents:

```ruby
Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  devise_for :users,
             path: "api/v1",
             path_names: {
               sign_in: "login",
               sign_out: "logout",
               registration: "signup"
             },
             controllers: {
               sessions: "api/v1/sessions",
               registrations: "api/v1/registrations"
             }
end
```

This generates (among others) `POST /api/v1/login` → `api/v1/sessions#create`, `DELETE /api/v1/logout` → `api/v1/sessions#destroy`, `POST /api/v1/signup` → `api/v1/registrations#create`. Task 2 creates the registrations controller this routes to — until then, `bin/rails routes` will show the route but hitting `/api/v1/signup` will 500 with an uninitialized-constant error; that's expected and resolved by Task 2.

- [ ] **Step 3: Write the failing request specs for login/logout**

Create `spec/requests/api/v1/sessions_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "Api::V1::Sessions", type: :request do
  let(:password) { "password123" }
  let!(:user) { create(:user, password: password, confirmed_at: Time.current) }

  describe "POST /api/v1/login" do
    it "logs in with valid credentials and returns a JWT" do
      post "/api/v1/login", params: { user: { email: user.email, password: password } }

      expect(response).to have_http_status(:ok)
      expect(response.headers["Authorization"]).to be_present
      expect(response.headers["Authorization"]).to match(/^Bearer /)

      body = JSON.parse(response.body)
      expect(body["user"]["email"]).to eq(user.email)
      expect(body["user"]["username"]).to eq(user.username)
    end

    it "rejects invalid credentials" do
      post "/api/v1/login", params: { user: { email: user.email, password: "wrongpassword" } }

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /api/v1/logout" do
    it "revokes the JWT and changes the user's jti" do
      post "/api/v1/login", params: { user: { email: user.email, password: password } }
      token = response.headers["Authorization"]

      expect {
        delete "/api/v1/logout", headers: { "Authorization" => token }
      }.to change { user.reload.jti }

      expect(response).to have_http_status(:ok)
    end

    it "returns unauthorized when there is no active session" do
      delete "/api/v1/logout", headers: { "Authorization" => "Bearer not-a-real-token" }

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
```

- [ ] **Step 4: Run the specs, confirm they fail**

```bash
eval "$(rbenv init - zsh)"
cd /Users/julietteengel/code/julietteengel/tidy-api
bundle exec rspec spec/requests/api/v1/sessions_spec.rb
```

Expected: failures with `uninitialized constant Api::V1::SessionsController` (the controller doesn't exist yet).

- [ ] **Step 5: Implement the sessions controller**

Create `app/controllers/api/v1/sessions_controller.rb`:

```ruby
class Api::V1::SessionsController < Devise::SessionsController
  respond_to :json
  skip_before_action :verify_signed_out_user, only: :destroy

  private

  def respond_with(resource, _opts = {})
    render json: {
      user: {
        id: resource.id,
        email: resource.email,
        username: resource.username,
        name: resource.name
      }
    }, status: :ok
  end

  def respond_to_on_destroy
    current_user = user_from_authorization_header

    if current_user
      render json: { message: "Logged out successfully" }, status: :ok
    else
      render json: { message: "Couldn't find an active session" }, status: :unauthorized
    end
  end

  def user_from_authorization_header
    auth_header = request.headers["Authorization"]
    return nil if auth_header.blank?

    token = auth_header.split(" ").last
    payload = JWT.decode(token, Rails.application.credentials.devise_jwt_secret_key, true, algorithm: "HS256").first
    User.find_by(id: payload["sub"])
  rescue JWT::DecodeError, ActiveRecord::RecordNotFound
    nil
  end
end
```

Note: `skip_before_action :verify_signed_out_user, only: :destroy` is required because this app has no session store (`config.api_only = true`, no `:rememberable`/cookie session) — Devise's default `destroy` action checks `signed_in?` via the session, which is never true here even with a valid JWT (JWT auth doesn't populate `warden.user(:user)` the same way session auth does at this point in the filter chain). `respond_to_on_destroy` does its own JWT-based check instead.

- [ ] **Step 6: Run the specs, confirm they pass**

```bash
bundle exec rspec spec/requests/api/v1/sessions_spec.rb
```

Expected: `4 examples, 0 failures`.

- [ ] **Step 7: Run the full suite to confirm no regressions**

```bash
bundle exec rspec
```

Expected: all Phase 1 model specs (23 examples) plus these 4, `0 failures`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add login/logout endpoints via devise-jwt session controller"
```

---

### Task 2: Registrations controller (signup)

**Files:**
- Create: `tidy-api/app/controllers/api/v1/registrations_controller.rb`
- Create: `tidy-api/spec/requests/api/v1/registrations_spec.rb`

**Interfaces:**
- Consumes: `User` model (Phase 1), the `dispatch_requests` entry for `POST /api/v1/signup` added in Task 1, the route added in Task 1.
- Produces: `POST /api/v1/signup` (creates a `User`, returns `{ user: {...} }` + `Authorization: Bearer <jwt>` header on success; `{ errors: [...] }` with 422 on validation failure).

- [ ] **Step 1: Write the failing request spec**

Create `spec/requests/api/v1/registrations_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "Api::V1::Registrations", type: :request do
  describe "POST /api/v1/signup" do
    let(:valid_params) do
      {
        user: {
          email: "newuser@example.com",
          password: "password123",
          password_confirmation: "password123",
          name: "New User",
          username: "newuser"
        }
      }
    end

    it "creates a user and returns a JWT" do
      expect {
        post "/api/v1/signup", params: valid_params
      }.to change(User, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(response.headers["Authorization"]).to be_present

      body = JSON.parse(response.body)
      expect(body["user"]["email"]).to eq("newuser@example.com")
      expect(body["user"]["username"]).to eq("newuser")
    end

    it "rejects a signup missing a required field" do
      invalid_params = valid_params.deep_merge(user: { username: nil })

      expect {
        post "/api/v1/signup", params: invalid_params
      }.not_to change(User, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      body = JSON.parse(response.body)
      expect(body["errors"]).to include("Username can't be blank")
    end

    it "rejects a duplicate email" do
      create(:user, email: "newuser@example.com")

      expect {
        post "/api/v1/signup", params: valid_params
      }.not_to change(User, :count)

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
```

- [ ] **Step 2: Run the spec, confirm it fails**

```bash
eval "$(rbenv init - zsh)"
cd /Users/julietteengel/code/julietteengel/tidy-api
bundle exec rspec spec/requests/api/v1/registrations_spec.rb
```

Expected: failures with `uninitialized constant Api::V1::RegistrationsController`.

- [ ] **Step 3: Implement the registrations controller**

Create `app/controllers/api/v1/registrations_controller.rb`:

```ruby
class Api::V1::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  private

  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation, :name, :username)
  end

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: {
        user: {
          id: resource.id,
          email: resource.email,
          username: resource.username,
          name: resource.name
        }
      }, status: :created
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
```

`sign_up_params` overrides Devise's default parameter sanitizer, which by default only permits `:email, :password, :password_confirmation` — `User` also requires `:name` and `:username` (Phase 1 validations), so both must be explicitly permitted here or every signup fails with a params error before validation even runs.

- [ ] **Step 4: Run the spec, confirm it passes**

```bash
bundle exec rspec spec/requests/api/v1/registrations_spec.rb
```

Expected: `3 examples, 0 failures`.

- [ ] **Step 5: Run the full suite**

```bash
bundle exec rspec
```

Expected: `30 examples, 0 failures` (23 Phase 1 model specs + 4 sessions + 3 registrations).

- [ ] **Step 6: Manually verify the full signup → login → logout flow**

```bash
bin/rails server -p 3001 &
sleep 2

curl -s -X POST http://localhost:3001/api/v1/signup \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"manual@example.com","password":"password123","password_confirmation":"password123","name":"Manual Test","username":"manualtest"}}' \
  -i | head -20

curl -s -X POST http://localhost:3001/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"manual@example.com","password":"password123"}}' \
  -i | head -20

kill %1
```

Expected: signup returns `201` with an `Authorization` header; login returns `200` with an `Authorization` header and the same user's data.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add signup endpoint via devise-jwt registrations controller"
```
