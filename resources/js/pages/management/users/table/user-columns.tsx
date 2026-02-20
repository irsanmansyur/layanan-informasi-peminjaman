import type { Column, SearchableColumn } from '@/types/datatables';
import type { ManagementUser } from '../types/user-types';

export const userColumns: Column<ManagementUser>[] = [
    {
        key: 'name',
        label: 'Name',
        sortable: true,
        searchable: true,
        hideBelow: 'sm',
        className: 'min-w-[200px]',
    },
    {
        key: 'email',
        label: 'Email',
        sortable: true,
        searchable: true,
        hideBelow: 'md',
        className: 'min-w-[220px]',
    },
    {
        key: 'roles',
        label: 'Roles',
        sortable: true,
        hideBelow: 'md',
        className: 'min-w-[180px]',
        render: (user) => user.roles.join(', '),
    },
    {
        key: 'created_at',
        label: 'Created At',
        sortable: true,
        hideBelow: 'lg',
        className: 'min-w-[160px]',
        render: (user) => new Date(user.created_at).toLocaleDateString(),
    },
];

export const userSearchableColumns: SearchableColumn[] = [
    {
        key: 'name',
        label: 'Name',
    },
    {
        key: 'email',
        label: 'Email',
    },
    {
        key: 'roles',
        label: 'Roles',
    },
];

