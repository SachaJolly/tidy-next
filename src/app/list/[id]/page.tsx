interface ListPageProps {
  params: {
    id: string;
  };
}

export default function ListPage({ params }: ListPageProps) {
  return (
    <div>
      <h1>Liste {params.id}</h1>
    </div>
  );
}
