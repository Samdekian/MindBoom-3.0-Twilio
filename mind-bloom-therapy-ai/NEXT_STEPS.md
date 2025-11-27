# 🚀 PRÓXIMOS PASSOS - Deploy Breakout Rooms

## ⚡ Execute Agora (3 passos - 15 minutos)

### **Passo 1: Configurar Secrets no Supabase** (5 min)

Você tem 2 opções:

#### Opção A: Script Automatizado (Mais Rápido)
```bash
./scripts/configure-secrets-now.sh
```

O script já tem suas credenciais da API Key:
- ✅ TWILIO_API_KEY_SID: SK34826c8e33f2dac78812deb443a1700f
- ✅ TWILIO_API_KEY_SECRET: UAhfqAVfzXMPp5eNKVPQagDuQrDWcNNT

Ele vai pedir apenas:
- TWILIO_ACCOUNT_SID (da sua conta principal)
- TWILIO_AUTH_TOKEN (da sua conta principal)

#### Opção B: Manual no Dashboard
```
1. Abrir: https://supabase.com/dashboard
2. Seu projeto → Settings → Edge Functions → Secrets
3. Add Secret (4 vezes):

   Nome: TWILIO_ACCOUNT_SID
   Valor: ACxxxxx... (da sua conta)

   Nome: TWILIO_AUTH_TOKEN
   Valor: xxxxx... (da sua conta)

   Nome: TWILIO_API_KEY_SID
   Valor: SK34826c8e33f2dac78812deb443a1700f

   Nome: TWILIO_API_KEY_SECRET
   Valor: UAhfqAVfzXMPp5eNKVPQagDuQrDWcNNT
```

---

### **Passo 2: Deploy Edge Functions e Migrations** (5 min)

```bash
./scripts/deploy-simple.sh
```

**O que acontece:**
- ✓ Verifica conexão Supabase
- ✓ Confirma secrets configurados (vai perguntar)
- ✓ Deploy automático de 5 edge functions
- ✓ Aplica migration (cria 3 tabelas)
- ✓ Verifica tudo
- ✓ Testa token generation

**Output esperado:**
```
✓ Supabase conectado
✓ Secrets configurados
✓ Deploying: twilio-video-token
✓ Deploying: create-breakout-room
✓ Deploying: close-breakout-room
✓ Deploying: move-participant
✓ Deploying: bulk-assign-participants
✓ Todas as edge functions deployadas
✓ Migrations aplicadas
✓ Tabelas de breakout rooms criadas
✓ Edge function funcionando!
🎉 Deploy Concluído!
```

---

### **Passo 3: Build e Deploy da Aplicação** (5 min)

```bash
# Build
npm run build

# Commit e push (seu deploy é automático via GitHub)
git add .
git commit -m "feat: Add Twilio Video breakout rooms functionality"
git push origin main
```

**Ou se usar Vercel/Netlify:**
```bash
npm run build
vercel --prod
# ou
netlify deploy --prod
```

---

## ✅ Verificação Rápida

### Verificar Edge Functions Deployadas
```bash
supabase functions list
```

**Deve mostrar:**
- twilio-video-token
- create-breakout-room
- close-breakout-room
- move-participant
- bulk-assign-participants

### Verificar Tabelas Criadas
```bash
supabase db remote select "SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'breakout%'"
```

**Deve mostrar:**
- breakout_rooms
- breakout_room_participants
- breakout_room_transitions

### Testar Token Generation
```bash
# Obter token de auth
export AUTH_TOKEN=$(supabase auth get-token)

# Testar função
curl -X POST "$(supabase status | grep 'API URL' | awk '{print $3}')/functions/v1/twilio-video-token" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"identity":"test-user","roomName":"test-room"}'
```

**Deve retornar JSON com:**
- ✓ token
- ✓ identity
- ✓ roomName
- ✓ expiresAt

---

## 🎯 Teste na Interface (5 min)

