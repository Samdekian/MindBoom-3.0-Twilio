#!/bin/bash

# Rollback Script for Staging Environment
# Reverts staging deployment to previous state
# Usage: ./scripts/rollback-staging.sh [backup-file]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "================================================"
echo "  ROLLBACK - Staging Environment"
echo "  ⚠️  WARNING: This will revert changes"
echo "================================================"
echo ""

# Confirmation
read -p "Are you sure you want to rollback? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    print_info "Rollback cancelled"
    exit 0
fi

# Load environment
if [ -f ".env.staging" ]; then
    export $(cat .env.staging | xargs)
else
    print_error ".env.staging not found"
    exit 1
fi

# Step 1: Database Rollback
print_info "Step 1: Database rollback..."

if [ -n "$1" ]; then
    BACKUP_FILE="$1"
elif [ -n "$DATABASE_URL" ]; then
    # Find most recent backup
    BACKUP_FILE=$(ls -t backup_staging_*.sql 2>/dev/null | head -1)
fi

if [ -z "$BACKUP_FILE" ]; then
    print_error "No backup file specified or found"
    print_info "Usage: ./scripts/rollback-staging.sh <backup-file>"
    print_info "Available backups:"
    ls -lh backup_staging_*.sql 2>/dev/null || echo "  No backups found"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    print_error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

print_info "Using backup: $BACKUP_FILE"
read -p "Restore database from this backup? (yes/no): " CONFIRM_DB
if [ "$CONFIRM_DB" == "yes" ]; then
    if [ -n "$DATABASE_URL" ]; then
        print_info "Restoring database..."
        psql "$DATABASE_URL" < "$BACKUP_FILE" 2>/dev/null || {
            print_error "Database restore failed"
            exit 1
        }
        print_success "Database restored"
    else
        print_warning "DATABASE_URL not set, skipping database restore"
    fi
else
    print_info "Skipping database restore"
fi

# Step 2: Rollback Edge Functions
print_info "Step 2: Rolling back Edge Functions..."
print_warning "Note: Supabase doesn't support automatic function rollback"
print_info "Options:"
echo "  1. Redeploy previous version from git"
echo "  2. Delete functions and redeploy from main branch"
echo ""
read -p "Rollback edge functions? (yes/no): " CONFIRM_FUNCS

if [ "$CONFIRM_FUNCS" == "yes" ]; then
    # Get previous commit
    PREV_COMMIT=$(git log --oneline -2 | tail -1 | cut -d' ' -f1)
    print_info "Previous commit: $PREV_COMMIT"
    
    read -p "Checkout previous commit and redeploy functions? (yes/no): " CONFIRM_CHECKOUT
    if [ "$CONFIRM_CHECKOUT" == "yes" ]; then
        git checkout "$PREV_COMMIT"
        
        FUNCTIONS=("twilio-video-token" "create-breakout-room" "close-breakout-room" "move-participant" "bulk-assign-participants")
        for func in "${FUNCTIONS[@]}"; do
            print_info "Redeploying: $func"
            supabase functions deploy "$func" --no-verify-jwt 2>/dev/null || {
                print_warning "Failed to deploy: $func"
            }
        done
        
        git checkout staging
        print_success "Edge functions rolled back"
    fi
else
    print_info "Skipping edge functions rollback"
fi

# Step 3: Rollback Application
print_info "Step 3: Rolling back application..."

print_info "Application rollback options:"
echo "  1. Revert Git commit: git revert HEAD"
echo "  2. Checkout previous tag: git checkout <tag>"
echo "  3. Rollback in hosting platform (Vercel/Netlify)"
echo ""
print_info "Please rollback application manually in your hosting platform"

# Step 4: Verification
print_info "Step 4: Post-rollback verification..."

print_info "Running validation..."
./scripts/validate-staging.sh 2>/dev/null || {
    print_warning "Validation script not available or failed"
}

# Step 5: Report
ROLLBACK_REPORT="rollback_report_$(date +%Y%m%d_%H%M%S).txt"
cat > "$ROLLBACK_REPORT" << EOF
Staging Rollback Report
Date: $(date)
Performed by: $(whoami)

Actions Taken:
1. Database restored from: $BACKUP_FILE
2. Edge functions: $([ "$CONFIRM_FUNCS" == "yes" ] && echo "Rolled back" || echo "Skipped")
3. Application: Manual rollback required

Status:
- Database: $([ "$CONFIRM_DB" == "yes" ] && echo "RESTORED" || echo "NOT RESTORED")
- Edge Functions: $([ "$CONFIRM_FUNCS" == "yes" ] && echo "ROLLED BACK" || echo "NOT ROLLED BACK")
- Application: MANUAL ACTION REQUIRED

Next Steps:
1. Verify application functionality
2. Check error logs
3. Monitor Twilio usage
4. Notify team of rollback
5. Investigate cause of issues
6. Plan fixes for redeployment

Notes:
- Backup used: $BACKUP_FILE
- Previous commit: $PREV_COMMIT
- Validation status: See validation_report_*.txt
EOF

print_success "Rollback report created: $ROLLBACK_REPORT"

echo ""
echo "================================================"
print_success "Rollback completed"
echo "================================================"
echo ""
print_info "Next steps:"
echo "  1. Verify application is working"
echo "  2. Check: ./scripts/validate-staging.sh"
echo "  3. Review logs: supabase functions logs"
echo "  4. Notify team of rollback"
echo "  5. Investigate root cause"
echo ""
print_warning "Remember to rollback application in hosting platform!"
echo ""

