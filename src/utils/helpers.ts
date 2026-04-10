export const generateId = () => Math.random().toString(36).substring(2, 11);

export const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${random}`;
};

export const formatCurrency = (amount: number, currencySymbol: string) => {
  return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const calculateTotal = (items: { quantity: number; price: number }[]) => {
  return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
};

export const calculateInvoiceTotal = (invoice: any) => {
  const itemsSum = calculateTotal(invoice.items);
  if (invoice.taxAmount && !invoice.taxInclusive) {
    return itemsSum + invoice.taxAmount;
  }
  return itemsSum;
};

export const isColorDark = (hex: string) => {
  if (!hex || !hex.startsWith('#')) return false;
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  } catch (e) {
    return false;
  }
};
