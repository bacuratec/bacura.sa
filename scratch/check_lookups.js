const { createClient } = require('@supabase/supabase-client');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  console.log('Checking lookup_types and lookup_values...');
  
  const { data: types, error: typesError } = await supabase
    .from('lookup_types')
    .select('*')
    .in('code', ['provider-entity-types', 'requester-entity-types']);
    
  if (typesError) {
    console.error('Error fetching lookup_types:', typesError);
    return;
  }
  
  console.log('Lookup Types found:', types);
  
  if (types.length > 0) {
    const typeIds = types.map(t => t.id);
    const { data: values, error: valuesError } = await supabase
      .from('lookup_values')
      .select('*')
      .in('lookup_type_id', typeIds);
      
    if (valuesError) {
      console.error('Error fetching lookup_values:', valuesError);
    } else {
      console.log('Lookup Values found:', values);
    }
  } else {
    console.log('No lookup types found with those codes.');
  }
}

check();
