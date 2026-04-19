<?php

namespace Database\Factories;

use App\Models\Information;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Information>
 */
class InformationFactory extends Factory
{
    protected $model = Information::class;

    /**
     * Sample informational titles with Indonesian flavor.
     *
     * @var list<string>
     */
    protected static array $titles = [
        'Pengumuman Libur Nasional',
        'Pemberitahuan Rapat Bulanan',
        'Informasi Jadwal Maintenance Sistem',
        'Pengumuman Kebijakan Baru',
        'Info Promo Peminjaman Spesial',
        'Pemberitahuan Perubahan Jam Operasional',
        'Informasi Update Aplikasi',
        'Pengumuman Penerimaan Anggota Baru',
        'Pemberitahuan Pelatihan Internal',
        'Info Pembayaran Angsuran',
        'Pengumuman Hari Raya',
        'Pemberitahuan Pemeriksaan Dokumen',
        'Informasi Rapat Koordinasi',
        'Pengumuman Program Tahunan',
        'Info Pembukaan Layanan Baru',
        'Pemberitahuan Audit Internal',
        'Informasi Rekrutmen Pegawai',
        'Pengumuman Gathering Keluarga',
        'Pemberitahuan Kenaikan Suku Bunga',
        'Info Kerjasama Mitra Baru',
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-60 days', '+30 days');
        $endDate = (clone $startDate)->modify('+'.fake()->numberBetween(7, 90).' days');

        return [
            'title' => fake()->randomElement(static::$titles).' '.fake()->numberBetween(1, 999),
            'content' => fake()->paragraphs(fake()->numberBetween(2, 4), true),
            'status' => fake()->randomElement(['aktif', 'tidak aktif']),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
        ];
    }

    /**
     * Indicate that the information is active (status = aktif).
     */
    public function aktif(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'aktif',
        ]);
    }

    /**
     * Indicate that the information is inactive (status = tidak aktif).
     */
    public function tidakAktif(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'tidak aktif',
        ]);
    }

    /**
     * Indicate that the information period is currently ongoing (start past, end future).
     */
    public function ongoing(): static
    {
        return $this->state(function (array $attributes): array {
            $start = fake()->dateTimeBetween('-30 days', '-1 days');
            $end = fake()->dateTimeBetween('+1 days', '+60 days');

            return [
                'start_date' => $start->format('Y-m-d'),
                'end_date' => $end->format('Y-m-d'),
            ];
        });
    }

    /**
     * Indicate that the information is upcoming (start in future).
     */
    public function upcoming(): static
    {
        return $this->state(function (array $attributes): array {
            $start = fake()->dateTimeBetween('+1 days', '+30 days');
            $end = (clone $start)->modify('+'.fake()->numberBetween(7, 60).' days');

            return [
                'start_date' => $start->format('Y-m-d'),
                'end_date' => $end->format('Y-m-d'),
            ];
        });
    }

    /**
     * Indicate that the information period has expired (end in past).
     */
    public function expired(): static
    {
        return $this->state(function (array $attributes): array {
            $start = fake()->dateTimeBetween('-90 days', '-30 days');
            $end = fake()->dateTimeBetween('-29 days', '-1 days');

            return [
                'start_date' => $start->format('Y-m-d'),
                'end_date' => $end->format('Y-m-d'),
            ];
        });
    }
}
