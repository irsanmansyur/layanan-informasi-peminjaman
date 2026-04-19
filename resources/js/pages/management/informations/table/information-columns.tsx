import { Badge } from '@/components/ui/badge';
import type { Column, SearchableColumn } from '@/types/datatables';
import type { ManagementInformation } from '../types/information-types';

function formatDate(date: string | null): string {
    if (!date) return '-';
    try {
        return new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return date;
    }
}

function truncate(text: string, max = 80): string {
    if (!text) return '-';
    if (text.length <= max) return text;
    return `${text.slice(0, max)}…`;
}

export const informationColumns: Column<ManagementInformation>[] = [
    {
        key: 'title',
        label: 'Judul',
        sortable: true,
        searchable: true,
        className: 'min-w-[200px]',
    },
    {
        key: 'content',
        label: 'Isi',
        hideBelow: 'lg',
        className: 'min-w-[260px]',
        render: (information) => (
            <span className="text-muted-foreground">{truncate(information.content)}</span>
        ),
    },
    {
        key: 'status',
        label: 'Status',
        sortable: true,
        className: 'min-w-[130px]',
        render: (information) => {
            const isActive = information.status === 'aktif';
            return (
                <Badge
                    variant={isActive ? 'default' : 'secondary'}
                    className={
                        isActive
                            ? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }
                >
                    {isActive ? 'Aktif' : 'Tidak Aktif'}
                </Badge>
            );
        },
    },
    {
        key: 'start_date',
        label: 'Mulai',
        sortable: true,
        hideBelow: 'md',
        className: 'min-w-[140px]',
        render: (information) => formatDate(information.start_date),
    },
    {
        key: 'end_date',
        label: 'Berakhir',
        sortable: true,
        hideBelow: 'md',
        className: 'min-w-[140px]',
        render: (information) => formatDate(information.end_date),
    },
];

export const informationSearchableColumns: SearchableColumn[] = [
    {
        key: 'title',
        label: 'Judul',
    },
    {
        key: 'content',
        label: 'Isi',
    },
    {
        key: 'status',
        label: 'Status',
    },
];
