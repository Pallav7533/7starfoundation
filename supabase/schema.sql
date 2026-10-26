-- 7 Star Help Foundation: database schema, Row Level Security and starter content.
-- Run this whole file once in Supabase: SQL Editor > New query > paste > Run.
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT where possible.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- helpers
create or replace function public.set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

-- ---------------------------------------------------------------- admin_users
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------- ashrams
create table if not exists public.ashrams (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text not null default '',
  long_description text not null default '',
  image text not null default '/images/dikra-nu-ghar.jpg',
  -- Unconfirmed details stay hidden publicly until the admin turns this on.
  details_published boolean not null default false,
  address text,
  map_url text,
  contact_phone text,
  services text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_ashrams_updated on public.ashrams;
create trigger trg_ashrams_updated before update on public.ashrams
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- meal_donations
create table if not exists public.meal_donations (
  id uuid primary key default gen_random_uuid(),
  ashram_id uuid not null references public.ashrams(id) on delete restrict,
  donation_date date not null,
  meal_session text not null check (meal_session in ('morning','evening')),
  donor_name text not null check (char_length(trim(donor_name)) > 0),
  family_org text,
  occasion text check (occasion in ('Birthday','Anniversary','In Memory','Family Seva','Other')),
  phone_private text,
  address_private text,
  notes_private text,
  public_display_consent boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A record can only be published when public display permission was recorded.
  constraint published_needs_consent check (status = 'draft' or public_display_consent = true)
);
create index if not exists idx_meal_date_session on public.meal_donations (donation_date, meal_session);
create index if not exists idx_meal_ashram on public.meal_donations (ashram_id);
create index if not exists idx_meal_status on public.meal_donations (status);
drop trigger if exists trg_meal_updated on public.meal_donations;
create trigger trg_meal_updated before update on public.meal_donations
  for each row execute function public.set_updated_at();

-- Public view: ONLY approved, consented, published rows and ONLY non-private columns.
-- A normal (non security_invoker) view runs with the owner's rights, so anon never needs
-- access to the base table, and private columns can never leak through it.
create or replace view public.public_meal_donors as
  select m.id, m.ashram_id, a.slug as ashram_slug, m.donation_date, m.meal_session,
         m.donor_name, m.family_org, m.occasion
  from public.meal_donations m
  join public.ashrams a on a.id = m.ashram_id
  where m.status = 'published' and m.public_display_consent = true;

-- ---------------------------------------------------------------- campaigns
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  image text not null default '/images/campaign-1.jpg',
  cta_label text not null default 'Support This Cause',
  donate_purpose text not null default 'General Donation',
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_campaigns_updated on public.campaigns;
create trigger trg_campaigns_updated before update on public.campaigns
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- gallery_items
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  category text not null default 'Community Service'
    check (category in ('Senior Citizen Care','Annadan Seva','Animal and Bird Care','Community Service','Events and Activities')),
  media_type text not null default 'image' check (media_type in ('image','video')),
  url text not null,                 -- image path/URL, or video URL (YouTube/Vimeo/mp4)
  thumbnail text,                    -- optional thumbnail for videos
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- hero_slides
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  sort_order int not null default 0,
  eyebrow text not null default '',
  headline text not null,
  body text not null default '',
  image text not null,
  detail_image text,
  object_position text not null default 'center',
  primary_label text not null default 'Donate Now',
  primary_href text not null default '/donate',
  secondary_label text,
  secondary_href text,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_hero_updated on public.hero_slides;
create trigger trg_hero_updated before update on public.hero_slides
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- site_settings (key -> json)
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_settings_updated on public.site_settings;
create trigger trg_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- enquiries (private)
create table if not exists public.contact_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null, phone text, email text, message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.csr_enquiries (
  id uuid primary key default gen_random_uuid(),
  company text not null, contact_person text not null, phone text, email text,
  interest text, message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- archive_logs
create table if not exists public.archive_logs (
  id uuid primary key default gen_random_uuid(),
  period text,                       -- e.g. 2026-09
  status text not null check (status in ('success','failed','skipped')),
  records_archived int not null default 0,
  records_deleted int not null default 0,
  drive_file_id text,
  drive_file_name text,
  checksum text,
  message text,
  triggered_by text not null default 'manual',
  created_at timestamptz not null default now()
);

-- ================================================================ ROW LEVEL SECURITY
alter table public.admin_users       enable row level security;
alter table public.ashrams           enable row level security;
alter table public.meal_donations    enable row level security;
alter table public.campaigns         enable row level security;
alter table public.gallery_items     enable row level security;
alter table public.hero_slides       enable row level security;
alter table public.site_settings     enable row level security;
alter table public.contact_enquiries enable row level security;
alter table public.csr_enquiries     enable row level security;
alter table public.archive_logs      enable row level security;

-- Admin: full access everywhere.
do $$
declare t text;
begin
  foreach t in array array['admin_users','ashrams','meal_donations','campaigns','gallery_items',
                           'hero_slides','site_settings','contact_enquiries','csr_enquiries','archive_logs']
  loop
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format('create policy "admin all" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Public: read published content only.
drop policy if exists "public read ashrams" on public.ashrams;
create policy "public read ashrams" on public.ashrams for select to anon, authenticated using (is_published);
drop policy if exists "public read campaigns" on public.campaigns;
create policy "public read campaigns" on public.campaigns for select to anon, authenticated using (is_published);
drop policy if exists "public read gallery" on public.gallery_items;
create policy "public read gallery" on public.gallery_items for select to anon, authenticated using (is_published);
drop policy if exists "public read hero" on public.hero_slides;
create policy "public read hero" on public.hero_slides for select to anon, authenticated using (is_published);
drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings for select to anon, authenticated using (key not like 'private_%');

-- Table-level privileges. Anon gets NOTHING on meal_donations or enquiries.
revoke all on public.meal_donations, public.contact_enquiries, public.csr_enquiries,
              public.archive_logs, public.admin_users from anon;
grant select on public.ashrams, public.campaigns, public.gallery_items,
                public.hero_slides, public.site_settings to anon, authenticated;
grant select on public.public_meal_donors to anon, authenticated;
grant all on public.meal_donations, public.contact_enquiries, public.csr_enquiries,
             public.archive_logs, public.admin_users, public.ashrams, public.campaigns,
             public.gallery_items, public.hero_slides, public.site_settings to authenticated;
-- Enquiry forms are written by server API routes (service role) after validation + rate limiting.

-- ================================================================ STARTER CONTENT
insert into public.ashrams (slug, name, short_description, long_description, image, sort_order) values
 ('dikra-nu-ghar', 'Dikra Nu Ghar Ashram',
  'Dedicated to the care, dignity, companionship, and well-being of senior citizens.',
  'Dikra Nu Ghar Ashram is dedicated to the care, dignity, companionship, and well-being of senior citizens. Detailed information will be added by the foundation.',
  '/images/dikra-nu-ghar.jpg', 1),
 ('abol-jiv', 'Abol Jiv Ashram',
  'The foundation''s animal and bird care initiative. Details will be published by the foundation.',
  'Abol Jiv Ashram is the foundation''s animal and bird care initiative. Verified details about services will be published by the administrator.',
  '/images/abol-jiv.jpg', 2),
 ('community-seva', 'Community Seva Ashram',
  'Our third ashram. Its name, location and services will be announced soon.',
  'This page is a temporary placeholder. The actual name, location, mission and services will be supplied by the foundation.',
  '/images/community-seva.jpg', 3)
on conflict (slug) do nothing;

insert into public.campaigns (slug, title, description, image, cta_label, donate_purpose, sort_order) values
 ('senior-citizens', 'Food and Care for Senior Citizens',
  'Help provide nourishing meals, companionship and everyday care to senior citizens.',
  '/images/campaign-1.jpg', 'Support Senior Care', 'Senior Citizen Care', 1),
 ('animals-birds', 'Compassion for Animals and Birds',
  'Support the care, protection and well-being of animals and birds in need.',
  '/images/animal-care-1.jpg', 'Support Animal Care', 'Animal and Bird Care', 2),
 ('community-welfare', 'Community Welfare',
  'Strengthen a community built on compassion, care and shared responsibility.',
  '/images/campaign-2.jpg', 'Make a Difference', 'Community Seva', 3)
on conflict (slug) do nothing;

insert into public.hero_slides (sort_order, eyebrow, headline, body, image, detail_image, object_position, primary_label, primary_href, secondary_label, secondary_href)
select * from (values
 (1, 'Senior Citizen Care', 'A Little Kindness Can Change a Life.',
  'Every act of care brings dignity, companionship, and hope to the lives of senior citizens who deserve to feel at home.',
  '/images/1.jpg', '/images/hero-detail-1.jpg', 'center 25%', 'Donate Now', '/donate', 'Explore Our Ashrams', '/ashrams/dikra-nu-ghar'),
 (2, 'Animals and Birds', 'Every Living Being Deserves Compassion.',
  'Stand with us to support the care, protection, and well-being of animals and birds in need.',
  '/images/2.jpg', '/images/hero-detail-2.jpg', 'center', 'Support Animal Care', '/donate?purpose=Animal%20and%20Bird%20Care', 'Discover Our Seva', '/campaigns'),
 (3, 'Annadan Seva', 'A Meal Shared Is Love Multiplied.',
  'Help bring nourishing meals, warmth, and togetherness to the senior citizens at Dikra Nu Ghar Ashram.',
  '/images/3.jpg', '/images/hero-detail-3.jpg', 'center', 'Support Annadan Seva', '/donate?purpose=Morning%20Meal%20Seva', 'View Daily Meal Donors', '/annadan-seva'),
 (4, 'Community Service', 'Together, We Can Make Kindness Go Further.',
  'Every contribution can help strengthen a community built on compassion, care, and shared responsibility.',
  '/images/4.jpg', '/images/hero-detail-4.jpg', 'center', 'Make a Difference', '/donate?purpose=Community%20Seva', 'Learn About Our Foundation', '/about')
) as v(sort_order, eyebrow, headline, body, image, detail_image, object_position, primary_label, primary_href, secondary_label, secondary_href)
where not exists (select 1 from public.hero_slides);

insert into public.site_settings (key, value) values
 ('about', '{"headline":"Every Life Deserves Care, Respect and Love.","body":"At 7 Star Help Foundation, we believe that kindness is more than an act. It is a commitment to care for those who need support, to respect every life, and to build a more compassionate community.","long":"The foundation''s full story, vision and mission will be added here by the administrator."}'),
 ('contact', '{"whatsapp_display":"+91 70708 18112","whatsapp_number":"917070818112","email":"","address":""}'),
 ('social', '{"instagram":"","facebook":"","youtube":"","threads":""}'),
 ('footer', '{"intro":"7 Star Help Foundation serves senior citizens, animals and birds, and the wider community with care, dignity and compassion."}'),
 ('csr', '{"headline":"Together, We Can Create a Greater Impact.","body":"We welcome conversations with companies and individuals who would like to collaborate or volunteer with the foundation. Please share your details and our team will get in touch to discuss how we can work together."}'),
 ('seo', '{"title":"7 Star Help Foundation | Care, Compassion and Annadan Seva","description":"7 Star Help Foundation cares for senior citizens, animals and birds, and the community. Support Annadan Seva and make kindness go further."}')
on conflict (key) do nothing;
