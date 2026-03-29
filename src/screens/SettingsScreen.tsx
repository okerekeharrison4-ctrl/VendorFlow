import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { CURRENCIES, TemplateConfig } from '../types';
import { motion } from 'motion/react';
import { Check, Save, Palette, LayoutTemplate, Download, Upload } from 'lucide-react';

export const SettingsScreen = () => {
  const { currency, setCurrency, bankDetails, setBankDetails, brandName, setBrandName, templateConfig, setTemplateConfig, invoices, clients, catalog, theme, toggleTheme } = useStore();

  const [localBrandName, setLocalBrandName] = useState(brandName);
  const [bankName, setBankName] = useState(bankDetails?.bankName || '');
  const [accountName, setAccountName] = useState(bankDetails?.accountName || '');
  const [accountNumber, setAccountNumber] = useState(bankDetails?.accountNumber || '');
  const [localTemplateConfig, setLocalTemplateConfig] = useState<TemplateConfig>(templateConfig || { color: '#141414', style: 'modern' });
  const [isSaved, setIsSaved] = useState(false);

  const colors = ['#141414', '#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c'];
  const styles: Array<'modern' | 'classic' | 'minimal'> = ['modern', 'classic', 'minimal'];

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
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4 ml-2">Business Details</h3>
        <div className="bg-surface-container-lowest rounded-3xl shadow-ambient p-6 space-y-6">
          
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

          <div className="h-px bg-surface-container-low w-full"></div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-2 mb-4">Template Customization</h4>
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
                    onClick={() => setLocalTemplateConfig({ ...localTemplateConfig, style })}
                    className={`py-3 px-2 rounded-3xl text-xs font-bold capitalize transition-all ${
                      localTemplateConfig.style === style 
                        ? 'bg-primary text-on-primary shadow-ambient' 
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-low/80'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-surface-container-low w-full"></div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-2 mb-4">Payment Details</h4>
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
          
          <button 
            onClick={handleSaveDetails}
            className="w-full mt-4 py-4 bg-primary text-on-primary rounded-full font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-ambient shadow-primary/20"
          >
            {isSaved ? <Check size={18} strokeWidth={2.5} /> : <Save size={18} strokeWidth={2.5} />}
            {isSaved ? 'Saved!' : 'Save Details'}
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4 ml-2">Currency</h3>
        <div className="bg-surface-container-lowest rounded-3xl shadow-ambient overflow-hidden">
          {CURRENCIES.map((c, index) => (
            <div 
              key={c.code}
              onClick={() => setCurrency(c)}
              className={`flex items-center justify-between p-5 cursor-pointer hover:bg-surface-container-low transition-colors`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-inner ${
                  currency.code === c.code ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
                }`}>
                  {c.symbol}
                </div>
                <div>
                  <p className="font-bold text-on-surface text-sm mb-0.5">{c.name}</p>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">{c.code}</p>
                </div>
              </div>
              {currency.code === c.code && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="text-primary" size={18} strokeWidth={3} />
                </div>
              )}
            </div>
          ))}
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
