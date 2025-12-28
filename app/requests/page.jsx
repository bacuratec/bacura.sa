import { createClient } from '@/utils/supabase/server';
import ExploreContent from './ExploreContent';

export default async function RequestsPage() {
  const supabase = await createClient();
  
  let stats = {
    totalRequests: 0,
    totalRequestsRequesters: 0,
    projectsDiagnosisRequests: 0,
    consultationsRequests: 0,
    maintenanceContractsRequests: 0,
    trainingRequests: 0,
    projectsSupervisionRequests: 0,
    executionContractsRequests: 0,
    projectsManagementRequests: 0,
    wholesaleSupplyRequests: 0,
  };

  try {
    const { count, error } = await supabase
      .from("requests")
      .select("*", { count: "exact", head: true });

    if (!error) {
      stats.totalRequests = count || 0;
    }
  } catch (err) {
    console.error("Error fetching requests stats:", err);
  }

  return <ExploreContent stats={stats} />;
}
