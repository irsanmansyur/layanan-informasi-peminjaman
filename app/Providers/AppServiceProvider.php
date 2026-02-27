<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Observers\GlobalActivityObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureActivityLog();
        $this->registerObservers();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }

    protected function configureActivityLog(): void
    {
        Event::listen(Login::class, function (Login $event) {
            activity('auth')
                ->performedOn($event->user)
                ->causedBy($event->user)
                ->tap(function ($activity) {
                    $activity->event = 'login';
                })
                ->log('User logged in');
        });

        Event::listen(Logout::class, function (Logout $event) {
            if ($event->user) {
                activity('auth')
                    ->performedOn($event->user)
                    ->causedBy($event->user)
                    ->tap(function ($activity) {
                        $activity->event = 'logout';
                    })
                    ->log('User logged out');
            }
        });
    }

    protected function registerObservers(): void
    {
        User::observe(GlobalActivityObserver::class);
        Role::observe(GlobalActivityObserver::class);
        Permission::observe(GlobalActivityObserver::class);
    }
}
