import React from 'react';
import { DataTable } from '@/components/datatables';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { usePermissions } from '@/hooks/use-permissions';
import permissionsRoutes from '@/routes/permissions';
import { usePermissionFilters, usePermissionsTableState } from '../hooks/permission-hooks';
import type { ManagementPermission } from '../types/permission-types';
import { permissionColumns, permissionSearchableColumns } from './permission-columns';
import { PermissionRowActions } from './permission-row-actions';
import { PermissionTopActions } from './permission-top-actions';

export default function PermissionTable() {
    const { filters, loading: filtersLoading } = usePermissionFilters();
    const { tableKey, deletingId, deletePermission, reloadTable } = usePermissionsTableState();

    const { hasPermission } = usePermissions();

    const canEditPermission = hasPermission('permissions.update');
    const canDeletePermission = hasPermission('permissions.delete');
    const hasActionsAccess = canEditPermission || canDeletePermission;

    return (
        <Card>
            <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <CardTitle>Permissions</CardTitle>
                    <CardDescription>
                        Kelola daftar permission yang digunakan untuk mengatur akses fitur aplikasi.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {filtersLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Spinner className="size-4" />
                        <span>Memuat filter permission...</span>
                    </div>
                )}
                <DataTable<ManagementPermission>
                    key={tableKey}
                    columns={permissionColumns}
                    filters={filters}
                    fetchUrl={permissionsRoutes.fetchData().url}
                    dataPath="permissions"
                    searchPlaceholder="Search permissions..."
                    defaultSort={{
                        key: 'name',
                        direction: 'asc',
                    }}
                    topContent={
                        <PermissionTopActions
                            onCreated={reloadTable}
                        />
                    }
                    searchableColumns={permissionSearchableColumns}
                    actions={
                        hasActionsAccess
                            ? (permission) => (
                                  <PermissionRowActions
                                      permission={permission}
                                      deletingId={deletingId}
                                      onDelete={deletePermission}
                                      onUpdated={reloadTable}
                                  />
                              )
                            : undefined
                    }
                    actionColumn={
                        hasActionsAccess
                            ? {
                                  header: 'Actions',
                                  className: 'w-[140px]',
                              }
                            : undefined
                    }
                    tableClassName="min-w-[720px]"
                />
            </CardContent>
        </Card>
    );
}
