export type BorrowerStatus = 'lunas' | 'belum lunas';

export type ManagementBorrower = {
    id: string;
    name: string;
    total: number;
    status: BorrowerStatus;
    borrowed_at: string | null;
    paid_off_at: string | null;
    created_at: string;
    updated_at: string;
};

export type UseBorrowersBulkDeleteResult = {
    bulkDeleting: boolean;
    handleBulkDelete: (borrowersToDelete: ManagementBorrower[]) => Promise<void>;
};
