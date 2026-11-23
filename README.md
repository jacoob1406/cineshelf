# CineShelf

Browse films by category, open a title, keep a wish list.
**React + TypeScript + Vite + SCSS, with hand-written server-side rendering (Express). No Next.js, no scaffolding.**

## Run it

```bash
npm install
cp .env.example .env      # optional – add your TMDB token (see below)
npm run dev               # http://localhost:5173   (SSR + HMR)

npm run build             # client bundle + SSR bundle + server bundle
npm start                 # production server (needs `npm run build` first)

npm test                  # unit + SSR + hydration tests
npm run typecheck
```

Without TMDB credentials the server falls back to built-in **mock data** (generated posters), so everything works offline.
With a token from <https://www.themoviedb.org/settings/api> (`TMDB_API_TOKEN` = v4 read token, or `TMDB_API_KEY` = v3 key)
real TMDB data is used. Requires Node >= 22.22.

## Features

- Homepage: header + 3 carousels (Action, Comedy, Horror), each a different film category.
- Click a film -> `/films/:category/:id`: image area, button + description area, additional info area (see wireframe).
- Detail page differs per category: **fonts, button (shape, motion, copy), colors, poster frame, background decoration, section headings**.
- "Add to wish list" button toggles the film; the **/wishlist** page lists everything saved (persisted in `localStorage`, synced between tabs).
- Real HTTP status codes (404 for unknown films/categories/URLs), per-page `<title>`/description/Open Graph tags rendered on the server.

## Architecture in short

```
index.html              HTML template with <!--app-head-->, <!--app-html-->, <!--app-state--> slots
server/                 Node side only
  index.ts              Express: Vite middleware (dev) / static files (prod) / SSR catch-all
  apiRouter.ts          GET /api/categories/:slug/films, /api/films/:id  (used by client-side navigation)
  tmdb/                 TMDB client (token stays here), mappers DTO -> domain, TTL cache with in-flight de-duplication
  mock/                 offline fallback data + generated SVG posters
src/                    runs on server AND in the browser
  entry-server.tsx      render(request, api) -> { status, head, html, state }
  entry-client.tsx      hydrateRoot + createBrowserRouter (picks up server state)
  routes.tsx            ONE route table shared by both sides; api is injected into loaders
  api/                  FilmsApi interface + browser implementation (HTTP -> /api)
  config/categories.ts  categories and their presentation (single source of truth)
  store/                wish list: external store + useSyncExternalStore (SSR/hydration safe)
  pages/ components/    UI;   styles/  SCSS (tokens, category themes, base) + one SCSS file per component
tests/                  mappers, wish list store, SSR output (status codes, XSS), real hydration in jsdom
```

Request flow (first load): `Express -> render() -> createStaticHandler.query() runs route loaders (TMDB) ->
renderToString -> HTML + serialized loader data -> browser hydrates without refetching`.
Client-side navigation: loaders run in the browser and call `/api/*` on the same server.

Category theming: `src/styles/_themes.scss` holds one Sass map per category; a loop turns every key into a CSS custom
property under `[data-category='…']`. Components only read the variables (`var(--font-heading)`, `var(--accent)`, …).
