#!/bin/bash

# Script de Rebuild Rápido
# Para testar as correções de vídeo mobile

echo "🔧 Iniciando rebuild..."
echo ""

# 1. Limpar cache de build
echo "🗑️  Limpando cache..."
rm -rf dist/
rm -rf node_modules/.vite/
echo "✅ Cache limpo"
echo ""

# 2. Rebuild
echo "📦 Rebuilding aplicação..."
npm run build
echo "✅ Build concluído"
echo ""

echo "✅ Rebuild completo!"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute: npm run dev"
echo "2. Desktop: Pressione Ctrl+Shift+R (ou Cmd+Shift+R no Mac)"
echo "3. Mobile: Feche o navegador completamente e reabra"
echo ""
echo "🔍 Verifique no console:"
echo "  ✅ SEM erros 406/400"
echo "  ✅ SEM 'Cannot add ICE candidate'"
echo "  ✅ SEM múltiplos 'wrong signaling state'"
echo "  ✅ VER 'ICE candidate queued' → 'processed'"
echo ""

