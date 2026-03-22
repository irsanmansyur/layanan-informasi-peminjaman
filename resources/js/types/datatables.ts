import type { ReactNode } from 'react';

/** Baris tabel server-side: wajib punya `id` untuk seleksi & key stabil. */
export type DataTableRow = Record<string, unknown> & { id: string | number };

export type DataTableBreakpoint = 'sm' | 'md' | 'lg' | 'xl';

export type DataTableExportFormat = 'csv' | 'json';

export interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (row: T) => ReactNode;
    className?: string;
    headerClassName?: string;
    cellClassName?: string;
    hideBelow?: DataTableBreakpoint;
    searchable?: boolean;
    exportable?: boolean;
    exportLabel?: string;
    exportValue?: (row: T) => string | number | null | undefined;
}

export interface FilterOption {
    label: string;
    value: string | number;
}

export type FilterVariant = 'select' | 'combobox' | 'multiselect';

export interface Filter {
    key: string;
    label: string;
    multiple?: boolean;
    /** 'select' (default), 'combobox' (searchable), atau 'multiselect' */
    variant?: FilterVariant;
    defaultValue?: string | number;
    options: FilterOption[];
    defaultSelected?: boolean;
    sortable?: boolean;
}

export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

export interface FilterParams extends Record<string, string | number> {
    search: string;
    sort: string;
    direction: 'asc' | 'desc';
    limit: number;
    page: number;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export type DataTableFilterValues = Record<string, string | number>;

export interface UseDataTableProps<T extends DataTableRow = DataTableRow> {
    fetchUrl: string;
    defaultSort?: SortConfig;
    defaultLimit?: number;
    filters?: Filter[];
    dataPath?: string;
    initialFilters?: DataTableFilterValues;
    onFilterChange?: (filters: FilterParams) => void;
    dataFetcher?: (params: FilterParams) => Promise<PaginatedData<T>>;
    /** Debounce ketik search (ms). Default dari `DATA_TABLE_DEFAULT_SEARCH_DEBOUNCE_MS`. */
    searchDebounceMs?: number;
}

export interface UseDataTableReturn<T> {
    data: PaginatedData<T> | null;
    loading: boolean;
    params: FilterParams;
    selectedRows: T[];
    debouncedSearch: (value: string) => void;
    handleSort: (key: string) => void;
    handleSingleFilter: (key: string, value: string) => void;
    handleMultiFilter: (key: string, values: string[]) => void;
    handleClearFilters: () => void;
    handlePageSizeChange: (value: string) => void;
    handlePageChange: (page: number) => void;
    handleSelectAll: (checked: boolean, condition?: (row: T) => boolean) => T[];
    handleSelectRow: (row: T) => T[];
    isRowSelected: (row: T) => boolean;
    isAllSelected: (condition?: (row: T) => boolean) => boolean;
}

export interface SearchableColumn {
    key: string;
    label: string;
}

export interface DataTableExportConfig<T> {
    enabled?: boolean;
    filename?: string;
    label?: string;
    formats?: DataTableExportFormat[];
    onExport?: (payload: { data: T[]; format: DataTableExportFormat }) => void;
}

export interface DataTableActionColumn {
    header?: ReactNode;
    className?: string;
    cellClassName?: string;
}

export interface TableFiltersProps {
    filters: Filter[];
    params: FilterParams;
    searchPlaceholder?: string;
    onSearch: (value: string) => void;
    onSingleFilter: (key: string, value: string) => void;
    onMultiFilter: (key: string, values: string[]) => void;
    onClearFilters: () => void;
    topContent?: ReactNode;
    searchFieldKey?: string;
}

export interface TablePaginationProps<T> {
    data: PaginatedData<T>;
    pageSizeOptions: number[];
    params: {
        limit: number;
    };
    onPageChange: (page: number) => void;
    onPageSizeChange: (value: string) => void;
}

export interface DataTableProps<T extends DataTableRow> {
    columns: Column<T>[];
    filters?: Filter[];
    fetchUrl: string;
    searchPlaceholder?: string;
    defaultSort?: SortConfig;
    defaultLimit?: number;
    pageSizeOptions?: number[];
    children?: (row: T) => ReactNode;
    actions?: (row: T) => ReactNode;
    className?: string;
    headerClassName?: string;
    bodyClassName?: string;
    tableClassName?: string;
    rowClassName?: (row: T, index: number) => string | undefined;
    topContent?: ReactNode;
    selectable?: boolean;
    selectableCondition?: (row: T) => boolean;
    onSelectionChange?: (selectedRows: T[]) => void;
    dataPath?: string;
    initialFilters?: DataTableFilterValues;
    onFilterChange?: (filters: FilterParams) => void;
    searchableColumns?: SearchableColumn[];
    searchFieldKey?: string;
    /** Debounce search (ms); naikkan untuk tabel backend berat. */
    searchDebounceMs?: number;
    exportConfig?: DataTableExportConfig<T>;
    actionColumn?: DataTableActionColumn;
    loadingContent?: ReactNode;
    emptyContent?: ReactNode;
}
