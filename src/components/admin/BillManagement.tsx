import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Plus, 
  Search,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Download,
  Send
} from 'lucide-react';
import { getMembers, getBills, generateMonthlyBills, updateBill, type Member, type Bill } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

export const BillManagement = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const { toast } = useToast();

  const [generateForm, setGenerateForm] = useState({
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString()
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setBills(getBills());
    setMembers(getMembers());
  };

  // Get member name by ID
  const getMemberById = (memberId: string): Member | undefined => {
    return members.find(m => m.id === memberId);
  };

  // Filter bills
  const filteredBills = bills.filter(bill => {
    const member = getMemberById(bill.memberId);
    const memberName = member?.name || '';
    const flatNumber = member?.flatNumber || '';
    
    const matchesSearch = memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.month.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    const matchesMonth = monthFilter === 'all' || bill.month === monthFilter;
    
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const handleGenerateBills = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newBills = generateMonthlyBills(generateForm.month, parseInt(generateForm.year));
      
      if (newBills.length > 0) {
        toast({
          title: "Bills Generated",
          description: `${newBills.length} bills have been generated successfully.`,
        });
      } else {
        toast({
          title: "No New Bills",
          description: "Bills for this month have already been generated.",
        });
      }
      
      loadData();
      setIsGenerateDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while generating bills.",
        variant: "destructive",
      });
    }
  };

  const markAsPaid = (billId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const receiptNumber = `RC${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    updateBill(billId, {
      status: 'paid',
      paidDate: today,
      paymentMethod: 'Manual',
      receiptNumber
    });
    
    loadData();
    toast({
      title: "Payment Recorded",
      description: "Bill has been marked as paid successfully.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'pending': return <Clock className="w-4 h-4 text-warning" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-danger" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'overdue': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  // Calculate stats
  const stats = {
    total: filteredBills.length,
    paid: filteredBills.filter(b => b.status === 'paid').length,
    pending: filteredBills.filter(b => b.status === 'pending').length,
    overdue: filteredBills.filter(b => b.status === 'overdue').length,
    totalAmount: filteredBills.reduce((sum, bill) => sum + bill.amount, 0),
    collectedAmount: filteredBills.filter(b => b.status === 'paid').reduce((sum, bill) => sum + bill.amount, 0)
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bill Management</h1>
          <p className="text-muted-foreground">Generate and manage maintenance bills</p>
        </div>
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-primary">
              <Plus className="w-4 h-4 mr-2" />
              Generate Bills
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Monthly Bills</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleGenerateBills} className="space-y-4">
              <div>
                <Label htmlFor="month">Month</Label>
                <Select value={generateForm.month} onValueChange={(value) => setGenerateForm({...generateForm, month: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={month} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={generateForm.year}
                  onChange={(e) => setGenerateForm({...generateForm, year: e.target.value})}
                  min="2020"
                  max="2030"
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-primary">
                  Generate Bills
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Bills</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-success rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-2xl font-bold text-success">{stats.paid}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-warning rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-danger rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-danger">{stats.overdue}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Collection Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Collection Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Billed</span>
              <span className="font-semibold">₹{stats.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Collected</span>
              <span className="font-semibold text-success">₹{stats.collectedAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Outstanding</span>
              <span className="font-semibold text-danger">₹{(stats.totalAmount - stats.collectedAmount).toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between">
                <span className="font-semibold">Collection Rate</span>
                <span className="font-bold text-primary">
                  {stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Send className="w-4 h-4 mr-2" />
              Send Payment Reminders
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Bills Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              View Defaulters List
            </Button>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by member name, flat number, or month..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {months.map(month => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Bills List */}
      <Card>
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Bills List ({filteredBills.length})</h2>
        </div>
        <div className="divide-y divide-border">
          {filteredBills.map((bill) => {
            const member = getMemberById(bill.memberId);
            return (
              <div key={bill.id} className="p-6 hover:bg-muted/50 transition-smooth">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">{member?.name.charAt(0) || '?'}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{member?.name || 'Unknown Member'}</h3>
                        <Badge className={getStatusColor(bill.status)}>
                          {getStatusIcon(bill.status)}
                          <span className="ml-1 capitalize">{bill.status}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Flat {member?.flatNumber}</span>
                        <span>{bill.month} {bill.year}</span>
                        <span>Due: {new Date(bill.dueDate).toLocaleDateString()}</span>
                        {bill.paidDate && <span>Paid: {new Date(bill.paidDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-xl">₹{bill.amount.toLocaleString()}</p>
                      {bill.receiptNumber && (
                        <p className="text-xs text-muted-foreground">{bill.receiptNumber}</p>
                      )}
                    </div>
                    {bill.status === 'pending' && (
                      <Button 
                        size="sm" 
                        className="bg-gradient-success"
                        onClick={() => markAsPaid(bill.id)}
                      >
                        Mark Paid
                      </Button>
                    )}
                    {bill.status === 'paid' && (
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filteredBills.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No bills found</h3>
            <p className="text-muted-foreground">No bills match your current search criteria.</p>
          </div>
        )}
      </Card>
    </div>
  );
};