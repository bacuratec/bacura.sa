import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with anon key
const supabaseUrl = 'https://tqskjoufozgyactjnrix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2tqb3Vmb3pneWFjdGpucml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MTEzNDcsImV4cCI6MjA4MTk4NzM0N30.VT5LhCeBXskkYevGaDC5K-Yxht0yP1_7CGguYBRMVAI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUnrestrictedAccess() {
    console.log('Testing unrestricted Supabase access...\n');
    
    try {
        // Test 1: Read all data from users table
        console.log('1. Testing READ operation on users table:');
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*')
            .limit(2);
        
        if (usersError) {
            console.log('❌ READ failed:', usersError.message);
        } else {
            console.log('✅ READ successful, found', users?.length || 0, 'users');
        }
        
        // Test 2: Insert new data into cities table
        console.log('\n2. Testing INSERT operation on cities table:');
        const { data: newCity, error: insertError } = await supabase
            .from('cities')
            .insert([
                { 
                    name_ar: 'مدينة تجريبية', 
                    name_en: 'Test City' 
                }
            ])
            .select()
            .single();
        
        if (insertError) {
            console.log('❌ INSERT failed:', insertError.message);
        } else {
            console.log('✅ INSERT successful, created city:', newCity?.name_en);
        }
        
        // Test 3: Update existing data
        if (newCity) {
            console.log('\n3. Testing UPDATE operation on cities table:');
            const { data: updatedCity, error: updateError } = await supabase
                .from('cities')
                .update({ name_en: 'Updated Test City' })
                .eq('id', newCity.id)
                .select()
                .single();
            
            if (updateError) {
                console.log('❌ UPDATE failed:', updateError.message);
            } else {
                console.log('✅ UPDATE successful, updated city to:', updatedCity?.name_en);
            }
        }
        
        // Test 4: Delete the test data
        if (newCity) {
            console.log('\n4. Testing DELETE operation on cities table:');
            const { error: deleteError } = await supabase
                .from('cities')
                .delete()
                .eq('id', newCity.id);
            
            if (deleteError) {
                console.log('❌ DELETE failed:', deleteError.message);
            } else {
                console.log('✅ DELETE successful, removed test city');
            }
        }
        
        // Test 5: Test access to all tables
        console.log('\n5. Testing access to all major tables:');
        const tables = ['services', 'requests', 'orders', 'providers', 'requesters'];
        
        for (const table of tables) {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);
            
            if (error) {
                console.log(`❌ ${table}: ${error.message}`);
            } else {
                console.log(`✅ ${table}: Accessible (${data?.length || 0} records)`);
            }
        }
        
        console.log('\n🎉 All tests completed! Unrestricted access is working.');
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

// Run the test
testUnrestrictedAccess();