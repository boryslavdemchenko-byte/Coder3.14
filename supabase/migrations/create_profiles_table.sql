create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_username_unique
  on public.profiles (lower(username))
  where username is not null;

alter table public.profiles enable row level security;

do $$
begin
  create policy "Profiles are viewable by owner"
    on public.profiles
    for select
    using (auth.uid() = id);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy "Users can insert own profile"
    on public.profiles
    for insert
    with check (auth.uid() = id);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy "Users can update own profile"
    on public.profiles
    for update
    using (auth.uid() = id)
    with check (auth.uid() = id);
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if exists (
    select 1
    from pg_trigger
    where tgname = 'set_profiles_updated_at'
  ) then
    drop trigger set_profiles_updated_at on public.profiles;
  end if;
end $$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, nullif(new.raw_user_meta_data->>'username', ''))
  on conflict (id) do update
    set username = excluded.username,
        updated_at = now();
  return new;
end;
$$;

do $$
begin
  if exists (
    select 1
    from pg_trigger
    where tgname = 'on_auth_user_created'
  ) then
    drop trigger on_auth_user_created on auth.users;
  end if;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();
