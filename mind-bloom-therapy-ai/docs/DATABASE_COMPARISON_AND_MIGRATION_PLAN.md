# Database Comparison & Migration Plan

## Executive Summary

Comparação entre dois projetos Supabase:
- **Produção**: `mlevmxueubhwfezfujxa` (supabase.com/dashboard/project/mlevmxueubhwfezfujxa)
- **Staging**: `aoumioacfvttagverbna` (supabase.com/dashboard/project/aoumioacfvttagverbna)

---

## 📊 Estado Atual - Staging (aoumioacfvttagverbna)

### ✅ Tabelas Implementadas (11 tabelas)

1. **roles** - Sistema RBAC ✅
   - Colunas: id, name, description, created_at, updated_at
   - RLS: Enabled
   - Policies: 1 (roles_select)
   - Rows: 4 roles (patient, therapist, admin, support)

2. **user_roles** - Mapeamento usuário-roles ✅
   - Colunas: id, user_id, role_id, created_at
   - RLS: Enabled
   - Policies: 1 (user_roles_select_own)
   - Constraint: UNIQUE(user_id, role_id)

3. **profiles** - Perfis de usuários ✅
   - Colunas: id, email, full_name, avatar_url, account_type, approval_status, admin_notes, created_at, updated_at
   - RLS: Enabled
   - Policies: 4 (insert, select, select_during_auth, update)
   - Check: account_type IN ('patient', 'therapist', 'admin')
   - Check: approval_status IN ('pending', 'approved', 'rejected')

4. **appointments** - Agendamentos ✅
   - Colunas: id, patient_id, therapist_id, scheduled_at, duration_minutes, status, notes, created_at, updated_at
   - RLS: Enabled
   - Policies: 0 ⚠️ **FALTANDO**
   - Check: status IN ('scheduled', 'confirmed', 'cancelled', 'completed')

5. **video_sessions** - Sessões de vídeo ✅
   - Colunas: id, session_type, room_name (UNIQUE), created_by, status, started_at, ended_at, created_at, updated_at
   - RLS: Enabled
   - Policies: 0 ⚠️ **FALTANDO**
   - Check: session_type IN ('appointment', 'instant', 'group')
   - Check: status IN ('scheduled', 'active', 'ended')

6. **session_participants** - Participantes de sessões ✅
   - Colunas: id, session_id, user_id, role, joined_at, left_at, created_at
   - RLS: Enabled
   - Policies: 0 ⚠️ **FALTANDO**
   - Check: role IN ('host', 'participant')

7. **breakout_rooms** - Salas de breakout ✅
   - Colunas: id, main_session_id, room_name (UNIQUE), room_sid, max_participants, assignment_mode, status, created_by, created_at, closed_at
   - RLS: Enabled
   - Policies: 1 (breakout_rooms_select)
   - Check: assignment_mode IN ('automatic', 'manual')
   - Check: status IN ('active', 'closed')

8. **breakout_room_participants** - Participantes de breakout rooms ✅
   - Colunas: id, breakout_room_id, user_id, identity, joined_at, left_at
   - RLS: Enabled
   - Policies: 1 (breakout_participants_select)

9. **breakout_room_transitions** - Histórico de transições ✅
   - Colunas: id, user_id, from_room_id, to_room_id, transition_type, transitioned_at
   - RLS: Enabled
   - Policies: 0 ⚠️ **FALTANDO**
   - Check: transition_type IN ('join', 'leave', 'move')

10. **health_checks** - Verificações de saúde do sistema ✅
    - Colunas: id, service_name, status, response_time_ms, database_connected, webrtc_available, metadata, checked_at, created_at
    - RLS: Enabled
    - Policies: 1 (health_checks_select)
    - Check: status IN ('healthy', 'unhealthy', 'degraded')
    - Rows: 3 (database, auth, api)

11. **performance_metrics** - Métricas de performance ✅
    - Colunas: id, metric_name, count, average, min, max, timestamp, metadata, created_at
    - RLS: Enabled
    - Policies: 1 (performance_metrics_select)
    - Rows: 3 (api_response_time, database_query_time, auth_login_time)

### ✅ Functions Implementadas (3 functions)

1. **cleanup_expired_instant_sessions()** ✅
   - Type: FUNCTION
   - Security: DEFINER
   - Purpose: Limpar sessões instantâneas expiradas (>24h)

