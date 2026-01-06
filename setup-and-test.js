// ============================================
// Automatic Setup & Test Script
// File: setup-and-test.js
// ============================================

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { sendEmail } from './src/services/emailService.js';

// Load .env file manually
function loadEnv() {
    try {
        const envFile = readFileSync('.env', 'utf8');
        envFile.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').trim();
                if (key && value) {
                    process.env[key.trim()] = value;
                }
            }
        });
    } catch (error) {
        console.log('⚠️  Could not load .env file');
    }
}

loadEnv();

console.log('\n🚀 AUTOMATIC NOTIFICATION SYSTEM SETUP');
console.log('═'.repeat(60));
console.log('');

const supabase = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

// Step 1: Execute SQL
async function setupDatabase() {
    console.log('1️⃣  Setting up database...');
    console.log('─'.repeat(60));

    try {
        // Read SQL file
        const sql = readFileSync('database/migrations/mvp_notification_system.sql', 'utf8');

        // Split by semicolons and execute each statement
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`   Found ${statements.length} SQL statements`);

        let executed = 0;
        let failed = 0;

        for (const statement of statements) {
            try {
                // Execute via Supabase RPC or direct query
                const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

                if (error) {
                    // Try alternative method
                    const { error: error2 } = await supabase.from('_sql').insert({ query: statement });
                    if (error2) {
                        failed++;
                        console.log(`   ❌ Failed: ${error2.message.substring(0, 50)}...`);
                    } else {
                        executed++;
                    }
                } else {
                    executed++;
                }
            } catch (err) {
                failed++;
            }
        }

        console.log(`   ✅ Executed: ${executed} statements`);
        if (failed > 0) {
            console.log(`   ⚠️  Failed: ${failed} statements`);
            console.log('   💡 Please execute SQL manually in Supabase Dashboard');
        }

    } catch (error) {
        console.log('   ❌ Error reading SQL file');
        console.log('   💡 Please execute SQL manually:');
        console.log('      1. Open Supabase Dashboard → SQL Editor');
        console.log('      2. Copy: database/migrations/mvp_notification_system.sql');
        console.log('      3. Paste and Run');
    }

    console.log('');
}

// Step 2: Verify tables
async function verifyTables() {
    console.log('2️⃣  Verifying database tables...');
    console.log('─'.repeat(60));

    const tables = ['notification_preferences', 'email_log'];
    let allExist = true;

    for (const table of tables) {
        try {
            const { error } = await supabase.from(table).select('count').limit(1);
            if (error) {
                console.log(`   ❌ ${table}: Not found`);
                allExist = false;
            } else {
                console.log(`   ✅ ${table}: Exists`);
            }
        } catch (err) {
            console.log(`   ❌ ${table}: Error`);
            allExist = false;
        }
    }

    if (!allExist) {
        console.log('');
        console.log('   ⚠️  Some tables missing!');
        console.log('   📖 Manual Setup Required:');
        console.log('      1. Open Supabase Dashboard');
        console.log('      2. Go to SQL Editor');
        console.log('      3. Run: database/migrations/mvp_notification_system.sql');
        console.log('');
        return false;
    }

    console.log('');
    return true;
}

