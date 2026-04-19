import React from 'react';
import { DataTable } from '@/components/datatables';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { MANAGEMENT_DATA_TABLE_SEARCH_DEBOUNCE_MS } from '@/config/datatables';
import { usePermissions } from '@/hooks/use-permissions';
import borrowers from '@/routes/borrowers';
import {
    useBorrowersBulkDelete,
    useBorrowersTableState,
    useStatusFilters,
} from '../hooks/borrower-hooks';
import type { ManagementBorrower } from '../types/borrower-types';
import { borrowerColumns, borrowerSearchableColumns } from './borrower-columns';
import { BorrowerRowActions } from './borrower-row-actions';
import { BorrowerTopActions } from './borrower-top-actions';

export default function BorrowerTable() {
    const { filters } = useStatusFilters();
    const { tableKey, deletingId, deleteBorrower, reloadTable } = useBorrowersTableState();
    const [selectedBorrowers, setSelectedBorrowers] = React.useState<ManagementBorrower[]>([]);

    const { hasPermission } = usePermissions();

    const canEdit = hasPermission('borrowers.update');
    const canDelete = hasPermission('borrowers.delete');
    const hasActionsAccess = canEdit || canDelete;

    const hasSelection = selectedBorrowers.length > 0;
    const selectedCount = selectedBorrowers.length;

    const { bulkDeleting, handleBulkDelete } = useBorrowersBulkDelete(() => {
        reloadTable();
        setSelectedBorrowers([]);
    });

    return (
        <Card>
            <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <CardTitle>Peminjam</CardTitle>
                    <CardDescription>
                        Daftar semua orang yang meminjam. Anda dapat melihat, menambah, mengedit,
                        dan menghapus peminjam.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <DataTable<ManagementBorrower>
                    key={tableKey}
                    columns={borrowerColumns}
                    filters={filters}
                    fetchUrl={borrowers.fetchData().url}
                    dataPath="borrowers"
                    searchDebounceMs={MANAGEMENT_DATA_TABLE_SEARCH_DEBOUNCE_MS}
                    searchPlaceholder="Cari peminjam..."
                    defaultSort={{
                        key: 'created_at',
                        direction: 'desc',
                    }}
                    topContent={
                        <BorrowerTopActions
                            hasSelection={hasSelection}
                            selectedCount={selectedCount}
                            bulkDeleting={bulkDeleting}
                            onBulkDelete={() => handleBulkDelete(selectedBorrowers)}
                            onCreated={reloadTable}
                        />
                    }
                    searchableColumns={borrowerSearchableColumns}
                    selectable
                    onSelectionChange={setSelectedBorrowers}
                    actions={
                        hasActionsAccess
                            ? (borrower) => (
                                  <BorrowerRowActions
                                      borrower={borrower}
                                      deletingId={deletingId}
                                      onDelete={deleteBorrower}
                                      onUpdated={reloadTable}
                                  />
                              )
                            : undefined
                    }
                    actionColumn={
                        hasActionsAccess
                            ? {
                                  header: 'Aksi',
                                  className: 'w-[140px]',
                              }
                            : undefined
                    }
                    tableClassName="min-w-[820px]"
                />
            </CardContent>
        </Card>
    );
}
