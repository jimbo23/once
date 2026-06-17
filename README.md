# Once — Digital Disposable Camera

A digital disposable camera for our wedding. Guests scan a QR code, shoot throughout the night, and the album develops the morning after.

## Setup

1. Copy `.env.local.example` to `.env.local` and fill in your keys
2. Create a Supabase project and run the SQL in `supabase/schema.sql`
3. Set up Vercel Blob storage
4. Deploy to Vercel or run locally with `bun dev`

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob read/write token
- `HOST_SECRET` — Secret token for the host admin page (`/host`)

## Film States

The app transitions through four states automatically:

1. **Sealed** (before Jan 2, 2027) — Guests join and see a countdown
2. **Live** (Jan 2) — Camera activates, guests shoot
3. **Developing** (after event, before Jan 3 10am) — Countdown to reveal
4. **Revealed** (after Jan 3, 10am) — Album unlocked, film-strip + grid views
