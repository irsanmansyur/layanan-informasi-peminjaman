import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    LayoutDashboard,
    Shield,
    Sparkles,
    Terminal,
    Users,
    Zap,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard, login, register } from '@/routes';

const features = [
    {
        icon: LayoutDashboard,
        title: 'Ready to use dashboard',
        description:
            'Summary of metrics, activity trends, and customizable statistic cards.',
    },
    {
        icon: Users,
        title: 'Users, roles & permissions',
        description:
            'Integrated RBAC management: manage users, roles, and permissions from one place.',
    },
    {
        icon: Shield,
        title: 'Built-in security',
        description:
            'Fortify, email verification, 2FA, and Laravel authentication pattern.',
    },
    {
        icon: Activity,
        title: 'Activity log',
        description:
            'Activity log for lightweight audit — ready to expand to your compliance needs.',
    },
] as const;

const stack = [
    'Laravel 13',
    'Inertia v2',
    'React 19',
    'TypeScript',
    'Tailwind CSS v4',
    'shadcn/ui',
] as const;

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Starter kit admin">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>
            <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
                <div
                    aria-hidden
                    className="pointer-events-none fixed inset-0 overflow-hidden"
                >
                    <div className="absolute -left-1/4 top-0 h-[min(80vw,36rem)] w-[min(80vw,36rem)] rounded-full bg-primary/15 blur-[100px] dark:bg-primary/25" />
                    <div className="absolute -right-1/4 bottom-0 h-[min(70vw,32rem)] w-[min(70vw,32rem)] rounded-full bg-chart-2/20 blur-[90px] dark:bg-chart-2/30" />
                    <div className="absolute left-1/2 top-1/2 h-px w-[200%] -translate-x-1/2 -translate-y-1/2 rotate-12 bg-linear-to-r from-transparent via-border/40 to-transparent" />
                    <div
                        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
                        style={{
                            backgroundImage: `linear-gradient(to right, color-mix(in oklch, var(--border) 40%, transparent) 1px, transparent 1px),
                                linear-gradient(to bottom, color-mix(in oklch, var(--border) 40%, transparent) 1px, transparent 1px)`,
                            backgroundSize: '48px 48px',
                        }}
                    />
                </div>

                <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                    <header className="mb-12 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex size-9 items-center justify-center rounded-lg border bg-card shadow-sm">
                                <Zap className="size-4 text-primary" />
                            </div>
                            <span className="font-semibold tracking-tight">
                                Admin Starter
                            </span>
                        </div>
                        <nav className="flex flex-wrap items-center gap-2 sm:gap-3">
                            {auth.user ? (
                                <Button asChild>
                                    <Link href={dashboard()}>
                                        Open dashboard
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" asChild>
                                        <Link href={login()}>Sign in</Link>
                                    </Button>
                                    {canRegister && (
                                        <Button asChild>
                                            <Link href={register()}>
                                                Sign up
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </nav>
                    </header>

                    <main className="flex flex-1 flex-col gap-16 lg:gap-24">
                        <section className="grid gap-10 lg:grid-cols-[1fr_minmax(0,20rem)] lg:items-center lg:gap-12">
                            <div className="space-y-6">
                                <Badge
                                    variant="secondary"
                                    className="gap-1.5 px-3 py-1 text-xs font-medium"
                                >
                                    <Sparkles className="size-3.5" />
                                    Production ready kit
                                </Badge>
                                <h1 className="text-balance font-sans text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                                    Modern admin panel, without starting from
                                    <span className="bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                                        {' '}
                                        empty page
                                    </span>
                                    .
                                </h1>
                                <p className="max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
                                    Combination of Laravel, Inertia, and React with
                                    management pattern for users, roles, and permissions
                                    that is commonly used in internal and SaaS applications.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {auth.user ? (
                                        <Button size="lg" asChild>
                                            <Link href={dashboard()}>
                                                Go to dashboard
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <>
                                            <Button size="lg" asChild>
                                                <Link href={login()}>
                                                    Get started
                                                    <ArrowRight className="size-4" />
                                                </Link>
                                            </Button>
                                            {canRegister && (
                                                <Button
                                                    size="lg"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <Link href={register()}>
                                                        Create account
                                                    </Link>
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {stack.map((label) => (
                                        <Badge
                                            key={label}
                                            variant="outline"
                                            className="font-normal text-muted-foreground"
                                        >
                                            {label}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <Card className="border-border/80 bg-card/80 shadow-lg backdrop-blur-sm">
                                <CardHeader className="space-y-1 pb-2">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Terminal className="size-4" />
                                        <span className="font-mono text-xs uppercase tracking-wider">
                                            Quick start
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg font-semibold">
                                       One command to start development
                                    </CardTitle>
                                    <CardDescription>
                                        Run <span className="text-chart-2">composer dev</span> to start development server, queue listener, and Vite.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 font-mono text-sm">
                                    <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-left text-xs leading-relaxed sm:text-sm">
                                        <code>
                                            <span className="text-chart-2">
                                                composer
                                            </span>{' '}
                                            <span className="text-foreground">
                                                install
                                            </span>
                                            {'\n'}
                                            <span className="text-chart-2">
                                                cp
                                            </span>{' '}
                                            <span className="text-foreground">
                                                .env.example .env
                                            </span>
                                            {'\n'}
                                            <span className="text-chart-2">
                                                php
                                            </span>{' '}
                                            <span className="text-foreground">
                                                artisan key:generate migrate
                                            </span>
                                            {'\n'}
                                            <span className="text-chart-2">
                                                npm
                                            </span>{' '}
                                            <span className="text-foreground">
                                                install && npm run dev
                                            </span>
                                        </code>
                                    </pre>
                                    <p className="text-xs text-muted-foreground">
                                        Customize `.env`, run queue &amp; scheduler according to your deployment needs.
                                    </p>
                                </CardContent>
                            </Card>
                        </section>

                        <section className="space-y-8">
                            <div className="max-w-2xl space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                    Features included
                                </h2>
                                <p className="text-muted-foreground">
                                    Authentication, authorization, and activity logging are already prepared.
                                </p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {features.map(
                                    ({ icon: Icon, title, description }) => (
                                        <Card
                                            key={title}
                                            className="group border-border/80 transition-shadow hover:shadow-md"
                                        >
                                            <CardHeader>
                                                <div className="mb-2 flex size-10 items-center justify-center rounded-lg border bg-muted/50 text-primary transition-colors group-hover:bg-primary/10">
                                                    <Icon className="size-5" />
                                                </div>
                                                <CardTitle className="text-lg">
                                                    {title}
                                                </CardTitle>
                                                <CardDescription className="text-pretty">
                                                    {description}
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    ),
                                )}
                            </div>
                        </section>

                        <section>
                            <Card className="overflow-hidden border-primary/20 bg-linear-to-br from-primary/10 via-card to-chart-2/10">
                                <CardContent className="flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
                                    <div className="space-y-2">
                                        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                                            Ready to customize
                                        </h2>
                                        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
                                            Change branding, add modules, or
                                            connect API — Laravel folder structure and
                                            conventions are still maintained.
                                        </p>
                                    </div>
                                    {auth.user ? (
                                        <Button size="lg" asChild>
                                            <Link href={dashboard()}>
                                                Go to dashboard
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button size="lg" asChild>
                                            <Link href={login()}>
                                                Login to your account
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </section>
                    </main>

                    <footer className="mt-auto border-t pt-8 text-center text-sm text-muted-foreground">
                        Built with Laravel · Inertia · React.
                    </footer>
                </div>
            </div>
        </>
    );
}
