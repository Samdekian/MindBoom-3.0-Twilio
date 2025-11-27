# Twilio Video Setup Guide

This guide covers the setup process for Twilio Video integration with breakout rooms functionality.

## Prerequisites

- Twilio Account (sign up at [twilio.com](https://www.twilio.com))
- Supabase Project
- Node.js 18+ installed

## 1. Twilio Account Setup

### Create Twilio Account

1. Visit [console.twilio.com](https://console.twilio.com) and create an account
2. Complete account verification

### Get Account Credentials

From your Twilio Console dashboard:

1. **Account SID**: Found on the dashboard home page
2. **Auth Token**: Click "Show" to reveal (keep this secure!)

### Create API Key for Video

1. Navigate to **Account > API Keys & Tokens**
2. Click **Create API Key**
3. Set the following:
   - **Friendly Name**: MindBloom Video Production
   - **Key Type**: Standard
4. Click **Create API Key**
5. **IMPORTANT**: Copy the **SID** and **Secret** immediately (the secret won't be shown again)

## 2. Supabase Configuration

### Add Secrets to Supabase

Go to your Supabase Dashboard > **Settings** > **Edge Functions** > **Secrets**

Add the following secrets:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=your_api_key_secret_here
```

### Deploy Edge Functions

Deploy the Twilio Video edge functions:

```bash
# Deploy token generation function
supabase functions deploy twilio-video-token

# Deploy breakout room management functions
supabase functions deploy create-breakout-room
supabase functions deploy close-breakout-room
supabase functions deploy move-participant
supabase functions deploy bulk-assign-participants
```

### Run Database Migrations

Apply the breakout rooms migration:

```bash
supabase db push
```

This will create the following tables:
- `breakout_rooms`
- `breakout_room_participants`
- `breakout_room_transitions`

## 3. Application Configuration

### Environment Variables

Update your `.env` file (copy from `env.example`):

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_ENV=development
VITE_APP_URL=http://localhost:5173
```

### Install Dependencies

```bash
npm install
# or
bun install
```

This will install the `twilio-video` SDK (v2.28.1).

## 4. Twilio Video Room Configuration

### Room Types

Twilio Video supports different room types:

- **Peer-to-Peer (P2P)**: 2 participants, direct connection
- **Group**: Up to 50 participants, managed by Twilio's SFU

For breakout rooms, we use **Group** rooms.

### Default Configuration

Our default configuration (`src/lib/twilio/config.ts`):

```typescript
{
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 24, max: 30 }
  },
  bandwidthProfile: {
    video: {
      mode: 'collaboration',
      maxTracks: 10,
      dominantSpeakerPriority: 'standard'
    }
  },
  maxAudioBitrate: 16000, // 16 kbps
  preferredVideoCodecs: ['VP8', 'H264'],
  networkQuality: {
    local: 1,
    remote: 2
  }
}
```

### Bandwidth Modes

- **collaboration**: Optimizes for equal quality across all participants
- **presentation**: Prioritizes screen sharing quality
- **grid**: Optimizes for grid view with many participants

## 5. Testing

### Development Testing

1. Start the development server:
```bash
npm run dev
```

2. Open multiple browser tabs/windows to simulate multiple participants

3. Test breakout room creation:
   - Login as a therapist
   - Create an instant session
   - Click "Create Breakout Rooms"
   - Configure and create rooms
   - Test moving participants between rooms

### Test Checklist

- [ ] Token generation works
- [ ] Can connect to main session room
- [ ] Can create breakout rooms
- [ ] Can move participants between rooms
- [ ] Auto-assignment distributes participants correctly
- [ ] Manual assignment works
- [ ] Room closing works
- [ ] Participants receive proper notifications
- [ ] Video/audio quality is acceptable
- [ ] Network quality indicators work

## 6. Production Deployment

### Pre-Deployment Checklist

- [ ] All Twilio credentials are set in Supabase production environment
- [ ] Edge functions are deployed to production
- [ ] Database migrations are applied
- [ ] SSL/HTTPS is enabled
- [ ] CORS settings are configured in Supabase
- [ ] Rate limiting is configured
- [ ] Error tracking is set up (e.g., Sentry)

### Monitoring

Monitor these metrics in production:

1. **Twilio Console > Monitor > Logs**
   - Room connection failures
   - Participant counts
   - Duration
   - Quality metrics

2. **Supabase Dashboard > Logs**
   - Edge function invocations
   - Errors
   - Performance

3. **Application Analytics**
   - Session creation rate
   - Breakout room usage
   - Average session duration
   - Connection quality distribution

## 7. Cost Considerations

### Twilio Video Pricing (as of 2025)

- **Group Rooms**: ~$0.0015 per participant-minute
- **Recording**: ~$0.004 per composition-minute
- **Network Traversal (TURN)**: Included

### Cost Optimization Tips

1. **Limit Room Duration**: Set maximum session durations
2. **Quality Settings**: Use adaptive quality based on network
3. **Participant Limits**: Enforce maximum participants per room
4. **Auto-Close Empty Rooms**: Implemented in our system
5. **Monitor Usage**: Set up billing alerts in Twilio console

### Example Cost Calculation

A 60-minute group therapy session with 10 participants:
- Cost: 10 participants × 60 minutes × $0.0015 = **$0.90**

5 breakout rooms (2 participants each) for 20 minutes:
- Cost: 10 participants × 20 minutes × $0.0015 = **$0.30**

**Total**: $1.20 per session

## 8. Troubleshooting

### Common Issues

#### Token Expired Error

**Symptom**: "Access token expired" error
**Solution**: Tokens expire after 1 hour. The system auto-refreshes tokens 5 minutes before expiry.

#### Cannot Connect to Room

**Symptoms**:
- "Failed to connect" error
- Timeout errors

**Solutions**:
1. Check network connectivity
2. Verify TURN credentials are correct
3. Check firewall settings (ports 443, 3478)
4. Verify Twilio credentials in Supabase

#### Video/Audio Not Working

**Symptoms**:
- Black video
- No audio
- Permissions denied

**Solutions**:
1. Check browser permissions
2. Verify SSL/HTTPS (required for media access)
3. Test with different browsers
4. Check if microphone/camera are being used by other apps

#### Breakout Rooms Not Creating

**Symptoms**:
- Error when creating rooms
- Rooms created but participants can't join

**Solutions**:
1. Check Supabase edge function logs
2. Verify database permissions
3. Ensure participant count is sufficient (≥ 2)
4. Check Twilio account status (suspended, trial limits)

### Debug Mode

Enable debug logging:

```bash
# .env
VITE_ENABLE_DEBUG_LOGS=true
```

This will output detailed logs to the browser console.

## 9. Security Best Practices

1. **Never expose secrets** in client-side code
2. **Use JWT authentication** for all Twilio Video tokens
3. **Validate user roles** before allowing room creation
4. **Rate limit** token generation endpoints
5. **Audit logging** for all breakout room operations
6. **Set token expiry** to 1 hour maximum
7. **Use HTTPS only** in production
8. **Implement CSP headers** to prevent XSS
9. **Regular security audits** of access patterns

## 10. Support

### Resources

- [Twilio Video Documentation](https://www.twilio.com/docs/video)
- [Twilio Video SDK JavaScript](https://www.twilio.com/docs/video/javascript)
- [Twilio Support](https://support.twilio.com)

### Internal Support

- Check `#video-support` Slack channel
- Review `session_analytics_events` table for error patterns
- Contact DevOps for infrastructure issues

### Useful Commands

```bash
# Check Supabase function logs
supabase functions logs twilio-video-token --follow

# Test edge function locally
supabase functions serve twilio-video-token

# Check database connections
psql $DATABASE_URL -c "SELECT * FROM breakout_rooms WHERE is_active = true;"
```

## Next Steps

- Review [BREAKOUT_ROOMS_GUIDE.md](./BREAKOUT_ROOMS_GUIDE.md) for usage instructions
- Set up monitoring and alerts
- Configure backup/disaster recovery
- Plan for scaling (if needed)

