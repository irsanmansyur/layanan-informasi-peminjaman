/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import lodash from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import type { FilterParams, PaginatedData, UseDataTableProps, UseDataTableReturn } from '@/types/datatables';
const { debounce } = lodash;

export function useDataTable<T extends Record<string, any>>({
    fetchUrl,
    defaultSort,
    defaultLimit = 10,
    filters = [],
    dataPath,
    initialFilters,
    onFilterChange,
    dataFetcher,
}: UseDataTableProps): UseDataTableReturn<T> {
    const [data, setData] = useState<PaginatedData<T> | null>(null);
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState<FilterParams>(() => {
        // Initialize params with defaults and initial filters
        const initialParams: FilterParams = {
            search: '',
            sort: defaultSort?.key || '',
            direction: defaultSort?.direction || 'desc',
            limit: defaultLimit,
            page: 1,
        };

        // Add filter defaults
        filters.forEach((filter) => {
            if (filter.defaultSelected && filter.defaultValue) {
                initialParams[filter.key] = filter.defaultValue;
            } else {
                initialParams[filter.key] = '';
            }
        });

        // Override with initial filters if provided
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

    // Debounced search handler
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            setParams((prev) => ({ ...prev, search: value, page: 1 }));
        }, 300),
        [],
    );

    // Fetch data
    const fetchData = async () => {
        try {
            setLoading(true);

            let responseData: PaginatedData<T>;

            if (dataFetcher) {
                responseData = (await dataFetcher(params)) as PaginatedData<T>;
            } else {
                const response = await axios.get(fetchUrl, { params });
                responseData = (dataPath ? response.data[dataPath] : response.data) as PaginatedData<T>;
            }

            setData(responseData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);

    // Sort handler
    const handleSort = (key: string) => {
        setParams((prev) => ({
            ...prev,
            sort: key,
            direction: prev.sort === key && prev.direction === 'asc' ? 'desc' : 'asc',
            page: 1,
        }));
    };

    // Filter handlers
    const handleSingleFilter = (key: string, value: string) => {
        const newParams = {
            ...params,
            [key]: value === 'all' ? '' : value,
            page: 1,
        };
        setParams(newParams);
        onFilterChange?.(newParams);
    };

    const handleMultiFilter = (key: string, values: string[]) => {
        const newParams = {
            ...params,
            [key]: values.join(','),
            page: 1,
        };
        setParams(newParams);
        onFilterChange?.(newParams);
    };
    const handleClearFilters = useCallback(() => {
        const newParams = {
            ...params,
            ...filters.reduce((acc, filter) => ({ ...acc, [filter.key]: '' }), {}),
            page: 1,
        };
        setParams(newParams);
        onFilterChange?.(newParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, onFilterChange]);

    // Pagination handlers
    const handlePageSizeChange = (value: string) => {
        setParams((prev) => ({ ...prev, limit: Number(value), page: 1 }));
    };

    const handlePageChange = (page: number) => {
        setParams((prev) => ({ ...prev, page }));
    };

    // Selection handlers
    // const handleSelectAll = (checked: boolean) => {
    //     const allRows = data?.data ?? [];
    //     setSelectedRows(checked ? allRows : []);
    //     return checked ? allRows : [];
    // };

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

    // const isAllSelected = Boolean(
    //     data?.data &&
    //         data.data.length > 0 &&
    //         selectedRows.length === data.data.length
    // );

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
