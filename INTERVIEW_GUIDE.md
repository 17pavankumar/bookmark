# Project Technical Walkthrough & Interview Guide

This document provides a line-by-line explanation of the project's architecture, key components, and design decisions. Use this to confidently explain the codebase during technical interviews.

---

## 🏗️ Architecture Overview

**Tech Stack:**

- **Framework:** Next.js 15 (App Router) - Server Components for SEO & Performance.
- **Backend:** Supabase - PostgreSQL Database, Authentication, Realtime subscriptions.
- **Styling:** Tailwind CSS 4 - Utility-first styling with modern features.
- **Language:** TypeScript - Static typing for robustness.

**Core Philosophy:**

- **Server First:** Authentication checks happen on the server (`page.tsx`) to prevent flash of content.
- **Real-time:** The UI updates instantly via Supabase Realtime, no page refresh needed.
- **Secure:** Row Level Security (RLS) ensures data privacy at the database level.

---

## 📂 Core File Walkthrough

### 1. Root Layout & Configuration

**`src/app/layout.tsx`**

- **Purpose**: Wraps the entire application.
- **Key Code**:
  - `inter.className`: Applies the Google Font globally.
  - `Toaster`: Provides toast notifications (success/error popups) at the root level so they persist across navigation.

**`src/middleware.ts`**

- **Purpose**: Protects routes and refreshes auth sessions.
- **Logic**:
  - Calls `updateSession(request)` from `src/lib/supabase/middleware.ts`.
  - Runs on almost every request (except static assets) to ensure the user's auth cookie is valid.
  - **Why not just client-side?** Middleware runs on the _Edge_, refreshing tokens before the page even starts loading, preventing logout glitches.

---

### 2. Authentication Flow

**`src/lib/supabase/*` (Client Generators)**

- **Purpose**: Create Supabase clients depending on context.
  - `client.ts`: Uses `createBrowserClient` for client-side components (like buttons). Can access browser cookies.
  - `server.ts`: Uses `createServerClient` for Server Components/Actions. Needs `await cookies()` to read cookies securely.
  - `middleware.ts`: Specialized client for Middleware to manage request/response cookies.

**`src/app/auth/callback/route.ts`**

- **Purpose**: Handles the redirect after Google Login.
- **Flow**:
  1. Captures `code` from URL query params.
  2. Exchanges code for session using `supabase.auth.exchangeCodeForSession(code)`.
  3. Uses `NextResponse.redirect(..., { status: 303 })` to redirect to the dashboard.
     - **Why 303?** It forces a GET request, preventing browser caching issues after POST-like auth flows.

**`src/components/AuthButton.tsx`**

- **Purpose**: Manages Login/Logout UI state.
- **Critical Feature: Layout Awareness**
  - Accepts a `layout` prop (`'landing'` or `'dashboard'`).
  - **Dashboard Mode**: Shows _only_ User Profile + Sign Out. Never renders the login form to break the header.
  - **Landing Mode**: Shows _only_ Login Form. Never renders "Sign Out".
  - **Transition Handling**: If state mismatches (e.g., logged in but on landing page), it shows a loading spinner and redirects automatically. This prevents flickering UI.

---

### 3. Main Page Logic

**`src/app/page.tsx`**

- **Purpose**: Determines whether to show the Landing Page or Dashboard.
- **Server-Side Logic**:
  ```typescript
  export const dynamic = "force-dynamic"; // Prevents caching of auth state
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  ```
- **Execution**:
  - If `!user`: Renders `<main>` with Hero Section, Features, and `<AuthButton layout="landing" />`.
  - If `user`: Renders Dashboard Layout, Header, Bookmark List, and `<AuthButton layout="dashboard" />`.
  - **Why Server-Side?** The server decides what to render _before_ sending HTML to the browser. Zero flash of incorrect content.

---

### 4. Real-time Bookmarks

**`src/components/BookmarkList.tsx`**

