import { Form } from '@inertiajs/react';
import { KeyRound, Shield, Tag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { SKELETON_MIN_DURATION_FORM_MS } from '@/config/skeleton';
import permissionsRoutes from '@/routes/permissions';
import type { ManagementPermission } from '../types/permission-types';

type PermissionFormDialogMode = 'create' | 'edit';

type PermissionFormDialogProps = {
    mode: PermissionFormDialogMode;
    trigger: React.ReactNode;
    permission?: ManagementPermission;
    onSuccess?: () => void;
};

type PermissionFormState = {
    name: string;
    group: string;
    guard_name: string;
};

type PermissionFormErrors = Partial<Record<keyof PermissionFormState, string>>;

export function PermissionFormDialog({
    mode,
    trigger,
    permission,
    onSuccess,
}: PermissionFormDialogProps) {
    const [open, setOpen] = useState(false);
    const [formState, setFormState] = useState<PermissionFormState>({
        name: '',
        group: '',
        guard_name: 'web',
    });
    const [errors, setErrors] = useState<PermissionFormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [editSkeletonDelayDone, setEditSkeletonDelayDone] = useState(false);

    const isEdit = mode === 'edit';

    const dialogTitle = isEdit ? 'Edit permission' : 'Tambah permission';
    const dialogDescription = isEdit
        ? 'Perbarui nama, group, atau guard dari permission.'
        : 'Buat permission baru untuk mengatur akses fitur aplikasi.';

    useEffect(() => {
        if (!isEdit || !open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setEditSkeletonDelayDone(false);
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setEditSkeletonDelayDone(true);
        }, SKELETON_MIN_DURATION_FORM_MS);

        return () => {
            window.clearTimeout(timeoutId);

            setEditSkeletonDelayDone(false);
        };
    }, [isEdit, open]);

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (!nextOpen) {
            return;
        }

        if (isEdit && permission) {
            setFormState({
                name: permission.name,
                group: permission.group ?? '',
                guard_name: permission.guard_name || 'web',
            });
        } else if (!isEdit) {
            setFormState({
                name: '',
                group: '',
                guard_name: 'web',
            });
        }
        setErrors({});
    };

    const isLoading = isEdit && !editSkeletonDelayDone;

    const canSubmit = useMemo(() => {
        if (submitting) return false;
        if (!formState.name.trim()) return false;

        return true;
    }, [formState.name, submitting]);

    const handleChange =
        (field: keyof PermissionFormState) =>
            (event: React.ChangeEvent<HTMLInputElement>) => {
                setFormState((prev) => ({
                    ...prev,
                    [field]: event.target.value,
                }));
            };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent
                className="max-w-sm overflow-hidden md:max-w-xl lg:max-w-2xl"
                onEscapeKeyDown={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Shield className="size-4" />
                        </span>
                        <span>{dialogTitle}</span>
                    </DialogTitle>
                    <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>

                <Form
                    {...(isEdit && permission
                    ? permissionsRoutes.update.form(String(permission.id))
                    : permissionsRoutes.store.form())}
                    options={{
                        preserveScroll: true,
                    }}
                    onStart={() => {
                        setSubmitting(true);
                        setErrors({});
                    }}
                    onFinish={() => {
                        setSubmitting(false);
                    }}
                    onSuccess={() => {
                        const successMessage = isEdit
                            ? `Permission "${formState.name}" berhasil diperbarui.`
                            : `Permission "${formState.name}" berhasil dibuat.`;

                        toast.success(successMessage);

                        setOpen(false);
                        setFormState({
                            name: '',
                            group: '',
                            guard_name: 'web',
                        });
                        setErrors({});

                        onSuccess?.();
                    }}
                    onError={(formErrors) => {
                        const nextErrors: PermissionFormErrors = {};

                        Object.entries(formErrors).forEach(([field, message]) => {
                            nextErrors[field as keyof PermissionFormErrors] = String(message);
                        });

                        setErrors(nextErrors);

                        toast.error(
                            'Gagal menyimpan permission. Silakan periksa kembali data yang diisi.',
                        );
                    }}
                    transform={(data: Record<string, unknown>) => ({
                        ...data,
                        group: (data.group as string | undefined)?.trim() || null,
                    })}
                    className="space-y-6"
                >
                    {isLoading ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <KeyRound className="size-4" />
                                    </span>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formState.name}
                                        onChange={handleChange('name')}
                                        className="pl-9"
                                        placeholder="permission.create"
                                        autoComplete="off"
                                    />
                                </div>
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="group">Group</Label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <Tag className="size-4" />
                                    </span>
                                    <Input
                                        id="group"
                                        name="group"
                                        value={formState.group}
                                        onChange={handleChange('group')}
                                        className="pl-9"
                                        placeholder="user-management"
                                        autoComplete="off"
                                    />
                                </div>
                                <InputError message={errors.group} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="guard_name">Guard</Label>
                                <Select
                                    value={formState.guard_name}
                                    onValueChange={(value) =>
                                        setFormState((prev) => ({
                                            ...prev,
                                            guard_name: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger id="guard_name" name="guard_name">
                                        <SelectValue placeholder="Pilih guard" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="web">web</SelectItem>
                                        <SelectItem value="api">api</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.guard_name} />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={submitting || isLoading}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={!canSubmit || isLoading}>
                            {submitting && <Spinner className="mr-2 size-4" />}
                            {isEdit ? 'Simpan perubahan' : 'Buat permission'}
                        </Button>
                    </DialogFooter>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

