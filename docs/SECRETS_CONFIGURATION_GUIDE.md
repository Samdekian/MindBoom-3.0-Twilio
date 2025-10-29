# MindBoom Spark - Secrets Configuration Guide

Step-by-step guide to configure all required secrets for staging and production environments.

## Overview

Secrets are sensitive credentials that should NEVER be committed to git. They are configured in:
- **Supabase Edge Functions**: For backend/serverless functions
- **GitHub Actions**: For CI/CD pipelines
- **Hosting Platform**: For frontend environment variables

## Supabase Edge Function Secrets

### Project: Staging (`aoumioacfvttagverbna`)

### Method 1: Via Supabase Dashboard (Easiest)

1. **Access Secrets Page**
   - Go to: https://supabase.com/dashboard/project/aoumioacfvttagverbna
   - Navigate to: **Edge Functions → Manage secrets**

2. **Add Each Secret**
   - Click **"Add new secret"**
   - Enter name and value
   - Click **"Add secret"**

### Method 2: Via Supabase CLI

```bash
# Make sure you're linked to the staging project
supabase link --project-ref aoumioacfvttagverbna

# Set secrets one by one
supabase secrets set OPENAI_API_KEY="sk-proj-your-key-here"
supabase secrets set TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxx"
supabase secrets set TWILIO_AUTH_TOKEN="your-auth-token"
supabase secrets set TWILIO_API_KEY_SID="SKxxxxxxxxxxxxx"
supabase secrets set TWILIO_API_KEY_SECRET="your-api-secret"

# Optional: Agora.io
supabase secrets set AGORA_APP_ID="your-app-id"
supabase secrets set AGORA_APP_CERTIFICATE="your-certificate"

# Verify all secrets are set
supabase secrets list
```

## Required Secrets Details

### 1. OpenAI API Key

**Secret Name**: `OPENAI_API_KEY`

**Where to Get:**
1. Go to https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Name it: "MindBoom Spark - Staging"
4. Copy the key immediately (shown only once)

**Format**: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Usage**: AI features, transcription, voice-to-voice

**Cost**: Based on usage, set billing limits

### 2. Twilio Account SID

**Secret Name**: `TWILIO_ACCOUNT_SID`

**Where to Get:**
1. Go to https://console.twilio.com
2. View on dashboard home page under "Account Info"
3. Or navigate to: Account → Keys & Credentials

**Format**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (34 characters)

**Usage**: Authenticate Twilio API requests

### 3. Twilio Auth Token

**Secret Name**: `TWILIO_AUTH_TOKEN`

**Where to Get:**
1. Same location as Account SID
2. Click **"View"** to reveal (hidden by default)

**Format**: 32-character string

**Usage**: Authenticate Twilio API requests

**Security**: Keep this extremely secure, acts as password

### 4. Twilio API Key SID (for Video)

**Secret Name**: `TWILIO_API_KEY_SID`

**Where to Get:**
1. Go to https://console.twilio.com/us1/develop/video/manage/api-keys
2. Click **"Create API Key"**
3. Friendly name: "MindBoom Spark Staging"
4. Region: Choose closest to users
5. Copy the SID immediately

**Format**: `SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Usage**: Generate video room tokens, create rooms

### 5. Twilio API Key Secret

**Secret Name**: `TWILIO_API_KEY_SECRET`

**Where to Get:**
1. Created with the API Key (step above)
2. **IMPORTANT**: Shown only once during creation
3. Save immediately in password manager

**Format**: 32-character string

**Usage**: Used with API Key SID for video functions

### 6. Agora App ID (Optional)

**Secret Name**: `AGORA_APP_ID`

**Where to Get:**
1. Go to https://console.agora.io
2. Navigate to: Projects
3. Select your project or create new one
4. Copy App ID from project dashboard

**Format**: 32-character hex string

**Usage**: Alternative video provider

### 7. Agora App Certificate (Optional)

**Secret Name**: `AGORA_APP_CERTIFICATE`

**Where to Get:**
1. Same location as App ID
2. Enable App Certificate in project settings
3. Copy the certificate

**Format**: 32-character hex string

**Usage**: Generate Agora tokens securely

## Verification

### Check Secrets are Set

```bash
# List all secrets (won't show values)
supabase secrets list

# Expected output:
# NAME
# OPENAI_API_KEY
# TWILIO_ACCOUNT_SID
# TWILIO_AUTH_TOKEN
# TWILIO_API_KEY_SID
# TWILIO_API_KEY_SECRET
# AGORA_APP_ID (if set)
# AGORA_APP_CERTIFICATE (if set)
```

### Test Secrets Work

```bash
# Test Twilio integration
supabase functions invoke get-turn-credentials

