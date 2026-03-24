import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuGroup,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl, type IsCurrentUrlFn } from '@/hooks/use-current-url';
import type { MainNavGroup, NavItem } from '@/types';

type NavMainProps = {
    group: MainNavGroup;
};

type NavItemWithDepth = NavItem & {
};

function getExpandedKeysForCurrentUrl(
    items: NavItemWithDepth[],
    isCurrentUrl: IsCurrentUrlFn,
    currentUrl: string,
): Set<string> {
    const expanded = new Set<string>();

    items.forEach((item) => {
        const key = item.title;
        const hasChildren = !!item.children && item.children.length > 0;

        if (!hasChildren) {
            return;
        }

        let shouldExpandRoot = isCurrentUrl(item.href, currentUrl);

        item.children?.forEach((child) => {
            const childHasChildren = !!child.children && child.children.length > 0;

            if (!childHasChildren) {
                if (child.href && isCurrentUrl(child.href, currentUrl)) {
                    shouldExpandRoot = true;
                }
                return;
            }

            const childKey = `${key}-${child.title}`;
            let shouldExpandChild = false;

            child.children?.forEach((grandChild) => {
                if (grandChild.href && isCurrentUrl(grandChild.href, currentUrl)) {
                    shouldExpandChild = true;
                }
            });

            if (shouldExpandChild) {
                expanded.add(childKey);
                shouldExpandRoot = true;
            }
        });

        if (shouldExpandRoot) {
            expanded.add(key);
        }
    });

    return expanded;
}

function NavItemNode({
    item,
    expandedKeys,
    toggleKey,
    isCurrentUrl,
    sidebarState,
    isMobile,
}: {
    item: NavItemWithDepth;
    expandedKeys: Set<string>;
    toggleKey: (key: string) => void;
    isCurrentUrl: (href: NavItem['href']) => boolean;
    sidebarState: 'expanded' | 'collapsed';
    isMobile: boolean;
}) {
    const key = item.title;
    const hasChildren = !!item.children && item.children.length > 0;
    const isExpanded = expandedKeys.has(key);
    const isCollapsed = sidebarState === 'collapsed' && !isMobile;

    if (!hasChildren) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={isCurrentUrl(item.href)}
                    tooltip={{ children: item.title }}
                    className="cursor-pointer"
                >
                    <Link href={item.href} prefetch>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    if (isCollapsed) {
        return (
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                            className="group cursor-pointer"
                        >
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight
                                className="ml-auto h-4 w-4 shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-90"
                            />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        side="right"
                        align="start"
                        className="min-w-40"
                    >
                        <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {item.children?.map((child) => {
                                const hasGrandChildren =
                                    child.children &&
                                    child.children.length > 0;

                                if (!hasGrandChildren) {
                                    return (
                                        <DropdownMenuItem
                                            key={child.title}
                                            asChild
                                            className="cursor-pointer"
                                        >
                                            <Link
                                                href={child.href ?? '#'}
                                                prefetch
                                            >
                                                <span>{child.title}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    );
                                }

                                return (
                                    <DropdownMenuSub key={child.title}>
                                        <DropdownMenuSubTrigger className="cursor-pointer">
                                            <span>{child.title}</span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                            {child.children?.map(
                                                (grandChild) => (
                                                    <DropdownMenuItem
                                                        key={grandChild.title}
                                                        asChild
                                                        className="cursor-pointer"
                                                    >
                                                        <Link
                                                            href={
                                                                grandChild.href ??
                                                                '#'
                                                            }
                                                            prefetch
                                                        >
                                                            {grandChild.icon && (
                                                                <grandChild.icon />
                                                            )}
                                                            <span>
                                                                {
                                                                    grandChild.title
                                                                }
                                                            </span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                ),
                                            )}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                );
                            })}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuItem>
            <Collapsible
                open={isExpanded}
                onOpenChange={() => toggleKey(key)}
                className="group/collapsible"
                defaultOpen={item.isActive}
            >
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        isActive={isCurrentUrl(item.href)}
                        tooltip={{ children: item.title }}
                        className="min-h-7 h-auto cursor-pointer"
                    >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down cursor-pointer">
                    <SidebarMenuSub id={`submenu-${key}`} aria-label={item.title}>
                        {item.children?.map((child) => {
                            const childHasChildren =
                                child.children && child.children.length > 0;

                            if (!childHasChildren) {
                                return (
                                    <SidebarMenuSubItem key={child.title}>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={isCurrentUrl(child.href)}
                                            className="cursor-pointer"
                                        >
                                            <Link href={child.href} prefetch>
                                                {child.icon && <child.icon />}
                                                <span>{child.title}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                );
                            }

                            const childKey = `${key}-${child.title}`;
                            const childExpanded = expandedKeys.has(childKey);

                            return (
                                <SidebarMenuSubItem key={child.title}>
                                    <Collapsible
                                        open={childExpanded}
                                        onOpenChange={() => toggleKey(childKey)}
                                        className="group/collapsible"
                                    >
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuSubButton
                                                className="flex w-full items-center justify-between"
                                            >
                                                <span>{child.title}</span>
                                                <ChevronRight
                                                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${childExpanded ? 'rotate-90' : ''
                                                        }`}
                                                    aria-hidden="true"
                                                />
                                            </SidebarMenuSubButton>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                            <SidebarMenuSub
                                                id={`submenu-${childKey}`}
                                                aria-label={child.title}
                                            >
                                                {child.children?.map((grandChild) => (
                                                    <SidebarMenuSubItem
                                                        key={grandChild.title}
                                                        className="h-auto"
                                                    >
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={isCurrentUrl(
                                                                grandChild.href,
                                                            )}
                                                            className="cursor-pointer"
                                                        >
                                                            <Link
                                                                href={grandChild.href}
                                                                prefetch
                                                            >
                                                                <span>{grandChild.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </SidebarMenuSubItem>
                            );
                        })}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    );
}

export function NavMain({ group }: NavMainProps) {
    const { currentUrl, isCurrentUrl } = useCurrentUrl();
    const { state: sidebarState, isMobile } = useSidebar();

    const items = useMemo(
        () => group.items ?? [],
        [group.items],
    );

    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() =>
        getExpandedKeysForCurrentUrl(items, isCurrentUrl, currentUrl),
    );

    useEffect(() => {
        setExpandedKeys(
            getExpandedKeysForCurrentUrl(items, isCurrentUrl, currentUrl),
        );
    }, [items, currentUrl, isCurrentUrl]);

    const toggleKey = (key: string) => {
        setExpandedKeys((prev) => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    return (
        <SidebarGroup className="px-2 py-0 group-data-[collapsible=icon]:px-0.5 group-data-[collapsible=icon]:py-0">
            <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item: NavItemWithDepth) => (
                    <NavItemNode
                        key={item.title}
                        item={item}
                        expandedKeys={expandedKeys}
                        toggleKey={toggleKey}
                        isCurrentUrl={isCurrentUrl}
                        sidebarState={sidebarState}
                        isMobile={isMobile}
                    />
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
