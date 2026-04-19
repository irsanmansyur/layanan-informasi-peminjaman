# Deploy ke VPS dengan Docker + FrankenPHP

Panduan deploy aplikasi ini ke VPS menggunakan FrankenPHP dalam container Docker, dengan SQLite sebagai database, dan reverse proxy eksternal (Traefik / Nginx / Cloudflare tunnel) yang mengurus TLS.

---

## 1. Arsitektur

```
┌─────────────────────────┐        ┌──────────────────────────────┐
│  Reverse proxy (TLS)    │ HTTPS  │  FrankenPHP container :8000  │
│  Traefik / Nginx / CF   ├───────▶│  ├─ Caddy/FrankenPHP (web)   │
│  (terminates HTTPS)     │  HTTP  │  ├─ queue:work               │
│                         │        │  ├─ schedule:work            │
└─────────────────────────┘        │  └─ inertia:start-ssr        │
                                    │                              │
                                    │  Volume: app-storage         │
                                    │   └─ storage/app/database/   │
                                    │      └─ database.sqlite      │
                                    └──────────────────────────────┘
```

- Container expose port **8000** (HTTP) di jaringan docker internal.
- TLS dihandle upstream — setting `auto_https off` di Caddyfile.
- Container menjalankan 4 proses via supervisord.
- Data persisten di named volume `app-storage` dan `app-bootstrap-cache`.

---

## 2. Persiapan VPS

Hanya perlu Docker + Docker Compose (v2):

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
newgrp docker
docker compose version   # pastikan v2+
```

Pilih reverse proxy (contoh Traefik di section 6). Siapkan domain yang A-record-nya mengarah ke IP VPS.

---

## 3. Clone project & siapkan env

```bash
git clone <REPO_URL> /opt/laravel-inertia
cd /opt/laravel-inertia

cp .env.production.example .env.production
```

Edit `.env.production`:

| Variabel            | Wajib diisi                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| `APP_KEY`           | Generate: lihat step 4                                                   |
| `APP_URL`           | URL publik, mis. `https://kios95.id`                                     |
| `APP_NAME`          | Nama aplikasi                                                            |
| `TRUSTED_PROXIES`   | Biarkan `*` (aman karena jaringan docker private). Dipakai oleh `bootstrap/app.php` → `trustProxies()` sehingga `X-Forwarded-Proto`/`Host`/`For` dari reverse proxy dihormati. |
| `MAIL_*`            | Sesuaikan SMTP/SES/Mailgun bila memakai email                            |

> `SESSION_SECURE_COOKIE=true` sudah diset — pastikan akses selalu via HTTPS.

---

## 4. Build image & generate APP_KEY

```bash
# Build image pertama kali
docker compose build

# Generate APP_KEY (tempelkan outputnya ke .env.production)
docker compose run --rm app php artisan key:generate --show
```

---

## 5. Jalankan stack

```bash
docker compose up -d
docker compose logs -f app
```

Entrypoint akan otomatis:
1. Membuat file SQLite di `/app/storage/app/database/database.sqlite` (di volume).
2. Menjalankan `php artisan migrate --force`.
3. Membuat symlink `public/storage`.
4. Caching config/route/view.
5. Menyalakan supervisord → FrankenPHP + queue + scheduler + SSR.

Verifikasi:

```bash
# Health dari dalam docker network
docker compose exec app curl -fsS http://127.0.0.1:8000/up
# atau (kalau port di-publish ke localhost)
curl -fsS http://127.0.0.1:8000/up
```

Seed data awal (opsional, hanya sekali):

```bash
docker compose exec app php artisan db:seed --force
```

---

## 6. Reverse proxy

### Opsi A — Traefik (rekomendasi)

Pastikan Traefik sudah jalan dengan network eksternal bernama `proxy` dan resolver `letsencrypt`.

Edit `docker-compose.yml`:

