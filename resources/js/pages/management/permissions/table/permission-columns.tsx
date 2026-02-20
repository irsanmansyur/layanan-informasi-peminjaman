import type { Column, SearchableColumn } from '@/types/datatables';
import type { ManagementPermission } from '../types/permission-types';

export const permissionColumns: Column<ManagementPermission>[] = [
    {
        key: 'name',
        label: 'Name',
        sortable: true,
        searchable: true,
        hideBelow: 'sm',
        className: 'min-w-[200px]',
    },
    {
        key: 'group',
        label: 'Group',
        sortable: true,
        searchable: true,
        hideBelow: 'md',
        className: 'min-w-[180px]',
        render: (permission) => permission.group ?? '-',
    },
    {
        key: 'guard_name',
        label: 'Guard',
        sortable: true,
        searchable: true,
        hideBelow: 'md',
        className: 'min-w-[140px]',
    },
    {
        key: 'created_at',
        label: 'Created At',
        sortable: true,
        hideBelow: 'lg',
        className: 'min-w-[160px]',
        render: (permission) => new Date(permission.created_at).toLocaleDateString(),
    },
];

export const permissionSearchableColumns: SearchableColumn[] = [
    {
        key: 'name',
        label: 'Name',
    },
    {
        key: 'group',
        label: 'Group',
    },
    {
        key: 'guard_name',
        label: 'Guard',
    },
];