2. **handle_new_user()** ✅
   - Type: FUNCTION (TRIGGER)
   - Security: DEFINER
   - Purpose: Auto-criar profile e atribuir role em signup
   - Trigger: on_auth_user_created (AFTER INSERT ON auth.users)

3. **update_therapist_approval_simple(therapist_id, new_status, admin_notes)** ✅
   - Type: FUNCTION
   - Security: DEFINER
   - Purpose: Aprovar/rejeitar terapeutas

### ✅ Edge Functions Deployadas (36 functions)

**Authentication & User Management:**
- create-admin-user (verify_jwt: false)

**Video & Breakout Rooms:**
- twilio-video-token
- create-breakout-room
- close-breakout-room
- bulk-assign-participants
- move-participant
- get-turn-credentials (verify_jwt: false)

**Calendar Integration:**
- google-calendar-oauth
- google-calendar-oauth-callback
- google-calendar-events
- google-calendar-list-calendars
- google-calendar-webhook
- setup-google-calendar-webhook
- delete-google-calendar-webhook
- delete-google-calendar-event
- apple-calendar-oauth-callback
- calendly-oauth
- calendly-webhook
- create-webhook-subscription
- sync-appointment-to-calendar
- sync-calendar-background
- setup-sync-cron

**AI & Realtime:**
- openai-realtime (verify_jwt: false)
- realtime-notifications

**Appointments & Sessions:**
- send-appointment-reminders
- send-session-preparation-reminder
- session-analytics (verify_jwt: false)
- session-cleanup

**Notifications:**
- send-patient-invitation
- therapist-status-notification

**System Management:**
- production-monitor (verify_jwt: false)
- production-cleanup (verify_jwt: false)
- system-health (verify_jwt: false)
- run-scheduled-tasks

**Utilities:**
- get_user_email_batch
- create-checkout

### ✅ RLS Policies (10 policies ativas)

| Table | Policy Name | Command | Status |
|-------|------------|---------|--------|
| breakout_room_participants | breakout_participants_select | SELECT | ✅ |
| breakout_rooms | breakout_rooms_select | SELECT | ✅ |
| health_checks | health_checks_select | SELECT | ✅ |
| performance_metrics | performance_metrics_select | SELECT | ✅ |
| profiles | profiles_insert | INSERT | ✅ |
| profiles | profiles_select | SELECT | ✅ |
| profiles | profiles_select_during_auth | SELECT | ✅ |
| profiles | profiles_update | UPDATE | ✅ |
| roles | roles_select | SELECT | ✅ |
| user_roles | user_roles_select_own | SELECT | ✅ |

### ⚠️ Problemas Identificados - Staging

1. **Tabelas sem Policies RLS** (6 tabelas):
   - appointments
   - video_sessions
   - session_participants
   - breakout_room_transitions
   
2. **Policies RLS Incompletas**:
   - breakout_room_participants: Apenas SELECT (falta INSERT, UPDATE, DELETE)
   - breakout_rooms: Apenas SELECT (falta INSERT, UPDATE, DELETE)

3. **Migrações Não Aplicadas**:
   - Total local: 81 migrations
   - Total aplicada: 2 migrations
   - **Faltam: 79 migrations** ⚠️

4. **Tabelas Faltando** (referenciadas no código):
   - instant_sessions (referenciada em fix-rls-final.sql)
   - treatment_plans
   - session_notes
   - mood_entries
   - notifications
   - notification_preferences
   - calendar_sync_tokens
   - ai_conversations
   - e outras...

---

## 🔍 Análise de Gaps

### Critical Gaps (Bloqueiam funcionalidades)

1. **Tabelas Core Faltando**:
   - `instant_sessions` - Para sessões instantâneas
   - `treatment_plans` - Para planos de tratamento
   - `session_notes` - Para notas de sessão
   - `mood_tracker` - Para rastreamento de humor
   - `notifications` - Para sistema de notificações

2. **RLS Policies Faltando**:
   - `appointments` sem policies → Pacientes/terapeutas não conseguem acessar
   - `video_sessions` sem policies → Sessões não são acessíveis
   - `session_participants` sem policies → Participantes não conseguem entrar

3. **Triggers Faltando**:
   - Trigger para criar appointment automaticamente
   - Trigger para notificações
   - Trigger para sync de calendário

