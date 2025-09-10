import { config } from './config';

// Chat-related types matching backend schemas
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  confidence_score?: number;
  model_used?: string;
}

export interface ChatRequest {
  message: string;
  business_namespace: string;
  conversation_id?: string;
  session_id?: string;
  customer_id?: string;
  customer_email?: string;
  customer_name?: string;
  channel?: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  conversation_id: string;
  message_id?: string;
  confidence_score?: number;
  context_used?: number;
  model_used?: string;
  processing_time_ms?: number;
}

export interface ConversationCreateRequest {
  business_namespace: string;
  session_id?: string;
  customer_id?: string;
  customer_email?: string;
  customer_name?: string;
  channel?: string;
  initial_query?: string;
}

export interface ConversationResponse {
  success: boolean;
  conversation_id: string;
  status: string;
  created_at?: string;
}

export interface BotConfig {
  bot_name: string;
  avatar_url?: string;
  description?: string;
  personality?: string;
  languages?: string[];
  channels?: string[];
  greeting_message?: string;
  fallback_message?: string;
  offline_message?: string;
  temperature?: number;
  max_tokens?: number;
  model_name?: string;
  response_delay_ms?: number;
  content_filter_enabled?: boolean;
  version?: string;
  is_active?: boolean;
}

export interface BotConfigResponse {
  success: boolean;
  config: BotConfig;
}

export class ChatAPI {
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
      const errorData = await response
          .json()
          .catch(() => ({ detail: 'Unknown error' as string }));
      throw new Error((errorData as { detail?: string }).detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Send a chat message and get AI response
   */
  async sendMessage(chatRequest: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseURL}/api/v1/chatbot/chat`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(chatRequest),
    });

    return this.handleResponse<ChatResponse>(response);
  }

  /**
   * Create a new conversation
   */
  async createConversation(request: ConversationCreateRequest): Promise<ConversationResponse> {
    const response = await fetch(`${this.baseURL}/api/v1/chatbot/conversations`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ConversationResponse>(response);
  }

  /**
   * Get bot configuration for a business
   */
  async getBotConfig(businessNamespace: string): Promise<BotConfigResponse> {
    const response = await fetch(`${this.baseURL}/api/v1/chatbot/config/${businessNamespace}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    return this.handleResponse<BotConfigResponse>(response);
  }

  /**
   * Get conversation context
   *
   * Returns a generic object representing the conversation context.
   */
  async getConversationContext(conversationId: string): Promise<Record<string, unknown>> {
    const response = await fetch(`${this.baseURL}/api/v1/chatbot/conversations/${conversationId}/context`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    // Use the generic handler but cast to a record of unknowns
    return this.handleResponse<Record<string, unknown>>(response);
  }

  /**
   * Resolve a conversation
   */
  async resolveConversation(conversationId: string, resolutionReason?: string, rating?: number, feedback?: string): Promise<ConversationResponse> {
    const response = await fetch(`${this.baseURL}/api/v1/chatbot/conversations/resolve`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({
        conversation_id: conversationId,
        resolution_reason: resolutionReason,
        customer_satisfaction_rating: rating,
        customer_feedback: feedback,
      }),
    });

    return this.handleResponse<ConversationResponse>(response);
  }

  /**
   * Search for context in business knowledge base
   *
   * Returns an object with `results` array and optional `total`.
   */
  async searchContext(businessNamespace: string, query: string, topK: number = 5): Promise<{ results: unknown[]; total?: number }> {
    const response = await fetch(`${this.baseURL}/api/v1/chatbot/search-context`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({
        business_namespace: businessNamespace,
        query,
        top_k: topK,
      }),
    });

    return this.handleResponse<{ results: unknown[]; total?: number }>(response);
  }

  /**
   * Check chatbot service health
   *
   * Returns a boolean indicating health (true = healthy).
   */
  async healthCheck(): Promise<boolean> {
    const response = await fetch(`${this.baseURL}/api/v1/chatbot/health`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    // Some health endpoints return a JSON { healthy: true } or { status: 'ok' }
    // We'll attempt to parse and fall back to response.ok
    try {
      const data = await this.handleResponse<Record<string, unknown>>(response);
      if (typeof data.healthy === 'boolean') return data.healthy;
      if (typeof data.status === 'string') return data.status === 'ok' || data.status === 'healthy';
      return response.ok;
    } catch {
      // If parsing fails, fallback to response.ok
      return response.ok;
    }
  }

  /**
   * Get business statistics
   */
  async getBusinessStats(businessNamespace: string): Promise<Record<string, unknown>> {
    const response = await fetch(`${this.baseURL}/api/v1/chatbot/stats/${businessNamespace}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    return this.handleResponse<Record<string, unknown>>(response);
  }

  /**
   * Generate a session ID for tracking conversations
   */
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a customer ID for tracking users
   */
  generateCustomerId(): string {
    return `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const chatAPI = new ChatAPI();
