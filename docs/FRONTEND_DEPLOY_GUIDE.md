# MindBoom Spark - Frontend Deployment Guide (Staging)

Step-by-step guide for deploying the frontend application to staging environment.

## Overview

**Application**: MindBoom Spark  
**Framework**: React + Vite + TypeScript  
**Supabase**: `aoumioacfvttagverbna` (staging)  
**Recommended Platform**: Vercel or Netlify

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] Supabase staging project configured
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Secrets configured in Supabase
- [ ] `.env.staging` file created with correct values
- [ ] Application builds successfully locally

## Option 1: Vercel Deployment (Recommended)

### Why Vercel?
- Zero-config for Vite
- Automatic HTTPS
- Global CDN
- Auto-deploy from GitHub
- Free tier available
- Excellent performance

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### Step 2: Initial Deployment

```bash
# Navigate to project
cd "/Users/rsmacair/Samdekian Dropbox/Samdekian Docs/Mac (2)/Documents/Dev/MindBloom/mind-bloom-therapy-ai"

# Deploy (will prompt for configuration)
vercel

# Answer prompts:
# ? Set up and deploy "~/...mind-bloom-therapy-ai"? Y
# ? Which scope? [Your account]
# ? Link to existing project? N
# ? What's your project's name? mind-boom-spark-staging
# ? In which directory is your code located? ./
# ? Want to override settings? N
```

### Step 3: Configure Environment Variables

#### Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/dashboard
2. Select your project: `mind-boom-spark-staging`
3. Go to: **Settings → Environment Variables**
4. Add each variable for "Preview" and "Development":

```
Name: VITE_SUPABASE_URL
Value: https://aoumioacfvttagverbna.supabase.co
Environments: ✓ Preview  ✓ Development

Name: VITE_SUPABASE_ANON_KEY
Value: [paste your anon key]
Environments: ✓ Preview  ✓ Development

Name: VITE_APP_ENV
Value: staging
Environments: ✓ Preview  ✓ Development

Name: VITE_APP_URL
Value: https://mind-boom-spark-staging.vercel.app
Environments: ✓ Preview  ✓ Development
```

#### Via Vercel CLI

```bash
# Add environment variables
vercel env add VITE_SUPABASE_URL
# Enter: https://aoumioacfvttagverbna.supabase.co
# Select: Preview, Development

vercel env add VITE_SUPABASE_ANON_KEY
# Enter: [your-anon-key]
# Select: Preview, Development

vercel env add VITE_APP_ENV
# Enter: staging
# Select: Preview, Development

vercel env add VITE_APP_URL
# Enter: https://mind-boom-spark-staging.vercel.app
# Select: Preview, Development

# List all environment variables
vercel env ls
```

### Step 4: Deploy to Production (on Vercel)

```bash
# Deploy to production
vercel --prod

# You'll get a URL like:
# https://mind-boom-spark-staging.vercel.app
```

### Step 5: Configure Custom Domain (Optional)

```bash
# Add custom domain
vercel domains add staging.mindboom.app

# Follow DNS configuration instructions
# Vercel will auto-configure SSL
```

### Step 6: Connect GitHub for Auto-Deploy

1. Go to: https://vercel.com/dashboard
2. Select project: `mind-boom-spark-staging`
3. Go to: **Settings → Git**
4. Connect repository: `Samdekian/mind-boom-spark`
5. Configure:
   - **Production Branch**: `main`
   - **Preview Branches**: `develop`, `staging`
   - Auto-deploy: Enabled

Now every push to `develop` will auto-deploy to staging!

## Option 2: Netlify Deployment

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
netlify login
```

### Step 2: Initialize Project

```bash
# From project directory
netlify init

# Answer prompts:
# ? Create & configure a new site? Yes
# ? Team: [Your team]
# ? Site name: mind-boom-spark-staging
# ? Build command: npm run build:staging
# ? Directory to deploy: dist
# ? Create netlify.toml? Yes
```

### Step 3: Configure Environment

```bash
# Add environment variables
netlify env:set VITE_SUPABASE_URL "https://aoumioacfvttagverbna.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"
netlify env:set VITE_APP_ENV "staging"
netlify env:set VITE_APP_URL "https://mind-boom-spark-staging.netlify.app"
```

### Step 4: Deploy

```bash
# Build and deploy
netlify deploy --prod

# Or build separately
npm run build:staging
netlify deploy --prod --dir=dist
```

### Step 5: Connect GitHub (Optional)

1. Go to: https://app.netlify.com
2. Site settings → Build & Deploy
3. Connect to GitHub repository
4. Configure build settings:
   - **Branch**: `develop`
   - **Build command**: `npm run build:staging`
   - **Publish directory**: `dist`

## Option 3: Docker Deployment

### Step 1: Build Docker Image

```bash
# Build with staging configuration
docker build \
  --build-arg VITE_SUPABASE_URL="https://aoumioacfvttagverbna.supabase.co" \
  --build-arg VITE_SUPABASE_ANON_KEY="your-anon-key" \
  --build-arg VITE_APP_ENV="staging" \
  -t mind-boom-spark:staging \
  .
```

### Step 2: Run Container

```bash
# Run staging container
docker run -d \
  --name mindboom-staging \
  -p 8080:80 \
  --restart unless-stopped \
  mind-boom-spark:staging

