import { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { Navigation } from '@/components/Navigation';
import { MemberDashboard } from '@/components/MemberDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  CreditCard, 
  TrendingUp,
  Bell,
  Settings,
  Building,
  Calendar,
  Search,
  Filter
} from 'lucide-react';

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

  const handleLogout = () => {
    setCurrentUser(null);
    setUserEmail('');
    setCurrentView('dashboard');
  };

  const getMemberName = () => {
    if (currentUser === 'admin') return 'Admin User';
    return userEmail.includes('rajesh') ? 'Rajesh Kumar' : 'Society Member';
  };

  // Placeholder components for different views
  const BillsView = () => (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Bills Management</h2>
      <p className="text-muted-foreground">Bill management interface coming soon...</p>
    </Card>
  );

  const PaymentsView = () => (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Payment History</h2>
      <p className="text-muted-foreground">Payment history interface coming soon...</p>
    </Card>
  );

  const MembersView = () => (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Members Management</h2>
      <p className="text-muted-foreground">Members management interface coming soon...</p>
    </Card>
  );

  const FinancesView = () => (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Financial Reports</h2>
      <p className="text-muted-foreground">Financial reports interface coming soon...</p>
    </Card>
  );

  const ExpensesView = () => (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Expense Management</h2>
      <p className="text-muted-foreground">Expense management interface coming soon...</p>
    </Card>
  );

  const NoticesView = () => (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Society Notices</h2>
      <p className="text-muted-foreground">Notices interface coming soon...</p>
    </Card>
  );

  const ProfileView = () => (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
      <p className="text-muted-foreground">Profile settings interface coming soon...</p>
    </Card>
  );

  const SettingsView = () => (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">System Settings</h2>
      <p className="text-muted-foreground">System settings interface coming soon...</p>
    </Card>
  );

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return currentUser === 'admin' ? <AdminDashboard /> : <MemberDashboard />;
      case 'bills':
        return <BillsView />;
      case 'payments':
        return <PaymentsView />;
      case 'members':
        return <MembersView />;
      case 'finances':
        return <FinancesView />;
      case 'expenses':
        return <ExpensesView />;
      case 'notices':
        return <NoticesView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      default:
        return currentUser === 'admin' ? <AdminDashboard /> : <MemberDashboard />;
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
      
      {/* Main Content */}
      <div className="flex-1 lg:pl-80">
        <main className="p-6 overflow-auto h-full">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default Index;