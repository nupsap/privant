# Data Privacy Application — POC (Supabase + Node.js)

This is a production-leaning starter for a Privacy app with:
- DSAR intake & workflow
- Consent storage
- Audit logs
- Email notifications (Postmark)

## 0) What you need
- A Supabase project (URL + **Service Role** key)
- Optional: Postmark server token for emails

## 1) Run in the cloud (recommended)
**GitHub Codespaces** (no local installs):
1. Push these files to a new GitHub repo.
2. Click the green **Code** button → **Create codespace on main**.
3. In the built-in terminal:
   ```bash
   cp .env.example .env
   # paste your Supabase URL + Service Role key into .env
   npm install
   npm run dev
   ```
4. Codespaces will expose a public URL for the dev server.

## 2) Local run (if you prefer)
- Install Node 18+ and Git.
- `cp .env.example .env` → fill in envs
- `npm install` → `npm run dev`

## 3) Create tables in Supabase
Open Supabase → SQL Editor → run `supabase/schema.sql`. (Or copy-paste from that file.)

## 4) Test quickly
- Health: `GET /api/health`
- Create DSAR: `POST /api/dsar` (public)
- List DSARs (admin): `GET /api/dsar` with header `x-api-key: <ADMIN_API_KEY>`

## 5) Deploy
- **Backend**: Railway/Render/Fly → set the same env vars.
- **DB/Auth**: Supabase (hosted) — nothing else to run.
- **Frontend**: Add Next.js later (this POC is API-first).

> ⚠️ Service Role key must **never** be exposed client-side. Keep it server-only.
