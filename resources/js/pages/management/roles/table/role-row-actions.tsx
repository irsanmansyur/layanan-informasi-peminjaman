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
    return (
        <div className="flex items-center justify-center gap-2">
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
                        <AlertDialogTitle>Hapus role?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Role &quot;
                            {role.name}
                            &quot; akan dihapus secara permanen. Tindakan ini tidak
                            dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => onDelete(role)}
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

