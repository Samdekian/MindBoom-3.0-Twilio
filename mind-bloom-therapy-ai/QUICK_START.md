# 🚀 Quick Start - Twilio Video Breakout Rooms

Guia rápido para começar a usar o sistema de breakout rooms.

## ⚡ Setup Rápido (5 minutos)

### 1. Instalar Dependências

```bash
npm install --legacy-peer-deps
# ou
bun install
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar template
cp env.example .env

# Editar .env e adicionar:
VITE_SUPABASE_URL=sua-url-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

### 3. Configurar Twilio no Supabase

No Supabase Dashboard → Settings → Edge Functions → Secrets:

```bash
TWILIO_ACCOUNT_SID=ACxxxxx...
TWILIO_AUTH_TOKEN=xxxxx...
TWILIO_API_KEY_SID=SKxxxxx...
TWILIO_API_KEY_SECRET=xxxxx...
```

### 4. Deploy Edge Functions

```bash
# Deploy todas as funções necessárias
supabase functions deploy twilio-video-token
supabase functions deploy create-breakout-room
supabase functions deploy close-breakout-room
supabase functions deploy move-participant
supabase functions deploy bulk-assign-participants
```

### 5. Aplicar Migrations

```bash
supabase db push
```

### 6. Iniciar Desenvolvimento

```bash
npm run dev
```

## 📖 Uso Básico

### Para Terapeutas

#### Criar Breakout Rooms

1. Entre em uma sessão em grupo
2. Clique em **"Create Breakout Rooms"**
3. Configure:
   - Número de salas (2-10)
   - Participantes por sala (2-15)
   - Estratégia: Automática ou Manual
4. Clique em **"Create Rooms"**

#### Mover Participantes

1. Clique em **"Show Participant Assignments"**
2. Selecione o participante
3. Use o dropdown para selecionar nova sala
4. Movimentação é automática

#### Fechar Salas

- **Uma sala**: Clique no X na sala
- **Todas**: Clique em **"Close All Rooms"**

### Para Participantes

- **Automático**: Você será atribuído automaticamente
- **Notificado**: Receberá notificação ao ser movido
- **Simples**: Apenas entre na sessão e aguarde

## 🔧 Comandos Úteis

### Desenvolvimento

```bash
# Iniciar dev server
npm run dev

# Build para produção
npm run build

# Executar testes
npm test

# Type check
npm run type-check

# Lint
npm run lint
npm run lint:fix
```

### Supabase

```bash
# Ver logs de edge function
supabase functions logs twilio-video-token --follow

# Testar edge function localmente
supabase functions serve twilio-video-token

# Status do projeto
supabase status

# Push migrations
supabase db push

# Reset database (CUIDADO!)
supabase db reset
```

### Database

```bash
# Conectar ao DB
psql $DATABASE_URL

# Ver breakout rooms ativas
psql $DATABASE_URL -c "SELECT * FROM breakout_rooms WHERE is_active = true;"

# Ver participantes
psql $DATABASE_URL -c "SELECT * FROM breakout_room_participants WHERE is_active = true;"
```

## 🐛 Troubleshooting Rápido

### Token Expirado

```
Erro: "Access token expired"
Solução: Tokens renovam automaticamente. Se persistir, recarregue a página.
```

### Não Conecta

```
Erro: "Failed to connect"
Solução: 
1. Verifique internet
2. Confirme secrets no Supabase
3. Teste em navegador diferente
```

### Sala Não Cria

```
Erro: "Failed to create room"
Solução:
1. Mínimo 2 participantes necessários
2. Verifique role de terapeuta
3. Cheque logs: supabase functions logs create-breakout-room
```

### Participante Não Move

```
Erro: Participante não se move
Solução:
1. Verifique se sala de destino tem espaço
2. Aguarde alguns segundos (sincronização)
3. Tente refresh e movimente novamente
```

## 📊 Verificação de Saúde

### Checklist Rápido

```bash
# 1. Dependências instaladas?
npm list twilio-video

# 2. Variáveis de ambiente configuradas?
cat .env | grep VITE_SUPABASE_URL

# 3. Edge functions deployadas?
supabase functions list

# 4. Migrations aplicadas?
psql $DATABASE_URL -c "\dt breakout_rooms"

# 5. Pode gerar token?
curl -X POST \
  $VITE_SUPABASE_URL/functions/v1/twilio-video-token \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{"identity":"test","roomName":"test-room"}'
```

## 🎯 Casos de Uso Comuns

### 1. Sessão de Terapia em Grupo (10 pessoas)

```
Setup:
- 3 breakout rooms
- 3-4 pessoas por sala
- Distribuição automática
- Duração: 20 minutos

Custo: ~$0.30
```

### 2. Workshop Terapêutico (30 pessoas)

```
Setup:
- 6 breakout rooms
- 5 pessoas por sala
- Distribuição automática
- Duração: 30 minutos

Custo: ~$1.35
```

### 3. Supervisão Clínica (4 pessoas)

```
Setup:
- 2 breakout rooms
- 2 pessoas por sala
- Distribuição manual
- Duração: 45 minutos

Custo: ~$0.27
```

## 📚 Documentação Completa

- **Setup Detalhado**: [TWILIO_VIDEO_SETUP.md](./docs/TWILIO_VIDEO_SETUP.md)
- **Guia do Usuário**: [BREAKOUT_ROOMS_GUIDE.md](./docs/BREAKOUT_ROOMS_GUIDE.md)
- **Implementação**: [TWILIO_BREAKOUT_IMPLEMENTATION.md](./TWILIO_BREAKOUT_IMPLEMENTATION.md)
- **Status Completo**: [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)

## 🆘 Suporte

- **Documentação**: Ver arquivos .md no repositório
- **Twilio Docs**: https://www.twilio.com/docs/video
- **Supabase Docs**: https://supabase.com/docs
- **Logs**: Supabase Dashboard → Logs
- **Monitoring**: Twilio Console → Monitor

## ✅ Checklist de Deploy

Antes de ir para produção:

- [ ] Variáveis de ambiente configuradas em produção
- [ ] Edge functions deployadas em produção
- [ ] Migrations aplicadas em produção
- [ ] Testes manuais realizados
- [ ] Custos monitorados no Twilio
- [ ] Alerts configurados
- [ ] Backup database configurado
- [ ] SSL/HTTPS habilitado
- [ ] CORS configurado
- [ ] Rate limiting habilitado

## 🎉 Tudo Pronto!

Sistema está **100% funcional** e pronto para uso!

**Próximo passo**: Teste em ambiente de staging

---

**Versão**: 1.0.0
**Última Atualização**: 27 de Outubro de 2025

