import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * API Client Service
 * Handles all API communication
 */
class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Submit query to RAG system
   */
  async chat(query: string, options: any = {}) {
    try {
      const response = await this.client.post('/chat', {
        query,
        ...options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to chat');
    }
  }

  /**
   * Perform advanced search
   */
  async advancedSearch(query: string, filters: any = {}, options: any = {}) {
    try {
      const response = await this.client.post('/chat/search', {
        query,
        filters,
        ...options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Search failed');
    }
  }

  /**
   * Upload documents
   */
  async uploadDocuments(files: File[], userId?: string) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('file', file);
    });

    if (userId) {
      formData.append('userId', userId);
    }

    try {
      const response = await this.client.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Upload failed');
    }
  }

  /**
   * Get upload stats
   */
  async getUploadStats() {
    try {
      const response = await this.client.get('/upload/stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get stats');
    }
  }

  /**
   * Get documents
   */
  async getDocuments(page = 1, limit = 10) {
    try {
      const response = await this.client.get('/documents', {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get documents');
    }
  }

  /**
   * Get document by ID
   */
  async getDocument(id: string) {
    try {
      const response = await this.client.get(`/documents/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get document');
    }
  }

  /**
   * Get documents by source
   */
  async getDocumentsBySource(source: string, page = 1, limit = 10) {
    try {
      const response = await this.client.get(`/documents/source/${source}`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get documents');
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(id: string) {
    try {
      const response = await this.client.delete(`/documents/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete document');
    }
  }

  /**
   * Delete documents by source
   */
  async deleteDocumentsBySource(source: string) {
    try {
      const response = await this.client.delete(`/documents/source/${source}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete documents');
    }
  }

  /**
   * Get analytics
   */
  async getAnalytics(days = 7) {
    try {
      const response = await this.client.get('/chat/analytics', {
        params: { days },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get analytics');
    }
  }
}

const apiClient = new APIClient();
export default apiClient;
