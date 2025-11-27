# Authentication Troubleshooting Guide

## Common Authentication Issues and Solutions

### Issue 1: "Account temporarily locked due to multiple failed attempts"

**Symptoms:**
- User was created successfully in the database
- Login attempts fail silently (button does nothing)
- After multiple attempts, shows "Account temporarily locked" message
- User can see their account in `auth.users` table but cannot login

**Root Causes:**

1. **Email Not Confirmed** (Most Common)
   - By default, Supabase requires email confirmation before login
   - If user doesn't receive or click confirmation email, login will fail silently
   - Check: `email_confirmed_at` field in `auth.users` table should not be NULL

2. **Missing User Roles**
   - Application requires users to have roles in `user_roles` table
   - If role is not created during signup, authentication flow fails
   - Check: User should have at least one entry in `user_roles` table

3. **Missing Profile**
   - Application requires a profile in `profiles` table
   - If profile creation fails during signup, user cannot access the app
   - Check: User should have entry in `profiles` table with correct `account_type`

4. **Therapist Not Approved**
   - Therapists require admin approval before login
   - Check: `profiles.approval_status` should be 'approved' for therapists

**Solutions:**

### Quick Fix: Manually Confirm User

```sql
-- 1. Confirm email
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmation_token = NULL
WHERE email = 'user@example.com' 
  AND email_confirmed_at IS NULL;

-- 2. Add user role (if missing)
INSERT INTO user_roles (user_id, role_id)
SELECT 
  u.id,
  r.id
FROM auth.users u
CROSS JOIN roles r
WHERE u.email = 'user@example.com'
  AND r.name = 'patient' -- or 'therapist', 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 3. Create profile (if missing)
INSERT INTO profiles (id, email, full_name, account_type, approval_status)
SELECT 
  id,
  email,
  raw_user_meta_data->>'name',
  raw_user_meta_data->>'accountType',
  CASE 
    WHEN raw_user_meta_data->>'accountType' = 'therapist' THEN 'approved'
    ELSE 'approved'
  END
FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT (id) DO NOTHING;
```

### Preventive Fix: Disable Email Confirmation (Development Only)

⚠️ **Warning**: Only do this for development/testing environments

**Via Supabase Dashboard:**
1. Go to: Authentication → Settings → Email Auth
2. Toggle OFF: "Enable email confirmations"
3. Save changes

**Via Supabase Config (Local Development):**
```toml
# supabase/config.toml
[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = false  # ← Set to false
```

### Long-term Fix: Improve Signup Flow

**1. Add Database Trigger for Auto-Confirmation (Development Only)**

```sql
-- Create trigger to auto-confirm emails in development
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for development - remove in production!
  UPDATE auth.users 
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id 
    AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_auto_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();
```

**2. Ensure Profile and Role Creation**

The application should have triggers or edge functions that automatically:
- Create profile when user signs up
- Assign default role based on `accountType`
- Set appropriate `approval_status`

Check these files:
- `supabase/migrations/*_create_profiles_table.sql`
- `supabase/functions/*/index.ts` (auth-related functions)

**3. Add Better Error Messages**

Update `src/hooks/useAuthOperations.ts` to show specific error messages:

```typescript
const signIn = async (email: string, password: string) => {
  try {
    const result = await signInWithRoleSync(email, password);
    if (!result.success) {
      // Check if error is due to email not confirmed
      if (result.error?.message?.includes('email')) {
        toast({
          title: "Email Not Confirmed",
          description: "Please check your email and click the confirmation link.",
          variant: "destructive",
        });
      }
      throw result.error;
    }
    return result;
  } catch (error: any) {
    console.error("[useAuthOperations] Sign in error:", error);
    // ... rest of error handling
  }
};
```

### Clear Rate Limiting Lock

If user triggered rate limiting (30-minute lock), they can:

**Option 1: Clear Browser Local Storage**
1. Open DevTools (F12)
2. Go to Application/Storage → Local Storage
3. Clear all entries
4. Reload page

**Option 2: Wait for timeout** (30 minutes)

**Option 3: Use Incognito/Private Window**

### Verification Checklist

After fixing authentication issues, verify:

```sql
-- 1. Check user is confirmed
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'user@example.com';
-- ✓ email_confirmed_at should have a timestamp

-- 2. Check user has role
SELECT u.email, r.name as role_name
FROM auth.users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id
WHERE u.email = 'user@example.com';
-- ✓ Should return at least one role

-- 3. Check user has profile
SELECT id, email, full_name, account_type, approval_status
FROM profiles
WHERE email = 'user@example.com';
-- ✓ Should return one profile with correct data

-- 4. For therapists - check approval
SELECT email, account_type, approval_status
FROM profiles
WHERE email = 'user@example.com' 
  AND account_type = 'therapist';
-- ✓ approval_status should be 'approved'
```

## Production Best Practices

For production environments:

1. **Keep Email Confirmation Enabled**
   - Security best practice
   - Prevents spam accounts
   - Ensures valid email addresses

2. **Configure Email Templates**
   - Customize confirmation email in Supabase Dashboard
   - Add your branding
   - Make call-to-action clear

3. **Add Resend Confirmation Feature**
   ```typescript
   const resendConfirmation = async (email: string) => {
     const { error } = await supabase.auth.resend({
       type: 'signup',
       email: email,
     });
     if (error) throw error;
   };
   ```

4. **Monitor Failed Login Attempts**
   - Set up logging for authentication failures
   - Alert on unusual patterns
   - Review regularly

5. **Implement Better User Feedback**
   - Show specific error messages
   - Add "Didn't receive email?" link
   - Provide support contact

## Related Files

- `/src/hooks/useAuthOperations.ts` - Authentication operations
- `/src/services/auth/auth-core.ts` - Core auth functions
- `/src/components/auth/SecureAuthForm.tsx` - Login form component
- `/supabase/config.toml` - Local Supabase configuration

## Support

If issues persist:
1. Check Supabase logs: `supabase logs --db-logs`
2. Check application logs in browser console
3. Verify all environment variables are set correctly
4. Review RLS policies on `profiles` and `user_roles` tables

---

**Last Updated**: 2025-10-29  
**Issue Tracking**: GitHub Issues #[number]

