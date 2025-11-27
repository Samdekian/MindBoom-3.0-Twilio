#!/bin/bash

# MindBoom Spark - Staging Environment Setup Script
# This script automates the staging environment configuration

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Functions
print_header() { echo -e "${BLUE}========================================${NC}"; echo -e "${BLUE}$1${NC}"; echo -e "${BLUE}========================================${NC}"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

# Configuration
SUPABASE_PROJECT_REF="aoumioacfvttagverbna"
SUPABASE_URL="https://aoumioacfvttagverbna.supabase.co"

print_header "MindBoom Spark - Staging Setup"
echo ""
print_info "Supabase Project: $SUPABASE_PROJECT_REF"
print_info "Environment: Staging"
echo ""

# Step 1: Check prerequisites
print_header "Step 1: Checking Prerequisites"

commands=("node" "npm" "git" "supabase" "curl")
for cmd in "${commands[@]}"; do
    if command -v $cmd &> /dev/null; then
        print_success "$cmd installed"
    else
        print_error "$cmd not found - please install it"
        exit 1
    fi
done

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    print_success "Node.js version: $(node -v)"
else
    print_error "Node.js 18+ required. Current: $(node -v)"
    exit 1
fi

echo ""

# Step 2: Environment file
print_header "Step 2: Setting Up Environment File"

if [ ! -f ".env.staging" ]; then
    print_info "Creating .env.staging from template..."
    if [ -f "env.staging.template" ]; then
        cp env.staging.template .env.staging
        print_success ".env.staging created"
        print_warning "IMPORTANT: Edit .env.staging and add your VITE_SUPABASE_ANON_KEY"
        echo ""
        read -p "Press Enter after you've updated .env.staging with your anon key..."
    else
        print_error "Template file env.staging.template not found"
        exit 1
    fi
else
    print_success ".env.staging already exists"
fi

echo ""

# Step 3: Install dependencies
print_header "Step 3: Installing Dependencies"

print_info "Running npm install..."
npm install --legacy-peer-deps
print_success "Dependencies installed"

echo ""

# Step 4: Link to Supabase
print_header "Step 4: Linking to Supabase Staging"

print_info "Linking to project: $SUPABASE_PROJECT_REF"
print_warning "You may be prompted for your Supabase access token"
print_info "Get it from: https://supabase.com/dashboard/account/tokens"
echo ""

supabase link --project-ref $SUPABASE_PROJECT_REF || {
    print_error "Failed to link to Supabase project"
    print_info "Make sure you have a valid access token"
    exit 1
}

print_success "Linked to Supabase staging project"

echo ""

# Step 5: Database migrations
print_header "Step 5: Applying Database Migrations"

print_info "Reviewing migrations..."
MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
print_info "Found $MIGRATION_COUNT migration files"

read -p "Apply all migrations to staging database? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Applying migrations..."
    supabase db push || {
        print_error "Migration failed"
        print_warning "Check supabase/migrations/ for issues"
        exit 1
    }
    print_success "All migrations applied successfully"
else
    print_warning "Skipping migrations - you'll need to run 'supabase db push' manually"
fi

echo ""

# Step 6: Verify database
print_header "Step 6: Verifying Database Structure"

print_info "Checking database tables..."
supabase db remote exec "
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';
" || print_warning "Could not verify tables"

print_success "Database verification complete"

echo ""

# Step 7: Secrets reminder
print_header "Step 7: Configure Secrets (Manual Step)"

print_warning "You need to configure Edge Function secrets manually:"
echo ""
echo "Go to: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF/settings/functions"
echo ""
echo "Add the following secrets:"
echo "  - OPENAI_API_KEY"
echo "  - TWILIO_ACCOUNT_SID"
echo "  - TWILIO_AUTH_TOKEN"
echo "  - TWILIO_API_KEY_SID"
echo "  - TWILIO_API_KEY_SECRET"
echo ""
echo "Or use CLI:"
echo "  supabase secrets set OPENAI_API_KEY=\"sk-proj-...\""
echo "  supabase secrets set TWILIO_ACCOUNT_SID=\"ACxxxx...\""
echo "  # etc."
echo ""

read -p "Press Enter after you've configured the secrets..."

# Verify secrets
print_info "Verifying secrets..."
SECRET_COUNT=$(supabase secrets list 2>/dev/null | grep -v "NAME" | wc -l || echo "0")
if [ "$SECRET_COUNT" -ge 4 ]; then
    print_success "Secrets configured ($SECRET_COUNT found)"
else
    print_warning "Only $SECRET_COUNT secrets found - you may need to add more"
fi

echo ""

# Step 8: Deploy edge functions
print_header "Step 8: Deploying Edge Functions"

read -p "Deploy all edge functions? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Deploying all edge functions..."
    supabase functions deploy || {
        print_error "Function deployment failed"
        print_info "You can deploy individually with: supabase functions deploy <function-name>"
        exit 1
    }
    print_success "All edge functions deployed"
else
    print_warning "Skipping function deployment"
    print_info "Deploy manually with: supabase functions deploy"
fi

echo ""

# Step 9: Build application
print_header "Step 9: Building Application"

print_info "Building for staging..."
npm run build:staging || {
    print_error "Build failed"
    print_info "Fix errors and try again"
    exit 1
}
print_success "Application built successfully"
print_info "Build output in: dist/"

echo ""

# Step 10: Summary
print_header "Setup Complete! 🎉"

echo ""
print_success "Staging environment configured successfully!"
echo ""
print_info "Next steps:"
echo ""
echo "1. Deploy frontend to hosting platform:"
echo "   - Vercel: vercel --prod"
echo "   - Netlify: netlify deploy --prod"
echo "   - Docker: docker-compose up -d"
echo ""
echo "2. Configure environment variables in hosting platform:"
echo "   - VITE_SUPABASE_URL=$SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY=[from .env.staging]"
echo "   - VITE_APP_ENV=staging"
echo ""
echo "3. Test the deployment:"
echo "   - Run: ./scripts/validate-staging.sh"
echo "   - Or follow: STAGING_CHECKLIST.md"
echo ""
echo "4. Monitor logs:"
echo "   - Edge functions: supabase functions logs --tail"
echo "   - Database: Supabase Dashboard → Logs"
echo ""

print_success "Setup script complete!"
echo ""

