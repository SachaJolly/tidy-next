import styles from "./page.module.scss";
import React from "react";

interface PageProps {
  children: React.ReactNode;
}

const Page: React.FC<PageProps> = ({ children }) => (
  <main className={styles["container"]}>
    <section className={styles["content"]}>{children}</section>
  </main>
);

export default Page;
