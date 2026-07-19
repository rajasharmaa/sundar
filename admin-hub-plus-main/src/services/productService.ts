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
    formData.append('pressureRating', data.pressureRating);
    formData.append('temperatureRange', data.temperatureRange);
    formData.append('standards', data.standards);
    formData.append('application', data.application);
    if (data.specifications) {
      formData.append('specifications', JSON.stringify(data.specifications));
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
    if (data.pressureRating !== undefined && data.pressureRating !== null && data.pressureRating !== '') formData.append('pressureRating', data.pressureRating);
    if (data.temperatureRange !== undefined && data.temperatureRange !== null && data.temperatureRange !== '') formData.append('temperatureRange', data.temperatureRange);
    if (data.standards !== undefined && data.standards !== null && data.standards !== '') formData.append('standards', data.standards);
    if (data.application !== undefined && data.application !== null && data.application !== '') formData.append('application', data.application);
    if (data.specifications !== undefined) {
      formData.append('specifications', JSON.stringify(data.specifications));
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
