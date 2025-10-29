# 🚀 DEPLOY AGORA - Guia Completo

**Projeto**: MindBoom 3.0 - Twilio  
**Ambiente**: Staging  
**Status**: ✅ Pronto para deploy!

---

## ✅ Já Concluído

- ✅ Repositório: https://github.com/Samdekian/MindBoom-3.0-Twilio
- ✅ Database: Migrado (80 migrations)
- ✅ Edge Functions: 35 funções deployadas
- ✅ Secrets: Configurados e validados
- ✅ Frontend: Build completo (6.22s)
- ✅ Keys do Supabase: Obtidas

---

## 🎯 DEPLOY NO VERCEL (Recomendado)

### Passo 1: Acessar Vercel

Abra: **https://vercel.com/new**

### Passo 2: Importar Repositório

1. Click em **"Import Git Repository"**
2. Cole a URL: `https://github.com/Samdekian/MindBoom-3.0-Twilio`
3. Click **"Import"**

### Passo 3: Configurar Projeto

```
Project Name: mindboom-staging
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build:staging
Output Directory: dist
Install Command: npm install
```

### Passo 4: Adicionar Environment Variables

Click em **"Environment Variables"** e adicione:

#### Variable 1: VITE_SUPABASE_URL
```
Name: VITE_SUPABASE_URL
Value: https://aoumioacfvttagverbna.supabase.co
```

#### Variable 2: VITE_SUPABASE_ANON_KEY
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdW1pb2FjZnZ0dGFndmVyYm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjY5MDQsImV4cCI6MjA3NzMwMjkwNH0.srNAuQMfIGKYqN1n_6dqHh__f1eH4AshtAQc0lxH4BE
```

#### Variable 3: VITE_APP_ENV
```
Name: VITE_APP_ENV
Value: staging
```

### Passo 5: Deploy

1. Click **"Deploy"**
2. Aguarde 2-3 minutos
3. ✅ Deploy completo!

### Passo 6: Obter URL

Após deploy, você receberá uma URL como:
```
https://mindboom-staging.vercel.app
```

---

## 🔄 Alternativa: Deploy via CLI

Se preferir usar o terminal:

```bash
# 1. Instalar Vercel CLI (se necessário)
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
cd "/Users/rsmacair/Samdekian Dropbox/Samdekian Docs/Mac (2)/Documents/Dev/MindBloom/mind-bloom-therapy-ai"
vercel --prod

# 4. Configurar variáveis durante o setup:
# - VITE_SUPABASE_URL: https://aoumioacfvttagverbna.supabase.co
# - VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# - VITE_APP_ENV: staging
```

---

## 🌐 Outras Opções de Deploy

### Netlify

```bash
# 1. Instalar Netlify CLI
npm i -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod --dir=dist

# 4. Configurar variáveis no dashboard:
# https://app.netlify.com → Site settings → Environment variables
```

### AWS S3 + CloudFront

```bash
# 1. Upload para S3
aws s3 sync dist/ s3://your-bucket-name/ --delete

# 2. Invalidar cache do CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Render

1. Acesse: https://dashboard.render.com/
2. New → Static Site
3. Connect repository: `Samdekian/MindBoom-3.0-Twilio`
4. Build command: `npm run build:staging`
5. Publish directory: `dist`
6. Add environment variables

---

## 🔑 Credenciais Supabase (Referência)

```bash
# Supabase URL
https://aoumioacfvttagverbna.supabase.co

# Anon Key (público)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdW1pb2FjZnZ0dGFndmVyYm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjY5MDQsImV4cCI6MjA3NzMwMjkwNH0.srNAuQMfIGKYqN1n_6dqHh__f1eH4AshtAQc0lxH4BE

# Service Role Key (privado - NÃO expor no frontend)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdW1pb2FjZnZ0dGFndmVyYm5hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTcyNjkwNCwiZXhwIjoyMDc3MzAyOTA0fQ.tQw8Wywbvr86sVueu1wptQW_r3KKOeTwSF41dyXoxII
```

⚠️ **IMPORTANTE**: 
- Use apenas **Anon Key** no frontend
- **Service Role Key** é apenas para Edge Functions (já configurado)

---

## ✅ Checklist Pós-Deploy

### 1. Verificar Acesso
- [ ] Acessar URL do deploy
- [ ] Página carrega corretamente
- [ ] Sem erros no console

### 2. Testar Funcionalidades
- [ ] Login funciona
- [ ] Conexão com Supabase OK
- [ ] Video calls funcionam
- [ ] Edge functions respondendo

### 3. Monitoramento
```bash
# Verificar logs de deploy
vercel logs

# Ou no dashboard:
# https://vercel.com/dashboard → Seu projeto → Logs
```

### 4. Validação Completa
```bash
# Execute o script de validação
./scripts/validate-staging.sh
```

---

## 🧪 Testar Endpoints

Após deploy, teste:

### 1. Health Check
```bash
curl https://aoumioacfvttagverbna.supabase.co/functions/v1/system-health
```

### 2. TURN Credentials
```bash
curl -X POST https://aoumioacfvttagverbna.supabase.co/functions/v1/get-turn-credentials
```

### 3. Frontend
```bash
# Substitua pela sua URL do Vercel
curl https://mindboom-staging.vercel.app
```

---

## 📊 Resumo Final

| Componente | Status | URL/Localização |
|------------|--------|-----------------|
| 📂 GitHub | ✅ | https://github.com/Samdekian/MindBoom-3.0-Twilio |
| 🗄️ Database | ✅ | aoumioacfvttagverbna.supabase.co |
| ⚡ Functions | ✅ | /functions/v1/ |
| 🔐 Secrets | ✅ | Configurados |
| 🏗️ Build | ✅ | dist/ (3.9MB) |
| 🌐 Deploy | ⏭️ | **Faça agora!** |

---

## 🆘 Troubleshooting

### Erro: "Missing environment variables"
```bash
# Verifique se configurou todas as variáveis:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
# VITE_APP_ENV
```

### Erro: "Build failed"
```bash
# Rebuild local
npm run build:staging

# Se funcionar local, problema é no host
# Verifique build command no host
```

### Erro: "Cannot connect to Supabase"
```bash
# Verifique se a Anon Key está correta
# Teste o endpoint diretamente:
curl https://aoumioacfvttagverbna.supabase.co/rest/v1/
```

---

## 🔗 Links Rápidos

- **Deploy no Vercel**: https://vercel.com/new
- **Supabase Dashboard**: https://supabase.com/dashboard/project/aoumioacfvttagverbna
- **Repositório**: https://github.com/Samdekian/MindBoom-3.0-Twilio
- **Documentação Completa**: Ver `BUILD_SUCCESS.md`

---

## 🎯 Comando Único (Vercel CLI)

Se quiser deploy rápido via terminal:

```bash
npm i -g vercel && vercel --prod
```

Siga as instruções e configure as variáveis de ambiente quando solicitado.

---

**Tudo pronto! Faça o deploy agora! 🚀**

Escolha Vercel (mais fácil) ou outra plataforma e em 5 minutos estará no ar!

