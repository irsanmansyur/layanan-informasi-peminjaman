export type ManagementUser = {
    id: string;
    name: string;
    email: string;
    roles: string[];
    created_at: string;
    updated_at: string;
};

export type RoleResponse = {
    roles: {
        id: number;
        name: string;
        label: string;
    }[];
};

export type UseUsersBulkDeleteResult = {
    bulkDeleting: boolean;
    handleBulkDelete: (usersToDelete: ManagementUser[]) => Promise<void>;
};
