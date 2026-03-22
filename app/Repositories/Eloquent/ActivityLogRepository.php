<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\ActivityLogRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Activitylog\Models\Activity;

class ActivityLogRepository implements ActivityLogRepositoryInterface
{
    public function queryWithCauserAndSubject(): Builder
    {
        return Activity::query()->with(['causer', 'subject']);
    }
}
