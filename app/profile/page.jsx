import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ProfileContent from './ProfileContent';
import SeekerLayout from '@/components/Layouts/seeker-layout/SeekerLayout';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login?from=%2Fprofile');
  }

  // Safety check for role (Middleware should handle this, but double check)
  const role = user.user_metadata?.role;
  if (role === 'Admin') {
    redirect('/admin');
  }
  if (role === 'Provider') {
    redirect('/provider');
  }

  // Fetch requester details
  const { data: requester } = await supabase
    .from('requesters')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // If requester not found (maybe Provider or Admin), handle appropriately
  // For now assuming Requester.

  // Fetch tickets
  const { data: tickets } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', user.id);

  // Fetch project stats
  // This requires complex aggregation which might be better in RPC or just fetching orders and counting in JS for now (if small scale)
  // or simple count queries.

  const stats = {
    totalOrdersCount: 0,
    waitingForApprovalOrdersCount: 0,
    waitingToStartOrdersCount: 0,
    ongoingOrdersCount: 0,
    completedOrdersCount: 0,
    serviceCompletedOrdersCount: 0,
  };

  // Example stats fetching (simplified)
  if (requester) {
    // Assuming requester_id in orders is the requester UUID, not user_id. 
    // But requester table has user_id.
    // Schema: orders has requester_id (UUID references requests(id)? No, references requesters(id) in older schema? 
    // Let's check schema: orders references requests(id). requests references requesters(id).

    // So to get orders for this user:
    // Join orders -> requests -> requesters -> user_id = user.id

    const { data: orders } = await supabase
      .from('orders')
      .select('order_status_id, requests!inner(requester_id)')
      .eq('requests.requester_id', requester.id);

    if (orders) {
      stats.totalOrdersCount = orders.length;
      // Calculate other stats based on order_status_id
      // This requires knowing the IDs for statuses.
    }
  }

  return (
    <SeekerLayout requester={requester}>
      <ProfileContent requester={requester} tickets={tickets} stats={stats} />
    </SeekerLayout>
  );
}
