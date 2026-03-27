import React from 'react';
import { useStore } from '../store/StoreContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, calculateTotal } from '../utils/helpers';
import { motion } from 'motion/react';
import { FileText, Plus, TrendingUp, AlertCircle } from 'lucide-react';

export const HomeScreen = () => {
  const { invoices, currency } = useStore();
  const navigate = useNavigate();

  const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid');
  const totalOwed = unpaidInvoices.reduce((sum, inv) => sum + calculateTotal(inv.items), 0);
  
  const recentInvoices = invoices.slice(0, 5);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="pt-4 pb-32"
    >
      <section className="mb-8">
        <h2 className="text-4xl font-black tracking-tighter text-on-surface mb-2">Dashboard</h2>
        <p className="text-on-surface-variant text-sm font-medium">Welcome back to your business overview.</p>
      </section>

      <section className="flex flex-col gap-4 mb-8">
        <div className="bg-secondary-container/20 p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-secondary/10 flex flex-col justify-between min-h-[180px]">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-secondary" size={16} />
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Amount Owed</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-on-secondary-container break-all line-clamp-2">
            {formatCurrency(totalOwed, currency.symbol)}
          </h2>
          <p className="text-on-secondary-container/70 text-xs mt-2">{unpaidInvoices.length} active invoices</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary-container/20 p-6 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-primary/10 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-primary" size={16} />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Paid</span>
            </div>
            <h3 className="text-3xl font-black tracking-tighter text-on-primary-container">
              {invoices.filter(i => i.status === 'paid').length}
            </h3>
          </div>
          <div className="bg-surface-lowest p-6 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Total</span>
            <h3 className="text-3xl font-black tracking-tighter text-on-surface">
              {invoices.length}
            </h3>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between px-2">
          <h3 className="text-lg font-extrabold tracking-tight text-on-surface">Recent Activity</h3>
          <button 
            onClick={() => navigate('/create')}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-full font-bold shadow-lg active:scale-95 transition-all text-sm"
          >
            <Plus size={16} />
            New
          </button>
        </div>

        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 bg-surface-lowest rounded-[2rem] border border-dashed border-outline-variant/20">
            <div className="w-16 h-16 bg-surface-low rounded-full flex items-center justify-center mb-4 shadow-sm">
              <FileText className="text-outline-variant" size={24} />
            </div>
            <h4 className="text-base font-bold text-on-surface mb-2">No invoices yet</h4>
            <p className="text-on-surface-variant text-xs text-center max-w-[200px] mb-6">
              Create your first invoice to get paid faster.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentInvoices.map(invoice => (
              <div 
                key={invoice.id}
                onClick={() => navigate(`/${invoice.status === 'paid' ? 'receipt' : 'preview'}/${invoice.id}`)}
                className="bg-surface-lowest p-5 rounded-[1.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/5 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between group hover:border-outline-variant/20"
              >
                <div>
                  <h4 className="font-bold text-on-surface text-sm mb-1">{invoice.customerName}</h4>
                  <p className="text-on-surface-variant text-[10px] font-mono uppercase tracking-wider">{invoice.invoiceNumber}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="font-black text-on-surface text-base tracking-tight">
                    {formatCurrency(calculateTotal(invoice.items), currency.symbol)}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mt-2 ${
                    invoice.status === 'paid' 
                      ? 'bg-secondary-container/50 text-secondary' 
                      : 'bg-surface-low text-on-surface-variant'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
};
