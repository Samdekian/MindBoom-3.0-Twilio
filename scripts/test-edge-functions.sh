#!/bin/bash

# Test Edge Functions in Staging
# Tests all breakout room edge functions
# Usage: ./scripts/test-edge-functions.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

# Load environment
if [ -f ".env.staging" ]; then
    export $(cat .env.staging | xargs)
else
    print_error ".env.staging not found"
    exit 1
fi

echo "================================================"
echo "  Edge Functions Testing"
echo "  Staging Environment"
echo "================================================"
echo ""

# Check for auth token
if [ -z "$STAGING_AUTH_TOKEN" ]; then
    print_error "STAGING_AUTH_TOKEN not set"
    print_info "Get token from: supabase auth get-token"
    print_info "Then: export STAGING_AUTH_TOKEN=<token>"
    exit 1
fi

BASE_URL="$VITE_SUPABASE_URL/functions/v1"

# Test 1: twilio-video-token
print_info "Test 1: twilio-video-token"
RESPONSE=$(curl -s -X POST \
  "$BASE_URL/twilio-video-token" \
  -H "Authorization: Bearer $STAGING_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"identity":"test-user","roomName":"test-room"}')

if echo "$RESPONSE" | jq -e '.token' >/dev/null 2>&1; then
    print_success "Token generation successful"
    TOKEN=$(echo "$RESPONSE" | jq -r '.token')
    echo "  Token preview: ${TOKEN:0:50}..."
else
    print_error "Token generation failed"
    echo "  Response: $RESPONSE"
fi

# Test 2: create-breakout-room (requires therapist auth)
print_info "Test 2: create-breakout-room"
print_info "  Note: This requires therapist authentication"
print_info "  Skipping automated test - manual testing required"

# Test 3: Health check for all functions
print_info "Test 3: Health check for all functions"
FUNCTIONS=("twilio-video-token" "create-breakout-room" "close-breakout-room" "move-participant" "bulk-assign-participants")

for func in "${FUNCTIONS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/$func" -X POST)
    
    if [ "$STATUS" == "200" ] || [ "$STATUS" == "401" ] || [ "$STATUS" == "400" ]; then
        print_success "  $func is responding (HTTP $STATUS)"
    else
        print_error "  $func not responding properly (HTTP $STATUS)"
    fi
done

# Test 4: Function logs
print_info "Test 4: Checking recent function logs..."
echo ""
print_info "Recent logs for twilio-video-token:"
supabase functions logs twilio-video-token --limit 5 2>/dev/null || print_error "Could not fetch logs"

echo ""
print_success "Edge function tests completed"
print_info "For full testing, use manual QA procedures"
echo ""

