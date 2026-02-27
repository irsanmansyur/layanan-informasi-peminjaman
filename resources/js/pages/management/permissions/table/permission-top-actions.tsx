import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { PermissionFormDialog } from '../form/permission-form-dialog';

type PermissionTopActionsProps = {
    onCreated: () => void;
};

export function PermissionTopActions({ onCreated }: PermissionTopActionsProps) {
    const { hasPermission } = usePermissions();

    const canCreate = hasPermission('permissions.create');

    if (!canCreate) {
        return null;
    }

    return (
        <div className="flex w-full justify-end">
            <PermissionFormDialog
                mode="create"
                onSuccess={onCreated}
                trigger={
                    <Button size="sm" className="w-full md:w-auto">
                        <Plus className="mr-2 size-4" />
                        Tambah permission
                    </Button>
                }
            />
        </div>
    );
}
