import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';
import type { TablePaginationProps } from '@/types/datatables';
import { parseNumberInput } from '@/utils/format-number';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from '../ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function TablePagination<T>({ data, pageSizeOptions, params, onPageChange, onPageSizeChange }: TablePaginationProps<T>) {
    const [showPaginationInput, setShowPaginationInput] = useState(false);
    const [paginationInput, setPaginationInput] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    const { current_page, last_page } = data;
    const maxVisiblePages = 5;
    const pages: (number | 'ellipsis')[] = [];

    // Calculate visible pages
    if (last_page <= maxVisiblePages) {
        for (let i = 1; i <= last_page; i++) {
            pages.push(i);
        }
    } else {
        pages.push(1);
        const leftBound = Math.max(2, current_page - 1);
        const rightBound = Math.min(last_page - 1, current_page + 1);

        if (current_page <= 3) {
            for (let i = 2; i <= 4; i++) {
                if (i <= last_page - 1) pages.push(i);
            }
            if (last_page > 5) pages.push('ellipsis');
        } else if (current_page >= last_page - 2) {
            if (last_page > 5) pages.push('ellipsis');
            for (let i = last_page - 3; i <= last_page - 1; i++) {
                if (i >= 2) pages.push(i);
            }
        } else {
            pages.push('ellipsis');
            for (let i = leftBound; i <= rightBound; i++) {
                pages.push(i);
            }
        }

        if (last_page > 1) {
            pages.push(last_page);
        }
    }

    const handlePaginationInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const page = parseInt(paginationInput);
            if (!isNaN(page) && page >= 1 && page <= data.last_page) {
                onPageChange(page);
                setShowPaginationInput(false);
            }
        } else if (e.key === 'Escape') {
            setShowPaginationInput(false);
        }
    };

    return (
        <div className="mt-4">
            <div className="flex flex-col justify-between gap-4 lg:flex-row">
                {/* Left: Showing results text */}
                <div className="flex items-center text-sm text-muted-foreground">
                    Showing {(data.current_page - 1) * data.per_page + 1} to {Math.min(data.current_page * data.per_page, data.total)} of {data.total}{' '}
                    results
                </div>

                {/* Right: Pagination controls */}
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-end">
                    {/* Page Size */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page</span>
                        <Select value={params.limit.toString()} onValueChange={onPageSizeChange}>
                            <SelectTrigger className="w-16 h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="center">
                                {pageSizeOptions.map((size: number) => (
                                    <SelectItem key={size} value={size.toString()}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Current Page Text */}
                    <div className="flex flex-col items-start justify-between gap-3 overflow-hidden overflow-x-auto md:flex-row md:items-center">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                            Page {data.current_page} of {data.last_page}
                        </span>

                        {/* Navigation */}
                        <div className="flex items-end">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => onPageChange(current_page - 1)}
                                            disabled={current_page === 1}
                                            className="w-8 h-8 cursor-pointer"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                    </PaginationItem>

                                    {/* Page Numbers */}
                                    {pages.map((page, index) => (
                                        <PaginationItem key={index} className="my-4">
                                            {page === 'ellipsis' ? (
                                                showPaginationInput ? (
                                                    <div className="relative w-12">
                                                        <Input
                                                            ref={inputRef}
                                                            type="text"
                                                            min={1}
                                                            max={data.last_page}
                                                            value={paginationInput}
                                                            onChange={(e) => setPaginationInput(parseNumberInput(e.target.value))}
                                                            onKeyDown={handlePaginationInput}
                                                            onBlur={() => setShowPaginationInput(false)}
                                                            className="w-12 h-8 px-2 text-center"
                                                            autoFocus
                                                        />
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        className="w-8 h-8 p-0 cursor-pointer"
                                                        onClick={() => {
                                                            setShowPaginationInput(true);
                                                            setPaginationInput('');
                                                            setTimeout(() => {
                                                                inputRef.current?.focus();
                                                            }, 0);
                                                        }}
                                                    >
                                                        <PaginationEllipsis />
                                                    </Button>
                                                )
                                            ) : (
                                                <PaginationLink
                                                    onClick={() => onPageChange(page)}
                                                    isActive={page === current_page}
                                                    className="h-8 p-0 cursor-pointer min-w-8"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => onPageChange(current_page + 1)}
                                            disabled={current_page === last_page}
                                            className="w-8 h-8"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
