import { FolderTree, HandCoins, LayoutGrid, Megaphone } from 'lucide-react';
import { dashboard } from '@/routes';
import activityLogs from '@/routes/activity-logs';
import borrowers from '@/routes/borrowers';
import informations from '@/routes/informations';
import permissions from '@/routes/permissions';
import roles from '@/routes/roles';
import users from '@/routes/users';
import type { MainNavGroup } from '@/types';

export const mainNavItems: MainNavGroup[] = [
    {
        title: 'Platform',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
            {
                title: 'Management',
                href: '#',
                icon: FolderTree,
                requiredPermissions: [
                    'users.read',
                    'roles.read',
                    'permissions.read',
                    'activity-logs.read',
                ],
                children: [
                    {
                        title: 'Users',
                        href: users.index(),
                        requiredPermissions: ['users.read'],
                    },
                    {
                        title: 'Access Control',
                        href: '#',
                        requiredPermissions: ['roles.read', 'permissions.read'],
                        children: [
                            {
                                title: 'Permissions',
                                href: permissions.index(),
                                requiredPermissions: ['permissions.read'],
                            },
                            {
                                title: 'Roles',
                                href: roles.index(),
                                requiredPermissions: ['roles.read'],
                            },
                        ],
                    },
                    {
                        title: 'Activity Logs',
                        href: activityLogs.index(),
                        requiredPermissions: ['activity-logs.read'],
                    },
                ],
            },
            {
                title: 'Peminjam',
                href: borrowers.index(),
                icon: HandCoins,
                requiredPermissions: ['borrowers.read'],
            },
            {
                title: 'Informasi',
                href: informations.index(),
                icon: Megaphone,
                requiredPermissions: ['informations.read'],
            },
        ],
    },
];
