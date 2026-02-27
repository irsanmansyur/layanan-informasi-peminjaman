<?php
namespace App\Services\Management;

use App\Services\DataTable\DataTableService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityLogDataTableService
{
    public function __construct(private readonly DataTableService $dataTable)
    {
    }

    public function handle(Request $request): JsonResponse
    {
        $query = Activity::query()
            ->with(['causer', 'subject']);

        $searchOptions = [
            'key'       => 'search',
            'operator'  => 'ilike',
            'columns'   => ['description', 'event', 'subject_type'],
            'relations' => [
                'causer' => ['name', 'email'],
            ],
        ];

        $logs = $this->dataTable->handle($query, $request, [
            'search'       => $searchOptions,
            'filters'      => [
                [
                    'key'      => 'event',
                    'operator' => '=',
                ],
                [
                    'key'      => 'subject_type',
                    'type'     => 'custom',
                    'callback' => function ($query, $value) {
                        $query->where('subject_type', 'ilike', "%{$value}%");
                    },
                ],
            ],
            'sort'         => [
                'key'           => 'sort',
                'direction_key' => 'direction',
                'default'       => ['created_at', 'desc'],
                'allowed'       => ['description', 'event', 'subject_type', 'created_at'],
            ],
            'per_page_key' => 'limit',
            'per_page'     => 10,
            'transform'    => function (Activity $log): array {
                return [
                    'id'           => $log->id,
                    'description'  => $log->description,
                    'event'        => $log->event,
                    'subject_type' => $log->subject_type ? class_basename($log->subject_type) : null,
                    'subject_id'   => $log->subject_id,
                    'causer'       => $log->causer ? [
                        'id'     => $log->causer->id,
                        'name'   => $log->causer->name,
                        'email'  => $log->causer->email,
                        'avatar' => $log->causer->profile_photo_url ?? null,
                    ] : null,
                    'properties'   => $this->formatProperties($log->properties),
                    'created_at'   => $log->created_at->format('d M Y H:i:s'),
                    'created_at_human' => $log->created_at->diffForHumans(),
                ];
            },
        ]);

        return response()->json([
            'logs' => $logs,
        ]);
    }

    protected function formatProperties($properties)
    {
        if (empty($properties)) {
            return null;
        }

        if ($properties instanceof \Illuminate\Support\Collection) {
            $properties = $properties->toArray();
        }

        $formatted = [];
        $hasAttributes = isset($properties['attributes']);
        $hasOld = isset($properties['old']);

        if ($hasAttributes && $hasOld) {
            $changes = [];
            foreach ($properties['attributes'] as $key => $newValue) {
                if (in_array($key, ['updated_at', 'password', 'remember_token'])) {
                    continue;
                }

                $oldValue = $properties['old'][$key] ?? null;
                
                if ($newValue != $oldValue) {
                    $changes[$key] = [
                        'from' => $oldValue,
                        'to' => $newValue,
                    ];
                }
            }
            $formatted = ['type' => 'update', 'changes' => $changes];
        } elseif ($hasAttributes) {
            $formatted = ['type' => 'create', 'attributes' => $properties['attributes']];
        } elseif ($hasOld) {
            $formatted = ['type' => 'delete', 'attributes' => $properties['old']];
        } else {
            $formatted = ['type' => 'custom', 'data' => $properties];
        }

        return $formatted;
    }
}
