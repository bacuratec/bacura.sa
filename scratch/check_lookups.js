const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkLookups() {
  const { data: lookupType, error: lookupTypeError } = await supabase
    .from('lookup_types')
    .select('id, code')
    .in('code', ['provider-entity-types', 'requester-entity-types']);

  if (lookupTypeError) {
    console.error('Error fetching lookup types:', lookupTypeError);
    return;
  }

  for (const type of lookupType) {
    console.log(`\nLookup Type: ${type.code} (ID: ${type.id})`);
    const { data: values, error: valuesError } = await supabase
      .from('lookup_values')
      .select('id, code, name_ar, name_en')
      .eq('lookup_type_id', type.id);

    if (valuesError) {
      console.error(`Error fetching values for ${type.code}:`, valuesError);
      continue;
    }

    console.table(values);
  }
}

checkLookups();
