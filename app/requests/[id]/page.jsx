import RequestDetailsContent from './RequestDetailsContent';

export default async function RequestDetailsPage({ params }) {
  const { id } = await params;
  // const supabase = await createClient();

  // Fetch request details
  // const { data: request } = await supabase
  //   .from('requests')
  //   .select(`
  //     *,
  //     service:services(id, name_ar, name_en, description, base_price),
  //     requestStatus:lookup_values!status_id(id, name_ar, name_en)
  //   `)
  //   .eq('id', id)
  //   .single();

  // If request found, format it to match what RequestDetails expects
  // let formattedRequest = null;
  // if (request) {
  //     formattedRequest = {
  //         ...request,
  //         // Map fields if necessary. 
  //         // RequestDetails expects: requestStatus.nameAr, service (array?), attachments
  //         // The API might return different structure.
  //         // For now, let's pass it as is and let the component handle it or fallback to client fetch.
  //         // Actually, if we pass formattedRequest, we need to ensure it has all required fields.
  //         // Since we can't easily replicate the whole API response with attachments and all relations without complex queries,
  //         // we will pass the ID and let the client fetch the full details for now, 
  //         // BUT we can pass basic details for SEO/Skeleton if we wanted.
          
  //         // However, RequestDetails uses `initialData` to SKIP client fetch.
  //         // If we provide incomplete data, the page might break.
  //         // So let's NOT pass initialData for now, but keep the server component structure ready.
  //     };
  // }

  // For now, we just pass the ID via params implicitly (handled by client component via useParams)
  // But we want to use the server component.
  // We can pass `id` prop to `RequestDetailsContent`.

  return <RequestDetailsContent id={id} />;
}
