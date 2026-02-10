This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase migrations

Run the latest SQL before shipping new features:

- `supabase/migrations/005_video_content.sql` – creates `artwork_videos` and `standalone_videos` plus supporting metadata.
- `supabase/migrations/008_catalogs.sql` – adds the downloadable catalogs table used by the new `/catalogs` page.

Apply them in the Supabase SQL editor or with the CLI:

```bash
supabase migration up
```

(`supabase migration up` applies every pending migration; run it after pulling the latest repository changes.)

## Catalog automation

Populate `data/catalogs.json` with Drive (or Supabase Storage) URLs, then run:

```bash
npm run catalogs:sync
```

The script normalizes Google Drive links into direct downloads and upserts each row into the `catalogs` table. The `/catalogs` route and `/api/catalogs` endpoint consume the same data.

## Video ingestion

- Upload artwork-specific clips to Supabase Storage or YouTube, then insert rows into `artwork_videos`.
- Standalone content (studio tours, interviews, etc.) goes into `standalone_videos` and can be queried via `/api/videos`.
- The artwork detail page automatically surfaces any linked videos with a full-screen modal player.
