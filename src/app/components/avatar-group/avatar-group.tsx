import Avatar from "@/app/components/avatar/avatar";
import styles from "./avatar-group.module.scss";

interface AvatarGroupProps {
  avatars: {
    src: string;
    alt: string;
    initials: string;
  }[];
  size?: "24" | "32" | "56" | "96";
  max?: number;
  className?: string;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  size = "24",
  max = 3,
  className = "",
}) => {
  const displayedAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={`${styles["avatar-group"]} ${className}`.trim()}>
      {displayedAvatars.map((avatar, index) => (
        <Avatar
          src={avatar.src}
          alt={avatar.alt}
          initials={avatar.initials}
          size={size}
          key={index}
        />
      ))}
      {remainingCount > 0 && (
        <div className={styles.avatarWrapper}>
          <div className={`${styles.counter} ${styles[`is-${size}`]}`}>
            +{remainingCount}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;
