import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import permissions from '@/routes/permissions';
import type { BreadcrumbItem } from '@/types';
import PermissionTable from './table/permission-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Management Permissions',
        href: permissions.index().url,
    },
];

Permissions.layout = (page: React.ReactNode) => (
    <AppLayout
        children={page}
        breadcrumbs={breadcrumbs}
        title="Management Permissions"
    />
);

export default function Permissions() {
    return <PermissionTable />;
}

