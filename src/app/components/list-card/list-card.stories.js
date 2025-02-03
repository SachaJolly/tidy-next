import { fn } from "@storybook/test";

import ListCard from "./list-card";
import "./list-card.module.scss";

export default {
  title: "Components/List Card",
  component: ListCard,
  parameters: {
    layout: "centered",
  },
  docs: {
    controls: { sort: "requiredFirst" },
  },
  tags: ["autodocs"],
  argTypes: {
    color: { control: "color" },
    isPinned: { control: "boolean" },
    isFeatured: { control: "boolean" },
    isPopular: { control: "boolean" },
    isTrending: { control: "boolean" },
    isOnDiscover: { control: "boolean" },
    visibility: {
      control: "select",
      options: ["PRIVATE", "UNINDEXED", "PUBLIC"],
    },
    bigger: { control: "boolean" },
    displayMode: { control: "select", options: ["GRID", "LIST"] },
  },
  args: {
    _id: {
      $oid: "5a6f3d78b5df6d00042ceeb1",
    },
    _author: "584348bf79a3c400042a5940",
    color: "FF887A",
    title: "Vidéastes incontournables",
    isOnDiscover: true,
    isPinned: false,
    isFeatured: false,
    isPopular: false,
    isTrending: false,
    starsCount: 0,
    itemsCount: 0,
    visibility: "PUBLIC",
    displayMode: "LIST",
    lifeState: "ACTIVE",
    bio: "Voici une liste non exhaustive des vidéastes qui font un travail génial et de qualité. Mais cela ne reste que mon humble avis.",

    _collaborators: [],
    collaboratorsCount: 0,
  },
};

export const Default = {
  args: {},
};

export const Items = {
  args: {
    itemsCount: 67,
  },
};

export const Notes = {
  args: {
    starsCount: 1,
  },
};

export const Thumbnail = {
  args: {
    itemsCount: 67,
    starsCount: 1,
    _thumbnail: "5ca7a2cfd0e7b90004198839",
  },
};

export const Pinned = {
  args: {
    itemsCount: 67,
    starsCount: 1,
    _thumbnail: "5ca7a2cfd0e7b90004198839",
    isFeatured: true,
    isPinned: true,
    visibility: "PRIVATE",
  },
};

export const Private = {
  args: {
    itemsCount: 67,
    starsCount: 1,
    _thumbnail: "5ca7a2cfd0e7b90004198839",
    isFeatured: true,
    visibility: "PRIVATE",
  },
};

export const Unindexed = {
  args: {
    itemsCount: 67,
    starsCount: 1,
    _thumbnail: "5ca7a2cfd0e7b90004198839",
    isFeatured: true,
    visibility: "UNINDEXED",
  },
};

export const Featured = {
  args: {
    itemsCount: 67,
    starsCount: 1,
    _thumbnail: "5ca7a2cfd0e7b90004198839",
    visibility: "PUBLIC",
    isFeatured: true,
  },
};

export const Popular = {
  args: {
    itemsCount: 67,
    starsCount: 1,
    _thumbnail: "5ca7a2cfd0e7b90004198839",
    visibility: "PUBLIC",
    isPopular: true,
  },
};

export const Trending = {
  args: {
    itemsCount: 67,
    starsCount: 1,
    _thumbnail: "5ca7a2cfd0e7b90004198839",
    visibility: "PUBLIC",
    isTrending: true,
  },
};
