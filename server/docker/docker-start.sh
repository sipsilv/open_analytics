#!/bin/bash
# Rubik Analytics - Docker Start Script
# Starts all services using Docker Compose

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==========================================="
echo "  Rubik Analytics - Docker Start"
echo "==========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "[ERROR] docker-compose is not installed. Please install Docker Compose."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "[INFO] .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "[WARNING] Please edit .env file with your configuration before starting!"
        echo "[WARNING] Especially update JWT_SECRET_KEY, JWT_SYSTEM_SECRET_KEY, and ENCRYPTION_KEY"
        read -p "Press Enter to continue or Ctrl+C to cancel..."
    fi
fi

echo "[INFO] Building and starting services..."
$COMPOSE_CMD up -d --build

echo ""
echo "==========================================="
echo "  Services Started"
echo "==========================================="
echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop:      docker-compose down"
echo ""

