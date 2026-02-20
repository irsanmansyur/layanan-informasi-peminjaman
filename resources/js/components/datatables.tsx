/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowDown, ArrowUp, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDataTable } from '@/hooks/use-datatables';
import { cn } from '@/lib/utils';
import type { Column, DataTableExportFormat, DataTableProps } from '@/types/datatables';
import { TableFilters } from './datatables/filters';
import { TablePagination } from './datatables/pagination';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const TABLE_SKELETON_MIN_DURATION = 1000;

export function DataTable<T extends Record<string, any>>({
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
}: DataTableProps<T>) {
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
    });

    const [tableSkeletonDelayDone, setTableSkeletonDelayDone] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const showLoadingSkeleton = loading && !tableSkeletonDelayDone;

    useEffect(() => {
        if (!loading) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTableSkeletonDelayDone(false);
            return;
        }

        setTableSkeletonDelayDone(false);

        const timeoutId = window.setTimeout(() => {
            setTableSkeletonDelayDone(true);
        }, TABLE_SKELETON_MIN_DURATION);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [loading]);

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
            {loading ? (
                loadingContent ?? (
                    <div className="overflow-hidden rounded-md border border-border">
                        <div className="border-b border-border bg-muted/40 px-4 py-3">
                            <Skeleton className="h-4 w-40" />
                        </div>
                        <div className="divide-y divide-border">
                            {Array.from({ length: 5 }).map((_, rowIndex) => (
                                <div
                                    key={rowIndex}
                                    className="grid grid-cols-3 gap-4 px-4 py-3 md:grid-cols-5"
                                >
                                    {Array.from({ length: 5 }).map((__, colIndex) => (
                                        <Skeleton
                                             
                                            key={colIndex}
                                            className="h-4 w-full"
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            ) : (
                <>
                    {data && data.data.length > 0 ? (
                        <>
                            <div className="overflow-x-auto rounded-md border border-border max-h-[calc(100vh-300px)]">
                                <Table custom className={cn('data-table w-full', tableClassName)}>
                                    <TableHeader className={cn('text-primary-foreground sticky top-0 bg-background', headerClassName)}>
                                        <TableRow>
                                            {selectable && (
                                                <TableHead className="w-6 md:w-auto">
                                                    <div className="flex w-6 items-center md:w-auto">
                                                        <Checkbox
                                                            checked={headerCheckboxState}
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
                                                        className={cn(breakpointClass, column.headerClassName, 'h-14')}
                                                    >
                                                        <div
                                                            className={cn(column.className, !column.className?.includes('w-') ? 'w-40' : '', 'md:w-auto')}
                                                        >
                                                            {column.sortable ? (
                                                                <div
                                                                    className="flex cursor-pointer items-center gap-1"
                                                                    onClick={() => handleSort(column.key.toString())}
                                                                // size="sm"
                                                                // variant="link"
                                                                >
                                                                    {column.label}
                                                                    {column.key === params.sort && (
                                                                        <span>
                                                                            {params.direction === 'asc' ? (
                                                                                <ArrowUp className="size-4" />
                                                                            ) : (
                                                                                <ArrowDown className="size-4" />
                                                                            )}
                                                                        </span>
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
                                                        actionColumn?.className,
                                                    )}
                                                >
                                                    {actionColumn?.header ?? 'Actions'}
                                                </TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className={bodyClassName} >
                                        {data?.data.map((row, index) => (
                                            <TableRow
                                                key={row.id || index}
                                                className={rowClassName ? rowClassName(row, index) : undefined}
                                            >
                                                {selectable && (
                                                    <TableCell className="px-2">
                                                        <div className="flex w-6 items-center md:w-auto">
                                                            {isRowSelectable(row) && (
                                                                <Checkbox
                                                                    checked={isRowSelected(row)}
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
                                                            className={cn(breakpointClass, column.cellClassName)}
                                                        >
                                                            {column.render
                                                                ? column.render(row)
                                                                : (row[column.key as keyof T] as React.ReactNode)}
                                                        </TableCell>
                                                    );
                                                })}
                                                {activeActions && (
                                                    <TableCell
                                                        className={cn(
                                                            'text-center',
                                                            actionColumn?.cellClassName,
                                                        )}
                                                        data-action-cell="true"
                                                    >
                                                        {activeActions(row)}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <TablePagination
                                data={data}
                                pageSizeOptions={pageSizeOptions}
                                params={params}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handlePageSizeChange}
                            />
                        </>
                    ) : emptyContent ? (
                        emptyContent
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">Data tidak ditemukan</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
