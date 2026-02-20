import { Head } from '@inertiajs/react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps } from '@/types';

export default ({ children, breadcrumbs, title, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} title={title} {...props}>
        <Head title={title} />
        <div className="flex flex-col flex-1 overflow-auto p-4">
            {children}
        </div>
    </AppLayoutTemplate>
);