### Medium Priority Gaps

1. **Functions Faltando**:
   - Funções de cálculo de estatísticas
   - Funções de busca avançada
   - Funções de relatórios

2. **Indexes Faltando**:
   - Indexes em foreign keys
   - Indexes para queries de performance

### Low Priority Gaps

1. **Views Faltando**:
   - Views para dashboards
   - Views para relatórios

---

## 📋 Plano de Migração Final

### Fase 1: Correções Críticas de Segurança (IMEDIATO)

**Prioridade: CRÍTICA**
**Tempo Estimado: 1-2 horas**

#### 1.1 Adicionar RLS Policies para Tabelas Core

```sql
-- appointments policies
CREATE POLICY "appointments_select_own" ON appointments
  FOR SELECT USING (
    patient_id = auth.uid() OR therapist_id = auth.uid()
  );

CREATE POLICY "appointments_insert_therapist" ON appointments
  FOR INSERT WITH CHECK (
    therapist_id = auth.uid() OR patient_id = auth.uid()
  );

CREATE POLICY "appointments_update_own" ON appointments
  FOR UPDATE USING (
    therapist_id = auth.uid()
  );

-- video_sessions policies
CREATE POLICY "video_sessions_select_participant" ON video_sessions
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM session_participants 
      WHERE session_id = video_sessions.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "video_sessions_insert_own" ON video_sessions
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "video_sessions_update_own" ON video_sessions
  FOR UPDATE USING (created_by = auth.uid());

-- session_participants policies
CREATE POLICY "session_participants_select_own" ON session_participants
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM video_sessions vs
      WHERE vs.id = session_participants.session_id
      AND vs.created_by = auth.uid()
    )
  );

CREATE POLICY "session_participants_insert_host" ON session_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM video_sessions vs
      WHERE vs.id = session_participants.session_id
      AND vs.created_by = auth.uid()
    )
  );

-- breakout_room_transitions policies
CREATE POLICY "transitions_select_own" ON breakout_room_transitions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "transitions_insert_own" ON breakout_room_transitions
  FOR INSERT WITH CHECK (user_id = auth.uid());
```

#### 1.2 Completar Breakout Rooms Policies

```sql
-- breakout_room_participants - adicionar INSERT, UPDATE, DELETE
CREATE POLICY "breakout_participants_insert" ON breakout_room_participants
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM breakout_rooms br
      JOIN video_sessions vs ON vs.id = br.main_session_id
      WHERE br.id = breakout_room_participants.breakout_room_id
      AND vs.created_by = auth.uid()
    )
  );

CREATE POLICY "breakout_participants_update" ON breakout_room_participants
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM breakout_rooms br
      JOIN video_sessions vs ON vs.id = br.main_session_id
      WHERE br.id = breakout_room_participants.breakout_room_id
      AND vs.created_by = auth.uid()
    )
  );

CREATE POLICY "breakout_participants_delete" ON breakout_room_participants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM breakout_rooms br
      JOIN video_sessions vs ON vs.id = br.main_session_id
      WHERE br.id = breakout_room_participants.breakout_room_id
      AND vs.created_by = auth.uid()
    )
  );

-- breakout_rooms - adicionar INSERT, UPDATE, DELETE
CREATE POLICY "breakout_rooms_insert" ON breakout_rooms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM video_sessions vs
      WHERE vs.id = breakout_rooms.main_session_id
      AND vs.created_by = auth.uid()
    )
  );

CREATE POLICY "breakout_rooms_update" ON breakout_rooms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM video_sessions vs
      WHERE vs.id = breakout_rooms.main_session_id
      AND vs.created_by = auth.uid()
    )
  );

CREATE POLICY "breakout_rooms_delete" ON breakout_rooms
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM video_sessions vs
      WHERE vs.id = breakout_rooms.main_session_id
      AND vs.created_by = auth.uid()
    )
  );
```

### Fase 2: Tabelas Core Faltando (ALTA PRIORIDADE)

**Prioridade: ALTA**
**Tempo Estimado: 2-3 horas**

#### 2.1 Criar Tabelas Essenciais

