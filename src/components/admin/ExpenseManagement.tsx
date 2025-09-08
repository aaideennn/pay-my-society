import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Receipt, 
  Plus, 
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building,
  Zap,
  Shield,
  Droplets,
  Wrench,
  Truck,
  Users2
} from 'lucide-react';
import { getExpenses, addExpense, type Expense } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const expenseCategories = [
  { value: 'electricity', label: 'Electricity', icon: Zap, color: 'bg-yellow-500' },
  { value: 'security', label: 'Security', icon: Shield, color: 'bg-blue-500' },
  { value: 'water', label: 'Water', icon: Droplets, color: 'bg-cyan-500' },
  { value: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'bg-orange-500' },
  { value: 'cleaning', label: 'Cleaning', icon: Building, color: 'bg-green-500' },
  { value: 'garbage', label: 'Garbage Collection', icon: Truck, color: 'bg-gray-500' },
  { value: 'staff', label: 'Staff Salary', icon: Users2, color: 'bg-purple-500' },
  { value: 'other', label: 'Other', icon: Receipt, color: 'bg-gray-400' }
];

export const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    vendor: ''
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    setExpenses(getExpenses());
  };

  const resetForm = () => {
    setFormData({
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      vendor: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      addExpense({
        ...formData,
        amount: parseFloat(formData.amount),
        approvedBy: 'Admin'
      });
      
      toast({
        title: "Expense Added",
        description: "Expense has been recorded successfully.",
      });
      
      loadExpenses();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while adding the expense.",
        variant: "destructive",
      });
    }
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || expense.category.toLowerCase() === categoryFilter;
    
    const expenseMonth = new Date(expense.date).toLocaleString('default', { month: 'long' });
    const matchesMonth = monthFilter === 'all' || expenseMonth === monthFilter;
    
    return matchesSearch && matchesCategory && matchesMonth;
  });

  // Calculate stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const lastMonthExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear;
  });

  const stats = {
    total: filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    currentMonth: currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    lastMonth: lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    count: filteredExpenses.length
  };

  const monthlyChange = stats.lastMonth > 0 
    ? ((stats.currentMonth - stats.lastMonth) / stats.lastMonth) * 100 
    : 0;

  // Category-wise breakdown
  const categoryBreakdown = expenseCategories.map(category => {
    const categoryExpenses = filteredExpenses.filter(e => 
      e.category.toLowerCase() === category.value
    );
    return {
      ...category,
      amount: categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      count: categoryExpenses.length
    };
  }).filter(category => category.amount > 0);

  const getCategoryIcon = (category: string) => {
    const found = expenseCategories.find(cat => cat.value === category.toLowerCase());
    return found ? found.icon : Receipt;
  };

  const getCategoryColor = (category: string) => {
    const found = expenseCategories.find(cat => cat.value === category.toLowerCase());
    return found ? found.color : 'bg-gray-400';
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expense Management</h1>
          <p className="text-muted-foreground">Track and manage society expenses</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-primary" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter expense description"
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="vendor">Vendor/Payee</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                  placeholder="Enter vendor name"
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-primary">
                  Add Expense
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
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
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">₹{stats.total.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-warning rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">₹{stats.currentMonth.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${monthlyChange >= 0 ? 'bg-gradient-danger' : 'bg-gradient-success'} rounded-xl flex items-center justify-center`}>
              {monthlyChange >= 0 ? (
                <TrendingUp className="w-5 h-5 text-white" />
              ) : (
                <TrendingDown className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Change</p>
              <p className={`text-2xl font-bold ${monthlyChange >= 0 ? 'text-danger' : 'text-success'}`}>
                {monthlyChange >= 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-secondary rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Per Expense</p>
              <p className="text-2xl font-bold">
                ₹{stats.count > 0 ? Math.round(stats.total / stats.count).toLocaleString() : '0'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryBreakdown.map((category) => {
            const IconComponent = category.icon;
            return (
              <div key={category.value} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className={`w-10 h-10 ${category.color} rounded-xl flex items-center justify-center`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">{category.label}</p>
                  <p className="text-lg font-bold">₹{category.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{category.count} expenses</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by description, vendor, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {expenseCategories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
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

      {/* Expenses List */}
      <Card>
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Expenses List ({filteredExpenses.length})</h2>
        </div>
        <div className="divide-y divide-border">
          {filteredExpenses.map((expense) => {
            const IconComponent = getCategoryIcon(expense.category);
            return (
              <div key={expense.id} className="p-6 hover:bg-muted/50 transition-smooth">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${getCategoryColor(expense.category)} rounded-xl flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{expense.description}</h3>
                        <Badge variant="outline" className="capitalize">
                          {expense.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{expense.vendor}</span>
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                        <span>Approved by {expense.approvedBy}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-danger">-₹{expense.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{expense.category}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filteredExpenses.length === 0 && (
          <div className="p-12 text-center">
            <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No expenses found</h3>
            <p className="text-muted-foreground">No expenses match your current search criteria.</p>
          </div>
        )}
      </Card>
    </div>
  );
};