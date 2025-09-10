import { config } from './config';

// Business-related types
export interface BusinessCreate {
  name: string;
  slug?: string;
  industry?: string;
  description?: string;
  tone?: string;
  timezone?: string;
  business_hours?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

export interface BusinessUpdate {
  name?: string;
  slug?: string;
  industry?: string;
  description?: string;
  tone?: string;
  timezone?: string;
  business_hours?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

export interface BusinessMembershipInfo {
  id: string;
  role: 'owner' | 'admin' | 'member';
  permissions: string[];
  invited_by?: string;
  invited_at?: string;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  slug?: string;
  name: string;
  industry?: string;
  description?: string;
  tone: string;
  namespace: string;
  timezone: string;
  business_hours?: Record<string, unknown>;
  settings: Record<string, unknown>;
  monthly_message_count: number;
  monthly_document_uploads: number;
  storage_used_bytes: number;
  created_at: string;
  updated_at: string;
  user_membership?: BusinessMembershipInfo;
}

export interface BusinessListItem {
  id: string;
  slug?: string;
  name: string;
  industry?: string;
  description?: string;
  namespace: string;
  created_at: string;
  updated_at: string;
  user_role: 'owner' | 'admin' | 'member';
  monthly_message_count: number;
  monthly_document_uploads: number;
}

export interface BusinessResponse {
  success: boolean;
  message: string;
  business?: Business;
}

export interface BusinessListResponse {
  success: boolean;
  message: string;
  businesses: BusinessListItem[];
  total: number;
}

export class BusinessAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = config.API_URL;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // prefer a typed fallback object instead of `any`
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' as string }));
      throw new Error((errorData as { detail?: string }).detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Create a new business
   */
  async createBusiness(businessData: BusinessCreate): Promise<BusinessResponse> {
    const response = await fetch(`${this.baseURL}/businesses/`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(businessData),
    });

    return this.handleResponse<BusinessResponse>(response);
  }

  /**
   * Get list of user's businesses
   */
  async getUserBusinesses(): Promise<BusinessListResponse> {
    const response = await fetch(`${this.baseURL}/businesses/`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    return this.handleResponse<BusinessListResponse>(response);
  }

  /**
   * Get details of a specific business
   */
  async getBusiness(businessId: string): Promise<BusinessResponse> {
    const response = await fetch(`${this.baseURL}/businesses/${businessId}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    return this.handleResponse<BusinessResponse>(response);
  }

  /**
   * Update business details
   */
  async updateBusiness(businessId: string, businessData: BusinessUpdate): Promise<BusinessResponse> {
    const response = await fetch(`${this.baseURL}/businesses/${businessId}`, {
      method: 'PATCH',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(businessData),
    });

    return this.handleResponse<BusinessResponse>(response);
  }

  /**
   * Delete a business (soft delete)
   */
  async deleteBusiness(businessId: string): Promise<BusinessResponse> {
    const response = await fetch(`${this.baseURL}/businesses/${businessId}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
    });

    return this.handleResponse<BusinessResponse>(response);
  }

  /**
   * Check if user has any registered businesses (optimized endpoint)
   */
  async hasRegisteredBusiness(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/businesses/status`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      const data = await this.handleResponse<{
        success: boolean;
        has_business: boolean;
        business_count: number;
        message: string;
      }>(response);

      return data.has_business;
    } catch (error) {
      console.error('Error checking business registration status:', error);
      return false;
    }
  }

  /**
   * Get the user's primary business (first business they own or are admin of)
   */
  async getPrimaryBusiness(): Promise<Business | null> {
    try {
      const response = await this.getUserBusinesses();

      // Find the first business where user is owner or admin
      const primaryBusiness = response.businesses.find(
          business => business.user_role === 'owner' || business.user_role === 'admin'
      ) || response.businesses[0]; // Fallback to first business if no owner/admin role found

      if (!primaryBusiness) {
        return null;
      }

      // Get full business details
      const businessResponse = await this.getBusiness(primaryBusiness.id);
      return businessResponse.business || null;
    } catch (error) {
      console.error('Error getting primary business:', error);
      return null;
    }
  }
}

// Export singleton instance
export const businessAPI = new BusinessAPI();
