import { Badge } from '@/components/ui/badge';
import type { Column, SearchableColumn } from '@/types/datatables';
import type { ManagementRole } from '../types/role-types';

export const roleColumns: Column<ManagementRole>[] = [
    {
        key: 'name',
        label: 'Name',
        sortable: true,
        searchable: true,
        hideBelow: 'sm',
        className: 'min-w-[200px]',
    },
    {
        key: 'guard_name',
        label: 'Guard',
        sortable: true,
        hideBelow: 'md',
        className: 'min-w-[140px]',
        render: (role) => role.guard_name ?? 'web',
    },
    {
        key: 'permissions',
        label: 'Permissions',
        sortable: false,
        hideBelow: 'lg',
        className: 'min-w-[220px] max-w-xs',
        render: (role) => (
            role.permissions.length === 0
                ? '-'
                : role.permissions
                      .map((permission) => permission.name)
                      .slice(0, 3)
                      .join(', ') + (role.permissions.length > 3 ? '…' : '')
        ),
    },
    {
        key: 'count',
        label: 'Count',
        hideBelow: 'xl',
        className: 'min-w-[80px] text-center',
        render: (role) => (
            <div className="text-center">
                <Badge
                    variant="outline"
                    className="text-xs font-medium border rounded-full border-primary text-primary bg-primary/15"
                >
                    {role.permissions.length}
                </Badge>
            </div>
        ),
    },
    {
        key: 'created_at',
        label: 'Created At',
        sortable: true,
        hideBelow: 'xl',
        className: 'min-w-[160px]',
        render: (role) => new Date(role.created_at).toLocaleDateString(),
    },
];

export const roleSearchableColumns: SearchableColumn[] = [
    {
        key: 'name',
        label: 'Name',
    },
    {
        key: 'guard_name',
        label: 'Guard',
    },
    {
        key: 'permissions',
        label: 'Permission name',
    },
];

