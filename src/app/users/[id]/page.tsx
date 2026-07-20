import { getUserById } from "@/app/api/users/route";

interface UserPageProps {
  params: {
    id: string;
  };
}

export default function UserPage({ params }: UserPageProps) {
  const user = getUserById(params.id);

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.bio}</p>
    </div>
  );
}
