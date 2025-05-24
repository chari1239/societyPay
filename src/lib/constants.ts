import type { NavItem } from '@/components/shared/Sidebar';
import { LayoutDashboard, CreditCard, ListChecks, FileText, Bell, UserCircle, LogOut } from 'lucide-react';

export const APP_NAME = 'SocietyPay';

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/payments', icon: CreditCard, label: 'Make Payment' },
  { href: '/status', icon: ListChecks, label: 'Payment Status' },
  { href: '/reports', icon: FileText, label: 'Reports' },
  { href: '/reminders', icon: Bell, label: 'Reminders' },
  { href: '/profile', icon: UserCircle, label: 'Profile' },
];

export const MOCK_USER_ID = 'user123';

export const MONTH_OPTIONS: { value: string, label: string }[] = [
  { value: '2024-07', label: 'July 2024' },
  { value: '2024-08', label: 'August 2024' },
  { value: '2024-09', label: 'September 2024' },
  { value: '2024-10', label: 'October 2024' },
  { value: '2024-11', label: 'November 2024' },
  { value: '2024-12', label: 'December 2024' },
];

export const CURRENT_MONTH_LABEL = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
export const CURRENT_MONTH_VALUE = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
