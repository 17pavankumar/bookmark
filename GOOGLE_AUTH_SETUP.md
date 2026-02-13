# Google OAuth Setup Guide

## 🚀 Quick Setup Steps

### Step 1: Configure Google OAuth in Supabase Dashboard

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: `Authentication` → `Providers`
3. **Find Google** in the list of providers
4. **Enable Google Auth**:
   - Toggle the "Enable Sign in with Google" switch to ON
5. **Get Google OAuth Credentials**:

   #### Option A: Use Supabase's Google OAuth (Easiest)
   - Supabase provides a default Google OAuth setup for development
   - Just enable it and you're done!

   #### Option B: Use Your Own Google OAuth (Recommended for Production)

   a. **Go to Google Cloud Console**: https://console.cloud.google.com/

   b. **Create a new project** (or select existing one)

   c. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

   d. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add these to **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://fiirfvjvxqlvhsqdrhpb.supabase.co
     ```
   - Add these to **Authorized redirect URIs**:
     ```
     https://fiirfvjvxqlvhsqdrhpb.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback
     ```

   e. **Copy the Client ID and Client Secret**

   f. **Paste them in Supabase**:
   - Go back to Supabase Dashboard → Authentication → Providers → Google
   - Enter your Client ID and Client Secret
   - Click "Save"

### Step 2: Update Site URL in Supabase

1. **Go to**: `Authentication` → `URL Configuration`
2. **Set Site URL** to: `http://localhost:3000` (for development)
3. **Add Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```

### Step 3: Test the Authentication

1. **Start your development server** (if not already running):

   ```bash
   npm run dev
   ```

2. **Open**: http://localhost:3000

3. **Click "Continue with Google"** button

4. **You should be redirected to Google's login page**

5. **After successful login**, you'll be redirected back to your app

## ✅ What's Already Done

- ✅ AuthButton component updated with Google OAuth
- ✅ Email magic link authentication still works
- ✅ Beautiful UI with Google branding
- ✅ Auth callback route configured
- ✅ Both authentication methods work together

## 🎨 Features

- **Google OAuth**: One-click sign-in with Google account
- **Email Magic Link**: Passwordless email authentication
- **Beautiful UI**: Premium design with smooth animations
- **Error Handling**: Proper error messages for failed authentication
- **Loading States**: Visual feedback during authentication

## 🔧 Troubleshooting

### "Authentication Failed" Error

**Possible causes:**

1. Google OAuth not enabled in Supabase dashboard
2. Incorrect redirect URLs configured
3. Google OAuth credentials not set up

**Solutions:**

1. Follow Step 1 above to enable Google OAuth
2. Make sure redirect URLs match exactly (including http/https)
3. Check Supabase logs in Dashboard → Logs → Auth

### Google Login Opens but Returns Error

**Possible causes:**

1. Redirect URL mismatch
2. Site URL not configured in Supabase

**Solutions:**

1. Double-check redirect URLs in both Google Console and Supabase
2. Ensure Site URL is set to `http://localhost:3000` in Supabase

### Email Magic Link Still Works?

**Yes!** Both authentication methods work together. Users can choose:

- Quick Google sign-in
- Email magic link (no password needed)

## 📝 Production Deployment

When deploying to production:

1. **Update Google OAuth redirect URLs** to include your production domain
2. **Update Supabase Site URL** to your production URL
3. **Add production domain** to Supabase redirect URLs
4. **Test both authentication methods** in production

## 🎯 Next Steps

1. Enable Google OAuth in Supabase Dashboard (Step 1)
2. Test the authentication flow
3. Customize the UI if needed
4. Deploy to production

---

**Need help?** Check the Supabase documentation: https://supabase.com/docs/guides/auth/social-login/auth-google
