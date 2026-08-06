import React from 'react';

import styles from './InputGroup.module.scss';

interface InputGroupProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Inline wrapper that joins an Input (or Textarea) with an adjacent Button
 * into a single bordered row. The first child expands to fill available space;
 * the last child (the button) stays fixed-width and is visually attached.
 *
 * Usage:
 *   <InputGroup>
 *     <Input id="email" value={email} onChange={…} />
 *     <Button type="submit" variant="interactive">Save</Button>
 *   </InputGroup>
 */
export default function InputGroup({ children, className }: InputGroupProps) {
  const classes = [styles.group, className].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
}
