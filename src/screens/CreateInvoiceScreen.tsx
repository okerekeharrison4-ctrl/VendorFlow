import React, { useState, useEffect } from 'react';
import { useStore } from '../store/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Invoice, InvoiceItem } from '../types';
import { generateId, generateInvoiceNumber, formatCurrency, calculateTotal } from '../utils/helpers';
import { motion } from 'motion/react';
import { Plus, Minus, Trash2, Send, ChevronDown, ChevronUp } from 'lucide-react';

export const CreateInvoiceScreen = () => {
  const { addInvoice, currency, bankDetails, setBankDetails, brandName, setBrandName, templateConfig } = useStore();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [localBrandName, setLocalBrandName] = useState(brandName || '');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: generateId(), name: '', quantity: 1, price: 0 }
  ]);
  
  const [showBankDetails, setShowBankDetails] = useState(!bankDetails);
  const [localBankName, setLocalBankName] = useState(bankDetails?.bankName || '');
  const [localAccountName, setLocalAccountName] = useState(bankDetails?.accountName || '');
  const [localAccountNumber, setLocalAccountNumber] = useState(bankDetails?.accountNumber || '');

  // Update local state if global bank details change
  useEffect(() => {
    if (bankDetails) {
      setLocalBankName(bankDetails.bankName || '');
      setLocalAccountName(bankDetails.accountName || '');
      setLocalAccountNumber(bankDetails.accountNumber || '');
      setShowBankDetails(false);
    }
  }, [bankDetails]);

  const total = calculateTotal(items);
  const isValid = customerName.trim() !== '' && items.some(i => i.name.trim() !== '' && i.price > 0);

  const handleAddItem = () => {
    setItems([...items, { id: generateId(), name: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleSaveAndShare = () => {
    if (!isValid) return;

    const validItems = items.filter(i => i.name.trim() !== '' && i.price > 0);
    
    const currentBankDetails = (localBankName.trim() || localAccountName.trim() || localAccountNumber.trim()) 
      ? {
          bankName: localBankName.trim(),
          accountName: localAccountName.trim(),
          accountNumber: localAccountNumber.trim()
        }
      : undefined;

    // Save brand name globally if it was entered here
    if (localBrandName.trim() && localBrandName.trim() !== brandName) {
      setBrandName(localBrandName.trim());
    }

    // Save bank details globally if they were entered here and not previously set
    if (currentBankDetails && !bankDetails) {
      setBankDetails(currentBankDetails);
    }
    
    const newInvoice: Invoice = {
      id: generateId(),
      invoiceNumber: generateInvoiceNumber(),
      customerName: customerName.trim(),
      items: validItems,
      status: 'unpaid',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      bankDetails: currentBankDetails,
      brandName: localBrandName.trim() || undefined,
      template: templateConfig
    };

    addInvoice(newInvoice);
    navigate(`/preview/${newInvoice.id}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pt-4 pb-40"
    >
      <section className="mb-8">
        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Your Brand Name</label>
        <div className="bg-surface-lowest rounded-[1.5rem] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/5 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
          <input 
            type="text" 
            value={localBrandName}
            onChange={(e) => setLocalBrandName(e.target.value)}
            placeholder="e.g. Acme Corp" 
            className="w-full bg-transparent border-none text-xl font-bold text-on-surface placeholder:text-outline-variant/40 focus:ring-0 p-0 outline-none"
          />
        </div>
      </section>

      <section className="mb-10">
        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Customer Name</label>
        <div className="bg-surface-lowest rounded-[1.5rem] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/5 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
          <input 
            autoFocus
            type="text" 
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Who is this for?" 
            className="w-full bg-transparent border-none text-3xl md:text-4xl font-black tracking-tight text-on-surface placeholder:text-outline-variant/30 focus:ring-0 p-0 outline-none"
          />
        </div>
      </section>

      <section className="space-y-6 mb-10">
        <div className="flex items-center justify-between ml-2">
          <h2 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Items</h2>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-surface-lowest p-5 rounded-[1.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/5 group focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
              <input 
                type="text" 
                value={item.name}
                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                placeholder="Item or service name" 
                className="w-full bg-transparent border-none text-base font-bold text-on-surface focus:ring-0 p-0 mb-4 outline-none placeholder:text-outline-variant/40"
              />
              
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center bg-surface-low rounded-full p-1 border border-outline-variant/5">
                  <button 
                    onClick={() => updateItem(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-on-surface-variant active:scale-90 transition-all bg-surface-lowest rounded-full shadow-sm"
                  >
                    <Minus size={14} strokeWidth={3} />
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => updateItem(item.id, 'quantity', item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-on-surface-variant active:scale-90 transition-all bg-surface-lowest rounded-full shadow-sm"
                  >
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-surface-low px-4 py-2.5 rounded-full flex-1 border border-outline-variant/5">
                  <span className="text-on-surface-variant font-bold text-sm">{currency.symbol}</span>
                  <input 
                    type="number" 
                    value={item.price || ''}
                    onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full bg-transparent border-none p-0 text-sm font-mono font-bold text-on-surface focus:ring-0 text-right outline-none"
                  />
                </div>

                {items.length > 1 && (
                  <button 
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-3 bg-error/10 text-error rounded-full hover:bg-error/20 transition-colors active:scale-95"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleAddItem}
          className="w-full py-4 border-2 border-dashed border-outline-variant/20 rounded-[1.5rem] text-on-surface-variant font-bold text-sm flex items-center justify-center gap-2 hover:bg-surface-low hover:border-outline-variant/40 transition-all active:scale-[0.98]"
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Another Item
        </button>
      </section>

      <section className="mb-6">
        <button 
          onClick={() => setShowBankDetails(!showBankDetails)}
          className="w-full flex items-center justify-between py-4 px-5 bg-surface-lowest rounded-[1.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/5 text-on-surface active:scale-[0.98] transition-all"
        >
          <h2 className="text-sm font-bold tracking-wide">Payment Details</h2>
          <div className={`p-1 rounded-full bg-surface-low transition-transform duration-300 ${showBankDetails ? 'rotate-180' : ''}`}>
            <ChevronDown size={18} strokeWidth={2.5} />
          </div>
        </button>
        
        {showBankDetails && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="bg-surface-lowest p-6 rounded-[1.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/5 space-y-5 overflow-hidden"
          >
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Bank Name</label>
              <input 
                type="text" 
                value={localBankName}
                onChange={(e) => setLocalBankName(e.target.value)}
                placeholder="e.g. Chase Bank" 
                className="w-full bg-surface-low border border-transparent rounded-full text-sm font-bold text-on-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/10 px-5 py-3.5 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Account Name</label>
              <input 
                type="text" 
                value={localAccountName}
                onChange={(e) => setLocalAccountName(e.target.value)}
                placeholder="e.g. John Doe" 
                className="w-full bg-surface-low border border-transparent rounded-full text-sm font-bold text-on-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/10 px-5 py-3.5 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Account Number</label>
              <input 
                type="text" 
                value={localAccountNumber}
                onChange={(e) => setLocalAccountNumber(e.target.value)}
                placeholder="e.g. 0123456789" 
                className="w-full bg-surface-low border border-transparent rounded-full text-sm font-mono font-bold text-on-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/10 px-5 py-3.5 outline-none transition-all"
              />
            </div>
          </motion.div>
        )}
      </section>

      <div className="fixed bottom-0 left-0 w-full bg-surface-lowest/80 backdrop-blur-2xl border-t border-outline-variant/10 p-6 pb-safe shadow-[0_-20px_40px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total</p>
            <p className="text-3xl font-black tracking-tighter text-on-surface">{formatCurrency(total, currency.symbol)}</p>
          </div>
          <button 
            onClick={handleSaveAndShare}
            disabled={!isValid}
            className={`flex-1 py-4 rounded-full font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              isValid ? 'bg-primary text-on-primary shadow-xl shadow-primary/20' : 'bg-surface-low text-outline-variant cursor-not-allowed'
            }`}
          >
            Save & Share
            <Send size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
