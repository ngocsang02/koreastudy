-- Run once in Supabase SQL Editor, or apply with the Supabase CLI.
create table public.learning_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  grammar_id text not null check (grammar_id ~ '^E[0-9]+$'),
  saved boolean not null default false,
  learned boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, grammar_id)
);

create function public.set_learning_progress_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger learning_progress_updated_at
before update on public.learning_progress
for each row execute function public.set_learning_progress_updated_at();

alter table public.learning_progress enable row level security;
revoke all on public.learning_progress from anon, authenticated;
grant select, insert, update on public.learning_progress to authenticated;

create policy "Read own progress" on public.learning_progress
for select to authenticated using ((select auth.uid()) = user_id);

create policy "Insert own progress" on public.learning_progress
for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Update own progress" on public.learning_progress
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
