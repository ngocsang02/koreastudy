create table public.review_schedule (
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id text not null check (word_id ~ '^V[1-6]-[0-9]+-[0-9]+$'),
  stage smallint not null default 0 check (stage between 0 and 7),
  lapses integer not null default 0 check (lapses >= 0),
  reviews integer not null default 0 check (reviews >= 0),
  last_rating text not null check (last_rating in ('enrolled','again','hard','good')),
  interval_minutes integer not null default 0 check (interval_minutes >= 0),
  due_at timestamptz not null,
  last_reviewed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id,word_id)
);
create index review_schedule_due on public.review_schedule(user_id,due_at);
alter table public.review_schedule enable row level security;
revoke all on public.review_schedule from anon,authenticated;
grant select,insert,update on public.review_schedule to authenticated;
create policy "Read own review schedule" on public.review_schedule for select to authenticated using ((select auth.uid())=user_id);
create policy "Insert own review schedule" on public.review_schedule for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Update own review schedule" on public.review_schedule for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create trigger review_schedule_updated_at before update on public.review_schedule for each row execute function public.set_learning_progress_updated_at();
