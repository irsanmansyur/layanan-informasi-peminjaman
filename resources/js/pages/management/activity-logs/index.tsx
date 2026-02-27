import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import activityLogs from '@/routes/activity-logs';
import type { BreadcrumbItem } from '@/types';
import ActivityLogTable from './table/activity-log-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Activity Logs',
        href: activityLogs.index().url,
    },
];

ActivityLogs.layout = (page: React.ReactNode) => (
    <AppLayout
        children={page}
        breadcrumbs={breadcrumbs}
        title="Activity Logs"
    />
);

export default function ActivityLogs() {
    return <ActivityLogTable />;
}
