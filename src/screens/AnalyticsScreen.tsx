import React, { useMemo } from 'react';
import { useStore } from '../store/StoreContext';
import { motion } from 'motion/react';
import { formatCurrency, calculateInvoiceTotal, calculateTotal } from '../utils/helpers';
import { calculateCashFlowForecast } from '../utils/forecasting';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export const AnalyticsScreen = () => {
  const { invoices, currency, isPremium } = useStore();
  const forecast = useMemo(() => calculateCashFlowForecast(invoices), [invoices]);

  const forecastChartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    forecast.forEach(item => {
      const date = new Date(item.projectedPaymentDate);
      const monthYear = date.toLocaleDateString('default', { month: 'short', year: 'numeric' });
      grouped[monthYear] = (grouped[monthYear] || 0) + item.amount;
    });
    
    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [forecast]);

  if (!isPremium) {
    return (
      <div className="px-6 md:px-12 pt-4 md:pt-8 pb-40 md:pb-12 text-center">
        <h2 className="text-4xl font-black tracking-tighter text-on-surface mb-2">Analytics</h2>
        <p className="text-on-surface-variant text-sm font-medium mb-8">Upgrade to Premium to access advanced analytics and reports.</p>
      </div>
    );
  }

  const analyticsData = useMemo(() => {
    // ... (existing analyticsData calculation)
    const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + calculateInvoiceTotal(inv), 0);
    const totalOutstanding = invoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + calculateInvoiceTotal(inv), 0);
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid').length;

    // Group by month for chart
    const monthlyData = invoices.reduce((acc: any, inv) => {
      const date = new Date(inv.createdAt);
      const month = date.toLocaleString('default', { month: 'short' });
      
      if (!acc[month]) {
        acc[month] = { name: month, revenue: 0, outstanding: 0 };
      }
      
      if (inv.status === 'paid') {
        acc[month].revenue += calculateInvoiceTotal(inv);
      } else {
        acc[month].outstanding += calculateInvoiceTotal(inv);
      }
      
      return acc;
    }, {});

    // Sort months chronologically
    const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = Object.values(monthlyData).sort((a: any, b: any) => {
      return monthsOrder.indexOf(a.name) - monthsOrder.indexOf(b.name);
    });

    return {
      totalRevenue,
      totalOutstanding,
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      chartData
    };
  }, [invoices]);

  const handleDownloadReport = (type: 'pdf' | 'csv') => {
    if (type === 'csv') {
      const headers = ['Date', 'Invoice Number', 'Client Name', 'Client Tax ID', 'Subtotal', 'Tax Rate', 'Tax Amount', 'Tax Type', 'Total'];
      const rows = invoices.map(inv => {
        const date = new Date(inv.createdAt).toLocaleDateString();
        const subtotal = inv.subtotal || calculateTotal(inv.items);
        const taxRate = inv.taxRate || 0;
        const taxAmount = inv.taxAmount || 0;
        const total = calculateInvoiceTotal(inv);
        const taxType = inv.taxInclusive ? 'Inclusive' : 'Exclusive';
        return [
          date,
          inv.invoiceNumber,
          `"${inv.customerName}"`,
          inv.clientTaxId || '',
          subtotal.toFixed(2),
          `${taxRate}%`,
          taxAmount.toFixed(2),
          taxType,
          total.toFixed(2)
        ].join(',');
      });
      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tax_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Downloading ${type.toUpperCase()} report...`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-6 md:px-12 pt-4 md:pt-8 pb-40 md:pb-12"
    >
      <section className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-on-surface mb-2">Analytics</h2>
          <p className="text-on-surface-variant text-sm font-medium">Track your business performance.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0">
          <button onClick={() => handleDownloadReport('csv')} className="flex-1 md:flex-none bg-gradient-to-r from-surface-container-low to-surface-container-high text-on-surface px-4 py-3 md:py-2 rounded-full text-sm font-bold whitespace-nowrap active:scale-95 transition-transform hover:shadow-ambient">Download Tax Report (CSV)</button>
        </div>
      </section>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-ambient min-w-0">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block truncate">Total Revenue</span>
          <h3 className="text-2xl font-mono font-black text-on-surface tracking-tighter break-all line-clamp-2" title={formatCurrency(analyticsData.totalRevenue, currency.symbol)}>
            {formatCurrency(analyticsData.totalRevenue, currency.symbol)}
          </h3>
        </div>
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-ambient min-w-0">
          <span className="text-[10px] font-bold text-on-surface uppercase tracking-widest mb-2 block truncate">Outstanding</span>
          <h3 className="text-2xl font-mono font-black text-on-surface tracking-tighter break-all line-clamp-2" title={formatCurrency(analyticsData.totalOutstanding, currency.symbol)}>
            {formatCurrency(analyticsData.totalOutstanding, currency.symbol)}
          </h3>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-ambient mb-8">
        <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-6">Cash Flow Forecast</h3>
        
        {forecastChartData.length > 0 && (
          <div className="h-64 w-full min-h-[256px] min-w-0 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastChartData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-surface-container-high)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }}
                  tickFormatter={(value) => `${currency.symbol}${value}`}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--color-surface-container)' }}
                  formatter={(value: number) => [`${currency.symbol}${value.toLocaleString()}`, 'Expected']}
                  contentStyle={{ 
                    borderRadius: '1rem', 
                    border: 'none', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    backgroundColor: 'var(--color-surface-container-lowest)',
                    color: 'var(--color-on-surface)',
                    padding: '12px 16px'
                  }}
                />
                <Bar dataKey="amount" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {forecast.length > 0 ? (
          <div className="space-y-4">
            {forecast.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-on-surface">{item.customerName}</p>
                  <p className="text-[10px] font-mono text-on-surface-variant">{new Date(item.projectedPaymentDate).toLocaleDateString()}</p>
                </div>
                <span className="font-mono font-bold text-on-surface">{formatCurrency(item.amount, currency.symbol)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-on-surface-variant text-sm">No upcoming payments predicted.</p>
        )}
      </div>

      <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-ambient mb-8">
        <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-6">Revenue Overview</h3>
        <div className="h-64 w-full min-h-[256px] min-w-0 flex items-center justify-center">
          {analyticsData.totalRevenue > 0 || analyticsData.totalOutstanding > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={[
                    { name: 'Paid', value: analyticsData.totalRevenue },
                    { name: 'Outstanding', value: analyticsData.totalOutstanding },
                  ]}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="var(--color-primary)" />
                  <Cell fill="var(--color-secondary)" />
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `${currency.symbol}${value.toLocaleString()}`}
                  contentStyle={{ 
                    borderRadius: '1rem', 
                    border: 'none', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    backgroundColor: 'var(--color-surface-container-lowest)',
                    color: 'var(--color-on-surface)',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ color: 'var(--color-on-surface)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value) => <span className="text-on-surface">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-sm">
              No data available yet.
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-ambient">
        <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-6">Invoice Stats</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-on-surface-variant">Total Invoices</span>
            <span className="font-bold">{analyticsData.totalInvoices}</span>
          </div>
          <div className="w-full h-px bg-surface-container-low"></div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-on-surface-variant">Paid</span>
            <span className="font-bold text-primary">{analyticsData.paidInvoices}</span>
          </div>
          <div className="w-full h-px bg-surface-container-low"></div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-on-surface-variant">Unpaid</span>
            <span className="font-bold text-error">{analyticsData.unpaidInvoices}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
