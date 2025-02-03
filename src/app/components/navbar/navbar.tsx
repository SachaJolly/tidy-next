"use client";

import React from "react";
import styles from "./navbar.module.scss";
import Button from "@/app/components/button/button";
import ButtonGroup from "@/app/components/button-group/button-group";
import NavLink from "@/app/components/nav-link/nav-link";
import { usePathname } from "next/navigation";
import Icon from "@/app/components/icon/icon";
import Avatar from "../avatar/avatar";

interface NavbarProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({}) => {
  const pathname = usePathname();

  return (
    <nav className={styles["container"]}>
      <div className={styles["content"]}>
        <NavLink href="/" className="brand">
          <img src="/img/logo-tidycards.svg" alt="TidyCards" />
        </NavLink>

        <form action="/search" className={styles["search-container"]}>
          <Icon name="search" />
          <input
            type="text"
            name="search"
            className={styles["search-input"]}
            placeholder="Search on Tidycards…"
          />
        </form>

        <div className={styles["nav-links"]}>
          <NavLink
            href="/dashboard"
            label="Dashboard"
            active={pathname === "/dashboard"}
          />
          <NavLink
            href="/discover"
            label="Discover"
            active={pathname === "/discover"}
          />
          <NavLink
            href="/curators"
            label="Curators"
            active={pathname === "/curators"}
          />
          <NavLink
            href="/latest"
            label="Latest"
            active={pathname === "/latest"}
          />
        </div>

        <ButtonGroup>
          <Button
            label="Create list"
            type="interactive"
            tinted={true}
            icon="add"
          />
        </ButtonGroup>

        <div className={styles["nav-account"]}>
          <NavLink
            href="/@alexandra"
            label="Alexandra"
            active={pathname === "/@alexandra"}
            suffix={
              <Avatar
                initials="A"
                size="32"
                src="/img/avatar-alexandra.jpeg"
                alt="Alexandra"
              />
            }
          />
          <NavLink icon="more_vert" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
