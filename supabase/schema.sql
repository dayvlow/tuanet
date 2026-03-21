create extension if not exists pgcrypto;

create table if not exists public.account_profiles (
    user_id uuid primary key references auth.users (id) on delete cascade,
    full_name text,
    birth_date date,
    email text,
    email_verified boolean not null default false,
    two_factor_enabled boolean not null default false,
    balance_amount integer not null default 0,
    balance_currency text not null default '₽',
    balance_updated_at timestamptz not null default timezone('utc', now()),
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.account_keys (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    name text not null,
    region text not null,
    device_type text not null,
    key_kind text not null check (key_kind in ('vpn', 'vpn_whitelist')),
    key_type text not null default 'Device' check (key_type in ('API', 'Device', 'Access')),
    token text not null,
    last4 text not null,
    status text not null default 'active' check (status in ('active', 'revoked', 'expiring', 'rotating')),
    created_at timestamptz not null default timezone('utc', now()),
    last_active_at timestamptz,
    expires_at timestamptz,
    revoked_at timestamptz
);

create table if not exists public.account_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    device text not null,
    location text not null default 'Неизвестная локация',
    last_active_at timestamptz not null default timezone('utc', now()),
    is_current boolean not null default false,
    created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.account_deletion_requests (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    reason text,
    status text not null default 'pending',
    created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_timestamp()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists account_profiles_set_timestamp on public.account_profiles;
create trigger account_profiles_set_timestamp
before update on public.account_profiles
for each row
execute function public.set_timestamp();

create or replace function public.handle_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.account_profiles (
        user_id,
        full_name,
        email,
        email_verified
    )
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
        new.email,
        new.email_confirmed_at is not null
    )
    on conflict (user_id) do update
    set
        full_name = excluded.full_name,
        email = excluded.email,
        email_verified = excluded.email_verified,
        updated_at = timezone('utc', now());

    return new;
end;
$$;

drop trigger if exists on_auth_user_created_or_updated on auth.users;
create trigger on_auth_user_created_or_updated
after insert or update on auth.users
for each row
execute function public.handle_auth_user();

alter table public.account_profiles enable row level security;
alter table public.account_keys enable row level security;
alter table public.account_sessions enable row level security;
alter table public.account_deletion_requests enable row level security;

drop policy if exists "Users read own profile" on public.account_profiles;
create policy "Users read own profile"
on public.account_profiles
for select
using (auth.uid() = user_id);

drop policy if exists "Users update own profile" on public.account_profiles;
create policy "Users update own profile"
on public.account_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users insert own profile" on public.account_profiles;
create policy "Users insert own profile"
on public.account_profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users read own keys" on public.account_keys;
create policy "Users read own keys"
on public.account_keys
for select
using (auth.uid() = user_id);

drop policy if exists "Users insert own keys" on public.account_keys;
create policy "Users insert own keys"
on public.account_keys
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users update own keys" on public.account_keys;
create policy "Users update own keys"
on public.account_keys
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users delete own keys" on public.account_keys;
create policy "Users delete own keys"
on public.account_keys
for delete
using (auth.uid() = user_id);

drop policy if exists "Users read own sessions" on public.account_sessions;
create policy "Users read own sessions"
on public.account_sessions
for select
using (auth.uid() = user_id);

drop policy if exists "Users insert own sessions" on public.account_sessions;
create policy "Users insert own sessions"
on public.account_sessions
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users update own sessions" on public.account_sessions;
create policy "Users update own sessions"
on public.account_sessions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users delete own sessions" on public.account_sessions;
create policy "Users delete own sessions"
on public.account_sessions
for delete
using (auth.uid() = user_id);

drop policy if exists "Users read own deletion requests" on public.account_deletion_requests;
create policy "Users read own deletion requests"
on public.account_deletion_requests
for select
using (auth.uid() = user_id);

drop policy if exists "Users insert own deletion requests" on public.account_deletion_requests;
create policy "Users insert own deletion requests"
on public.account_deletion_requests
for insert
with check (auth.uid() = user_id);