```sql
-- treatment_plans
CREATE TABLE IF NOT EXISTS treatment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  goals jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "treatment_plans_select_own" ON treatment_plans
  FOR SELECT USING (patient_id = auth.uid() OR therapist_id = auth.uid());

CREATE POLICY "treatment_plans_insert_therapist" ON treatment_plans
  FOR INSERT WITH CHECK (therapist_id = auth.uid());

CREATE POLICY "treatment_plans_update_therapist" ON treatment_plans
  FOR UPDATE USING (therapist_id = auth.uid());

-- session_notes
CREATE TABLE IF NOT EXISTS session_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES video_sessions(id) ON DELETE CASCADE,
  therapist_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  notes text,
  private_notes text, -- Only therapist can see
  mood_rating integer CHECK (mood_rating BETWEEN 1 AND 10),
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_notes_select_own" ON session_notes
  FOR SELECT USING (
    therapist_id = auth.uid() OR 
    (patient_id = auth.uid() AND notes IS NOT NULL)
  );

CREATE POLICY "session_notes_insert_therapist" ON session_notes
  FOR INSERT WITH CHECK (therapist_id = auth.uid());

CREATE POLICY "session_notes_update_therapist" ON session_notes
  FOR UPDATE USING (therapist_id = auth.uid());

-- mood_entries (mood tracker)
CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_score integer NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
  energy_level integer CHECK (energy_level BETWEEN 1 AND 10),
  stress_level integer CHECK (stress_level BETWEEN 1 AND 10),
  notes text,
  recorded_at timestamptz DEFAULT NOW(),
  created_at timestamptz DEFAULT NOW()
);

ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mood_entries_all_own" ON mood_entries
  USING (user_id = auth.uid());

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  data jsonb DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- notification_preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled boolean DEFAULT true,
  push_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT false,
  appointment_reminders boolean DEFAULT true,
  session_updates boolean DEFAULT true,
  marketing boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_prefs_all_own" ON notification_preferences
  USING (user_id = auth.uid());
```

#### 2.2 Criar Indexes para Performance

```sql
-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_therapist ON appointments(therapist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Video sessions indexes
CREATE INDEX IF NOT EXISTS idx_video_sessions_created_by ON video_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_video_sessions_status ON video_sessions(status);
CREATE INDEX IF NOT EXISTS idx_video_sessions_room_name ON video_sessions(room_name);

-- Session participants indexes
CREATE INDEX IF NOT EXISTS idx_session_participants_session ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_user ON session_participants(user_id);

-- Breakout rooms indexes
CREATE INDEX IF NOT EXISTS idx_breakout_rooms_session ON breakout_rooms(main_session_id);
CREATE INDEX IF NOT EXISTS idx_breakout_room_participants_room ON breakout_room_participants(breakout_room_id);
CREATE INDEX IF NOT EXISTS idx_breakout_room_participants_user ON breakout_room_participants(user_id);

-- Treatment plans indexes
CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient ON treatment_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_therapist ON treatment_plans(therapist_id);

-- Mood entries indexes
CREATE INDEX IF NOT EXISTS idx_mood_entries_user ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_recorded ON mood_entries(recorded_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
```

### Fase 3: Functions e Triggers Adicionais (MÉDIA PRIORIDADE)

**Prioridade: MÉDIA**
**Tempo Estimado: 2-3 horas**

#### 3.1 Function para Criar Appointment Automaticamente

```sql
CREATE OR REPLACE FUNCTION create_video_session_for_appointment()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar video_session quando appointment é confirmado
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    INSERT INTO video_sessions (
      session_type,
      room_name,
      created_by,
      status,
      created_at
    ) VALUES (
      'appointment',
      'appointment-' || NEW.id::text,
      NEW.therapist_id,
      'scheduled',
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_appointment_confirmed
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_video_session_for_appointment();
```

#### 3.2 Function para Enviar Notificações

