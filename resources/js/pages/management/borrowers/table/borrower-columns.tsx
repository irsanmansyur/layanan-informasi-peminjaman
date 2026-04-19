import { Badge } from '@/components/ui/badge';
import type { Column, SearchableColumn } from '@/types/datatables';
import type { ManagementBorrower } from '../types/borrower-types';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});

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

export const borrowerColumns: Column<ManagementBorrower>[] = [
    {
        key: 'name',
        label: 'Nama',
        sortable: true,
        searchable: true,
        className: 'min-w-[180px]',
    },
    {
        key: 'total',
        label: 'Total',
        sortable: true,
        hideBelow: 'sm',
        className: 'min-w-[140px]',
        render: (borrower) => currencyFormatter.format(Number(borrower.total ?? 0)),
    },
    {
        key: 'status',
        label: 'Status',
        sortable: true,
        className: 'min-w-[130px]',
        render: (borrower) => {
            const isLunas = borrower.status === 'lunas';
            return (
                <Badge
                    variant={isLunas ? 'default' : 'secondary'}
                    className={
                        isLunas
                            ? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400'
                            : 'bg-amber-500/15 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400'
                    }
                >
                    {isLunas ? 'Lunas' : 'Belum Lunas'}
                </Badge>
            );
        },
    },
    {
        key: 'borrowed_at',
        label: 'Pinjam Sejak',
        sortable: true,
        hideBelow: 'md',
        className: 'min-w-[150px]',
        render: (borrower) => formatDate(borrower.borrowed_at),
    },
    {
        key: 'paid_off_at',
        label: 'Tgl Lunas',
        sortable: true,
        hideBelow: 'lg',
        className: 'min-w-[150px]',
        render: (borrower) => formatDate(borrower.paid_off_at),
    },
];

export const borrowerSearchableColumns: SearchableColumn[] = [
    {
        key: 'name',
        label: 'Nama',
    },
    {
        key: 'status',
        label: 'Status',
    },
];
