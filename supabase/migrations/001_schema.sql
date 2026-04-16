-- Links table
create table links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  long_url text not null,
  created_at timestamptz not null default now()
);

alter table links enable row level security;

create policy "Users see own links" on links for select using (auth.uid() = user_id);
create policy "Users insert own links" on links for insert with check (auth.uid() = user_id);
create policy "Users delete own links" on links for delete using (auth.uid() = user_id);
create policy "Public read by slug" on links for select using (true);

-- Clicks table
create table clicks (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references links(id) on delete cascade,
  clicked_at timestamptz not null default now()
);

alter table clicks enable row level security;

create policy "Users see clicks for own links" on clicks for select
  using (exists (select 1 from links where links.id = clicks.link_id and links.user_id = auth.uid()));
create policy "Anyone can insert clicks" on clicks for insert with check (true);

-- Indexes for performance
create index links_slug_idx on links(slug);
create index links_user_id_idx on links(user_id);
create index clicks_link_id_idx on clicks(link_id);
create index clicks_clicked_at_idx on clicks(clicked_at);
