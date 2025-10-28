#!/bin/bash

# Simple Deploy Script - Same Infrastructure
# Deploy breakout rooms to current project
# Usage: ./scripts/deploy-simple.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

echo "================================================"
echo "  Deploy Simplificado - Breakout Rooms"
echo "  Usando infraestrutura existente"
echo "================================================"
echo ""

# Step 1: Verificar Supabase
print_info "Passo 1: Verificando conexão Supabase..."
if [ ! -d "supabase/.temp" ]; then
    print_error "Supabase não conectado"
    print_info "Execute: ./scripts/link-supabase.sh"
    exit 1
fi
print_success "Supabase conectado (projeto: mlevmxueubhwfezfujxa)"

# Step 2: Verificar Secrets
print_info "Passo 2: Verificando secrets..."
print_info "Verifique no Dashboard se os secrets estão configurados:"
echo "  - TWILIO_ACCOUNT_SID"
echo "  - TWILIO_AUTH_TOKEN"
echo "  - TWILIO_API_KEY_SID"
echo "  - TWILIO_API_KEY_SECRET"
echo ""
read -p "Secrets estão configurados? (yes/no): " SECRETS_OK

if [ "$SECRETS_OK" != "yes" ] && [ "$SECRETS_OK" != "y" ]; then
    print_info "Configure os secrets primeiro:"
    print_info "Supabase Dashboard → Settings → Edge Functions → Secrets"
    print_info "Ou execute: ./scripts/setup-secrets.sh"
    exit 1
fi
print_success "Secrets configurados"

# Step 3: Deploy Edge Functions
print_info "Passo 3: Deploying edge functions..."
FUNCTIONS=(
    "twilio-video-token"
    "create-breakout-room"
    "close-breakout-room"
    "move-participant"
    "bulk-assign-participants"
)

for func in "${FUNCTIONS[@]}"; do
    print_info "Deploying: $func"
    supabase functions deploy "$func" --no-verify-jwt || {
        print_error "Falha ao deployar: $func"
        exit 1
    }
done
print_success "Todas as edge functions deployadas"

# Step 4: Database Migrations
print_info "Passo 4: Aplicando migrations..."
print_info "Deseja criar um backup antes? (recomendado)"
read -p "Criar backup? (yes/no): " BACKUP

if [ "$BACKUP" == "yes" ] && [ -n "$DATABASE_URL" ]; then
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>/dev/null && {
        print_success "Backup criado: $BACKUP_FILE"
    }
fi

print_info "Aplicando migrations..."
supabase db push || {
    print_error "Falha ao aplicar migrations"
    exit 1
}
print_success "Migrations aplicadas"

# Step 5: Verificar tabelas
print_info "Passo 5: Verificando estrutura do database..."
TABLES=$(supabase db remote select "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name LIKE 'breakout%'" 2>/dev/null || echo "0")

if echo "$TABLES" | grep -q "3"; then
    print_success "Tabelas de breakout rooms criadas"
else
    print_error "Tabelas não encontradas. Verifique migrations."
fi

# Step 6: Test
print_info "Passo 6: Testando edge function..."
print_info "Obtendo token de auth..."
AUTH_TOKEN=$(supabase auth get-token 2>/dev/null || echo "")

if [ -n "$AUTH_TOKEN" ] && [ -n "$VITE_SUPABASE_URL" ]; then
    print_info "Testando twilio-video-token..."
    RESPONSE=$(curl -s -X POST \
        "$VITE_SUPABASE_URL/functions/v1/twilio-video-token" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"identity":"test","roomName":"test"}' 2>/dev/null || echo '{"error":"failed"}')
    
    if echo "$RESPONSE" | grep -q "token"; then
        print_success "Edge function funcionando!"
        echo "  Token gerado com sucesso"
    else
        print_error "Edge function retornou erro"
        echo "  Response: $RESPONSE"
    fi
else
    print_info "Pule o teste automático - teste manualmente"
fi

# Summary
echo ""
echo "================================================"
print_success "Deploy Concluído!"
echo "================================================"
echo ""
print_info "Próximos passos:"
echo "  1. Build & deploy da aplicação:"
echo "     npm run build && git push origin main"
echo ""
echo "  2. Testar funcionalidade:"
echo "     - Login como terapeuta"
echo "     - Criar sessão instantânea"
echo "     - Criar breakout rooms"
echo "     - Testar movimentação de participantes"
echo ""
echo "  3. Monitorar logs:"
echo "     supabase functions logs --follow"
echo ""
print_success "Sistema pronto para uso! 🎉"

