const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCities() {
  const { data: cities, error } = await supabase
    .from('cities')
    .select('id, name_ar, name_en');

  if (error) {
    console.error('Error fetching cities:', error);
    return;
  }

  console.log(`Found ${cities.length} cities:`);
  console.table(cities);
}

checkCities();
