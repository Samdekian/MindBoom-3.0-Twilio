# Breakout Room Video Filter Implementation

## Problem

When participants are assigned to breakout rooms:
- Participants successfully join Twilio breakout rooms
- Participants disconnect from WebRTC main session
- **BUT**: Therapist still sees all participants in the main session video grid
- **AND**: Participants in breakout rooms see each other in the main session view

The video interface was not filtering participants based on their current room assignment.

## Root Cause

The `GroupSessionContainer` component was rendering all `remoteStreams` from the WebRTC session without checking:
1. Which participants are in breakout rooms
2. Which room the current user is viewing
3. Whether to show/hide streams based on room context

## Solution

### 1. Created `useBreakoutRoomFilter` Hook

**File:** `src/hooks/video-conference/use-breakout-room-filter.ts`

**Purpose:** Tracks breakout room assignments and provides filtering logic

**Features:**
- Fetches all participant breakout room assignments
- Maps `user_id` → `breakout_room_id`
- Subscribes to realtime updates for assignment changes
- Provides `shouldShowStream()` function to filter streams

**Key Logic:**
- If viewing main session (`currentRoomId === null`): Only show participants NOT in breakout rooms
- If viewing breakout room: Only show participants in the same breakout room

### 2. Updated `GroupSessionContainer`

**File:** `src/components/video-conference/components/GroupSessionContainer.tsx`

**Changes:**
1. **Track Current User's Room:**
   - Therapists: Use `useTherapistRoomSwitching` hook to get `currentRoomId`
   - Participants: Track from assignment listener and database query

2. **Filter Remote Streams:**
   - Use `useBreakoutRoomFilter` hook with current room context
   - Filter `remoteStreams` array before rendering
   - Only show streams from participants in the same room

3. **Real-time Updates:**
   - Hook subscribes to `breakout_room_participants` table changes
   - Automatically refetches assignments when participants move

## Implementation Details

### Stream ID Mapping

The hook extracts user IDs from stream IDs by checking if the stream ID contains the user ID (as per VideoSessionContext implementation where `stream.id.includes(userId)`).

### Room Context Tracking

```typescript
// Therapist: Uses room switching hook
const therapistRoomSwitching = useTherapistRoomSwitching({...});
currentRoomId = therapistRoomSwitching.currentRoomId; // null = main session

// Participant: Tracks from assignment listener
onAssigned: (assignment) => {
  if (assignment.action === 'join') {
    setCurrentUserRoomId(assignment.room_id);
  } else if (assignment.action === 'return') {
    setCurrentUserRoomId(null);
  }
}
```

### Filtering Logic

```typescript
// Filter streams before rendering
remoteStreams
  .filter(stream => shouldShowStream(stream.id))
  .map((stream, index) => {
    // Render video element
  })
```

## Testing Checklist

- [ ] Therapist in main session sees only participants NOT in breakout rooms
- [ ] Therapist in breakout room sees only participants in that room
- [ ] Participant in breakout room sees only participants in their room
- [ ] When participant moves between rooms, video updates correctly
- [ ] When participant returns to main session, they see main session participants
- [ ] Realtime updates work when assignments change

## Known Limitations

1. **Stream ID Matching:** The hook matches streams to users by checking if `stream.id.includes(userId)`. This works with the current VideoSessionContext implementation but may need adjustment if stream ID format changes.

2. **Twilio Room Participants:** Currently only filters WebRTC streams. When in a Twilio breakout room, participants should see Twilio room participants, not WebRTC streams. This may require additional integration with TwilioRoomManager.

3. **Therapist View:** Therapist can switch between rooms, but the video grid needs to update to show Twilio room participants when viewing a breakout room (not just filter WebRTC streams).

## Next Steps

1. **Integrate Twilio Room Participants:**
   - When in a breakout room, show Twilio room participants
   - Hide WebRTC streams when in Twilio room
   - Switch between WebRTC (main session) and Twilio (breakout rooms)

2. **Improve Stream ID Matching:**
   - Consider storing explicit user_id → stream_id mapping
   - Or enhance stream ID format to include user ID more reliably

3. **Handle Edge Cases:**
   - Participant disconnects from WebRTC but therapist still has connection
   - Clean up stale peer connections when participants join breakout rooms

## Files Modified

1. `src/hooks/video-conference/use-breakout-room-filter.ts` (NEW)
2. `src/components/video-conference/components/GroupSessionContainer.tsx` (UPDATED)

## Related Files

- `src/hooks/video-conference/use-therapist-room-switching.ts` - Therapist room navigation
- `src/hooks/video-conference/use-breakout-assignment-listener.ts` - Assignment listener
- `src/lib/twilio/breakout-manager.ts` - Breakout room management
- `src/contexts/VideoSessionContext.tsx` - WebRTC stream management

