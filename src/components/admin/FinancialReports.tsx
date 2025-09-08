import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  FileText
} from 'lucide-react';
import { getMembers, getBills, getExpenses, getSocietyStats } from '@/lib/mockData';
import { FinanceChart } from '../FinanceChart';

export const FinancialReports = () => {
  const [reportType, setReportType] = useState('overview');
  const [timePeriod, setTimePeriod] = useState('current-year');
  
  const stats = getSocietyStats();
  const members = getMembers();
  const bills = getBills();
  const expenses = getExpenses();

  // Calculate yearly data
  const currentYear = new Date().getFullYear();
  const yearlyIncome = bills
    .filter(b => b.year === currentYear && b.status === 'paid')
    .reduce((sum, bill) => sum + bill.amount, 0);
  
  const yearlyExpenses = expenses
    .filter(e => new Date(e.date).getFullYear() === currentYear)
    .reduce((sum, exp) => sum + exp.amount, 0);

  // Monthly breakdown for charts
  const monthlyData = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    
    const monthlyIncome = bills
      .filter(b => {
        const billDate = new Date(`${b.month} 1, ${b.year}`);
        return billDate.getFullYear() === currentYear && 
               billDate.getMonth() + 1 === month && 
               b.status === 'paid';
      })
      .reduce((sum, bill) => sum + bill.amount, 0);

    const monthlyExpense = expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getFullYear() === currentYear && 
               expenseDate.getMonth() + 1 === month;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);

    return {
      month: new Date(currentYear, index, 1).toLocaleString('default', { month: 'short' }),
      income: monthlyIncome,
      expenses: monthlyExpense,
      profit: monthlyIncome - monthlyExpense
    };
  });

  // Category-wise expense breakdown
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const category = expense.category;
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const topExpenseCategories = Object.entries(expensesByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Payment status breakdown
  const paymentStatus = {
    paid: bills.filter(b => b.status === 'paid').length,
    pending: bills.filter(b => b.status === 'pending').length,
    overdue: bills.filter(b => b.status === 'overdue').length
  };

  const collectionEfficiency = paymentStatus.paid / (paymentStatus.paid + paymentStatus.pending + paymentStatus.overdue) * 100;

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-success rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Income (YTD)</p>
              <p className="text-2xl font-bold text-success">₹{yearlyIncome.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-danger rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses (YTD)</p>
              <p className="text-2xl font-bold text-danger">₹{yearlyExpenses.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Profit (YTD)</p>
              <p className={`text-2xl font-bold ${yearlyIncome - yearlyExpenses >= 0 ? 'text-success' : 'text-danger'}`}>
                ₹{(yearlyIncome - yearlyExpenses).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-warning rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Collection Rate</p>
              <p className="text-2xl font-bold text-warning">{stats.collectionRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Income vs Expenses</h3>
          <FinanceChart />
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Status Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
              <span className="text-success font-medium">Paid Bills</span>
              <span className="font-bold">{paymentStatus.paid}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
              <span className="text-warning font-medium">Pending Bills</span>
              <span className="font-bold">{paymentStatus.pending}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-danger/10">
              <span className="text-danger font-medium">Overdue Bills</span>
              <span className="font-bold">{paymentStatus.overdue}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Collection Efficiency</span>
                <span className="text-lg font-bold text-primary">{collectionEfficiency.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderExpenseAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Expense Categories</h3>
          <div className="space-y-3">
            {topExpenseCategories.map(([category, amount], index) => (
              <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium capitalize">{category}</span>
                </div>
                <span className="font-bold">₹{amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Expense Trend</h3>
          <div className="space-y-3">
            {monthlyData.slice(-6).map((data, index) => (
              <div key={data.month} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="font-medium">{data.month}</span>
                <span className="font-bold text-danger">₹{data.expenses.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderIncomeAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Collection Trend</h3>
          <div className="space-y-3">
            {monthlyData.slice(-6).map((data) => (
              <div key={data.month} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="font-medium">{data.month}</span>
                <span className="font-bold text-success">₹{data.income.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Collection Analytics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-success/10">
              <span className="text-success">Average Monthly Collection</span>
              <span className="font-bold">₹{Math.round(yearlyIncome / 12).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
              <span className="text-primary">Target Monthly Collection</span>
              <span className="font-bold">₹{stats.monthlyTarget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-warning/10">
              <span className="text-warning">Achievement Rate</span>
              <span className="font-bold">{((yearlyIncome / 12) / stats.monthlyTarget * 100).toFixed(1)}%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (reportType) {
      case 'overview':
        return renderOverview();
      case 'expenses':
        return renderExpenseAnalysis();
      case 'income':
        return renderIncomeAnalysis();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">Comprehensive financial analysis and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Generate PDF
          </Button>
        </div>
      </div>

      {/* Report Controls */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Financial Overview
                  </div>
                </SelectItem>
                <SelectItem value="income">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Income Analysis
                  </div>
                </SelectItem>
                <SelectItem value="expenses">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Expense Analysis
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Time Period</label>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-year">Current Year</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Report Content */}
      {renderContent()}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-success text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Highest Monthly Income</p>
              <p className="text-2xl font-bold">₹{Math.max(...monthlyData.map(d => d.income)).toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-white/80" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-danger text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Highest Monthly Expense</p>
              <p className="text-2xl font-bold">₹{Math.max(...monthlyData.map(d => d.expenses)).toLocaleString()}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-white/80" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-primary text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Best Monthly Profit</p>
              <p className="text-2xl font-bold">₹{Math.max(...monthlyData.map(d => d.profit)).toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-white/80" />
          </div>
        </Card>
      </div>
    </div>
  );
};