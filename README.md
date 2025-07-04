<p align="center">
  <img src="public/triviagame-logo.png" alt="TriviaShare Logo" width="150" />
</p>

<h1 align="center">TriviaShare</h1>

<p align="center">
  A web app for creating, sharing, and playing custom trivia games with friends.
  <br/>
  View Live Site: <a href="https://triviashare.netlify.app">https://triviashare.netlify.app</a>
</p>

---

## Key Features

- Multiplayer trivia with score tracking
- Create your own trivia sets with categories and custom points
- Share trivias with others via username
- Answer-stealing mechanic when a question is missed

## Tech Stack

- **Next.js 14 (App Router)**
- **React + TypeScript**
- **Supabase (Auth, DB, Storage)**
- **Netlify (Deployment)**

## Getting Started

If you want to run this project locally, follow these steps carefully. This project depends on a Supabase backend, so you will need to:

### 1. Set up Supabase

- Create a new Supabase project at [supabase.com](https://supabase.com)
- Open the SQL editor in your Supabase project and run the following SQL to create tables, policies, and triggers:

```sql
-- 1. Drop existing tables if they exist
DROP TABLE IF EXISTS triviagames CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- 2. Create 'clients' table to store user profiles and their trivia lists
CREATE TABLE clients (
  creator_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  profile_pic_url TEXT,
  my_trivia_games JSONB DEFAULT '[]',
  trivia_games_shared_w_me JSONB DEFAULT '[]'
);

-- 3. Create 'triviagames' table to store trivia game data
CREATE TABLE triviagames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in progress', 'completed')),
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Enable Row Level Security (RLS) for both tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE triviagames ENABLE ROW LEVEL SECURITY;

-- 5. Define Policies for 'clients' table

-- Allow authenticated users to insert their own client record
CREATE POLICY "Allow insert for owner" ON clients
  FOR INSERT TO authenticated
  WITH CHECK (creator_id = auth.uid());

-- Allow authenticated users to select any client record
CREATE POLICY "Allow authenticated users to read all clients" ON clients
  FOR SELECT TO authenticated
  USING (true);

-- Allow authenticated users to select their own client record
CREATE POLICY "Allow select for owner" ON clients
  FOR SELECT TO authenticated
  USING (creator_id = auth.uid());

-- Allow authenticated users to update their own client record
CREATE POLICY "Allow update for owner" ON clients
  FOR UPDATE TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- Allow authenticated users to delete their own client record
CREATE POLICY "Allow delete for owner" ON clients
  FOR DELETE TO authenticated
  USING (creator_id = auth.uid());

-- 6. Define Policies for 'triviagames' table

-- Allow authenticated users to insert their own trivia games
CREATE POLICY "Allow insert for owner" ON triviagames
  FOR INSERT TO authenticated
  WITH CHECK (creator_id = auth.uid());

-- Allow authenticated users to select their own trivia games
CREATE POLICY "Allow select for owner" ON triviagames
  FOR SELECT TO authenticated
  USING (creator_id = auth.uid());

-- Allow authenticated users to update their own trivia games
CREATE POLICY "Allow update for owner" ON triviagames
  FOR UPDATE TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- Allow authenticated users to delete their own trivia games
CREATE POLICY "Allow delete for owner" ON triviagames
  FOR DELETE TO authenticated
  USING (creator_id = auth.uid());

-- 7. Create trigger function to auto-insert into 'clients' when new user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE NOTICE 'Trigger fired for new user id: %', NEW.id;
  RAISE NOTICE 'raw_user_meta_data: %', NEW.raw_user_meta_data;

  INSERT INTO public.clients (
    creator_id,
    username,
    profile_pic_url,
    my_trivia_games,
    trivia_games_shared_w_me
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', ''),
    '',
    '[]'::jsonb,
    '[]'::jsonb
  );

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on 'auth.users' table to call function after insert
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_user();

-- 8. Additional policy for update on clients table (redundant but explicit)
CREATE POLICY "Allow user to update own record" ON clients
  FOR UPDATE
  USING (auth.uid() = creator_id);
```

### 2. Create Supabase Storage Bucket and Policies

- In the Supabase dashboard, create a storage bucket named avatars
- Run the following policies for the bucket:

```sql
-- IMPORTANT: Before applying these policies,
-- create the storage bucket named 'avatars' in Supabase Storage.

-- Policy to allow authenticated users to upload files
CREATE POLICY "Allow upload for authenticated users"
ON storage.objects
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND bucket_id = 'avatars'       -- bucket name
  AND starts_with(name, auth.uid() || '/')  -- restrict files to user's folder
);

-- Policy to allow authenticated users to select (read) their own files
CREATE POLICY "Allow select for authenticated users"
ON storage.objects
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND bucket_id = 'avatars'
  AND starts_with(name, auth.uid() || '/')
);

-- Policy to allow authenticated users to delete their own files
CREATE POLICY "Allow delete for authenticated users"
ON storage.objects
FOR DELETE
USING (
  auth.uid() IS NOT NULL
  AND bucket_id = 'avatars'
  AND starts_with(name, auth.uid() || '/')
);

-- Policy to allow all authenticated users to read public avatar files
CREATE POLICY "Allow read access to all avatars for authenticated users"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
);
```

### 3. Setup Shared Trivia Access Policies

- After the above run successfully, run these policies to allow shared trivia access:

```sql
create policy "Allow updating shared trivia for others"
on clients
for update
to authenticated
using (creator_id != auth.uid())
with check (jsonb_typeof(trivia_games_shared_w_me) = 'array');

create policy "Allow reading shared trivias"
on triviagames
for select
to authenticated
using (
  exists (
    select 1
    from clients
    where clients.creator_id = auth.uid()
      and jsonb_typeof(clients.trivia_games_shared_w_me) = 'array'
      and triviagames.id::text in (
        select jsonb_array_elements_text(clients.trivia_games_shared_w_me)
      )
  )
);
```

### 4. Environment Variables

- First, clone this project and go to the root:

```bash
git clone https://github.com/GitProjsStack/TriviaShare.git
cd TriviaShare
```

- Then, create a *`.env.local`* file in the root of your project with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Running Locally

- Finally, install dependencies and start the dev server in the project root:
```bash
# Assuming you've already cloned the repo and entered the project directory
npm install
npm run dev
```