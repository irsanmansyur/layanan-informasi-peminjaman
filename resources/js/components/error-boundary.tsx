import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { home, dashboard } from '@/routes';

type Props = {
    children: ReactNode;
};

type State = {
    hasError: boolean;
    error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    public render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6 text-foreground">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                            <AlertTriangle className="h-10 w-10 text-destructive" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Something went wrong
                            </h1>
                            <p className="text-muted-foreground">
                                An unexpected error occurred. Please try again or
                                go back to the home page.
                            </p>
                            {this.state.error && (
                                <p className="mt-2 max-w-md rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
                                    {this.state.error.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Button
                            variant="default"
                            onClick={() => this.setState({ hasError: false, error: null })}
                        >
                            Try again
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={home()}>Go home</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={dashboard()}>Dashboard</Link>
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
