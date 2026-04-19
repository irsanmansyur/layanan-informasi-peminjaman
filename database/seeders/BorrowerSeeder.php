<?php

namespace Database\Seeders;

use App\Models\Borrower;
use Illuminate\Database\Seeder;

class BorrowerSeeder extends Seeder
{
    /**
     * Seed daftar peminjam dengan variasi status dan nominal.
     */
    public function run(): void
    {
        // 30 peminjam aktif (belum lunas) — akan tampil di halaman welcome
        Borrower::factory()
            ->count(30)
            ->belumLunas()
            ->create();

        // 20 peminjam yang sudah lunas — sebagai arsip/riwayat
        Borrower::factory()
            ->count(20)
            ->lunas()
            ->create();

        // Beberapa contoh nominal besar supaya urutan pada halaman welcome
        // (orderByDesc('total') di HomeController) terlihat jelas variasinya.
        Borrower::factory()
            ->count(3)
            ->belumLunas()
            ->state(fn () => [
                'total' => fake()->numberBetween(20, 50) * 1000000, // 20–50 juta
            ])
            ->create();
    }
}
