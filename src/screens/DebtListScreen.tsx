import React from 'react';
import { useStore } from '../store/StoreContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, calculateTotal } from '../utils/helpers';
import { motion } from 'motion/react';

export const DebtListScreen = () => {
  const { invoices, currency } = useStore();
  const navigate = useNavigate();

  const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid');
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="pt-4 pb-40"
    >
      <section className="mb-10">
        <h2 className="text-4xl font-black tracking-tighter text-on-surface mb-2">Invoices</h2>
        <p className="text-on-surface-variant text-sm font-medium">Manage your customer receivables.</p>
      </section>

      {invoices.length === 0 ? (
        <div className="text-center py-16 px-6 bg-surface-low/50 rounded-[2rem] border border-dashed border-outline-variant/20">
          <p className="text-on-surface-variant text-sm font-bold">No invoices yet.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {unpaidInvoices.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Pending Dues</h3>
              <div className="space-y-3">
                {unpaidInvoices.map(invoice => (
                  <div 
                    key={invoice.id}
                    onClick={() => navigate(`/preview/${invoice.id}`)}
                    className="bg-surface-lowest p-5 rounded-[1.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/5 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between group hover:border-outline-variant/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-surface-low flex items-center justify-center text-primary font-black text-lg shadow-inner">
                        {invoice.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold tracking-tight text-on-surface mb-0.5">{invoice.customerName}</h3>
                        <p className="text-on-surface-variant text-[10px] font-mono uppercase tracking-wider">{invoice.invoiceNumber}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="block text-xl font-black tracking-tight text-on-surface">
                        {formatCurrency(calculateTotal(invoice.items), currency.symbol)}
                      </span>
                      <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-surface-low text-on-surface-variant text-[9px] font-bold uppercase tracking-widest">
                        Unpaid
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {paidInvoices.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Completed</h3>
              <div className="space-y-3">
                {paidInvoices.map(invoice => (
                  <div 
                    key={invoice.id}
                    onClick={() => navigate(`/receipt/${invoice.id}`)}
                    className="bg-surface-low/30 p-5 rounded-[1.5rem] border border-transparent active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between opacity-80 hover:opacity-100 hover:bg-surface-low/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary-container/50 flex items-center justify-center text-secondary font-black text-lg shadow-inner">
                        {invoice.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold tracking-tight text-on-surface mb-0.5">{invoice.customerName}</h3>
                        <p className="text-on-surface-variant text-[10px] font-mono uppercase tracking-wider">{invoice.invoiceNumber}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="block text-xl font-black tracking-tight text-on-surface-variant">
                        {formatCurrency(calculateTotal(invoice.items), currency.symbol)}
                      </span>
                      <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-secondary-container/50 text-secondary text-[9px] font-bold uppercase tracking-widest">
                        Paid
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
