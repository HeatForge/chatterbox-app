#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"
CONTAINER_NAME="chatterbox-postgres"
IMAGE="postgres:17"
MAX_WAIT_SECONDS=60

usage() {
  cat <<'EOF'
Start Docker (via systemctl) and run the local Postgres container.

Reads DATABASE_URL from the project .env file. If the container already
exists it is started; otherwise a new container is created.

Usage: scripts/docker/start-postgres.sh
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: .env file not found at $ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Error: DATABASE_URL is not set in $ENV_FILE" >&2
  exit 1
fi

parse_database_url() {
  local url="${DATABASE_URL#postgresql://}"
  local userpass hostportdb hostport

  userpass="${url%%@*}"
  hostportdb="${url#*@}"

  POSTGRES_USER="${userpass%%:*}"
  POSTGRES_PASSWORD="${userpass#*:}"

  hostport="${hostportdb%%/*}"
  POSTGRES_DB="${hostportdb#*/}"
  POSTGRES_DB="${POSTGRES_DB%%\?*}"

  POSTGRES_HOST="${hostport%%:*}"
  POSTGRES_PORT="${hostport#*:}"

  if [[ -z "$POSTGRES_USER" || -z "$POSTGRES_PASSWORD" || -z "$POSTGRES_DB" ]]; then
    echo "Error: could not parse DATABASE_URL: $DATABASE_URL" >&2
    exit 1
  fi

  if [[ "$POSTGRES_PORT" == "$POSTGRES_HOST" ]]; then
    POSTGRES_PORT="5432"
  fi
}

start_docker() {
  if systemctl is-active --quiet docker 2>/dev/null; then
    echo "Docker is already running"
    return 0
  fi

  echo "Starting Docker via systemctl..."
  if systemctl start docker 2>/dev/null; then
    return 0
  fi

  sudo systemctl start docker
}

wait_for_postgres() {
  local elapsed=0

  echo "Waiting for Postgres to accept connections..."
  while (( elapsed < MAX_WAIT_SECONDS )); do
    if docker exec "$CONTAINER_NAME" pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
      echo "Postgres is ready"
      return 0
    fi

    sleep 1
    elapsed=$((elapsed + 1))
  done

  echo "Error: Postgres did not become ready within ${MAX_WAIT_SECONDS}s" >&2
  docker logs --tail 20 "$CONTAINER_NAME" >&2 || true
  exit 1
}

start_postgres_container() {
  if docker ps --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
    echo "Postgres container '$CONTAINER_NAME' is already running"
    return 0
  fi

  if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
    echo "Starting existing Postgres container '$CONTAINER_NAME'..."
    docker start "$CONTAINER_NAME" >/dev/null
    return 0
  fi

  echo "Creating Postgres container '$CONTAINER_NAME' from $IMAGE..."
  docker run -d \
    --name "$CONTAINER_NAME" \
    -e "POSTGRES_USER=$POSTGRES_USER" \
    -e "POSTGRES_PASSWORD=$POSTGRES_PASSWORD" \
    -e "POSTGRES_DB=$POSTGRES_DB" \
    -p "${POSTGRES_PORT}:5432" \
    "$IMAGE" >/dev/null
}

parse_database_url
start_docker
start_postgres_container
wait_for_postgres

echo "Postgres is running at ${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
