
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { Expense } from '@/services/supabaseService';

interface ExpenseAnalyticsProps {
  expenses: Expense[];
}

export const ExpenseAnalytics = ({ expenses }: ExpenseAnalyticsProps) => {
  const analytics = useMemo(() => {
    if (!expenses || expenses.length === 0) return null;

    // Aggregate expense categories
    const categoryTotals: { [key: string]: number } = {};
    const monthlyTotals: { [key: string]: number } = {};

    expenses.forEach(expense => {
      if (!expense.month_name || typeof expense.total_expenses !== 'number') {
        return; // Skip invalid expense data
      }
      
      monthlyTotals[expense.month_name] = expense.total_expenses;
      
      const expenseItems = expense.expense_items || [];
      expenseItems.forEach(item => {
        if (!item.label || typeof item.amount !== 'number') {
          return; // Skip invalid item data
        }
        categoryTotals[item.label] = (categoryTotals[item.label] || 0) + item.amount;
      });
    });

    // Find highest spending categories
    const topCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([label, amount]) => ({ label, amount }));

    // Monthly trend data for chart
    const monthlyData = Object.entries(monthlyTotals)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate average spending
    const avgSpending = expenses.length > 0 
      ? expenses.reduce((sum, exp) => sum + exp.total_expenses, 0) / expenses.length
      : 0;

    // Generate suggestions based on spending patterns
    const suggestions = [];
    
    if (topCategories.length > 0) {
      const highest = topCategories[0];
      suggestions.push(`Wah, kategori "${highest.label}" paling boros nih (Rp ${highest.amount.toLocaleString('id-ID')}) 😅`);
    }

    if (expenses.length >= 2) {
      const recent = expenses[0]?.total_expenses || 0;
      const previous = expenses[1]?.total_expenses || 0;
      const change = ((recent - previous) / previous) * 100;
      
      if (change > 10) {
        suggestions.push(`Aduh! Bulan ini pengeluaran naik ${change.toFixed(1)}% dari bulan lalu 📈`);
      } else if (change < -10) {
        suggestions.push(`Mantap! Pengeluaran turun ${Math.abs(change).toFixed(1)}% dari bulan lalu 👏`);
      }
    }

    if (avgSpending > 0) {
      const currentSpending = expenses[0]?.total_expenses || 0;
      if (currentSpending > avgSpending * 1.2) {
        suggestions.push(`Hati-hati! Bulan ini pengeluaran ${((currentSpending / avgSpending - 1) * 100).toFixed(1)}% lebih boros dari biasanya 🚨`);
      }
    }

    return {
      topCategories,
      monthlyData,
      avgSpending,
      suggestions,
      totalExpenses: Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)
    };
  }, [expenses]);

  if (!analytics || expenses.length === 0) {
    return (
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Analisis Pengeluaran 📊
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Belum ada data pengeluaran buat dianalisis nih 🤔</p>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <div className="space-y-6">
      {/* Suggestions */}
      {analytics.suggestions.length > 0 && (
        <Card className="shadow-medium border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Lightbulb className="h-5 w-5" />
              Tips & Saran Buat Kamu 💡
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories Pie Chart */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Kategori Paling Boros 🍕</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.topCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {analytics.topCategories.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Jumlah']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend Bar Chart */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Tren Pengeluaran Bulanan 📈</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Total Pengeluaran']}
                />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories List */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top 5 Kategori Paling Boros 🏆
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topCategories.map((category, index) => (
              <div key={category.label} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{category.label}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">Rp {category.amount.toLocaleString('id-ID')}</div>
                  <div className="text-sm text-muted-foreground">
                    {((category.amount / analytics.totalExpenses) * 100).toFixed(1)}% dari total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
