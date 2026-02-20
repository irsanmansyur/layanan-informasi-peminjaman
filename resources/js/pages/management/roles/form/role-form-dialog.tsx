import { Form } from '@inertiajs/react';
import { KeyRound, ShieldCheck } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import permissionsRoutes from '@/routes/permissions';
import rolesRoutes from '@/routes/roles';
import { RolePermissionMatrix } from '../table/role-permission-matrix';
import type { ManagementRole, RolePermission, RoleShowResponse } from '../types/role-types';

type RoleFormDialogMode = 'create' | 'edit';

type RoleFormDialogProps = {
    mode: RoleFormDialogMode;
    trigger: React.ReactNode;
    role?: ManagementRole;
    onSuccess?: () => void;
};

type RoleFormState = {
    name: string;
    guard_name: string;
};

type RoleFormErrors = Partial<Record<keyof RoleFormState, string | undefined>> & {
    permissions?: string;
};

const EDIT_SKELETON_MIN_DURATION = 1000;

type PermissionMatrixState = {
    loading: boolean;
    permissions: RolePermission[];
    selectedIds: number[];
    error: string | null;
};

function useRolePermissionMatrix(
    open: boolean,
    mode: RoleFormDialogMode,
    role?: ManagementRole,
): PermissionMatrixState {
    const [loading, setLoading] = useState(false);
    const [permissions, setPermissions] = useState<RolePermission[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;

        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                if (mode === 'edit' && role) {
                    const response = await fetch(rolesRoutes.show(role.id).url);

                    if (!response.ok) {
                        throw new Error(
                            `Gagal memuat data role (status ${response.status})`,
                        );
                    }

                    const data = (await response.json()) as RoleShowResponse;

                    if (!isMounted) return;

                    setPermissions(data.permissions);
                    setSelectedIds(data.role.permissions);
                } else {
                    const response = await fetch(
                        permissionsRoutes.list().url,
                    );

                    if (!response.ok) {
                        throw new Error(
                            `Gagal memuat daftar permission (status ${response.status})`,
                        );
                    }

                    const data = await response.json();

                    if (!isMounted) return;

                    setPermissions(
                        (data.permissions ?? []) as RolePermission[],
                    );
                    setSelectedIds([]);
                }
            } catch (err) {
                if (!isMounted) return;

                console.error('Error fetching permissions for role form:', err);
                setError(
                    'Gagal memuat data permission. Silakan muat ulang halaman ini.',
                );
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [open, mode, role]);

    return {
        loading,
        permissions,
        selectedIds,
        error,
    };
}

export function RoleFormDialog({
    mode,
    trigger,
    role,
    onSuccess,
}: RoleFormDialogProps) {
    const isEdit = mode === 'edit';
    const [open, setOpen] = useState(false);
    const [formState, setFormState] = useState<RoleFormState>({
        name: '',
        guard_name: 'web',
    });
    const [errors, setErrors] = useState<RoleFormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [editSkeletonDelayDone, setEditSkeletonDelayDone] = useState(false);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

    const { loading: matrixLoading, permissions, selectedIds, error: matrixError } =
        useRolePermissionMatrix(open, mode, role);

    useEffect(() => {
        if (!isEdit || !open) {

            setEditSkeletonDelayDone(false);
            return;
        }

        setEditSkeletonDelayDone(false);

        const timeoutId = window.setTimeout(() => {
            setEditSkeletonDelayDone(true);
        }, EDIT_SKELETON_MIN_DURATION);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [isEdit, open]);

    useEffect(() => {
        if (!open) return;


        setErrors({});

        if (isEdit && role) {
            setFormState({
                name: role.name,
                guard_name: role.guard_name ?? 'web',
            });
        } else if (!isEdit) {
            setFormState({
                name: '',
                guard_name: 'web',
            });
            setSelectedPermissionIds([]);
        }
    }, [open, isEdit, role]);

    useEffect(() => {
        if (!open) return;

        if (selectedIds === selectedPermissionIds) return;

        setSelectedPermissionIds(selectedIds);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, selectedIds]);

    const canSubmit = useMemo(() => {
        if (submitting) return false;
        if (!formState.name.trim()) return false;
        if (matrixLoading) return false;

        return true;
    }, [formState.name, matrixLoading, submitting]);

    const dialogTitle = isEdit ? 'Edit role' : 'Tambah role';
    const dialogDescription = isEdit
        ? 'Perbarui nama role dan atur ulang permissions yang dimilikinya.'
        : 'Buat role baru dan atur permissions yang sesuai.';

    const handleChange =
        (field: keyof RoleFormState) =>
            (event: React.ChangeEvent<HTMLInputElement>) => {
                setFormState((prev) => ({
                    ...prev,
                    [field]: event.target.value,
                }));
            };

    const handleTogglePermission = (permissionId: number) => {
        setSelectedPermissionIds((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId)
                : [...prev, permissionId],
        );
    };

    const isLoading = matrixLoading || (isEdit && !editSkeletonDelayDone);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent
                className="max-w-sm overflow-hidden md:max-w-xl lg:max-w-4xl"
                onEscapeKeyDown={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <ShieldCheck className="size-4" />
                        </span>
                        <span>{dialogTitle}</span>
                    </DialogTitle>
                    <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>

                <Form
                    {...(isEdit && role
                        ? rolesRoutes.update.form(role.id)
                        : rolesRoutes.store.form())}
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
                            ? `Role "${formState.name}" berhasil diperbarui.`
                            : `Role "${formState.name}" berhasil dibuat.`;

                        toast.success(successMessage);

                        setOpen(false);
                        setFormState({
                            name: '',
                            guard_name: 'web',
                        });
                        setSelectedPermissionIds([]);
                        setErrors({});

                        onSuccess?.();
                    }}
                    onError={(formErrors) => {
                        const nextErrors: RoleFormErrors = {};

                        Object.entries(formErrors).forEach(([field, message]) => {
                            nextErrors[field as keyof RoleFormErrors] = String(
                                message,
                            );
                        });

                        setErrors(nextErrors);

                        toast.error(
                            'Gagal menyimpan role. Silakan periksa kembali data yang diisi.',
                        );
                    }}
                    transform={(data: Record<string, unknown>) => ({
                        ...data,
                        permissions: selectedPermissionIds,
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
                                <Skeleton className="h-32 w-full" />
                            </div>
                        </div>
                    ) : (
                        <>
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
                                            placeholder="validator"
                                            autoComplete="off"
                                        />
                                    </div>
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="guard_name">Guard</Label>
                                    <Input
                                        id="guard_name"
                                        name="guard_name"
                                        value={formState.guard_name}
                                        onChange={handleChange('guard_name')}
                                        placeholder="web"
                                        autoComplete="off"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Kosongkan untuk menggunakan guard default
                                        &quot;web&quot;.
                                    </p>
                                    <InputError message={errors.guard_name} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Permissions</Label>
                                <div className="space-y-2">
                                    {matrixError && (
                                        <p className="text-xs text-destructive">
                                            {matrixError}
                                        </p>
                                    )}
                                </div>

                                <RolePermissionMatrix
                                    permissions={permissions}
                                    selectedPermissionIds={selectedPermissionIds}
                                    onTogglePermission={handleTogglePermission}
                                />
                                <InputError message={errors.permissions} />
                            </div>
                        </>
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
                            {isEdit ? 'Simpan perubahan' : 'Buat role'}
                        </Button>
                    </DialogFooter>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
