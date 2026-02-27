import { router } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import rolesRoutes from '@/routes/roles';
import type { Filter } from '@/types/datatables';
import type { ManagementRole } from '../types/role-types';

type UseRoleFiltersResult = {
    filters: Filter[];
};

type UseRolesTableStateResult = {
    tableKey: number;
    deletingId: number | null;
    actionError: string | null;
    reloadTable: () => void;
    deleteRole: (role: ManagementRole) => void;
};

export function useRoleFilters(): UseRoleFiltersResult {
    const filters: Filter[] = useMemo(
        () => [
            {
                key: 'guard_name',
                label: 'Guard',
                options: [
                    { label: 'web', value: 'web' },
                    { label: 'api', value: 'api' },
                ],
                defaultValue: 'all',
            },
        ],
        [],
    );

    return {
        filters,
    };
}

export function useRolesTableState(): UseRolesTableStateResult {
    const [tableKey, setTableKey] = useState(0);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const reloadTable = useCallback(() => {
        setTableKey((prev) => prev + 1);
    }, []);

    const deleteRole = useCallback(
        (role: ManagementRole) => {
            setActionError(null);
            setDeletingId(role.id);

            router.delete(rolesRoutes.destroy(String(role.id)).url, {
                preserveScroll: true,
                onSuccess: () => {
                    reloadTable();
                    toast.success(`Role "${role.name}" berhasil dihapus.`);
                },
                onError: (errors) => {
                    const message =
                        (errors?.message as string | undefined) ??
                        'Terjadi kesalahan saat menghapus role. Silakan coba lagi.';

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
        deleteRole,
    };
}

