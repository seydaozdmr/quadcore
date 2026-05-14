#!/bin/bash
# RetroAction AI — Backend + Frontend başlatıcı

set -e

# .env.local varsa yükle
if [ -f "$(dirname "$0")/.env.local" ]; then
  set -a
  source "$(dirname "$0")/.env.local"
  set +a
  echo "✓ .env.local yüklendi (profil: ${SPRING_PROFILES_ACTIVE:-mock})"
else
  echo "⚠ .env.local bulunamadı, mock profil kullanılıyor"
  export SPRING_PROFILES_ACTIVE=mock
fi

# API key kontrolü
if [ "$SPRING_PROFILES_ACTIVE" = "anthropic" ] && [ -z "$ANTHROPIC_API_KEY" ] || [ "$ANTHROPIC_API_KEY" = "buraya_api_keyini_yaz" ]; then
  echo "⚠ ANTHROPIC_API_KEY ayarlanmamış — mock profile geçiliyor"
  export SPRING_PROFILES_ACTIVE=mock
fi

# Backend başlat (arka planda)
echo "▶ Backend başlatılıyor (localhost:8080)..."
cd "$(dirname "$0")/backend"
./mvnw spring-boot:run -q &
BACKEND_PID=$!

# Frontend başlat (arka planda)
echo "▶ Frontend başlatılıyor (localhost:4200)..."
cd "$(dirname "$0")/frontend"
npm start &
FRONTEND_PID=$!

echo ""
echo "╔══════════════════════════════════════╗"
echo "║  RetroAction AI çalışıyor            ║"
echo "║  Backend  → http://localhost:8080    ║"
echo "║  Frontend → http://localhost:4200    ║"
echo "║  Durdurmak için: Ctrl+C              ║"
echo "╚══════════════════════════════════════╝"

# Her iki process bitince script de bitsin
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait $BACKEND_PID $FRONTEND_PID
