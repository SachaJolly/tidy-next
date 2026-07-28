import { notFound } from 'next/navigation';
import Page from '@/app/layouts/page';
import PageHeader from '@/app/components/page-header/page-header';
import Section from '@/app/components/section/section';
import { Item } from '@/app/components/item/item'; // Renamed to avoid conflict
import Link from 'next/link';

import { api } from '@/lib/api';
import { List, Item as ItemType } from '@/lib/types'; // Import Item type

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps) {
  // In recent Next.js versions, props can be Promises. We need to await them.
  const awaitedParams = await params;
  const list = await api.get<List>(`/api/v1/lists/${awaitedParams.id}`);

  if (!list) return { title: 'List not found' };
  return { title: list.title };
}

export default async function ListPage({ params }: PageProps) {
  // We also await the params here.
  const awaitedParams = await params;
  const list = await api.get<List>(`/api/v1/lists/${awaitedParams.id}`);

  if (!list) {
    notFound();
  }

  const author = list.author;
  const items = list.items || [];

  return (
    <Page>
      <PageHeader title={list.title} caption={list.description}>
        <Link href={`/${author?.username}`}>{author?.name}</Link>
      </PageHeader>
      <Section>
        {/* Items Grid */}
        {items.map((item: ItemType) => (
          <Item item={item} key={item.id} />
        ))}

        {/* Empty State */}
        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items in this list yet.</p>
          </div>
        )}
      </Section>
    </Page>
  );
}
