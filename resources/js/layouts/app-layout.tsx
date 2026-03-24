import { Head } from '@inertiajs/react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps } from '@/types';

export default ({ children, breadcrumbs, title, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} title={title} {...props}>
        <Head title={title} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-x-hidden p-3 md:p-4 lg:p-5">
            {children}
        </div>
    </AppLayoutTemplate>
);
