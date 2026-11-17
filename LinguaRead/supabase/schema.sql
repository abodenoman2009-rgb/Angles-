-- LinguaRead initial schema. Run in Supabase SQL Editor.
create extension if not exists pgcrypto;

create type public.cefr_level as enum ('A1','A2','B1','B2','C1','C2');
create type public.word_mastery as enum ('new','learning','mastered');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  native_language text not null default 'ar',
  target_language text not null default 'en',
  level public.cefr_level not null default 'A1',
  daily_goal_minutes int not null default 10 check (daily_goal_minutes in (5,10,15)),
  timezone text not null default 'UTC',
  theme text not null default 'system' check (theme in ('light','dark','system')),
  ui_language text not null default 'ar',
  is_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  level public.cefr_level not null,
  topic text not null,
  lang text not null,
  explanation_lang text not null default 'ar',
  description text,
  cover_url text,
  is_published boolean not null default false,
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.paragraphs (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  order_index int not null check (order_index >= 0),
  text_src text not null,
  text_tgt text not null,
  audio_url text,
  unique (story_id, order_index)
);

create table public.saved_words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  word text not null,
  translation text not null,
  example text,
  source_language text not null,
  explanation_language text not null,
  mastery public.word_mastery not null default 'new',
  ease numeric(4,2) not null default 2.50 check (ease >= 1.30),
  interval int not null default 0 check (interval >= 0),
  repetitions int not null default 0 check (repetitions >= 0),
  next_review timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, word, source_language)
);

create table public.progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  paragraph_idx int not null default 0 check (paragraph_idx >= 0),
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, story_id)
);

create table public.daily_stats (
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  minutes int not null default 0 check (minutes >= 0),
  words_reviewed int not null default 0 check (words_reviewed >= 0),
  words_saved int not null default 0 check (words_saved >= 0),
  primary key (user_id, date)
);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text not null,
  icon text
);

create table public.user_achievements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table public.subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','premium')),
  status text not null default 'inactive',
  provider text,
  provider_customer_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create index stories_discovery_idx on public.stories (is_published, level, topic, lang);
create index paragraphs_story_order_idx on public.paragraphs (story_id, order_index);
create index saved_words_due_idx on public.saved_words (user_id, next_review);
create index progress_user_idx on public.progress (user_id);

-- RLS: users can only access their own learning data.
alter table public.profiles enable row level security;
alter table public.stories enable row level security;
alter table public.paragraphs enable row level security;
alter table public.saved_words enable row level security;
alter table public.progress enable row level security;
alter table public.daily_stats enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.subscriptions enable row level security;

create policy "profile read own" on public.profiles for select using (auth.uid() = id);
create policy "profile insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "profile update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "read published stories" on public.stories for select using (is_published = true);
create policy "read paragraphs of published stories" on public.paragraphs for select
  using (exists (select 1 from public.stories s where s.id = story_id and s.is_published = true));

create policy "saved words own all" on public.saved_words for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress own all" on public.progress for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily stats own all" on public.daily_stats for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "read achievements" on public.achievements for select using (true);
create policy "read own earned achievements" on public.user_achievements for select using (auth.uid() = user_id);
create policy "subscription own read" on public.subscriptions for select using (auth.uid() = user_id);

-- Create profile automatically after signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'));
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Keep updated_at current for profile changes.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
