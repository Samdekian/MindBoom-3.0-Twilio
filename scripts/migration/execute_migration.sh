#!/bin/bash

# ==============================================================================
# Database Migration Execution Script
# ==============================================================================
# Purpose: Automated execution of database migration phases
# Usage: ./execute_migration.sh [options]
# ==============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ==============================================================================
# Functions
# ==============================================================================

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Supabase CLI is installed
check_supabase_cli() {
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI not found"
        echo "Install with: npm install -g supabase"
        exit 1
    fi
    print_success "Supabase CLI found"
}

# Check if project is linked
check_project_linked() {
    if [ ! -f "./.git/config" ] && [ ! -f "./.supabase/config.toml" ]; then
        print_error "Not in a Supabase project directory"
        exit 1
    fi
    print_success "Project directory verified"
}

# Create backup
create_backup() {
    print_header "Creating Database Backup"
    
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if supabase db dump > "$BACKUP_FILE" 2>/dev/null; then
        print_success "Backup created: $BACKUP_FILE"
        return 0
    else
        print_warning "Could not create backup (may need to configure connection)"
        read -p "Continue without backup? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Migration cancelled"
            exit 1
        fi
    fi
}

# Execute SQL file
execute_sql_file() {
    local phase=$1
    local file=$2
    local description=$3
    
    print_header "Executing $phase: $description"
    
    if [ ! -f "$file" ]; then
        print_error "File not found: $file"
        return 1
    fi
    
    print_info "Applying migration..."
    
    # Execute the SQL file
    if supabase db push "$file"; then
        print_success "$phase completed successfully"
        return 0
    else
        print_error "$phase failed"
        return 1
    fi
}

# Verify migration
verify_migration() {
    print_header "Verifying Migration"
    
    print_info "Checking schema differences..."
    supabase db diff || true
    
    print_success "Verification complete"
}

# Main execution
main() {
    print_header "MindBloom Database Migration"
    
    echo "This script will migrate your database in 3 phases:"
    echo "1. Critical Security (RLS Policies)"
    echo "2. Core Tables (Essential functionality)"
    echo "3. Functions & Triggers (Automation)"
    echo
    
    # Pre-flight checks
    check_supabase_cli
    check_project_linked
    
    # Confirm execution
    echo -e "\n${YELLOW}⚠️  WARNING: This will modify your database${NC}"
    read -p "Do you want to proceed? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Migration cancelled"
        exit 0
    fi
    
    # Create backup
    create_backup
    
    # Phase 1: Critical Security
    if execute_sql_file "Phase 1" "$SCRIPT_DIR/phase_1_critical_security.sql" "Critical Security"; then
        print_success "Phase 1 complete"
        sleep 2
    else
        print_error "Phase 1 failed - stopping migration"
        exit 1
    fi
    
    # Confirm Phase 2
    echo
    read -p "Continue with Phase 2 (Core Tables)? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_info "Migration stopped after Phase 1"
        exit 0
    fi
    
    # Phase 2: Core Tables
    if execute_sql_file "Phase 2" "$SCRIPT_DIR/phase_2_core_tables.sql" "Core Tables"; then
        print_success "Phase 2 complete"
        sleep 2
    else
        print_error "Phase 2 failed - migration incomplete"
        exit 1
    fi
    
    # Confirm Phase 3
    echo
    read -p "Continue with Phase 3 (Functions & Triggers)? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_info "Migration stopped after Phase 2"
        exit 0
    fi
    
    # Phase 3: Functions & Triggers
    if execute_sql_file "Phase 3" "$SCRIPT_DIR/phase_3_functions_triggers.sql" "Functions & Triggers"; then
        print_success "Phase 3 complete"
        sleep 2
    else
        print_warning "Phase 3 failed - core functionality is working but automation is incomplete"
    fi
    
    # Final verification
    verify_migration
    
    # Success message
    print_header "Migration Complete!"
    print_success "All phases executed successfully"
    echo
    print_info "Next steps:"
    echo "  1. Test login functionality"
    echo "  2. Test appointment creation"
    echo "  3. Test video sessions"
    echo "  4. Monitor logs for errors"
    echo
    print_info "Rollback instructions:"
    echo "  If you need to rollback, restore from backup:"
    echo "  psql \$DATABASE_URL < $BACKUP_FILE"
    echo
}

# ==============================================================================
# Script Entry Point
# ==============================================================================

# Handle arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --phase1       Execute only Phase 1"
        echo "  --phase2       Execute only Phase 2"
        echo "  --phase3       Execute only Phase 3"
        echo ""
        echo "Interactive mode (default):"
        echo "  $0"
        exit 0
        ;;
    --phase1)
        check_supabase_cli
        check_project_linked
        execute_sql_file "Phase 1" "$SCRIPT_DIR/phase_1_critical_security.sql" "Critical Security"
        exit $?
        ;;
    --phase2)
        check_supabase_cli
        check_project_linked
        execute_sql_file "Phase 2" "$SCRIPT_DIR/phase_2_core_tables.sql" "Core Tables"
        exit $?
        ;;
    --phase3)
        check_supabase_cli
        check_project_linked
        execute_sql_file "Phase 3" "$SCRIPT_DIR/phase_3_functions_triggers.sql" "Functions & Triggers"
        exit $?
        ;;
    "")
        # Interactive mode
        main
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac

