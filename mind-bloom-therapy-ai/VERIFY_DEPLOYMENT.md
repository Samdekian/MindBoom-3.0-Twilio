# ✅ Verificação do Deploy

## Status Atual

✅ **Edge Functions Deployadas** (5/5)
- twilio-video-token
- create-breakout-room
- close-breakout-room
- move-participant
- bulk-assign-participants

✅ **Secrets Configurados** (4/4)
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_API_KEY_SID
- TWILIO_API_KEY_SECRET

⏳ **Database Migration** - Verificar se executou corretamente

---

## 🔍 Verificar Tabelas no Supabase

### No SQL Editor do Supabase, execute:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'breakout%'
ORDER BY table_name;
```

### ✅ Resultado Esperado:

```
table_name
----------------------------------
breakout_room_participants
breakout_room_transitions
breakout_rooms
```

---

## 🔍 Verificar RLS Policies

No SQL Editor, execute:

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename LIKE 'breakout%'
ORDER BY tablename, policyname;
```

### ✅ Resultado Esperado:

Deve mostrar **8 policies** (3-4 por tabela)

---

## 🔍 Verificar Triggers

No SQL Editor, execute:

```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE event_object_table LIKE 'breakout%'
ORDER BY event_object_table, trigger_name;
```

### ✅ Resultado Esperado:

```
trigger_name                                    | event_object_table
------------------------------------------------|-------------------------
trigger_auto_close_empty_breakout_rooms         | breakout_room_participants
trigger_update_breakout_room_participant_count  | breakout_room_participants
```

---

## ✅ Se TUDO Passou

Se as 3 verificações acima mostraram os resultados esperados:

### **Próximo Passo: Build e Deploy da Aplicação**

```bash
# Build
npm run build

# Commit e push
git add .
git commit -m "feat: Add Twilio Video breakout rooms functionality"
git push origin main
```

**Seu deploy automático vai pegar as mudanças!**

---

## ❌ Se Algo Falhou

**Problema**: Tabelas não foram criadas

**Solução**: 
1. Volte ao SQL Editor
2. Copie novamente o conteúdo de `scripts/apply-breakout-migration.sql`
3. Cole e execute novamente
4. Verifique se há erros na saída

---

## 🎯 Resumo do Status

| Item | Status |
|------|--------|
| Edge Functions | ✅ Deployadas (5/5) |
| Secrets Twilio | ✅ Configurados (4/4) |
| Database Tables | ⏳ Aguardando verificação |
| Build | ⏳ Pendente |
| Deploy App | ⏳ Pendente |

---

**Me diga:** As tabelas foram criadas com sucesso? (Rode a primeira query acima)

