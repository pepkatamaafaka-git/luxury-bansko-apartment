-- ============================================================
--  Bansko Apartment — Supabase Schema
--  Run this in: Supabase dashboard → SQL Editor → New query
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- ─── bookings ────────────────────────────────────────────────
create table if not exists bookings (
  id                uuid        primary key default gen_random_uuid(),
  start_date        date        not null,
  end_date          date        not null,
  note              text        not null    default '',
  source            text        not null    default 'manual'
                                check (source in ('manual','booking','airbnb','stripe')),
  status            text        not null    default 'confirmed'
                                check (status in ('confirmed','pending','cancelled')),
  guest_name        text,
  guest_email       text,
  guest_phone       text,
  guests_count      integer     default 2 check (guests_count between 1 and 5),
  total_price       numeric(8,2),
  stripe_session_id text        unique,
  created_at        timestamptz not null    default now(),

  constraint end_after_start check (end_date > start_date)
);

create index if not exists bookings_dates_idx
  on bookings (start_date, end_date);

create index if not exists bookings_status_idx
  on bookings (status);

create index if not exists bookings_stripe_idx
  on bookings (stripe_session_id)
  where stripe_session_id is not null;

-- ─── pricing_rules ───────────────────────────────────────────
create table if not exists pricing_rules (
  id            uuid        primary key default gen_random_uuid(),
  label         text        not null,
  months        integer[]   not null,   -- 0-indexed (0=Jan … 11=Dec)
  weekday_price numeric(6,2) not null,
  weekend_price numeric(6,2) not null,  -- Fri + Sat + Sun
  updated_at    timestamptz not null    default now(),

  constraint positive_prices check (weekday_price >= 0 and weekend_price >= 0)
);

-- ─── Row Level Security ───────────────────────────────────────
alter table bookings      enable row level security;
alter table pricing_rules enable row level security;

-- Public can read bookings (needed for availability calendar)
create policy "public_read_bookings"
  on bookings for select
  using (true);

-- Public can read pricing rules (needed for price display)
create policy "public_read_pricing"
  on pricing_rules for select
  using (true);

-- All writes go through the service-role key (server-only, bypasses RLS)
-- No additional policies needed for insert/update/delete.

-- ─── Seed default pricing rules ──────────────────────────────
insert into pricing_rules (label, months, weekday_price, weekend_price) values
  ('Висок ски сезон (Дек–Фев)',      '{11,0,1}',      95, 120),
  ('Среден сезон (Мар–Апр)',         '{2,3}',          75,  95),
  ('Извън сезон (Май–Юни, Окт–Ноем)', '{4,5,9,10}',   55,  65),
  ('Летен сезон (Юли–Сеп)',          '{6,7,8}',        80, 100)
on conflict do nothing;

-- ─── Seed demo bookings (optional — remove in production) ────
insert into bookings (start_date, end_date, note, source, status) values
  ('2026-01-15', '2026-01-22', 'Семейство Петрови',     'manual',  'confirmed'),
  ('2026-02-07', '2026-02-14', 'Booking.com резервация', 'booking', 'confirmed'),
  ('2026-03-01', '2026-03-08', 'Airbnb гост',            'airbnb',  'confirmed'),
  ('2026-07-10', '2026-07-18', 'Лятна резервация',       'manual',  'confirmed'),
  ('2026-08-01', '2026-08-10', 'Ваканция семейство',     'booking', 'confirmed')
on conflict do nothing;
