import { usePage } from '@inertiajs/react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useInitials } from '@/hooks/use-initials';
import type { BreadcrumbItem } from '@/types';
import AppearanceTabs from './appearance-tabs';
import { Breadcrumbs } from './breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import { UserMenuContent } from './user-menu-content';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

export function AppSidebarHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth } = page.props;
    const getInitials = useInitials();

    return (
        <header className="flex h-11 shrink-0 items-center gap-2.5 border-b border-sidebar-border/60 bg-card/60 px-3 py-0 backdrop-blur-sm sm:gap-3 sm:px-4 md:h-14">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
                <SidebarTrigger className="size-8 shrink-0 cursor-pointer" />
                <Separator
                    orientation="vertical"
                    className="hidden h-5 shrink-0 sm:block"
                />
                <div className="min-w-0 flex-1">
                    {breadcrumbs.length > 0 && (
                        <Breadcrumbs
                            breadcrumbs={breadcrumbs}
                            listClassName="text-sm text-foreground/90 sm:gap-2.5 [&_[data-slot=breadcrumb-page]]:font-medium"
                        />
                    )}
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <AppearanceTabs variant="rail" />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="size-8 cursor-pointer rounded-full p-0 hover:bg-muted/80 sm:size-9"
                        >
                            <Avatar className="size-7 overflow-hidden rounded-full sm:size-8">
                                <AvatarImage
                                    src={auth.user.avatar}
                                    alt={auth.user.name}
                                />
                                <AvatarFallback className="rounded-full bg-primary/15 text-xs font-medium text-primary sm:text-sm">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
