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
import informations from '@/routes/informations';
import {
    useInformationsBulkDelete,
    useInformationsTableState,
    useStatusFilters,
} from '../hooks/information-hooks';
import type { ManagementInformation } from '../types/information-types';
import { informationColumns, informationSearchableColumns } from './information-columns';
import { InformationRowActions } from './information-row-actions';
import { InformationTopActions } from './information-top-actions';

export default function InformationTable() {
    const { filters } = useStatusFilters();
    const { tableKey, deletingId, deleteInformation, reloadTable } = useInformationsTableState();
    const [selectedInformations, setSelectedInformations] = React.useState<
        ManagementInformation[]
    >([]);

    const { hasPermission } = usePermissions();

    const canEdit = hasPermission('informations.update');
    const canDelete = hasPermission('informations.delete');
    const hasActionsAccess = canEdit || canDelete;

    const hasSelection = selectedInformations.length > 0;
    const selectedCount = selectedInformations.length;

    const { bulkDeleting, handleBulkDelete } = useInformationsBulkDelete(() => {
        reloadTable();
        setSelectedInformations([]);
    });

    return (
        <Card>
            <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <CardTitle>Informasi</CardTitle>
                    <CardDescription>
                        Daftar pengumuman dan informasi. Anda dapat melihat, menambah, mengedit,
                        dan menghapus informasi.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <DataTable<ManagementInformation>
                    key={tableKey}
                    columns={informationColumns}
                    filters={filters}
                    fetchUrl={informations.fetchData().url}
                    dataPath="informations"
                    searchDebounceMs={MANAGEMENT_DATA_TABLE_SEARCH_DEBOUNCE_MS}
                    searchPlaceholder="Cari informasi..."
                    defaultSort={{
                        key: 'created_at',
                        direction: 'desc',
                    }}
                    topContent={
                        <InformationTopActions
                            hasSelection={hasSelection}
                            selectedCount={selectedCount}
                            bulkDeleting={bulkDeleting}
                            onBulkDelete={() => handleBulkDelete(selectedInformations)}
                            onCreated={reloadTable}
                        />
                    }
                    searchableColumns={informationSearchableColumns}
                    selectable
                    onSelectionChange={setSelectedInformations}
                    actions={
                        hasActionsAccess
                            ? (information) => (
                                  <InformationRowActions
                                      information={information}
                                      deletingId={deletingId}
                                      onDelete={deleteInformation}
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
