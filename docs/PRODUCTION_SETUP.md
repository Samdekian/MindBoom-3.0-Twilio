# MindBoom 3.0 - Twilio: Production Setup Guide

This comprehensive guide walks you through deploying MindBoom 3.0 to production with all required services configured for optimal performance and security.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Production Setup](#supabase-production-setup)
3. [Twilio Configuration](#twilio-configuration)
4. [Agora.io Setup](#agoraio-setup)
5. [OpenAI Configuration](#openai-configuration)
6. [Environment Variables](#environment-variables)
7. [Database Migration](#database-migration)
8. [Edge Functions Deployment](#edge-functions-deployment)
9. [Frontend Deployment](#frontend-deployment)
10. [Domain & SSL Setup](#domain--ssl-setup)
11. [HIPAA Compliance](#hipaa-compliance)
12. [Monitoring & Logging](#monitoring--logging)
13. [Post-Deployment Verification](#post-deployment-verification)

## Prerequisites

Before starting production deployment, ensure you have:

- [ ] Production Supabase account
- [ ] Twilio account with active phone number
- [ ] Agora.io developer account
- [ ] OpenAI API account with billing enabled
- [ ] Domain name and DNS access
- [ ] SSL certificate or access to Let's Encrypt
- [ ] CI/CD platform access (GitHub Actions, etc.)
- [ ] Monitoring service account (optional but recommended)

## Supabase Production Setup

### 1. Create Production Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Configure:
   - **Organization**: Select or create
   - **Project Name**: `mindboom-production`
   - **Database Password**: Use a strong, randomly generated password (save securely)
   - **Region**: Choose closest to your primary users
   - **Pricing Plan**: Pro or higher (for production features)

### 2. Configure Project Settings

Navigate to **Settings > General**:

- **Project Name**: MindBoom 3.0 - Twilio
- **Timezone**: UTC (recommended)
- **Pause Project**: Disabled

### 3. Configure Authentication

Navigate to **Authentication > Settings**:

```yaml
Site URL: https://yourdomain.com
Redirect URLs:
  - https://yourdomain.com/**
  - https://www.yourdomain.com/**

Email Auth:
  - Enable Email Confirmations: true
  - Secure Email Change: true
  - Double Confirm Email Changes: true

Session:
  - JWT Expiry: 3600 (1 hour)
  - Refresh Token Rotation: Enabled

Security:
  - Enable Captcha: true (recommended)
  - Rate Limiting: Enabled
```

### 4. Configure Database

Navigate to **Database > Settings**:

```yaml
Connection Pooling:
  - Mode: Transaction
  - Pool Size: 15

SSL Enforcement: Enabled
IPv6 Support: Enabled (if needed)
```

### 5. Configure Storage

Navigate to **Storage > Settings**:

```yaml
File Size Limit: 50 MB
Allowed MIME Types:
  - image/jpeg
  - image/png
  - image/gif
  - application/pdf
  - video/mp4
  - audio/mpeg
  - audio/wav

Storage Quota: Based on plan
Public Bucket: false (all buckets private by default)
```

### 6. Row Level Security (RLS)

Verify all tables have RLS policies:

```bash
# Connect to your database
supabase db pull

# Review RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

All tables should have appropriate RLS policies. Run the security audit:

```sql
-- Check for tables without RLS
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename NOT IN (
    SELECT tablename FROM pg_policies WHERE schemaname = 'public'
  );
```

## Twilio Configuration

### 1. Set Up Twilio Account

1. Create account at [Twilio Console](https://console.twilio.com)
2. Verify your email and phone number
3. Navigate to **Account > API keys & tokens**

### 2. Get Credentials

```yaml
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token: [Your Auth Token]
```

**IMPORTANT**: Store these securely in a password manager.

### 3. Enable TURN Servers

Twilio provides global TURN servers by default. Test the connection:

```bash
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Tokens.json" \
  -u "${ACCOUNT_SID}:${AUTH_TOKEN}"
```

You should receive ICE servers configuration.

### 4. Configure STUN/TURN Settings

Default Twilio TURN servers:
- `turn:global.turn.twilio.com:3478`
- `turns:global.turn.twilio.com:443` (TLS)

These are automatically fetched by the `get-turn-credentials` edge function.

### 5. Optional: SMS/Phone Features

If using Twilio for SMS notifications:

1. Purchase a phone number in **Phone Numbers > Buy a number**
2. Configure messaging service in **Messaging > Services**
3. Add the credentials to Supabase secrets

## Agora.io Setup

### 1. Create Agora Project

1. Go to [Agora Console](https://console.agora.io)
2. Create new project
3. Configure:
   - **Project Name**: MindBoom 3.0 Production
   - **Use Case**: Video Calling
   - **Authentication**: Token-based

### 2. Enable Services

Enable the following features:
- ✅ Real-time Communication (RTC)
- ✅ Cloud Recording
- ✅ Real-time Messaging (optional)

### 3. Get Credentials

```yaml
App ID: [Your App ID]
App Certificate: [Your App Certificate]
```

### 4. Configure Cloud Recording

Navigate to **Projects > Features > Cloud Recording**:

```yaml
Storage:
  Vendor: AWS S3 / Azure Blob / Google Cloud
  Region: Same as your application
  Bucket: mindboom-recordings
  Access Key: [Your Access Key]
  Secret Key: [Your Secret Key]

Recording:
  Mode: Individual + Composite
  Max Idle Time: 30 seconds
  Stream Types: Audio + Video
```

### 5. Set Up Recording Callbacks

Configure webhook endpoint:
```
https://yourdomain.com/api/recording-callback
```

## OpenAI Configuration

### 1. Create API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Navigate to **API Keys**
3. Create new key: "MindBoom Production"

### 2. Configure Usage Limits

Set up usage limits to prevent unexpected charges:

```yaml
Hard Limit: $500/month (adjust as needed)
Soft Limit: $400/month
Email Notifications: Enabled
```

### 3. Select Models

Available models for your application:
- **Realtime API**: `gpt-4o-realtime-preview`
- **Transcription**: `whisper-1`
- **Text**: `gpt-4o` or `gpt-4o-mini`

### 4. Test API Access

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer ${OPENAI_API_KEY}"
```

## Environment Variables

### Frontend Environment Variables

Create production `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Application Configuration
VITE_APP_ENV=production
VITE_APP_URL=https://yourdomain.com

# Optional Features
VITE_ENABLE_DEBUG_LOGS=false
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

### Supabase Edge Function Secrets

Add secrets via Supabase CLI:

```bash
# Set all secrets at once
supabase secrets set \
  OPENAI_API_KEY="sk-proj-..." \
  TWILIO_ACCOUNT_SID="ACxxxxx..." \
  TWILIO_AUTH_TOKEN="your-token" \
  AGORA_APP_ID="your-app-id" \
  AGORA_APP_CERTIFICATE="your-certificate"

# Verify secrets are set
supabase secrets list
```

Or set via Supabase Dashboard:
1. Navigate to **Edge Functions > Manage secrets**
2. Add each secret with its value
3. Click "Save"

## Database Migration

### 1. Review Migrations

```bash
# List all migrations
ls -la supabase/migrations/

# Review any pending migrations
supabase db diff
```

### 2. Run Migrations

```bash
# Link to production project
supabase link --project-ref your-production-project-id

# Push migrations
supabase db push

# Verify migration
supabase db remote status
```

### 3. Seed Initial Data (if needed)

```bash
# Run seed file if you have initial data
supabase db seed
```

### 4. Create Database Backup

```bash
# Create initial backup
supabase db dump > backup-initial-$(date +%Y%m%d).sql

# Upload to secure storage
```

## Edge Functions Deployment

### 1. Review Edge Functions

```bash
# List all functions
ls -la supabase/functions/

# Required functions:
# - openai-realtime
# - get-turn-credentials
# - get-ice-config
# - session-analytics
# - system-health
# - production-monitor
# - production-cleanup
```

### 2. Deploy All Functions

```bash
# Deploy all functions at once
supabase functions deploy

# Or deploy individually
supabase functions deploy openai-realtime
supabase functions deploy get-turn-credentials
# ... etc
```

### 3. Configure Function Settings

For each function, configure:

```yaml
Memory: 256 MB (default)
Timeout: 30s
JWT Verification: Enabled (except for webhooks)
```

### 4. Test Edge Functions

```bash
# Test TURN credentials
curl -X POST "https://your-project-id.supabase.co/functions/v1/get-turn-credentials" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}"

# Test OpenAI Realtime (WebSocket)
# Use a WebSocket client to test ws://your-project-id.supabase.co/functions/v1/openai-realtime
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Configure environment variables in Netlify dashboard
```

### Option 3: Docker

```bash
# Build production image
docker build -t mindboom-3.0-twilio:latest .

# Run container
docker run -d \
  -p 80:80 \
  -e VITE_SUPABASE_URL="your-url" \
  -e VITE_SUPABASE_ANON_KEY="your-key" \
  --name mindboom-production \
  mindboom-3.0-twilio:latest
```

### Option 4: AWS / Google Cloud / Azure

See [DEPLOYMENT.md](DEPLOYMENT.md) for platform-specific instructions.

## Domain & SSL Setup

### 1. Configure DNS

Add DNS records:

```
A     @               your-server-ip
A     www             your-server-ip
CNAME api             your-project-id.supabase.co
```

### 2. SSL Certificate

#### Option A: Let's Encrypt (Free)

```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

#### Option B: Cloudflare (Recommended)

1. Add domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS (Full Strict mode)
4. Configure edge certificates

### 3. Update Supabase Redirect URLs

In Supabase Dashboard > Authentication > URL Configuration:

```yaml
Site URL: https://yourdomain.com
Additional Redirect URLs:
  - https://yourdomain.com/**
  - https://www.yourdomain.com/**
```

## HIPAA Compliance

### 1. Sign Business Associate Agreement (BAA)

Required for HIPAA compliance:
- **Supabase**: Contact support for BAA (Pro plan or higher)
- **Twilio**: Sign BAA in account settings
- **Agora**: Contact enterprise sales for BAA
- **OpenAI**: Contact for BAA (may require enterprise)

### 2. Enable Audit Logging

```sql
-- Enable audit logging for all tables
CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create trigger for each sensitive table
-- See migration files for complete implementation
```

### 3. Data Encryption

Verify encryption:
- ✅ Database: Encrypted at rest (Supabase default)
- ✅ Storage: Encrypted at rest (Supabase default)
- ✅ Backups: Encrypted (Supabase default)
- ✅ Transit: TLS 1.3 (enforced)
- ✅ WebRTC: DTLS-SRTP (enabled)

### 4. Access Controls

```yaml
Minimum Requirements:
  - Role-based access control (RBAC): Enabled
  - Row-level security (RLS): Enabled on all tables
  - Two-factor authentication (2FA): Available for staff
  - Session timeout: 1 hour
  - Password requirements: Strong (min 12 chars, mixed case, numbers, symbols)
  - Account lockout: After 5 failed attempts
```

### 5. Data Retention

Configure data retention policies:

```sql
-- Delete old session recordings after 7 years (HIPAA requirement)
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'delete-old-recordings',
  '0 0 * * 0',  -- Weekly
  $$
  DELETE FROM session_recordings 
  WHERE created_at < NOW() - INTERVAL '7 years';
  $$
);
```

## Monitoring & Logging

### 1. Set Up Health Checks

```bash
# Health check endpoint
curl https://yourdomain.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-10-27T...",
  "services": {
    "database": "healthy",
    "storage": "healthy",
    "auth": "healthy"
  }
}
```

### 2. Configure Alerts

Set up alerts for:
- API response time > 2 seconds
- Error rate > 1%
- Database connections > 80%
- Storage usage > 80%
- Failed authentication attempts > 10/minute
- Edge function failures

### 3. Application Monitoring

Options:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **DataDog** for infrastructure monitoring
- **New Relic** for APM

### 4. Log Aggregation

Configure log forwarding:

```yaml
Sources:
  - Supabase logs
  - Edge function logs
  - Application logs
  - Nginx/proxy logs

Destinations:
  - CloudWatch / Stackdriver
  - Datadog
  - Elasticsearch
  - Splunk
```

## Post-Deployment Verification

### 1. Functional Testing

Test all critical flows:
- [ ] User registration and email confirmation
- [ ] User login (password and 2FA)
- [ ] Password reset flow
- [ ] Profile creation and editing
- [ ] Appointment booking
- [ ] Video session creation
- [ ] Video call connectivity (TURN servers working)
- [ ] Screen sharing
- [ ] Recording start/stop
- [ ] AI features (transcription, voice)
- [ ] File upload/download
- [ ] Real-time messaging
- [ ] Notifications (email/SMS)

### 2. Performance Testing

```bash
# Load testing with k6
k6 run tests/load/basic-flow.js

# Verify response times:
# - API endpoints: < 200ms
# - Page load: < 2 seconds
# - Video call connection: < 5 seconds
```

### 3. Security Testing

- [ ] Run vulnerability scan
- [ ] Verify SSL/TLS configuration
- [ ] Test CORS policies
- [ ] Verify authentication flows
- [ ] Test authorization (RBAC/RLS)
- [ ] Check for exposed secrets
- [ ] Verify rate limiting
- [ ] Test input validation

### 4. Backup Verification

```bash
# Test database restore
supabase db dump > test-backup.sql
# Restore to test environment
supabase db reset
supabase db push < test-backup.sql
```

### 5. Disaster Recovery Test

Document and test:
1. Database restoration procedure
2. Edge function redeployment
3. Frontend redeployment
4. DNS failover
5. Recovery Time Objective (RTO): < 4 hours
6. Recovery Point Objective (RPO): < 1 hour

## Ongoing Maintenance

### Daily
- Monitor error rates and logs
- Check health check status
- Review security alerts

### Weekly
- Review performance metrics
- Check disk/storage usage
- Review user feedback and issues
- Backup verification

### Monthly
- Security updates
- Dependency updates
- Performance optimization review
- Cost analysis
- Compliance audit

### Quarterly
- Full security audit
- Disaster recovery drill
- User access review
- Penetration testing
- Documentation update

## Rollback Procedures

If issues arise post-deployment:

### 1. Frontend Rollback

```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# Docker
docker stop mindboom-production
docker run -d [previous-image]
```

### 2. Database Rollback

```bash
# Restore from backup
supabase db reset
supabase db push < backup-previous.sql
```

### 3. Edge Functions Rollback

```bash
# Redeploy previous version
git checkout previous-tag
supabase functions deploy
```

## Support & Troubleshooting

For production issues:

1. Check logs: `supabase functions logs`
2. Review health endpoints
3. Check status pages:
   - https://status.supabase.com
   - https://status.twilio.com
   - https://status.agora.io
   - https://status.openai.com

For critical issues, contact:
- Supabase Support: support@supabase.io
- Internal escalation: critical@mindboom.com

## Conclusion

You've successfully deployed MindBoom 3.0 to production! Remember to:

- Keep all secrets secure and rotate regularly
- Monitor performance and errors continuously
- Maintain regular backups
- Stay compliant with HIPAA requirements
- Keep dependencies updated
- Document any customizations

For additional help, see:
- [Security Checklist](SECURITY_CHECKLIST.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Architecture Overview](ARCHITECTURE.md)

