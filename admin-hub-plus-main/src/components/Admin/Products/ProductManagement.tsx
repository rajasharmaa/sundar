import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { catalogService, Catalog } from '@/services/catalogService';
import { Product, ProductFormData } from '@/types';
import { ProductGrid } from './ProductGrid';
import { ProductDetailEnhanced as ProductDetail } from './ProductDetailEnhanced';
import { BulkPriceEditor } from './BulkPriceEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Upload, Edit2, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

type ViewState = 'grid' | 'detail' | 'create' | 'bulk-edit';

export function ProductManagement() {
  const [view, setView] = useState<ViewState>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [newProductImages, setNewProductImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Catalog settings state
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [isUploadingCatalog, setIsUploadingCatalog] = useState(false);
  const [externalCatalogName, setExternalCatalogName] = useState('');
  const [externalCatalogUrl, setExternalCatalogUrl] = useState('');

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setIsCatalogLoading(true);
        const activeCatalog = await catalogService.getActive();
        setCatalog(activeCatalog);
      } catch (err) {
        console.error('Failed to fetch catalog:', err);
      } finally {
        setIsCatalogLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const handleCatalogUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    try {
      setIsUploadingCatalog(true);
      const updatedCatalog = await catalogService.upload(file);
      setCatalog(updatedCatalog);
      toast.success('Catalog uploaded successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload catalog');
    } finally {
      setIsUploadingCatalog(false);
    }
  };

  const handleExternalCatalogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalCatalogName || !externalCatalogUrl) {
      toast.error('Please fill in both name and URL');
      return;
    }

    try {
      setIsUploadingCatalog(true);
      const updatedCatalog = await catalogService.setUrl(externalCatalogName, externalCatalogUrl);
      setCatalog(updatedCatalog);
      setExternalCatalogName('');
      setExternalCatalogUrl('');
      toast.success('Catalog URL updated successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update catalog URL');
    } finally {
      setIsUploadingCatalog(false);
    }
  };

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
      setView('grid');
      setNewProductImages([]);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) =>
      productService.update(id, data),
    onSuccess: (response) => {
      console.log('✅ Update SUCCESS! Response:', response);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully!');
      setView('grid');
      setSelectedProduct(null);
    },
    onError: (error) => {
      console.error('❌ Update FAILED:', error);
      console.error('Error details:', error instanceof Error ? error.message : error);
      toast.error(error instanceof Error ? error.message : 'Failed to update product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
      setProductToDelete(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete product');
    },
  });

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setView('detail');
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      const id = productToDelete._id || productToDelete.id;
      if (id) {
        deleteMutation.mutate(id);
      }
    }
  };

  const handleAddNew = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewProductImages(files);
      setSelectedProduct(null);
      setView('create');
    }
    // Reset input
    e.target.value = '';
  };

  const handleSaveProduct = async (data: ProductFormData & { images?: File[] }) => {
    console.log('🔴 Saving product:', data);
    if (selectedProduct) {
      const productId = selectedProduct._id || (selectedProduct as any).id;
      console.log('📝 Updating existing product:', productId, 'with data:', data);
      try {
        const result = await updateMutation.mutateAsync({ id: productId, data });
        console.log('✅ Update successful:', result);
      } catch (error) {
        console.error('❌ Update failed:', error);
      }
    } else {
      if (!data.images?.length && newProductImages.length > 0) {
        data.images = newProductImages;
      }
      await createMutation.mutateAsync(data as ProductFormData);
    }
  };

  const handleBack = () => {
    setView('grid');
    setSelectedProduct(null);
    setNewProductImages([]);
  };

  return (
    <div className="animate-fade-in">
      {view === 'grid' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Product Management</h2>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setView('bulk-edit')}>
                <Edit2 className="w-4 h-4 mr-2" />
                Bulk Price Editor
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </div>
          </div>

          {/* PDF Catalog Manager Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Catalog status card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Active Industrial Catalog</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Customer-facing download file</p>
                  </div>
                </div>

                {isCatalogLoading ? (
                  <div className="py-2 space-y-2">
                    <div className="h-4 bg-slate-100 animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-slate-100 animate-pulse rounded w-1/2" />
                  </div>
                ) : catalog ? (
                  <div className="py-1">
                    <p className="text-xs font-semibold text-slate-800 truncate" title={catalog.name}>{catalog.name}</p>
                    <a
                      href={catalog.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 hover:text-green-700 font-bold inline-flex items-center gap-1 mt-1 hover:underline"
                    >
                      View PDF Catalog <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No custom catalog uploaded. Standard fallback is active.</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Status: Active</span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </div>

            {/* PDF file upload card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Upload PDF Catalog</h3>
                <p className="text-[10px] text-slate-500 font-medium mb-3">Replace catalog with a newly uploaded PDF document.</p>
              </div>

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-green-500 rounded-xl p-3 cursor-pointer transition-colors group">
                <div className="flex flex-col items-center justify-center text-center">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-green-500 mb-1 transition-colors" />
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-green-600 transition-colors">
                    {isUploadingCatalog ? 'Uploading...' : 'Select catalog PDF'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium mt-0.5">PDF file format (Max 20MB)</span>
                </div>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleCatalogUpload}
                  disabled={isUploadingCatalog || isCatalogLoading}
                />
              </label>
            </div>

            {/* External URL configuration card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Set External Catalog Link</h3>
                <p className="text-[10px] text-slate-500 font-medium mb-3">Link to a PDF hosted on Google Drive, Cloudinary or other service.</p>
              </div>

              <form onSubmit={handleExternalCatalogSubmit} className="space-y-2">
                <Input
                  placeholder="Catalog Name (e.g. Catalog 2026)"
                  value={externalCatalogName}
                  onChange={(e) => setExternalCatalogName(e.target.value)}
                  className="rounded-lg text-xs h-8"
                  disabled={isUploadingCatalog || isCatalogLoading}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="https://drive.google.com/..."
                    value={externalCatalogUrl}
                    onChange={(e) => setExternalCatalogUrl(e.target.value)}
                    className="rounded-lg text-xs h-8 flex-1"
                    disabled={isUploadingCatalog || isCatalogLoading}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="rounded-lg text-xs bg-slate-900 hover:bg-slate-800 text-white h-8 px-3"
                    disabled={isUploadingCatalog || isCatalogLoading}
                  >
                    Save
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <ProductGrid
            products={products}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
            onDelete={handleDelete}
          />
        </>
      )}

      {view === 'bulk-edit' && (
        <BulkPriceEditor />
      )}

      {(view === 'detail' || view === 'create') && (
        <ProductDetail
          product={selectedProduct || undefined}
          initialImages={newProductImages}
          onSave={handleSaveProduct}
          onBack={handleBack}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
