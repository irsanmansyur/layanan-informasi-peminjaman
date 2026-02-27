import { Head, Link } from '@inertiajs/react';
import { ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { home, dashboard } from '@/routes';

type PageProps = {
    status?: number;
    message?: string;
};

export default function ServerError({ status = 500, message }: PageProps) {
    return (
        <>
            <Head title="Server Error" />
            <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6 text-foreground">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                        <ServerCrash className="h-10 w-10 text-destructive" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Something went wrong
                        </h1>
                        <p className="text-muted-foreground">
                            We're sorry, but something went wrong on our end.
                            Please try again later.
                        </p>
                        {message && (
                            <p className="mt-2 max-w-md rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
                                {message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button asChild variant="default">
                        <Link href={home()}>Go home</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={dashboard()}>Dashboard</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
