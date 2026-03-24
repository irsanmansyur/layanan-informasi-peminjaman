import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
    title: string;
    value: number;
    description?: string;
    href?: string;
    className?: string;
    footer?: ReactNode;
    icon?: LucideIcon;
};

export function StatCard({
    title,
    value,
    description,
    href,
    className,
    footer,
    icon: Icon,
}: StatCardProps) {
    const content = (
        <Card
            className={cn(
                'h-full rounded-xl border border-border/80 bg-card py-4 shadow-sm transition-colors duration-150 dark:border-border/90',
                href &&
                    'hover:border-primary/30 hover:bg-muted/20 hover:shadow-md',
                className,
            )}
        >
            <CardHeader className="flex flex-row items-start gap-3 space-y-0 px-4 pb-2 pt-0">
                {Icon ? (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                        <Icon className="size-4" aria-hidden />
                    </div>
                ) : null}
                <div className="min-w-0 flex-1 space-y-0.5">
                    <CardTitle className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {title}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-1 px-4 pb-0 pt-0">
                <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                    {value.toLocaleString('en-US')}
                </p>
                {description ? (
                    <p className="text-xs leading-snug text-muted-foreground">
                        {description}
                    </p>
                ) : null}
                {footer}
            </CardContent>
        </Card>
    );

    if (href) {
        return (
            <Link
                href={href}
                className="block h-full min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
                {content}
            </Link>
        );
    }

    return content;
}
