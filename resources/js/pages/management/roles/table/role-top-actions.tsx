import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { RoleFormDialog } from '../form/role-form-dialog';

type RoleTopActionsProps = {
    onCreated: () => void;
};

export function RoleTopActions({ onCreated }: RoleTopActionsProps) {
    const { hasPermission } = usePermissions();

    const canCreate = hasPermission('roles.create');

    if (!canCreate) {
        return null;
    }

    return (
        <div className="flex w-full justify-end">
            <RoleFormDialog
                mode="create"
                onSuccess={onCreated}
                trigger={
                    <Button size="sm" className="w-full md:w-auto">
                        <Plus className="mr-2 size-4" />
                        Add role
                    </Button>
                }
            />
        </div>
    );
}
