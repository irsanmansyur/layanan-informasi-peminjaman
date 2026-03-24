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
import { UserFormDialog } from '../form/user-form-dialog';
import type { ManagementUser } from '../types/user-types';

type UserRowActionsProps = {
    user: ManagementUser;
    deletingId: string | null;
    onDelete: (user: ManagementUser) => void;
    onUpdated: () => void;
};

export function UserRowActions({ user, deletingId, onDelete, onUpdated }: UserRowActionsProps) {
    const { hasPermission } = usePermissions();

    const canEdit = hasPermission('users.update');
    const canDelete = hasPermission('users.delete');

    if (!canEdit && !canDelete) {
        return null;
    }

    return (
        <div className="flex items-center justify-center gap-2">
            {canEdit && (
                <UserFormDialog
                    mode="edit"
                    user={user}
                    onSuccess={onUpdated}
                    trigger={
                        <Button
                            variant="outline"
                            size="icon"
                            aria-label={`Edit ${user.name}`}
                        >
                            <span className="sr-only">Edit {user.name}</span>
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
                            aria-label={`Delete ${user.name}`}
                            disabled={deletingId === user.id}
                        >
                            {deletingId === user.id ? (
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
                            <AlertDialogTitle>Delete user?</AlertDialogTitle>
                            <AlertDialogDescription>
                                User &quot;
                                {user.name}
                                &quot; will be permanently deleted. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                onClick={() => onDelete(user)}
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
