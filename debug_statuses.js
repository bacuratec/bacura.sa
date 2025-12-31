
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tqskjoufozgyactjnrix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2tqb3Vmb3pneWFjdGpucml4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQxMTM0NywiZXhwIjoyMDgxOTg3MzQ3fQ.xRU624hUrN8FTprG-LDYBiRhfLYb1oxDn2JowoX3QtU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    try {
        console.log('--- All Lookup Values ---');
        const { data: allValues, error } = await supabase
            .from('lookup_values')
            .select('id, name_ar, name_en, code, lookup_type_id');

        if (error) console.error('Error:', error);
        else console.table(allValues);

        console.log('\n--- Lookup Types ---');
        const { data: allTypes } = await supabase
            .from('lookup_types')
            .select('id, name, code');
        console.table(allTypes);

    } catch (e) {
        console.error('CRITICAL ERROR:', e);
    }
}

debug();
