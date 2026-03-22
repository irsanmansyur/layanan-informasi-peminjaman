<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Http\Requests\Management\Roles\RoleStoreRequest;
use App\Http\Requests\Management\Roles\RoleUpdateRequest;
use App\Models\Role;
use App\Presenters\Management\RoleEditPresenter;
use App\Repositories\Contracts\PermissionRepositoryInterface;
use App\Repositories\Contracts\RoleRepositoryInterface;
use App\Services\Management\Roles\RoleDataTableService;
use App\Services\Management\Roles\RoleService;
use App\Support\Http\ManagementRedirect;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RolesController extends Controller
{
    public function __construct(
        private readonly RoleDataTableService $roleDataTableService,
        private readonly RoleService $roleService,
        private readonly RoleRepositoryInterface $roles,
        private readonly PermissionRepositoryInterface $permissions,
    ) {
        $this->middleware(['auth', 'verified']);
        $this->middleware('can:roles.read')->only(['index', 'fetchData', 'show', 'roleList']);
        $this->middleware('can:roles.create')->only('store');
        $this->middleware('can:roles.update')->only('update');
        $this->middleware('can:roles.delete')->only('destroy');
    }

    public function index(Request $request): Response
    {
        return Inertia::render('management/roles/index');
    }

    public function fetchData(Request $request): JsonResponse
    {
        return $this->roleDataTableService->handle($request);
    }

    public function roleList(): JsonResponse
    {
        $roles = $this->roles->allOrderedByName()
            ->map(static fn (Role $role): array => [
                'id' => $role->id,
                'name' => $role->name,
                'label' => ucfirst($role->name),
            ]);

        return response()->json([
            'roles' => $roles,
        ]);
    }

    public function store(RoleStoreRequest $request)
    {
        $data = $request->validated();

        return ManagementRedirect::backAfter(
            fn () => $this->roleService->create($data),
            'Error creating role.',
        );
    }

    public function show(Role $role): JsonResponse
    {
        $payload = RoleEditPresenter::forShowJson(
            $role,
            $this->permissions->allOrderedByGroupAndName(),
        );

        return response()->json($payload);
    }

    public function update(RoleUpdateRequest $request, Role $role)
    {
        $data = $request->validated();

        return ManagementRedirect::backAfter(
            fn () => $this->roleService->update($role, $data),
            'Error updating role.',
        );
    }

    public function destroy(Role $role)
    {
        return ManagementRedirect::backAfter(
            fn () => $this->roleService->delete($role),
            'Error deleting role.',
        );
    }
}
