<?php

namespace App\Repositories\Contracts;

use App\Models\Information;
use Illuminate\Database\Eloquent\Builder;

interface InformationRepositoryInterface
{
    public function query(): Builder;

    public function create(array $attributes): Information;

    public function save(Information $information): void;

    public function delete(Information $information): void;

    /**
     * @param  list<string>  $ids
     */
    public function deleteWhereIdsIn(array $ids): void;
}
