import Image from 'next/image';

import styles from './Avatar.module.scss';

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: '24' | '32' | '56' | '96';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, initials, size = '32', className = '' }) => {
  const classes = [styles.avatar, styles[`is-${size}`], className].filter(Boolean);
  const hasImage = Boolean(src && alt);

  return (
    <div className={classes.join(' ')} style={{ width: `${size}px`, height: `${size}px` }}>
      {hasImage && <Image src={src!} alt={alt!} fill sizes={`${size}px`} className="object-cover" />}
      {!hasImage && initials && <span className={styles.initials}>{initials}</span>}
    </div>
  );
};

export default Avatar;
