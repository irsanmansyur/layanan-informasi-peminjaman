import { Eye } from 'lucide-react';
import { useState } from 'react';
import { DataTable } from '@/components/datatables';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ACTIVITY_LOG_DATA_TABLE_SEARCH_DEBOUNCE_MS } from '@/config/datatables';
import activityLogs from '@/routes/activity-logs';
import type { Filter } from '@/types/datatables';
import type { ActivityLog } from '../types/activity-log-types';
import { activityLogColumns, activityLogSearchableColumns } from './activity-log-columns';
import { ActivityLogDetails } from './activity-log-details';

export default function ActivityLogTable() {
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleViewDetails = (log: ActivityLog) => {
        setSelectedLog(log);
        setDetailsOpen(true);
    };

    const filters: Filter[] = [
        {
            key: 'event',
            label: 'Event',
            options: [
                { label: 'Created', value: 'created' },
                { label: 'Updated', value: 'updated' },
                { label: 'Deleted', value: 'deleted' },
                { label: 'Restored', value: 'restored' },
                { label: 'Login', value: 'login' },
                { label: 'Logout', value: 'logout' },
            ],
            variant: 'combobox',
        },
        {
            key: 'subject_type',
            label: 'Modul',
            options: [
                { label: 'User', value: 'User' },
                { label: 'Role', value: 'Role' },
                { label: 'Permission', value: 'Permission' },
            ],
            variant: 'combobox',
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>
                    Riwayat aktivitas pengguna dalam sistem. Anda dapat memantau perubahan data dan aktivitas login.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable<ActivityLog>
                    columns={activityLogColumns}
                    fetchUrl={activityLogs.fetchData().url}
                    dataPath="logs"
                    filters={filters}
                    searchDebounceMs={ACTIVITY_LOG_DATA_TABLE_SEARCH_DEBOUNCE_MS}
                    searchPlaceholder="Cari deskripsi, modul, subject, atau causer (nama/email)…"
                    searchableColumns={activityLogSearchableColumns}
                    defaultSort={{
                        key: 'created_at',
                        direction: 'desc',
                    }}
                    actions={(log) => (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(log)}
                            title="Lihat Detail"
                        >
                            <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Button>
                    )}
                    actionColumn={{
                        header: 'Detail',
                        className: 'w-[80px]',
                    }}
                />

                <ActivityLogDetails
                    log={selectedLog}
                    open={detailsOpen}
                    onOpenChange={setDetailsOpen}
                />
            </CardContent>
        </Card>
    );
}
