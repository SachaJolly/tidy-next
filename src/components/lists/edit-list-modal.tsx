"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Button from "@/components/button/button";
import { Modal, ModalClose, ModalContent, ModalHeader } from "@/components/modal/modal";
import ListForm from "@/components/lists/list-form";
import { updateListAction } from "@/app/actions/lists";

interface EditListModalProps {
  listId: string;
  initialTitle: string;
  initialDescription: string | null;
  trigger?: (open: () => void) => React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function EditListModal({
  listId,
  initialTitle,
  initialDescription,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: EditListModalProps) {
  const router = useRouter();
  const t = useTranslations("EditListModal");

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const closeModal = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleEdit = useCallback(
    async (values: { title: string; description: string }) => updateListAction(listId, values),
    [listId],
  );

  const handleSuccess = useCallback(() => {
    setOpen(false);
    router.refresh();
  }, [router, setOpen]);

  const openModal = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const showDefaultTrigger = !trigger && !isControlled;

  return (
    <>
      {trigger ? (
        trigger(openModal)
      ) : showDefaultTrigger ? (
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
      ) : null}

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
