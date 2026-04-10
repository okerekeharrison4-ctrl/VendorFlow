import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, calculateInvoiceTotal } from '../utils/helpers';
import { motion } from 'motion/react';
import { SwipeableItem } from '../components/SwipeableItem';
import { useGestureGuide } from '../hooks/useGestureGuide';
import { Trash2, CheckCircle } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

type FilterType = 'all' | 'unpaid' | 'paid';

export const DebtListScreen = () => {
  const { invoices, currency, deleteInvoice, markAsPaid } = useStore();
  const navigate = useNavigate();
  const showGuide = useGestureGuide('invoices_swipe');
  const [filter, setFilter] = useState<FilterType>('all');

  const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid');
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id);
    }
  };

  const handleMarkPaid = (id: string) => {
    markAsPaid(id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="px-6 md:px-12 pt-4 md:pt-8 pb-40 md:pb-12"
    >
      <section className="mb-6">
        <h2 className="text-4xl font-black tracking-tighter text-on-surface mb-2">Invoices</h2>
        <p className="text-on-surface-variant text-sm font-medium">Manage your customer receivables.</p>
      </section>

      {invoices.length > 0 && (
        <div className="flex bg-surface-container-low p-1 rounded-full mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all ${filter === 'all' ? 'bg-gradient-to-r from-primary to-primary-heavy text-on-primary shadow-ambient' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all ${filter === 'unpaid' ? 'bg-gradient-to-r from-primary to-primary-heavy text-on-primary shadow-ambient' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Unpaid
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all ${filter === 'paid' ? 'bg-gradient-to-r from-primary to-primary-heavy text-on-primary shadow-ambient' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Paid
          </button>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="text-center py-16 px-6 bg-surface-container-low rounded-3xl ">
          <p className="text-on-surface-variant text-sm font-bold">No invoices yet.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {filter === 'unpaid' && unpaidInvoices.length === 0 && (
            <div className="text-center py-10 text-on-surface-variant">
              <p>No unpaid invoices.</p>
            </div>
          )}
          {filter === 'paid' && paidInvoices.length === 0 && (
            <div className="text-center py-10 text-on-surface-variant">
              <p>No paid invoices.</p>
            </div>
          )}

          {(filter === 'all' || filter === 'unpaid') && unpaidInvoices.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Pending Dues</h3>
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {unpaidInvoices.map((invoice, index) => (
                  <motion.div key={invoice.id} variants={item} layoutId={`invoice-${invoice.id}`}>
                    <SwipeableItem
                      onSwipeLeft={() => handleDelete(invoice.id)}
                      onSwipeRight={() => handleMarkPaid(invoice.id)}
                      rightContent={<><Trash2 size={20} /> Delete</>}
                      leftContent={<><CheckCircle size={20} /> Mark Paid</>}
                      rightBgColor="bg-error"
                      leftBgColor="bg-secondary"
                      showGuide={index === 0 && showGuide}
                    >
                      <div 
                        onClick={() => navigate(`/preview/${invoice.id}`)}
                        className="p-5 bg-surface-container-lowest border border-transparent hover:border-surface-variant/50 rounded-3xl active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between gap-4 group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-surface-container-low to-surface-variant flex items-center justify-center text-primary font-black text-lg shadow-inner shrink-0">
                            {invoice.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold tracking-tight text-on-surface mb-0.5 group-hover:text-primary transition-colors truncate">{invoice.customerName}</h3>
                            <p className="text-on-surface-variant text-[10px] font-mono uppercase tracking-wider truncate">{invoice.invoiceNumber}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end shrink-0">
                          <span className="block text-xl font-mono font-black tracking-tight text-on-surface truncate max-w-full" title={formatCurrency(calculateInvoiceTotal(invoice), currency.symbol)}>
                            {formatCurrency(calculateInvoiceTotal(invoice), currency.symbol)}
                          </span>
                          <motion.span 
                            layout
                            className="inline-block mt-2 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant text-[9px] font-bold uppercase tracking-widest"
                          >
                            Unpaid
                          </motion.span>
                        </div>
                      </div>
                    </SwipeableItem>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {(filter === 'all' || filter === 'paid') && paidInvoices.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-2">Completed</h3>
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {paidInvoices.map(invoice => (
                  <motion.div key={invoice.id} variants={item} layoutId={`invoice-${invoice.id}`}>
                    <SwipeableItem
                      onSwipeLeft={() => handleDelete(invoice.id)}
                      rightContent={<><Trash2 size={20} /> Delete</>}
                      rightBgColor="bg-error"
                    >
                      <div 
                        onClick={() => navigate(`/receipt/${invoice.id}`)}
                        className="p-5 bg-surface-container-lowest border border-transparent hover:border-surface-variant/50 rounded-3xl active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between gap-4 opacity-80 hover:opacity-100 group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary-container to-secondary-container-heavy flex items-center justify-center text-on-secondary-container font-black text-lg shadow-inner shrink-0">
                            {invoice.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold tracking-tight text-on-surface mb-0.5 group-hover:text-primary transition-colors truncate">{invoice.customerName}</h3>
                            <p className="text-on-surface-variant text-[10px] font-mono uppercase tracking-wider truncate">{invoice.invoiceNumber}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end shrink-0">
                          <span className="block text-xl font-mono font-black tracking-tight text-on-surface-variant truncate max-w-full" title={formatCurrency(calculateInvoiceTotal(invoice), currency.symbol)}>
                            {formatCurrency(calculateInvoiceTotal(invoice), currency.symbol)}
                          </span>
                          <motion.span 
                            layout
                            className="inline-block mt-2 px-2.5 py-1 rounded-full bg-gradient-to-r from-secondary-container to-secondary-container-heavy text-on-secondary-container text-[9px] font-bold uppercase tracking-widest"
                          >
                            Paid
                          </motion.span>
                        </div>
                      </div>
                    </SwipeableItem>
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
