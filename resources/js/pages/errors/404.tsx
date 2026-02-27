import { Head, Link } from '@inertiajs/react';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { home, dashboard } from '@/routes';

export default function NotFound() {
    return (
        <>
            <Head title="Page Not Found" />
            <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6 text-foreground">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <FileQuestion className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Page not found
                        </h1>
                        <p className="text-muted-foreground">
                            Sorry, we couldn't find the page you're looking for.
                        </p>
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
