import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { MemberDashboard } from '@/components/MemberDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { MembersManagement } from '@/components/admin/MembersManagement';
import { BillManagement } from '@/components/admin/BillManagement';
import { ExpenseManagement } from '@/components/admin/ExpenseManagement';
import { FinancialReports } from '@/components/admin/FinancialReports';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, userRole } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  // Determine user type based on role data from database
  const getUserType = (): 'member' | 'admin' => {
    // Check if user is global admin or society admin
    if (userRole.isAdmin || userRole.isSocietyAdmin) {
      return 'admin';
    }
    
    return 'member';
  };

  const getMemberName = () => {
    return userRole.profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  };

  const currentUser = getUserType();

  // Show loading state while fetching role data
  if (userRole.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4">
          <div className="text-center">Loading user permissions...</div>
        </div>
      </div>
    );
  }

  // Show error state if role data failed to load
  if (userRole.error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="text-destructive">Failed to load user permissions</div>
          <div className="text-sm text-muted-foreground">{userRole.error}</div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    if (currentUser === 'admin') {
      switch (currentView) {
        case 'dashboard': return <AdminDashboard />;
        case 'members': return <MembersManagement />;
        case 'bills': return <BillManagement />;
        case 'expenses': return <ExpenseManagement />;
        case 'finances': return <FinancialReports />;
        default: return <AdminDashboard />;
      }
    } else {
      // Member views with proper email context
      return <MemberDashboard memberEmail={user?.email || ''} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Navigation 
          currentView={currentView} 
          onViewChange={setCurrentView}
          userType={currentUser}
          memberName={getMemberName()}
          userRole={userRole}
        />

        <SidebarInset>
          <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger />
            <div className="font-semibold">Society Manager</div>
          </header>
          <main className="p-6">
            {renderView()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;