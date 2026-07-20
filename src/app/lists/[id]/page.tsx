import { notFound } from "next/navigation";
import { getListById, getListWithItemsAndAuthor } from "@/app/api/lists/route";
import { getListItems } from "@/app/api/items/route";
import { getUserById } from "@/app/api/users/route";
import Link from "next/link";
import { Item } from "@/app/components/item/item";
import Page from "@/app/components/page/page";
import PageHeader from "@/app/components/page-header/page-header";
import Section from "@/app/components/section/section";

interface PageProps {
  params: { id: string };
}

// Gérer les paramètres dynamiques
export async function generateMetadata({ params }: PageProps) {
  const { list } = await getListWithItemsAndAuthor(params.id);
  if (!list) return { title: "Liste non trouvée" };
  return { title: list.title };
}

export default async function ListPage({ params }: PageProps) {
  const { list, items, author } = await getListWithItemsAndAuthor(params.id);

  if (!list) {
    notFound();
  }

  return (
    <Page>
      <PageHeader title={list.title} caption={list.description}>
        <Link href={`/profile/${author?.id}`}>{author?.name}</Link>
      </PageHeader>
      <Section>
        {/* Items Grid */}
        {items.map((item: any) => (
          <Item key={item.id} item={item} />
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
