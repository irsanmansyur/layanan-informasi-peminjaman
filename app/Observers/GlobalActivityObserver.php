<?php

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class GlobalActivityObserver
{
    /**
     * Handle the Model "created" event.
     */
    public function created(Model $model): void
    {
        $this->logActivity($model, 'created', 'created');
    }

    /**
     * Handle the Model "updated" event.
     */
    public function updated(Model $model): void
    {
        // Hanya log jika ada atribut yang berubah
        if (empty($model->getDirty())) {
            return;
        }

        $this->logActivity($model, 'updated', 'updated');
    }

    /**
     * Handle the Model "deleted" event.
     */
    public function deleted(Model $model): void
    {
        $this->logActivity($model, 'deleted', 'deleted');
    }

    /**
     * Handle the Model "restored" event.
     */
    public function restored(Model $model): void
    {
        $this->logActivity($model, 'restored', 'restored');
    }

    /**
     * Handle the Model "force deleted" event.
     */
    public function forceDeleted(Model $model): void
    {
        $this->logActivity($model, 'force deleted', 'force_deleted');
    }

    /**
     * Mencatat aktivitas ke database.
     */
    protected function logActivity(Model $model, string $description, string $eventName): void
    {
        // Mendapatkan nama model yang bersih (contoh: App\Models\User -> User)
        $modelName = class_basename($model);
        
        // Membuat deskripsi yang lebih informatif
        $logDescription = "{$modelName} has been {$description}";

        $activity = activity()
            ->performedOn($model)
            ->tap(function ($activity) use ($eventName) {
                $activity->event = $eventName;
            });
            
        // Jika event adalah updated, kita bisa tambahkan properti apa yang berubah
        if ($eventName === 'updated') {
            $changes = [
                'attributes' => $model->getAttributes(),
                'old' => $model->getOriginal(),
            ];
            $activity->withProperties($changes);
        } elseif ($eventName === 'created') {
             $activity->withProperties(['attributes' => $model->getAttributes()]);
        } elseif ($eventName === 'deleted') {
             $activity->withProperties(['old' => $model->getAttributes()]);
        }
        
        $activity->log($logDescription);
    }
}
