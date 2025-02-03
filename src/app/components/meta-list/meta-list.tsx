import React from "react";
import styles from "./meta-list.module.scss";

interface MetaListProps {
  children: React.ReactNode;
}

const MetaList: React.FC<MetaListProps> = ({ children }) => (
  <ul className={styles["list"]}>{children}</ul>
);

export default MetaList;
