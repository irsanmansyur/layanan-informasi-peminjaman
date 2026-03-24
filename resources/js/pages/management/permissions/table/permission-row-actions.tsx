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
import { PermissionFormDialog } from '../form/permission-form-dialog';
import type { ManagementPermission } from '../types/permission-types';

type PermissionRowActionsProps = {
    permission: ManagementPermission;
    deletingId: number | null;
    onDelete: (permission: ManagementPermission) => void;
    onUpdated: () => void;
};

export function PermissionRowActions({
    permission,
    deletingId,
    onDelete,
    onUpdated,
}: PermissionRowActionsProps) {
    const { hasPermission } = usePermissions();

    const canEdit = hasPermission('permissions.update');
    const canDelete = hasPermission('permissions.delete');

    if (!canEdit && !canDelete) {
        return null;
    }

    return (
        <div className="flex items-center justify-center gap-2">
            {canEdit && (
                <PermissionFormDialog
                    mode="edit"
                    permission={permission}
                    onSuccess={onUpdated}
                    trigger={
                        <Button
                            variant="outline"
                            size="icon"
                            aria-label={`Edit ${permission.name}`}
                        >
                            <span className="sr-only">Edit {permission.name}</span>
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
                            aria-label={`Delete ${permission.name}`}
                            disabled={deletingId === permission.id}
                        >
                            {deletingId === permission.id ? (
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
                            <AlertDialogTitle>Delete permission?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Permission &quot;
                                {permission.name}
                                &quot; will be permanently deleted. This action cannot be
                                undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                onClick={() => onDelete(permission)}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}

