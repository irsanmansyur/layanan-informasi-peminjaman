<?php

namespace App\Services\Management\ActivityLogs;

use App\Models\User;
use App\Presenters\Management\ActivityLogPropertiesPresenter;
use App\Repositories\Contracts\ActivityLogRepositoryInterface;
use App\Services\DataTable\DataTableService;
use App\Support\DataTable\LikeSearch;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityLogDataTableService
{
    /**
     * Pencarian nama/email causer lewat subquery users — hindari orWhereHas yang mahal jika log banyak.
     */
    private const MIN_LENGTH_FOR_CAUSER_SEARCH = 2;

    public function __construct(
        private readonly DataTableService $dataTable,
        private readonly ActivityLogRepositoryInterface $activityLogs,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $query = $this->activityLogs->queryWithCauserAndSubject();

        $this->applyOptimizedSearch($query, $request);

        $logs = $this->dataTable->handle($query, $request, [
            'filters' => [
                [
                    'key' => 'event',
                    'operator' => '=',
                ],
                [
                    'key' => 'subject_type',
                    'type' => 'custom',
                    'callback' => function (Builder $query, mixed $value): void {
                        $raw = trim((string) $value);
                        if ($raw === '') {
                            return;
                        }

                        $pattern = LikeSearch::wrapContainsPattern(LikeSearch::escapeWildcards($raw));

                        $query->where(
                            'subject_type',
                            LikeSearch::caseInsensitiveOperator($query),
                            $pattern,
                        );
                    },
                ],
            ],
            'sort' => [
                'key' => 'sort',
                'direction_key' => 'direction',
                'default' => ['created_at', 'desc'],
                'allowed' => ['description', 'event', 'subject_type', 'created_at'],
            ],
            'per_page_key' => 'limit',
            'per_page' => 10,
            'transform' => function (Activity $log): array {
                return [
                    'id' => $log->id,
                    'description' => $log->description,
                    'event' => $log->event,
                    'subject_type' => $log->subject_type ? class_basename($log->subject_type) : null,
                    'subject_id' => $log->subject_id,
                    'causer' => $log->causer ? [
                        'id' => $log->causer->id,
                        'name' => $log->causer->name,
                        'email' => $log->causer->email,
                        'avatar' => $log->causer->profile_photo_url ?? null,
                    ] : null,
                    'properties' => ActivityLogPropertiesPresenter::format($log->properties),
                    'created_at' => $log->created_at->format('d M Y H:i:s'),
                    'created_at_human' => $log->created_at->diffForHumans(),
                ];
            },
        ]);

        return response()->json([
            'logs' => $logs,
        ]);
    }

    private function applyOptimizedSearch(Builder $query, Request $request): void
    {
        if (! $request->filled('search')) {
            return;
        }

        $raw = trim((string) $request->input('search', ''));
        if ($raw === '') {
            return;
        }

        $pattern = LikeSearch::wrapContainsPattern(LikeSearch::escapeWildcards($raw));
        $operator = LikeSearch::caseInsensitiveOperator($query);
        $usersTable = (new User)->getTable();

        $query->where(function (Builder $outer) use ($pattern, $operator, $raw, $usersTable): void {
            $outer->where('description', $operator, $pattern)
                ->orWhere('event', $operator, $pattern)
                ->orWhere('subject_type', $operator, $pattern);

            if (mb_strlen($raw) >= self::MIN_LENGTH_FOR_CAUSER_SEARCH) {
                $outer->orWhere(function (Builder $causerMatch) use ($pattern, $operator, $usersTable): void {
                    $causerMatch
                        ->where('causer_type', User::class)
                        ->whereIn('causer_id', function ($sub) use ($pattern, $operator, $usersTable): void {
                            $sub->select('id')
                                ->from($usersTable)
                                ->where(function ($userQuery) use ($pattern, $operator): void {
                                    $userQuery->where('name', $operator, $pattern)
                                        ->orWhere('email', $operator, $pattern);
                                });
                        });
                });
            }
        });
    }
}
