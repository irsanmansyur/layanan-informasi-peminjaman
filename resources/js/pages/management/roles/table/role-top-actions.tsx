import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoleFormDialog } from '../form/role-form-dialog';

type RoleTopActionsProps = {
    onCreated: () => void;
};

export function RoleTopActions({ onCreated }: RoleTopActionsProps) {
    return (
        <div className="flex w-full justify-end">
            <RoleFormDialog
                mode="create"
                onSuccess={onCreated}
                trigger={
                    <Button size="sm" className="w-full md:w-auto">
                        <Plus className="mr-2 size-4" />
                        Tambah role
                    </Button>
                }
            />
        </div>
    );
}

