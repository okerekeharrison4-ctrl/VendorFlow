import { Invoice } from '../types';

export const getRevenueTrends = (invoices: Invoice[]) => {
  const trends: Record<string, number> = {};
  invoices.forEach(inv => {
    const month = new Date(inv.createdAt).toLocaleString('default', { month: 'short' });
    trends[month] = (trends[month] || 0) + inv.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  });
  return Object.entries(trends).map(([month, revenue]) => ({ month, revenue }));
};

export const getTopProducts = (invoices: Invoice[]) => {
  const products: Record<string, number> = {};
  invoices.forEach(inv => {
    inv.items.forEach(item => {
      products[item.name] = (products[item.name] || 0) + item.quantity;
    });
  });
  return Object.entries(products).map(([name, quantity]) => ({ name, quantity }));
};
