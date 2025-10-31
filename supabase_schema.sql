begin;

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    full_name text,
    avatar_url text,
    role text not null check (role in ('user', 'admin', 'superuser')) default 'user',
    created_at timestamptz not null default now()
);

create table if not exists public.questions (
    id uuid primary key default gen_random_uuid(),
    category text not null,
    prompt text not null,
    options jsonb not null,
    correct_index integer not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    constraint questions_options_valid_ck check (
        jsonb_typeof(options) = 'array'
        and jsonb_array_length(options) >= 2
        and correct_index >= 0
        and correct_index < jsonb_array_length(options)
    )
);

create table if not exists public.quiz_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    started_at timestamptz not null default now(),
    completed_at timestamptz
);

create table if not exists public.quiz_answers (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references public.quiz_sessions (id) on delete cascade,
    question_id uuid not null references public.questions (id) on delete restrict,
    chosen_index integer not null check (chosen_index >= 0),
    is_correct boolean not null default false,
    answered_at timestamptz not null default now()
);

create index if not exists idx_questions_category on public.questions (category);
create index if not exists idx_questions_is_active on public.questions (is_active);
create index if not exists idx_quiz_sessions_user_id on public.quiz_sessions (user_id);
create index if not exists idx_quiz_answers_session_id on public.quiz_answers (session_id);
create index if not exists idx_quiz_answers_question_id on public.quiz_answers (question_id);

create or replace function public.current_user_is_superuser()
returns boolean
language sql
stable
as $$
    select exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role in ('superuser', 'admin')
    );
$$;

create or replace function public.restrict_profile_role_change()
returns trigger
language plpgsql
as $$
declare
    requester_is_superuser boolean;
begin
    if new.role is distinct from old.role then
        if auth.uid() is null then
            requester_is_superuser := true;
        else
            requester_is_superuser := public.current_user_is_superuser();
        end if;

        if requester_is_superuser is not true then
            raise exception 'Only superusers can change profile roles.';
        end if;
    end if;

    return new;
end;
$$;

drop trigger if exists restrict_profile_role_change on public.profiles;
create trigger restrict_profile_role_change
before update of role on public.profiles
for each row
execute function public.restrict_profile_role_change();

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.questions enable row level security;
alter table public.questions force row level security;
alter table public.quiz_sessions enable row level security;
alter table public.quiz_sessions force row level security;
alter table public.quiz_answers enable row level security;
alter table public.quiz_answers force row level security;

drop policy if exists select_own_profile on public.profiles;
create policy select_own_profile on public.profiles
    for select
    to authenticated
    using (auth.uid() = id);

drop policy if exists insert_own_profile on public.profiles;
create policy insert_own_profile on public.profiles
    for insert
    to authenticated
    with check (auth.uid() = id);

drop policy if exists update_own_profile on public.profiles;
create policy update_own_profile on public.profiles
    for update
    to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id and role = 'user');

drop policy if exists admin_manage_profiles on public.profiles;
create policy admin_manage_profiles on public.profiles
    for all
    to authenticated
    using (public.current_user_is_superuser())
    with check (public.current_user_is_superuser() or role = 'user');

drop policy if exists select_active_questions on public.questions;
create policy select_active_questions on public.questions
    for select
    to authenticated
    using (is_active);

drop policy if exists admin_all_questions on public.questions;
create policy admin_all_questions on public.questions
    for all
    to authenticated
    using (public.current_user_is_superuser())
    with check (public.current_user_is_superuser());

drop policy if exists manage_own_quiz_sessions on public.quiz_sessions;
create policy manage_own_quiz_sessions on public.quiz_sessions
    for all
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists admin_read_quiz_sessions on public.quiz_sessions;
create policy admin_read_quiz_sessions on public.quiz_sessions
    for select
    to authenticated
    using (public.current_user_is_superuser());

drop policy if exists manage_own_quiz_answers on public.quiz_answers;
create policy manage_own_quiz_answers on public.quiz_answers
    for all
    to authenticated
    using (
        exists (
            select 1
            from public.quiz_sessions qs
            where qs.id = session_id
              and qs.user_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1
            from public.quiz_sessions qs
            where qs.id = session_id
              and qs.user_id = auth.uid()
        )
    );

