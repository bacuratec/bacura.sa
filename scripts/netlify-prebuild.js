const fs = require('fs');
const path = require('path');

try {
  const isNetlify = !!process.env.NETLIFY;
  if (!isNetlify) process.exit(0);
  const root = process.cwd();
  const mwPath = path.join(root, 'middleware.js');
  if (fs.existsSync(mwPath)) {
    const disabledPath = path.join(root, 'middleware.netlify.disabled.js');
    fs.renameSync(mwPath, disabledPath);
    console.log('[netlify-prebuild] Renamed middleware.js -> middleware.netlify.disabled.js to satisfy Netlify proxy requirement');
  }
  process.exit(0);
} catch (e) {
  console.warn('[netlify-prebuild] Failed to adjust middleware for Netlify:', e?.message || e);
  process.exit(0);
}
