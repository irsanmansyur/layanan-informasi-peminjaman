<?php

namespace App\Support;

use App\Models\SiteSetting;

class HomeSettings
{
    public const MARQUEE_SPEED_KEY = 'home_marquee_speed';

    public const MARQUEE_SPEED_DEFAULT = 'medium';

    /** @var list<string> */
    public const MARQUEE_SPEEDS = ['slow', 'medium', 'fast'];

    public static function currentMarqueeSpeed(): string
    {
        $value = SiteSetting::get(self::MARQUEE_SPEED_KEY, self::MARQUEE_SPEED_DEFAULT);

        return in_array($value, self::MARQUEE_SPEEDS, true)
            ? $value
            : self::MARQUEE_SPEED_DEFAULT;
    }

    public static function setMarqueeSpeed(string $speed): void
    {
        if (! in_array($speed, self::MARQUEE_SPEEDS, true)) {
            return;
        }

        SiteSetting::set(self::MARQUEE_SPEED_KEY, $speed);
    }
}
