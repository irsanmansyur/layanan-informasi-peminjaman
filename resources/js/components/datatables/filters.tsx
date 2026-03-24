import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Filter, TableFiltersProps } from '@/types/datatables';
import { MultiSelect } from '../multi-select';
import { Button } from '../ui/button';
import {
    Combobox,
    ComboboxContent,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '../ui/combobox';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

function ComboboxFilter({
    filter,
    selectedValue,
    searchQuery,
    onSearchChange,
    onValueChange,
}: {
    filter: Filter;
    selectedValue: string | null;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onValueChange: (value: string | null) => void;
}) {
    const filteredOptions = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return filter.options;
        return filter.options.filter(
            (opt) =>
                opt.label.toLowerCase().includes(q) ||
                opt.value.toString().toLowerCase().includes(q),
        );
    }, [filter.options, searchQuery]);

    return (
        <Combobox
            value={selectedValue}
            onValueChange={onValueChange}
        >
            <ComboboxInput
                placeholder={`Search ${filter.label}...`}
                showClear
                className="w-full"
                onChange={(e) => onSearchChange((e.target as HTMLInputElement).value)}
            />
            <ComboboxContent>
                <ComboboxList>
                    {filteredOptions.map((option) => (
                        <ComboboxItem
                            key={option.value}
                            value={option.value.toString()}
                        >
                            {option.label}
                        </ComboboxItem>
                    ))}
                </ComboboxList>
                {filteredOptions.length === 0 && (
                    <div className="py-2 text-center text-sm text-muted-foreground">
                        No results
                    </div>
                )}
            </ComboboxContent>
        </Combobox>
    );
}

export function TableFilters({
    filters,
    params,
    searchPlaceholder = 'Search...',
    onSearch,
    onSingleFilter,
    onMultiFilter,
    onClearFilters,
    topContent,
}: TableFiltersProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
    const [searchValue, setSearchValue] = useState('');
    const [comboboxSearch, setComboboxSearch] = useState<Record<string, string>>({});

    // Handle initial default values
    useEffect(() => {
        const initialValues: Record<string, string> = {};
        filters.forEach((filter) => {
            if (filter.defaultSelected && filter.defaultValue) {
                const value = filter.defaultValue.toString();
                initialValues[filter.key] = value;
                onSingleFilter(filter.key, value);
            }
        });
        setSelectedValues(initialValues);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSingleFilter = (key: string, value: string | null) => {
        setSelectedValues((prev) => ({
            ...prev,
            [key]: value ?? '',
        }));
        onSingleFilter(key, value ?? '');
    };

    const handleClearFilters = () => {
        setSelectedValues({});
        onClearFilters();
    };

    return (
        <div className="space-y-3 rounded-xl">
            {filters.length > 0 && (
                <>
                    <div className="rounded-lg border border-border/60 bg-muted/30">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="ghost"
                                onClick={() => setIsVisible(!isVisible)}
                                className="flex h-10 w-full cursor-pointer justify-between rounded-lg px-3 hover:bg-muted/50"
                            >
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="size-4 text-muted-foreground" />
                                    <h2 className="text-sm font-medium text-foreground">Filters</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ChevronDown
                                        className={cn(
                                            'size-4 shrink-0 transition-transform duration-200 ease-out',
                                            isVisible ? 'rotate-180 text-foreground' : 'text-muted-foreground',
                                        )}
                                    />
                                </div>
                            </Button>
                        </div>
                    </div>
                    <div
                        className={`grid gap-4 transition-all duration-300 ease-in-out ${isVisible ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                            }`}
                    >
                        <div
                            className={`space-y-4 overflow-hidden rounded-lg border border-border/60 bg-background/70 transition-all duration-300 ease-in-out ${isVisible ? 'px-4 py-4' : ''
                                }`}
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {filters.map((filter) => (
                                    <div key={filter.key} className="flex w-full items-center">
                                        {filter.multiple ? (
                                            <MultiSelect
                                                options={filter.options.map((option) => ({
                                                    label: option.label,
                                                    value: option.value.toString(),
                                                }))}
                                                placeholder={`Select ${filter.label}`}
                                                onValueChange={(values) => onMultiFilter(filter.key, values)}
                                                className="w-full"
                                            />
                                        ) : filter.variant === 'combobox' ? (
                                            <div className="w-full">
                                                <ComboboxFilter
                                                    filter={filter}
                                                    selectedValue={
                                                        selectedValues[filter.key] === undefined ||
                                                        selectedValues[filter.key] === ''
                                                            ? null
                                                            : selectedValues[filter.key]
                                                    }
                                                    searchQuery={comboboxSearch[filter.key] ?? ''}
                                                    onSearchChange={(query) =>
                                                        setComboboxSearch((prev) => ({
                                                            ...prev,
                                                            [filter.key]: query,
                                                        }))
                                                    }
                                                    onValueChange={(value) => {
                                                        handleSingleFilter(filter.key, value);
                                                        setComboboxSearch((prev) => ({
                                                            ...prev,
                                                            [filter.key]: '',
                                                        }));
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <Select
                                                value={selectedValues[filter.key] || 'all'}
                                                onValueChange={(value) => handleSingleFilter(filter.key, value)}
                                            >
                                                    <SelectTrigger className="w-full">
                                                    <SelectValue placeholder={filter.label} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All {filter.label}</SelectItem>
                                                    {filter.options.map((option) => (
                                                        <SelectItem key={option.value} value={option.value.toString()}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <Button
                                    variant="outline"
                                    onClick={handleClearFilters}
                                    className="h-8 cursor-pointer"
                                    disabled={
                                        !filters.some(
                                            (filter) =>
                                                params[filter.key] !== undefined &&
                                                params[filter.key] !== '' &&
                                                params[filter.key] !== 'all',
                                        )
                                    }
                                >
                                    Clear filters
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col items-start gap-2 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-2">
                        <div className="relative w-60 justify-start">
                            <Search className="absolute -translate-y-1/2 text-muted-foreground top-1/2 left-2 size-4" />
                            <Input
                                value={searchValue}
                                placeholder={searchPlaceholder}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSearchValue(value);
                                    onSearch(value);
                                }}
                                className="pl-8 pr-8"
                            />
                            {searchValue && (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setSearchValue('');
                                        onSearch('');
                                    }}
                                    variant="ghost"
                                    className="absolute inset-y-0 right-2 flex cursor-pointer items-center text-muted-foreground hover:bg-transparent hover:text-foreground dark:hover:bg-transparent"
                                    aria-label="Clear search"
                                >
                                    <X className="size-3.5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {topContent && <div className="w-full md:w-auto">{topContent}</div>}
            </div>
        </div>
    );
}
