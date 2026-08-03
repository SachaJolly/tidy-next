"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Button from "@/components/button/button";
import { Modal, ModalClose, ModalContent, ModalHeader } from "@/components/modal/modal";
import ListForm from "@/app/components/lists/list-form";
import { updateListAction } from "@/app/actions/lists";

interface EditListModalProps {
  listId: string;
  initialTitle: string;
  initialDescription: string | null;
  trigger?: (open: () => void) => React.ReactNode;
}

export default function EditListModal({
  listId,
  initialTitle,
  initialDescription,
  trigger,
}: EditListModalProps) {
  const router = useRouter();
  const t = useTranslations("EditListModal");

  const [isOpen, setIsOpen] = useState(false);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleEdit = useCallback(
    async (values: { title: string; description: string }) => updateListAction(listId, values),
    [listId],
  );

  const handleSuccess = useCallback(() => {
    setIsOpen(false);
    router.refresh();
  }, [router]);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  return (
    <>
      {trigger ? (
        trigger(openModal)
      ) : (
        <Button
          icon="edit"
          label={t("trigger")}
          variant="interactive"
          tinted={true}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={openModal}
        />
      )}

      {isOpen && (
        <Modal size="default" onClose={closeModal}>
          <ModalHeader>
            <h2>{t("title")}</h2>
            <ModalClose />
          </ModalHeader>

          <ModalContent>
            <p className="text-small">{t("description")}</p>
            <ListForm
              action={handleEdit}
              submitLabel={t("save")}
              initialTitle={initialTitle}
              initialDescription={initialDescription ?? ""}
              onCancel={closeModal}
              onSuccess={handleSuccess}
            />
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
