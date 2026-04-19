import { Head } from '@inertiajs/react';

import type { MarqueeSpeed } from '@/types/dashboard';
import { BorrowerList, type HomeBorrower } from './welcome/borrower-list';
import { CoverSection, type HomeCover } from './welcome/cover-section';
import { InfoMarquee, type HomeInformation } from './welcome/info-marquee';

type WelcomePageProps = {
    canManageCover?: boolean;
    cover: HomeCover | null;
    borrowers: HomeBorrower[];
    informations: HomeInformation[];
    marqueeSpeed?: MarqueeSpeed;
};

export default function Welcome({
    canManageCover = false,
    cover,
    borrowers,
    informations,
    marqueeSpeed = 'medium',
}: WelcomePageProps) {
    return (
        <>
            <Head title="Beranda">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative min-h-svh overflow-x-hidden bg-background text-foreground">
                <div
                    aria-hidden
                    className="pointer-events-none fixed inset-0 overflow-hidden"
                >
                    <div className="absolute -left-1/4 top-0 h-[min(80vw,36rem)] w-[min(80vw,36rem)] rounded-full bg-primary/15 blur-[100px] dark:bg-primary/25" />
                    <div className="absolute -right-1/4 bottom-0 h-[min(70vw,32rem)] w-[min(70vw,32rem)] rounded-full bg-chart-2/20 blur-[90px] dark:bg-chart-2/30" />
                </div>

                <div className="relative z-10 mx-auto flex min-h-svh max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
                    <main className="flex flex-1 flex-col gap-4">
                        <section className="flex flex-col gap-4 lg:flex-row lg:items-start">
                            <CoverSection cover={cover} canManage={canManageCover} />
                            <div className="w-full min-w-0 lg:flex-1">
                                <BorrowerList borrowers={borrowers} />
                            </div>
                        </section>

                        <section>
                            <InfoMarquee informations={informations} speed={marqueeSpeed} />
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}
