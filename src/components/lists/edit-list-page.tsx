"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import ListForm from "./list-form";
import { updateListAction } from "@/app/actions/lists";

interface EditListPageProps {
  listId: string;
  initialTitle: string;
  initialDescription: string | null;
}

export default function EditListPage({
  listId,
  initialTitle,
  initialDescription,
}: EditListPageProps) {
  const router = useRouter();
  const t = useTranslations("EditListModal");
  const listForm = useTranslations("forms");

  const handleSuccess = useCallback(() => {
    router.push(`/lists/${listId}`);
    router.refresh();
  }, [listId, router]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 className="h3">{t("title")}</h1>
        <p style={{ color: "var(--text-muted)" }}>{t("description")}</p>
      </div>

      <ListForm
        action={(values) => updateListAction(listId, values)}
        submitLabel={t("save")}
        cancelLabel={listForm("back")}
        initialTitle={initialTitle}
        initialDescription={initialDescription ?? ""}
        onCancel={() => router.back()}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
