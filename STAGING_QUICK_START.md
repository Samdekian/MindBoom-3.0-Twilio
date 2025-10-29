# MindBoom Spark - Staging Quick Start Guide

Get your staging environment up and running in minutes!

## TL;DR - Super Quick Setup

```bash
# 1. Clone repository (when available)
git clone https://github.com/samdekian/MindBoom-3.0-Twilio.git
cd mind-boom-spark

# 2. Run automated setup
./scripts/setup-staging.sh

# 3. Deploy
vercel --prod

# Done! 🎉
```

## Prerequisites

- Node.js 18+
- Supabase CLI
- Vercel or Netlify CLI
- Git

## Step-by-Step Quick Setup

### 1. Clone Repository

```bash
git clone https://github.com/samdekian/MindBoom-3.0-Twilio.git
cd mind-boom-spark
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Configure Environment

```bash
# Copy staging template
cp env.staging.template .env.staging

# Edit and add your Supabase anon key
nano .env.staging  # or use your preferred editor
```

Update this line:
```env
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

Get anon key from: https://supabase.com/dashboard/project/aoumioacfvttagverbna/settings/api

### 4. Link to Supabase

```bash
supabase link --project-ref aoumioacfvttagverbna
```

You'll need a Supabase access token: https://supabase.com/dashboard/account/tokens

### 5. Apply Database Migrations

```bash
supabase db push
```

### 6. Configure Secrets in Supabase

Go to: https://supabase.com/dashboard/project/aoumioacfvttagverbna/settings/functions

Add these secrets:
- `OPENAI_API_KEY` - From OpenAI platform
- `TWILIO_ACCOUNT_SID` - From Twilio console
- `TWILIO_AUTH_TOKEN` - From Twilio console  
- `TWILIO_API_KEY_SID` - Create at Twilio video API keys
- `TWILIO_API_KEY_SECRET` - From API key creation

Or via CLI:
```bash
supabase secrets set OPENAI_API_KEY="sk-proj-..."
supabase secrets set TWILIO_ACCOUNT_SID="ACxxxx..."
supabase secrets set TWILIO_AUTH_TOKEN="your-token"
supabase secrets set TWILIO_API_KEY_SID="SKxxxx..."
supabase secrets set TWILIO_API_KEY_SECRET="your-secret"
```

### 7. Deploy Edge Functions

```bash
supabase functions deploy
```

### 8. Build Application

```bash
npm run build:staging
```

### 9. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Add environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL` = `https://aoumioacfvttagverbna.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = your anon key
- `VITE_APP_ENV` = `staging`

### 10. Validate Everything

```bash
./scripts/validate-staging.sh
```

## What You Get

✅ **Full staging environment** with:
- React + TypeScript application
- Supabase backend (database, auth, storage)
- Edge functions deployed
- Video conferencing with Twilio
- AI features with OpenAI
- Breakout rooms functionality
- Real-time features
- HIPAA-compliant architecture

## Default Credentials

After deployment, create your first admin:
- Use the application signup
- Or run SQL to grant admin role

## Testing Your Deployment

1. **Open staging URL** in browser
2. **Register** a test account
3. **Login** with test account
4. **Create a video session**
5. **Join session** from another browser/device
6. **Test video/audio**
7. **Test breakout rooms** (if therapist)

## Monitoring

### View Logs

```bash
# Edge function logs
supabase functions logs --tail

# Specific function
supabase functions logs openai-realtime --tail
```

### Via Dashboard

- **Supabase**: https://supabase.com/dashboard/project/aoumioacfvttagverbna/logs
- **Vercel**: https://vercel.com/dashboard (your project → Logs)

## Common Issues

### "Module not found" during build

**Fix**: `npm install --legacy-peer-deps`

### "Supabase connection failed"

**Fix**: Check anon key in .env.staging

### "Edge function 500 error"

**Fix**: Configure secrets in Supabase dashboard

### "CORS error"

**Fix**: Add staging URL to Supabase auth redirect URLs

## Next Steps

After staging is running:

1. **Follow comprehensive testing**: [STAGING_CHECKLIST.md](STAGING_CHECKLIST.md)
2. **Configure monitoring**: Set up error tracking
3. **Create test users**: For QA testing
4. **Document issues**: Track in GitHub issues
5. **Prepare for production**: When staging is stable

## Support & Documentation

- **Full Setup Guide**: [docs/STAGING_SETUP.md](docs/STAGING_SETUP.md)
- **Secrets Guide**: [docs/SECRETS_CONFIGURATION_GUIDE.md](docs/SECRETS_CONFIGURATION_GUIDE.md)
- **Edge Functions**: [docs/EDGE_FUNCTIONS_DEPLOY_GUIDE.md](docs/EDGE_FUNCTIONS_DEPLOY_GUIDE.md)
- **Frontend Deploy**: [docs/FRONTEND_DEPLOY_GUIDE.md](docs/FRONTEND_DEPLOY_GUIDE.md)

## Quick Reference

```bash
# Setup
./scripts/setup-staging.sh

# Link Supabase
supabase link --project-ref aoumioacfvttagverbna

# Deploy database
supabase db push

# Deploy functions
supabase functions deploy

# Build app
npm run build:staging

# Deploy frontend
vercel --prod

# Validate
./scripts/validate-staging.sh

# Monitor
supabase functions logs --tail
```

---

🚀 **Your staging environment is ready!**

For detailed instructions, see the full guides in `docs/` folder.

