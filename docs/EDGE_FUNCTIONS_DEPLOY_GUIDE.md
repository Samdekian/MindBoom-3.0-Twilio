# MindBoom Spark - Edge Functions Deployment Guide

Complete guide for deploying and managing Supabase Edge Functions in staging.

## Overview

**Supabase Project**: `aoumioacfvttagverbna` (Staging)  
**Functions Location**: `supabase/functions/`  
**Runtime**: Deno

## Available Edge Functions

### Critical Functions (Required)

| Function Name | Purpose | Requires Auth |
|--------------|---------|---------------|
| `openai-realtime` | AI voice integration | No (WebSocket) |
| `get-turn-credentials` | Twilio TURN servers | No |
| `system-health` | Health monitoring | No |
| `session-analytics` | Session metrics | Yes |
| `production-monitor` | System monitoring | No |
| `production-cleanup` | Cleanup tasks | No |

### Twilio Video Functions

| Function Name | Purpose | Requires Auth |
|--------------|---------|---------------|
| `twilio-video-token` | Generate video tokens | Yes |
| `create-breakout-room` | Create breakout rooms | Yes |
| `close-breakout-room` | Close breakout rooms | Yes |
| `move-participant` | Move participants | Yes |
| `bulk-assign-participants` | Bulk assignments | Yes |

### Calendar & Integration Functions

| Function Name | Purpose | Requires Auth |
|--------------|---------|---------------|
| `google-calendar-events` | Google Calendar sync | Yes |
| `calendly-oauth` | Calendly integration | Yes |
| `send-appointment-reminders` | Email/SMS reminders | Yes |

## Deployment Process

### Step 1: Link to Staging Project

```bash
# Link to staging Supabase project
supabase link --project-ref aoumioacfvttagverbna

# Verify link
supabase status
```

### Step 2: Review Functions Before Deploy

```bash
# List all functions
ls -la supabase/functions/

# Check a specific function
cat supabase/functions/get-turn-credentials/index.ts
```

### Step 3: Deploy All Functions

```bash
# Deploy all functions at once
supabase functions deploy

# This will deploy all functions in supabase/functions/
```

Expected output:
```
Deploying openai-realtime (project ref: aoumioacfvttagverbna)
Deploying get-turn-credentials (project ref: aoumioacfvttagverbna)
...
✓ All functions deployed successfully
```

### Step 4: Deploy Individual Functions

```bash
# Deploy specific function
supabase functions deploy openai-realtime

# Deploy with specific configuration
supabase functions deploy get-turn-credentials --no-verify-jwt

# Deploy and follow logs
supabase functions deploy session-analytics && supabase functions logs session-analytics --tail
```

## Testing Edge Functions

### Test via CLI

```bash
# Test system-health
supabase functions invoke system-health

# Test with body
supabase functions invoke session-analytics \
  --body '{"sessionId": "test-123"}'

# Test with headers
supabase functions invoke get-turn-credentials \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Test via cURL

```bash
# Set variables
SUPABASE_URL="https://aoumioacfvttagverbna.supabase.co"
ANON_KEY="your-anon-key-here"

# Test system health
curl "$SUPABASE_URL/functions/v1/system-health" \
  -H "Authorization: Bearer $ANON_KEY"

# Test TURN credentials
curl -X POST "$SUPABASE_URL/functions/v1/get-turn-credentials" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json"

# Test OpenAI realtime (WebSocket - requires WebSocket client)
# ws://aoumioacfvttagverbna.supabase.co/functions/v1/openai-realtime
```

### Test in Application

1. Open staging application
2. Try to start a video session
3. Check browser console for:
   - TURN credentials fetched
   - No edge function errors
4. Try AI features
5. Check session analytics

## Function Configuration

### JWT Verification

Most functions should require JWT verification (user must be authenticated).

To disable JWT verification (for webhooks):

```toml
# In supabase/config.toml
[functions.webhook-handler]
verify_jwt = false
```

### CORS Configuration

CORS is handled in functions using:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

For production, restrict CORS to your domain:
```typescript
'Access-Control-Allow-Origin': 'https://staging.mindboom.app',
```

### Function Limits

- **Timeout**: 30 seconds (default)
- **Memory**: 256 MB (default)
- **Request size**: 10 MB max
- **Response size**: 10 MB max

## Monitoring & Logs

### View Logs

```bash
# All functions
supabase functions logs

