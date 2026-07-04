#!/usr/bin/env bash
# Deploy STACK XI to pepe.buildingcultureid.space (VPS)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_wgsdex}"
SSH_HOST="${SSH_HOST:-root@187.124.18.204}"
APP_DIR="/var/www/pepe-buildingculture"
DOMAIN="pepe.buildingcultureid.space"
PORT=3015
SERVICE="stack-xi-pepe"

echo "==> Building production bundle (node_server)..."
cd "$ROOT"
if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
  echo "Loaded .env for VITE_* build-time injection"
else
  echo "WARN: No .env — client bundle may miss VITE_* contract addresses"
fi
export NITRO_PRESET=node_server
bun run generate:seo
bun run build

if [[ ! -f "$ROOT/.output/server/index.mjs" ]]; then
  echo "Build failed: .output/server/index.mjs missing"
  exit 1
fi

echo "==> Preparing server directories..."
ssh -i "$SSH_KEY" "$SSH_HOST" "mkdir -p $APP_DIR/dist $APP_DIR/dist/server $APP_DIR/dist/public $APP_DIR/data /var/log/pepe-buildingculture"

echo "==> Syncing build artifacts..."
rsync -az --delete -e "ssh -i $SSH_KEY" \
  "$ROOT/.output/server/" "$SSH_HOST:$APP_DIR/dist/server/"
rsync -az --delete -e "ssh -i $SSH_KEY" \
  "$ROOT/.output/public/" "$SSH_HOST:$APP_DIR/dist/public/"
rsync -az -e "ssh -i $SSH_KEY" \
  "$ROOT/.output/nitro.json" "$SSH_HOST:$APP_DIR/dist/nitro.json"

echo "==> Syncing deploy configs..."
scp -i "$SSH_KEY" "$ROOT/scripts/deploy/stack-xi-pepe.service" "$SSH_HOST:/etc/systemd/system/${SERVICE}.service"
scp -i "$SSH_KEY" "$ROOT/scripts/deploy/pepe.buildingcultureid.space.conf" "$SSH_HOST:/etc/nginx/sites-available/${DOMAIN}.conf"
scp -i "$SSH_KEY" "$ROOT/scripts/deploy/luck-agent.service" "$SSH_HOST:/etc/systemd/system/luck-agent.service"
scp -i "$SSH_KEY" "$ROOT/scripts/deploy/luck-agent.timer" "$SSH_HOST:/etc/systemd/system/luck-agent.timer"
rsync -az -e "ssh -i $SSH_KEY" \
  "$ROOT/scripts/luck-agent-tick.mjs" "$ROOT/scripts/luck-x-post.mjs" \
  "$SSH_HOST:$APP_DIR/scripts/"

if [[ -f "$ROOT/.env" ]]; then
  echo "==> Uploading production .env (server-only secrets)..."
  scp -i "$SSH_KEY" "$ROOT/.env" "$SSH_HOST:$APP_DIR/.env"
  ssh -i "$SSH_KEY" "$SSH_HOST" "chmod 600 $APP_DIR/.env"
else
  echo "WARN: No local .env — copy $APP_DIR/.env on server manually"
fi

echo "==> TLS certificate..."
ssh -i "$SSH_KEY" "$SSH_HOST" bash -s <<REMOTE
set -euo pipefail
if [[ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  certbot certonly --webroot -w /var/www/certbot -d "${DOMAIN}" \
    --non-interactive --agree-tos -m hello@buildingcultureid.space || \
  certbot certonly --nginx -d "${DOMAIN}" \
    --non-interactive --agree-tos -m hello@buildingcultureid.space
fi
ln -sf /etc/nginx/sites-available/${DOMAIN}.conf /etc/nginx/sites-enabled/${DOMAIN}.conf
nginx -t
systemctl reload nginx
REMOTE

echo "==> Starting systemd service..."
ssh -i "$SSH_KEY" "$SSH_HOST" bash -s <<REMOTE
set -euo pipefail
fuser -k ${PORT}/tcp 2>/dev/null || true
systemctl daemon-reload
systemctl enable ${SERVICE}.service
systemctl restart ${SERVICE}.service
systemctl enable luck-agent.timer
systemctl restart luck-agent.timer
sleep 2
systemctl is-active ${SERVICE}.service
curl -sf -o /dev/null -w "local:%{http_code}\n" "http://127.0.0.1:${PORT}/" || true
REMOTE

echo "==> Smoke checks..."
HOME_CODE="$(curl -sf -o /dev/null -w "%{http_code}" "https://${DOMAIN}/" || echo "000")"
HOME_HTML="$(curl -sf "https://${DOMAIN}/" || true)"
if [[ "$HOME_CODE" != "200" ]]; then
  echo "FAIL: home returned HTTP $HOME_CODE (expected 200)"
  exit 1
fi
if echo "$HOME_HTML" | grep -qi "RESET by Building Culture"; then
  echo "FAIL: home is serving RESET app — check nginx port and stack-xi-pepe service"
  exit 1
fi
if ! echo "$HOME_HTML" | grep -qi "STACK"; then
  echo "FAIL: home missing STACK XI branding"
  exit 1
fi
echo "  ✓ home HTTP 200 (STACK XI)"

IMPRINT_HTML="$(curl -sf "https://${DOMAIN}/imprint" || true)"
IMPRINT_CODE="$(curl -sf -o /dev/null -w "%{http_code}" "https://${DOMAIN}/imprint" || echo "000")"
if [[ "$IMPRINT_CODE" != "200" ]]; then
  echo "FAIL: /imprint returned HTTP $IMPRINT_CODE"
  exit 1
fi
if echo "$IMPRINT_HTML" | grep -q "Responsible persons"; then
  echo "  ✓ /imprint renders updated legal content"
else
  echo "WARN: /imprint HTTP 200 but missing expected copy"
fi

echo "==> Done. https://${DOMAIN}/"
