const API_BASE = '/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    const token = localStorage.getItem('supportly_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const config: RequestInit = {
      method,
      headers: this.getHeaders(),
    };
    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }
    const normalizedPath = path.startsWith('/api') 
      ? path 
      : `/api${path.startsWith('/') ? '' : '/'}${path}`;
    const response = await fetch(normalizedPath, config);
    if (response.status === 401) {
      localStorage.removeItem('supportly_token');
      localStorage.removeItem('supportly_user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  get<T>(path: string): Promise<T> { return this.request<T>('GET', path); }
  post<T>(path: string, body?: unknown): Promise<T> { return this.request<T>('POST', path, body); }
  put<T>(path: string, body?: unknown): Promise<T> { return this.request<T>('PUT', path, body); }
  delete<T>(path: string): Promise<T> { return this.request<T>('DELETE', path); }
}

export const api = new ApiClient();
