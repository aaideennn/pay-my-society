import { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { Navigation } from '@/components/Navigation';
import { MemberDashboard } from '@/components/MemberDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { MembersManagement } from '@/components/admin/MembersManagement';
import { BillManagement } from '@/components/admin/BillManagement';
import { ExpenseManagement } from '@/components/admin/ExpenseManagement';
import { FinancialReports } from '@/components/admin/FinancialReports';

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
    <div className="flex h-screen bg-muted/30">
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        userType={currentUser}
        memberName={getMemberName()}
      />
      
      <div className="flex-1 lg:pl-80">
        <main className="p-6 overflow-auto h-full">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default Index;