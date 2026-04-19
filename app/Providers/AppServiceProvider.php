<?php

namespace App\Providers;

use App\Models\Borrower;
use App\Models\Information;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Observers\GlobalActivityObserver;
use App\Policies\ActivityPolicy;
use App\Repositories\Contracts\ActivityLogRepositoryInterface;
use App\Repositories\Contracts\BorrowerRepositoryInterface;
use App\Repositories\Contracts\InformationRepositoryInterface;
use App\Repositories\Contracts\PermissionRepositoryInterface;
use App\Repositories\Contracts\RoleRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Eloquent\ActivityLogRepository;
use App\Repositories\Eloquent\BorrowerRepository;
use App\Repositories\Eloquent\InformationRepository;
use App\Repositories\Eloquent\PermissionRepository;
use App\Repositories\Eloquent\RoleRepository;
use App\Repositories\Eloquent\UserRepository;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Spatie\Activitylog\Models\Activity;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(UserRepositoryInterface::class, UserRepository::class);
        $this->app->singleton(RoleRepositoryInterface::class, RoleRepository::class);
        $this->app->singleton(PermissionRepositoryInterface::class, PermissionRepository::class);
        $this->app->singleton(ActivityLogRepositoryInterface::class, ActivityLogRepository::class);
        $this->app->singleton(BorrowerRepositoryInterface::class, BorrowerRepository::class);
        $this->app->singleton(InformationRepositoryInterface::class, InformationRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureActivityLog();
        $this->registerObservers();
        Gate::policy(Activity::class, ActivityPolicy::class);
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
        Borrower::observe(GlobalActivityObserver::class);
        Information::observe(GlobalActivityObserver::class);
    }
}
