# GitHub Authentication Setup

## Personal Access Token (Recomendado)

### 1. Criar Token no GitHub

1. Vá para: https://github.com/settings/tokens/new
2. Configure:
   - **Note**: "MindBoom Spark Development"
   - **Expiration**: 90 days (ou mais)
   - **Scopes** (marque estes):
     - ✓ repo (Full control of private repositories)
     - ✓ workflow
3. Clique em "Generate token"
4. **COPIE O TOKEN IMEDIATAMENTE** (mostrado apenas uma vez)

### 2. Configurar Git para Usar o Token

Duas opções:

#### Opção A: Durante o Push (Mais Simples)

Quando você fizer `git push`, o Git pedirá:
- **Username**: Samdekian
- **Password**: [Cole seu token aqui, não sua senha do GitHub]

#### Opção B: Salvar no Keychain (macOS)

```bash
# Configurar credential helper
git config --global credential.helper osxkeychain

# Fazer push (pedirá credenciais uma vez)
git push -u origin main
# Username: Samdekian
# Password: [seu token]

# Futuras operações não pedirão mais!
```

### 3. Fazer Push

```bash
cd "/Users/rsmacair/Samdekian Dropbox/Samdekian Docs/Mac (2)/Documents/Dev/MindBloom/mind-bloom-therapy-ai"

# Push main
git push -u origin main

# Push develop
git push -u origin develop
```

## SSH Key (Alternativa)

### 1. Gerar SSH Key

```bash
# Gerar nova chave SSH
ssh-keygen -t ed25519 -C "samdekian@users.noreply.github.com"

# Pressione Enter para aceitar localização padrão
# Digite senha (ou deixe vazia)
```

### 2. Adicionar ao GitHub

```bash
# Copiar chave pública
cat ~/.ssh/id_ed25519.pub | pbcopy

# Ou exibir para copiar manualmente
cat ~/.ssh/id_ed25519.pub
```

1. Vá para: https://github.com/settings/keys
2. Clique em "New SSH key"
3. Title: "MacBook MindBoom"
4. Key: Cole a chave copiada
5. Clique em "Add SSH key"

### 3. Trocar Remote para SSH

```bash
# Atualizar remote para usar SSH
git remote set-url origin git@github.com:Samdekian/mind-boom-spark.git

# Fazer push
git push -u origin main
git push -u origin develop
```

## Verificação

```bash
# Verificar remote configurado
git remote -v

# Testar conexão
git ls-remote origin
```

---

**Recomendação**: Use Personal Access Token (Opção 1) - é mais rápido!
