import NewListModal from '@/components/modals/NewListModal';
import { getNewListGate } from '@/lib/new-list-gate';

export default async function NewListPage() {
  const newListGate = await getNewListGate();

  return <NewListModal forceOpen newListGate={newListGate} />;
}
