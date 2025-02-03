import React from "react";
import Page from "@/components/page/page";
import PageHeader from "@/components/page-header/page-header";
import CollectionList from "@/components/collection-list/collection-list";
import Section from "@/components/section/section";
import SectionHeader from "@/components/section-header/section-header";
import ListCard from "@/components/list-card/list-card";
// import './discover.module.scss';

import data from "@/api/lists.json";
import Hero from "../components/hero/hero";

enum Visibility {
  PRIVATE = "PRIVATE",
  UNINDEXED = "UNINDEXED",
  PUBLIC = "PUBLIC",
}

interface List {
  _id: { $oid: string };
  updatedAt: { $date: string };
  createdAt: { $date: string };
  _author: string;
  depth: number;
  _thumbnail?: string;
  color: string;
  title: string;
  _parents: any[];
  isOnDiscover: boolean;
  isFeatured: boolean;
  starsCount: number;
  itemsCount: number;
  visibility: Visibility;
  lifeState: string;
  __v: number;
  featuredAt?: { $date: string } | null;
  displayMode: string;
  bio?: string;
  _collaborators?: { $oid: string }[];
  collaboratorsCount: number;
}

const Discover: React.FC = () => {
  const featuredLists: List[] = data.lists
    .map((list) => ({
      ...list,
      visibility: list.visibility as Visibility,
      collaboratorsCount: list.collaboratorsCount ?? 0,
      displayMode: list.displayMode ?? "default",
    }))
    .filter((list) => list.isFeatured && list.visibility === Visibility.PUBLIC)
    .slice(0, 9);

  const trendingLists: List[] = data.lists
    .map((list) => ({
      ...list,
      visibility: list.visibility as Visibility,
      collaboratorsCount: list.collaboratorsCount ?? 0,
      displayMode: list.displayMode ?? "default",
    }))
    .filter((list) => list.visibility === Visibility.PUBLIC)
    .sort((a, b) => b.starsCount - a.starsCount)
    .slice(0, 32);

  return (
    <>
      <Hero />
      <Page>
        <PageHeader
          title="Discover"
          caption="Explore and discover the most popular lists on TidyCards."
        />
        <Section>
          <SectionHeader title="From our pick" />
          <CollectionList>
            {featuredLists.map((list, index) => (
              <ListCard
                _id={list._id}
                title={list.title}
                color={list.color}
                _thumbnail={list._thumbnail}
                visibility={list.visibility}
                itemsCount={list.itemsCount}
                starsCount={list.starsCount}
                isFeatured={list.isFeatured}
                bigger={index === 0}
                key={list._id.$oid}
              />
            ))}
          </CollectionList>
        </Section>
        <Section>
          <SectionHeader title="Trending" />
          <CollectionList>
            {trendingLists.map((list) => (
              <ListCard
                _id={list._id}
                title={list.title}
                color={list.color}
                _thumbnail={list._thumbnail}
                visibility={list.visibility}
                itemsCount={list.itemsCount}
                starsCount={list.starsCount}
                isFeatured={list.isFeatured}
                key={list._id.$oid}
              />
            ))}
          </CollectionList>
        </Section>
      </Page>
    </>
  );
};

export default Discover;
