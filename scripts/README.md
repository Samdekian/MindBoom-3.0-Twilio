# Staging Deployment Scripts

Automated scripts para facilitar o deploy e gerenciamento do ambiente de staging.

## 📋 Scripts Disponíveis

### 1. deploy-staging.sh
**Deploy completo do ambiente staging**

```bash
./scripts/deploy-staging.sh
```

**O que faz:**
- ✅ Verifica pré-requisitos (Node, npm, supabase CLI, etc)
- ✅ Carrega variáveis de ambiente do `.env.staging`
- ✅ Verifica conexão com Supabase
- ✅ Cria backup do database
- ✅ Instala dependências
- ✅ Deploy de todas as Edge Functions
- ✅ Aplica migrations do database
- ✅ Verifica estrutura do database
- ✅ Build da aplicação
- ✅ Roda testes
- ✅ Gera relatório de deployment

**Pré-requisitos:**
- `.env.staging` configurado
- Supabase CLI linkado ao projeto staging
- Credenciais Twilio configuradas no Supabase

---

### 2. validate-staging.sh
**Valida o ambiente staging após deployment**

```bash
./scripts/validate-staging.sh
```

**O que faz:**
- ✅ Testa acessibilidade da aplicação
- ✅ Verifica conexão Supabase
- ✅ Valida Edge Functions deployadas
- ✅ Verifica tabelas do database
- ✅ Valida RLS policies
- ✅ Checa triggers
- ✅ Verifica build artifacts
- ✅ Valida dependências
- ✅ Roda TypeScript check
- ✅ Roda linting
- ✅ Gera relatório de validação

**Saída:**
- Exit code 0: Todos os testes passaram
- Exit code 1: Algum teste falhou

---

### 3. test-edge-functions.sh
**Testa todas as Edge Functions**

```bash
export STAGING_AUTH_TOKEN=$(supabase auth get-token)
./scripts/test-edge-functions.sh
```

**O que faz:**
- ✅ Testa geração de token Twilio
- ✅ Verifica health de todas as functions
- ✅ Mostra logs recentes
- ✅ Valida respostas das functions

**Requer:**
- `STAGING_AUTH_TOKEN` definido
- Edge Functions deployadas

---

### 4. rollback-staging.sh
**Reverte deployment em caso de problemas**

```bash
./scripts/rollback-staging.sh [backup-file]
```

**O que faz:**
- ✅ Restaura database do backup
- ✅ Rollback de Edge Functions
- ✅ Instruções para rollback da aplicação
- ✅ Verifica estado pós-rollback
- ✅ Gera relatório de rollback

**Uso:**
```bash
# Usa o backup mais recente
./scripts/rollback-staging.sh

# Usa backup específico
./scripts/rollback-staging.sh backup_staging_20251027.sql
```

---

### 5. monitor-staging.sh
**Dashboard interativo de monitoramento**

```bash
./scripts/monitor-staging.sh
```

**Funcionalidades:**
1. Edge Function Logs (live)
2. Database Activity
3. Twilio Usage
4. Error Summary
5. Performance Metrics
6. Health Check
7. All Functions Status

**Interface:**
- Menu interativo
- Logs em tempo real
- Métricas ao vivo
- Health checks

---

## 🚀 Workflow Completo de Deploy

### Passo 1: Preparação
```bash
# Criar .env.staging
cp env.staging.template .env.staging
# Editar e preencher valores

# Linkar ao projeto Supabase
supabase link --project-ref your-staging-ref

# Configurar secrets no Supabase Dashboard
# Settings → Edge Functions → Secrets
```

### Passo 2: Deploy
```bash
# Executar deploy completo
./scripts/deploy-staging.sh

# Aguardar conclusão (5-10 minutos)
```

### Passo 3: Validação
```bash
# Validar deployment
./scripts/validate-staging.sh

# Se falhar, corrigir e validar novamente
```

### Passo 4: Teste de Functions
```bash
# Obter token de auth
export STAGING_AUTH_TOKEN=$(supabase auth get-token)

# Testar functions
./scripts/test-edge-functions.sh
```

### Passo 5: Deploy da Aplicação
```bash
# Vercel
vercel --prod

# Ou Netlify
netlify deploy --prod

# Ou Docker
docker-compose -f docker-compose.staging.yml up -d
```

### Passo 6: Monitoramento
```bash
# Abrir dashboard de monitoramento
./scripts/monitor-staging.sh

# Ou ver logs específicos
supabase functions logs twilio-video-token --follow
```

---

## 🔧 Troubleshooting

### Script não executa
```bash
# Dar permissão de execução
chmod +x scripts/*.sh
```

### .env.staging não encontrado
```bash
# Criar do template
cp env.staging.template .env.staging
# Editar com seus valores
```

### Supabase não conectado
```bash
# Linkar projeto
supabase link --project-ref your-ref
```

### Database backup falha
```bash
# Definir DATABASE_URL
export DATABASE_URL="postgresql://..."
```

### Edge Functions falham no deploy
```bash
# Verificar secrets configurados no Supabase
# Dashboard → Settings → Edge Functions → Secrets

# Verificar syntax dos functions
cd supabase/functions/nome-function
deno check index.ts
```

### Validation falha
```bash
# Ver relatório detalhado
cat validation_report_*.txt

# Corrigir issues
# Re-executar validação
./scripts/validate-staging.sh
```

---

## 📊 Arquivos Gerados

### Backups
- `backup_staging_YYYYMMDD_HHMMSS.sql` - Backup do database

### Relatórios
- `deployment_report_YYYYMMDD_HHMMSS.txt` - Relatório de deployment
- `validation_report_YYYYMMDD_HHMMSS.txt` - Resultado de validação
- `rollback_report_YYYYMMDD_HHMMSS.txt` - Relatório de rollback

**Localização:** Diretório raiz do projeto

---

## 🔐 Segurança

### Secrets NO Supabase Dashboard
Configure via Dashboard (NÃO via scripts):
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_API_KEY_SID`
- `TWILIO_API_KEY_SECRET`
- `OPENAI_API_KEY`

### Secrets Locais (.env.staging)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_ENV`
- `VITE_APP_URL`

**⚠️ NUNCA comitar .env.staging no Git!**

---

## 📚 Documentação Adicional

- [STAGING_CHECKLIST.md](../STAGING_CHECKLIST.md) - Checklist completo
- [TWILIO_VIDEO_SETUP.md](../docs/TWILIO_VIDEO_SETUP.md) - Setup Twilio
- [QUICK_START.md](../QUICK_START.md) - Guia rápido
- [Plano de Deploy](../twilio-breakout-rooms.plan.md) - Plano completo

---

## 🆘 Suporte

### Logs
```bash
# Edge Functions
supabase functions logs --follow

# Específico
supabase functions logs twilio-video-token --follow

# Erros apenas
supabase functions logs --level error
```

### Database
```bash
# Conectar ao DB
psql $DATABASE_URL

# Ver breakout rooms ativas
psql $DATABASE_URL -c "SELECT * FROM breakout_rooms WHERE is_active = true;"
```

### Twilio
- Console: https://console.twilio.com
- Logs: https://console.twilio.com/us1/monitor/logs
- Usage: https://console.twilio.com/us1/monitor/usage

---

**Versão:** 1.0.0
**Última Atualização:** 27 de Outubro de 2025

