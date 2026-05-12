-- profiles extends auth.users with app-specific fields.
-- One row per user, created automatically on signup via trigger.

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text unique,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Index for RLS policy lookups
create index profiles_id_idx on public.profiles (id);

alter table public.profiles enable row level security;

-- Users can only read and write their own profile
create policy "profiles: owner read"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "profiles: owner update"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Trigger function: auto-create a profile row on new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
