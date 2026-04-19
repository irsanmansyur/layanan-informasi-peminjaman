<?php

namespace App\Models;

use Database\Factories\InformationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Information extends Model
{
    /** @use HasFactory<InformationFactory> */
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * Laravel treats 'Information' as uncountable so we must be explicit.
     *
     * @var string
     */
    protected $table = 'informations';

    protected $fillable = [
        'title',
        'content',
        'status',
        'start_date',
        'end_date',
    ];

    /**
     * The "type" of the auto-incrementing ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::bootHasUuid();
    }

    protected static function bootHasUuid(): void
    {
        static::creating(function (self $model): void {
            if (! $model->getKey()) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }
}
