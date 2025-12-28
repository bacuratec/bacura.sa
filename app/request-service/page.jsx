import { createClient } from '@/utils/supabase/server';
import RequestServiceContent from './RequestServiceContent';

export default async function RequestServicePage() {
  const supabase = await createClient();
  const { data: services } = await supabase.from('services').select('*').order('created_at', { ascending: true });

  return <RequestServiceContent services={services} />;
}
