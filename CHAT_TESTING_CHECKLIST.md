# AI Chat Testing Checklist

## Pre-Deployment Checks

### Environment Setup
- [ ] Database migration applied (`supabase db push`)
- [ ] Edge function deployed (`supabase functions deploy chat-completion`)
- [ ] `OPENAI_API_KEY` configured in Supabase secrets
- [ ] `VITE_SUPABASE_URL` set in `.env`
- [ ] `VITE_SUPABASE_ANON_KEY` set in `.env`

## Functional Testing

### Anonymous User Flow
- [ ] Navigate to `/chat` without login
- [ ] See welcome screen with 4 suggested prompts
- [ ] Token counter shows "50 messages left"
- [ ] Click a suggested prompt - message sends
- [ ] AI responds with streaming text
- [ ] Token counter decreases to "49 messages left"
- [ ] Type a custom message and send
- [ ] AI responds appropriately
- [ ] Token counter continues to decrease
- [ ] Send messages until 0 tokens remain
- [ ] Modal appears with "Unlock Unlimited Conversations"
- [ ] Modal shows benefits list
- [ ] "Create Free Account" button visible
- [ ] "Sign In" button visible
- [ ] Click "Create Free Account" - redirects to `/register`
- [ ] After signup, return to `/chat`
- [ ] Token counter shows "Unlimited"
- [ ] Can send messages without limit

### Authenticated User Flow
- [ ] Login to existing account
- [ ] Navigate to `/chat`
- [ ] Token counter shows "Unlimited"
- [ ] Send multiple messages
- [ ] All messages work without token limits
- [ ] Logout and return to `/chat`
- [ ] Token counter shows remaining free tokens

### Message Functionality
- [ ] User messages appear on right (purple bubble)
- [ ] AI messages appear on left (gray bubble)
- [ ] Typing indicator appears while AI is responding
- [ ] Messages auto-scroll to bottom
- [ ] Long messages wrap properly
- [ ] Markdown formatting works in AI responses
- [ ] Code blocks render correctly
- [ ] Lists (bullet/numbered) render correctly
- [ ] Bold and italic text works

### Input Functionality
- [ ] Textarea auto-resizes as you type
- [ ] Enter key sends message
- [ ] Shift+Enter creates new line
- [ ] Send button disabled when empty
- [ ] Send button enabled when text entered
- [ ] Character count appears when typing
- [ ] Input disabled when no tokens remain
- [ ] Placeholder changes when disabled

### Navigation
- [ ] "AI Chat" link appears in navbar
- [ ] Link highlights when on `/chat` page
- [ ] Hero CTA button links to `/chat`
- [ ] Login button in chat header works
- [ ] Logo in chat header is visible

## UI/UX Testing

### Visual Design
- [ ] Gradient background animates smoothly
- [ ] Message bubbles have proper spacing
- [ ] Token counter has appropriate colors:
  - [ ] Green when > 30 tokens
  - [ ] Yellow when 10-30 tokens
  - [ ] Red when < 10 tokens
- [ ] Token counter pulses when low
- [ ] Modal has smooth entrance animation
- [ ] Hover effects work on suggested prompts
- [ ] Input has focus glow effect
- [ ] Icons render correctly (Bot, User, Sparkles)

### Animations
- [ ] Messages fade in smoothly
- [ ] Typing indicator dots animate
- [ ] Gradient background shifts subtly
- [ ] Token counter pulses at low count
- [ ] Modal fades in/out smoothly
- [ ] Hover lift effect on prompts
- [ ] No jank or stuttering

### Responsive Design
- [ ] Mobile (< 768px):
  - [ ] Layout stacks vertically
  - [ ] Message bubbles sized appropriately
  - [ ] Input is touch-friendly
  - [ ] Token counter visible but compact
  - [ ] Modal fits screen
  - [ ] Suggested prompts stack
- [ ] Tablet (768px - 1024px):
  - [ ] Layout balanced
  - [ ] Message bubbles sized well
  - [ ] All elements accessible
- [ ] Desktop (> 1024px):
  - [ ] Max-width containers centered
  - [ ] Ample whitespace
  - [ ] All features visible

