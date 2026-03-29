import React from 'react';
import { useStore } from '../store/StoreContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, calculateTotal } from '../utils/helpers';
import { motion } from 'motion/react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

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
      className="px-6 md:px-12 pt-4 md:pt-8 pb-40 md:pb-12"
    >
      <section className="mb-10">
        <h2 className="text-4xl font-black tracking-tighter text-on-surface mb-2">Invoices</h2>
        <p className="text-on-surface-variant text-sm font-medium">Manage your customer receivables.</p>
      </section>

      {invoices.length === 0 ? (
        <div className="text-center py-16 px-6 bg-surface-container-low rounded-3xl ">
          <p className="text-on-surface-variant text-sm font-bold">No invoices yet.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {unpaidInvoices.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Pending Dues</h3>
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {unpaidInvoices.map(invoice => (
                  <motion.div 
                    key={invoice.id}
                    variants={item}
                    layoutId={`invoice-${invoice.id}`}
                    onClick={() => navigate(`/preview/${invoice.id}`)}
                    className="bg-surface-container-lowest p-5 rounded-3xl shadow-ambient active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-primary font-black text-lg shadow-inner">
                        {invoice.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold tracking-tight text-on-surface mb-0.5">{invoice.customerName}</h3>
                        <p className="text-on-surface-variant text-[10px] font-mono uppercase tracking-wider">{invoice.invoiceNumber}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="block text-xl font-mono font-black tracking-tight text-on-surface">
                        {formatCurrency(calculateTotal(invoice.items), currency.symbol)}
                      </span>
                      <motion.span 
                        layout
                        className="inline-block mt-2 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant text-[9px] font-bold uppercase tracking-widest"
                      >
                        Unpaid
                      </motion.span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {paidInvoices.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Completed</h3>
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {paidInvoices.map(invoice => (
                  <motion.div 
                    key={invoice.id}
                    variants={item}
                    layoutId={`invoice-${invoice.id}`}
                    onClick={() => navigate(`/receipt/${invoice.id}`)}
                    className="bg-surface-container-low p-5 rounded-3xl  active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between opacity-80 hover:opacity-100 hover:bg-surface-container-low"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-black text-lg shadow-inner">
                        {invoice.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold tracking-tight text-on-surface mb-0.5">{invoice.customerName}</h3>
                        <p className="text-on-surface-variant text-[10px] font-mono uppercase tracking-wider">{invoice.invoiceNumber}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="block text-xl font-mono font-black tracking-tight text-on-surface-variant">
                        {formatCurrency(calculateTotal(invoice.items), currency.symbol)}
                      </span>
                      <motion.span 
                        layout
                        className="inline-block mt-2 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[9px] font-bold uppercase tracking-widest"
                      >
                        Paid
                      </motion.span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
