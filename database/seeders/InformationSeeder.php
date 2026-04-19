<?php

namespace Database\Seeders;

use App\Models\Information;
use Illuminate\Database\Seeder;

class InformationSeeder extends Seeder
{
    /**
     * Seed 20 dummy informations with varied status and date ranges.
     */
    public function run(): void
    {
        // 7 ongoing & aktif (currently running, visible as active)
        Information::factory()
            ->count(7)
            ->aktif()
            ->ongoing()
            ->create();

        // 4 upcoming & aktif (scheduled for future)
        Information::factory()
            ->count(4)
            ->aktif()
            ->upcoming()
            ->create();

        // 4 expired & aktif (status aktif tapi periode sudah lewat)
        Information::factory()
            ->count(4)
            ->aktif()
            ->expired()
            ->create();

        // 3 ongoing & tidak aktif (dimatikan manual)
        Information::factory()
            ->count(3)
            ->tidakAktif()
            ->ongoing()
            ->create();

        // 2 expired & tidak aktif (arsip lama)
        Information::factory()
            ->count(2)
            ->tidakAktif()
            ->expired()
            ->create();
    }
}
