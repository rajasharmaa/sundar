import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Product } from '@/types';
import { PRODUCT_CATEGORIES } from '@/utils/constants';
import { productService } from '@/services/productService';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Save, Upload, Download, Search, RotateCcw, LogOut, Plus, Minus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
// Note: Install xlsx package with: npm install xlsx @types/xlsx
// import XLSX from 'xlsx';

interface PriceEdit {
  productId: string;
  productName: string;
  sizeIndex: number;
  size: string;
  priceType: '100' | '50';
  currentPrice: number;
  newPrice: number;
}

export function BulkPriceEditor() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceEdits, setPriceEdits] = useState<Map<string, PriceEdit>>(new Map());
  const { toast } = useToast();
  const { logout } = useAuth();

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await productService.getAll();
      setProducts(response);
      setFilteredProducts(response);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products. Please ensure you are logged in.',
        variant: 'destructive',
      });
      // Auto-logout if authentication fails
      if ((error as any).response?.status === 401 || (error as any).response?.status === 403) {
        await logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [logout, toast]);

  const filterProducts = useCallback(() => {
    let filtered = [...products];

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        (p as any).brand?.toLowerCase().includes(term) ||
        (p as any).productCode?.toLowerCase().includes(term)
      );
    }

    setFilteredProducts(filtered);
  }, [products, categoryFilter, searchTerm]);

  // Fetch all products
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products when category or search changes
  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const handlePriceChange = (productId: string, sizeIndex: number, priceType: '100' | '50', newPrice: number) => {
    const product = products.find(p => p._id === productId);
    if (!product || !product.sizeOptions[sizeIndex]) return;

    const key = `${productId}-${sizeIndex}-${priceType}`;
    const currentEdit = priceEdits.get(key);

    const currentPrice = priceType === '100' 
      ? product.sizeOptions[sizeIndex].price_100_percent
      : product.sizeOptions[sizeIndex].price_50_percent;

    if (currentEdit) {
      // Update existing edit
      setPriceEdits(new Map(priceEdits).set(key, {
        ...currentEdit,
        newPrice,
      }));
    } else {
      // Create new edit
      const newEdit: PriceEdit = {
        productId: product._id || '',
        productName: product.name,
        sizeIndex,
        size: product.sizeOptions[sizeIndex].size,
        priceType,
        currentPrice,
        newPrice,
      };
      setPriceEdits(new Map(priceEdits).set(key, newEdit));
    }
  };

  const resetPrice = (productId: string, sizeIndex: number, priceType: '100' | '50') => {
    const key = `${productId}-${sizeIndex}-${priceType}`;
    const newEdits = new Map(priceEdits);
    newEdits.delete(key);
    setPriceEdits(newEdits);
  };

  const saveAllChanges = async () => {
    if (priceEdits.size === 0) {
      toast({
        title: 'No Changes',
        description: 'Please modify some prices first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);

      // Group edits by product and price type
      const updates = [];
      
      priceEdits.forEach((edit) => {
        updates.push({
          productId: edit.productId,
          sizeIndex: edit.sizeIndex,
          priceType: edit.priceType,
          newPrice: edit.newPrice,
        });
      });

      console.log('🔵 Sending bulk price update:', updates);

      // Call bulk price update API
      const result = await productService.bulkPriceUpdate(updates);

      console.log('✅ Bulk update response:', result);

      toast({
        title: 'Success',
        description: `Updated ${result.results?.filter((r: any) => r.success).length || updates.length} product(s)`,
        variant: 'default',
      });

      // Clear edits and refresh products
      setPriceEdits(new Map());
      await fetchProducts();
    } catch (error) {
      console.error('❌ Bulk update error:', error);
      const errorMessage = (error as any).response?.data?.error || 'Failed to save price changes';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const exportToExcel = () => {
    toast({
      title: 'Feature Not Available',
      description: 'Please install xlsx package first: npm install xlsx @types/xlsx',
      variant: 'destructive',
    });
    // TODO: Implement Excel export after installing xlsx package
    /*
    if (filteredProducts.length === 0) {
      toast({
        title: 'No Data',
        description: 'No products to export',
        variant: 'destructive',
      });
      return;
    }

    const data = filteredProducts.flatMap(product => {
      return product.sizeOptions.map((sizeOption, idx) => ({
        'Product ID': product._id,
        'Product Name': product.name,
        'Category': product.category,
        'Brand': (product as any).brand || '',
        'Product Code': (product as any).productCode || '',
        'Size': sizeOption.size,
        'Current Price (100%)': sizeOption.price_100_percent,
        'Current Price (50%)': sizeOption.price_50_percent,
        'Availability': sizeOption.availability ? 'Yes' : 'No',
        'Stock': sizeOption.stock || 0,
      }));
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, `price-list-${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: 'Export Complete',
      description: `Exported ${data.length} rows to Excel`,
    });
    */
  };

  const importFromExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    toast({
      title: 'Feature Not Available',
      description: 'Please install xlsx package first: npm install xlsx @types/xlsx',
      variant: 'destructive',
    });
    // TODO: Implement Excel import after installing xlsx package
    /*
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

      let importCount = 0;
      let errorCount = 0;

      for (const row of jsonData) {
        try {
          const productId = row['Product ID'];
          const size = row['Size'];
          const newPrice = parseFloat(row['Current Price'] || row['New Price']);

          if (!productId || !size || isNaN(newPrice)) {
            errorCount++;
            continue;
          }

          const product = products.find(p => p._id === productId);
          if (!product) {
            errorCount++;
            continue;
          }

          const sizeIndex = product.sizeOptions.findIndex(s => s.size === size);
          if (sizeIndex === -1) {
            errorCount++;
            continue;
          }

          handlePriceChange(productId, sizeIndex, newPrice);
          importCount++;
        } catch (err) {
          errorCount++;
        }
      }

      toast({
        title: 'Import Complete',
        description: `Imported ${importCount} prices, ${errorCount} errors`,
      });

      // Reset file input
      e.target.value = '';
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: 'Failed to import Excel file',
        variant: 'destructive',
      });
    }
    */
  };

  const hasChanges = (productId: string, sizeIndex: number, priceType: '100' | '50') => {
    const key = `${productId}-${sizeIndex}-${priceType}`;
    return priceEdits.has(key);
  };

  const getEditedPrice = (productId: string, sizeIndex: number, priceType: '100' | '50', currentPrice: number) => {
    const key = `${productId}-${sizeIndex}-${priceType}`;
    const edit = priceEdits.get(key);
    
    // Return edited price if exists, otherwise return current price
    // Ensure we always return a valid number
    if (edit && typeof edit.newPrice === 'number' && !isNaN(edit.newPrice)) {
      return edit.newPrice;
    }
    
    // Fallback to current price, ensure it's a valid number
    return typeof currentPrice === 'number' && !isNaN(currentPrice) ? currentPrice : 0;
  };

  const adjustPrice = (productId: string, sizeIndex: number, priceType: '100' | '50', percentage: number) => {
    const product = products.find(p => p._id === productId);
    if (!product || !product.sizeOptions[sizeIndex]) return;

    const key = `${productId}-${sizeIndex}-${priceType}`;
    const currentEdit = priceEdits.get(key);
    
    const basePrice = priceType === '100' 
      ? product.sizeOptions[sizeIndex].price_100_percent
      : product.sizeOptions[sizeIndex].price_50_percent;
    
    const currentPrice = currentEdit ? currentEdit.newPrice : basePrice;
    const newPrice = Math.round(currentPrice * (1 + percentage / 100) * 100) / 100;

    if (currentEdit) {
      setPriceEdits(new Map(priceEdits).set(key, {
        ...currentEdit,
        newPrice,
      }));
    } else {
      const newEdit: PriceEdit = {
        productId: product._id || '',
        productName: product.name,
        sizeIndex,
        size: product.sizeOptions[sizeIndex].size,
        priceType,
        currentPrice: basePrice,
        newPrice,
      };
      setPriceEdits(new Map(priceEdits).set(key, newEdit));
    }
  };

  const totalChanges = priceEdits.size;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Bulk Price Editor</h2>
        <div className="flex gap-2">
          <Button
            onClick={exportToExcel}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={importFromExcel}
                className="hidden"
              />
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
            </label>
          </Button>
          <Button
            onClick={saveAllChanges}
            disabled={isSaving || totalChanges === 0}
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Save All ({totalChanges})
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Category Filter</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Search Products</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, description, brand, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          {(categoryFilter !== 'all' || searchTerm) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCategoryFilter('all');
                setSearchTerm('');
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Products Table - Dual Pricing */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Size</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase">
                  100% Price (Standard)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase">
                  50% Price (Wholesale) 
                  <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">SAVE 50%</span>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((product) => (
                product.sizeOptions?.map((sizeOption, sizeIndex) => {
                  // Safety check for missing price data
                  const price100 = sizeOption?.price_100_percent ?? 0;
                  const price50 = sizeOption?.price_50_percent ?? 0;
                  
                  const hasEdit100 = hasChanges(product._id, sizeIndex, '100');
                  const hasEdit50 = hasChanges(product._id, sizeIndex, '50');
                  const editedPrice100 = getEditedPrice(
                    product._id,
                    sizeIndex,
                    '100',
                    price100
                  );
                  const editedPrice50 = getEditedPrice(
                    product._id,
                    sizeIndex,
                    '50',
                    price50
                  );

                  return (
                    <tr
                      key={`${product._id}-${sizeIndex}`}
                      className={`hover:bg-muted/50 ${hasEdit100 || hasEdit50 ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {(product as any).brand && <span>Brand: {(product as any).brand} | </span>}
                            {(product as any).productCode && <span>Code: {(product as any).productCode}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{sizeOption?.size || 'Unknown'}</span>
                          {!sizeOption?.availability && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                              Unavailable
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col gap-2">
                          <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label htmlFor={`price-100-${product._id}-${sizeIndex}`} className="text-xs font-medium text-blue-600">100% Price</label>
                                  <Badge variant="outline" className="text-xs">Standard</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Input
                                    id={`price-100-${product._id}-${sizeIndex}`}
                                    name={`price-100-${product._id}-${sizeIndex}`}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder={`Orig: ₹${price100.toFixed(2)}`}
                                    value={Number.isFinite(editedPrice100) ? editedPrice100 : 0}
                                    onChange={(e) => {
                                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                      handlePriceChange(
                                        product._id,
                                        sizeIndex,
                                        '100',
                                        isNaN(value) ? 0 : value
                                      );
                                    }}
                                    onKeyDown={(e) => {
                                      // Prevent arrow keys from changing focus
                                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                        e.preventDefault();
                                      }
                                    }}
                                    autoComplete="off"
                                    className={`w-full font-semibold ${hasEdit100 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                  />
                                  {hasEdit100 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => resetPrice(product._id, sizeIndex, '100')}
                                      className="h-9 w-9 p-0"
                                      aria-label="Reset 100% price"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => adjustPrice(product._id, sizeIndex, '100', -10)}
                                    className="h-7 flex-1 text-xs"
                                    title="Decrease by 10%"
                                  >
                                    <Minus className="w-3 h-3 mr-1" />
                                    10%
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => adjustPrice(product._id, sizeIndex, '100', 10)}
                                    className="h-7 flex-1 text-xs"
                                    title="Increase by 10%"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    10%
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => adjustPrice(product._id, sizeIndex, '100', 25)}
                                    className="h-7 flex-1 text-xs"
                                    title="Increase by 25%"
                                  >
                                    +25%
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col gap-2">
                          <Card className="border-l-4 border-l-green-500">
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label htmlFor={`price-50-${product._id}-${sizeIndex}`} className="text-xs font-medium text-green-600">50% Price</label>
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Wholesale</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Input
                                    id={`price-50-${product._id}-${sizeIndex}`}
                                    name={`price-50-${product._id}-${sizeIndex}`}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder={`Orig: ₹${price50.toFixed(2)}`}
                                    value={Number.isFinite(editedPrice50) ? editedPrice50 : 0}
                                    onChange={(e) => {
                                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                      handlePriceChange(
                                        product._id,
                                        sizeIndex,
                                        '50',
                                        isNaN(value) ? 0 : value
                                      );
                                    }}
                                    onKeyDown={(e) => {
                                      // Prevent arrow keys from changing focus
                                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                        e.preventDefault();
                                      }
                                    }}
                                    autoComplete="off"
                                    className={`w-full font-semibold ${hasEdit50 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}`}
                                  />
                                  {hasEdit50 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => resetPrice(product._id, sizeIndex, '50')}
                                      className="h-9 w-9 p-0"
                                      aria-label="Reset 50% price"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => adjustPrice(product._id, sizeIndex, '50', -10)}
                                    className="h-7 flex-1 text-xs"
                                    title="Decrease by 10%"
                                  >
                                    <Minus className="w-3 h-3 mr-1" />
                                    10%
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => adjustPrice(product._id, sizeIndex, '50', 10)}
                                    className="h-7 flex-1 text-xs"
                                    title="Increase by 10%"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    10%
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => adjustPrice(product._id, sizeIndex, '50', 25)}
                                    className="h-7 flex-1 text-xs"
                                    title="Increase by 25%"
                                  >
                                    +25%
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {(hasEdit100 || hasEdit50) && (
                          <Badge variant="outline" className="animate-pulse border-green-500 text-green-600 bg-green-50">
                            Editing
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No products found matching your filters</p>
          </div>
        )}
      </div>

      {/* Save Bar */}
      {totalChanges > 0 && (
        <div className="fixed bottom-4 right-4 bg-card border shadow-lg rounded-lg p-4 flex items-center gap-4 animate-slide-up">
          <div>
            <p className="font-semibold">{totalChanges} price change(s) pending</p>
            <p className="text-sm text-muted-foreground">Review and save your changes</p>
          </div>
          <Button onClick={saveAllChanges} disabled={isSaving}>
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
