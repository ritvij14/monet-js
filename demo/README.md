# monet-js Demo Website

This is a minimal Vite-powered React demo site showcasing the **monet-js** library (UMD build).

## Available Scripts

```bash
# Start local dev server (http://localhost:5173)
npm run dev

# Build static assets to demo/dist
npm run build

# Preview the production build locally
npm run preview
```

From the project root you can also run:

```bash
npm run dev:demo   # delegates to the demo project
npm run build:demo # delegates to the demo project
```

## Deploying to GitHub Pages

```bash
npm run build
# copy demo/dist contents to your gh-pages branch or configure GitHub Pages to serve /demo/dist
```

The built bundle expects to be served from the site root ("/"). If deploying to a sub-path, adjust `vite.config.js` with `base: '/monet/'` (or similar).
