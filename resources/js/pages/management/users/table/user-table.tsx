import React from 'react';
import { DataTable } from '@/components/datatables';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import users from '@/routes/users';
import { useRoleFilters, useUsersBulkDelete, useUsersTableState } from '../hooks/user-hooks';
import type { ManagementUser } from '../types/user-types';
import { userColumns, userSearchableColumns } from './user-columns';
import { UserRowActions } from './user-row-actions';
import { UserTopActions } from './user-top-actions';

export default function UserTable() {
    const { filters, loading: rolesLoading } = useRoleFilters();
    const { tableKey, deletingId, deleteUser, reloadTable } = useUsersTableState();
    const [selectedUsers, setSelectedUsers] = React.useState<ManagementUser[]>([]);

    const hasSelection = selectedUsers.length > 0;
    const selectedCount = selectedUsers.length;

    const { bulkDeleting, handleBulkDelete } = useUsersBulkDelete(() => {
        reloadTable();
        setSelectedUsers([]);
    });

    return (
        <Card>
            <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                        List of all users in the system. Here you can view, add, edit, disable and delete users.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {rolesLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Spinner className="size-4" />
                        <span>Memuat daftar role...</span>
                    </div>
                )}
                <DataTable<ManagementUser>
                    key={tableKey}
                    columns={userColumns}
                    filters={filters}
                    fetchUrl={users.fetchData().url}
                    dataPath="users"
                    searchPlaceholder="Search users..."
                    defaultSort={{
                        key: 'created_at',
                        direction: 'desc',
                    }}
                    topContent={
                        <UserTopActions
                            hasSelection={hasSelection}
                            selectedCount={selectedCount}
                            bulkDeleting={bulkDeleting}
                            onBulkDelete={() => handleBulkDelete(selectedUsers)}
                            onCreated={reloadTable}
                        />
                    }
                    searchableColumns={userSearchableColumns}
                    selectable
                    onSelectionChange={setSelectedUsers}
                    actions={(user) => (
                        <UserRowActions
                            user={user}
                            deletingId={deletingId}
                            onDelete={deleteUser}
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
