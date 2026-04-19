import { router } from '@inertiajs/react';
import { ImageIcon, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import AlertError from '@/components/alert-error';
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
import { Spinner } from '@/components/ui/spinner';

type CoverUploadDialogProps = {
    hasCover: boolean;
    trigger?: React.ReactNode;
};

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime';
const MAX_MB = 100;

export function CoverUploadDialog({ hasCover, trigger }: CoverUploadDialogProps) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<'image' | 'video' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const resetState = () => {
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setPreviewType(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            resetState();
        }
        setOpen(next);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const picked = event.target.files?.[0] ?? null;
        setError(null);

        if (previewUrl) URL.revokeObjectURL(previewUrl);

        if (!picked) {
            setFile(null);
            setPreviewUrl(null);
            setPreviewType(null);
            return;
        }

        if (picked.size > MAX_MB * 1024 * 1024) {
            setError(`Ukuran file maksimal ${MAX_MB} MB.`);
            setFile(null);
            setPreviewUrl(null);
            setPreviewType(null);
            if (inputRef.current) inputRef.current.value = '';
            return;
        }

        const kind: 'image' | 'video' = picked.type.startsWith('video/') ? 'video' : 'image';
        setFile(picked);
        setPreviewUrl(URL.createObjectURL(picked));
        setPreviewType(kind);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!file) {
            setError('Silakan pilih file terlebih dahulu.');
            return;
        }

        const formData = new FormData();
        formData.append('cover', file);

        setSubmitting(true);
        setError(null);

        router.post('/home/cover', formData, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => {
                const message =
                    errors.cover ??
                    Object.values(errors)[0] ??
                    'Gagal mengunggah cover.';
                setError(message);
            },
            onSuccess: () => {
                resetState();
                setOpen(false);
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDelete = () => {
        if (!window.confirm('Hapus cover saat ini?')) return;
        setDeleting(true);
        setError(null);

        router.delete('/home/cover', {
            preserveScroll: true,
            onError: (errors) => {
                const message = Object.values(errors)[0] ?? 'Gagal menghapus cover.';
                setError(message);
            },
            onSuccess: () => {
                resetState();
                setOpen(false);
            },
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="secondary" size="sm" className="gap-1.5">
                        <ImageIcon className="size-4" />
                        Ubah Cover
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Ubah Cover Home</DialogTitle>
                        <DialogDescription>
                            Unggah gambar (jpeg/png/webp/gif) atau video (mp4/webm/mov). Maks {MAX_MB} MB.
                        </DialogDescription>
                    </DialogHeader>

                    {error ? <AlertError errors={[error]} /> : null}

                    <div className="space-y-2">
                        <Label htmlFor="cover-file">File cover</Label>
                        <Input
                            ref={inputRef}
                            id="cover-file"
                            type="file"
                            accept={ACCEPT}
                            onChange={handleFileChange}
                            disabled={submitting || deleting}
                        />
                    </div>

                    {previewUrl && previewType === 'image' ? (
                        <div className="overflow-hidden rounded-md border bg-muted">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="aspect-video w-full object-cover"
                            />
                        </div>
                    ) : null}
                    {previewUrl && previewType === 'video' ? (
                        <div className="overflow-hidden rounded-md border bg-muted">
                            <video
                                src={previewUrl}
                                className="aspect-video w-full object-cover"
                                controls
                                muted
                            />
                        </div>
                    ) : null}

                    <DialogFooter className="gap-2 sm:justify-between">
                        <div>
                            {hasCover ? (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={submitting || deleting}
                                >
                                    {deleting ? (
                                        <Spinner className="size-4" />
                                    ) : (
                                        <Trash2 className="size-4" />
                                    )}
                                    Hapus
                                </Button>
                            ) : null}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={submitting || deleting}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={!file || submitting || deleting}>
                                {submitting ? <Spinner className="size-4" /> : <Upload className="size-4" />}
                                Unggah
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
