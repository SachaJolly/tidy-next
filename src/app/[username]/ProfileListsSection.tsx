import React from 'react';
import Section from '@/components/Section/Section';
import SectionHeader from '@/components/SectionHeader/SectionHeader';
import CollectionList from '@/components/CollectionList/CollectionList';
import ListCard from '@/components/ListCard/ListCard';
import { List } from '@/lib/types';

type ProfileListsSectionProps = {
  publicLists: List[];
  canManage?: boolean;
  title: string;
};

export default function ProfileListsSection({ publicLists, canManage = false, title }: ProfileListsSectionProps) {
  if (publicLists.length === 0) {
    return null;
  }

  return (
    <Section>
      <SectionHeader title={title} />
      <CollectionList>
        {publicLists.map((list) => (
          <ListCard list={list} key={list.id} canManage={canManage} />
        ))}
      </CollectionList>
    </Section>
  );
}
