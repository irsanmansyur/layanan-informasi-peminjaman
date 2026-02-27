import { Link } from '@inertiajs/react';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { mainNavItems } from '@/config/navigation';
import { useFilteredMainNavItems } from '@/hooks/use-filtered-main-nav-items';
import { dashboard } from '@/routes';
import AppLogo from './app-logo';

export function AppSidebar() {
    const filteredMainNavItems = useFilteredMainNavItems(mainNavItems);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {filteredMainNavItems.map((group) => (
                    <NavMain key={group.title} group={group} />
                ))}
            </SidebarContent>
        </Sidebar>
    );
}
