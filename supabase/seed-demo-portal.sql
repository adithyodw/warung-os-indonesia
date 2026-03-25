-- Warung OS Indonesia V3 - Demo Portal seed
-- Catatan:
-- Supabase auth.users perlu dibuat terlebih dulu (melalui dashboard atau Admin API).
-- Setelah itu, isi DEMO_USER_ID dengan user.id dari auth.users yang kamu buat.

-- 1) SETUP DEMO USER (mapping ke public.users)
-- GANTI UUID ini dengan id yang ada di auth.users.
-- Contoh: pakai id yang kamu buat untuk demo.
-- DEMO_USER_ID perlu format UUID valid.
-- Anda dapat cari via Supabase Dashboard -> Auth -> Users.

-- REPLACE THIS:
--   DEMO_USER_ID
-- =========================
-- Untuk mengedit, cukup cari "DEMO_USER_ID" dan ganti dengan UUID kamu.
-- =========================

-- If you already inserted `public.users` earlier, this is safe via ON CONFLICT.
insert into public.users (id, name, phone, role)
values
  ('DEMO_USER_ID'::uuid, 'Demo Admin', null, 'admin')
on conflict (id) do nothing;

-- 2) WARUNGS (3 warung)
insert into public.warungs (id, user_id, name, address, city)
values
  ('11111111-1111-1111-1111-111111111111'::uuid, 'DEMO_USER_ID'::uuid, 'Warung Sumber Rejeki', 'Jl. Contoh No. 12', 'Bekasi'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'DEMO_USER_ID'::uuid, 'Toko Makmur Jaya', 'Jl. Contoh No. 34', 'Bandung'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'DEMO_USER_ID'::uuid, 'Warung Berkah Abadi', 'Jl. Contoh No. 56', 'Surabaya')
on conflict (id) do nothing;

-- 3) PRODUCTS (stok per warung)
-- Harga dan margin disesuaikan dengan konteks Indonesia.
insert into public.products (id, user_id, warung_id, name, cost_price, selling_price, stock)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid, 'DEMO_USER_ID'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Indomie Goreng', 2400, 3000, 48),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid, 'DEMO_USER_ID'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Aqua 600ml', 5400, 7000, 60),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid, 'DEMO_USER_ID'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Telur (per kg)', 32000, 37000, 18),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'::uuid, 'DEMO_USER_ID'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Beras 5kg', 58000, 65000, 14),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5'::uuid, 'DEMO_USER_ID'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Kopi Sachet', 1100, 2000, 90),

  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid, 'DEMO_USER_ID'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Indomie Goreng', 2400, 3000, 55),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'::uuid, 'DEMO_USER_ID'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Aqua 600ml', 5400, 7000, 42),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3'::uuid, 'DEMO_USER_ID'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Telur (per kg)', 32000, 37000, 16),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4'::uuid, 'DEMO_USER_ID'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Beras 5kg', 58000, 65000, 10),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5'::uuid, 'DEMO_USER_ID'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Kopi Sachet', 1100, 2000, 80),

  ('cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid, 'DEMO_USER_ID'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'Indomie Goreng', 2400, 3000, 40),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2'::uuid, 'DEMO_USER_ID'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'Aqua 600ml', 5400, 7000, 24),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc3'::uuid, 'DEMO_USER_ID'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'Telur (per kg)', 32000, 37000, 19),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc4'::uuid, 'DEMO_USER_ID'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'Beras 5kg', 58000, 65000, 12),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc5'::uuid, 'DEMO_USER_ID'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'Kopi Sachet', 1100, 2000, 95)
on conflict (id) do nothing;

-- 4) TRANSACTIONS + TRANSACTION_ITEMS (30 hari terakhir)
-- Model sederhananya: transaksi harian per warung dengan 2 item utama + kadang item tambahan.
with warung_list as (
  select id as warung_id, name from public.warungs where id in (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid
  )
),
days as (
  select (current_date - (g.i || ' day')::interval)::date as day
  from generate_series(0,29) as g(i)
)
insert into public.transactions (id, user_id, warung_id, total, profit, created_at)
select
  gen_random_uuid() as id,
  'DEMO_USER_ID'::uuid as user_id,
  w.warung_id,
  -- total (pendekatan)
  ( (2800 + floor(random()*800)) * (2 + floor(random()*4)) )::numeric(12,2) as total,
  -- profit (margins sekitar 30-35%)
  ( ((2800 + floor(random()*800)) * (2 + floor(random()*4)) ) * (0.3 + random()*0.06) )::numeric(12,2) as profit,
  (d.day + (random()*0.8) * interval '1 day')::timestamptz as created_at
from warung_list w
cross join days d;

-- Items untuk transaksi di atas sulit dihubungkan secara 1:1 tanpa id transaksi hasil insert.
-- Jadi untuk demo portal UI saat ini, kamu bisa skip bagian items.
-- Jika kamu ingin items terisi juga, gunakan pendekatan 2-step: select transaksi created_at lalu insert items.

-- 5) PAYMENTS (pending -> paid)
-- Untuk demo, seed beberapa pembayaran hari ini dan sebelumnya.
insert into public.payments (id, user_id, warung_id, reference, type, provider, status, amount, external_id, raw_payload, created_at, updated_at)
select
  gen_random_uuid(),
  'DEMO_USER_ID'::uuid,
  w.id as warung_id,
  'DEMO_PAY_' || w.id::text as reference,
  case when random() < 0.5 then 'qris' else 'va' end as type,
  'xendit' as provider,
  case when random() < 0.75 then 'paid' else 'pending' end as status,
  (50000 + random()*300000)::numeric(12,2) as amount,
  'EXT_' || floor(random()*1e10)::text as external_id,
  '{}'::jsonb as raw_payload,
  (now() - (random()*12) * interval '1 hour') as created_at,
  now() as updated_at
from public.warungs w
where w.id in (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid
)
on conflict (reference) do nothing;

-- 6) LOANS + REPAYMENTS (contoh)
insert into public.loans (id, user_id, warung_id, amount, tenor_days, interest_rate, score, risk_level, status, created_at)
values
  (gen_random_uuid(), 'DEMO_USER_ID'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 2000000, 14, 0.05, 78, 'low', 'approved', now() - interval '10 days'),
  (gen_random_uuid(), 'DEMO_USER_ID'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 1500000, 7, 0.06, 62, 'medium', 'disbursed', now() - interval '6 days'),
  (gen_random_uuid(), 'DEMO_USER_ID'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 1200000, 30, 0.08, 49, 'high', 'pending', now() - interval '3 days')
on conflict do nothing;

