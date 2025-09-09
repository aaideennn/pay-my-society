import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  CreditCard, 
  FileText, 
  Bell, 
  Settings, 
  Users, 
  TrendingUp, 
  Menu,
  X,
  LogOut
} from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userType: 'member' | 'admin';
  memberName: string;
}

export const Navigation = ({ currentView, onViewChange, userType, memberName }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const memberMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'bills', label: 'My Bills', icon: FileText },
    { id: 'payments', label: 'Payment History', icon: CreditCard },
    { id: 'notices', label: 'Notices', icon: Bell, badge: 3 },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'finances', label: 'Finances', icon: TrendingUp },
    { id: 'bills', label: 'Bill Management', icon: FileText },
    { id: 'expenses', label: 'Expenses', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const menuItems = userType === 'admin' ? adminMenuItems : memberMenuItems;

  const MenuItem = ({ item, isMobile = false }: { item: any; isMobile?: boolean }) => (
    <Button
      variant={currentView === item.id ? 'default' : 'ghost'}
      className={`w-full justify-start gap-3 h-12 transition-smooth ${
        currentView === item.id 
          ? 'bg-gradient-primary text-white shadow-primary' 
          : 'hover:bg-card-hover hover:shadow-card-elegant'
      } ${isMobile ? 'text-base' : ''}`}
      onClick={() => {
        onViewChange(item.id);
        setIsOpen(false);
      }}
    >
      <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-white' : 'text-muted-foreground'}`} />
      <span className="flex-1 text-left">{item.label}</span>
      {item.badge && (
        <Badge variant="destructive" className="ml-auto">
          {item.badge}
        </Badge>
      )}
    </Button>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Society Manager</h1>
            <p className="text-sm text-muted-foreground">{userType === 'admin' ? 'Admin Panel' : 'Member Portal'}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm">
          {/* Backdrop - closes menu when clicked */}
          <div 
            className="absolute inset-0 bg-transparent" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar Content */}
          <div className="relative w-80 h-full bg-white shadow-2xl overflow-y-auto">
            {/* Close button */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Society Manager</h2>
                  <p className="text-xs text-muted-foreground">{userType === 'admin' ? 'Admin Panel' : 'Member Portal'}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6">
              {/* User Info */}
              <Card className="p-4 mb-6 bg-gradient-hero text-white border-0 shadow-primary">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold">{memberName.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{memberName}</h3>
                    <p className="text-white/80 text-sm capitalize">{userType}</p>
                  </div>
                </div>
              </Card>

              {/* Menu Items */}
              <div className="space-y-2 mb-8">
                {menuItems.map((item) => (
                  <MenuItem key={item.id} item={item} isMobile />
                ))}
              </div>

              {/* Logout */}
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-12 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20"
                onClick={() => {
                  setIsOpen(false);
                  // Add logout logic here
                }}
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0 lg:z-30">
        <div className="flex flex-col flex-1 bg-white border-r border-border shadow-lg">
          {/* Logo */}
          <div className="p-6 border-b border-border bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl">Society Manager</h1>
                <p className="text-sm text-muted-foreground">{userType === 'admin' ? 'Admin Panel' : 'Member Portal'}</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 bg-white">
            <Card className="p-4 bg-gradient-hero text-white border-0 shadow-primary">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-lg font-bold">{memberName.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{memberName}</h3>
                  <p className="text-white/80 text-sm capitalize">{userType}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-6 bg-white overflow-y-auto">
            <div className="space-y-2 pb-4">
              {menuItems.map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Logout */}
          <div className="p-6 border-t border-border bg-white">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 h-12 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20"
              onClick={() => {
                // Add logout logic here
                window.location.reload();
              }}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};