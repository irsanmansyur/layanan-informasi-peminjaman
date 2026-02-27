<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Http\Requests\Management\PermissionStoreRequest;
use App\Http\Requests\Management\PermissionUpdateRequest;
use App\Services\Management\PermissionDataTableService;
use App\Services\Management\PermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Permission;

class PermissionsController extends Controller
{
    public function __construct(
        private readonly PermissionDataTableService $permissionDataTableService,
        private readonly PermissionService $permissionService,
    ) 
    {
        $this->middleware(['auth', 'verified']);
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
        $permissions = Permission::query()
            ->orderBy('group')
            ->orderBy('name')
            ->get()
            ->map(static function (Permission $permission): array {
                return [
                    'id'         => $permission->id,
                    'name'       => $permission->name,
                    'group'      => $permission->group,
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

        try {
            $this->permissionService->create($data);
        } catch (\Throwable $e) {
            return back()->withErrors([
                'message' => 'Error creating permission.',
            ]);
        }

        return back();
    }

    public function update(PermissionUpdateRequest $request, Permission $permission)
    {
        $data = $request->validated();

        try {
            $this->permissionService->update($permission, $data);
        } catch (\Throwable $e) {
            return back()->withErrors([
                'message' => 'Error updating permission.',
            ]);
        }

        return back();
    }

    public function destroy(Permission $permission)
    {
        try {
            $this->permissionService->delete($permission);
        } catch (\Throwable $e) {
            return back()->withErrors([
                'message' => 'Error deleting permission.',
            ]);
        }

        return back();
    }
}
