"use client";

import React, { JSX } from "react";
import Page from "@/components/page/page";
import PageHeader from "@/components/page-header/page-header";
import CollectionList from "@/components/collection-list/collection-list";
import Section from "@/components/section/section";
import SectionHeader from "@/components/section-header/section-header";
import ListCard from "@/components/list-card/list-card";
import Meta from "@/components/meta-list/meta-list";
import MetaData from "@/components/meta-data/meta-data";

import listsFile from "@/api/lists.json";
import sortFile from "@/api/customsorts.json";

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

function Dashboard(): JSX.Element {
  //   const lists: List[] = listsFile.lists.concat(sortFile.customsorts || [])
  const lists: List[] = listsFile.lists
    .map((list) => ({
      ...list,
      _collaborators: list._collaborators || [],
      collaboratorsCount: list.collaboratorsCount ?? 0,
      displayMode: list.displayMode || "default",
      visibility: list.visibility as Visibility,
    }))
    .filter((list) => list._author === "584348bf79a3c400042a5940")
    .sort((a, b) => a.starsCount - b.starsCount);

  return (
    <Page>
      <PageHeader
        title="Dashboard"
        caption="Create, organise and collaborate on your lists and collections."
      />
      <Section>
        <SectionHeader title="My lists">
          <Meta>
            <MetaData>Default collection</MetaData>
            <MetaData>Only public lists are visible to everyone</MetaData>
          </Meta>
        </SectionHeader>
        <CollectionList>
          {lists.map((list) => (
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
  );
}

export default Dashboard;
