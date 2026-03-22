import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
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

export default function Dashboard({ is_admin, greeting_name, roles, admin }: DashboardPageProps) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        {is_admin
                            ? 'Ringkasan platform dan pintasan administrasi.'
                            : 'Selamat datang kembali di aplikasi.'}
                    </p>
                </div>

                {is_admin && admin ? (
                    <AdminOverview stats={admin} />
                ) : (
                    <MemberOverview greetingName={greeting_name} roles={roles} />
                )}
            </div>
        </>
    );
}
