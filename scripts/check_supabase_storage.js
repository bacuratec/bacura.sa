
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manual env parsing to avoid external dependencies
function parseEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        let trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        // Remove inline comments starting with ' #' (space hash)
        if (trimmed.includes(' #')) {
            trimmed = trimmed.split(' #')[0].trim();
        }

        if (trimmed.includes('=')) {
            const parts = trimmed.split('=');
            const key = parts[0].trim();
            let val = parts.slice(1).join('=').trim();

            // Remove quotes if present
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            env[key] = val;
        }
    });
    return env;
}

const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

console.log('Reading environment variables...');
const envLocal = parseEnv(envLocalPath);
const envMain = parseEnv(envPath);
const env = { ...envMain, ...envLocal }; // local overrides main

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;

if (serviceRoleKey) {
    console.log(`Service Role Key Length: ${serviceRoleKey.length || 0}`);
    console.log(`Service Role Key Start: ${serviceRoleKey.slice(0, 5)}...`);
    // Be careful not to log the whole key
} else {
    console.error("Service Role Key is NOT FOUND.");
}

if (!supabaseUrl || !serviceRoleKey) {
    console.error("Cannot proceed without credentials.");
    process.exit(1);
}

console.log(`Connecting to Supabase: ${supabaseUrl}`);

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});

async function check() {
    try {
        // 1. Check Connectivity & Auth
        console.log("Checking connection...");
        const { data: buckets, error: bucketError } = await supabaseAdmin.storage.listBuckets();

        if (bucketError) {
            console.error("Failed to list buckets. Verify SERVICE_ROLE_KEY permissions.", bucketError);
            return;
        }

        console.log("Successfully connected. Buckets:", buckets.map(b => b.name));

        const attachmentBucket = buckets.find(b => b.name === 'attachments');
        if (!attachmentBucket) {
            console.warn("WARNING: 'attachments' bucket DOES NOT EXIST.");
            console.log("Attempting to create 'attachments' bucket...");
            const { data: newBucket, error: createError } = await supabaseAdmin.storage.createBucket('attachments', {
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: ['image/*', 'application/pdf']
            });
            if (createError) {
                console.error("Failed to create bucket:", createError);
            } else {
                console.log("Created 'attachments' bucket.");
            }
        } else {
            console.log("'attachments' bucket exists.");
        }

        // 2. Check Table Access
        console.log("Checking 'attachment_groups' table access...");
        const { data: groups, error: tableError } = await supabaseAdmin
            .from('attachment_groups')
            .select('count', { count: 'exact', head: true });

        if (tableError) {
            if (tableError.code === '42P01') {
                console.error("CRITICAL: 'attachment_groups' table DOES NOT EXIST.");
            } else {
                console.error("Table access error:", tableError);
            }
        } else {
            console.log("'attachment_groups' table is accessible.");
        }

    } catch (err) {
        console.error("Unexpected error:", err);
    }
}

check();
