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
import { InformationFormDialog } from '../form/information-form-dialog';
import type { ManagementInformation } from '../types/information-types';

type InformationRowActionsProps = {
    information: ManagementInformation;
    deletingId: string | null;
    onDelete: (information: ManagementInformation) => void;
    onUpdated: () => void;
};

export function InformationRowActions({
    information,
    deletingId,
    onDelete,
    onUpdated,
}: InformationRowActionsProps) {
    const { hasPermission } = usePermissions();

    const canEdit = hasPermission('informations.update');
    const canDelete = hasPermission('informations.delete');

    if (!canEdit && !canDelete) {
        return null;
    }

    return (
        <div className="flex items-center justify-center gap-2">
            {canEdit && (
                <InformationFormDialog
                    mode="edit"
                    information={information}
                    onSuccess={onUpdated}
                    trigger={
                        <Button
                            variant="outline"
                            size="icon"
                            aria-label={`Edit informasi ${information.title}`}
                        >
                            <span className="sr-only">Edit {information.title}</span>
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
                            aria-label={`Hapus informasi ${information.title}`}
                            disabled={deletingId === information.id}
                        >
                            {deletingId === information.id ? (
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
                            <AlertDialogTitle>Hapus informasi?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Informasi &quot;{information.title}&quot; akan dihapus permanen.
                                Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                onClick={() => onDelete(information)}
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