```sql
CREATE OR REPLACE FUNCTION notify_user(
  target_user_id uuid,
  notification_type text,
  notification_title text,
  notification_message text,
  notification_data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (target_user_id, notification_type, notification_title, notification_message, notification_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 3.3 Function para Estatísticas do Terapeuta

```sql
CREATE OR REPLACE FUNCTION get_therapist_statistics(therapist_uuid uuid)
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_patients', (
      SELECT COUNT(DISTINCT patient_id) 
      FROM appointments 
      WHERE therapist_id = therapist_uuid
    ),
    'total_sessions', (
      SELECT COUNT(*) 
      FROM appointments 
      WHERE therapist_id = therapist_uuid 
      AND status = 'completed'
    ),
    'upcoming_appointments', (
      SELECT COUNT(*) 
      FROM appointments 
      WHERE therapist_id = therapist_uuid 
      AND status IN ('scheduled', 'confirmed')
      AND scheduled_at > NOW()
    ),
    'active_treatment_plans', (
      SELECT COUNT(*) 
      FROM treatment_plans 
      WHERE therapist_id = therapist_uuid 
      AND status = 'active'
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Fase 4: Aplicar Migrações Restantes (BAIXA PRIORIDADE)

**Prioridade: BAIXA**
**Tempo Estimado: 4-6 horas**

Revisar e aplicar as 79 migrações restantes em ordem cronológica:
1. Analisar cada migration file
2. Remover duplicações
3. Consolidar em migrations temáticas
4. Testar em ambiente staging
5. Aplicar em produção

---

## 🚀 Execução do Plano

### Ordem de Execução Recomendada:

1. **Backup** - Fazer backup completo do database de produção
2. **Fase 1** - Aplicar correções críticas de segurança (IMEDIATO)
3. **Teste** - Testar autenticação e acesso básico
4. **Fase 2** - Criar tabelas core faltando
5. **Teste** - Testar funcionalidades principais
6. **Fase 3** - Adicionar functions e triggers
7. **Teste** - Testar workflows completos
8. **Fase 4** - Revisar e aplicar migrações restantes (opcional)

### Scripts de Execução:

```bash
# 1. Backup do database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Aplicar Fase 1 (Crítico)
supabase db push phase_1_critical_security.sql

# 3. Aplicar Fase 2 (Alto)
supabase db push phase_2_core_tables.sql

# 4. Aplicar Fase 3 (Médio)
supabase db push phase_3_functions_triggers.sql
```

---

## 📝 Checklist de Validação

### Após Fase 1:
- [ ] Todos os usuários conseguem fazer login
- [ ] Terapeutas conseguem ver appointments
- [ ] Pacientes conseguem ver seus appointments
- [ ] Video sessions são criadas corretamente
- [ ] Breakout rooms funcionam sem erros

### Após Fase 2:
- [ ] Treatment plans podem ser criados
- [ ] Session notes são salvas
- [ ] Mood tracker funciona
- [ ] Notificações são recebidas

### Após Fase 3:
- [ ] Appointments criam video_sessions automaticamente
- [ ] Notificações são enviadas em eventos importantes
- [ ] Estatísticas de terapeuta são calculadas corretamente

---

## 🔄 Comparação: Produção vs Staging

### Para Migração de Produção → Staging:

Se o objetivo é atualizar **produção** (`mlevmxueubhwfezfujxa`) com as correções do **staging** (`aoumioacfvttagverbna`):

1. Exportar schema do staging:
```bash
supabase db dump --project-ref aoumioacfvttagverbna > staging_schema.sql
```

2. Revisar e adaptar para produção
3. Testar em ambiente de teste
4. Aplicar em produção com downtime planejado

### Para Sincronização Bidirecional:

1. Identificar diferenças específicas entre ambos
2. Criar migration scripts para ambos os lados
3. Aplicar em ordem: staging → teste → produção

---

## ⚠️ Riscos e Mitigações

### Risco Alto:
- **Downtime durante migração**: Planejar janela de manutenção
- **Perda de dados**: Backup completo antes de qualquer alteração
- **RLS policies muito restritivas**: Testar com diferentes tipos de usuário

### Risco Médio:
- **Performance degradada**: Adicionar indexes adequados
- **Conflitos de constraint**: Limpar dados inconsistentes primeiro

### Risco Baixo:
- **Edge functions desatualizadas**: Re-deploy todas as functions
- **Secrets faltando**: Verificar e configurar todos os secrets

---

## 📞 Suporte e Contatos

- **Supabase Dashboard Produção**: https://supabase.com/dashboard/project/mlevmxueubhwfezfujxa
- **Supabase Dashboard Staging**: https://supabase.com/dashboard/project/aoumioacfvttagverbna
- **Documentação Supabase**: https://supabase.com/docs
- **Documentação do Projeto**: ./docs/

---

**Última Atualização**: 2025-10-29
**Versão**: 1.0
**Status**: Aguardando aprovação para execução

