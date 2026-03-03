# Laravel Inertia Starter Kit

Starter kit untuk aplikasi admin berbasis Laravel dan React (Inertia). Sudah dilengkapi manajemen user, role, permission, dan activity log. Cocok dipakai sebagai titik awal project baru atau pembelajaran.

## Yang perlu diinstall

- PHP 8.2 atau lebih baru
- Composer
- Node.js (versi LTS disarankan)
- Database: SQLite (default), atau MySQL/PostgreSQL kalau mau

## Cara pasang

1. Clone project ini.

2. Install dependency PHP:
   ```bash
   composer install
   ```

3. Copy file environment:
   ```bash
   cp .env.example .env
   ```

4. Generate key aplikasi:
   ```bash
   php artisan key:generate
   ```

5. Buat database SQLite (kalau pakai SQLite):
   ```bash
   touch database/database.sqlite
   ```

6. Jalankan migration:
   ```bash
   php artisan migrate
   ```

7. Isi data awal (permission, role, user admin):
   ```bash
   php artisan db:seed
   ```

8. Install dependency frontend:
   ```bash
   npm install
   ```

9. Build asset (development):
   ```bash
   npm run dev
   ```

10. Di terminal lain, jalankan server:
    ```bash
    php artisan serve
    ```

Buka http://localhost:8000 di browser.

## Login pertama kali

Setelah seeding, gunakan akun admin ini:

- **Email:** admin@app.com
- **Password:** rahasia!

*(Jangan lupa ganti password kalau dipakai di production.)*

## Fitur yang tersedia

- **Auth:** Login, register, verifikasi email, 2FA, reset password
- **Management Users:** CRUD user, bulk delete
- **Management Roles:** CRUD role, assign permission
- **Management Permissions:** CRUD permission, dikelompokkan per modul
- **Activity Logs:** Catatan aktivitas (create, update, delete)
- **Settings:** Profile, ganti password, appearance (theme), two-factor

## Menjalankan development (sekali jalan)

Kalau mau satu perintah untuk server + queue + frontend:

```bash
composer dev
```

## Menjalankan test

```bash
php artisan test
```

Untuk test modul Management saja:

```bash
php artisan test tests/Feature/Management/
```

## Script lain yang berguna

- `composer setup` — install semua dependency, generate key, migrate, dan build
- `composer lint` — cek style PHP (Pint)
- `npm run lint` — cek style frontend
- `npm run build` — build asset untuk production
