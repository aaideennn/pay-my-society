import { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { Navigation } from '@/components/Navigation';
import { MemberDashboard } from '@/components/MemberDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { MembersManagement } from '@/components/admin/MembersManagement';
import { BillManagement } from '@/components/admin/BillManagement';
import { ExpenseManagement } from '@/components/admin/ExpenseManagement';
import { FinancialReports } from '@/components/admin/FinancialReports';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';

type UserType = 'member' | 'admin' | null;

const Index = () => {
  const [currentUser, setCurrentUser] = useState<UserType>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [userEmail, setUserEmail] = useState('');

  const handleLogin = (userType: UserType, email: string) => {
    setCurrentUser(userType);
    setUserEmail(email);
    setCurrentView('dashboard');
  };

  const getMemberName = () => {
    if (currentUser === 'admin') return 'Admin User';
    return userEmail.includes('rajesh') ? 'Rajesh Kumar' : 'Society Member';
  };

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
      return <MemberDashboard memberEmail={userEmail} />;
    }
  };

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

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