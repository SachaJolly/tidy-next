import React from "react";
import styles from "./meta-data.module.scss";

interface MetaDataProps {
  type?: keyof typeof styles; // Use keyof to ensure type safety with your CSS module
  children: React.ReactNode;
}

const MetaData: React.FC<MetaDataProps> = ({ type, children }) => (
  <li className={styles[type || ""]}>{children}</li>
);

export default MetaData;
