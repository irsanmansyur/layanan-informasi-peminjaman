export type ManagementPermission = {
    id: number;
    name: string;
    group: string | null;
    guard_name: string;
    created_at: string;
    updated_at: string;
};

export type PermissionListItem = {
    id: number;
    name: string;
    group: string | null;
    guard_name: string;
};

export type PermissionListResponse = {
    permissions: PermissionListItem[];
};

