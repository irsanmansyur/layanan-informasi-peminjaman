<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\Dashboard\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboard,
    ) {
        $this->middleware(['auth', 'verified']);
    }

    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        if (! $user instanceof User) {
            abort(401);
        }

        return Inertia::render('dashboard', $this->dashboard->buildForUser($user));
    }
}
