/**
 * HTTP Client giao tiếp với Laravel MCP API
 */
import { config } from './config.js';
import type { ApiResponse } from './types.js';

export class McpApiClient {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(baseUrl: string = config.apiUrl, token: string = config.apiToken) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.token = token;
  }

  /**
   * Tạo headers chung cho request
   */
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Xử lý gọi API tổng quát
   */
  async request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean | undefined>
  ): Promise<ApiResponse<T>> {
    let url = `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;

    if (queryParams) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      const json = (await response.json()) as ApiResponse<T>;
      return json;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown network error';
      return {
        status: 'error',
        error_code: 'CLIENT_NETWORK_ERROR',
        message: `Lỗi kết nối tới Laravel API (${url}): ${message}`,
      };
    }
  }

  // Tiện ích HTTP cơ bản
  get<T>(endpoint: string, queryParams?: Record<string, string | number | boolean | undefined>) {
    return this.request<T>('GET', endpoint, undefined, queryParams);
  }

  post<T>(endpoint: string, body?: unknown) {
    return this.request<T>('POST', endpoint, body);
  }

  patch<T>(endpoint: string, body?: unknown) {
    return this.request<T>('PATCH', endpoint, body);
  }

  put<T>(endpoint: string, body?: unknown) {
    return this.request<T>('PUT', endpoint, body);
  }
}

// Singleton client dùng chung
export const apiClient = new McpApiClient();
