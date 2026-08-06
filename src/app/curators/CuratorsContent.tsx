import React from 'react';
import PageLayout from '@/layouts/PageLayout';
import PageHeader from '@/components/PageHeader/PageHeader';
import Section from '@/components/Section/Section';
import Hero from '@/components/Hero/Hero';
import ProfileCard, { type ProfileCardEntry } from '@/components/ProfileCard/ProfileCard';

type CuratorApiEntry = Omit<ProfileCardEntry, 'handle'> & {
  handle?: string;
  username?: string;
  slug?: string;
};

type CuratorsContentProps = {
  isAuthenticated: boolean;
  title: string;
  caption: string;
  curators: CuratorApiEntry[];
};

export default function CuratorsContent({ isAuthenticated, title, caption, curators }: CuratorsContentProps) {
  const profileCards: ProfileCardEntry[] = curators.map((curator) => ({
    ...curator,
    handle: curator.handle ?? curator.username ?? curator.slug ?? '',
  }));

  return (
    <>
      {!isAuthenticated && <Hero variant="horizontal" />}
      <PageLayout>
        <PageHeader title={title} caption={caption} />
        <Section>
          {profileCards.map((curator) => (
            <ProfileCard key={curator.id} profile={curator} />
          ))}
        </Section>
      </PageLayout>
    </>
  );
}
