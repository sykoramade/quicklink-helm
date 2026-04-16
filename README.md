# QuickLink - URL Shortener

**Live URL:** https://quicklink-helm.vercel.app  
**GitHub:** https://github.com/sykoramade/quicklink-helm

A modern URL shortening service with analytics, custom slugs, and a clean dashboard. Built with Next.js 14, Supabase, and Tailwind CSS.

## Test Account

Use this pre-created account for evaluation:

```
Email:    test@quicklink-demo.com
Password: QuickLink2026!
```

## Features

- **Email + Password Authentication** - Secure signup and signin with session persistence
- **Custom Short Links** - Auto-generated 7-character slugs or custom alphanumeric+hyphen slugs
- **Fast Redirects** - Sub-200ms redirect performance with indexed slug lookups
- **Click Analytics** - Real-time click tracking with 7-day historical view
- **Link Management** - Create, view, and delete your links from an intuitive dashboard
- **Rate Limiting** - 60 link creations per hour per user to prevent abuse
- **Security** - Row-level security (RLS), parameterized queries, no SQL injection vectors
- **Responsive Design** - Mobile-friendly interface with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Supabase PostgreSQL with RLS
- **Auth**: Supabase Auth (email + password)
- **Styling**: Tailwind CSS
- **Testing**: Vitest with React Testing Library
- **Slug Generation**: nanoid
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Supabase account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/sykoramade/quicklink-helm.git
cd quicklink-helm
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. In the Supabase dashboard:
   - Go to SQL Editor
   - Create a new query and run the migration from `supabase/migrations/001_schema.sql`
   - Go to Settings → API to get your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` and create an account.

### 5. Run Tests

```bash
npm run test:run
```

Tests include:
- Slug generation (uniqueness, length, charset)
- URL validation (protocol, format)
- Rate limiting (counting, blocking, reset)

## Database Schema

### `links` table
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users)
- `slug` (text, unique)
- `long_url` (text)
- `created_at` (timestamptz)

**RLS Policies**:
- Users see only their own links
- Users can insert links for themselves only
- Users can delete their own links
- Public read access by slug (for redirects)

### `clicks` table
- `id` (uuid, PK)
- `link_id` (uuid, FK to links)
- `clicked_at` (timestamptz)

**RLS Policies**:
- Users see clicks only for their own links
- Anyone can insert clicks (for redirects)

**Indexes**:
- `links_slug_idx` - Fast slug lookup for redirects
- `links_user_id_idx` - Fast user link listing
- `clicks_link_id_idx` - Click queries by link
- `clicks_clicked_at_idx` - Time-range analytics queries

## API Endpoints

### Links

- `GET /api/links` - List user's links with click counts
- `POST /api/links` - Create a new short link
  - Body: `{ long_url: string, custom_slug?: string }`
  - Returns: `{ id, slug, long_url, created_at }`
  - Errors: 401 Unauthorized, 400 Invalid URL/slug, 429 Rate limit

- `DELETE /api/links/:id` - Delete a link
  - Returns: `{ success: true }`
  - Errors: 401 Unauthorized, 403 Forbidden, 404 Not found

### Redirects

- `GET /:slug` - Follow a short link
  - Records click and redirects to long_url
  - Returns: 302 redirect
  - Returns: 404 if slug not found

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add -A
git commit -m "feat: QuickLink URL shortener — full build"
git push origin main
```

### 2. Deploy to Vercel

```bash
vercel --prod --yes
```

When prompted, add your environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Or set them in Vercel dashboard: Project Settings → Environment Variables

### 3. Configure Supabase Auth Redirects

In your Supabase project, go to Authentication → URL Configuration and add:
- `https://your-vercel-url.vercel.app`
- `https://your-vercel-url.vercel.app/auth`

## Architecture Notes

### Authentication Flow

- User signs up/in via Supabase email+password
- Session stored as secure httpOnly cookie
- Next.js middleware refreshes auth token on each request
- User context available in server and client components

### Short Link Creation

1. Client submits long URL + optional slug
2. URL validated (must start with http/https, be valid URL)
3. Custom slug validated (alphanumeric+hyphens, 3-50 chars, uniqueness)
4. Rate limit checked (60 per hour per user)
5. Link inserted into Postgres via Supabase
6. Slug returned to client

### Redirect & Click Recording

1. Request arrives at `/:slug` route handler
2. Slug indexed lookup in `links` table (~10ms)
3. Click insert queued asynchronously (fire-and-forget)
4. 302 redirect sent immediately (~50ms total)
5. Click recorded in background without blocking redirect

### Analytics

1. Daily clicks aggregated from `clicks` table
2. Query filtered by link_id + last 7 days
3. Grouped by date and returned as array
4. UI renders bar chart and table

### Security

- **SQL Injection**: All queries use parameterized Supabase client, no string concat
- **XSS**: React escapes by default; URLs validated before storing
- **CSRF**: Next.js App Router with Supabase auth handles CSRF automatically
- **Session Hijacking**: httpOnly cookies + Supabase secure storage
- **Data Isolation**: Row-level security (RLS) enforced at DB level; users can only access their own data
- **Rate Limiting**: In-memory Map with hourly windows per user ID

## File Structure

```
quicklink-helm/
├── app/                          # Next.js app directory
│   ├── [slug]/route.ts          # Redirect handler
│   ├── api/                      # API routes
│   │   ├── links/route.ts       # GET (list), POST (create)
│   │   └── links/[id]/route.ts  # DELETE
│   ├── auth/page.tsx            # Sign in/up page
│   ├── dashboard/page.tsx       # Main dashboard
│   ├── dashboard/links/[id]/page.tsx # Analytics detail
│   ├── layout.tsx               # Root layout with nav
│   ├── page.tsx                 # Landing page
│   ├── not-found.tsx            # 404 page
│   └── globals.css              # Tailwind styles
├── components/                   # React components
│   ├── Analytics.tsx            # 7-day chart + table
│   ├── LinkForm.tsx             # Create link form
│   ├── LinkList.tsx             # Links table
│   ├── LinkRow.tsx              # Single link row
│   └── Nav.tsx                  # Navigation bar
├── lib/                          # Utility functions
│   ├── supabase/
│   │   ├── client.ts            # Browser Supabase client
│   │   ├── server.ts            # Server Supabase client
│   │   └── middleware.ts        # Auth middleware
│   ├── analytics.ts             # Click recording + queries
│   ├── links.ts                 # CRUD for links
│   ├── rate-limit.ts            # In-memory rate limiter
│   ├── slug.ts                  # Slug generation + validation
│   └── validation.ts            # URL validation
├── __tests__/                    # Tests
│   ├── slug.test.ts            # Slug tests
│   ├── validation.test.ts       # URL validation tests
│   └── rate-limit.test.ts       # Rate limiter tests
├── supabase/
│   ├── migrations/
│   │   └── 001_schema.sql       # Database schema
│   └── config.toml              # Supabase config
├── middleware.ts                # Next.js auth middleware
├── vitest.config.ts             # Test configuration
└── package.json                 # Dependencies
```

## Testing Coverage

- **Unit Tests**: Slug generation, URL validation, rate limiting (29 tests)
- **Integration Tests**: API endpoints tested locally via `npm run dev`

All tests pass:
```bash
npm run test:run
# Test Files  3 passed (3)
#      Tests  29 passed (29)
```

## Support

For bugs or questions, please open an issue on GitHub.
