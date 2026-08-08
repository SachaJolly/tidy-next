import NewListModal from '@/components/modals/NewListModal';
import { getNewListGate } from '@/lib/new-list-gate';

/**
 * Route counterpart of the `?modal=new-list` param.
 *
 * The modal normally lives on top of whatever page you were on, driven by the query string.
 * This route exists so `/lists/new` stays a real, shareable, crawlable address: opening it
 * cold renders the same modal server-side instead of a blank page.
 *
 * `forceOpen` tells the modal to ignore the query param and to close by going back in
 * history, since here there is no underlying page to simply reveal.
 */
export default async function NewListPage() {
  // Resolved on the server so the creation limit is known before the form paints — the
  // client cannot be trusted with it and a late check would flash the form first.
  const newListGate = await getNewListGate();

  return <NewListModal forceOpen newListGate={newListGate} />;
}
