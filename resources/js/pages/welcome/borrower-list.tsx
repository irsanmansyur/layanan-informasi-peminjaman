import { HandCoins, UserRound } from 'lucide-react';

export type HomeBorrower = {
    id: string;
    name: string;
    total: number;
    borrowed_at: string | null;
};

type BorrowerListProps = {
    borrowers: HomeBorrower[];
};

const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);

const formatDate = (value: string | null): string => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

export function BorrowerList({ borrowers }: BorrowerListProps) {
    const total = borrowers.reduce((sum, b) => sum + b.total, 0);

    return (
        <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg border bg-muted/50 text-primary">
                        <HandCoins className="size-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight">
                            Peminjam Aktif
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {borrowers.length} orang
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Total utang
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(total)}
                    </p>
                </div>
            </div>

            {borrowers.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
                    <div className="flex size-12 items-center justify-center rounded-full border bg-muted/40">
                        <UserRound className="size-5" />
                    </div>
                    <p>Tidak ada peminjam dengan status belum lunas.</p>
                </div>
            ) : (
                <ul className="flex-1 divide-y divide-border/70 overflow-y-auto max-h-[80vh]">
                    {borrowers.map((borrower) => (
                        <li
                            key={borrower.id}
                            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                        >
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-semibold uppercase text-muted-foreground">
                                {borrower.name.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                    {borrower.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(borrower.borrowed_at)}
                                </p>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="text-sm font-semibold tabular-nums text-destructive">
                                    {formatCurrency(borrower.total)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
