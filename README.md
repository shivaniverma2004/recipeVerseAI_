# RecipeVerse AI

A full-stack web application for AI-powered recipe discovery, management, and cooking assistance. Built with Next.js, Supabase, and Google Gemini AI.

## Features

- **Recipe Feed** — Infinite-scrolling feed of recipes from users you follow
- **Explore & Search** — Discover recipes and users with filters (cuisine, difficulty, keyword)
- **Full CRUD Recipes** — Create, edit, and delete recipes with structured ingredients and step-by-step preparation
- **Favorites** — Save and manage your favorite recipes
- **Social System** — Follow/unfollow other users and browse their public profiles
- **AI Cooking Assistant** — Chat with Gemini AI for recipe ideas, substitutions, meal planning, and cooking fixes
- **User Profiles** — Manage avatar, name, bio, email, and password
- **Authentication** — Email/password login via Supabase Auth

## Tech Stack

| Layer                  | Technology                                   |
| ---------------------- | -------------------------------------------- |
| **Framework**          | Next.js 16 (App Router)                      |
| **UI Library**         | React 19, TypeScript                         |
| **Styling**            | Tailwind CSS v4, ShadCN UI / Radix UI        |
| **State**              | React Context                                |
| **Forms**              | react-hook-form, Zod                         |
| **Backend / Database** | Supabase (PostgreSQL, Auth, Storage)         |
| **AI**                 | Google Generative AI (Gemini 2.5 Flash Lite) |
| **Package Manager**    | pnpm                                         |

## Prerequisites

- **Node.js** 20+
- **pnpm** (`npm install -g pnpm`)
- A **Supabase** project (free tier works)
- A **Google Gemini API key**

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-anon-key"

GEMINI_API_KEY="your-gemini-api-key"
```

> Copy `.env.example` as a starting template:
>
> ```bash
> cp .env.example .env.local
> ```

### Where they are used

| Variable                               | Purpose                                    |
| -------------------------------------- | ------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL (client & server)     |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous/public key              |
| `GEMINI_API_KEY`                       | Google Gemini API key for the AI assistant |

## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/kibriahq/recipeverseai-app.git
   cd recipeverseai-app
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment variables**

   Fill in your `.env.local` with your Supabase project credentials and Gemini API key.

4. **Run database migrations** (via Supabase Studio or SQL editor)

   The app expects the following tables in your Supabase database:

   **`profiles`** — User profiles

   ```sql
   create table public.profiles (
    id uuid not null default gen_random_uuid (),
    name text null,
    username text null,
    email text null,
    bio text null,
    avatar text null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp without time zone null default now(),
    constraint profiles_pkey primary key (id),
    constraint profiles_email_key unique (email),
    constraint profiles_username_key unique (username)
   ) TABLESPACE pg_default;
   ```

   **`recipes`** — Recipe data

   ```sql
   create table public.recipes (
    id uuid not null default gen_random_uuid (),
    title text not null,
    description text null,
    cover_img text null,
    ingredients jsonb null,
    preparation_steps jsonb null,
    preparation_time text null,
    cooking_time text null,
    servings integer null,
    difficulty text null,
    cuisine text null,
    tags text null,
    status text null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp without time zone null default now(),
    user_id uuid null,
    constraint recipes_pkey primary key (id),
    constraint recipes_user_id_fkey foreign KEY (user_id) references profiles (id)
   ) TABLESPACE pg_default;
   ```

   **`recipe_loves`** — Favorites

   ```sql
   create table public.recipe_loves (
    id uuid not null default gen_random_uuid (),
    recipe_id uuid not null,
    user_id uuid not null,
    created_at timestamp with time zone null default now(),
    constraint recipe_loves_pkey primary key (id),
    constraint recipe_loves_recipe_id_user_id_key unique (recipe_id, user_id),
    constraint recipe_loves_recipe_id_fkey foreign KEY (recipe_id) references recipes (id) on delete CASCADE,
    constraint recipe_loves_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
   ) TABLESPACE pg_default;
   ```

   **`user_follows`** — Follow system

   ```sql
    create table public.user_follows (
    id bigint generated by default as identity not null,
    follower_id uuid null,
    following_id uuid null,
    created_at timestamp with time zone not null default now(),
    constraint user_follows_pkey1 primary key (id),
    constraint user_follows_follower_id_fkey1 foreign KEY (follower_id) references profiles (id),
    constraint user_follows_following_id_fkey1 foreign KEY (following_id) references profiles (id)
   ) TABLESPACE pg_default;
   ```

5. **Set up Storage buckets**

   In your Supabase dashboard, create two storage buckets:
   - `covers` — Recipe cover images (public)
   - `avatars` — User profile pictures (public)

6. **Start the development server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Auto-create Profile on User Signup

When a new user signs up through Supabase Auth (`auth.users`), a corresponding row is automatically created in `public.profiles` via a Postgres trigger. This avoids needing a separate API call from the client to create the profile.

### How it works

1. **Trigger function** — `handle_new_user()`
   - Runs with `security definer`, so it executes with the privileges of the function owner (not the calling user). This is required because the client (anon/authenticated role) doesn't have direct INSERT access to `public.profiles` under RLS — the trigger needs elevated privileges to do it on their behalf.
   - `set search_path = public` is set explicitly to prevent search_path hijacking (a known Postgres security gotcha with `security definer` functions).
   - Falls back gracefully using `coalesce()`:
     - `name` defaults to `''` if not provided in `raw_user_meta_data` (e.g. OAuth providers that don't send a name).
     - `username` defaults to the user's `id` (as text) if not set, so there's no NOT NULL / unique constraint failure on signup — the user can update it later from settings.

2. **Trigger** — `on_auth_user_created`
   - Fires `after insert on auth.users`, `for each row`.
   - Calls `handle_new_user()` for every newly created auth user.
   - Wrapped in `drop trigger if exists` so the migration is idempotent (safe to re-run).

### SQL

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'username', new.id::text)
  );

  return new;
end;
$$;
```

