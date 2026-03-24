import { Head, Link, usePage } from '@inertiajs/react';
import { ShieldCheck, Zap } from 'lucide-react';

import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;
    const brand = typeof name === 'string' && name.length > 0 ? name : 'Admin Starter';

    return (
        <>
            <Head>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>
            <div
                className="relative min-h-dvh overflow-x-hidden bg-background text-foreground"
                style={{ fontFamily: "'Instrument Sans', var(--font-sans), system-ui, sans-serif" }}
            >
                <div
                    aria-hidden
                    className="pointer-events-none fixed inset-0 overflow-hidden"
                >
                    <div className="absolute -left-1/4 top-0 h-[min(80vw,36rem)] w-[min(80vw,36rem)] rounded-full bg-primary/15 blur-[100px] dark:bg-primary/25" />
                    <div className="absolute -right-1/4 bottom-0 h-[min(70vw,32rem)] w-[min(70vw,32rem)] rounded-full bg-chart-2/20 blur-[90px] dark:bg-chart-2/30" />
                    <div
                        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.2] lg:opacity-25"
                        style={{
                            backgroundImage: `linear-gradient(to right, color-mix(in oklch, var(--border) 40%, transparent) 1px, transparent 1px),
                                linear-gradient(to bottom, color-mix(in oklch, var(--border) 40%, transparent) 1px, transparent 1px)`,
                            backgroundSize: '48px 48px',
                        }}
                    />
                </div>

                <div className="relative z-10 grid min-h-dvh lg:grid-cols-2">
                    <aside className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex lg:p-12">
                        <div className="absolute inset-0 bg-linear-to-br from-primary/15 via-background to-chart-2/10 dark:from-primary/25 dark:to-chart-2/20" />
                        <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent" />

                        <Link
                            href={home()}
                            className="relative z-10 flex items-center gap-3 transition-opacity hover:opacity-90"
                        >
                            <div className="flex size-11 items-center justify-center rounded-xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
                                <Zap className="size-5 text-primary" />
                            </div>
                            <span className="text-lg font-semibold tracking-tight">
                                {brand}
                            </span>
                        </Link>

                        <div className="relative z-10 space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                                <ShieldCheck className="size-3.5 text-primary" />
                                Starter kit · Laravel + Inertia
                            </div>
                            <h2 className="max-w-md text-balance text-3xl font-bold tracking-tight lg:text-4xl">
                                Manage users, roles, and permissions from one panel.
                            </h2>
                            <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
                                Dashboard, roles and permissions, and activity logs
                                are ready to use.
                            </p>
                        </div>

                        <p className="relative z-10 text-xs text-muted-foreground">
                            Customize branding and copy for your product.
                        </p>
                    </aside>

                    <div className="flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 lg:py-12">
                        <div className="mx-auto w-full max-w-md space-y-8">
                            <Link
                                href={home()}
                                className="flex items-center justify-center gap-3 lg:hidden"
                            >
                                <div className="flex size-10 items-center justify-center rounded-xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
                                    <Zap className="size-5 text-primary" />
                                </div>
                                <span className="text-lg font-semibold tracking-tight">
                                    {brand}
                                </span>
                            </Link>

                            <div className="rounded-2xl border border-border/80 bg-card/85 p-8 shadow-lg backdrop-blur-md sm:p-10">
                                <div className="mb-8 space-y-2 text-center sm:text-left">
                                    <h1 className="text-2xl font-bold tracking-tight">
                                        {title}
                                    </h1>
                                    <p className="text-pretty text-sm text-muted-foreground">
                                        {description}
                                    </p>
                                </div>
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
