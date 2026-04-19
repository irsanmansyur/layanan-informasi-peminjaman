import { PencilIcon, Trash2Icon } from 'lucide-react';
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
import { BorrowerFormDialog } from '../form/borrower-form-dialog';
import type { ManagementBorrower } from '../types/borrower-types';

type BorrowerRowActionsProps = {
    borrower: ManagementBorrower;
    deletingId: string | null;
    onDelete: (borrower: ManagementBorrower) => void;
    onUpdated: () => void;
};

export function BorrowerRowActions({
    borrower,
    deletingId,
    onDelete,
    onUpdated,
}: BorrowerRowActionsProps) {
    const { hasPermission } = usePermissions();

    const canEdit = hasPermission('borrowers.update');
    const canDelete = hasPermission('borrowers.delete');

    if (!canEdit && !canDelete) {
        return null;
    }

    return (
        <div className="flex items-center justify-center gap-2">
            {canEdit && (
                <BorrowerFormDialog
                    mode="edit"
                    borrower={borrower}
                    onSuccess={onUpdated}
                    trigger={
                        <Button
                            variant="outline"
                            size="icon"
                            aria-label={`Edit peminjam ${borrower.name}`}
                        >
                            <span className="sr-only">Edit {borrower.name}</span>
                            <PencilIcon className="size-4" />
                        </Button>
                    }
                />
            )}
            {canDelete && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            size="icon"
                            aria-label={`Hapus peminjam ${borrower.name}`}
                            disabled={deletingId === borrower.id}
                        >
                            {deletingId === borrower.id ? (
                                <Spinner className="size-4" />
                            ) : (
                                <Trash2Icon className="size-4" />
                            )}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent size="sm">
                        <AlertDialogHeader>
                            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                                <Trash2Icon />
                            </AlertDialogMedia>
                            <AlertDialogTitle>Hapus peminjam?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Data peminjam &quot;{borrower.name}&quot; akan dihapus permanen.
                                Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                onClick={() => onDelete(borrower)}
                            >
                                Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}
