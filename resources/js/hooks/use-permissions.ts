import { usePage } from '@inertiajs/react';

type PermissionCheckMode = 'any' | 'all';

type UsePermissionsResult = {
    permissions: string[];
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (required: string[]) => boolean;
    hasAllPermissions: (required: string[]) => boolean;
    can: (required: string | string[], mode?: PermissionCheckMode) => boolean;
};

export function usePermissions(): UsePermissionsResult {
    const { auth } = usePage().props as { auth: { permissions?: string[] } };
    const permissions = auth.permissions ?? [];

    const hasPermission = (permission: string): boolean =>
        permissions.includes(permission);

    const hasAnyPermission = (required: string[]): boolean =>
        required.some((permission) => permissions.includes(permission));

    const hasAllPermissions = (required: string[]): boolean =>
        required.every((permission) => permissions.includes(permission));

    const can = (
        required: string | string[],
        mode: PermissionCheckMode = 'any',
    ): boolean => {
        const list = Array.isArray(required) ? required : [required];

        if (mode === 'all') {
            return hasAllPermissions(list);
        }

        return hasAnyPermission(list);
    };

    return {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        can,
    };
}

