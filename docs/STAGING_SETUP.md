# MindBoom Spark - Staging Environment Setup Guide

Complete guide for setting up and deploying the staging environment for MindBoom Spark.

## Overview

**Repository**: https://github.com/Samdekian/mind-boom-spark  
**Supabase Project**: `aoumioacfvttagverbna`  
**Environment**: Staging  
**Purpose**: Pre-production testing and QA

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Configuration](#supabase-configuration)
3. [Database Setup](#database-setup)
4. [Edge Functions Deployment](#edge-functions-deployment)
5. [Secrets Configuration](#secrets-configuration)
6. [Frontend Deployment](#frontend-deployment)
7. [Testing & Validation](#testing--validation)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts & Access
- [x] GitHub repository: `mind-boom-spark` created
- [x] Supabase staging project created (ref: `aoumioacfvttagverbna`)
- [ ] Twilio account with API keys
- [ ] OpenAI API key
- [ ] Agora.io account (optional)
- [ ] Hosting platform account (Vercel/Netlify)

### Required Tools
```bash
# Verify installations
node --version    # Should be 18.x or higher
npm --version     # Should be 9.x or higher
git --version     # Any recent version
supabase --version # Latest version recommended

# Install Supabase CLI if needed
npm install -g supabase
```

## Supabase Configuration

### Step 1: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/aoumioacfvttagverbna)

2. Navigate to **Project Settings → API**

3. Copy the following:
   ```
   Project URL: https://aoumioacfvttagverbna.supabase.co
   anon public key: [Copy from dashboard]
   service_role key: [Copy from dashboard - keep secure!]
   ```

4. Navigate to **Project Settings → Database**
   ```
   Connection string: postgresql://postgres:[PASSWORD]@db.aoumioacfvttagverbna.supabase.co:5432/postgres
   ```

### Step 2: Configure Local Environment

1. **Copy the staging template:**
   ```bash
   cp env.staging.template .env.staging
   ```

2. **Edit `.env.staging`** and fill in the `VITE_SUPABASE_ANON_KEY`:
   ```env
   VITE_SUPABASE_URL=https://aoumioacfvttagverbna.supabase.co
   VITE_SUPABASE_ANON_KEY=[paste-your-anon-key-here]
   VITE_APP_ENV=staging
   VITE_APP_URL=https://staging.mindboom.app
   ```

3. **Copy to .env for local testing:**
   ```bash
   cp .env.staging .env
   ```

## Database Setup

### Step 1: Link to Staging Project

```bash
# Link to the staging Supabase project
supabase link --project-ref aoumioacfvttagverbna

# You'll be prompted for your Supabase access token
# Get it from: https://supabase.com/dashboard/account/tokens
```

### Step 2: Review Migrations

```bash
# List all pending migrations
ls -la supabase/migrations/

# You should see ~80 migration files
```

### Step 3: Apply Migrations

```bash
# Apply all migrations to staging database
supabase db push

# This will create all tables, RLS policies, triggers, and functions
```

Expected output:
```
✓ Local database is up to date.
✓ Applying migration 20250422_add_google_calendar_id.sql...
✓ Applying migration 20250422_add_sync_status_fields.sql...
... [all migrations]
✓ Finished supabase db push.
```

### Step 4: Verify Database Structure

```bash
# Connect to database and verify
supabase db remote status

# Check critical tables exist
supabase db remote exec "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
"
```

Expected tables:
- `profiles`
- `appointments`
- `video_sessions`
- `session_participants`
- `breakout_rooms`
- `breakout_room_participants`
- `user_roles`
- And many more...

### Step 5: Verify RLS Policies

```bash
# Check RLS is enabled
supabase db remote exec "
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
"
```

All tables should show `rowsecurity = t` (true).

## Edge Functions Deployment

### Step 1: List Available Functions

```bash
# See all edge functions
ls -la supabase/functions/

# Critical functions for staging:
# - openai-realtime
# - get-turn-credentials
# - session-analytics
# - system-health
# - production-monitor
# - production-cleanup
# And more...
```

### Step 2: Deploy All Functions

```bash
# Deploy all functions at once
supabase functions deploy

# Or deploy individually
supabase functions deploy openai-realtime
supabase functions deploy get-turn-credentials
supabase functions deploy session-analytics
# ... etc
```

### Step 3: Verify Deployment

```bash
# List deployed functions
supabase functions list

# Test a function
supabase functions invoke system-health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-27T...",
  "services": {...}
}
```

## Secrets Configuration

### Step 1: Access Supabase Secrets

Two ways to configure secrets:

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard/project/aoumioacfvttagverbna
2. Navigate to **Edge Functions → Manage secrets**
3. Click **"Add new secret"** for each

#### Option B: Via Supabase CLI

```bash
# Set secrets via CLI
supabase secrets set OPENAI_API_KEY="sk-proj-your-key"
supabase secrets set TWILIO_ACCOUNT_SID="ACxxxxx..."
supabase secrets set TWILIO_AUTH_TOKEN="your-token"
supabase secrets set TWILIO_API_KEY_SID="SKxxxxx..."
supabase secrets set TWILIO_API_KEY_SECRET="your-secret"

# Optional: Agora
supabase secrets set AGORA_APP_ID="your-id"
supabase secrets set AGORA_APP_CERTIFICATE="your-cert"
```

### Step 2: Required Secrets List

| Secret Name | Where to Get | Required |
|------------|--------------|----------|
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys | Yes |
| `TWILIO_ACCOUNT_SID` | https://console.twilio.com → Account Info | Yes |
| `TWILIO_AUTH_TOKEN` | https://console.twilio.com → Account Info | Yes |
| `TWILIO_API_KEY_SID` | https://console.twilio.com → API Keys | Yes (for video) |
| `TWILIO_API_KEY_SECRET` | https://console.twilio.com → API Keys | Yes (for video) |
| `AGORA_APP_ID` | https://console.agora.io | Optional |
| `AGORA_APP_CERTIFICATE` | https://console.agora.io | Optional |

### Step 3: Verify Secrets

```bash
# List all configured secrets (won't show values)
supabase secrets list

# Output should show:
# - OPENAI_API_KEY
# - TWILIO_ACCOUNT_SID
# - TWILIO_AUTH_TOKEN
# - etc.
```

### Step 4: Test Secret Access

```bash
# Test get-turn-credentials function (uses Twilio secrets)
supabase functions invoke get-turn-credentials

# Should return ICE server configuration
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

#### Step 2: Configure Project

```bash
# First deployment (will prompt for setup)
vercel

# Follow prompts:
# - Link to existing project? N
# - Project name: mind-boom-spark-staging
# - Directory: ./
# - Override settings? N
```

#### Step 3: Set Environment Variables

Via Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add for "Preview" and "Development" environments:

```
VITE_SUPABASE_URL = https://aoumioacfvttagverbna.supabase.co
VITE_SUPABASE_ANON_KEY = [your-anon-key]
VITE_APP_ENV = staging
VITE_APP_URL = https://mind-boom-spark-staging.vercel.app
```

Or via CLI:
```bash
vercel env add VITE_SUPABASE_URL
# Paste: https://aoumioacfvttagverbna.supabase.co
# Select: Preview, Development

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your anon key
# Select: Preview, Development

vercel env add VITE_APP_ENV
# Enter: staging
# Select: Preview, Development
```

#### Step 4: Deploy

```bash
# Deploy to staging
vercel --prod

# Or connect GitHub for auto-deploy
# Vercel will auto-deploy on push to 'develop' branch
```

### Option 2: Netlify

#### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
netlify login
```

#### Step 2: Initialize

```bash
netlify init
```

#### Step 3: Configure Environment

Via Netlify Dashboard or CLI:
```bash
netlify env:set VITE_SUPABASE_URL "https://aoumioacfvttagverbna.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"
netlify env:set VITE_APP_ENV "staging"
```

#### Step 4: Deploy

```bash
netlify deploy --prod
```

### Option 3: Docker

```bash
# Build with staging config
docker build \
  --build-arg VITE_SUPABASE_URL="https://aoumioacfvttagverbna.supabase.co" \
  --build-arg VITE_SUPABASE_ANON_KEY="your-key" \
  --build-arg VITE_APP_ENV="staging" \
  -t mind-boom-spark:staging .

# Run
docker run -d -p 8080:80 --name mindboom-staging mind-boom-spark:staging
```

## Testing & Validation

### Step 1: Health Check

```bash
# Test application health
curl https://your-staging-url.com/health.json

# Expected response:
# {"status":"healthy","service":"mindboom-3.0-twilio"}
```

### Step 2: Test Supabase Connection

```bash
# Test Supabase API
curl -X GET "https://aoumioacfvttagverbna.supabase.co/rest/v1/" \
  -H "apikey: YOUR_ANON_KEY"

# Should return Supabase API info
```

### Step 3: Test Edge Functions

```bash
# Test TURN credentials
curl -X POST "https://aoumioacfvttagverbna.supabase.co/functions/v1/get-turn-credentials" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test system health
curl "https://aoumioacfvttagverbna.supabase.co/functions/v1/system-health" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Step 4: Manual Testing Checklist

Use the comprehensive checklist: [STAGING_CHECKLIST.md](../STAGING_CHECKLIST.md)

Key tests:
- [ ] User registration works
- [ ] Login/logout works
- [ ] Create video session
- [ ] Join video session
- [ ] Video/audio working
- [ ] Breakout rooms (if applicable)
- [ ] Screen sharing
- [ ] File sharing
- [ ] Real-time messaging

### Step 5: Run Automated Tests

```bash
# Run unit tests
npm run test

# Run E2E tests against staging
BASE_URL=https://your-staging-url.com npm run test:e2e
```

## Troubleshooting

### Issue: "Repository not found" when pushing

**Solution**: Create the repository on GitHub first:
1. Go to https://github.com/new
2. Repository name: `mind-boom-spark`
3. Private/Public as desired
4. Do NOT initialize with README
5. Click "Create repository"
6. Then run: `git push -u origin main`

### Issue: "Project not found" when linking Supabase

**Solution**: Verify project ref:
```bash
# Make sure you're using the correct ref
supabase link --project-ref aoumioacfvttagverbna

# If prompted for access token, get it from:
# https://supabase.com/dashboard/account/tokens
```

### Issue: Migrations fail

**Solution**: Check migration order and conflicts:
```bash
# Reset local database
supabase db reset

# Try pushing again
supabase db push

# If specific migration fails, review the SQL file
```

### Issue: Edge functions return 500 errors

**Solution**: Check secrets are configured:
```bash
# List secrets
supabase secrets list

# Check function logs
supabase functions logs openai-realtime --tail

# Redeploy specific function
supabase functions deploy openai-realtime
```

### Issue: CORS errors in frontend

**Solution**: Update Supabase CORS settings:
1. Go to Supabase Dashboard → API Settings
2. Add your staging URL to allowed origins

## Quick Start Commands

### Initial Setup (One-time)

```bash
# 1. Link to Supabase staging
supabase link --project-ref aoumioacfvttagverbna

# 2. Apply database migrations
supabase db push

# 3. Configure secrets (see Secrets Configuration section)

# 4. Deploy edge functions
supabase functions deploy

# 5. Build and deploy frontend
npm run build:staging
vercel --prod  # or your preferred platform
```

### Regular Development Workflow

```bash
# 1. Pull latest code
git pull origin develop

# 2. Install dependencies
npm install

# 3. Run locally with staging database
cp .env.staging .env
npm run dev

# 4. Make changes and test

# 5. Commit and push
git add .
git commit -m "feat: your feature"
git push origin develop

# 6. GitHub Actions will auto-deploy to staging
```

## Monitoring & Logs

### View Edge Function Logs

```bash
# All functions
supabase functions logs

# Specific function
supabase functions logs openai-realtime

# Follow mode (real-time)
supabase functions logs --tail
```

### View Database Logs

```bash
# Via Supabase Dashboard
# Go to: Logs & Analytics

# Or via CLI
supabase db logs
```

### Application Monitoring

Set up monitoring for:
- Error tracking (Sentry recommended)
- Performance monitoring
- Uptime monitoring
- User analytics

## Security Notes

### Protecting Secrets

- ✅ Never commit `.env.staging` to git
- ✅ Use environment variables for all sensitive data
- ✅ Rotate API keys regularly
- ✅ Use separate keys for staging and production
- ✅ Limit staging API key permissions

### HIPAA Compliance for Staging

Even in staging:
- Use test data only (no real patient information)
- Encrypt data at rest and in transit
- Implement proper access controls
- Maintain audit logs
- Follow data retention policies

## Maintenance

### Weekly

- [ ] Check error logs
- [ ] Review performance metrics
- [ ] Test critical flows
- [ ] Update dependencies (if needed)

### Before Production Deployment

- [ ] All staging tests passed
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Stakeholder approval obtained

## Additional Resources

- [Production Setup Guide](PRODUCTION_SETUP.md)
- [Security Checklist](SECURITY_CHECKLIST.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Staging Checklist](../STAGING_CHECKLIST.md)
- [Architecture Overview](ARCHITECTURE.md)

## Support

For staging environment issues:
- Check logs: `supabase functions logs`
- Review [Troubleshooting](#troubleshooting) section
- Check Supabase status: https://status.supabase.com
- Internal: dev@mindboom.com

---

**Last Updated**: 2025-10-27
**Environment**: Staging
**Supabase Project**: aoumioacfvttagverbna

