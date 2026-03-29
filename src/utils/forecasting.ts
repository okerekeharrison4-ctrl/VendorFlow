import { Invoice } from '../types';

export const calculateCashFlowForecast = (invoices: Invoice[]) => {
  const paidInvoices = invoices.filter(inv => inv.status === 'paid' && inv.paidAt && inv.createdAt);
  
  // Calculate average time to pay (in days)
  let totalTimeToPay = 0;
  let count = 0;
  
  paidInvoices.forEach(inv => {
    if (inv.paidAt && inv.createdAt) {
      const timeToPay = (inv.paidAt - inv.createdAt) / (1000 * 60 * 60 * 24);
      totalTimeToPay += timeToPay;
      count++;
    }
  });
  
  const avgTimeToPay = count > 0 ? totalTimeToPay / count : 7; // Default to 7 days if no history
  
  const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid');
  
  const forecast = unpaidInvoices.map(inv => {
    const projectedPaymentDate = inv.createdAt + (avgTimeToPay * 1000 * 60 * 60 * 24);
    const amount = inv.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return {
      id: inv.id,
      customerName: inv.customerName,
      amount,
      projectedPaymentDate
    };
  });
  
  return forecast;
};
