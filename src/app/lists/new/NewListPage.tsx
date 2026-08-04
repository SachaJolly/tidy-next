'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ListForm from '@/components/Lists/ListForm';
import type { List } from '@/lib/types';

export default function NewListPage() {
  const t = useTranslations('NewList');
  const router = useRouter();

  const handleSuccess = useCallback(
    (list: List) => {
      router.push(`/lists/${list.id}`);
      router.refresh();
    },
    [router],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 className="h3">{t('title')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('description')}</p>
      </div>

      <ListForm
        submitLabel={t('createList')}
        cancelLabel={t('back')}
        onCancel={() => router.back()}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
