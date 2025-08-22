import axios from 'axios';
import { EmailData, EmailResponse } from '@/types/email';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const emailAPI = {
  /**
   * Send an email
   */
  sendEmail: async (emailData: EmailData): Promise<EmailResponse> => {
    try {
      const response = await axios.post<EmailResponse>(`${API_BASE_URL}/emails/send`, emailData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  /**
   * Save an email draft
   */
  saveDraft: async (draftData: EmailData): Promise<EmailResponse> => {
    try {
      const response = await axios.post<EmailResponse>(`${API_BASE_URL}/emails/drafts`, draftData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  },

  /**
   * Get email by ID
   */
  getEmail: async (emailId: string): Promise<EmailData> => {
    try {
      const response = await axios.get<EmailData>(`${API_BASE_URL}/emails/${emailId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching email:', error);
      throw error;
    }
  },

  /**
   * Get all emails (sent, received, drafts)
   */
  getEmails: async (folder: 'inbox' | 'sent' | 'drafts' = 'inbox') => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emails`, {
        params: { folder },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${folder} emails:`, error);
      throw error;
    }
  },

  /**
   * Delete an email
   */
  deleteEmail: async (emailId: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/emails/${emailId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Error deleting email:', error);
      throw error;
    }
  },

  /**
   * Forward an email
   */
  forwardEmail: async (emailId: string, forwardData: { to: string[]; message: string }): Promise<EmailResponse> => {
    try {
      const response = await axios.post<EmailResponse>(`${API_BASE_URL}/emails/${emailId}/forward`, forwardData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error forwarding email:', error);
      throw error;
    }
  },

  /**
   * Reply to an email
   */
  replyToEmail: async (
    emailId: string, 
    replyData: { message: string; replyAll?: boolean }
  ): Promise<EmailResponse> => {
    try {
      const response = await axios.post<EmailResponse>(
        `${API_BASE_URL}/emails/${emailId}/reply`,
        replyData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error replying to email:', error);
      throw error;
    }
  },

  /**
   * Upload attachment
   */
  uploadAttachment: async (file: File, onUploadProgress?: (progress: number) => void): Promise<{ url: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const config: any = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      };

      if (onUploadProgress) {
        config.onUploadProgress = (progressEvent: ProgressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onUploadProgress(progress);
          }
        };
      }

      const response = await axios.post<{ url: string }>(
        `${API_BASE_URL}/attachments`,
        formData,
        config
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }
};
