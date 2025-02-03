import Image from "next/image";
import styles from "./avatar.module.scss";

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: "24" | "32" | "56" | "96";
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  initials,
  size = "32",
  className = "",
}) => {
  const classes = [styles.avatar, styles[`is-${size}`], className].filter(
    Boolean,
  );

  return (
    <div
      className={classes.join(" ")}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {src && alt && (
        <Image src={src} alt={alt} fill className="object-cover" />
      )}
      {initials && <span className={styles.initials}>{initials}</span>}
    </div>
  );
};

export default Avatar;
