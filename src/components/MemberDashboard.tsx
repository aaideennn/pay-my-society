import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Download,
  Bell,
  Calendar,
  DollarSign,
  ArrowRight
} from 'lucide-react';

export const MemberDashboard = () => {
  const memberData = {
    name: "Rajesh Kumar",
    flatNumber: "A-201",
    pendingAmount: 2500,
    nextDueDate: "2024-01-15",
    recentPayments: [
      { id: 1, month: "December 2023", amount: 2500, status: "paid", date: "2023-12-05", receipt: "#RC001" },
      { id: 2, month: "November 2023", amount: 2500, status: "paid", date: "2023-11-08", receipt: "#RC002" },
      { id: 3, month: "October 2023", amount: 2500, status: "paid", date: "2023-10-12", receipt: "#RC003" },
    ],
    currentBills: [
      { id: 1, month: "January 2024", amount: 2500, dueDate: "2024-01-15", status: "pending" },
      { id: 2, month: "February 2024", amount: 2500, dueDate: "2024-02-15", status: "upcoming" },
    ],
    notices: [
      { id: 1, title: "Water Supply Maintenance", date: "2024-01-10", type: "maintenance" },
      { id: 2, title: "Society Annual Meeting", date: "2024-01-20", type: "meeting" },
      { id: 3, title: "New Parking Rules", date: "2024-01-08", type: "announcement" },
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-gradient-success';
      case 'pending': return 'bg-gradient-warning';
      case 'overdue': return 'bg-gradient-danger';
      case 'upcoming': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'upcoming': return <Calendar className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-hero p-6 rounded-2xl text-white shadow-primary">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {memberData.name}</h1>
            <p className="text-white/80 mt-1">Flat {memberData.flatNumber} • Green Valley Society</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-white/80 text-sm">Outstanding Amount</p>
              <p className="text-2xl font-bold">₹{memberData.pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 shadow-card-elegant hover:shadow-primary transition-smooth">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Amount</p>
              <p className="text-2xl font-bold text-warning">₹{memberData.pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card-elegant hover:shadow-success transition-smooth">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid This Year</p>
              <p className="text-2xl font-bold text-success">₹30,000</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card-elegant hover:shadow-primary transition-smooth">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Due</p>
              <p className="text-xl font-bold">{memberData.nextDueDate}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card-elegant hover:shadow-danger transition-smooth">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-danger rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Notices</p>
              <p className="text-2xl font-bold text-danger">{memberData.notices.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Bills */}
        <Card className="shadow-card-elegant">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Current Bills</h2>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {memberData.currentBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-smooth">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(bill.status)}`}>
                    {getStatusIcon(bill.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{bill.month}</h3>
                    <p className="text-sm text-muted-foreground">Due: {bill.dueDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{bill.amount.toLocaleString()}</p>
                  {bill.status === 'pending' && (
                    <Button size="sm" className="mt-2 bg-gradient-primary">
                      <CreditCard className="w-4 h-4 mr-1" />
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Notices */}
        <Card className="shadow-card-elegant">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Notices</h2>
              <Badge variant="destructive">{memberData.notices.length} New</Badge>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {memberData.notices.map((notice) => (
              <div key={notice.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-smooth cursor-pointer">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{notice.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{notice.date}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {notice.type}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="shadow-card-elegant">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Recent Payment History</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {memberData.recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 rounded-xl bg-success/5 border border-success/20 hover:bg-success/10 transition-smooth">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-success rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{payment.month}</h3>
                    <p className="text-sm text-muted-foreground">Paid on {payment.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{payment.amount.toLocaleString()}</p>
                    <p className="text-xs text-success">{payment.receipt}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Receipt
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};