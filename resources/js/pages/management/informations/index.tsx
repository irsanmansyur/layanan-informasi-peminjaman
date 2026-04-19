import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import informations from '@/routes/informations';
import type { BreadcrumbItem } from '@/types';
import InformationTable from './table/information-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Informasi',
        href: informations.index().url,
    },
];

Informations.layout = (page: React.ReactNode) => (
    <AppLayout children={page} breadcrumbs={breadcrumbs} title="Informasi" />
);

export default function Informations() {
    return <InformationTable />;
}
