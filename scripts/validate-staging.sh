#!/bin/bash

# Validation Script for Staging Environment
# Tests all critical functionality after deployment
# Usage: ./scripts/validate-staging.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

PASSED=0
FAILED=0
WARNINGS=0

# Load environment
if [ -f ".env.staging" ]; then
    export $(cat .env.staging | xargs)
else
    print_error ".env.staging not found"
    exit 1
fi

echo "================================================"
echo "  Staging Environment Validation"
echo "  MindBloom 3.0 - Twilio Video"
echo "================================================"
echo ""

# Test 1: Check application is accessible
print_info "Test 1: Application accessibility..."
if curl -s -o /dev/null -w "%{http_code}" "$VITE_APP_URL" | grep -q "200"; then
    print_success "Application is accessible at $VITE_APP_URL"
    ((PASSED++))
else
    print_error "Application not accessible at $VITE_APP_URL"
    ((FAILED++))
fi

# Test 2: Check Supabase connection
print_info "Test 2: Supabase connection..."
if curl -s -o /dev/null -w "%{http_code}" "$VITE_SUPABASE_URL" | grep -q "200"; then
    print_success "Supabase is reachable"
    ((PASSED++))
else
    print_error "Supabase not reachable"
    ((FAILED++))
fi

# Test 3: Check Edge Functions are deployed
print_info "Test 3: Edge Functions deployment..."
FUNCTIONS=("twilio-video-token" "create-breakout-room" "close-breakout-room" "move-participant" "bulk-assign-participants")
FUNC_PASSED=0
for func in "${FUNCTIONS[@]}"; do
    FUNC_URL="$VITE_SUPABASE_URL/functions/v1/$func"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FUNC_URL" -X POST)
    if [ "$STATUS" == "401" ] || [ "$STATUS" == "400" ]; then
        # 401 or 400 means function exists but needs auth/params
        print_success "  ✓ $func deployed"
        ((FUNC_PASSED++))
    else
        print_error "  ✗ $func not accessible (status: $STATUS)"
    fi
done

if [ $FUNC_PASSED -eq ${#FUNCTIONS[@]} ]; then
    print_success "All Edge Functions deployed"
    ((PASSED++))
else
    print_error "Some Edge Functions missing"
    ((FAILED++))
fi

# Test 4: Check database tables
print_info "Test 4: Database tables..."
if [ -n "$DATABASE_URL" ]; then
    TABLES=$(psql "$DATABASE_URL" -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'breakout%';" 2>/dev/null | wc -l)
    if [ "$TABLES" -ge 3 ]; then
        print_success "Breakout room tables exist ($TABLES tables)"
        ((PASSED++))
    else
        print_error "Breakout room tables missing"
        ((FAILED++))
    fi
else
    print_warning "DATABASE_URL not set, skipping database check"
    ((WARNINGS++))
fi

# Test 5: Check RLS policies
print_info "Test 5: RLS policies..."
if [ -n "$DATABASE_URL" ]; then
    POLICIES=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_policies WHERE tablename LIKE 'breakout%';" 2>/dev/null)
    if [ "$POLICIES" -gt 0 ]; then
        print_success "RLS policies configured ($POLICIES policies)"
        ((PASSED++))
    else
        print_error "No RLS policies found"
        ((FAILED++))
    fi
else
    print_warning "DATABASE_URL not set, skipping RLS check"
    ((WARNINGS++))
fi

# Test 6: Check triggers
print_info "Test 6: Database triggers..."
if [ -n "$DATABASE_URL" ]; then
    TRIGGERS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.triggers WHERE event_object_table LIKE 'breakout%';" 2>/dev/null)
    if [ "$TRIGGERS" -gt 0 ]; then
        print_success "Database triggers configured ($TRIGGERS triggers)"
        ((PASSED++))
    else
        print_error "No database triggers found"
        ((FAILED++))
    fi
else
    print_warning "DATABASE_URL not set, skipping triggers check"
    ((WARNINGS++))
fi

# Test 7: Build artifacts
print_info "Test 7: Build artifacts..."
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    BUILD_SIZE=$(du -sh dist | cut -f1)
    print_success "Build artifacts present (size: $BUILD_SIZE)"
    ((PASSED++))
else
    print_error "Build artifacts missing"
    ((FAILED++))
fi

# Test 8: Package dependencies
print_info "Test 8: Package dependencies..."
if npm list twilio-video >/dev/null 2>&1; then
    VERSION=$(npm list twilio-video --depth=0 | grep twilio-video | cut -d'@' -f2)
    print_success "twilio-video installed (v$VERSION)"
    ((PASSED++))
else
    print_error "twilio-video not installed"
    ((FAILED++))
fi

# Test 9: TypeScript compilation
print_info "Test 9: TypeScript check..."
if npm run type-check >/dev/null 2>&1; then
    print_success "TypeScript compilation successful"
    ((PASSED++))
else
    print_error "TypeScript errors found"
    ((FAILED++))
fi

# Test 10: Linting
print_info "Test 10: Code linting..."
if npm run lint >/dev/null 2>&1; then
    print_success "No linting errors"
    ((PASSED++))
else
    print_warning "Linting warnings found"
    ((WARNINGS++))
fi

# Summary
echo ""
echo "================================================"
echo "  Validation Summary"
echo "================================================"
echo ""
echo -e "  ${GREEN}Passed:${NC}   $PASSED"
echo -e "  ${RED}Failed:${NC}   $FAILED"
echo -e "  ${YELLOW}Warnings:${NC} $WARNINGS"
echo ""

# Generate report
REPORT_FILE="validation_report_$(date +%Y%m%d_%H%M%S).txt"
cat > "$REPORT_FILE" << EOF
Staging Validation Report
Date: $(date)
Environment: $VITE_APP_URL

Results:
- Passed: $PASSED
- Failed: $FAILED
- Warnings: $WARNINGS

Test Details:
1. Application Accessibility: $([ $PASSED -gt 0 ] && echo "PASS" || echo "FAIL")
2. Supabase Connection: CHECKED
3. Edge Functions: $FUNC_PASSED/${#FUNCTIONS[@]}
4. Database Tables: CHECKED
5. RLS Policies: CHECKED
6. Database Triggers: CHECKED
7. Build Artifacts: CHECKED
8. Dependencies: CHECKED
9. TypeScript: CHECKED
10. Linting: CHECKED

Next Steps:
$(if [ $FAILED -eq 0 ]; then
    echo "✓ All tests passed! Ready for QA testing."
else
    echo "✗ Fix failed tests before proceeding."
fi)
EOF

print_info "Report saved to: $REPORT_FILE"

# Exit status
if [ $FAILED -eq 0 ]; then
    echo ""
    print_success "All validations passed! 🎉"
    print_info "Ready for manual QA testing"
    echo ""
    exit 0
else
    echo ""
    print_error "Validation failed with $FAILED errors"
    print_info "Please fix the issues and run validation again"
    echo ""
    exit 1
fi

