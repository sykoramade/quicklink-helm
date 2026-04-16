# QuickLink Deployment Guide

This guide walks through deploying QuickLink to Vercel with Supabase as the backend.

## Prerequisites

1. **Vercel Account**: Logged in with `vercel whoami` (user: csykora-7147)
2. **Supabase Account**: Free tier at supabase.com
3. **GitHub Account**: For version control (sykoramade/quicklink-helm)
4. **Node.js 18+**: Development environment

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Organization: Select your org (pemncajbhzjglzgraobi)
   - Project name: `quicklink-helm`
   - Database password: Generate a strong 20+ character password
   - Region: `us-west-1`
4. Wait for provisioning (~2 minutes)
5. Go to Project Settings → API
6. Copy and save:
   - **Project URL**: `https://[project-ref].supabase.co`
   - **Anon Public Key**: The `anon` key under `Project API keys`

## Step 2: Set Up Database

1. In Supabase dashboard, go to SQL Editor
2. Click "New Query"
3. Copy the entire SQL from `supabase/migrations/001_schema.sql`
4. Paste into the SQL editor
5. Click "Run"
6. Wait for completion (should show "Success")

The migration creates:
- `links` table with RLS policies for user isolation
- `clicks` table for analytics
- All necessary indexes for performance

## Step 3: Create GitHub Repository

```bash
cd /path/to/quicklink-helm

# Make sure you're on the main branch
git checkout -b main
git branch -D master  # Delete the local master branch

# Create the repo on GitHub via web interface:
# 1. Go to https://github.com/new
# 2. Create repo: sykoramade/quicklink-helm (public)
# 3. Don't initialize with README (we already have one)

# Push your code
git remote set-url origin https://github.com/sykoramade/quicklink-helm.git
git push -u origin main
```

## Step 4: Deploy to Vercel

```bash
cd /path/to/quicklink-helm

# Deploy with Vercel CLI
vercel --prod --yes
```

When prompted:
- **Project name**: Defaults to "quicklink-helm"
- **Framework**: Confirm "Next.js"
- **Root directory**: Accept default (.)
- **Build command**: Accept default (`next build`)
- **Output directory**: Accept default (`.next`)

Vercel will build and deploy your app. Note the deployed URL (e.g., `quicklink-helm.vercel.app`).

## Step 5: Configure Environment Variables in Vercel

```bash
# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://[your-project-ref].supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: [your-anon-key]

# Deploy again to use the new env vars
vercel --prod
```

Or set them in the Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://[project-ref].supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon key
3. Select "Production" and save
4. Redeploy: Click the latest deployment → "Redeploy"

## Step 6: Configure Supabase Auth Redirects

1. Go to your Supabase project → Authentication → URL Configuration
2. Add to "Redirect URLs":
   - `https://[your-vercel-url]`
   - `https://[your-vercel-url]/auth`
3. Save

Example:
```
https://quicklink-helm.vercel.app
https://quicklink-helm.vercel.app/auth
```

## Step 7: Create Test Account

1. Visit your deployed URL: `https://quicklink-helm.vercel.app`
2. Click "Get Started"
3. Sign up:
   - Email: `test@example.com` (or your email)
   - Password: Create a secure password
4. Check your email for confirmation link
5. Confirm email
6. Sign in with credentials
7. Test creating a short link

## Verify Deployment

Once deployed, verify all functionality:

### 1. Authentication
- [ ] Sign up works
- [ ] Email confirmation sent
- [ ] Sign in works
- [ ] Session persists on page reload
- [ ] Sign out clears session

### 2. Link Creation
- [ ] Can create link with auto-generated slug
- [ ] Can create link with custom slug
- [ ] Duplicate custom slug shows error
- [ ] Invalid URL shows error
- [ ] Link appears immediately in dashboard

### 3. Redirects
- [ ] Visiting short link redirects to destination
- [ ] Redirect is fast (<200ms)
- [ ] Invalid slug returns 404

### 4. Analytics
- [ ] Click count increments on redirect
- [ ] Analytics page loads
- [ ] 7-day chart displays
- [ ] Click history table shows data

### 5. Link Management
- [ ] Can see all links in dashboard
- [ ] Can copy short link to clipboard
- [ ] Can delete link
- [ ] Deleted link returns 404 on redirect

### 6. Rate Limiting
- [ ] Create 60 links in quick succession
- [ ] 61st attempt shows rate limit error
- [ ] Error message is clear

## Troubleshooting

### Build fails with TypeScript errors
- Check that all files have proper type annotations
- Run `npm run build` locally to verify
- Ensure no `any` types where avoidable

### Deployment URL doesn't work
- Check Vercel deployment logs: Dashboard → Deployments
- Ensure environment variables are set in Vercel UI
- Check Supabase is reachable (no IP restrictions)

### Auth not working
- Check redirect URLs in Supabase are correct
- Ensure NEXT_PUBLIC_SUPABASE_URL and ANON_KEY are set
- Check browser console for CORS errors

### Database migration failed
- Go to Supabase SQL Editor
- Run the migration SQL manually
- Check for existing tables that might conflict
- Look at the error message in the SQL output

### Clicks not recording
- Check Supabase RLS policies are in place
- Ensure "Anyone can insert clicks" policy exists
- Check browser console for errors
- (Note: clicks are fire-and-forget, so some loss is acceptable)

## Rollback

If something goes wrong, you can rollback to the previous deployment:

```bash
# List deployments
vercel deployments

# Rollback (replace with deployment ID)
vercel rollback [deployment-id]
```

## Success!

Your QuickLink instance is now live! Share your deployment URL with users.

Test account credentials to share for evaluation:
- Email: `test@example.com` (adjust to actual email used)
- Password: (the password you created)

## Next Steps

After successful deployment:

1. Create additional test accounts
2. Test with various URL types
3. Monitor analytics as users create links
4. Set up custom domain (Vercel → Settings → Domains)
5. Configure SSL/TLS (automatic with Vercel)

## Support

For issues:
1. Check Vercel deployment logs
2. Check Supabase project health
3. Review GitHub issues on the repository
4. Check Next.js and Supabase documentation
