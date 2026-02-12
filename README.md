# Smart Bookmark App

A beautiful, real-time bookmark manager built with Next.js (App Router), Supabase, and Tailwind CSS.

## Features

- **Google OAuth Login**: Secure sign-up and login with Google.
- **Real-time Updates**: Bookmarks automatically appear/disappear across devices without refreshing (using Supabase Realtime).
- **Private Bookmarks**: Row Level Security (RLS) ensures users only see their own data.
- **Responsive Design**: Glassmorphism UI that works perfectly on mobile and desktop.
- **Optimistic UI**: Fast interactions with instant feedback.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Backend & Auth**: Supabase (PostgreSQL, Auth, Realtime)
- **Styling**: Tailwind CSS 4, Framer Motion (animations), Lucide React (icons)
- **Language**: TypeScript

## Setup Instructions

1. **Clone the repository**:

   ```bash
   git clone <repo-url>
   cd bookmark
   npm install
   ```

2. **Supabase Setup**:
   - Create a new project on [Supabase](https://supabase.com).
   - Go to **Project Settings > API** and copy `URL` and `anon public key`.
   - Go to **Authentication > Providers** and enable **Google**.
     - You will need a distinct Google Cloud Project for this.
     - Add `https://<YOUR-PROJECT>.supabase.co/auth/v1/callback` to Authorized Redirect URIs in Google Cloud Console.

3. **Database Schema**:
   - Go to **SQL Editor** in Supabase dashboard.
   - Run the contents of `schema.sql` included in this repo.
   - This sets up the `bookmarks` table, enables Realtime, and configures RLS policies.

4. **Environment Variables**:
   - Rename `.env.local.example` to `.env.local` (or create it).
   - Add your keys:
     ```bash
     NEXT_PUBLIC_SUPABASE_URL=your-project-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

5. **Run Locally**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.

## Deployment

Deploy to Vercel:

1. Push to GitHub.
2. Import project in Vercel.
3. Add Environment Variables in Vercel settings.
4. Deploy!

## Challenges & Solutions

### 1. Next.js 15 Async Cookies

**Problem**: Next.js 15 made `cookies()` asynchronous, breaking older Supabase SSR examples.
**Solution**: Updated `src/lib/supabase/server.ts` to `await cookies()` before creating the client.

### 2. Real-time Subscription Privacy

**Problem**: Subscribing to `bookmarks` table broadcasted all events to all users by default if RLS wasn't carefully considered with Realtime filters.
**Solution**: Applied a filter `user_id=eq.${user.id}` in the client-side subscription to ensure users only receive their own updates, reducing bandwidth and improving privacy. (Note: RLS protects the data fetch, but Realtime needs explicit filters or "Realtime RLS" configuration).

### 3. Glassmorphism Performance

**Problem**: Heavy use of `backdrop-blur` can be slow on mobile.
**Solution**: Optimized with specific `backdrop-blur-md` and limited layers to ensure smooth scrolling.
