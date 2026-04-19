export type InformationStatus = 'aktif' | 'tidak aktif';

export type ManagementInformation = {
    id: string;
    title: string;
    content: string;
    status: InformationStatus;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
    updated_at: string;
};

export type UseInformationsBulkDeleteResult = {
    bulkDeleting: boolean;
    handleBulkDelete: (informationsToDelete: ManagementInformation[]) => Promise<void>;
};