drop policy if exists admin_read_quiz_answers on public.quiz_answers;
create policy admin_read_quiz_answers on public.quiz_answers
    for select
    to authenticated
    using (public.current_user_is_superuser());

grant usage on schema public to authenticated, anon;
grant select, update on public.profiles to authenticated;
grant all on public.questions to authenticated;
grant all on public.quiz_sessions to authenticated;
grant all on public.quiz_answers to authenticated;

with seed_questions(category, prompt, options, correct_index, is_active) as (
    values
        ('mathematics', 'What is 2 + 2?', jsonb_build_array('4', '3', '5', '6'), 0, true),
        ('mathematics', 'Which of the following numbers is prime?', jsonb_build_array('21', '27', '29', '35'), 2, true),
        ('science', 'Which gas do plants absorb during photosynthesis?', jsonb_build_array('Oxygen', 'Carbon dioxide', 'Nitrogen', 'Helium'), 1, true),
        ('science', 'Which organ pumps blood through the human body?', jsonb_build_array('Lungs', 'Stomach', 'Heart', 'Pancreas'), 2, true),
        ('history', 'In which year did World War II end?', jsonb_build_array('1942', '1945', '1939', '1950'), 1, true),
        ('history', 'Who was the primary author of the United States Declaration of Independence?', jsonb_build_array('John Adams', 'Thomas Jefferson', 'James Madison', 'Benjamin Franklin'), 1, true),
        ('geography', 'What is the capital of Australia?', jsonb_build_array('Sydney', 'Canberra', 'Melbourne', 'Perth'), 1, true),
        ('geography', 'Which continent is the Sahara Desert located on?', jsonb_build_array('Africa', 'Asia', 'South America', 'Australia'), 0, true),
        ('programming', 'Which programming language runs natively in web browsers?', jsonb_build_array('JavaScript', 'Python', 'C#', 'Ruby'), 0, true),
        ('technology', 'What does SQL stand for?', jsonb_build_array('Simple Query Language', 'Structured Query Language', 'Sequential Question Logic', 'Standard Query List'), 1, true),
        ('literature', 'Who wrote the novel "1984"?', jsonb_build_array('George Orwell', 'Ray Bradbury', 'Aldous Huxley', 'Arthur C. Clarke'), 0, true),
        ('literature', 'Which Shakespeare play features the characters Rosencrantz and Guildenstern?', jsonb_build_array('Hamlet', 'Macbeth', 'Othello', 'The Tempest'), 0, true),
        ('physics', 'Approximately how fast is gravity on Earth?', jsonb_build_array('9.8 m/s^2', '3.7 m/s^2', '1.6 m/s^2', '24.8 m/s^2'), 0, true),
        ('physics', 'Light travels fastest in which medium?', jsonb_build_array('Water', 'Glass', 'Vacuum', 'Diamond'), 2, true),
        ('chemistry', 'What is the chemical symbol for sodium?', jsonb_build_array('Na', 'So', 'Sn', 'S'), 0, true),
        ('chemistry', 'A pH value of 7 is considered?', jsonb_build_array('Acidic', 'Basic', 'Neutral', 'Alkaline'), 2, true),
        ('art', 'Which artist painted the Mona Lisa?', jsonb_build_array('Michelangelo', 'Raphael', 'Leonardo da Vinci', 'Donatello'), 2, true),
        ('music', 'The treble clef is also known as the?', jsonb_build_array('F clef', 'C clef', 'G clef', 'Bass clef'), 2, true),
        ('sports', 'How many players does each team field in a standard soccer match?', jsonb_build_array('9', '10', '11', '12'), 2, true),
        ('economics', 'What economic term describes a sustained increase in the general price level?', jsonb_build_array('Deflation', 'Stagnation', 'Recession', 'Inflation'), 3, true)
)
insert into public.questions (category, prompt, options, correct_index, is_active)
select s.category, s.prompt, s.options, s.correct_index, s.is_active
from seed_questions s
where not exists (select 1 from public.questions);

-- To promote seeded admins to superuser run this once in Supabase SQL editor:
-- update public.profiles p
-- set role = 'superuser'
-- from auth.users u
-- where p.id = u.id
--   and u.email in ('examengine2025@gmail.com', 'sysdrummatic@gmail.com');

commit;
