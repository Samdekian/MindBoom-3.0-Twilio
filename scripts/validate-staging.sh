#!/bin/bash

# MindBoom Spark - Staging Environment Validation Script
# Validates all components of the staging environment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SUPABASE_URL="https://aoumioacfvttagverbna.supabase.co"
STAGING_URL="${STAGING_URL:-https://staging.mindboom.app}"

# Load environment if exists
if [ -f ".env.staging" ]; then
    export $(cat .env.staging | grep -v '^#' | xargs)
fi

# Functions
print_header() { echo -e "${BLUE}========================================${NC}"; echo -e "${BLUE}$1${NC}"; echo -e "${BLUE}========================================${NC}"; }
print_test() { echo -n "Testing $1... "; }
print_success() { echo -e "${GREEN}✓ PASS${NC}"; }
print_fail() { echo -e "${RED}✗ FAIL${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ WARNING${NC}"; }

# Track results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

run_test() {
    local test_name=$1
    local test_command=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    print_test "$test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        print_success
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        print_fail
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

print_header "MindBoom Spark - Staging Validation"
echo ""
echo "Supabase: $SUPABASE_URL"
echo "Staging App: $STAGING_URL"
echo ""

# Test 1: Frontend Application
print_header "1. Frontend Application Tests"

run_test "Application homepage" "curl -f -s -o /dev/null -w '%{http_code}' $STAGING_URL | grep -q 200"
run_test "Health endpoint" "curl -f -s $STAGING_URL/health.json | grep -q healthy"
run_test "SSL certificate valid" "curl -I $STAGING_URL 2>&1 | grep -q 'HTTP'"

echo ""

# Test 2: Supabase API
print_header "2. Supabase API Tests"

if [ -n "$VITE_SUPABASE_ANON_KEY" ]; then
    run_test "Supabase REST API" "curl -f -s -o /dev/null -H 'apikey: $VITE_SUPABASE_ANON_KEY' $SUPABASE_URL/rest/v1/"
    run_test "Supabase Auth API" "curl -f -s -o /dev/null -H 'apikey: $VITE_SUPABASE_ANON_KEY' $SUPABASE_URL/auth/v1/health"
else
    print_warning
    echo "  VITE_SUPABASE_ANON_KEY not set - skipping Supabase API tests"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Test 3: Edge Functions
print_header "3. Edge Functions Tests"

if [ -n "$VITE_SUPABASE_ANON_KEY" ]; then
    FUNCTIONS=("system-health" "get-turn-credentials" "session-analytics")
    
    for func in "${FUNCTIONS[@]}"; do
        run_test "Function: $func" "curl -f -s -o /dev/null -H 'Authorization: Bearer $VITE_SUPABASE_ANON_KEY' $SUPABASE_URL/functions/v1/$func"
    done
else
    print_warning
    echo "  Skipping edge function tests (no anon key)"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Test 4: Database
print_header "4. Database Tests"

print_test "Database connectivity"
if supabase db remote status > /dev/null 2>&1; then
    print_success
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

print_test "Critical tables exist"
if supabase db remote exec "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'appointments', 'video_sessions')" > /dev/null 2>&1; then
    print_success
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# Test 5: Security
print_header "5. Security Tests"

print_test "HTTPS enforced"
if [[ $STAGING_URL == https://* ]]; then
    print_success
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail
    echo "  Use HTTPS in production!"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

print_test "Security headers present"
HEADERS=$(curl -s -I $STAGING_URL 2>/dev/null)
if echo "$HEADERS" | grep -q "X-Frame-Options" && echo "$HEADERS" | grep -q "X-Content-Type-Options"; then
    print_success
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# Test 6: Secrets Configuration
print_header "6. Secrets Configuration"

print_test "Edge function secrets configured"
SECRET_COUNT=$(supabase secrets list 2>/dev/null | grep -v "NAME" | wc -l || echo "0")
if [ "$SECRET_COUNT" -ge 4 ]; then
    print_success
    echo "  Found $SECRET_COUNT secrets"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_warning
    echo "  Only $SECRET_COUNT secrets found - expected at least 4"
    WARNINGS=$((WARNINGS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# Test 7: Build Verification
print_header "7. Build Verification"

print_test "Build artifacts exist"
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    print_success
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_warning
    echo "  Run 'npm run build:staging' to generate build"
    WARNINGS=$((WARNINGS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# Summary
print_header "Validation Summary"
echo ""
echo -e "Total Tests:   ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:        ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:        ${RED}$FAILED_TESTS${NC}"
echo -e "Warnings:      ${YELLOW}$WARNINGS${NC}"
echo ""

SUCCESS_RATE=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))
echo "Success Rate: $SUCCESS_RATE%"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    print_success "All critical tests passed! ✨"
    echo ""
    print_info "Staging environment is ready for testing"
    echo ""
    print_info "Next steps:"
    echo "1. Follow STAGING_CHECKLIST.md for comprehensive testing"
    echo "2. Create test user accounts"
    echo "3. Test all critical user flows"
    echo "4. Monitor logs: supabase functions logs --tail"
    echo ""
    exit 0
else
    print_warning "Some tests failed - review and fix before proceeding"
    echo ""
    print_info "Common fixes:"
    echo "- Update .env.staging with correct anon key"
    echo "- Configure edge function secrets"
    echo "- Deploy edge functions: supabase functions deploy"
    echo "- Build application: npm run build:staging"
    echo ""
    exit 1
fi
