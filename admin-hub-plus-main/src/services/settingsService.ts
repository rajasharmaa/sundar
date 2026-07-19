import api from './api';
import type { SiteSettings } from '@/types';

export interface SettingsResponse {
  success: boolean;
  data: SiteSettings;
  message?: string;
}

export interface SettingsUploadResponse {
  success: boolean;
  url: string;
  publicId: string;
}

export const settingsService = {
  // Get active site configurations
  async get(): Promise<SettingsResponse> {
    const response = await api.get<SettingsResponse>('/admin/settings');
    return response.data;
  },

  // Update site configurations
  async update(settings: SiteSettings): Promise<SettingsResponse> {
    const response = await api.put<SettingsResponse>('/admin/settings', settings);
    return response.data;
  },

  // Upload an image file for settings
  async upload(formData: FormData): Promise<SettingsUploadResponse> {
    const response = await api.post<SettingsUploadResponse>('/admin/settings/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
