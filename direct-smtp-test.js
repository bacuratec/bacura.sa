// Simple direct test
import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';

// Load .env
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

console.log('\n🧪 Direct SMTP Test');
console.log('═'.repeat(50));
console.log('Host:', process.env.ZOHO_SMTP_HOST);
console.log('Port:', process.env.ZOHO_SMTP_PORT);
console.log('User:', process.env.ZOHO_SMTP_USER);
console.log('Pass:', process.env.ZOHO_SMTP_PASS ? '***' + process.env.ZOHO_SMTP_PASS.slice(-4) : 'NOT SET');
console.log('═'.repeat(50));
console.log('');

const transporter = nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST,
    port: parseInt(process.env.ZOHO_SMTP_PORT),
    secure: process.env.ZOHO_SMTP_PORT === '465',
    auth: {
        user: process.env.ZOHO_SMTP_USER,
        pass: process.env.ZOHO_SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    debug: true,
    logger: true
});

console.log('🔍 Verifying connection...\n');

transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Verification Failed:');
        console.log('Error:', error.message);
        console.log('Code:', error.code);
        console.log('');
        console.log('💡 This means Zoho is rejecting the connection.');
        console.log('   Most likely: IMAP/SMTP Access is disabled.');
        console.log('');
        console.log('📖 Solution:');
        console.log('   1. Go to: https://mail.zoho.com');
        console.log('   2. Settings → Mail Accounts');
        console.log('   3. Enable IMAP/SMTP Access');
    } else {
        console.log('✅ Connection Verified!');
        console.log('   SMTP server is ready to send emails.');
        console.log('');
        console.log('🧪 Sending test email...');

        transporter.sendMail({
            from: process.env.ZOHO_FROM_EMAIL,
            to: process.env.ZOHO_SMTP_USER,
            subject: '✅ Test Email from Bacura',
            html: '<div dir="rtl"><h2>نجح الاختبار!</h2><p>نظام الإشعارات يعمل بشكل صحيح ✅</p></div>'
        }, (err, info) => {
            if (err) {
                console.log('❌ Send Failed:', err.message);
            } else {
                console.log('✅ Email Sent!');
                console.log('   Message ID:', info.messageId);
                console.log('   Response:', info.response);
            }
        });
    }
});
