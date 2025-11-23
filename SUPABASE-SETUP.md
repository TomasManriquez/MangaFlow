# 🚀 Supabase Setup Guide - MangaFlow

Complete guide for setting up Supabase PostgreSQL + Storage for MangaFlow.

## 📋 Prerequisites

- Supabase account (free tier works)
- Node.js 18+ and npm
- Docker and Docker Compose (for deployment)

## 🎯 Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: MangaFlow (or any name you prefer)
   - **Database Password**: Save this securely!
   - **Region**: Choose closest to your users
4. Wait ~2 minutes for project creation

## 🔑 Step 2: Get API Credentials

### Find Your Credentials

Go to: **Project Settings → API**

URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api`

You'll need:

1. **Project URL**
   - Found under "Project URL"
   - Example: `https://vhjschmpydrelmeeduql.supabase.co`

2. **Anon Key** (public)
   - Found under "Project API keys" → `anon` `public`
   - Safe to use in frontend

3. **Service Role Key** (secret)
   - Found under "Project API keys" → `service_role` `secret`
   - **NEVER expose publicly** - backend only!

4. **Database Password**
   - The password you set when creating the project

### Save Credentials

Copy these values - you'll need them for environment configuration.

## 💾 Step 3: Create Storage Bucket

### Via Supabase Dashboard

1. Go to: **Storage** → **Create a new bucket**
2. Name: `manga-pages`
3. **Public bucket**: Toggle ON (for faster CDN delivery)
4. Click **Create bucket**

### Configure Bucket Policies (Optional)

For public read access:

1. Go to bucket **Policies**
2. Add new policy:
   ```sql
   -- Allow public read access
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING ( bucket_id = 'manga-pages' );
   
   -- Allow authenticated uploads (via service key)
   CREATE POLICY "Service Role Upload"
   ON storage.objects FOR INSERT
   WITH CHECK ( bucket_id = 'manga-pages' );
   ```

## ⚙️ Step 4: Configure Environment Variables

### Local Development (.env)

Create `backend/.env`:

```bash
# Supabase Configuration
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
SUPABASE_STORAGE_BUCKET=manga-pages

# Database URL
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres?schema=public

# Application
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4321

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Scraper Settings
SCRAPER_USER_AGENT=MangaFlow/1.0
SCRAPER_DELAY_MS=1000
```

### Docker Production (.env.production)

Create `.env.production` in project root:

```bash
# Supabase Configuration
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
SUPABASE_STORAGE_BUCKET=manga-pages

# Database URL
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres?schema=public

# Application
PORT=3000
NODE_ENV=production
FRONTEND_URL=http://localhost

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Scraper Settings
SCRAPER_USER_AGENT=MangaFlow/1.0
SCRAPER_DELAY_MS=1000

# Docker Ports
HTTP_PORT=80
HTTPS_PORT=443
```

## 🗄️ Step 5: Initialize Database

### Install Dependencies

```bash
cd backend
npm install
```

### Run Prisma Migrations

This creates all tables in your Supabase PostgreSQL database:

```bash
npx prisma migrate deploy
```

You should see output like:
```
✔ Generated Prisma Client
✔ 1 migration found in prisma/migrations
✔ Applied migrations:
  20241122000000_init
```

### Verify in Supabase Dashboard

1. Go to: **Table Editor**
2. You should see tables: `Manga`, `MangaSource`, `Chapter`, `Page`, `User`, etc.

## 🧪 Step 6: Test Connection

### Test Database Connection

```bash
cd backend
npx prisma studio
```

This opens Prisma Studio at `http://localhost:5555` - you can browse your Supabase database!

### Test Storage Upload

Create a test script or use the API:

```bash
# Start backend
npm run dev

# In another terminal, test chapter download
curl -X POST http://localhost:3000/api/chapters/test-id/download
```

Check Supabase Dashboard → Storage → manga-pages to see uploaded images!

## 🐳 Step 7: Docker Deployment

### Build and Start

```bash
# In project root
docker-compose build
docker-compose up -d
```

### Initialize Database (in Docker)

```bash
docker-compose exec backend npx prisma migrate deploy
```

### Verify

```bash
# Check all services running
docker-compose ps

# Check logs
docker-compose logs -f backend

# Test API
curl http://localhost/health
```

## 📊 Monitoring

### Supabase Dashboard

Monitor your usage:
- **Database**: Table Editor, SQL Editor
- **Storage**: View files, check bandwidth usage
- **Logs**: Real-time logs for debugging
- **Reports**: Usage stats and billing

### Check Free Tier Limits

Go to: **Settings → Billing**

Free tier includes:
- ✅ 500MB Database
- ✅ 1GB Storage
- ✅ 2GB Bandwidth
- ✅ Unlimited API requests

## 🔒 Security Best Practices

### 1. Protect Service Role Key

```bash
# NEVER commit .env files
# .gitignore should include:
.env
.env.local
.env.production
```

### 2. Use Row Level Security (RLS)

For future user features, enable RLS on tables:

```sql
-- Enable RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data"
ON "User" FOR SELECT
USING ( auth.uid() = id );
```

### 3. Rotate Keys Periodically

In Supabase Dashboard → Settings → API → **Reset keys** if compromised

### 4. Use Signed URLs

For sensitive images, use signed URLs (expires after 1 hour):

```typescript
const signedUrl = await supabaseStorage.getSignedUrl(path, 3600);
```

## 🐛 Troubleshooting

### Database Connection Fails

```bash
# Check DATABASE_URL format
# Should be: postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres

# Verify password doesn't have special chars needing escaping
# If password has @, #, etc., URL-encode it
```

### Storage Upload Fails

```bash
# Check bucket exists: Storage → manga-pages
# Check bucket is public or has correct policies
# Verify SUPABASE_SERVICE_KEY is set (not ANON key)
```

### Prisma Migration Fails

```bash
# Reset migrations (CAUTION: deletes data)
npx prisma migrate reset

# Force push schema
npx prisma db push --force-reset
```

### Out of Storage

```bash
# Check usage: Settings → Billing
# Delete old chapters:
curl -X DELETE http://localhost/api/chapters/old-chapter-id
```

## 📈 Scaling

### Upgrade to Pro Plan

When you need more resources:

- Database: $25/month base + storage
- Storage: $0.021/GB/month
- Bandwidth: $0.09/GB
- Point-in-time recovery backups

### Optimize Storage

```bash
# Compress images before upload
# Use WebP format (smaller)
# Clean up old downloads regularly
```

## 🎓 Next Steps

1. ✅ Set up Supabase ← You are here
2. ⬜ Deploy with Docker
3. ⬜ Configure domain and SSL
4. ⬜ Set up monitoring
5. ⬜ Add user authentication (future)

## 📞 Support

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Supabase Discord**: [discord.supabase.com](https://discord.supabase.com)
- **MangaFlow Issues**: GitHub Issues (if applicable)

---

**🎉 Once setup is complete, your MangaFlow app will have:**
- Managed PostgreSQL database
- CDN-backed image storage
- Automatic backups
- Scalable infrastructure
- Zero database administration!
