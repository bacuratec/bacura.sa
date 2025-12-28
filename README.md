# Bakora A'mal – Front-end

React + Vite single page application that powers the Bakora Amal platform.

## Requirements

- Node.js 20+ (matches Netlify’s current default build image)
- npm 10+
- Netlify CLI: `npm install -g netlify-cli`

## Install & Develop

```bash
npm install
npm run dev
```

When you need Netlify platform primitives (functions, edge runtime, env vars) locally, run:

```bash
netlify dev
```

The repo already includes the Netlify Vite plugin (`@netlify/vite-plugin`) so `netlify dev` proxies to Vite and keeps the experience identical to `npm run dev`.

## Build

```bash
npm run build
npm run preview
```

Build artifacts land in `dist/`, which is the directory Netlify publishes.

## Deploying to Netlify

1. Authenticate once: `netlify login`
2. Connect the repo to a Netlify site (new or existing):

   ```bash
   netlify init
   # or, if the site already exists:
   netlify link
   ```

3. Accept the suggested settings (build command `npm run build`, publish dir `dist`), or edit `netlify.toml` as needed.
4. Push to the branch watched by Netlify to trigger Continuous Deployment, or deploy manually:

   ```bash
   netlify deploy --build          # Draft deploy
   netlify deploy --prod --build   # Production deploy
   ```

### Environment variables

Add any required secrets (API URLs, tokens, etc.) in the Netlify UI under **Site settings → Environment variables**. Access them inside the app via Vite’s `import.meta.env` or inside Netlify Functions via `Netlify.env`.

### Redirects / SPA support

The repo ships with:

- `netlify.toml` pointing to `dist/` and falling back to `index.html`.
- `public/_redirects` mirroring the SPA rule for local `npm run build`.

You usually do not need to edit these unless you add serverless functions or custom routes.

## Troubleshooting

- Use `netlify status` to ensure the CLI is linked to the correct site.
- If Netlify primitives fail locally, ensure `@netlify/vite-plugin` is installed (already handled) and use `npm run dev` or `netlify dev`. Avoid running Vite via `node ./node_modules/vite/bin` or other custom wrappers.
