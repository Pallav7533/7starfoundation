# 7 Star Help Foundation: Website + Admin + Annadan Seva

Next.js 14 (App Router, TypeScript, Tailwind) + Supabase (PostgreSQL + Auth) + optional Google Drive archive.
Everything is designed to run on free tiers: **Vercel Hobby + Supabase Free + Google Drive (free 15 GB)**.

> **Status:** this code was written without being able to run `npm install` or `npm run build` in the authoring
> environment, so it has **not been compiled or tested yet**. Do the "First run" steps below and send any error
> text back to get it fixed. `next.config.js` has `typescript.ignoreBuildErrors = true` as a safety net; once your
> build is clean, set it to `false`.

## 1. First run (about 20 minutes)

1. Install **Node.js 20.6 or newer**.
2. In this folder run: `npm install`
3. Create a free project at https://supabase.com
4. Supabase dashboard, **SQL Editor, New query**: paste all of `supabase/schema.sql`, click **Run**.
5. Supabase, **Project Settings, API**: copy *Project URL*, *anon key* and *service_role key* into `.env.local`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
   The service_role key is a secret: never commit it, never put it in a `NEXT_PUBLIC_` variable.
6. Supabase, **Authentication**: turn **off** "Allow new users to sign up" (so nobody else can register).
   Under **URL Configuration** set Site URL to `https://7starfoundation.org` and add redirect URLs
   `https://7starfoundation.org/auth/callback` and `http://localhost:3000/auth/callback`.
7. Create the single admin account: `npm run seed:admin`
   (reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env.local`, creates the user and registers it as the only admin).
   **Afterwards delete `ADMIN_PASSWORD` from `.env.local`** and change the password from the admin panel flow
   ("Forgot password?") because it was shared in a chat.
8. `npm run dev`, open http://localhost:3000 and http://localhost:3000/admin

## 2. Deploy for free (Vercel)

1. Push this folder to a **private** GitHub repository (`.env.local` is git-ignored).
2. Import it at https://vercel.com, framework: Next.js.
3. Add the environment variables from `.env.example` in Vercel (do **not** add `ADMIN_EMAIL` / `ADMIN_PASSWORD`).
4. Add the domain `7starfoundation.org` in Vercel, Domains, and set the DNS records Vercel shows.
5. Redeploy. No redeploy is ever needed for donor entries or content edits: they live in the database.

## 3. Daily use (admin)

* Login: `/admin`. After login you land on `/admin/dashboard`. Inactive sessions end after 30 minutes.
* **Annadan Seva Register**: fill the form and press **Publish** (or **Save Draft**). The form keeps the date, ashram and
  session after saving so you can add 3, 4 or any number of donors quickly. Publishing needs *Public Display Permission*.
  Phone, address and notes are private: the public site reads only from the `public_meal_donors` database view.
* **Ashram Details, Campaigns, Gallery and Videos, Hero Slides, Website Content, Social Media Links, Settings**: edit text,
  image paths, links and order. Changes are live immediately.
* **Changing photos**: replace the JPG files in `public/images/` with the same file names (see `PLACEHOLDERS.md`),
  or paste any full image URL (for example a Supabase Storage public URL) into the image fields.

## 4. Security design

* Row Level Security is on for every table. Anonymous visitors can read only published content and the
  `public_meal_donors` view (name, family, occasion only). They have **no** privilege on `meal_donations` or enquiries.
* Only the user listed in `admin_users` passes `is_admin()`, which every write policy requires.
* Enquiry forms post to a server route that validates input, uses a honeypot and an in-memory rate limit
  (best effort per server instance), and writes with the service role. For stronger limits add Upstash/Vercel KV.
* Login attempts are rate limited by Supabase Auth on the server, plus a one-minute lockout after 5 failures in the browser.
* The service-role key and admin password are never sent to the browser. `middleware.ts` plus the admin layout block
  every `/admin/*` page for non-admins.
* **Test before launch:** in a private window open `/admin/dashboard` (must redirect to `/admin`); open
  `https://YOUR-PROJECT.supabase.co/rest/v1/meal_donations` with the anon key (must be denied) and
  `.../public_meal_donors` (must show only public columns).

## 5. Google Drive monthly archive (optional, not active until configured)

Keeps about the last 30 days (`ARCHIVE_KEEP_DAYS`) in the database. Older rows are grouped by month, exported to CSV,
uploaded to Drive folder `7 Star Foundation Archives / YEAR / MONTH`, **downloaded again and checksum-verified**, logged in
`archive_logs`, and only then (if `ARCHIVE_DELETE_ENABLED=true`) deleted by exact id. Any failure leaves the data untouched.

Setup:
1. https://console.cloud.google.com, new project, enable **Google Drive API**.
2. OAuth consent screen: External, add your Gmail as a test user. Then **publish the app** (In production), otherwise
   refresh tokens expire after 7 days.
3. Credentials, Create OAuth client ID, type *Web application*, redirect URI `https://developers.google.com/oauthplayground`.
4. Open https://developers.google.com/oauthplayground, gear icon, tick *Use your own OAuth credentials*, enter client id/secret,
   authorise scope `https://www.googleapis.com/auth/drive.file`, exchange for tokens, copy the **refresh token**.
5. Put `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` in Vercel. Keep the Drive folder private.
6. Admin, **Google Drive Archives**, run **Manual Archive** once with `ARCHIVE_DELETE_ENABLED=false`, open the CSV in Drive and check it.
   Only then set `ARCHIVE_DELETE_ENABLED=true`.
7. Monthly automation: `vercel.json` already schedules `/api/admin/archive` on the 1st of each month. Set `CRON_SECRET` in Vercel
   to a long random string (Vercel sends it automatically).

Do not treat archiving as working until step 6 has been done and you have looked at the file in Drive.

## 6. Backup and recovery

* Supabase free tier does not give point-in-time restore. Use the monthly Drive CSVs plus an occasional manual export
  (Admin, Annadan Seva Register, **Export CSV**). `supabase/schema.sql` recreates the structure.
* Lost admin password: use "Forgot password?" on the login page, or Supabase dashboard, Authentication, Users, reset password.
  If the admin e-mail is lost entirely, create a new user in Supabase, put its e-mail in `.env.local` as `ADMIN_EMAIL`
  with a new `ADMIN_PASSWORD` and run `npm run seed:admin` (it keeps exactly one admin).

## 7. Project map

```
app/(site)/...       public pages (home, about, ashrams/[slug], campaigns, community, annadan-seva, csr, gallery, contact, donate, privacy, terms)
app/admin/page.tsx   login        app/admin/(panel)/...  protected admin pages
app/api/donors       public donor list (view only)    app/api/enquiry   contact/CSR forms    app/api/admin/archive   Drive archive
components/          HeroSlider, Header, Footer, DonorPanel, GalleryGrid, DonateForm, admin/*
lib/                 supabase clients, content queries, defaults, whatsapp, csv, archive
supabase/schema.sql  tables, RLS, public view, starter content
public/images/       replaceable photos (currently labelled placeholders)
```
