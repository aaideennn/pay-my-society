import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { CreditCard, FileText, Home, LogOut, Settings, TrendingUp, Users, Bell } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userType: 'member' | 'admin';
  memberName: string;
}

type MenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

export const Navigation = ({ currentView, onViewChange, userType, memberName }: NavigationProps) => {
  const memberMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'bills', label: 'My Bills', icon: FileText },
    { id: 'payments', label: 'Payment History', icon: CreditCard },
    { id: 'notices', label: 'Notices', icon: Bell, badge: 3 },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  const adminMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'finances', label: 'Finances', icon: TrendingUp },
    { id: 'bills', label: 'Bill Management', icon: FileText },
    { id: 'expenses', label: 'Expenses', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const menuItems = userType === 'admin' ? adminMenuItems : memberMenuItems;

  return (
    <Sidebar collapsible="offcanvas" className="border-r bg-background">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary text-white">
            <Home className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Society Manager</h1>
            <p className="text-sm text-muted-foreground">{userType === 'admin' ? 'Admin Panel' : 'Member Portal'}</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-gradient-hero p-4 text-white shadow-primary">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/20 text-lg font-bold">
              {memberName.charAt(0)}
            </div>
            <div>
              <p className="font-semibold leading-tight">{memberName}</p>
              <p className="text-xs text-white/80 capitalize">{userType}</p>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={currentView === item.id}
                    onClick={() => onViewChange(item.id)}
                    size="lg"
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t p-2">
        <Button
          variant="ghost"
          className="h-12 justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20"
          onClick={() => window.location.reload()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};