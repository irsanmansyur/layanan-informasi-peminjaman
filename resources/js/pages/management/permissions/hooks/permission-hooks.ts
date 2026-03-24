import { router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import permissionsRoutes from '@/routes/permissions';
import type { Filter, FilterOption } from '@/types/datatables';
import type {
    ManagementPermission,
    PermissionListResponse,
} from '../types/permission-types';

type UsePermissionFiltersResult = {
    filters: Filter[];
    loading: boolean;
    error: string | null;
};

type UsePermissionsTableStateResult = {
    tableKey: number;
    deletingId: number | null;
    actionError: string | null;
    reloadTable: () => void;
    deletePermission: (permission: ManagementPermission) => void;
};

export function usePermissionFilters(): UsePermissionFiltersResult {
    const [groupOptions, setGroupOptions] = useState<FilterOption[]>([]);
    const [guardOptions, setGuardOptions] = useState<FilterOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchPermissions = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(permissionsRoutes.list().url);

                if (!response.ok) {
                    throw new Error(
                        `Failed to load permission list (status ${response.status})`,
                    );
                }

                const data = (await response.json()) as PermissionListResponse;

                if (!isMounted) return;

                const uniqueGroups = Array.from(
                    new Set(
                        data.permissions
                            .map((permission) => permission.group)
                            .filter(
                                (group): group is string =>
                                    typeof group === 'string' && group.length > 0,
                            ),
                    ),
                );

                const uniqueGuards = Array.from(
                    new Set(
                        data.permissions
                            .map((permission) => permission.guard_name)
                            .filter((guard) => guard && guard.length > 0),
                    ),
                );

                setGroupOptions(
                    uniqueGroups.map<FilterOption>((group) => ({
                        label: group,
                        value: group,
                    })),
                );

                setGuardOptions(
                    uniqueGuards.map<FilterOption>((guard) => ({
                        label: guard,
                        value: guard,
                    })),
                );
            } catch (err) {
                if (!isMounted) return;

                console.error('Error fetching permissions list:', err);
                setError('Failed to load permission list. Please try again.');
                toast.error('Failed to load permission list. Please try again.');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchPermissions();

        return () => {
            isMounted = false;
        };
    }, []);

    const filters: Filter[] = useMemo(
        () => [
            {
                key: 'group',
                label: 'Group',
                options: groupOptions,
                defaultValue: 'all',
                variant: 'combobox',
            },
            {
                key: 'guard_name',
                label: 'Guard',
                options: guardOptions,
                defaultValue: 'all',
            },
        ],
        [groupOptions, guardOptions],
    );

    return {
        filters,
        loading,
        error,
    };
}

export function usePermissionsTableState(): UsePermissionsTableStateResult {
    const [tableKey, setTableKey] = useState(0);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const reloadTable = useCallback(() => {
        setTableKey((prev) => prev + 1);
    }, []);

    const deletePermission = useCallback(
        (permission: ManagementPermission) => {
            setActionError(null);
            setDeletingId(permission.id);

            router.delete(permissionsRoutes.destroy(String(permission.id)).url, {
                preserveScroll: true,
                onSuccess: () => {
                    reloadTable();
                    toast.success(
                        `Permission "${permission.name}" was deleted successfully.`,
                    );
                },
                onError: (errors) => {
                    const message =
                        (errors?.message as string | undefined) ??
                        'An error occurred while deleting permission. Please try again.';

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
        deletePermission,
    };
}

