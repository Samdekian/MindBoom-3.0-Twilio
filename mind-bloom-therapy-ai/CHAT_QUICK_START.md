# AI Chat - Quick Start Guide

## 🚀 Getting Started

### 1. Deploy Database Migration
```bash
cd mind-bloom-therapy-ai
supabase db push
```

This creates the `chat_usage` table for tracking token usage.

### 2. Deploy Edge Function
```bash
supabase functions deploy chat-completion
```

This deploys the OpenAI integration function.

### 3. Verify Environment Variables
Ensure these are set in your Supabase project:
- `OPENAI_API_KEY` - Your OpenAI API key

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access the Chat
Navigate to: `http://localhost:8080/chat`

## 📋 Features Overview

### For Anonymous Users
- **50 Free Messages**: Start chatting immediately
- **Token Counter**: Visual indicator of remaining messages
- **Suggested Prompts**: Quick-start conversation starters
- **Conversion Modal**: Appears when tokens are exhausted

### For Authenticated Users
- **Unlimited Messages**: No token limits
- **Token Tracking**: Usage tracked in database
- **Persistent Experience**: Same interface, no limits

## 🎨 User Flow

1. **Landing** → User visits `/chat`
2. **Welcome Screen** → Shows 4 suggested prompts
3. **Start Chatting** → Type message or click prompt
4. **AI Response** → Streaming response with markdown
5. **Token Decrease** → Counter updates after each message
6. **Token Exhausted** → Modal appears with signup CTAs
7. **Sign Up/Login** → Redirects to auth page
8. **Return to Chat** → Unlimited messages unlocked

## 🔧 Customization

### Adjust Free Token Limit
Edit `src/utils/token-manager.ts`:
```typescript
export const FREE_TOKEN_LIMIT = 50; // Change this number
```

### Modify AI System Prompt
Edit `supabase/functions/chat-completion/index.ts`:
```typescript
const systemMessage: ChatMessage = {
  role: 'system',
  content: 'Your custom prompt here...'
};
```

### Change AI Model
Edit `supabase/functions/chat-completion/index.ts`:
```typescript
model: 'gpt-4o-mini', // or 'gpt-4', 'gpt-3.5-turbo', etc.
```

### Update Suggested Prompts
Edit `src/components/chat/ChatInterface.tsx`:
```typescript
const SUGGESTED_PROMPTS = [
  "Your prompt 1",
  "Your prompt 2",
  "Your prompt 3",
  "Your prompt 4"
];
```

## 🎯 Key Components

| Component | Purpose |
|-----------|---------|
| `ChatPage.tsx` | Main page container |
| `ChatInterface.tsx` | Message list and empty state |
| `ChatInput.tsx` | Message input with auto-resize |
| `MessageBubble.tsx` | Individual message display |
| `TokenCounter.tsx` | Token counter badge |
| `TokenExhaustedModal.tsx` | Signup conversion modal |
| `useChat.ts` | Chat state management hook |
| `token-manager.ts` | Token tracking system |

## 🐛 Troubleshooting

### Chat not loading?
- Check Supabase connection in browser console
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`

### AI not responding?
- Check `OPENAI_API_KEY` is set in Supabase secrets
- Verify edge function is deployed: `supabase functions list`
- Check browser console for errors

### Token counter not updating?
- Clear localStorage: `localStorage.clear()`
- Refresh the page

### Modal not appearing?
- Check token count in localStorage: `localStorage.getItem('mindbloom_chat_tokens')`
- Ensure you've sent enough messages to exhaust tokens

## 📊 Monitoring

### Check Token Usage (Authenticated Users)
```sql
SELECT user_id, SUM(tokens_used) as total_tokens, COUNT(*) as message_count
FROM chat_usage
GROUP BY user_id
ORDER BY total_tokens DESC;
```

### View Recent Conversations
```sql
SELECT user_id, tokens_used, created_at
FROM chat_usage
ORDER BY created_at DESC
LIMIT 100;
```

## 🔒 Security Notes

- Anonymous tokens stored in localStorage (client-side only)
- Authenticated usage tracked in database with RLS policies
- Edge function uses service role for database writes
- OpenAI API key never exposed to client

## 📱 Mobile Support

The chat interface is fully responsive:
- Touch-friendly input and buttons
- Optimized message bubbles for small screens
- Swipe-friendly scroll areas
- Mobile-optimized animations

## 🎨 Theming

The chat uses your existing design system:
- `therapy-purple` for primary actions
- `therapy-deep-purple` for hover states
- `therapy-light-purple` for backgrounds
- Consistent with rest of MindBloom app

## 💡 Tips

1. **Test Anonymous Flow**: Use incognito mode to test the full anonymous → signup flow
2. **Monitor Costs**: OpenAI charges per token, monitor usage in OpenAI dashboard
3. **Rate Limiting**: Consider adding rate limits for anonymous users to prevent abuse
4. **Analytics**: Track conversion rates from modal to signup
5. **A/B Testing**: Test different token limits and modal copy for optimal conversion

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Review Supabase logs for edge function errors
3. Verify OpenAI API key and quota
4. Check database migration status

---

**Ready to chat!** 🎉 Navigate to `/chat` and start your first conversation.

