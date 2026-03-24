import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, DashboardPageProps } from '@/types';
import { AdminOverview } from './dashboard/admin-overview';
import { MemberOverview } from './dashboard/member-overview';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

Dashboard.layout = (page: ReactNode) => (
    <AppLayout children={page} breadcrumbs={breadcrumbs} title="Dashboard" />
);

export default function Dashboard({
    is_admin,
    greeting_name,
    roles,
    admin,
}: DashboardPageProps) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="flex w-full min-w-0 max-w-full flex-1 flex-col gap-5">
                <section className="w-full min-w-0 max-w-full">
                    <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-4 shadow-sm md:p-5">
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -right-6 -top-10 h-28 w-40 rounded-full bg-primary/10 blur-2xl"
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -bottom-8 left-1/3 h-24 w-36 rounded-full bg-chart-2/10 blur-2xl"
                        />
                        <div className="relative z-[1] space-y-2.5">
                            <Badge
                                variant="secondary"
                                className="h-6 w-fit border border-border/50 bg-muted/70 px-2.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                            >
                                Main panel
                            </Badge>
                            <h1 className="text-balance text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                Dashboard
                                <span className="bg-linear-to-r from-primary to-chart-2 bg-clip-text font-bold text-transparent">
                                    {' '}
                                    {is_admin ? 'administrator' : 'member'}
                                </span>
                            </h1>
                            <p className="max-w-2xl text-pretty text-sm leading-snug text-muted-foreground">
                                {is_admin
                                    ? 'Platform overview and quick access to administration tools.'
                                    : 'Welcome back — use the sidebar to open pages you are allowed to see.'}
                            </p>
                        </div>
                    </div>
                </section>

                {is_admin && admin ? (
                    <AdminOverview stats={admin} />
                ) : (
                    <MemberOverview greetingName={greeting_name} roles={roles} />
                )}
            </div>
        </>
    );
}
