import React, { useMemo } from 'react';
import { useStore } from '../store/StoreContext';
import { motion } from 'motion/react';
import { formatCurrency, calculateTotal } from '../utils/helpers';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

export const AnalyticsScreen = () => {
  const { invoices, currency } = useStore();

  const analyticsData = useMemo(() => {
    const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + calculateTotal(inv.items), 0);
    const totalOutstanding = invoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + calculateTotal(inv.items), 0);
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
        acc[month].revenue += calculateTotal(inv.items);
      } else {
        acc[month].outstanding += calculateTotal(inv.items);
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

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-6 pt-4 pb-40"
    >
      <section className="mb-8">
        <h2 className="text-4xl font-black tracking-tighter text-on-surface mb-2">Analytics</h2>
        <p className="text-on-surface-variant text-sm font-medium">Track your business performance.</p>
      </section>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface-lowest rounded-[2rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/5">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">Total Revenue</span>
          <h3 className="text-2xl font-black text-on-surface tracking-tighter">{formatCurrency(analyticsData.totalRevenue, currency.symbol)}</h3>
        </div>
        <div className="bg-surface-lowest rounded-[2rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/5">
          <span className="text-[10px] font-bold text-on-surface uppercase tracking-widest mb-2 block">Outstanding</span>
          <h3 className="text-2xl font-black text-on-surface tracking-tighter">{formatCurrency(analyticsData.totalOutstanding, currency.symbol)}</h3>
        </div>
      </div>

      <div className="bg-surface-lowest rounded-[2rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/5 mb-8">
        <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-6">Revenue Overview</h3>
        <div className="h-64 w-full min-h-[256px] min-w-0">
          {analyticsData.totalRevenue > 0 || analyticsData.totalOutstanding > 0 ? (
            <ResponsiveContainer width="100%" height="100%" aspect={16 / 9}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Paid', value: analyticsData.totalRevenue },
                    { name: 'Outstanding', value: analyticsData.totalOutstanding },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#5c5f5d" />
                  <Cell fill="#006f1d" />
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `${currency.symbol}${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-sm">
              No data available yet.
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface-lowest rounded-[2rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/5">
        <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-6">Invoice Stats</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-on-surface-variant">Total Invoices</span>
            <span className="font-bold">{analyticsData.totalInvoices}</span>
          </div>
          <div className="w-full h-px bg-surface-low"></div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-on-surface-variant">Paid</span>
            <span className="font-bold text-primary">{analyticsData.paidInvoices}</span>
          </div>
          <div className="w-full h-px bg-surface-low"></div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-on-surface-variant">Unpaid</span>
            <span className="font-bold text-error">{analyticsData.unpaidInvoices}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