- **Purpose**: Displays bookmarks and handles real-time updates.
- **Key Concepts**:
  - **Realtime Subscription**:
    ```typescript
    supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        (payload) => {
          // Handle INSERT, UPDATE, DELETE locally
        },
      )
      .subscribe();
    ```
  - **Optimistic UI**: When adding/deleting, we update the local state immediately while the server request happens in the background. If it fails, we roll back.
  - **Date Formatting**: Contains a fix for hydration errors by ensuring `new Date().toLocaleDateString()` outputs consistent server/client strings.

---

## 🔒 Security (Row Level Security)

**`schema.sql`**

- **Policies**:
  - `create policy "Users can view own bookmarks" on bookmarks for select using (auth.uid() = user_id);`
  - This SQL ensures that even if someone queries the API directly, they can ONLY see rows where `user_id` matches their authenticated ID.
  - This is "Security in Depth" - the database itself enforces the rules, not just the application code.

---

## 🚀 Deployment Considerations

- **Environment Variables**: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SITE_URL` must be set in Vercel.
- **Redirect URLs**: Production domain must be added to Supabase Auth -> URL Configuration.
- **Build Step**: Next.js builds pages statically where possible, but `force-dynamic` ensures our auth pages stay fresh.

---

## 🗣️ Common Interview Questions

**Q: Why use Next.js App Router instead of Pages Router?**
A: App Router uses React Server Components by default. This reduces the client-side JavaScript bundle size (faster load times) and allows us to fetch data directly on the server (secure, no API round-trips needed for initial render).

**Q: How do you handle authentication persistence?**
A: We use HTTP-only cookies managed by Supabase. The middleware refreshes them on every request to keep the session alive secure from XSS attacks.

**Q: How does the real-time feature scale?**
A: Supabase handles the WebSocket connections. We subscribe only to the relevant subset of data. For production scaling, we ensure RLS is enabled so users only listen to their own data streams.

---

## 📖 README Walkthrough (What to Say)

Here is a guide on how to explain each section of the `README.md` to an interviewer.

### 1. Introduction

- **README says:** "A beautiful, real-time bookmark manager..."
- **You say:** "I built this project to master full-stack development with Next.js 15. It's a bookmark manager that emphasizes real-time data synchronization and a premium user experience using glassmorphism designs."

### 2. Features Section

- **Google OAuth Login**: "I implemented secure authentication using Supabase Auth. I chose OAuth over email/password to reduce friction for users and improve security."
- **Real-time Updates**: "This is the core feature. I used Supabase Realtime subscriptions so that if you add a bookmark on your phone, it instantly appears on your laptop without a page reload."
- **Private Bookmarks (RLS)**: "Security was a priority. I set up Row Level Security policies in PostgreSQL so that the database strictly enforces that users can only access their own records."
- **Optimistic UI**: "To make the app feel instant, I implemented optimistic updates. The UI updates immediately when you perform an action, while the database syncs in the background."

### 3. Tech Stack

- **Next.js 15**: "I wanted to use the latest Server Components features for better performance and SEO."
- **Supabase**: "I chose it as a Backend-as-a-Service because it gives me a production-ready Postgres database and authentication out of the box, allowing me to focus on the frontend logic."
- **Tailwind CSS 4**: "For styling, I used the alpha version of Tailwind 4 to experiment with the latest CSS-in-JS performance improvements."

### 4. Challenges & Solutions (The "Star" of the Interview)

- **Challenge 1: Next.js 15 Cookies**
  - **Context:** "One challenge I faced was that `cookies()` became asynchronous in Next.js 15, which broke standard Supabase SSR patterns. I had to refactor my server client creation to `await cookies()` to ensure secure session handling."
- **Challenge 2: Real-time Privacy**
  - **Context:** "I noticed that subscribing to the entire 'bookmarks' table meant receiving events for _all_ users, which is a privacy leak. I fixed this by applying a server-side RLS policy and a client-side filter (`user_id=eq.my_id`) to ensure users only subscribe to their own data stream."
