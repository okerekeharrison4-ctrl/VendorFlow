import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Invoice, Currency, CURRENCIES, BankDetails, Client, CatalogItem, TemplateConfig, RecurringInvoice, TaxConfig } from '../types';
import { getEncryptedData, saveEncryptedData } from '../services/storageService';
import { generateId, generateInvoiceNumber } from '../utils/helpers';

type StoreContextType = {
  invoices: Invoice[];
  clients: Client[];
  catalog: CatalogItem[];
  currency: Currency;
  hasCompletedOnboarding: boolean;
  bankDetails: BankDetails | null;
  brandName: string;
  vendorTaxId: string;
  templateConfig: TemplateConfig;
  taxConfig: TaxConfig;
  lastSyncedAt: number | null;
  isLoading: boolean;
  theme: 'light' | 'dark';
  isPaletteOpen: boolean;
  isPremium: boolean;
  logoUrl: string | null;
  recurringInvoices: RecurringInvoice[];
  setIsPremium: (isPremium: boolean) => void;
  setLogoUrl: (url: string | null) => void;
  addRecurringInvoice: (invoice: RecurringInvoice) => void;
  updateRecurringInvoice: (invoice: RecurringInvoice) => void;
  deleteRecurringInvoice: (id: string) => void;
  setCurrency: (currency: Currency) => void;
  setBankDetails: (details: BankDetails | null) => void;
  setBrandName: (name: string) => void;
  setVendorTaxId: (id: string) => void;
  setTemplateConfig: (config: TemplateConfig) => void;
  setTaxConfig: (config: TaxConfig) => void;
  toggleTheme: () => void;
  togglePalette: () => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  markAsPaid: (id: string) => void;
  getInvoice: (id: string) => Invoice | undefined;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  addCatalogItem: (item: CatalogItem) => void;
  updateCatalogItem: (item: CatalogItem) => void;
  deleteCatalogItem: (id: string) => void;
  completeOnboarding: () => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [templateConfig, setTemplateConfigState] = useState<TemplateConfig>({ color: '#2A7A3E', style: 'modern' });
  const [taxConfig, setTaxConfigState] = useState<TaxConfig>({ enabled: false, rate: 7.5, label: 'VAT' });
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [currency, setCurrencyState] = useState<Currency>(CURRENCIES[0]);
  const [bankDetails, setBankDetailsState] = useState<BankDetails | null>(null);
  const [brandName, setBrandNameState] = useState<string>('');
  const [vendorTaxId, setVendorTaxIdState] = useState<string>('');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [isPremium, setIsPremiumState] = useState<boolean>(false);
  const [logoUrl, setLogoUrlState] = useState<string | null>(null);
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([]);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  const addRecurringInvoice = (invoice: RecurringInvoice) => setRecurringInvoices(prev => [invoice, ...prev]);
  const updateRecurringInvoice = (invoice: RecurringInvoice) => setRecurringInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i));
  const deleteRecurringInvoice = (id: string) => setRecurringInvoices(prev => prev.filter(i => i.id !== id));
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const togglePalette = () => setIsPaletteOpen(prev => !prev);

  useEffect(() => {
    async function loadData() {
      const savedInvoices = await getEncryptedData('invoices') || [];
      const savedClients = await getEncryptedData('clients') || [];
      const savedCatalog = await getEncryptedData('catalog') || [];
      const savedTemplate = await getEncryptedData('template') || { color: '#2A7A3E', style: 'modern' };
      const savedTaxConfig = await getEncryptedData('tax_config') || { enabled: false, rate: 7.5, label: 'VAT' };
      const savedCurrency = await getEncryptedData('currency') || CURRENCIES[0];
      const savedBankDetails = await getEncryptedData('bank_details') || null;
      const savedBrandName = await getEncryptedData('brand_name') || '';
      const savedVendorTaxId = await getEncryptedData('vendor_tax_id') || '';
      const savedOnboarding = await getEncryptedData('onboarding') === 'true';
      const savedTheme = await getEncryptedData('theme') || 'light';

      const savedRecurringInvoices = await getEncryptedData('recurring_invoices') || [];
      const savedIsPremium = await getEncryptedData('is_premium') === 'true';
      const savedLogoUrl = await getEncryptedData('logo_url') || null;

      setInvoices(savedInvoices);
      setClients(savedClients);
      setCatalog(savedCatalog);
      setRecurringInvoices(savedRecurringInvoices);
      setIsPremium(savedIsPremium);
      setLogoUrl(savedLogoUrl);
      setTemplateConfigState(savedTemplate);
      setTaxConfigState(savedTaxConfig);
      setCurrencyState(savedCurrency);
      setBankDetailsState(savedBankDetails);
      setBrandNameState(savedBrandName);
      setVendorTaxIdState(savedVendorTaxId);
      setHasCompletedOnboarding(savedOnboarding);
      setThemeState(savedTheme);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const toggleTheme = () => {
    setThemeState(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      return newTheme;
    });
  };

  useEffect(() => {
    if (isLoading) return;
    saveEncryptedData('theme', theme);
  }, [theme, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    saveEncryptedData('invoices', invoices);
  }, [invoices, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    saveEncryptedData('clients', clients);
  }, [clients, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    saveEncryptedData('recurring_invoices', recurringInvoices);
  }, [recurringInvoices, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    saveEncryptedData('is_premium', isPremium.toString());
  }, [isPremium, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    saveEncryptedData('logo_url', logoUrl);
  }, [logoUrl, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    const now = Date.now();
    recurringInvoices.forEach(recurring => {
      if (recurring.isActive && recurring.nextRun <= now) {
        const newInvoice: Invoice = {
          id: generateId(),
          invoiceNumber: generateInvoiceNumber(),
          customerName: recurring.customerId,
          items: recurring.items,
          createdAt: now,
          updatedAt: now,
          status: 'unpaid',
        };
        addInvoice(newInvoice);
        
        const nextRun = new Date(recurring.nextRun);
        if (recurring.frequency === 'daily') nextRun.setDate(nextRun.getDate() + 1);
        else if (recurring.frequency === 'weekly') nextRun.setDate(nextRun.getDate() + 7);
        else if (recurring.frequency === 'monthly') nextRun.setMonth(nextRun.getMonth() + 1);
        
        updateRecurringInvoice({ ...recurring, nextRun: nextRun.getTime() });
      }
    });
  }, [recurringInvoices, isLoading]);

  const setIsPremium = (isPremium: boolean) => {
    setIsPremiumState(isPremium);
    saveEncryptedData('is_premium', isPremium.toString());
  };

  const setLogoUrl = (url: string | null) => {
    setLogoUrlState(url);
    saveEncryptedData('logo_url', url);
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    saveEncryptedData('currency', curr);
  };

  const setBankDetails = (details: BankDetails | null) => {
    setBankDetailsState(details);
    saveEncryptedData('bank_details', details);
  };

  const setBrandName = (name: string) => {
    setBrandNameState(name);
    saveEncryptedData('brand_name', name);
  };

  const setVendorTaxId = (id: string) => {
    setVendorTaxIdState(id);
    saveEncryptedData('vendor_tax_id', id);
  };

  const setTemplateConfig = (config: TemplateConfig) => {
    setTemplateConfigState(config);
    saveEncryptedData('template', config);
  };

  const setTaxConfig = (config: TaxConfig) => {
    setTaxConfigState(config);
    saveEncryptedData('tax_config', config);
  };

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    saveEncryptedData('onboarding', 'true');
  };

  const addInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
  };

  const updateInvoice = (invoice: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === invoice.id ? invoice : inv));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const markAsPaid = (id: string) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, status: 'paid', paidAt: Date.now(), updatedAt: Date.now() } : inv
    ));
  };

  const getInvoice = (id: string) => invoices.find(inv => inv.id === id);

  const addClient = (client: Client) => setClients(prev => [client, ...prev]);
  const updateClient = (client: Client) => setClients(prev => prev.map(c => c.id === client.id ? client : c));
  const deleteClient = (id: string) => setClients(prev => prev.filter(c => c.id !== id));

  const addCatalogItem = (item: CatalogItem) => setCatalog(prev => [item, ...prev]);
  const updateCatalogItem = (item: CatalogItem) => setCatalog(prev => prev.map(c => c.id === item.id ? item : c));
  const deleteCatalogItem = (id: string) => setCatalog(prev => prev.filter(c => c.id !== id));

  return (
    <StoreContext.Provider value={{
      invoices, clients, catalog, currency, hasCompletedOnboarding, bankDetails, brandName, vendorTaxId, templateConfig, taxConfig, lastSyncedAt, isLoading, theme, isPaletteOpen,
      isPremium,
      logoUrl,
      recurringInvoices,
      setIsPremium,
      setLogoUrl,
      addRecurringInvoice,
      updateRecurringInvoice,
      deleteRecurringInvoice,
      setCurrency, setBankDetails, setBrandName, setVendorTaxId, setTemplateConfig, setTaxConfig, toggleTheme, togglePalette,
      addInvoice, updateInvoice, deleteInvoice, markAsPaid, getInvoice,
      addClient, updateClient, deleteClient,
      addCatalogItem, updateCatalogItem, deleteCatalogItem,
      completeOnboarding
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
