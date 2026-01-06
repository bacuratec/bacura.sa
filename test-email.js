// ============================================
// Quick Email Test
// File: test-email.js
// ============================================

import { sendEmail } from './src/services/emailService.js';

async function testEmail() {
    console.log('🧪 Testing email sending...\n');

    // ⚠️ استبدل هذا ببريدك الإلكتروني
    const TEST_EMAIL = 'your-email@example.com';

    console.log(`Sending test email to: ${TEST_EMAIL}`);

    const result = await sendEmail({
        to: TEST_EMAIL,
        subject: '🧪 اختبار نظام الإشعارات - Bacura',
        html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            direction: rtl;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .content {
            padding: 30px 20px;
          }
          .success {
            background: #d1fae5;
            border: 2px solid #10b981;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #eee;
          }
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
            <p>هذا بريد اختبار من نظام الإشعارات الخاص بمنصة باكورا.</p>
            
            <div class="success">
              <h3>✅ النظام يعمل بشكل صحيح!</h3>
              <p>إذا استلمت هذا البريد، فهذا يعني أن:</p>
              <ul style="text-align: right; list-style-position: inside;">
                <li>✅ Zoho SMTP متصل بنجاح</li>
                <li>✅ خدمة البريد الإلكتروني تعمل</li>
                <li>✅ القوالب بالعربية (RTL) تعمل</li>
              </ul>
            </div>
            
            <p><strong>التاريخ:</strong> ${new Date().toLocaleString('ar-SA')}</p>
            <p><strong>الوقت:</strong> ${new Date().toLocaleTimeString('ar-SA')}</p>
          </div>
          <div class="footer">
            <p>© 2026 منصة باكورا - جميع الحقوق محفوظة</p>
            <p style="font-size: 12px; color: #999;">
              هذا بريد اختبار تلقائي
            </p>
          </div>
        </div>
      </body>
      </html>
    `
    });

    console.log('\n📊 Result:');
    console.log('─'.repeat(50));

    if (result.success) {
        console.log('✅ Status: SUCCESS');
        console.log(`📧 Message ID: ${result.messageId}`);
        console.log(`📬 Sent to: ${TEST_EMAIL}`);
        console.log('\n🎉 Email sent successfully!');
        console.log('📬 Check your inbox (and spam folder)');
    } else {
        console.log('❌ Status: FAILED');
        console.log(`🔴 Error: ${result.error}`);
        console.log(`🔴 Code: ${result.code || 'N/A'}`);
        console.log('\n💡 Troubleshooting:');
        console.log('1. Check ZOHO_SMTP_USER and ZOHO_SMTP_PASS in .env');
        console.log('2. Verify Zoho App Password is correct');
        console.log('3. Check docs/TESTING_AND_TROUBLESHOOTING.md');
    }

    console.log('─'.repeat(50));
}

// Run test
testEmail().catch(error => {
    console.error('\n💥 Fatal Error:');
    console.error(error);
    process.exit(1);
});
