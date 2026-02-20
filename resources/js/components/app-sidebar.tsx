import { Link } from '@inertiajs/react';
import { FolderTree, LayoutGrid } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import permissions from '@/routes/permissions';
import roles from '@/routes/roles';
import users from '@/routes/users';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Management',
        href: '#',
        icon: FolderTree,
        children: [
            {
                title: 'Users',
                href: users.index(),
            },
            {
                title: 'Access Control',
                href: '#',
                children: [
                    {
                        title: 'Permissions',
                        href: permissions.index(),
                    },
                    {
                        title: 'Roles',
                        href: roles.index(),
                    },
                ],
            },
        ],
    },
];

export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
            </SidebarContent>
        </Sidebar>
    );
}