## Error Handling

### Network Errors
- [ ] Disconnect internet during message send
- [ ] Error message appears
- [ ] Can retry after reconnecting
- [ ] UI doesn't break

### API Errors
- [ ] Invalid OpenAI key - shows error
- [ ] Rate limit exceeded - shows error
- [ ] Timeout - shows error and allows retry

### Edge Cases
- [ ] Send empty message - button disabled
- [ ] Send very long message (>2000 chars) - handled
- [ ] Rapid message sending - queued properly
- [ ] Close browser mid-response - state preserved
- [ ] Multiple tabs open - tokens sync

## Performance Testing

### Load Times
- [ ] Initial page load < 2 seconds
- [ ] First message response < 3 seconds
- [ ] Subsequent messages < 2 seconds
- [ ] Smooth scrolling with 50+ messages

### Memory
- [ ] No memory leaks after extended use
- [ ] Browser doesn't slow down
- [ ] Animations remain smooth

## Security Testing

### Data Privacy
- [ ] Anonymous tokens only in localStorage
- [ ] No sensitive data in URL
- [ ] API keys not exposed in client
- [ ] RLS policies enforced on `chat_usage` table

### Authentication
- [ ] Can't access other users' chat history
- [ ] Token tracking isolated per user
- [ ] Edge function validates requests

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter sends message
- [ ] Escape closes modal
- [ ] Focus indicators visible

### Screen Readers
- [ ] ARIA labels present
- [ ] Messages announced properly
- [ ] Button purposes clear
- [ ] Form inputs labeled

### Color Contrast
- [ ] Text readable on all backgrounds
- [ ] Meets WCAG AA standards
- [ ] Color-blind friendly

## Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Firefox Mobile
- [ ] Samsung Internet

## Integration Testing

### With Existing App
- [ ] Navbar integration works
- [ ] Auth system integration works
- [ ] Theme system respected
- [ ] No conflicts with existing routes
- [ ] No CSS conflicts

### Database
- [ ] `chat_usage` table created
- [ ] Indexes working
- [ ] RLS policies active
- [ ] Data persists correctly

### Edge Function
- [ ] Deploys successfully
- [ ] Logs accessible
- [ ] Error handling works
- [ ] Streaming works

## Conversion Testing

### Modal Effectiveness
- [ ] Modal appears at right time
- [ ] Copy is compelling
- [ ] CTAs are clear
- [ ] Benefits are visible
- [ ] Close button works

### User Journey
- [ ] Anonymous → Modal → Signup → Return works
- [ ] Token reset after signup
- [ ] Seamless experience

## Monitoring & Analytics

### Metrics to Track
- [ ] Anonymous user message count
- [ ] Modal appearance rate
- [ ] Modal → Signup conversion rate
- [ ] Average messages before signup
- [ ] Authenticated user message count
- [ ] Error rates
- [ ] Response times

### Logging
- [ ] Edge function logs accessible
- [ ] Client errors logged
- [ ] Token consumption tracked
- [ ] User actions tracked (optional)

## Production Readiness

### Final Checks
- [ ] All tests passing
- [ ] No console errors
- [ ] No console warnings
- [ ] Documentation complete
- [ ] Environment variables documented
- [ ] Deployment steps documented
- [ ] Rollback plan in place

### Performance
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing
- [ ] No render-blocking resources
- [ ] Images optimized

### Security
- [ ] API keys secure
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting considered

## Post-Deployment

### Monitoring
- [ ] Set up error tracking
- [ ] Monitor OpenAI costs
- [ ] Track conversion rates
- [ ] Monitor performance metrics

### User Feedback
- [ ] Collect user feedback
- [ ] Track support tickets
- [ ] Monitor usage patterns
- [ ] Iterate based on data

---

## Test Results

**Date**: ___________
**Tester**: ___________
**Environment**: ___________

**Overall Status**: ⬜ Pass | ⬜ Fail | ⬜ Needs Review

**Notes**:
_______________________________________
_______________________________________
_______________________________________

**Issues Found**:
1. _______________________________________
2. _______________________________________
3. _______________________________________

**Sign-off**: ___________

