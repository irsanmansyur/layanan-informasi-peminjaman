import { Link, usePage } from '@inertiajs/react';
import { Github, HandHeart } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar';
import { mainNavItems } from '@/config/navigation';
import { useFilteredMainNavItems } from '@/hooks/use-filtered-main-nav-items';
import { dashboard } from '@/routes';
import AppLogo from './app-logo';

export function AppSidebar() {
    const filteredMainNavItems = useFilteredMainNavItems(mainNavItems);
    const { name } = usePage().props;
    const { state, isMobile } = useSidebar();
    const isIconMode = !isMobile && state === 'collapsed';

    const brand =
        typeof name === 'string' && name.length > 0 ? name : 'Admin Starter';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-b border-sidebar-border/60 px-2 pb-2 pt-1 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:pb-2 group-data-[collapsible=icon]:pt-2">
                <SidebarMenu className="group-data-[collapsible=icon]:items-center">
                    <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                        <SidebarMenuButton
                            size={isIconMode ? 'default' : 'lg'}
                            asChild
                            tooltip={{ children: brand }}
                            className="group-data-[collapsible=icon]:mx-auto"
                        >
                            <Link
                                href={dashboard()}
                                prefetch
                                className="flex min-w-0 items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                            >
                                <AppLogo compact={isIconMode} />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-1 px-1 pt-2 group-data-[collapsible=icon]:px-1">
                {filteredMainNavItems.map((group) => (
                    <NavMain key={group.title} group={group} />
                ))}
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/60 px-2 py-2 group-data-[collapsible=icon]:px-1">
                <SidebarMenu className="group-data-[collapsible=icon]:items-center">
                    <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                        <SidebarMenuButton
                            asChild
                            size="default"
                            tooltip={{ children: 'GitHub Repository' }}
                            className="group-data-[collapsible=icon]:mx-auto"
                        >
                            <a
                                href="https://github.com/yudhaharsanto/laravel-inertia"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="flex min-w-0 items-center gap-2"
                            >
                                <Github className="size-4" />
                                <span className="truncate font-medium">Repository</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                        <SidebarMenuButton
                            asChild
                            size="default"
                            tooltip={{ children: 'Donate via Saweria' }}
                            className="group-data-[collapsible=icon]:mx-auto"
                        >
                            <a
                                href="https://saweria.co/yudhaharsanto"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="flex min-w-0 items-center gap-2"
                            >
                                <HandHeart className="size-4 text-primary" />
                                <span className="truncate font-medium">Donate</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
