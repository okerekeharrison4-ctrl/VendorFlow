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
