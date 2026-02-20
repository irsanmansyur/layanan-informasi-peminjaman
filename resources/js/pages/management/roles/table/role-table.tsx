import { DataTable } from '@/components/datatables';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import rolesRoutes from '@/routes/roles';
import { useRoleFilters, useRolesTableState } from '../hooks/role-hooks';
import type { ManagementRole } from '../types/role-types';
import { roleColumns, roleSearchableColumns } from './role-columns';
import { RoleRowActions } from './role-row-actions';
import { RoleTopActions } from './role-top-actions';

export default function RoleTable() {
    const { filters } = useRoleFilters();
    const { tableKey, deletingId, deleteRole, reloadTable } = useRolesTableState();

    return (
        <Card>
            <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <CardTitle>Roles</CardTitle>
                    <CardDescription>
                        Kelola roles dan pengaturan permissions yang digunakan untuk
                        mengatur akses fitur aplikasi.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <DataTable<ManagementRole>
                    key={tableKey}
                    columns={roleColumns}
                    filters={filters}
                    fetchUrl={rolesRoutes.fetchData().url}
                    dataPath="roles"
                    searchPlaceholder="Search roles..."
                    defaultSort={{
                        key: 'name',
                        direction: 'asc',
                    }}
                    topContent={<RoleTopActions onCreated={reloadTable} />}
                    searchableColumns={roleSearchableColumns}
                    actions={(role) => (
                        <RoleRowActions
                            role={role}
                            deletingId={deletingId}
                            onDelete={deleteRole}
                            onUpdated={reloadTable}
                        />
                    )}
                    actionColumn={{
                        header: 'Actions',
                        className: 'w-[140px]',
                    }}
                    tableClassName="min-w-[720px]"
                />
            </CardContent>
        </Card>
    );
}
