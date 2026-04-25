# HACKER-TALE

Retro terminal RPG business card MVP.

## Setup

1. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor.
2. Copy `.env.example` to `.env`.
3. Fill in:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

4. Install and run:

```bash
npm install
npm run dev
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
- Required environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
