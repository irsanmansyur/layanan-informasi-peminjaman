<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateHomeCoverRequest;
use App\Http\Requests\UpdateHomeMarqueeSpeedRequest;
use App\Models\Borrower;
use App\Models\Information;
use App\Models\SiteSetting;
use App\Models\User;
use App\Support\HomeSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    private const COVER_PATH_KEY = 'home_cover_path';

    private const COVER_TYPE_KEY = 'home_cover_type';

    public function index(Request $request): Response
    {
        $user = $request->user();
        $canManageCover = $user instanceof User && $user->hasRole('admin');

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'canManageCover' => $canManageCover,
            'cover' => $this->buildCover(),
            'borrowers' => $this->buildBorrowers(),
            'informations' => $this->buildInformations(),
            'marqueeSpeed' => HomeSettings::currentMarqueeSpeed(),
        ]);
    }

    public function updateCover(UpdateHomeCoverRequest $request): RedirectResponse
    {
        $file = $request->file('cover');

        $mime = (string) $file->getMimeType();
        $type = str_starts_with($mime, 'video/') ? 'video' : 'image';

        $this->deleteCurrentCoverFile();

        $path = $file->store('home', 'public');

        SiteSetting::set(self::COVER_PATH_KEY, $path);
        SiteSetting::set(self::COVER_TYPE_KEY, $type);

        return back()->with('success', 'Cover berhasil diperbarui.');
    }

    public function destroyCover(Request $request): RedirectResponse
    {
        $user = $request->user();
        if (! $user instanceof User || ! $user->hasRole('admin')) {
            abort(403);
        }

        $this->deleteCurrentCoverFile();

        SiteSetting::set(self::COVER_PATH_KEY, null);
        SiteSetting::set(self::COVER_TYPE_KEY, null);

        return back()->with('success', 'Cover dihapus.');
    }

    public function updateMarqueeSpeed(UpdateHomeMarqueeSpeedRequest $request): RedirectResponse
    {
        HomeSettings::setMarqueeSpeed($request->validated('speed'));

        return back()->with('success', 'Kecepatan marquee diperbarui.');
    }

    /**
     * @return array{url: string, type: string}|null
     */
    private function buildCover(): ?array
    {
        $path = SiteSetting::get(self::COVER_PATH_KEY);
        if (! $path) {
            return null;
        }

        if (! Storage::disk('public')->exists($path)) {
            return null;
        }

        $type = SiteSetting::get(self::COVER_TYPE_KEY, 'image') ?? 'image';

        return [
            'url' => Storage::disk('public')->url($path),
            'type' => $type,
        ];
    }

    /**
     * @return list<array{id: string, name: string, total: float, borrowed_at: ?string}>
     */
    private function buildBorrowers(): array
    {
        return Borrower::query()
            ->where('status', 'belum lunas')
            ->orderByDesc('total')
            ->limit(50)
            ->get(['id', 'name', 'total', 'borrowed_at'])
            ->map(static fn (Borrower $borrower): array => [
                'id' => (string) $borrower->id,
                'name' => (string) $borrower->name,
                'total' => (float) $borrower->total,
                'borrowed_at' => $borrower->borrowed_at?->toDateString(),
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{id: string, title: string, content: string}>
     */
    private function buildInformations(): array
    {
        $today = Carbon::now()->toDateString();

        return Information::query()
            ->where('status', 'aktif')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->orderByDesc('start_date')
            ->limit(20)
            ->get(['id', 'title', 'content'])
            ->map(static fn (Information $information): array => [
                'id' => (string) $information->id,
                'title' => (string) $information->title,
                'content' => (string) $information->content,
            ])
            ->values()
            ->all();
    }

    private function deleteCurrentCoverFile(): void
    {
        $oldPath = SiteSetting::get(self::COVER_PATH_KEY);
        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }
    }
}
