# Agora.io Production Setup Guide

This guide covers setting up Agora.io for production use in your video therapy platform.

## 1. Agora Account Setup

### Create Agora Account
1. Visit [console.agora.io](https://console.agora.io) and create an account
2. Create a new project for your video therapy platform
3. Enable the following services:
   - Real-time Communication (RTC)
   - Cloud Recording
   - Real-time Messaging (RTM) - optional

### Get Credentials
From your Agora project dashboard, collect:
- **App ID**: Your unique application identifier
- **App Certificate**: Used for token generation (keep secure)

## 2. Environment Configuration

### Supabase Secrets
Add the following secrets in your Supabase dashboard under Settings > Functions:

```bash
AGORA_APP_ID=your_agora_app_id_here
AGORA_APP_CERTIFICATE=your_agora_app_certificate_here
```

### Update Configuration
In `src/lib/agora/config.ts`, replace the mock App ID:

```typescript
const AGORA_CONFIG = {
  APP_ID: ENVIRONMENT.isDevelopment() 
    ? '6f8b4bcdf5b04b1b9b3c7a8f2e9d5c6a' // Development mock
    : 'your_actual_agora_app_id', // Replace with real App ID
  // ...
};
```

## 3. Token Security

### Token Generation
The system automatically generates secure tokens via the `/agora-token` edge function:

- **Development**: Uses mock tokens for testing
- **Production**: Generates real tokens using your App Certificate
- **Auto-refresh**: Tokens refresh 5 minutes before expiry

### Security Features
- User authentication required for token generation
- Audit logging of all token requests
- Automatic token expiration (1 hour default)
- Role-based access (publisher/subscriber)

## 4. Recording Setup

### Cloud Recording Configuration
Update `RECORDING_CONFIG` in the config file:

```typescript
export const RECORDING_CONFIG = {
  storageConfig: {
    vendor: 1, // Agora Cloud Storage
    region: 0, // Auto region
    bucket: 'your-recording-bucket',
    accessKey: 'your-storage-access-key',
    secretKey: 'your-storage-secret-key',
    fileNamePrefix: ['therapy', 'sessions']
  }
};
```

### Recording Features
- Automatic recording start/stop
- High-quality audio/video recording
- Secure cloud storage
- Session metadata tracking

## 5. Quality & Performance

### Video Profiles
The system automatically adjusts video quality based on connection:

- **Excellent**: 1280x720, 30fps, 1000kbps
- **Good**: 640x480, 30fps, 500kbps
- **Poor**: 320x240, 15fps, 200kbps

### Audio Profiles
- **Speech**: 32kbps, optimized for voice
- **Music**: 128kbps, stereo, high quality
- **High Quality**: 192kbps, stereo, professional

### Network Optimization
- Dual stream enabled for bandwidth adaptation
- Deep learning noise suppression
- Automatic bitrate adjustment
- Connection quality monitoring

## 6. Monitoring & Analytics

### Built-in Monitoring
The system tracks:
- Token generation events
- Connection quality metrics
- Session duration and participants
- Error rates and types

### Agora Analytics
Access detailed analytics in your Agora console:
- Real-time usage statistics
- Quality metrics
- Geographic distribution
- Cost analysis

## 7. Production Checklist

### Security
- [ ] Replace mock App ID with real credentials
- [ ] Configure App Certificate in Supabase secrets
- [ ] Enable token-based authentication
- [ ] Set up proper CORS policies
- [ ] Configure recording storage security

### Performance
- [ ] Test with expected user load
- [ ] Configure CDN for optimal routing
- [ ] Set up monitoring and alerts
- [ ] Optimize video/audio profiles
- [ ] Test network adaptation

### Compliance
- [ ] Review data residency requirements
- [ ] Configure recording retention policies
- [ ] Set up audit logging
- [ ] Review privacy compliance (HIPAA, GDPR)
- [ ] Document security measures

## 8. Testing in Production

### Gradual Rollout
1. Start with beta users
2. Monitor performance metrics
3. Gradually increase capacity
4. Full production deployment

### Key Metrics to Monitor
- Token generation success rate
- Average connection time
- Session quality scores
- Recording success rate
- User satisfaction scores

## 9. Troubleshooting

### Common Issues

**Token Generation Fails**
- Check App Certificate in Supabase secrets
- Verify user authentication
- Check network connectivity

**Poor Video Quality**
- Monitor network conditions
- Adjust video profiles
- Check bandwidth limitations

**Recording Issues**
- Verify storage configuration
- Check recording permissions
- Monitor storage capacity

### Support Resources
- [Agora Documentation](https://docs.agora.io)
- [Agora Community](https://community.agora.io)
- [Support Tickets](https://console.agora.io/support)

## 10. Cost Optimization

### Usage Monitoring
- Track monthly usage in Agora console
- Set up billing alerts
- Monitor cost per session

### Optimization Tips
- Use appropriate video profiles
- Implement session timeouts
- Monitor recording usage
- Consider regional deployment

---

For technical support or questions about this setup, refer to the Agora documentation or contact their support team.