import { createClient } from '@/utils/supabase/server';
import RequestServiceContent from './RequestServiceContent';
import { redirect } from 'next/navigation';

export default async function RequestServicePage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?next=/request-service');
  }
  
  const { data: services } = await supabase.from('services').select('*').order('created_at', { ascending: true });

  return <RequestServiceContent services={services} />;
}
