# Warung OS Indonesia V3

Platform lengkap untuk digitalisasi warung Indonesia:

- Catat penjualan harian
- Hitung untung otomatis
- Pantau stok + alert stok menipis
- Pembayaran QRIS / Virtual Account (Xendit-ready)
- Pembiayaan mikro (lending score + pengajuan pinjaman)
- Supplier marketplace + restock order
- WhatsApp bot + daily report
- AI assistant (Claude-ready, fallback local insight)

Tech stack: Next.js App Router, Tailwind, shadcn/ui, Supabase Auth+Postgres+Realtime, Xendit, WhatsApp API, Claude API.

## Pages

- `/login` - login email OTP (MVP auth)
- `/dashboard` - total penjualan, untung, produk terlaris, notifikasi
- `/jualan` - input jualan super simple (tap produk + manual)
- `/stok` - list produk, stok, alert stok hampir habis
- `/pembayaran` - buat invoice QRIS/VA + riwayat pembayaran
- `/pembiayaan` - credit scoring + pengajuan pinjaman
- `/supplier` - katalog supplier + restock order
- `/admin` - ringkasan operasional lintas modul
- `/ai-chat` - chat AI Bahasa Indonesia + voice input ready

## Environment Variables

Buat `.env.local`:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
CLAUDE_API_KEY=
XENDIT_SECRET_KEY=
XENDIT_WEBHOOK_TOKEN=
WHATSAPP_API_KEY=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
```

## Run Local

```bash
npm install
npm run dev
```

## Supabase Schema

Run SQL dari file:

`supabase/schema.sql`

Optional seed supplier:

`supabase/seed.sql`

## Deployment

Lihat panduan lengkap:

`docs/DEPLOYMENT.md`
