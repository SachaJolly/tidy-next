import React from "react";
import styles from "./meta-group.module.scss";

interface MetaGroupProps {
  children: React.ReactNode;
}

const MetaGroup: React.FC<MetaGroupProps> = ({ children }) => (
  <div className={styles["group"]}>{children}</div>
);

export default MetaGroup;
