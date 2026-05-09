-- profiles: one row per auth user
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  display_name   text not null,
  avatar_url     text,
  level          int  not null default 1,
  xp             int  not null default 0,
  current_streak int  not null default 0,
  best_streak    int  not null default 0,
  total_minutes  int  not null default 0,
  updated_at     timestamptz not null default now()
);

-- activities: each logged activity
create table public.activities (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  type             text not null,
  duration_minutes int  not null check (duration_minutes > 0),
  photo_url        text not null,
  logged_at        timestamptz not null default now()
);

-- streak_days: one row per (user, UTC date)
create table public.streak_days (
  user_id        uuid not null references public.profiles(id) on delete cascade,
  date           date not null,
  minutes_logged int  not null default 0,
  primary key (user_id, date)
);

-- Indexes for common queries
create index on public.activities (user_id, logged_at desc);
create index on public.streak_days (user_id, date desc);

-- Row Level Security
alter table public.profiles    enable row level security;
alter table public.activities  enable row level security;
alter table public.streak_days enable row level security;

-- profiles: everyone can read (leaderboard), only owner can update
create policy "profiles_read_all"   on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- activities: owner only
create policy "activities_read_own"   on public.activities for select using (auth.uid() = user_id);
create policy "activities_insert_own" on public.activities for insert with check (auth.uid() = user_id);

-- streak_days: owner only
create policy "streak_days_read_own"    on public.streak_days for select  using (auth.uid() = user_id);
create policy "streak_days_insert_own"  on public.streak_days for insert  with check (auth.uid() = user_id);
create policy "streak_days_update_own"  on public.streak_days for update  using (auth.uid() = user_id);

-- Trigger: create profile on first Google sign-in
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Mover'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage bucket for activity proof photos
insert into storage.buckets (id, name, public)
values ('activity-proofs', 'activity-proofs', false)
on conflict do nothing;

-- Storage RLS: users can upload/read files under their own user_id folder
create policy "storage_upload_own" on storage.objects
  for insert with check (
    bucket_id = 'activity-proofs' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "storage_read_own" on storage.objects
  for select using (
    bucket_id = 'activity-proofs' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
