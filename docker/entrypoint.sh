#!/usr/bin/env bash
set -Eeuo pipefail

# ============================================================
# Container entrypoint for the Laravel + FrankenPHP production
# image. Runs one-shot initialization, then exec's the CMD
# (supervisord) as PID 1 (via dumb-init).
# ============================================================

APP_DIR="/app"
STORAGE_DIR="${APP_DIR}/storage"
BOOTSTRAP_CACHE_DIR="${APP_DIR}/bootstrap/cache"

# ------------------------------------------------------------
# 1. Resolve SQLite location and make sure the file exists.
#    DB_DATABASE should point to a file inside a persisted volume.
# ------------------------------------------------------------
if [[ "${DB_CONNECTION:-sqlite}" == "sqlite" ]]; then
    DB_PATH="${DB_DATABASE:-${APP_DIR}/storage/app/database/database.sqlite}"
    DB_DIR="$(dirname "${DB_PATH}")"
    mkdir -p "${DB_DIR}"
    if [[ ! -f "${DB_PATH}" ]]; then
        echo "[entrypoint] Creating SQLite database at ${DB_PATH}"
        touch "${DB_PATH}"
    fi
fi

# ------------------------------------------------------------
# 2. Ensure storage & bootstrap/cache are writable.
#    Volumes mounted from the host may reset ownership on boot.
# ------------------------------------------------------------
mkdir -p \
    "${STORAGE_DIR}/app/public" \
    "${STORAGE_DIR}/app/database" \
    "${STORAGE_DIR}/framework/cache/data" \
    "${STORAGE_DIR}/framework/sessions" \
    "${STORAGE_DIR}/framework/views" \
    "${STORAGE_DIR}/logs" \
    "${BOOTSTRAP_CACHE_DIR}"

chown -R www-data:www-data "${STORAGE_DIR}" "${BOOTSTRAP_CACHE_DIR}" || true
chmod -R ug+rwX "${STORAGE_DIR}" "${BOOTSTRAP_CACHE_DIR}" || true

# ------------------------------------------------------------
# 3. APP_KEY — fail fast if missing.
#    An auto-generated key would be lost on container restart,
#    silently invalidating sessions. Better to refuse to boot.
# ------------------------------------------------------------
if [[ -z "${APP_KEY:-}" ]]; then
    cat >&2 <<'ERR'
[entrypoint] FATAL: APP_KEY is not set.

Generate one and put it in your .env.production:

    docker compose run --rm app php artisan key:generate --show

Then copy the output into APP_KEY=... and restart.
ERR
    exit 1
fi

# Helper: run artisan as www-data so file ownership stays consistent.
artisan() {
    runuser -u www-data -- php /app/artisan "$@"
}

# ------------------------------------------------------------
# 4. Public storage symlink (idempotent).
# ------------------------------------------------------------
if [[ ! -L "${APP_DIR}/public/storage" ]]; then
    artisan storage:link --force || true
fi

# ------------------------------------------------------------
# 5. Run migrations on boot (safe, idempotent).
#    Disable with RUN_MIGRATIONS=false if you prefer manual control.
# ------------------------------------------------------------
if [[ "${RUN_MIGRATIONS:-true}" == "true" ]]; then
    echo "[entrypoint] Running database migrations…"
    artisan migrate --force --no-interaction
fi

# ------------------------------------------------------------
# 6. Discover packages + cache framework files for performance.
#    All run as www-data so cache files are owned correctly.
# ------------------------------------------------------------
echo "[entrypoint] Discovering packages and caching config/routes/views…"
artisan package:discover --ansi
artisan config:cache
artisan route:cache || true   # may fail if routes use closures
artisan view:cache
artisan event:cache || true

# ------------------------------------------------------------
# 7. Hand off to the CMD (supervisord).
# ------------------------------------------------------------
echo "[entrypoint] Starting supervisord…"
exec "$@"
