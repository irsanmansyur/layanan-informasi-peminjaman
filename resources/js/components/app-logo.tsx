import { usePage } from '@inertiajs/react';
import { Zap } from 'lucide-react';

import { cn } from '@/lib/utils';

type Props = {
    className?: string;
    /** Icon only — matches collapsed sidebar nav buttons (no extra frame). */
    compact?: boolean;
};

export default function AppLogo({ className, compact = false }: Props) {
    const { name } = usePage().props;
    const brand =
        typeof name === 'string' && name.length > 0 ? name : 'Admin Starter';

    if (compact) {
        return (
            <Zap
                className={cn(
                    'size-4 shrink-0 text-primary',
                    className,
                )}
                aria-hidden
            />
        );
    }

    return (
        <>
            <div
                className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg border border-sidebar-border/80 bg-sidebar-accent/50 text-primary',
                    className,
                )}
            >
                <Zap className="size-4" aria-hidden />
            </div>
            <div className="ml-2 grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold tracking-tight">
                    {brand}
                </span>
            </div>
        </>
    );
}
