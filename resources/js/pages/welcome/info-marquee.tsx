import { Megaphone } from 'lucide-react';

import type { MarqueeSpeed } from '@/types/dashboard';

export type HomeInformation = {
    id: string;
    title: string;
    content: string;
};

type InfoMarqueeProps = {
    informations: HomeInformation[];
    speed?: MarqueeSpeed;
};

const MARQUEE_KEYFRAMES = `@keyframes home-marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
}`;

/**
 * Seconds-per-loop tuning for each speed preset.
 * Higher numbers = slower scroll.
 */
const SPEED_SETTINGS: Record<MarqueeSpeed, { minSec: number; perItemSec: number }> = {
    slow: { minSec: 120, perItemSec: 30 },
    medium: { minSec: 60, perItemSec: 18 },
    fast: { minSec: 25, perItemSec: 8 },
};

const stripHtml = (value: string): string =>
    value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export function InfoMarquee({ informations, speed = 'medium' }: InfoMarqueeProps) {
    const hasItems = informations.length > 0;
    // Duplicate list so the animation loops seamlessly via translateX(-50%).
    const duplicated = hasItems ? [...informations, ...informations] : [];
    const { minSec, perItemSec } = SPEED_SETTINGS[speed];
    const durationSec = Math.max(minSec, informations.length * perItemSec);

    return (
        <div className="relative flex items-stretch overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
            <style>{MARQUEE_KEYFRAMES}</style>

            <div className="flex items-center gap-2 border-r bg-primary/10 px-4 py-3 text-primary">
                <Megaphone className="size-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                    Info
                </span>
            </div>

            <div className="relative flex-1 overflow-hidden">
                {hasItems ? (
                    <>
                        <div
                            className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-card to-transparent"
                            aria-hidden
                        />
                        <div
                            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-card to-transparent"
                            aria-hidden
                        />
                        <div
                            className="flex w-max items-center gap-10 whitespace-nowrap py-3 pl-6"
                            style={{
                                animation: `home-marquee ${durationSec}s linear infinite`,
                            }}
                        >
                            {duplicated.map((item, index) => (
                                <span
                                    key={`${item.id}-${index}`}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <span className="inline-block size-1.5 rounded-full bg-primary" />
                                    <span className="font-semibold text-foreground">
                                        {item.title}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {stripHtml(item.content)}
                                    </span>
                                </span>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center px-4 py-3 text-sm text-muted-foreground">
                        Belum ada informasi berjalan.
                    </div>
                )}
            </div>
        </div>
    );
}
