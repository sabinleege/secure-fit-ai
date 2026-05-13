
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text default '',
  age int default 28,
  height numeric default 178,
  weight numeric default 80,
  profession text default 'office',
  activity_level text default 'moderate',
  chronic_diseases text default '',
  past_surgeries text default '',
  medications text default '',
  pain_areas text default '',
  injuries jsonb default '[]'::jsonb,
  target_weight numeric default 75,
  timeline text default '6months',
  goal_description text default '',
  body_fat numeric default 18,
  fitness_score int default 72,
  recovery_score int default 85,
  consistency_score int default 87,
  heart_rate int default 68,
  daily_calories_target int default 2150,
  water_glasses int default 0,
  water_target int default 8,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Meal logs (one row per user per date)
create table public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  date date not null,
  meals jsonb default '[]'::jsonb,
  total_calories int default 0,
  total_protein int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, date)
);

-- Workout logs
create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  date date not null,
  plan_id uuid,
  completion_rate numeric default 0,
  notes text,
  created_at timestamptz default now()
);

-- Workout plans
create table public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  week_start date not null,
  plan_data jsonb not null,
  completed_exercises jsonb default '[]'::jsonb,
  is_adjusted boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Goal progress
create table public.goal_progress (
  user_id uuid primary key references auth.users on delete cascade,
  current_weight numeric,
  projected_outcome text,
  last_calculated timestamptz default now()
);

-- Notifications
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'tip',
  read boolean default false,
  created_at timestamptz default now()
);

-- Weight history
create table public.weight_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  week_label text not null,
  weight numeric not null,
  recorded_at timestamptz default now()
);

-- Activity data
create table public.activity_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  day text not null,
  date date not null,
  calories int not null default 0,
  unique (user_id, date)
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.meal_logs enable row level security;
alter table public.workout_logs enable row level security;
alter table public.workout_plans enable row level security;
alter table public.goal_progress enable row level security;
alter table public.notifications enable row level security;
alter table public.weight_history enable row level security;
alter table public.activity_data enable row level security;

-- Policies: profiles
create policy "own profile select" on public.profiles for select using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);
create policy "own profile delete" on public.profiles for delete using (auth.uid() = id);

-- Policies: helper for user_id-owned tables
create policy "own meal_logs all" on public.meal_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own workout_logs all" on public.workout_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own workout_plans all" on public.workout_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own goal_progress all" on public.goal_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own notifications all" on public.notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own weight_history all" on public.weight_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own activity_data all" on public.activity_data for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger meal_logs_updated_at before update on public.meal_logs
  for each row execute function public.set_updated_at();
create trigger workout_plans_updated_at before update on public.workout_plans
  for each row execute function public.set_updated_at();

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
