# HACKER-TALE

Retro terminal RPG business card MVP.

## Setup

1. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor.
2. Copy `.env.example` to `.env`.
3. Fill in database env values:

```bash
host=aws-1-ap-northeast-2.pooler.supabase.com
port=6543
database=postgres
user=postgres.YOUR_PROJECT_REF
password=YOUR_DATABASE_PASSWORD
```

4. Install and run:

```bash
npm install
npm run dev
```

## Database

After adding the database password to `.env`, apply the schema with:

```bash
npm run db:push
```

## Deploy

Use the standard Vite build settings:

```bash
npm run build
```

Deploy directory: `dist`

Recommended hosting settings:

- Build command: `npm run build`
- Output directory: `dist`
- Required environment variables: `host`, `port`, `database`, `user`, `password`

## Vercel Checklist

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 22
- Environment variables:
  - `GOOGLE_AI_API_KEY`
  - `host`
  - `port`
  - `database`
  - `user`
  - `password`

`GOOGLE_AI_API_KEY` is used only by Vercel API routes for 8-bit avatar generation
and resume-aware chat responses. It must not use a `VITE_` prefix.

Database credentials are used only by Vercel API routes. Do not expose them with
a `VITE_` prefix.
