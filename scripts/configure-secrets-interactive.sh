#!/bin/bash

# MindBoom Spark - Interactive Secrets Configuration
# Configures all required secrets for Supabase Edge Functions

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Functions
print_header() { echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"; echo -e "${BLUE}║ $1${NC}"; echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"; }
print_info() { echo -e "${CYAN}ℹ${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI not found"
    print_info "Install with: npm install -g supabase"
    exit 1
fi

print_header "MindBoom Spark - Secrets Configuration"
echo ""
print_info "Project: aoumioacfvttagverbna"
print_info "Environment: Staging"
echo ""

# Verify we're linked to the right project
print_info "Verifying Supabase connection..."
if supabase status &> /dev/null || supabase link --project-ref aoumioacfvttagverbna &> /dev/null; then
    print_success "Connected to Supabase project"
else
    print_error "Failed to connect to Supabase"
    exit 1
fi

echo ""
print_header "Configure Secrets"
echo ""
print_warning "You'll be prompted to enter each secret value"
print_info "Press Ctrl+C at any time to cancel"
echo ""

# Track configured secrets
CONFIGURED=0

# Function to safely read secret
read_secret() {
    local prompt=$1
    local var_name=$2
    local help_url=$3
    
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}$prompt${NC}"
    if [ -n "$help_url" ]; then
        echo -e "${CYAN}Get it from:${NC} $help_url"
    fi
    echo ""
    read -sp "Enter $var_name (input hidden): " secret_value
    echo ""
    
    if [ -n "$secret_value" ]; then
        echo "$secret_value"
    else
        echo ""
    fi
}

# TWILIO_ACCOUNT_SID
TWILIO_ACCOUNT_SID=$(read_secret \
    "🔑 Twilio Account SID" \
    "TWILIO_ACCOUNT_SID" \
    "https://console.twilio.com → Account Info")

if [ -n "$TWILIO_ACCOUNT_SID" ]; then
    supabase secrets set TWILIO_ACCOUNT_SID="$TWILIO_ACCOUNT_SID"
    print_success "TWILIO_ACCOUNT_SID configured"
    CONFIGURED=$((CONFIGURED + 1))
else
    print_warning "Skipped TWILIO_ACCOUNT_SID"
fi

# TWILIO_AUTH_TOKEN
TWILIO_AUTH_TOKEN=$(read_secret \
    "🔑 Twilio Auth Token" \
    "TWILIO_AUTH_TOKEN" \
    "https://console.twilio.com → Account Info")

if [ -n "$TWILIO_AUTH_TOKEN" ]; then
    supabase secrets set TWILIO_AUTH_TOKEN="$TWILIO_AUTH_TOKEN"
    print_success "TWILIO_AUTH_TOKEN configured"
    CONFIGURED=$((CONFIGURED + 1))
else
    print_warning "Skipped TWILIO_AUTH_TOKEN"
fi

# TWILIO_API_KEY_SID
TWILIO_API_KEY_SID=$(read_secret \
    "🔑 Twilio API Key SID (for Video)" \
    "TWILIO_API_KEY_SID" \
    "https://console.twilio.com/us1/develop/video/manage/api-keys")

if [ -n "$TWILIO_API_KEY_SID" ]; then
    supabase secrets set TWILIO_API_KEY_SID="$TWILIO_API_KEY_SID"
    print_success "TWILIO_API_KEY_SID configured"
    CONFIGURED=$((CONFIGURED + 1))
else
    print_warning "Skipped TWILIO_API_KEY_SID"
fi

# TWILIO_API_KEY_SECRET
TWILIO_API_KEY_SECRET=$(read_secret \
    "🔑 Twilio API Key Secret" \
    "TWILIO_API_KEY_SECRET" \
    "https://console.twilio.com/us1/develop/video/manage/api-keys")

if [ -n "$TWILIO_API_KEY_SECRET" ]; then
    supabase secrets set TWILIO_API_KEY_SECRET="$TWILIO_API_KEY_SECRET"
    print_success "TWILIO_API_KEY_SECRET configured"
    CONFIGURED=$((CONFIGURED + 1))
else
    print_warning "Skipped TWILIO_API_KEY_SECRET"
fi

# OPENAI_API_KEY
OPENAI_API_KEY=$(read_secret \
    "🤖 OpenAI API Key" \
    "OPENAI_API_KEY" \
    "https://platform.openai.com/api-keys")

if [ -n "$OPENAI_API_KEY" ]; then
    supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY"
    print_success "OPENAI_API_KEY configured"
    CONFIGURED=$((CONFIGURED + 1))
else
    print_warning "Skipped OPENAI_API_KEY"
fi

# Optional: Agora.io
echo ""
read -p "Do you want to configure Agora.io? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    AGORA_APP_ID=$(read_secret \
        "📹 Agora App ID (Optional)" \
        "AGORA_APP_ID" \
        "https://console.agora.io")
    
    if [ -n "$AGORA_APP_ID" ]; then
        supabase secrets set AGORA_APP_ID="$AGORA_APP_ID"
        print_success "AGORA_APP_ID configured"
        CONFIGURED=$((CONFIGURED + 1))
    fi
    
    AGORA_APP_CERTIFICATE=$(read_secret \
        "📹 Agora App Certificate (Optional)" \
        "AGORA_APP_CERTIFICATE" \
        "https://console.agora.io")
    
    if [ -n "$AGORA_APP_CERTIFICATE" ]; then
        supabase secrets set AGORA_APP_CERTIFICATE="$AGORA_APP_CERTIFICATE"
        print_success "AGORA_APP_CERTIFICATE configured"
        CONFIGURED=$((CONFIGURED + 1))
    fi
fi

# Summary
echo ""
print_header "Configuration Summary"
echo ""
print_success "Configured $CONFIGURED secrets"
echo ""

if [ $CONFIGURED -ge 5 ]; then
    print_success "All essential secrets configured! ✨"
    echo ""
    print_info "Verifying secrets..."
    supabase secrets list
    echo ""
    print_success "Secrets are ready!"
    echo ""
    print_info "Next steps:"
    echo "  1. Test edge functions: curl https://aoumioacfvttagverbna.supabase.co/functions/v1/system-health"
    echo "  2. Deploy frontend: npm run build:staging && vercel --prod"
    echo "  3. Validate: ./scripts/validate-staging.sh"
else
    print_warning "Only $CONFIGURED secrets configured"
    print_info "You may need to configure more secrets for full functionality"
    echo ""
    print_info "To add more secrets manually:"
    echo "  supabase secrets set SECRET_NAME=\"value\""
    echo ""
    print_info "Or visit:"
    echo "  https://supabase.com/dashboard/project/aoumioacfvttagverbna/settings/functions"
fi

echo ""
print_success "Secrets configuration complete! 🎉"

