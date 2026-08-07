class List < ApplicationRecord
  belongs_to :author, class_name: "User"
  has_many :items, -> { ordered }, dependent: :destroy
  has_many :list_collaborators, dependent: :destroy
  has_many :collaborators, through: :list_collaborators, source: :user

  # --- Enums ---
  enum :status, { active: "ACTIVE", archived: "ARCHIVED", deleted: "DELETED" }, default: "ACTIVE"
  enum :visibility, { published: "PUBLIC", restricted: "PRIVATE", unindexed: "UNINDEXED" }, default: "PRIVATE"

  validates :title, presence: true

  # Product gate for unconfirmed accounts:
  # - they can create and manage lists,
  # - but lists must stay PRIVATE until email confirmation.
  #
  # WHY in model (not controller):
  # this keeps the rule enforced everywhere (REST controllers, background jobs,
  # seeds/scripts, console updates) and prevents bypasses from alternate write paths.
  validate :restrict_unconfirmed_visibility

  # Same strategy for quantity cap:
  # enforce "max 3 non-deleted lists" at persistence layer so create/update/restore
  # all share one source of truth.
  validate :restrict_unconfirmed_list_count

  # --- Scopes ---
  scope :not_deleted, -> { where(deleted_at: nil) }
  scope :recent_first, -> { order(created_at: :desc) }
  scope :publicly_visible, -> { not_deleted.active.published }
  scope :with_items, -> { where("items_count > 0") }

  # --- API Scopes ---
  scope :featured, -> { publicly_visible.with_items.where(is_featured: true).recent_first }
  scope :trending, ->(since: 7.days.ago) { publicly_visible.with_items.where("updated_at >= ?", since).order(notes_count: :desc, updated_at: :desc) }
  # Latest feed should only include lists that already contain content.
  scope :latest, -> { publicly_visible.with_items.recent_first }

  private

  def restrict_unconfirmed_visibility
    # Confirmed users are not subject to this gate.
    return unless unconfirmed_author?
    # No-op unless visibility is being set/changed in this transaction.
    return unless new_record? || will_save_change_to_visibility?
    # Allowed visibilities are declarative in config/feature_gates.yml.
    return if unconfirmed_visibility_allowed?

    # Use symbolic i18n keys so API errors are locale-aware and consistent.
    errors.add(:visibility, :unconfirmed_private_only)
  end

  def restrict_unconfirmed_list_count
    # Confirmed users are not subject to this cap.
    return unless unconfirmed_author?
    # The cap applies only when an operation would increase the effective
    # "active inventory" of non-deleted lists:
    # 1) creating a non-deleted list
    # 2) restoring a previously deleted list
    return unless creating_non_deleted_list? || restoring_deleted_list?

    # Count current non-deleted lists excluding self (important for restore path,
    # because self is still deleted in DB until commit, and for future-proofing if
    # callbacks reorder validation timing).
    existing_lists_count = author.lists.not_deleted.where.not(id: id).count
    return if existing_lists_count < unconfirmed_max_non_deleted_lists

    # Interpolated count is translated by Rails i18n.
    errors.add(:base, :unconfirmed_list_limit, count: unconfirmed_max_non_deleted_lists)
  end

  def creating_non_deleted_list?
    # "Normal create" path that immediately contributes to visible inventory.
    new_record? && deleted_at.nil?
  end

  def restoring_deleted_list?
    return false unless persisted?

    # Undelete/restore path:
    # record had deleted_at in DB and is being brought back to nil in this update.
    # This is the exact edge case that can silently bypass create-only limits if
    # not checked explicitly.
    deleted_at_in_database = attribute_in_database("deleted_at")
    deleted_at_in_database.present? && deleted_at.nil?
  end

  def unconfirmed_author?
    # "Unconfirmed" is an account-state gate (email confirmation), not a plan.
    # Keep this check centralized so all unconfirmed rules share the same predicate.
    author.present? && !author.confirmed?
  end

  def unconfirmed_list_gates
    # Feature gates are declarative in config/feature_gates.yml.
    # Example:
    # lists:
    #   unconfirmed:
    #     max_non_deleted: 3
    #     allowed_visibility: [PRIVATE]
    #
    # Returning {} preserves safety if config is missing in a given environment:
    # validations then fall back to conservative defaults below.
    Rails.configuration.x.feature_gates.dig(:lists, :unconfirmed) || {}
  end

  def unconfirmed_allowed_visibility
    # Normalize to String so config can use symbols/strings interchangeably.
    Array(unconfirmed_list_gates[:allowed_visibility]).map(&:to_s)
  end

  def unconfirmed_visibility_allowed?
    allowed = unconfirmed_allowed_visibility
    return false if allowed.empty?

    # We accept both enum raw values ("PRIVATE") and enum keys ("restricted")
    # in config to keep the gate readable and resilient to enum internals.
    enum_key = visibility.to_s
    enum_raw = self.class.visibilities[enum_key].to_s
    current_raw = visibility_before_type_cast.to_s

    allowed.include?(enum_key) || allowed.include?(enum_raw) || allowed.include?(current_raw)
  end

  def unconfirmed_max_non_deleted_lists
    # Secure default if config is absent or malformed: keep cap at 3.
    (unconfirmed_list_gates[:max_non_deleted] || 3).to_i
  end
end
