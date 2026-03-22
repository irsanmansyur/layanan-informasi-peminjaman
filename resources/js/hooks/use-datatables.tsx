import axios from 'axios';
import debounce from 'lodash/debounce';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DATA_TABLE_DEFAULT_SEARCH_DEBOUNCE_MS } from '@/config/datatables';
import { isAxiosAbortError } from '@/lib/is-axios-abort-error';
import type {
    DataTableRow,
    FilterParams,
    PaginatedData,
    UseDataTableProps,
    UseDataTableReturn,
} from '@/types/datatables';

export function useDataTable<T extends DataTableRow>({
    fetchUrl,
    defaultSort,
    defaultLimit = 10,
    filters = [],
    dataPath,
    initialFilters,
    onFilterChange,
    dataFetcher,
    searchDebounceMs,
}: UseDataTableProps<T>): UseDataTableReturn<T> {
    const [data, setData] = useState<PaginatedData<T> | null>(null);
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState<FilterParams>(() => {
        const initialParams: FilterParams = {
            search: '',
            sort: defaultSort?.key || '',
            direction: defaultSort?.direction || 'desc',
            limit: defaultLimit,
            page: 1,
        };

        filters.forEach((filter) => {
            if (filter.defaultSelected && filter.defaultValue) {
                initialParams[filter.key] = filter.defaultValue;
            } else {
                initialParams[filter.key] = '';
            }
        });

        if (initialFilters) {
            Object.keys(initialFilters).forEach((key) => {
                if (initialFilters[key]) {
                    initialParams[key] = initialFilters[key];
                }
            });
        }

        return initialParams;
    });

    const [selectedRows, setSelectedRows] = useState<T[]>([]);

    const debounceMs = searchDebounceMs ?? DATA_TABLE_DEFAULT_SEARCH_DEBOUNCE_MS;

    const debouncedSearch = useMemo(
        () =>
            debounce((value: string) => {
                setParams((prev) => ({ ...prev, search: value, page: 1 }));
            }, debounceMs),
        [debounceMs],
    );

    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;

        const fetchData = async () => {
            try {
                setLoading(true);

                let responseData: PaginatedData<T>;

                if (dataFetcher) {
                    responseData = await dataFetcher(params);
                } else {
                    const response = await axios.get(fetchUrl, {
                        params,
                        signal: controller.signal,
                    });
                    responseData = (dataPath ? response.data[dataPath] : response.data) as PaginatedData<T>;
                }

                if (!cancelled) {
                    setData(responseData);
                }
            } catch (error) {
                if (isAxiosAbortError(error)) {
                    return;
                }
                console.error('Error fetching data:', error);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void fetchData();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [params, fetchUrl, dataPath, dataFetcher]);

    const handleSort = (key: string) => {
        setParams((prev) => ({
            ...prev,
            sort: key,
            direction: prev.sort === key && prev.direction === 'asc' ? 'desc' : 'asc',
            page: 1,
        }));
    };

    const handleSingleFilter = (key: string, value: string) => {
        const newParams: FilterParams = {
            ...params,
            [key]: value === 'all' ? '' : value,
            page: 1,
        };
        setParams(newParams);
        onFilterChange?.(newParams);
    };

    const handleMultiFilter = (key: string, values: string[]) => {
        const newParams: FilterParams = {
            ...params,
            [key]: values.join(','),
            page: 1,
        };
        setParams(newParams);
        onFilterChange?.(newParams);
    };

    const handleClearFilters = useCallback(() => {
        setParams((prev) => {
            const newParams: FilterParams = {
                ...prev,
                ...filters.reduce<Record<string, string>>((acc, filter) => ({ ...acc, [filter.key]: '' }), {}),
                page: 1,
            };
            onFilterChange?.(newParams);
            return newParams;
        });
    }, [filters, onFilterChange]);

    const handlePageSizeChange = (value: string) => {
        setParams((prev) => ({ ...prev, limit: Number(value), page: 1 }));
    };

    const handlePageChange = (page: number) => {
        setParams((prev) => ({ ...prev, page }));
    };

    const handleSelectAll = (checked: boolean, condition?: (row: T) => boolean) => {
        const allRows = data?.data ?? [];
        const eligibleRows = condition ? allRows.filter(condition) : allRows;

        setSelectedRows(checked ? eligibleRows : []);
        return checked ? eligibleRows : [];
    };

    const handleSelectRow = (row: T) => {
        const isSelected = selectedRows.some((selectedRow) => selectedRow.id === row.id);
        let newSelectedRows: T[];

        if (isSelected) {
            newSelectedRows = selectedRows.filter((selectedRow) => selectedRow.id !== row.id);
        } else {
            newSelectedRows = [...selectedRows, row];
        }

        setSelectedRows(newSelectedRows);
        return newSelectedRows;
    };

    const isRowSelected = (row: T) => selectedRows.some((selectedRow) => selectedRow.id === row.id);

    const isAllSelected = (condition?: (row: T) => boolean) => {
        if (!data?.data || data.data.length === 0) return false;

        const eligibleRows = condition ? data.data.filter(condition) : data.data;

        if (eligibleRows.length === 0) return false;

        return eligibleRows.every((row) => isRowSelected(row));
    };

    return {
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
    };
}
