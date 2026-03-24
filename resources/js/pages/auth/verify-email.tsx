// Components
import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Verify email"
            description="Open the verification link we just sent to your email inbox."
        >
            <Head title="Verify email" />

            {status === 'verification-link-sent' && (
                <div className="mb-6 text-center text-sm font-medium text-success">
                    A new verification link has been sent to the email address
                    you used during registration.
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center sm:text-left">
                {({ processing }) => (
                    <>
                        <Button
                            disabled={processing}
                            variant="secondary"
                            className="w-full sm:w-auto"
                        >
                            {processing && <Spinner />}
                            Resend verification email
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm sm:mx-0"
                        >
                            Log out
                        </TextLink>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
