import api from './api';

export interface Catalog {
  _id: string;
  name: string;
  url: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const catalogService = {
  // Get active catalog details
  async getActive(): Promise<Catalog> {
    const response = await api.get<Catalog>('/admin/catalog');
    return response.data;
  },

  // Upload catalog PDF file
  async upload(file: File): Promise<Catalog> {
    const formData = new FormData();
    formData.append('catalog', file);

    const response = await api.post<Catalog>('/admin/catalog/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Set catalog URL manually (external link)
  async setUrl(name: string, url: string): Promise<Catalog> {
    const response = await api.post<Catalog>('/admin/catalog/url', { name, url });
    return response.data;
  },
};
