import { createClient } from '@/utils/supabase/server';
import TicketsContent from './TicketsContent';
import SeekerLayout from '@/components/Layouts/seeker-layout/SeekerLayout';

export default async function TicketsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let requester = null;
  if (user) {
    const { data } = await supabase.from('requesters').select('*').eq('user_id', user.id).single();
    requester = data;
  }

  if (requester) {
    return (
      <SeekerLayout requester={requester}>
        <TicketsContent />
      </SeekerLayout>
    );
  }

  return <TicketsContent />;
}

