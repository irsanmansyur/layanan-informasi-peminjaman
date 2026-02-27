
import { Form } from '@inertiajs/react';
import { CircleUserRound, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { MultiSelect } from '@/components/multi-select';
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
import rolesRoutes from '@/routes/roles';
import usersRoutes from '@/routes/users';
import type { ManagementUser, RoleResponse } from '../types/user-types';

type UserFormDialogMode = 'create' | 'edit';

type UserFormDialogProps = {
    mode: UserFormDialogMode;
    trigger: React.ReactNode;
    user?: ManagementUser;
    onSuccess?: () => void;
};

type RoleOption = {
    label: string;
    value: string;
};

type UserFormState = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

type UserFormErrors = Partial<Record<keyof UserFormState | 'roles', string>>;

const EDIT_SKELETON_MIN_DURATION = 1000;

function useUserRoleOptions(enabled: boolean) {
    const [options, setOptions] = useState<RoleOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) return;

        let isMounted = true;

        const fetchRoles = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(rolesRoutes.list().url);

                if (!response.ok) {
                    throw new Error(`Gagal memuat roles (status ${response.status})`);
                }

                const data = (await response.json()) as RoleResponse;

                if (!isMounted) return;

                const roleOptions: RoleOption[] = data.roles.map((role) => ({
                    label: role.label,
                    value: role.name,
                }));

                setOptions(roleOptions);
            } catch (err) {
                if (!isMounted) return;
                console.error('Error fetching roles list for form:', err);
                setError('Gagal memuat daftar role. Silakan coba lagi.');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchRoles();

        return () => {
            isMounted = false;
        };
    }, [enabled]);

    return { options, loading, error };
}

