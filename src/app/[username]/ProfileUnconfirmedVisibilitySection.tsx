import React from 'react';
import Section from '@/components/Section/Section';
import Notice from '@/components/Notice/Notice';

type ProfileUnconfirmedVisibilitySectionProps = {
  title?: string;
  description?: string;
  actions?: Array<{ label: string; href: string }>;
  variant?: 'information' | 'warning' | 'error' | 'success' | 'discovery';
  isVisible: boolean;
};

export default function ProfileUnconfirmedVisibilitySection({
  title,
  description,
  actions,
  variant = 'information',
  isVisible,
}: ProfileUnconfirmedVisibilitySectionProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <Section>
      <Notice
        variant={variant}
        title={title}
        description={description}
        actions={actions}
      />
    </Section>
  );
}
