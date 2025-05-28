-- Create documentation table
create table if not exists documentation (
    id uuid default uuid_generate_v4() primary key,
    simulation_id uuid references simulations(id) on delete cascade,
    content text not null,
    generated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes
create index if not exists documentation_simulation_id_idx on documentation(simulation_id);
create index if not exists documentation_generated_at_idx on documentation(generated_at);

-- Add RLS policies
alter table documentation enable row level security;

create policy "Users can view documentation they have access to"
    on documentation for select
    using (
        auth.uid() in (
            select user_id
            from simulations
            where id = documentation.simulation_id
        )
    );

create policy "Users can create documentation for their simulations"
    on documentation for insert
    with check (
        auth.uid() in (
            select user_id
            from simulations
            where id = documentation.simulation_id
        )
    ); 