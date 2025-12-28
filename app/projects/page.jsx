import { createClient } from '@/utils/supabase/server';
import ProjectsContent from './ProjectsContent';

export default async function ProjectsPage() {
  const supabase = await createClient();
  
  let stats = {
    totalOrdersCount: 0,
    inProgressOrdersCount: 0,
    completedOrdersCount: 0,
    cancelledOrdersCount: 0,
  };

  try {
    const { count, error } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    if (!error) {
      stats.totalOrdersCount = count || 0;
    }
  } catch (err) {
    console.error("Error fetching projects stats:", err);
  }

  return <ProjectsContent stats={stats} />;
}
