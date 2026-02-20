import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { Breadcrumbs } from '@/components/breadcrumbs';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader />
                <div className="flex justify-between items-center px-4 py-2 border-b border-sidebar-border/50 shadow-sm backdrop-blur-xl bg-sidebar/60">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                {children}
            </AppContent>
        </AppShell>
    );
}
