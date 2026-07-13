# After Hours Dispatch

A single-page post reader built with Astro + React, backed by Contentful.
There is no routing — the post list, the reading view, and the age-gate are
all overlays on one page.

## Design

Dark, warm-black magazine styling. Serif display face (Fraunces) for titles,
Inter for body copy, Space Mono for the small kicker/byline system that runs
through the masthead, cards, and article view. Cards sit on a 1px hairline
grid; opening a post is a fullscreen takeover with a drop-cap opening
paragraph, never a page navigation.

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your Contentful credentials
npm run dev
```

If `.env` is left unconfigured, the app runs in demo mode with a small set
of sample posts, so the layout can be reviewed without Contentful.

## Contentful content model

Create a content type (default ID `post`, override via
`PUBLIC_CONTENTFUL_CONTENT_TYPE`) with these fields:

| Field         | Type        | Required | Notes                                   |
|---------------|-------------|----------|------------------------------------------|
| `title`       | Text        | Yes      | Card and article heading                |
| `subtitle`    | Text        | No       | Shown under the title everywhere         |
| `content`     | Rich text   | Yes      | Full article body                        |
| `excerpt`     | Text        | No       | Card preview; auto-derived from `content` if omitted |
| `publishDate` | Date        | Yes      | Drives sort order (newest first) and the kicker date |

Posts are fetched newest-first, 12 at a time, and more load automatically as
the reader scrolls to the bottom of the list.

## Locales / editions

If your Contentful space has more than one locale enabled (Settings →
Locales), the app fetches the list on load via `client.getLocales()` and
shows an edition switcher in the top-right of the masthead — one tab per
locale code (e.g. `EN-US`, `ES-MX`). Picking one refetches the post list
with that locale passed to `getEntries`, so field values fall back to
Contentful's own locale-fallback chain for any entries that aren't
translated. With only one locale configured, the switcher stays hidden.

## Content warning

On first load, a fullscreen notice asks the reader to confirm they're 18+.
Accepting stores a flag in `localStorage` (`afterhours-dispatch:age-consent`)
so it won't show again on that device. Declining redirects to google.com.

## Deploying to Cloudflare Workers

This project is ready to deploy to Cloudflare Workers using the `@astrojs/cloudflare`
adapter. The only secret required at deploy-time is your Contentful Delivery
API access token — all other Contentful configuration may be non-secret and can
be stored in `wrangler.toml` or as plain env vars on your deployment target.

Quick deploy checklist:

1. Build the site locally:

```bash
npm ci
npm run build
```

2. Configure your `wrangler.toml` (or use the provided `wrangler.example.toml`),
	 setting `CONTENTFUL_SPACE_ID`, `CONTENTFUL_CONTENT_TYPE`, and
	 `CONTENTFUL_ENVIRONMENT` under `[vars]`.

3. Set the secret for the Contentful access token:

```bash
wrangler secret put CONTENTFUL_ACCESS_TOKEN
```

4. Publish with Wrangler:

```bash
wrangler publish
```

Notes:
- The server-side API routes live under `/api/*` and will fetch content from
	Contentful using the `CONTENTFUL_*` env vars.
- If those endpoints are not configured on the server (missing `CONTENTFUL_SPACE_ID`
	or token), the client falls back to the local demo posts in `src/lib/samplePosts.js`.
