import axios from 'axios';
import { EmailTemplate, TemplateCategory, TemplateFilterOptions, TemplateUsageStats } from '@/types/template';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const templateAPI = {
  // Get all templates with optional filtering
  getTemplates: async (filters?: TemplateFilterOptions): Promise<EmailTemplate[]> => {
    try {
      const response = await axios.get<EmailTemplate[]>(`${API_BASE_URL}/templates`, {
        params: filters,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  // Get a single template by ID
  getTemplate: async (id: string): Promise<EmailTemplate> => {
    try {
      const response = await axios.get<EmailTemplate>(`${API_BASE_URL}/templates/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching template ${id}:`, error);
      throw error;
    }
  },

  // Create a new template
  createTemplate: async (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<EmailTemplate> => {
    try {
      const response = await axios.post<EmailTemplate>(`${API_BASE_URL}/templates`, template, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  // Update an existing template
  updateTemplate: async (id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    try {
      const response = await axios.patch<EmailTemplate>(
        `${API_BASE_URL}/templates/${id}`, 
        updates,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating template ${id}:`, error);
      throw error;
    }
  },

  // Delete a template
  deleteTemplate: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/templates/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error(`Error deleting template ${id}:`, error);
      throw error;
    }
  },

  // Get template categories
  getCategories: async (): Promise<TemplateCategory[]> => {
    try {
      const response = await axios.get<TemplateCategory[]>(`${API_BASE_URL}/templates/categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching template categories:', error);
      throw error;
    }
  },

  // Get template usage statistics
  getTemplateStats: async (templateId: string): Promise<TemplateUsageStats> => {
    try {
      const response = await axios.get<TemplateUsageStats>(`${API_BASE_URL}/templates/usage/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching stats for template ${templateId}:`, error);
      throw error;
    }
  },

  // Duplicate a template
  duplicateTemplate: async (templateId: string, newName: string): Promise<EmailTemplate> => {
    try {
      const response = await axios.post<EmailTemplate>(
        `${API_BASE_URL}/templates/${templateId}/duplicate`,
        { name: newName },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error duplicating template ${templateId}:`, error);
      throw error;
    }
  },

  // Export template as JSON
  exportTemplate: async (templateId: string): Promise<Blob> => {
    try {
      const response = await axios.get<Blob>(`${API_BASE_URL}/templates/${templateId}/preview`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/pdf'
        },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Error exporting template ${templateId}:`, error);
      throw error;
    }
  },

  // Import template from JSON
  importTemplate: async (file: File): Promise<EmailTemplate> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post<EmailTemplate>(`${API_BASE_URL}/templates/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error importing template:', error);
      throw error;
    }
  }
};
