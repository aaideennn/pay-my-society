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
import { useEffect, useState } from 'react';
import { getSocietyStats, getMembers, getBills, getExpenses, type Member, type Bill, type Expense } from '@/lib/mockData';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(getSocietyStats());
  const [recentPayments, setRecentPayments] = useState<Bill[]>([]);
  const [overdueMembers, setOverdueMembers] = useState<{member: Member, bills: Bill[]}[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    // Load real data
    const members = getMembers();
    const bills = getBills();
    const expenses = getExpenses();

    // Get recent payments (last 10 paid bills)
    const recentPaidBills = bills
      .filter(b => b.status === 'paid' && b.paidDate)
      .sort((a, b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime())
      .slice(0, 4);
    setRecentPayments(recentPaidBills);

    // Get overdue members
    const overdue = members
      .map(member => ({
        member,
        bills: bills.filter(b => b.memberId === member.id && b.status === 'overdue')
      }))
      .filter(item => item.bills.length > 0)
      .slice(0, 2);
    setOverdueMembers(overdue);

    // Get recent expenses (last 3)
    const recent = expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
    setRecentExpenses(recent);

    // Update stats
    setStats(getSocietyStats());
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
            {recentPayments.map((payment) => {
              const member = getMembers().find(m => m.id === payment.memberId);
              return (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-smooth">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-success rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{member?.name}</h3>
                      <p className="text-xs text-muted-foreground">Flat {member?.flatNumber} • {payment.paidDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">₹{payment.amount.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
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
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-smooth">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-warning rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{expense.category}</h3>
                    <p className="text-xs text-muted-foreground">{expense.vendor} • {expense.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-warning">-₹{expense.amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
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