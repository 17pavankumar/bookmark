# 🚀 Production Deployment Guide

## ✅ Issues Fixed

1. ✅ **Hydration Error** - Fixed date formatting to use consistent UTC format
2. ✅ **OAuth Redirects** - Already using dynamic `location.origin` (works in production)

## 📋 Production Deployment Checklist

### Step 1: Set Environment Variables in Your Hosting Platform

**For Vercel:**

1. Go to: https://vercel.com/dashboard
2. Select your project → Settings → Environment Variables
3. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://fiirfvjvxqlvhsqdrhpb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpaXJmdmp2eHFsdmhzcWRyaHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MTgxMzksImV4cCI6MjA4NjQ5NDEzOX0.zwp-l4mJlpVmB3jJfS7NRkCs0R7QnFcouTicMK1b-XI
```

4. Select environments: **Production**, **Preview**, **Development**
5. Click **Save**

**For Netlify:**

1. Go to: https://app.netlify.com/
2. Select your site → Site settings → Environment variables
3. Add the same variables as above
4. Click **Save**

---

### Step 2: Configure Supabase for Production

#### A. Update Site URL

1. Go to: https://supabase.com/dashboard/project/fiirfvjvxqlvhsqdrhpb/auth/url-configuration
2. **Site URL**: Set to your production domain
   - Example: `https://your-app.vercel.app`
   - Or: `https://yourdomain.com`

#### B. Add Redirect URLs

Add these URLs (replace with your actual domain):

```
https://your-app.vercel.app/auth/callback
https://your-app.vercel.app/**
http://localhost:3000/auth/callback
http://localhost:3000/**
```

**Why both?**

- Production URLs for live site
- Localhost URLs for local development

---

### Step 3: Configure Google OAuth for Production

#### A. Update Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. **Add Authorized JavaScript origins:**

   ```
   https://your-app.vercel.app
   https://fiirfvjvxqlvhsqdrhpb.supabase.co
   http://localhost:3000
   ```

4. **Add Authorized redirect URIs:**

   ```
   https://fiirfvjvxqlvhsqdrhpb.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```

5. Click **Save**

#### B. Verify Supabase Google OAuth Settings

1. Go to: https://supabase.com/dashboard/project/fiirfvjvxqlvhsqdrhpb/auth/providers
2. Ensure Google is **Enabled**
3. Verify Client ID and Client Secret are filled in
4. Click **Save**

---

### Step 4: Deploy Your Application

#### For Vercel:

```bash
# Push to GitHub (if not already done)
git add .
git commit -m "Fixed hydration and OAuth redirects"
git push origin main

# Vercel will auto-deploy, or manually trigger:
# Go to Vercel Dashboard → Deployments → Redeploy
```

#### For Netlify:

```bash
# Push to GitHub
git add .
git commit -m "Fixed hydration and OAuth redirects"
git push origin main

# Netlify will auto-deploy, or manually trigger:
# Go to Netlify Dashboard → Deploys → Trigger deploy
```

---

### Step 5: Create the Database Table

**IMPORTANT:** If you haven't already, run this SQL in Supabase:

1. Go to: https://supabase.com/dashboard/project/fiirfvjvxqlvhsqdrhpb/sql/new
2. Paste and run:

```sql
-- Create a "bookmarks" table
create table if not exists bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table bookmarks enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own bookmarks" on bookmarks;
drop policy if exists "Users can insert their own bookmarks" on bookmarks;
drop policy if exists "Users can delete their own bookmarks" on bookmarks;
drop policy if exists "Users can update their own bookmarks" on bookmarks;

-- Policy: Select own bookmarks
create policy "Users can view their own bookmarks" on bookmarks
  for select using (auth.uid() = user_id);

-- Policy: Insert own bookmarks
create policy "Users can insert their own bookmarks" on bookmarks
  for insert with check (auth.uid() = user_id);

-- Policy: Delete own bookmarks
create policy "Users can delete their own bookmarks" on bookmarks
  for delete using (auth.uid() = user_id);

-- Policy: Update own bookmarks
create policy "Users can update their own bookmarks" on bookmarks
  for update using (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table bookmarks;
```

---

## 🧪 Testing Your Production Deployment

### Test Checklist:

1. **Visit your production URL**
   - [ ] Page loads without errors
   - [ ] No hydration errors in console
   - [ ] Date format shows correctly (e.g., "Feb 13, 2026")

2. **Test Google OAuth**
   - [ ] Click "Continue with Google"
   - [ ] Redirects to Google login (not localhost!)
   - [ ] After login, redirects back to your production domain
   - [ ] You're logged in successfully

3. **Test Email Authentication**
   - [ ] Enter your email
   - [ ] Click "Sign in with Email"
   - [ ] Check email for magic link
   - [ ] Click link, redirects to production domain
   - [ ] You're logged in successfully

4. **Test Bookmark Functionality**
   - [ ] Add a bookmark
   - [ ] Bookmark appears in the list
   - [ ] Date shows correctly (e.g., "Feb 13, 2026")
   - [ ] Delete bookmark works
   - [ ] Real-time sync works (open in two tabs)

---

## 🔍 Troubleshooting

### Issue: "MIDDLEWARE_INVOCATION_FAILED"

**Solution:** Environment variables not set in production

- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Redeploy

### Issue: "Hydration failed" error

**Solution:** Already fixed! Date now uses consistent UTC format

- Make sure you've deployed the latest code

### Issue: Redirects to localhost in production

**Solution:** OAuth redirects use `location.origin` (dynamic)

- Verify Supabase redirect URLs include your production domain
- Verify Google OAuth authorized redirect URIs include Supabase callback URL

### Issue: "Could not find table 'public.bookmarks'"

**Solution:** Database table not created

- Run the SQL schema in Supabase SQL Editor (Step 5 above)

### Issue: "Unsupported provider: provider is not enabled"

**Solution:** Google OAuth not enabled in Supabase

- Enable Google in Supabase Dashboard → Auth → Providers
- Add Client ID and Client Secret from Google Cloud Console

---

## 📝 Quick Reference

### Your Supabase Project

- **URL:** https://fiirfvjvxqlvhsqdrhpb.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/fiirfvjvxqlvhsqdrhpb

### Important URLs to Configure

Replace `your-app.vercel.app` with your actual domain:

**Supabase Site URL:**

```
https://your-app.vercel.app
```

**Supabase Redirect URLs:**

```
https://your-app.vercel.app/auth/callback
https://your-app.vercel.app/**
```

**Google OAuth Authorized Origins:**

```
https://your-app.vercel.app
https://fiirfvjvxqlvhsqdrhpb.supabase.co
```

**Google OAuth Redirect URIs:**

```
https://fiirfvjvxqlvhsqdrhpb.supabase.co/auth/v1/callback
```

---

## ✅ Final Checklist

Before going live, ensure:

- [ ] Environment variables added to hosting platform
- [ ] Supabase Site URL set to production domain
- [ ] Supabase redirect URLs include production domain
- [ ] Google OAuth credentials configured
- [ ] Google OAuth authorized origins/redirects updated
- [ ] Database table created with RLS policies
- [ ] Code deployed to production
- [ ] All tests passing (see Testing section)

---

**Need help?** Check the error logs:

- **Vercel:** Dashboard → Deployments → Click deployment → Runtime Logs
- **Netlify:** Dashboard → Deploys → Click deploy → Deploy log
- **Supabase:** Dashboard → Logs → Auth logs

Good luck with your deployment! 🚀
