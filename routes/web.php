<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Management\ActivityLogController;
use App\Http\Controllers\Management\BorrowersController;
use App\Http\Controllers\Management\InformationsController;
use App\Http\Controllers\Management\PermissionsController;
use App\Http\Controllers\Management\RolesController;
use App\Http\Controllers\Management\UsersController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware('auth')->group(function () {
    Route::post('/home/cover', [HomeController::class, 'updateCover'])->name('home.cover.update');
    Route::delete('/home/cover', [HomeController::class, 'destroyCover'])->name('home.cover.destroy');
    Route::put('/home/marquee-speed', [HomeController::class, 'updateMarqueeSpeed'])->name('home.marquee-speed.update');
});

Route::get('dashboard', DashboardController::class)->name('dashboard');

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

        // Borrowers routes
        Route::prefix('borrowers')->controller(BorrowersController::class)->group(function () {
            Route::get('/', 'index')->name('borrowers.index');
            Route::get('/fetch-data', 'fetchData')->name('borrowers.fetch-data');

            Route::post('/', 'store')->name('borrowers.store');
            Route::delete('/bulk', 'bulkDestroy')->name('borrowers.bulk-destroy');
            Route::put('/{borrower}', 'update')->name('borrowers.update');
            Route::delete('/{borrower}', 'destroy')->name('borrowers.destroy');
        });

        // Informations routes
        Route::prefix('informations')->controller(InformationsController::class)->group(function () {
            Route::get('/', 'index')->name('informations.index');
            Route::get('/fetch-data', 'fetchData')->name('informations.fetch-data');

            Route::post('/', 'store')->name('informations.store');
            Route::delete('/bulk', 'bulkDestroy')->name('informations.bulk-destroy');
            Route::put('/{information}', 'update')->name('informations.update');
            Route::delete('/{information}', 'destroy')->name('informations.destroy');
        });
    });

});

require __DIR__.'/settings.php';
