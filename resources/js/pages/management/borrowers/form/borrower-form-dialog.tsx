import { Form } from '@inertiajs/react';
import { CalendarDays, CircleUserRound, Coins, HandCoins } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import borrowersRoutes from '@/routes/borrowers';
import type { BorrowerStatus, ManagementBorrower } from '../types/borrower-types';

type BorrowerFormDialogMode = 'create' | 'edit';

type BorrowerFormDialogProps = {
    mode: BorrowerFormDialogMode;
    trigger: React.ReactNode;
    borrower?: ManagementBorrower;
    onSuccess?: () => void;
};

type BorrowerFormState = {
    name: string;
    total: string;
    status: BorrowerStatus;
    borrowed_at: string;
    paid_off_at: string;
};

type BorrowerFormErrors = Partial<Record<keyof BorrowerFormState, string>>;

const emptyFormState: BorrowerFormState = {
    name: '',
    total: '',
    status: 'belum lunas',
    borrowed_at: '',
    paid_off_at: '',
};

function todayIso(): string {
    return new Date().toISOString().slice(0, 10);
}

export function BorrowerFormDialog({
    mode,
    trigger,
    borrower,
    onSuccess,
}: BorrowerFormDialogProps) {
    const isEdit = mode === 'edit';
    const [open, setOpen] = useState(false);
    const [formState, setFormState] = useState<BorrowerFormState>(emptyFormState);
    const [errors, setErrors] = useState<BorrowerFormErrors>({});
    const [submitting, setSubmitting] = useState(false);

    const dialogTitle = isEdit ? 'Edit Peminjam' : 'Tambah Peminjam';
    const dialogDescription = isEdit
        ? 'Perbarui informasi peminjam di bawah ini.'
        : 'Tambahkan peminjam baru dengan data yang lengkap.';

    useEffect(() => {
        if (!open) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setErrors({});

        if (isEdit && borrower) {
            setFormState({
                name: borrower.name ?? '',
                total: String(borrower.total ?? ''),
                status: borrower.status,
                borrowed_at: borrower.borrowed_at ?? '',
                paid_off_at: borrower.paid_off_at ?? '',
            });
        } else if (!isEdit) {
            setFormState({
                ...emptyFormState,
                borrowed_at: todayIso(),
            });
        }
    }, [open, isEdit, borrower]);

    const canSubmit = useMemo(() => {
        if (submitting) return false;
        if (!formState.name.trim()) return false;
        if (!formState.total.trim()) return false;
        if (!formState.borrowed_at.trim()) return false;
        if (formState.status === 'lunas' && !formState.paid_off_at.trim()) return false;
        return true;
    }, [formState, submitting]);

    const handleChange =
        (field: keyof BorrowerFormState) =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setFormState((prev) => ({
                ...prev,
                [field]: event.target.value,
            }));
        };

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
                            <HandCoins className="size-4" />
                        </span>
                        <span>{dialogTitle}</span>
                    </DialogTitle>
                    <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>

                <Form
                    {...(mode === 'create'
                        ? borrowersRoutes.store.form()
                        : borrowersRoutes.update.form(borrower?.id ?? ''))}
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
                                ? 'Peminjam berhasil ditambahkan.'
                                : 'Peminjam berhasil diperbarui.';

                        toast.success(successMessage);
                        setOpen(false);
                        setFormState(emptyFormState);
                        setErrors({});

                        onSuccess?.();
                    }}
                    onError={(formErrors) => {
                        const nextErrors: BorrowerFormErrors = {};

                        Object.entries(formErrors).forEach(([field, message]) => {
                            nextErrors[field as keyof BorrowerFormErrors] = String(message);
                        });

                        setErrors(nextErrors);

                        toast.error('Gagal menyimpan peminjam. Periksa kembali form.');
                    }}
                    transform={(data: Record<string, unknown>) => ({
                        ...data,
                        name: formState.name,
                        total: formState.total,
                        status: formState.status,
                        borrowed_at: formState.borrowed_at,
                        paid_off_at:
                            formState.status === 'lunas' && formState.paid_off_at
                                ? formState.paid_off_at
                                : null,
                    })}
                    className="space-y-6"
                >
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Peminjam</Label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                    <CircleUserRound className="size-4" />
                                </span>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formState.name}
                                    onChange={handleChange('name')}
                                    className="pl-9"
                                    placeholder="Masukkan nama peminjam"
                                    autoComplete="off"
                                    maxLength={255}
                                />
                            </div>
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="total">Total Pinjaman</Label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <Coins className="size-4" />
                                    </span>
                                    <Input
                                        id="total"
                                        name="total"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.01"
                                        value={formState.total}
                                        onChange={handleChange('total')}
                                        className="pl-9"
                                        placeholder="0"
                                    />
                                </div>
                                <InputError message={errors.total} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formState.status}
                                    onValueChange={(value) =>
                                        setFormState((prev) => ({
                                            ...prev,
                                            status: value as BorrowerStatus,
                                            // If switching back to belum lunas, clear paid_off_at
                                            paid_off_at:
                                                value === 'belum lunas'
                                                    ? ''
                                                    : prev.paid_off_at || todayIso(),
                                        }))
                                    }
                                >
                                    <SelectTrigger id="status" className="w-full">
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="belum lunas">Belum Lunas</SelectItem>
                                        <SelectItem value="lunas">Lunas</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="borrowed_at">Pinjam Sejak</Label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <CalendarDays className="size-4" />
                                    </span>
                                    <Input
                                        id="borrowed_at"
                                        name="borrowed_at"
                                        type="date"
                                        value={formState.borrowed_at}
                                        onChange={handleChange('borrowed_at')}
                                        className="pl-9"
                                    />
                                </div>
                                <InputError message={errors.borrowed_at} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="paid_off_at">
                                    Tgl Lunas
                                    {formState.status === 'belum lunas' && (
                                        <span className="ml-1 text-xs text-muted-foreground">
                                            (opsional)
                                        </span>
                                    )}
                                </Label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <CalendarDays className="size-4" />
                                    </span>
                                    <Input
                                        id="paid_off_at"
                                        name="paid_off_at"
                                        type="date"
                                        value={formState.paid_off_at}
                                        onChange={handleChange('paid_off_at')}
                                        disabled={formState.status === 'belum lunas'}
                                        className="pl-9"
                                    />
                                </div>
                                <InputError message={errors.paid_off_at} />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={submitting}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={!canSubmit}>
                            {submitting && <Spinner className="mr-2 size-4" />}
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Peminjam'}
                        </Button>
                    </DialogFooter>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
