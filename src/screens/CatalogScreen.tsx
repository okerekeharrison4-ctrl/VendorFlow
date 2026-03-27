import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { motion } from 'motion/react';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export const CatalogScreen = () => {
  const { catalog, addCatalogItem, updateCatalogItem, deleteCatalogItem, currency } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0
  });

  const filteredItems = catalog.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price < 0) return;

    if (editingId) {
      updateCatalogItem(editingId, formData);
    } else {
      addCatalogItem(formData);
    }

    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', description: '', price: 0 });
  };

  const handleEdit = (item: any) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price
    });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteCatalogItem(id);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pt-4 pb-40"
    >
      <section className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-on-surface mb-2">Catalog</h2>
          <p className="text-on-surface-variant text-sm font-medium">Manage your products and services.</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({ name: '', description: '', price: 0 });
          }}
          className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </section>

      {isAdding ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-lowest rounded-[2rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/5 mb-8"
        >
          <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Item' : 'New Item'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Item Name *</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-surface-low/50 border-none rounded-2xl px-5 py-4 text-on-surface font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Product or Service Name"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Price *</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">{currency.symbol}</span>
                <input 
                  type="number" 
                  value={formData.price || ''}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-surface-low/50 border-none rounded-2xl pl-12 pr-5 py-4 text-on-surface font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-2">Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-surface-low/50 border-none rounded-2xl px-5 py-4 text-on-surface font-medium focus:ring-2 focus:ring-primary outline-none transition-all resize-none h-24"
                placeholder="Optional description"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-4 text-on-surface-variant font-bold text-sm bg-surface-low hover:bg-surface-low/80 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-4 text-on-primary font-bold text-sm bg-primary hover:bg-primary/90 rounded-full transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <>
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog..."
              className="w-full bg-surface-lowest border border-outline-variant/10 rounded-full pl-12 pr-5 py-4 text-on-surface font-medium focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
            />
          </div>

          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant">
                <p>No items found in catalog.</p>
              </div>
            ) : (
              filteredItems.map(item => (
                <div key={item.id} className="bg-surface-lowest p-5 rounded-[1.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-low flex items-center justify-center text-primary">
                      <Package size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface">{item.name}</h3>
                      <p className="text-sm text-on-surface-variant">{formatCurrency(item.price, currency.symbol)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(item)} className="p-4 text-on-surface-variant hover:text-primary transition-colors">
                      <Edit2 size={20} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-4 text-on-surface-variant hover:text-error transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};
