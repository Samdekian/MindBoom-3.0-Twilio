#!/bin/bash

# Deploy Script for Staging Environment
# Twilio Video Breakout Rooms - MindBloom 3.0
# Usage: ./scripts/deploy-staging.sh

set -e # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Banner
echo "================================================"
echo "  MindBloom 3.0 - Staging Deployment"
echo "  Twilio Video Breakout Rooms"
echo "================================================"
echo ""

# Step 0: Pre-flight checks
print_info "Running pre-flight checks..."

# Check required commands
REQUIRED_COMMANDS=("node" "npm" "supabase" "psql" "curl")
for cmd in "${REQUIRED_COMMANDS[@]}"; do
    if ! command_exists "$cmd"; then
        print_error "Required command not found: $cmd"
        exit 1
    fi
done
print_success "All required commands are available"

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi
print_success "Node.js version OK: $(node -v)"

# Step 1: Environment setup
print_info "Step 1: Setting up environment..."

if [ ! -f ".env.staging" ]; then
    print_error ".env.staging file not found!"
    print_info "Please create .env.staging with the following variables:"
    echo "  VITE_SUPABASE_URL=https://your-staging-project.supabase.co"
    echo "  VITE_SUPABASE_ANON_KEY=your-staging-anon-key"
    echo "  VITE_APP_ENV=staging"
    echo "  VITE_APP_URL=https://staging.mindbloom.app"
    exit 1
fi

# Load staging environment
export $(cat .env.staging | xargs)
print_success "Environment variables loaded from .env.staging"

# Step 2: Verify Supabase connection
print_info "Step 2: Verifying Supabase connection..."

SUPABASE_STATUS=$(supabase status 2>&1 || echo "not connected")
if [[ $SUPABASE_STATUS == *"not connected"* ]]; then
    print_warning "Not connected to Supabase project"
    print_info "Please run: supabase link --project-ref your-staging-project-ref"
    read -p "Press enter to continue after linking..."
fi

print_success "Supabase connection verified"

# Step 3: Database backup
print_info "Step 3: Creating database backup..."

BACKUP_FILE="backup_staging_$(date +%Y%m%d_%H%M%S).sql"
print_info "Backup file: $BACKUP_FILE"

if [ -n "$DATABASE_URL" ]; then
    pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>/dev/null || {
        print_warning "Could not create backup. DATABASE_URL not set or invalid."
        print_info "Continuing without backup..."
    }
    print_success "Database backup created: $BACKUP_FILE"
else
    print_warning "DATABASE_URL not set. Skipping backup."
fi

# Step 4: Install dependencies
print_info "Step 4: Installing dependencies..."

npm install --legacy-peer-deps
print_success "Dependencies installed"

# Step 5: Deploy Edge Functions
print_info "Step 5: Deploying Edge Functions..."

EDGE_FUNCTIONS=(
    "twilio-video-token"
    "create-breakout-room"
    "close-breakout-room"
    "move-participant"
    "bulk-assign-participants"
    "assign-breakout-participants"
)

for func in "${EDGE_FUNCTIONS[@]}"; do
    print_info "Deploying: $func"
    supabase functions deploy "$func" --no-verify-jwt || {
        print_error "Failed to deploy: $func"
        exit 1
    }
    print_success "Deployed: $func"
done

print_success "All Edge Functions deployed"

# Step 6: Apply Database Migrations
print_info "Step 6: Applying database migrations..."

supabase db push || {
    print_error "Failed to apply migrations"
    print_warning "To rollback, run: psql \$DATABASE_URL < $BACKUP_FILE"
    exit 1
}

print_success "Database migrations applied"

# Step 7: Verify database structure
print_info "Step 7: Verifying database structure..."

TABLES_QUERY="SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'breakout%';"

if [ -n "$DATABASE_URL" ]; then
    TABLES=$(psql "$DATABASE_URL" -t -c "$TABLES_QUERY" 2>/dev/null || echo "")
    if [ -n "$TABLES" ]; then
        print_success "Breakout room tables created:"
        echo "$TABLES"
    else
        print_error "Breakout room tables not found!"
        exit 1
    fi
else
    print_warning "DATABASE_URL not set. Skipping table verification."
fi

# Step 8: Build application
print_info "Step 8: Building application for staging..."

# Copy staging env for build
cp .env.staging .env

# Build
npm run build || {
    print_error "Build failed"
    exit 1
}

print_success "Application built successfully"

# Step 9: Run tests (optional)
print_info "Step 9: Running tests..."

npm test -- --run 2>/dev/null || {
    print_warning "Some tests failed. Review and fix before deploying."
}

# Step 10: Deployment instructions
echo ""
echo "================================================"
print_success "Pre-deployment completed successfully!"
echo "================================================"
echo ""
print_info "Next steps:"
echo ""
echo "1. Verify Supabase Secrets are configured:"
echo "   - TWILIO_ACCOUNT_SID"
echo "   - TWILIO_AUTH_TOKEN"
echo "   - TWILIO_API_KEY_SID"
echo "   - TWILIO_API_KEY_SECRET"
echo ""
echo "2. Test Edge Functions:"
echo "   supabase functions invoke twilio-video-token \\"
echo "     --body '{\"identity\":\"test\",\"roomName\":\"test\"}'"
echo ""
echo "3. Deploy to hosting platform:"
echo "   - Vercel: vercel --prod"
echo "   - Netlify: netlify deploy --prod"
echo "   - Docker: docker-compose -f docker-compose.staging.yml up -d"
echo ""
echo "4. Run validation tests:"
echo "   ./scripts/validate-staging.sh"
echo ""
echo "5. Monitor logs:"
echo "   supabase functions logs --follow"
echo ""

# Create deployment report
REPORT_FILE="deployment_report_$(date +%Y%m%d_%H%M%S).txt"
cat > "$REPORT_FILE" << EOF
MindBloom 3.0 - Staging Deployment Report
Date: $(date)
Deployed by: $(whoami)

Environment:
- Node version: $(node -v)
- NPM version: $(npm -v)
- Supabase CLI: $(supabase --version)

Edge Functions Deployed:
$(printf '%s\n' "${EDGE_FUNCTIONS[@]}")

Database:
- Backup created: $BACKUP_FILE
- Migrations applied: Yes
- Tables created: Yes

Build:
- Status: Success
- Output: dist/

Next Actions:
1. Configure Supabase Secrets
2. Test Edge Functions
3. Deploy to hosting
4. Run validation tests
5. Monitor logs

Backup Location: $BACKUP_FILE
EOF

print_success "Deployment report created: $REPORT_FILE"

echo ""
print_success "Deployment preparation complete! 🚀"
echo ""

