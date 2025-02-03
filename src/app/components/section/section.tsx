import React from "react";
import styles from "./section.module.scss";

interface SectionProps {
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ children }) => (
  <section className={styles["container"]}>{children}</section>
);

export default Section;
