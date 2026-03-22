<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Services\Management\ActivityLogs\ActivityLogDataTableService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function __construct(
        private readonly ActivityLogDataTableService $activityLogDataTableService,
    ) {
        $this->middleware(['auth', 'verified']);
        $this->middleware('can:activity-logs.read')->only(['index', 'fetchData']);
    }

    public function index(Request $request): Response
    {
        return Inertia::render('management/activity-logs/index');
    }

    public function fetchData(Request $request): JsonResponse
    {
        return $this->activityLogDataTableService->handle($request);
    }
}
