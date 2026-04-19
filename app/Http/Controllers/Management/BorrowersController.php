<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Http\Requests\Management\Borrowers\BorrowerBulkDestroyRequest;
use App\Http\Requests\Management\Borrowers\BorrowerStoreRequest;
use App\Http\Requests\Management\Borrowers\BorrowerUpdateRequest;
use App\Models\Borrower;
use App\Services\Management\Borrowers\BorrowerDataTableService;
use App\Services\Management\Borrowers\BorrowerService;
use App\Support\Http\ManagementRedirect;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BorrowersController extends Controller
{
    public function __construct(
        private readonly BorrowerDataTableService $borrowerDataTableService,
        private readonly BorrowerService $borrowerService,
    ) {
        $this->middleware('can:borrowers.read')->only(['index', 'fetchData']);
        $this->middleware('can:borrowers.create')->only('store');
        $this->middleware('can:borrowers.update')->only('update');
        $this->middleware('can:borrowers.delete')->only(['destroy', 'bulkDestroy']);
    }

    public function index(Request $request): Response
    {
        return Inertia::render('management/borrowers/index');
    }

    public function fetchData(Request $request): JsonResponse
    {
        return $this->borrowerDataTableService->handle($request);
    }

    public function store(BorrowerStoreRequest $request)
    {
        $data = $request->validated();
        return ManagementRedirect::backAfter(
            fn () => $this->borrowerService->create($data),
            'Error creating borrower.',
        );
    }

    public function update(BorrowerUpdateRequest $request, Borrower $borrower)
    {
        $data = $request->validated();

        return ManagementRedirect::backAfter(
            fn () => $this->borrowerService->update($borrower, $data),
            'Error updating borrower.',
        );
    }

    public function destroy(Borrower $borrower)
    {
        return ManagementRedirect::backAfter(
            fn () => $this->borrowerService->delete($borrower),
            'Error deleting borrower.',
        );
    }

    public function bulkDestroy(BorrowerBulkDestroyRequest $request): JsonResponse
    {
        $ids = (array) $request->validated('ids');
        $count = $this->borrowerService->bulkDestroy($ids);

        if ($count === null) {
            return response()->json([
                'message' => 'Tidak ada peminjam yang dapat dihapus.',
            ], 422);
        }

        return response()->json([
            'deleted_count' => $count,
        ]);
    }
}
