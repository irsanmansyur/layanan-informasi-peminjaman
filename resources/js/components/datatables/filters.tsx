import { ArrowDown, ArrowUp, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { TableFiltersProps } from '@/types/datatables';
import { MultiSelect } from '../multi-select';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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

    const handleSingleFilter = (key: string, value: string) => {
        setSelectedValues((prev) => ({
            ...prev,
            [key]: value,
        }));
        onSingleFilter(key, value);
    };

    const handleClearFilters = () => {
        setSelectedValues({});
        onClearFilters();
    };

    return (
        <div className="flex flex-col gap-2">
            {filters.length > 0 && (
                <>
                    <div className="flex flex-col gap-2 border rounded-md">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="ghost"
                                onClick={() => setIsVisible(!isVisible)}
                                className="flex justify-between w-full h-8 px-2 bg-transparent text-md hover:bg-transparent"
                            >
                                <h2 className="text-foreground text-md">Filters</h2>
                                <div className="flex gap-2">
                                    {isVisible ? <ArrowUp className="size-5" /> : <ArrowDown className="size-5" />}
                                </div>
                            </Button>
                        </div>
                        {/* <Separator /> */}
                    </div>
                    <div
                        className={`grid gap-4 transition-all duration-300 ease-in-out ${isVisible ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                            }`}
                    >
                        <div
                            className={`space-y-4 overflow-hidden rounded-md border transition-all duration-300 ease-in-out ${isVisible ? 'px-4 py-4' : ''
                                }`}
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {filters.map((filter) => (
                                    <div key={filter.key} className="flex items-center w-full">
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
                                        ) : (
                                            <Select
                                                value={selectedValues[filter.key] || 'all'}
                                                onValueChange={(value) => handleSingleFilter(filter.key, value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={filter.label} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Semua {filter.label}</SelectItem>
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
                                    className="h-8"
                                    disabled={!filters.some((filter) => params[filter.key])}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2 items-left lg:flex-row lg:items-center">
                    <div className="flex items-center gap-2">
                        <div className="relative justify-start w-60">
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
                                    className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground hover:bg-transparent dark:hover:bg-transparent cursor-pointer"
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
