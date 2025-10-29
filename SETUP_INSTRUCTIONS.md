# MindBoom Spark - Complete Setup Instructions

## 🎯 Current Status

✅ **Repository prepared** for: `mind-boom-spark`  
✅ **Supabase staging ready**: Project `aoumioacfvttagverbna`  
✅ **All documentation created**  
✅ **Scripts automated**  
⏳ **Pending**: Push to GitHub (repository needs to be created first)

## 🚨 FIRST: Create GitHub Repository

Before you can push the code, you need to create the repository on GitHub:

### Step-by-Step:

1. **Go to**: https://github.com/new

2. **Configure**:
   - **Owner**: Samdekian
   - **Repository name**: `mind-boom-spark`
   - **Description**: `MindBoom Spark - AI-powered video therapy platform with Twilio Video, breakout rooms, and OpenAI integration`
   - **Visibility**: 
     - 🔒 **Private** (recommended for initial setup)
     - OR 🌍 **Public** (if you want open source)
   - **Initialize**:
     - ❌ Do NOT add README
     - ❌ Do NOT add .gitignore
     - ❌ Do NOT add license

3. **Click**: "Create repository"

4. **After created**, run this command:
   ```bash
   cd "/Users/rsmacair/Samdekian Dropbox/Samdekian Docs/Mac (2)/Documents/Dev/MindBloom/mind-bloom-therapy-ai"
   git push -u origin main
   git push -u origin develop
   ```

## 📦 What's Already Done

### ✅ Git Repository (Local)
- Fresh git history created
- Initial commit with all code
- Branches: `main` and `develop`
- Remote configured to: `mind-boom-spark`
- All references updated to correct repository name

### ✅ Documentation Created (9 new files)
1. **STAGING_QUICK_START.md** - Quick start guide
2. **docs/STAGING_SETUP.md** - Complete staging setup
3. **docs/SECRETS_CONFIGURATION_GUIDE.md** - Secrets configuration
4. **docs/EDGE_FUNCTIONS_DEPLOY_GUIDE.md** - Edge functions deployment
5. **docs/FRONTEND_DEPLOY_GUIDE.md** - Frontend deployment
6. **env.staging.template** - Staging environment template
7. **scripts/setup-staging.sh** - Automated setup script
8. **scripts/validate-staging.sh** - Validation script
9. **README.md** - Updated with staging section

### ✅ Configurations
- Package.json updated (name: `mind-boom-spark`)
- Build script added: `npm run build:staging`
- Docker configuration ready
- CI/CD workflows configured
- Supabase project ref: `aoumioacfvttagverbna`

## 🚀 Next Steps - In Order

### 1. Push to GitHub (After Creating Repository)

```bash
cd "/Users/rsmacair/Samdekian Dropbox/Samdekian Docs/Mac (2)/Documents/Dev/MindBloom/mind-bloom-therapy-ai"

# Push both branches
git push -u origin main
git push -u origin develop

# Verify
git remote -v
```

### 2. Get Supabase Credentials

Go to: https://supabase.com/dashboard/project/aoumioacfvttagverbna/settings/api

Copy:
- **URL**: `https://aoumioacfvttagverbna.supabase.co`
- **anon public key**: [copy this]
- **service_role key**: [copy this - keep secure]

### 3. Create `.env.staging`

```bash
cp env.staging.template .env.staging
```

Edit and add your anon key:
```env
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### 4. Run Automated Setup

```bash
./scripts/setup-staging.sh
```

This will:
- ✅ Check prerequisites
- ✅ Link to Supabase staging
- ✅ Apply database migrations
- ✅ Deploy edge functions
- ✅ Build application

### 5. Configure Secrets

Go to: https://supabase.com/dashboard/project/aoumioacfvttagverbna/settings/functions

Add secrets (see [docs/SECRETS_CONFIGURATION_GUIDE.md](docs/SECRETS_CONFIGURATION_GUIDE.md)):
- `OPENAI_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_API_KEY_SID`
- `TWILIO_API_KEY_SECRET`

### 6. Deploy Frontend

```bash
# Option A: Vercel (recommended)
npm install -g vercel
vercel login
vercel --prod

# Option B: Netlify
npm install -g netlify-cli
netlify login
netlify deploy --prod

