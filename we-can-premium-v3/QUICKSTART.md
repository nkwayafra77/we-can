# QUICKSTART

## 1. Install
```bash
npm install
npm run dev
```

## 2. Supabase
Open Supabase → SQL Editor → paste `supabase/migrations/001_init_schema.sql` → Run.

## 3. Environment
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_PASSWORD=your_strong_admin_password
FLW_SECRET_KEY=your_flutterwave_secret_key
FLW_PUBLIC_KEY=your_flutterwave_public_key
FLW_WEBHOOK_SECRET=your_webhook_secret
```

## 4. Test the year system
- Register a member.
- Open Admin → select the current year.
- Click **Initialize [year]**.
- Switch to another year.
- Initialize it.
- The two years remain separate.
- Add/record a payment in one year and verify it only appears in that year's history.

## 5. Vercel
Import the GitHub repository and add all production environment variables. `NEXT_PUBLIC_APP_URL` must be your real Vercel/custom-domain URL so Flutterwave can return the customer to the correct app.
