import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { Product } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Package, AlertTriangle, CheckCircle2, XCircle, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StockEdit {
  productId: string;
  sizeIndex: number;
  newStock: number;
}

export function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'low' | 'out'>('all');
  const [stockEdits, setStockEdits] = useState<Map<string, StockEdit>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['inventory-products'],
    queryFn: productService.getAll,
  });

  // Calculate inventory statistics
  const stats = {
    totalItems: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  };

  products.forEach(p => {
    p.sizeOptions?.forEach(s => {
      stats.totalItems++;
      const stock = s.stock || 0;
      if (stock === 0) stats.outOfStock++;
      else if (stock < 10) stats.lowStock++;
      else stats.inStock++;
    });
  });

  const getFilteredItems = () => {
    const items: Array<{ product: Product, sizeIndex: number, option: any }> = [];
    
    products.forEach(p => {
      if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase()) && !p.productCode?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return;
      }

      p.sizeOptions?.forEach((opt, idx) => {
        const stock = opt.stock || 0;
        if (filterMode === 'low' && stock >= 10) return;
        if (filterMode === 'out' && stock > 0) return;
        
        items.push({ product: p, sizeIndex: idx, option: opt });
      });
    });

    return items;
  };

  const filteredItems = getFilteredItems();

  const handleStockChange = (productId: string, sizeIndex: number, value: string) => {
    const newStock = parseInt(value);
    if (isNaN(newStock) || newStock < 0) return;

    const key = `${productId}-${sizeIndex}`;
    const newEdits = new Map(stockEdits);
    newEdits.set(key, { productId, sizeIndex, newStock });
    setStockEdits(newEdits);
  };

  const handleSave = async () => {
    if (stockEdits.size === 0) return;
    setIsSaving(true);
    
    try {
      // Group edits by product
      const productUpdates = new Map<string, Product>();
      
      for (const [_, edit] of stockEdits) {
        const product = products.find(p => p._id === edit.productId);
        if (!product) continue;
        
        if (!productUpdates.has(edit.productId)) {
          // Deep clone to avoid mutating React Query cache directly before save
          productUpdates.set(edit.productId, JSON.parse(JSON.stringify(product)));
        }
        
        const prodToUpdate = productUpdates.get(edit.productId)!;
        prodToUpdate.sizeOptions[edit.sizeIndex].stock = edit.newStock;
        prodToUpdate.sizeOptions[edit.sizeIndex].availability = edit.newStock > 0;
      }

      // Update sequentially (or Promise.all if your backend handles high concurrency well)
      const updatePromises = Array.from(productUpdates.values()).map(p => 
        productService.update(p._id!, { sizeOptions: p.sizeOptions })
      );
      
      await Promise.all(updatePromises);

      toast({
        title: 'Inventory Updated',
        description: `Successfully updated stock for ${productUpdates.size} product(s).`,
      });
      
      setStockEdits(new Map());
      refetch();
    } catch (error) {
      console.error('Failed to update inventory:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to save inventory changes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Inventory Management</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Track and adjust product stock levels</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => refetch()} className="font-bold">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button onClick={handleSave} disabled={stockEdits.size === 0 || isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
            {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes ({stockEdits.size})
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-xl text-slate-600"><Package className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Variants</p>
            <p className="text-2xl font-black text-slate-900">{stats.totalItems}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => setFilterMode('all')}>
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Stock</p>
            <p className="text-2xl font-black text-emerald-600">{stats.inStock}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-amber-300 transition-colors" onClick={() => setFilterMode('low')}>
          <div className="p-3 bg-amber-100 rounded-xl text-amber-600"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock</p>
            <p className="text-2xl font-black text-amber-600">{stats.lowStock}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-rose-300 transition-colors" onClick={() => setFilterMode('out')}>
          <div className="p-3 bg-rose-100 rounded-xl text-rose-600"><XCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Out of Stock</p>
            <p className="text-2xl font-black text-rose-600">{stats.outOfStock}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-slate-200 focus:ring-blue-500/20 rounded-xl font-medium"
          />
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          {(['all', 'low', 'out'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all flex-1 md:flex-none",
                filterMode === mode ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Size/Variant</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Update Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(({ product, sizeIndex, option }) => {
                const stock = option.stock || 0;
                const isLow = stock > 0 && stock < 10;
                const isOut = stock === 0;
                const key = `${product._id}-${sizeIndex}`;
                const edit = stockEdits.get(key);
                const currentDisplayStock = edit ? edit.newStock : stock;

                return (
                  <tr key={key} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          <img src={product.image || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{product.name}</p>
                          <p className="text-xs font-medium text-slate-500">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                        {option.size}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isOut ? (
                        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">Out of Stock</Badge>
                      ) : isLow ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Low Stock</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">In Stock</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-700">{stock} units</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Input 
                          type="number" 
                          min="0"
                          className={cn(
                            "w-24 text-right font-bold rounded-xl",
                            edit ? "border-blue-400 bg-blue-50 focus:ring-blue-500/20 text-blue-700" : "border-slate-200"
                          )}
                          value={currentDisplayStock}
                          onChange={(e) => handleStockChange(product._id!, sizeIndex, e.target.value)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-lg font-bold text-slate-900">No variants found</p>
                    <p className="text-sm text-slate-500 font-medium mt-1">Try adjusting your filters or search term.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
