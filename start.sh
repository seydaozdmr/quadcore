#!/bin/bash
# RetroAction AI — Backend + Frontend başlatıcı

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

# .env.local varsa yükle
if [ -f "$ROOT/.env.local" ]; then
  set -a
  source "$ROOT/.env.local"
  set +a
  echo "✓ .env.local yüklendi (profil: ${SPRING_PROFILES_ACTIVE:-mock})"
else
  echo "⚠ .env.local bulunamadı, mock profil kullanılıyor"
  export SPRING_PROFILES_ACTIVE=mock
fi

# PostgreSQL profili aktifse Docker Compose başlat
if echo "${SPRING_PROFILES_ACTIVE}" | grep -q "postgres"; then
  echo "▶ PostgreSQL başlatılıyor (Docker Compose)..."
  docker compose -f "$ROOT/docker-compose.yml" up -d

  echo "⏳ PostgreSQL hazır olana kadar bekleniyor..."
  until docker exec retroaction-db pg_isready -U retro -d retrodb -q 2>/dev/null; do
    sleep 1
  done
  echo "✓ PostgreSQL hazır"
fi

# API key kontrolü
if echo "${SPRING_PROFILES_ACTIVE}" | grep -q "anthropic"; then
  if [ -z "$ANTHROPIC_API_KEY" ] || [ "$ANTHROPIC_API_KEY" = "buraya_api_keyini_yaz" ]; then
    echo "⚠ ANTHROPIC_API_KEY ayarlanmamış — mock profile geçiliyor"
    export SPRING_PROFILES_ACTIVE=mock
  fi
fi

# Backend başlat (arka planda)
echo "▶ Backend başlatılıyor (localhost:8080)..."
cd "$ROOT/backend"
./mvnw spring-boot:run -q &
BACKEND_PID=$!

# Frontend başlat (arka planda)
echo "▶ Frontend başlatılıyor (localhost:3000)..."
cd "$ROOT"
npm run dev --silent &
FRONTEND_PID=$!

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  RetroAction AI çalışıyor                ║"
echo "║  Backend  → http://localhost:8080        ║"
echo "║  Frontend → http://localhost:3000        ║"
echo "║  H2/PG    → http://localhost:8080/h2-console ║"
echo "║  Durdurmak için: Ctrl+C                  ║"
echo "╚══════════════════════════════════════════╝"

cleanup() {
  echo ""
  echo "Durduruluyor..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
}
trap cleanup EXIT INT TERM
wait $BACKEND_PID $FRONTEND_PID
