class Api::V1::ItemsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_list
  before_action :set_item, only: :update
  before_action :ensure_list_author!, only: [ :create, :update ]

  # POST /api/v1/lists/:list_id/items
  #
  # Keep item writes scoped to the current list and the authenticated author.
  # This prevents cross-list writes and guarantees the list page can refresh
  # from a single canonical source after creation.
  def create
    item = @list.items.build(normalized_item_params)
    item.author = current_user
    item.position = next_position if item.position.blank?

    if item.save
      @list.touch
      render json: ItemSerializer.new(item).serializable_hash, status: :created
    else
      render json: { status: { message: item.errors.full_messages.to_sentence } }, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/lists/:list_id/items/:id
  #
  # Updates are constrained to items that belong to the current list. We reuse
  # the same serializer contract as create so the frontend can share one shape.
  def update
    if @item.update(normalized_item_params)
      @list.touch
      render json: ItemSerializer.new(@item).serializable_hash, status: :ok
    else
      render json: { status: { message: @item.errors.full_messages.to_sentence } }, status: :unprocessable_entity
    end
  end

  private

  def set_list
    @list = List.find(params[:list_id])
  end

  def set_item
    @item = @list.items.find(params[:id])
  end

  def ensure_list_author!
    return if @list.author_id == current_user.id

    render json: { status: { message: "You are not allowed to edit this list." } }, status: :forbidden
  end

  def item_params
    params
      .require(:item)
      .permit(:body, :url, :display_mode, :position, metadata: {})
  end

  def normalized_item_params
    incoming = item_params.to_h.deep_symbolize_keys
    incoming[:display_mode] = incoming[:display_mode].presence || "text"
    incoming[:item_type] = incoming[:item_type].presence || (incoming[:url].present? ? "URL" : "TEXT")

    # When switching to text mode and no url is sent, clear any previously stored URL.
    if incoming[:display_mode].to_s.casecmp("text").zero? && !incoming.key?(:url)
      incoming[:url] = nil
    end

    incoming
  end

  def next_position
    @list.items.maximum(:position).to_i + 1
  end
end