# Check container health
docker ps
docker logs mindboom-staging
```

### Step 3: Using Docker Compose

Create `docker-compose.staging.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_SUPABASE_URL: https://aoumioacfvttagverbna.supabase.co
        VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY}
        VITE_APP_ENV: staging
    ports:
      - "8080:80"
    restart: unless-stopped
    container_name: mindboom-staging
    environment:
      - NODE_ENV=production
```

Deploy:
```bash
# Export anon key
export VITE_SUPABASE_ANON_KEY="your-key"

# Deploy
docker-compose -f docker-compose.staging.yml up -d

# View logs
docker-compose -f docker-compose.staging.yml logs -f
```

## Build Configuration

### Vite Build Modes

The project supports multiple build modes:

```bash
# Development build
npm run build:dev

# Staging build
npm run build:staging

# Production build
npm run build:prod
```

### Environment-Specific Builds

Create `vite.config.staging.ts` if you need staging-specific Vite configuration:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,  // Enable for staging debugging
    minify: true,
  },
  // Staging-specific settings
});
```

## Post-Deployment

### Step 1: Verify Deployment

```bash
# Get staging URL (from deployment output)
STAGING_URL="https://mind-boom-spark-staging.vercel.app"

# Test homepage
curl -I $STAGING_URL

# Test health endpoint
curl $STAGING_URL/health.json

# Expected: {"status":"healthy","service":"mindboom-3.0-twilio"}
```

### Step 2: Test Application

Open in browser: `https://mind-boom-spark-staging.vercel.app`

Test:
- [ ] Homepage loads
- [ ] Can navigate to login
- [ ] No console errors
- [ ] Assets load correctly
- [ ] Supabase connection works

### Step 3: Configure CORS in Supabase

1. Go to: https://supabase.com/dashboard/project/aoumioacfvttagverbna
2. Navigate to: **Authentication → URL Configuration**
3. Add:
   - **Site URL**: `https://mind-boom-spark-staging.vercel.app`
   - **Redirect URLs**: `https://mind-boom-spark-staging.vercel.app/**`

### Step 4: Test Full Flow

1. Register new user
2. Login
3. Create appointment (if applicable)
4. Start video session
5. Test breakout rooms
6. Verify data persists in Supabase

## Continuous Deployment

### GitHub Actions Integration

The repository already has `.github/workflows/deploy-staging.yml` configured.

**Trigger**: Push to `develop` branch

**What it does**:
1. Runs tests
2. Builds application
3. Deploys to Vercel/Netlify
4. Runs smoke tests
5. Notifies team

**To enable**:
1. Add GitHub secrets (see SECRETS_CONFIGURATION_GUIDE.md)
2. Push to `develop` branch
3. Monitor: https://github.com/Samdekian/mind-boom-spark/actions

## Performance Optimization

### Build Optimizations

Already configured in the project:
- Code splitting
- Tree shaking
- Minification
- Gzip compression
- Asset optimization

### CDN Configuration

Vercel and Netlify automatically provide:
- Global CDN
- Edge caching
- Automatic SSL
- HTTP/2
- Brotli compression

### Monitoring

Set up monitoring:
- **Vercel Analytics**: Built-in
- **Web Vitals**: Automatic tracking
- **Error Tracking**: Add Sentry
- **Performance**: Add New Relic or DataDog

## Rollback Procedure

### Vercel

```bash
# Via dashboard: Deployments → Click on previous deployment → Promote to Production

# Or via CLI
vercel rollback
```

### Netlify

```bash
# Via dashboard: Deploys → Click on previous deploy → Publish

# Or via CLI
netlify rollback
```

### Docker

```bash
# Stop current container
docker stop mindboom-staging

# Run previous image
docker run -d --name mindboom-staging mind-boom-spark:previous-tag
```

## Troubleshooting

### Build Fails

**Error**: "Module not found"
**Fix**: Run `npm install --legacy-peer-deps`

**Error**: "Type errors"
**Fix**: Run `npm run type-check` and fix type issues

**Error**: "Environment variable undefined"
**Fix**: Ensure all VITE_ variables are set in hosting platform

### Deployment Fails

**Error**: "Authentication failed"
**Fix**: Run `vercel login` or `netlify login`

**Error**: "Build exceeded time limit"
**Fix**: Optimize build or upgrade plan

### Application Shows White Screen

**Fix**:
1. Check browser console for errors
2. Verify environment variables are set
3. Check Supabase URL is correct
4. Verify CORS is configured

### API Calls Failing

**Fix**:
1. Check network tab in browser
2. Verify Supabase URL and key
3. Check CORS configuration
4. Test edge functions directly

## Quick Deploy Commands

```bash
# Full deployment from scratch
./scripts/setup-staging.sh       # One-time setup
npm run build:staging            # Build app
vercel --prod                    # Deploy to Vercel

# Update existing deployment
git pull origin develop
npm install
npm run build:staging
vercel --prod

# Validate deployment
./scripts/validate-staging.sh
```

## Additional Resources

- [Staging Setup Guide](STAGING_SETUP.md)
- [Secrets Configuration](SECRETS_CONFIGURATION_GUIDE.md)
- [Edge Functions Guide](EDGE_FUNCTIONS_DEPLOY_GUIDE.md)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)

---

**Last Updated**: 2025-10-27  
**Environment**: Staging  
**Project**: mind-boom-spark