# Option C: Docker
docker build -t mind-boom-spark:staging .
docker run -d -p 8080:80 mind-boom-spark:staging
```

### 7. Validate Deployment

```bash
./scripts/validate-staging.sh
```

### 8. Manual Testing

Follow the checklist: [STAGING_CHECKLIST.md](STAGING_CHECKLIST.md)

## 📚 Documentation Overview

### Quick Guides
- 🚀 **[STAGING_QUICK_START.md](STAGING_QUICK_START.md)** - Start here!
- 📋 **[STAGING_CHECKLIST.md](STAGING_CHECKLIST.md)** - Validation checklist

### Detailed Guides
- 📖 **[docs/STAGING_SETUP.md](docs/STAGING_SETUP.md)** - Complete staging setup
- 🔐 **[docs/SECRETS_CONFIGURATION_GUIDE.md](docs/SECRETS_CONFIGURATION_GUIDE.md)** - All secrets explained
- ⚡ **[docs/EDGE_FUNCTIONS_DEPLOY_GUIDE.md](docs/EDGE_FUNCTIONS_DEPLOY_GUIDE.md)** - Backend functions
- 🌐 **[docs/FRONTEND_DEPLOY_GUIDE.md](docs/FRONTEND_DEPLOY_GUIDE.md)** - Frontend deployment

### Production Guides
- 🏭 **[docs/PRODUCTION_SETUP.md](docs/PRODUCTION_SETUP.md)** - Production deployment
- 🔒 **[docs/SECURITY_CHECKLIST.md](docs/SECURITY_CHECKLIST.md)** - Security audit
- 🚢 **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Platform-specific deploys

## 🔑 Key Information

### Staging Environment

```yaml
Repository: https://github.com/samdekian/MindBoom-3.0-Twilio
Supabase Project: aoumioacfvttagverbna
Supabase URL: https://aoumioacfvttagverbna.supabase.co
Environment: staging
Branch: develop
```

### Required API Keys

| Service | What You Need | Where to Get |
|---------|--------------|--------------|
| Supabase | Anon Key | [Dashboard](https://supabase.com/dashboard/project/aoumioacfvttagverbna/settings/api) |
| Twilio | Account SID, Auth Token, API Keys | [Console](https://console.twilio.com) |
| OpenAI | API Key | [Platform](https://platform.openai.com/api-keys) |
| Agora | App ID, Certificate (optional) | [Console](https://console.agora.io) |

## 🎬 Quick Command Reference

```bash
# Setup staging
./scripts/setup-staging.sh

# Link to Supabase
supabase link --project-ref aoumioacfvttagverbna

# Apply migrations
supabase db push

# Deploy functions
supabase functions deploy

# Configure secrets
supabase secrets set OPENAI_API_KEY="sk-..."
supabase secrets set TWILIO_ACCOUNT_SID="ACxxx..."
# ... etc

# Build app
npm run build:staging

# Deploy to Vercel
vercel --prod

# Validate
./scripts/validate-staging.sh

# Monitor logs
supabase functions logs --tail
```

## 🆘 Need Help?

### Quick Links
- Staging setup issue? → [docs/STAGING_SETUP.md](docs/STAGING_SETUP.md#troubleshooting)
- Secrets not working? → [docs/SECRETS_CONFIGURATION_GUIDE.md](docs/SECRETS_CONFIGURATION_GUIDE.md#troubleshooting)
- Edge function errors? → [docs/EDGE_FUNCTIONS_DEPLOY_GUIDE.md](docs/EDGE_FUNCTIONS_DEPLOY_GUIDE.md#troubleshooting)
- Deploy failed? → [docs/FRONTEND_DEPLOY_GUIDE.md](docs/FRONTEND_DEPLOY_GUIDE.md#troubleshooting)

### Support
- Email: support@mindboom.com
- GitHub Issues: https://github.com/samdekian/MindBoom-3.0-Twilio/issues

## ✅ Success Criteria

Your staging is ready when:
- [ ] Repository pushed to GitHub
- [ ] Supabase database has all tables
- [ ] All edge functions deployed
- [ ] All secrets configured
- [ ] Frontend deployed and accessible
- [ ] Can register and login
- [ ] Can create and join video sessions
- [ ] All tests pass

## 🎉 You're Done!

Once all steps are complete, your staging environment will be fully operational!

---

**Last Updated**: 2025-10-27  
**Version**: 3.0.0  
**Environment**: Staging  
**Project**: mind-boom-spark

