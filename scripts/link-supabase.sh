#!/bin/bash

# Link to Supabase Project
# Helps find and link to your Supabase project

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }

echo "================================================"
echo "  Link Supabase Project"
echo "================================================"
echo ""

# Check if already linked
if supabase status >/dev/null 2>&1; then
    print_success "Já está linkado ao Supabase!"
    supabase status
    exit 0
fi

# Try to get project ref from .env
if [ -f ".env" ]; then
    SUPABASE_URL=$(cat .env | grep VITE_SUPABASE_URL | cut -d'=' -f2)
    if [ -n "$SUPABASE_URL" ]; then
        PROJECT_REF=$(echo "$SUPABASE_URL" | sed 's/https:\/\///' | cut -d'.' -f1)
        print_info "Encontrado project-ref no .env: $PROJECT_REF"
        echo ""
        print_info "URL: $SUPABASE_URL"
        echo ""
    fi
fi

# Ask for project ref
print_info "Digite seu project-ref do Supabase"
print_info "Você pode encontrar em:"
echo "  1. Dashboard Supabase → Settings → General"
echo "  2. Na URL: https://[project-ref].supabase.co"
echo "  3. No arquivo .env (VITE_SUPABASE_URL)"
echo ""

if [ -n "$PROJECT_REF" ]; then
    read -p "Project Ref [$PROJECT_REF]: " INPUT_REF
    PROJECT_REF=${INPUT_REF:-$PROJECT_REF}
else
    read -p "Project Ref: " PROJECT_REF
fi

if [ -z "$PROJECT_REF" ]; then
    print_warning "Project ref não fornecido"
    exit 1
fi

# Link to project
print_info "Linkando ao projeto: $PROJECT_REF"
echo ""

supabase link --project-ref "$PROJECT_REF" || {
    print_warning "Falha ao linkar. Você pode precisar fazer login primeiro:"
    echo "  supabase login"
    exit 1
}

echo ""
print_success "Projeto linkado com sucesso!"
echo ""

# Show status
print_info "Status do projeto:"
supabase status

echo ""
print_success "Tudo pronto! Agora você pode:"
echo "  1. Configurar secrets: ./scripts/configure-secrets-now.sh"
echo "  2. Deploy: ./scripts/deploy-simple.sh"
echo ""

