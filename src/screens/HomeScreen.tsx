import React from 'react';
import { useStore } from '../store/StoreContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, calculateTotal } from '../utils/helpers';
import { motion } from 'motion/react';
import { FileText } from 'lucide-react';

export const HomeScreen = () => {
  const { invoices, currency } = useStore();
  const navigate = useNavigate();

  const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid');
  const totalOwed = unpaidInvoices.reduce((sum, inv) => sum + calculateTotal(inv.items), 0);
  
  const recentInvoices = invoices.slice(0, 3);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="px-6 pt-4 pb-32 max-w-5xl mx-auto w-full"
    >
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#141414] text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[200px]">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-secondary-container/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 w-full">
            <span className="text-white/60 font-bold tracking-widest text-[10px] uppercase mb-2 block">Amount owed to you</span>
            <h2 
              className="text-4xl sm:text-5xl md:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tighter text-white break-all line-clamp-2"
              title={formatCurrency(totalOwed, currency.symbol)}
            >
              {formatCurrency(totalOwed, currency.symbol)}
            </h2>
          </div>
          <div className="relative z-10 mt-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full w-fit">
            <div className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></div>
            <p className="text-white/80 text-xs font-medium">
              <span className="font-bold text-white">{unpaidInvoices.length}</span> active invoices
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-lowest p-6 rounded-[2rem] shadow-[0_8px_20px_rgba(0,0,0,0.02)] border border-outline-variant/5 flex flex-col justify-between">
            <span className="text-on-surface-variant font-bold tracking-widest text-[10px] uppercase">Paid</span>
            <h3 className="text-3xl font-black tracking-tighter text-on-surface mt-4">
              {invoices.filter(i => i.status === 'paid').length}
            </h3>
          </div>
          <div className="bg-secondary-container/30 p-6 rounded-[2rem] border border-secondary/10 flex flex-col justify-between">
            <span className="text-secondary font-bold tracking-widest text-[10px] uppercase">Total</span>
            <h3 className="text-3xl font-black tracking-tighter text-on-secondary-container mt-4">
              {invoices.length}
            </h3>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between px-2">
          <h3 className="text-lg font-extrabold tracking-tight text-on-surface">Recent Activity</h3>
          {invoices.length > 3 && (
            <button onClick={() => navigate('/debts')} className="text-on-surface-variant font-bold text-sm uppercase tracking-widest hover:text-primary transition-colors p-2 -mr-2">
              View all
            </button>
          )}
        </div>

        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 bg-surface-low/50 rounded-[2rem] border border-dashed border-outline-variant/20">
            <div className="w-16 h-16 bg-surface-lowest rounded-full flex items-center justify-center mb-4 shadow-sm">
              <FileText className="text-outline-variant" size={24} />
            </div>
            <h4 className="text-base font-bold text-on-surface mb-2">No invoices yet</h4>
            <p className="text-on-surface-variant text-xs text-center max-w-[200px] mb-6">
              Create your first invoice to get paid faster.
            </p>
            <button 
              onClick={() => navigate('/create')}
              className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-all text-sm"
            >
              Create Invoice
            </button>
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
