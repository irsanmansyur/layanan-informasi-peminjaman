import { router } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import roles from '@/routes/roles';
import users from '@/routes/users';
import type { Filter, FilterOption } from '@/types/datatables';
import type { ManagementUser, RoleResponse, UseUsersBulkDeleteResult } from '../types/user-types';

type UseRoleFiltersResult = {
    filters: Filter[];
    loading: boolean;
    error: string | null;
};

type UseUsersTableStateResult = {
    tableKey: number;
    deletingId: string | null;
    actionError: string | null;
    reloadTable: () => void;
    deleteUser: (user: ManagementUser) => void;
};

export function useRoleFilters(): UseRoleFiltersResult {
    const [options, setOptions] = useState<FilterOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchRoles = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(roles.list().url);

                if (!response.ok) {
                    throw new Error(`Failed to load roles (status ${response.status})`);
                }

                const data = (await response.json()) as RoleResponse;

                if (!isMounted) return;

                const roleOptions: FilterOption[] = data.roles.map((role) => ({
                    label: role.label,
                    value: role.name,
                }));

                setOptions(roleOptions);
            } catch (err) {
                if (!isMounted) return;
                console.error('Error fetching roles list:', err);
                setError('Failed to load role list. Please try again.');
                toast.error('Failed to load role list. Please try again.');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchRoles();

        return () => {
            isMounted = false;
        };
    }, []);

    const filters: Filter[] = useMemo(
        () => [
            {
                key: 'role',
                label: 'Role',
                options,
                defaultValue: 'all',
            },
        ],
        [options],
    );

    return {
        filters,
        loading,
        error,
    };
}

export function useUsersTableState(): UseUsersTableStateResult {
    const [tableKey, setTableKey] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const reloadTable = useCallback(() => {
        setTableKey((prev) => prev + 1);
    }, []);

    const deleteUser = useCallback(
        (user: ManagementUser) => {
            setActionError(null);
            setDeletingId(user.id);

            router.delete(users.destroy(user.id).url, {
                preserveScroll: true,
                onSuccess: () => {
                    reloadTable();
                    toast.success(`User "${user.name}" was deleted successfully.`);
                },
                onError: (errors) => {
                    const message =
                        (errors?.message as string | undefined) ??
                        'An error occurred while deleting user. Please try again.';

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
        deleteUser,
    };
}

export function useUsersBulkDelete(onAfterDelete: () => void): UseUsersBulkDeleteResult {
    const [bulkDeleting, setBulkDeleting] = useState(false);

    const handleBulkDelete = useCallback(
        async (usersToDelete: ManagementUser[]) => {
            if (!usersToDelete.length) {
                return;
            }

            setBulkDeleting(true);

            try {
                const ids = usersToDelete.map((user) => user.id);

                await axios.delete(users.bulkDestroy().url, {
                    data: {
                        ids,
                    },
                });

                onAfterDelete();
                toast.success(`${usersToDelete.length} users were deleted successfully.`);
            } catch (error) {
                console.error('Error bulk deleting users:', error);

                const message =
                    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                    'An error occurred while deleting multiple users. Please try again.';

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

