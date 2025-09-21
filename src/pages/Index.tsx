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
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  // For now, we'll determine user type from email or default to member
  // In a real implementation, this would come from the profiles table
  const getUserType = (): 'member' | 'admin' => {
    // Default all users to member for now - this should be fetched from your profiles table
    return 'member';
  };

  const getMemberName = () => {
    return user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  };

  const currentUser = getUserType();

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