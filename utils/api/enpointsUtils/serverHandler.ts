import axios from 'axios';

class EnhancedServerHandler {
  private axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4500',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private controllers = new Map<string, AbortController>();

  constructor() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.axiosInstance.interceptors.request.use((config) => {
        const token = localStorage.getItem('serviceToken') || localStorage.getItem('adminToken');
        if (token) {
          if (!config.headers) config.headers = {};
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
          delete (config.headers as Record<string, unknown>)['Content-Type'];
        }
        return config;
      });
    }
  }

  async post<T = any>(url: string, data?: any, config?: any & { abortKey?: string }): Promise<any> {
    const { abortKey, ...axiosConfig } = config || {};
    
    if (abortKey) {
      if (this.controllers.has(abortKey)) {
        this.controllers.get(abortKey)?.abort();
      }
      
      const controller = new AbortController();
      this.controllers.set(abortKey, controller);
      
      try {
        const response = await this.axiosInstance.post<T>(url, data, {
          ...axiosConfig,
          signal: controller.signal
        });
        return response;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw new Error('Request cancelled');
        }
        throw error;
      } finally {
        this.controllers.delete(abortKey);
      }
    }
    
    return this.axiosInstance.post<T>(url, data, axiosConfig);
  }

  async get<T = any>(url: string, config?: any & { abortKey?: string }): Promise<any> {
    const { abortKey, ...axiosConfig } = config || {};
    
    if (abortKey) {
      if (this.controllers.has(abortKey)) {
        this.controllers.get(abortKey)?.abort();
      }
      
      const controller = new AbortController();
      this.controllers.set(abortKey, controller);
      
      try {
        const response = await this.axiosInstance.get<T>(url, {
          ...axiosConfig,
          signal: controller.signal
        });
        return response;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw new Error('Request cancelled');
        }
        throw error;
      } finally {
        this.controllers.delete(abortKey);
      }
    }
    
    return this.axiosInstance.get<T>(url, axiosConfig);
  }

  async put<T = any>(url: string, data?: any, config?: any & { abortKey?: string }): Promise<any> {
    const { abortKey, ...axiosConfig } = config || {};
    
    if (abortKey) {
      if (this.controllers.has(abortKey)) {
        this.controllers.get(abortKey)?.abort();
      }
      
      const controller = new AbortController();
      this.controllers.set(abortKey, controller);
      
      try {
        const response = await this.axiosInstance.put<T>(url, data, {
          ...axiosConfig,
          signal: controller.signal
        });
        return response;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw new Error('Request cancelled');
        }
        throw error;
      } finally {
        this.controllers.delete(abortKey);
      }
    }
    
    return this.axiosInstance.put<T>(url, data, axiosConfig);
  }

  async delete<T = any>(url: string, config?: any & { abortKey?: string }): Promise<any> {
    const { abortKey, ...axiosConfig } = config || {};
    
    if (abortKey) {
      if (this.controllers.has(abortKey)) {
        this.controllers.get(abortKey)?.abort();
      }
      
      const controller = new AbortController();
      this.controllers.set(abortKey, controller);
      
      try {
        const response = await this.axiosInstance.delete<T>(url, {
          ...axiosConfig,
          signal: controller.signal
        });
        return response;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw new Error('Request cancelled');
        }
        throw error;
      } finally {
        this.controllers.delete(abortKey);
      }
    }
    
    return this.axiosInstance.delete<T>(url, axiosConfig);
  }

  abort(abortKey: string) {
    const controller = this.controllers.get(abortKey);
    if (controller) {
      controller.abort();
      this.controllers.delete(abortKey);
    }
  }

  abortAll() {
    this.controllers.forEach(controller => controller.abort());
    this.controllers.clear();
  }

  isActive(abortKey: string): boolean {
    return this.controllers.has(abortKey);
  }

  get axios() {
    return this.axiosInstance;
  }
}

const serverHandler = new EnhancedServerHandler();

export default serverHandler; 