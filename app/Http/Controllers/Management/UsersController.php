<?php
namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Http\Requests\Management\UserBulkDestroyRequest;
use App\Http\Requests\Management\UserStoreRequest;
use App\Http\Requests\Management\UserUpdateRequest;
use App\Models\User;
use App\Services\Management\UserDataTableService;
use App\Services\Management\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UsersController extends Controller
{
    public function __construct(
        private readonly UserDataTableService $userDataTableService,
        private readonly UserService $userService,
    ) 
    {
        $this->middleware(['auth', 'verified']);
        $this->middleware('can:users.read')->only(['index', 'fetchData']);
        $this->middleware('can:users.create')->only('store');
        $this->middleware('can:users.update')->only('update');
        $this->middleware('can:users.delete')->only('destroy');
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

        try {
            $this->userService->create($data);
        } catch (\Throwable $e) {
            return back()->withErrors([
                'message' => 'Error creating user.',
            ]);
        }

        return back();
    }

    public function update(UserUpdateRequest $request, User $user)
    {
        $data = $request->validated();

        try {
            $this->userService->update($user, $data);
        } catch (\Throwable $e) {
            return back()->withErrors([
                'message' => 'Error updating user.',
            ]);
        }

        return back();
    }

    public function destroy(User $user)
    {
        try {
            $this->userService->delete($user);
        } catch (\Throwable $e) {
            return back()->withErrors([
                'message' => 'Error deleting user.',
            ]);
        }

        return back();
    }

    public function bulkDestroy(UserBulkDestroyRequest $request): JsonResponse
    {
        $data = $request->validated();

        $ids = (array) ($data['ids'] ?? []);
        $currentUserId = Auth::id();

        $filteredIds = array_values(
            array_filter(
                $ids,
                static fn(string $id): bool => $id !== $currentUserId,
            ),
        );

        if ($filteredIds === []) {
            return response()->json([
                'message' => 'Tidak ada user yang dapat dihapus.',
            ], 422);
        }

        DB::transaction(static function () use ($filteredIds): void {
            User::query()
                ->whereIn('id', $filteredIds)
                ->delete();
        });

        return response()->json([
            'deleted_count' => \count($filteredIds),
        ]);
    }
}
