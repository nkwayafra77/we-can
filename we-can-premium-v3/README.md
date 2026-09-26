# 🤝 We Can Payment Tracker — Premium Edition v3

A production-oriented Next.js + Supabase community contribution tracker with **multi-year history**. The selected year controls the admin dashboard, family standing, member history and reports. Old years are never deleted.

## New in v3: Year Management
- Current year is selected automatically.
- Admin can switch between recent years.
- Historical transactions remain in the same `payments` table using `month + year`.
- `Initialize Year` creates/checks 12 monthly records per member for the selected year without deleting previous data.
- January 1 does not require a database reset.
- Admin transaction history is filtered by selected year.
- Family standing is filtered by selected year.

## Stack
Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase/PostgreSQL, Flutterwave Standard Checkout, Vercel.

## Setup
1. Create a Supabase project.
2. Run `supabase/migrations/001_init_schema.sql` in Supabase SQL Editor.
3. Copy `.env.example` to `.env.local` and fill in Supabase URL, publishable key, service-role key, admin password, app URL and Flutterwave secret key.
4. `npm install`
5. `npm run dev`
6. Deploy to Vercel and add the same environment variables.

## Important payment security
Flutterwave's secret key is server-only. The checkout is created by `/api/checkout`; the browser never receives the secret key. After checkout, `/api/flutterwave/verify` verifies the transaction with Flutterwave before changing a payment to `paid`.

For production, configure Flutterwave webhooks and verify webhook signatures as an additional source of payment confirmation. Do not mark a transaction paid merely because a browser returned to your site.

## Year model
A payment is identified by:
`member_id + month + year`

Example:
- John / 12 / 2025
- John / 1 / 2026

Both records can exist forever. The system does not overwrite 2025 when 2026 begins.

## Families
1. Gentle Giants Family
2. Kind Souls Family
3. Little Lights Family
4. Golden Hearts Family
5. Faith Walkers Family
6. Warriors Family
7. Victorious Family
8. Tigers Family
9. Anointed Family
10. Solidarity Family

## Amounts
Members can choose 1,000–5,000 RWF. The default expected contribution used for annual progress is 1,000 RWF per member per month; actual paid amounts are stored exactly.

## Admin
Go to `/admin/login`. Set `ADMIN_PASSWORD` to a strong value. The admin cookie is HTTP-only and server routes validate it before returning dashboard data.

## Notes
This repository is a clean implementation of the requested architecture. Before accepting real money, test Flutterwave in its supported test environment, configure production credentials, verify webhook/signature behavior, and review Supabase RLS and privacy requirements.

✨ God is Good ✨