# Specific function
supabase functions logs openai-realtime

# Follow mode (real-time)
supabase functions logs --tail

# Filter by level
supabase functions logs --level error

# Time range
supabase functions logs --since 1h
```

### Via Dashboard

1. Go to: https://supabase.com/dashboard/project/aoumioacfvttagverbna
2. Navigate to: **Edge Functions → Logs**
3. Select function from dropdown
4. View real-time logs

### Common Log Patterns

**Success**:
```
✅ [get-turn-credentials] Received TURN credentials from Twilio
```

**Error**:
```
❌ [get-turn-credentials] Missing Twilio credentials
```

**Warning**:
```
⚠️ [get-turn-credentials] Failed to get TURN credentials, falling back to STUN-only
```

## Troubleshooting

### Function Returns 500 Error

**Cause**: Usually missing secrets or code error

**Fix**:
1. Check logs: `supabase functions logs function-name`
2. Verify secrets: `supabase secrets list`
3. Check for typos in secret names
4. Redeploy: `supabase functions deploy function-name`

### Function Times Out

**Cause**: Function takes too long (>30s)

**Fix**:
1. Optimize function code
2. Use async operations
3. Break into smaller functions
4. Consider using background jobs

### Function Not Found (404)

**Cause**: Function not deployed or wrong URL

**Fix**:
1. Verify deployment: `supabase functions list`
2. Check URL format:
   ```
   https://aoumioacfvttagverbna.supabase.co/functions/v1/function-name
   ```
3. Redeploy: `supabase functions deploy function-name`

### CORS Errors

**Cause**: Origin not allowed

**Fix**:
1. Check CORS headers in function code
2. Update to include staging URL
3. Redeploy function

### "Unauthorized" Errors

**Cause**: Missing or invalid JWT

**Fix**:
1. Check if function requires JWT (verify_jwt = true)
2. Pass valid auth token:
   ```bash
   -H "Authorization: Bearer YOUR_ANON_KEY"
   ```
3. Or disable JWT for public endpoints

## Deployment Checklist

Before marking edge functions as complete:

- [ ] All functions deployed successfully
- [ ] All required secrets configured
- [ ] Secrets verified in Supabase dashboard
- [ ] Each critical function tested manually
- [ ] Logs show no errors
- [ ] Functions respond within timeout
- [ ] CORS configured correctly
- [ ] JWT verification appropriate for each function
- [ ] Error handling tested
- [ ] Rate limiting considered

## Production Deployment

When deploying to production:

1. **Create production Supabase project**
2. **Set production secrets** (different from staging!)
3. **Deploy functions to production**
4. **Test thoroughly**
5. **Monitor closely for first 24 hours**

## Quick Reference Commands

```bash
# Setup
supabase link --project-ref aoumioacfvttagverbna

# Deploy
supabase functions deploy                    # All functions
supabase functions deploy function-name      # Specific function

# Test
supabase functions invoke function-name
supabase functions invoke function-name --body '{"key":"value"}'

# Monitor
supabase functions logs                      # All logs
supabase functions logs function-name        # Specific function
supabase functions logs --tail               # Follow mode

# Secrets
supabase secrets set NAME="value"
supabase secrets list
supabase secrets unset NAME

# List
supabase functions list
```

## Support

For edge function issues:
- Logs: `supabase functions logs function-name`
- Supabase Docs: https://supabase.com/docs/guides/functions
- Deno Docs: https://deno.land/manual
- Support: support@mindboom.com

---

**Last Updated**: 2025-10-27  
**Environment**: Staging

