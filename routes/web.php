<?php

use App\Http\Controllers\Management\ActivityLogController;
use App\Http\Controllers\Management\PermissionsController;
use App\Http\Controllers\Management\RolesController;
use App\Http\Controllers\Management\UsersController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth', 'verified')->group(function () {

    // Management routes
    Route::prefix('management')->group(function () {

        // Users routes
        Route::prefix('users')->controller(UsersController::class)->group(function () {
            Route::get('/', 'index')->name('users.index');
            Route::get('/fetch-data', 'fetchData')->name('users.fetch-data');

            Route::post('/', 'store')->name('users.store');
            Route::delete('/bulk', 'bulkDestroy')->name('users.bulk-destroy');
            Route::put('/{user}', 'update')->name('users.update');
            Route::delete('/{user}', 'destroy')->name('users.destroy');
        });

        // Permissions routes
        Route::prefix('permissions')->controller(PermissionsController::class)->group(function () {
            Route::get('/', 'index')->name('permissions.index');
            Route::get('/fetch-data', 'fetchData')->name('permissions.fetch-data');
            Route::get('/permission-list', 'permissionList')->name('permissions.list');
            Route::post('/', 'store')->name('permissions.store');
            Route::put('/{permission}', 'update')->name('permissions.update');
            Route::delete('/{permission}', 'destroy')->name('permissions.destroy');
        });

        // Roles routes
        Route::prefix('roles')->controller(RolesController::class)->group(function () {
            Route::get('/', 'index')->name('roles.index');
            Route::get('/fetch-data', 'fetchData')->name('roles.fetch-data');
            Route::get('/role-list', 'roleList')->name('roles.list');
            Route::post('/', 'store')->name('roles.store');
            Route::get('/{role}', 'show')->name('roles.show');
            Route::put('/{role}', 'update')->name('roles.update');
            Route::delete('/{role}', 'destroy')->name('roles.destroy');
        });

        // Activity Logs
        Route::prefix('activity-logs')->controller(ActivityLogController::class)->group(function () {
            Route::get('/', 'index')->name('activity-logs.index');
            Route::get('/fetch-data', 'fetchData')->name('activity-logs.fetch-data');
        });
    });

});

require __DIR__ . '/settings.php';