```yaml
services:
  app:
    # ... existing config ...
    networks:
      - default
      - proxy
    labels:
      - traefik.enable=true
      - traefik.docker.network=proxy
      - traefik.http.routers.kios95.rule=Host(`kios95.id`)
      - traefik.http.routers.kios95.entrypoints=websecure
      - traefik.http.routers.kios95.tls.certresolver=letsencrypt
      - traefik.http.services.kios95.loadbalancer.server.port=8000

networks:
  proxy:
    external: true
```

Lalu `docker compose up -d`.

### Opsi B — Nginx di host VPS

1. Di `docker-compose.yml` aktifkan blok `ports: - "127.0.0.1:8000:8000"`.
2. Nginx server block di host:

   ```nginx
   server {
       listen 443 ssl http2;
       server_name kios95.id;

       ssl_certificate     /etc/letsencrypt/live/kios95.id/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/kios95.id/privkey.pem;

       client_max_body_size 120M;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host              $host;
           proxy_set_header X-Real-IP         $remote_addr;
           proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_http_version 1.1;
       }
   }
   ```

### Opsi C — Cloudflare Tunnel

1. Install `cloudflared` di VPS, buat tunnel.
2. `config.yml`:
   ```yaml
   ingress:
     - hostname: kios95.id
       service: http://localhost:8000
     - service: http_status:404
   ```
3. Di `docker-compose.yml` publish port ke localhost: `ports: ["127.0.0.1:8000:8000"]`.

---

## 7. Update / redeploy

```bash
cd /opt/laravel-inertia
git pull
docker compose build
docker compose up -d          # rolling restart
docker compose logs -f app
```

Migration baru dijalankan otomatis oleh entrypoint.

---

## 8. Backup SQLite

Karena database hanya 1 file di volume, backup cukup copy file:

```bash
# Cadangkan (konsisten, via SQLite .backup yang aman saat DB sedang dipakai)
docker compose exec app sqlite3 \
    /app/storage/app/database/database.sqlite \
    ".backup /tmp/backup.sqlite"
docker compose cp app:/tmp/backup.sqlite ./backup-$(date +%F).sqlite
docker compose exec app rm /tmp/backup.sqlite
```

> Catatan: image tidak menyertakan binary `sqlite3` secara default. Bila perlu, tambahkan `sqlite3` ke daftar apt di `Dockerfile`, atau cukup copy file langsung saat container berhenti sebentar.

Atau backup seluruh volume:

```bash
docker run --rm \
    -v laravel-inertia_app-storage:/data \
    -v "$PWD":/out \
    alpine tar czf /out/storage-$(date +%F).tgz -C /data .
```

---

## 9. Troubleshooting

| Gejala                                       | Penyebab & fix                                                                                           |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `500` tapi log kosong                        | `APP_KEY` belum diisi atau `storage/` tidak writable. Cek `docker compose logs app`.                     |
| Redirect loop HTTPS                          | `SESSION_SECURE_COOKIE=true` sementara akses via HTTP, **atau** `TRUSTED_PROXIES` tidak terbaca. Cek bahwa `bootstrap/app.php` memanggil `trustProxies()` (sudah disertakan). |
| URL image dari Storage salah (pakai http:…)  | `APP_URL` belum di-set ke domain HTTPS Anda. Edit `.env.production` → `docker compose up -d`.            |
| Asset Vite 404                               | Stage `node-builder` gagal. Jalankan `docker compose build --no-cache app`.                              |
| SSR error                                    | Cek `docker compose logs app | grep inertia-ssr`. Pastikan `bootstrap/ssr/ssr.js` ada (build SSR sukses). |
| Migration error pertama boot                 | Cek `docker compose logs app` bagian `[entrypoint]`. SQLite file permission harus `www-data:www-data`.    |

---

## 10. Ringkasan command

```bash
docker compose build                           # build image
docker compose up -d                           # start (detached)
docker compose logs -f app                     # lihat log
docker compose exec app php artisan tinker     # shell laravel
docker compose exec app php artisan db:seed    # seed
docker compose restart app                     # restart
docker compose down                            # stop (volume tetap)
docker compose down -v                         # stop + hapus data (hati-hati!)
```
