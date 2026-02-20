/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/multi-select.tsx

import { cva, type VariantProps } from "class-variance-authority";
import {
    CheckIcon,
    XCircle,
    ChevronDown,
    XIcon,
    WandSparkles,
} from "lucide-react";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva(
    "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
    {
        variants: {
            variant: {
                default:
                    "border-foreground/10 text-foreground bg-card hover:bg-card/80",
                secondary:
                    "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                inverted: "inverted",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof multiSelectVariants> {
    /**
     * An array of option objects to be displayed in the multi-select component.
     * Each option object has a label, value, and an optional icon.
     */
    options: {
        /** The text to display for the option. */
        label: string;
        /** The unique value associated with the option. */
        value: string;
        /** Optional icon component to display alongside the option. */
        icon?: React.ComponentType<{ className?: string }>;
    }[];

    /**
     * Callback function triggered when the selected values change.
     * Receives an array of the new selected values.
     */
    onValueChange: (value: string[]) => void;

    /** The default selected values when the component mounts. */
    defaultValue?: string[];

    /** Controlled selected values. If provided, component becomes controlled. */
    value?: string[];

    /**
     * Placeholder text to be displayed when no values are selected.
     * Optional, defaults to "Select options".
     */
    placeholder?: string;

    /**
     * Animation duration in seconds for the visual effects (e.g., bouncing badges).
     * Optional, defaults to 0 (no animation).
     */
    animation?: number;

    /**
     * Maximum number of items to display. Extra selected items will be summarized.
     * Optional, defaults to 3.
     */
    maxCount?: number;

    /**
     * The modality of the popover. When set to true, interaction with outside elements
     * will be disabled and only popover content will be visible to screen readers.
     * Optional, defaults to false.
     */
    modalPopover?: boolean;

    /**
     * If true, renders the multi-select component as a child of another component.
     * Optional, defaults to false.
     */
    asChild?: boolean;

    /**
     * Additional class names to apply custom styles to the multi-select component.
     * Optional, can be used to add custom styles.
     */
    className?: string;
}

export const MultiSelect = React.forwardRef<
    HTMLButtonElement,
    MultiSelectProps
>(
    (
        {
            options,
            onValueChange,
            variant,
            defaultValue = [],
            value,
            placeholder = "Select options",
            animation = 0,
            maxCount = 3,
            modalPopover = false,
            asChild = false,
            className,
            ...props
        },
        ref
    ) => {
        const [selectedValues, setSelectedValues] = React.useState<string[]>(
            value ?? defaultValue
        );
        const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
        const [isAnimating, setIsAnimating] = React.useState(false);

        React.useEffect(() => {
            if (value) {
                setSelectedValues(value);
            }
        }, [value]);

        const handleInputKeyDown = (
            event: React.KeyboardEvent<HTMLInputElement>
        ) => {
            if (event.key === "Enter") {
                setIsPopoverOpen(true);
            } else if (
                event.key === "Backspace" &&
                !event.currentTarget.value
            ) {
                const newSelectedValues = [...selectedValues];
                newSelectedValues.pop();
                setSelectedValues(newSelectedValues);
                onValueChange(newSelectedValues);
            }
        };

        const toggleOption = (option: string) => {
            const newSelectedValues = selectedValues.includes(option)
                ? selectedValues.filter((value) => value !== option)
                : [...selectedValues, option];
            setSelectedValues(newSelectedValues);
            onValueChange(newSelectedValues);
        };

        const handleClear = () => {
            setSelectedValues([]);
            onValueChange([]);
        };

        const handleTogglePopover = () => {
            setIsPopoverOpen((prev) => !prev);
        };

        const clearExtraOptions = () => {
            const newSelectedValues = selectedValues.slice(0, maxCount);
            setSelectedValues(newSelectedValues);
            onValueChange(newSelectedValues);
        };

        const toggleAll = () => {
            if (selectedValues.length === options.length) {
                handleClear();
            } else {
                const allValues = options.map((option) => option.value);
                setSelectedValues(allValues);
                onValueChange(allValues);
            }
        };

        const isAllSelected =
            options.length > 0 && selectedValues.length === options.length;

        return (
            <Popover
                open={isPopoverOpen}
                onOpenChange={setIsPopoverOpen}
                modal={modalPopover}
            >
                <PopoverTrigger asChild>
                    <Button
                        ref={ref}
                        {...props}
                        onClick={handleTogglePopover}
                        variant="outline"
                        className={cn(
                            // "flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit [&_svg]:pointer-events-auto",
                            "flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between hover:bg-background [&_svg]:pointer-events-auto ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-4 focus:ring-primary focus:border-primary focus-visible:ring-primary/30",
                            className
                        )}
                    >
                        {selectedValues.length > 0 ? (
                            <div className="flex items-center justify-between w-full">
                                <div className="flex flex-wrap items-center">
                                    {selectedValues
                                        .slice(0, maxCount)
                                        .map((value) => {
                                            const option = options.find(
                                                (o) => o.value === value
                                            );
                                            const IconComponent = option?.icon;
                                            return (
                                                <Badge
                                                    key={value}
                                                    className={cn(
                                                        isAnimating
                                                            ? "animate-bounce"
                                                            : "",
                                                        multiSelectVariants({
                                                            variant,
                                                        })
                                                    )}
                                                    style={{
                                                        animationDuration: `${animation}s`,
                                                    }}
                                                >
                                                    {IconComponent && (
                                                        <IconComponent className="w-4 h-4 mr-2" />
                                                    )}
                                                    {option?.label}
                                                    <XCircle
                                                        className="w-4 h-4 ml-2 cursor-pointer"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            toggleOption(value);
                                                        }}
                                                    />
                                                </Badge>
                                            );
                                        })}
                                    {selectedValues.length > maxCount && (
                                        <Badge
                                            className={cn(
                                                "bg-transparent text-foreground border-foreground/1 hover:bg-transparent",
                                                isAnimating
                                                    ? "animate-bounce"
                                                    : "",
                                                multiSelectVariants({ variant })
                                            )}
                                            style={{
                                                animationDuration: `${animation}s`,
                                            }}
                                        >
                                            {`+ ${selectedValues.length - maxCount
                                                } more`}
                                            <XCircle
                                                className="w-4 h-4 ml-2 cursor-pointer"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    clearExtraOptions();
                                                }}
                                            />
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <XIcon
                                        className="h-4 mx-2 cursor-pointer text-muted-foreground"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleClear();
                                        }}
                                    />
                                    <Separator
                                        orientation="vertical"
                                        className="flex h-full min-h-6"
                                    />
                                    <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between w-full mx-auto">
                                <span className="mx-3 text-sm text-muted-foreground">
                                    {placeholder}
                                </span>
                                <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                            </div>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="p-0 w-[var(--radix-popover-trigger-width)] max-h-[300px] overflow-y-auto bg-background"
                    sideOffset={4}
                    align="start"
                    onEscapeKeyDown={() => setIsPopoverOpen(false)}
                >
                    <Command className="w-full bg-transparent border-0 shadow-none">
                        <CommandInput
                            placeholder="Search..."
                            onKeyDown={handleInputKeyDown}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                <CommandItem
                                    key="all"
                                    onSelect={toggleAll}
                                    className="group flex cursor-pointer items-center gap-2"
                                >
                                    <div
                                        className={cn(
                                            "mr-2 flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input shadow-xs transition-colors",
                                            isAllSelected
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background group-hover:border-primary/60"
                                        )}
                                    >
                                        <CheckIcon
                                            className={cn(
                                                "size-3.5 transition-opacity text-primary-foreground",
                                                isAllSelected
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                    </div>
                                    <span>
                                        {isAllSelected ? "Deselect All" : "Select All"}
                                    </span>
                                </CommandItem>
                                {options.map((option) => {
                                    const isSelected = selectedValues.includes(
                                        option.value
                                    );
                                    return (
                                        <CommandItem
                                            key={option.value}
                                            onSelect={() =>
                                                toggleOption(option.value)
                                            }
                                            className="group flex cursor-pointer items-center gap-2 aria-[selected='true']:bg-accent aria-[selected='true']:text-accent-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50"
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input shadow-xs transition-colors",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "bg-background group-hover:border-primary/60"
                                                )}
                                            >
                                                <CheckIcon
                                                    className={cn(
                                                        "size-3.5 transition-opacity text-primary-foreground",
                                                        isSelected
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                            </div>
                                            {option.icon && (
                                                <option.icon className="w-4 h-4 mr-2 text-muted-foreground" />
                                            )}
                                            <span>{option.label}</span>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandGroup>
                                <div className="flex items-center justify-between">
                                    {selectedValues.length > 0 && (
                                        <>
                                            <CommandItem
                                                onSelect={handleClear}
                                                className="justify-center flex-1 cursor-pointer"
                                            >
                                                Clear
                                            </CommandItem>
                                            <Separator
                                                orientation="vertical"
                                                className="flex h-full min-h-6"
                                            />
                                        </>
                                    )}
                                    <CommandItem
                                        onSelect={() => setIsPopoverOpen(false)}
                                        className="justify-center flex-1 max-w-full cursor-pointer"
                                    >
                                        Close
                                    </CommandItem>
                                </div>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
                {animation > 0 && selectedValues.length > 0 && (
                    <WandSparkles
                        className={cn(
                            "my-2 w-3 h-3 cursor-pointer text-foreground bg-background",
                            isAnimating ? "" : "text-muted-foreground"
                        )}
                        onClick={() => setIsAnimating(!isAnimating)}
                    />
                )}
            </Popover>
        );
    }
);

MultiSelect.displayName = "MultiSelect";
