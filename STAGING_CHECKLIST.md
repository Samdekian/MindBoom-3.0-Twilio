# Staging Deployment Checklist

Use this checklist to ensure all steps are completed for staging deployment.

## Pre-Deployment

### Environment Setup
- [ ] Staging Supabase project created
- [ ] Staging domain configured (e.g., staging.mindbloom.app)
- [ ] SSL certificate configured and valid
- [ ] Git staging branch created and synced with main
- [ ] `.env.staging` file created with correct values

### Twilio Configuration
- [ ] Twilio staging/development account created
- [ ] Twilio API Key generated for staging
- [ ] Credentials documented securely:
  - [ ] TWILIO_ACCOUNT_SID
  - [ ] TWILIO_AUTH_TOKEN
  - [ ] TWILIO_API_KEY_SID
  - [ ] TWILIO_API_KEY_SECRET

### Supabase Configuration
- [ ] All Twilio secrets added to Supabase Edge Functions → Secrets
- [ ] OPENAI_API_KEY added (if using AI features)
- [ ] Database connection string obtained
- [ ] Service role key secured

## Deployment

### Code Preparation
- [ ] All changes committed to staging branch
- [ ] Dependencies installed: `npm install --legacy-peer-deps`
- [ ] TypeScript compilation successful: `npm run type-check`
- [ ] Linting passed: `npm run lint`
- [ ] Local tests passed: `npm test`

### Database
- [ ] Backup created: `./scripts/deploy-staging.sh` (auto-creates backup)
- [ ] Migrations applied: `supabase db push`
- [ ] Tables verified: `breakout_rooms`, `breakout_room_participants`, `breakout_room_transitions`
- [ ] RLS policies active
- [ ] Triggers configured
- [ ] Indexes created

### Edge Functions
- [ ] Linked to staging project: `supabase link --project-ref [ref]`
- [ ] Deployed twilio-video-token
- [ ] Deployed create-breakout-room
- [ ] Deployed close-breakout-room
- [ ] Deployed move-participant
- [ ] Deployed bulk-assign-participants
- [ ] All functions returning appropriate responses (test with curl or `./scripts/test-edge-functions.sh`)

### Application Build & Deploy
- [ ] Built with staging config: `npm run build`
- [ ] Build artifacts verified in `dist/`
- [ ] Deployed to hosting platform:
  - [ ] Vercel / Netlify / Other: _____________
- [ ] Environment variables set in hosting platform
- [ ] Application accessible at staging URL

## Validation

### Automated Tests
- [ ] Run validation script: `./scripts/validate-staging.sh`
- [ ] All automated tests passed
- [ ] No critical errors in validation report

### Manual Testing

#### Authentication
- [ ] Create test therapist account
- [ ] Create test patient accounts (5+)
- [ ] Login with therapist account
- [ ] Login with patient account
- [ ] Roles correctly assigned
- [ ] 2FA working (if enabled)

#### Basic Session
- [ ] Therapist can create instant session
- [ ] Session link generated and shareable
- [ ] Patient can join via link
- [ ] Video working for both participants
- [ ] Audio working for both participants
- [ ] Video/audio controls functional
- [ ] Network quality indicator visible

#### Breakout Rooms - Automatic Assignment
- [ ] Therapist can access breakout room controls
- [ ] Create 2-3 rooms with automatic assignment
- [ ] Participants distributed evenly
- [ ] All participants can connect to their assigned rooms
- [ ] Video/audio working in breakout rooms
- [ ] Therapist can view all rooms
- [ ] Participant counts accurate
- [ ] Close all rooms successfully
- [ ] All participants return to main session

#### Breakout Rooms - Manual Assignment
- [ ] Create rooms with manual assignment
- [ ] Rooms created without participants
- [ ] Therapist can see unassigned participants
- [ ] Move participant to Room 1
- [ ] Participant connects successfully
- [ ] Move participant from Room 1 to Room 2
- [ ] Transition is smooth
- [ ] No connection drops during move
- [ ] History recorded in database

#### Edge Cases
- [ ] Try to create room with 1 participant (should fail)
- [ ] Try to add participant to full room (should fail)
- [ ] Disconnect internet and reconnect (should auto-reconnect)
- [ ] Close browser and rejoin (should work)
- [ ] Multiple tabs same user (should handle gracefully)

### Performance Testing
- [ ] Load test with 10 participants
- [ ] Load test with 20 participants
- [ ] Token generation < 500ms
- [ ] Room creation < 2s
- [ ] Participant move < 1s
- [ ] Real-time updates < 200ms
- [ ] No memory leaks after 30 minutes
- [ ] CPU usage acceptable

### Security Testing
- [ ] Edge functions require authentication
- [ ] Invalid tokens rejected (401)
- [ ] Expired tokens rejected (401)
- [ ] Patients cannot create breakout rooms (403)
- [ ] Patients cannot move participants (403)
- [ ] RLS prevents unauthorized data access
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Monitoring Setup

### Supabase
- [ ] Edge function logs accessible
- [ ] Database performance dashboard reviewed
- [ ] Alerts configured:
  - [ ] Database CPU > 80%
  - [ ] Edge function errors > 5%
  - [ ] API response time > 2s

### Twilio
- [ ] Console access confirmed
- [ ] Usage dashboard reviewed
- [ ] Alerts configured:
  - [ ] Room creation failures
  - [ ] Token generation errors
  - [ ] Usage approaching limits

### Application
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Performance monitoring active
- [ ] User analytics tracking (optional)

## Cost Validation

- [ ] Twilio usage monitored
- [ ] Current spending tracked
- [ ] Cost per session calculated
- [ ] Monthly projection within budget
- [ ] Billing alerts configured

## Documentation

- [ ] Deployment report generated
- [ ] Validation report saved
- [ ] Issues documented
- [ ] Known limitations listed
- [ ] QA team notified

## Sign-off

### Technical Review
- [ ] Tech Lead approved: _________________ Date: _______
- [ ] Backend Dev reviewed: _________________ Date: _______
- [ ] Frontend Dev reviewed: _________________ Date: _______

### Quality Assurance
- [ ] QA Lead approved: _________________ Date: _______
- [ ] All test cases passed
- [ ] No critical bugs
- [ ] Performance acceptable

### Business Approval
- [ ] Product Owner approved: _________________ Date: _______
- [ ] Stakeholders notified
- [ ] Go/No-go decision: [ ] GO  [ ] NO-GO

## Post-Deployment

### Immediate (24 hours)
- [ ] Monitor error rates
- [ ] Check Twilio usage
- [ ] Review user feedback
- [ ] Address critical issues

### Week 1
- [ ] Collect QA feedback
- [ ] Fix identified bugs
- [ ] Performance optimization
- [ ] Prepare for production

## Rollback Plan

### If Issues Occur
- [ ] Rollback procedure documented
- [ ] Backup location known: _________________
- [ ] Team notified of rollback
- [ ] Rollback executed: `./scripts/rollback-staging.sh`
- [ ] Verification post-rollback

## Production Readiness

- [ ] All tests passed
- [ ] Zero critical bugs
- [ ] Performance acceptable
- [ ] Security validated
- [ ] Documentation complete
- [ ] Team trained
- [ ] Production plan ready

---

**Deployment Date**: _________________
**Completed By**: _________________
**Status**: [ ] IN PROGRESS  [ ] COMPLETE  [ ] FAILED
**Next Action**: _________________

