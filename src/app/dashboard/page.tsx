"use client";

import React, { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import { useAuth } from "@/contexts/AuthContext";
import Page from "@/app/layouts/page";
import PageHeader from "@/components/page-header/page-header";
import CollectionList from "@/components/collection-list/collection-list";
import Section from "@/components/section/section";
import SectionHeader from "@/components/section-header/section-header";
import ListCard from "@/components/list-card/list-card";
import MetaGroup from "@/components/meta-group/meta-group";
import Meta from "@/components/meta/meta";
import { List } from "@/lib/types";
import Button from "@/components/button/button";

function Dashboard(): JSX.Element {
  const router = useRouter();
  const { logout } = useAuth();
  const [lists, setLists] = useState<List[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("tidy_token");
    if (!token) {
      router.push("/signin");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_TIDY_API_URL}/api/v1/me/lists`, {
      headers: { Authorization: token },
    })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) {
            // The token is invalid or expired. The global logout function
            // will handle clearing cookies and redirecting.
            logout();
          }
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(errorBody.message || `Failed to load lists: ${response.status}`);
        }
        return response.json();
      })
      .then((body) => {
        const flattenedLists = body.data.map((item: any) => ({
          id: item.id,
          ...item.attributes,
        }));
        setLists(flattenedLists);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router, logout]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

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
          {lists && lists.length > 0 ? (
            lists.map((list) => (
              <ListCard list={list} key={list.id} />
            ))
          ) : (
            <p>You haven't created any lists yet.</p>
          )}
        </CollectionList>
      </Section>
    </Page>
  );
}

export default Dashboard;
