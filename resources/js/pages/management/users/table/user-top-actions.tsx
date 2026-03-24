import { Plus, Trash2Icon } from 'lucide-react';
import React from 'react';
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

type UserTopActionsProps = {
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
};

export function UserTopActions({
    hasSelection,
    selectedCount,
    bulkDeleting,
    onBulkDelete,
    onCreated,
}: UserTopActionsProps) {
    const { hasPermission } = usePermissions();

    const canCreate = hasPermission('users.create');
    const canBulkDelete = hasPermission('users.delete');

    return (
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
            <div className="flex w-full flex-col md:flex-row md:items-center items-center justify-end gap-2 ">
                <BulkActions
                    hasSelection={hasSelection}
                    selectedCount={selectedCount}
                    bulkDeleting={bulkDeleting}
                    onBulkDelete={onBulkDelete}
                    canBulkDelete={canBulkDelete}
                />
                {canCreate && (
                    <UserFormDialog
                        mode="create"
                        onSuccess={onCreated}
                        trigger={
                            <Button
                                size="sm"
                                className="w-full md:w-auto"
                            >
                                <Plus className="mr-2 size-4" />
                                Add user
                            </Button>
                        }
                    />
                )}
            </div>
        </div>
    );
}

type BulkActionsWithPermissionProps = BulkActionsProps & {
    canBulkDelete: boolean;
};

function BulkActions({
    hasSelection,
    selectedCount,
    bulkDeleting,
    onBulkDelete,
    canBulkDelete,
}: BulkActionsWithPermissionProps) {
    if (!hasSelection || !canBulkDelete) {
        return null;
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 px-3 w-full md:w-auto"
                    disabled={bulkDeleting}
                >
                    {bulkDeleting ? (
                        <Spinner className="mr-2 size-4" />
                    ) : (
                        <Trash2Icon className="mr-2 size-4" />
                    )}
                    Delete selected ({selectedCount})
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete selected users?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {selectedCount} user(s) will be permanently deleted. This
                        action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={bulkDeleting}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        disabled={bulkDeleting}
                        onClick={onBulkDelete}
                    >
                        {bulkDeleting && <Spinner className="mr-2 size-4" />}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
