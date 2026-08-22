import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/productService';
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
