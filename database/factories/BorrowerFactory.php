<?php

namespace Database\Factories;

use App\Models\Borrower;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<Borrower>
 */
class BorrowerFactory extends Factory
{
    protected $model = Borrower::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $borrowedAt = fake()->dateTimeBetween('-180 days', '-1 days');

        // Nominal realistis (ribuan rupiah dibulatkan per 50.000)
        $total = fake()->numberBetween(2, 200) * 50000;

        return [
            'name' => fake()->name(),
            'total' => $total,
            'status' => 'belum lunas',
            'borrowed_at' => $borrowedAt->format('Y-m-d'),
            'paid_off_at' => null,
        ];
    }

    /**
     * Indicate that the borrower has not paid off yet.
     */
    public function belumLunas(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'belum lunas',
            'paid_off_at' => null,
        ]);
    }

    /**
     * Indicate that the borrower has paid off the loan.
     */
    public function lunas(): static
    {
        return $this->state(function (array $attributes): array {
            $borrowedAt = Carbon::parse($attributes['borrowed_at']);

            // paid_off_at harus setelah borrowed_at, maksimal hari ini
            $paidOffAt = fake()->dateTimeBetween(
                $borrowedAt->copy()->addDay()->format('Y-m-d'),
                'now',
            );

            return [
                'status' => 'lunas',
                'paid_off_at' => $paidOffAt->format('Y-m-d'),
            ];
        });
    }
}
