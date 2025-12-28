
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tqskjoufozgyactjnrix.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2tqb3Vmb3pneWFjdGpucml4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQxMTM0NywiZXhwIjoyMDgxOTg3MzQ3fQ.xRU624hUrN8FTprG-LDYBiRhfLYb1oxDn2JowoX3QtU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const email = 'rafrs2030@gmail.com';
const password = 'Admin@123';

async function fixUser() {
  console.log(`Checking user: ${email}...`);

  // 1. Check if user exists in Auth
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  let user = users.find(u => u.email === email);

  if (user) {
    console.log(`User found (ID: ${user.id}). Updating password...`);
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: password, email_confirm: true, user_metadata: { role: 'Admin' } }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
    } else {
      console.log('Password updated successfully.');
    }
  } else {
    console.log('User not found. Creating new user...');
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { role: 'Admin' }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return;
    }
    user = data.user;
    console.log(`User created successfully (ID: ${user.id}).`);
  }

  // 2. Ensure user exists in public.users
  if (user) {
    console.log('Checking public.users table...');
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking public.users:', dbError);
    }

    if (!dbUser) {
      console.log('User not found in public.users. Inserting...');
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: email,
          role: 'Admin',
          is_blocked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting into public.users:', insertError);
      } else {
        console.log('User inserted into public.users successfully.');
      }
    } else {
      console.log('User exists in public.users. Updating role...');
      const { error: updateDbError } = await supabase
        .from('users')
        .update({ role: 'Admin', is_blocked: false })
        .eq('id', user.id);

      if (updateDbError) {
        console.error('Error updating public.users:', updateDbError);
      } else {
        console.log('User role updated in public.users successfully.');
      }
    }
  }
}

fixUser();
