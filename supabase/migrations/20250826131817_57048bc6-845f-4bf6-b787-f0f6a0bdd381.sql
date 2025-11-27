-- Phase 2: Fix RLS Policy Conflicts - Remove duplicate policy

-- Remove the conflicting "Anyone can join sessions" policy that's causing 406 errors
DROP POLICY IF EXISTS "Anyone can join sessions" ON instant_session_participants;

-- Keep only the security definer function policy for proper access control
-- This ensures consistent policy evaluation and prevents conflicts