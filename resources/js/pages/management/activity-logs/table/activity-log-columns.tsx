import { Badge } from '@/components/ui/badge';
import type { Column, SearchableColumn } from '@/types/datatables';
import type { ActivityLog } from '../types/activity-log-types';

export const activityLogColumns: Column<ActivityLog>[] = [
    {
        key: 'description',
        label: 'Aktivitas',
        className: 'min-w-[200px]',
    },
    {
        key: 'subject_type',
        label: 'Modul',
        className: 'w-[120px]',
        render: (log) => (
            <Badge variant="outline">{log.subject_type}</Badge>
        ),
    },
    {
        key: 'causer',
        label: 'User',
        className: 'w-[150px]',
        render: (log) => (
            <div className="flex items-center gap-2">
                {log.causer?.avatar && (
                    <img
                        src={log.causer.avatar}
                        alt={log.causer.name}
                        className="h-6 w-6 rounded-full object-cover"
                    />
                )}
                <span className="truncate">{log.causer?.name || 'System'}</span>
            </div>
        ),
    },
    {
        key: 'event',
        label: 'Aksi',
        className: 'w-[100px]',
        render: (log) => {
            if (!log.event) {
                return '-';
            }

            const colors = {
                created: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
                updated: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
                deleted: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
                restored: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
                force_deleted: 'bg-red-700 text-white border-red-800 dark:bg-red-900 dark:text-white dark:border-red-800',
                login: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
                logout: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
            };
            const colorClass = colors[log.event as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';

            return (
                <Badge variant="outline" className={`capitalize ${colorClass}`}>
                    {log.event.replace('_', ' ')}
                </Badge>
            );
        },
    },
    {
        key: 'created_at',
        label: 'Waktu',
        className: 'w-[180px]',
        render: (log) => (
            <div className="flex flex-col">
                <span className="text-sm font-medium">{log.created_at}</span>
                <span className="text-xs text-muted-foreground">{log.created_at_human}</span>
            </div>
        ),
    },
];

export const activityLogSearchableColumns: SearchableColumn[] = [
    {
        key: 'description',
        label: 'Deskripsi',
    },
    {
        key: 'subject_type',
        label: 'Modul',
    },
    {
        key: 'event',
        label: 'Event',
    },
];
