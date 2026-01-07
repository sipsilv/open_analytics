#!/bin/bash
# Rubik Analytics - Docker Stop Script
# Stops all services

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==========================================="
echo "  Rubik Analytics - Docker Stop"
echo "==========================================="
echo ""

# Check if docker-compose is available
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "[ERROR] docker-compose is not installed."
    exit 1
fi

echo "[INFO] Stopping services..."
$COMPOSE_CMD down

echo ""
echo "[OK] All services stopped"
echo ""

