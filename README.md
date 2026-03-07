# Laravel Inertia Starter Kit

Project ini paket awal buat aplikasi admin pakai Laravel + React (Inertia). Udah ada user, role, permission, sama activity log. Bisa dipake buat mulai project baru atau buat belajar.

## Persyaratan

Butuh PHP 8.2+, Composer, sama Node.js (LTS cukup). Database default SQLite; kalau mau pake MySQL/PostgreSQL tinggal atur di `.env`.

## Pasang project

Clone repo ini, terus jalanin:

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Kalau pake SQLite, buat dulu file database-nya:

```bash
touch database/database.sqlite
```

Lalu migrate dan seed:

```bash
php artisan migrate
php artisan db:seed
```

Frontend:

```bash
npm install
npm run dev
```

Di terminal lain jalanin server Laravel:

```bash
php artisan serve
```

Terus buka http://localhost:8000.

## Login pertama

Setelah seed, bisa login pake akun admin:

- Email: **admin@app.com**
- Password: **rahasia!**

(Ganti password ini kalo mau dipake beneran.)

## Fitur

- **Auth** — Login, register, verifikasi email, 2FA, reset password
- **Users** — CRUD user, bulk delete
- **Roles** — CRUD role, assign permission
- **Permissions** — CRUD permission, dikelompokin per modul
- **Activity Logs** — Riwayat create/update/delete
- **Settings** — Profile, ganti password, tema (light/dark), two-factor

## Development

Satu perintah buat server + queue + Vite:

```bash
composer dev
```

## Test

```bash
php artisan test
```

Cuma mau test modul Management:

```bash
php artisan test tests/Feature/Management/
```

## Perintah lain

- `composer setup` — Install dependency, key, migrate, build sekaligus
- `composer lint` — Cek style PHP (Pint)
- `npm run lint` — Cek style JS/TS
- `npm run build` — Build asset production

## SSR (Server-Side Rendering)

Inertia bisa render halaman di server dulu biar SEO dan first paint lebih oke. Di development bisa pake script yang udah disediain:

```bash
composer dev:ssr
```

Ini jalanin server Laravel, queue, log (pail), sama proses SSR sekaligus.

**Production:** Aktifin SSR di `config/inertia.php` (`ssr.enabled => true`), terus build bundle SSR:

```bash
npm run build:ssr
```

Nanti Laravel akan nyari bundle di `bootstrap/ssr/`. Proses Node buat SSR harus jalan terus; bisa dijalankan manual (`php artisan inertia:start-ssr`) atau di-manage pake PM2/Supervisor (lihat bawah).

## Production: PM2 & Supervisor

Di production, queue worker dan (kalau pake SSR) proses Inertia SSR harus jalan terus. Bisa pake **PM2** atau **Supervisor**.

### PM2

PM2 buat jaga proses Node (SSR) sama queue worker tetep jalan. Contoh `ecosystem.config.cjs` di root project:

```js
module.exports = {
  apps: [
    {
      name: 'inertia-ssr',
      script: 'php',
      args: 'artisan inertia:start-ssr',
      cwd: '/path/to/project',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
    },
    {
      name: 'queue',
      script: 'php',
      args: 'artisan queue:work --tries=3',
      cwd: '/path/to/project',
      interpreter: 'none',
      autorestart: true,
    },
  ],
};
```

Ganti `/path/to/project` sama path project lo. Jalankan: `pm2 start ecosystem.config.cjs`.

### Supervisor

Supervisor cocok buat proses PHP (queue worker). Contoh config di `/etc/supervisor/conf.d/laravel-worker.conf`:

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/project/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/path/to/project/storage/logs/worker.log
```

Lalu `supervisorctl reread`, `supervisorctl update`, `supervisorctl start laravel-worker`. Kalau pake SSR, proses Node-nya tetep perlu dijalankan terpisah (misalnya pake PM2 di atas atau systemd).

## Dokumentasi

- **[DataTable (frontend)](resources/js/components/datatables/README.md)** — Cara pake komponen tabel (search, filter, sort, pagination, export) di halaman React.
