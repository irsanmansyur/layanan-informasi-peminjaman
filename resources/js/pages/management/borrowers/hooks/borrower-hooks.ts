import { router } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import borrowers from '@/routes/borrowers';
import type { Filter, FilterOption } from '@/types/datatables';
import type {
    ManagementBorrower,
    UseBorrowersBulkDeleteResult,
} from '../types/borrower-types';

type UseStatusFiltersResult = {
    filters: Filter[];
};

type UseBorrowersTableStateResult = {
    tableKey: number;
    deletingId: string | null;
    actionError: string | null;
    reloadTable: () => void;
    deleteBorrower: (borrower: ManagementBorrower) => void;
};

const STATUS_OPTIONS: FilterOption[] = [
    { label: 'Belum Lunas', value: 'belum lunas' },
    { label: 'Lunas', value: 'lunas' },
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

export function useBorrowersTableState(): UseBorrowersTableStateResult {
    const [tableKey, setTableKey] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const reloadTable = useCallback(() => {
        setTableKey((prev) => prev + 1);
    }, []);

    const deleteBorrower = useCallback(
        (borrower: ManagementBorrower) => {
            setActionError(null);
            setDeletingId(borrower.id);

            router.delete(borrowers.destroy(borrower.id).url, {
                preserveScroll: true,
                onSuccess: () => {
                    reloadTable();
                    toast.success(`Peminjam "${borrower.name}" berhasil dihapus.`);
                },
                onError: (errors) => {
                    const message =
                        (errors?.message as string | undefined) ??
                        'Terjadi kesalahan saat menghapus peminjam. Silakan coba lagi.';

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
        deleteBorrower,
    };
}

export function useBorrowersBulkDelete(onAfterDelete: () => void): UseBorrowersBulkDeleteResult {
    const [bulkDeleting, setBulkDeleting] = useState(false);

    const handleBulkDelete = useCallback(
        async (borrowersToDelete: ManagementBorrower[]) => {
            if (!borrowersToDelete.length) {
                return;
            }

            setBulkDeleting(true);

            try {
                const ids = borrowersToDelete.map((borrower) => borrower.id);

                await axios.delete(borrowers.bulkDestroy().url, {
                    data: { ids },
                });

                onAfterDelete();
                toast.success(`${borrowersToDelete.length} peminjam berhasil dihapus.`);
            } catch (error) {
                console.error('Error bulk deleting borrowers:', error);

                const message =
                    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                    'Terjadi kesalahan saat menghapus peminjam. Silakan coba lagi.';

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
