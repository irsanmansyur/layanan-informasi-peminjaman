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
import { RoleFormDialog } from '../form/role-form-dialog';
import type { ManagementRole } from '../types/role-types';

type RoleRowActionsProps = {
    role: ManagementRole;
    deletingId: number | null;
    onDelete: (role: ManagementRole) => void;
    onUpdated: () => void;
};

export function RoleRowActions({
    role,
    deletingId,
    onDelete,
    onUpdated,
}: RoleRowActionsProps) {
    const { hasPermission } = usePermissions();

    const canEdit = hasPermission('roles.update');
    const canDelete = hasPermission('roles.delete');

    if (!canEdit && !canDelete) {
        return null;
    }

    return (
        <div className="flex items-center justify-center gap-2">
            {canEdit && (
                <RoleFormDialog
                    mode="edit"
                    role={role}
                    onSuccess={onUpdated}
                    trigger={
                        <Button
                            variant="outline"
                            size="icon"
                            aria-label={`Edit ${role.name}`}
                        >
                            <span className="sr-only">Edit {role.name}</span>
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
                            aria-label={`Delete ${role.name}`}
                            disabled={deletingId === role.id}
                        >
                            {deletingId === role.id ? (
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
                            <AlertDialogTitle>Delete role?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Role &quot;
                                {role.name}
                                &quot; will be permanently deleted. This action cannot be
                                undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                onClick={() => onDelete(role)}
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

