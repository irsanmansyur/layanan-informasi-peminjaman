<?php

namespace App\Support\Http;

use Illuminate\Http\RedirectResponse;

final class ManagementRedirect
{
    public static function backAfter(callable $callback, string $errorMessage): RedirectResponse
    {
        try {
            $callback();
        } catch (\Throwable $e) {
            report($e);

            return back()->withErrors(['message' => $errorMessage]);
        }

        return back();
    }
}
