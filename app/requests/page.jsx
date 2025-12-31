import { createClient } from '@/utils/supabase/server';
import ExploreContent from './ExploreContent';
import SeekerLayout from '@/components/Layouts/seeker-layout/SeekerLayout';

export default async function RequestsPage() {
  const supabase = await createClient();

  let stats = {
    totalRequestsCount: 0,
    underProcessingRequestsCount: 0,
    initiallyApprovedRequestsCount: 0,
    waitingForPaymentRequestsCount: 0,
    rejectedRequestsCount: 0,
    approvedRequestsCount: 0,
    newRequestssCount: 0,
  };

  try {
    const countFor = async (filters = {}) => {
      let query = supabase.from("requests").select("*", { count: "exact", head: true });
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") query = query.eq(k, v);
      });
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    };

    stats.totalRequestsCount = await countFor();
    stats.underProcessingRequestsCount = await countFor({ status_id: 500 });
    stats.initiallyApprovedRequestsCount = await countFor({ status_id: 501 });
    stats.waitingForPaymentRequestsCount = await countFor({ status_id: 502 });
    stats.rejectedRequestsCount = await countFor({ status_id: 503 });
    stats.approvedRequestsCount = await countFor({ status_id: 504 });
    stats.newRequestssCount = await countFor({ status_id: 505 });
  } catch (err) {
    console.error("Error fetching requests stats:", err);
  }

  // Check for user to optionally show layout
  const { data: { user } } = await supabase.auth.getUser();
  let requester = null;

  if (user) {
    const { data } = await supabase
      .from('requesters')
      .select('*')
      .eq('user_id', user.id)
      .single();
    requester = data;
  }

  if (requester) {
    return (
      <SeekerLayout requester={requester}>
        <ExploreContent stats={stats} />
      </SeekerLayout>
    );
  }

  return <ExploreContent stats={stats} />;
}

