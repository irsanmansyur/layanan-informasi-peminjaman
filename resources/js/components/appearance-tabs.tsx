import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

const THEME_INDEX: Record<Appearance, number> = {
    light: 0,
    dark: 1,
    system: 2,
};

type Option = { value: Appearance; icon: LucideIcon; label: string };

type TabGroupProps = HTMLAttributes<HTMLDivElement> & {
    className?: string;
    options: Option[];
    selected: Appearance;
    onValueChange: (value: Appearance) => void;
    iconOnly?: boolean;
};

type TabButtonProps = {
    active: boolean;
    Icon: LucideIcon;
    ariaLabel: string;
    showLabel?: boolean;
    onClick: () => void;
};

function TabButton({
    active,
    Icon,
    ariaLabel,
    showLabel = false,
    onClick,
}: TabButtonProps) {
    return (
        <button
            type="button"
            aria-pressed={active}
            aria-label={ariaLabel}
            onClick={onClick}
            className={cn(
                'inline-flex cursor-pointer items-center justify-center rounded-lg font-medium transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                showLabel ? 'gap-2 px-4 py-2' : 'size-9',
                active
                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border/50 dark:bg-zinc-900'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
            )}
        >
            <Icon className="size-4 shrink-0" aria-hidden />
            {showLabel && <span className="text-sm">{ariaLabel}</span>}
        </button>
    );
}

/** Compact “sliding thumb” segmented control — header toolbar. */
function ThemeRail({
    className = '',
    options,
    selected,
    onValueChange,
    ...props
}: Omit<TabGroupProps, 'iconOnly'>) {
    const idx = THEME_INDEX[selected] ?? 1;

    return (
        <div
            role="tablist"
            aria-label="Theme"
            className={cn(
                'relative inline-flex h-8 w-19 shrink-0 items-stretch rounded-full p-0.5',
                'bg-muted/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-border/40',
                'dark:bg-muted/20 dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.35)] dark:ring-white/10',
                className,
            )}
            {...props}
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-br from-amber-500/6 via-transparent to-sky-500/10 dark:from-violet-500/12 dark:to-cyan-500/8"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-3 top-px h-px rounded-full bg-linear-to-r from-transparent via-white/50 to-transparent opacity-60 dark:via-white/15"
            />
            <span
                aria-hidden
                className="pointer-events-none absolute bottom-0.5 top-0.5 w-[calc((100%-4px)/3)] rounded-full bg-background/95 shadow-sm ring-1 ring-black/5 transition-[left] duration-300 ease-[cubic-bezier(0.34,1.25,0.64,1)] dark:bg-zinc-800/95 dark:ring-white/12"
                style={{
                    left: `calc(2px + ${idx} * ((100% - 4px) / 3))`,
                }}
            />
            {options.map(({ value, icon: Icon, label }) => {
                const active = selected === value;
                return (
                    <button
                        key={value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        aria-label={label}
                        title={label}
                        onClick={() => onValueChange(value)}
                        className={cn(
                            'relative z-1 flex min-w-0 flex-1 cursor-pointer items-center justify-center rounded-full transition-colors duration-200',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
                            active
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground/90',
                        )}
                    >
                        <Icon className="size-3.5 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
                    </button>
                );
            })}
        </div>
    );
}

function TabGroup({
    className = '',
    options,
    selected,
    onValueChange,
    iconOnly = true,
    ...props
}: TabGroupProps) {
    if (!options?.length) return null;

    return (
        <div
            role="tablist"
            aria-label="Theme"
            className={cn(
                'inline-flex items-center gap-1 rounded-xl bg-muted/50 p-1 ring-1 ring-border/40 dark:bg-muted/25',
                className,
            )}
            {...props}
        >
            {options.map(({ value, icon: Icon, label }) => (
                <TabButton
                    key={value}
                    active={selected === value}
                    Icon={Icon}
                    ariaLabel={label}
                    showLabel={!iconOnly}
                    onClick={() => onValueChange(value)}
                />
            ))}
        </div>
    );
}

function SingleAppearanceButton({
    current,
    options,
    onValueChange,
    className = '',
    ...props
}: {
    current: Appearance;
    options: Option[];
    onValueChange: (value: Appearance) => void;
} & HTMLAttributes<HTMLButtonElement>) {
    const index = Math.max(0, options.findIndex((o) => o.value === current));
    const next = options[(index + 1) % options.length];
    const CurrentIcon = options[index]?.icon ?? Sun;

    return (
        <button
            type="button"
            aria-label={`Appearance: ${options[index]?.label ?? 'Light'}`}
            onClick={() => onValueChange(next.value)}
            className={cn(
                'inline-flex size-9 cursor-pointer items-center justify-center rounded-full bg-muted/50 text-muted-foreground ring-1 ring-border/40 transition-colors hover:bg-muted hover:text-foreground',
                className,
            )}
            {...props}
        >
            <CurrentIcon className="size-4" />
        </button>
    );
}

export default function AppearanceTabs({
    className = '',
    variant = 'rail',
    ...props
}: HTMLAttributes<HTMLDivElement> & {
    variant?: 'rail' | 'icons' | 'detailed' | 'cycle';
}) {
    const { appearance, updateAppearance } = useAppearance();

    const options: Option[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    if (variant === 'cycle') {
        return (
            <SingleAppearanceButton
                className={className}
                current={appearance}
                options={options}
                onValueChange={updateAppearance}
            />
        );
    }

    if (variant === 'icons' || variant === 'detailed') {
        return (
            <TabGroup
                className={className}
                options={options}
                selected={appearance}
                onValueChange={updateAppearance}
                iconOnly={variant === 'icons'}
                {...props}
            />
        );
    }

    return (
        <ThemeRail
            className={className}
            options={options}
            selected={appearance}
            onValueChange={updateAppearance}
            {...props}
        />
    );
}