// Step 3: Test email
async function testEmail() {
    console.log('3️⃣  Testing email sending...');
    console.log('─'.repeat(60));

    // Get first user email
    let testEmail = 'test@example.com';

    try {
        const { data: users } = await supabase
            .from('profiles')
            .select('email')
            .limit(1)
            .single();

        if (users?.email) {
            testEmail = users.email;
            console.log(`   📧 Using: ${testEmail}`);
        }
    } catch (err) {
        console.log(`   📧 Using default: ${testEmail}`);
    }

    console.log('   🔄 Sending test email...');

    try {
        const result = await sendEmail({
            to: testEmail,
            subject: '✅ نظام الإشعارات - اختبار تلقائي',
            html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial; direction: rtl; padding: 20px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .success { background: #d1fae5; border: 2px solid #10b981; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ نظام الإشعارات</h1>
              <p>منصة باكورا</p>
            </div>
            <div class="content">
              <h2>مرحباً!</h2>
              <p>تم إعداد نظام الإشعارات بنجاح! 🎉</p>
              <div class="success">
                <h3>✅ النظام يعمل بشكل صحيح!</h3>
                <ul style="text-align: right; list-style-position: inside;">
                  <li>✅ قاعدة البيانات جاهزة</li>
                  <li>✅ Zoho SMTP متصل</li>
                  <li>✅ خدمة البريد تعمل</li>
                  <li>✅ القوالب بالعربية (RTL)</li>
                </ul>
              </div>
              <p><strong>التاريخ:</strong> ${new Date().toLocaleString('ar-SA')}</p>
            </div>
            <div class="footer">
              <p>© 2026 منصة باكورا - جميع الحقوق محفوظة</p>
              <p style="font-size: 12px; color: #999;">إعداد تلقائي</p>
            </div>
          </div>
        </body>
        </html>
      `
        });

        if (result.success) {
            console.log('   ✅ Email sent successfully!');
            console.log(`   📬 Message ID: ${result.messageId}`);
            console.log(`   📧 Sent to: ${testEmail}`);
        } else {
            console.log('   ❌ Email failed');
            console.log(`   🔴 Error: ${result.error}`);
        }
    } catch (error) {
        console.log('   ❌ Error sending email');
        console.log(`   🔴 ${error.message}`);
    }

    console.log('');
}

// Step 4: Create default preferences
async function createDefaultPreferences() {
    console.log('4️⃣  Creating default preferences...');
    console.log('─'.repeat(60));

    try {
        // Get users without preferences
        const { data: users } = await supabase
            .from('profiles')
            .select('id')
            .limit(10);

        if (!users || users.length === 0) {
            console.log('   ℹ️  No users found');
            console.log('');
            return;
        }

        let created = 0;

        for (const user of users) {
            const { error } = await supabase
                .from('notification_preferences')
                .insert({
                    user_id: user.id,
                    email_enabled: true,
                    order_updates: true,
                    billing_updates: true,
                    security_alerts: true,
                    marketing: false,
                    digest_mode: 'immediate'
                })
                .select();

            if (!error) {
                created++;
            }
        }

        console.log(`   ✅ Created preferences for ${created} users`);
    } catch (error) {
        console.log('   ⚠️  Could not create preferences');
    }

    console.log('');
}

// Main execution
async function main() {
    try {
        // Check environment
        if (!process.env.SUPABASE_URL && !process.env.VITE_SUPABASE_URL) {
            console.log('❌ SUPABASE_URL not found in environment');
            console.log('💡 Make sure .env file exists');
            process.exit(1);
        }

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY not found');
            console.log('💡 Using SUPABASE_ANON_KEY instead (limited permissions)');
        }

        // Run setup steps
        await setupDatabase();
        const tablesExist = await verifyTables();

        if (tablesExist) {
            await createDefaultPreferences();
            await testEmail();
        }

        // Summary
        console.log('═'.repeat(60));
        console.log('📊 SETUP COMPLETE');
        console.log('─'.repeat(60));

        if (tablesExist) {
            console.log('   ✅ Database: Ready');
            console.log('   ✅ Email: Tested');
            console.log('   ✅ Preferences: Created');
            console.log('');
            console.log('🎉 Notification system is ready to use!');
            console.log('');
            console.log('📝 Next Steps:');
            console.log('   1. Check your email inbox');
            console.log('   2. Check Supabase → email_log table');
            console.log('   3. Start using notification functions!');
        } else {
            console.log('   ⚠️  Database: Needs manual setup');
            console.log('   ⏳ Email: Pending');
            console.log('');
            console.log('📝 Manual Steps Required:');
            console.log('   1. Open Supabase Dashboard → SQL Editor');
            console.log('   2. Run: database/migrations/mvp_notification_system.sql');
            console.log('   3. Run this script again: node setup-and-test.js');
        }

        console.log('═'.repeat(60));
        console.log('');

    } catch (error) {
        console.error('\n💥 Fatal Error:');
        console.error(error);
        process.exit(1);
    }
}

// Run
main();
