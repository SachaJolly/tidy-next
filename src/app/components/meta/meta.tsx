import React from "react";
import styles from "./meta.module.scss";

interface MetaProps {
  type?: keyof typeof styles; // Use keyof to ensure type safety with your CSS module
  children: React.ReactNode;
}

const Meta: React.FC<MetaProps> = ({ type, children }) => (
  <li className={styles[type || ""]}>{children}</li>
);

export default Meta;
