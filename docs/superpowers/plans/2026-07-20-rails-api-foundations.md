# Rails API Foundations (Phase 1/7) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a new, separate Rails API app (`tidy-api`) with PostgreSQL, and build the DB schema + models (`User`, `List`, `Item`, `ListCollaborator`) that mirror the data already shaped in `tidy-next`'s mock JSON (`src/data/*.json`, `src/app/api/*/route.ts`), with Devise + JWT wired onto `User` at the model level.

**Architecture:** A brand-new Rails 8 API-only application, in its own repo (sibling to `tidy-next`), talking to a local PostgreSQL instance in dev. UUID primary keys everywhere (parity with the opaque Mongo-style IDs already used in the JSON mocks). Enum values on `status`/`visibility`/`role`/etc. are kept as the exact same strings already used in `tidy-next` (e.g. `"ACTIVE"`, `"PUBLIC"`) so the future API layer (Phase 3) needs zero value-mapping between DB and frontend. This plan stops at models + schema + seed data — no controllers, no routes, no CORS (that's Phase 2 "Auth endpoints" and Phase 3 "API endpoints", separate plans).

**Tech Stack:** Ruby 4.0.6, Rails 8.1.3 (`--api`), PostgreSQL 16+ (local), Devise 5.0 + devise-jwt 0.13 (JTIMatcher revocation strategy), RSpec + FactoryBot for tests.

## Global Constraints

- Repo: brand-new, separate repo at `/Users/julietteengel/code/julietteengel/tidy-api` (not inside `tidy-next`).
- Primary keys: `uuid` (Postgres native `gen_random_uuid()`) on every table — set once via `config.generators.orm :active_record, primary_key_type: :uuid` so every `create_table` after that defaults to UUID without repeating `id: :uuid` per migration.
- Enum/status string values must match `tidy-next`'s `src/data/*.json` and `src/app/api/*/route.ts` **exactly** (e.g. `List#status` values are `"ACTIVE"`/`"ARCHIVED"`/`"DELETED"`, not lowercase) — this is what makes Phase 3's API layer a thin pass-through instead of a translation layer.
- Auth is Devise + devise-jwt at the **model** level only in this plan. No sessions/registrations controllers yet — those are Phase 2.
- No controllers, routes, or CORS in this plan — models, migrations, and seed data only. Each task must still be independently verifiable (migrations run, specs green).
- Rails 8's default Solid Queue/Cache/Cable are skipped for now (`--skip-solid` at app creation) — nothing in this plan needs background jobs; revisit in the deploy phase if needed.
- Test framework: RSpec + FactoryBot. No request/system specs in this plan (no controllers exist yet).

---

### Task 1: Bootstrap the `tidy-api` Rails app

**Files:**
- Create: `/Users/julietteengel/code/julietteengel/tidy-api/` (entire `rails new` output)
- Modify: `tidy-api/Gemfile`
- Modify: `tidy-api/config/application.rb`

**Interfaces:**
- Produces: a running Rails 8 API app connected to Postgres, with RSpec installed and runnable (`bundle exec rspec`), and `config.generators.orm` set to `primary_key_type: :uuid` — every later task's `create_table` relies on this to get UUID PKs without repeating `id: :uuid`.

- [ ] **Step 1: Generate the app**

```bash
cd /Users/julietteengel/code/julietteengel
rails new tidy-api --api --database=postgresql --skip-test --skip-solid
cd tidy-api
```

- [ ] **Step 2: Set UUID as the default primary key type for generators**

Edit `config/application.rb`, inside the `Application` class body:

```ruby
module TidyApi
  class Application < Rails::Application
    config.load_defaults 8.1

    config.api_only = true

    config.generators do |g|
      g.orm :active_record, primary_key_type: :uuid
    end
  end
end
```

- [ ] **Step 3: Add test gems**

Edit `Gemfile`, add:

```ruby
group :development, :test do
  gem "rspec-rails", "~> 7.1"
  gem "factory_bot_rails", "~> 6.4"
end
```

- [ ] **Step 4: Install and set up RSpec**

```bash
bundle install
bin/rails generate rspec:install
```

Expected output includes:
```
      create  .rspec
      create  spec
      create  spec/spec_helper.rb
      create  spec/rails_helper.rb
```

- [ ] **Step 5: Create the dev/test databases**

```bash
bin/rails db:create
```

Expected: `Created database 'tidy_api_development'` and `Created database 'tidy_api_test'`.

- [ ] **Step 6: Verify the empty suite runs**

```bash
bundle exec rspec
```

Expected: `0 examples, 0 failures`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: bootstrap tidy-api Rails app with Postgres + RSpec"
```

---

### Task 2: `User` model with Devise + JWT

**Files:**
- Create: `tidy-api/db/migrate/<timestamp>_devise_create_users.rb` (generated, then edited)
- Modify: `tidy-api/app/models/user.rb`
- Modify: `tidy-api/config/initializers/devise.rb`
- Create: `tidy-api/spec/factories/users.rb`
- Create: `tidy-api/spec/models/user_spec.rb`

**Interfaces:**
- Produces: `User` model with columns `name, username, bio, status, role, avatar, cover, website, twitter, github, linkedin, theme, language, email_notifications, push_notifications, deleted_at, lists_count, followers_count, following_count, jti` plus Devise's own columns. `User.status` enum values `"ACTIVE"/"INACTIVE"/"BANNED"`, `User.role` enum values `"USER"/"ADMIN"`.
- Consumed by: Task 3 (`List belongs_to :author, class_name: "User"`), Task 5 (`Item belongs_to :author, class_name: "User"`).

- [ ] **Step 1: Add Devise + devise-jwt gems**

Edit `Gemfile`:

```ruby
gem "devise", "~> 5.0"
gem "devise-jwt", "~> 0.13"
```

```bash
bundle install
bin/rails generate devise:install
```

- [ ] **Step 2: Generate the Devise User migration + model stub**

```bash
bin/rails generate devise User
```

This creates `app/models/user.rb` (a bare Devise model) and a migration file named `db/migrate/<timestamp>_devise_create_users.rb`. Note the exact filename printed in your terminal — you'll edit that file in the next step.

- [ ] **Step 3: Replace the generated migration with the full schema**

Open the migration file from Step 2 (`db/migrate/<timestamp>_devise_create_users.rb`) and replace its entire contents with:

```ruby
class DeviseCreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      ## Database authenticatable
      t.string :email,              null: false, default: ""
      t.string :encrypted_password, null: false, default: ""

      ## Recoverable
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at

      ## Rememberable
      t.datetime :remember_created_at

      ## Trackable (replaces the hand-rolled `lastLoginAt` from the old JSON model)
      t.integer  :sign_in_count, default: 0, null: false
      t.datetime :current_sign_in_at
      t.datetime :last_sign_in_at
      t.string   :current_sign_in_ip
      t.string   :last_sign_in_ip

      ## Confirmable (replaces the hand-rolled `emailVerified*` fields from the old JSON model)
      t.string   :confirmation_token
      t.datetime :confirmed_at
      t.datetime :confirmation_sent_at
      t.string   :unconfirmed_email

      ## JWT revocation (devise-jwt, JTIMatcher strategy)
      t.string :jti, null: false

      ## Profile fields (mirrors tidy-next's src/data/users.json)
      t.string  :name,     null: false
      t.string  :username, null: false
      t.text    :bio
      t.string  :status,   null: false, default: "ACTIVE"
      t.string  :role,     null: false, default: "USER"
      t.string  :avatar
      t.string  :cover

      t.string  :website
      t.string  :twitter
      t.string  :github
      t.string  :linkedin

      t.string  :theme,               null: false, default: "LIGHT"
      t.string  :language,            null: false, default: "en"
      t.boolean :email_notifications, null: false, default: true
      t.boolean :push_notifications,  null: false, default: true

      t.integer  :lists_count,      null: false, default: 0
      t.integer  :followers_count,  null: false, default: 0
      t.integer  :following_count,  null: false, default: 0

      t.datetime :deleted_at

      t.timestamps null: false
    end

    add_index :users, :email,                unique: true
    add_index :users, :reset_password_token, unique: true
    add_index :users, :confirmation_token,   unique: true
    add_index :users, :jti,                  unique: true
    add_index :users, :username,             unique: true
    add_index :users, :deleted_at
  end
end
```

- [ ] **Step 4: Run the migration**

```bash
bin/rails db:migrate
```

Expected: `== ... DeviseCreateUsers: migrated`.

- [ ] **Step 5: Write the failing spec for custom User behavior**

Create `spec/factories/users.rb`:

```ruby
FactoryBot.define do
  factory :user do
    sequence(:username) { |n| "user#{n}" }
    name { "Test User" }
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password123" }
    confirmed_at { Time.current }
  end
end
```

Create `spec/models/user_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe User, type: :model do
  it "is valid with valid attributes" do
    expect(build(:user)).to be_valid
  end

  it "requires a username" do
    user = build(:user, username: nil)
    expect(user).not_to be_valid
    expect(user.errors[:username]).to include("can't be blank")
  end

  it "requires a unique username" do
    create(:user, username: "alex")
    duplicate = build(:user, username: "alex")
    expect(duplicate).not_to be_valid
    expect(duplicate.errors[:username]).to include("has already been taken")
  end

  it "defaults status to ACTIVE" do
    expect(build(:user).status).to eq("ACTIVE")
  end

  it "defaults role to USER" do
    expect(build(:user).role).to eq("USER")
  end

  it "authenticates with a valid password" do
    user = create(:user, password: "supersecret1")
    expect(user.valid_password?("supersecret1")).to be true
  end
end
```

- [ ] **Step 6: Run the spec, confirm it fails**

```bash
bundle exec rspec spec/models/user_spec.rb
```

Expected: failures on the username-presence and username-uniqueness examples (the generated `User` model has no custom validations yet), and on the status/role default examples (no enums defined yet).

- [ ] **Step 7: Generate the JWT secret and store it in credentials**

```bash
bin/rails secret
```

Copy the printed value, then open credentials in your editor:

```bash
EDITOR="nano" bin/rails credentials:edit
```

Add this line (using the value you just copied):

```yaml
devise_jwt_secret_key: <paste the generated secret here>
```

Save and close the editor.

- [ ] **Step 8: Configure devise-jwt**

Edit `config/initializers/devise.rb`, add inside the `Devise.setup do |config|` block:

```ruby
  config.jwt do |jwt|
    jwt.secret = Rails.application.credentials.devise_jwt_secret_key
    jwt.expiration_time = 30.minutes.to_i
  end
```

- [ ] **Step 9: Implement the User model**

Replace `app/models/user.rb`:

```ruby
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable,
         :confirmable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  include Devise::JWT::RevocationStrategies::JTIMatcher

  enum :status, { active: "ACTIVE", inactive: "INACTIVE", banned: "BANNED" }, default: "ACTIVE"
  enum :role, { user: "USER", admin: "ADMIN" }, default: "USER"

  validates :name, presence: true
  validates :username, presence: true, uniqueness: { case_sensitive: false }
end
```

- [ ] **Step 10: Run the spec, confirm it passes**

```bash
bundle exec rspec spec/models/user_spec.rb
```

Expected: `6 examples, 0 failures`.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add User model with Devise + JWT authentication"
```

---

### Task 3: `List` model

**Files:**
- Create: `tidy-api/db/migrate/<timestamp>_create_lists.rb`
- Create: `tidy-api/app/models/list.rb`
- Create: `tidy-api/spec/factories/lists.rb`
- Create: `tidy-api/spec/models/list_spec.rb`

**Interfaces:**
- Consumes: `User` (Task 2) via `belongs_to :author, class_name: "User"`.
- Produces: `List` with enums `status` (`"ACTIVE"/"ARCHIVED"/"DELETED"`) and `visibility` (`"PUBLIC"/"PRIVATE"/"UNINDEXED"`, prefixed as `visibility_public_list?` etc. — see Step 4 for why), scopes `discoverable`, `featured`, `public_for_profile`, `recent_first`. Consumed by Task 4 (`has_many :list_collaborators`) and Task 5 (`Item belongs_to :list`).

- [ ] **Step 1: Generate the migration**

```bash
bin/rails generate migration CreateLists
```

- [ ] **Step 2: Write the migration**

Replace the generated file's contents:

```ruby
class CreateLists < ActiveRecord::Migration[8.1]
  def change
    create_table :lists do |t|
      t.references :author, null: false, foreign_key: { to_table: :users }, type: :uuid

      t.string :title, null: false
      t.text   :description

      t.string :status,       null: false, default: "ACTIVE"
      t.string :visibility,   null: false, default: "PUBLIC"
      t.string :display_mode, null: false, default: "LIST"

      t.string :color
      t.string :thumbnail

      t.integer :items_count,         null: false, default: 0
      t.integer :collaborators_count, null: false, default: 0
      t.integer :notes_count,         null: false, default: 0

      t.boolean :is_on_discover, null: false, default: false
      t.boolean :is_featured,    null: false, default: false

      t.datetime :deleted_at

      t.timestamps null: false
    end

    add_index :lists, [:status, :visibility]
    add_index :lists, :is_on_discover
    add_index :lists, :is_featured
    add_index :lists, :deleted_at
  end
end
```

- [ ] **Step 3: Run the migration**

```bash
bin/rails db:migrate
```

Expected: `== ... CreateLists: migrated`.

- [ ] **Step 4: Write the failing spec**

Create `spec/factories/lists.rb`:

```ruby
FactoryBot.define do
  factory :list do
    association :author, factory: :user
    sequence(:title) { |n| "List #{n}" }
  end
end
```

Create `spec/models/list_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe List, type: :model do
  it "is valid with valid attributes" do
    expect(build(:list)).to be_valid
  end

  it "requires a title" do
    list = build(:list, title: nil)
    expect(list).not_to be_valid
  end

  it "requires an author" do
    list = build(:list, author: nil)
    expect(list).not_to be_valid
  end

  it "defaults status to ACTIVE and visibility to PUBLIC" do
    list = build(:list)
    expect(list.status).to eq("ACTIVE")
    expect(list.visibility).to eq("PUBLIC")
  end

  describe ".discoverable" do
    it "only returns active, public, on-discover lists" do
      visible = create(:list, is_on_discover: true)
      create(:list, is_on_discover: false)
      create(:list, is_on_discover: true, status: "ARCHIVED")
      create(:list, is_on_discover: true, visibility: "PRIVATE")

      expect(List.discoverable).to contain_exactly(visible)
    end
  end

  describe ".featured" do
    it "only returns active, public, featured lists" do
      featured = create(:list, is_featured: true)
      create(:list, is_featured: false)

      expect(List.featured).to contain_exactly(featured)
    end
  end
end
```

- [ ] **Step 5: Run the spec, confirm it fails**

```bash
bundle exec rspec spec/models/list_spec.rb
```

Expected: `uninitialized constant List` (the model doesn't exist yet).

- [ ] **Step 6: Implement the List model**

Create `app/models/list.rb`:

```ruby
class List < ApplicationRecord
  belongs_to :author, class_name: "User"
  has_many :items, dependent: :destroy

  # Enum keys avoid the bare word "public" (Ruby's Module#public method
  # visibility keyword) by using visibility_* prefixed generated methods.
  enum :status, { active: "ACTIVE", archived: "ARCHIVED", deleted: "DELETED" }, default: "ACTIVE"
  enum :visibility, { public_list: "PUBLIC", private_list: "PRIVATE", unindexed: "UNINDEXED" },
       default: "PUBLIC", prefix: true

  validates :title, presence: true

  scope :not_deleted, -> { where(deleted_at: nil) }
  scope :discoverable, -> { active.visibility_public_list.where(is_on_discover: true) }
  scope :featured, -> { active.visibility_public_list.where(is_featured: true) }
  scope :public_for_profile, -> { active.visibility_public_list }
  scope :recent_first, -> { order(created_at: :desc) }
end
```

- [ ] **Step 7: Run the spec, confirm it passes**

```bash
bundle exec rspec spec/models/list_spec.rb
```

Expected: `6 examples, 0 failures`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add List model with status/visibility enums and discover/featured scopes"
```

---

### Task 4: `ListCollaborator` join model

**Files:**
- Create: `tidy-api/db/migrate/<timestamp>_create_list_collaborators.rb`
- Create: `tidy-api/app/models/list_collaborator.rb`
- Modify: `tidy-api/app/models/list.rb`
- Modify: `tidy-api/app/models/user.rb`
- Create: `tidy-api/spec/models/list_collaborator_spec.rb`

**Interfaces:**
- Consumes: `List` (Task 3), `User` (Task 2).
- Produces: `List#collaborators` (through association), `User#collaborating_lists` (through association), and keeps `List#collaborators_count` (added in Task 3's migration) in sync via `counter_cache`.

- [ ] **Step 1: Generate the migration**

```bash
bin/rails generate migration CreateListCollaborators
```

- [ ] **Step 2: Write the migration**

```ruby
class CreateListCollaborators < ActiveRecord::Migration[8.1]
  def change
    create_table :list_collaborators do |t|
      t.references :list, null: false, foreign_key: true, type: :uuid
      t.references :user, null: false, foreign_key: true, type: :uuid

      t.timestamps null: false
    end

    add_index :list_collaborators, [:list_id, :user_id], unique: true
  end
end
```

- [ ] **Step 3: Run the migration**

```bash
bin/rails db:migrate
```

- [ ] **Step 4: Write the failing spec**

Create `spec/models/list_collaborator_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe ListCollaborator, type: :model do
  it "is valid with a list and a user" do
    collaborator = build(:list_collaborator)
    expect(collaborator).to be_valid
  end

  it "does not allow the same user twice on the same list" do
    existing = create(:list_collaborator)
    duplicate = build(:list_collaborator, list: existing.list, user: existing.user)

    expect(duplicate).not_to be_valid
  end

  it "is reachable from List#collaborators" do
    list = create(:list)
    user = create(:user)
    create(:list_collaborator, list: list, user: user)

    expect(list.collaborators).to contain_exactly(user)
  end

  it "is reachable from User#collaborating_lists" do
    list = create(:list)
    user = create(:user)
    create(:list_collaborator, list: list, user: user)

    expect(user.collaborating_lists).to contain_exactly(list)
  end

  it "keeps List#collaborators_count in sync" do
    list = create(:list)
    expect { create(:list_collaborator, list: list) }
      .to change { list.reload.collaborators_count }.from(0).to(1)
  end
end
```

Create `spec/factories/list_collaborators.rb`:

```ruby
FactoryBot.define do
  factory :list_collaborator do
    association :list
    association :user
  end
end
```

- [ ] **Step 5: Run the spec, confirm it fails**

```bash
bundle exec rspec spec/models/list_collaborator_spec.rb
```

Expected: `uninitialized constant ListCollaborator`.

- [ ] **Step 6: Implement the model and associations**

Create `app/models/list_collaborator.rb`:

```ruby
class ListCollaborator < ApplicationRecord
  belongs_to :list, counter_cache: :collaborators_count
  belongs_to :user

  validates :user_id, uniqueness: { scope: :list_id }
end
```

Edit `app/models/list.rb`, add inside the class (after `has_many :items`):

```ruby
  has_many :list_collaborators, dependent: :destroy
  has_many :collaborators, through: :list_collaborators, source: :user
```

Edit `app/models/user.rb`, add inside the class (after the `validates` lines):

```ruby
  has_many :list_collaborators, dependent: :destroy
  has_many :collaborating_lists, through: :list_collaborators, source: :list
```

- [ ] **Step 7: Run the spec, confirm it passes**

```bash
bundle exec rspec spec/models/list_collaborator_spec.rb
```

Expected: `5 examples, 0 failures`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add ListCollaborator join model between User and List"
```

---

### Task 5: `Item` model

**Files:**
- Create: `tidy-api/db/migrate/<timestamp>_create_items.rb`
- Create: `tidy-api/app/models/item.rb`
- Modify: `tidy-api/app/models/list.rb`
- Create: `tidy-api/spec/factories/items.rb`
- Create: `tidy-api/spec/models/item_spec.rb`

**Interfaces:**
- Consumes: `List` (Task 3), `User` (Task 2).
- Produces: `Item` with `content` as a `jsonb` column (flexible link-preview metadata: `url, title, description, label1, value1, label2, value2, author, host, siteName, favicon, image, embed` — kept as jsonb rather than one column per key since these fields vary by item type and are read/written as a single blob by the frontend already). Keeps `List#items_count` (added in Task 3's migration) in sync via `counter_cache`.

- [ ] **Step 1: Generate the migration**

```bash
bin/rails generate migration CreateItems
```

- [ ] **Step 2: Write the migration**

```ruby
class CreateItems < ActiveRecord::Migration[8.1]
  def change
    create_table :items do |t|
      t.references :list,   null: false, foreign_key: true, type: :uuid
      t.references :author, null: false, foreign_key: { to_table: :users }, type: :uuid

      t.string :title, null: false
      t.string :caption

      # Named item_type, not "type" — Rails reserves the `type` column
      # name for single-table inheritance discriminators.
      t.string :item_type,    null: false, default: "URL"
      t.string :status,      null: false, default: "ACTIVE"
      t.string :visibility,  null: false, default: "PUBLIC"
      t.string :display_mode, null: false, default: "EMBED"

      t.jsonb :content, null: false, default: {}

      t.integer :position, null: false, default: 0

      t.integer :views_count,    null: false, default: 0
      t.integer :likes_count,    null: false, default: 0
      t.integer :comments_count, null: false, default: 0

      t.datetime :deleted_at

      t.timestamps null: false
    end

    add_index :items, [:list_id, :position]
    add_index :items, :deleted_at
  end
end
```

- [ ] **Step 3: Run the migration**

```bash
bin/rails db:migrate
```

- [ ] **Step 4: Write the failing spec**

Create `spec/factories/items.rb`:

```ruby
FactoryBot.define do
  factory :item do
    association :list
    association :author, factory: :user
    sequence(:title) { |n| "Item #{n}" }
    item_type { "URL" }
    content { { "url" => "https://example.com" } }
  end
end
```

Create `spec/models/item_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe Item, type: :model do
  it "is valid with valid attributes" do
    expect(build(:item)).to be_valid
  end

  it "requires a title" do
    expect(build(:item, title: nil)).not_to be_valid
  end

  it "requires a list and an author" do
    expect(build(:item, list: nil)).not_to be_valid
    expect(build(:item, author: nil)).not_to be_valid
  end

  it "stores arbitrary content as jsonb" do
    item = create(:item, content: { "url" => "https://x.com", "label1" => "Views", "value1" => "42" })
    expect(item.reload.content).to eq("url" => "https://x.com", "label1" => "Views", "value1" => "42")
  end

  describe ".ordered" do
    it "orders items by position" do
      list = create(:list)
      third = create(:item, list: list, position: 2)
      first = create(:item, list: list, position: 0)
      second = create(:item, list: list, position: 1)

      expect(list.items.ordered).to eq([first, second, third])
    end
  end

  it "keeps List#items_count in sync" do
    list = create(:list)
    expect { create(:item, list: list) }
      .to change { list.reload.items_count }.from(0).to(1)
  end
end
```

- [ ] **Step 5: Run the spec, confirm it fails**

```bash
bundle exec rspec spec/models/item_spec.rb
```

Expected: `uninitialized constant Item`.

- [ ] **Step 6: Implement the Item model**

Create `app/models/item.rb`:

```ruby
class Item < ApplicationRecord
  belongs_to :list, counter_cache: true
  belongs_to :author, class_name: "User"

  enum :status, { active: "ACTIVE", archived: "ARCHIVED", deleted: "DELETED" }, default: "ACTIVE"
  enum :visibility, { public_item: "PUBLIC", private_item: "PRIVATE", unindexed: "UNINDEXED" },
       default: "PUBLIC", prefix: true

  validates :title, presence: true
  validates :item_type, presence: true

  scope :not_deleted, -> { where(deleted_at: nil) }
  scope :ordered, -> { order(:position) }
end
```

Edit `app/models/list.rb`, change the existing `has_many :items, dependent: :destroy` line to also expose the ordered scope for convenience:

```ruby
  has_many :items, -> { order(:position) }, dependent: :destroy
```

- [ ] **Step 7: Run the spec, confirm it passes**

```bash
bundle exec rspec spec/models/item_spec.rb
```

Expected: `6 examples, 0 failures`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add Item model with jsonb content and position ordering"
```

---

### Task 6: Seed data import from `tidy-next`'s mock JSON

**Files:**
- Create: `tidy-api/db/seed_source/users.json` (copied)
- Create: `tidy-api/db/seed_source/lists.json` (copied)
- Create: `tidy-api/db/seed_source/items.json` (copied)
- Modify: `tidy-api/db/seeds.rb`

**Interfaces:**
- Consumes: `User`, `List`, `Item` models (Tasks 2, 3, 5).
- Produces: dev-database rows matching `tidy-next`'s existing mock data, for local development and for the Phase 4 frontend-integration plan to test against real data instead of JSON files.

- [ ] **Step 1: Copy the source JSON into the new repo**

```bash
mkdir -p /Users/julietteengel/code/julietteengel/tidy-api/db/seed_source
cp /Users/julietteengel/code/julietteengel/tidy-next/src/data/users.json \
   /Users/julietteengel/code/julietteengel/tidy-next/src/data/lists.json \
   /Users/julietteengel/code/julietteengel/tidy-next/src/data/items.json \
   /Users/julietteengel/code/julietteengel/tidy-api/db/seed_source/
```

- [ ] **Step 2: Note the expected record counts (for verification in Step 4)**

```bash
cd /Users/julietteengel/code/julietteengel/tidy-api
ruby -rjson -e 'JSON.parse(File.read("db/seed_source/users.json"))["users"].tap { |a| puts "users: #{a.size}" }'
ruby -rjson -e 'JSON.parse(File.read("db/seed_source/lists.json"))["lists"].tap { |a| puts "lists: #{a.size}" }'
ruby -rjson -e 'JSON.parse(File.read("db/seed_source/items.json"))["items"].tap { |a| puts "items: #{a.size}" }'
```

Write down the three numbers printed — you'll compare against them in Step 4.

- [ ] **Step 3: Write `db/seeds.rb`**

Replace the contents of `db/seeds.rb`:

```ruby
require "json"

seed_dir = Rails.root.join("db", "seed_source")

users_data = JSON.parse(File.read(seed_dir.join("users.json")))["users"]
lists_data = JSON.parse(File.read(seed_dir.join("lists.json")))["lists"]
items_data = JSON.parse(File.read(seed_dir.join("items.json")))["items"]

user_id_map = {}
users_data.each do |u|
  user = User.create!(
    name: u["name"],
    username: u["username"],
    bio: u["bio"],
    email: u["email"],
    password: "password123",
    password_confirmation: "password123",
    status: u["status"],
    role: u["role"],
    confirmed_at: Time.current
  )
  user_id_map[u["id"]] = user.id
end

list_id_map = {}
lists_data.each do |l|
  list = List.create!(
    author_id: user_id_map.fetch(l["authorId"]),
    title: l["title"],
    description: l["description"],
    status: l["status"],
    visibility: l["visibility"],
    display_mode: l["displayMode"],
    color: l["color"],
    thumbnail: l["thumbnail"],
    is_on_discover: l["isOnDiscover"],
    is_featured: l["isFeatured"],
    created_at: l["createdAt"],
    updated_at: l["updatedAt"],
    deleted_at: l["deletedAt"]
  )
  list_id_map[l["id"]] = list.id
end

items_data.each do |i|
  content = i["content"] || {}
  Item.create!(
    list_id: list_id_map.fetch(i["ownership"]["listId"]),
    author_id: user_id_map.fetch(i["ownership"]["authorId"]),
    title: i["title"],
    caption: i["caption"],
    item_type: i["type"],
    status: i["status"],
    visibility: i["visibility"],
    display_mode: i["displayMode"],
    content: content,
    position: i.dig("ownership", "position") || 0,
    views_count: i.dig("stats", "views") || 0,
    likes_count: i.dig("stats", "likes") || 0,
    comments_count: i.dig("stats", "comments") || 0,
    created_at: i.dig("timestamps", "createdAt"),
    updated_at: i.dig("timestamps", "updatedAt"),
    deleted_at: i.dig("timestamps", "deletedAt")
  )
end

puts "Seeded #{User.count} users, #{List.count} lists, #{Item.count} items"
```

- [ ] **Step 4: Run the seed and verify counts**

```bash
bin/rails db:seed
```

Expected: `Seeded N users, M lists, K items` where N/M/K match the numbers you wrote down in Step 2. If a list or item references an `authorId`/`listId` not present in `users.json`/`lists.json`, this will raise `KeyError` — fix the source JSON or the mapping before moving on, don't rescue/swallow it.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: seed dev database from tidy-next's mock JSON data"
```

---

### Task 7: Full-suite verification and schema documentation

**Files:**
- Create: `tidy-api/README.md` (schema decisions section)

**Interfaces:**
- None — this task only verifies Tasks 1–6 hold together end-to-end and records the "why" behind the non-obvious decisions, for the call with Alex.

- [ ] **Step 1: Rebuild the database from scratch**

```bash
cd /Users/julietteengel/code/julietteengel/tidy-api
bin/rails db:drop db:create db:migrate db:seed
```

Expected: all migrations run in order, then the same `Seeded N users, M lists, K items` line as Task 6.

- [ ] **Step 2: Run the full spec suite**

```bash
bundle exec rspec
```

Expected: all examples from Tasks 2–5 pass, `0 failures`.

- [ ] **Step 3: Document the schema decisions**

Add to `README.md`:

```markdown
## Schema notes (for the walkthrough)

- All primary keys are UUIDs (`gen_random_uuid()`), matching the opaque
  string IDs already used in tidy-next's mock JSON.
- `status`/`visibility`/`role` enum values are the exact same strings
  used in tidy-next's `src/data/*.json` (e.g. `"ACTIVE"`, `"PUBLIC"`) —
  no translation layer needed when the API is built in Phase 3.
- `User` uses Devise's `:confirmable` module instead of the hand-rolled
  `emailVerified`/`emailVerificationToken` fields from the old JSON
  model, and `:trackable` instead of the hand-rolled `lastLoginAt`.
- `Item#item_type` is not called `type` — Rails reserves that column
  name for single-table inheritance.
- `Item#content` is a single `jsonb` column, not one column per
  possible field (`label1`, `value1`, `favicon`, `embed`, ...) — the
  shape varies by item type and the frontend already treats it as one
  blob.
- `List#items_count` and `List#collaborators_count` are Rails
  `counter_cache` columns, auto-maintained by `Item`/`ListCollaborator`
  — never write to them directly.
- `List#notes_count` exists as a column (parity with the old JSON
  model) but has no backing `Note` model yet — it stays at `0` until a
  future plan adds notes. Don't build features against it yet.
- Auth (signup/login endpoints), the JSON API, CORS, and deployment are
  separate plans — this one only covers the DB schema and models.
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: document schema decisions for tidy-api foundations"
```
