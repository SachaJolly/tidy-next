export type ItemLinkMetadata = {
  title: string | 'No title';
  favicon?: string;
  description?: string;
  label1?: string;
  value1?: string;
  label2?: string;
  value2?: string;
  author?: string;
  siteName?: string;
  host?: string;
  image?: string;
  images?: string[];
  embed?: string;
  videoUrl?: string;
  videoUrls?: string[];
  videoType?: string;
  imageAlt?: string;
  publishedTime?: string;
};

export type ItemLinkProps = {
  url: string;
  metadata: ItemLinkMetadata;
};

export type ItemBookmarkProps = ItemLinkProps & {
  noDescriptionLabel: string;
};

export type ItemLinkDisplayMode = 'link' | 'bookmark' | 'embed';

export type ItemLinkWithDisplayModeProps = ItemLinkProps & {
  displayMode: ItemLinkDisplayMode;
};
