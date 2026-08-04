export interface AvatarData {
  src?: string;
  alt?: string;
  initials?: string;
}

export interface AvatarGroupProps {
  className?: string;
  avatars: AvatarData[];
  size?: 24 | 32 | 56 | 96;
}
