import Avatar from "./avatar";
import "./avatar.module.scss";

export default {
  title: "Components/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    initials: { control: "text" },
    src: { control: "text" },
    alt: { control: "text" },
    size: {
      control: "select",
      options: ["24", "32", "56", "96"],
      defaultValue: "32",
    },
  },
  args: {
    initials: "A",
    size: 32,
  },
};

export const Default = {
  args: {},
};

export const WithImage = {
  args: {
    src: "img/avatar-alexandra.jpeg",
    alt: "Alexandra",
    size: 32,
  },
};

export const AllSizes = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "1rem",
        alignItems: "center",
      }}
    >
      <Avatar initials="A" size={24} />
      <Avatar initials="A" size={32} />
      <Avatar initials="A" size={56} />
      <Avatar initials="A" size={96} />
    </div>
  ),
};
