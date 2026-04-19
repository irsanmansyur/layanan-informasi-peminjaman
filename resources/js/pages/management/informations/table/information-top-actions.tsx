import { Plus, Trash2Icon } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { usePermissions } from '@/hooks/use-permissions';
import { InformationFormDialog } from '../form/information-form-dialog';

type InformationTopActionsProps = {
    hasSelection: boolean;
    selectedCount: number;
    bulkDeleting: boolean;
    onBulkDelete: () => void;
    onCreated: () => void;
};

type BulkActionsProps = {
    hasSelection: boolean;
    selectedCount: number;
    bulkDeleting: boolean;
    onBulkDelete: () => void;
    canBulkDelete: boolean;
};

export function InformationTopActions({
    hasSelection,
    selectedCount,
    bulkDeleting,
    onBulkDelete,
    onCreated,
}: InformationTopActionsProps) {
    const { hasPermission } = usePermissions();

    const canCreate = hasPermission('informations.create');
    const canBulkDelete = hasPermission('informations.delete');

    return (
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
            <div className="flex w-full flex-col items-center justify-end gap-2 md:flex-row md:items-center">
                <BulkActions
                    hasSelection={hasSelection}
                    selectedCount={selectedCount}
                    bulkDeleting={bulkDeleting}
                    onBulkDelete={onBulkDelete}
                    canBulkDelete={canBulkDelete}
                />
                {canCreate && (
                    <InformationFormDialog
                        mode="create"
                        onSuccess={onCreated}
                        trigger={
                            <Button size="sm" className="w-full md:w-auto">
                                <Plus className="mr-2 size-4" />
                                Tambah Informasi
                            </Button>
                        }
                    />
                )}
            </div>
        </div>
    );
}

function BulkActions({
    hasSelection,
    selectedCount,
    bulkDeleting,
    onBulkDelete,
    canBulkDelete,
}: BulkActionsProps) {
    if (!hasSelection || !canBulkDelete) {
        return null;
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 w-full px-3 md:w-auto"
                    disabled={bulkDeleting}
                >
                    {bulkDeleting ? (
                        <Spinner className="mr-2 size-4" />
                    ) : (
                        <Trash2Icon className="mr-2 size-4" />
                    )}
                    Hapus terpilih ({selectedCount})
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Hapus informasi terpilih?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {selectedCount} informasi akan dihapus permanen. Tindakan ini tidak dapat
                        dibatalkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={bulkDeleting}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        disabled={bulkDeleting}
                        onClick={onBulkDelete}
                    >
                        {bulkDeleting && <Spinner className="mr-2 size-4" />}
                        Hapus
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
