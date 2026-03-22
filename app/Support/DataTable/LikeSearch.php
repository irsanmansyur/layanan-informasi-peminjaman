<?php

namespace App\Support\DataTable;

use Illuminate\Database\Eloquent\Builder;

/**
 * Pencarian teks mengandung (contains) untuk DataTable: escape wildcard + operator per driver DB.
 *
 * **PostgreSQL** — memakai `ILIKE` (case-insensitive native).
 *
 * **MySQL** — memakai `LIKE`. Case sensitivity mengikuti *collation* kolom/string.
 *   Default Laravel (`utf8mb4_unicode_ci` / `utf8mb4_0900_ai_ci`) biasanya **tidak case-sensitive**
 *   untuk huruf Latin, setara praktis dengan ILIKE untuk kebutuhan admin panel.
 *   Jika collation **bin** / `_cs`, `LIKE` bisa jadi case-sensitive; ubah collation kolom atau
 *   nanti bisa diganti ke `whereRaw('LOWER(col) LIKE LOWER(?)', ...)` (lebih berat untuk index).
 *
 * **SQLite** — `LIKE` untuk ASCII umumnya case-insensitive; perilaku Unicode tergantung build SQLite.
 *
 * Semua service yang memakai `DataTableService` dengan `'operator' => 'ilike'` (Users, Roles,
 * Permissions, Activity logs) otomatis memakai pemetaan di atas; tidak perlu duplikasi di tiap service.
 */
final class LikeSearch
{
    public static function escapeWildcards(string $value): string
    {
        return str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $value);
    }

    public static function wrapContainsPattern(string $escapedTerm): string
    {
        return '%'.$escapedTerm.'%';
    }

    public static function caseInsensitiveOperator(Builder $query): string
    {
        return $query->getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';
    }
}
