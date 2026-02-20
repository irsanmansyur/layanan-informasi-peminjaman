import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

/**
 * Props untuk komponen grup tab tampilan (stateless).
 * @property className Kelas tambahan untuk kontainer.
 * @property options Daftar opsi tab yang ditampilkan.
 * @property selected Nilai tampilan yang sedang aktif.
 * @property onValueChange Callback ketika pengguna memilih tampilan.
 * @property iconOnly Menentukan apakah tab hanya menampilkan ikon (tanpa label).
 */
type TabGroupProps = HTMLAttributes<HTMLDivElement> & {
    className?: string;
    options: { value: Appearance; icon: LucideIcon; label: string }[];
    selected: Appearance;
    onValueChange: (value: Appearance) => void;
    iconOnly?: boolean;
};

/**
 * Props untuk tombol tab individual (stateless).
 * @property active Menandai apakah tombol sedang aktif/terpilih.
 * @property Icon Ikon yang ditampilkan pada tombol.
 * @property ariaLabel Teks label untuk aksesibilitas (dipakai saat ikon-only).
 * @property showLabel Menampilkan label teks jika true.
 * @property onClick Aksi saat tombol diklik.
 */
type TabButtonProps = {
    active: boolean;
    Icon: LucideIcon;
    ariaLabel: string;
    showLabel?: boolean;
    onClick: () => void;
};

function TabButton({ active, Icon, ariaLabel, showLabel = false, onClick }: TabButtonProps) {
    return (
        <button
            type="button"
            aria-pressed={active}
            aria-label={ariaLabel}
            onClick={onClick}
            className={cn(
                'inline-flex items-center justify-center rounded-full transition-colors',
                showLabel ? 'px-3 py-1.5' : 'h-8 w-8',
                active
                    ? 'bg-primary text-primary-foreground shadow-xs border-2 border-blue-700/40'
                    : 'text-muted-foreground hover:bg-secondary border-2 border-border',
            )}
        >
            <Icon className="h-4 w-4" />
            {showLabel && <span className="ml-2 text-sm">{ariaLabel}</span>}
        </button>
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
    // Early return: jika tidak ada opsi, jangan render apapun
    if (!options?.length) return null;

    return (
        <div
            role="tablist"
            className={cn(
                'inline-flex items-center gap-1 rounded-full border border-border bg-background p-1',
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

/**
 * Tombol tunggal untuk mengubah appearance secara siklik (light → dark → system).
 * @property current Tampilan saat ini.
 * @property options Urutan opsi yang dipakai untuk siklus.
 * @property onValueChange Callback perubahan tampilan.
 */
function SingleAppearanceButton({
    current,
    options,
    onValueChange,
    className = '',
    ...props
}: {
    current: Appearance;
    options: { value: Appearance; icon: LucideIcon; label: string }[];
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
                'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground transition-colors hover:bg-secondary',
                className,
            )}
            {...props}
        >
            <CurrentIcon className="h-4 w-4" />
        </button>
    );
}

/**
 * Komponen kontainer untuk mengelola state tampilan melalui useAppearance.
 * Memisahkan logika bisnis (updateAppearance) dari UI stateless (TabGroup).
 */
export default function AppearanceTabs({
    className = '',
    variant = 'icons',
    ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: 'icons' | 'cycle' }) {
    const { appearance, updateAppearance } = useAppearance();

    const options: { value: Appearance; icon: LucideIcon; label: string }[] = [
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

    return (
        <TabGroup
            className={className}
            options={options}
            selected={appearance}
            onValueChange={updateAppearance}
            iconOnly
            {...props}
        />
    );
}
