import itemsData from '@/data/items.json';

export type Item = {
  id: string;
  title: string;
  caption?: string;
  type: string;
  status: string;
  visibility: string;
  displayMode: string;
  content: {
    url: string;
    title: string;
    description: string;
    label1?: string;
    value1?: string;
    label2?: string;
    value2?: string;
    author?: string;
    host: string;
    siteName?: string;
    favicon?: string;
    image?: string;
    images?: string[];
    embed?: string;
  };
  ownership: {
    authorId: string;
    listId: string;
    position: number;
  };
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
  timestamps: {
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
};

export function getListItems(listId: string): { items: Item[] } {
  const items = (itemsData.items as Item[]).filter((item) => item.ownership.listId === listId);

  return { items };
}
