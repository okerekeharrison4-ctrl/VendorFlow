import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { CURRENCIES, TemplateConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Save, Palette, LayoutTemplate, Download, Upload, ChevronRight, X } from 'lucide-react';

export const SettingsScreen = () => {
  const { currency, setCurrency, bankDetails, setBankDetails, brandName, setBrandName, templateConfig, setTemplateConfig, invoices, clients, catalog, theme, toggleTheme, isPremium, setIsPremium, logoUrl, setLogoUrl } = useStore();

  const [localBrandName, setLocalBrandName] = useState(brandName);
  const [bankName, setBankName] = useState(bankDetails?.bankName || '');
  const [accountName, setAccountName] = useState(bankDetails?.accountName || '');
  const [accountNumber, setAccountNumber] = useState(bankDetails?.accountNumber || '');
  const [localTemplateConfig, setLocalTemplateConfig] = useState<TemplateConfig>(templateConfig || { color: '#141414', style: 'modern' });
  const [isSaved, setIsSaved] = useState(false);
  const [activeModal, setActiveModal] = useState<'business' | 'template' | 'payment' | null>(null);

  const colors = ['#141414', '#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c'];
  const styles: Array<'modern' | 'classic' | 'minimal' | 'bold' | 'elegant' | 'corporate'> = ['modern', 'classic', 'minimal', 'bold', 'elegant', 'corporate'];

  const handleSaveDetails = () => {
    setBrandName(localBrandName.trim());
    setTemplateConfig(localTemplateConfig);
    
    if (bankName.trim() || accountName.trim() || accountNumber.trim()) {
      setBankDetails({ 
        bankName: bankName.trim(), 
        accountName: accountName.trim(), 
        accountNumber: accountNumber.trim() 
      });
    } else {
      setBankDetails(null);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const getStyleName = (style: string) => {
    if (['bold', 'elegant', 'corporate'].includes(style) && !isPremium) return `${style} (Premium)`;
    return style;
  };

  const handleExport = () => {
    const data = {
      invoices,
      clients,
      catalog,
      currency,
      bankDetails,
      brandName,
      templateConfig
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendorflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.invoices) localStorage.setItem('vendorflow_invoices', JSON.stringify(data.invoices));
        if (data.clients) localStorage.setItem('vendorflow_clients', JSON.stringify(data.clients));
        if (data.catalog) localStorage.setItem('vendorflow_catalog', JSON.stringify(data.catalog));
        if (data.currency) localStorage.setItem('vendorflow_currency', JSON.stringify(data.currency));
        if (data.bankDetails) localStorage.setItem('vendorflow_bank_details', JSON.stringify(data.bankDetails));
        if (data.brandName) localStorage.setItem('vendorflow_brand_name', data.brandName);
        if (data.templateConfig) localStorage.setItem('vendorflow_template', JSON.stringify(data.templateConfig));
        
        window.location.reload();
        alert('Data successfully imported!');
      } catch (err) {
        alert('Failed to import data. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-6 md:px-12 pt-4 md:pt-8 pb-40 md:pb-12"
    >
      <section className="mb-10">
        <h2 className="text-4xl font-black tracking-tighter text-on-surface mb-2">Settings</h2>
        <p className="text-on-surface-variant text-sm font-medium">Configure your app preferences.</p>
      </section>

      <section className="mb-10">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4 ml-2">Premium</h3>
        <div className="bg-surface-container-lowest rounded-3xl shadow-ambient p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-bold text-on-surface text-sm">Premium Mode</p>
            <button 
              onClick={() => setIsPremium(!isPremium)}
              className={`w-12 h-6 rounded-full transition-colors ${isPremium ? 'bg-primary' : 'bg-surface-container-low'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isPremium ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          {isPremium && (
            <div className="space-y-2">
              <p className="font-bold text-on-surface text-sm">Logo URL</p>
              <input 
                type="text" 
                value={logoUrl || ''}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full bg-surface-container-low p-3 rounded-xl text-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          )}
        </div>
      </section>

      <section className="mb-10">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4 ml-2">Appearance</h3>
        <div 
          onClick={toggleTheme}
          className="bg-surface-container-lowest rounded-3xl shadow-ambient p-6 cursor-pointer hover:bg-surface-container-low transition-colors flex items-center justify-between"
        >
          <div>
            <p className="font-bold text-on-surface text-sm">Dark Mode</p>
            <p className="text-[10px] text-on-surface-variant mt-1 font-medium">Switch between light and dark themes.</p>
          </div>
          <div
            className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${theme === 'dark' ? 'bg-primary' : 'bg-surface-container-low'}`}
          >
            <motion.div
              animate={{ x: theme === 'dark' ? 24 : 0 }}
              className="w-6 h-6 rounded-full bg-white shadow-ambient"
            />
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4 ml-2">Invoice Configuration</h3>
        <div className="bg-surface-container-lowest rounded-3xl shadow-ambient overflow-hidden">
          
          {/* Business Profile */}
          <button 
            onClick={() => setActiveModal('business')}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-container-low/50 transition-colors border-b border-surface-container-low"
          >
            <div>
              <span className="font-bold text-sm text-on-surface block">Business Profile</span>
              <span className="text-xs text-on-surface-variant mt-1">{localBrandName || 'Not set'}</span>
            </div>
            <ChevronRight size={18} className="text-on-surface-variant" />
          </button>

          {/* Template Customization */}
          <button 
            onClick={() => setActiveModal('template')}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-container-low/50 transition-colors border-b border-surface-container-low"
          >
            <div>
              <span className="font-bold text-sm text-on-surface block">Template Customization</span>
              <span className="text-xs text-on-surface-variant mt-1 capitalize">{localTemplateConfig.style} • {localTemplateConfig.color}</span>
            </div>
            <ChevronRight size={18} className="text-on-surface-variant" />
          </button>

          {/* Payment Details */}
          <button 
            onClick={() => setActiveModal('payment')}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-container-low/50 transition-colors"
          >
            <div>
              <span className="font-bold text-sm text-on-surface block">Payment Details</span>
              <span className="text-xs text-on-surface-variant mt-1">{bankName || 'Not set'}</span>
            </div>
            <ChevronRight size={18} className="text-on-surface-variant" />
          </button>
        </div>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setActiveModal(null)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-surface-container-low">
                <h3 className="font-bold text-lg text-on-surface">
                  {activeModal === 'business' && 'Business Profile'}
                  {activeModal === 'template' && 'Template Customization'}
                  {activeModal === 'payment' && 'Payment Details'}
                </h3>
                <button onClick={() => setActiveModal(null)} className="p-2 bg-surface-container-low hover:bg-surface-container-low/80 rounded-full transition-colors">
                  <X size={18} className="text-on-surface" />
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="p-6 overflow-y-auto">
                {activeModal === 'business' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Brand Name</label>
                      <input 
                        type="text" 
                        value={localBrandName}
                        onChange={(e) => setLocalBrandName(e.target.value)}
                        placeholder="e.g. Acme Corp" 
                        className="w-full bg-surface-container-low focus:bg-surface-container-lowest border-none rounded-full text-sm font-bold text-on-surface focus:ring-1 focus:ring-primary/20 px-5 py-3.5 outline-none transition-all"
                      />
                      <p className="text-[10px] text-on-surface-variant mt-2 ml-2 font-medium">This will appear on your invoices and receipts.</p>
                    </div>

                    {isPremium && (
                      <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Brand Logo (Premium)</label>
                        <div className="flex items-center gap-4">
                          {logoUrl && (
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-low flex items-center justify-center">
                              <img src={logoUrl} alt="Brand Logo" className="w-full h-full object-contain" />
                            </div>
                          )}
                          <div className="flex-1">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    setLogoUrl(event.target?.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary file:text-on-primary hover:file:bg-primary/90 transition-all"
                            />
                            <p className="text-[10px] text-on-surface-variant mt-2 ml-2 font-medium">Upload a high-resolution logo for your invoices.</p>
                          </div>
                          {logoUrl && (
                            <button 
                              onClick={() => setLogoUrl('')}
                              className="p-2 text-error hover:bg-error/10 rounded-full transition-colors"
                              title="Remove Logo"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeModal === 'template' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2 flex items-center gap-2"><Palette size={12} /> Brand Color</label>
                      <div className="flex gap-3 px-2">
                        {colors.map(color => (
                          <button
                            key={color}
                            onClick={() => setLocalTemplateConfig({ ...localTemplateConfig, color })}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${localTemplateConfig.color === color ? 'scale-110 ring-2 ring-offset-2 ring-primary' : 'hover:scale-110'}`}
                            style={{ backgroundColor: color }}
                          >
                            {localTemplateConfig.color === color && <Check size={14} color="white" />}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2">
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2 flex items-center gap-2"><LayoutTemplate size={12} /> Template Style</label>
                      <div className="grid grid-cols-3 gap-3">
                        {styles.map(style => (
                          <button
                            key={style}
                            onClick={() => {
                              if (['bold', 'elegant', 'corporate'].includes(style) && !isPremium) {
                                alert('Please upgrade to Premium to use this template.');
                                return;
                              }
                              setLocalTemplateConfig({ ...localTemplateConfig, style });
                            }}
                            className={`py-3 px-2 rounded-3xl text-xs font-bold capitalize transition-all ${
                              localTemplateConfig.style === style 
                                ? 'bg-primary text-on-primary shadow-ambient' 
                                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-low/80'
                            }`}
                          >
                            {getStyleName(style)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {activeModal === 'payment' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Bank Name</label>
                      <input 
                        type="text" 
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. Chase Bank, GTBank" 
                        className="w-full bg-surface-container-low focus:bg-surface-container-lowest border-none rounded-full text-sm font-bold text-on-surface focus:ring-1 focus:ring-primary/20 px-5 py-3.5 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Account Name</label>
                      <input 
                        type="text" 
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="e.g. John Doe" 
                        className="w-full bg-surface-container-low focus:bg-surface-container-lowest border-none rounded-full text-sm font-bold text-on-surface focus:ring-1 focus:ring-primary/20 px-5 py-3.5 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Account Number</label>
                      <input 
                        type="text" 
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="e.g. 0123456789" 
                        className="w-full bg-surface-container-low focus:bg-surface-container-lowest border-none rounded-full text-sm font-mono font-bold text-on-surface focus:ring-1 focus:ring-primary/20 px-5 py-3.5 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Modal Footer */}
              <div className="p-6 border-t border-surface-container-low bg-surface-container-lowest">
                <button 
                  onClick={() => { handleSaveDetails(); setActiveModal(null); }}
                  className="w-full py-4 bg-primary text-on-primary rounded-full font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-ambient shadow-primary/20"
                >
                  {isSaved ? <Check size={18} strokeWidth={2.5} /> : <Save size={18} strokeWidth={2.5} />}
                  {isSaved ? 'Saved!' : 'Save Details'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4 ml-2">Currency</h3>
        <div className="bg-surface-container-lowest rounded-3xl shadow-ambient overflow-hidden p-6">
          <div className="relative">
            <select
              value={currency.code}
              onChange={(e) => {
                const selected = CURRENCIES.find(c => c.code === e.target.value);
                if (selected) setCurrency(selected);
              }}
              className="w-full appearance-none bg-surface-container-low text-on-surface font-bold text-sm rounded-full px-5 py-4 pr-12 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} - {c.name} ({c.code})
                </option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
      </section>
      <section className="mt-10">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4 ml-2">Backup & Sync</h3>
        <div className="bg-surface-container-lowest rounded-3xl shadow-ambient p-6 space-y-4">
          <div className="flex gap-3">
            <button 
              onClick={handleExport}
              className="flex-1 py-4 bg-surface-container-low text-on-surface rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:bg-surface-container-low/80"
            >
              <Download size={18} />
              Export
            </button>
            <label className="flex-1 py-4 bg-surface-container-low text-on-surface rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:bg-surface-container-low/80 cursor-pointer">
              <Upload size={18} />
              Import
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>
      </section>
    </motion.div>
  );
};
