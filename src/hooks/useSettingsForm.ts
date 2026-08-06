'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

type Feedback<T extends string> = { type: 'success' | 'danger'; text: T } | null;

interface UseSettingsFormProps<T> {
  initialValue: T;
  onSave: (value: T) => Promise<void>;
  successMessage: string;
}

export function useSettingsForm<T>({
  initialValue,
  onSave,
  successMessage,
}: UseSettingsFormProps<T>) {
  const t = useTranslations('settings');
  const router = useRouter();
  const [value, setValue] = useState<T>(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback<string> | null>(null);

  // Reset state if the initial prop changes from the outside
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // A form is "dirty" if the current value is different from the initial one.
  // We use JSON.stringify for a simple deep comparison, suitable for serializable form state.
  const isDirty = JSON.stringify(value) !== JSON.stringify(initialValue);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!isDirty) return;

      setIsSaving(true);
      setFeedback(null);
      try {
        await onSave(value);
        setFeedback({ type: 'success', text: successMessage });
        router.refresh();
      } catch (error) {
        setFeedback({
          type: 'danger',
          text: error instanceof Error ? error.message : t('saveFailed'),
        });
      } finally {
        setIsSaving(false);
      }
    },
    [value, isDirty, onSave, successMessage, router, t]
  );

  return {
    value,
    setValue,
    isSaving,
    feedback,
    handleSubmit,
    isDirty,
  };
}
