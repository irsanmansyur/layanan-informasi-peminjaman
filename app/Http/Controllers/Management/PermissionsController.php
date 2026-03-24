<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Http\Requests\Management\Permissions\PermissionStoreRequest;
use App\Http\Requests\Management\Permissions\PermissionUpdateRequest;
use App\Models\Permission;
use App\Repositories\Contracts\PermissionRepositoryInterface;
use App\Services\Management\Permissions\PermissionDataTableService;
use App\Services\Management\Permissions\PermissionService;
use App\Support\Http\ManagementRedirect;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PermissionsController extends Controller
{
    public function __construct(
        private readonly PermissionDataTableService $permissionDataTableService,
        private readonly PermissionService $permissionService,
        private readonly PermissionRepositoryInterface $permissions,
    ) {
        $this->middleware('can:permissions.read')->only(['index', 'fetchData', 'permissionList']);
        $this->middleware('can:permissions.create')->only('store');
        $this->middleware('can:permissions.update')->only('update');
        $this->middleware('can:permissions.delete')->only('destroy');
    }

    public function index(Request $request): Response
    {
        return Inertia::render('management/permissions/index');
    }

    public function fetchData(Request $request): JsonResponse
    {
        return $this->permissionDataTableService->handle($request);
    }

    public function permissionList(): JsonResponse
    {
        $permissions = $this->permissions->allOrderedByGroupAndName()
            ->map(static function (Permission $permission): array {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'group' => $permission->group,
                    'guard_name' => $permission->guard_name,
                ];
            });

        return response()->json([
            'permissions' => $permissions,
        ]);
    }

    public function store(PermissionStoreRequest $request)
    {
        $data = $request->validated();

        return ManagementRedirect::backAfter(
            fn () => $this->permissionService->create($data),
            'Error creating permission.',
        );
    }

    public function update(PermissionUpdateRequest $request, Permission $permission)
    {
        $data = $request->validated();

        return ManagementRedirect::backAfter(
            fn () => $this->permissionService->update($permission, $data),
            'Error updating permission.',
        );
    }

    public function destroy(Permission $permission)
    {
        return ManagementRedirect::backAfter(
            fn () => $this->permissionService->delete($permission),
            'Error deleting permission.',
        );
    }
}
