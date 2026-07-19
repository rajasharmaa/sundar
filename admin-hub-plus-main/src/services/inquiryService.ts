import api from './api';
import type { Inquiry, InquiryStatus } from '@/types';

interface InquiryFilters {
  status?: string;
  read?: boolean | string;
  city?: string;
  company?: string;
  product?: string;
  startDate?: string;
  endDate?: string;
  leadQuality?: string;
  page?: number;
  limit?: number;
}

export const inquiryService = {
  // Get all inquiries with filters
  async getAll(filters?: InquiryFilters): Promise<{ data: Inquiry[]; pagination: any }> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await api.get(`/admin/inquiries?${params.toString()}`);
    return response.data;
  },

  // Update inquiry status
  async updateStatus(id: string, status: InquiryStatus): Promise<{ message: string }> {
    const response = await api.put(`/admin/inquiries/${id}/status`, { status });
    return response.data;
  },

  // Send reply
  async sendReply(id: string, data: { subject: string; message: string; status?: InquiryStatus }): Promise<{ success: boolean; message: string; data?: Inquiry }> {
    const response = await api.put(`/admin/inquiries/${id}/reply`, data);
    return response.data;
  },

  // Mark inquiry as read
  async markAsRead(id: string): Promise<{ message: string }> {
    const response = await api.put(`/admin/inquiries/${id}/status`, { 
      read: true 
    });
    return response.data;
  },

  // Delete inquiry
  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/admin/inquiries/${id}`);
    return response.data;
  },

  // Export inquiries to CSV
  async exportCsv(status?: string): Promise<Blob> {
    const response = await api.get(`/admin/inquiries/export`, {
      params: { status: status !== 'all' ? status : undefined },
      responseType: 'blob'
    });
    return response.data;
  },

  // Get mailto link for replying
  getReplyLink(inquiry: Inquiry): string {
    const subject = encodeURIComponent(`Re: ${inquiry.subject}`);
    const body = encodeURIComponent(`Dear ${inquiry.name},\n\nThank you for your inquiry.\n\n---\nOriginal Message:\n${inquiry.message}\n\nBest Regards,\nDamodar Traders`);
    return `mailto:${inquiry.email}?subject=${subject}&body=${body}`;
  },
};
