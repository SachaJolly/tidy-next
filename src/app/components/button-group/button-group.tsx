import React from "react";
import styles from "./button-group.module.scss"; // Assuming you're using CSS Modules

interface ButtonGroupProps {
  children: React.ReactNode;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ children }) => (
  <div className={styles["btn-group"]}>{children}</div>
);

export default ButtonGroup;
