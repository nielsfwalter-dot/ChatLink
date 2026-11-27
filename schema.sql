
-- =========================================
-- CHATLINK 2.1 – DATABASE SCHEMA
-- =========================================

-- USER PROFILES
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- CHAT SERVERS
create table public.servers (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(name) between 2 and 60),
    owner_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz default now()
);

-- SERVER MEMBERS
create table public.server_members (
    server_id uuid references public.servers(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    joined_at timestamptz default now(),
    primary key (server_id, user_id)
);

-- MESSAGES
create table public.messages (
    id uuid primary key default gen_random_uuid(),
    server_id uuid not null references public.servers(id) on delete cascade,
    sender_id uuid not null references auth.users(id) on delete cascade,
    content text not null check (char_length(content) between 1 and 4000),
    created_at timestamptz default now()
);

-- CREATE PROFILE AFTER REGISTRATION
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, username)
    values (
        new.id,
        coalesce(
            nullif(new.raw_user_meta_data ->> 'username', ''),
            'user-' || left(new.id::text, 8)
        )
    );

    return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ADD SERVER OWNER AS MEMBER
create or replace function public.add_server_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.server_members (server_id, user_id)
    values (new.id, new.owner_id);

    return new;
end;
$$;

create trigger on_server_created
after insert on public.servers
for each row execute procedure public.add_server_owner();

-- CHECK SERVER OWNERSHIP
create or replace function public.is_server_owner(target_server uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.servers
        where id = target_server
        and owner_id = (select auth.uid())
    );
$$;

-- ENABLE ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.servers enable row level security;
alter table public.server_members enable row level security;
alter table public.messages enable row level security;

-- PROFILE POLICIES
create policy "Authenticated users can view profiles"
on public.profiles
for select to authenticated
using (true);

create policy "Users can create their own profile"
on public.profiles
for insert to authenticated
with check (id = (select auth.uid()));

create policy "Users can update their own profile"
on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- SERVER POLICIES
create policy "Members can view their servers"
on public.servers
for select to authenticated
using (
    exists (
        select 1
        from public.server_members
        where server_id = id
        and user_id = (select auth.uid())
    )
);

create policy "Users can create servers"
on public.servers
for insert to authenticated
with check (owner_id = (select auth.uid()));

create policy "Owners can update servers"
on public.servers
for update to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "Owners can delete servers"
on public.servers
for delete to authenticated
using (owner_id = (select auth.uid()));

-- SERVER MEMBER POLICIES
create policy "Members and owners can view memberships"
on public.server_members
for select to authenticated
using (
    user_id = (select auth.uid())
    or public.is_server_owner(server_id)
);

create policy "Owners can add members"
on public.server_members
for insert to authenticated
with check (public.is_server_owner(server_id));

create policy "Owners can remove members"
on public.server_members
for delete to authenticated
using (public.is_server_owner(server_id));

-- MESSAGE POLICIES
create policy "Members can read messages"
on public.messages
for select to authenticated
using (
    exists (
        select 1
        from public.server_members
        where server_id = messages.server_id
        and user_id = (select auth.uid())
    )
);

create policy "Members can send messages"
on public.messages
for insert to authenticated
with check (
    sender_id = (select auth.uid())
    and exists (
        select 1
        from public.server_members
        where server_id = messages.server_id
        and user_id = (select auth.uid())
    )
);

-- TABLE PERMISSIONS
grant select, insert, update
on public.profiles to authenticated;

grant select, insert, update, delete
on public.servers to authenticated;

grant select, insert, delete
on public.server_members to authenticated;

grant select, insert
on public.messages to authenticated;

grant execute on function public.is_server_owner(uuid)
to authenticated;

revoke all on function public.is_server_owner(uuid)
from public;

-- =========================================
-- CHATLINK 2.1 – DATABASE FOUNDATION
-- =========================================
