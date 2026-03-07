import { Form, Head } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/user-password';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: edit().url,
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [newPasswordVisible, setNewPasswordVisible] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <h1 className="sr-only">Password Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Update password"
                        description="Ensure your account is using a long, random password to stay secure"
                    />

                    <Form
                        {...PasswordController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onSuccess={() => {
                            toast.success('Password berhasil diperbarui.');
                        }}
                        onError={(errors) => {
                            toast.error('Gagal memperbarui password. Periksa data yang diisi.');

                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-6"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">
                                        Current password
                                    </Label>
                                    <PasswordInput
                                        ref={currentPasswordInput}
                                        id="current_password"
                                        name="current_password"
                                        className="mt-1 block w-full"
                                        autoComplete="current-password"
                                        placeholder="Current password"
                                    />
                                    <InputError
                                        message={errors.current_password}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        New password
                                    </Label>
                                    <PasswordInput
                                        ref={passwordInput}
                                        id="password"
                                        name="password"
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        placeholder="New password"
                                        visible={newPasswordVisible}
                                        onVisibleChange={setNewPasswordVisible}
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm password
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        placeholder="Confirm password"
                                        visible={newPasswordVisible}
                                        onVisibleChange={setNewPasswordVisible}
                                        showToggle={false}
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-password-button"
                                    >
                                        Save password
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
