import api from './api';
import type { Product, ProductFormData } from '@/types';

export const productService = {
  // Get all products
  async getAll(): Promise<Product[]> {
    const response = await api.get<Product[]>('/admin/products');
    return response.data;
  },

  // Get single product by ID
  async getById(id: string): Promise<Product> {
    const response = await api.get<Product>(`/admin/products/${id}`);
    return response.data;
  },

  // Create new product
  async create(data: ProductFormData): Promise<Product> {
    const formData = new FormData();
    
    formData.append('name', data.name);
    formData.append('category', data.category);
    formData.append('description', data.description);
    // Serialize sizeOptions with dual-tier pricing
    formData.append('sizeOptions', JSON.stringify(data.sizeOptions));
    formData.append('discount', String(data.discount || 0));
    formData.append('material', data.material);
    if (data.dimensions) formData.append('dimensions', data.dimensions);
    if (data.capacity) formData.append('capacity', data.capacity);
    if (data.printingType) formData.append('printingType', data.printingType);
    if (data.lamination) formData.append('lamination', data.lamination);
    if (data.themeColor) formData.append('themeColor', data.themeColor);
    
    // Serialize dynamic arrays
    if (data.benefits) formData.append('benefits', JSON.stringify(data.benefits));
    if (data.industries) formData.append('industries', JSON.stringify(data.industries));
    if (data.faqs) formData.append('faqs', JSON.stringify(data.faqs));
    if (data.customizationTypes) formData.append('customizationTypes', JSON.stringify(data.customizationTypes));
    
    // Add dynamic strings
    if (data.manufacturingProcess) formData.append('manufacturingProcess', data.manufacturingProcess);
    if (data.materialComposition) formData.append('materialComposition', data.materialComposition);
    if (data.printingDetails) formData.append('printingDetails', data.printingDetails);

    if (data.specifications && Array.isArray(data.specifications)) {
      const specsObject = data.specifications.reduce((acc, curr) => {
        if (curr.key && curr.value) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);
      formData.append('specifications', JSON.stringify(specsObject));
    }
    if (data.featured !== undefined) {
      formData.append('featured', String(data.featured));
    }
    
    if (data.images && data.images.length > 0) {
      data.images.forEach((img) => {
        formData.append('images', img);
      });
    } else if (data.image) {
      formData.append('images', data.image); // Fallback to handle old code sending 'image'
    }

    const response = await api.post<Product>('/admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update existing product
  async update(id: string, data: Partial<ProductFormData>): Promise<Product> {
    console.log('🔵 productService.update called with:', { id, data });
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.category) formData.append('category', data.category);
    if (data.description !== undefined && data.description !== null && data.description !== '') formData.append('description', data.description);
    if (data.sizeOptions) {
      const sizeOptionsStr = JSON.stringify(data.sizeOptions);
      console.log('📦 Stringified sizeOptions:', sizeOptionsStr);
      formData.append('sizeOptions', sizeOptionsStr);
    }
    if (data.discount !== undefined) formData.append('discount', String(data.discount));
    if (data.material !== undefined && data.material !== null && data.material !== '') formData.append('material', data.material);
    if (data.dimensions !== undefined && data.dimensions !== null && data.dimensions !== '') formData.append('dimensions', data.dimensions);
    if (data.capacity !== undefined && data.capacity !== null && data.capacity !== '') formData.append('capacity', data.capacity);
    if (data.printingType !== undefined && data.printingType !== null && data.printingType !== '') formData.append('printingType', data.printingType);
    if (data.lamination !== undefined && data.lamination !== null && data.lamination !== '') formData.append('lamination', data.lamination);
    if (data.themeColor !== undefined && data.themeColor !== null && data.themeColor !== '') formData.append('themeColor', data.themeColor);
    
    // Serialize dynamic arrays for updates
    if (data.benefits !== undefined) formData.append('benefits', JSON.stringify(data.benefits));
    if (data.industries !== undefined) formData.append('industries', JSON.stringify(data.industries));
    if (data.faqs !== undefined) formData.append('faqs', JSON.stringify(data.faqs));
    if (data.customizationTypes !== undefined) formData.append('customizationTypes', JSON.stringify(data.customizationTypes));
    
    // Add dynamic strings for updates
    if (data.manufacturingProcess !== undefined && data.manufacturingProcess !== null && data.manufacturingProcess !== '') formData.append('manufacturingProcess', data.manufacturingProcess);
    if (data.materialComposition !== undefined && data.materialComposition !== null && data.materialComposition !== '') formData.append('materialComposition', data.materialComposition);
    if (data.printingDetails !== undefined && data.printingDetails !== null && data.printingDetails !== '') formData.append('printingDetails', data.printingDetails);

    if (data.specifications !== undefined && Array.isArray(data.specifications)) {
      const specsObject = data.specifications.reduce((acc, curr) => {
        if (curr.key && curr.value) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);
      formData.append('specifications', JSON.stringify(specsObject));
    }
    if (data.featured !== undefined) {
      formData.append('featured', String(data.featured));
    }
    
    if ((data as any).retainedImages) {
      formData.append('retainedImages', JSON.stringify((data as any).retainedImages));
    }
    
    if (data.images && data.images.length > 0) {
      data.images.forEach((img) => {
        formData.append('images', img);
      });
    } else if (data.image) {
      formData.append('images', data.image);
    }

    console.log('📤 Sending FormData to backend...');
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    const response = await api.put<Product>(`/admin/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('✅ Update response:', response.data);
    
    // 🔥 CRITICAL: Invalidate product cache and trigger refresh in other tabs/pages
    localStorage.setItem(`product_update_${id}`, Date.now().toString());
    window.dispatchEvent(new CustomEvent('product-refresh', {
      detail: { productId: id }
    }));
    
    return response.data;
  },

  // Delete product
  async delete(id: string): Promise<{ message: string; deletedCount: number }> {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  // Bulk price update
  async bulkPriceUpdate(updates: Array<{ productId: string; sizeIndex: number; priceType: '100' | '50'; newPrice: number }>) {
    const response = await api.post('/admin/products/bulk-price-update', { updates });
    
    // 🔥 CRITICAL: Invalidate cache for all updated products
    const uniqueProductIds = [...new Set(updates.map(u => u.productId))];
    uniqueProductIds.forEach(productId => {
      localStorage.setItem(`product_update_${productId}`, Date.now().toString());
      window.dispatchEvent(new CustomEvent('product-refresh', {
        detail: { productId }
      }));
    });
    
    return response.data;
  },
};
