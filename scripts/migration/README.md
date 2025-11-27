# Database Migration Scripts

Migração completa do schema do database para o projeto MindBloom Therapy AI.

## 📁 Arquivos

- **phase_1_critical_security.sql** - Correções críticas de segurança (RLS policies)
- **phase_2_core_tables.sql** - Criação de tabelas essenciais
- **phase_3_functions_triggers.sql** - Functions e triggers de automação
- **execute_migration.sh** - Script de execução automatizada

## 🎯 Objetivos

Sincronizar o schema do database entre:
- **Produção**: `mlevmxueubhwfezfujxa`
- **Staging**: `aoumioacfvttagverbna`

## 📋 Ordem de Execução

### Fase 1: Critical Security (OBRIGATÓRIO)
```bash
supabase db push phase_1_critical_security.sql
```

**O que faz:**
- Adiciona RLS policies para `appointments`
- Adiciona RLS policies para `video_sessions`
- Adiciona RLS policies para `session_participants`
- Adiciona RLS policies para `breakout_room_transitions`
- Completa policies de `breakout_room_participants`
- Completa policies de `breakout_rooms`

**Tempo estimado:** 1-2 minutos
**Impacto:** ALTO - Sistema fica seguro para produção

### Fase 2: Core Tables (RECOMENDADO)
```bash
supabase db push phase_2_core_tables.sql
```

**O que faz:**
- Cria tabela `treatment_plans`
- Cria tabela `session_notes`
- Cria tabela `mood_entries`
- Cria tabela `notifications`
- Cria tabela `notification_preferences`
- Cria tabela `calendar_sync_tokens`
- Adiciona indexes de performance

**Tempo estimado:** 2-3 minutos
**Impacto:** ALTO - Funcionalidades core disponíveis

### Fase 3: Functions & Triggers (OPCIONAL)
```bash
supabase db push phase_3_functions_triggers.sql
```

**O que faz:**
- Cria function para criar video_session automaticamente
- Cria function para enviar notificações
- Cria function para estatísticas de terapeuta
- Cria function para estatísticas de paciente
- Adiciona triggers de automação

**Tempo estimado:** 1-2 minutos
**Impacto:** MÉDIO - Automações e conveniências

## 🚀 Execução Rápida

### Opção 1: Execução Manual (Recomendado para primeira vez)

```bash
# 1. Backup do database
supabase db dump > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Aplicar Fase 1 (Crítico)
supabase db push phase_1_critical_security.sql

# 3. Verificar se funcionou
supabase db diff

# 4. Aplicar Fase 2 (Core)
supabase db push phase_2_core_tables.sql

# 5. Aplicar Fase 3 (Functions)
supabase db push phase_3_functions_triggers.sql

# 6. Verificar schema final
supabase db diff
```

### Opção 2: Execução Automatizada

```bash
# Dar permissão ao script
chmod +x execute_migration.sh

# Executar
./execute_migration.sh
```

## ⚠️ Pré-requisitos

1. **Supabase CLI** instalado
   ```bash
   npm install -g supabase
   ```

2. **Projeto linkado**
   ```bash
   supabase link --project-ref aoumioacfvttagverbna
   ```

3. **Backup do database**
   ```bash
   supabase db dump > backup.sql
   ```

## 🔍 Verificação

### Verificar RLS Policies
```sql
SELECT 
  tablename,
  policyname,
  cmd as command
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Verificar Tabelas Criadas
```sql
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.table_name) as policies
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Verificar Functions
```sql
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY function_name;
```

## 🐛 Troubleshooting

### Erro: "relation already exists"
**Solução:** A tabela já existe, pode ignorar ou usar `IF NOT EXISTS`

### Erro: "policy already exists"
**Solução:** As policies já existem, execute `DROP POLICY` primeiro

### Erro: "permission denied"
**Solução:** Verifique se está logado com credenciais corretas
```bash
supabase logout
supabase login
```

### Erro: "could not serialize access"
**Solução:** Tente novamente, pode ser lock temporário

## 📊 Status Esperado

### Após Fase 1:
- ✅ 22+ RLS policies criadas
- ✅ Tabelas core com segurança
- ✅ Login funciona
- ✅ Appointments acessíveis

### Após Fase 2:
- ✅ 6 novas tabelas
- ✅ 30+ indexes criados
- ✅ Treatment plans funcionam
- ✅ Mood tracker funciona
- ✅ Notificações funcionam

### Após Fase 3:
- ✅ 8 functions criadas
- ✅ 10+ triggers ativos
- ✅ Auto-criação de video sessions
- ✅ Notificações automáticas
- ✅ Estatísticas calculadas

## 🔄 Rollback

Se algo der errado, restaure o backup:

```bash
# Restaurar backup
psql $DATABASE_URL < backup.sql

# Ou via Supabase
supabase db reset
```

## 📞 Suporte

- **Documentação Completa**: `docs/DATABASE_COMPARISON_AND_MIGRATION_PLAN.md`
- **Supabase Dashboard Produção**: https://supabase.com/dashboard/project/mlevmxueubhwfezfujxa
- **Supabase Dashboard Staging**: https://supabase.com/dashboard/project/aoumioacfvttagverbna

## ✅ Checklist de Validação

Após executar a migração:

- [ ] Fazer backup do database
- [ ] Executar Fase 1
- [ ] Testar login de usuário
- [ ] Testar criação de appointment
- [ ] Executar Fase 2
- [ ] Testar treatment plans
- [ ] Testar mood tracker
- [ ] Executar Fase 3
- [ ] Testar notificações
- [ ] Verificar logs de erro
- [ ] Monitorar performance

---

**Última Atualização**: 2025-10-29
**Versão**: 1.0
**Status**: Pronto para execução