1. **Abrir aplicação** no browser
2. **Login** como terapeuta
3. **Criar** sessão instantânea (Sessions → New Instant Session)
4. **Procurar** o painel **"Breakout Rooms"** (novo!)
5. **Click** em "Create Breakout Rooms"
6. **Configurar:**
   - Número de salas: 2
   - Participantes por sala: 3
   - Estratégia: Automática (Random)
7. **Criar** e observar

**Se funcionar:**
✅ Salas criadas
✅ Participantes distribuídos
✅ Interface mostrando salas ativas

**Se não funcionar:**
❌ Ver logs: `supabase functions logs --follow`

---

## 🔍 Monitoramento

### Ver Logs em Tempo Real
```bash
# Todos os logs
supabase functions logs --follow

# Apenas da função de token
supabase functions logs twilio-video-token --follow

# Apenas erros
supabase functions logs --level error
```

### Dashboard Interativo
```bash
./scripts/monitor-staging.sh

# Menu com:
# 1) Edge Function Logs
# 2) Database Activity
# 3) Performance Metrics
# 4) Health Check
```

---

## 🐛 Se Algo Der Errado

### Edge Function retorna erro 500
**Causa:** Secrets não configurados corretamente

**Solução:**
```bash
# Listar secrets
supabase secrets list

# Deve mostrar:
# - TWILIO_ACCOUNT_SID
# - TWILIO_AUTH_TOKEN
# - TWILIO_API_KEY_SID
# - TWILIO_API_KEY_SECRET

# Se faltar algum, reconfigurar:
./scripts/configure-secrets-now.sh
```

### Tabelas não existem
**Causa:** Migration não aplicada

**Solução:**
```bash
supabase db push
```

### Build falha
**Causa:** Dependências

**Solução:**
```bash
npm install --legacy-peer-deps
npm run build
```

---

## 📊 Workflow Completo

```bash
# 1. Configurar secrets (5 min)
./scripts/configure-secrets-now.sh

# 2. Deploy tudo (5 min)
./scripts/deploy-simple.sh

# 3. Build e push (5 min)
npm run build
git add .
git commit -m "feat: Add breakout rooms"
git push origin main

# 4. Monitorar (contínuo)
supabase functions logs --follow
```

**Total: 15 minutos e está no ar! 🚀**

---

## 🎉 Checklist Final

**Antes de começar:**
- [x] Credenciais Twilio API em mãos ✓
- [ ] Supabase projeto linkado
- [ ] TWILIO_ACCOUNT_SID disponível
- [ ] TWILIO_AUTH_TOKEN disponível

**Deploy:**
- [ ] Executar: `./scripts/configure-secrets-now.sh`
- [ ] Executar: `./scripts/deploy-simple.sh`
- [ ] Build: `npm run build`
- [ ] Push: `git push origin main`

**Validação:**
- [ ] Edge functions deployadas
- [ ] Tabelas criadas
- [ ] Token generation funciona
- [ ] Interface mostra breakout rooms

**Testes:**
- [ ] Criar sessão como terapeuta
- [ ] Criar breakout rooms
- [ ] Mover participantes
- [ ] Fechar salas

---

## ⏱️ Cronograma

**Agora mesmo:**
```bash
./scripts/configure-secrets-now.sh  # 5 min
```

**Depois:**
```bash
./scripts/deploy-simple.sh          # 5 min
npm run build && git push           # 5 min
```

**Total: 15 minutos**

---

## 🔐 LEMBRETE DE SEGURANÇA

⚠️ **IMPORTANTE:**

1. **NUNCA** commite suas credenciais no Git
2. **NUNCA** compartilhe as credenciais publicamente
3. **SEMPRE** use Supabase Secrets para credenciais
4. **ROTACIONE** as credenciais periodicamente
5. **MONITORE** o uso no Twilio Console

**Suas credenciais API Key:**
- Só existem no script `configure-secrets-now.sh`
- Não foram commitadas
- Serão armazenadas apenas no Supabase Secrets (seguro)

---

## 📞 Pronto para Começar!

**Execute agora:**
```bash
./scripts/configure-secrets-now.sh
```

E siga as instruções na tela! 🎊

