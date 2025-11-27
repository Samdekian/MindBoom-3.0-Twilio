#!/bin/bash

# Configure Twilio Secrets - One-time setup
# This script will configure your Twilio secrets in Supabase

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

echo "================================================"
echo "  Configuração de Secrets Twilio"
echo "  Supabase Edge Functions"
echo "================================================"
echo ""

# Verificar se projeto está linkado (checar arquivo de config)
if [ ! -f ".git/config" ] || ! grep -q "supabase" .git/config 2>/dev/null; then
    if [ ! -d "supabase/.temp" ]; then
        print_error "Supabase não conectado"
        print_info "Execute: ./scripts/link-supabase.sh"
        exit 1
    fi
fi

print_success "Supabase conectado (projeto linkado)"
echo ""

# Você precisa fornecer manualmente:
print_warning "VOCÊ PRECISA TER:"
echo "1. TWILIO_ACCOUNT_SID (da sua conta Twilio)"
echo "2. TWILIO_AUTH_TOKEN (da sua conta Twilio)"
echo ""

read -p "Digite seu TWILIO_ACCOUNT_SID (começa com AC): " ACCOUNT_SID
read -sp "Digite seu TWILIO_AUTH_TOKEN: " AUTH_TOKEN
echo ""

# Credenciais da API Key (já fornecidas)
API_KEY_SID="SK34826c8e33f2dac78812deb443a1700f"
API_KEY_SECRET="UAhfqAVfzXMPp5eNKVPQagDuQrDWcNNT"

echo ""
print_info "Configurando secrets no Supabase..."
echo ""

# Configurar cada secret
print_info "1/4 - Configurando TWILIO_ACCOUNT_SID..."
echo "$ACCOUNT_SID" | supabase secrets set TWILIO_ACCOUNT_SID --stdin 2>/dev/null && {
    print_success "TWILIO_ACCOUNT_SID configurado"
} || {
    print_error "Falha ao configurar TWILIO_ACCOUNT_SID"
}

print_info "2/4 - Configurando TWILIO_AUTH_TOKEN..."
echo "$AUTH_TOKEN" | supabase secrets set TWILIO_AUTH_TOKEN --stdin 2>/dev/null && {
    print_success "TWILIO_AUTH_TOKEN configurado"
} || {
    print_error "Falha ao configurar TWILIO_AUTH_TOKEN"
}

print_info "3/4 - Configurando TWILIO_API_KEY_SID..."
echo "$API_KEY_SID" | supabase secrets set TWILIO_API_KEY_SID --stdin 2>/dev/null && {
    print_success "TWILIO_API_KEY_SID configurado"
} || {
    print_error "Falha ao configurar TWILIO_API_KEY_SID"
}

print_info "4/4 - Configurando TWILIO_API_KEY_SECRET..."
echo "$API_KEY_SECRET" | supabase secrets set TWILIO_API_KEY_SECRET --stdin 2>/dev/null && {
    print_success "TWILIO_API_KEY_SECRET configurado"
} || {
    print_error "Falha ao configurar TWILIO_API_KEY_SECRET"
}

echo ""
print_success "Todos os secrets configurados!"
echo ""

# Listar secrets (sem valores)
print_info "Verificando secrets configurados..."
supabase secrets list 2>/dev/null || print_warning "Não foi possível listar secrets"

echo ""
print_success "Configuração completa! 🎉"
echo ""
print_info "Próximos passos:"
echo "  1. Deploy edge functions: ./scripts/deploy-simple.sh"
echo "  2. Testar: supabase functions logs --follow"
echo ""

