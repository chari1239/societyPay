"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { LogOut } from 'lucide-react';
import {
  Sidebar as ShadSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { NAV_ITEMS, APP_NAME } from '@/lib/constants';
import { Logo } from './Logo';
import { useAuth } from '@/hooks/useAuth';

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  tooltip?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ShadSidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/dashboard">
          <Logo showText={sidebarState === 'expanded'} />
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                  tooltip={item.tooltip || item.label}
                  className="justify-start"
                >
                  <a>
                    <item.icon className="mr-2" />
                    {item.label}
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenuButton
            onClick={handleLogout}
            tooltip="Logout"
            className="justify-start"
          >
            <LogOut className="mr-2" />
            Logout
          </SidebarMenuButton>
      </SidebarFooter>
    </ShadSidebar>
  );
}
