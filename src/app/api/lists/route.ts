import { NextResponse } from 'next/server';
import listsData from '@/data/lists.json';
import { getUserById } from '../users/route';
import { getListItems } from '../items/route';

export type List = {
  id: string;
  title: string;
  description?: string;

  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNINDEXED';
  displayMode: 'LIST';

  color: string;
  thumbnail?: string;

  items: number;
  collaborators: number;
  notes: number;

  isOnDiscover: boolean;
  isFeatured: boolean;
  isPinned: boolean;
  isPopular: boolean;
  isTrending: boolean;

  authorId: string;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

// Cast the data at source
const lists = listsData.lists as List[];

// Sort lists by date (most recent first)
const sortByDate = (lists: List[]): List[] => {
  return [...lists].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

// Get all lists
export function getAllLists(): List[] {
  return sortByDate(lists);
}

// Get public lists by authorId (only public and active for profile)
export function getListsByAuthorId(authorId: string): List[] {
  return sortByDate(lists.filter((list) => list.authorId === authorId) as List[]);
}

// Get active lists
export function getActiveLists(): List[] {
  return sortByDate(lists.filter((list) => list.status === 'ACTIVE') as List[]);
}

// Get public lists
export function getPublicLists(): List[] {
  return sortByDate(
    lists.filter((list) => list.visibility === 'PUBLIC' && list.status === 'ACTIVE') as List[],
  );
}

// Get deleted lists
export function getDeletedLists(): List[] {
  return sortByDate(lists.filter((list) => list.deletedAt !== null) as List[]);
}

// Get archived lists
export function getArchivedLists(): List[] {
  return sortByDate(lists.filter((list) => list.status === 'ARCHIVED') as List[]);
}

// Get a list by its ID
export function getListById(id: string): List | undefined {
  return lists.find((list) => list.id === id);
}

// Get all active lists by authorId for dashboard (including private lists for dashboard)
export function getDashboardLists(authorId: string): List[] {
  return lists.filter((list) => list.authorId === authorId && list.status === 'ACTIVE') as List[];
}

// Get discover lists
export function getDiscoverLists(): List[] {
  return sortByDate(
    lists.filter(
      (list) => list.isOnDiscover && list.status === 'ACTIVE' && list.visibility === 'PUBLIC',
    ) as List[],
  );
}

// Get featured lists
export function getFeaturedLists(): List[] {
  return sortByDate(
    lists.filter(
      (list) => list.isFeatured && list.status === 'ACTIVE' && list.visibility === 'PUBLIC',
    ) as List[],
  );
}

// Get latest lists with optional limit
export function getLatestLists(limit?: number): List[] {
  const activeLists = sortByDate(
    lists.filter((list) => list.status === 'ACTIVE' && list.visibility === 'PUBLIC') as List[],
  );

  return limit ? activeLists.slice(0, limit) : activeLists;
}

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
