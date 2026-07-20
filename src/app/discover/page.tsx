import React from "react";
import Page from "@/components/page/page";
import PageHeader from "@/components/page-header/page-header";
import CollectionList from "@/components/collection-list/collection-list";
import Section from "@/components/section/section";
import SectionHeader from "@/components/section-header/section-header";
import ListCard from "@/components/list-card/list-card";
// import './discover.module.scss';

import Hero from "../components/hero/hero";
import { getFeaturedLists, getPublicLists } from "@/app/api/lists/route";

const Discover: React.FC = () => {
  const featuredLists = getFeaturedLists().slice(0, 9);
  const trendingLists = getPublicLists()
    .sort((a, b) => b.notes - a.notes)
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
              <ListCard list={list} bigger={index === 0} key={list.id} />
            ))}
          </CollectionList>
        </Section>
        <Section>
          <SectionHeader title="Trending" />
          <CollectionList>
            {trendingLists.map((list) => (
              <ListCard list={list} key={list.id} />
            ))}
          </CollectionList>
        </Section>
      </Page>
    </>
  );
};

export default Discover;
