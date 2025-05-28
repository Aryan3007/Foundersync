-- Create users table
create table if not exists users (
    id uuid primary key references auth.users(id),
    full_name text,
    email text,
    created_at timestamp default now()
);

-- Create simulations table
create table if not exists simulations (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id) on delete cascade,
    startup_name text not null,
    description text not null,
    industry text not null,
    created_at timestamp default now(),
    updated_at timestamp default now()
);

-- Add RLS policy for simulations
alter table simulations enable row level security;

create policy "Users can view their own simulations"
    on simulations for select
    using (user_id = auth.uid());

create policy "Users can insert their own simulations"
    on simulations for insert
    with check (user_id = auth.uid());

-- Create conversations table
create table if not exists conversations (
    id uuid default uuid_generate_v4() primary key,
    simulation_id uuid references simulations(id) on delete cascade,
    agent_name text not null,
    user_message text not null,
    agent_response jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies for conversations
alter table conversations enable row level security;

create policy "Users can view their own conversations"
    on conversations for select
    using (
        simulation_id in (
            select id from simulations
            where user_id = auth.uid()
        )
    );

create policy "Users can insert their own conversations"
    on conversations for insert
    with check (
        simulation_id in (
            select id from simulations
            where user_id = auth.uid()
        )
    );

-- Create indexes for conversations
create index if not exists conversations_simulation_id_idx on conversations(simulation_id);
create index if not exists conversations_agent_name_idx on conversations(agent_name);
create index if not exists conversations_created_at_idx on conversations(created_at);
