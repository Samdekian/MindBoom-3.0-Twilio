#!/bin/bash

# Setup Supabase Secrets for Staging
# Interactive script to configure Twilio secrets
# Usage: ./scripts/setup-secrets.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

clear
echo "================================================"
echo "  Supabase Secrets Configuration"
echo "  Staging Environment"
echo "================================================"
echo ""

print_warning "This script will help you configure secrets in Supabase"
print_info "You'll need your Twilio credentials ready"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI not found"
    print_info "Install: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if project is linked
if ! supabase status &> /dev/null; then
    print_error "Supabase project not linked"
    print_info "Run: supabase link --project-ref your-staging-ref"
    exit 1
fi

print_success "Supabase CLI ready"
echo ""

# Information gathering
print_info "Step 1: Twilio Account Credentials"
echo "Get these from: https://console.twilio.com"
echo ""

read -p "Enter TWILIO_ACCOUNT_SID (starts with AC): " ACCOUNT_SID
read -p "Enter TWILIO_AUTH_TOKEN: " AUTH_TOKEN

echo ""
print_info "Step 2: Twilio API Key (for Video)"
echo "Create at: https://console.twilio.com/us1/develop/video/manage/api-keys"
echo ""

read -p "Enter TWILIO_API_KEY_SID (starts with SK): " API_KEY_SID
read -p "Enter TWILIO_API_KEY_SECRET: " API_KEY_SECRET

echo ""
print_info "Step 3: Optional - OpenAI API Key"
read -p "Enter OPENAI_API_KEY (or press enter to skip): " OPENAI_KEY

echo ""
echo "================================================"
print_info "Configuration Summary"
echo "================================================"
echo ""
echo "TWILIO_ACCOUNT_SID:     ${ACCOUNT_SID:0:10}..."
echo "TWILIO_AUTH_TOKEN:      ${AUTH_TOKEN:0:10}..."
echo "TWILIO_API_KEY_SID:     ${API_KEY_SID:0:10}..."
echo "TWILIO_API_KEY_SECRET:  ${API_KEY_SECRET:0:10}..."
if [ -n "$OPENAI_KEY" ]; then
    echo "OPENAI_API_KEY:         ${OPENAI_KEY:0:10}..."
fi
echo ""

read -p "Is this correct? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    print_info "Configuration cancelled"
    exit 0
fi

# Set secrets
print_info "Setting secrets in Supabase..."
echo ""

print_info "Setting TWILIO_ACCOUNT_SID..."
echo "$ACCOUNT_SID" | supabase secrets set TWILIO_ACCOUNT_SID --stdin || {
    print_error "Failed to set TWILIO_ACCOUNT_SID"
}

print_info "Setting TWILIO_AUTH_TOKEN..."
echo "$AUTH_TOKEN" | supabase secrets set TWILIO_AUTH_TOKEN --stdin || {
    print_error "Failed to set TWILIO_AUTH_TOKEN"
}

print_info "Setting TWILIO_API_KEY_SID..."
echo "$API_KEY_SID" | supabase secrets set TWILIO_API_KEY_SID --stdin || {
    print_error "Failed to set TWILIO_API_KEY_SID"
}

print_info "Setting TWILIO_API_KEY_SECRET..."
echo "$API_KEY_SECRET" | supabase secrets set TWILIO_API_KEY_SECRET --stdin || {
    print_error "Failed to set TWILIO_API_KEY_SECRET"
}

if [ -n "$OPENAI_KEY" ]; then
    print_info "Setting OPENAI_API_KEY..."
    echo "$OPENAI_KEY" | supabase secrets set OPENAI_API_KEY --stdin || {
        print_error "Failed to set OPENAI_API_KEY"
    }
fi

echo ""
print_success "All secrets configured!"
echo ""

# Verify secrets
print_info "Verifying secrets..."
supabase secrets list || print_warning "Could not list secrets"

echo ""
print_info "Next steps:"
echo "  1. Deploy edge functions: ./scripts/deploy-staging.sh"
echo "  2. Test token generation: ./scripts/test-edge-functions.sh"
echo "  3. Monitor logs: supabase functions logs --follow"
echo ""

print_success "Setup complete! 🎉"

