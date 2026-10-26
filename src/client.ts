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
    queryParams?: Record<string, string | number | boolean | readonly string[] | undefined>
  ): Promise<ApiResponse<T>> {
    let url = `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;

    if (queryParams) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            searchParams.append(key, value.join(','));
          } else {
            searchParams.append(key, String(value));
          }
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

      if (response.status === 204) {
        return {
          status: 'success',
          success: true,
          data: undefined as unknown as T,
        };
      }

      const text = await response.text();
      const json = text ? (JSON.parse(text) as ApiResponse<T>) : ({ status: 'success', success: true } as ApiResponse<T>);
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
  get<T>(endpoint: string, queryParams?: Record<string, string | number | boolean | readonly string[] | undefined>) {
    return this.request<T>('GET', endpoint, undefined, queryParams);
  }

  post<T>(
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean | readonly string[] | undefined>
  ) {
    return this.request<T>('POST', endpoint, body, queryParams);
  }

  patch<T>(
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean | readonly string[] | undefined>
  ) {
    return this.request<T>('PATCH', endpoint, body, queryParams);
  }

  put<T>(
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean | readonly string[] | undefined>
  ) {
    return this.request<T>('PUT', endpoint, body, queryParams);
  }

  delete<T>(endpoint: string, queryParams?: Record<string, string | number | boolean | readonly string[] | undefined>) {
    return this.request<T>('DELETE', endpoint, undefined, queryParams);
  }
}

// Singleton client dùng chung
export const apiClient = new McpApiClient();
