-- Create a "bookmarks" table
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table bookmarks enable row level security;

-- Policy: Select own bookmarks
create policy "Users can view their own bookmarks" on bookmarks
  for select using (auth.uid() = user_id);

-- Policy: Insert own bookmarks
create policy "Users can insert their own bookmarks" on bookmarks
  for insert with check (auth.uid() = user_id);

-- Policy: Delete own bookmarks
create policy "Users can delete their own bookmarks" on bookmarks
  for delete using (auth.uid() = user_id);

-- Policy: Update own bookmarks (optional but good practice)
create policy "Users can update their own bookmarks" on bookmarks
  for update using (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table bookmarks;
