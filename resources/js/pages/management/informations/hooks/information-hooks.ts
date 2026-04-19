import { router } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import informations from '@/routes/informations';
import type { Filter, FilterOption } from '@/types/datatables';
import type {
    ManagementInformation,
    UseInformationsBulkDeleteResult,
} from '../types/information-types';

type UseStatusFiltersResult = {
    filters: Filter[];
};

type UseInformationsTableStateResult = {
    tableKey: number;
    deletingId: string | null;
    actionError: string | null;
    reloadTable: () => void;
    deleteInformation: (information: ManagementInformation) => void;
};

const STATUS_OPTIONS: FilterOption[] = [
    { label: 'Aktif', value: 'aktif' },
    { label: 'Tidak Aktif', value: 'tidak aktif' },
];

export function useStatusFilters(): UseStatusFiltersResult {
    const filters: Filter[] = useMemo(
        () => [
            {
                key: 'status',
                label: 'Status',
                options: STATUS_OPTIONS,
                defaultValue: 'all',
            },
        ],
        [],
    );

    return { filters };
}

export function useInformationsTableState(): UseInformationsTableStateResult {
    const [tableKey, setTableKey] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const reloadTable = useCallback(() => {
        setTableKey((prev) => prev + 1);
    }, []);

    const deleteInformation = useCallback(
        (information: ManagementInformation) => {
            setActionError(null);
            setDeletingId(information.id);

            router.delete(informations.destroy(information.id).url, {
                preserveScroll: true,
                onSuccess: () => {
                    reloadTable();
                    toast.success(`Informasi "${information.title}" berhasil dihapus.`);
                },
                onError: (errors) => {
                    const message =
                        (errors?.message as string | undefined) ??
                        'Terjadi kesalahan saat menghapus informasi. Silakan coba lagi.';

                    setActionError(message);
                    toast.error(message);
                },
                onFinish: () => {
                    setDeletingId(null);
                },
            });
        },
        [reloadTable],
    );

    return {
        tableKey,
        deletingId,
        actionError,
        reloadTable,
        deleteInformation,
    };
}

export function useInformationsBulkDelete(
    onAfterDelete: () => void,
): UseInformationsBulkDeleteResult {
    const [bulkDeleting, setBulkDeleting] = useState(false);

    const handleBulkDelete = useCallback(
        async (informationsToDelete: ManagementInformation[]) => {
            if (!informationsToDelete.length) {
                return;
            }

            setBulkDeleting(true);

            try {
                const ids = informationsToDelete.map((information) => information.id);

                await axios.delete(informations.bulkDestroy().url, {
                    data: { ids },
                });

                onAfterDelete();
                toast.success(`${informationsToDelete.length} informasi berhasil dihapus.`);
            } catch (error) {
                console.error('Error bulk deleting informations:', error);

                const message =
                    (error as { response?: { data?: { message?: string } } })?.response?.data
                        ?.message ??
                    'Terjadi kesalahan saat menghapus informasi. Silakan coba lagi.';

                toast.error(message);
            } finally {
                setBulkDeleting(false);
            }
        },
        [onAfterDelete],
    );

    return {
        bulkDeleting,
        handleBulkDelete,
    };
}
