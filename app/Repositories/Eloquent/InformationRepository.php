<?php

namespace App\Repositories\Eloquent;

use App\Models\Information;
use App\Repositories\Contracts\InformationRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;

class InformationRepository implements InformationRepositoryInterface
{
    public function query(): Builder
    {
        return Information::query();
    }

    public function create(array $attributes): Information
    {
        return Information::query()->create($attributes);
    }

    public function save(Information $information): void
    {
        $information->save();
    }

    public function delete(Information $information): void
    {
        $information->delete();
    }

    public function deleteWhereIdsIn(array $ids): void
    {
        if ($ids === []) {
            return;
        }

        Information::query()->whereIn('id', $ids)->delete();
    }
}
