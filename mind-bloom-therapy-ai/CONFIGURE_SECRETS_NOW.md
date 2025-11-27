# 🔐 Configure Secrets AGORA - Guia Passo-a-Passo

## Você Tem 2 Opções

### ⚡ Opção 1: Via Dashboard do Supabase (MAIS FÁCIL - Recomendado)

1. **Acesse**: https://supabase.com/dashboard/project/aoumioacfvttagverbna/settings/functions

2. **Clique em** "Add new secret" para cada um:

#### Secret 1: TWILIO_ACCOUNT_SID
```
Name: TWILIO_ACCOUNT_SID
Value: [Cole aqui seu Account SID da Twilio]
```
**Onde obter**: https://console.twilio.com → Account Info → Account SID

---

#### Secret 2: TWILIO_AUTH_TOKEN
```
Name: TWILIO_AUTH_TOKEN  
Value: [Cole aqui seu Auth Token da Twilio]
```
**Onde obter**: https://console.twilio.com → Account Info → Auth Token (clique em "Show")

---

#### Secret 3: TWILIO_API_KEY_SID
```
Name: TWILIO_API_KEY_SID
Value: [Cole aqui seu API Key SID]
```
**Onde obter**: 
1. Vá para https://console.twilio.com/us1/develop/video/manage/api-keys
2. Clique em "Create API Key"
3. Name: "MindBoom Spark Staging"
4. Copie o SID (começa com SK...)

---

#### Secret 4: TWILIO_API_KEY_SECRET
```
Name: TWILIO_API_KEY_SECRET
Value: [Cole aqui o Secret da API Key]
```
**Onde obter**: Criado junto com o API Key SID (passo acima)
⚠️ **IMPORTANTE**: Mostrado apenas UMA VEZ durante criação!

---

#### Secret 5: OPENAI_API_KEY
```
Name: OPENAI_API_KEY
Value: [Cole aqui sua OpenAI API Key]
```
**Onde obter**:
1. Vá para https://platform.openai.com/api-keys
2. Clique em "Create new secret key"
3. Name: "MindBoom Spark Staging"
4. Copie a key (começa com sk-proj-...)

---

#### Secret 6 e 7: Agora.io (OPCIONAL)
```
Name: AGORA_APP_ID
Value: [Se usar Agora]

Name: AGORA_APP_CERTIFICATE
Value: [Se usar Agora]
```
**Onde obter**: https://console.agora.io

---

### 💻 Opção 2: Via Terminal (CLI)

Execute estes comandos no terminal:

```bash
# Navigate to project
cd "/Users/rsmacair/Samdekian Dropbox/Samdekian Docs/Mac (2)/Documents/Dev/MindBloom/mind-bloom-therapy-ai"

# Set each secret (substitua os valores)
supabase secrets set TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
supabase secrets set TWILIO_AUTH_TOKEN="seu-auth-token-aqui"
supabase secrets set TWILIO_API_KEY_SID="SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
supabase secrets set TWILIO_API_KEY_SECRET="seu-api-secret-aqui"
supabase secrets set OPENAI_API_KEY="sk-proj-seu-key-aqui"

# Opcional: Agora.io
# supabase secrets set AGORA_APP_ID="seu-app-id"
# supabase secrets set AGORA_APP_CERTIFICATE="seu-certificate"

# Verificar que foram configurados
supabase secrets list
```

---

## ✅ Verificação

Depois de configurar, verifique:

```bash
# Listar todos os secrets (não mostra valores)
supabase secrets list

# Você deve ver:
# NAME
# TWILIO_ACCOUNT_SID
# TWILIO_AUTH_TOKEN
# TWILIO_API_KEY_SID
# TWILIO_API_KEY_SECRET
# OPENAI_API_KEY
```

---

## 🧪 Testar Se Funcionou

```bash
# Test TURN credentials (usa Twilio secrets)
curl -X POST https://aoumioacfvttagverbna.supabase.co/functions/v1/get-turn-credentials

# Deve retornar algo como:
# {
#   "iceServers": [
#     { "urls": "stun:stun.l.google.com:19302" },
#     { "urls": "turn:global.turn.twilio.com:3478", "username": "...", "credential": "..." }
#   ]
# }
```

Se retornar erro 500, verifique os logs:
```bash
supabase functions logs get-turn-credentials
```

---

## 📋 Checklist

- [ ] Acessei o dashboard do Supabase
- [ ] Adicionei TWILIO_ACCOUNT_SID
- [ ] Adicionei TWILIO_AUTH_TOKEN  
- [ ] Criei Twilio API Key e adicionei TWILIO_API_KEY_SID
- [ ] Adicionei TWILIO_API_KEY_SECRET
- [ ] Adicionei OPENAI_API_KEY
- [ ] Verifiquei com `supabase secrets list`
- [ ] Testei com curl
- [ ] Secrets funcionando ✅

---

## ❓ Precisa de Ajuda?

### Não tenho as chaves ainda

**Twilio**:
1. Criar conta em: https://www.twilio.com/try-twilio
2. Verificar email
3. Obter credenciais do dashboard

**OpenAI**:
1. Criar conta em: https://platform.openai.com/signup
2. Adicionar método de pagamento
3. Criar API key

### Erro "Project not found"

```bash
# Re-linkar ao projeto
supabase link --project-ref aoumioacfvttagverbna
```

### Erro ao configurar secret

```bash
# Tentar novamente
supabase secrets set SECRET_NAME="value"

# Ver logs
supabase secrets list
```

---

## 📚 Documentação Completa

👉 **[docs/SECRETS_CONFIGURATION_GUIDE.md](docs/SECRETS_CONFIGURATION_GUIDE.md)**

---

## 🎯 Depois de Configurar os Secrets

### Próximo Passo: Deploy do Frontend

```bash
npm run build:staging
vercel --prod
```

---

**Dashboard de Secrets**: https://supabase.com/dashboard/project/aoumioacfvttagverbna/settings/functions

