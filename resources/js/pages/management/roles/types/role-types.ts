export type RolePermission = {
    id: number;
    name: string;
    group: string | null;
    guard_name: string;
};

export type ManagementRole = {
    id: number;
    name: string;
    guard_name: string | null;
    permissions: RolePermission[];
    created_at: string;
    updated_at: string;
};

export type RoleListItem = {
    id: number;
    name: string;
    label: string;
};

export type RoleListResponse = {
    roles: RoleListItem[];
};

export type RoleShowResponse = {
    role: {
        id: number;
        name: string;
        guard_name: string | null;
        permissions: number[];
    };
    permissions: RolePermission[];
};

