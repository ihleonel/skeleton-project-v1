#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  bootstrap.sh — First-run helper
#  Usage: bash scripts/bootstrap.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

GREEN="\033[0;32m"
YELLOW="\033[1;33m"
NC="\033[0m"

info()    { echo -e "${GREEN}[bootstrap]${NC} $*"; }
warning() { echo -e "${YELLOW}[warning]${NC} $*"; }

# 1. Create .env from example if it doesn't exist
if [[ ! -f .env ]]; then
  info "Creating .env from .env.example …"
  cp .env.example .env
  warning "Edit .env and replace all 'changeme' values before continuing."
  echo
fi

# 2. Build images
info "Building Docker images (--no-cache) …"
docker compose build --no-cache

# 3. Start services
info "Starting services …"
docker compose up -d

# 4. Wait for backend to be healthy then create a superuser
info "Waiting for backend to be ready …"
sleep 5

info "Running Django migrations …"
docker compose exec backend python manage.py migrate --noinput

echo
info "✅  All services are up!"
echo
echo "  Frontend  →  http://localhost"
echo "  API       →  http://localhost/api/"
echo "  Admin     →  http://localhost/admin/"
echo
echo "  To create a Django superuser:"
echo "    docker compose exec backend python manage.py createsuperuser"
echo
