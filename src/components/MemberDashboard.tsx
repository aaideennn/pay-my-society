import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Download,
  Bell,
  Calendar,
  DollarSign,
  ArrowRight,
  User,
  Phone,
  Mail,
  Settings,
  Eye,
  Receipt,
  CreditCard as PaymentIcon
} from 'lucide-react';
import { getMembers, getBills, getNotices, updateBill, updateMember, type Member, type Bill, type Notice } from '@/lib/mockData';

interface MemberDashboardProps {
  memberEmail?: string;
}

export const MemberDashboard = ({ memberEmail = 'rajesh.kumar@email.com' }: MemberDashboardProps) => {
  const [member, setMember] = useState<Member | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMemberData();
  }, [memberEmail]);

  const loadMemberData = () => {
    const members = getMembers();
    const currentMember = members.find(m => m.email === memberEmail);
    if (currentMember) {
      setMember(currentMember);
      
      const allBills = getBills();
      const memberBills = allBills.filter(b => b.memberId === currentMember.id);
      setBills(memberBills);
      
      const allNotices = getNotices();
      setNotices(allNotices.filter(n => n.status === 'active'));
    }
  };

  if (!member) {
    return <div className="flex items-center justify-center h-64">Loading member data...</div>;
  }

  const pendingBills = bills.filter(b => b.status === 'pending');
  const paidBills = bills.filter(b => b.status === 'paid');
  const overdueBills = bills.filter(b => b.status === 'overdue');
  const currentYearPaid = paidBills
    .filter(b => b.year === new Date().getFullYear())
    .reduce((sum, bill) => sum + bill.amount, 0);
  
  const nextDueBill = [...pendingBills, ...overdueBills]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const handlePayment = (bill: Bill) => {
    setSelectedBill(bill);
    setIsPaymentDialogOpen(true);
  };

  const processPayment = () => {
    if (selectedBill) {
      const updatedBill = updateBill(selectedBill.id, {
        status: 'paid',
        paidDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Online',
        receiptNumber: `RC${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      });
      
      if (updatedBill) {
        loadMemberData();
        setIsPaymentDialogOpen(false);
        toast({
          title: "Payment Successful!",
          description: `Payment of ₹${selectedBill.amount} for ${selectedBill.month} has been processed.`,
        });
      }
    }
  };

  const handleProfileUpdate = (formData: FormData) => {
    const updatedData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
    };
    
    const updated = updateMember(member.id, updatedData);
    if (updated) {
      setMember(updated);
      setIsProfileDialogOpen(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    }
  };

  const downloadReceipt = (bill: Bill) => {
    toast({
      title: "Receipt Downloaded",
      description: `Receipt for ${bill.month} has been downloaded.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-gradient-success';
      case 'pending': return 'bg-gradient-warning';
      case 'overdue': return 'bg-gradient-danger';
      default: return 'bg-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-white" />;
      case 'pending': return <Clock className="w-4 h-4 text-white" />;
      case 'overdue': return <AlertCircle className="w-4 h-4 text-white" />;
      default: return <Clock className="w-4 h-4 text-white" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-950/30';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/30';
      case 'low': return 'border-l-green-500 bg-green-50 dark:bg-green-950/30';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-hero p-6 rounded-2xl text-white shadow-primary">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {member.name}</h1>
            <p className="text-white/80 mt-1">Flat {member.flatNumber} • Green Valley Society</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-white/80 text-sm">Outstanding Amount</p>
              <p className="text-2xl font-bold">
                ₹{(pendingBills.reduce((sum, bill) => sum + bill.amount, 0) + 
                   overdueBills.reduce((sum, bill) => sum + bill.amount, 0)).toLocaleString()}
              </p>
            </div>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setIsProfileDialogOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Settings className="w-4 h-4 mr-1" />
              Profile
            </Button>
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
              <p className="text-2xl font-bold text-warning">
                ₹{(pendingBills.reduce((sum, bill) => sum + bill.amount, 0) + 
                   overdueBills.reduce((sum, bill) => sum + bill.amount, 0)).toLocaleString()}
              </p>
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
              <p className="text-2xl font-bold text-success">₹{currentYearPaid.toLocaleString()}</p>
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
              <p className="text-xl font-bold">
                {nextDueBill ? new Date(nextDueBill.dueDate).toLocaleDateString() : 'No pending bills'}
              </p>
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
              <p className="text-2xl font-bold text-danger">{notices.length}</p>
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
              <Badge variant={pendingBills.length > 0 || overdueBills.length > 0 ? "destructive" : "secondary"}>
                {pendingBills.length + overdueBills.length} Pending
              </Badge>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {bills.slice(0, 3).map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-smooth">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(bill.status)}`}>
                    {getStatusIcon(bill.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{bill.month} {bill.year}</h3>
                    <p className="text-sm text-muted-foreground">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{bill.amount.toLocaleString()}</p>
                  {bill.status === 'pending' || bill.status === 'overdue' ? (
                    <Button 
                      size="sm" 
                      className="mt-2 bg-gradient-primary"
                      onClick={() => handlePayment(bill)}
                    >
                      <CreditCard className="w-4 h-4 mr-1" />
                      Pay Now
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => downloadReceipt(bill)}
                    >
                      <Receipt className="w-4 h-4 mr-1" />
                      Receipt
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {bills.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No bills available</p>
            )}
          </div>
        </Card>

        {/* Recent Notices */}
        <Card className="shadow-card-elegant">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Notices</h2>
              <Badge variant="destructive">{notices.length} New</Badge>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {notices.slice(0, 3).map((notice) => (
              <div 
                key={notice.id} 
                className={`flex items-start gap-3 p-3 rounded-xl border-l-4 cursor-pointer hover:shadow-sm transition-smooth ${getPriorityColor(notice.priority)}`}
                onClick={() => {
                  setSelectedNotice(notice);
                  setIsNoticeDialogOpen(true);
                }}
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{notice.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notice.date).toLocaleDateString()} • {notice.type}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {notice.priority}
                </Badge>
              </div>
            ))}
            {notices.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No notices available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="shadow-card-elegant">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Payment History</h2>
            <Badge variant="secondary">{paidBills.length} Payments</Badge>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {paidBills.slice(0, 3).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 rounded-xl bg-success/5 border border-success/20 hover:bg-success/10 transition-smooth">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-success rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{payment.month} {payment.year}</h3>
                    <p className="text-sm text-muted-foreground">
                      Paid on {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : 'N/A'} • {payment.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{payment.amount.toLocaleString()}</p>
                    <p className="text-xs text-success">{payment.receiptNumber}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadReceipt(payment)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Receipt
                  </Button>
                </div>
              </div>
            ))}
            {paidBills.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No payment history available</p>
            )}
          </div>
        </div>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Confirmation</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold">{selectedBill.month} {selectedBill.year}</h3>
                <p className="text-sm text-muted-foreground">Due Date: {new Date(selectedBill.dueDate).toLocaleDateString()}</p>
                <p className="text-2xl font-bold mt-2">₹{selectedBill.amount.toLocaleString()}</p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={processPayment} 
                  className="flex-1 bg-gradient-primary"
                >
                  <PaymentIcon className="w-4 h-4 mr-2" />
                  Pay Now
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsPaymentDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notice Dialog */}
      <Dialog open={isNoticeDialogOpen} onOpenChange={setIsNoticeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedNotice?.title}</DialogTitle>
          </DialogHeader>
          {selectedNotice && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedNotice.type}</Badge>
                <Badge variant={selectedNotice.priority === 'high' ? 'destructive' : selectedNotice.priority === 'medium' ? 'secondary' : 'default'}>
                  {selectedNotice.priority} priority
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(selectedNotice.date).toLocaleDateString()}
              </p>
              <div className="prose prose-sm max-w-none">
                <p>{selectedNotice.content}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleProfileUpdate(new FormData(e.currentTarget));
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" defaultValue={member.name} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" defaultValue={member.email} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" defaultValue={member.phone} required />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Flat Number</Label>
                <Input value={member.flatNumber} disabled />
              </div>
              
              <div className="space-y-2">
                <Label>Monthly Amount</Label>
                <Input value={`₹${member.monthlyAmount}`} disabled />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-gradient-primary">
                <User className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setIsProfileDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};