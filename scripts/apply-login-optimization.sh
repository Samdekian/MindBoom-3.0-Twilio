#!/bin/bash

# Script to apply login performance optimization to Supabase
# This script applies the get_user_roles function migration

set -e

echo "🚀 MindBloom - Login Performance Optimization"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

echo -e "${GREEN}✓ Supabase CLI found${NC}"
echo ""

# Check if project is linked
if [ ! -f ".supabase/config.toml" ] && [ ! -f "supabase/config.toml" ]; then
    echo -e "${YELLOW}⚠️  Project not linked to Supabase${NC}"
    echo ""
    echo "Please link your project first:"
    echo "  supabase link --project-ref YOUR_PROJECT_ID"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Supabase project linked${NC}"
echo ""

# Migration file
MIGRATION_FILE="supabase/migrations/20250129000001_add_get_user_roles_function.sql"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Migration file found${NC}"
echo ""

# Show what will be applied
echo "📝 Migration to apply:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "$MIGRATION_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask for confirmation
read -p "Apply this migration? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled"
    exit 0
fi

echo ""
echo "🔄 Applying migration..."
echo ""

# Apply migration using Supabase CLI
if supabase db push; then
    echo ""
    echo -e "${GREEN}✅ Migration applied successfully!${NC}"
    echo ""
    
    # Verify the function was created
    echo "🔍 Verifying function..."
    echo ""
    
    # Note: This requires psql or supabase sql command
    echo "To verify manually, run in Supabase SQL Editor:"
    echo ""
    echo "  SELECT routine_name, routine_type"
    echo "  FROM information_schema.routines"
    echo "  WHERE routine_name = 'get_user_roles';"
    echo ""
    
    echo -e "${GREEN}✅ Login optimization applied!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Deploy your frontend changes to Vercel"
    echo "2. Clear browser cache (Cmd+Shift+R)"
    echo "3. Test login - should be ~10x faster!"
    echo ""
    echo "See docs/LOGIN_PERFORMANCE_OPTIMIZATION.md for details"
    
else
    echo ""
    echo -e "${RED}❌ Migration failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check your Supabase project credentials"
    echo "2. Verify database connection"
    echo "3. Try applying manually in Supabase SQL Editor"
    echo ""
    exit 1
fi

