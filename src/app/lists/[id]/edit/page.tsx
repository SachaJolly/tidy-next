import { notFound, redirect } from "next/navigation";
import { api, ApiFetchError } from "@/lib/api";
import type { List, User } from "@/lib/types";
import Page from "@/app/layouts/page";
import EditListPage from "@/components/lists/edit-list-page";

interface EditListRoutePageProps {
  params: { id: string };
}

export default async function EditListRoutePage({ params }: EditListRoutePageProps) {
  const { id } = await params;

  let currentUser: User | null = null;
  try {
    currentUser = await api.auth.get<User>("/api/v1/me", { cache: "no-store" });
  } catch (error: unknown) {
    if (error instanceof ApiFetchError && error.status === 401) {
      redirect("/signin");
    }
    throw error;
  }

  const list = await api.get<List>(`/api/v1/lists/${id}`, { cache: "no-store" });
  if (!list || !currentUser || list.author?.id !== currentUser.id) {
    notFound();
  }

  return (
    <Page>
      <EditListPage
        listId={list.id}
        initialTitle={list.title}
        initialDescription={list.description}
      />
    </Page>
  );
}
