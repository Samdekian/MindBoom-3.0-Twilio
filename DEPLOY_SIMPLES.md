# 🚀 Deploy Simples - Mesma Infraestrutura

## Resumo

Deploy das funcionalidades de breakout rooms usando:
- ✅ Mesmo projeto Supabase
- ✅ Mesmo domínio
- ✅ Mesma conta Twilio
- ✅ Mesma branch Git

**Tempo estimado: ~20 minutos**

---

## 📋 Checklist Rápido

### Pré-requisitos
- [ ] Supabase CLI instalado
- [ ] Projeto linkado: `supabase status`
- [ ] Node 18+ instalado
- [ ] Dependências instaladas: `npm install --legacy-peer-deps`

### Credenciais Twilio
- [ ] Account SID disponível
- [ ] Auth Token disponível
- [ ] API Key criada (criar em console.twilio.com)

---

## 🎯 Passos para Deploy

### **1. Criar API Key no Twilio (primeira vez apenas)**

```
1. Acesse: https://console.twilio.com/us1/develop/video/manage/api-keys
2. Click: "Create API Key"
3. Name: "MindBloom Video"
4. Type: "Standard"
5. Create
6. COPIE IMEDIATAMENTE:
   - API Key SID (começa com SK...)
   - API Key Secret (não será mostrado novamente!)
```

### **2. Configurar Secrets no Supabase**

```
Dashboard Supabase → Settings → Edge Functions → Secrets

Adicionar 4 secrets:
┌─────────────────────────┬─────────────────────────┐
│ Nome                    │ Valor                   │
├─────────────────────────┼─────────────────────────┤
│ TWILIO_ACCOUNT_SID      │ ACxxxxxxxxxxxxx...      │
│ TWILIO_AUTH_TOKEN       │ your-auth-token         │
│ TWILIO_API_KEY_SID      │ SKxxxxxxxxxxxxx...      │
│ TWILIO_API_KEY_SECRET   │ your-api-secret         │
└─────────────────────────┴─────────────────────────┘
```

**Ou use o script interativo:**
```bash
./scripts/setup-secrets.sh
```

### **3. Executar Deploy Automatizado**

```bash
./scripts/deploy-simple.sh
```

**O script vai:**
1. ✓ Verificar conexão Supabase
2. ✓ Verificar secrets configurados
3. ✓ Deploy de 5 edge functions
4. ✓ Aplicar migrations (cria 3 tabelas)
5. ✓ Verificar estrutura do database
6. ✓ Testar edge function

### **4. Build e Deploy da Aplicação**

```bash
# Build
npm run build

# Deploy (conforme sua plataforma)
git push origin main

# Ou se usar Vercel/Netlify
vercel --prod
# netlify deploy --prod
```

---

## ✅ Verificação Manual

### Testar Token Generation

```bash
# Obter token de auth
export AUTH_TOKEN=$(supabase auth get-token)

# Testar função
curl -X POST "https://seu-projeto.supabase.co/functions/v1/twilio-video-token" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"identity":"test-user","roomName":"test-room"}'

# Deve retornar:
# {"token":"eyJ...","identity":"test-user","roomName":"test-room","expiresAt":"..."}
```

### Testar na Interface

1. **Login** como terapeuta
2. **Criar** sessão instantânea (ou grupo)
3. **Convidar** 4+ participantes (usar contas de teste)
4. **Click** em "Create Breakout Rooms" (novo botão)
5. **Configurar:**
   - Número de salas: 2
   - Participantes por sala: 3
   - Estratégia: Automática
6. **Criar** e verificar
7. **Mover** participantes entre salas
8. **Fechar** salas

---

## 🔍 Verificar Database

```bash
# Ver tabelas criadas
supabase db remote select "SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'breakout%'"

# Deve mostrar:
# breakout_rooms
# breakout_room_participants
# breakout_room_transitions

# Ver RLS policies
supabase db remote select "SELECT tablename, policyname FROM pg_policies WHERE tablename LIKE 'breakout%'"
```

---

## 📊 Monitoramento

### Logs em Tempo Real
```bash
# Todos os logs
supabase functions logs --follow

# Apenas erros
supabase functions logs --level error

# Função específica
supabase functions logs twilio-video-token --follow
```

### Dashboard Interativo
```bash
./scripts/monitor-staging.sh
```

### Twilio Console
```
https://console.twilio.com/us1/monitor/usage

Verificar:
- Active Rooms
- Participant Minutes
- Current Costs
```

---

## 🐛 Troubleshooting

### Edge Function retorna 500
```
Causa: Secrets não configurados
Solução: 
1. Supabase Dashboard → Settings → Edge Functions → Secrets
2. Verificar todas as 4 variáveis Twilio
3. Aguardar 1-2 minutos (propagação)
4. Testar novamente
```

### "No such function"
```
Causa: Functions não deployadas
Solução: 
supabase functions deploy twilio-video-token
supabase functions deploy create-breakout-room
# ... (todas as 5)
```

### Tabelas não existem
```
Causa: Migrations não aplicadas
Solução:
supabase db push
```

### Build falha
```
Causa: Dependências não instaladas
Solução:
npm install --legacy-peer-deps
npm run build
```

---

## 🔄 Re-deploy (Atualizações Futuras)

```bash
# Pull latest
git pull origin main

# Deploy functions (se mudaram)
supabase functions deploy [function-name]

# Migrations (se houver novas)
supabase db push

# Build & deploy app
npm run build
git push origin main
```

---

## 💰 Custos Estimados

Com sua conta Twilio existente:

**Por Sessão:**
- 10 participantes × 60 minutos
- 20 minutos em breakout rooms
- **Custo: ~$1.20/sessão**

**Mensal:**
- 100 sessões/mês: ~$120
- 500 sessões/mês: ~$600

*Verificar pricing atual em: https://www.twilio.com/video/pricing*

---

## 📚 Documentação Adicional

- **[QUICK_START.md](./QUICK_START.md)** - Guia rápido geral
- **[BREAKOUT_ROOMS_GUIDE.md](./docs/BREAKOUT_ROOMS_GUIDE.md)** - Manual do usuário
- **[TWILIO_VIDEO_SETUP.md](./docs/TWILIO_VIDEO_SETUP.md)** - Setup detalhado
- **[scripts/README.md](./scripts/README.md)** - Documentação dos scripts

---

## ✨ Próximos Passos

Após deploy bem-sucedido:

1. **Testes Manuais** (você ou equipe)
   - Criar breakout rooms
   - Mover participantes
   - Testar em múltiplos browsers

2. **Feedback & Ajustes**
   - Coletar feedback
   - Fazer ajustes necessários
   - Otimizações

3. **Documentação Interna**
   - Treinar equipe
   - Criar guias específicos
   - FAQ para suporte

4. **Monitoramento Contínuo**
   - Custos Twilio
   - Performance
   - Erros

---

## 🎉 Deploy Completo!

**Tempo real estimado: 15-20 minutos**

Tudo que você precisa fazer:
```bash
./scripts/setup-secrets.sh       # 5 min
./scripts/deploy-simple.sh       # 10 min
npm run build && git push        # 5 min
```

**Pronto! Sistema funcionando com breakout rooms! 🚀**

---

**Criado em:** 27 de Outubro de 2025
**Versão:** 1.0.0 - Simplificada

