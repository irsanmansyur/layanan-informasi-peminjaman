import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import roles from '@/routes/roles';
import type { BreadcrumbItem } from '@/types';
import RoleTable from './table/role-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Management Roles',
        href: roles.index().url,
    },
];

Roles.layout = (page: React.ReactNode) => (
    <AppLayout
        children={page}
        breadcrumbs={breadcrumbs}
        title="Management Roles"
    />
);

export default function Roles() {
    return <RoleTable />;
}

