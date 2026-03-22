<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Builder;

interface ActivityLogRepositoryInterface
{
    public function queryWithCauserAndSubject(): Builder;
}
