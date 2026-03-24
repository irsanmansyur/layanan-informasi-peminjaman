import { ChevronDown, Download } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useDataTable } from '@/hooks/use-datatables';
import { cn } from '@/lib/utils';
import type { Column, DataTableExportFormat, DataTableProps, DataTableRow } from '@/types/datatables';
import { TableFilters } from './datatables/filters';
import { TablePagination } from './datatables/pagination';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

export function DataTable<T extends DataTableRow>({
    columns,
    filters = [],
    fetchUrl,
    searchPlaceholder = 'Search...',
    defaultSort,
    defaultLimit = 10,
    pageSizeOptions = [10, 25, 50, 100],
    children,
    actions,
    className,
    headerClassName,
    bodyClassName,
    tableClassName,
    topContent,
    selectable = false,
    selectableCondition,
    onSelectionChange,
    dataPath,
    initialFilters,
    onFilterChange,
    exportConfig,
    actionColumn,
    rowClassName,
    loadingContent,
    emptyContent,
    searchDebounceMs,
}: DataTableProps<T>) {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

    const boxedRowCellClass =
        'bg-background first:rounded-l-lg last:rounded-r-lg';
    const headerCellClass =
        'h-13 px-3 first:pl-4 last:pr-4';
    const checkboxHeaderCellClass = 'h-13 w-11 px-2 first:pl-2';
    const checkboxBodyCellClass = 'w-11 px-2';

    const {
        data,
        loading,
        params,
        selectedRows,
        debouncedSearch,
        handleSort,
        handleSingleFilter,
        handleMultiFilter,
        handleClearFilters,
        handlePageSizeChange,
        handlePageChange,
        handleSelectAll,
        handleSelectRow,
        isRowSelected,
        isAllSelected,
    } = useDataTable<T>({
        fetchUrl,
        defaultSort,
        defaultLimit,
        filters,
        dataPath,
        initialFilters,
        onFilterChange,
        searchDebounceMs,
    });

    const hasBaseVisibleColumn = columns.some((column) => !column.hideBelow);
    const forceShowAllOnBase = !hasBaseVisibleColumn;

    const resolveBreakpointClass = (column: Column<T>): string | undefined => {
        if (forceShowAllOnBase || !column.hideBelow) return undefined;

        switch (column.hideBelow) {
            case 'sm':
                return 'hidden sm:table-cell';
            case 'md':
                return 'hidden md:table-cell';
            case 'lg':
                return 'hidden lg:table-cell';
            case 'xl':
                return 'hidden xl:table-cell';
            default:
                return undefined;
        }
    };


    const activeActions = actions ?? children;

    const handleExport = (format: DataTableExportFormat) => {
        if (!data || !data.data.length) return;

        const rows = data.data;

        if (exportConfig?.onExport) {
            exportConfig.onExport({ data: rows, format });
            return;
        }

        const safeColumns = columns.filter((column) => column.exportable !== false);

        if (format === 'json') {
            const json = JSON.stringify(rows, null, 2);
            const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${exportConfig?.filename ?? 'export'}.json`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            return;
        }

        const headers = safeColumns.map((column) => column.exportLabel ?? column.label);
        const csvRows = rows.map((row) =>
            safeColumns
                .map((column) => {
                    const value = column.exportValue
                        ? column.exportValue(row)
                        : (row[column.key as keyof T] as unknown as string | number | null | undefined);

                    const stringValue = value ?? '';
                    const escaped = String(stringValue).replace(/"/g, '""');
                    return `"${escaped}"`;
                })
                .join(','),
        );

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${exportConfig?.filename ?? 'export'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportFormats: DataTableExportFormat[] =
        exportConfig?.formats && exportConfig.formats.length > 0 ? exportConfig.formats : ['csv'];

    const exportEnabled = exportConfig && (exportConfig.enabled ?? true);

    const exportButton =
        exportEnabled && exportFormats.length > 0 ? (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="size-4" />
                        <span>{exportConfig?.label ?? 'Export'}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {exportFormats.map((format) => (
                        <DropdownMenuItem key={format} onSelect={() => handleExport(format)}>
                            {format.toUpperCase()}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        ) : null;

    const isRowSelectable = (row: T) => {
        if (!selectable) return false;
        if (selectableCondition) {
            return selectableCondition(row);
        }
        return true;
    };

    const hasAnySelection = selectable && selectedRows.length > 0;
    const allSelected = selectable && isAllSelected(selectableCondition);

    const headerCheckboxState: boolean | 'indeterminate' =
        allSelected ? true : hasAnySelection ? 'indeterminate' : false;

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        setIsHeaderScrolled(container.scrollTop > 0);
    }, [data?.data.length, loading]);

    return (
        <div className={cn('space-y-4', className)}>
            <TableFilters
                filters={filters}
                params={params}
                searchPlaceholder={searchPlaceholder}
                onSearch={debouncedSearch}
                onSingleFilter={handleSingleFilter}
                onMultiFilter={handleMultiFilter}
                onClearFilters={handleClearFilters}
                topContent={
                    topContent || exportButton ? (
                        <div className="flex items-center gap-2">
                            {exportButton}
                            {topContent}
                        </div>
                    ) : undefined
                }
            />
            <div className="overflow-hidden rounded-xl">
                <div
                    ref={scrollContainerRef}
                    className="relative max-h-[calc(100vh-320px)] overflow-auto rounded-xl"
                    onScroll={(event) => {
                        setIsHeaderScrolled(event.currentTarget.scrollTop > 0);
                    }}
                >
                                <Table
                                    custom
                                    className={cn(
                                        'data-table w-full border-separate [border-spacing:0_8px]',
                                        tableClassName,
                                    )}
                                >
                        <TableHeader
                            className={cn(
                                'sticky top-0 z-40 isolate rounded-t-xl border-b border-primary/25 transition-all duration-300',
                                isHeaderScrolled && 'shadow-[0_10px_24px_-18px_rgba(0,0,0,0.55)]',
                                '[&_tr:hover]:bg-transparent',
                                '[&_tr:first-child_th:first-child]:rounded-tl-xl [&_tr:first-child_th:last-child]:rounded-tr-xl',
                                '[&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wide [&_th]:uppercase [&_th]:text-foreground [&_th]:align-middle shadow-sm ',

                                // Glass effect
                                '[&_th]:relative [&_th]:z-1',
                                '[&_th]:bg-background [&_th]:backdrop-blur-md',

                                // Saat discroll: makin solid & blur makin kua  t
                                isHeaderScrolled && '[&_th]:bg-background [&_th]:backdrop-blur-md',

                                headerClassName,
                            )}
                        >

                                        <TableRow>
                                            {selectable && (
                                                <TableHead
                                                    className={cn(
                                                        checkboxHeaderCellClass,
                                                    )}
                                                >
                                                    <div className="flex w-6 items-center">
                                                        <Checkbox
                                                            checked={headerCheckboxState}
                                                            className="size-3.5 border-foreground/30 bg-background/65 shadow-none data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                            onCheckedChange={(checked: boolean) => {
                                                                const newSelection = handleSelectAll(
                                                                    checked,
                                                                    selectableCondition,
                                                                );
                                                                onSelectionChange?.(newSelection);
                                                            }}
                                                            aria-label="Select all"
                                                        />
                                                    </div>
                                                </TableHead>
                                            )}
                                            {columns.map((column) => {
                                                const breakpointClass = resolveBreakpointClass(column);

                                                return (
                                                    <TableHead
                                                        key={column.key.toString()}
                                                        className={cn(
                                                            breakpointClass,
                                                            headerCellClass,
                                                            column.headerClassName,
                                                        )}
                                                    >
                                                        <div
                                                            className={cn(column.className, !column.className?.includes('w-') ? 'w-40' : '', 'md:w-auto')}
                                                        >
                                                            {column.sortable ? (
                                                                <div
                                                                    className="flex cursor-pointer items-center gap-1"
                                                                    onClick={() => handleSort(column.key.toString())}
                                                                >
                                                                    {column.label}
                                                                    {column.key === params.sort && (
                                                                        <ChevronDown
                                                                            className={cn(
                                                                                'size-4 shrink-0 transition-transform duration-200 ease-out',
                                                                                params.direction === 'desc' && 'rotate-180',
                                                                            )}
                                                                        />
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                column.label
                                                            )}
                                                        </div>
                                                    </TableHead>
                                                );
                                            })}
                                            {activeActions && (
                                                <TableHead
                                                    className={cn(
                                                        'text-center',
                                                        headerCellClass,
                                                        actionColumn?.className,
                                                    )}
                                                >
                                                    {actionColumn?.header ?? 'Actions'}
                                                </TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className={bodyClassName}>
                                        {loading ? (
                                            loadingContent ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={
                                                            columns.length + (selectable ? 1 : 0) + (activeActions ? 1 : 0)
                                                        }
                                                        className="p-0"
                                                    >
                                                        {loadingContent}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                <>
                                                    {Array.from({ length: 5 }).map((_, rowIndex) => (
                                                        <TableRow key={rowIndex}>
                                                            {selectable && (
                                                                <TableCell
                                                                    className={cn(
                                                                        checkboxBodyCellClass,
                                                                        boxedRowCellClass,
                                                                    )}
                                                                >
                                                                    <Skeleton className="h-4 w-4" />
                                                                </TableCell>
                                                            )}
                                                            {columns.map((column) => {
                                                                const breakpointClass = resolveBreakpointClass(column);
                                                                return (
                                                                    <TableCell
                                                                        key={column.key.toString()}
                                                                        className={cn(
                                                                            breakpointClass,
                                                                            boxedRowCellClass,
                                                                        )}
                                                                    >
                                                                        <Skeleton className="h-4 w-full" />
                                                                    </TableCell>
                                                                );
                                                            })}
                                                            {activeActions && (
                                                                <TableCell
                                                                    className={cn(
                                                                        'text-center',
                                                                        boxedRowCellClass,
                                                                    )}
                                                                >
                                                                    <Skeleton className="mx-auto h-4 w-16" />
                                                                </TableCell>
                                                            )}
                                                        </TableRow>
                                                    ))}
                                                </>
                                            )
                                        ) : data && data.data.length > 0 ? (
                                            data.data.map((row, index) => (
                                                <TableRow
                                                    key={row.id || index}
                                                    className={cn(
                                                        'hover:bg-transparent',
                                                        '[&>td]:transition-colors [&>td]:duration-150',
                                                        'hover:[&>td]:bg-primary/5',
                                                        rowClassName
                                                            ? rowClassName(
                                                                  row,
                                                                  index,
                                                              )
                                                            : undefined,
                                                    )}
                                                >
                                                    {selectable && (
                                                        <TableCell
                                                            className={cn(
                                                                checkboxBodyCellClass,
                                                                boxedRowCellClass,
                                                            )}
                                                        >
                                                            <div className="flex w-6 items-center md:w-auto">
                                                                {isRowSelectable(row) && (
                                                                    <Checkbox
                                                                        checked={isRowSelected(row)}
                                                                        className="size-3.5 border-border/50 shadow-none"
                                                                        onCheckedChange={() => {
                                                                            const newSelection = handleSelectRow(row);
                                                                            onSelectionChange?.(newSelection);
                                                                        }}
                                                                        aria-label={`Select row ${index + 1}`}
                                                                    />
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                    {columns.map((column) => {
                                                        const breakpointClass = resolveBreakpointClass(column);

                                                        return (
                                                            <TableCell
                                                                key={column.key.toString()}
                                                                className={cn(
                                                                    breakpointClass,
                                                                    boxedRowCellClass,
                                                                    column.cellClassName,
                                                                )}
                                                            >
                                                                {column.render
                                                                    ? column.render(row)
                                                                    : (row[column.key as keyof T] as ReactNode)}
                                                            </TableCell>
                                                        );
                                                    })}
                                                    {activeActions && (
                                                        <TableCell
                                                            className={cn(
                                                                'text-center',
                                                                boxedRowCellClass,
                                                                actionColumn?.cellClassName,
                                                            )}
                                                            data-action-cell="true"
                                                        >
                                                            {activeActions(row)}
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={
                                                        columns.length + (selectable ? 1 : 0) + (activeActions ? 1 : 0)
                                                    }
                                                    className="py-10 text-center"
                                                >
                                                    {emptyContent ?? (
                                                        <p className="text-muted-foreground">No data found</p>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                </div>
            </div>
            {data && (
                <TablePagination
                    data={data}
                    pageSizeOptions={pageSizeOptions}
                    params={params}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}
        </div>
    );
}
