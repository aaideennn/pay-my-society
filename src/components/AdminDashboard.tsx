import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  ArrowRight,
  Building,
  Wallet
} from 'lucide-react';
import { FinanceChart } from './FinanceChart';
import { PendingApprovals } from './admin/PendingApprovals';
import { useEffect, useState } from 'react';
import { getSocietyStats, getMembers, getBills, getExpenses, type Member, type Bill, type Expense } from '@/lib/mockData';
import { supabase } from '@/integrations/supabase/client';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingMembers: 0,
    totalCollection: 0,
    totalExpenses: 0,
    netBalance: 0,
    collectionRate: 0,
    overdueCount: 0,
    monthlyTarget: 0
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [overdueMembers, setOverdueMembers] = useState<{member: Member, bills: Bill[]}[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const loadDashboardData = async () => {
    try {
      // Load members from Supabase
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Load expenses from Supabase
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      // Load bills from Supabase
      const { data: bills } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false });

      const profilesData = profiles || [];
      const expensesData = expenses || [];
      const billsData = bills || [];

      setMembers(profilesData);
      setRecentExpenses(expensesData);

      // Set recent payments (recent paid bills)
      const recentPaidBills = billsData
        .filter(b => b.status === 'paid' && b.payment_date)
        .sort((a: any, b: any) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
        .slice(0, 4);
      setRecentPayments(recentPaidBills);

      // Calculate stats
      const totalMembers = profilesData.length;
      const activeMembers = profilesData.filter(p => p.status === 'active').length;
      const pendingMembers = profilesData.filter(p => p.status === 'pending').length;
      
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const currentMonthBills = billsData.filter(b => 
        b.year === currentYear && b.month === currentMonth
      );
      
      const paidBills = currentMonthBills.filter(b => b.status === 'paid');
      const totalCollection = paidBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
      
      const currentMonthExpenses = expensesData.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getFullYear() === currentYear && 
               expenseDate.getMonth() + 1 === currentMonth;
      });
      const totalExpenses = currentMonthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

      const collectionRate = currentMonthBills.length > 0 
        ? Math.round((paidBills.length / currentMonthBills.length) * 100) 
        : 0;

      setStats({
        totalMembers,
        activeMembers,
        pendingMembers,
        totalCollection,
        totalExpenses,
        netBalance: totalCollection - totalExpenses,
        collectionRate,
        overdueCount: billsData.filter(b => b.status === 'overdue').length,
        monthlyTarget: activeMembers * 2500
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to mock data
      const members = getMembers();
      const bills = getBills();
      const expenses = getExpenses();

      setStats(getSocietyStats());
      setRecentExpenses(expenses.slice(0, 3));
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Set up real-time subscriptions
    const profilesChannel = supabase
      .channel('profiles-dashboard')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, () => {
        loadDashboardData();
      })
      .subscribe();

    const expensesChannel = supabase
      .channel('expenses-dashboard')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'expenses'
      }, () => {
        loadDashboardData();
      })
      .subscribe();

    const billsChannel = supabase
      .channel('bills-dashboard')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bills'
      }, () => {
        loadDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(expensesChannel);
      supabase.removeChannel(billsChannel);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-hero p-6 rounded-2xl text-white shadow-primary">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-white/80 mt-1">Green Valley Society Management</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <Users className="w-4 h-4 mr-2" />
              Generate Bills
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 shadow-card-elegant hover:shadow-primary transition-smooth">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold">{stats.totalMembers}</p>
              <p className="text-xs text-success">Active: {stats.activeMembers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card-elegant hover:shadow-success transition-smooth">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Collection</p>
              <p className="text-2xl font-bold">₹{(stats.totalCollection / 1000).toFixed(0)}K</p>
              <p className="text-xs text-success">{stats.collectionRate}% collected</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card-elegant hover:shadow-warning transition-smooth">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">₹{(stats.totalExpenses / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card-elegant hover:shadow-success transition-smooth">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Balance</p>
              <p className="text-2xl font-bold text-success">₹{(stats.netBalance / 1000).toFixed(0)}K</p>
              <p className="text-xs text-success">Current balance</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card-elegant">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold">Monthly Income vs Expenses</h2>
          </div>
          <div className="p-6">
            <FinanceChart />
          </div>
        </Card>

        <Card className="shadow-card-elegant">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Overdue Payments</h2>
              <Badge variant="destructive">{overdueMembers.length} Members</Badge>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {overdueMembers.map((item, index) => (
              <div key={item.member.id} className="flex items-center justify-between p-4 rounded-xl bg-danger/5 border border-danger/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-danger rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.member.name}</h3>
                    <p className="text-sm text-muted-foreground">Flat {item.member.flatNumber} • {item.bills.length} bills overdue</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-danger">₹{item.bills.reduce((sum, bill) => sum + bill.amount, 0).toLocaleString()}</p>
                  <Button size="sm" variant="outline" className="mt-1">
                    Send Notice
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Pending Approvals - Show if there are pending members */}
      {stats.pendingMembers > 0 && (
        <PendingApprovals />
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card-elegant">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Payments</h2>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {recentPayments.length > 0 ? recentPayments.map((payment) => {
              const member = members.find(m => m.user_id === payment.user_id);
              return (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-smooth">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-success rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{member?.name || 'Unknown Member'}</h3>
                      <p className="text-xs text-muted-foreground">Flat {member?.flat_number || '—'} • {new Date(payment.payment_date || payment.created_at || '').toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">₹{payment.amount?.toLocaleString()}</p>
                  </div>
                </div>
              );
            }) : (
              <div className="p-6 text-center text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent payments</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="shadow-card-elegant">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Expenses</h2>
              <Button variant="ghost" size="sm">
                Add Expense <Plus className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {recentExpenses.length > 0 ? recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-smooth">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-warning rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{expense.category}</h3>
                    <p className="text-xs text-muted-foreground">{expense.description} • {new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-warning">-₹{expense.amount?.toLocaleString()}</p>
                </div>
              </div>
            )) : (
              <div className="p-6 text-center text-muted-foreground">
                <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent expenses</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card-elegant">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-16 bg-gradient-primary hover:shadow-primary transition-smooth">
              <div className="text-center">
                <Users className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">Generate Monthly Bills</span>
              </div>
            </Button>
            <Button variant="outline" className="h-16 hover:bg-muted transition-smooth">
              <div className="text-center">
                <Plus className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">Add New Expense</span>
              </div>
            </Button>
            <Button variant="outline" className="h-16 hover:bg-muted transition-smooth">
              <div className="text-center">
                <Eye className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">View Reports</span>
              </div>
            </Button>
            <Button variant="outline" className="h-16 hover:bg-muted transition-smooth">
              <div className="text-center">
                <Building className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">Manage Properties</span>
              </div>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};