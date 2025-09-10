import config from './config';

// API configuration and base URL
const API_BASE_URL = config.api.baseUrl;

// API response types
export interface UploadResponse {
  success: boolean;
  message: string;
  task_id: string;
  document_id: string;
  ingestion_task_id?: string;
  business_id: string;
  business_name: string;
  namespace: string;
  filename: string;
  detected_type: string;
  file_size: number;
  checksum: string;
  queue_position: number;
  status: string;
  r2_storage?: {
    uploaded: boolean;
    s3_key?: string;
    bucket?: string;
    file_hash?: string;
    upload_timestamp?: string;
    message?: string;
  };
}

export interface DocumentInfo {
  id: string;
  business_id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  size_bytes: number;
  mime_type: string;
  processing_status: string;
  num_chunks?: number;
  uploaded_by?: string;
  processing_started_at?: string;
  processing_completed_at?: string;
  processing_error?: string;
  meta: Record<string, unknown>;
  tags: string[];
  version: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentListResponse {
  success: boolean;
  message: string;
  documents: DocumentInfo[];
  total: number;
  business_id: string;
  business_name: string;
}

export interface DocumentSearchResponse {
  query: string;
  results: unknown[];
  total_results: number;
  business_id: string;
  business_name: string;
}

export interface TaskStatusResponse {
  task_id: string;
  status: string;
  updated_at: string;
  message?: string;
  result?: unknown;
  completed_at?: string;
}

export interface QueueInfoResponse {
  queue_size: number;
  message: string;
}
// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Upload progress callback type
export type UploadProgressCallback = (progress: number) => void;

class DocumentAPI {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.timeout = config.api.timeout;
  }

  /**
   * Upload a document to the server
   */
  async uploadDocument(
      file: File,
      businessId: string,
      onProgress?: UploadProgressCallback
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // Add business_id as query parameter
    const url = new URL(`${this.baseUrl}/documents/upload`);
    url.searchParams.append('business_id', businessId);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            // parameter intentionally omitted to avoid unused-var lint
            reject(new Error('Invalid JSON response'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.detail || `HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'));
      });

      xhr.open('POST', url.toString());
      xhr.timeout = this.timeout;

      // Add authentication header AFTER opening the request
      const token = getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  }

  /**
   * Get the status of a document processing task with retry logic
   */
  async getTaskStatus(taskId: string, retryCount: number = 0): Promise<TaskStatusResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for status checks

      const response = await fetch(`${this.baseUrl}/documents/status/${taskId}`, {
        signal: controller.signal,
        headers: getAuthHeaders()
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      // Retry logic for network errors
      if (retryCount < 3 && (error instanceof Error && (error.name === 'AbortError' || error.message.includes('fetch')))) {
        console.log(`Retrying task status check (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return this.getTaskStatus(taskId, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * List documents for a specific business
   */
  async listDocuments(
      businessId: string,
      limit: number = 50,
      offset: number = 0
  ): Promise<DocumentListResponse> {
    const url = new URL(`${this.baseUrl}/documents`);
    url.searchParams.append('business_id', businessId);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('offset', offset.toString());

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Search documents within a specific business
   */
  async searchDocuments(
      query: string,
      businessId: string,
      topK: number = 5
  ): Promise<DocumentSearchResponse> {
    const url = new URL(`${this.baseUrl}/documents/search`);
    url.searchParams.append('query', query);
    url.searchParams.append('business_id', businessId);
    url.searchParams.append('top_k', topK.toString());

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get queue information
   */
  async getQueueInfo(): Promise<QueueInfoResponse> {
    const response = await fetch(`${this.baseUrl}/documents/queue/info`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Cancel a queued task
   */
  async cancelTask(taskId: string): Promise<{ task_id: string; message: string }> {
    const response = await fetch(`${this.baseUrl}/documents/task/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get download URL for a document
   */
  async getDownloadUrl(documentId: string, expiration: number = 3600): Promise<{
    document_id: string;
    filename: string;
    download_url: string;
    expires_in: number;
    file_size: number;
    content_type: string;
  }> {
    const url = new URL(`${this.baseUrl}/documents/${documentId}/download`);
    url.searchParams.append('expiration', expiration.toString());

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Check if the API server is reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('API health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const documentAPI = new DocumentAPI();

// Export class for custom instances
export { DocumentAPI };

// Utility function to check API connectivity
export const checkAPIConnection = async (): Promise<boolean> => {
  return documentAPI.healthCheck();
};
