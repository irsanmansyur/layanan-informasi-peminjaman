<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Http\Requests\Management\Informations\InformationBulkDestroyRequest;
use App\Http\Requests\Management\Informations\InformationStoreRequest;
use App\Http\Requests\Management\Informations\InformationUpdateRequest;
use App\Models\Information;
use App\Services\Management\Informations\InformationDataTableService;
use App\Services\Management\Informations\InformationService;
use App\Support\Http\ManagementRedirect;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InformationsController extends Controller
{
    public function __construct(
        private readonly InformationDataTableService $informationDataTableService,
        private readonly InformationService $informationService,
    ) {
        $this->middleware('can:informations.read')->only(['index', 'fetchData']);
        $this->middleware('can:informations.create')->only('store');
        $this->middleware('can:informations.update')->only('update');
        $this->middleware('can:informations.delete')->only(['destroy', 'bulkDestroy']);
    }

    public function index(Request $request): Response
    {
        return Inertia::render('management/informations/index');
    }

    public function fetchData(Request $request): JsonResponse
    {
        return $this->informationDataTableService->handle($request);
    }

    public function store(InformationStoreRequest $request)
    {
        $data = $request->validated();

        return ManagementRedirect::backAfter(
            fn () => $this->informationService->create($data),
            'Error creating information.',
        );
    }

    public function update(InformationUpdateRequest $request, Information $information)
    {
        $data = $request->validated();

        return ManagementRedirect::backAfter(
            fn () => $this->informationService->update($information, $data),
            'Error updating information.',
        );
    }

    public function destroy(Information $information)
    {
        return ManagementRedirect::backAfter(
            fn () => $this->informationService->delete($information),
            'Error deleting information.',
        );
    }

    public function bulkDestroy(InformationBulkDestroyRequest $request): JsonResponse
    {
        $ids = (array) $request->validated('ids');
        $count = $this->informationService->bulkDestroy($ids);

        if ($count === null) {
            return response()->json([
                'message' => 'Tidak ada informasi yang dapat dihapus.',
            ], 422);
        }

        return response()->json([
            'deleted_count' => $count,
        ]);
    }
}
