import React from 'react';
import Section from '@/components/Section/Section';

type ProfileUnconfirmedVisibilitySectionProps = {
  title: string;
  description: string;
  action: string;
  isVisible: boolean;
};

export default function ProfileUnconfirmedVisibilitySection({
  title,
  description,
  action,
  isVisible,
}: ProfileUnconfirmedVisibilitySectionProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <Section>
      <div
        style={{
          border: '1px solid var(--border-default)',
          borderLeft: '4px solid var(--surface-interactive)',
          borderRadius: '0.75rem',
          background: 'var(--surface-highlight)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <p style={{ margin: 0, fontWeight: 500 }}>{title}</p>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>{description}</p>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>{action}</p>
      </div>
    </Section>
  );
}
