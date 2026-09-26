create extension if not exists pgcrypto;
create table if not exists public.members (
 id uuid primary key default gen_random_uuid(), name text not null, phone text not null unique, gender text not null,
 family text not null, email text, email_notifications boolean not null default false, registered_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.payments (
 id uuid primary key default gen_random_uuid(), member_id uuid not null references public.members(id) on delete cascade,
 month int not null check(month between 1 and 12), year int not null check(year between 2020 and 2100),
 status text not null default 'unpaid' check(status in ('paid','pending','unpaid')),
 amount numeric(12,2) not null default 0 check(amount >= 0 and amount <= 5000), payment_method text, transaction_id text,
 payment_date timestamptz, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(member_id,month,year)
);
create index if not exists payments_year_idx on public.payments(year);
create index if not exists payments_transaction_idx on public.payments(transaction_id);
alter table public.members enable row level security;
alter table public.payments enable row level security;
-- The public app reads/writes through server-side routes using the service role. No anon policies are granted.
insert into public.members(name,phone,gender,family) values
('Demo Member','0780000000','Other','Gentle Giants Family') on conflict(phone) do nothing;
