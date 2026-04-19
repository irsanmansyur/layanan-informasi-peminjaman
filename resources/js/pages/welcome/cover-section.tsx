import { Film, GripHorizontal, GripVertical, ImageIcon } from 'lucide-react';
import {
    useRef,
    useState,
    type CSSProperties,
    type PointerEvent as ReactPointerEvent,
} from 'react';

import { CoverUploadDialog } from './cover-upload-dialog';

export type HomeCover = {
    url: string;
    type: string;
};

type CoverSectionProps = {
    cover: HomeCover | null;
    canManage: boolean;
};

const DEFAULT_HEIGHT = 420;
const MIN_HEIGHT = 240;
const MIN_WIDTH = 320;

const clamp = (value: number, min: number, max: number): number =>
    Math.max(min, Math.min(max, value));

type CoverCustomProperties = CSSProperties & {
    '--cover-width'?: string;
};

export function CoverSection({ cover, canManage }: CoverSectionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number>(DEFAULT_HEIGHT);
    const [width, setWidth] = useState<number | null>(null);

    const verticalDragRef = useRef<{ startY: number; startHeight: number } | null>(
        null,
    );
    const horizontalDragRef = useRef<{
        startX: number;
        startWidth: number;
    } | null>(null);

    // ----- Vertical (height) drag -----
    const handleVerticalDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        verticalDragRef.current = { startY: event.clientY, startHeight: height };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handleVerticalMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        const state = verticalDragRef.current;
        if (!state) return;
        const delta = event.clientY - state.startY;
        const maxHeight = Math.max(MIN_HEIGHT, window.innerHeight * 0.85);
        setHeight(clamp(state.startHeight + delta, MIN_HEIGHT, maxHeight));
    };

    const handleVerticalUp = (event: ReactPointerEvent<HTMLDivElement>) => {
        verticalDragRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    // ----- Horizontal (width) drag -----
    const handleHorizontalDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        // Measure the current rendered width as the starting point so the
        // first drag from the default (flexible) width behaves naturally.
        const measured =
            width ??
            containerRef.current?.getBoundingClientRect().width ??
            MIN_WIDTH;
        horizontalDragRef.current = {
            startX: event.clientX,
            startWidth: measured,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handleHorizontalMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        const state = horizontalDragRef.current;
        if (!state) return;
        const delta = event.clientX - state.startX;
        const maxWidth = Math.max(MIN_WIDTH, window.innerWidth * 0.9);
        setWidth(clamp(state.startWidth + delta, MIN_WIDTH, maxWidth));
    };

    const handleHorizontalUp = (event: ReactPointerEvent<HTMLDivElement>) => {
        horizontalDragRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    const style: CoverCustomProperties = {
        height: `${height}px`,
        ...(width !== null ? { '--cover-width': `${width}px` } : {}),
    };

    // On mobile: full width. On lg+: use explicit width if set, otherwise default 66%.
    const widthClass =
        width !== null
            ? 'w-full lg:w-[var(--cover-width)] lg:flex-none'
            : 'w-full lg:w-2/3 lg:flex-none';

    return (
        <div
            ref={containerRef}
            className={`group relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm ${widthClass}`}
            style={style}
        >
            {cover ? (
                cover.type === 'video' ? (
                    <video
                        key={cover.url}
                        src={cover.url}
                        className="h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                ) : (
                    <img
                        src={cover.url}
                        alt="Cover"
                        className="h-full w-full object-cover"
                    />
                )
            ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-linear-to-br from-muted/40 via-card to-muted/60 p-8 text-center text-muted-foreground">
                    <div className="flex size-16 items-center justify-center rounded-full border bg-card shadow-sm">
                        <ImageIcon className="size-7 text-primary" />
                    </div>
                    <div>
                        <p className="text-base font-semibold text-foreground">
                            Belum ada cover
                        </p>
                        <p className="text-sm">
                            {canManage
                                ? 'Unggah gambar atau video untuk menampilkan cover di sini.'
                                : 'Administrator belum mengatur cover.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-1">
                            <ImageIcon className="size-3" /> Gambar
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-1">
                            <Film className="size-3" /> Video
                        </span>
                    </div>
                </div>
            )}

            {canManage ? (
                <div
                    className={
                        cover
                            ? 'pointer-events-none absolute inset-x-0 top-0 flex justify-end bg-linear-to-b from-black/60 via-black/20 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100'
                            : 'pointer-events-none absolute inset-x-0 top-0 flex justify-end p-3'
                    }
                >
                    <div className="pointer-events-auto">
                        <CoverUploadDialog hasCover={cover !== null} />
                    </div>
                </div>
            ) : null}

            {/* Vertical (height) handle — bottom edge */}
            <div
                role="slider"
                aria-orientation="vertical"
                aria-label="Ubah tinggi cover"
                aria-valuemin={MIN_HEIGHT}
                aria-valuenow={height}
                onPointerDown={handleVerticalDown}
                onPointerMove={handleVerticalMove}
                onPointerUp={handleVerticalUp}
                onPointerCancel={handleVerticalUp}
                className="absolute inset-x-0 bottom-0 flex h-5 cursor-ns-resize items-end justify-center bg-linear-to-t from-black/30 to-transparent pb-1 opacity-60 transition-opacity group-hover:opacity-100 select-none touch-none sm:opacity-0 sm:group-hover:opacity-100"
            >
                <span className="flex h-1.5 w-14 items-center justify-center rounded-full bg-white/90 shadow ring-1 ring-black/10">
                    <GripHorizontal className="size-3 text-black/60" />
                </span>
            </div>

            {/* Horizontal (width) handle — right edge, only on lg+ */}
            <div
                role="slider"
                aria-orientation="horizontal"
                aria-label="Ubah lebar cover"
                aria-valuemin={MIN_WIDTH}
                aria-valuenow={width ?? 0}
                onPointerDown={handleHorizontalDown}
                onPointerMove={handleHorizontalMove}
                onPointerUp={handleHorizontalUp}
                onPointerCancel={handleHorizontalUp}
                className="absolute right-0 top-0 bottom-5 hidden w-5 cursor-ew-resize items-center justify-end bg-linear-to-l from-black/30 to-transparent pr-1 opacity-0 transition-opacity group-hover:opacity-100 select-none touch-none lg:flex"
            >
                <span className="flex h-14 w-1.5 items-center justify-center rounded-full bg-white/90 shadow ring-1 ring-black/10">
                    <GripVertical className="size-3 text-black/60" />
                </span>
            </div>
        </div>
    );
}