# Should return:
# {
#   "iceServers": [
#     { "urls": "stun:..." },
#     { "urls": "turn:...", "username": "...", "credential": "..." }
#   ]
# }

# Test OpenAI integration
# (Requires WebSocket client to test openai-realtime)
```

## GitHub Secrets (for CI/CD)

### Access GitHub Secrets

1. Go to: https://github.com/Samdekian/mind-boom-spark/settings/secrets/actions
2. Click **"New repository secret"**

### Required GitHub Secrets

#### Staging Deployment

```
Name: STAGING_SUPABASE_URL
Value: https://aoumioacfvttagverbna.supabase.co

Name: STAGING_SUPABASE_ANON_KEY
Value: [your-staging-anon-key]

Name: STAGING_SUPABASE_PROJECT_REF
Value: aoumioacfvttagverbna

Name: SUPABASE_ACCESS_TOKEN
Value: [your-personal-access-token]
Get from: https://supabase.com/dashboard/account/tokens

Name: STAGING_APP_URL
Value: https://staging.mindboom.app

Name: STAGING_OPENAI_API_KEY
Value: sk-proj-...

Name: STAGING_TWILIO_ACCOUNT_SID
Value: ACxxxx...

Name: STAGING_TWILIO_AUTH_TOKEN
Value: [token]

Name: STAGING_TWILIO_API_KEY_SID
Value: SKxxxx...

Name: STAGING_TWILIO_API_KEY_SECRET
Value: [secret]
```

#### Production Deployment (when ready)

```
Name: PROD_SUPABASE_URL
Name: PROD_SUPABASE_ANON_KEY
Name: PROD_SUPABASE_PROJECT_REF
... (same pattern as staging)
```

#### Deployment Platform

```
# For Vercel
Name: VERCEL_TOKEN
Value: [from Vercel account settings]

Name: VERCEL_ORG_ID
Value: [from Vercel]

Name: VERCEL_PROJECT_ID
Value: [from Vercel]

# OR for Netlify
Name: NETLIFY_AUTH_TOKEN
Name: NETLIFY_SITE_ID
```

## Security Best Practices

### ✅ DO
- Use separate keys for staging and production
- Rotate keys regularly (every 90 days)
- Use strong, randomly generated passwords
- Store secrets in password manager
- Limit key permissions to minimum required
- Monitor key usage
- Revoke unused keys
- Use environment-specific keys

### ❌ DON'T
- Never commit secrets to git
- Don't share secrets via email/chat
- Don't use same keys for staging and production
- Don't hardcode secrets in code
- Don't log secret values
- Don't store secrets in plaintext files
- Don't reuse personal API keys

## Key Rotation Procedure

### When to Rotate
- Every 90 days (recommended)
- After team member leaves
- If key is exposed/compromised
- Before major releases

### How to Rotate

1. **Generate new key** in provider dashboard
2. **Update in Supabase**:
   ```bash
   supabase secrets set SECRET_NAME="new-value"
   ```
3. **Verify new key works**
4. **Revoke old key** after 24 hours
5. **Update documentation**

## Troubleshooting

### "Secret not found" errors

**Fix**: Set the secret in Supabase:
```bash
supabase secrets set SECRET_NAME="value"
```

### Edge functions return 500

**Fix**: Check logs for which secret is missing:
```bash
supabase functions logs function-name
```

### Can't access Twilio services

**Fix**: Verify Twilio keys are correct:
```bash
# Test Twilio API directly
curl -X GET "https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID.json" \
  -u "YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN"
```

### OpenAI "Invalid API key"

**Fix**: 
1. Verify key format starts with `sk-proj-`
2. Check key is not expired
3. Verify billing is enabled
4. Test key directly:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

## Secrets Checklist

Before going live:

- [ ] All Supabase secrets configured
- [ ] All GitHub secrets configured
- [ ] Hosting platform environment variables set
- [ ] Secrets verified working
- [ ] Secrets documented in password manager
- [ ] Rotation schedule created
- [ ] Team members have appropriate access
- [ ] Old/unused keys revoked

## Support

For issues with secrets configuration:
- Supabase: https://supabase.com/docs/guides/functions/secrets
- Twilio: https://www.twilio.com/docs/iam/keys/api-key
- OpenAI: https://platform.openai.com/docs/api-reference/authentication

---

**Last Updated**: 2025-10-27  
**Environment**: Staging  
**Project**: mind-boom-spark

