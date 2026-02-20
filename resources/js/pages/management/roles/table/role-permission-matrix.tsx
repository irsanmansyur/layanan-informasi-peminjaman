import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { RolePermission } from '../types/role-types';

export type CrudAction = 'create' | 'read' | 'update' | 'delete';

type PermissionGroupRow = {
    groupKey: string;
    label: string;
    actions: Partial<Record<CrudAction, RolePermission>>;
    others: RolePermission[];
};

type RolePermissionMatrixProps = {
    permissions: RolePermission[];
    selectedPermissionIds: number[];
    onTogglePermission: (permissionId: number) => void;
};

function detectAction(name: string): CrudAction | null {
    const value = name.toLowerCase();

    if (
        value.includes('.create') ||
        value.includes(' create') ||
        value.startsWith('create ') ||
        value.endsWith(' create') ||
        value === 'create'
    ) {
        return 'create';
    }

    if (
        value.includes('.read') ||
        value.includes(' read') ||
        value.includes('.view') ||
        value.includes(' view') ||
        value.endsWith('.index') ||
        value.endsWith('.show') ||
        value === 'read' ||
        value === 'view'
    ) {
        return 'read';
    }

    if (
        value.includes('.update') ||
        value.includes(' update') ||
        value.includes('.edit') ||
        value.includes(' edit') ||
        value === 'update' ||
        value === 'edit'
    ) {
        return 'update';
    }

    if (
        value.includes('.delete') ||
        value.includes(' delete') ||
        value.includes('.destroy') ||
        value.includes(' destroy') ||
        value === 'delete' ||
        value === 'destroy'
    ) {
        return 'delete';
    }

    return null;
}

function buildPermissionGroups(
    permissions: RolePermission[],
): { groups: PermissionGroupRow[]; customPermissions: RolePermission[] } {
    const groupsMap = new Map<string, PermissionGroupRow>();
    const customPermissions: RolePermission[] = [];

    permissions.forEach((permission) => {
        const groupKey = permission.group ?? 'Ungrouped';
        const groupLabel = permission.group ?? 'Ungrouped';

        let group = groupsMap.get(groupKey);

        if (!group) {
            group = {
                groupKey,
                label: groupLabel,
                actions: {},
                others: [],
            };
            groupsMap.set(groupKey, group);
        }

        const action = detectAction(permission.name);

        if (action) {
            group.actions[action] = permission;
        } else {
            group.others.push(permission);
            customPermissions.push(permission);
        }
    });

    const groups = Array.from(groupsMap.values()).sort((a, b) =>
        a.label.localeCompare(b.label),
    );

    return { groups, customPermissions };
}

export function RolePermissionMatrix({
    permissions,
    selectedPermissionIds,
    onTogglePermission,
}: RolePermissionMatrixProps) {
    const { groups, customPermissions } = useMemo(
        () => buildPermissionGroups(permissions),
        [permissions],
    );

    const crudHeaders: { key: CrudAction; label: string }[] = [
        { key: 'create', label: 'Create' },
        { key: 'read', label: 'Read' },
        { key: 'update', label: 'Update' },
        { key: 'delete', label: 'Delete' },
    ];

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <div className="grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] items-center border-b bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
                    <div>Module / Permission</div>
                    {crudHeaders.map((header) => (
                        <div key={header.key} className="text-center">
                            {header.label}
                        </div>
                    ))}
                </div>

                <div className="divide-y overflow-y-auto h-auto max-h-[calc(100vh-200px)]">
                    {groups.map((group) => (
                        <div
                            key={group.groupKey}
                            className="grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] items-center px-4 py-2 text-sm"
                        >
                            <div className="truncate font-medium">
                                {group.label}
                            </div>
                            {crudHeaders.map((header) => {
                                const permission = group.actions[header.key];

                                if (!permission) {
                                    return (
                                        <div
                                            key={header.key}
                                            className="flex justify-center"
                                        />
                                    );
                                }

                                const checked = selectedPermissionIds.includes(
                                    permission.id,
                                );

                                return (
                                    <div
                                        key={header.key}
                                        className="flex justify-center"
                                    >
                                        <Checkbox
                                            checked={checked}
                                            onCheckedChange={() =>
                                                onTogglePermission(
                                                    permission.id,
                                                )
                                            }
                                            className={cn(
                                                checked &&
                                                    'border-primary bg-primary/10 text-primary',
                                            )}
                                            aria-label={`${header.label} permission for ${group.label}`}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {groups.length === 0 && (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                            Belum ada permission yang tersedia.
                        </div>
                    )}
                </div>
            </div>

            {customPermissions.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                        Other permissions
                    </p>
                    <div className="grid gap-2 md:grid-cols-2">
                        {customPermissions.map((permission) => {
                            const checked = selectedPermissionIds.includes(
                                permission.id,
                            );

                            return (
                                <label
                                    key={permission.id}
                                    className="flex items-center gap-2 text-xs"
                                >
                                    <Checkbox
                                        checked={checked}
                                        onCheckedChange={() =>
                                            onTogglePermission(permission.id)
                                        }
                                        className={cn(
                                            checked &&
                                                'border-primary bg-primary/10 text-primary',
                                        )}
                                    />
                                    <span className="truncate">
                                        {permission.name}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

