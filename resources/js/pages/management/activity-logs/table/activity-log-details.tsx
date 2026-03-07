import { ArrowRight, Clock, FileJson, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ActivityLog } from '../types/activity-log-types';

type ActivityLogDetailsProps = {
    log: ActivityLog | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function ActivityLogDetails({
    log,
    open,
    onOpenChange,
}: ActivityLogDetailsProps) {
    if (!log) return null;

    const { properties, event, causer, created_at, description } = log;

    // Helper untuk format value agar enak dibaca
    const formatValue = (value: unknown) => {
        if (value === null) return <span className="text-muted-foreground italic">null</span>;
        if (value === true) return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">True</Badge>;
        if (value === false) return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">False</Badge>;
        if (typeof value === 'object') {
            return (
                <div className="rounded-md bg-muted/50 p-2 font-mono text-xs">
                    <pre className="whitespace-pre-wrap break-all">
                        {JSON.stringify(value, null, 2)}
                    </pre>
                </div>
            );
        }
        return <span className="font-medium text-foreground">{String(value)}</span>;
    };

    const renderContent = () => {
        // Handle Update (Changes)
        if (properties.changes) {
            return (
                <div className="grid gap-4">
                    {Object.entries(properties.changes).map(([key, change]) => (
                        <div key={key} className="group relative">
                            <div className="mb-1 flex items-center justify-between">
                                <span className="text-sm font-semibold text-muted-foreground capitalize">
                                    {key.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 gap-2 rounded-lg border bg-card p-3 shadow-sm md:grid-cols-[1fr_auto_1fr] md:items-center">
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">Sebelum</div>
                                    <div className="break-all">{formatValue(change.from)}</div>
                                </div>
                                <div className="flex justify-center py-2 md:py-0">
                                    <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">Sesudah</div>
                                    <div className="break-all">{formatValue(change.to)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // Handle Create (Attributes only)
        if (properties.attributes) {
            return (
                <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(properties.attributes).map(([key, value]) => (
                        <div key={key} className="rounded-lg border bg-card p-3 shadow-sm">
                            <div className="mb-1 text-xs font-medium text-muted-foreground capitalize">
                                {key.replace(/_/g, ' ')}
                            </div>
                            <div className="break-all text-sm">{formatValue(value)}</div>
                        </div>
                    ))}
                </div>
            );
        }

        // Handle Delete (Old only)
        if (properties.old) {
            return (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <div className="mb-3 text-sm font-medium text-destructive">Data yang dihapus:</div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {Object.entries(properties.old).map(([key, value]) => (
                            <div key={key} className="rounded-md bg-background/50 p-2">
                                <div className="mb-1 text-xs font-medium text-muted-foreground capitalize">
                                    {key.replace(/_/g, ' ')}
                                </div>
                                <div className="break-all text-sm text-muted-foreground line-through decoration-destructive/50">
                                    {formatValue(value)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <FileJson className="mb-2 h-8 w-8 opacity-20" />
                <p>Tidak ada detail perubahan yang tercatat.</p>
            </div>
        );
    };

    const getEventColor = (evt: string) => {
        switch (evt) {
            case 'created': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'updated': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            case 'deleted': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            case 'restored': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
            case 'force_deleted': return 'bg-red-700 text-white border-red-800 dark:bg-red-900 dark:text-white dark:border-red-800';
            case 'login': return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800';
            case 'logout': return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
            default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-sm overflow-hidden p-0 md:max-w-2xl lg:max-w-3xl"
                onEscapeKeyDown={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="border-b px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="space-y-1">
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <span>Detail Aktivitas</span>
                                <Badge variant="outline" className={cn("capitalize", getEventColor(event))}>
                                    {event.replace('_', ' ')}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription>
                                {description}
                            </DialogDescription>
                            <div className="text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {created_at}
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="bg-muted/30 px-6 py-4">
                    <div className="flex items-center gap-2 rounded-md border bg-background p-2 text-sm text-muted-foreground">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            {causer?.avatar ? (
                                <img src={causer.avatar} alt={causer.name} className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                                <User className="h-4 w-4" />
                            )}
                        </div>
                        <div>
                            <span className="font-medium text-foreground">{causer?.name || 'System'}</span>
                            <span className="mx-1 text-muted-foreground/50">•</span>
                            <span>{causer?.email || 'System Action'}</span>
                        </div>
                    </div>
                </div>


                <ScrollArea className="max-h-[60vh] px-6 py-4">
                    {renderContent()}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
