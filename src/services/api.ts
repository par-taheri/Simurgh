import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import {
  RootSchemaPayload,
  ListResponse,
  SingleResponse,
  ErrorPayload,
  UserSession
} from '../types/schema';

// Reads dynamic runtime configuration injected via window.APP_CONFIG
export interface AppConfig {
  baseURL?: string;
  schema?: RootSchemaPayload;
}

declare global {
  interface Window {
    APP_CONFIG?: AppConfig;
  }
}

export function getAppConfig(): AppConfig {
  const config = window.APP_CONFIG || {};
  return {
    baseURL: config.baseURL ?? '',
    schema: config.schema
  };
}

// Dynamic system endpoint resolver reading directly from schema system.endpoints with clean fallbacks
export function getSystemEndpoint(key: 'upload'): string {
  if (typeof document !== 'undefined') {
    const scriptEl = document.getElementById('simurgh-schema');
    if (scriptEl && scriptEl.textContent) {
      try {
        const schema = JSON.parse(scriptEl.textContent.trim());
        const endpoint = schema?.system?.endpoints?.[key];
        if (endpoint && typeof endpoint === 'string' && endpoint.trim()) {
          return endpoint.trim();
        }
      } catch {
        // Fall through to default relative path
      }
    }
  }

  const defaults: Record<string, string> = {
    upload: '/api/admin/uploads'
  };
  return defaults[key] || `/api/admin/${key}`;
}

// State for error simulation header in testing bar
let simulatedErrorHeader: string | null = null;

export function setSimulatedError(errorCode: string | null) {
  simulatedErrorHeader = errorCode;
}

export function getSimulatedError(): string | null {
  return simulatedErrorHeader;
}

// Configured Axios HTTP client instance
const apiClient: AxiosInstance = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Refresh token queue handling
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor: attaches Bearer token, simulation headers, and base URL
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { baseURL, schema } = getAppConfig();
    if (baseURL) {
      config.baseURL = baseURL;
    }

    if (schema?.system?.auth?.strategy === 'jwt') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    if (simulatedErrorHeader && config.headers) {
      config.headers['X-Simulate-Error'] = simulatedErrorHeader;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor: handles 401 and formats errors
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    return Promise.reject(formatAxiosError(error));
  }
);

// Helper function to format Axios response errors into standardized ErrorPayload structure
function formatAxiosError(error: any): Error & { status: number; payload: ErrorPayload; data?: any } {
  const status = error.response?.status || 500;
  const responseData = error.response?.data;

  const errorPayload: ErrorPayload = responseData?.error || {
    code:
      status === 401 ? 'UNAUTHORIZED' :
      status === 403 ? 'FORBIDDEN' :
      status === 404 ? 'NOT_FOUND' :
      status === 409 ? 'CONCURRENCY_CONFLICT' :
      status === 422 ? 'VALIDATION_ERROR' :
      status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'SERVER_ERROR',
    message: responseData?.error?.message || error.message || `HTTP Request failed with status ${status}`,
    fields: responseData?.error?.fields
  };

  const err = new Error(errorPayload.message) as Error & { status: number; payload: ErrorPayload; data?: any };
  err.status = status;
  err.payload = errorPayload;
  err.data = responseData?.data;
  return err;
}

// Admin API Client Service
export const adminApi = {
  login: async (payload: Record<string, any>): Promise<{ success: boolean; user: UserSession; token?: string }> => {
    const { schema } = getAppConfig();
    const loginUrl = schema?.system?.auth?.login_url || '/api/admin/auth/login';
    const res = await apiClient.post(loginUrl, payload);
    return res.data;
  },

  getMe: async (): Promise<{ success: boolean; user: UserSession }> => {
    const { schema } = getAppConfig();
    const meUrl = schema?.system?.auth?.me_url || '/api/admin/auth/me';
    const res = await apiClient.get(meUrl);
    return res.data;
  },

  logout: async (): Promise<{ success: boolean }> => {
    const { schema } = getAppConfig();
    const logoutUrl = schema?.system?.auth?.logout_url || '/api/admin/auth/logout';
    const res = await apiClient.post(logoutUrl);
    return res.data;
  },

  updatePassword: async (payload: { old_password: string; new_password: string }): Promise<{ success: boolean; message?: string }> => {
    const { schema } = getAppConfig();
    const endpoint = '/api/admin/auth/change-password'; // Fallback endpoint
    const res = await apiClient.put(endpoint, payload);
    return res.data;
  },

  getSchema: async (): Promise<RootSchemaPayload> => {
    const scriptEl = document.getElementById('simurgh-schema');
    if (!scriptEl) {
      throw new Error('فایل اسکیما یافت نشد! تگ <script id="simurgh-schema" type="application/json"> در فایل HTML وجود ندارد.');
    }

    const content = scriptEl.textContent ? scriptEl.textContent.trim() : '';
    if (!content) {
      throw new Error('تگ اسکیما (#simurgh-schema) در فایل HTML خالی است.');
    }

    try {
      const data = JSON.parse(content);
      if (!data || typeof data !== 'object') {
        throw new Error('ساختار اسکیما معتبر نیست.');
      }
      return data;
    } catch (err: any) {
      throw new Error(`اسکیما دارای فرمت JSON نامعتبر یا نادرست می‌باشد: ${err?.message || err}`);
    }
  },

  getList: async (
    apiPath: string,
    params: { page?: number; per_page?: number; search?: string; sort?: string; filter?: Record<string, any> } = {}
  ): Promise<ListResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.per_page) query.set('per_page', String(params.per_page));
    if (params.search) query.set('search', params.search);
    if (params.sort) query.set('sort', params.sort);

    if (params.filter) {
      for (const [key, value] of Object.entries(params.filter)) {
        if (value !== undefined && value !== null && value !== '') {
          query.set(`filter[${key}]`, String(value));
        }
      }
    }

    const url = `${apiPath}?${query.toString()}`;
    const res = await apiClient.get<ListResponse>(url);
    return res.data;
  },

  getSingle: async (apiPath: string, id: string | number): Promise<SingleResponse> => {
    const res = await apiClient.get<SingleResponse>(`${apiPath}/${id}`);
    return res.data;
  },

  createRecord: async (apiPath: string, payload: Record<string, any>): Promise<SingleResponse> => {
    const res = await apiClient.post<SingleResponse>(apiPath, payload);
    return res.data;
  },

  updateRecord: async (
    apiPath: string,
    id: string | number,
    payload: Record<string, any>,
    concurrencyToken?: string
  ): Promise<SingleResponse> => {
    const headers: Record<string, string> = {};
    if (concurrencyToken) {
      headers['If-Match'] = concurrencyToken;
    }

    const res = await apiClient.put<SingleResponse>(`${apiPath}/${id}`, payload, { headers });
    return res.data;
  },

  deleteRecord: async (apiPath: string, id: string | number): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete(`${apiPath}/${id}`);
    return res.data;
  },

  uploadFile: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post(getSystemEndpoint('upload'), formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }
};
