import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import users from '@/routes/users';
import type { BreadcrumbItem } from '@/types';
import UserTable from './table/user-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Management Users',
        href: users.index().url,
    },
];

Users.layout = (page: React.ReactNode) => (
    <AppLayout
        children={page}
        breadcrumbs={breadcrumbs}
        title="Management Users"
    />
);

export default function Users() {
    return (
        <UserTable />
    );
}
