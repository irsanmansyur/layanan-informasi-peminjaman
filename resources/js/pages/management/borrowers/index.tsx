import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import borrowers from '@/routes/borrowers';
import type { BreadcrumbItem } from '@/types';
import BorrowerTable from './table/borrower-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Management Peminjam',
        href: borrowers.index().url,
    },
];

Borrowers.layout = (page: React.ReactNode) => (
    <AppLayout
        children={page}
        breadcrumbs={breadcrumbs}
        title="Management Peminjam"
    />
);

export default function Borrowers() {
    return <BorrowerTable />;
}
