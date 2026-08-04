import React from "react";
import styles from "./collection-list.module.scss"; // Assuming you're using CSS Modules

interface CollectionProps {
  children: React.ReactNode;
}

const Collection: React.FC<CollectionProps> = ({ children }) => (
  <section className={styles["collection-list"]}>{children}</section>
);

export default Collection;
