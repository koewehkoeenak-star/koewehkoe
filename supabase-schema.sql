-- Jalankan di Supabase SQL Editor. Ganti owner@example.com dengan email akun owner.
create extension if not exists pgcrypto;
create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(),
 order_code text not null unique,
 customer_name text not null check(char_length(customer_name) between 1 and 100),
 customer_phone text not null check(char_length(customer_phone) between 3 and 30),
 customer_address text not null default '' check(char_length(customer_address)<=500),
 items jsonb not null check(jsonb_typeof(items)='array'),
 total integer not null check(total>=0),
 payment_method text not null check(payment_method in ('QRIS','Transfer Bank','COD')),
 payment_status text not null default 'pending' check(payment_status in ('pending','paid','rejected')),
 order_status text not null default 'new' check(order_status in ('new','processing','completed','cancelled')),
 created_at timestamptz not null default now()
);
alter table public.orders enable row level security;
drop policy if exists "Customer can submit pending orders" on public.orders;
drop policy if exists "Owner can view orders" on public.orders;
drop policy if exists "Owner can update orders" on public.orders;
create policy "Customer can submit pending orders" on public.orders for insert to anon,authenticated with check(payment_status='pending' and order_status='new' and total>=0);
create policy "Owner can view orders" on public.orders for select to authenticated using((auth.jwt()->>'email')='owner@example.com');
create policy "Owner can update orders" on public.orders for update to authenticated using((auth.jwt()->>'email')='owner@example.com') with check((auth.jwt()->>'email')='owner@example.com');
grant usage on schema public to anon,authenticated;
grant insert on public.orders to anon,authenticated;
grant select,update on public.orders to authenticated;