```sql
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Notes
- This trigger lives in the database (not application code) — visible in Supabase Dashboard → Database → Triggers / Functions, or in your migrations folder.
- If signup ever fails with "profile not created" but auth user exists, check this trigger first — it's the most common point of silent failure (e.g. RLS blocking insert despite `security definer`, or a schema mismatch in `profiles` columns).

## Scripts

| Command      | Description              |
| ------------ | ------------------------ |
| `pnpm dev`   | Start development server |
| `pnpm build` | Build for production     |
| `pnpm start` | Start production server  |
| `pnpm lint`  | Run ESLint               |

## Project Structure

```
app/                  # Next.js App Router pages & API routes
├── api/ai/route.ts   # Gemini AI chat endpoint
├── (auth)            # Login, Signup, Forgot Password, Reset Password
├── profile/          # Profile management & recipe CRUD
├── explore/          # Search & discovery
├── recipes/[id]/     # Recipe detail pages
├── users/[username]/ # Public user profiles
└── ai-assistant/     # Full-page AI chat

components/           # Shared UI components
├── ui/               # ShadCN UI primitives
├── RecipeCard/       # Recipe card with fav/delete
├── recipe/           # Ingredients & steps editors
└── Sidebar, Navbar, Footer, etc.

lib/
├── supabase/         # Browser & server Supabase clients
├── actions/          # Server actions (recipes, profile, user, favs)
└── utils.ts          # cn() utility

types/                # TypeScript interfaces
hooks/                # Custom hooks (useAuth, useProfile)
utils/                # Helper utilities
context/              # Auth context provider
```

## Deployment

The project is ready to deploy on **Vercel**.

1. Push your repository to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Set the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `GEMINI_API_KEY`, `SUPABASE_SECRET_KEY`)
4. Deploy

Next.js deployment docs: https://nextjs.org/docs/app/building-your-application/deploying

## License

MIT
