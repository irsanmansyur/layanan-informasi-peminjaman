<?php

namespace App\Services\Dashboard;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Activity;

class DashboardService
{
    private const ADMIN_ROLE = 'admin';

    /**
     * @return array{
     *     is_admin: bool,
     *     greeting_name: string,
     *     roles: list<string>,
     *     admin?: array{
     *         users_count: int,
     *         roles_count: int,
     *         permissions_count: int,
     *         activity_logs_last_7_days: int,
     *         activity_trend: list<array{date: string, label: string, count: int}>
     *     }
     * }
     */
    public function buildForUser(User $user): array
    {
        $user->loadMissing('roles');

        $isAdmin = $user->hasRole(self::ADMIN_ROLE);

        $payload = [
            'is_admin' => $isAdmin,
            'greeting_name' => $user->name,
            'roles' => $user->roles
                ->pluck('name')
                ->map(static fn (string $name): string => ucfirst($name))
                ->values()
                ->all(),
        ];

        if ($isAdmin) {
            $payload['admin'] = $this->adminOverview();
        }

        return $payload;
    }

    /**
     * @return array{
     *     users_count: int,
     *     roles_count: int,
     *     permissions_count: int,
     *     activity_logs_last_7_days: int,
     *     activity_trend: list<array{date: string, label: string, count: int}>
     * }
     */
    private function adminOverview(): array
    {
        $since = Carbon::now()->subDays(7);

        return [
            'users_count' => User::query()->count(),
            'roles_count' => Role::query()->count(),
            'permissions_count' => Permission::query()->count(),
            'activity_logs_last_7_days' => Activity::query()
                ->where('created_at', '>=', $since)
                ->count(),
            'activity_trend' => $this->buildActivityTrendLast7Days(),
        ];
    }

    /**
     * @return list<array{date: string, label: string, count: int}>
     */
    private function buildActivityTrendLast7Days(): array
    {
        $start = Carbon::now()->subDays(6)->startOfDay();

        $byDay = Activity::query()
            ->where('created_at', '>=', $start)
            ->get()
            ->groupBy(fn (Activity $activity): string => $activity->created_at->format('Y-m-d'));

        $result = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = Carbon::now()->subDays($i)->startOfDay();
            $key = $day->format('Y-m-d');
            $count = $byDay->get($key)?->count() ?? 0;

            $result[] = [
                'date' => $key,
                'label' => $day->format('d/m'),
                'count' => $count,
            ];
        }

        return $result;
    }
}
