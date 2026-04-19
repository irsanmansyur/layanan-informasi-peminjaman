# syntax=docker/dockerfile:1.7

# =============================================================================
# Stage 1: Resolve PHP dependencies with Composer.
# We use --ignore-platform-req=php because `composer:2` may not ship PHP 8.4
# yet, and we only need it to resolve/download packages; the real PHP runtime
# comes from the FrankenPHP image below.
# =============================================================================
FROM composer:2 AS composer-deps

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --ignore-platform-req=php


# =============================================================================
# Stage 2: Build frontend assets.
# We use the FrankenPHP image (PHP 8.4) as the base, then add Bun + Node,
# because @laravel/vite-plugin-wayfinder invokes `php artisan` during the
# Vite build to generate route helpers. So we need BOTH Bun and PHP here.
# =============================================================================
FROM dunglas/frankenphp:1-php8.4-bookworm AS frontend-builder

# Composer binary (FrankenPHP image doesn't ship one)
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

# hadolint ignore=DL3008,DL3015
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
        git \
        unzip \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && npm install -g --no-audit --no-fund bun \
    && install-php-extensions \
        pdo_sqlite \
        intl \
        zip \
        bcmath \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Application source
COPY . .

# 2. Vendor (needed so `php artisan` boots when Wayfinder plugin runs)
COPY --from=composer-deps /app/vendor ./vendor

# 3. Regenerate optimized autoloader (no scripts to avoid artisan side effects)
RUN composer dump-autoload \
    --optimize \
    --classmap-authoritative \
    --no-dev \
    --no-scripts

# 4. Install JS deps with Bun (matches bun.lock)
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# 5. Build client bundle (SSR dinonaktifkan di config/inertia.php).
#    A throwaway .env is created just long enough for the Wayfinder plugin to
#    boot `php artisan` — everything is done in a single layer so the temp
#    .env never appears in `docker history` and can't shadow the real one.
RUN cp .env.example .env \
    && php artisan key:generate --no-interaction --ansi \
    && bun run build \
    && rm -f .env


# =============================================================================
# Stage 3: Final runtime image — FrankenPHP + Node (for SSR) + supervisord
# =============================================================================
FROM dunglas/frankenphp:1-php8.4-bookworm AS runtime

# hadolint ignore=DL3008,DL3015
# Node.js TIDAK diinstal di runtime karena Inertia SSR dinonaktifkan.
# Kalau SSR diaktifkan kembali, tambahkan blok nodesource seperti di
# stage frontend-builder.
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
        supervisor \
        dumb-init \
    && install-php-extensions \
        pdo_sqlite \
        intl \
        zip \
        bcmath \
        opcache \
        pcntl \
        gd \
        exif \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Tell FrankenPHP to bind HTTP only (reverse proxy will handle TLS externally)
ENV SERVER_NAME=":8000"

WORKDIR /app

# Copy production-grade php.ini
COPY docker/php.ini /usr/local/etc/php/conf.d/zz-app.ini

# Copy Caddyfile
COPY docker/Caddyfile /etc/caddy/Caddyfile

# Copy supervisord config
COPY docker/supervisord.conf /etc/supervisor/conf.d/app.conf

# Copy entrypoint
COPY docker/entrypoint.sh /usr/local/bin/app-entrypoint
RUN chmod +x /usr/local/bin/app-entrypoint

# Copy application (source + vendor + built assets) from frontend-builder
COPY --from=frontend-builder /app /app

# Ensure storage + sqlite directories exist with correct permissions
RUN mkdir -p \
        /app/storage/app/public \
        /app/storage/app/database \
        /app/storage/framework/cache/data \
        /app/storage/framework/sessions \
        /app/storage/framework/testing \
        /app/storage/framework/views \
        /app/storage/logs \
        /app/bootstrap/cache \
    && chown -R www-data:www-data /app/storage /app/bootstrap/cache \
    && chmod -R ug+rwX /app/storage /app/bootstrap/cache

# Port FrankenPHP listens on (matches SERVER_NAME and Caddyfile)
EXPOSE 8000

# Healthcheck (reverse proxy should also check this)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8000/up || exit 1

ENTRYPOINT ["dumb-init", "--", "/usr/local/bin/app-entrypoint"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf", "-n"]
