import React from 'react';

import styles from './ItemBody.module.scss';

type ItemBodyProps = {
  body: string;
  small?: boolean;
};

export default function ItemBody({ body, small = false }: ItemBodyProps) {
  const contentClasses = `${styles.content} ${small && styles.smaller}`;

  return (
    <div
      className={contentClasses}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
