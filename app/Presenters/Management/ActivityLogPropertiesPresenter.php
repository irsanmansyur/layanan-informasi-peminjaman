<?php

namespace App\Presenters\Management;

use Illuminate\Support\Collection;

final class ActivityLogPropertiesPresenter
{
    public static function format(mixed $properties): ?array
    {
        if (empty($properties)) {
            return null;
        }

        if ($properties instanceof Collection) {
            $properties = $properties->toArray();
        }

        $formatted = [];
        $hasAttributes = isset($properties['attributes']);
        $hasOld = isset($properties['old']);

        if ($hasAttributes && $hasOld) {
            $changes = [];
            foreach ($properties['attributes'] as $key => $newValue) {
                if (in_array($key, ['updated_at', 'password', 'remember_token'], true)) {
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
