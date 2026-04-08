# Supabase Setup Guide for Split-IDE

This guide will help you set up Supabase authentication and database for Split-IDE's cloud sync functionality.

## 🚀 Quick Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose organization and enter project details
4. Wait for project to be created (2-3 minutes)

### 2. Set Up Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `database-schema.sql` from this project
4. Paste into the SQL Editor
5. Click **"Run"** to execute the schema

### 3. Configure Authentication Providers

#### Enable Email Authentication
1. Go to **Authentication > Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. **Disable "Confirm email"** for testing (you can enable later)
4. Set **Site URL** to `http://localhost:5174` (or your domain)

#### Enable Google OAuth (Optional)
1. In **Authentication > Settings > Auth Providers**
2. Enable **Google**
3. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
4. Add redirect URL: `https://[your-project-ref].supabase.co/auth/v1/callback`

#### Enable GitHub OAuth (Optional)
1. In **Authentication > Settings > Auth Providers**
2. Enable **GitHub**
3. Add your GitHub OAuth app credentials:
   - **Client ID**: From GitHub Developer Settings
   - **Client Secret**: From GitHub Developer Settings
4. Add redirect URL: `https://[your-project-ref].supabase.co/auth/v1/callback`

### 4. Get Your Credentials
1. Go to **Settings > API**
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **Anon public key** (starts with `eyJ`)

### 5. Configure Environment Variables
1. Create `.env` file in your project root:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Restart your dev server:
```bash
npm run dev
```

## 🔧 Troubleshooting

### "500 Internal Server Error" on Signup
- **Cause**: Database schema not applied
- **Fix**: Run the `database-schema.sql` in Supabase SQL Editor

### "Tracking Prevention blocked access to storage"
- **Cause**: Browser privacy settings blocking localStorage
- **Fix**: Disable tracking prevention for localhost or use incognito mode

### Social Login Not Working
- **Cause**: OAuth providers not configured
- **Fix**: Set up Google/GitHub OAuth apps and add credentials to Supabase

### "Not authenticated" Errors
- **Cause**: Environment variables not set
- **Fix**: Check `.env` file has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

## 🧪 Testing Authentication

### Test Email Signup
1. Click "Sign In" in Split-IDE header
2. Switch to "Create Account"
3. Enter email and password
4. Should create account and show user profile

### Test Social Login
1. Click "Continue with Google" or "Continue with GitHub"
2. Should redirect to OAuth provider
3. After approval, should return to Split-IDE logged in

### Test Cloud Sync
1. Create a new file after signing in
2. Edit the file content
3. Check sync status indicator shows "Synced"
4. Open Split-IDE in another browser/device with same account
5. Should see the same files and content

## 📊 Database Schema Overview

The schema creates:
- **`projects`**: User workspaces (default project auto-created)
- **`files`**: User files with content and metadata
- **`user_preferences`**: User settings and preferences
- **RLS Policies**: Secure data isolation per user
- **Triggers**: Auto-create welcome project for new users

## 🔒 Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **JWT Authentication**: Secure session management
- **OAuth Integration**: Trusted third-party authentication
- **Environment Variables**: Sensitive credentials not in code

## 🚀 Production Deployment

For production:
1. Update **Site URL** in Supabase to your domain
2. Add production domain to OAuth redirect URLs
3. Enable email confirmation if desired
4. Set up custom SMTP for emails (optional)
5. Configure rate limiting and security policies

---

After completing this setup, Split-IDE will have full cloud authentication and sync capabilities! 🎉
