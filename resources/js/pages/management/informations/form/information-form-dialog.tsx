import { Form } from '@inertiajs/react';
import { CalendarDays, FileText, Megaphone } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import informationsRoutes from '@/routes/informations';
import type { InformationStatus, ManagementInformation } from '../types/information-types';

type InformationFormDialogMode = 'create' | 'edit';

type InformationFormDialogProps = {
    mode: InformationFormDialogMode;
    trigger: React.ReactNode;
    information?: ManagementInformation;
    onSuccess?: () => void;
};

type InformationFormState = {
    title: string;
    content: string;
    status: InformationStatus;
    start_date: string;
    end_date: string;
};

type InformationFormErrors = Partial<Record<keyof InformationFormState, string>>;

const emptyFormState: InformationFormState = {
    title: '',
    content: '',
    status: 'aktif',
    start_date: '',
    end_date: '',
};

function todayIso(): string {
    return new Date().toISOString().slice(0, 10);
}

export function InformationFormDialog({
    mode,
    trigger,
    information,
    onSuccess,
}: InformationFormDialogProps) {
    const isEdit = mode === 'edit';
    const [open, setOpen] = useState(false);
    const [formState, setFormState] = useState<InformationFormState>(emptyFormState);
    const [errors, setErrors] = useState<InformationFormErrors>({});
    const [submitting, setSubmitting] = useState(false);

    const dialogTitle = isEdit ? 'Edit Informasi' : 'Tambah Informasi';
    const dialogDescription = isEdit
        ? 'Perbarui informasi di bawah ini.'
        : 'Tambahkan informasi baru dengan data yang lengkap.';

    useEffect(() => {
        if (!open) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setErrors({});

        if (isEdit && information) {
            setFormState({
                title: information.title ?? '',
                content: information.content ?? '',
                status: information.status,
                start_date: information.start_date ?? '',
                end_date: information.end_date ?? '',
            });
        } else if (!isEdit) {
            setFormState({
                ...emptyFormState,
                start_date: todayIso(),
                end_date: todayIso(),
            });
        }
    }, [open, isEdit, information]);

    const canSubmit = useMemo(() => {
        if (submitting) return false;
        if (!formState.title.trim()) return false;
        if (!formState.content.trim()) return false;
        if (!formState.start_date.trim()) return false;
        if (!formState.end_date.trim()) return false;
        if (formState.end_date < formState.start_date) return false;
        return true;
    }, [formState, submitting]);

    const handleInputChange =
        (field: keyof InformationFormState) =>
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                            <Megaphone className="size-4" />
                        </span>
                        <span>{dialogTitle}</span>
                    </DialogTitle>
                    <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>

                <Form
                    {...(mode === 'create'
                        ? informationsRoutes.store.form()
                        : informationsRoutes.update.form(information?.id ?? ''))}
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
                                ? 'Informasi berhasil ditambahkan.'
                                : 'Informasi berhasil diperbarui.';

                        toast.success(successMessage);
                        setOpen(false);
                        setFormState(emptyFormState);
                        setErrors({});

                        onSuccess?.();
                    }}
                    onError={(formErrors) => {
                        const nextErrors: InformationFormErrors = {};

                        Object.entries(formErrors).forEach(([field, message]) => {
                            nextErrors[field as keyof InformationFormErrors] = String(message);
                        });

                        setErrors(nextErrors);

                        toast.error('Gagal menyimpan informasi. Periksa kembali form.');
                    }}
                    transform={(data: Record<string, unknown>) => ({
                        ...data,
                        title: formState.title,
                        content: formState.content,
                        status: formState.status,
                        start_date: formState.start_date,
                        end_date: formState.end_date,
                    })}
                    className="space-y-6"
                >
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Judul</Label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                    <FileText className="size-4" />
                                </span>
                                <Input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={formState.title}
                                    onChange={handleInputChange('title')}
                                    className="pl-9"
                                    placeholder="Masukkan judul informasi"
                                    autoComplete="off"
                                    maxLength={255}
                                />
                            </div>
                            <InputError message={errors.title} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="content">Isi Informasi</Label>
                            <Textarea
                                id="content"
                                name="content"
                                value={formState.content}
                                onChange={handleInputChange('content')}
                                placeholder="Tulis isi informasi di sini..."
                                rows={6}
                            />
                            <InputError message={errors.content} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formState.status}
                                    onValueChange={(value) =>
                                        setFormState((prev) => ({
                                            ...prev,
                                            status: value as InformationStatus,
                                        }))
                                    }
                                >
                                    <SelectTrigger id="status" className="w-full">
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="aktif">Aktif</SelectItem>
                                        <SelectItem value="tidak aktif">Tidak Aktif</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="start_date">Tanggal Mulai</Label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <CalendarDays className="size-4" />
                                    </span>
                                    <Input
                                        id="start_date"
                                        name="start_date"
                                        type="date"
                                        value={formState.start_date}
                                        onChange={handleInputChange('start_date')}
                                        className="pl-9"
                                    />
                                </div>
                                <InputError message={errors.start_date} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="end_date">Tanggal Akhir</Label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <CalendarDays className="size-4" />
                                    </span>
                                    <Input
                                        id="end_date"
                                        name="end_date"
                                        type="date"
                                        value={formState.end_date}
                                        min={formState.start_date || undefined}
                                        onChange={handleInputChange('end_date')}
                                        className="pl-9"
                                    />
                                </div>
                                <InputError message={errors.end_date} />
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
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Informasi'}
                        </Button>
                    </DialogFooter>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
