# Deployment Guide V3 (Supabase + Vercel + Xendit + WhatsApp)

## 1) Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com/).
2. Jalankan SQL `supabase/schema.sql`.
3. (Opsional) jalankan `supabase/seed.sql` untuk data supplier awal.
4. Aktifkan Email Auth provider.
5. Set URL config:
   - `Site URL`: `http://localhost:3000` (dev)
   - `Redirect URL`: `http://localhost:3000/auth/callback`
6. Ambil API config:
   - `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2) Setup Xendit

1. Buat akun [Xendit](https://xendit.co/).
2. Isi env `XENDIT_SECRET_KEY`.
3. Set callback URL: `https://your-domain.com/api/webhooks/xendit`.
4. Set callback token dan isi ke `XENDIT_WEBHOOK_TOKEN`.

## 3) Setup WhatsApp API

1. Siapkan kredensial WhatsApp Business API (Meta Cloud API atau BSP).
2. Isi env:
   - `WHATSAPP_API_KEY`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_VERIFY_TOKEN`
3. Set webhook URL: `https://your-domain.com/api/webhooks/whatsapp`.

## 4) Setup Local

1. Copy `.env.example` menjadi `.env.local`.
2. Isi semua env yang dipakai.
3. Run:

```bash
npm install
npm run dev
```

## 5) Deploy to Vercel

1. Push repo ke GitHub.
2. Import ke Vercel.
3. Tambah semua env di dashboard Vercel.
4. Deploy.
5. Update callback/redirect URL di Supabase, Xendit, WhatsApp.

## 6) Endpoints Operasional

- `POST /api/payments/create-invoice`
- `POST /api/webhooks/xendit`
- `GET/POST /api/webhooks/whatsapp`
- `POST /api/cron/daily-report` (bisa dipanggil Vercel Cron)

## 7) Checklist Produksi

- Login OTP email sukses.
- Pembayaran invoice bisa dibuat.
- Webhook Xendit update status pembayaran.
- Pengajuan pinjaman tersimpan beserta skor.
- Supplier order tersimpan.
- WhatsApp bot bisa reply pertanyaan owner.

## 8) Demo Portal (Live Interactive)

- URL:
  - `https://your-domain/demo` (Executive dashboard + Warung detail + AI insights + pembayaran + lending + supplier + WhatsApp simulasi)
  - `https://your-domain/demo/admin` (Admin overview + activity feed)
- Seed data demo (Supabase):
  - Jalankan `supabase/seed-demo-portal.sql`
  - Script ini butuh `DEMO_USER_ID` (isi dengan `auth.users.id` yang kamu buat untuk demo).
