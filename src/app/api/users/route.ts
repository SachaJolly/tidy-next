import usersData from "@/data/users.json";

// Types
export type User = {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  role: "ADMIN" | "USER";

  email: string;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  emailVerificationToken: string | null;
  emailVerificationTokenExpiresAt: string | null;

  password: {
    hash: string;
    salt: string;
    resetToken: string | null;
    resetTokenExpiresAt: string | null;
    lastChangedAt: string;
  };

  avatar: string | null;
  cover: string | null;

  social: {
    website: string | null;
    twitter: string | null;
    github: string | null;
    linkedin: string | null;
  };

  stats: {
    listsCount: number;
    followersCount: number;
    followingCount: number;
  };

  preferences: {
    theme: "LIGHT" | "DARK";
    language: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };

  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

// Utils
const sortByDate = (users: User[]): User[] => {
  return [...users].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

// Cast the data at source
const users = usersData.users as User[];

// Basic queries
export function getAllUsers(): User[] {
  return sortByDate(users);
}

export function getUserById(id: string): User | undefined {
  return users.find((user) => user.id === id) as User | undefined;
}

export function getUserByUsername(username: string): User | undefined {
  return users.find((user) => user.username === username) as User | undefined;
}

export function getUserByEmail(email: string): User | undefined {
  return users.find((user) => user.email === email) as User | undefined;
}

// Status-based queries
export function getActiveUsers(): User[] {
  return sortByDate(users.filter((user) => user.status === "ACTIVE") as User[]);
}

export function getBannedUsers(): User[] {
  return sortByDate(users.filter((user) => user.status === "BANNED") as User[]);
}

// Role-based queries
export function getAdminUsers(): User[] {
  return sortByDate(users.filter((user) => user.role === "ADMIN") as User[]);
}

// Verification queries
export function getVerifiedUsers(): User[] {
  return sortByDate(users.filter((user) => user.emailVerified) as User[]);
}

export function getUnverifiedUsers(): User[] {
  return sortByDate(users.filter((user) => !user.emailVerified) as User[]);
}

// Stats-based queries
export function getMostFollowedUsers(limit?: number): User[] {
  const sortedUsers = [...users].sort(
    (a, b) => b.stats.followersCount - a.stats.followersCount,
  );
  return limit ? sortedUsers.slice(0, limit) : sortedUsers;
}

export function getMostActiveUsers(limit?: number): User[] {
  const sortedUsers = [...users].sort(
    (a, b) => b.stats.listsCount - a.stats.listsCount,
  );
  return limit ? sortedUsers.slice(0, limit) : sortedUsers;
}

// Time-based queries
export function getRecentlyActiveUsers(days: number = 7): User[] {
  const now = new Date();
  const cutoff = new Date(now.setDate(now.getDate() - days));

  return sortByDate(
    users.filter((user) => new Date(user.lastLoginAt) > cutoff),
  );
}

// Search queries
export function searchUsers(query: string): User[] {
  const lowercaseQuery = query.toLowerCase();

  return sortByDate(
    users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowercaseQuery) ||
        user.username.toLowerCase().includes(lowercaseQuery) ||
        user.email.toLowerCase().includes(lowercaseQuery) ||
        (user.bio && user.bio.toLowerCase().includes(lowercaseQuery)),
    ),
  );
}
