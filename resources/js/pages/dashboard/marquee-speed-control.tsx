import { router } from '@inertiajs/react';
import { Gauge, Rabbit, Snail, Turtle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import home from '@/routes/home';
import type { MarqueeSpeed } from '@/types/dashboard';

type MarqueeSpeedControlProps = {
    currentSpeed: MarqueeSpeed;
};

type SpeedOption = {
    value: MarqueeSpeed;
    label: string;
    description: string;
    icon: typeof Snail;
};

const SPEED_OPTIONS: SpeedOption[] = [
    {
        value: 'slow',
        label: 'Lambat',
        description: 'Nyaman dibaca',
        icon: Snail,
    },
    {
        value: 'medium',
        label: 'Sedang',
        description: 'Seimbang',
        icon: Turtle,
    },
    {
        value: 'fast',
        label: 'Cepat',
        description: 'Dinamis',
        icon: Rabbit,
    },
];

export function MarqueeSpeedControl({ currentSpeed }: MarqueeSpeedControlProps) {
    const [selected, setSelected] = useState<MarqueeSpeed>(currentSpeed);
    const [submitting, setSubmitting] = useState<MarqueeSpeed | null>(null);

    const handleSelect = (speed: MarqueeSpeed) => {
        if (speed === selected || submitting !== null) return;

        setSubmitting(speed);
        router.put(
            home.marqueeSpeed.update().url,
            { speed },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setSelected(speed),
                onFinish: () => setSubmitting(null),
            },
        );
    };

    return (
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm md:p-5">
            <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted">
                    <Gauge className="size-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">
                        Kecepatan Marquee Informasi
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Atur kecepatan teks berjalan di halaman beranda.
                    </p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {SPEED_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selected === option.value;
                    const isSubmitting = submitting === option.value;

                    return (
                        <Button
                            key={option.value}
                            type="button"
                            variant="outline"
                            disabled={submitting !== null}
                            onClick={() => handleSelect(option.value)}
                            className={cn(
                                'relative h-auto flex-col items-start gap-1 px-3 py-3 text-left whitespace-normal',
                                isSelected &&
                                    'border-primary bg-primary/10 text-foreground hover:bg-primary/15',
                                isSubmitting && 'opacity-70',
                            )}
                            aria-pressed={isSelected}
                        >
                            <span className="flex w-full items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Icon
                                        className={cn(
                                            'size-4',
                                            isSelected
                                                ? 'text-primary'
                                                : 'text-muted-foreground',
                                        )}
                                    />
                                    <span className="text-sm font-semibold">
                                        {option.label}
                                    </span>
                                </span>
                                {isSelected ? (
                                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                                        Aktif
                                    </span>
                                ) : null}
                            </span>
                            <span className="text-xs font-normal text-muted-foreground">
                                {option.description}
                            </span>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
