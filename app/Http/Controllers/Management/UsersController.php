<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Http\Requests\Management\Users\UserBulkDestroyRequest;
use App\Http\Requests\Management\Users\UserStoreRequest;
use App\Http\Requests\Management\Users\UserUpdateRequest;
use App\Models\User;
use App\Services\Management\Users\UserDataTableService;
use App\Services\Management\Users\UserService;
use App\Support\Http\ManagementRedirect;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class UsersController extends Controller
{
    public function __construct(
        private readonly UserDataTableService $userDataTableService,
        private readonly UserService $userService,
    ) {
        $this->middleware('can:users.read')->only(['index', 'fetchData']);
        $this->middleware('can:users.create')->only('store');
        $this->middleware('can:users.update')->only('update');
        $this->middleware('can:users.delete')->only(['destroy', 'bulkDestroy']);
    }

    public function index(Request $request): Response
    {
        return Inertia::render('management/users/index');
    }

    public function fetchData(Request $request): JsonResponse
    {
        return $this->userDataTableService->handle($request);
    }

    public function store(UserStoreRequest $request)
    {
        $data = $request->validated();

        return ManagementRedirect::backAfter(
            fn () => $this->userService->create($data),
            'Error creating user.',
        );
    }

    public function update(UserUpdateRequest $request, User $user)
    {
        $data = $request->validated();

        return ManagementRedirect::backAfter(
            fn () => $this->userService->update($user, $data),
            'Error updating user.',
        );
    }

    public function destroy(User $user)
    {
        return ManagementRedirect::backAfter(
            fn () => $this->userService->delete($user),
            'Error deleting user.',
        );
    }

    public function bulkDestroy(UserBulkDestroyRequest $request): JsonResponse
    {
        $ids = (array) $request->validated('ids');
        $count = $this->userService->bulkDestroy($ids, (string) Auth::id());

        if ($count === null) {
            return response()->json([
                'message' => 'Tidak ada user yang dapat dihapus.',
            ], 422);
        }

        return response()->json([
            'deleted_count' => $count,
        ]);
    }
}
