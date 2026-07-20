"use client";

import React, { JSX } from "react";
import Page from "@/components/page/page";
import PageHeader from "@/components/page-header/page-header";
import CollectionList from "@/components/collection-list/collection-list";
import Section from "@/components/section/section";
import SectionHeader from "@/components/section-header/section-header";
import ListCard from "@/components/list-card/list-card";
import MetaGroup from "@/app/components/meta-group/meta-group";
import Meta from "@/app/components/meta/meta";

import { getDashboardLists } from "@/app/api/lists/route";
import { List } from "@/app/api/lists/route";

function Dashboard(): JSX.Element {
  //   const lists: List[] = listsFile.lists.concat(sortFile.customsorts || [])
  const lists: List[] = getDashboardLists("584348bf79a3c400042a5940");

  return (
    <Page>
      <PageHeader
        title="Dashboard"
        caption="Create, organise and collaborate on your lists and collections."
      />
      <Section>
        <SectionHeader title="My lists">
          <MetaGroup>
            <Meta>Default collection</Meta>
            <Meta>Only public lists are visible to everyone</Meta>
          </MetaGroup>
        </SectionHeader>
        <CollectionList>
          {lists.map((list) => (
            <ListCard list={list} key={list.id} />
          ))}
        </CollectionList>
      </Section>
    </Page>
  );
}

export default Dashboard;
