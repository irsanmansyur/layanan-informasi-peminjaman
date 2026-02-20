<?php
namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Http\Requests\Management\UserBulkDestroyRequest;
use App\Http\Requests\Management\UserStoreRequest;
use App\Http\Requests\Management\UserUpdateRequest;
use App\Models\User;
use App\Services\DataTable\DataTableService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UsersController extends Controller
{
    public function __construct(private readonly DataTableService $dataTable)
    {
        $this->middleware(['auth', 'verified']);
        $this->middleware('can:users.read')->only(['index', 'fetchData', 'show']);
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
        try {
            $query = User::query()->with('roles');

            $rawSearch     = (string) $request->input('search', '');
            $isEmailSearch = $rawSearch !== '' && str_contains($rawSearch, '@');

            $searchOptions = [
                'key'       => 'search',
                'operator'  => 'ilike',
                'columns'   => $isEmailSearch ? ['email'] : ['name', 'email'],
                'relations' => $isEmailSearch ? [] : [
                    'roles' => ['name'],
                ],
            ];

            $users = $this->dataTable->handle($query, $request, [
                'search'       => $searchOptions,
                'filters'      => [
                    [
                        'key'       => 'role',
                        'type'      => 'relation',
                        'relation'  => 'roles',
                        'column'    => 'name',
                        'operator'  => 'ilike',
                        'all_value' => 'all',
                    ],
                ],
                'sort'         => [
                    'key'           => 'sort',
                    'direction_key' => 'direction',
                    'default'       => ['created_at', 'desc'],
                    'allowed'       => ['name', 'email', 'created_at'],
                    'custom'        => [
                        'roles' => function ($query, string $direction): void {
                            $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';

                            $query
                                ->withMin('roles as primary_role_name', 'name')
                                ->orderBy('primary_role_name', $direction);
                        },
                    ],
                ],
                'per_page_key' => 'limit',
                'per_page'     => 10,
                'transform'    => function (User $user): array {
                    return [
                        'id'         => $user->id,
                        'name'       => $user->name,
                        'email'      => $user->email,
                        'roles'      => $user->roles->pluck('name')->map(fn($role) => ucfirst($role)),
                        'created_at' => $user->created_at,
                        'updated_at' => $user->updated_at,
                    ];
                },
            ]);

            return response()->json([
                'users' => $users,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching users data',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function store(UserStoreRequest $request)
    {
        $data = $request->validated();

        try {
            DB::transaction(static function () use ($data): void {
                $user           = new User();
                $user->name     = $data['name'];
                $user->email    = $data['email'];
                $user->password = $data['password'];
                $user->save();

                if (! empty($data['roles'])) {
                    $user->syncRoles($data['roles']);
                }
            });
        } catch (\Throwable $e) {
            return back()->withErrors([
                'message' => 'Error creating user.',
            ]);
        }

        return back();
    }

    public function show(User $user): JsonResponse
    {
        $user->load('roles');

        return response()->json([
            'user' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'roles'      => $user->roles->pluck('name')->map(fn($role) => ucfirst($role)),
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
        ]);
    }

    public function update(UserUpdateRequest $request, User $user)
    {
        $data = $request->validated();

        try {
            DB::transaction(static function () use ($user, $data): void {
                $user->name  = $data['name'];
                $user->email = $data['email'];

                if (! empty($data['password'])) {
                    $user->password = $data['password'];
                }

                $user->save();

                if (array_key_exists('roles', $data)) {
                    $user->syncRoles($data['roles'] ?? []);
                }
            });
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
            DB::transaction(static function () use ($user): void {
                $user->delete();
            });
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
