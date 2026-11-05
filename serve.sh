#!/usr/bin/env sh
# Локальный сервер для уроков: BroadcastChannel и другие API требуют настоящий origin, а не file://
cd "$(dirname "$0")" && echo "Открывайте: http://localhost:${1:-8137}/lessons/" && python3 -m http.server "${1:-8137}"
