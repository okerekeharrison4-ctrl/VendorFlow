export type Currency = {
  code: string;
  symbol: string;
  name: string;
};

export const CURRENCIES: Currency[] = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
];

export type InvoiceItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

export type InvoiceStatus = 'unpaid' | 'paid';

export type BankDetails = {
  bankName: string;
  accountName: string;
  accountNumber: string;
};

export type Client = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: number;
};

export type CatalogItem = {
  id: string;
  name: string;
  price: number;
  description?: string;
  createdAt: number;
};

export type RecurringInvoice = {
  id: string;
  customerId: string;
  items: InvoiceItem[];
  frequency: 'daily' | 'weekly' | 'monthly';
  nextRun: number;
  isActive: boolean;
  createdAt: number;
};

export type TemplateConfig = {
  color: string;
  style: 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant' | 'corporate';
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  items: InvoiceItem[];
  status: InvoiceStatus;
  createdAt: number;
  updatedAt: number;
  paidAt?: number;
  notes?: string;
  bankDetails?: BankDetails;
  brandName?: string;
  template?: TemplateConfig;
};