export function UserFormDialog({ mode, trigger, user, onSuccess }: UserFormDialogProps) {
    const isEdit = mode === 'edit';
    const [open, setOpen] = useState(false);
    const [formState, setFormState] = useState<UserFormState>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [errors, setErrors] = useState<UserFormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [editSkeletonDelayDone, setEditSkeletonDelayDone] = useState(false);

    const { options: roleOptions, loading: rolesLoading } = useUserRoleOptions(open);
    const isEditLoading = isEdit && (!editSkeletonDelayDone || rolesLoading);

    const dialogTitle = isEdit ? 'Edit user' : 'Tambah user';
    const dialogDescription = isEdit
        ? 'Perbarui informasi user dan atur roles yang sesuai.'
        : 'Buat user baru dan atur roles serta kredensial awalnya.';

    useEffect(() => {
        if (!isEdit || !open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
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

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setErrors({});

        if (isEdit && user) {
            setFormState({
                name: user.name,
                email: user.email,
                password: '',
                password_confirmation: '',
            });
        } else if (!isEdit) {
            setFormState({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
            });
            setSelectedRoles([]);
        }
    }, [open, isEdit, user]);

    useEffect(() => {
        if (!open || !isEdit || !user || roleOptions.length === 0) return;

        const matchedValues = user.roles
            .map((roleLabel) => roleOptions.find((option) => option.label === roleLabel)?.value)
            .filter((value): value is string => Boolean(value));

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedRoles(matchedValues);
    }, [open, isEdit, user, roleOptions]);

    const canSubmit = useMemo(() => {
        if (submitting) return false;
        if (!formState.name.trim() || !formState.email.trim()) return false;

        if (!isEdit) {
            return Boolean(formState.password && formState.password_confirmation);
        }

        return true;
    }, [formState, isEdit, submitting]);

    const handleChange =
        (field: keyof UserFormState) =>
            (event: React.ChangeEvent<HTMLInputElement>) => {
                setFormState((prev) => ({
                    ...prev,
                    [field]: event.target.value,
                }));
            };

    const passwordHint = isEdit
        ? 'Opsional. Kosongkan jika tidak ingin mengubah password.'
        : 'Gunakan kombinasi huruf, angka, dan simbol untuk keamanan yang lebih baik.';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent
                className="max-w-sm overflow-hidden md:max-w-xl lg:max-w-2xl"
                onEscapeKeyDown={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <CircleUserRound className="size-4" />
                        </span>
                        <span>{dialogTitle}</span>
                    </DialogTitle>
                    <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>

                <Form
                    {...(mode === 'create'
                        ? usersRoutes.store.form()
                        : usersRoutes.update.form(user?.id ?? ''))}
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
                        const successMessage =
                            mode === 'create'
                                ? `User "${formState.name}" berhasil dibuat.`
                                : `User "${formState.name}" berhasil diperbarui.`;

                        toast.success(successMessage);

                        setOpen(false);
                        setFormState({
                            name: '',
                            email: '',
                            password: '',
                            password_confirmation: '',
                        });
                        setSelectedRoles([]);
                        setErrors({});

                        onSuccess?.();
                    }}
                    onError={(formErrors) => {
                        const nextErrors: UserFormErrors = {};

                        Object.entries(formErrors).forEach(([field, message]) => {
                            nextErrors[field as keyof UserFormErrors] = String(message);
                        });

                        setErrors(nextErrors);

                        toast.error('Gagal menyimpan user. Silakan periksa kembali data yang diisi.');
                    }}
                    transform={(data: Record<string, unknown>) => ({
                        ...data,
                        roles: selectedRoles,
                    })}
                    className="space-y-6"
                >
                    <div className="grid gap-4">
                        {isEditLoading ? (
                            <>
                                <div className="grid gap-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>

                                <div className="grid gap-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="col-span-2">
                                        <Skeleton className="h-3 w-56" />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                            <CircleUserRound className="size-4" />
                                        </span>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formState.name}
                                            onChange={handleChange('name')}
                                            className="pl-9"
                                            placeholder="Nama lengkap user"
                                            autoComplete="name"
                                        />
                                    </div>
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                            <Mail className="size-4" />
                                        </span>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formState.email}
                                            onChange={handleChange('email')}
                                            className="pl-9"
                                            placeholder="email@example.com"
                                            autoComplete="email"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                                <KeyRound className="size-4" />
                                            </span>
                                            <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                value={formState.password}
                                                onChange={handleChange('password')}
                                                className="pl-9"
                                                autoComplete="new-password"
                                                placeholder={isEdit ? 'Password baru (opsional)' : 'Password'}
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                                <KeyRound className="size-4" />
                                            </span>
                                            <Input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type="password"
                                                value={formState.password_confirmation}
                                                onChange={handleChange('password_confirmation')}
                                                className="pl-9"
                                                autoComplete="new-password"
                                                placeholder={isEdit ? 'Ulangi password baru' : 'Ulangi password'}
                                            />
                                        </div>
                                        <InputError message={errors.password_confirmation} />
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-muted-foreground">{passwordHint}</p>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Roles</Label>
                                    {rolesLoading ? (
                                        <div className="space-y-2">
                                            <Skeleton className="h-10 w-full" />
                                            <Skeleton className="h-3 w-40" />
                                        </div>
                                    ) : (
                                        <MultiSelect
                                            options={roleOptions}
                                            value={selectedRoles}
                                            onValueChange={setSelectedRoles}
                                            placeholder="Pilih satu atau lebih role"
                                            maxCount={5}
                                            className="justify-between"
                                        >
                                            <ShieldCheck className="mr-2 size-4" />
                                            <span>Pilih roles</span>
                                        </MultiSelect>
                                    )}
                                    <InputError message={errors.roles} />
                                </div>
                            </>
                        )}
                    </div>

                    {errors && errors.roles && (
                        <p className="text-xs text-destructive">{errors.roles}</p>
                    )}

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={!canSubmit}>
                            {submitting && <Spinner className="mr-2 size-4" />}
                            {isEdit ? 'Simpan perubahan' : 'Buat user'}
                        </Button>
                    </DialogFooter>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
