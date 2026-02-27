import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import type { MainNavGroup, NavItem } from '@/types';

function filterNavItems(items: NavItem[], permissions: string[]): NavItem[] {
    const filtered: NavItem[] = [];

    items.forEach((item) => {
        const children = item.children
            ? filterNavItems(item.children, permissions)
            : undefined;

        const hasRequiredPermission =
            !item.requiredPermissions ||
            item.requiredPermissions.some((permission) =>
                permissions.includes(permission),
            );

        const hasVisibleChildren = Boolean(children && children.length > 0);

        if (!hasRequiredPermission && !hasVisibleChildren) {
            return;
        }

        filtered.push({
            ...item,
            children,
        });
    });

    return filtered;
}

export function useFilteredMainNavItems(
    groups: MainNavGroup[],
): MainNavGroup[] {
    const { auth } = usePage().props as { auth: { permissions?: string[] } };

    return useMemo(() => {
        const permissionsList = auth.permissions ?? [];

        return groups
            .map((group) => ({
                ...group,
                items: filterNavItems(group.items, permissionsList),
            }))
            .filter((group) => group.items.length > 0);
    }, [groups, auth]);
}
