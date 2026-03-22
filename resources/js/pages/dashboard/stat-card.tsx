import { Link } from '@inertiajs/react';
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
};

export function StatCard({ title, value, description, href, className, footer }: StatCardProps) {
    const content = (
        <Card className={cn('h-full transition-colors', href && 'hover:bg-muted/40', className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                <p className="text-3xl font-semibold tabular-nums tracking-tight">{value.toLocaleString()}</p>
                {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
                {footer}
            </CardContent>
        </Card>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
                {content}
            </Link>
        );
    }

    return content;
}
